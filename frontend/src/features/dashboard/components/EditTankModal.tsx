import { useEffect, useId, useState, type FormEvent } from "react";
import type { Tank } from "@/features/dashboard/context/TankContext";
import { TANK_LIMITS } from "@/features/dashboard/validateNewTank";
import { Icon } from "@/components/ui/Icon";
import { DashboardFormField, DashboardModalShell } from "./DashboardPrimitives";

interface EditTankModalProps {
  tank: Tank | null;
  onClose: () => void;
  onSave: (id: string, patch: Pick<Tank, "name" | "pl" | "biomass" | "targetToday" | "dispensedToday" | "fcr">) => Promise<boolean>;
}

const fieldClass =
  "min-h-11 w-full rounded-xl border border-[var(--ep-line)] bg-[var(--ep-bg)] px-3 text-sm text-[var(--ep-text)] outline-none transition focus:border-[var(--ep-primary)] focus:ring-2 focus:ring-[var(--ep-primary)]/15";

export function EditTankModal({ tank, onClose, onSave }: EditTankModalProps) {
  const uid = useId();
  const [name, setName] = useState("");
  const [pl, setPl] = useState("");
  const [biomass, setBiomass] = useState("");
  const [targetToday, setTargetToday] = useState("");
  const [dispensedToday, setDispensedToday] = useState("");
  const [fcr, setFcr] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<Pick<Tank, "name" | "pl" | "biomass" | "targetToday" | "dispensedToday" | "fcr"> | null>(null);

  useEffect(() => {
    if (!tank) return;
    setName(tank.name);
    setPl(tank.pl);
    setBiomass(String(tank.biomass));
    setTargetToday(String(tank.targetToday));
    setDispensedToday(String(tank.dispensedToday));
    setFcr(String(tank.fcr));
    setError(null);
    setSaving(false);
    setPendingChanges(null);
  }, [tank]);

  useEffect(() => {
    if (!tank) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [tank]);

  useEffect(() => {
    if (!tank) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || saving) return;
      event.preventDefault();
      if (pendingChanges) setPendingChanges(null);
      else onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [tank, saving, pendingChanges, onClose]);

  if (!tank) return null;
  const currentTank = tank;
  const displayId = `#${currentTank.id.replace(/^tank-?/i, "").padStart(2, "0") || currentTank.id}`;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim() || name.trim().length > TANK_LIMITS.nameMaxLength || !pl.trim() || pl.trim().length > TANK_LIMITS.plMaxLength) {
      setError(`Enter a tank name and PL batch (up to ${TANK_LIMITS.nameMaxLength} characters each).`);
      return;
    }
    const rawNumeric = [
      { label: "Biomass", raw: biomass, min: TANK_LIMITS.biomass.min, max: TANK_LIMITS.biomass.max, unit: " kg" },
      { label: "Feed target", raw: targetToday, min: TANK_LIMITS.targetToday.min, max: TANK_LIMITS.targetToday.max, unit: " kg" },
      { label: "Feed dispensed", raw: dispensedToday, min: TANK_LIMITS.dispensedToday.min, max: TANK_LIMITS.dispensedToday.max, unit: " kg" },
      { label: "FCR", raw: fcr, min: TANK_LIMITS.fcr.min, max: TANK_LIMITS.fcr.max, unit: "" },
    ];
    const parsed: number[] = [];
    for (const item of rawNumeric) {
      const trimmed = item.raw.trim();
      if (!/^\d+(?:\.\d{1,4})?$/.test(trimmed)) {
        setError(`${item.label} must be a valid non-negative number (up to 4 decimal places).`);
        return;
      }
      const value = Number(trimmed);
      if (!Number.isFinite(value) || value < item.min || value > item.max) {
        setError(`${item.label} must be between ${item.min.toLocaleString("en-US")} and ${item.max.toLocaleString("en-US")}${item.unit}.`);
        return;
      }
      parsed.push(value);
    }
    setError(null);
    setPendingChanges({
      name: name.trim(),
      pl: pl.trim(),
      biomass: parsed[0],
      targetToday: parsed[1],
      dispensedToday: parsed[2],
      fcr: parsed[3],
    });
  }

  async function confirmSave() {
    if (!pendingChanges || saving) return;
    setSaving(true);
    setError(null);
    const saved = await onSave(currentTank.id, pendingChanges);
    setSaving(false);
    if (saved) {
      setPendingChanges(null);
      onClose();
    } else {
      setPendingChanges(null);
      setError("Could not save changes. Check your connection and try again.");
    }
  }

  const fields = [
    { id: "name", label: "Tank name", value: name, change: setName, type: "text", icon: "layers" as const, max: undefined },
    { id: "pl", label: "PL batch code", value: pl, change: setPl, type: "text", icon: "package" as const, max: undefined },
    { id: "biomass", label: "Biomass stock (kg)", value: biomass, change: setBiomass, type: "number", icon: "sprout" as const, max: TANK_LIMITS.biomass.max },
    { id: "target", label: "Feed target today (kg)", value: targetToday, change: setTargetToday, type: "number", icon: "utensils" as const, max: TANK_LIMITS.targetToday.max },
    { id: "dispensed", label: "Feed dispensed today (kg)", value: dispensedToday, change: setDispensedToday, type: "number", icon: "clock" as const, max: TANK_LIMITS.dispensedToday.max },
    { id: "fcr", label: "Feed conversion ratio (FCR)", value: fcr, change: setFcr, type: "number", icon: "chart-bars-trend" as const, max: TANK_LIMITS.fcr.max },
  ] as const;

  return (
    <>
    {!pendingChanges && <DashboardModalShell
      titleId={`${uid}-title`}
      onClose={onClose}
      backdropLabel="Close edit tank dialog"
      backdropDisabled={saving}
      panelClassName="p-6 sm:p-8"
    >
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--ep-primary)]">
            <Icon name="layers" size={12} strokeWidth={2} />
            Tank Configuration
          </p>
          <div className="mt-1 flex items-center gap-2 flex-wrap">
            <h2 id={`${uid}-title`} className="ep-font-display text-xl font-bold text-[var(--ep-text)] sm:text-2xl">
              Edit {tank.name}
            </h2>
            <span className="inline-flex items-center rounded-md border border-[var(--ep-accent)]/30 bg-[var(--ep-accent-tint)]/60 px-2 py-0.5 font-mono text-xs font-bold text-[var(--ep-primary)] shadow-2xs">
              {displayId}
            </span>
          </div>
          <p className="mt-1.5 text-xs text-[var(--ep-text-muted)] sm:text-sm">
            Update stocking density, batch information, and feeding targets.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          disabled={saving}
          aria-label="Close edit tank dialog"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--ep-line)] bg-[var(--ep-surface)] text-lg text-[var(--ep-text-muted)] transition-colors hover:bg-[var(--ep-tint)] hover:text-[var(--ep-primary)] disabled:opacity-50"
        >
          ×
        </button>
      </div>

      <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {fields.map((field) => (
          <DashboardFormField key={field.id} id={`${uid}-${field.id}`} label={field.label} icon={field.icon}>
            <input
              id={`${uid}-${field.id}`}
              className={`${fieldClass} mt-1`}
              type={field.type}
              inputMode={field.type === "number" ? "decimal" : undefined}
              min={field.type === "number" ? "0" : undefined}
              max={field.max}
              maxLength={field.type === "text" ? TANK_LIMITS.nameMaxLength : undefined}
              step={field.type === "number" ? "any" : undefined}
              value={field.value}
              onChange={(event) => field.change(event.target.value)}
              required
            />
          </DashboardFormField>
        ))}

        {error && (
          <p role="alert" className="sm:col-span-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs font-medium text-rose-600 dark:text-rose-300">
            {error}
          </p>
        )}

        <div className="mt-4 flex gap-3 sm:col-span-2">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="min-h-11 flex-1 rounded-xl border border-[var(--ep-line)] bg-[var(--ep-surface)] px-4 text-sm font-semibold text-[var(--ep-text)] transition-colors hover:bg-[var(--ep-tint)] disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="min-h-11 flex-1 rounded-xl bg-[var(--ep-primary)] px-4 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>

    </DashboardModalShell>}
    {pendingChanges && (
      <div className="dashboard-confirm-layer fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-md" role="presentation">
        <section
          role="alertdialog"
          aria-modal="true"
          aria-labelledby={`${uid}-confirm-title`}
          aria-describedby={`${uid}-confirm-description`}
          className="dashboard-confirm-panel w-full max-w-md rounded-2xl border border-[var(--ep-line)] bg-[var(--ep-surface)] p-6 shadow-2xl"
        >
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--ep-accent-tint)] text-[var(--ep-primary)]">
            <Icon name="check" size={18} strokeWidth={2.5} />
          </div>
          <h3 id={`${uid}-confirm-title`} className="text-lg font-bold text-[var(--ep-text)]">
            Save changes to {displayId}?
          </h3>
          <p id={`${uid}-confirm-description`} className="mt-2 text-sm leading-6 text-[var(--ep-text-muted)]">
            Are you sure you want to update the records for <strong className="text-[var(--ep-text)]">{pendingChanges.name}</strong>?
          </p>
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              disabled={saving}
              onClick={() => setPendingChanges(null)}
              className="min-h-10 rounded-xl border border-[var(--ep-line)] px-4 text-sm font-semibold text-[var(--ep-text)] hover:bg-[var(--ep-tint)] disabled:opacity-50"
            >
              Review changes
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => void confirmSave()}
              className="min-h-10 rounded-xl bg-[var(--ep-primary)] px-4 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "Saving…" : "Yes, save changes"}
            </button>
          </div>
        </section>
      </div>
    )}
    </>
  );
}
