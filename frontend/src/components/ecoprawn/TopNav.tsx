import { BrandMark } from "./BrandMark";

export type View = "landing" | "dashboard";

interface TopNavProps {
  view: View;
  onChange: (view: View) => void;
}

export function TopNav({ view, onChange }: TopNavProps) {
  return (
    <nav className="sticky top-0 z-[100] flex items-center justify-between px-8 py-3.5 bg-[rgba(242,235,221,0.88)] backdrop-blur-md border-b border-[rgba(11,35,32,0.08)]">
      <div className="flex items-center gap-2.5">
        <BrandMark />
        <span className="ep-font-display font-semibold text-[19px] tracking-tight">
          EcoPrawn
        </span>
      </div>
      <div className="flex gap-1 bg-[var(--sand-dim)] p-1 rounded-full">
        <button
          onClick={() => onChange("landing")}
          className={`px-[18px] py-2 rounded-full text-[13.5px] font-semibold transition-all duration-200 ${
            view === "landing"
              ? "bg-[var(--water-deep)] text-[var(--sand)] opacity-100"
              : "opacity-55 hover:opacity-85"
          }`}
        >
          Landing Page
        </button>
        <button
          onClick={() => onChange("dashboard")}
          className={`px-[18px] py-2 rounded-full text-[13.5px] font-semibold transition-all duration-200 ${
            view === "dashboard"
              ? "bg-[var(--water-deep)] text-[var(--sand)] opacity-100"
              : "opacity-55 hover:opacity-85"
          }`}
        >
          Dashboard
        </button>
      </div>
    </nav>
  );
}