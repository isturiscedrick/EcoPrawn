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
  let healthyCount = 0;
  let noReadingCount = 0;

  for (const tank of tanks) {
    if (tank.status === "ok") healthyCount += 1;
    if (!tank.hasWaterReadings) noReadingCount += 1;
  }

  const attentionCount = tanks.length - healthyCount;

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
