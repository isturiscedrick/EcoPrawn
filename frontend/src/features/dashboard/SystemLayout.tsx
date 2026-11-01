 "use client";

import type { ReactNode } from "react";
 import { useState } from "react";
 import { Sidebar } from "./components/Sidebar";

interface SystemLayoutProps {
  children: ReactNode;
}

export function SystemLayout({ children }: SystemLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="dashboard-shell min-h-screen bg-[var(--ep-bg)]">
      <div className={`grid grid-cols-1 transition-[grid-template-columns] duration-200 ease-out ${sidebarCollapsed ? "lg:grid-cols-[76px_1fr]" : "lg:grid-cols-[260px_1fr]"}`}>
        {/* SIDEBAR */}
        <div className="sticky top-0 z-50 lg:h-screen">
          <Sidebar
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed((current) => !current)}
          />
        </div>

        {/* MAIN */}
        <main className="min-w-0 px-5 pb-16 pt-6 md:px-8 lg:px-10 lg:pt-8">
          <div className="mx-auto max-w-[1320px]">{children}</div>
        </main>
      </div>
    </div>
  );
}