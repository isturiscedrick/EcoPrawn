import { useState } from "react";
import type { AlertItem } from "@/types";
import type { Tank } from "@/features/dashboard/context/TankContext";
import { THRESHOLDS, rangeStatus } from "@/features/dashboard/lib/thresholds";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

const REMOVE_ANIMATION_MS = 200;

const readingDefinitions = [
  { key: "dissolvedOxygen", label: "Dissolved O₂", unit: "mg/L", min: THRESHOLDS.dissolvedOxygen.min },
  { key: "ph", label: "pH", unit: "", min: THRESHOLDS.ph.min, max: THRESHOLDS.ph.max },
  { key: "temperature", label: "Temperature", unit: "°C", min: THRESHOLDS.temperature.min, max: THRESHOLDS.temperature.max },
  { key: "salinity", label: "Salinity", unit: "ppt", min: THRESHOLDS.salinity.min, max: THRESHOLDS.salinity.max },
  { key: "waterLevel", label: "Water level", unit: "%", min: THRESHOLDS.waterLevel.min },
] as const;

export function TankRow(tank: Tank & { onRemove?: (id: string) => void; onViewDetails?: (id: string) => void; onEdit?: (id: string) => void }) {
  const { id, name, pl, biomass, status, hasWaterReadings, onRemove, onViewDetails, onEdit } = tank;
  const [confirmingRemove, setConfirmingRemove] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const warningCount = hasWaterReadings
    ? readingDefinitions.filter((reading) =>
        rangeStatus(tank[reading.key], reading.min, "max" in reading ? reading.max : undefined) === "warn"
      ).length
    : 0;

  function handleConfirmRemove() {
    setConfirmingRemove(false);
    setLeaving(true);
    // Let the slide-out finish before the row is actually removed.
    setTimeout(() => onRemove?.(id), REMOVE_ANIMATION_MS);
  }

  return (
    <article
      aria-label={`${name} tank overview`}
      className={`dashboard-tank-row dashboard-hover min-w-0 rounded-xl border border-[var(--ep-line)] bg-[var(--ep-surface)] p-4 transition-colors ${
        leaving ? "ep-row-out" : "ep-row-in"
      }`}
    >
      <div className="flex min-w-0 flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span
            aria-hidden="true"
            className={`h-2.5 w-2.5 shrink-0 rounded-full ${
              status === "ok" ? "bg-[var(--ep-status-success)]" : "bg-[var(--ep-status-warning)]"
            }`}
          />
          <div className="min-w-0">
            <h3 className="break-words text-sm font-semibold text-[var(--ep-text)]">{name}</h3>
            <p className="ep-font-mono mt-0.5 text-[11px] text-[var(--ep-text-muted)]">{pl}</p>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
          {onEdit && (
            <button type="button" onClick={() => onEdit(id)} className="min-h-9 rounded-lg border border-[var(--ep-line)] px-3 text-xs font-semibold text-[var(--ep-text-muted)] transition-colors hover:border-[var(--ep-accent)] hover:bg-[var(--ep-accent-tint)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ep-accent)]">Edit</button>
          )}
          {onViewDetails && (
            <button
              type="button"
              onClick={() => onViewDetails(id)}
              className="min-h-9 rounded-lg border border-[var(--ep-line)] px-3 text-xs font-semibold text-[var(--ep-accent)] transition-colors hover:border-[var(--ep-accent)] hover:bg-[var(--ep-accent-tint)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ep-accent)]"
            >
              View details
            </button>
          )}
          <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
            status === "ok"
              ? "border border-[var(--ep-status-success)] text-[var(--ep-status-success)]"
              : "border border-[var(--ep-status-warning)] text-[var(--ep-status-warning)]"
          }`}>
            {status === "ok" ? "Stable" : hasWaterReadings ? `${warningCount} readings out of range` : "No readings"}
          </span>
          {onRemove && (
            <button
              type="button"
              onClick={() => setConfirmingRemove(true)}
              disabled={leaving}
              aria-label={`Remove ${name}`}
              className="dashboard-tank-remove ep-focus-ring flex h-9 w-9 items-center justify-center rounded-lg text-[var(--ep-text-muted)] transition-colors hover:bg-[var(--ep-line)] hover:text-[var(--ep-status-danger)]"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {readingDefinitions.map((reading) => {
          const value = tank[reading.key];
          const readingStatus = rangeStatus(value, reading.min, "max" in reading ? reading.max : undefined);
          return (
            <div key={reading.key} className="min-w-0 rounded-lg border border-[var(--ep-line)] bg-[var(--ep-surface)] px-3 py-2">
              <div className="truncate text-[10px] font-medium text-[var(--ep-text-muted)]">{reading.label}</div>
              <div className={`ep-font-mono mt-1 text-sm font-semibold tabular-nums ${
                hasWaterReadings
                  ? readingStatus === "warn" ? "text-[var(--ep-status-warning)]" : "text-[var(--ep-text)]"
                  : "text-[var(--ep-text-muted)]"
              }`}>
                {hasWaterReadings ? `${value.toFixed(1)}${reading.unit ? ` ${reading.unit}` : ""}` : "—"}
              </div>
              {hasWaterReadings && (
                <div className={`mt-0.5 text-[9px] font-semibold ${
                  readingStatus === "warn" ? "text-[var(--ep-status-warning)]" : "text-[var(--ep-status-success)]"
                }`}>
                  {readingStatus === "warn" ? "Needs attention" : "In range"}
                </div>
              )}
            </div>
          );
        })}
        <div className="min-w-0 rounded-lg border border-[var(--ep-line)] bg-[var(--ep-bg-subtle)] px-3 py-2">
          <div className="truncate text-[10px] font-medium text-[var(--ep-text-muted)]">Biomass</div>
          <div className="ep-font-mono mt-1 text-sm font-semibold tabular-nums text-[var(--ep-text)]">{biomass.toFixed(1)} kg</div>
          <div className="mt-0.5 text-[9px] font-semibold text-[var(--ep-text-muted)]">Current stock</div>
        </div>
      </div>

      {onRemove && (
        <ConfirmDialog
          open={confirmingRemove}
          tone="danger"
          title={`Remove ${name}?`}
          description={`This removes ${name} and its readings from the dashboard. This can't be undone.`}
          confirmLabel="Remove tank"
          onCancel={() => setConfirmingRemove(false)}
          onConfirm={handleConfirmRemove}
        />
      )}
    </article>
  );
}

export function AlertRow({ icon, title, detail, time }: AlertItem) {
  return (
    <div className="dashboard-alert-row dashboard-hover flex gap-3 rounded-lg border-t border-[var(--sand-dim)] px-2 py-3 first:border-t-0 first:pt-3">
      <div
        className={`w-[26px] h-[26px] rounded-[7px] flex items-center justify-center text-xs flex-shrink-0 ${
          icon === "warn"
            ? "dashboard-status-warning"
            : "dashboard-status-success"
        }`}
      >
        {icon === "warn" ? "!" : "✓"}
      </div>
      <div className="min-w-0">
        <b className="text-[13px] text-[var(--water-deep)] block mb-0.5">{title}</b>
        <span className="text-xs text-[rgba(11,35,32,0.55)]">{detail}</span>
      </div>
      <div className="dashboard-alert-time ep-font-mono text-[10.5px] text-[rgba(11,35,32,0.4)] ml-auto whitespace-nowrap self-center">
        {time}
      </div>
    </div>
  );
}
