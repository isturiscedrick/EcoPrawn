import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";

// Execute the real route handlers with two signed-in identities and an in-memory
// Prisma substitute. This checks the API boundary, including hostile request bodies.
let user = { id: "account-b", role: "operator" };
const tanks = [
  { id: "tank-a", userId: "account-a", name: "A", telemetries: [], visionScans: [] },
  { id: "tank-b", userId: "account-b", name: "B", telemetries: [], visionScans: [] },
  { id: "legacy", userId: null, name: "Unassigned", telemetries: [], visionScans: [] },
];
const match = (row, where = {}) => Object.entries(where).every(([key, value]) =>
  key === "tank" ? match(tanks.find(t => t.id === row.tankId) ?? {}, value) : row[key] === value);
const missing = () => Object.assign(new Error("Not found"), { code: "P2025" });
const db = { tank: {
  async findMany({ where } = {}) { return tanks.filter(t => match(t, where)); },
  async findUnique({ where }) { return tanks.find(t => match(t, where)) ?? null; },
  async findFirst({ where }) { return tanks.find(t => match(t, where)) ?? null; },
  async create({ data }) { const row = { id: "new", ...data }; tanks.push(row); return row; },
  async update({ where, data }) { const row = tanks.find(t => match(t, where)); if (!row) throw missing(); Object.assign(row, data); return row; },
  async delete({ where }) { const index = tanks.findIndex(t => match(t, where)); if (index < 0) throw missing(); return tanks.splice(index, 1)[0]; },
} };
for (const model of ["sensorTelemetry", "visionScan", "feedSchedule", "bioflocMetric", "effluentLog", "alert"]) {
  const rows = ["a", "b"].map(account => ({
    id: `${model}-${account}`, userId: `account-${account}`, tankId: `tank-${account}`,
    tank: { name: account }, recordedAt: new Date(), createdAt: new Date(),
    timeSlot: "06:00", amountKg: 1, bodyLength: 10, dissolvedOxygen: 6, icon: "info",
  }));
  rows.push({ ...rows[0], id: `${model}-legacy`, userId: null, tankId: "legacy" });
  db[model] = {
    async findMany({ where } = {}) { return rows.filter(row => match(row, where)); },
    async findFirst({ where } = {}) { return rows.find(row => match(row, where)) ?? null; },
    async create({ data }) { rows.push({ id: "reading", ...data }); return rows.at(-1); },
  };
}
db.$transaction = async work => typeof work === "function" ? work(db) : Promise.all(work);
const auth = {
  requireAccess: async () => user ? null : Response.json({}, { status: 401 }),
  accountAccess: async () => user ?? Response.json({}, { status: 401 }),
};
async function load(path) {
  const source = await readFile(new URL(`../src/app/api/${path}/route.ts`, import.meta.url), "utf8");
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } });
  const module = { exports: {} };
  const imports = { "@/lib/auth": auth, "@/lib/prisma": { __esModule: true, default: db }, "next/server": { NextResponse: Response }, "@/lib/unisms": { waterWarnings: () => [] }, "@/lib/sms": { dispatchSms: async () => ({ status: "not_configured" }) } };
  new Function("require", "module", "exports", outputText)(name => {
    if (!(name in imports)) throw new Error(`Unexpected import ${name}`);
    return imports[name];
  }, module, module.exports);
  return module.exports;
}
const list = await load("tanks");
const detail = await load("tanks/[id]");
const water = await load("water");
const dashboard = await load("dashboard");
const params = id => ({ params: Promise.resolve({ id }) });
const request = (body, url = "http://localhost/api/tanks") => new Request(url, {
  method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
});
assert.deepEqual((await (await list.GET()).json()).tanks.map(t => t.id), ["tank-b"]);
assert.equal((await detail.GET(null, params("tank-a"))).status, 404);
assert.equal((await detail.GET(null, params("legacy"))).status, 404);
assert.equal((await detail.GET(null, params("tank-b"))).status, 200);
assert.equal((await detail.DELETE(null, params("tank-a"))).status, 404);
assert.equal((await detail.PATCH(request({ name: "stolen" }), params("tank-a"))).status, 404);
assert.equal((await detail.PATCH(request({ userId: "account-a", telemetries: { deleteMany: {} } }), params("tank-b"))).status, 400);
assert.equal(tanks.find(t => t.id === "tank-b").userId, "account-b");
assert.equal((await detail.PATCH(request({ name: "Updated" }), params("tank-b"))).status, 200);
const created = await (await list.POST(request({ name: "Created", userId: "account-a" }))).json();
assert.equal(created.tank.userId, "account-b");
assert.equal((await water.POST(request({ tankId: "tank-a" }))).status, 404);
assert.equal((await water.POST(request({ tankId: "legacy" }))).status, 404);
assert.deepEqual((await (await water.GET(new Request("http://localhost/api/water?tankId=tank-a"))).json()).readings, []);
assert.deepEqual((await (await water.GET(new Request("http://localhost/api/water"))).json()).readings.map(r => r.tankId), ["tank-b"]);
const data = await (await dashboard.GET()).json();
assert.equal(data.visionScanLog.length, 1);
assert.equal(data.visionScanLog[0].tank, "b");
assert.equal(data.feedSchedule.length, 1);
assert.equal(data.effluentLog.length, 1);
assert.equal(data.alertsLog.length, 1);
assert.equal(data.waterTrend.length, 1);
assert.equal(data.bioflocMetrics.length, 4);
user = { id: "account-a", role: "admin" };
assert.deepEqual((await (await list.GET()).json()).tanks.map(t => t.id), ["tank-a"]);
assert.equal((await detail.DELETE(null, params("tank-b"))).status, 404);
user = null;
assert.equal((await list.GET()).status, 401);
assert.equal((await dashboard.GET()).status, 401);
console.log("Account isolation passed: list, detail, create, update, delete, water, dashboard, legacy records, and admin boundaries.");
