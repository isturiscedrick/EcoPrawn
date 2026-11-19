import {
  DonutChart,
  FeedingProgressChart,
  GrowthHistoryChart,
  WaterHistoryChart,
} from "@/features/dashboard/components/AnalyticsCharts";
import { DashboardPageHeader } from "@/features/dashboard/components/DashboardPageHeader";
import {
  KpiCard,
  KpiGrid,
  Panel,
} from "@/features/dashboard/components/DashboardPrimitives";
import { DashboardViewSkeleton } from "@/features/dashboard/components/DashboardStates";
import { useTanks } from "@/features/dashboard/context/TankContext";

export function Analytics() {
  const {
    tanks,
    growthHistory = [],
    waterHistory = [],
    loading,
  } = useTanks();

  if (loading) return <DashboardViewSkeleton variant="vision" />;

  const healthyCount = tanks.filter((tank) => tank.status === "ok").length;
  const attentionCount = tanks.length - healthyCount;
  const totalBiomass = tanks.reduce((sum, tank) => sum + tank.biomass, 0);
  const totalFeed = tanks.reduce((sum, tank) => sum + tank.dispensedToday, 0);
  const feedTarget = tanks.reduce((sum, tank) => sum + tank.targetToday, 0);

  return (
    <>
      <DashboardPageHeader
        eyebrow="Farm performance"
        title="Analytics"
        description="Growth, water, feed, and tank trends in one view."
      />

      <KpiGrid label="Farm performance summary">
        <KpiCard
          label="Active tanks"
          value={tanks.length.toLocaleString()}
          unit="tanks"
          delta={`${attentionCount} need attention`}
          deltaTone={attentionCount ? "warn" : "ok"}
          icon="tank-stack"
        />
        <KpiCard
          label="Estimated biomass"
          value={totalBiomass.toLocaleString(undefined, { maximumFractionDigits: 1 })}
          unit="kg"
          delta="Current estimate"
          deltaTone="ok"
          icon="chart-no-axes-combined"
        />
        <KpiCard
          label="Healthy tanks"
          value={healthyCount.toLocaleString()}
          unit="tanks"
          delta={tanks.length ? `${Math.round((healthyCount / tanks.length) * 100)}% of facility` : "No tanks yet"}
          deltaTone={attentionCount ? "warn" : "ok"}
          icon="activity"
        />
        <KpiCard
          label="Feed dispensed today"
          value={totalFeed.toLocaleString(undefined, { maximumFractionDigits: 1 })}
          unit={`of ${feedTarget.toLocaleString(undefined, { maximumFractionDigits: 1 })} kg`}
          delta="Across all tanks"
          deltaTone="ok"
          icon="utensils"
        />
      </KpiGrid>

      <div className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-2">
        <Panel title="Growth history" badge={`${growthHistory.length} scans`} icon="chart-no-axes-combined">
          <GrowthHistoryChart data={growthHistory} />
        </Panel>
        <Panel title="Water quality history" badge={`${waterHistory.length} readings`} icon="waves">
          <WaterHistoryChart
            data={waterHistory}
            tanks={tanks.map(({ id, name }) => ({ id, name }))}
          />
        </Panel>
        <Panel title="Tank health" badge={`${tanks.length} total`} icon="activity">
          <DonutChart
            items={[
              { label: "Healthy", value: healthyCount, color: "var(--ep-status-success)" },
              { label: "Needs attention", value: attentionCount, color: "var(--ep-status-warning)" },
            ]}
            unit="tanks"
            emptyLabel="No tanks have been added yet."
          />
        </Panel>
        <Panel title="Feeding progress" badge="Today" icon="utensils">
          <FeedingProgressChart tanks={tanks} />
        </Panel>
      </div>
    </>
  );
}
