import { useState, useEffect, type SVGProps, type RefObject, type ReactNode } from "react";
import { createPortal } from "react-dom";

export function LogoutIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="m16 17 5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}

export const drawerRowClass =
  "flex min-h-11 w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[14.5px] font-medium text-[var(--ep-text-muted)] transition-colors duration-200 hover:bg-[var(--ep-tint)] hover:text-[var(--ep-text)]";

export function SidebarTooltip({
  targetRef,
  children,
}: {
  targetRef: RefObject<HTMLElement | null>;
  children: ReactNode;
}) {
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    if (!targetRef.current) return;
    const rect = targetRef.current.getBoundingClientRect();
    setCoords({
      top: rect.top + rect.height / 2,
      left: rect.right + 12,
    });
  }, [targetRef]);

  if (!coords || typeof document === "undefined") return null;

  return createPortal(
    <div
      role="tooltip"
      style={{
        position: "fixed",
        top: coords.top,
        left: coords.left,
        transform: "translateY(-50%)",
      }}
      className="z-[9999] pointer-events-none hidden lg:flex items-center gap-2 rounded-xl border border-[var(--ep-line)] bg-[var(--ep-surface)]/95 px-3 py-1.5 text-xs text-[var(--ep-text)] shadow-2xl backdrop-blur-md animate-in fade-in duration-150 whitespace-nowrap"
    >
      {children}
    </div>,
    document.body,
  );
}
