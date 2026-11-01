export function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function validTankId(value: unknown): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= 128 &&
    value.trim() === value && !/\s/.test(value);
}

export function validLabel(value: unknown): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= 100 &&
    value.trim() === value && value.trim().length > 0;
}

export function validNumber(value: unknown, min: number, max = Number.MAX_VALUE): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= min && value <= max;
}

export const waterFields = {
  dissolvedOxygen: [0, 100],
  ph: [0, 14],
  temperature: [-55, 125],
  salinity: [0, 1000],
  waterLevel: [0, 100],
} as const;

export function validWaterReading(body: Record<string, unknown>): boolean {
  return Object.entries(waterFields).every(([key, [min, max]]) => validNumber(body[key], min, max));
}
