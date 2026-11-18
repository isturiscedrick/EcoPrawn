import { useMemo } from "react";
import { KpiCard, KpiGrid, Panel } from "@/features/dashboard/components/DashboardPrimitives";
import { DashboardViewSkeleton } from "@/features/dashboard/components/DashboardStates";
import { DonutChart, FeedingProgressChart, GrowthHistoryChart, WaterHistoryChart } from "@/features/dashboard/components/AnalyticsCharts";
import { useTanks } from "@/features/dashboard/context/TankContext";
import { downloadCsv } from "@/utils/downloadCsv";
const TANK_COLORS = ["var(--ep-accent)", "var(--ep-brand-secondary)", "var(--ep-status-success)", "var(--ep-status-warning)", "#6D67B2", "#3680B9"];

export function Analytics() {
  const { tanks, growthHistory = [], waterHistory = [], loading } = useTanks();

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

  if (loading) return <DashboardViewSkeleton variant="vision" />;

  return (
    <>
      <div className="dashboard-page-header mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-[var(--ep-line)] pb-6">
        <div>
          <div className="ep-font-mono mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ep-primary)]">
            Production intelligence
          </div>
          <h1 className="ep-font-display text-[26px] font-semibold leading-tight tracking-[-0.02em] text-[var(--ep-text)] sm:text-[30px]">
            Analytics
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-[var(--ep-text-muted)]">
            Production trends across tanks.
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
          className="inline-flex min-h-11 w-full touch-manipulation items-center justify-center gap-2 rounded-xl border border-[var(--ep-line)] bg-[var(--ep-surface)] px-3 py-2 text-sm font-semibold text-[var(--ep-primary)] transition-colors hover:bg-[var(--ep-tint)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ep-primary)] sm:w-auto"
        >
          <span aria-hidden="true">↓</span> Export CSV
        </button>
      </div>
      <KpiGrid label="Facility analytics summary">
        <KpiCard label="Total biomass" value={metrics.totalBiomass.toFixed(1)} unit="kg" delta="All tanks" deltaTone="ok" />
        <KpiCard label="Estimated population" value={metrics.totalPopulation.toLocaleString()} unit="shrimp" delta="Facility total" deltaTone="ok" />
        <KpiCard label="Average body length" value={tanks.length ? metrics.avgBodyLength.toFixed(1) : "—"} unit="cm" delta="Latest scans" deltaTone="ok" />
        <KpiCard label="Average shrimp weight" value={tanks.length ? metrics.avgWeight.toFixed(1) : "—"} unit="g" delta={`${metrics.abnormal.toLocaleString()} abnormal behavior flags`} deltaTone={metrics.abnormal ? "warn" : "ok"} />
      </KpiGrid>

      <div className="mb-5">
        <Panel title="Biomass distribution" icon="chart-no-axes-combined" badge="share by tank">
          <DonutChart items={biomassDistribution} unit="kg" emptyLabel="No biomass records available yet." />
        </Panel>
      </div>

      <div className="mb-5">
        <Panel title="Growth analysis" icon="chart-no-axes-combined" badge={`${growthHistory.length} scans`}>
          <GrowthHistoryChart data={growthHistory} />
        </Panel>
      </div>

      <div className="mb-5">
        <Panel title="Water quality trends" icon="activity" badge={`${waterHistory.length} readings`}>
          <WaterHistoryChart data={waterHistory} tanks={tanks.map(tank => ({ id: tank.id, name: tank.name }))} />
        </Panel>
      </div>

      <Panel title="Feeding progress by tank" icon="layers" badge="today's target">
        <FeedingProgressChart tanks={tanks.map(tank => ({
          id: tank.id, name: tank.name, dispensedToday: tank.dispensedToday, targetToday: tank.targetToday,
        }))} />
      </Panel>

      <p className="mt-4 text-xs text-[var(--ep-text-muted)]">
        Charts show recorded data only; missing values are not estimated.
      </p>
    </>
  );
}
