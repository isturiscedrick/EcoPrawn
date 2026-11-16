/**
 * Static dashboard shell configuration and small pure helpers.
 * Keeping these outside the layout makes its rendering and interaction code
 * easier to scan without changing navigation behavior.
 */
export const DASHBOARD_QUICK_LINKS = [
  { key: "home", label: "Home", href: "/dashboard", icon: "house" },
  { key: "tanks", label: "Tanks", href: "/dashboard/tanks", icon: "layers" },
  { key: "vision", label: "Vision", href: "/dashboard/analytics", icon: "camera" },
  { key: "feeding", label: "Feeding", href: "/dashboard/feeding", icon: "utensils" },
  { key: "water", label: "Water Quality", href: "/dashboard/water", icon: "waves" },
] as const;

export function getProfileInitials(name: string): string {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return initials || "FO";
}
