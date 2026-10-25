import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import ts from "typescript";

const require = createRequire(import.meta.url);
async function load(path, imports = {}) {
  const source = await readFile(new URL(`../src/${path}.ts`, import.meta.url), "utf8");
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } });
  const module = { exports: {} };
  new Function("require", "module", "exports", outputText)(name => name in imports ? imports[name] : require(name), module, module.exports);
  return module.exports;
}
const provider = await load("lib/unisms");
const normal = { dissolvedOxygen: 4.5, ph: 7.5, temperature: 26, salinity: 10, waterLevel: 90 };
assert.deepEqual(provider.waterWarnings(normal), []);
assert.deepEqual(provider.waterWarnings({ ...normal, ph: 8.5, temperature: 30, salinity: 20 }), []);
assert.equal(provider.waterWarnings({ dissolvedOxygen: 4, ph: 9, temperature: 31, salinity: 21, waterLevel: 89 }).length, 5);
assert.equal(provider.normalizePhone("0917 123 4567"), "+639171234567");
for (const phone of ["+639171234567", "(+63) 917-123-4567"]) assert.equal(provider.normalizePhone(phone), "+639171234567");
for (const phone of [null, 9171234567, "+12025550123", "0917123456"]) assert.equal(provider.normalizePhone(phone), null);

process.env.UNISMS_API_KEY = "test-key";
process.env.UNISMS_SENDER_ID = "TEST";
process.env.UNISMS_WEBHOOK_SECRET = "webhook-test";
let sends = 0;
globalThis.fetch = async (url, options) => {
  sends++;
  assert.equal(url, "https://unismsapi.com/api/sms");
  assert.equal(options.headers.Authorization, `Basic ${Buffer.from("test-key:").toString("base64")}`);
  const body = JSON.parse(options.body);
  assert.equal(body.sender_id, "TEST"); assert.equal(body.metadata.delivery_id, "delivery-1");
  return Response.json({ message: { status: "pending", reference_id: "msg_test" } }, { status: 201 });
};
assert.equal((await provider.sendSms("+639171234567", "Warning", "delivery-1")).status, "pending");
await assert.rejects(provider.sendSms("invalid", "Warning", "delivery-1"));
globalThis.fetch = async () => Response.json({ secret: "must not leak" }, { status: 401 });
await assert.rejects(provider.sendSms("+639171234567", "Warning", "delivery-1"), /HTTP 401/);
globalThis.fetch = async () => Response.json({ errors: { sender_id: ["This sender ID is not active."] }, secret: "must not leak" }, { status: 422 });
await assert.rejects(provider.sendSms("+639171234567", "Warning", "delivery-1"), (error) => {
  assert.match(error.message, /sender_id: This sender ID is not active/);
  assert.equal(error.definitive, true, "An explicit 422 rejection must be recorded as rejected, not unknown");
  assert.doesNotMatch(error.message, /must not leak/);
  return true;
});
globalThis.fetch = async () => Response.json({ errors: { content: ["Invalid input test-key"] } }, { status: 422 });
await assert.rejects(provider.sendSms("+639171234567", "Warning", "delivery-1"), (error) => {
  assert.match(error.message, /\[redacted\]/);
  assert.doesNotMatch(error.message, /test-key/);
  return true;
});
globalThis.fetch = async () => Response.json({ message: { status: "sent" } });
await assert.rejects(provider.sendSms("+639171234567", "Warning", "delivery-1"), /unexpected response/);

let account = { id: "account-a" }, lastSmsAt = null, stored = null, dispatchCount = 0, smsEnabled = true;
const auth = { accountAccess: async () => account ?? Response.json({}, { status: 401 }) };
const db = {
  user: {
    async updateMany({ where, data }) {
      assert.equal(where.id, "account-a"); assert.equal(where.smsEnabled, true);
      if (!smsEnabled) return { count: 0 };
      if (lastSmsAt && lastSmsAt > where.OR[1].lastSmsAt.lte) return { count: 0 };
      lastSmsAt = data.lastSmsAt; return { count: 1 };
    },
    async findUniqueOrThrow({ where }) { assert.equal(where.id, "account-a"); return { smsPhone: "+639171234567", smsEnabled, lastSmsAt }; },
    async update({ where, data }) { assert.equal(where.id, "account-a"); assert.equal(data.smsPhone, "+639171234567"); return data; },
  },
  smsDelivery: {
    async create({ data }) { stored = { id: "delivery-1", referenceId: null, status: "sending", ...data }; return stored; },
    async findMany({ where }) { assert.equal(where.userId, "account-a"); return []; },
    async updateMany({ where, data }) {
      if (where.id) { if (stored.status !== where.status) return { count: 0 }; }
      else {
        if (!where.status.in.includes(stored.status) || stored.recipient !== where.recipient) return { count: 0 };
        if (!where.OR.some(clause => Object.entries(clause).every(([key, value]) => stored[key] === value))) return { count: 0 };
      }
      Object.assign(stored, data); return { count: 1 };
    },
  },
};
db.$transaction = async callback => callback(db);
const imports = { "@/lib/auth": auth, "@/lib/prisma": { __esModule: true, default: db }, "@/lib/unisms": provider };
const sms = await load("lib/sms", { ...imports, "@/lib/unisms": { ...provider, sendSms: async () => { dispatchCount++; return { referenceId: "msg_test", status: "pending", error: null }; } } });
assert.equal((await sms.dispatchSms("account-a", "warning")).status, "pending");
const limited = await sms.dispatchSms("account-a", "warning");
assert.equal(limited.status, "cooldown");
assert.ok(limited.retryAfterSeconds > 0 && limited.retryAfterSeconds <= 300);
assert.equal(dispatchCount, 1);
lastSmsAt = null;
const broken = await load("lib/sms", { ...imports, "@/lib/unisms": { ...provider, sendSms: async () => { throw new Error("timeout"); } } });
assert.equal((await broken.dispatchSms("account-a", "warning")).status, "unknown");
assert.equal(stored.status, "unknown");
assert.equal((await broken.dispatchSms("account-a", "warning")).status, "cooldown");
smsEnabled = false;
assert.equal((await sms.dispatchSms("account-a", "warning")).status, "disabled");
smsEnabled = true;

lastSmsAt = null;
globalThis.fetch = async () => Response.json({ errors: { content: ["This content is not allowed."] } }, { status: 422 });
const realProviderDispatch = await load("lib/sms", imports);
const rejectedResult = await realProviderDispatch.dispatchSms("account-a", "warning");
assert.equal(rejectedResult.status, "rejected");
assert.equal(stored.status, "rejected");
assert.match(stored.error, /content: This content is not allowed/);
const testRoute = await load("app/api/sms/test/route", { ...imports, "@/lib/sms": { dispatchSms: async () => rejectedResult } });
const rejectedResponse = await testRoute.POST();
assert.equal(rejectedResponse.status, 422);
assert.match((await rejectedResponse.json()).error, /This content is not allowed/);
const limitedRoute = await load("app/api/sms/test/route", { ...imports, "@/lib/sms": sms });
const limitedResponse = await limitedRoute.POST();
assert.equal(limitedResponse.status, 429);
assert.ok(Number(limitedResponse.headers.get("Retry-After")) > 0);
imports["@/lib/sms"] = sms;

const settings = await load("app/api/sms/settings/route", imports);
const req = body => new Request("http://localhost/api", { method: "POST", headers: { "Content-Type": "application/json", "webhook-secret-key": "webhook-test" }, body: JSON.stringify(body) });
assert.equal((await settings.GET()).status, 200);
assert.ok((await (await settings.GET()).json()).nextAttemptAt);
assert.equal((await settings.PATCH(req({ userId: "account-b", smsPhone: "09171234567", smsEnabled: true }))).status, 200);
assert.equal((await settings.PATCH(req({ smsPhone: "+12025550123", smsEnabled: true }))).status, 400);
assert.equal((await settings.PATCH(req(null))).status, 400);
account = null;
assert.equal((await settings.GET()).status, 401); assert.equal((await settings.PATCH(req({}))).status, 401);
account = { id: "account-a" };

const webhook = await load("app/api/sms/webhook/route", imports);
stored.status = "unknown";
const payload = status => ({ id: "msg_test", event: `message.${status}`, message: { status, reference_id: "msg_test", recipient: "+639171234567", metadata: { delivery_id: "delivery-1" } } });
assert.equal((await webhook.POST(new Request("http://localhost", { method: "POST" }))).status, 401);
assert.equal((await webhook.POST(req({}))).status, 400);
assert.equal((await webhook.POST(req(payload("sent")))).status, 200);
assert.equal(stored.status, "sent"); assert.equal(stored.referenceId, "msg_test");
await webhook.POST(req(payload("retrying"))); assert.equal(stored.status, "sent", "late retry must not revert a terminal status");
stored.status = "pending";
await webhook.POST(req({ ...payload("failed"), id: "other" })); assert.equal(stored.status, "pending");
await webhook.POST(req(payload("failed"))); assert.equal(stored.status, "failed");

let recorded = 0;
db.tank = { findUnique: async ({ where }) => where.userId === "account-a" && where.id === "tank-a" ? { id: "tank-a", name: "A" } : null };
db.sensorTelemetry = { create: async ({ data }) => { recorded++; return data; } };
db.alert = { createMany: async ({ data }) => assert.equal(data.length, 1) };
const water = await load("app/api/water/route", { ...imports, "next/server": { NextResponse: Response }, "@/lib/sms": { dispatchSms: async () => { throw new Error("SMS database down"); } } });
assert.equal((await water.POST(req({ tankId: "tank-b", ...normal }))).status, 404);
assert.equal((await water.POST(req({ tankId: "tank-a", ...normal, ph: null }))).status, 400);
const result = await water.POST(req({ tankId: "tank-a", ...normal, ph: 9 }));
assert.equal(result.status, 201); assert.equal((await result.json()).sms.status, "unavailable"); assert.equal(recorded, 1);
console.log("SMS tests passed: thresholds, phone validation, provider contract, cooldown, unknown delivery, account isolation, authenticated webhooks, late events, and telemetry persistence.");
