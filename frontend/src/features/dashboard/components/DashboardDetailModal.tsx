import { useEffect } from "react";

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
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-5">
      <button
        type="button"
        aria-label="Close details"
        onClick={onClose}
        className="absolute inset-0 bg-[rgba(8,30,34,0.65)] backdrop-blur-sm dark:bg-[rgba(0,0,0,0.76)]"
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="dashboard-detail-title"
        className="ep-pop-in relative z-10 w-full max-w-[480px] rounded-2xl border border-[var(--ep-line)] bg-white p-6 text-[var(--ep-primary)] shadow-[0_28px_90px_rgba(8,30,34,0.32)] sm:p-8"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--ep-accent)]">
              Dashboard detail
            </p>
            <h2 id="dashboard-detail-title" className="ep-font-display text-2xl font-semibold">
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
      </section>
    </div>
  );
}
