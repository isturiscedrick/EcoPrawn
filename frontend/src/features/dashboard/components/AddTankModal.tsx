import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type InputHTMLAttributes,
} from "react";
import { useDemoData } from "@/hooks/useDemoData";
import type { NewTankInput } from "@/features/dashboard/context/TankContext";
import { getThresholds, rangeStatus } from "@/features/dashboard/lib/thresholds";
import {
  TANK_LIMITS,
  validateNewTank,
  type NewTankFieldErrors,
  type NewTankFieldKey,
} from "@/features/dashboard/validateNewTank";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Icon, type IconName } from "@/components/ui/Icon";
import { DashboardFormField } from "./DashboardPrimitives";

interface AddTankModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: NewTankInput) => void;
  existingCount: number;
}

const inputBaseClass =
  "min-h-11 w-full rounded-xl border bg-[var(--ep-surface)] px-3.5 text-[16px] sm:text-[14px] font-medium text-[var(--ep-text)] outline-none transition-[border-color,box-shadow] placeholder:text-[var(--ep-text-muted)]/60";

const inputNormalClass =
  `${inputBaseClass} border-[var(--ep-line)] focus:border-[var(--ep-accent)] focus:shadow-[0_0_0_3px_var(--ep-accent-tint)]`;

const inputWarnClass =
  `${inputBaseClass} border-amber-500/60 focus:border-amber-500 focus:shadow-[0_0_0_3px_rgba(245,158,11,0.18)]`;

const inputErrorClass =
  `${inputBaseClass} border-rose-500/70 focus:border-rose-500 focus:shadow-[0_0_0_3px_rgba(244,63,94,0.18)]`;

const labelClass =
  "mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--ep-text-muted)]";

const sectionLabelClass =
  "text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--ep-accent)]";

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  icon?: IconName;
  hint?: string;
  warn?: boolean;
  error?: string;
}

// Label + input pair. The htmlFor/id link means clicking the label focuses
// the input and screen readers announce the label with the field.
function Field({
  id,
  label,
  icon,
  hint,
  warn = false,
  error,
  ref,
  ...inputProps
}: FieldProps & { ref?: React.Ref<HTMLInputElement> }) {
  const errorId = error ? `${id}-error` : undefined;
  const inputClass = error ? inputErrorClass : warn ? inputWarnClass : inputNormalClass;
  return (
    <DashboardFormField id={id} label={label} icon={icon} labelClassName={labelClass}>
      <input
        id={id}
        ref={ref}
        className={inputClass}
        aria-invalid={error || warn ? true : undefined}
        aria-describedby={errorId}
        {...inputProps}
      />
      {error ? (
        <p id={errorId} role="alert" className="mt-1 text-[11px] font-medium leading-tight text-rose-600 dark:text-rose-400">
          {error}
        </p>
      ) : hint ? (
        <p className={`mt-1 text-[11px] leading-tight ${warn ? "font-medium text-amber-600 dark:text-amber-400" : "text-[var(--ep-text-muted)]"}`}>
          {hint}
        </p>
      ) : null}
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
  const [touched, setTouched] = useState<Partial<Record<NewTankFieldKey, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);
  const thresholds = useMemo(() => getThresholds(), [open]);

  function resetToDefaults() {
    if (!defaults.pl) return;
    const d: Record<string, string> = { ...defaults, name: `Tank ${existingCount + 1}` };
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
    setTouched({});
    setSubmitted(false);
  }

  // Fresh form every time the modal opens. Without this, the state from the
  // previous add sticks around (same default name, old readings), because
  // this component stays mounted in the parent while closed.
  useEffect(() => {
    if (!open || !defaults.pl) return;
    resetToDefaults();
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
  const validation = validateNewTank(
    { name, pl, biomass, dissolvedOxygen, ph, temperature, salinity, waterLevel, population },
    { bodyLength: 0, weight: 0, fcr: 0 },
  );
  const allFieldErrors: NewTankFieldErrors = validation.value ? {} : validation.fieldErrors;
  const fieldError = (key: NewTankFieldKey) =>
    submitted || touched[key] ? allFieldErrors[key] : undefined;
  const markTouched = (key: NewTankFieldKey) =>
    setTouched((prev) => (prev[key] ? prev : { ...prev, [key]: true }));

  const parsedBiomass = Number(biomass);
  const parsedPopulation = Number(population);
  const validBiomassForPreview =
    !allFieldErrors.biomass && Number.isFinite(parsedBiomass) && parsedBiomass > 0;
  const validPopulationForPreview =
    !allFieldErrors.population && Number.isFinite(parsedPopulation) && parsedPopulation > 0;
  const hasStockEstimate = validBiomassForPreview && validPopulationForPreview;
  const avgWeightGrams = hasStockEstimate ? (parsedBiomass * 1000) / parsedPopulation : null;
  const feedTargetKg = validBiomassForPreview ? parsedBiomass * 0.05 : null;

  const checkWarn = (raw: string, key: NewTankFieldKey, min?: number, max?: number) => {
    if (!raw.trim() || allFieldErrors[key]) return false;
    const n = Number(raw);
    return Number.isFinite(n) && rangeStatus(n, min, max) === "warn";
  };
  const doWarn = checkWarn(dissolvedOxygen, "dissolvedOxygen", thresholds.dissolvedOxygen.min);
  const phWarn = checkWarn(ph, "ph", thresholds.ph.min, thresholds.ph.max);
  const tempWarn = checkWarn(temperature, "temperature", thresholds.temperature.min, thresholds.temperature.max);
  const salinityWarn = checkWarn(salinity, "salinity", thresholds.salinity.min, thresholds.salinity.max);
  const levelWarn = checkWarn(waterLevel, "waterLevel", thresholds.waterLevel.min);
  const anyWaterWarn = doWarn || phWarn || tempWarn || salinityWarn || levelWarn;

  const fieldIdMap: Record<NewTankFieldKey, string> = {
    name: `${uid}-name`,
    pl: `${uid}-pl`,
    biomass: `${uid}-biomass`,
    population: `${uid}-population`,
    dissolvedOxygen: `${uid}-do`,
    ph: `${uid}-ph`,
    temperature: `${uid}-temp`,
    salinity: `${uid}-salinity`,
    waterLevel: `${uid}-level`,
  };

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    if (!validation.value) {
      setFormError(validation.error);
      const firstInvalidKey = (Object.keys(fieldIdMap) as NewTankFieldKey[]).find(
        (key) => validation.fieldErrors[key],
      );
      if (firstInvalidKey) {
        const el = document.getElementById(fieldIdMap[firstInvalidKey]);
        el?.focus();
      }
      return;
    }
    setFormError(null);
    setConfirming(true);
  }

  function handleConfirm() {
    if (!validation.value) {
      setConfirming(false);
      setSubmitted(true);
      setFormError(validation.error);
      return;
    }
    onSubmit(validation.value);
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

      <div
        ref={dialogRef}
        tabIndex={-1}
        data-modal-structured
        className="dashboard-modal-panel ep-pop-in relative z-10 flex max-h-[90dvh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-[var(--ep-line)] bg-[var(--ep-surface)] shadow-2xl outline-none"
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-[var(--ep-line)] px-4 py-3.5 sm:gap-4 sm:px-7 sm:py-5">
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--ep-accent)]">
              <Icon name="layers" size={12} strokeWidth={2} />
              Facility Configuration
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-2 sm:gap-2.5">
              <h2
                id={`${uid}-title`}
                className="ep-font-display text-lg font-bold text-[var(--ep-text)] sm:text-2xl"
              >
                Add a new tank
              </h2>
              <span className="inline-flex items-center rounded-md border border-[var(--ep-accent)]/30 bg-[var(--ep-accent-tint)] px-2 py-0.5 font-mono text-[11px] font-bold text-[var(--ep-accent)] sm:text-xs">
                Auto ID: #{String(existingCount + 1).padStart(2, "0")}
              </span>
            </div>
            <p className="mt-1 text-xs text-[var(--ep-text-muted)] sm:text-sm">
              Configure initial biometrics and sensory thresholds for the new tank.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close add tank dialog"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--ep-line)] bg-[var(--ep-surface)] text-[var(--ep-text-muted)] transition-all duration-200 hover:rotate-90 hover:bg-[var(--ep-tint)] hover:text-[var(--ep-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ep-accent)] sm:h-9 sm:w-9"
          >
            <Icon name="x" size={17} strokeWidth={2} />
          </button>
        </div>

        <form onSubmit={handleSubmit} onInput={() => setFormError(null)} noValidate className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 py-3.5 sm:space-y-4 sm:px-7 sm:py-5">
            {formError && (
              <p role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2.5 text-xs font-medium text-rose-700 dark:text-rose-300">
                {formError}
              </p>
            )}

            <section className="rounded-xl border border-[var(--ep-line)] bg-[var(--ep-bg)]/60 p-3.5 sm:p-4">
              <div className={`${sectionLabelClass} mb-3 flex items-center gap-1.5`}>
                <Icon name="package" size={12} strokeWidth={2} />
                Identity
              </div>
              <div className="add-tank-field-grid grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field
                  id={`${uid}-name`}
                  ref={firstFieldRef}
                  label="Tank Name"
                  icon="layers"
                  placeholder="e.g. Tank 3"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={() => markTouched("name")}
                  error={fieldError("name")}
                  maxLength={TANK_LIMITS.nameMaxLength}
                  required
                />
                <Field
                  id={`${uid}-pl`}
                  label="PL Batch"
                  icon="package"
                  placeholder="e.g. PL-1"
                  value={pl}
                  onChange={(e) => setPl(e.target.value)}
                  onBlur={() => markTouched("pl")}
                  error={fieldError("pl")}
                  maxLength={TANK_LIMITS.plMaxLength}
                  required
                />
              </div>
            </section>

            <section className="rounded-xl border border-[var(--ep-line)] bg-[var(--ep-bg)]/60 p-3.5 sm:p-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div className={`${sectionLabelClass} flex items-center gap-1.5`}>
                  <Icon name="egg" size={12} strokeWidth={2} />
                  Stocking
                </div>
                {(avgWeightGrams !== null || feedTargetKg !== null) && (
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-medium text-[var(--ep-text-muted)] sm:gap-2">
                    {avgWeightGrams !== null && (
                      <span className="rounded-md border border-[var(--ep-line)] bg-[var(--ep-surface)] px-2 py-0.5 tabular-nums">
                        Avg: {avgWeightGrams.toFixed(1)} g/prawn
                      </span>
                    )}
                    {feedTargetKg !== null && (
                      <span className="rounded-md border border-[var(--ep-line)] bg-[var(--ep-surface)] px-2 py-0.5 tabular-nums">
                        Feed target: {feedTargetKg.toFixed(2)} kg/day
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div className="add-tank-field-grid grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field
                  id={`${uid}-biomass`}
                  label="Biomass (kg)"
                  icon="egg"
                  type="number"
                  step="any"
                  inputMode="decimal"
                  min={TANK_LIMITS.biomass.min}
                  max={TANK_LIMITS.biomass.max}
                  value={biomass}
                  onChange={(e) => setBiomass(e.target.value)}
                  onBlur={() => markTouched("biomass")}
                  error={fieldError("biomass")}
                  hint={`0–${TANK_LIMITS.biomass.max.toLocaleString("en-US")} kg`}
                  required
                />
                <Field
                  id={`${uid}-population`}
                  label="Population (est.)"
                  icon="activity"
                  type="number"
                  inputMode="numeric"
                  min={TANK_LIMITS.population.min}
                  max={TANK_LIMITS.population.max}
                  step="1"
                  value={population}
                  onChange={(e) => setPopulation(e.target.value)}
                  onBlur={() => markTouched("population")}
                  error={fieldError("population")}
                  hint={`0–${TANK_LIMITS.population.max.toLocaleString("en-US")} prawns`}
                  required
                />
              </div>
            </section>

            <section className="rounded-xl border border-[var(--ep-line)] bg-[var(--ep-bg)]/60 p-3.5 sm:p-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div className={`${sectionLabelClass} flex items-center gap-1.5`}>
                  <Icon name="waves" size={12} strokeWidth={2} />
                  Water Parameters
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                    anyWaterWarn
                      ? "border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300"
                      : "border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${anyWaterWarn ? "bg-amber-500" : "bg-emerald-500"}`} />
                  {anyWaterWarn ? "Outside threshold range" : "Within thresholds"}
                </span>
              </div>
              <div className="space-y-3">
                <div className="add-tank-field-grid grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Field
                    id={`${uid}-do`}
                    label="Dissolved O₂ (mg/L)"
                    icon="droplet"
                    type="number"
                    step="any"
                    inputMode="decimal"
                    min={TANK_LIMITS.dissolvedOxygen.min}
                    max={TANK_LIMITS.dissolvedOxygen.max}
                    value={dissolvedOxygen}
                    onChange={(e) => setDissolvedOxygen(e.target.value)}
                    onBlur={() => markTouched("dissolvedOxygen")}
                    error={fieldError("dissolvedOxygen")}
                    warn={doWarn}
                    hint={`Target ≥ ${thresholds.dissolvedOxygen.min} mg/L (max ${TANK_LIMITS.dissolvedOxygen.max})`}
                    required
                  />
                  <Field
                    id={`${uid}-ph`}
                    label="pH"
                    icon="flask"
                    type="number"
                    step="any"
                    inputMode="decimal"
                    min={TANK_LIMITS.ph.min}
                    max={TANK_LIMITS.ph.max}
                    value={ph}
                    onChange={(e) => setPh(e.target.value)}
                    onBlur={() => markTouched("ph")}
                    error={fieldError("ph")}
                    warn={phWarn}
                    hint={`Target ${thresholds.ph.min}–${thresholds.ph.max} (0–${TANK_LIMITS.ph.max})`}
                    required
                  />
                </div>

                <div className="add-tank-water-grid grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <Field
                    id={`${uid}-temp`}
                    label="Temp (°C)"
                    icon="thermometer"
                    type="number"
                    step="any"
                    inputMode="decimal"
                    min={TANK_LIMITS.temperature.min}
                    max={TANK_LIMITS.temperature.max}
                    value={temperature}
                    onChange={(e) => setTemperature(e.target.value)}
                    onBlur={() => markTouched("temperature")}
                    error={fieldError("temperature")}
                    warn={tempWarn}
                    hint={`Target ${thresholds.temperature.min}–${thresholds.temperature.max} °C (${TANK_LIMITS.temperature.min}–${TANK_LIMITS.temperature.max})`}
                    required
                  />
                  <Field
                    id={`${uid}-salinity`}
                    label="Salinity (ppt)"
                    icon="waves"
                    type="number"
                    step="any"
                    inputMode="decimal"
                    min={TANK_LIMITS.salinity.min}
                    max={TANK_LIMITS.salinity.max}
                    value={salinity}
                    onChange={(e) => setSalinity(e.target.value)}
                    onBlur={() => markTouched("salinity")}
                    error={fieldError("salinity")}
                    warn={salinityWarn}
                    hint={`Target ${thresholds.salinity.min}–${thresholds.salinity.max} ppt (${TANK_LIMITS.salinity.min}–${TANK_LIMITS.salinity.max})`}
                    required
                  />
                  <Field
                    id={`${uid}-level`}
                    label="Water Level (%)"
                    icon="gauge"
                    type="number"
                    step="1"
                    inputMode="numeric"
                    min={TANK_LIMITS.waterLevel.min}
                    max={TANK_LIMITS.waterLevel.max}
                    value={waterLevel}
                    onChange={(e) => setWaterLevel(e.target.value)}
                    onBlur={() => markTouched("waterLevel")}
                    error={fieldError("waterLevel")}
                    warn={levelWarn}
                    hint={`Target ≥ ${thresholds.waterLevel.min}% (0–${TANK_LIMITS.waterLevel.max}%)`}
                    required
                  />
                </div>
              </div>
            </section>
          </div>

          <div className="flex shrink-0 flex-col gap-2 border-t border-[var(--ep-line)] bg-[var(--ep-surface)] px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:px-7 sm:py-4">
            <button
              type="button"
              onClick={resetToDefaults}
              className="inline-flex min-h-9 shrink-0 items-center justify-center gap-1.5 self-center whitespace-nowrap rounded-xl px-3 text-xs font-semibold text-[var(--ep-text-muted)] transition-colors hover:bg-[var(--ep-tint)] hover:text-[var(--ep-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ep-accent)] sm:min-h-10 sm:self-auto sm:px-2.5"
            >
              <Icon name="repeat" size={14} strokeWidth={2} className="shrink-0" />
              <span>Reset defaults</span>
            </button>
            <div className="grid w-full grid-cols-2 gap-2.5 sm:flex sm:w-auto sm:items-center sm:gap-3">
              <button
                type="button"
                onClick={onClose}
                className="min-h-11 inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border border-[var(--ep-line)] bg-[var(--ep-surface)] px-4 text-sm font-semibold text-[var(--ep-text)] transition-colors hover:bg-[var(--ep-tint)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ep-accent)] sm:min-w-[120px] sm:px-5"
              >
                <Icon name="x" size={14} strokeWidth={2} className="shrink-0" />
                <span>Cancel</span>
              </button>
              <button
                type="submit"
                className="min-h-11 inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl bg-[var(--ep-accent)] px-4 text-sm font-semibold text-[var(--ep-on-accent)] shadow-sm transition hover:bg-[var(--ep-accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ep-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ep-surface)] sm:min-w-[140px] sm:px-5"
              >
                <Icon name="plus" size={15} strokeWidth={2.2} className="shrink-0" />
                <span>Add Tank</span>
              </button>
            </div>
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
