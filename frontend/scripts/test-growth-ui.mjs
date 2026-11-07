// Real browser and production frontend with an isolated in-memory API fixture. No live database.
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { setTimeout } from "node:timers/promises";
import { chromium } from "playwright";

const port = 4138, apiPort = 4139;
const sessions = [];
const analysis = { status: "review", reason: null, width: 800, height: 600, lengthMm: 100, areaMm2: 1000, widthMm: 10,
  weightG: null, modelVersion: null, weightReason: "No validated local weight model installed.", path: [[200,300],[600,300]],
  outline: [[200,280],[600,280],[600,320],[200,320]], mmPerPixel: .25, latencyMs: 20, algorithm: "tray-centerline-v1" };
const calibration = { version: "test-v1", setupId: "test-tray", width: 800, height: 600, markerMm: 20,
  cameraMatrix: [[800,0,400],[0,800,300],[0,0,1]], distortion: [0,0,0,0,0] };
const json = (res, data, status = 200) => { res.writeHead(status, { "Content-Type": "application/json" }); res.end(JSON.stringify(data)); };
const api = createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${apiPort}`);
  if (url.pathname === "/api/auth/session") return json(res, { success: true, user: { id: "test", name: "Test operator", role: "operator" } });
  if (url.pathname === "/api/dashboard") return json(res, { success: true,
    tanks: ["a", "b"].map(id => ({ id, name: `Tank ${id.toUpperCase()}`, pl: "Batch", biomass: 0, fcr: 0, targetToday: 0, dispensedToday: 0, telemetries: [], visionScans: [] })),
    waterTrend: [], growthTrend: [], visionScanLog: [], feedSchedule: [], bioflocMetrics: [], effluentLog: [], alertsLog: [], resolvedAlerts: 0 });
  if (url.pathname !== "/api/growth") return json(res, {});
  if (req.method === "GET" && url.searchParams.has("image")) {
    res.writeHead(200, { "Content-Type": "image/svg+xml" });
    return res.end('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><rect width="800" height="600" fill="#10282a"/><ellipse cx="400" cy="300" rx="200" ry="28" fill="#dfc9b2"/><text x="20" y="50" fill="white">Synthetic UI fixture, not a shrimp measurement</text></svg>');
  }
  if (req.method === "GET") return json(res, { sessions: sessions.filter(s => s.tankId === url.searchParams.get("tankId") && (!url.searchParams.get("batch") || s.batch === url.searchParams.get("batch"))).map(s => {
    const specimens = new Map(); for (const m of s.measurements) if (m.status === "approved") specimens.set(m.specimenId, m.correction ?? m.original);
    const values = [...specimens.values()]; return { ...s, summary: { sampleCount: values.length, lengthMm: values.length ? values.reduce((n,a) => n+a.lengthMm, 0)/values.length : null, weightG: null, weightSampleCount: 0 } };
  }), forecast: { enabled: false, reason: "No independently validated forecasting model has been deployed." } });
  const chunks = []; for await (const chunk of req) chunks.push(chunk);
  const body = chunks.length ? JSON.parse(Buffer.concat(chunks)) : {};
  if (req.method === "POST" && body.action === "session") {
    const session = { ...body, id: `s${sessions.length}`, setupId: body.calibration.setupId, invalidatedAt: null, measurements: [] };
    sessions.push(session); return json(res, { session }, 201);
  }
  if (req.method === "POST" && body.action === "upload") {
    const session = sessions.find(s => s.id === body.sessionId);
    const existing = session.measurements.find(m => m.specimenId === body.specimenId);
    if (existing) return json(res, { measurement: existing, duplicate: true });
    const measurement = { id: "m1", specimenId: body.specimenId, capturedAt: body.capturedAt, original: analysis, correction: null, status: "review", manualLengthMm: null, measuredWeightG: null };
    session.measurements.push(measurement); return json(res, { measurement }, 201);
  }
  if (req.method === "PATCH") {
    const measurement = sessions.flatMap(s => s.measurements).find(m => m.id === body.id);
    Object.assign(measurement, body);
    if (body.path) measurement.correction = { ...analysis, path: body.path, lengthMm: body.path.slice(1).reduce((n,p,i) => n+Math.hypot(p[0]-body.path[i][0], p[1]-body.path[i][1]), 0)*.25 };
    return json(res, { measurement });
  }
  return json(res, { success: true });
});
await new Promise(resolve => api.listen(apiPort, "127.0.0.1", resolve));
const server = spawn(process.execPath, ["--no-env-file", ".output/server/index.mjs"], { cwd: process.cwd(), windowsHide: true,
  env: { ...process.env, PORT: String(port), HOST: "127.0.0.1", BACKEND_URL: `http://127.0.0.1:${apiPort}` }, stdio: ["ignore", "pipe", "pipe"] });
let logs = ""; server.stdout.on("data", d => { logs += d; }); server.stderr.on("data", d => { logs += d; });
let browser;
try {
  let ready = false;
  for (let i = 0; i < 60; i++) {
    try { if ((await fetch(`http://127.0.0.1:${port}/api/auth/session`)).ok) { ready = true; break; } } catch {}
    await setTimeout(250);
  }
  assert.ok(ready, logs);
  browser = await chromium.launch({ headless: true, ...(process.env.GROWTH_TEST_BROWSER ? { channel: process.env.GROWTH_TEST_BROWSER } : {}) });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = []; page.on("pageerror", e => errors.push(e.message));
  await page.goto(`http://127.0.0.1:${port}/dashboard/vision`);
  await page.getByRole("heading", { name: "Vision & growth", exact: true }).waitFor();
  await page.getByLabel("Stocking batch", { exact: true }).last().fill("Pilot batch");
  await page.getByLabel("Stocking date", { exact: true }).fill("2026-01-01");
  await page.getByLabel("Camera calibration JSON").setInputFiles({ name: "calibration.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(calibration)) });
  await page.getByRole("button", { name: "Create session for today" }).click();
  await page.getByLabel("Specimen ID", { exact: true }).fill("pilot-1");
  const local = new Date(); const localTime = new Date(local.getTime() - local.getTimezoneOffset()*60000).toISOString().slice(0,16);
  await page.getByLabel("Captured at", { exact: true }).fill(localTime);
  await page.getByLabel("Tray photo", { exact: true }).setInputFiles({ name: "fixture.png", mimeType: "image/png", buffer: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a7X8AAAAASUVORK5CYII=", "base64") });
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Analyze image", exact: true }).click();
  await page.getByRole("heading", { name: "Specimen pilot-1" }).waitFor();
  await page.getByLabel("Independent ruler length, mm").fill("101");
  await page.getByLabel("Independent scale weight, g").fill("12.5");
  await page.getByRole("button", { name: "Approve measurement", exact: true }).click();
  await page.waitForFunction(() => document.querySelector("article")?.textContent?.includes("approved"));
  await page.reload();
  await page.getByRole("heading", { name: "Specimen pilot-1" }).waitFor();
  assert.equal(await page.getByLabel("Independent ruler length, mm").inputValue(), "101");
  await page.getByRole("button", { name: "Redraw centerline" }).click();
  const preview = page.getByRole("img", { name: "Rectified shrimp image with coral outline and green measurement path" });
  const box = await preview.boundingBox();
  await page.mouse.click(box.x+box.width*.3, box.y+box.height*.5);
  await page.mouse.click(box.x+box.width*.7, box.y+box.height*.5);
  await page.getByRole("button", { name: "Approve measurement", exact: true }).click();
  await page.waitForFunction(() => document.querySelector("article")?.textContent?.includes("Corrected paths are saved separately"));
  assert.ok(sessions[0].measurements[0].correction);
  await page.getByRole("combobox").first().selectOption("b");
  await page.getByText("No sessions yet", { exact: true }).waitFor({ state: "attached" });
  assert.equal(await page.getByRole("heading", { name: "Specimen pilot-1" }).count(), 0);
  await page.getByRole("combobox").first().selectOption("a");
  await page.getByRole("heading", { name: "Specimen pilot-1" }).waitFor();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: ".output/growth-mobile.png", fullPage: true });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth+2);
  assert.equal(overflow, false, "Mobile layout must not overflow the viewport");
  assert.deepEqual(errors, [], "No browser runtime errors");
  console.log("Growth UI passed: session creation, upload, labels, approval, correction, reload, tank switching and mobile layout. API was a local fixture.");
} finally {
  await browser?.close(); server.kill(); await new Promise(resolve => api.close(resolve));
}
