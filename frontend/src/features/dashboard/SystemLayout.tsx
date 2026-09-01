"use client";

import type { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { BrandMark } from "@/components/BrandMark";
import { DASHBOARD_NAV_ITEMS, type DashboardView } from "@/config/nav";

interface SystemLayoutProps {
  children: ReactNode;
}

export function SystemLayout({ children }: SystemLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const activeView = (pathname.split("/dashboard/")[1] ?? "overview") as DashboardView;

  function onNavigate(view: DashboardView) {
    router.push(view === "overview" ? "/dashboard" : `/dashboard/${view}`);
  }

  return (
    <div className="bg-[#F5F1E7] min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-[224px_1fr] min-h-screen">
        {/* SIDEBAR */}
        <aside className="bg-[var(--water-deep)] text-[var(--sand)] p-4 flex lg:flex-col flex-row items-center lg:items-stretch gap-1.5 overflow-x-auto lg:overflow-x-visible lg:sticky lg:top-0 lg:h-screen">
          <div className="flex items-center gap-2.5 py-2 px-2.5 lg:pb-6 lg:mb-2 lg:border-b lg:border-[rgba(242,235,221,0.1)]">
            <BrandMark size={84} />
          </div>

          <div className="hidden lg:block ep-font-mono text-[9.5px] uppercase tracking-[0.12em] text-[rgba(242,235,221,0.35)] px-3 mb-1">
            Navigation
          </div>

          {DASHBOARD_NAV_ITEMS.map((item) => {
            const isActive = item.view === activeView;
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => onNavigate(item.view)}
                aria-current={isActive ? "page" : undefined}
                className={`flex items-center gap-2.5 py-2.5 px-3 rounded-lg text-[13.5px] font-medium whitespace-nowrap transition-all duration-200 text-left w-full ${
                  isActive
                    ? "bg-[rgba(232,98,58,0.16)] text-[var(--coral)] font-semibold"
                    : "text-[rgba(242,235,221,0.62)] hover:bg-[rgba(242,235,221,0.06)] hover:text-[var(--sand)]"
                }`}
              >
                <span className="w-4 text-center text-sm">{item.icon}</span>
                {item.label}
                {isActive && (
                  <span className="ml-auto hidden lg:block h-1.5 w-1.5 rounded-full bg-[var(--coral)]" />
                )}
              </button>
            );
          })}

          <div className="hidden lg:flex lg:flex-col mt-auto pt-4 px-3 gap-1 border-t border-[rgba(242,235,221,0.1)]">
            <div className="flex items-center gap-1.5 text-[11px] text-[rgba(242,235,221,0.55)] ep-font-mono">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--mangrove-light)]" />
              EDGE NODE: mini-pc-01
            </div>
            <div className="text-[10.5px] text-[rgba(242,235,221,0.35)] ep-font-mono pl-3">
              UPTIME 41d 06h
            </div>
          </div>
        </aside>

        {/* MAIN */}
        <main className="px-5 md:px-9 pt-8 pb-16 max-w-[1400px] w-full">{children}</main>
      </div>
    </div>
  );
}
