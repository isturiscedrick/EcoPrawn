import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { Icon } from "@/components/ui/Icon";
import { useToast } from "@/features/dashboard/components/Toast";
import { DashboardFormField, DashboardModalShell } from "./DashboardPrimitives";

interface SensorThresholdModalProps {
  open: boolean;
  onClose: () => void;
}

type FieldKey =
  | "dissolvedOxygenMin"
  | "phMin"
  | "phMax"
  | "temperatureMin"
  | "temperatureMax"
  | "salinityMin"
  | "salinityMax";

type ThresholdForm = Record<FieldKey, string>;
type FieldErrors = Partial<Record<FieldKey, string>>;

const STORAGE_KEY = "ep-sensor-thresholds";

const defaults: ThresholdForm = {
  dissolvedOxygenMin: "4.5",
  phMin: "7.5",
  phMax: "8.5",
  temperatureMin: "26",
  temperatureMax: "30",
  salinityMin: "10",
  salinityMax: "20",
};

// Allowed range per field matches the limits validateNewTank enforces.
const FIELDS: { key: FieldKey; label: string; unit: string; min: number; max: number }[] = [
  { key: "dissolvedOxygenMin", label: "Dissolved oxygen minimum", unit: "mg/L", min: 0, max: 100 },
  { key: "phMin", label: "pH minimum", unit: "", min: 0, max: 14 },
  { key: "phMax", label: "pH maximum", unit: "", min: 0, max: 14 },
  { key: "temperatureMin", label: "Temperature minimum", unit: "°C", min: -55, max: 125 },
  { key: "temperatureMax", label: "Temperature maximum", unit: "°C", min: -55, max: 125 },
  { key: "salinityMin", label: "Salinity minimum", unit: "ppt", min: 0, max: 1000 },
  { key: "salinityMax", label: "Salinity maximum", unit: "ppt", min: 0, max: 1000 },
];

const PAIRS: [FieldKey, FieldKey][] = [
  ["phMin", "phMax"],
  ["temperatureMin", "temperatureMax"],
  ["salinityMin", "salinityMax"],
];

function validate(values: ThresholdForm): FieldErrors {
  const errors: FieldErrors = {};
  for (const field of FIELDS) {
    const raw = values[field.key].trim();
    const number = Number(raw);
    if (raw === "") errors[field.key] = "Enter a value.";
    else if (!Number.isFinite(number)) errors[field.key] = "Enter a number.";
    else if (number < field.min || number > field.max) {
      errors[field.key] = `Use a value from ${field.min} to ${field.max}.`;
    }
  }
  for (const [low, high] of PAIRS) {
    if (!errors[low] && !errors[high] && Number(values[low]) >= Number(values[high])) {
      errors[high] = "Maximum must be greater than the minimum.";
    }
  }
  return errors;
}

function loadSaved(): ThresholdForm {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return defaults;
    const parsed: unknown = JSON.parse(saved);
    if (typeof parsed !== "object" || parsed === null) return defaults;
    const next = { ...defaults };
    for (const field of FIELDS) {
      const value = (parsed as Record<string, unknown>)[field.key];
      if (typeof value === "number" && Number.isFinite(value)) next[field.key] = String(value);
    }
    return next;
  } catch {
    return defaults;
  }
}

export function SensorThresholdModal({ open, onClose }: SensorThresholdModalProps) {
  const uid = useId();
  const { showToast } = useToast();
  const dialogRef = useRef<HTMLElement>(null);
  const [values, setValues] = useState<ThresholdForm>(defaults);
  const [touched, setTouched] = useState<Partial<Record<FieldKey, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);

  // Keep the latest onClose without re-running the open/focus effect.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return;
    setValues(loadSaved());
    setTouched({});
    setSubmitted(false);

    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusFrame = window.requestAnimationFrame(() => {
      if (window.matchMedia("(max-width: 639px)").matches) {
        dialogRef.current?.focus({ preventScroll: true });
      } else {
        dialogRef.current?.querySelector<HTMLInputElement>("input")?.focus();
      }
    });

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab") return;
      const items = dialogRef.current?.querySelectorAll<HTMLElement>("button:not([disabled]), input:not([disabled])");
      if (!items || items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = originalOverflow;
      opener?.focus();
    };
  }, [open]);

  if (!open) return null;

  const errors = validate(values);

  function update(key: FieldKey, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitted(true);
    const firstInvalid = FIELDS.find((field) => errors[field.key]);
    if (firstInvalid) {
      dialogRef.current?.querySelector<HTMLInputElement>(`[name="${firstInvalid.key}"]`)?.focus();
      return;
    }
    try {
      const numeric = Object.fromEntries(FIELDS.map((field) => [field.key, Number(values[field.key])]));
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(numeric));
      showToast("Ranges saved on this device.");
      onClose();
    } catch {
      showToast("Could not save ranges. Check your browser storage settings.", "error");
    }
  }

  function handleReset() {
    setValues(defaults);
    setTouched({});
    setSubmitted(false);
  }

  return (
    <DashboardModalShell
      titleId={`${uid}-title`}
      onClose={onClose}
      dialogRef={dialogRef}
      layerClassName="z-[120]"
      panelClassName="p-6 sm:p-8"
      backdropLabel="Close sensor settings"
      backdropTabIndex={-1}
    >
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--ep-primary)]">
            <Icon name="sliders-horizontal" size={12} strokeWidth={2} />
            Sensor Configuration
          </p>
          <h2 id={`${uid}-title`} className="mt-1 ep-font-display text-xl font-bold tracking-tight text-[var(--ep-text)] sm:text-2xl">
            Configure Safe Ranges
          </h2>
          <p className="mt-1.5 text-xs text-[var(--ep-text-muted)] sm:text-sm leading-relaxed">
            Custom sensory thresholds saved on this device. Live telemetry warnings and gauge alerts will reference these bounds.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close sensor settings dialog"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--ep-line)] bg-[var(--ep-surface)] text-lg text-[var(--ep-text-muted)] transition-colors hover:bg-[var(--ep-tint)] hover:text-[var(--ep-primary)]"
        >
          ×
        </button>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          {FIELDS.map((field) => {
            const error = touched[field.key] || submitted ? errors[field.key] : undefined;
            const errorId = `${uid}-${field.key}-error`;
            return (
              <DashboardFormField
                key={field.key}
                id={`${uid}-${field.key}`}
                label={`${field.label}${field.unit ? ` (${field.unit})` : ""}`}
                labelClassName="mb-1.5 block text-xs font-semibold text-[var(--ep-text-muted)]"
              >
                <input
                  id={`${uid}-${field.key}`}
                  name={field.key}
                  type="number"
                  inputMode="decimal"
                  step="0.1"
                  value={values[field.key]}
                  onChange={(event) => update(field.key, event.target.value)}
                  onBlur={() => setTouched((current) => ({ ...current, [field.key]: true }))}
                  aria-invalid={error ? true : undefined}
                  aria-describedby={error ? errorId : undefined}
                  className={`min-h-11 w-full rounded-xl border bg-[var(--ep-bg)] px-3 text-sm text-[var(--ep-text)] outline-none transition focus:border-[var(--ep-primary)] focus:ring-2 focus:ring-[var(--ep-primary)]/15 ${
                    error ? "border-rose-500" : "border-[var(--ep-line)]"
                  }`}
                />
                {error && (
                  <p
                    id={errorId}
                    className="mt-1.5 flex items-start gap-1 text-xs font-medium text-rose-600 dark:text-rose-400"
                  >
                    <Icon name="x" size={13} strokeWidth={2.5} className="mt-0.5 shrink-0" />
                    <span>{error}</span>
                  </p>
                )}
              </DashboardFormField>
            );
          })}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--ep-line)] pt-5">
          <button
            type="button"
            onClick={handleReset}
            className="min-h-11 rounded-xl px-3 text-xs font-semibold text-[var(--ep-text-muted)] hover:text-[var(--ep-primary)] transition-colors"
          >
            Reset to defaults
          </button>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="min-h-11 rounded-xl border border-[var(--ep-line)] bg-[var(--ep-surface)] px-4 text-sm font-semibold text-[var(--ep-text)] hover:bg-[var(--ep-tint)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="min-h-11 rounded-xl bg-[var(--ep-primary)] px-5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
            >
              Save ranges
            </button>
          </div>
        </div>
      </form>
    </DashboardModalShell>
  );
}
