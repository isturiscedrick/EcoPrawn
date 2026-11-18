import type { SensorStatus } from "@/types";
import type { ApiTank } from "@/types/api";
import { getThresholds, rangeStatus } from "./thresholds";

export interface Tank {
  id: string;
  name: string;
  pl: string;
  biomass: number;
  dissolvedOxygen: number;
  ph: number;
  temperature: number;
  salinity: number;
  waterLevel: number;
  hasWaterReadings: boolean;
  hardware?: NonNullable<ApiTank["hardwareTelemetries"]>[number];
  bodyLength: number;
  weight: number;
  population: number;
  abnormal: number;
  fcr: number;
  dispensedToday: number;
  targetToday: number;
  status: SensorStatus;
}

export type NewTankInput = Omit<
  Tank,
  "id" | "status" | "hardware" | "hasWaterReadings"
>;

function computeTankStatus(water?: {
  dissolvedOxygen: number;
  ph: number;
  temperature: number;
  salinity: number;
  waterLevel: number;
}): SensorStatus {
  if (!water) return "warn";
  const limits = getThresholds();
  const statuses = [
    rangeStatus(water.dissolvedOxygen, limits.dissolvedOxygen.min),
    rangeStatus(water.ph, limits.ph.min, limits.ph.max),
    rangeStatus(water.temperature, limits.temperature.min, limits.temperature.max),
    rangeStatus(water.salinity, limits.salinity.min, limits.salinity.max),
    rangeStatus(water.waterLevel, limits.waterLevel.min),
  ];
  return statuses.every((status) => status === "ok") ? "ok" : "warn";
}

export function mapTank(tank: ApiTank): Tank {
  const water = tank.telemetries[0];
  const scan = tank.visionScans[0];

  return {
    id: tank.id,
    name: tank.name,
    pl: tank.pl,
    biomass: tank.biomass,
    fcr: tank.fcr,
    targetToday: tank.targetToday,
    dispensedToday: tank.dispensedToday,
    dissolvedOxygen: water?.dissolvedOxygen ?? 0,
    ph: water?.ph ?? 0,
    temperature: water?.temperature ?? 0,
    salinity: water?.salinity ?? 0,
    waterLevel: water?.waterLevel ?? 0,
    hasWaterReadings: Boolean(water),
    hardware: tank.hardwareTelemetries?.[0],
    bodyLength: scan?.bodyLength ?? 0,
    weight: scan?.weight ?? 0,
    population: scan?.population ?? 0,
    abnormal: scan?.abnormalCount ?? 0,
    status: computeTankStatus(water),
  };
}

const validId = (value: string) =>
  value.length > 0 &&
  value.length <= 128 &&
  value.trim() === value &&
  !/\\s/.test(value);

const validNumber = (
  value: unknown,
  min = 0,
  max = Number.MAX_VALUE,
) =>
  typeof value === "number" &&
  Number.isFinite(value) &&
  value >= min &&
  value <= max;

const validName = (value: unknown) =>
  typeof value === "string" &&
  value.trim() === value &&
  value.length > 0 &&
  value.length <= 100;

export function isValidNewTank(input: NewTankInput): boolean {
  return (
    validName(input.name) &&
    validName(input.pl) &&
    [
      input.biomass,
      input.fcr,
      input.targetToday,
      input.dispensedToday,
      input.bodyLength,
      input.weight,
    ].every((value) => validNumber(value)) &&
    Number.isInteger(input.population) &&
    validNumber(input.population, 0, 2147483647) &&
    Number.isInteger(input.abnormal) &&
    validNumber(input.abnormal, 0, 2147483647) &&
    input.abnormal <= input.population &&
    validNumber(input.dissolvedOxygen, 0, 100) &&
    validNumber(input.ph, 0, 14) &&
    validNumber(input.temperature, -55, 125) &&
    validNumber(input.salinity, 0, 1000) &&
    validNumber(input.waterLevel, 0, 100)
  );
}

export function isValidTankPatch(patch: Partial<Tank>): boolean {
  const entries = Object.entries(patch);
  return (
    entries.length > 0 &&
    entries.every(([key, value]) =>
      key === "name" || key === "pl"
        ? validName(value)
        : ["biomass", "targetToday", "fcr", "dispensedToday"].includes(key) &&
          validNumber(value),
    )
  );
}

export function isValidTankId(value: string): boolean {
  return validId(value);
}
