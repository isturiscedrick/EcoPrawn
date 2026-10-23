"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { SensorStatus } from "@/types";

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

function computeStatus(t: Pick<Tank, "dissolvedOxygen" | "ph" | "temperature" | "salinity" | "waterLevel">): SensorStatus {
  const ok =
    t.dissolvedOxygen >= 4.5 &&
    t.ph >= 7.5 &&
    t.ph <= 8.5 &&
    t.temperature >= 26 &&
    t.temperature <= 30 &&
    t.salinity >= 10 &&
    t.salinity <= 20 &&
    t.waterLevel >= 90;
  return ok ? "ok" : "warn";
}

const defaultTanks: Tank[] = [
  {
    id: "tank-1",
    name: "Tank 1",
    pl: "PL-42",
    biomass: 31.2,
    dissolvedOxygen: 6.2,
    ph: 7.9,
    temperature: 28.4,
    salinity: 15,
    waterLevel: 98,
    bodyLength: 11.6,
    weight: 18.6,
    population: 1720,
    abnormal: 0,
    fcr: 1.35,
    dispensedToday: 1.3,
    targetToday: 1.5,
    status: "ok",
  },
];

export type NewTankInput = Omit<Tank, "id" | "status">;

interface TankContextValue {
  tanks: Tank[];
  addTank: (input: NewTankInput) => Promise<void>;
  removeTank: (id: string) => Promise<void>;
  updateTank: (id: string, patch: Partial<Tank>) => Promise<void>;
  refreshTanks: () => Promise<void>;
  isDbConnected: boolean;
}

const TankContext = createContext<TankContextValue | null>(null);

let tankCounter = 1;

export function TankProvider({ children }: { children: ReactNode }) {
  const [tanks, setTanks] = useState<Tank[]>(defaultTanks);
  const [isDbConnected, setIsDbConnected] = useState(false);

  async function fetchDbTanks() {
    try {
      const res = await fetch("/api/tanks");
      if (!res.ok) return;
      const data = await res.json();
      if (data.success && Array.isArray(data.tanks) && data.tanks.length > 0) {
        setIsDbConnected(true);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const loaded: Tank[] = data.tanks.map((t: any) => {
          const telemetry = t.telemetries?.[0] || {};
          const scan = t.visionScans?.[0] || {};
          const tankObj: Tank = {
            id: t.id,
            name: t.name,
            pl: t.pl || "PL-42",
            biomass: Number(t.biomass) || 31.2,
            dissolvedOxygen: Number(telemetry.dissolvedOxygen ?? 6.2),
            ph: Number(telemetry.ph ?? 7.9),
            temperature: Number(telemetry.temperature ?? 28.4),
            salinity: Number(telemetry.salinity ?? 15),
            waterLevel: Number(telemetry.waterLevel ?? 98),
            bodyLength: Number(scan.bodyLength ?? 11.6),
            weight: Number(scan.weight ?? 18.6),
            population: Number(scan.population ?? 1720),
            abnormal: Number(scan.abnormalCount ?? 0),
            fcr: Number(t.fcr ?? 1.35),
            dispensedToday: 1.3,
            targetToday: Number(t.targetToday ?? 1.5),
            status: "ok",
          };
          tankObj.status = computeStatus(tankObj);
          return tankObj;
        });
        setTanks(loaded);
      }
    } catch {
      // Keep existing tanks on fallback
      setIsDbConnected(false);
    }
  }

  useEffect(() => {
    fetchDbTanks();
  }, []);

  async function addTank(input: NewTankInput) {
    tankCounter += 1;
    const tempId = `tank-${Date.now()}-${tankCounter}`;
    const status = computeStatus(input);
    const newTank: Tank = { ...input, id: tempId, status };
    setTanks((prev) => [...prev, newTank]);

    try {
      const res = await fetch("/api/tanks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.tank?.id) {
          setTanks((prev) =>
            prev.map((t) => (t.id === tempId ? { ...t, id: data.tank.id } : t))
          );
          setIsDbConnected(true);
        }
      }
    } catch {
      // Local state is preserved
    }
  }

  async function removeTank(id: string) {
    setTanks((prev) => prev.filter((t) => t.id !== id));
    try {
      await fetch(`/api/tanks/${id}`, { method: "DELETE" });
    } catch {
      // Local state already updated
    }
  }

  async function updateTank(id: string, patch: Partial<Tank>) {
    setTanks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const merged = { ...t, ...patch };
        return { ...merged, status: computeStatus(merged) };
      })
    );
    try {
      await fetch(`/api/tanks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
    } catch {
      // Local state already updated
    }
  }

  return (
    <TankContext.Provider
      value={{
        tanks,
        addTank,
        removeTank,
        updateTank,
        refreshTanks: fetchDbTanks,
        isDbConnected,
      }}
    >
      {children}
    </TankContext.Provider>
  );
}

export function useTanks() {
  const ctx = useContext(TankContext);
  if (!ctx) throw new Error("useTanks must be used within a TankProvider");
  return ctx;
}