import { Panel, KpiCard } from "@/features/dashboard/components/DashboardPrimitives";
import { DonutChart } from "@/features/dashboard/components/AnalyticsCharts";
import { useTanks } from "@/features/dashboard/context/TankContext";
import { DashboardViewSkeleton } from "@/features/dashboard/components/DashboardStates";

const loopSteps = [
  { step: "01", title: "Biofloc reactor", body: "Bacteria convert ammonia and organic waste into biofloc." },
  { step: "02", title: "Solids management", body: "Excess solids are settled and removed to control TSS." },
  { step: "03", title: "Discharge plumbing", body: "Scheduled discharge moves bio-rich water to the outlet." },
  { step: "04", title: "Mangrove / wetland outlet", body: "Treated effluent is routed to mangrove and wetland areas." },
];

export function BioflocLoop() {
  const { bioflocMetrics, effluentLog, loading } = useTanks();

  if (loading) return <DashboardViewSkeleton variant="biofloc" />;

  return (
    <>
      <div className="flex justify-between items-start mb-7 flex-wrap gap-4 pb-6 border-b border-[var(--sand-dim)]">
        <div>
          <div className="ep-font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--mangrove)] mb-2">
            Biofloc &amp; effluent
          </div>
          <h1 className="ep-font-display text-[28px] font-semibold text-[var(--water-deep)] leading-tight">
            Biofloc Loop
          </h1>
        </div>
        <div className="inline-flex items-center gap-2 bg-[var(--ep-surface)] border border-[var(--sand-dim)] px-4 py-[9px] rounded-full text-[12.5px] font-semibold text-[var(--water-deep)] shadow-[var(--shadow-pill)]">
          <span className="ep-pulse-dot w-[7px] h-[7px] rounded-full bg-[var(--mangrove)]" />
          Loop active
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {bioflocMetrics.map((m) => (
          <KpiCard
            key={m.label}
            label={m.label}
            value={m.value}
            unit={m.unit}
            delta={m.status === "ok" ? "In range" : "Watch"}
            deltaTone={m.status}
          />
        ))}
      </div>

      <div className="mb-5">
        <Panel title="Biofloc metric status" badge={`${bioflocMetrics.length} monitored metrics`}>
          <DonutChart items={[
            { label: "In range", value: bioflocMetrics.filter(metric => metric.status === "ok").length, color: "var(--ep-status-success)" },
            { label: "Needs attention", value: bioflocMetrics.filter(metric => metric.status !== "ok").length, color: "var(--ep-status-warning)" },
          ]} unit="metrics" emptyLabel="No biofloc metrics available." />
        </Panel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-4">
        <Panel title="Treatment Loop" badge="continuous">
          <div className="flex flex-col gap-3">
            {loopSteps.map((s) => (
              <div key={s.step} className="dashboard-hover flex gap-3 rounded-[10px] border border-[var(--sand-dim)] p-3">
                <span className="ep-font-mono text-[11px] font-semibold text-[var(--coral)] pt-0.5">
                  {s.step}
                </span>
                <div>
                  <div className="text-[13px] font-semibold text-[var(--water-deep)] mb-0.5">{s.title}</div>
                  <div className="text-[12.5px] leading-[1.55] text-[var(--ep-text-muted)]">{s.body}</div>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Effluent Routing Log" badge={`${effluentLog.length} events`}>
          <div className="flex flex-col">
            {effluentLog.map((e, i) => (
              <div key={e.id} className={`py-3 ${i !== 0 ? "border-t border-[var(--sand-dim)]" : "pt-0"}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[13px] font-semibold text-[var(--water-deep)]">{e.event}</span>
                  <span className="ep-font-mono text-[10.5px] text-[var(--ep-text-muted)] whitespace-nowrap">
                    {e.time}
                  </span>
                </div>
                <div className="text-[12.5px] text-[var(--ep-text-muted)]">{e.detail}</div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </>
  );
}