import type { RefObject } from "react";
import { LogoutIcon } from "./SidebarPrimitives";

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
        <div ref={dialogRef} tabIndex={-1} className="dashboard-confirm-panel ep-pop-in relative z-10 w-full max-w-[390px] rounded-2xl border border-[var(--ep-line)] bg-[var(--ep-surface)] p-6 text-[var(--ep-text)] shadow-2xl outline-none">
          <div className="mb-4 flex items-center gap-3.5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-red-500/25 bg-red-500/10 text-red-600 dark:text-red-400">
              <LogoutIcon className="h-5 w-5" />
            </span>
            <h2
              id="logout-modal-title"
              className="ep-font-display text-xl font-bold tracking-tight text-[var(--ep-text)]"
            >
              Log out of EcoPrawn?
            </h2>
          </div>
          <p id="logout-modal-description" className="mb-6 text-sm leading-relaxed text-[var(--ep-text-muted)]">
            You will need to sign in again with your credentials to access the facility dashboard.
          </p>
          {error && (
            <p role="alert" className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs font-medium text-red-700 dark:text-red-300">
              {error}
            </p>
          )}
          <div className="flex gap-3">
            <button
              ref={cancelRef}
              type="button"
              onClick={onCancel}
              disabled={loggingOut}
              className="min-h-11 flex-1 rounded-xl border border-[var(--ep-line)] bg-[var(--ep-surface)] px-4 text-sm font-semibold text-[var(--ep-text)] transition-colors duration-200 hover:bg-[var(--ep-tint)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ep-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ep-surface)] disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loggingOut}
              className="dashboard-logout-confirm inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold shadow-sm transition-all duration-200 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ep-surface)] disabled:cursor-wait disabled:opacity-65"
            >
              {loggingOut ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />
              ) : (
                <LogoutIcon className="h-4 w-4" />
              )}
              <span>{loggingOut ? "Logging out…" : "Log out"}</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
