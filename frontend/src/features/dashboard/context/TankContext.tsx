"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { SensorStatus } from "@/types";
import type { ApiTank, DashboardData } from "@/types/api";
export interface Tank {
  id: string;
  name: string;
  pl: string;
  biomass: number; // kg
  dissolvedOxygen: number;
  ph: number;
  temperature: number;
  salinity: number;
  waterLevel: number;
  bodyLength: number; // cm
  weight: number; // g
  population: number;
  abnormal: number;
  fcr: number;
  dispensedToday: number;
  targetToday: number;
  status: SensorStatus;
}

export type NewTankInput = Omit<Tank, "id" | "status">;
const empty: DashboardData = {
  waterTrend: [],
  growthTrend: [],
  visionScanLog: [],
  feedSchedule: [],
  bioflocMetrics: [],
  effluentLog: [],
  alertsLog: [],
  resolvedAlerts: 0,
};
function mapTank(t: ApiTank): Tank {
  const water = t.telemetries[0];
  const scan = t.visionScans[0];
  return {
    id: t.id,
    name: t.name,
    pl: t.pl,
    biomass: t.biomass,
    fcr: t.fcr,
    targetToday: t.targetToday,
    dispensedToday: t.dispensedToday,
    dissolvedOxygen: water?.dissolvedOxygen ?? 0,
    ph: water?.ph ?? 0,
    temperature: water?.temperature ?? 0,
    salinity: water?.salinity ?? 0,
    waterLevel: water?.waterLevel ?? 0,
    bodyLength: scan?.bodyLength ?? 0,
    weight: scan?.weight ?? 0,
    population: scan?.population ?? 0,
    abnormal: scan?.abnormalCount ?? 0,
    status:
      water &&
      water.dissolvedOxygen >= 4.5 &&
      water.ph >= 7.5 &&
      water.ph <= 8.5 &&
      water.temperature >= 26 &&
      water.temperature <= 30 &&
      water.salinity >= 10 &&
      water.salinity <= 20 &&
      water.waterLevel >= 90
        ? "ok"
        : "warn",
  };
}
interface TankContextValue extends DashboardData {
  tanks: Tank[];
  isDbConnected: boolean;
  loading: boolean;
  error: string | null;
  addTank: (input: NewTankInput) => Promise<void>;
  removeTank: (id: string) => Promise<void>;
  updateTank: (id: string, patch: Partial<Tank>) => Promise<void>;
  refreshTanks: () => Promise<void>;
}
const TankContext = createContext<TankContextValue | null>(null);
export function TankProvider({ children }: { children: ReactNode }) {
  const [tanks, setTanks] = useState<Tank[]>([]);
  const [data, setData] = useState(empty);
  const [isDbConnected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  async function refreshTanks() {
    try {
      const res = await fetch("/api/dashboard");
      if (res.status === 401) {
        window.location.replace("/login?error=expired");
        return;
      }
      if (!res.ok)
        throw new Error(
          "Unable to load dashboard. Check the backend connection.",
        );
      const result: DashboardData & { success: boolean; tanks: ApiTank[] } =
        await res.json();
      if (!result.success) throw new Error("Dashboard data unavailable");
      setTanks(result.tanks.map(mapTank));
      setData(result);
      setConnected(true);
      setError(null);
    } catch (e) {
      setConnected(false);
      setError(e instanceof Error ? e.message : "Unable to load dashboard");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void refreshTanks();
  }, []);
  async function mutate(url: string, method: string, body?: unknown) {
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        ...(body ? { body: JSON.stringify(body) } : {}),
      });
      if (res.status === 401) {
        window.location.replace("/login?error=expired");
        return;
      }
      if (!res.ok)
        throw new Error("Could not save the change. Please try again.");
      await refreshTanks();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to save change");
    }
  }
  return (
    <TankContext.Provider
      value={{
        ...data,
        tanks,
        isDbConnected,
        loading,
        error,
        refreshTanks,
        addTank: (input) => mutate("/api/tanks", "POST", input),
        removeTank: (id) =>
          mutate("/api/tanks/" + encodeURIComponent(id), "DELETE"),
        updateTank: (id, patch) =>
          mutate("/api/tanks/" + encodeURIComponent(id), "PATCH", patch),
      }}
    >
      {children}
    </TankContext.Provider>
  );
}
export function useTanks() {
  const value = useContext(TankContext);
  if (!value) throw new Error("useTanks requires TankProvider");
  return value;
}
