import type { AlertItem, SensorReading, SensorStatus } from "@/types";

export interface DemoData {
  heroReadouts: SensorReading[];
  feedSchedule: { time: string; amount: string; status: string }[];
  tankFormDefaults: Record<string, string>;
}

export interface DashboardData {
  waterTrend: { tankId: string; value: number }[];
  growthTrend: number[];
  visionScanLog: { time: string; tank: string; note: string }[];
  feedSchedule: { id: string; time: string; amount: string; status: string }[];
  bioflocMetrics: {
    label: string;
    value: string;
    unit: string;
    status: SensorStatus;
  }[];
  effluentLog: { time: string; event: string; detail: string }[];
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
