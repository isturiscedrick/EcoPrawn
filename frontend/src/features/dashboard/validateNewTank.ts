import type { NewTankInput } from "@/features/dashboard/context/TankContext";

export interface NewTankFields {
  name: string;
  pl: string;
  biomass: string;
  dissolvedOxygen: string;
  ph: string;
  temperature: string;
  salinity: string;
  waterLevel: string;
  population: string;
}

export type NewTankFieldKey = keyof NewTankFields;
export type NewTankFieldErrors = Partial<Record<NewTankFieldKey, string>>;

export const TANK_LIMITS = {
  nameMaxLength: 100,
  plMaxLength: 100,
  biomass: { min: 0, max: 10000 },
  population: { min: 0, max: 1000000 },
  dissolvedOxygen: { min: 0, max: 20 },
  ph: { min: 0, max: 14 },
  temperature: { min: 0, max: 50 },
  salinity: { min: 0, max: 50 },
  waterLevel: { min: 0, max: 100 },
  targetToday: { min: 0, max: 5000 },
  dispensedToday: { min: 0, max: 5000 },
  fcr: { min: 0, max: 20 },
} as const;

type Result =
  | { value: NewTankInput; error?: never; fieldErrors?: never }
  | { value?: never; error: string; fieldErrors: NewTankFieldErrors };

function formatLimit(n: number): string {
  return n.toLocaleString("en-US");
}

function requiredText(value: string, label: string, maxLength: number): string | { error: string } {
  const trimmed = value.trim();
  if (!trimmed) return { error: `${label} is required.` };
  if (trimmed.length > maxLength) return { error: `${label} must be ${maxLength} characters or fewer.` };
  return trimmed;
}

function numberInRange(
  value: string,
  label: string,
  min: number,
  max: number,
  options: { integer?: boolean; unit?: string } = {},
): number | { error: string } {
  const { integer = false, unit } = options;
  const trimmed = value.trim();
  if (!trimmed) return { error: `${label} is required.` };
  const pattern = integer ? /^\d+$/ : /^\d+(?:\.\d{1,4})?$/;
  if (!pattern.test(trimmed)) {
    if (integer && /^-\d+$/.test(trimmed)) {
      return { error: `${label} must be between ${formatLimit(min)} and ${formatLimit(max)}.` };
    }
    if (!integer && /^-\d+(?:\.\d+)?$/.test(trimmed)) {
      const suffix = unit ? ` ${unit}` : "";
      return { error: `${label} must be between ${formatLimit(min)} and ${formatLimit(max)}${suffix}.` };
    }
    return {
      error: integer
        ? `${label} must be a whole number.`
        : `${label} must be a valid number (up to 4 decimal places).`,
    };
  }
  const number = Number(trimmed);
  if (!Number.isFinite(number) || (integer && !Number.isInteger(number))) {
    return { error: `${label} must be a ${integer ? "whole " : ""}number.` };
  }
  if (number < min || number > max) {
    const suffix = unit ? ` ${unit}` : "";
    return { error: `${label} must be between ${formatLimit(min)} and ${formatLimit(max)}${suffix}.` };
  }
  return number;
}

export function validateNewTank(
  fields: NewTankFields,
  defaults: Pick<NewTankInput, "bodyLength" | "weight" | "fcr">,
): Result {
  const fieldErrors: NewTankFieldErrors = {};

  const name = requiredText(fields.name, "Tank name", TANK_LIMITS.nameMaxLength);
  if (typeof name !== "string") fieldErrors.name = name.error;

  const pl = requiredText(fields.pl, "PL batch", TANK_LIMITS.plMaxLength);
  if (typeof pl !== "string") fieldErrors.pl = pl.error;

  const numeric = {
    biomass: numberInRange(fields.biomass, "Biomass", TANK_LIMITS.biomass.min, TANK_LIMITS.biomass.max, { unit: "kg" }),
    population: numberInRange(fields.population, "Population", TANK_LIMITS.population.min, TANK_LIMITS.population.max, { integer: true }),
    dissolvedOxygen: numberInRange(fields.dissolvedOxygen, "Dissolved oxygen", TANK_LIMITS.dissolvedOxygen.min, TANK_LIMITS.dissolvedOxygen.max, { unit: "mg/L" }),
    ph: numberInRange(fields.ph, "pH", TANK_LIMITS.ph.min, TANK_LIMITS.ph.max),
    temperature: numberInRange(fields.temperature, "Temperature", TANK_LIMITS.temperature.min, TANK_LIMITS.temperature.max, { unit: "°C" }),
    salinity: numberInRange(fields.salinity, "Salinity", TANK_LIMITS.salinity.min, TANK_LIMITS.salinity.max, { unit: "ppt" }),
    waterLevel: numberInRange(fields.waterLevel, "Water level", TANK_LIMITS.waterLevel.min, TANK_LIMITS.waterLevel.max, { unit: "%" }),
  };

  for (const [key, result] of Object.entries(numeric) as [keyof typeof numeric, number | { error: string }][]) {
    if (typeof result !== "number") {
      fieldErrors[key] = result.error;
    }
  }

  const firstError = Object.values(fieldErrors)[0];
  if (firstError) {
    return { error: firstError, fieldErrors };
  }

  const values = numeric as Record<keyof typeof numeric, number>;
  const targetToday = Math.round(values.biomass * 0.05 * 100) / 100;
  if (!Number.isFinite(targetToday) || targetToday > TANK_LIMITS.targetToday.max) {
    const error = "Biomass is too large.";
    return { error, fieldErrors: { biomass: error } };
  }
  for (const [label, value] of Object.entries(defaults)) {
    if (!Number.isFinite(value) || value < 0) {
      return { error: `${label} must be a nonnegative number.`, fieldErrors: {} };
    }
  }
  return {
    value: {
      name: name as string,
      pl: pl as string,
      ...values,
      bodyLength: defaults.bodyLength,
      weight: defaults.weight,
      abnormal: 0,
      fcr: defaults.fcr,
      dispensedToday: 0,
      targetToday,
    },
  };
}
