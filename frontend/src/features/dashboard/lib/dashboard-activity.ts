import type { Tank } from "@/features/dashboard/context/TankContext";
import type { DashboardData, WaterHistoryPoint } from "@/types/api";

export interface RecentDashboardActivity {
  id: string;
  kind: "Water reading" | "Vision scan";
  tankName: string;
  detail: string;
  timestamp: Date;
}

export function buildRecentDashboardActivity(
  tanks: Tank[],
  waterHistory: WaterHistoryPoint[],
  visionScanLog: DashboardData["visionScanLog"],
): RecentDashboardActivity[] {
  const tankNames = new Map(tanks.map((tank) => [tank.id, tank.name]));

  return [
    ...waterHistory.map((point) => ({
      id: `water-${point.tankId}-${point.recordedAt}`,
      kind: "Water reading" as const,
      tankName: tankNames.get(point.tankId) ?? "Unknown tank",
      detail: `DO ${point.dissolvedOxygen.toFixed(1)} mg/L · pH ${point.ph.toFixed(1)} · ${point.temperature.toFixed(1)} °C`,
      timestamp: new Date(point.recordedAt),
    })),
    ...visionScanLog.map((scan) => ({
      id: `scan-${scan.id}`,
      kind: "Vision scan" as const,
      tankName: scan.tank,
      detail: scan.note || "Scan recorded",
      timestamp: new Date(scan.time),
    })),
  ]
    .filter((activity) => Number.isFinite(activity.timestamp.getTime()))
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 5);
}
