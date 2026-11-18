import { useMemo, useState } from "react";
import { DashboardErrorState, DashboardLoadingState } from "@/features/dashboard/components/DashboardStates";
import { KpiCard, KpiGrid } from "@/features/dashboard/components/DashboardPrimitives";
import { RecentActivityPanel } from "@/features/dashboard/components/RecentActivityPanel";
import { TankSnapshotSection } from "@/features/dashboard/components/TankSnapshotSection";
import { useTanks } from "@/features/dashboard/context/TankContext";
import { buildRecentDashboardActivity } from "@/features/dashboard/lib/dashboard-activity";

type StatusFilter = "all" | "healthy" | "attention" | "no-readings";
type Tank = ReturnType<typeof useTanks>["tanks"][number];

function formatMetric(value: number | null, unit = "") {
  if (value === null) return "—";
  return unit ? `${value.toFixed(1)} ${unit}` : value.toFixed(1);
}

function getAverage(
  tanks: Tank[],
  select: (tank: Tank) => number,
): number | null {
  if (tanks.length === 0) return null;
  return tanks.reduce((sum, tank) => sum + select(tank), 0) / tanks.length;
}

export function Dashboard() {
  const {
    tanks,
    waterHistory = [],
    visionScanLog = [],
    loading,
    error,
  } = useTanks();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const visibleTanks = useMemo(() => {
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
  }, [tanks, search, statusFilter]);

  const metrics = useMemo(() => {
    const tanksWithReadings = visibleTanks.filter(
      (tank) => tank.hasWaterReadings,
    );

    return {
      count: visibleTanks.length,
      biomass: visibleTanks.reduce((sum, tank) => sum + tank.biomass, 0),
      avgDo: getAverage(tanksWithReadings, (tank) => tank.dissolvedOxygen),
      avgPh: getAverage(tanksWithReadings, (tank) => tank.ph),
      avgTemp: getAverage(tanksWithReadings, (tank) => tank.temperature),
      avgSalinity: getAverage(tanksWithReadings, (tank) => tank.salinity),
      avgWaterLevel: getAverage(tanksWithReadings, (tank) => tank.waterLevel),
    };
  }, [visibleTanks]);

  const recentActivity = useMemo(
    () => buildRecentDashboardActivity(tanks, waterHistory, visionScanLog),
    [tanks, waterHistory, visionScanLog],
  );

  if (loading) return <DashboardLoadingState />;

  if (error && tanks.length === 0) {
    return (
      <DashboardErrorState
        title="Dashboard data unavailable"
        description={error}
      />
    );
  }

  return (
    <>
      <header className="dashboard-page-header mb-6 block w-full border-b border-[var(--ep-line)] pb-6">
        <div className="ep-font-mono mb-2 block text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ep-primary)]">
          Facility overview
        </div>
        <h1 className="ep-font-display block w-full text-[26px] font-semibold leading-tight tracking-[-0.02em] text-[var(--ep-text)] sm:text-[30px]">
          Dashboard
        </h1>
        <p className="mt-2 block w-full text-sm text-[var(--ep-text-muted)]">
          Tank status, water parameters, and biomass at a glance.
        </p>
      </header>

      <KpiGrid label="Tank snapshot metrics">
        <KpiCard
          label="Tanks shown"
          value={String(metrics.count)}
          unit="tanks"
          delta="Current table results"
          deltaTone="ok"
        />
        <KpiCard
          label="Total biomass"
          value={metrics.biomass.toFixed(1)}
          unit="kg"
          delta="Visible tanks"
          deltaTone="ok"
        />
        <KpiCard
          label="Average dissolved oxygen"
          value={formatMetric(metrics.avgDo)}
          unit="mg/L"
          delta="Tanks with readings"
          deltaTone="ok"
        />
        <KpiCard
          label="Average pH"
          value={formatMetric(metrics.avgPh)}
          delta="Tanks with readings"
          deltaTone="ok"
        />
        <KpiCard
          label="Average temperature"
          value={formatMetric(metrics.avgTemp)}
          unit="°C"
          delta="Tanks with readings"
          deltaTone="ok"
        />
        <KpiCard
          label="Average salinity"
          value={formatMetric(metrics.avgSalinity)}
          unit="ppt"
          delta="Tanks with readings"
          deltaTone="ok"
        />
        <KpiCard
          label="Average water level"
          value={formatMetric(metrics.avgWaterLevel)}
          unit="%"
          delta="Tanks with readings"
          deltaTone="ok"
        />
      </KpiGrid>

      <TankSnapshotSection
        tanks={visibleTanks}
        search={search}
        statusFilter={statusFilter}
        onSearchChange={setSearch}
        onStatusFilterChange={setStatusFilter}
      />

      <RecentActivityPanel activities={recentActivity} />
    </>
  );
}
