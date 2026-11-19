import type { RefObject } from "react";

interface DashboardLogoutDialogProps {
  dialogRef: RefObject<HTMLDivElement | null>;
  cancelRef: RefObject<HTMLButtonElement | null>;
  error: string;
  loggingOut: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function DashboardLogoutDialog({
  dialogRef,
  cancelRef,
  error,
  loggingOut,
  onCancel,
  onConfirm,
}: DashboardLogoutDialogProps) {
  return (
    <>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="logout-modal-title"
        aria-describedby="logout-modal-description"
        className="dashboard-confirm-layer fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6"
      >
        <div
          aria-hidden="true"
          onClick={onCancel}
          className="ep-fade-in absolute inset-0 bg-slate-950/60 backdrop-blur-md dark:bg-black/80"
        />
        <div ref={dialogRef} tabIndex={-1} className="dashboard-confirm-panel ep-pop-in relative z-10 w-full max-w-[380px] rounded-2xl border border-[var(--ep-line)] bg-[var(--ep-surface)] p-6 text-[var(--ep-text)] shadow-2xl">
          <h2
            id="logout-modal-title"
            className="ep-font-display mb-2 text-xl font-bold tracking-tight text-[var(--ep-text)]"
          >
            Log out of EcoPrawn?
          </h2>
          <p id="logout-modal-description" className="mb-6 text-sm leading-relaxed text-[var(--ep-text-muted)]">
            You will need to sign in again with your credentials to access the facility dashboard.
          </p>
          {error && (
            <p role="alert" className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs font-medium text-rose-600 dark:text-rose-300">
              {error}
            </p>
          )}
          <div className="flex gap-3">
            <button
              ref={cancelRef}
              type="button"
              onClick={onCancel}
              disabled={loggingOut}
              className="min-h-11 flex-1 rounded-xl border border-[var(--ep-line)] bg-[var(--ep-surface)] px-4 text-sm font-semibold text-[var(--ep-text)] transition-colors duration-200 hover:bg-[var(--ep-tint)] disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loggingOut}
              className="dashboard-logout-confirm min-h-11 flex-1 rounded-xl bg-rose-600 px-4 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-rose-700 disabled:opacity-60"
            >
              {loggingOut ? "Logging out…" : "Log out"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
