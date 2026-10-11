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