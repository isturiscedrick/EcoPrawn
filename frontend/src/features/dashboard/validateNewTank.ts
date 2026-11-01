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

type Result = { value: NewTankInput; error?: never } | { value?: never; error: string };

function requiredText(value: string, label: string): string | { error: string } {
  const trimmed = value.trim();
  if (!trimmed) return { error: `${label} is required.` };
  if (trimmed.length > 100) return { error: `${label} must be 100 characters or fewer.` };
  return trimmed;
}

function numberInRange(value: string, label: string, min: number, max?: number, integer = false): number | { error: string } {
  const trimmed = value.trim();
  if (!trimmed) return { error: `${label} is required.` };
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/.test(trimmed)) {
    return { error: `${label} must be a ${integer ? "whole " : ""}number.` };
  }
  const number = Number(trimmed);
  if (!Number.isFinite(number) || (integer && !Number.isInteger(number))) {
    return { error: `${label} must be a ${integer ? "whole " : ""}number.` };
  }
  if (number < min || (max !== undefined && number > max)) {
    return { error: max === undefined ? `${label} must be at least ${min}.` : `${label} must be between ${min} and ${max}.` };
  }
  return number;
}

export function validateNewTank(fields: NewTankFields, defaults: Pick<NewTankInput, "bodyLength" | "weight" | "fcr">): Result {
  const name = requiredText(fields.name, "Tank name");
  if (typeof name !== "string") return name;
  const pl = requiredText(fields.pl, "PL batch");
  if (typeof pl !== "string") return pl;

  const numeric = {
    biomass: numberInRange(fields.biomass, "Biomass", 0),
    dissolvedOxygen: numberInRange(fields.dissolvedOxygen, "Dissolved oxygen", 0, 100),
    ph: numberInRange(fields.ph, "pH", 0, 14),
    temperature: numberInRange(fields.temperature, "Temperature", -55, 125),
    salinity: numberInRange(fields.salinity, "Salinity", 0, 1000),
    waterLevel: numberInRange(fields.waterLevel, "Water level", 0, 100),
    population: numberInRange(fields.population, "Population", 0, 2147483647, true),
  };
  for (const result of Object.values(numeric)) {
    if (typeof result !== "number") return result;
  }
  const values = numeric as Record<keyof typeof numeric, number>;
  const targetToday = values.biomass * 0.05;
  if (!Number.isFinite(targetToday)) return { error: "Biomass is too large." };
  for (const [label, value] of Object.entries(defaults)) {
    if (!Number.isFinite(value) || value < 0) return { error: `${label} must be a nonnegative number.` };
  }
  return {
    value: {
      name,
      pl,
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
