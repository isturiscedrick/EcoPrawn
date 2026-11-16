import type { IconName } from "@/components/ui/Icon";

/** Ordered process steps shown in the landing page's sustainability section. */
export const STEPS: { step: string; title: string; body: string; icon: IconName }[] = [
  {
    step: "01",
    title: "Sense",
    icon: "activity",
    body: "Five sensors stream water readings around the clock.",
  },
  {
    step: "02",
    title: "Analyze",
    icon: "eye",
    body: "Cameras estimate shrimp growth and biomass without handling.",
  },
  {
    step: "03",
    title: "Act",
    icon: "zap",
    body: "Aerators start automatically. Feed follows biomass.",
  },
  {
    step: "04",
    title: "Return",
    icon: "leaf",
    body: "Treated wastewater is routed to mangrove and wetland.",
  },
];
