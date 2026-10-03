import { Panel, KpiCard } from "@/components/DashboardPrimitives";
import { bioflocMetrics, effluentLog } from "@/data/ecoprawn";

const loopSteps = [
  { step: "01", title: "Biofloc reactor", body: "Heterotrophic bacteria convert ammonia and organic waste into consumable floc within the tank's water column." },
  { step: "02", title: "Solids management", body: "Excess suspended solids are periodically settled and drawn off to keep TSS within the target band." },
  { step: "03", title: "Discharge plumbing", body: "Scheduled blowdown routes bio-rich wastewater through dedicated plumbing toward the outlet." },
  { step: "04", title: "Mangrove / wetland outlet", body: "Nutrient-rich effluent is released to surrounding mangrove and wetland vegetation as part of normal operation." },
];

export function BioflocLoop() {
  return (
    <>
      <div className="flex justify-between items-start mb-7 flex-wrap gap-4 pb-6 border-b border-[var(--sand-dim)]">
        <div>
          <div className="ep-font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--mangrove)] mb-2">
            Biofloc &amp; Effluent Management
          </div>
          <h1 className="ep-font-display text-[28px] font-semibold text-[var(--water-deep)] leading-tight">
            Biofloc Loop
          </h1>
          <div className="text-[13px] text-[rgba(11,35,32,0.55)] mt-1.5">
            Biological water treatment &amp; controlled discharge routing
          </div>
        </div>
        <div className="inline-flex items-center gap-2 bg-white border border-[var(--sand-dim)] px-4 py-[9px] rounded-full text-[12.5px] font-semibold text-[var(--water-deep)] shadow-[var(--shadow-pill)]">
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

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-4">
        <Panel title="Treatment Loop" badge="continuous">
          <div className="flex flex-col gap-3">
            {loopSteps.map((s) => (
              <div key={s.step} className="flex gap-3 p-3 border border-[var(--sand-dim)] rounded-[10px]">
                <span className="ep-font-mono text-[11px] font-semibold text-[var(--coral)] pt-0.5">
                  {s.step}
                </span>
                <div>
                  <div className="text-[13px] font-semibold text-[var(--water-deep)] mb-0.5">{s.title}</div>
                  <div className="text-[12.5px] leading-[1.55] text-[rgba(11,35,32,0.6)]">{s.body}</div>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Effluent Routing Log" badge={`${effluentLog.length} events`}>
          <div className="flex flex-col">
            {effluentLog.map((e, i) => (
              <div key={e.time} className={`py-3 ${i !== 0 ? "border-t border-[var(--sand-dim)]" : "pt-0"}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[13px] font-semibold text-[var(--water-deep)]">{e.event}</span>
                  <span className="ep-font-mono text-[10.5px] text-[rgba(11,35,32,0.45)] whitespace-nowrap">
                    {e.time}
                  </span>
                </div>
                <div className="text-[12.5px] text-[rgba(11,35,32,0.6)]">{e.detail}</div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </>
  );
}