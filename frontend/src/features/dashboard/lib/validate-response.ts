import type { ApiTank, DashboardData } from "@/types/api";
import type { HardwareReading } from "../context/Esp32Context";

type RecordValue = Record<string, unknown>;
const record = (value: unknown): value is RecordValue =>
  value !== null && typeof value === "object" && !Array.isArray(value);
const text = (value: unknown): value is string => typeof value === "string";
const number = (value: unknown, min: number, max = Number.MAX_VALUE): value is number =>
  typeof value === "number" && Number.isFinite(value) && value >= min && value <= max;
const count = (value: unknown): value is number => Number.isInteger(value) && number(value, 0, 2147483647);
const list = (value: unknown, check: (item: unknown) => boolean): boolean =>
  Array.isArray(value) && value.every(check);
const date = (value: unknown): value is string => text(value) && value.length > 0 && Number.isFinite(Date.parse(value));
const tankId = (value: unknown): value is string =>
  text(value) && value.length > 0 && value.length <= 128 && value.trim() === value && !/\s/.test(value);
const nullable = (value: unknown, check: (item: unknown) => boolean) => value === null || check(value);

export function isHardwareReading(value: unknown, expectedTankId?: string): value is HardwareReading {
  return record(value) && tankId(value.id) && tankId(value.tankId) &&
    (expectedTankId === undefined || value.tankId === expectedTankId) &&
    nullable(value.temperature, item => number(item, -55, 125)) &&
    nullable(value.distanceCm, item => number(item, 2, 400)) &&
    nullable(value.waterLevel, item => number(item, 0, 100)) &&
    (value.waterLevel === null || value.distanceCm !== null) && date(value.recordedAt);
}

export function parseHardwareReadingResponse(value: unknown, expectedTankId: string): HardwareReading {
  if (!record(value) || value.success !== true || !isHardwareReading(value.reading, expectedTankId)) {
    throw new Error("Invalid hardware reading response");
  }
  return value.reading;
}

export function parseHardwareListResponse(value: unknown, expectedTankId: string): HardwareReading[] {
  if (!record(value) || value.success !== true || !list(value.readings, item => isHardwareReading(item, expectedTankId))) {
    throw new Error("Invalid hardware readings response");
  }
  return value.readings as HardwareReading[];
}

function isTank(value: unknown): value is ApiTank {
  return record(value) && tankId(value.id) && text(value.name) && text(value.pl) &&
    number(value.biomass, 0) && number(value.fcr, 0) &&
    number(value.targetToday, 0) && number(value.dispensedToday, 0) &&
    list(value.telemetries, item => record(item) &&
      number(item.dissolvedOxygen, 0, 100) && number(item.ph, 0, 14) &&
      number(item.temperature, -55, 125) && number(item.salinity, 0, 1000) &&
      number(item.waterLevel, 0, 100)) &&
    list(value.visionScans, item => record(item) &&
      number(item.bodyLength, 0) && number(item.weight, 0) &&
      count(item.population) && count(item.abnormalCount)) &&
    (value.hardwareTelemetries === undefined ||
      list(value.hardwareTelemetries, item => isHardwareReading(item, value.id as string)));
}

export function parseDashboardResponse(value: unknown): DashboardData & { tanks: ApiTank[] } {
  if (!record(value) || value.success !== true ||
    !list(value.tanks, isTank) ||
    !list(value.waterTrend, item => record(item) && tankId(item.tankId) && number(item.value, 0, 100)) ||
    !list(value.growthTrend, item => number(item, 0)) ||
    !list(value.visionScanLog, item => record(item) && text(item.id) && date(item.time) && text(item.tank) && text(item.note)) ||
    !list(value.feedSchedule, item => record(item) && text(item.id) && text(item.time) && text(item.amount) && (item.status === "done" || item.status === "upcoming")) ||
    !list(value.bioflocMetrics, item => record(item) && text(item.label) && text(item.value) && text(item.unit) && (item.status === "ok" || item.status === "warn")) ||
    !list(value.effluentLog, item => record(item) && text(item.id) && date(item.time) && text(item.event) && text(item.detail)) ||
    !list(value.alertsLog, item => record(item) && (item.icon === "warn" || item.icon === "info") && text(item.title) && text(item.detail) && date(item.time)) ||
    !count(value.resolvedAlerts)) {
    throw new Error("Invalid dashboard response");
  }
  return value as unknown as DashboardData & { tanks: ApiTank[] };
}
