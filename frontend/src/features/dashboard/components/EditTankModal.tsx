import { useEffect, useId, useState, type FormEvent } from "react";
import type { Tank } from "@/features/dashboard/context/TankContext";

interface EditTankModalProps {
  tank: Tank | null;
  onClose: () => void;
  onSave: (id: string, patch: Pick<Tank, "name" | "pl" | "biomass" | "targetToday" | "dispensedToday" | "fcr">) => Promise<boolean>;
}

const fieldClass = "min-h-11 w-full rounded-lg border border-[var(--ep-line)] bg-[var(--ep-bg)] px-3 text-sm text-[var(--ep-text)] outline-none focus:border-[var(--ep-accent)] focus:ring-2 focus:ring-[var(--ep-accent-tint)]";

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
  }, [tank]);

  useEffect(() => {
    if (!tank) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !saving) onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [tank, saving, onClose]);

  if (!tank) return null;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const values = [biomass, targetToday, dispensedToday, fcr].map(Number);
    if (!name.trim() || name.trim().length > 100 || !pl.trim() || pl.trim().length > 100) {
      setError("Enter a tank name and PL batch (up to 100 characters each).");
      return;
    }
    if (values.some((value, index) => !Number.isFinite(value) || value < 0 || (index === 3 && value > 1000))) {
      setError("Enter valid non-negative numbers. FCR must be 1,000 or less.");
      return;
    }
    setSaving(true);
    setError(null);
    const saved = await onSave(tank.id, {
      name: name.trim(),
      pl: pl.trim(),
      biomass: values[0],
      targetToday: values[1],
      dispensedToday: values[2],
      fcr: values[3],
    });
    setSaving(false);
    if (saved) onClose();
    else setError("Could not save changes. Check your connection and try again.");
  }

  const fields = [
    { id: "name", label: "Tank name", value: name, change: setName, type: "text" },
    { id: "pl", label: "PL batch", value: pl, change: setPl, type: "text" },
    { id: "biomass", label: "Biomass (kg)", value: biomass, change: setBiomass, type: "number" },
    { id: "target", label: "Feed target today (kg)", value: targetToday, change: setTargetToday, type: "number" },
    { id: "dispensed", label: "Feed dispensed today (kg)", value: dispensedToday, change: setDispensedToday, type: "number" },
    { id: "fcr", label: "Feed conversion ratio", value: fcr, change: setFcr, type: "number" },
  ] as const;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-5" role="presentation">
      <button type="button" aria-label="Close edit tank dialog" onClick={onClose} disabled={saving} className="absolute inset-0 bg-black/55 backdrop-blur-sm" />
      <section role="dialog" aria-modal="true" aria-labelledby={`${uid}-title`} className="relative z-10 max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[var(--ep-line)] bg-[var(--ep-surface)] p-5 shadow-2xl sm:p-7">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--ep-accent)]">Tank configuration</p>
            <h2 id={`${uid}-title`} className="mt-1 ep-font-display text-xl font-semibold text-[var(--ep-primary)]">Edit {tank.name}</h2>
            <p className="mt-1 text-sm text-[var(--ep-text-muted)]">Update the tank details and feeding targets.</p>
          </div>
          <button type="button" onClick={onClose} disabled={saving} aria-label="Close" className="min-h-10 min-w-10 rounded-lg text-xl text-[var(--ep-text-muted)] hover:bg-[var(--ep-bg-subtle)]">×</button>
        </div>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {fields.map((field) => (
            <label key={field.id} htmlFor={`${uid}-${field.id}`} className="min-w-0 text-xs font-semibold text-[var(--ep-text-muted)]">
              {field.label}
              <input id={`${uid}-${field.id}`} className={`${fieldClass} mt-1.5`} type={field.type} inputMode={field.type === "number" ? "decimal" : undefined} min={field.type === "number" ? "0" : undefined} maxLength={field.type === "text" ? 100 : undefined} step={field.type === "number" ? "any" : undefined} value={field.value} onChange={(event) => field.change(event.target.value)} required />
            </label>
          ))}
          {error && <p role="alert" className="sm:col-span-2 text-sm text-[var(--ep-status-danger)]">{error}</p>}
          <div className="mt-2 flex gap-3 sm:col-span-2">
            <button type="button" onClick={onClose} disabled={saving} className="min-h-11 flex-1 rounded-lg border border-[var(--ep-line)] px-4 text-sm font-semibold text-[var(--ep-text-muted)] hover:bg-[var(--ep-bg-subtle)] disabled:opacity-50">Cancel</button>
            <button type="submit" disabled={saving} className="min-h-11 flex-1 rounded-lg bg-[var(--ep-accent)] px-4 text-sm font-semibold text-white hover:bg-[var(--ep-accent-hover)] disabled:cursor-wait disabled:opacity-60">{saving ? "Saving…" : "Save changes"}</button>
          </div>
        </form>
      </section>
    </div>
  );
}
