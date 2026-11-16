import { useEffect, useId } from "react";
import { DashboardModalShell } from "./DashboardPrimitives";

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
      panelClassName="ep-pop-in p-6 sm:p-8"
    >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--ep-accent)]">
              Dashboard detail
            </p>
            <h2 id={`${uid}-title`} className="ep-font-display text-2xl font-semibold">
              {title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ep-text-muted)]">
              {description}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[var(--ep-text-muted)] transition-colors hover:bg-[rgba(11,46,51,0.05)] hover:text-[var(--ep-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ep-accent)]"
          >
            ×
          </button>
        </div>
        <ul className="space-y-3 border-t border-[var(--ep-line)] pt-5 text-sm">
          {details.map((detail) => (
            <li key={detail} className="flex gap-3 leading-relaxed text-[var(--ep-text-muted)]">
              <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--ep-accent)]" />
              {detail}
            </li>
          ))}
        </ul>
    </DashboardModalShell>
  );
}
