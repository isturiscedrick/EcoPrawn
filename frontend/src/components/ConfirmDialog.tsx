"use client";

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
}: ConfirmDialogProps) {
  const titleId = useId();
  const descId = useId();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);

  // Keep the latest onCancel without re-running the open/focus effect
  // every time the parent re-renders.
  const onCancelRef = useRef(onCancel);
  useEffect(() => {
    onCancelRef.current = onCancel;
  });

  // Focus the safe choice, close on Escape, lock body scroll while open.
  useEffect(() => {
    if (!open) return;

    (tone === "danger" ? cancelRef : confirmRef).current?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onCancelRef.current();
    }
    window.addEventListener("keydown", onKeyDown);
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = original;
    };
  }, [open, tone]);

  if (!open) return null;

  const confirmClass =
    tone === "danger"
      ? "bg-[var(--danger)] hover:bg-[#b93a3a]"
      : "bg-[var(--coral)] hover:bg-[var(--coral-dim)]";

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
        className="absolute inset-0 bg-[rgba(8,30,34,0.55)] backdrop-blur-sm"
      />

      <div className="relative z-10 w-full max-w-[380px] rounded-2xl border border-[var(--sand-dim)] bg-[var(--sand)] p-6 shadow-[0_30px_70px_-20px_rgba(0,0,0,0.4)]">
        <h2
          id={titleId}
          className="ep-font-display mb-1.5 text-[18px] font-semibold text-[var(--water-deep)]"
        >
          {title}
        </h2>
        <div
          id={descId}
          className="mb-6 text-[13px] leading-[1.55] text-[rgba(11,35,32,0.6)]"
        >
          {description}
        </div>
        <div className="flex gap-3">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-lg border border-[var(--sand-dim)] px-4 py-2.5 text-[13.5px] font-semibold text-[var(--water-deep)] transition-colors hover:bg-[rgba(11,35,32,0.05)]"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            className={`flex-1 rounded-lg px-4 py-2.5 text-[13.5px] font-semibold text-[var(--sand)] transition-colors ${confirmClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}