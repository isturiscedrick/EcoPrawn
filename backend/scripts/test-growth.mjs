import assert from "node:assert/strict";
import { readFile, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import * as crypto from "node:crypto";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import ts from "typescript";

function compile(source, imports = {}) {
  const module = { exports: {} };
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } });
  new Function("require", "module", "exports", outputText)(name => { assert.ok(name in imports, name); return imports[name]; }, module, module.exports);
  return module.exports;
}
const source = name => readFile(new URL(`../src/${name}.ts`, import.meta.url), "utf8");
const validation = compile(await source("lib/api-validation"));
const growth = compile(await source("lib/growth"), { "./api-validation": validation });
const storage = compile(await source("lib/growth-storage"), { "node:fs/promises": fs, "node:path": path, "node:crypto": crypto });
const calibration = { version: "v1", setupId: "tray", width: 800, height: 600, markerMm: 20, cameraMatrix: [[800,0,400],[0,800,300],[0,0,1]], distortion: [0,0,0,0,0] };
assert.equal(growth.validCalibration(calibration), true);
assert.equal(growth.validCalibration({ ...calibration, markerMm: "20" }), false);
const analysis = { status: "review", reason: null, width: 800, height: 600, lengthMm: 100, areaMm2: 1000, widthMm: 10, weightG: null, modelVersion: null, weightReason: "No model", latencyMs: 10, path: [[1,1],[101,1]], outline: [], mmPerPixel: 1, algorithm: "tray-centerline-v1" };
assert.equal(growth.validAnalysis(analysis), true);
assert.equal(growth.validAnalysis({ ...analysis, lengthMm: NaN }), false);
assert.equal(growth.pathLength([[0,0],[3,4],[6,8]], 2), 20);
const summary = growth.summarize([
  { specimenId: "one", status: "approved", original: analysis, correction: null, capturedAt: new Date(0) },
  { specimenId: "one", status: "approved", original: { ...analysis, lengthMm: 120 }, correction: null, capturedAt: new Date(1) },
  { specimenId: "two", status: "review", original: analysis, correction: null, capturedAt: new Date(2) },
]);
assert.deepEqual(summary, { sampleCount: 1, lengthMm: 120, weightG: null, weightSampleCount: 0 });

const directory = await mkdtemp(join(tmpdir(), "ecoprawn-growth-"));
process.env.GROWTH_STORAGE_DIR = directory;
process.env.GROWTH_STORAGE_MAX_BYTES = "100";
try {
  const key = await storage.storeImages(Buffer.alloc(20), Buffer.alloc(30));
  assert.equal((await storage.loadImage(key)).length, 30);
  await assert.rejects(storage.storeImages(Buffer.alloc(60), Buffer.alloc(20)), /full/);
  await assert.rejects(async () => storage.loadImage("../escape"), /Invalid/);
  await storage.deleteImages(key);
  await storage.deleteImages(key); // Retrying an interrupted deletion is safe.
  await assert.rejects(storage.limitedJson(new Request("http://test", { method: "POST", body: "x".repeat(40) }), 20), /size/);
} finally {
  assert.equal(path.dirname(path.resolve(directory)), path.resolve(tmpdir()));
  assert.ok(path.basename(directory).startsWith("ecoprawn-growth-"));
  await rm(directory, { recursive: true, force: true });
}

let identity = { id: "owner-a" }, writes = 0, stored = 0;
const session = { id: "s1", tankId: "tank-a", setupId: "tray", sampledAt: new Date(), stockedAt: new Date(0), calibration, invalidatedAt: null };
let measurement = null;
const owned = where => identity?.id === "owner-a" && (where.tank?.userId === "owner-a" || where.session?.tank?.userId === "owner-a");
const prisma = {
  tank: { findFirst: async ({ where }) => where.id === "tank-a" && where.userId === "owner-a" ? { id: "tank-a" } : null },
  growthSession: {
    findFirst: async ({ where }) => owned(where) && where.id === "s1" ? { ...session, _count: { measurements: measurement ? 1 : 0 } } : null,
    findMany: async ({ where }) => where.tankId === "tank-a" ? [{ ...session, measurements: measurement ? [measurement] : [] }] : [],
    create: async ({ data }) => { writes++; return { id: "new", ...data }; },
    update: async ({ data }) => { Object.assign(session, data); return session; },
    updateMany: async ({ where, data }) => { assert.equal(where.tank.userId, "owner-a"); Object.assign(session, data); return { count: 1 }; },
    delete: async () => session,
  },
  growthMeasurement: {
    findUnique: async () => measurement,
    findFirst: async ({ where }) => owned(where) && measurement && where.id === measurement.id ? measurement : null,
    create: async ({ data }) => { writes++; return measurement = { id: "m1", correction: null, ...data }; },
    update: async ({ data }) => { writes++; Object.assign(measurement, data); return measurement; },
    delete: async () => { measurement = null; },
  },
};
const route = compile(await source("handlers/growth"), {
  "node:crypto": crypto, "@prisma/client": { Prisma: { DbNull: null } },
  "@/lib/auth": { accountAccess: async () => identity ?? new Response(null, { status: 401 }) },
  "@/lib/prisma": { __esModule: true, default: prisma }, "@/lib/api-validation": validation, "@/lib/growth": growth,
  "@/lib/growth-storage": { ...storage, storeImages: async () => { stored++; return "key"; }, deleteImages: async () => { stored--; }, loadImage: async () => Buffer.alloc(1) },
});
const request = (body, method = "POST", query = "") => new Request("http://localhost/api/growth" + query, { method, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
const upload = { action: "upload", sessionId: "s1", specimenId: "animal-1", capturedAt: new Date().toISOString(), setupId: "tray", setupConfirmed: true, image: Buffer.alloc(100, 1).toString("base64") };
const oldFetch = globalThis.fetch;
process.env.GROWTH_AI_KEY = "test-only-service-key-123456789";
globalThis.fetch = async () => Response.json({ analysis, preview: Buffer.alloc(10).toString("base64") });
try {
  identity = null;
  for (const method of ["GET", "POST", "PATCH", "DELETE"]) assert.equal((await route[method](request(undefined, method))).status, 401);
  identity = { id: "owner-b" };
  assert.equal((await route.POST(request({ action: "session", tankId: "tank-a", batch: "b", sampledAt: new Date().toISOString(), stockedAt: new Date(0).toISOString(), calibration }))).status, 404);
  assert.equal((await route.DELETE(request(undefined, "DELETE", "?sessionId=s1"))).status, 404);
  assert.equal((await route.POST(request(upload))).status, 404);
  assert.equal((await route.GET(request(undefined, "GET", "?tankId=tank-a"))).status, 404);
  identity = { id: "owner-a" };
  assert.equal((await route.POST(new Request("http://localhost/api/growth", { method: "POST", body: "{bad" }))).status, 400);
  assert.equal((await route.POST(request({ action: "session", tankId: "tank-a", batch: "b", sampledAt: new Date().toISOString(), stockedAt: new Date(0).toISOString(), calibration }))).status, 201);
  assert.equal((await route.POST(request({ ...upload, setupConfirmed: false }))).status, 400);
  assert.equal((await route.POST(request(upload))).status, 201);
  assert.equal(stored, 1);
  assert.equal((await route.DELETE(request(undefined, "DELETE", "?sessionId=s1"))).status, 409);
  assert.equal((await route.POST(request(upload))).status, 200);
  assert.equal(stored, 1, "Duplicate must not consume storage");
  const review = { id: "m1", status: "approved", path: [[0,0],[3,4]], manualLengthMm: 5, measuredWeightG: 2 };
  identity = { id: "owner-b" };
  assert.equal((await route.PATCH(request(review, "PATCH"))).status, 404);
  assert.equal((await route.GET(request(undefined, "GET", "?image=m1"))).status, 404);
  assert.equal((await route.DELETE(request(undefined, "DELETE", "?id=m1"))).status, 404);
  identity = { id: "owner-a" };
  assert.equal((await route.PATCH(request(review, "PATCH"))).status, 200);
  assert.equal(measurement.original.lengthMm, 100);
  assert.equal(measurement.correction.lengthMm, 5);
  assert.equal(measurement.correction.weightG, null);
  assert.equal((await route.PATCH(request({ id: "m1", status: "approved", manualLengthMm: 6, measuredWeightG: 3 }, "PATCH"))).status, 200);
  assert.equal(measurement.correction.lengthMm, 5, "Label updates without a path must preserve corrections");
  assert.equal((await route.PATCH(request({ ...review, path: [[-1,0],[1,1]] }, "PATCH"))).status, 400);
  assert.equal((await route.DELETE(request(undefined, "DELETE", "?id=m1"))).status, 200);
  globalThis.fetch = async () => { throw new Error("timeout"); };
  assert.equal((await route.POST(request(upload))).status, 503);
  assert.equal(stored, 0);
  await route.POST(request({ action: "invalidate", sessionId: "s1" }));
  assert.equal((await route.POST(request(upload))).status, 400);
  assert.equal((await route.DELETE(request(undefined, "DELETE", "?sessionId=s1"))).status, 200);
} finally { globalThis.fetch = oldFetch; }
console.log("Growth tests passed: validation, account isolation, correction provenance, deduplication, storage cap, timeout and calibration invalidation.");
