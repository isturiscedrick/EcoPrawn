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
import { parseDashboardResponse, parseTankMutationResponse } from "../lib/validate-response";
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
function computeTankStatus(water?: {
  dissolvedOxygen: number;
  ph: number;
  temperature: number;
  salinity: number;
  waterLevel: number;
}): SensorStatus {
  return water &&
    water.dissolvedOxygen >= 4.5 &&
    water.ph >= 7.5 &&
    water.ph <= 8.5 &&
    water.temperature >= 26 &&
    water.temperature <= 30 &&
    water.salinity >= 10 &&
    water.salinity <= 20 &&
    water.waterLevel >= 90
    ? "ok"
    : "warn";
}
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
    status: computeTankStatus(water),
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
  const pendingMutations = useRef(0);
  const mounted = useRef(true);
  const controller = useRef<AbortController | null>(null);
  const refreshTanks = useCallback(async (force = false) => {
    if (pendingMutations.current > 0 && !force) return;
    if (refreshing.current) {
      if (!force) return;
      controller.current?.abort();
    }
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
      if (!mounted.current || request.signal.aborted || pendingMutations.current > 0) return;
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
    const refreshHardware = () => { if (!document.hidden) void refreshTanks(true); };
    const timer = setInterval(refreshVisible, 5000);
    document.addEventListener("visibilitychange", refreshVisible);
    window.addEventListener("ecoprawn:hardware-saved", refreshHardware);
    return () => {
      mounted.current = false;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", refreshVisible);
      window.removeEventListener("ecoprawn:hardware-saved", refreshHardware);
      controller.current?.abort();
      controller.current = null;
      refreshing.current = false;
    };
  }, [refreshTanks]);
  async function mutate(
    url: string,
    method: string,
    body?: unknown,
    options?: {
      onOptimistic?: () => () => void;
      onSuccess?: (payload: unknown) => void;
    },
  ): Promise<boolean> {
    controller.current?.abort();
    refreshing.current = false;
    pendingMutations.current += 1;
    const rollback = mounted.current ? options?.onOptimistic?.() : undefined;
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        ...(body ? { body: JSON.stringify(body) } : {}),
      });
      if (res.status === 401) {
        rollback?.();
        window.location.replace("/login?error=expired");
        return false;
      }
      if (!res.ok)
        throw new Error("Could not save the change. Please try again.");
      const payload: unknown = await res.json().catch(() => null);
      if (mounted.current) {
        options?.onSuccess?.(payload);
        setError(null);
      }
      return true;
    } catch (e) {
      if (mounted.current) {
        rollback?.();
        setError(e instanceof Error ? e.message : "Unable to save change");
      }
      return false;
    } finally {
      pendingMutations.current = Math.max(0, pendingMutations.current - 1);
      if (mounted.current && pendingMutations.current === 0) {
        void refreshTanks(true);
      }
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
        refreshTanks: () => refreshTanks(true),
        addTank: (input) => {
          if (!validNewTank(input)) return reject("Enter valid tank measurements before saving.");
          const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
          const tempScanId = `scan-${tempId}`;
          const nowIso = new Date().toISOString();
          const optimisticTank: Tank = {
            id: tempId,
            ...input,
            status: computeTankStatus(input),
          };
          return mutate("/api/tanks", "POST", input, {
            onOptimistic: () => {
              setTanks((prev) => [...prev, optimisticTank]);
              setData((prev) => ({
                ...prev,
                waterTrend: [...prev.waterTrend, { tankId: tempId, value: input.dissolvedOxygen }],
                growthTrend: [...prev.growthTrend, input.bodyLength],
                visionScanLog: [
                  { id: tempScanId, time: nowIso, tank: input.name, note: "Scan recorded" },
                  ...prev.visionScanLog,
                ],
              }));
              return () => {
                setTanks((prev) => prev.filter((t) => t.id !== tempId));
                setData((prev) => ({
                  ...prev,
                  waterTrend: prev.waterTrend.filter((r) => r.tankId !== tempId),
                  growthTrend: prev.growthTrend.slice(0, -1),
                  visionScanLog: prev.visionScanLog.filter((s) => s.id !== tempScanId),
                }));
              };
            },
            onSuccess: (payload) => {
              const created = parseTankMutationResponse(payload);
              const mapped = mapTank(created);
              const scan = created.visionScans[0] as { id?: string; recordedAt?: string; notes?: string | null } | undefined;
              setTanks((prev) =>
                prev.some((t) => t.id === tempId)
                  ? prev.map((t) => (t.id === tempId ? mapped : t))
                  : prev.some((t) => t.id === mapped.id)
                    ? prev
                    : [...prev, mapped],
              );
              setData((prev) => ({
                ...prev,
                waterTrend: prev.waterTrend.map((r) => (r.tankId === tempId ? { ...r, tankId: mapped.id } : r)),
                visionScanLog: prev.visionScanLog.map((s) =>
                  s.id === tempScanId
                    ? {
                        id: scan?.id ?? tempScanId,
                        time: scan?.recordedAt ?? s.time,
                        tank: mapped.name,
                        note: scan?.notes || "Scan recorded",
                      }
                    : s,
                ),
              }));
            },
          });
        },
        removeTank: (id) => {
          if (!validId(id)) return reject("Invalid tank ID.");
          return mutate("/api/tanks/" + encodeURIComponent(id), "DELETE", undefined, {
            onOptimistic: () => {
              let removedTank: Tank | undefined;
              let removedIndex = -1;
              setTanks((prev) => {
                removedIndex = prev.findIndex((t) => t.id === id);
                removedTank = removedIndex >= 0 ? prev[removedIndex] : undefined;
                return prev.filter((t) => t.id !== id);
              });
              return () => {
                if (!removedTank) return;
                const restored = removedTank;
                setTanks((prev) => {
                  if (prev.some((t) => t.id === restored.id)) return prev;
                  const next = [...prev];
                  next.splice(Math.min(Math.max(0, removedIndex), next.length), 0, restored);
                  return next;
                });
              };
            },
            onSuccess: () => {
              setData((prev) => ({
                ...prev,
                waterTrend: prev.waterTrend.filter((r) => r.tankId !== id),
              }));
            },
          });
        },
        updateTank: (id, patch) => {
          if (!validId(id) || !validPatch(patch)) return reject("Invalid tank change.");
          return mutate("/api/tanks/" + encodeURIComponent(id), "PATCH", patch, {
            onOptimistic: () => {
              let previousTank: Tank | undefined;
              setTanks((prev) =>
                prev.map((t) => {
                  if (t.id !== id) return t;
                  previousTank = t;
                  return { ...t, ...patch };
                }),
              );
              return () => {
                if (!previousTank) return;
                const restored = previousTank;
                setTanks((prev) => prev.map((t) => (t.id === id ? restored : t)));
              };
            },
          });
        },
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
