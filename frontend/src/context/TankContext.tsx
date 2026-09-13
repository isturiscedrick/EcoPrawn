"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
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
  addTank: (input: NewTankInput) => void;
  removeTank: (id: string) => void;
  updateTank: (id: string, patch: Partial<Tank>) => void;
}

const TankContext = createContext<TankContextValue | null>(null);

let tankCounter = 1;

export function TankProvider({ children }: { children: ReactNode }) {
  const [tanks, setTanks] = useState<Tank[]>(defaultTanks);

  function addTank(input: NewTankInput) {
    tankCounter += 1;
    const id = `tank-${Date.now()}-${tankCounter}`;
    const status = computeStatus(input);
    setTanks((prev) => [...prev, { ...input, id, status }]);
  }

  function removeTank(id: string) {
    setTanks((prev) => prev.filter((t) => t.id !== id));
  }

  function updateTank(id: string, patch: Partial<Tank>) {
    setTanks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const merged = { ...t, ...patch };
        return { ...merged, status: computeStatus(merged) };
      })
    );
  }

  return (
    <TankContext.Provider value={{ tanks, addTank, removeTank, updateTank }}>
      {children}
    </TankContext.Provider>
  );
}

export function useTanks() {
  const ctx = useContext(TankContext);
  if (!ctx) throw new Error("useTanks must be used within a TankProvider");
  return ctx;
}