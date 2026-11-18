import type { Tank } from "@/features/dashboard/context/TankContext";

export type DashboardStatusFilter =
  | "all"
  | "healthy"
  | "attention"
  | "no-readings";

export interface DashboardMetrics {
  count: number;
  biomass: number;
  avgDo: number | null;
  avgPh: number | null;
  avgTemp: number | null;
  avgSalinity: number | null;
  avgWaterLevel: number | null;
}

export function filterDashboardTanks(
  tanks: Tank[],
  search: string,
  statusFilter: DashboardStatusFilter,
): Tank[] {
  const query = search.trim().toLocaleLowerCase();

  return tanks.filter((tank) => {
    const matchesSearch =
      !query ||
      tank.name.toLocaleLowerCase().includes(query) ||
      tank.pl.toLocaleLowerCase().includes(query);

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "no-readings"
        ? !tank.hasWaterReadings
        : statusFilter === "healthy"
          ? tank.hasWaterReadings && tank.status === "ok"
          : tank.hasWaterReadings && tank.status !== "ok");

    return matchesSearch && matchesStatus;
  });
}

function average(
  tanks: Tank[],
  select: (tank: Tank) => number,
): number | null {
  if (tanks.length === 0) return null;
  return tanks.reduce((sum, tank) => sum + select(tank), 0) / tanks.length;
}

export function getDashboardMetrics(tanks: Tank[]): DashboardMetrics {
  const tanksWithReadings = tanks.filter((tank) => tank.hasWaterReadings);

  return {
    count: tanks.length,
    biomass: tanks.reduce((sum, tank) => sum + tank.biomass, 0),
    avgDo: average(tanksWithReadings, (tank) => tank.dissolvedOxygen),
    avgPh: average(tanksWithReadings, (tank) => tank.ph),
    avgTemp: average(tanksWithReadings, (tank) => tank.temperature),
    avgSalinity: average(tanksWithReadings, (tank) => tank.salinity),
    avgWaterLevel: average(tanksWithReadings, (tank) => tank.waterLevel),
  };
}

export function formatDashboardMetric(value: number | null): string {
  return value === null ? "—" : value.toFixed(1);
}
