"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { BrandMark } from "@/components/BrandMark";
import { DASHBOARD_NAV_ITEMS, type DashboardView } from "@/config/nav";

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const activeView = (pathname.split("/dashboard/")[1] ?? "overview") as DashboardView;

  const [confirmingLogout, setConfirmingLogout] = useState(false);

  function onNavigate(view: DashboardView) {
    router.push(view === "overview" ? "/dashboard" : `/dashboard/${view}`);
  }

  function onLogoutClick() {
    setConfirmingLogout(true);
  }

  function onConfirmLogout() {
    // TODO: wire up real sign-out.
    router.push("/login");
  }

  function onCancelLogout() {
    setConfirmingLogout(false);
  }

  // Close on Escape, lock body scroll while open.
  useEffect(() => {
    if (!confirmingLogout) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setConfirmingLogout(false);
    }
    window.addEventListener("keydown", onKeyDown);
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = original;
    };
  }, [confirmingLogout]);

  return (
    <aside className="flex h-full flex-row items-center gap-1.5 overflow-x-auto bg-[var(--water-deep)] p-3 text-[var(--sand)] lg:flex-col lg:items-stretch lg:gap-0 lg:overflow-x-visible lg:p-4">
      {/* BRAND */}
      <div className="flex shrink-0 items-center gap-2.5 px-1 lg:mb-4 lg:w-full lg:border-b lg:border-[rgba(242,235,221,0.1)] lg:px-2.5 lg:pb-4 lg:pt-1">
        <BrandMark size={84} />
      </div>

      {/* EDGE NODE STATUS */}
      <div className="hidden shrink-0 items-center gap-1.5 rounded-full border border-[rgba(242,235,221,0.15)] bg-[rgba(242,235,221,0.05)] px-3 py-1.5 lg:mb-4 lg:flex lg:w-fit">
        <span className="ep-pulse-dot h-1.5 w-1.5 rounded-full bg-[var(--mangrove-light)]" />
        <span className="ep-font-mono text-[10px] tracking-[0.1em] text-[rgba(242,235,221,0.65)]">
          EDGE NODE: mini-pc-01
        </span>
      </div>

      {/* NAV LABEL (desktop only) */}
      <div className="hidden px-3 ep-font-mono text-[9.5px] uppercase tracking-[0.12em] text-[rgba(242,235,221,0.35)] lg:mb-2 lg:block">
        Navigation
      </div>

      {/* NAV ITEMS */}
      <div className="flex shrink-0 flex-row items-center gap-1.5 lg:w-full lg:flex-col lg:items-stretch lg:gap-1">
        {DASHBOARD_NAV_ITEMS.map((item) => {
          const isActive = item.view === activeView;
          return (
            <button
              key={item.label}
              type="button"
              onClick={() => onNavigate(item.view)}
              aria-current={isActive ? "page" : undefined}
              className={`flex items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2.5 text-left text-[13.5px] font-medium transition-all duration-200 lg:w-full ${
                isActive
                  ? "bg-[rgba(232,98,58,0.16)] font-semibold text-[var(--coral)]"
                  : "text-[rgba(242,235,221,0.62)] hover:bg-[rgba(242,235,221,0.06)] hover:text-[var(--sand)]"
              }`}
            >
              <span className="w-4 text-center text-sm">{item.icon}</span>
              <span className="hidden sm:inline">{item.label}</span>
              {isActive && (
                <span className="ml-auto hidden h-1.5 w-1.5 rounded-full bg-[var(--coral)] lg:block" />
              )}
            </button>
          );
        })}
      </div>

      {/* USER / OPERATOR (desktop only) */}
      <div className="mt-auto hidden shrink-0 flex-col gap-3 border-t border-[rgba(242,235,221,0.1)] px-2 pt-4 lg:flex lg:w-full">
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold"
            style={{ background: "var(--coral)" }}
            aria-hidden="true"
          >
            FO
          </div>
          <div className="min-w-0">
            <div className="truncate text-[12.5px] font-semibold text-[var(--sand)]">
              Facility Operator
            </div>
            <div className="ep-font-mono text-[10px] text-[rgba(242,235,221,0.5)]">
              UPTIME 41d 06h
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onLogoutClick}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-[13.5px] font-medium text-[rgba(242,235,221,0.62)] transition-colors duration-200 hover:bg-[rgba(232,98,58,0.12)] hover:text-[var(--coral)]"
        >
          <span className="w-4 text-center text-sm" aria-hidden="true">
            ⏻
          </span>
          Log out
        </button>
      </div>

      {/* LOGOUT (mobile only, icon button) */}
      <button
        type="button"
        onClick={onLogoutClick}
        aria-label="Log out"
        className="ml-auto flex shrink-0 items-center justify-center rounded-lg p-2.5 text-[rgba(242,235,221,0.62)] transition-colors duration-200 hover:bg-[rgba(232,98,58,0.12)] hover:text-[var(--coral)] lg:hidden"
      >
        <span className="text-sm" aria-hidden="true">
          ⏻
        </span>
      </button>

      {/* LOGOUT CONFIRMATION MODAL */}
      {confirmingLogout && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="logout-modal-title"
          className="fixed inset-0 z-[100] flex items-center justify-center p-5"
        >
          {/* Overlay */}
          <div
            aria-hidden="true"
            onClick={onCancelLogout}
            className="absolute inset-0 bg-[rgba(8,30,34,0.65)] backdrop-blur-sm"
          />

          {/* Modal card */}
          <div className="relative z-10 w-full max-w-[360px] rounded-2xl border border-[rgba(242,235,221,0.14)] bg-[var(--water-deep)] p-6 text-[var(--sand)] shadow-[0_30px_70px_-20px_rgba(0,0,0,0.6)]">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-[rgba(232,98,58,0.16)] text-[18px] text-[var(--coral)]">
              ⏻
            </div>

            <h2
              id="logout-modal-title"
              className="ep-font-display mb-1.5 text-[18px] font-semibold text-[var(--sand)]"
            >
              Log out of EcoPrawn?
            </h2>
            <p className="mb-6 text-[13px] leading-[1.55] text-[rgba(242,235,221,0.6)]">
              You&apos;ll need to sign in again to access the facility dashboard.
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onCancelLogout}
                className="flex-1 rounded-lg border border-[rgba(242,235,221,0.2)] px-4 py-2.5 text-[13.5px] font-semibold text-[rgba(242,235,221,0.8)] transition-colors duration-200 hover:bg-[rgba(242,235,221,0.08)] hover:text-[var(--sand)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onConfirmLogout}
                className="flex-1 rounded-lg bg-[var(--coral)] px-4 py-2.5 text-[13.5px] font-semibold text-[var(--sand)] transition-colors duration-200 hover:bg-[var(--coral-dim)]"
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}