import { useMemo } from "react";
import { Panel } from "@/features/dashboard/components/DashboardPrimitives";
import { TrendChart } from "@/features/dashboard/components/TrendChart";
import { useTanks } from "@/features/dashboard/context/TankContext";
import { DashboardViewSkeleton } from "@/features/dashboard/components/DashboardStates";

export function Analytics() {
  const { tanks, growthTrend, loading } = useTanks();

  const metrics = useMemo(() => ({
    avgBodyLength: tanks.length ? tanks.reduce((sum, tank) => sum + tank.bodyLength, 0) / tanks.length : 0,
    avgWeight: tanks.length ? tanks.reduce((sum, tank) => sum + tank.weight, 0) / tanks.length : 0,
    population: tanks.reduce((sum, tank) => sum + tank.population, 0),
    abnormal: tanks.reduce((sum, tank) => sum + tank.abnormal, 0),
  }), [tanks]);

  if (loading) return <DashboardViewSkeleton variant="vision" />;

  const maxBiomass = Math.max(1, ...tanks.map((tank) => tank.biomass));

  return (
    <>
      <div className="dashboard-page-header mb-7 flex flex-wrap items-end justify-between gap-4 border-b border-[var(--ep-line)] pb-6">
        <div>
          <div className="ep-font-mono mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ep-primary)]">
            Facility performance
          </div>
          <h1 className="ep-font-display text-[30px] font-semibold leading-tight tracking-[-0.02em] text-[var(--ep-text)]">
            Analytics
          </h1>
          <p className="mt-2 text-sm text-[var(--ep-text-muted)]">
            Biomass distribution and shrimp growth insights across the facility.
          </p>
        </div>
      </div>

      <Panel title="Biomass by Tank" badge={`${tanks.length} tanks`}>
        {tanks.length ? (
          <div className="space-y-4">
            {tanks.map((tank) => (
              <div key={tank.id}>
                <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                  <span className="truncate font-semibold text-[var(--ep-text)]">{tank.name}</span>
                  <span className="ep-font-mono shrink-0 text-[var(--ep-text)]">{tank.biomass.toFixed(1)} kg</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-[var(--ep-line)]">
                  <div className="h-full rounded-full bg-[var(--ep-accent)] transition-[width] duration-300" style={{ width: `${(tank.biomass / maxBiomass) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        ) : <p className="py-8 text-center text-sm text-[var(--ep-text-muted)]">Add tanks to compare facility biomass.</p>}
      </Panel>

      <Panel title="Growth & Population" badge="Growth insights">
        <div className="mb-4 grid grid-cols-2 gap-3 xl:grid-cols-4">
          <div className="rounded-xl border border-[var(--ep-line)] bg-[var(--ep-bg)] p-3">
            <div className="text-xs text-[var(--ep-text-muted)]">Average body length</div>
            <div className="ep-font-display mt-1 text-2xl font-semibold text-[var(--ep-text)]">{tanks.length ? metrics.avgBodyLength.toFixed(1) : "—"} <span className="text-sm font-medium">cm</span></div>
          </div>
          <div className="rounded-xl border border-[var(--ep-line)] bg-[var(--ep-bg)] p-3">
            <div className="text-xs text-[var(--ep-text-muted)]">Average weight</div>
            <div className="ep-font-display mt-1 text-2xl font-semibold text-[var(--ep-text)]">{tanks.length ? metrics.avgWeight.toFixed(1) : "—"} <span className="text-sm font-medium">g</span></div>
          </div>
          <div className="rounded-xl border border-[var(--ep-line)] bg-[var(--ep-bg)] p-3">
            <div className="text-xs text-[var(--ep-text-muted)]">Population estimate</div>
            <div className="ep-font-display mt-1 text-2xl font-semibold text-[var(--ep-text)]">{metrics.population.toLocaleString()}</div>
          </div>
          <div className="rounded-xl border border-[var(--ep-line)] bg-[var(--ep-bg)] p-3">
            <div className="text-xs text-[var(--ep-text-muted)]">Abnormal behavior flags</div>
            <div className="ep-font-display mt-1 text-2xl font-semibold text-[var(--ep-text)]">{metrics.abnormal}</div>
          </div>
        </div>
        {growthTrend.length > 1 ? (
          <TrendChart values={growthTrend} label="Average body length" unit="cm" />
        ) : <p className="py-5 text-sm text-[var(--ep-text-muted)]">More growth scans are needed to show a trend.</p>}
      </Panel>
    </>
  );
}
