import type { ReactNode } from "react";
import { BrandMark } from "../../components/BrandMark";
import { DASHBOARD_NAV_ITEMS } from "../../constants/nav";

interface SystemLayoutProps {
  children: ReactNode;
}

export function SystemLayout({ children }: SystemLayoutProps) {
  return (
    <div className="bg-[#F5F1E7] min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] min-h-screen">
        {/* SIDEBAR */}
        <aside className="bg-[var(--water-deep)] text-[var(--sand)] p-4 flex lg:flex-col flex-row items-center lg:items-stretch gap-1.5 overflow-x-auto">
          <div className="flex items-center gap-2.5 py-2 px-2.5 lg:pb-[26px]">
            <BrandMark size={24} />
          </div>
          {DASHBOARD_NAV_ITEMS.map((item) => (
            <div
              key={item.label}
              className={`flex items-center gap-2.5 py-2.5 px-3 rounded-lg text-[13.5px] font-medium whitespace-nowrap transition-all duration-200 ${
                item.active
                  ? "bg-[rgba(232,98,58,0.16)] text-[var(--coral)] font-semibold"
                  : "text-[rgba(242,235,221,0.62)] hover:bg-[rgba(242,235,221,0.06)] hover:text-[var(--sand)]"
              }`}
            >
              <span className="w-4 text-center text-sm">{item.icon}</span>
              {item.label}
            </div>
          ))}
          <div className="hidden lg:block mt-auto pt-3.5 px-3 text-[11.5px] text-[rgba(242,235,221,0.4)] ep-font-mono">
            EDGE NODE: mini-pc-01
            <br />
            UPTIME 41d 06h
          </div>
        </aside>

        {/* MAIN */}
        <main className="px-5 md:px-[34px] pt-7 pb-[60px]">{children}</main>
      </div>
    </div>
  );
}
