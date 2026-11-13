import { useEffect, useRef, useState } from "react";
import { Icon, type IconName } from "@/components/ui/Icon";

interface PanelProps {
  title: string;
  badge?: string;
  onDetails?: () => void;
  icon?: IconName;
  children: React.ReactNode;
}

export function Panel({ title, badge, onDetails, icon = "layers", children }: PanelProps) {
  return (
    <section className="dashboard-panel group min-w-0 rounded-2xl border border-[var(--ep-line)] bg-[var(--ep-surface)] p-[22px_24px] shadow-[0_8px_24px_-18px_rgba(11,46,51,0.38)] transition-[border-color,box-shadow,transform] duration-200">
      <div className="mb-[18px] flex min-w-0 flex-wrap items-center justify-between gap-3">
        <h3 className="flex min-w-0 items-center gap-2 ep-font-display text-[18px] font-semibold text-[var(--ep-primary)]">
          <span className="dashboard-panel-icon flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[var(--ep-accent-tint)] text-[var(--ep-accent)]">
            <Icon name={icon} size={15} />
          </span>
          <span className="min-w-0">{title}</span>
        </h3>
        <div className="flex max-w-full shrink-0 flex-wrap items-center justify-end gap-2">
          {onDetails && (
            <button
              type="button"
              onClick={onDetails}
              aria-label={`View details for ${title}`}
              className="inline-flex min-h-10 items-center gap-1 rounded-lg px-2.5 text-xs font-semibold text-[var(--ep-accent)] transition-colors hover:bg-[var(--ep-accent-tint)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ep-accent)]"
            >
              <Icon name="eye" size={14} />
              <span>Details</span>
            </button>
          )}
          {badge && (
            <span className="dashboard-status-badge dashboard-status-info ep-font-mono max-w-full whitespace-normal">
              {badge}
            </span>
          )}
        </div>
      </div>
      {children}
    </section>
  );
}

interface KpiCardProps {
  label: string;
  value: string;
  unit: string;
  delta: string;
  deltaTone: "ok" | "warn";
  onDetails?: () => void;
}

export function KpiCard({ label, value, unit, delta, deltaTone, onDetails }: KpiCardProps) {
  // Briefly highlights changed values without counting through invented intermediate values.
  const [flash, setFlash] = useState(false);
  const prevValue = useRef(value);

  useEffect(() => {
    if (prevValue.current === value) return;
    prevValue.current = value;
    setFlash(true);
    const timeoutId = window.setTimeout(() => setFlash(false), 600);
    return () => window.clearTimeout(timeoutId);
  }, [value]);

  return (
    <section className="dashboard-kpi group min-w-0 rounded-2xl border border-[var(--ep-line)] bg-[var(--ep-surface)] p-5 px-[22px] shadow-[0_8px_24px_-18px_rgba(11,46,51,0.38)] transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-[var(--ep-accent)] hover:shadow-[0_14px_28px_-18px_rgba(11,46,51,0.42)]">
      <div className="mb-2.5 flex min-w-0 items-center justify-between gap-2">
        <div className="ep-font-mono min-w-0 text-xs font-medium uppercase tracking-wide text-[var(--ep-text-muted)]">
          {label}
        </div>
        {onDetails && (
          <button
            type="button"
            onClick={onDetails}
            aria-label={`View details for ${label}`}
            className="inline-flex min-h-10 shrink-0 items-center gap-1 rounded-lg px-2 text-xs font-semibold text-[var(--ep-accent)] transition-colors hover:bg-[var(--ep-accent-tint)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ep-accent)]"
          >
            <Icon name="eye" size={14} />
            <span>Details</span>
          </button>
        )}
      </div>
      <div className={`ep-font-display break-words text-[28px] font-semibold transition-colors duration-300 ${flash ? "text-[var(--ep-accent)]" : "text-[var(--ep-primary)]"}`}>
        {value}
        <span className="ml-[3px] text-base font-medium text-[var(--ep-text-muted)]">{unit}</span>
      </div>
      <div className={`mt-2 text-sm font-semibold ${deltaTone === "ok" ? "dashboard-status-text-success" : "dashboard-status-text-warning"}`}>
        {delta}
      </div>
    </section>
  );
}
