export const LANDING_NAV_LINKS: [string, string][] = [
  ["Home", "#top"],
  ["Objectives", "#objectives"],
  ["Systems", "#systems"],
  ["Scope", "#scope"],
];

export interface DashboardNavItem {
  icon: string;
  label: string;
  active: boolean;
}

export const DASHBOARD_NAV_ITEMS: DashboardNavItem[] = [
  { icon: "◧", label: "Overview", active: true },
  { icon: "≈", label: "Water Quality", active: false },
  { icon: "◎", label: "Vision & Growth", active: false },
  { icon: "▤", label: "Feeding", active: false },
  { icon: "⇌", label: "Biofloc Loop", active: false },
  { icon: "⚠", label: "Alerts", active: false },
];
