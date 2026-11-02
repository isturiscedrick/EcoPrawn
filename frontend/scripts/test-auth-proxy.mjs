import assert from "node:assert/strict";
import { createServer } from "node:http";
import { once } from "node:events";
import { productionApp } from "./test-server.mjs";

// Exercise the production API proxy with a local backend, without accounts or SMS.
const received = [];
const backend = createServer(async (req, res) => {
  let body = "";
  for await (const chunk of req) body += chunk;
  received.push({ url: req.url, method: req.method, origin: req.headers.origin, cookie: req.headers.cookie, body });
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Set-Cookie", ["test-session=one; Path=/; HttpOnly; SameSite=Lax", "test-refresh=two; Path=/; HttpOnly; SameSite=Lax"]);
  if (req.url === "/api/auth/session") {
    if (sessionStatus === -1) { req.socket.destroy(); return; }
    res.writeHead(sessionStatus, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ user: sessionStatus === 200 ? { id: "test" } : null }));
    return;
  } else if (req.url === "/api/auth/google") {
    res.writeHead(307, { Location: "https://accounts.example.test/authorize?provider=google" });
  } else if (req.url.startsWith("/api/auth/google/callback")) {
    res.writeHead(307, { Location: "/dashboard" });
  } else if (req.url === "/api/test-failure") {
    res.writeHead(422, { "Content-Type": "application/json" });
    res.write(JSON.stringify({ error: "Invalid input" }));
  } else {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.write(JSON.stringify({ ok: true }));
  }
  res.end();
});
let app;
let sessionStatus = 200;
try {
  backend.listen(0, "127.0.0.1");
  await once(backend, "listening");
  app = await productionApp(`http://127.0.0.1:${backend.address().port}/`);
  const { origin } = app;
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
  for (const method of ["GET", "PATCH", "DELETE"]) {
    const body = method === "PATCH" ? JSON.stringify({ name: "test" }) : undefined;
    const response = await fetch(origin + "/api/tanks/test?check=one", { method, body, headers: { Origin: origin, Cookie: "test-session=existing", "Content-Type": "application/json" } });
    assert.equal(response.status, 200);
    assert.equal(received.at(-1).method, method);
    assert.equal(received.at(-1).url, "/api/tanks/test?check=one");
    assert.equal(received.at(-1).body, body || "");
  }
  const invalid = await fetch(origin + "/api/test-failure");
  assert.equal(invalid.status, 422);
  assert.deepEqual(await invalid.json(), { error: "Invalid input" });
  for (const status of [401, 500]) {
    sessionStatus = status;
    const response = await fetch(origin + "/dashboard/water", { redirect: "manual", headers: { Cookie: "test-session=existing" } });
    assert.equal(response.status, status === 401 ? 307 : 503);
    if (status === 401) assert.equal(new URL(response.headers.get("location"), origin).pathname, "/login");
    assert.match(response.headers.get("cache-control"), /no-store/);
    assert.equal(response.headers.getSetCookie().length, 2);
    assert.equal(received.at(-1).cookie, "test-session=existing");
  }
  sessionStatus = -1;
  const unreachable = await fetch(origin + "/dashboard", { redirect: "manual" });
  assert.equal(unreachable.status, 503);
  assert.match(unreachable.headers.get("cache-control"), /no-store/);
  console.log("Auth proxy passed: signup, signin, verification, Google redirect/callback, request bodies, origins and session cookies.");
} finally {
  await app?.close();
  backend.closeAllConnections();
  await new Promise(resolve => backend.close(resolve));
}
