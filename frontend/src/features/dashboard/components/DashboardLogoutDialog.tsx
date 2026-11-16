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
        className="fixed inset-0 z-[100] flex items-center justify-center p-5"
      >
        <div
          aria-hidden="true"
          onClick={onCancel}
          className="ep-fade-in absolute inset-0 bg-[rgba(8,30,34,0.65)] backdrop-blur-sm dark:bg-[rgba(0,0,0,0.76)]"
        />
        <div ref={dialogRef} tabIndex={-1} className="ep-pop-in relative z-10 w-full max-w-[360px] rounded-2xl border border-[var(--ep-line)] bg-[var(--ep-surface)] p-6 text-[var(--ep-text)] shadow-[var(--shadow-overlay)]">
          <h2
            id="logout-modal-title"
            className="ep-font-display mb-1.5 text-[18px] font-semibold text-[var(--ep-text)]"
          >
            Log out of EcoPrawn?
          </h2>
          <p id="logout-modal-description" className="mb-6 text-[13px] leading-[1.55] text-[var(--ep-text-muted)]">
            You&apos;ll need to sign in again to access the facility
            dashboard.
          </p>
          {error && (
            <p role="alert" className="mb-3 text-sm text-red-300">
              {error}
            </p>
          )}
          <div className="flex gap-3">
            <button
              ref={cancelRef}
              type="button"
              onClick={onCancel}
              disabled={loggingOut}
              className="ep-dashboard-action flex-1 rounded-lg border border-[var(--ep-line)] px-4 py-2.5 text-[13.5px] font-semibold text-[var(--ep-text)] transition-colors duration-200 hover:bg-[var(--ep-tint)]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loggingOut}
              className="dashboard-logout-confirm ep-dashboard-action ep-dashboard-action-danger flex-1 rounded-lg px-4 py-2.5 text-[13.5px] font-semibold transition-colors duration-200 disabled:opacity-60"
            >
              {loggingOut ? "Logging out…" : "Log out"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
