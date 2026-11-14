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
  { icon: "gauge", label: "Dashboard", view: "overview" },
  { icon: "chart-no-axes-combined", label: "Analytics", view: "analytics" },
  { icon: "layers", label: "Tanks", view: "tanks" },
  { icon: "waves", label: "Water Quality", view: "water" },
  { icon: "utensils", label: "Feeding", view: "feeding" },
  // { icon: "⇌", label: "Biofloc Loop", view: "biofloc" },
  { icon: "bell-ring", label: "Alerts", view: "alerts" },
  { icon: "clock", label: "Activity Log", view: "activity" },
];
import type { IconName } from "@/components/ui/Icon";
