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

  const metrics = [
    { label: "Tanks in facility", value: tanks.length.toLocaleString(), unit: "tanks" },
    { label: "Estimated biomass", value: totalBiomass.toLocaleString(undefined, { maximumFractionDigits: 1 }), unit: "kg total" },
    { label: "Estimated shrimp count", value: totalPopulation.toLocaleString(), unit: "estimated shrimp" },
    { label: "Average feed conversion", value: tanks.length ? averageFcr.toFixed(2) : "—", unit: "feed conversion ratio" },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(item => (
          <article key={item.label} className="rounded-2xl border border-[var(--ep-line)] bg-[var(--ep-surface)] p-4">
            <p className="text-xs font-semibold text-[var(--ep-text-muted)]">{item.label}</p>
            <p className="mt-2 break-words text-2xl font-semibold tabular-nums text-[var(--ep-text)]">{item.value}</p>
            <p className="mt-1 text-[11px] font-medium text-[var(--ep-text-muted)]">{item.unit}</p>
          </article>
        ))}
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-2">
        <Panel title="Tank health" badge={`${tanks.length} total`} icon="activity">
          <DonutChart
            items={[
              { label: "Healthy", value: healthyCount, color: "var(--ep-status-success)" },
              { label: "Needs attention", value: attentionCount, color: "var(--ep-status-warning)" },
            ]}
            unit="tanks"
            emptyLabel="No tanks have been added yet."
          />
          {tanks.length > 0 && <p className="mt-2 text-center text-xs text-[var(--ep-text-muted)]">{((healthyCount / tanks.length) * 100).toFixed(1)}% healthy</p>}
        </Panel>

        <Panel title="Biomass by tank" badge="Current estimate" icon="chart-no-axes-column">
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
            <div className="flex min-h-40 items-center justify-center rounded-xl border border-dashed border-[var(--ep-line)] text-sm text-[var(--ep-text-muted)]">No tank data yet. Add a tank to see the comparison.</div>
          )}
        </Panel>
      </div>
    </div>
  );
}

const sections = [
  { id: "analytics-tanks", number: "01", label: "Tank overview", description: "Facility totals and tank comparisons" },
  { id: "analytics-growth", number: "02", label: "Shrimp growth", description: "Vision scans and size trends" },
  { id: "analytics-water", number: "03", label: "Water quality", description: "Sensor readings and safe ranges" },
  { id: "analytics-feeding", number: "04", label: "Feeding", description: "Feed schedule and usage" },
];

export function Analytics() {
  return (
    <>
      <header className="dashboard-page-header mb-6 border-b border-[var(--ep-line)] pb-6">
        <div className="ep-font-mono mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ep-primary)]">Farm performance</div>
        <h1 className="ep-font-display text-[26px] font-semibold leading-tight tracking-[-0.02em] text-[var(--ep-text)] sm:text-[30px]">Analytics</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--ep-text-muted)]">Farm-wide view of tank status, shrimp growth, water conditions, and feeding.</p>
      </header>

      <nav aria-label="Analytics sections" className="mb-7 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {sections.map(section => (
          <a key={section.id} href={`#${section.id}`} className="group flex min-h-[68px] items-center gap-3 rounded-xl border border-[var(--ep-line)] bg-[var(--ep-surface)] p-3 transition-colors hover:border-[var(--ep-accent)] hover:bg-[var(--ep-tint)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ep-primary)]">
            <span className="ep-font-mono flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--ep-tint)] text-xs font-semibold text-[var(--ep-accent)]">{section.number}</span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-[var(--ep-text)]">{section.label}</span>
              <span className="mt-0.5 block text-xs leading-4 text-[var(--ep-text-muted)]">{section.description}</span>
            </span>
          </a>
        ))}
      </nav>

      <section id="analytics-tanks" aria-label="Tank overview analytics" className="mb-9 scroll-mt-6 space-y-4">
        <div>
          <h2 className="ep-font-display text-lg font-semibold text-[var(--ep-text)]">01. Tank overview</h2>
          <p className="mt-1 text-sm text-[var(--ep-text-muted)]">Tank status and estimated production across the facility.</p>
        </div>
        <TanksAnalytics />
      </section>

      <section id="analytics-growth" aria-label="Shrimp growth analytics" className="mb-9 scroll-mt-6 space-y-2">
        <div>
          <h2 className="ep-font-display text-lg font-semibold text-[var(--ep-text)]">02. Shrimp growth</h2>
          <p className="mt-1 text-sm text-[var(--ep-text-muted)]">Shrimp size and weight measurements from camera scans.</p>
        </div>
        <VisionGrowth />
      </section>

      <section id="analytics-water" aria-label="Water quality analytics" className="mb-9 scroll-mt-6 space-y-2">
        <div>
          <h2 className="ep-font-display text-lg font-semibold text-[var(--ep-text)]">03. Water quality</h2>
          <p className="mt-1 text-sm text-[var(--ep-text-muted)]">Current sensor readings, configured limits, and changes over time.</p>
        </div>
        <WaterQuality />
      </section>

      <section id="analytics-feeding" aria-label="Feeding analytics" className="mb-9 scroll-mt-6 space-y-2">
        <div>
          <h2 className="ep-font-display text-lg font-semibold text-[var(--ep-text)]">04. Feeding</h2>
          <p className="mt-1 text-sm text-[var(--ep-text-muted)]">Today’s feed usage compared with target, plus the feeding schedule.</p>
        </div>
        <Feeding />
      </section>
    </>
  );
}
