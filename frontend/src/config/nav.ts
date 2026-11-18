export const LANDING_NAV_LINKS: [string, string][] = [
  ["Home", "/"],
  ["About", "/about"],
  ["Contact", "/contact"],
];

export type DashboardView = "overview" | "analytics" | "tanks" | "water" | "vision" | "feeding" | "biofloc" | "alerts" | "activity";

export interface DashboardNavItem {
  icon: IconName;
  label: string;
  view: DashboardView;
}

export const DASHBOARD_NAV_ITEMS: DashboardNavItem[] = [
  { icon: "layout-grid", label: "Dashboard", view: "overview" },
  { icon: "chart-bars-trend", label: "Analytics", view: "analytics" },
  { icon: "tank-stack", label: "Tanks", view: "tanks" },
  { icon: "bell-ring", label: "Alerts", view: "alerts" },
  { icon: "clock", label: "Activity Log", view: "activity" },
];
