import { createHash } from "node:crypto";
import { Prisma } from "@prisma/client";
import { accountAccess } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { isRecord, validLabel, validNumber, validTankId } from "@/lib/api-validation";
import { validCalibration, validAnalysis, validPoints, pathLength, summarize } from "@/lib/growth";
import { storeImages, loadImage, deleteImages, limitedJson } from "@/lib/growth-storage";

const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "private, no-store" } });
const fail = (error: string, status = 400) => json({ error }, status);
const date = (v: unknown): v is string => typeof v === "string" && /^\d{4}-\d\d-\d\dT/.test(v) && Number.isFinite(Date.parse(v));
const dbJson = (v: unknown) => JSON.parse(JSON.stringify(v)) as Prisma.InputJsonValue;
let analyzing = false;

export async function GET(request: Request) {
  const account = await accountAccess({ write: false });
  if (account instanceof Response) return account;
  const q = new URL(request.url).searchParams;
  try {
    if (q.has("image")) {
      const row = await prisma.growthMeasurement.findFirst({ where: { id: q.get("image")!, session: { tank: { userId: account.id } } } });
      if (!row) return fail("Image not found", 404);
      return new Response(new Uint8Array(await loadImage(row.imageKey, q.get("raw") !== "1")), {
        headers: { "Content-Type": q.get("raw") === "1" ? "application/octet-stream" : "image/png", "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" },
      });
    }
    const tankId = q.get("tankId");
    if (!validTankId(tankId)) return fail("Choose a tank");
    const tank = await prisma.tank.findFirst({ where: { id: tankId, userId: account.id }, select: { id: true } });
    if (!tank) return fail("Tank not found", 404);
    const sessions = await prisma.growthSession.findMany({
      where: { tankId, ...(q.get("batch") ? { batch: q.get("batch")! } : {}) },
      include: { measurements: { orderBy: { capturedAt: "asc" } } }, orderBy: { sampledAt: "asc" },
    });
    let forecast: unknown = { enabled: false, reason: "No independently validated forecasting model has been deployed." };
    if (q.get("batch") && process.env.GROWTH_AI_KEY && process.env.GROWTH_FORECAST_ENABLED === "true") {
      try {
        const observations = sessions.map(s => {
          const specimens = new Map<string, number>();
          for (const m of s.measurements) if (m.status === "approved" && m.measuredWeightG !== null) specimens.set(m.specimenId, m.measuredWeightG);
          const weights = [...specimens.values()];
          return { sampledAt: s.sampledAt, stockedAt: s.stockedAt, measuredWeightG: weights.length ? weights.reduce((a,b) => a+b, 0) / weights.length : null };
        });
        const response = await fetch(`${process.env.GROWTH_AI_URL || "http://127.0.0.1:8010"}/forecast`, {
          method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.GROWTH_AI_KEY}` },
          body: JSON.stringify({ sessions: observations }), signal: AbortSignal.timeout(3000),
        });
        const result = await limitedJson(response, 32000);
        if (response.ok && isRecord(result) && (result.enabled === false || (result.enabled === true &&
            validNumber(result.weightG, 0.001, 10000) && date(result.forecastDate) &&
            validNumber(result.validationMaeG, 0) && typeof result.modelVersion === "string"))) forecast = result;
      } catch { forecast = { enabled: false, reason: "Forecast service unavailable." }; }
    }
    return json({ sessions: sessions.map(s => ({ ...s, summary: summarize(s.measurements) })), forecast });
  } catch { return fail("Unable to load growth records or image", 503); }
}

export async function POST(request: Request) {
  const account = await accountAccess({ write: true });
  if (account instanceof Response) return account;
  let body: unknown;
  try { body = await limitedJson(request); } catch (error) {
    return error instanceof Error && error.message.includes("size limit")
      ? fail("Upload exceeds 12 MB", 413) : fail("Invalid JSON", 400);
  }
  if (!isRecord(body)) return fail("Invalid request");
  try {
    if (body.action === "session") {
      if (!validTankId(body.tankId) || !validLabel(body.batch) || !date(body.sampledAt) || !date(body.stockedAt) ||
          Date.parse(body.stockedAt) > Date.parse(body.sampledAt) || Date.parse(body.sampledAt) > Date.now() + 60000 ||
          !validCalibration(body.calibration)) return fail("Provide tank, batch, dates and a valid calibration file");
      const tank = await prisma.tank.findFirst({ where: { id: body.tankId, userId: account.id }, select: { id: true } });
      if (!tank) return fail("Tank not found", 404);
      const batch = await prisma.growthSession.findFirst({ where: { tankId: tank.id, batch: body.batch }, select: { stockedAt: true } });
      if (batch && batch.stockedAt.getTime() !== Date.parse(body.stockedAt)) return fail("Use the original stocking date for this batch");
      const invalidProfile = await prisma.growthSession.findFirst({ where: { tank: { userId: account.id },
        setupId: body.calibration.setupId, calibration: { path: ["version"], equals: body.calibration.version }, invalidatedAt: { not: null } }, select: { id: true } });
      if (invalidProfile) return fail("This calibration profile was invalidated. Upload a newly calibrated version.");
      const session = await prisma.growthSession.create({ data: { tankId: tank.id, batch: body.batch,
        sampledAt: new Date(body.sampledAt), stockedAt: new Date(body.stockedAt),
        setupId: body.calibration.setupId, calibration: dbJson(body.calibration) } });
      return json({ session }, 201);
    }
    if (!validTankId(body.sessionId)) return fail("Choose a session");
    const session = await prisma.growthSession.findFirst({ where: { id: body.sessionId, tank: { userId: account.id } } });
    if (!session) return fail("Session not found", 404);
    if (body.action === "invalidate") {
      const calibration: unknown = session.calibration;
      if (!validCalibration(calibration)) return fail("Invalid stored calibration", 409);
      await prisma.growthSession.updateMany({ where: { tank: { userId: account.id }, setupId: session.setupId,
        calibration: { path: ["version"], equals: calibration.version } }, data: { invalidatedAt: new Date() } });
      return json({ success: true });
    }
    if (body.action !== "upload" || session.invalidatedAt) return fail("Create a new calibrated session after changing the setup");
    if (!validLabel(body.specimenId) || !date(body.capturedAt) || Date.parse(body.capturedAt) > Date.now() + 60000 ||
        Math.abs(Date.parse(body.capturedAt) - session.sampledAt.getTime()) > 86400000 ||
        body.setupId !== session.setupId || body.setupConfirmed !== true ||
        typeof body.image !== "string" || !/^[A-Za-z0-9+/]+={0,2}$/.test(body.image)) return fail("Provide specimen, capture time, image and confirm the unchanged camera setup");
    const raw = Buffer.from(body.image, "base64");
    if (raw.length > 8 * 1024 * 1024 || raw.length < 32) return fail("Image must be between 32 bytes and 8 MB", 413);
    const imageHash = createHash("sha256").update(raw).digest("hex");
    const existing = await prisma.growthMeasurement.findUnique({ where: { sessionId_imageHash: { sessionId: session.id, imageHash } } });
    if (existing) return json({ measurement: existing, duplicate: true });
    if (analyzing) return fail("Analysis busy; retry shortly", 503);
    const key = process.env.GROWTH_AI_KEY;
    if (!key) return fail("Configure the local AI service before uploading", 503);
    analyzing = true;
    try {
      const response = await fetch(`${process.env.GROWTH_AI_URL || "http://127.0.0.1:8010"}/analyze`, {
        method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${key}` },
        body: JSON.stringify({ image: body.image, calibration: session.calibration }), signal: AbortSignal.timeout(11000),
      });
      const result = await limitedJson(response, 24 * 1024 * 1024);
      if (!response.ok || !isRecord(result) || !validAnalysis(result.analysis) || typeof result.preview !== "string")
        return fail("Analysis could not decode the image or returned an invalid result", 422);
      const imageKey = await storeImages(raw, Buffer.from(result.preview, "base64"));
      try {
        const measurement = await prisma.growthMeasurement.create({ data: { sessionId: session.id, specimenId: body.specimenId,
          capturedAt: new Date(body.capturedAt), imageHash, imageKey, status: result.analysis.status, original: dbJson(result.analysis) } });
        return json({ measurement }, 201);
      } catch (error) { await deleteImages(imageKey); throw error; }
    } finally { analyzing = false; }
  } catch (error) {
    console.error("Growth upload failed", error instanceof Error ? error.name : "unknown");
    return fail("Unable to save analysis. Check the AI service, database and available image storage, then retry.", 503);
  }
}

export async function PATCH(request: Request) {
  const account = await accountAccess({ write: true });
  if (account instanceof Response) return account;
  const body = await limitedJson(request, 128000).catch(() => null);
  if (!isRecord(body) || !validTankId(body.id) || !["approved", "review", "rejected"].includes(String(body.status))) return fail("Invalid review");
  if (![body.manualLengthMm, body.measuredWeightG].every(v => v === null || validNumber(v, 0.001, 10000))) return fail("Enter positive independent length and weight labels, or leave them empty");
  try {
    const row = await prisma.growthMeasurement.findFirst({ where: { id: body.id, session: { tank: { userId: account.id } } } });
    if (!row) return fail("Measurement not found", 404);
    const original: unknown = row.original;
    if (!validAnalysis(original)) return fail("Invalid stored analysis", 409);
    let correction: Prisma.InputJsonValue | typeof Prisma.DbNull = body.path === undefined && row.correction !== null
      ? dbJson(row.correction) : Prisma.DbNull;
    if (body.path !== null && body.path !== undefined) {
      if (original.status !== "review" || original.mmPerPixel === null || !validPoints(body.path, original.width, original.height) || body.path.length < 2)
        return fail("Cannot correct this image; recapture with a valid reference");
      const lengthMm = pathLength(body.path, original.mmPerPixel);
      if (!validNumber(lengthMm, 0.1, 1000)) return fail("Invalid corrected path");
      correction = dbJson({ ...original, path: body.path, lengthMm, weightG: null,
        modelVersion: null, weightReason: "Corrected length requires separately validated weight estimation." });
    }
    if (body.status === "approved" && original.status !== "review") return fail("Rejected analyses must be recaptured");
    const measurement = await prisma.growthMeasurement.update({ where: { id: row.id }, data: {
      status: body.status as string, correction, manualLengthMm: body.manualLengthMm as number | null,
      measuredWeightG: body.measuredWeightG as number | null, approvedAt: body.status === "approved" ? new Date() : null,
    } });
    return json({ measurement });
  } catch { return fail("Unable to save review", 503); }
}

export async function DELETE(request: Request) {
  const account = await accountAccess({ write: true });
  if (account instanceof Response) return account;
  const query = new URL(request.url).searchParams;
  const id = query.get("id") ?? query.get("sessionId");
  if (!validTankId(id)) return fail("Choose a measurement");
  try {
    if (query.has("sessionId")) {
      const session = await prisma.growthSession.findFirst({ where: { id, tank: { userId: account.id } }, include: { _count: { select: { measurements: true } } } });
      if (!session) return fail("Session not found", 404);
      if (session._count.measurements) return fail("Delete the session's images before deleting the session", 409);
      await prisma.growthSession.delete({ where: { id: session.id } });
      return json({ success: true });
    }
    const row = await prisma.growthMeasurement.findFirst({ where: { id, session: { tank: { userId: account.id } } } });
    if (!row) return fail("Measurement not found", 404);
    await deleteImages(row.imageKey);
    await prisma.growthMeasurement.delete({ where: { id } });
    return json({ success: true });
  } catch { return fail("Unable to delete image; retry", 503); }
}
