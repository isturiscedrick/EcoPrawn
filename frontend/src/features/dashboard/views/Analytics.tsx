import { useMemo, useState } from "react";
import { Panel, KpiCard } from "@/features/dashboard/components/DashboardPrimitives";
import { TrendChart } from "@/features/dashboard/components/TrendChart";
import { ScrollFadeContainer } from "@/components/motion/ScrollFadeContainer";
import { useTanks } from "@/features/dashboard/context/TankContext";
import { DashboardViewSkeleton } from "@/features/dashboard/components/DashboardStates";
import { THRESHOLDS, rangeStatus } from "@/features/dashboard/lib/thresholds";

export function Analytics() {
  const {
    tanks,
    waterTrend,
    growthTrend,
    feedSchedule,
    visionScanLog,
    alertsLog,
    loading,
  } = useTanks();
  const [selectedTankId, setSelectedTankId] = useState<string | null>(null);

  const metrics = useMemo(() => {
    const tanksWithReadings = tanks.filter((tank) => tank.hasWaterReadings);
    const readingCount = tanksWithReadings.length || 1;
    return {
      biomass: tanks.reduce((sum, tank) => sum + tank.biomass, 0),
      population: tanks.reduce((sum, tank) => sum + tank.population, 0),
      avgFcr: tanks.length ? tanks.reduce((sum, tank) => sum + tank.fcr, 0) / tanks.length : 0,
      avgDO: tanksWithReadings.reduce((sum, tank) => sum + tank.dissolvedOxygen, 0) / readingCount,
      avgBodyLength: tanks.length ? tanks.reduce((sum, tank) => sum + tank.bodyLength, 0) / tanks.length : 0,
      avgWeight: tanks.length ? tanks.reduce((sum, tank) => sum + tank.weight, 0) / tanks.length : 0,
      abnormal: tanks.reduce((sum, tank) => sum + tank.abnormal, 0),
      warnings: tanks.filter((tank) => tank.status === "warn").length,
      dispensed: tanks.reduce((sum, tank) => sum + tank.dispensedToday, 0),
      target: tanks.reduce((sum, tank) => sum + tank.targetToday, 0),
    };
  }, [tanks]);

  if (loading) return <DashboardViewSkeleton variant="vision" />;

  const selectedTank = tanks.find((tank) => tank.id === selectedTankId) ?? tanks[0];
  const selectedTrend = selectedTank
    ? waterTrend.filter((reading) => reading.tankId === selectedTank.id).map((reading) => reading.value)
    : [];
  const feedPercent = metrics.target > 0 ? Math.round((metrics.dispensed / metrics.target) * 100) : 0;
  const maxBiomass = Math.max(1, ...tanks.map((tank) => tank.biomass));
  const lastScan = visionScanLog[0]?.time ?? "No scans yet";

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
            A consolidated view of water quality, biomass, feeding efficiency, and shrimp growth
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-[var(--ep-line)] bg-[var(--ep-surface)] px-4 py-2 text-xs font-semibold text-[var(--ep-text)]">
          <span className={metrics.warnings === 0 ? "h-2 w-2 rounded-full bg-[var(--ep-status-success)]" : "h-2 w-2 rounded-full bg-[var(--ep-status-warning)]"} />
          {metrics.warnings === 0 ? "All tanks nominal" : `${metrics.warnings} tank(s) need attention`}
        </div>
      </div>

      <section aria-label="Facility performance metrics" className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Total Biomass" value={metrics.biomass.toFixed(1)} unit="kg" delta={`Across ${tanks.length} tank(s)`} deltaTone="ok" />
        <KpiCard label="Average Dissolved O₂" value={tanks.some((tank) => tank.hasWaterReadings) ? metrics.avgDO.toFixed(1) : "—"} unit="mg/L" delta={`Target ≥ ${THRESHOLDS.dissolvedOxygen.min} mg/L`} deltaTone={tanks.some((tank) => tank.hasWaterReadings) ? rangeStatus(metrics.avgDO, THRESHOLDS.dissolvedOxygen.min) : "warn"} />
        <KpiCard label="Average FCR" value={tanks.length ? metrics.avgFcr.toFixed(2) : "—"} unit="FCR" delta="Lower values indicate better feed efficiency" deltaTone={metrics.avgFcr <= 1.5 ? "ok" : "warn"} />
        <KpiCard label="Tanks Needing Attention" value={String(metrics.warnings)} unit="tanks" delta={`${alertsLog.length} recorded alert event(s)`} deltaTone={metrics.warnings ? "warn" : "ok"} />
      </section>

      <div className="mb-4 grid grid-cols-1 gap-4 xl:grid-cols-[1.15fr_1fr]">
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

        <Panel title="Water Quality Trend" badge={selectedTank?.name ?? "No tank selected"}>
          {tanks.length ? (
            <>
              <label htmlFor="analytics-tank" className="mb-3 block text-xs font-semibold text-[var(--ep-text-muted)]">Select tank</label>
              <select id="analytics-tank" value={selectedTank?.id ?? ""} onChange={(event) => setSelectedTankId(event.target.value)} className="mb-3 min-h-10 w-full rounded-lg border border-[var(--ep-line)] bg-[var(--ep-surface)] px-3 text-sm text-[var(--ep-text)]">
                {tanks.map((tank) => <option key={tank.id} value={tank.id}>{tank.name}</option>)}
              </select>
              {selectedTank?.hasWaterReadings ? (
                <TrendChart values={selectedTrend} label="Dissolved oxygen" unit="mg/L" />
              ) : <p className="py-8 text-center text-sm text-[var(--ep-text-muted)]">No recorded water-quality readings for this tank yet.</p>}
            </>
          ) : <p className="py-8 text-center text-sm text-[var(--ep-text-muted)]">Water trends will appear after tanks are added and readings are recorded.</p>}
        </Panel>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Panel title="Growth & Population" badge={`Last scan · ${lastScan}`}>
          <div className="mb-4 grid grid-cols-2 gap-3">
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
          <div className="mt-4 border-t border-[var(--ep-line)] pt-3">
            <div className="mb-2 text-xs font-semibold text-[var(--ep-text-muted)]">Recent vision scans</div>
            {visionScanLog.length ? visionScanLog.slice(0, 4).map((scan) => (
              <div key={scan.id} className="flex flex-wrap justify-between gap-2 border-t border-[var(--ep-line)] py-2 text-sm first:border-0">
                <span className="text-[var(--ep-text)]">{scan.tank}: {scan.note}</span>
                <span className="text-xs text-[var(--ep-text-muted)]">{scan.time}</span>
              </div>
            )) : <p className="text-sm text-[var(--ep-text-muted)]">No vision scans recorded yet.</p>}
          </div>
        </Panel>

        <Panel title="Feeding Performance" badge={`${feedSchedule.length} scheduled cycle(s)`}>
          <div className="mb-2 flex items-end justify-between gap-3">
            <div>
              <div className="text-xs text-[var(--ep-text-muted)]">Dispensed today</div>
              <div className="ep-font-display text-3xl font-semibold text-[var(--ep-text)]">{metrics.dispensed.toFixed(1)} <span className="text-base font-medium">kg</span></div>
            </div>
            <div className="text-right text-xs text-[var(--ep-text-muted)]">Target {metrics.target.toFixed(1)} kg</div>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-[var(--ep-line)]">
            <div className="h-full rounded-full bg-[var(--ep-accent)] transition-[width] duration-300" style={{ width: `${Math.min(100, feedPercent)}%` }} />
          </div>
          <div className="mt-2 text-right text-xs font-semibold text-[var(--ep-text-muted)]">{feedPercent}% of today's target</div>
          <div className="mt-5">
            <div className="mb-2 text-xs font-semibold text-[var(--ep-text-muted)]">Feed allocation by tank</div>
            <ScrollFadeContainer>
              <table className="w-full min-w-[420px] text-left text-sm">
                <thead><tr className="border-b border-[var(--ep-line)] text-xs text-[var(--ep-text-muted)]"><th className="py-2 pr-3">Tank</th><th className="py-2 pr-3">Dispensed</th><th className="py-2 pr-3">Target</th><th className="py-2">FCR</th></tr></thead>
                <tbody>{tanks.map((tank) => <tr key={tank.id} className="border-b border-[var(--ep-line)] last:border-0"><td className="py-2 pr-3 font-semibold text-[var(--ep-text)]">{tank.name}</td><td className="py-2 pr-3 text-[var(--ep-text)]">{tank.dispensedToday.toFixed(1)} kg</td><td className="py-2 pr-3 text-[var(--ep-text)]">{tank.targetToday.toFixed(1)} kg</td><td className="py-2 text-[var(--ep-text)]">{tank.fcr.toFixed(2)}</td></tr>)}</tbody>
              </table>
            </ScrollFadeContainer>
          </div>
        </Panel>
      </div>
    </>
  );
}
