import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";

async function load(path, replacements = {}) {
  let source = await readFile(new URL(path, import.meta.url), "utf8");
  for (const [before, after] of Object.entries(replacements)) source = source.replace(before, after);
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } });
  return import("data:text/javascript;base64," + Buffer.from(outputText).toString("base64"));
}
const { normalizePhone } = await load("../src/lib/unisms.ts");
const records = [];
const database = { user: {
  async findUnique({ where }) { return records.find(row => Object.entries(where).every(([key, value]) => row[key] === value)) ?? null; },
  async upsert({ where, update, create }) {
    assert.deepEqual(update, {});
    const existing = records.find(row => row.authId === where.authId);
    if (existing) return existing;
    if (records.some(row => row.username === create.username || row.phone === create.phone)) throw { code: "P2002" };
    assert.equal(create.role, "operator"); assert.equal(create.password, undefined);
    const row = { id: String(records.length), ...create }; records.push(row); return row;
  },
} };
globalThis.phoneTest = { database, normalizePhone };
const { phoneAccount, normalizeUsername } = await load("../src/lib/phone-account.ts", {
  'import prisma from "@/lib/prisma";': 'const prisma = globalThis.phoneTest.database;',
  'import { normalizePhone } from "@/lib/unisms";': 'const { normalizePhone } = globalThis.phoneTest;',
});
assert.equal(normalizeUsername(" Test_User "), "test_user");
assert.equal(normalizeUsername("09171234567"), null);
assert.equal(normalizeUsername("a@b.com"), null);
assert.equal(normalizePhone("0917 123 4567"), "+639171234567");
const user = { id: "auth-1", phone: "639171234567", user_metadata: { username: "Test_User", full_name: "Test", role: "admin" } };
await assert.rejects(phoneAccount(user), /PHONE_UNVERIFIED/);
assert.equal(records.length, 0);
user.phone_confirmed_at = new Date().toISOString();
assert.equal((await phoneAccount(user)).role, "operator");
assert.equal((await phoneAccount(user)).username, "test_user");
assert.equal(records.length, 1);
records[0].role = "admin";
assert.equal((await phoneAccount(user)).role, "admin");
await assert.rejects(phoneAccount({ ...user, id: "other", phone: "639181234567" }));
assert.equal((await phoneAccount({ ...user, id: "other", phone: "639181234567" }, "other_user")).role, "operator");

let signupCalls = 0, resendCalls = 0, signinPhone = null;
let authUser = user;
let authFailure = null;
const client = { auth: {
  async signUp() { signupCalls++; return { data: { session: null }, error: null }; },
  async resend() { resendCalls++; return { error: null }; },
  async signInWithPassword({ phone }) { signinPhone = phone; return { error: authFailure }; },
  async verifyOtp() { return { error: authFailure }; },
  async getUser() { return { data: { user: authUser }, error: null }; },
} };
let allowed = true;
globalThis.phoneTest = { ...globalThis.phoneTest, client, phoneAccount, normalizeUsername, throttle: async () => allowed };
const { POST } = await load("../src/app/api/auth/password/route.ts", {
  'import { appOrigin, authClient } from "@/lib/auth";': 'const appOrigin = () => "http://localhost:3000"; const authClient = async () => globalThis.phoneTest.client;',
  'import prisma from "@/lib/prisma";': 'const prisma = globalThis.phoneTest.database;',
  'import { normalizePhone } from "@/lib/unisms";': 'const { normalizePhone } = globalThis.phoneTest;',
  'import { normalizeUsername, phoneAccount } from "@/lib/phone-account";': 'const { normalizeUsername, phoneAccount } = globalThis.phoneTest;',
  'import { authThrottle } from "@/lib/auth-throttle";': 'const authThrottle = (...args) => globalThis.phoneTest.throttle(...args);',
});
const call = (body, origin = "http://localhost:3000") => POST(new Request("http://localhost:4000/api/auth/password", { method: "POST", headers: { origin, "Content-Type": "application/json" }, body: JSON.stringify(body) }));
assert.equal((await call({ action: "signup" }, "https://evil.test")).status, 403);
assert.equal(signupCalls, 0);
assert.equal((await call({ action: "signup", username: "new_user", name: "New", phone: "09191234567", password: "long-password" })).status, 200);
assert.equal(records.length, 2, "Signup must not create an application account before verification");
assert.equal((await call({ action: "signin", identifier: "TEST_USER", password: "password" })).status, 200);
assert.equal(signinPhone, "+639171234567");
authFailure = { code: "otp_expired" };
assert.equal((await call({ action: "verify", phone: "09191234567", code: "123456" })).status, 400);
assert.equal(records.length, 2);
authFailure = null;
authUser = { ...user, id: "auth-new", phone: "639191234567", user_metadata: { username: "new_user", role: "admin" } };
assert.equal((await call({ action: "verify", phone: "09191234567", code: "123456" })).status, 200);
assert.equal(records.at(-1).role, "operator");
allowed = false;
assert.equal((await call({ action: "resend", phone: "09191234567" })).status, 429);
assert.equal(resendCalls, 0);
globalThis.phoneTest.throttle = async () => {
  const error = new Error("Private connection details must not reach the response");
  error.name = "PrismaClientInitializationError";
  throw error;
};
const unavailable = await call({ action: "resend", phone: "09191234567" });
assert.equal(unavailable.status, 503);
assert.equal((await unavailable.json()).code, "DATABASE_UNAVAILABLE");
assert.equal(resendCalls, 0, "A database outage must not bypass rate limits or send SMS");
console.log("Phone auth passed: verified-only profiles, operator defaults, username/phone login, duplicate recovery, origin checks, expired codes, throttling.");

// Exercise the deployed handler without contacting the provider or sending SMS.
let handler, sent = 0, rejectSignature = true;
const hookEnv = { SEND_SMS_HOOK_SECRET: "v1,whsec_test", UNISMS_API_KEY: "test-key", UNISMS_SENDER_ID: "test-sender" };
globalThis.Deno = { env: { get: key => hookEnv[key] }, serve: callback => { handler = callback; } };
globalThis.TestWebhook = class {
  constructor(secret) { assert.equal(secret, "test"); }
  verify(payload) { if (rejectSignature) throw new Error("invalid signature"); return JSON.parse(payload); }
};
const originalFetch = globalThis.fetch;
globalThis.fetch = async (url, options) => {
  sent++;
  assert.equal(url, "https://unismsapi.com/api/sms");
  assert.equal(options.headers.Authorization, `Basic ${Buffer.from("test-key:").toString("base64")}`);
  const body = JSON.parse(options.body);
  assert.equal(body.recipient, "+639171234567");
  assert.equal(body.content, `Your EcoPrawn OTP code is 123456 for phone verification. Please do not share. Expires in ${hookEnv.SMS_OTP_EXPIRY_SECONDS === "600" ? "10" : "5"} minutes.`);
  assert.ok(body.content.length <= 160, "Keep OTP messages within a single GSM SMS");
  return Response.json({ message: { reference_id: "test", status: "pending" } });
};
try {
  await load("../../supabase/functions/send-auth-sms/index.ts", { 'import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";': 'const Webhook = globalThis.TestWebhook;' });
  const hookRequest = () => new Request("https://example.test/hook", { method: "POST", body: JSON.stringify({ user: { phone: "639171234567" }, sms: { otp: "123456" } }) });
  assert.equal((await handler(hookRequest())).status, 401);
  assert.equal(sent, 0, "Invalid signature must never send SMS");
  rejectSignature = false;
  assert.equal((await handler(hookRequest())).status, 200);
  assert.equal(sent, 1);
  hookEnv.SMS_OTP_EXPIRY_SECONDS = "600";
  assert.equal((await handler(hookRequest())).status, 200);
  assert.equal(sent, 2);
  hookEnv.SMS_OTP_EXPIRY_SECONDS = "invalid";
  assert.equal((await handler(hookRequest())).status, 503);
  assert.equal(sent, 2);
  delete hookEnv.SMS_OTP_EXPIRY_SECONDS;
  delete hookEnv.SEND_SMS_HOOK_SECRET;
  assert.equal((await handler(hookRequest())).status, 503);
  assert.equal(sent, 2, "Missing configuration must never send SMS");
} finally { globalThis.fetch = originalFetch; delete globalThis.Deno; delete globalThis.TestWebhook; }
console.log("SMS hook passed: signature gate, missing configuration, UniSMS request format and phone normalization. No real messages sent.");
