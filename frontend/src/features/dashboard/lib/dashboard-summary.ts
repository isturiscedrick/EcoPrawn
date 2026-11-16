import type { Tank } from "@/features/dashboard/context/TankContext";

export interface DashboardSummary {
  healthyCount: number;
  attentionCount: number;
  noReadingCount: number;
  outOfRangeCount: number;
  healthyPercent: number;
  attentionPercent: number;
  prioritizedTanks: Tank[];
}

export function buildDashboardSummary(tanks: Tank[]): DashboardSummary {
  const healthyCount = tanks.filter((tank) => tank.status === "ok").length;
  const attentionCount = tanks.length - healthyCount;
  const noReadingCount = tanks.filter((tank) => !tank.hasWaterReadings).length;

  return {
    healthyCount,
    attentionCount,
    noReadingCount,
    outOfRangeCount: attentionCount - noReadingCount,
    healthyPercent: tanks.length ? (healthyCount / tanks.length) * 100 : 0,
    attentionPercent: tanks.length ? (attentionCount / tanks.length) * 100 : 0,
    prioritizedTanks: [...tanks].sort((a, b) => {
      if (a.status !== b.status) return a.status === "warn" ? -1 : 1;
      if (a.hasWaterReadings !== b.hasWaterReadings) return a.hasWaterReadings ? -1 : 1;
      return a.name.localeCompare(b.name);
    }),
  };
}
