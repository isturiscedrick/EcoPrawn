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

const validation = compile(await readFile(new URL("../src/lib/api-validation.ts", import.meta.url), "utf8"));
const next = { NextResponse: { json: Response.json } };
let writes = 0;
let alerts = 0;
let sms = 0;
const prisma = {
  tank: {
    create: async ({ data }) => { writes++; return data; },
    update: async ({ data }) => { writes++; return data; },
    findUnique: async ({ where }) => where.id === "tank-a" ? { id: "tank-a", name: "Tank A" } : null,
    delete: async () => { writes++; },
  },
  sensorTelemetry: { create: async ({ data }) => { writes++; return data; } },
  alert: { createMany: async ({ data }) => { alerts += data.length; } },
  $transaction: async callback => callback(prisma),
};
const imports = {
  "@/lib/auth": { accountAccess: async () => ({ id: "owner-a" }) },
  "@/lib/prisma": { __esModule: true, default: prisma },
  "@/lib/api-validation": validation,
  "next/server": next,
  "@/lib/sms": { dispatchSms: async () => { sms++; return { status: "sent" }; } },
  "@/lib/unisms": { waterWarnings: ({ dissolvedOxygen }) => dissolvedOxygen < 4 ? ["Low oxygen"] : [] },
};
const tankRoute = compile(await readFile(new URL("../src/app/api/tanks/route.ts", import.meta.url), "utf8"), imports);
const tankIdRoute = compile(await readFile(new URL("../src/app/api/tanks/[id]/route.ts", import.meta.url), "utf8"), imports);
const waterRoute = compile(await readFile(new URL("../src/app/api/water/route.ts", import.meta.url), "utf8"), imports);
const request = (path, body, method = "POST") => new Request(`http://localhost/api/${path}`, {
  method,
  ...(method === "GET" || method === "DELETE" ? {} : { body: typeof body === "string" ? body : JSON.stringify(body) }),
});
const patch = (body, id = "tank-a") => tankIdRoute.PATCH(request(`tanks/${id}`, body, "PATCH"), { params: Promise.resolve({ id }) });

assert.equal((await tankRoute.POST(request("tanks", { name: "Tank A" }))).status, 201);
assert.equal((await tankRoute.POST(request("tanks", { name: "Zero", pl: "PL-0", biomass: 0, targetToday: 0, fcr: 0, dispensedToday: 0, dissolvedOxygen: 0, ph: 0, temperature: -55, salinity: 0, waterLevel: 0, bodyLength: 0, weight: 0, population: 0, abnormal: 0 }))).status, 201);
assert.equal((await tankRoute.POST(request("tanks", { name: "Full frontend payload", pl: "PL-42", biomass: 31.2, targetToday: 1.56, fcr: 1.3, dispensedToday: 0, dissolvedOxygen: 6, ph: 8, temperature: 28, salinity: 15, waterLevel: 95, bodyLength: 11.6, weight: 18.6, population: 1720, abnormal: 0 }))).status, 201);
for (const body of [null, [], "oops", { name: " " }, { name: " Tank A" }, { name: "A".repeat(101) }, { name: "A", pl: "PL ".repeat(30) }, { name: "A", biomass: "1" }, { name: "A", population: 1.5 }, { name: "A", population: 2147483648 }, { name: "A", population: 2, abnormal: 3 }, { name: "A", ph: 15 }, { name: "A", dissolvedOxygen: -1 }, { name: "A", waterLevel: 101 }, { name: "A", unknown: true }]) {
  assert.equal((await tankRoute.POST(request("tanks", body))).status, 400, JSON.stringify(body));
}
assert.equal((await tankRoute.POST(request("tanks", "{bad"))).status, 400);
assert.equal(writes, 3, "Invalid tank creation must not write");

for (const body of [{}, [], null, { name: " A" }, { pl: "" }, { fcr: -1 }, { biomass: "2" }, { waterLevel: 50 }]) {
  assert.equal((await patch(body)).status, 400, JSON.stringify(body));
}
assert.equal((await patch("{bad")).status, 400);
assert.equal((await patch({ name: "Tank B", fcr: 1.2 })).status, 200);
assert.equal((await patch({ name: "A" }, " bad")).status, 400);
assert.equal((await tankIdRoute.GET(request("tanks/bad id", {}, "GET"), { params: Promise.resolve({ id: "bad id" }) })).status, 400);
assert.equal((await tankIdRoute.DELETE(request("tanks/bad id", {}, "DELETE"), { params: Promise.resolve({ id: "bad id" }) })).status, 400);
assert.equal(writes, 4, "Invalid patches and IDs must not write");

const good = { tankId: "tank-a", dissolvedOxygen: 6, ph: 8, temperature: 28, salinity: 15, waterLevel: 95 };
assert.equal((await waterRoute.POST(request("water", good))).status, 201);
for (const body of [null, [], { ...good, ph: 15 }, { ...good, temperature: 126 }, { ...good, salinity: -1 }, { ...good, dissolvedOxygen: "6" }, { ...good, waterLevel: 101 }, { ...good, tankId: " tank-a" }, { ...good, extra: 1 }]) {
  assert.equal((await waterRoute.POST(request("water", body))).status, 400, JSON.stringify(body));
}
assert.equal((await waterRoute.POST(request("water", "{bad"))).status, 400);
assert.equal((await waterRoute.GET(new Request("http://localhost/api/water?tankId=%20bad"))).status, 400);
assert.equal(writes, 5, "Invalid water readings must not write");
assert.equal(alerts, 0);
assert.equal(sms, 0);
assert.equal((await waterRoute.POST(request("water", { ...good, dissolvedOxygen: 2 }))).status, 201);
assert.equal(alerts, 1, "Unhealthy but physical reading must still trigger an alert");
assert.equal(sms, 1);
console.log("API validation tests passed: tank create/update/IDs, water readings, malformed JSON, and warning dispatch.");
