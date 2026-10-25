import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";

function compile(source, imports = {}) {
  const module = { exports: {} };
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } });
  new Function("require", "module", "exports", outputText)(name => {
    assert.ok(name in imports, `Unexpected import ${name}`);
    return imports[name];
  }, module, module.exports);
  return module.exports;
}

const { createEsp32Parser } = compile(await readFile(new URL("../../frontend/src/features/dashboard/lib/esp32-serial.ts", import.meta.url), "utf8"));
const parse = createEsp32Parser();
for (const line of ["EcoPrawn IoT Gateway Initializing...", "DS18B20 Sensors Found: 0", "-----------------------------------"]) assert.equal(parse(line), null);
parse("--- EcoPrawn Telemetry ---");
parse("Temperature: ERROR - Sensor disconnected!");
parse("Water Level Distance: 15.42 cm");
assert.deepEqual(parse("-----------------------------------"), { temperature: null, distanceCm: 15.42 });
parse("--- EcoPrawn Telemetry ---");
parse("Water Temperature: 28.25 °C");
parse("Water Level: ERROR - Echo timeout!");
assert.deepEqual(parse("-----------------------------------"), { temperature: 28.25, distanceCm: null });
parse("--- EcoPrawn Telemetry ---");
parse("Temperature: ERROR - Sensor disconnected!");
parse("Water Level: ERROR - Echo timeout!");
assert.deepEqual(parse("-----------------------------------"), { temperature: null, distanceCm: null });
assert.deepEqual(parse('{"temperature":27.5,"distanceCm":12.2}'), { temperature: 27.5, distanceCm: 12.2 });
assert.deepEqual(parse('{"temperature":-127,"distanceCm":0}'), { temperature: null, distanceCm: null });
assert.equal(parse('{"somethingElse":1}'), null);
assert.equal(parse('{bad json'), null);
// A truncated previous frame must not leak values into a new frame.
parse("Water Temperature: 28.00 °C");
parse("--- EcoPrawn Telemetry ---");
parse("Water Level Distance: 16.00 cm");
assert.deepEqual(parse("-----------------------------------"), { temperature: null, distanceCm: 16 });

let identity = { id: "owner-a" };
let writes = 0;
const readings = [];
const route = compile(await readFile(new URL("../src/app/api/hardware/route.ts", import.meta.url), "utf8"), {
  "@/lib/auth": { accountAccess: async () => identity ?? Response.json({}, { status: 401 }) },
  "@/lib/prisma": { __esModule: true, default: {
    tank: { findUnique: async ({ where }) => where.id === "tank-a" && where.userId === "owner-a" ? { id: "tank-a" } : null },
    hardwareTelemetry: {
      create: async ({ data }) => { writes++; const row = { id: `reading-${writes}`, ...data }; readings.push(row); return row; },
      findMany: async ({ where, take, orderBy }) => {
        assert.equal(take, 20);
        assert.deepEqual(orderBy, { recordedAt: "desc" });
        return where.tank.userId === "owner-a" ? readings.filter(row => row.tankId === where.tankId) : [];
      },
    },
  } },
});
const request = body => new Request("http://localhost/api/hardware", {
  method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
});
const post = body => route.POST(request({ tankId: "tank-a", ...body }));
assert.equal((await post({ temperature: null, distanceCm: 15.42 })).status, 201);
assert.deepEqual(readings[0], { id: "reading-1", tankId: "tank-a", temperature: null, distanceCm: 15.42, waterLevel: null });
assert.equal((await post({ temperature: 28, distanceCm: null })).status, 201);
for (const body of [null, [], {}, { temperature: -127 }, { temperature: "28" }, { distanceCm: 0 }, { temperature: null, distanceCm: null }, { distanceCm: 401 }, { temperature: 28, emptyDistanceCm: 50 }, { distanceCm: 15, emptyDistanceCm: 10, fullDistanceCm: 50 }, { temperature: {}, distanceCm: 10 }]) {
  const response = await route.POST(request(body && !Array.isArray(body) ? { tankId: "tank-a", ...body } : body));
  assert.equal(response.status, 400, JSON.stringify(body));
}
assert.equal((await post({ temperature: 28, tankId: "tank-b", userId: "owner-a" })).status, 404);
assert.equal(writes, 2, "Rejected readings must not reach storage");
for (const [distanceCm, expected] of [[30, 50], [60, 0], [2, 100]]) {
  const result = await (await post({ distanceCm, emptyDistanceCm: 50, fullDistanceCm: 10, waterLevel: 999 })).json();
  assert.equal(result.reading.waterLevel, expected);
}
identity = { id: "owner-b" };
assert.equal((await post({ temperature: 28 })).status, 404);
assert.deepEqual((await (await route.GET(new Request("http://localhost/api/hardware?tankId=tank-a"))).json()).readings, []);
identity = null;
assert.equal((await post({ temperature: 28 })).status, 401);
assert.equal((await route.GET(new Request("http://localhost/api/hardware?tankId=tank-a"))).status, 401);
const { waterLevelGauge } = compile(await readFile(new URL("../../frontend/src/features/dashboard/lib/water-level.ts", import.meta.url), "utf8"));
const tank = (name, waterLevel = 95, hardware) => ({ name, waterLevel, hardware });
const rawGauge = waterLevelGauge([tank("Tank 1", 95, { distanceCm: 10.72, waterLevel: null })]);
assert.equal(rawGauge.value, "10.72 cm", "An uncalibrated ESP32 must replace the old percentage display");
assert.equal(rawGauge.pct, null, "Distance must not be drawn as percentage fill");
assert.equal(rawGauge.statusLabel, "Needs calibration");
assert.equal(waterLevelGauge([tank("Tank 1", 95, { distanceCm: 14, waterLevel: null }), tank("Tank 2", 90)]).value, "14.00 cm", "Do not average centimetres with percentages");
assert.equal(waterLevelGauge([tank("Tank 1", 95, { distanceCm: 12, waterLevel: null }), tank("Tank 2", 90, { distanceCm: 16, waterLevel: null })]).value, "14.00 cm");
assert.equal(waterLevelGauge([tank("Tank 1", 95, { distanceCm: 50, waterLevel: 0 })]).value, "0%", "A real empty-tank reading must not fall back to recorded data");
assert.equal(waterLevelGauge([tank("Tank 1", 95, { distanceCm: 12, waterLevel: 92 })]).value, "92%");
assert.equal(waterLevelGauge([tank("Tank 1", 95, { distanceCm: null, waterLevel: null })]).value, "No reading");
assert.equal(waterLevelGauge([tank("Tank 1", 90), tank("Tank 2", 100)]).value, "95%");
console.log("Hardware tests passed: serial frames, sensor faults, partial readings, calibration, account isolation, and Overview raw/calibrated/averaged water levels. No hardware, network or SMS used.");
