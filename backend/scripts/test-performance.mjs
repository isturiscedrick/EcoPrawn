import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { performance } from "node:perf_hooks";
import { setImmediate, setTimeout } from "node:timers/promises";
import ts from "typescript";

// Exercise real handlers with lazy Prisma-like queries. No database or SMS calls.
const paths = {
  dashboard: "src/app/api/dashboard/route.ts",
  settings: "src/app/api/sms/settings/route.ts",
};
const sources = Object.fromEntries(await Promise.all(Object.entries(paths).map(async ([name, path]) =>
  [name, await readFile(new URL(`../${path}`, import.meta.url), "utf8")])));
const date = new Date("2026-01-01T00:00:00Z");
const fixtures = {
  tank: [{ id: "tank-a", name: "A", telemetries: [], visionScans: [] }],
  visionScan: [{ id: "scan", recordedAt: date, bodyLength: 12, notes: null, tank: { name: "A" } }],
  feedSchedule: [{ id: "feed", timeSlot: "06:00", amountKg: 1, status: "upcoming" }],
  bioflocMetric: { flocVolume: 10, cnRatio: 15, tss: 20, alkalinity: 100 },
  effluentLog: [{ id: "log", recordedAt: date, event: "Routing", detail: "Wetland" }],
  alert: [{ icon: "warn", title: "Warning", detail: "Low oxygen", createdAt: date, resolved: true }],
  sensorTelemetry: [{ tankId: "tank-a", dissolvedOxygen: 6 }, { tankId: "tank-a", dissolvedOxygen: 5 }],
  user: { smsPhone: "+639171234567", smsEnabled: true, lastSmsAt: null },
  smsDelivery: [{ id: "delivery", content: "Warning", status: "pending", error: null, createdAt: date }],
};

function load(source, db, account = { id: "account-a" }) {
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  const module = { exports: {} };
  const imports = {
    "@/lib/auth": { accountAccess: async () => account ?? Response.json({}, { status: 401 }) },
    "@/lib/prisma": { __esModule: true, default: db },
    "@/lib/sms": { nextSmsAttempt: () => null },
    "@/lib/unisms": { smsConfigured: () => true },
  };
  new Function("require", "module", "exports", outputText)(name => {
    assert.ok(name in imports, `Unexpected import ${name}`);
    return imports[name];
  }, module, module.exports);
  return module.exports;
}

function database(run) {
  const db = {};
  for (const model of Object.keys(fixtures)) {
    // Prisma promises start work when awaited, including inside a transaction.
    const query = options => ({ then: (resolve, reject) =>
      Promise.resolve().then(() => run(model, options)).then(resolve, reject) });
    db[model] = { findMany: query, findFirst: query, findUniqueOrThrow: query };
  }
  db.$transaction = async queries => {
    const results = [];
    for (const query of queries) results.push(await query);
    return results;
  };
  return db;
}

const expectedDashboard = {
  success: true, tanks: fixtures.tank,
  waterTrend: [{ tankId: "tank-a", value: 5 }, { tankId: "tank-a", value: 6 }],
  growthTrend: [12],
  visionScanLog: [{ id: "scan", time: date.toISOString(), tank: "A", note: "Scan recorded" }],
  feedSchedule: [{ id: "feed", time: "06:00", amount: "1 kg", status: "upcoming" }],
  bioflocMetrics: [
    { label: "Floc Volume (FV)", value: "10", unit: "mL/L", status: "ok" },
    { label: "C:N Ratio", value: "15", unit: ":1", status: "ok" },
    { label: "Total Suspended Solids", value: "20", unit: "mg/L", status: "ok" },
    { label: "Alkalinity", value: "100", unit: "mg/L CaCO₃", status: "ok" },
  ],
  effluentLog: [{ id: "log", time: date.toISOString(), event: "Routing", detail: "Wetland" }],
  alertsLog: [{ icon: "warn", title: "Warning", detail: "Low oxygen", time: date.toISOString() }],
  resolvedAlerts: 1,
};
for (const [name, count] of [["dashboard", 7], ["settings", 2]]) {
  let release;
  const gate = new Promise(resolve => { release = resolve; });
  const queries = [];
  const db = database(async (model, options) => {
    queries.push({ model, options });
    assert.deepEqual(options.where, ["visionScan", "feedSchedule", "sensorTelemetry"].includes(model)
      ? { tank: { userId: "account-a" } } : model === "user" ? { id: "account-a" } : { userId: "account-a" });
    await gate;
    return fixtures[model];
  });
  const pending = load(sources[name], db).GET();
  await setImmediate();
  const started = queries.length;
  release();
  const response = await pending;
  assert.equal(started, count, `${name} must start every independent read before waiting for results`);
  assert.equal(response.status, 200);
  const body = await response.json();
  if (name === "dashboard") {
    assert.deepEqual(body, expectedDashboard);
    for (const query of queries.filter(query => ["visionScan", "effluentLog", "alert", "sensorTelemetry"].includes(query.model))) {
      assert.equal(query.options.take, 100);
    }
    assert.deepEqual(queries.find(query => query.model === "tank").options.include, {
      telemetries: { orderBy: { recordedAt: "desc" }, take: 1 },
      hardwareTelemetries: { orderBy: { recordedAt: "desc" }, take: 1 },
      visionScans: { orderBy: { recordedAt: "desc" }, take: 1 },
    });
  } else {
    assert.deepEqual(body, {
      smsPhone: fixtures.user.smsPhone, smsEnabled: true, nextAttemptAt: null, configured: true,
      deliveries: [{ ...fixtures.smsDelivery[0], createdAt: date.toISOString() }],
    });
    assert.equal(queries.find(query => query.model === "smsDelivery").options.take, 10);
  }
  const denied = await load(sources[name], database(() => { throw new Error("Unauthenticated query"); }), null).GET();
  assert.equal(denied.status, 401);
}
const failed = await load(sources.dashboard, database(() => { throw new Error("Database unavailable"); })).GET();
assert.equal(failed.status, 500);
console.log("Performance regressions passed: concurrent dashboard/settings reads, response data, account filters, limits, and failure handling.");

// Optional before/after comparison, with a bounded simulated connection pool.
// Example: npm run test:performance -- --compare-ref <commit>
const refIndex = process.argv.indexOf("--compare-ref");
if (refIndex >= 0) {
  const ref = process.argv[refIndex + 1];
  assert.ok(ref && !ref.startsWith("-"), "--compare-ref requires a Git revision");
  const baseline = Object.fromEntries(Object.entries(paths).map(([name, path]) => [name,
    execFileSync("git", ["show", `${ref}:backend/${path}`], { encoding: "utf8" })]));
  if (process.argv.includes("--database")) {
    // GET handlers only. Identity is supplied locally to measure database work
    // separately from browser authentication. Never print account data.
    const { PrismaClient } = await import("@prisma/client");
    const client = new PrismaClient({ log: [{ emit: "event", level: "query" }] });
    let sqlQueries = 0;
    client.$on("query", () => { sqlQueries++; });
    const realRows = [];
    try {
      const tank = await client.tank.findFirst({ where: { userId: { not: null } }, select: { userId: true } });
      assert.ok(tank?.userId, "A tank with an owner is required for the read-only database comparison");
      for (const name of Object.keys(paths)) {
        for (const concurrency of [1, 10]) {
          for (const [version, source] of [["before", baseline[name]], ["after", sources[name]]]) {
            const route = load(source, client, { id: tank.userId });
            assert.equal((await route.GET()).status, 200, "Warm-up request failed");
            sqlQueries = 0;
            const samples = [], errors = [];
            const batches = concurrency === 1 ? 3 : 1;
            for (let batch = 0; batch < batches; batch++) {
              await Promise.all(Array.from({ length: concurrency }, async () => {
                const start = performance.now();
                try {
                  const response = await route.GET();
                  if (response.status !== 200) errors.push(`HTTP ${response.status}`);
                  await response.arrayBuffer();
                } catch (error) { errors.push(error.code ?? error.name); }
                samples.push(performance.now() - start);
              }));
            }
            samples.sort((a, b) => a - b);
            realRows.push({ route: name, concurrency, version,
              medianMs: Math.round(samples[Math.floor(samples.length / 2)]),
              p95Ms: Math.round(samples[Math.ceil(samples.length * .95) - 1]),
              sqlStatementsPerRequest: sqlQueries / samples.length, errors: errors.length,
            });
            if (errors.length) throw new Error(`Read-only benchmark errors: ${errors.join(", ")}`);
          }
        }
      }
      console.log("REAL DATABASE, read-only GET handlers: existing Prisma pool, authentication excluded, no SMS sent.");
      console.table(realRows);
    } catch (error) {
      console.error(`Read-only database comparison failed (${error.code ?? error.errorCode ?? error.name}). Check database connectivity and query logs.`);
      if (realRows.length) console.table(realRows);
      process.exitCode = 1;
    } finally { await client.$disconnect(); }
  }
  const rows = [];
  for (const [name, queryCount] of [["dashboard", 7], ["settings", 2]]) {
    for (const concurrency of [1, 10]) {
      for (const [version, source] of [["before", baseline[name]], ["after", sources[name]]]) {
        let active = 0, calls = 0, peakConnections = 0;
        const waiting = [], samples = [];
        const db = database(async model => {
          calls++;
          if (active === 10) await new Promise(resolve => waiting.push(resolve));
          else active++;
          peakConnections = Math.max(peakConnections, active);
          try { await setTimeout(25); return fixtures[model]; }
          finally { if (waiting.length) waiting.shift()(); else active--; }
        });
        const route = load(source, db);
        for (let batch = 0; batch < 3; batch++) {
          await Promise.all(Array.from({ length: concurrency }, async () => {
            const start = performance.now();
            const response = await route.GET();
            assert.equal(response.status, 200);
            await response.json();
            samples.push(performance.now() - start);
          }));
        }
        assert.equal(calls, queryCount * concurrency * 3);
        samples.sort((a, b) => a - b);
        rows.push({ route: name, concurrency, version,
          medianMs: Math.round(samples[Math.floor(samples.length / 2)]),
          p95Ms: Math.round(samples[Math.ceil(samples.length * .95) - 1]),
          readsPerRequest: queryCount, peakConnections, errors: 0,
        });
      }
    }
  }
  console.log("SIMULATED results only: 25 ms/read, 10 connection slots; no real database or provider calls.");
  console.table(rows);
}
