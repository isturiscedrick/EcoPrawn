import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";

interface SystemLayoutProps {
  children: ReactNode;
}

export function SystemLayout({ children }: SystemLayoutProps) {
  return (
    <div className="min-h-screen bg-[#F5F1E7]">
      <div className="grid grid-cols-1 lg:grid-cols-[224px_1fr]">
        {/* SIDEBAR */}
        <div className="sticky top-0 z-50 lg:h-screen">
          <Sidebar />
        </div>

        {/* MAIN */}
        <main className="min-w-0 px-6 pb-16 pt-7 md:px-10">
          <div className="mx-auto max-w-[1320px]">{children}</div>
        </main>
      </div>
    </div>
  );
}