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
import { DashboardFormField } from "./DashboardPrimitives";

interface AddTankModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: NewTankInput) => void;
  existingCount: number;
}

const inputClass =
  "min-h-11 w-full rounded-lg border border-[var(--ep-line)] bg-[var(--ep-bg)] px-3 text-[14px] font-medium text-[var(--water-deep)] outline-none transition-[border-color,box-shadow] placeholder:text-[var(--ep-text-muted)] focus:border-[var(--ep-accent)] focus:shadow-[0_0_0_3px_var(--ep-accent-tint)]";

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
    <DashboardFormField id={id} label={label} icon={icon} labelClassName={labelClass}>
      <input id={id} ref={ref} className={inputClass} {...inputProps} />
    </DashboardFormField>
  );
}

export function AddTankModal({
  open,
  onClose,
  onSubmit,
  existingCount,
}: AddTankModalProps) {
  const { tankFormDefaults: defaults } = useDemoData(open);
  const uid = useId();
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    openerRef.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    return () => {
      const opener = openerRef.current;
      openerRef.current = null;
      if (opener?.isConnected) opener.focus({ preventScroll: true });
    };
  }, [open]);

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
    const focusFrame = window.requestAnimationFrame(() => {
      if (window.matchMedia("(max-width: 639px)").matches) {
        dialogRef.current?.focus({ preventScroll: true });
      } else {
        firstFieldRef.current?.focus({ preventScroll: true });
      }
    });
    return () => window.cancelAnimationFrame(focusFrame);
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
    <>
    <div
      role="dialog"
      aria-modal={confirming ? undefined : true}
      aria-hidden={confirming ? true : undefined}
      aria-labelledby={`${uid}-title`}
      className="dashboard-modal-layer fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6"
    >
      <div
        aria-hidden="true"
        onClick={onClose}
        className="ep-fade-in absolute inset-0 bg-slate-950/60 backdrop-blur-md dark:bg-black/80"
      />

      <div ref={dialogRef} tabIndex={-1} className="dashboard-modal-panel ep-pop-in relative z-10 max-h-[90dvh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-[var(--ep-line)] bg-[var(--ep-surface)] p-6 shadow-2xl outline-none sm:p-8">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--ep-primary)]">
              <Icon name="layers" size={12} strokeWidth={2} />
              Facility Configuration
            </p>
            <div className="mt-1 flex items-center gap-2 flex-wrap">
              <h2
                id={`${uid}-title`}
                className="ep-font-display text-xl font-bold text-[var(--ep-text)] sm:text-2xl"
              >
                Add a new tank
              </h2>
              <span className="inline-flex items-center rounded-md border border-[var(--ep-accent)]/30 bg-[var(--ep-accent-tint)]/60 px-2 py-0.5 font-mono text-xs font-bold text-[var(--ep-primary)] shadow-2xs">
                Auto ID: #{String(existingCount + 1).padStart(2, '0')}
              </span>
            </div>
            <p className="mt-1.5 text-xs text-[var(--ep-text-muted)] sm:text-sm">
              Configure initial biometrics and sensory thresholds for the new tank.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close add tank dialog"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--ep-line)] bg-[var(--ep-surface)] text-lg text-[var(--ep-text-muted)] transition-colors hover:bg-[var(--ep-tint)] hover:text-[var(--ep-primary)]"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} onInput={() => setFormError(null)} className="flex flex-col gap-4">
          {formError && <p role="alert" className="text-[13px] text-[var(--ep-accent)]">{formError}</p>}
          <div className={`${sectionLabelClass} flex items-center gap-1.5`}>
            <Icon name="package" size={12} strokeWidth={2} />
            Identity
          </div>
          <div className="add-tank-field-grid grid grid-cols-2 gap-3">
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
          <div className="add-tank-field-grid grid grid-cols-2 gap-3">
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
          <div className="add-tank-field-grid grid grid-cols-2 gap-3">
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

          <div className="add-tank-water-grid grid grid-cols-2 gap-3 sm:grid-cols-3">
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

          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="min-h-11 inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[var(--ep-line)] bg-[var(--ep-surface)] px-4 text-sm font-semibold text-[var(--ep-text)] transition-colors hover:bg-[var(--ep-tint)]"
            >
              <Icon name="x" size={14} strokeWidth={2} />
              Cancel
            </button>
            <button
              type="submit"
              className="min-h-11 inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[var(--ep-primary)] px-4 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
            >
              <Icon name="plus" size={15} strokeWidth={2.2} />
              Add Tank
            </button>
          </div>
        </form>
      </div>

    </div>
    <ConfirmDialog
      open={confirming}
      title={`Add ${resolvedName}?`}
      description={`This adds ${resolvedName} to the facility with the readings you entered.`}
      confirmLabel="Add tank"
      onCancel={() => setConfirming(false)}
      onConfirm={handleConfirm}
    />
    </>
  );
}
