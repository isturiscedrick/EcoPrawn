import type { ReactNode } from "react";
 import { useState } from "react";
import { BrandMark } from "@/components/layout/BrandMark";
import { Icon } from "@/components/ui/Icon";
 import { Sidebar } from "../components/Sidebar";

interface SystemLayoutProps {
  children: ReactNode;
}

export function SystemLayout({ children }: SystemLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="dashboard-shell min-h-screen bg-[var(--ep-bg)]">
      <div className={`grid grid-cols-1 transition-[grid-template-columns] duration-200 ease-out ${sidebarCollapsed ? "lg:grid-cols-[76px_1fr]" : "lg:grid-cols-[260px_1fr]"}`}>
        {/* SIDEBAR */}
        <div className="relative z-50 lg:sticky lg:top-0 lg:h-screen">
          <Sidebar
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed((current) => !current)}
            mobileOpen={mobileSidebarOpen}
            onMobileClose={() => setMobileSidebarOpen(false)}
          />
        </div>

        {/* MAIN */}
        <main className="min-w-0 px-3 pb-16 pt-3 sm:px-5 sm:pt-5 md:px-8 lg:px-10 lg:pt-8">
          <div className="mb-5 flex min-h-14 items-center justify-between gap-3 rounded-2xl border border-[var(--ep-line)] bg-[var(--ep-surface)] px-3 shadow-sm lg:hidden">
            <button type="button" onClick={() => setMobileSidebarOpen(true)} aria-label="Open dashboard menu" aria-expanded={mobileSidebarOpen} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[var(--ep-primary)] transition-colors hover:bg-[var(--ep-accent-tint)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ep-accent)]">
              <Icon name="menu" size={21} />
            </button>
            <BrandMark size={28} showWordmark />
            <span className="w-11" aria-hidden="true" />
          </div>
          <div className="mx-auto max-w-[1320px]">{children}</div>
        </main>
      </div>
    </div>
  );
}