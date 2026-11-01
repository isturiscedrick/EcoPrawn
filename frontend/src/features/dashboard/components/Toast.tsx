"use client";

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

  const showToast = useCallback((message: string, tone: ToastTone = "success") => {
    const id = Date.now() + Math.random();
    setToasts((current) => [...current, { id, message, tone }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 4200);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="pointer-events-none fixed inset-x-4 bottom-5 z-[200] flex flex-col items-end gap-3 sm:left-auto sm:w-[min(380px,calc(100vw-2rem))]">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role={toast.tone === "error" ? "alert" : "status"}
            className="pointer-events-auto flex w-full items-center gap-3 rounded-xl border border-[var(--ep-line)] bg-[var(--ep-surface)] px-4 py-3 text-sm text-[var(--ep-primary)] shadow-[0_16px_40px_-18px_rgba(8,30,34,0.55)] dark:border-[rgba(255,255,255,0.12)] dark:bg-[#242526] dark:text-[#e4e6eb] dark:shadow-[0_16px_40px_-18px_rgba(0,0,0,0.75)]"
          >
            <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
              toast.tone === "error"
                ? "bg-[rgba(179,38,30,0.12)] text-[var(--ep-danger)]"
                : "bg-[rgba(30,122,70,0.12)] text-[var(--ep-ok)]"
            }`}>
              <Icon name={toast.tone === "error" ? "x" : "check"} size={16} strokeWidth={2.2} />
            </span>
            <span className="flex-1 font-medium">{toast.message}</span>
            <button
              type="button"
              aria-label="Dismiss notification"
              onClick={() => setToasts((current) => current.filter((item) => item.id !== toast.id))}
              className="rounded-md p-1 text-[var(--ep-text-muted)] hover:bg-[rgba(11,46,51,0.06)] hover:text-[var(--ep-primary)] dark:text-[#b0b3b8] dark:hover:bg-[rgba(255,255,255,0.08)] dark:hover:text-[#e4e6eb]"
            >
              <Icon name="x" size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const value = useContext(ToastContext);
  if (!value) throw new Error("useToast requires ToastProvider");
  return value;
}
