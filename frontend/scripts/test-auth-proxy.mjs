import assert from "node:assert/strict";
import { createServer } from "node:http";
import { once } from "node:events";
import { spawn } from "node:child_process";
import { cp, mkdir, mkdtemp, writeFile, symlink, rm, rmdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { setTimeout } from "node:timers/promises";

const require = createRequire(import.meta.url);
const source = fileURLToPath(new URL("..", import.meta.url));
const loadConfig = require("next/dist/server/config").default;
const { PHASE_DEVELOPMENT_SERVER } = require("next/constants");
const config = await loadConfig(PHASE_DEVELOPMENT_SERVER, source);
assert.equal(typeof config.rewrites, "function", "Frontend must forward /api/* to the backend for signup, signin and Google SSO");

// Exercise the actual Next.js rewrite with a local backend, without accounts or SMS.
const received = [];
const backend = createServer(async (req, res) => {
  let body = "";
  for await (const chunk of req) body += chunk;
  received.push({ url: req.url, method: req.method, origin: req.headers.origin, cookie: req.headers.cookie, body });
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Set-Cookie", ["test-session=one; Path=/; HttpOnly; SameSite=Lax", "test-refresh=two; Path=/; HttpOnly; SameSite=Lax"]);
  if (req.url === "/api/auth/google") {
    res.writeHead(307, { Location: "https://accounts.example.test/authorize?provider=google" });
  } else if (req.url.startsWith("/api/auth/google/callback")) {
    res.writeHead(307, { Location: "/dashboard" });
  } else {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.write(JSON.stringify({ ok: true }));
  }
  res.end();
});
let fixture, server, output = "";
try {
  backend.listen(0, "127.0.0.1");
  await once(backend, "listening");
  fixture = await mkdtemp(join(tmpdir(), "ecoprawn-auth-proxy-"));
  await cp(join(source, "next.config.ts"), join(fixture, "next.config.ts"));
  await writeFile(join(fixture, "package.json"), JSON.stringify({ private: true }));
  await symlink(join(source, "node_modules"), join(fixture, "node_modules"), "junction");
  await mkdir(join(fixture, "pages"));
  await writeFile(join(fixture, "pages", "index.js"), "export default function Page() { return null; }");
  server = spawn(process.execPath, [require.resolve("next/dist/bin/next"), "dev", "-p", "0", "-H", "127.0.0.1"], {
    cwd: fixture,
    env: { ...process.env, BACKEND_URL: `http://127.0.0.1:${backend.address().port}/`, NEXT_TELEMETRY_DISABLED: "1" },
    stdio: ["ignore", "pipe", "pipe"],
  });
  server.stdout.on("data", chunk => { output += chunk; });
  server.stderr.on("data", chunk => { output += chunk; });
  let origin;
  for (let attempt = 0; attempt < 150; attempt++) {
    if (server.exitCode !== null) throw new Error(output);
    origin = output.match(/http:\/\/127\.0\.0\.1:\d+/)?.[0];
    if (origin && output.includes("Ready")) break;
    await setTimeout(200);
  }
  assert.ok(origin && output.includes("Ready"), output);
  for (const action of ["signup", "signin", "verify", "resend", "complete"]) {
    const body = JSON.stringify({ action, test: true });
    const response = await fetch(`${origin}/api/auth/password`, {
      method: "POST", headers: { "Content-Type": "application/json", Origin: origin, Cookie: "test-session=existing" }, body,
      signal: AbortSignal.timeout(15000),
    });
    assert.equal(response.status, 200, `${action} must reach backend`);
    assert.deepEqual(await response.json(), { ok: true });
    assert.equal(response.headers.getSetCookie().length, 2, "Preserve every auth cookie");
    assert.deepEqual(received.at(-1), { url: "/api/auth/password", method: "POST", origin, cookie: "test-session=existing", body });
  }
  for (const [path, location] of [["/api/auth/google", "https://accounts.example.test/authorize?provider=google"], ["/api/auth/google/callback?code=test-code", "/dashboard"]]) {
    const response = await fetch(origin + path, { redirect: "manual", signal: AbortSignal.timeout(15000) });
    assert.equal(response.status, 307, path);
    assert.equal(response.headers.get("location"), location);
    assert.equal(response.headers.getSetCookie().length, 2);
    assert.equal(received.at(-1).url, path, "Keep callback query parameters");
  }
  console.log("Auth proxy passed: signup, signin, verification, Google redirect/callback, request bodies, origins and session cookies.");
} finally {
  if (server && server.exitCode === null) { server.kill(); await once(server, "exit"); }
  backend.closeAllConnections();
  await new Promise(resolve => backend.close(resolve));
  if (fixture) {
    // Remove the junction before recursively removing only this temporary fixture.
    assert.ok(resolve(fixture).startsWith(resolve(tmpdir()) + sep), "Cleanup must stay in the temporary directory");
    await rmdir(join(fixture, "node_modules")).catch(error => { if (error.code !== "ENOENT") throw error; });
    await rm(fixture, { recursive: true, force: true });
  }
}
