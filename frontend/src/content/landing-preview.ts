import type { AlertItem, SensorReading, TankStatus } from "@/types";

/**
 * Sample values for the public landing page only (hero card, readings band,
 * dashboard preview). The dashboard reads live data from the API through
 * useTanks(); nothing under features/dashboard should import this file.
 * Export names match what LandingPage already consumes.
 */

export const heroReadouts: SensorReading[] = [
  { label: "Dissolved O₂", value: "6.2", pct: 78, status: "ok" },
  { label: "pH", value: "7.9", pct: 66, status: "ok" },
  { label: "Temperature", value: "28.4", pct: 71, status: "ok" },
  { label: "Salinity", value: "15", pct: 60, status: "ok" },
  { label: "Water Level", value: "98", pct: 98, status: "ok" },
];

export const waterQualityThresholds: { label: string; range: string }[] = [
  { label: "Dissolved O₂", range: "≥ 4.5 mg/L" },
  { label: "pH", range: "7.5 – 8.5" },
  { label: "Temperature", range: "26 – 30 °C" },
  { label: "Salinity", range: "10 – 20 ppt" },
  { label: "Water Level", range: "≥ 90%" },
];

export const tanks: Pick<TankStatus, "biomass">[] = [{ biomass: "31.2 kg" }];

export const feedByTank: { fcr: string }[] = [{ fcr: "1.35" }];

export const alerts: AlertItem[] = [
  {
    icon: "info",
    title: "Aerator auto-activated",
    detail: "Tank 1 — DO dropped to 4.8 mg/L, relay triggered automatically",
    time: "1h ago",
  },
];