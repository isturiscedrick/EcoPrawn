import { useMemo } from "react";
import { KpiCard, Panel } from "@/features/dashboard/components/DashboardPrimitives";
import { TrendChart } from "@/features/dashboard/components/TrendChart";
import { useTanks } from "@/features/dashboard/context/TankContext";
import { DashboardViewSkeleton } from "@/features/dashboard/components/DashboardStates";

function ComparisonBars({
  items,
  valueLabel,
  unit,
  color = "var(--ep-accent)",
}: {
  items: { id: string; name: string; value: number }[];
  valueLabel: string;
  unit: string;
  color?: string;
}) {
  const max = Math.max(1, ...items.map((item) => item.value));
  if (!items.length) {
    return <p className="py-8 text-center text-sm text-[var(--ep-text-muted)]">No recorded {valueLabel.toLowerCase()} data available yet.</p>;
  }
  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={item.id}>
          <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
            <span className="flex min-w-0 items-center gap-2 text-[var(--ep-text)]">
              <span className="ep-font-mono w-5 shrink-0 text-[10px] text-[var(--ep-text-muted)]">{String(index + 1).padStart(2, "0")}</span>
              <span className="truncate font-semibold">{item.name}</span>
            </span>
            <span className="ep-font-mono shrink-0 text-xs font-semibold text-[var(--ep-text)]">{item.value.toLocaleString(undefined, { maximumFractionDigits: 1 })} {unit}</span>
          </div>
          <div className="ml-7 h-3 overflow-hidden rounded-full bg-[var(--ep-line)]">
            <div className="h-full rounded-full transition-[width] duration-500" style={{ width: `${Math.max(item.value > 0 ? 1.5 : 0, (item.value / max) * 100)}%`, background: color }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function Analytics() {
  const { tanks, growthTrend, loading, lastUpdatedAt } = useTanks();

  const metrics = useMemo(() => ({
    totalBiomass: tanks.reduce((sum, tank) => sum + tank.biomass, 0),
    totalPopulation: tanks.reduce((sum, tank) => sum + tank.population, 0),
    avgBodyLength: tanks.length ? tanks.reduce((sum, tank) => sum + tank.bodyLength, 0) / tanks.length : 0,
    avgWeight: tanks.length ? tanks.reduce((sum, tank) => sum + tank.weight, 0) / tanks.length : 0,
    abnormal: tanks.reduce((sum, tank) => sum + tank.abnormal, 0),
  }), [tanks]);

  const biomassRanking = useMemo(
    () => [...tanks].sort((a, b) => b.biomass - a.biomass).map((tank) => ({ id: tank.id, name: tank.name, value: tank.biomass })),
    [tanks],
  );
  const populationRanking = useMemo(
    () => [...tanks].sort((a, b) => b.population - a.population).map((tank) => ({ id: tank.id, name: tank.name, value: tank.population })),
    [tanks],
  );

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
            Compare tank performance, track growth patterns, and understand how biomass and population are distributed across your facility.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-[var(--ep-line)] bg-[var(--ep-surface)] px-3 py-2 text-xs text-[var(--ep-text-muted)]">
          <span className="h-2 w-2 rounded-full bg-[var(--ep-status-success)]" />
          {lastUpdatedAt ? `Data updated ${lastUpdatedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : "Awaiting data"}
        </div>
      </div>

      <section aria-label="Facility analytics summary" className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Total biomass" value={metrics.totalBiomass.toFixed(1)} unit="kg" delta="Combined across all tanks" deltaTone="ok" />
        <KpiCard label="Estimated population" value={metrics.totalPopulation.toLocaleString()} unit="shrimp" delta="Current facility estimate" deltaTone="ok" />
        <KpiCard label="Average body length" value={tanks.length ? metrics.avgBodyLength.toFixed(1) : "—"} unit="cm" delta="Based on available tank records" deltaTone="ok" />
        <KpiCard label="Average shrimp weight" value={tanks.length ? metrics.avgWeight.toFixed(1) : "—"} unit="g" delta={`${metrics.abnormal.toLocaleString()} abnormal behavior flags`} deltaTone={metrics.abnormal ? "warn" : "ok"} />
      </section>

      <div className="mb-5 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Panel title="Biomass distribution" icon="chart-no-axes-combined" badge="kg by tank">
          <ComparisonBars items={biomassRanking} valueLabel="Biomass" unit="kg" />
        </Panel>
        <Panel title="Population by tank" icon="layers" badge="estimated shrimp">
          <ComparisonBars items={populationRanking} valueLabel="Population" unit="shrimp" color="var(--ep-primary)" />
        </Panel>
      </div>

      <Panel title="Growth trend" icon="activity" badge={`${growthTrend.length} recorded points`}>
        {growthTrend.length > 1 ? (
          <>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="ep-font-display text-2xl font-semibold text-[var(--ep-text)]">{growthTrend[growthTrend.length - 1].toFixed(1)} <span className="text-sm font-medium text-[var(--ep-text-muted)]">cm</span></div>
                <div className="text-xs text-[var(--ep-text-muted)]">Most recent recorded average body length</div>
              </div>
              <div className="rounded-lg bg-[var(--ep-accent-tint)] px-3 py-2 text-xs font-semibold text-[var(--ep-primary)]">Historical scan sequence</div>
            </div>
            <TrendChart values={growthTrend} label="Average body length" unit="cm" />
          </>
        ) : (
          <div className="rounded-xl border border-dashed border-[var(--ep-line)] bg-[var(--ep-bg)] px-4 py-10 text-center">
            <div className="ep-font-display text-lg font-semibold text-[var(--ep-text)]">Growth trend not available yet</div>
            <p className="mx-auto mt-1 max-w-md text-sm text-[var(--ep-text-muted)]">Record more vision scans to build a history and see how shrimp growth changes over time.</p>
          </div>
        )}
      </Panel>
      <p className="mt-3 text-xs text-[var(--ep-text-muted)]">Analytics are calculated from the latest available tank records and scan history. Historical chart points follow the recorded sequence; no calendar dates are inferred.</p>
    </>
  );
}
