import { useState } from "react";
import type { AlertItem } from "@/types";
import type { Tank } from "@/features/dashboard/context/TankContext";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

const REMOVE_ANIMATION_MS = 200;

export function TankRow(tank: Tank & { onRemove?: (id: string) => void; onEdit?: (id: string) => void }) {
  const { id, name, pl, onRemove, onEdit } = tank;
  const [confirmingRemove, setConfirmingRemove] = useState(false);
  const [leaving, setLeaving] = useState(false);

  function handleConfirmRemove() {
    setConfirmingRemove(false);
    setLeaving(true);
    setTimeout(() => onRemove?.(id), REMOVE_ANIMATION_MS);
  }

  return (
    <article
      aria-label={`${name} tank`}
      className={`dashboard-tank-row dashboard-hover min-w-0 rounded-xl border border-[var(--ep-line)] bg-[var(--ep-surface)] p-4 transition-colors ${leaving ? "ep-row-out" : "ep-row-in"}`}
    >
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span aria-hidden="true" className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--ep-accent-tint)] text-[var(--ep-primary)]">▦</span>
          <div className="min-w-0">
            <h3 className="break-words text-sm font-semibold text-[var(--ep-text)]">{name}</h3>
            <p className="ep-font-mono mt-0.5 text-[11px] text-[var(--ep-text-muted)]">{pl}</p>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {onEdit && (
            <button type="button" onClick={() => onEdit(id)} className="min-h-9 rounded-lg border border-[var(--ep-line)] px-3 text-xs font-semibold text-[var(--ep-text-muted)] transition-colors hover:border-[var(--ep-accent)] hover:bg-[var(--ep-accent-tint)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ep-accent)]">Edit</button>
          )}
          {onRemove && (
            <button type="button" onClick={() => setConfirmingRemove(true)} disabled={leaving} aria-label={`Remove ${name}`} className="dashboard-tank-remove ep-focus-ring flex h-9 w-9 items-center justify-center rounded-lg text-[var(--ep-text-muted)] transition-colors hover:bg-[var(--ep-line)] hover:text-[var(--ep-status-danger)]">✕</button>
          )}
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
