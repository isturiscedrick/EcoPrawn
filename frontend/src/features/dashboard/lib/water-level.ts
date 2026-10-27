import type { Tank } from "../context/TankContext";
import type { SensorStatus } from "@/types";

export interface WaterLevelGauge {
  label: string;
  value: string;
  pct: number | null;
  status: SensorStatus;
  statusLabel?: string;
  note?: string;
}

export function waterLevelGauge(tanks: Pick<Tank, "name" | "waterLevel" | "hardware">[]): WaterLevelGauge {
  const raw = tanks.filter(tank => tank.hardware && tank.hardware.waterLevel === null && tank.hardware.distanceCm !== null);
  if (raw.length) {
    const distance = raw.reduce((sum, tank) => sum + tank.hardware!.distanceCm!, 0) / raw.length;
    return {
      label: "Water Level", value: `${distance.toFixed(2)} cm`, pct: null, status: "warn",
      statusLabel: "Needs calibration",
      note: raw.length === 1 ? `${raw[0].name} · distance to water` : `${raw.length} tanks · avg distance to water`,
    };
  }
  const missing = tanks.some(tank => tank.hardware && tank.hardware.waterLevel === null && tank.hardware.distanceCm === null);
  if (missing || !tanks.length) {
    return { label: "Water Level", value: "No reading", pct: null, status: "warn", statusLabel: "Sensor unavailable" };
  }
  const percent = tanks.reduce((sum, tank) => sum + (tank.hardware?.waterLevel ?? tank.waterLevel), 0) / tanks.length;
  return {
    label: "Water Level", value: `${Math.round(percent)}%`, pct: percent, status: percent >= 90 ? "ok" : "warn",
    note: tanks.some(tank => tank.hardware) ? "ESP32 calibrated level" : undefined,
  };
}
