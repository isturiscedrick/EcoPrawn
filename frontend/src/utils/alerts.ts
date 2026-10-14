import type { AlertItem } from "@/types";
import type { Tank } from "@/context/TankContext";
import { THRESHOLDS } from "@/utils/thresholds";

interface Check {
  label: string;
  unit: string;
  decimals: number;
  read: (t: Tank) => number;
  min?: number;
  max?: number;
}

const CHECKS: Check[] = [
  { label: "Dissolved O₂", unit: " mg/L", decimals: 1, read: (t) => t.dissolvedOxygen, min: THRESHOLDS.dissolvedOxygen.min },
  { label: "pH", unit: "", decimals: 1, read: (t) => t.ph, min: THRESHOLDS.ph.min, max: THRESHOLDS.ph.max },
  { label: "Temperature", unit: " °C", decimals: 1, read: (t) => t.temperature, min: THRESHOLDS.temperature.min, max: THRESHOLDS.temperature.max },
  { label: "Salinity", unit: " ppt", decimals: 1, read: (t) => t.salinity, min: THRESHOLDS.salinity.min, max: THRESHOLDS.salinity.max },
  { label: "Water level", unit: "%", decimals: 0, read: (t) => t.waterLevel, min: THRESHOLDS.waterLevel.min },
];

function targetText(c: Check): string {
  if (c.min !== undefined && c.max !== undefined) return `${c.min} – ${c.max}`;
  if (c.min !== undefined) return `≥ ${c.min}`;
  return `≤ ${c.max}`;
}

/** Builds a warning alert for every parameter currently out of range. */
export function deriveTankAlerts(tanks: Tank[]): AlertItem[] {
  const alerts: AlertItem[] = [];

  for (const tank of tanks) {
    for (const c of CHECKS) {
      const value = c.read(tank);
      const below = c.min !== undefined && value < c.min;
      const above = c.max !== undefined && value > c.max;
      if (!below && !above) continue;

      alerts.push({
        icon: "warn",
        title: `${c.label} ${below ? "below" : "above"} target`,
        detail: `${tank.name} — ${c.label} at ${value.toFixed(c.decimals)}${c.unit} (target ${targetText(c)})`,
        time: "now",
      });
    }
  }

  return alerts;
}