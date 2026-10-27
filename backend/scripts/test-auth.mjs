import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { createServer } from "node:http";
const origin = "http://localhost:4107";
const mock = createServer((req, res) => {
  res.writeHead(400, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "invalid_grant", message: "Invalid test token" }));
});
mock.listen(4108, "127.0.0.1");
await once(mock, "listening");
const server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "dev", "-p", "4107"], {
  env: { ...process.env, APP_URL: origin, NEXT_BUILD_DIR: ".next-auth-test",
    SUPABASE_URL: "http://127.0.0.1:4108", SUPABASE_PUBLISHABLE_KEY: "test-publishable-key" },
  stdio: ["ignore", "pipe", "pipe"],
});
let output = "";
server.stdout.on("data", data => { output += data; });
server.stderr.on("data", data => { output += data; });
const request = (path, options = {}) => fetch(origin + path, { redirect: "manual", signal: AbortSignal.timeout(15000), ...options });
try {
  let ready = false;
  for (let i = 0; i < 90; i++) {
    if (server.exitCode !== null) throw new Error(output);
    try { if ((await request("/api/auth/session")).status === 401) { ready = true; break; } } catch {}
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  assert.ok(ready, output);
  for (const path of ["/api/dashboard", "/api/tanks", "/api/tanks/missing", "/api/water"]) {
    assert.equal((await request(path)).status, 401, path);
  }
  assert.equal((await request("/api/tanks", { method: "POST", headers: { Origin: "https://attacker.example" } })).status, 403);
  assert.equal((await request("/api/seed", { method: "POST", headers: { Origin: origin } })).status, 401);
  assert.equal((await request("/api/seed")).status, 405);
  assert.equal((await request("/api/auth/session", { headers: { Cookie: "ecoprawn_session=old-session" } })).status, 401);
  assert.equal((await request("/api/auth/session", { headers: { Cookie: "sb-127-auth-token=forged" } })).status, 401);
  const start = await request("/api/auth/google");
  assert.equal(start.status, 307);
  const authorize = new URL(start.headers.get("location"));
  assert.equal(authorize.origin, "http://127.0.0.1:4108");
  assert.equal(authorize.pathname, "/auth/v1/authorize");
  assert.equal(authorize.searchParams.get("provider"), "google");
  assert.equal(authorize.searchParams.get("redirect_to"), origin + "/api/auth/google/callback");
  assert.equal(authorize.searchParams.get("code_challenge_method"), "s256");
  const flowCookie = start.headers.get("set-cookie");
  assert.match(flowCookie, /code-verifier/); assert.match(flowCookie, /HttpOnly/i);
  assert.match(start.headers.get("cache-control"), /no-store/);
  const missing = await request("/api/auth/google/callback");
  assert.equal(new URL(missing.headers.get("location")).searchParams.get("error"), "expired");
  const invalid = await request("/api/auth/google/callback?code=invalid", { headers: { Cookie: flowCookie.split(";")[0] } });
  assert.equal(new URL(invalid.headers.get("location")).searchParams.get("error"), "expired");
  const cancelled = await request("/api/auth/google/callback?error=access_denied");
  assert.equal(new URL(cancelled.headers.get("location")).searchParams.get("error"), "cancelled");
  assert.equal((await request("/api/auth/logout", { method: "POST", headers: { Origin: "https://attacker.example" } })).status, 403);
  const logout = await request("/api/auth/logout", { method: "POST", headers: { Origin: origin, Cookie: "ecoprawn_session=legacy" } });
  assert.equal(logout.status, 200);
  assert.match(logout.headers.get("set-cookie"), /ecoprawn_session=;.*Max-Age=0/i);
  console.log("Supabase auth integration checks passed.");
} finally {
  server.kill();
  if (server.exitCode === null) await once(server, "exit");
  mock.close();
}
