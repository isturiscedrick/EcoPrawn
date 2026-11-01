"use client";

import { useEffect, useState } from "react";

interface SensorThresholdModalProps {
  open: boolean;
  onClose: () => void;
}

interface ThresholdForm {
  dissolvedOxygenMin: number;
  phMin: number;
  phMax: number;
  temperatureMin: number;
  temperatureMax: number;
  salinityMin: number;
  salinityMax: number;
}

const defaults: ThresholdForm = {
  dissolvedOxygenMin: 4.5,
  phMin: 7.5,
  phMax: 8.5,
  temperatureMin: 26,
  temperatureMax: 30,
  salinityMin: 10,
  salinityMax: 20,
};

export function SensorThresholdModal({ open, onClose }: SensorThresholdModalProps) {
  const [values, setValues] = useState<ThresholdForm>(defaults);

  useEffect(() => {
    if (!open) return;
    const saved = window.localStorage.getItem("ep-sensor-thresholds");
    if (!saved) return;
    try {
      setValues({ ...defaults, ...JSON.parse(saved) });
    } catch {
      setValues(defaults);
    }
  }, [open]);

  if (!open) return null;

  function update(key: keyof ThresholdForm, value: string) {
    setValues((current) => ({ ...current, [key]: Number(value) }));
  }

  function save() {
    window.localStorage.setItem("ep-sensor-thresholds", JSON.stringify(values));
    onClose();
  }

  const fields: [keyof ThresholdForm, string, string][] = [
    ["dissolvedOxygenMin", "Dissolved oxygen minimum", "mg/L"],
    ["phMin", "pH minimum", ""],
    ["phMax", "pH maximum", ""],
    ["temperatureMin", "Temperature minimum", "°C"],
    ["temperatureMax", "Temperature maximum", "°C"],
    ["salinityMin", "Salinity minimum", "ppt"],
    ["salinityMax", "Salinity maximum", "ppt"],
  ];

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-5">
      <button type="button" aria-label="Close sensor settings" onClick={onClose} className="absolute inset-0 bg-[rgba(8,30,34,0.65)] backdrop-blur-sm" />
      <section role="dialog" aria-modal="true" aria-labelledby="sensor-threshold-title" className="relative z-10 w-full max-w-[520px] rounded-2xl border border-[var(--ep-line)] bg-[var(--ep-surface)] p-6 text-[var(--ep-primary)] shadow-[var(--shadow-overlay)] sm:p-8">
        <div className="mb-6">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--ep-accent)]">Sensor configuration</p>
          <h2 id="sensor-threshold-title" className="ep-font-display text-2xl font-semibold">Configure safe ranges</h2>
          <p className="mt-2 text-sm leading-relaxed text-[var(--ep-text-muted)]">Adjust the local dashboard targets used to flag readings for review.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {fields.map(([key, label, unit]) => (
            <label key={key} className="text-sm font-semibold">
              <span className="mb-1.5 block">{label}{unit ? ` (${unit})` : ""}</span>
              <input
                type="number"
                step="0.1"
                value={values[key]}
                onChange={(event) => update(key, event.target.value)}
                className="min-h-11 w-full rounded-lg border border-[var(--ep-line)] bg-[var(--ep-bg)] px-3 text-base outline-none focus:border-[var(--ep-accent)]"
              />
            </label>
          ))}
        </div>
        <div className="mt-7 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="min-h-11 rounded-lg border border-[var(--ep-line)] px-4 text-sm font-semibold">Cancel</button>
          <button type="button" onClick={save} className="min-h-11 rounded-lg bg-[var(--ep-accent)] px-4 text-sm font-semibold text-white hover:bg-[var(--ep-accent-hover)]">Save ranges</button>
        </div>
      </section>
    </div>
  );
}
