"use client";

import { useState, type FormEvent } from "react";
import type { NewTankInput } from "@/context/TankContext";
import { ConfirmDialog } from "@/components/ConfirmDialog";

interface AddTankModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: NewTankInput) => void;
  existingCount: number;
}

const inputClass =
  "w-full px-3 py-2 rounded-lg border border-[var(--sand-dim)] bg-white text-[13.5px] text-[var(--water-deep)] outline-none focus:border-[var(--mangrove-light)] transition-colors";

const labelClass =
  "ep-font-mono text-[10px] uppercase tracking-wide text-[rgba(11,35,32,0.5)] block mb-1.5";

export function AddTankModal({ open, onClose, onSubmit, existingCount }: AddTankModalProps) {
  const [name, setName] = useState(`Tank ${existingCount + 1}`);
  const [pl, setPl] = useState("PL-1");
  const [biomass, setBiomass] = useState("10");
  const [dissolvedOxygen, setDissolvedOxygen] = useState("6.0");
  const [ph, setPh] = useState("7.8");
  const [temperature, setTemperature] = useState("28.0");
  const [salinity, setSalinity] = useState("15");
  const [waterLevel, setWaterLevel] = useState("95");
  const [population, setPopulation] = useState("1000");
  const [confirming, setConfirming] = useState(false);

  if (!open) return null;

  const resolvedName = name.trim() || `Tank ${existingCount + 1}`;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setConfirming(true);
  }

  function handleConfirm() {
    const biomassNum = parseFloat(biomass) || 0;
    onSubmit({
      name: resolvedName,
      pl: pl.trim() || "PL-1",
      biomass: biomassNum,
      dissolvedOxygen: parseFloat(dissolvedOxygen) || 0,
      ph: parseFloat(ph) || 0,
      temperature: parseFloat(temperature) || 0,
      salinity: parseFloat(salinity) || 0,
      waterLevel: parseFloat(waterLevel) || 0,
      bodyLength: 10,
      weight: 15,
      population: parseInt(population, 10) || 0,
      abnormal: 0,
      fcr: 1.4,
      dispensedToday: 0,
      targetToday: biomassNum * 0.05 || 1,
    });
    setConfirming(false);
    onClose();
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-tank-title"
      className="fixed inset-0 z-[100] flex items-center justify-center p-5"
    >
      <div
        aria-hidden="true"
        onClick={onClose}
        className="absolute inset-0 bg-[rgba(8,30,34,0.55)] backdrop-blur-sm"
      />

      <div className="relative z-10 w-full max-w-[480px] max-h-[90vh] overflow-y-auto rounded-2xl border border-[var(--sand-dim)] bg-[var(--sand)] p-6 shadow-[0_30px_70px_-20px_rgba(0,0,0,0.4)] sm:p-7">
        <h2
          id="add-tank-title"
          className="ep-font-display mb-1.5 text-[20px] font-semibold text-[var(--water-deep)]"
        >
          Add a new tank
        </h2>
        <p className="mb-6 text-[13px] leading-[1.5] text-[rgba(11,35,32,0.6)]">
          Set initial readings for the tank. You can adjust these later.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Tank Name</label>
              <input
                className={inputClass}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className={labelClass}>PL Batch</label>
              <input
                className={inputClass}
                value={pl}
                onChange={(e) => setPl(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Biomass (kg)</label>
              <input
                type="number"
                step="0.1"
                className={inputClass}
                value={biomass}
                onChange={(e) => setBiomass(e.target.value)}
                required
              />
            </div>
            <div>
              <label className={labelClass}>Population (est.)</label>
              <input
                type="number"
                className={inputClass}
                value={population}
                onChange={(e) => setPopulation(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Dissolved O₂ (mg/L)</label>
              <input
                type="number"
                step="0.1"
                className={inputClass}
                value={dissolvedOxygen}
                onChange={(e) => setDissolvedOxygen(e.target.value)}
                required
              />
            </div>
            <div>
              <label className={labelClass}>pH</label>
              <input
                type="number"
                step="0.1"
                className={inputClass}
                value={ph}
                onChange={(e) => setPh(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelClass}>Temp (°C)</label>
              <input
                type="number"
                step="0.1"
                className={inputClass}
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                required
              />
            </div>
            <div>
              <label className={labelClass}>Salinity (ppt)</label>
              <input
                type="number"
                step="0.1"
                className={inputClass}
                value={salinity}
                onChange={(e) => setSalinity(e.target.value)}
                required
              />
            </div>
            <div>
              <label className={labelClass}>Water Level (%)</label>
              <input
                type="number"
                step="1"
                className={inputClass}
                value={waterLevel}
                onChange={(e) => setWaterLevel(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="mt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-[var(--sand-dim)] px-4 py-2.5 text-[13.5px] font-semibold text-[var(--water-deep)] transition-colors hover:bg-[rgba(11,35,32,0.05)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 rounded-lg bg-[var(--coral)] px-4 py-2.5 text-[13.5px] font-semibold text-[var(--sand)] transition-colors hover:bg-[var(--coral-dim)]"
            >
              Add Tank
            </button>
          </div>
        </form>
      </div>

      <ConfirmDialog
        open={confirming}
        title={`Add ${resolvedName}?`}
        description={`This adds ${resolvedName} to the facility with the readings you entered.`}
        confirmLabel="Add tank"
        onCancel={() => setConfirming(false)}
        onConfirm={handleConfirm}
      />
    </div>
  );
}