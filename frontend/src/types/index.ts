export type SensorStatus = "ok" | "warn";

export interface SensorReading {
  label: string;
  value: string;
  pct: number;
  status: SensorStatus;
}

export interface TankStatus {
  name: string;
  pl: string;
  biomass: string;
  status: SensorStatus;
}

export interface AlertItem {
  icon: "warn" | "info";
  title: string;
  detail: string;
  time: string;
  /** Present on live tank alerts so operators can open the affected tank. */
  tankId?: string;
}
