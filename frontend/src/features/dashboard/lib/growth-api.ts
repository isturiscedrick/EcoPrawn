export type Point = [number, number];
export interface Analysis {
  status: "review" | "rejected"; reason: string | null; width: number; height: number;
  lengthMm: number | null; areaMm2: number | null; widthMm: number | null;
  weightG: number | null; modelVersion: string | null; weightReason: string | null;
  path: Point[]; outline: Point[]; mmPerPixel: number | null; latencyMs: number; algorithm: string;
}
export interface Measurement {
  id: string; specimenId: string; capturedAt: string; status: string;
  original: Analysis; correction: Analysis | null; manualLengthMm: number | null; measuredWeightG: number | null;
}
export interface Session {
  id: string; tankId: string; batch: string; sampledAt: string; stockedAt: string; setupId: string;
  calibration: { version: string }; invalidatedAt: string | null; measurements: Measurement[];
  summary: { sampleCount: number; lengthMm: number | null; weightG: number | null; weightSampleCount: number };
}
export async function growthRequest(method: string, body?: unknown, query = "", signal?: AbortSignal) {
  const response = await fetch(`/api/growth${query}`, { method, signal, cache: "no-store",
    ...(body === undefined ? {} : { headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }) });
  const result = await response.json().catch(() => null);
  if (!response.ok) throw new Error(result?.error || "Growth service unavailable. Please retry.");
  return result;
}
export function parseSessions(value: unknown): Session[] {
  if (!value || typeof value !== "object" || !("sessions" in value) || !Array.isArray(value.sessions))
    throw new Error("Invalid growth response");
  const nullableNumber = (v: unknown) => v === null || (typeof v === "number" && Number.isFinite(v) && v >= 0);
  for (const s of value.sessions) {
    if (!s || typeof s.id !== "string" || typeof s.tankId !== "string" || typeof s.batch !== "string" || typeof s.setupId !== "string" ||
        !Number.isFinite(Date.parse(s.sampledAt)) || !s.summary || !Array.isArray(s.measurements) ||
        !s.calibration || typeof s.calibration.version !== "string" || !Number.isFinite(Date.parse(s.stockedAt)) ||
        ![s.summary.sampleCount, s.summary.weightSampleCount].every(n => Number.isInteger(n) && n >= 0) ||
        ![s.summary.lengthMm, s.summary.weightG].every(nullableNumber)) throw new Error("Invalid sampling session");
    for (const m of s.measurements) {
      if (!m || typeof m.id !== "string" || typeof m.specimenId !== "string" || !m.original ||
          !["approved", "review", "rejected"].includes(m.status) || !Number.isFinite(Date.parse(m.capturedAt)) ||
          ![m.manualLengthMm, m.measuredWeightG].every(nullableNumber)) throw new Error("Invalid measurement response");
      for (const a of [m.original, m.correction].filter(Boolean)) {
        if (!a || ![a.lengthMm, a.weightG, a.mmPerPixel].every(nullableNumber) ||
            !Number.isFinite(a.width) || a.width <= 0 || !Number.isFinite(a.height) || a.height <= 0 ||
            !Number.isFinite(a.latencyMs) || typeof a.algorithm !== "string" ||
            ![a.path, a.outline].every(points => Array.isArray(points) && points.every(p =>
              Array.isArray(p) && p.length === 2 && p.every(n => typeof n === "number" && Number.isFinite(n) && n >= 0) && p[0] <= a.width && p[1] <= a.height)))
          throw new Error("Invalid measurement response");
      }
    }
  }
  return value.sessions as Session[];
}
export function dataset(sessions: Session[]) {
  return sessions.flatMap(s => s.measurements.map(m => ({
    sessionId: s.id, tankId: s.tankId, batch: s.batch, sampledAt: s.sampledAt, stockedAt: s.stockedAt,
    specimenId: m.specimenId, capturedAt: m.capturedAt, calibrationVersion: s.calibration.version,
    imageId: m.id, imageUrl: `/api/growth?image=${encodeURIComponent(m.id)}&raw=1`,
    status: m.status, manualLengthMm: m.manualLengthMm, measuredWeightG: m.measuredWeightG,
    original: m.original, correction: m.correction,
  })));
}
