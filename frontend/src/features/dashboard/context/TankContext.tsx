import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { SensorStatus } from "@/types";
import type { ApiTank, DashboardData } from "@/types/api";
import { parseDashboardResponse } from "../lib/validate-response";
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
  hardware?: NonNullable<ApiTank["hardwareTelemetries"]>[number];
  bodyLength: number; // cm
  weight: number; // g
  population: number;
  abnormal: number;
  fcr: number;
  dispensedToday: number;
  targetToday: number;
  status: SensorStatus;
}

export type NewTankInput = Omit<Tank, "id" | "status" | "hardware">;
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
    hardware: t.hardwareTelemetries?.[0],
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
const validId = (value: string) => value.length > 0 && value.length <= 128 && value.trim() === value && !/\s/.test(value);
const validNumber = (value: unknown, min = 0, max = Number.MAX_VALUE) =>
  typeof value === "number" && Number.isFinite(value) && value >= min && value <= max;
const validName = (value: unknown) => typeof value === "string" && value.trim() === value && value.length > 0 && value.length <= 100;
function validNewTank(input: NewTankInput) {
  return validName(input.name) && validName(input.pl) &&
    [input.biomass, input.fcr, input.targetToday, input.dispensedToday, input.bodyLength, input.weight]
      .every(value => validNumber(value)) &&
    Number.isInteger(input.population) && validNumber(input.population, 0, 2147483647) &&
    Number.isInteger(input.abnormal) && validNumber(input.abnormal, 0, 2147483647) && input.abnormal <= input.population &&
    validNumber(input.dissolvedOxygen, 0, 100) && validNumber(input.ph, 0, 14) &&
    validNumber(input.temperature, -55, 125) && validNumber(input.salinity, 0, 1000) &&
    validNumber(input.waterLevel, 0, 100);
}
function validPatch(patch: Partial<Tank>) {
  const entries = Object.entries(patch);
  return entries.length > 0 && entries.every(([key, value]) =>
    key === "name" || key === "pl" ? validName(value) :
      ["biomass", "targetToday", "fcr", "dispensedToday"].includes(key) && validNumber(value));
}
interface TankContextValue extends DashboardData {
  tanks: Tank[];
  isDbConnected: boolean;
  loading: boolean;
  error: string | null;
  addTank: (input: NewTankInput) => Promise<boolean>;
  removeTank: (id: string) => Promise<boolean>;
  updateTank: (id: string, patch: Partial<Tank>) => Promise<boolean>;
  refreshTanks: () => Promise<void>;
}
const TankContext = createContext<TankContextValue | null>(null);
export function TankProvider({ children }: { children: ReactNode }) {
  const [tanks, setTanks] = useState<Tank[]>([]);
  const [data, setData] = useState(empty);
  const [isDbConnected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const refreshing = useRef(false);
  const mounted = useRef(true);
  const controller = useRef<AbortController | null>(null);
  const refreshTanks = useCallback(async () => {
    if (refreshing.current) return;
    refreshing.current = true;
    const request = new AbortController();
    controller.current = request;
    try {
      const res = await fetch("/api/dashboard", { cache: "no-store", signal: request.signal });
      if (res.status === 401) {
        window.location.replace("/login?error=expired");
        return;
      }
      if (!res.ok)
        throw new Error(
          "Unable to load dashboard. Check the backend connection.",
        );
      const result = parseDashboardResponse(await res.json());
      if (!mounted.current) return;
      setTanks(result.tanks.map(mapTank));
      setData(result);
      setConnected(true);
      setError(null);
    } catch (e) {
      if (request.signal.aborted || !mounted.current) return;
      setConnected(false);
      setError(e instanceof Error ? e.message : "Unable to load dashboard");
    } finally {
      if (controller.current === request) {
        refreshing.current = false;
        controller.current = null;
      }
      if (mounted.current && !request.signal.aborted) setLoading(false);
    }
  }, []);
  useEffect(() => {
    mounted.current = true;
    void refreshTanks();
    const refreshVisible = () => { if (!document.hidden) void refreshTanks(); };
    const timer = setInterval(refreshVisible, 5000);
    document.addEventListener("visibilitychange", refreshVisible);
    window.addEventListener("ecoprawn:hardware-saved", refreshVisible);
    return () => {
      mounted.current = false;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", refreshVisible);
      window.removeEventListener("ecoprawn:hardware-saved", refreshVisible);
      controller.current?.abort();
      controller.current = null;
      refreshing.current = false;
    };
  }, [refreshTanks]);
  async function mutate(url: string, method: string, body?: unknown): Promise<boolean> {
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        ...(body ? { body: JSON.stringify(body) } : {}),
      });
      if (res.status === 401) {
        window.location.replace("/login?error=expired");
        return false;
      }
      if (!res.ok)
        throw new Error("Could not save the change. Please try again.");
      await refreshTanks();
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to save change");
      return false;
    }
  }
  const reject = (message: string) => { setError(message); return Promise.resolve(false); };
  return (
    <TankContext.Provider
      value={{
        ...data,
        tanks,
        isDbConnected,
        loading,
        error,
        refreshTanks,
        addTank: (input) => validNewTank(input)
          ? mutate("/api/tanks", "POST", input) : reject("Enter valid tank measurements before saving."),
        removeTank: (id) =>
          validId(id) ? mutate("/api/tanks/" + encodeURIComponent(id), "DELETE") : reject("Invalid tank ID."),
        updateTank: (id, patch) =>
          validId(id) && validPatch(patch) ? mutate("/api/tanks/" + encodeURIComponent(id), "PATCH", patch) : reject("Invalid tank change."),
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
