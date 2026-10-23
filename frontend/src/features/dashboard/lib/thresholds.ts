import type { SensorStatus } from "@/types";

// Target ranges for the water-quality parameters. Same values as
// computeStatus() in TankContext and the "Parameter Thresholds" panel.
export const THRESHOLDS = {
  dissolvedOxygen: { min: 4.5 },
  ph: { min: 7.5, max: 8.5 },
  temperature: { min: 26, max: 30 },
  salinity: { min: 10, max: 20 },
  waterLevel: { min: 90 },
} as const;

export function rangeStatus(value: number, min?: number, max?: number): SensorStatus {
  if (min !== undefined && value < min) return "warn";
  if (max !== undefined && value > max) return "warn";
  return "ok";
}

// Display scale for each gauge ring: the value range that maps to 0–100% fill.
// Display only; these are not alert thresholds.
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