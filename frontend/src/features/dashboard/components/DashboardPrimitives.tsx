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
          <span className="dashboard-panel-icon flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[var(--ep-accent-tint)] text-[var(--ep-accent)] shadow-2xs">
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
              className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-[var(--ep-line)] bg-[var(--ep-surface)] px-2.5 text-xs font-semibold text-[var(--ep-accent)] transition-colors hover:bg-[var(--ep-accent-tint)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ep-accent)]"
            >
              <Icon name="eye" size={13} />
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

interface KpiGridProps {
  label: string;
  children: React.ReactNode;
}

/** Responsive 4-card grid for dashboard KPI summaries. */
export function KpiGrid({ label, children }: KpiGridProps) {
  return (
    <section aria-label={label} className="mb-6 grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
  icon?: IconName;
  onDetails?: () => void;
}

export function KpiCard({ label, value, unit, delta, deltaTone, icon, onDetails }: KpiCardProps) {
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
    <section className="dashboard-kpi group relative min-w-0 rounded-2xl border border-[var(--ep-line)] bg-[var(--ep-surface)] p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--ep-accent)]/50 hover:shadow-md">
      <div className="mb-3 flex min-w-0 items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {icon && (
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[var(--ep-accent-tint)] text-[var(--ep-accent)] shadow-2xs">
              <Icon name={icon} size={15} />
            </span>
          )}
          <div className="ep-font-mono min-w-0 text-xs font-semibold uppercase tracking-wider text-[var(--ep-text-muted)] truncate">
            {label}
          </div>
        </div>
        {onDetails && (
          <button
            type="button"
            onClick={onDetails}
            aria-label={`View details for ${label}`}
            className="inline-flex min-h-8 shrink-0 items-center gap-1 rounded-lg px-2 text-xs font-semibold text-[var(--ep-accent)] transition-colors hover:bg-[var(--ep-accent-tint)] focus-visible:outline-2 focus-visible:outline-[var(--ep-accent)]"
          >
            <Icon name="eye" size={13} />
            <span>Details</span>
          </button>
        )}
      </div>
      <div className={`ep-font-display break-words text-[28px] font-bold tracking-tight transition-colors duration-300 ${flash ? "text-[var(--ep-accent)]" : "text-[var(--ep-text)]"}`}>
        {value}
        {unit && <span className="ml-1 text-sm font-medium text-[var(--ep-text-muted)]">{unit}</span>}
      </div>
      {delta && (
        <div className={`mt-2 flex items-center gap-1.5 text-xs font-semibold ${deltaTone === "warn" ? "text-amber-500" : "text-emerald-500"}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${deltaTone === "warn" ? "bg-amber-500" : "bg-emerald-500"}`} />
          <span>{delta}</span>
        </div>
      )}
    </section>
  );
}

interface DashboardModalShellProps {
  titleId: string;
  onClose: () => void;
  children: React.ReactNode;
  dialogRef?: React.Ref<HTMLElement>;
  layerClassName?: string;
  panelClassName?: string;
  backdropClassName?: string;
  backdropLabel?: string;
  backdropTabIndex?: number;
  backdropDisabled?: boolean;
}

/** Consistent dashboard modal frame with refined backdrop blur, elevation and smooth transitions. */
export function DashboardModalShell({
  titleId,
  onClose,
  children,
  dialogRef,
  layerClassName = "z-[110]",
  panelClassName = "p-6 sm:p-8",
  backdropClassName = "bg-slate-950/60 backdrop-blur-md dark:bg-black/75",
  backdropLabel = "Close dialog",
  backdropTabIndex,
  backdropDisabled = false,
}: DashboardModalShellProps) {
  return (
    <div className={`fixed inset-0 ${layerClassName} flex items-center justify-center p-4 sm:p-6`} role="presentation">
      <button
        type="button"
        tabIndex={backdropTabIndex}
        disabled={backdropDisabled}
        aria-label={backdropLabel}
        onClick={onClose}
        className={`absolute inset-0 ${backdropClassName} transition-opacity duration-200`}
      />
      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`relative z-10 max-h-[90dvh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[var(--ep-line)] bg-[var(--ep-surface)] text-[var(--ep-text)] shadow-2xl transition-all duration-200 ${panelClassName}`}
      >
        {children}
      </section>
    </div>
  );
}

interface DashboardFormFieldProps {
  id: string;
  label: string;
  children: React.ReactNode;
  icon?: IconName;
  labelClassName?: string;
}

/** Consistent accessible label wrapper for dashboard form controls. */
export function DashboardFormField({
  id,
  label,
  children,
  icon,
  labelClassName = "mb-1.5 block text-xs font-semibold text-[var(--ep-text-muted)]",
}: DashboardFormFieldProps) {
  return (
    <div className="min-w-0">
      <label htmlFor={id} className={`${labelClassName} flex items-center gap-1.5`}>
        {icon && <Icon name={icon} size={11} strokeWidth={2} className="text-[var(--ep-accent)]" />}
        {label}
      </label>
      {children}
    </div>
  );
}
