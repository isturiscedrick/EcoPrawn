import assert from "node:assert/strict";
import { execFileSync, spawn } from "node:child_process";
import { once } from "node:events";
import { cp, mkdtemp, realpath, rm, rmdir, symlink } from "node:fs/promises";
import { createServer } from "node:http";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { setTimeout } from "node:timers/promises";

// Test the real production router and middleware with a slow local auth service.
// Use an installed Playwright, or point PLAYWRIGHT_MODULE_PATH at a shared copy.
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || "playwright");
const source = fileURLToPath(new URL("..", import.meta.url));
const nextBin = require.resolve("next/dist/bin/next");
const data = { success: true, tanks: [], waterTrend: [], growthTrend: [], visionScanLog: [],
  feedSchedule: [], bioflocMetrics: [], effluentLog: [], alertsLog: [], resolvedAlerts: 0 };
let authenticated = true, sessionChecks = 0, unexpectedRequests = 0;
const backend = createServer(async (request, response) => {
  response.setHeader("Content-Type", "application/json");
  if (request.url === "/api/auth/session") {
    sessionChecks++;
    await setTimeout(1200);
    response.statusCode = authenticated ? 200 : 401;
    response.end(JSON.stringify({ user: authenticated ? { id: "test-account" } : null }));
  } else if (request.url === "/api/dashboard" && request.method === "GET") {
    response.end(JSON.stringify(data));
  } else if (request.url === "/api/demo" && request.method === "GET") {
    response.end(JSON.stringify({ heroReadouts: [], feedSchedule: [], tankFormDefaults: { pl: "TEST" } }));
  } else {
    unexpectedRequests++;
    response.statusCode = 404;
    response.end("{}");
  }
});

let fixture, app, browser;
let serverOutput = "";
try {
  backend.listen(0, "127.0.0.1");
  await once(backend, "listening");
  const backendUrl = `http://127.0.0.1:${backend.address().port}`;
  // Build outside OneDrive so filesystem locks do not affect the measurement.
  fixture = await mkdtemp(join(tmpdir(), "ecoprawn-navigation-"));
  for (const entry of ["src", "public", "package.json", "tsconfig.json", "next.config.ts", "postcss.config.mjs", "next-env.d.ts"]) {
    await cp(join(source, entry), join(fixture, entry), { recursive: true });
  }
  await symlink(join(source, "node_modules"), join(fixture, "node_modules"), "junction");
  const env = { ...process.env, BACKEND_URL: backendUrl, NEXT_TELEMETRY_DISABLED: "1" };
  console.log("Building an isolated production fixture. Auth responses will take 1,200 ms; no live backend is used.");
  execFileSync(process.execPath, [nextBin, "build"], { cwd: fixture, env, timeout: 120000, maxBuffer: 5_000_000 });
  app = spawn(process.execPath, [nextBin, "start", "-p", "0", "-H", "127.0.0.1"], {
    cwd: fixture, env, stdio: ["ignore", "pipe", "pipe"],
  });
  app.stdout.on("data", chunk => { serverOutput += chunk; });
  app.stderr.on("data", chunk => { serverOutput += chunk; });
  let origin;
  for (let attempt = 0; attempt < 100; attempt++) {
    origin = serverOutput.match(/http:\/\/127\.0\.0\.1:\d+/)?.[0];
    if (origin) break;
    if (app.exitCode !== null) throw new Error(serverOutput);
    await setTimeout(100);
  }
  assert.ok(origin, "Production server did not start");
  browser = await chromium.launch({ ...(process.env.BROWSER_CHANNEL ? { channel: process.env.BROWSER_CHANNEL } : {}), headless: true });
  const errors = [];
  const warm = await browser.newPage();
  warm.on("pageerror", error => errors.push(error.message));
  let tankPrefetched = false;
  warm.on("response", response => {
    const url = new URL(response.url());
    if (url.pathname === "/dashboard/tanks" && url.searchParams.has("_rsc") && response.ok()) tankPrefetched = true;
  });
  await warm.goto(`${origin}/dashboard`);
  await warm.getByRole("heading", { name: "Tank Overview", exact: true }).waitFor();
  for (let attempt = 0; attempt < 60 && !tankPrefetched; attempt++) await setTimeout(100);
  const tankPrefetchedBeforeClick = tankPrefetched;
  await warm.locator("aside").getByText("Tanks", { exact: true }).evaluate(element => {
    element.closest("a,button").addEventListener("click", () => { window.__navStart = performance.now(); }, { once: true });
  });
  await warm.locator("aside").getByText("Tanks", { exact: true }).click();
  await warm.getByRole("heading", { name: "Tanks", exact: true }).waitFor();
  const warmMs = Math.round(await warm.evaluate(() => performance.now() - window.__navStart));

  // Prevent prefetching in a fresh context to test a cold click on a slow network.
  const cold = await browser.newPage();
  cold.on("pageerror", error => errors.push(error.message));
  await cold.route("**/*", route => {
    if (route.request().headers()["next-router-prefetch"] === "1") return route.abort();
    return route.continue();
  });
  await cold.goto(`${origin}/dashboard`);
  await cold.getByRole("heading", { name: "Tank Overview", exact: true }).waitFor();
  await cold.locator("aside").getByText("Water Quality", { exact: true }).evaluate(element => {
    const observer = new MutationObserver(() => {
      if (document.querySelector('[aria-label="Opening Water Quality"]') && !window.__feedbackScheduled) {
        window.__feedbackScheduled = true;
        requestAnimationFrame(() => requestAnimationFrame(() => { window.__feedbackMs = performance.now() - window.__navStart; }));
      }
    });
    observer.observe(document.body, { subtree: true, childList: true, attributes: true });
    element.closest("a,button").addEventListener("click", () => { window.__navStart = performance.now(); }, { once: true });
  });
  await cold.locator("aside").getByText("Water Quality", { exact: true }).click();
  await cold.getByRole("heading", { name: "Water Quality Monitoring", exact: true }).waitFor();
  const coldMetrics = await cold.evaluate(() => ({
    completeMs: Math.round(performance.now() - window.__navStart),
    feedbackMs: window.__feedbackMs === undefined ? null : Math.round(window.__feedbackMs),
  }));
  await cold.getByRole("status", { name: "Opening Water Quality" }).waitFor({ state: "detached" });
  assert.match(await cold.locator('aside [aria-current="page"]').innerText(), /Water Quality/);
  authenticated = false;
  const denied = await browser.newPage();
  await denied.goto(`${origin}/dashboard/water`);
  assert.equal(new URL(denied.url()).pathname, "/login", "Middleware must still reject expired sessions");

  console.log(JSON.stringify({ sessionDelayMs: 1200, tankPrefetchedBeforeClick, warmNavigationMs: warmMs,
    coldNavigationMs: coldMetrics.completeMs, coldFeedbackMs: coldMetrics.feedbackMs, sessionChecks, errors }, null, 2));
  assert.deepEqual(errors, []);
  assert.equal(unexpectedRequests, 0, "Only mocked read requests are allowed");
  assert.ok(tankPrefetchedBeforeClick, "Sidebar routes must prefetch before the click");
  assert.ok(warmMs < 300, `Prefetched navigation took ${warmMs} ms`);
  assert.ok(coldMetrics.feedbackMs !== null && coldMetrics.feedbackMs < 200, "Cold navigation must show feedback within 200 ms");
  console.log("Navigation regression passed: prefetched route changes, immediate cold-click feedback, and expired-session rejection.");
} catch (error) {
  if (error.stdout) console.error(error.stdout.toString());
  if (error.stderr) console.error(error.stderr.toString());
  throw error;
} finally {
  if (browser) await browser.close();
  if (app && app.exitCode === null) {
    const stopped = once(app, "exit");
    app.kill();
    await stopped;
  }
  await new Promise(resolve => backend.close(resolve));
  if (fixture) {
    assert.equal(await realpath(dirname(fixture)), await realpath(tmpdir()));
    assert.ok(basename(fixture).startsWith("ecoprawn-navigation-"), "Unexpected cleanup target");
    // Remove only the dependency junction before deleting our temporary copy.
    await rmdir(join(fixture, "node_modules"));
    await rm(fixture, { recursive: true, force: true });
  }
}
