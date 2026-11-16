import type { SVGProps } from "react";

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
  "flex min-h-11 w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-[14.5px] font-medium text-[var(--ep-text-muted)] transition-colors duration-200 hover:bg-[var(--ep-tint)] hover:text-[var(--ep-text)]";
