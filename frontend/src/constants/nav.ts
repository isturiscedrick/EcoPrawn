export const LANDING_NAV_LINKS: [string, string][] = [
  ["Home", "#top"],
  ["Objectives", "#objectives"],
  ["Systems", "#systems"],
  ["Scope", "#scope"],
];

export type DashboardView = "overview" | "water" | "vision" | "feeding" | "biofloc" | "alerts";

export interface DashboardNavItem {
  icon: string;
  label: string;
  view: DashboardView;
}

export const DASHBOARD_NAV_ITEMS: DashboardNavItem[] = [
  { icon: "◧", label: "Overview", view: "overview" },
  { icon: "≈", label: "Water Quality", view: "water" },
  { icon: "◎", label: "Vision & Growth", view: "vision" },
  { icon: "▤", label: "Feeding", view: "feeding" },
  { icon: "⇌", label: "Biofloc Loop", view: "biofloc" },
  { icon: "⚠", label: "Alerts", view: "alerts" },
];