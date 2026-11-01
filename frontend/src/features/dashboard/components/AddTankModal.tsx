"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type InputHTMLAttributes,
} from "react";
import { useDemoData } from "@/hooks/useDemoData";
import type { NewTankInput } from "@/features/dashboard/context/TankContext";
import { validateNewTank } from "@/features/dashboard/validateNewTank";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Icon, type IconName } from "@/components/ui/Icon";

interface AddTankModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: NewTankInput) => void;
  existingCount: number;
}

const inputClass =
  "min-h-11 w-full rounded-lg border border-[var(--sand-dim)] bg-[var(--ep-bg)] px-3 text-[14px] font-medium text-[var(--water-deep)] outline-none transition-[border-color,box-shadow] placeholder:text-[rgba(11,35,32,0.42)] focus:border-[var(--ep-accent)] focus:shadow-[0_0_0_3px_rgba(178,63,28,0.12)]";

const labelClass =
  "mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--ep-text-muted)]";

const sectionLabelClass =
  "text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--ep-accent)]";

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  icon?: IconName;
}

// Label + input pair. The htmlFor/id link means clicking the label focuses
// the input and screen readers announce the label with the field.
function Field({
  id,
  label,
  icon,
  ref,
  ...inputProps
}: FieldProps & { ref?: React.Ref<HTMLInputElement> }) {
  return (
    <div>
      <label htmlFor={id} className={`${labelClass} flex items-center gap-1.5`}>
        {icon && <Icon name={icon} size={11} strokeWidth={2} className="text-[var(--ep-accent)]" />}
        {label}
      </label>
      <input id={id} ref={ref} className={inputClass} {...inputProps} />
    </div>
  );
}

export function AddTankModal({
  open,
  onClose,
  onSubmit,
  existingCount,
}: AddTankModalProps) {
  const { tankFormDefaults: defaults } = useDemoData();
  const uid = useId();
  const firstFieldRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(`Tank ${existingCount + 1}`);
  const [pl, setPl] = useState("");
  const [biomass, setBiomass] = useState("");
  const [dissolvedOxygen, setDissolvedOxygen] = useState("");
  const [ph, setPh] = useState("");
  const [temperature, setTemperature] = useState("");
  const [salinity, setSalinity] = useState("");
  const [waterLevel, setWaterLevel] = useState("");
  const [population, setPopulation] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Fresh form every time the modal opens. Without this, the state from the
  // previous add sticks around (same default name, old readings), because
  // this component stays mounted in the parent while closed.
  useEffect(() => {
    if (!open || !defaults.pl) return;
    const d: Record<string,string> = { ...defaults, name: `Tank ${existingCount + 1}` };
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
    setFormError(null);
    firstFieldRef.current?.focus();
  }, [open, defaults, existingCount]);

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

  if (!open || !defaults.pl) return null;

  const resolvedName = name.trim();

  function validatedInput() {
    return validateNewTank(
      { name, pl, biomass, dissolvedOxygen, ph, temperature, salinity, waterLevel, population },
      { bodyLength: 0, weight: 0, fcr: 0 },
    );
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const result = validatedInput();
    if (!result.value) {
      setFormError(result.error);
      return;
    }
    setFormError(null);
    setConfirming(true);
  }

  function handleConfirm() {
    const result = validatedInput();
    if (!result.value) {
      setConfirming(false);
      setFormError(result.error);
      return;
    }
    onSubmit(result.value);
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
        className="ep-fade-in absolute inset-0 bg-[rgba(8,30,34,0.55)] backdrop-blur-sm dark:bg-[rgba(0,0,0,0.72)]"
      />

      <div className="ep-pop-in relative z-10 max-h-[90vh] w-full max-w-[520px] overflow-y-auto rounded-2xl border border-[var(--ep-line)] bg-[var(--ep-surface)] p-6 shadow-[0_28px_90px_rgba(8,30,34,0.28)] sm:p-7">
        <div className="mb-7 flex items-start justify-between gap-5">
          <div>
            <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--ep-accent)]">
              <Icon name="layers" size={12} strokeWidth={2} />
              Facility configuration
            </p>
            <h2
              id={`${uid}-title`}
              className="ep-font-display text-[25px] font-semibold leading-tight text-[var(--water-deep)]"
            >
              Add a new tank
            </h2>
            <p className="mt-2 max-w-[30rem] text-[14px] leading-relaxed text-[var(--ep-text-muted)]">
              Set initial readings for the tank. You can adjust these later.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close add tank dialog"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xl leading-none text-[var(--ep-text-muted)] transition-colors hover:bg-[rgba(11,46,51,0.06)] hover:text-[var(--ep-primary)]"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} onInput={() => setFormError(null)} className="flex flex-col gap-4">
          {formError && <p role="alert" className="text-[13px] text-[var(--coral)]">{formError}</p>}
          <div className={`${sectionLabelClass} flex items-center gap-1.5`}>
            <Icon name="package" size={12} strokeWidth={2} />
            Identity
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field
              id={`${uid}-name`}
              ref={firstFieldRef}
              label="Tank Name"
              icon="layers"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
              required
            />
            <Field
              id={`${uid}-pl`}
              label="PL Batch"
              icon="package"
              value={pl}
              onChange={(e) => setPl(e.target.value)}
              maxLength={100}
              required
            />
          </div>

          <div className={`${sectionLabelClass} mt-1 flex items-center gap-1.5`}>
            <Icon name="egg" size={12} strokeWidth={2} />
            Stock
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field
              id={`${uid}-biomass`}
              label="Biomass (kg)"
              icon="egg"
              type="number"
              step="any"
              inputMode="decimal"
              min="0"
              value={biomass}
              onChange={(e) => setBiomass(e.target.value)}
              required
            />
            <Field
              id={`${uid}-population`}
              label="Population (est.)"
              icon="activity"
              type="number"
              inputMode="numeric"
              min="0" max="2147483647" step="1"
              value={population}
              onChange={(e) => setPopulation(e.target.value)}
              required
            />
          </div>

          <div className={`${sectionLabelClass} mt-1 flex items-center gap-1.5`}>
            <Icon name="waves" size={12} strokeWidth={2} />
            Water Parameters
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field
              id={`${uid}-do`}
              label="Dissolved O₂ (mg/L)"
              icon="droplet"
              type="number"
              step="any"
              inputMode="decimal"
              min="0" max="100"
              value={dissolvedOxygen}
              onChange={(e) => setDissolvedOxygen(e.target.value)}
              required
            />
            <Field
              id={`${uid}-ph`}
              label="pH"
              icon="flask"
              type="number"
              step="any"
              inputMode="decimal"
              min="0" max="14"
              value={ph}
              onChange={(e) => setPh(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Field
              id={`${uid}-temp`}
              label="Temp (°C)"
              icon="thermometer"
              type="number"
              step="any"
              inputMode="decimal"
              min="-55" max="125"
              value={temperature}
              onChange={(e) => setTemperature(e.target.value)}
              required
            />
            <Field
              id={`${uid}-salinity`}
              label="Salinity (ppt)"
              icon="waves"
              type="number"
              step="any"
              inputMode="decimal"
              min="0" max="1000"
              value={salinity}
              onChange={(e) => setSalinity(e.target.value)}
              required
            />
            <Field
              id={`${uid}-level`}
              label="Water Level (%)"
              icon="gauge"
              type="number"
              step="1"
              inputMode="numeric"
              min="0" max="100"
              value={waterLevel}
              onChange={(e) => setWaterLevel(e.target.value)}
              required
            />
          </div>

          <div className="mt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border-2 border-[var(--ep-primary)] px-4 py-2.5 text-[13.5px] font-semibold text-[var(--ep-primary)] transition-colors hover:bg-[var(--ep-primary)] hover:text-white"
            >
              <Icon name="x" size={14} strokeWidth={2} />
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border-2 border-[var(--ep-accent)] bg-[var(--ep-accent)] px-4 py-2.5 text-[13.5px] font-semibold text-white transition-colors hover:border-[var(--ep-accent-hover)] hover:bg-[var(--ep-accent-hover)]"
            >
              <Icon name="check" size={14} strokeWidth={2.2} />
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
