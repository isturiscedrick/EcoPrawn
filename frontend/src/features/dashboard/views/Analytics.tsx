import { useMemo } from "react";
import { KpiCard, Panel } from "@/features/dashboard/components/DashboardPrimitives";
import { DashboardViewSkeleton } from "@/features/dashboard/components/DashboardStates";
import { DonutChart, FeedingProgressChart, GrowthHistoryChart, WaterHistoryChart } from "@/features/dashboard/components/AnalyticsCharts";
import { useTanks } from "@/features/dashboard/context/TankContext";
import { downloadCsv } from "@/utils/downloadCsv";

const TANK_COLORS = ["#D85A35", "#167C80", "#6D67B2", "#C18A27", "#39865B", "#B34E83"];

export function Analytics() {
  const { tanks, growthHistory = [], waterHistory = [], loading, lastUpdatedAt } = useTanks();

  const metrics = useMemo(() => ({
    totalBiomass: tanks.reduce((sum, tank) => sum + tank.biomass, 0),
    totalPopulation: tanks.reduce((sum, tank) => sum + tank.population, 0),
    avgBodyLength: tanks.length ? tanks.reduce((sum, tank) => sum + tank.bodyLength, 0) / tanks.length : 0,
    avgWeight: tanks.length ? tanks.reduce((sum, tank) => sum + tank.weight, 0) / tanks.length : 0,
    abnormal: tanks.reduce((sum, tank) => sum + tank.abnormal, 0),
  }), [tanks]);

  const biomassDistribution = useMemo(() => tanks.map((tank, index) => ({
    label: tank.name, value: tank.biomass, color: TANK_COLORS[index % TANK_COLORS.length],
  })), [tanks]);

  const healthDistribution = useMemo(() => [
    { label: "Healthy", value: tanks.filter(tank => tank.status === "ok").length, color: "#39865B" },
    { label: "Needs attention", value: tanks.filter(tank => tank.status === "warn").length, color: "#D85A35" },
  ], [tanks]);

  if (loading) return <DashboardViewSkeleton variant="vision" />;

  return (
    <>
      <div className="dashboard-page-header mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-[var(--ep-line)] pb-6">
        <div>
          <div className="ep-font-mono mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ep-primary)]">
            Production intelligence
          </div>
          <h1 className="ep-font-display text-[30px] font-semibold leading-tight tracking-[-0.02em] text-[var(--ep-text)]">
            Analytics
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-[var(--ep-text-muted)]">
            Explore production performance, shrimp growth, sensor history, and feeding efficiency across your facility.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            const rows: (string | number)[][] = [];
            tanks.forEach(tank => {
              rows.push(["Tank summary", tank.name, "", "Biomass", tank.biomass, "kg"]);
              rows.push(["Tank summary", tank.name, "", "Population", tank.population, "shrimp"]);
              rows.push(["Tank summary", tank.name, "", "Average body length", tank.bodyLength, "cm"]);
              rows.push(["Tank summary", tank.name, "", "Average weight", tank.weight, "g"]);
              rows.push(["Tank summary", tank.name, "", "Dissolved oxygen", tank.dissolvedOxygen, "mg/L"]);
              rows.push(["Tank summary", tank.name, "", "pH", tank.ph, ""]);
              rows.push(["Tank summary", tank.name, "", "Temperature", tank.temperature, "°C"]);
              rows.push(["Tank summary", tank.name, "", "Salinity", tank.salinity, "ppt"]);
              rows.push(["Tank summary", tank.name, "", "Water level", tank.waterLevel, "%"]);
            });
            growthHistory.forEach(point => {
              rows.push(["Growth history", point.tankName, point.recordedAt, "Body length", point.bodyLength, "cm"]);
              rows.push(["Growth history", point.tankName, point.recordedAt, "Weight", point.weight, "g"]);
              rows.push(["Growth history", point.tankName, point.recordedAt, "Population", point.population, "shrimp"]);
            });
            waterHistory.forEach(point => {
              const tankName = tanks.find(tank => tank.id === point.tankId)?.name ?? point.tankId;
              rows.push(["Water history", tankName, point.recordedAt, "Dissolved oxygen", point.dissolvedOxygen, "mg/L"]);
              rows.push(["Water history", tankName, point.recordedAt, "pH", point.ph, ""]);
              rows.push(["Water history", tankName, point.recordedAt, "Temperature", point.temperature, "°C"]);
              rows.push(["Water history", tankName, point.recordedAt, "Salinity", point.salinity, "ppt"]);
              rows.push(["Water history", tankName, point.recordedAt, "Water level", point.waterLevel, "%"]);
            });
            downloadCsv(`ecoprawn-analytics-${new Date().toISOString().slice(0, 10)}.csv`, ["Record type", "Tank", "Recorded at", "Metric", "Value", "Unit"], rows);
          }}
          className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--ep-line)] bg-[var(--ep-surface)] px-3 py-2 text-xs font-semibold text-[var(--ep-primary)] transition-colors hover:bg-[var(--ep-tint)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ep-primary)]"
        >
          <span aria-hidden="true">↓</span> Export CSV
        </button>
        <div className="inline-flex items-center gap-2 rounded-full border border-[var(--ep-line)] bg-[var(--ep-surface)] px-3 py-2 text-xs text-[var(--ep-text-muted)]">
          <span className="h-2 w-2 rounded-full bg-[var(--ep-status-success)]" />
          {lastUpdatedAt ? `Data updated ${lastUpdatedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : "Awaiting data"}
        </div>
      </div>

      <section aria-label="Facility analytics summary" className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Total biomass" value={metrics.totalBiomass.toFixed(1)} unit="kg" delta="Combined across all tanks" deltaTone="ok" />
        <KpiCard label="Estimated population" value={metrics.totalPopulation.toLocaleString()} unit="shrimp" delta="Current facility estimate" deltaTone="ok" />
        <KpiCard label="Average body length" value={tanks.length ? metrics.avgBodyLength.toFixed(1) : "—"} unit="cm" delta="Based on latest tank scans" deltaTone="ok" />
        <KpiCard label="Average shrimp weight" value={tanks.length ? metrics.avgWeight.toFixed(1) : "—"} unit="g" delta={`${metrics.abnormal.toLocaleString()} abnormal behavior flags`} deltaTone={metrics.abnormal ? "warn" : "ok"} />
      </section>

      <div className="mb-5 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Panel title="Biomass distribution" icon="chart-no-axes-combined" badge="share by tank">
          <DonutChart items={biomassDistribution} unit="kg" emptyLabel="No biomass records available yet." />
        </Panel>
        <Panel title="Tank health distribution" icon="activity" badge={`${tanks.length} tanks monitored`}>
          <DonutChart items={healthDistribution} unit="tanks" emptyLabel="Add tanks to see health distribution." />
          <p className="mt-2 text-center text-[11px] text-[var(--ep-text-muted)]">Health status follows the current water-quality thresholds.</p>
        </Panel>
      </div>

      <div className="mb-5">
        <Panel title="Shrimp growth analysis" icon="chart-no-axes-combined" badge={`${growthHistory.length} timestamped scans`}>
          <GrowthHistoryChart data={growthHistory} />
        </Panel>
      </div>

      <div className="mb-5">
        <Panel title="Water quality trends" icon="activity" badge={`${waterHistory.length} sensor readings`}>
          <WaterHistoryChart data={waterHistory} tanks={tanks.map(tank => ({ id: tank.id, name: tank.name }))} />
        </Panel>
      </div>

      <Panel title="Feeding progress by tank" icon="layers" badge="today's target">
        <FeedingProgressChart tanks={tanks.map(tank => ({
          id: tank.id, name: tank.name, dispensedToday: tank.dispensedToday, targetToday: tank.targetToday,
        }))} />
      </Panel>

      <p className="mt-4 text-xs text-[var(--ep-text-muted)]">
        Charts use the latest available tank records and timestamped sensor and vision history. Historical points are shown as recorded; no missing values or dates are fabricated.
      </p>
    </>
  );
}
