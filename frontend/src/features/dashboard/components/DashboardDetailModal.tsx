import { useEffect, useId } from "react";
import { DashboardModalShell } from "./DashboardPrimitives";
import { Icon } from "@/components/ui/Icon";

interface DashboardDetailModalProps {
  open: boolean;
  title: string;
  description: string;
  details: string[];
  onClose: () => void;
}

export function DashboardDetailModal({
  open,
  title,
  description,
  details,
  onClose,
}: DashboardDetailModalProps) {
  const uid = useId();
  useEffect(() => {
    if (!open) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <DashboardModalShell
      titleId={`${uid}-title`}
      onClose={onClose}
      backdropLabel="Close details"
      panelClassName="p-6 sm:p-8"
    >
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--ep-primary)]">
            <Icon name="layers" size={12} strokeWidth={2} />
            Dashboard Detail
          </p>
          <h2 id={`${uid}-title`} className="mt-1 ep-font-display text-xl font-bold tracking-tight text-[var(--ep-text)] sm:text-2xl">
            {title}
          </h2>
          <p className="mt-1.5 text-xs text-[var(--ep-text-muted)] sm:text-sm leading-relaxed">
            {description}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close details dialog"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--ep-line)] bg-[var(--ep-surface)] text-lg text-[var(--ep-text-muted)] transition-colors hover:bg-[var(--ep-tint)] hover:text-[var(--ep-primary)]"
        >
          ×
        </button>
      </div>

      <ul className="space-y-3 border-t border-[var(--ep-line)] pt-5 text-sm">
        {details.map((detail) => (
          <li key={detail} className="flex items-start gap-3 leading-relaxed text-[var(--ep-text)]">
            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--ep-primary)]" />
            <span>{detail}</span>
          </li>
        ))}
      </ul>

      <div className="mt-6 pt-4 border-t border-[var(--ep-line)] flex justify-end">
        <button
          type="button"
          onClick={onClose}
          className="min-h-10 rounded-xl bg-[var(--ep-primary)] px-5 text-xs font-semibold text-white shadow-sm hover:opacity-90 transition"
        >
          Close
        </button>
      </div>
    </DashboardModalShell>
  );
}
