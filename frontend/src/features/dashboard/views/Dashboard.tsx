import { useMemo, useState } from "react";
import { DashboardErrorState, DashboardLoadingState } from "@/features/dashboard/components/DashboardStates";
import { KpiCard, KpiGrid } from "@/features/dashboard/components/DashboardPrimitives";
import { RecentActivityPanel } from "@/features/dashboard/components/RecentActivityPanel";
import { DashboardPageHeader } from "@/features/dashboard/components/DashboardPageHeader";
import { TankSnapshotSection } from "@/features/dashboard/components/TankSnapshotSection";
import { useTanks } from "@/features/dashboard/context/TankContext";
import { buildRecentDashboardActivity } from "@/features/dashboard/lib/dashboard-activity";
import {
  filterDashboardTanks,
  formatDashboardMetric,
  getDashboardMetrics,
  type DashboardStatusFilter,
} from "@/features/dashboard/lib/dashboard-metrics";

export function Dashboard() {
  const {
    tanks,
    waterHistory = [],
    visionScanLog = [],
    loading,
    error,
  } = useTanks();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<DashboardStatusFilter>("all");

  const visibleTanks = useMemo(
    () => filterDashboardTanks(tanks, search, statusFilter),
    [tanks, search, statusFilter],
  );

  const metrics = useMemo(
    () => getDashboardMetrics(visibleTanks),
    [visibleTanks],
  );

  const healthyCount = useMemo(
    () => visibleTanks.filter((t) => t.hasWaterReadings && t.status === "ok").length,
    [visibleTanks],
  );

  const attentionCount = useMemo(
    () => visibleTanks.filter((t) => t.hasWaterReadings && t.status !== "ok").length,
    [visibleTanks],
  );

  const totalPopulation = useMemo(
    () => visibleTanks.reduce((sum, t) => sum + (t.population || 0), 0),
    [visibleTanks],
  );

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
      <DashboardPageHeader
        eyebrow="Facility overview"
        title="Dashboard"
        description="Live facility status and tank performance."
      />

      {/* 4 PRIMARY KPI CARDS */}
      <KpiGrid label="Facility snapshot metrics">
        <KpiCard
          icon="tank-stack"
          label="Active Tanks"
          value={String(metrics.count)}
          unit="tanks"
          delta={`${healthyCount} nominal · ${attentionCount} attention`}
          deltaTone={attentionCount > 0 ? "warn" : "ok"}
        />
        <KpiCard
          icon="package"
          label="Total Biomass"
          value={metrics.biomass.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
          unit="kg"
          delta={`${totalPopulation.toLocaleString()} prawns stocked`}
          deltaTone="ok"
        />
        <KpiCard
          icon="waves"
          label="Mean Dissolved Oxygen"
          value={formatDashboardMetric(metrics.avgDo)}
          unit="mg/L"
          delta={metrics.avgDo !== null && metrics.avgDo < 5.0 ? "Below target threshold" : "Optimal (5.5 - 7.5 mg/L)"}
          deltaTone={metrics.avgDo !== null && metrics.avgDo < 5.0 ? "warn" : "ok"}
        />
        <KpiCard
          icon="thermometer"
          label="Mean Temperature"
          value={formatDashboardMetric(metrics.avgTemp)}
          unit="°C"
          delta={metrics.avgTemp !== null && (metrics.avgTemp < 26 || metrics.avgTemp > 31.5) ? "Outside optimal band" : "Nominal (27 - 31 °C)"}
          deltaTone={metrics.avgTemp !== null && (metrics.avgTemp < 26 || metrics.avgTemp > 31.5) ? "warn" : "ok"}
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
