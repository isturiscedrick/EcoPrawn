import { BrandMark } from "./BrandMark";

export type View = "landing" | "login" | "dashboard";

interface TopNavProps {
  view: View;
  onChange: (view: View) => void;
}

export function TopNav({ view, onChange }: TopNavProps) {
  return (
    <nav className="sticky top-0 z-[100] flex items-center justify-between px-8 py-3.5 bg-[rgba(242,235,221,0.88)] backdrop-blur-md border-b border-[rgba(11,35,32,0.08)]">
      <button
        onClick={() => onChange("landing")}
        className="flex items-center gap-2.5"
      >
        <BrandMark />
      </button>

      {view !== "dashboard" && (
        <button
          onClick={() => onChange("login")}
          className="inline-flex items-center gap-2 px-[18px] py-2 rounded-full text-[13.5px] font-semibold bg-[var(--water-deep)] text-[var(--sand)] transition-all duration-200 hover:opacity-90"
        >
          Log in
        </button>
      )}
    </nav>
  );
}