import assert from "node:assert/strict";
import { once } from "node:events";
import { createServer } from "node:http";
import { createRequire } from "node:module";
import { setTimeout } from "node:timers/promises";
import { productionApp } from "./test-server.mjs";
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || "playwright");
const data = { success: true, tanks: [], tankActivity: [], waterTrend: [], growthTrend: [], visionScanLog: [],
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
    response.statusCode = authenticated ? 200 : 401;
    response.end(JSON.stringify(authenticated ? data : { error: "Sign in required" }));
  } else if (request.url === "/api/demo" && request.method === "GET") {
    response.end(JSON.stringify({ heroReadouts: [], feedSchedule: [], tankFormDefaults: { pl: "TEST" } }));
  } else {
    unexpectedRequests++;
    response.statusCode = 404;
    response.end("{}");
  }
});

let app, browser;
try {
  backend.listen(0, "127.0.0.1");
  await once(backend, "listening");
  const backendUrl = `http://127.0.0.1:${backend.address().port}`;
  app = await productionApp(backendUrl);
  const { origin } = app;
  browser = await chromium.launch({ ...(process.env.BROWSER_CHANNEL ? { channel: process.env.BROWSER_CHANNEL } : {}), headless: true });
  const errors = [];
  const warm = await browser.newPage();
  warm.on("pageerror", error => errors.push(error.message));
  await warm.goto(`${origin}/dashboard`);
  await warm.getByRole("heading", { name: "Tank Overview", exact: true }).waitFor();
  await warm.locator("aside").evaluate(el => { el.dataset.persistenceProbe = "mounted"; });
  await warm.locator("aside").getByText("Tanks", { exact: true }).hover();
  await warm.waitForLoadState("networkidle");
  await warm.locator("aside").getByText("Tanks", { exact: true }).evaluate(element => {
    element.closest("a,button").addEventListener("click", () => { window.__navStart = performance.now(); }, { once: true });
  });
  await warm.locator("aside").getByText("Tanks", { exact: true }).click();
  await warm.getByRole("heading", { name: "Tanks", exact: true }).waitFor();
  assert.equal(await warm.locator("aside").getAttribute("data-persistence-probe"), "mounted", "Dashboard layout must persist during navigation");
  const warmMs = Math.round(await warm.evaluate(() => performance.now() - window.__navStart));

  // A fresh page navigates before its slow session preloads can complete.
  const cold = await browser.newPage();
  cold.on("pageerror", error => errors.push(error.message));
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
  for (const path of ["/", "/about", "/contact", "/login", "/dashboard", ...["activity", "alerts", "biofloc", "feeding", "profile", "tanks", "vision", "water"].map(p => "/dashboard/" + p)]) {
    const response = await fetch(origin + path);
    assert.equal(response.status, 200, `Direct load ${path}`);
    const html = await response.text();
    assert.match(html, /<html/);
    assert.match(html, /EcoPrawn/);
  }
  authenticated = false;
  await warm.bringToFront();
  await warm.waitForURL("**/login?error=expired", { timeout: 15000 });
  const denied = await browser.newPage();
  await denied.goto(`${origin}/dashboard/water`);
  assert.equal(new URL(denied.url()).pathname, "/login", "Middleware must still reject expired sessions");

  console.log(JSON.stringify({ sessionDelayMs: 1200, warmNavigationMs: warmMs,
    coldNavigationMs: coldMetrics.completeMs, coldFeedbackMs: coldMetrics.feedbackMs, sessionChecks, errors }, null, 2));
  assert.deepEqual(errors, []);
  assert.equal(unexpectedRequests, 0, "Only mocked read requests are allowed");
  assert.ok(warmMs < 300, `Prefetched navigation took ${warmMs} ms`);
  assert.ok(coldMetrics.feedbackMs !== null && coldMetrics.feedbackMs < 200, "Cold navigation must show feedback within 200 ms");
  console.log("Navigation regression passed: prefetched route changes, immediate cold-click feedback, and expired-session rejection.");
} catch (error) {
  if (error.stdout) console.error(error.stdout.toString());
  if (error.stderr) console.error(error.stderr.toString());
  throw error;
} finally {
  if (browser) await browser.close();
  await app?.close();
  backend.closeAllConnections();
  await new Promise(resolve => backend.close(resolve));
}
