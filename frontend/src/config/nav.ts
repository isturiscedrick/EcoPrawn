import type { IconName } from "@/components/ui/Icon";

export const LANDING_NAV_LINKS: [string, string][] = [
  ["Home", "/"],
  ["About", "/about"],
  ["Contact", "/contact"],
];

export type DashboardView =
  | "overview"
  | "analytics"
  | "tanks"
  | "water"
  | "vision"
  | "feeding"
  | "biofloc"
  | "alerts"
  | "activity"
  | "assistant";

export interface DashboardNavItem {
  icon: IconName;
  label: string;
  view: DashboardView;
  badge?: string;
  badgeVariant?: "default" | "ai" | "alert";
  description?: string;
  section?: "operations" | "intelligence" | "system";
}

export const DASHBOARD_NAV_ITEMS: DashboardNavItem[] = [
  {
    icon: "layout-grid",
    label: "Dashboard",
    view: "overview",
    description: "Facility KPI & biometrics overview",
    section: "operations",
  },
  {
    icon: "tank-stack",
    label: "Tanks",
    view: "tanks",
    description: "Tank biometrics & density monitoring",
    section: "operations",
  },
  {
    icon: "chart-bars-trend",
    label: "Analytics",
    view: "analytics",
    description: "Telemetry trends & biomass forecasts",
    section: "operations",
  },
  {
    icon: "waves",
    label: "Water Quality",
    view: "water",
    description: "DO, pH, salinity, ORP & temperature",
    section: "operations",
  },
  {
    icon: "sparkles",
    label: "AI Assistant",
    view: "assistant",
    badge: "AI",
    badgeVariant: "ai",
    description: "Aquaculture intelligence & instant diagnostics",
    section: "intelligence",
  },
  {
    icon: "bell-ring",
    label: "Alerts",
    view: "alerts",
    description: "Threshold alarms & telemetry notifications",
    section: "system",
  },
  {
    icon: "clock",
    label: "Activity Log",
    view: "activity",
    description: "Facility operations & audit timeline",
    section: "system",
  },
];
