import type { SensorStatus } from "@/types";

export type ThresholdSettings = {
  dissolvedOxygen: { min: number };
  ph: { min: number; max: number };
  temperature: { min: number; max: number };
  salinity: { min: number; max: number };
  waterLevel: { min: number };
};

export const THRESHOLDS: ThresholdSettings = {
  dissolvedOxygen: { min: 4.5 },
  ph: { min: 7.5, max: 8.5 },
  temperature: { min: 26, max: 30 },
  salinity: { min: 10, max: 20 },
  waterLevel: { min: 90 },
};

const STORAGE_KEY = "ecoprawn.water-quality-thresholds";

export function getThresholds(): ThresholdSettings {
  if (typeof window === "undefined") return THRESHOLDS;
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "null");
    if (!parsed || typeof parsed !== "object") return THRESHOLDS;
    const value = parsed as Record<string, Record<string, unknown>>;
    const next = {
      dissolvedOxygen: { min: Number(value.dissolvedOxygen?.min) },
      ph: { min: Number(value.ph?.min), max: Number(value.ph?.max) },
      temperature: { min: Number(value.temperature?.min), max: Number(value.temperature?.max) },
      salinity: { min: Number(value.salinity?.min), max: Number(value.salinity?.max) },
      waterLevel: { min: Number(value.waterLevel?.min) },
    };
    const values = [next.dissolvedOxygen.min, next.ph.min, next.ph.max, next.temperature.min, next.temperature.max, next.salinity.min, next.salinity.max, next.waterLevel.min];
    if (!values.every(Number.isFinite) || next.dissolvedOxygen.min < 0 || next.dissolvedOxygen.min > 20 ||
      next.ph.min < 0 || next.ph.max > 14 || next.ph.min >= next.ph.max ||
      next.temperature.min < -5 || next.temperature.max > 60 || next.temperature.min >= next.temperature.max ||
      next.salinity.min < 0 || next.salinity.max > 100 || next.salinity.min >= next.salinity.max ||
      next.waterLevel.min < 0 || next.waterLevel.min > 100) return THRESHOLDS;
    return next;
  } catch {
    return THRESHOLDS;
  }
}

export function saveThresholds(value: ThresholdSettings): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent("ecoprawn:thresholds-updated"));
}

export function rangeStatus(value: number, min?: number, max?: number): SensorStatus {
  if (min !== undefined && value < min) return "warn";
  if (max !== undefined && value > max) return "warn";
  return "ok";
}

export const GAUGE_SCALE = {
  dissolvedOxygen: { min: 0, max: 8 },
  ph: { min: 6, max: 10 },
  temperature: { min: 20, max: 36 },
  salinity: { min: 0, max: 30 },
  waterLevel: { min: 0, max: 100 },
} as const;

export function scalePct(value: number, scale: { min: number; max: number }): number {
  const pct = ((value - scale.min) / (scale.max - scale.min)) * 100;
  return Math.max(0, Math.min(100, pct));
}
