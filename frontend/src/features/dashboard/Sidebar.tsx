"use client";

import { usePathname, useRouter } from "next/navigation";
import { BrandMark } from "@/components/BrandMark";
import { DASHBOARD_NAV_ITEMS, type DashboardView } from "@/config/nav";

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const activeView = (pathname.split("/dashboard/")[1] ?? "overview") as DashboardView;

  function onNavigate(view: DashboardView) {
    router.push(view === "overview" ? "/dashboard" : `/dashboard/${view}`);
  }

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

      <div className="mx-2 hidden h-6 w-px bg-[rgba(242,235,221,0.15)] lg:hidden" />

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
      <div className="mt-auto hidden shrink-0 items-center gap-2.5 border-t border-[rgba(242,235,221,0.1)] px-2 pt-4 lg:flex lg:w-full">
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
    </aside>
  );
}