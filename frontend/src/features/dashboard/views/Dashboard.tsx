import { useMemo, useState } from "react";
import { DashboardErrorState, DashboardLoadingState } from "@/features/dashboard/components/DashboardStates";
import { KpiCard, KpiGrid } from "@/features/dashboard/components/DashboardPrimitives";
import { RecentActivityPanel } from "@/features/dashboard/components/RecentActivityPanel";
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
          value={formatDashboardMetric(metrics.avgDo)}
          unit="mg/L"
          delta="Tanks with readings"
          deltaTone="ok"
        />
        <KpiCard
          label="Average pH"
          value={formatDashboardMetric(metrics.avgPh)}
          unit="pH"
          delta="Tanks with readings"
          deltaTone="ok"
        />
        <KpiCard
          label="Average temperature"
          value={formatDashboardMetric(metrics.avgTemp)}
          unit="°C"
          delta="Tanks with readings"
          deltaTone="ok"
        />
        <KpiCard
          label="Average salinity"
          value={formatDashboardMetric(metrics.avgSalinity)}
          unit="ppt"
          delta="Tanks with readings"
          deltaTone="ok"
        />
        <KpiCard
          label="Average water level"
          value={formatDashboardMetric(metrics.avgWaterLevel)}
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
