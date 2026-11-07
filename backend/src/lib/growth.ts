import { isRecord, validLabel, validNumber } from "./api-validation";

export type Point = [number, number];
export interface Calibration {
  version: string; setupId: string; width: number; height: number; markerMm: number;
  cameraMatrix: number[][]; distortion: number[];
}
export interface Analysis {
  status: "review" | "rejected"; reason: string | null;
  width: number; height: number; lengthMm: number | null; areaMm2: number | null;
  widthMm: number | null; weightG: number | null; modelVersion: string | null;
  weightReason: string | null; latencyMs: number;
  path: Point[]; outline: Point[]; mmPerPixel: number | null;
  algorithm: string;
}
export function validCalibration(c: unknown): c is Calibration {
  return isRecord(c) && JSON.stringify(c).length <= 32000 && validLabel(c.version) && validLabel(c.setupId) &&
    Number.isInteger(c.width) && validNumber(c.width, 100, 4096) &&
    Number.isInteger(c.height) && validNumber(c.height, 100, 4096) &&
    validNumber(c.markerMm, 5, 200) && Array.isArray(c.cameraMatrix) &&
    c.cameraMatrix.length === 3 && c.cameraMatrix.every(row => Array.isArray(row) && row.length === 3 && row.every(v => validNumber(v, -100000, 100000))) &&
    c.cameraMatrix[0][0] > 0 && c.cameraMatrix[1][1] > 0 &&
    Array.isArray(c.distortion) && [4, 5, 8, 12, 14].includes(c.distortion.length) &&
    c.distortion.every(v => validNumber(v, -1000, 1000));
}
export function validPoints(v: unknown, width: number, height: number): v is Point[] {
  return Array.isArray(v) && v.length <= 2000 && v.every(p => Array.isArray(p) && p.length === 2 &&
    validNumber(p[0], 0, width) && validNumber(p[1], 0, height));
}
export function validAnalysis(v: unknown): v is Analysis {
  if (!isRecord(v) || !["review", "rejected"].includes(String(v.status)) ||
      !validNumber(v.width, 100, 4096) || !validNumber(v.height, 100, 4096)) return false;
  return ["lengthMm", "areaMm2", "widthMm", "weightG", "mmPerPixel"].every(k => v[k] === null || validNumber(v[k], 0.000001, 1000000)) &&
    validPoints(v.path, v.width, v.height) && validPoints(v.outline, v.width, v.height) &&
    validNumber(v.latencyMs, 0, 120000) && typeof v.algorithm === "string" &&
    ["reason", "weightReason", "modelVersion"].every(k => v[k] === null || typeof v[k] === "string") &&
    (v.status === "rejected" || (v.lengthMm !== null && v.mmPerPixel !== null && v.path.length >= 2));
}
export function pathLength(path: Point[], mmPerPixel: number) {
  return path.slice(1).reduce((sum, p, i) => sum + Math.hypot(p[0] - path[i][0], p[1] - path[i][1]), 0) * mmPerPixel;
}
export function summarize(measurements: { specimenId: string; status: string; original: unknown; correction: unknown; capturedAt: Date }[]) {
  // Repeated photographs do not inflate the sample count. Use latest approved image per specimen.
  const specimens = new Map<string, Analysis>();
  for (const m of [...measurements].sort((a, b) => a.capturedAt.getTime() - b.capturedAt.getTime())) {
    const value = m.correction ?? m.original;
    if (m.status === "approved" && validAnalysis(value)) specimens.set(m.specimenId, value);
  }
  const rows = [...specimens.values()];
  const average = (values: (number | null)[]) => {
    const present = values.filter((v): v is number => v !== null);
    return present.length ? present.reduce((a, b) => a + b, 0) / present.length : null;
  };
  return { sampleCount: rows.length, lengthMm: average(rows.map(r => r.lengthMm)),
    weightG: average(rows.map(r => r.weightG)), weightSampleCount: rows.filter(r => r.weightG !== null).length };
}
