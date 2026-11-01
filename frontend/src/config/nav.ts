export const LANDING_NAV_LINKS: [string, string][] = [
  ["Home", "/"],
  ["About", "/about"],
  ["Contact", "/contact"],
];

export type DashboardView = "overview" | "tanks" | "water" | "vision" | "feeding" | "biofloc" | "alerts";

export interface DashboardNavItem {
  icon: IconName;
  label: string;
  view: DashboardView;
}

export const DASHBOARD_NAV_ITEMS: DashboardNavItem[] = [
  { icon: "gauge", label: "Overview", view: "overview" },
  { icon: "layers", label: "Tanks", view: "tanks" },
  { icon: "waves", label: "Water Quality", view: "water" },
  { icon: "eye", label: "Vision & Growth", view: "vision" },
  { icon: "utensils", label: "Feeding", view: "feeding" },
  // { icon: "⇌", label: "Biofloc Loop", view: "biofloc" },
  { icon: "zap", label: "Alerts", view: "alerts" },
];
import type { IconName } from "@/components/ui/Icon";
