"use client";

import { useEffect, useId, useRef, useState, type FormEvent, type InputHTMLAttributes } from "react";
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

const sectionLabelClass =
  "ep-font-mono text-[9px] font-semibold uppercase tracking-[0.1em] text-[var(--coral)]";

function defaultValues(existingCount: number) {
  return {
    name: `Tank ${existingCount + 1}`,
    pl: "PL-1",
    biomass: "10",
    dissolvedOxygen: "6.0",
    ph: "7.8",
    temperature: "28.0",
    salinity: "15",
    waterLevel: "95",
    population: "1000",
  };
}

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
}

// Label + input pair. The htmlFor/id link means clicking the label focuses
// the input and screen readers announce the label with the field.
function Field({ id, label, ref, ...inputProps }: FieldProps & { ref?: React.Ref<HTMLInputElement> }) {
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <input id={id} ref={ref} className={inputClass} {...inputProps} />
    </div>
  );
}

export function AddTankModal({ open, onClose, onSubmit, existingCount }: AddTankModalProps) {
  const uid = useId();
  const firstFieldRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(() => defaultValues(existingCount).name);
  const [pl, setPl] = useState("PL-1");
  const [biomass, setBiomass] = useState("10");
  const [dissolvedOxygen, setDissolvedOxygen] = useState("6.0");
  const [ph, setPh] = useState("7.8");
  const [temperature, setTemperature] = useState("28.0");
  const [salinity, setSalinity] = useState("15");
  const [waterLevel, setWaterLevel] = useState("95");
  const [population, setPopulation] = useState("1000");
  const [confirming, setConfirming] = useState(false);

  // Fresh form every time the modal opens. Without this, the state from the
  // previous add sticks around (same default name, old readings), because
  // this component stays mounted in the parent while closed.
  useEffect(() => {
    if (!open) return;
    const d = defaultValues(existingCount);
    setName(d.name);
    setPl(d.pl);
    setBiomass(d.biomass);
    setDissolvedOxygen(d.dissolvedOxygen);
    setPh(d.ph);
    setTemperature(d.temperature);
    setSalinity(d.salinity);
    setWaterLevel(d.waterLevel);
    setPopulation(d.population);
    setConfirming(false);
    firstFieldRef.current?.focus();
    // existingCount is read only at open time on purpose.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Escape closes the modal. While the confirm dialog is up, Escape belongs
  // to that dialog (it cancels back to the form), so skip it here.
  useEffect(() => {
    if (!open || confirming) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, confirming, onClose]);

  // Lock page scroll behind the modal.
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

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
      aria-labelledby={`${uid}-title`}
      className="fixed inset-0 z-[100] flex items-center justify-center p-5"
    >
      <div
        aria-hidden="true"
        onClick={onClose}
        className="ep-fade-in absolute inset-0 bg-[rgba(8,30,34,0.55)] backdrop-blur-sm"
      />

      <div className="ep-pop-in relative z-10 w-full max-w-[480px] max-h-[90vh] overflow-y-auto rounded-2xl border border-[var(--sand-dim)] bg-[var(--sand)] p-6 shadow-[var(--shadow-overlay)] sm:p-7">
        <h2
          id={`${uid}-title`}
          className="ep-font-display mb-1.5 text-[20px] font-semibold text-[var(--water-deep)]"
        >
          Add a new tank
        </h2>
        <p className="mb-6 text-[13px] leading-[1.5] text-[rgba(11,35,32,0.6)]">
          Set initial readings for the tank. You can adjust these later.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className={sectionLabelClass}>Identity</div>
          <div className="grid grid-cols-2 gap-3">
            <Field
              id={`${uid}-name`}
              ref={firstFieldRef}
              label="Tank Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Field
              id={`${uid}-pl`}
              label="PL Batch"
              value={pl}
              onChange={(e) => setPl(e.target.value)}
              required
            />
          </div>

          <div className={`${sectionLabelClass} mt-1`}>Stock</div>
          <div className="grid grid-cols-2 gap-3">
            <Field
              id={`${uid}-biomass`}
              label="Biomass (kg)"
              type="number"
              step="0.1"
              inputMode="decimal"
              value={biomass}
              onChange={(e) => setBiomass(e.target.value)}
              required
            />
            <Field
              id={`${uid}-population`}
              label="Population (est.)"
              type="number"
              inputMode="numeric"
              value={population}
              onChange={(e) => setPopulation(e.target.value)}
              required
            />
          </div>

          <div className={`${sectionLabelClass} mt-1`}>Water Parameters</div>
          <div className="grid grid-cols-2 gap-3">
            <Field
              id={`${uid}-do`}
              label="Dissolved O₂ (mg/L)"
              type="number"
              step="0.1"
              inputMode="decimal"
              value={dissolvedOxygen}
              onChange={(e) => setDissolvedOxygen(e.target.value)}
              required
            />
            <Field
              id={`${uid}-ph`}
              label="pH"
              type="number"
              step="0.1"
              inputMode="decimal"
              value={ph}
              onChange={(e) => setPh(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Field
              id={`${uid}-temp`}
              label="Temp (°C)"
              type="number"
              step="0.1"
              inputMode="decimal"
              value={temperature}
              onChange={(e) => setTemperature(e.target.value)}
              required
            />
            <Field
              id={`${uid}-salinity`}
              label="Salinity (ppt)"
              type="number"
              step="0.1"
              inputMode="decimal"
              value={salinity}
              onChange={(e) => setSalinity(e.target.value)}
              required
            />
            <Field
              id={`${uid}-level`}
              label="Water Level (%)"
              type="number"
              step="1"
              inputMode="numeric"
              value={waterLevel}
              onChange={(e) => setWaterLevel(e.target.value)}
              required
            />
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