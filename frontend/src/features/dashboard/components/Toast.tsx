import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";

type ToastTone = "success" | "error";

interface ToastItem {
  id: number;
  message: string;
  tone: ToastTone;
}

interface ToastContextValue {
  showToast: (message: string, tone?: ToastTone) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((message: string, tone: ToastTone = "success") => {
    const id = Date.now() + Math.random();
    setToasts([{ id, message, tone }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 4200);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toasts.map((toast) => (
        <div key={toast.id} className="dashboard-confirm-layer fixed inset-0 z-[200] flex items-center justify-center bg-[rgba(8,30,34,0.38)] p-4 backdrop-blur-sm dark:bg-[rgba(0,0,0,0.58)]">
          <section
            role={toast.tone === "error" ? "alert" : "status"}
            aria-live={toast.tone === "error" ? "assertive" : "polite"}
            aria-atomic="true"
            className="dashboard-confirm-panel ep-pop-in relative w-full max-w-[520px] rounded-2xl border border-[var(--ep-line)] bg-[var(--ep-surface)] p-6 text-center text-[var(--ep-primary)] shadow-[0_28px_90px_rgba(8,30,34,0.32)] sm:p-8 dark:border-[rgba(255,255,255,0.14)] dark:bg-[#102328] dark:text-[#e8f4f2]"
          >
            <button
              type="button"
              aria-label="Dismiss notification"
              onClick={() => dismissToast(toast.id)}
              className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-lg text-[var(--ep-text-muted)] transition-colors hover:bg-[var(--ep-tint)] hover:text-[var(--ep-primary)]"
            >
              <Icon name="x" size={18} />
            </button>
            <span className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full ${
              toast.tone === "error"
                ? "bg-[rgba(179,38,30,0.12)] text-[var(--ep-danger)]"
                : "bg-[rgba(30,122,70,0.12)] text-[var(--ep-ok)]"
            }`}>
              <Icon name={toast.tone === "error" ? "alert-circle" : "check-circle"} size={28} strokeWidth={2} />
            </span>
            <h2 className="mb-2 ep-font-display text-xl font-semibold">
              {toast.tone === "error" ? "Something went wrong" : "Success"}
            </h2>
            <p className="mx-auto max-w-[38rem] text-sm leading-relaxed text-[var(--ep-text-muted)]">
              {toast.message}
            </p>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              className="mt-6 min-h-11 min-w-28 rounded-lg bg-[var(--ep-accent)] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--ep-accent-hover)]"
            >
              Okay
            </button>
          </section>
        </div>
      ))}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const value = useContext(ToastContext);
  if (!value) throw new Error("useToast requires ToastProvider");
  return value;
}
