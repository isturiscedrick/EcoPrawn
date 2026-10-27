import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import ts from "typescript";

const require = createRequire(import.meta.url);
async function load(relativePath, imports = {}) {
  const source = await readFile(new URL(relativePath, import.meta.url), "utf8");
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } });
  const module = { exports: {} };
  new Function("require", "module", "exports", outputText)(name => name in imports ? imports[name] : require(name), module, module.exports);
  return module.exports;
}

const provider = await load("../src/lib/unisms.ts");
const healthy = { dissolvedOxygen: 6, ph: 8, temperature: 28, salinity: 15, waterLevel: 95 };
const lowOxygen = { ...healthy, dissolvedOxygen: 3 };
const live = process.argv.includes("--live");
let database;

try {
  let userId = "oxygen-test-account";
  let tankId = "oxygen-test-tank";
  let sms;
  const savedReadings = [], savedAlerts = [], smsCalls = [];
  let transactions = 0, failAlerts = false;
  if (live) {
    const { PrismaClient } = require("@prisma/client");
    database = new PrismaClient();
    const userIndex = process.argv.indexOf("--user-id");
    const requestedUserId = userIndex >= 0 ? process.argv[userIndex + 1] : null;
    if (userIndex >= 0 && (!requestedUserId || requestedUserId.startsWith("--"))) throw new Error("--user-id requires an app account ID");
    const accounts = await database.user.findMany({ where: { ...(requestedUserId ? { id: requestedUserId } : {}), smsEnabled: true, smsPhone: { not: null } }, select: { id: true, lastSmsAt: true }, take: 2 });
    if (accounts.length !== 1) throw new Error("Select one SMS-enabled app account with --user-id YOUR_APP_USER_ID");
    userId = accounts[0].id;
    sms = await load("../src/lib/sms.ts", { "@/lib/prisma": { __esModule: true, default: database }, "@/lib/unisms": provider });
    if (!provider.smsConfigured()) throw new Error("Configure the backend UniSMS key and sender ID first");
    const next = sms.nextSmsAttempt(accounts[0].lastSmsAt);
    if (next) throw new Error(`SMS cooldown active. Retry after ${next}. No test data or SMS created.`);
    // A separate, clearly named tank keeps simulated readings out of real tanks.
    let tank = await database.tank.findFirst({ where: { userId, name: "TEST - Oxygen alert" }, select: { id: true } });
    if (!tank) tank = await database.tank.create({ data: { userId, name: "TEST - Oxygen alert", pl: "TEST", biomass: 0, targetToday: 0, fcr: 0 }, select: { id: true } });
    tankId = tank.id;
  } else {
    database = {
      tank: { findUnique: async ({ where }) => where.id === tankId && where.userId === userId ? { id: tankId, name: "TEST - Oxygen alert" } : null },
      sensorTelemetry: { create: async ({ data }) => { const row = { id: `reading-${savedReadings.length}`, ...data }; savedReadings.push(row); return row; } },
      alert: { createMany: async ({ data }) => {
        if (failAlerts) throw new Error("Alert persistence failed");
        savedAlerts.push(...data); return { count: data.length };
      } },
    };
    database.$transaction = async callback => {
      transactions++;
      const readingCount = savedReadings.length, alertCount = savedAlerts.length;
      try { return await callback(database); }
      catch (error) {
        savedReadings.length = readingCount; savedAlerts.length = alertCount;
        throw error;
      }
    };
    sms = { dispatchSms: async (...args) => { smsCalls.push(args); return { status: "pending" }; } };
  }
  // Use the actual water route and its ownership checks. The CLI supplies the
  // selected identity; browser sign-in itself is covered by the auth tests.
  const route = await load("../src/app/api/water/route.ts", {
    "@/lib/auth": { accountAccess: async () => ({ id: userId, role: "operator" }) },
    "@/lib/prisma": { __esModule: true, default: database },
    "@/lib/unisms": provider,
    "@/lib/sms": sms,
    "next/server": { NextResponse: Response },
  });
  const request = (reading, id = tankId) => new Request("http://localhost:4000/api/water", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tankId: id, ...reading }) });

  if (!live) {
    assert.equal((await route.POST(request(lowOxygen, "someone-elses-tank"))).status, 404);
    assert.equal(savedReadings.length, 0);
    for (const reading of [healthy, { ...healthy, dissolvedOxygen: 4.5 }]) {
      const response = await route.POST(request(reading));
      assert.equal(response.status, 201);
      assert.equal((await response.json()).sms.status, "no_warning");
    }
    assert.equal(savedAlerts.length, 0);
    assert.equal(smsCalls.length, 0);
    assert.equal(transactions, 0, "Healthy and boundary readings must use a single insert without a transaction");
    failAlerts = true;
    assert.equal((await route.POST(request(lowOxygen))).status, 500);
    assert.equal(savedReadings.length, 2, "Alert failure must roll back the warning reading");
    assert.equal(savedAlerts.length, 0);
    assert.equal(smsCalls.length, 0, "A rolled-back reading must not trigger SMS");
    failAlerts = false;
  }

  const response = await route.POST(request(lowOxygen));
  assert.equal(response.status, 201);
  const result = await response.json();
  assert.equal(result.reading.dissolvedOxygen, 3);
  if (live) {
    const alert = await database.alert.findFirst({ where: { userId, tankId, detail: { contains: "DO 3 mg/L" } }, orderBy: { createdAt: "desc" } });
    assert.ok(alert, "Low oxygen alert must be persisted in Supabase");
    const dashboardRoute = await load("../src/app/api/dashboard/route.ts", {
      "@/lib/auth": { accountAccess: async () => ({ id: userId, role: "operator" }) },
      "@/lib/prisma": { __esModule: true, default: database },
    });
    const dashboardResponse = await dashboardRoute.GET();
    assert.equal(dashboardResponse.status, 200);
    const dashboard = await dashboardResponse.json();
    assert.equal(dashboard.tanks.find((tank) => tank.id === tankId)?.telemetries[0]?.dissolvedOxygen, 3);
    assert.ok(dashboard.alertsLog.some((event) => event.detail.includes("DO 3 mg/L")), "The dashboard API must include the oxygen warning");
    console.log(JSON.stringify({ test: "Low dissolved oxygen", tank: "TEST - Oxygen alert", tankId, readingId: result.reading.id, oxygen: "3 mg/L", target: ">= 4.5 mg/L", alertId: alert.id, sms: result.sms }, null, 2));
    assert.ok(["pending", "retrying", "sent"].includes(result.sms.status), result.sms.error ?? `SMS was not accepted: ${result.sms.status}`);
  } else {
    assert.equal(transactions, 2, "Warning readings must use an atomic transaction");
    assert.equal(savedAlerts.length, 1);
    assert.equal(savedAlerts[0].userId, userId);
    assert.equal(savedAlerts[0].tankId, tankId);
    assert.match(savedAlerts[0].detail, /DO 3 mg\/L \(min 4\.5\)/);
    assert.equal(smsCalls.length, 1);
    assert.equal(smsCalls[0][0], userId);
    assert.equal(smsCalls[0][2], tankId);
    assert.match(smsCalls[0][1], /TEST - Oxygen alert.*DO 3 mg\/L/);
    assert.equal(result.sms.status, "pending");
    const { THRESHOLDS } = await load("../../frontend/src/features/dashboard/lib/thresholds.ts");
    const { deriveTankAlerts } = await load("../../frontend/src/features/dashboard/lib/alerts.ts", { "@/features/dashboard/lib/thresholds": { THRESHOLDS } });
    const alerts = deriveTankAlerts([{ id: tankId, name: "TEST - Oxygen alert", ...lowOxygen }]);
    assert.equal(alerts.length, 1);
    assert.match(alerts[0].title, /below target/);
    assert.match(alerts[0].detail, /3\.0 mg\/L/);
    console.log("Oxygen alert test passed: healthy/boundary readings stay quiet; 3 mg/L saves one warning, invokes SMS once for the tank owner, and appears as a live dashboard alert. No SMS sent.");
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  if (live && database) await database.$disconnect();
}
