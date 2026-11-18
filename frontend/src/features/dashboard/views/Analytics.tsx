import { Feeding } from "./Feeding";
import { VisionGrowth } from "./VisionGrowth";
import { WaterQuality } from "./WaterQuality";
import { useTanks } from "@/features/dashboard/context/TankContext";
import { Panel } from "@/features/dashboard/components/DashboardPrimitives";
import { DonutChart } from "@/features/dashboard/components/AnalyticsCharts";
import { DashboardViewSkeleton } from "@/features/dashboard/components/DashboardStates";

function TanksAnalytics() {
  const { tanks, loading } = useTanks();

  if (loading) return <DashboardViewSkeleton variant="tanks" />;

  const healthyCount = tanks.filter(tank => tank.status === "ok").length;
  const attentionCount = tanks.length - healthyCount;
  const totalBiomass = tanks.reduce((sum, tank) => sum + tank.biomass, 0);
  const totalPopulation = tanks.reduce((sum, tank) => sum + tank.population, 0);
  const averageFcr = tanks.length ? tanks.reduce((sum, tank) => sum + tank.fcr, 0) / tanks.length : 0;
  const maxBiomass = Math.max(1, ...tanks.map(tank => tank.biomass));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {[
          { label: "Total tanks", value: tanks.length.toLocaleString(), unit: "tanks" },
          { label: "Total biomass", value: totalBiomass.toLocaleString(undefined, { maximumFractionDigits: 1 }), unit: "kg" },
          { label: "Total population", value: totalPopulation.toLocaleString(), unit: "shrimp" },
          { label: "Average FCR", value: tanks.length ? averageFcr.toFixed(2) : "—", unit: "FCR" },
        ].map(item => (
          <div key={item.label} className="rounded-2xl border border-[var(--ep-line)] bg-[var(--ep-surface)] p-4">
            <p className="text-xs text-[var(--ep-text-muted)]">{item.label}</p>
            <p className="mt-2 break-words text-2xl font-semibold tabular-nums text-[var(--ep-text)]">{item.value}</p>
            <p className="mt-1 text-[11px] text-[var(--ep-text-muted)]">{item.unit}</p>
          </div>
        ))}
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-2">
        <Panel title="Tank health distribution" badge={`${tanks.length} tanks`} icon="activity">
          <DonutChart
            items={[
              { label: "Healthy", value: healthyCount, color: "var(--ep-status-success)" },
              { label: "Needs attention", value: attentionCount, color: "var(--ep-status-warning)" },
            ]}
            unit="tanks"
            emptyLabel="No tanks available"
          />
          {tanks.length > 0 && <p className="mt-2 text-center text-xs text-[var(--ep-text-muted)]">{((healthyCount / tanks.length) * 100).toFixed(1)}% of tanks are currently healthy.</p>}
        </Panel>

        <Panel title="Biomass by tank" badge="Current biomass" icon="chart-no-axes-column">
          {tanks.length ? (
            <div className="space-y-4">
              {[...tanks].sort((a, b) => b.biomass - a.biomass).map(tank => (
                <div key={tank.id} className="space-y-1.5">
                  <div className="flex items-center justify-between gap-3 text-xs">
                    <span className="min-w-0 truncate font-medium text-[var(--ep-text)]">{tank.name}</span>
                    <strong className="shrink-0 tabular-nums text-[var(--ep-text)]">{tank.biomass.toLocaleString(undefined, { maximumFractionDigits: 1 })} kg</strong>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-[var(--ep-tint)]">
                    <div className="h-full rounded-full bg-[var(--ep-accent)] transition-[width] duration-500" style={{ width: `${(tank.biomass / maxBiomass) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex min-h-40 items-center justify-center rounded-xl border border-dashed border-[var(--ep-line)] text-sm text-[var(--ep-text-muted)]">No tank data available.</div>
          )}
        </Panel>
      </div>
    </div>
  );
}

export function Analytics() {
  return (
    <>
      <div className="dashboard-page-header mb-6 border-b border-[var(--ep-line)] pb-6">
        <div className="ep-font-mono mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ep-primary)]">
          Production intelligence
        </div>
        <h1 className="ep-font-display text-[26px] font-semibold leading-tight tracking-[-0.02em] text-[var(--ep-text)] sm:text-[30px]">
          Analytics
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--ep-text-muted)]">
          Tank performance, growth and vision insights, water-quality monitoring, and feeding performance in one place.
        </p>
      </div>

      <nav aria-label="Analytics sections" className="mb-6 flex flex-wrap gap-2">
        <a href="#analytics-tanks" className="inline-flex min-h-10 items-center rounded-full border border-[var(--ep-line)] bg-[var(--ep-surface)] px-4 text-xs font-semibold text-[var(--ep-text)] transition-colors hover:border-[var(--ep-accent)] hover:bg-[var(--ep-tint)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ep-primary)]">
          01 · Tanks
        </a>
        <a href="#analytics-growth" className="inline-flex min-h-10 items-center rounded-full border border-[var(--ep-line)] bg-[var(--ep-surface)] px-4 text-xs font-semibold text-[var(--ep-text)] transition-colors hover:border-[var(--ep-accent)] hover:bg-[var(--ep-tint)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ep-primary)]">
          02 · Growth &amp; Vision
        </a>
        <a href="#analytics-water" className="inline-flex min-h-10 items-center rounded-full border border-[var(--ep-line)] bg-[var(--ep-surface)] px-4 text-xs font-semibold text-[var(--ep-text)] transition-colors hover:border-[var(--ep-accent)] hover:bg-[var(--ep-tint)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ep-primary)]">
          03 · Water Quality
        </a>
        <a href="#analytics-feeding" className="inline-flex min-h-10 items-center rounded-full border border-[var(--ep-line)] bg-[var(--ep-surface)] px-4 text-xs font-semibold text-[var(--ep-text)] transition-colors hover:border-[var(--ep-accent)] hover:bg-[var(--ep-tint)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ep-primary)]">
          04 · Feeding
        </a>
      </nav>

      <section id="analytics-tanks" aria-label="Tank analytics" className="mb-8 scroll-mt-6 space-y-4">
        <div>
          <h2 className="ep-font-display text-lg font-semibold text-[var(--ep-text)]">Tank Analytics</h2>
          <p className="mt-1 text-sm text-[var(--ep-text-muted)]">Facility-wide production totals, tank health, and biomass distribution.</p>
        </div>
        <TanksAnalytics />
      </section>

      <section id="analytics-growth" aria-label="Growth and vision analytics" className="mb-8 scroll-mt-6">
        <VisionGrowth />
      </section>

      <section id="analytics-water" aria-label="Water quality analytics" className="mb-8 scroll-mt-6">
        <WaterQuality />
      </section>

      <section id="analytics-feeding" aria-label="Feeding analytics" className="mb-8 scroll-mt-6">
        <Feeding />
      </section>
    </>
  );
}
