import type { AlertItem, SensorReading, SensorStatus } from "@/types";

export interface DemoData {
  heroReadouts: SensorReading[];
  feedSchedule: { time: string; amount: string; status: string }[];
  tankFormDefaults: Record<string, string>;
}

export interface WaterHistoryPoint {
  tankId: string;
  recordedAt: string;
  dissolvedOxygen: number;
  ph: number;
  temperature: number;
  salinity: number;
  waterLevel: number;
}

export interface GrowthHistoryPoint {
  tankId: string;
  tankName: string;
  recordedAt: string;
  bodyLength: number;
  weight: number;
  population: number;
  abnormalCount: number;
}

export interface DashboardData {
  /** Timestamped chart series; optional to remain compatible with older API responses. */
  waterHistory?: WaterHistoryPoint[];
  growthHistory?: GrowthHistoryPoint[];
  waterTrend: { tankId: string; value: number }[];
  growthTrend: number[];
  visionScanLog: { id: string; time: string; tank: string; note: string }[];
  feedSchedule: { id: string; time: string; amount: string; status: string }[];
  bioflocMetrics: {
    label: string;
    value: string;
    unit: string;
    status: SensorStatus;
  }[];
  effluentLog: { id: string; time: string; event: string; detail: string }[];
  alertsLog: AlertItem[];
  resolvedAlerts: number;
}

export interface ApiTank {
  id: string;
  name: string;
  pl: string;
  biomass: number;
  fcr: number;
  targetToday: number;
  dispensedToday: number;
  hardwareTelemetries?: {
    id: string;
    tankId: string;
    temperature: number | null;
    distanceCm: number | null;
    waterLevel: number | null;
    recordedAt: string;
  }[];
  telemetries: {
    dissolvedOxygen: number;
    ph: number;
    temperature: number;
    salinity: number;
    waterLevel: number;
  }[];
  visionScans: {
    bodyLength: number;
    weight: number;
    population: number;
    abnormalCount: number;
  }[];
}
