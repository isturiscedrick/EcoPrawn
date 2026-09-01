"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BrandMark } from "@/components/BrandMark";
import { DASHBOARD_NAV_ITEMS, type DashboardView } from "@/config/nav";

export function DashboardHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const activeView = (pathname.split("/dashboard/")[1] ?? "overview") as DashboardView;

  function onNavigate(view: DashboardView) {
    setMobileNavOpen(false);
    router.push(view === "overview" ? "/dashboard" : `/dashboard/${view}`);
  }

  return (
    <header className="sticky top-0 z-50 h-[64px] border-b border-[rgba(11,35,32,0.08)] bg-[var(--water-deep)] text-[var(--sand)]">
      <div className="mx-auto flex h-full max-w-[1600px] items-center justify-between px-5 md:px-9">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="flex items-center gap-2.5 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--coral)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--water-deep)]"
            aria-label="EcoPrawn home"
          >
            <BrandMark size={40} />
          </Link>

          <div className="hidden items-center gap-1.5 rounded-full border border-[rgba(242,235,221,0.15)] bg-[rgba(242,235,221,0.05)] px-3 py-1.5 lg:flex">
            <span className="ep-pulse-dot h-1.5 w-1.5 rounded-full bg-[var(--mangrove-light)]" />
            <span className="ep-font-mono text-[10.5px] tracking-[0.1em] text-[rgba(242,235,221,0.65)]">
              EDGE NODE: mini-pc-01
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <div className="text-[12.5px] font-semibold text-[var(--sand)]">Facility Operator</div>
            <div className="ep-font-mono text-[10px] text-[rgba(242,235,221,0.5)]">UPTIME 41d 06h</div>
          </div>

          <div
            className="flex h-8 w-8 items-center justify-center rounded-full text-[12px] font-semibold"
            style={{ background: "var(--coral)" }}
            aria-hidden="true"
          >
            FO
          </div>

          <button
            type="button"
            onClick={() => setMobileNavOpen((v) => !v)}
            aria-expanded={mobileNavOpen}
            aria-controls="mobile-dashboard-nav"
            aria-label={mobileNavOpen ? "Close menu" : "Open menu"}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[rgba(242,235,221,0.18)] text-[var(--sand)] transition-colors hover:bg-[rgba(242,235,221,0.08)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--coral)] lg:hidden"
          >
            <span className="sr-only">Toggle navigation</span>
            {mobileNavOpen ? (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M2 2L14 14M14 2L2 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M1.5 4H14.5M1.5 8H14.5M1.5 12H14.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {mobileNavOpen && (
        <nav
          id="mobile-dashboard-nav"
          aria-label="Dashboard navigation"
          className="border-t border-[rgba(242,235,221,0.1)] bg-[var(--water-deep)] px-5 py-3 lg:hidden"
        >
          <ul className="flex flex-col gap-1">
            {DASHBOARD_NAV_ITEMS.map((item) => {
              const isActive = item.view === activeView;
              return (
                <li key={item.label}>
                  <button
                    type="button"
                    onClick={() => onNavigate(item.view)}
                    aria-current={isActive ? "page" : undefined}
                    className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-[13.5px] font-medium transition-colors ${
                      isActive
                        ? "bg-[rgba(232,98,58,0.16)] font-semibold text-[var(--coral)]"
                        : "text-[rgba(242,235,221,0.62)] hover:bg-[rgba(242,235,221,0.06)] hover:text-[var(--sand)]"
                    }`}
                  >
                    <span className="w-4 text-center text-sm">{item.icon}</span>
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </header>
  );
}