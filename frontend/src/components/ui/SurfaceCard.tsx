import type { HTMLAttributes, ReactNode } from "react";

type SurfaceCardProps = HTMLAttributes<HTMLDivElement> & {
  as?: "div" | "article";
  tone?: "surface" | "inverse";
  children: ReactNode;
};

/** Shared card surface for public pages. Layout remains page-owned via className. */
export function SurfaceCard({
  as = "div",
  tone = "surface",
  className = "",
  children,
  ...props
}: SurfaceCardProps) {
  const Component = as;
  const toneClass =
    tone === "inverse"
      ? "border-white/20 bg-white/[0.06] text-[var(--ep-on-deep)]"
      : "border-[var(--ep-line)] bg-[var(--ep-surface)] text-[var(--ep-text)]";

  return (
    <Component
      className={`min-w-0 rounded-2xl border ${toneClass} ${className}`.trim()}
      {...props}
    >
      {children}
    </Component>
  );
}
