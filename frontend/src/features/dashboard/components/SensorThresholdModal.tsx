import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { Icon } from "@/components/ui/Icon";
import { useToast } from "@/features/dashboard/components/Toast";

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

  // On open: load saved values, lock page scroll, focus the first field, trap Tab,
  // close on Escape, and hand focus back to whatever opened the dialog.
  useEffect(() => {
    if (!open) return;
    setValues(loadSaved());
    setTouched({});
    setSubmitted(false);

    const opener = document.activeElement as HTMLElement | null;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.querySelector<HTMLElement>("input")?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
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
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-5">
      <button
        type="button"
        tabIndex={-1}
        aria-label="Close sensor settings"
        onClick={onClose}
        className="absolute inset-0 bg-[rgba(8,30,34,0.65)] backdrop-blur-sm dark:bg-[rgba(0,0,0,0.76)]"
      />
      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${uid}-title`}
        className="relative z-10 max-h-[90vh] w-full max-w-[520px] overflow-y-auto rounded-2xl border border-[var(--ep-line)] bg-[var(--ep-surface)] p-6 text-[var(--ep-primary)] shadow-[var(--shadow-overlay)] sm:p-8"
      >
        <div className="mb-6">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--ep-accent)]">Sensor configuration</p>
          <h2 id={`${uid}-title`} className="ep-font-display text-2xl font-semibold">Configure safe ranges</h2>
          <p className="mt-2 text-sm leading-relaxed text-[var(--ep-text-muted)]">
            Saved on this device only. Alerts and gauge colors still use the facility defaults until these ranges are connected.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            {FIELDS.map((field) => {
              const error = touched[field.key] || submitted ? errors[field.key] : undefined;
              const errorId = `${uid}-${field.key}-error`;
              return (
                <div key={field.key}>
                  <label htmlFor={`${uid}-${field.key}`} className="text-sm font-semibold">
                    <span className="mb-1.5 block">
                      {field.label}
                      {field.unit ? ` (${field.unit})` : ""}
                    </span>
                  </label>
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
                    className={`min-h-11 w-full rounded-lg border bg-[var(--ep-bg)] px-3 text-base outline-none focus:border-[var(--ep-accent)] ${
                      error ? "border-[#b3261e] dark:border-[#ff8a80]" : "border-[var(--ep-line)]"
                    }`}
                  />
                  {error && (
                    <p
                      id={errorId}
                      className="mt-1.5 flex items-start gap-1.5 text-[13px] font-semibold text-[#b3261e] dark:text-[#ff8a80]"
                    >
                      <Icon name="x" size={14} strokeWidth={2.5} className="mt-0.5 shrink-0" />
                      <span>{error}</span>
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-7 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="min-h-11 rounded-lg px-3 text-sm font-semibold text-[var(--ep-text-muted)] underline underline-offset-4 hover:text-[var(--ep-primary)]"
            >
              Reset to defaults
            </button>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="min-h-11 rounded-lg border border-[var(--ep-line)] px-4 text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="min-h-11 rounded-lg bg-[var(--ep-accent)] px-4 text-sm font-semibold text-white hover:bg-[var(--ep-accent-hover)]"
              >
                Save ranges
              </button>
            </div>
          </div>
        </form>
      </section>
    </div>
  );
}