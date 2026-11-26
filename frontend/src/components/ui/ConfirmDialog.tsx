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

  // Keep the latest callback without restarting the focus-management effect.
  const onCancelRef = useRef(onCancel);
  useEffect(() => {
    onCancelRef.current = onCancel;
  });

  // Keep keyboard focus inside the dialog and restore it to the opener on close.
  useEffect(() => {
    if (!open) return;

    previouslyFocusedRef.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    (tone === "danger" && showCancel ? cancelRef : confirmRef).current?.focus();

    function getFocusableElements() {
      return Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      );
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        if (showCancel) onCancelRef.current();
        return;
      }

      if (event.key !== "Tab") return;

      const focusable = getFocusableElements();
      if (!focusable.length) {
        event.preventDefault();
        dialogRef.current?.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const focusIsOutside = !dialogRef.current?.contains(document.activeElement);

      if (focusIsOutside) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    function onFocusIn(event: FocusEvent) {
      if (event.target instanceof Node && !dialogRef.current?.contains(event.target)) {
        (tone === "danger" && showCancel ? cancelRef : confirmRef).current?.focus();
      }
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("focusin", onFocusIn);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("focusin", onFocusIn);
      document.body.style.overflow = originalOverflow;

      const previouslyFocused = previouslyFocusedRef.current;
      previouslyFocusedRef.current = null;
      if (previouslyFocused?.isConnected) {
        previouslyFocused.focus({ preventScroll: true });
      }
    };
  }, [open, tone, showCancel]);

  if (!open) return null;

  const confirmClass =
    tone === "danger"
      ? "bg-red-600 hover:bg-red-700 focus-visible:ring-red-500"
      : "bg-[var(--ep-accent)] hover:bg-[var(--ep-accent-hover)] focus-visible:ring-[var(--ep-primary)]";

  const focusRing = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ep-surface)]";

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descId}
      className="dashboard-confirm-layer fixed inset-0 z-[110] flex items-center justify-center p-5"
    >
      <div
        aria-hidden="true"
        onClick={showCancel ? onCancel : undefined}
        className="ep-fade-in absolute inset-0 bg-slate-950/60 backdrop-blur-md dark:bg-black/80"
      />

      <div
        ref={dialogRef}
        tabIndex={-1}
        className="dashboard-confirm-panel ep-pop-in relative z-10 w-full max-w-[400px] rounded-2xl border border-[var(--ep-line)] bg-[var(--ep-surface)] p-6 shadow-2xl outline-none"
      >
        <h2
          id={titleId}
          className="ep-font-display mb-2 text-xl font-bold tracking-tight text-[var(--ep-text)]"
        >
          {title}
        </h2>
        <div
          id={descId}
          className="mb-6 text-sm leading-relaxed text-[var(--ep-text-muted)]"
        >
          {description}
        </div>
        <div className="flex gap-3">
          {showCancel && (
            <button
              ref={cancelRef}
              type="button"
              onClick={onCancel}
              className={`min-h-11 flex-1 rounded-xl border border-[var(--ep-line)] bg-[var(--ep-surface)] px-4 text-sm font-semibold text-[var(--ep-text)] transition-colors hover:bg-[var(--ep-tint)] ${focusRing} focus-visible:ring-[var(--ep-primary)]`}
            >
              {cancelLabel}
            </button>
          )}
          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            className={`${showCancel ? "flex-1" : "w-full"} min-h-11 rounded-xl px-4 text-sm font-semibold text-white shadow-sm transition-all hover:opacity-90 ${confirmClass} ${focusRing}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
