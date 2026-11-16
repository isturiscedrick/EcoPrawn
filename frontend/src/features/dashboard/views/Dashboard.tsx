import { useNavigate } from "@tanstack/react-router";
import { KpiCard, KpiGrid } from "@/features/dashboard/components/DashboardPrimitives";
import { TankSnapshotSection } from "@/features/dashboard/components/TankSnapshotSection";
import { RecentActivityPanel } from "@/features/dashboard/components/RecentActivityPanel";
import { TankHealthPanel } from "@/features/dashboard/components/TankHealthPanel";
import { QuickActionsPanel } from "@/features/dashboard/components/QuickActionsPanel";
import { useTanks } from "@/features/dashboard/context/TankContext";
import { DashboardErrorState, DashboardLoadingState } from "@/features/dashboard/components/DashboardStates";
import { useThresholdSettings } from "@/features/dashboard/hooks/useThresholdSettings";
import { buildRecentDashboardActivity } from "@/features/dashboard/lib/dashboard-activity";
import { buildDashboardSummary } from "@/features/dashboard/lib/dashboard-summary";

export function Dashboard() {
  const navigate = useNavigate();
  const { tanks, waterHistory = [], visionScanLog = [], loading, error } = useTanks();
  const [thresholdSettings] = useThresholdSettings();

  if (loading) return <DashboardLoadingState />;
  if (error && tanks.length === 0) {
    return (
      <DashboardErrorState
        title="Dashboard data unavailable"
        description={error}
      />
    );
  }

  const {
    healthyCount,
    attentionCount,
    noReadingCount,
    outOfRangeCount,
    healthyPercent,
    attentionPercent,
    prioritizedTanks,
  } = buildDashboardSummary(tanks);
  const recentActivity = buildRecentDashboardActivity(tanks, waterHistory, visionScanLog);

  return (
    <>
      <header className="dashboard-page-header mb-7 block w-full border-b border-[var(--ep-line)] pb-6">
        <div className="block w-full min-w-0">
          <div className="ep-font-mono mb-2 block text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ep-primary)]">
            Facility overview
          </div>
          <h1 className="ep-font-display block w-full text-[26px] font-semibold leading-tight tracking-[-0.02em] text-[var(--ep-text)] sm:text-[30px]">
            Dashboard
          </h1>
          <p className="mt-2 block w-full text-sm text-[var(--ep-text-muted)]">
            Facility status and recent activity.
          </p>
        </div>
      </header>

      <KpiGrid label="Facility health summary">
        <KpiCard label="Registered tanks" value={String(tanks.length)} unit="tanks" delta="Total tanks" deltaTone="ok" onDetails={() => { void navigate({ to: "/dashboard/tanks" }); }} />
        <KpiCard label="Healthy tanks" value={String(healthyCount)} unit="tanks" delta={tanks.length ? `${Math.round(healthyPercent)}% of facility` : "No tanks yet"} deltaTone="ok" onDetails={() => { void navigate({ to: "/dashboard/tanks" }); }} />
        <KpiCard label="Need attention" value={String(attentionCount)} unit="tanks" delta={outOfRangeCount ? `${outOfRangeCount} with out-of-range readings` : attentionCount ? "Awaiting readings" : "No warnings"} deltaTone={attentionCount ? "warn" : "ok"} onDetails={() => { void navigate({ to: "/dashboard/water" }); }} />
        <KpiCard label="No water readings" value={String(noReadingCount)} unit="tanks" delta={noReadingCount ? "Awaiting data" : "Readings available"} deltaTone={noReadingCount ? "warn" : "ok"} onDetails={() => { void navigate({ to: "/dashboard/water" }); }} />
      </KpiGrid>

      <TankSnapshotSection
        tanks={tanks}
        prioritizedTanks={prioritizedTanks}
        thresholdSettings={thresholdSettings}
        noReadingCount={noReadingCount}
      />

      <RecentActivityPanel activities={recentActivity} />

      <div className="mb-5 grid grid-cols-1 gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <TankHealthPanel
          tankCount={tanks.length}
          healthyCount={healthyCount}
          attentionCount={attentionCount}
          healthyPercent={healthyPercent}
          attentionPercent={attentionPercent}
        />

        <QuickActionsPanel />
      </div>
    </>
  );
}
