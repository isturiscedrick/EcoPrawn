import type { AlertItem } from "@/types";
import type { Tank } from "@/features/dashboard/context/TankContext";
import { getThresholds } from "@/features/dashboard/lib/thresholds";

interface Check {
  label: string;
  unit: string;
  decimals: number;
  read: (t: Tank) => number;
  min?: number;
  max?: number;
}

// Keep the checks independent of module-level threshold constants.
// Thresholds are read at runtime so saved user settings are respected.
const CHECKS: Check[] = [
  { label: "Dissolved O₂", unit: " mg/L", decimals: 1, read: (t) => t.dissolvedOxygen },
  { label: "pH", unit: "", decimals: 1, read: (t) => t.ph },
  { label: "Temperature", unit: " °C", decimals: 1, read: (t) => t.temperature },
  { label: "Salinity", unit: " ppt", decimals: 1, read: (t) => t.salinity },
  { label: "Water level", unit: "%", decimals: 0, read: (t) => t.waterLevel },
];

function targetText(c: Check): string {
  if (c.min !== undefined && c.max !== undefined) return `${c.min} – ${c.max}`;
  if (c.min !== undefined) return `≥ ${c.min}`;
  return `≤ ${c.max}`;
}

/** Builds a warning alert for every parameter currently out of range. */
export function deriveTankAlerts(tanks: Tank[]): AlertItem[] {
  const alerts: AlertItem[] = [];
  const limits = getThresholds();
  const checks = CHECKS.map((check) => {
    const config =
      check.label === "Dissolved O₂" ? limits.dissolvedOxygen :
      check.label === "pH" ? limits.ph :
      check.label === "Temperature" ? limits.temperature :
      check.label === "Salinity" ? limits.salinity :
      limits.waterLevel;
    return { ...check, min: config.min, max: "max" in config ? config.max : undefined };
  });

  for (const tank of tanks) {
    if (!tank.hasWaterReadings) continue;
    for (const c of checks) {
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
