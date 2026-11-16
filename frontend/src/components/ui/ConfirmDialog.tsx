import { useEffect, useId, useRef, type ReactNode } from "react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  tone?: "default" | "danger";
  onConfirm: () => void;
  onCancel: () => void;
  showCancel?: boolean;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancel",
  tone = "default",
  onConfirm,
  onCancel,
  showCancel = true,
}: ConfirmDialogProps) {
  const titleId = useId();
  const descId = useId();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  // Keep the latest onCancel without re-running the open/focus effect
  // every time the parent re-renders.
  const onCancelRef = useRef(onCancel);
  useEffect(() => {
    onCancelRef.current = onCancel;
  });

  // Focus the safe choice, close on Escape, lock body scroll while open.
  useEffect(() => {
    if (!open) return;

    previouslyFocusedRef.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    (tone === "danger" && showCancel ? cancelRef : confirmRef).current?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onCancelRef.current();
        return;
      }

      if (e.key !== "Tab") return;
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable?.length) {
        e.preventDefault();
        dialogRef.current?.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = original;
      previouslyFocusedRef.current?.focus();
      previouslyFocusedRef.current = null;
    };
  }, [open, tone]);

  if (!open) return null;

  const confirmClass =
    tone === "danger"
      ? "bg-[var(--ep-status-danger)] hover:brightness-95"
      : "bg-[var(--ep-accent)] hover:bg-[var(--ep-accent-hover)]";

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descId}
      className="fixed inset-0 z-[110] flex items-center justify-center p-5"
    >
      <div
        aria-hidden="true"
        onClick={onCancel}
        className="ep-fade-in absolute inset-0 bg-[rgba(8,30,34,0.55)] backdrop-blur-sm dark:bg-[rgba(0,0,0,0.72)]"
      />

      <div
        ref={dialogRef}
        tabIndex={-1}
        className="ep-pop-in relative z-10 w-full max-w-[380px] rounded-2xl border border-[var(--ep-line)] bg-[var(--ep-surface)] p-6 shadow-[var(--shadow-overlay)] outline-none dark:border-[rgba(255,255,255,0.12)] dark:bg-[#111827] dark:shadow-[0_28px_90px_rgba(0,0,0,0.7)]"
      >
        <h2
          id={titleId}
          className="ep-font-display mb-1.5 text-[18px] font-semibold text-[var(--ep-text)]"
        >
          {title}
        </h2>
        <div
          id={descId}
          className="mb-6 text-[13px] leading-[1.55] text-[var(--ep-text-muted)]"
        >
          {description}
        </div>
        <div className="flex gap-3">
          {showCancel && <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-lg border border-[var(--ep-line)] px-4 py-2.5 text-[13.5px] font-semibold text-[var(--ep-text)] transition-colors hover:bg-[var(--ep-tint)]"
          >
            {cancelLabel}
          </button>}
          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            className={`${showCancel ? "flex-1" : "w-full"} rounded-lg px-4 py-2.5 text-[13.5px] font-semibold text-white transition-colors ${confirmClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}