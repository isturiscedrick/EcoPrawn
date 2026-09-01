import { Panel, KpiCard } from "@/components/DashboardPrimitives";
import { feedSchedule, feedByTank } from "@/data/ecoprawn";

export function Feeding() {
  const dispensedToday = feedByTank.reduce((sum, t) => sum + parseFloat(t.dispensedToday), 0);
  const targetToday = feedByTank.reduce((sum, t) => sum + parseFloat(t.targetToday), 0);
  const pct = Math.round((dispensedToday / targetToday) * 100);
  const nextEntry = feedSchedule.find((f) => f.status === "upcoming");

  return (
    <>
      <div className="flex justify-between items-start mb-7 flex-wrap gap-4 pb-6 border-b border-[var(--sand-dim)]">
        <div>
          <div className="ep-font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--mangrove)] mb-2">
            Automated Smart Feeding
          </div>
          <h1 className="ep-font-display text-[28px] font-semibold text-[var(--water-deep)] leading-tight">
            Feeding
          </h1>
          <div className="text-[13px] text-[rgba(11,35,32,0.55)] mt-1.5">
            Scheduled, biomass-adjusted dispensing · 6 tanks
          </div>
        </div>
        <div className="inline-flex items-center gap-2 bg-white border border-[var(--sand-dim)] px-4 py-[9px] rounded-full text-[12.5px] font-semibold text-[var(--water-deep)] shadow-[0_2px_8px_-4px_rgba(11,35,32,0.12)]">
          <span className="ep-pulse-dot w-[7px] h-[7px] rounded-full bg-[var(--mangrove)]" />
          {nextEntry ? `Next dispense · ${nextEntry.time}` : "All cycles complete"}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <KpiCard
          label="Dispensed Today"
          value={dispensedToday.toFixed(1)}
          unit="kg"
          delta={`of ${targetToday.toFixed(1)} kg target`}
          deltaTone="ok"
        />
        <KpiCard label="Facility FCR" value="1.38" unit="FCR" delta="▲ improved from 1.46" deltaTone="ok" />
        <KpiCard
          label="Next Dispense"
          value={nextEntry?.time ?? "—"}
          unit=""
          delta={nextEntry ? `${nextEntry.amount} scheduled` : "Cycle complete"}
          deltaTone="ok"
        />
        <KpiCard label="Completion" value={String(pct)} unit="%" delta="of today's target" deltaTone="ok" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.3fr] gap-4 mb-4">
        <Panel title="Today's Feed Schedule" badge={`${feedSchedule.length} cycles`}>
          <div className="flex flex-col gap-2.5">
            {feedSchedule.map((f) => (
              <div
                key={f.time}
                className="flex items-center justify-between p-3 border border-[var(--sand-dim)] rounded-[10px]"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-[9px] h-[9px] rounded-full ${
                      f.status === "done" ? "bg-[var(--mangrove)]" : "bg-[var(--amber)]"
                    }`}
                  />
                  <span className="ep-font-mono text-[13.5px] font-semibold text-[var(--water-deep)]">
                    {f.time}
                  </span>
                </div>
                <div className="text-right">
                  <div className="ep-font-mono text-[13px] text-[var(--water-deep)]">{f.amount}</div>
                  <div
                    className={`text-[10.5px] font-semibold ${
                      f.status === "done" ? "text-[var(--mangrove)]" : "text-[var(--amber)]"
                    }`}
                  >
                    {f.status === "done" ? "Dispensed" : "Upcoming"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Feed Progress" badge="biomass-adjusted">
          <div className="ep-font-mono text-[26px] font-semibold text-[var(--water-deep)]">
            {dispensedToday.toFixed(1)}{" "}
            <span className="text-sm font-medium text-[rgba(11,35,32,0.5)]">
              kg / {targetToday.toFixed(1)} kg target
            </span>
          </div>
          <div className="bg-[var(--sand-dim)] rounded-full h-2 overflow-hidden mt-3">
            <div
              className="bg-gradient-to-r from-[var(--coral)] to-[var(--amber)] h-full rounded-full transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="mt-5 pt-4 border-t border-[var(--sand-dim)] text-[13px] text-[rgba(11,35,32,0.6)] leading-[1.6]">
            Dispense volume per tank is recalculated automatically from the latest
            AI-estimated biomass, keeping feed conversion efficient as shrimp grow.
          </div>
        </Panel>
      </div>

      <Panel title="Per-Tank Feed Allocation" badge="6 tanks">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[560px]">
            <thead>
              <tr className="ep-font-mono text-[10px] uppercase tracking-wide text-[rgba(11,35,32,0.45)] border-b border-[var(--sand-dim)]">
                <th className="py-2.5 pr-3 font-semibold">Tank</th>
                <th className="py-2.5 pr-3 font-semibold">Dispensed Today</th>
                <th className="py-2.5 pr-3 font-semibold">Target Today</th>
                <th className="py-2.5 font-semibold">FCR</th>
              </tr>
            </thead>
            <tbody>
              {feedByTank.map((t) => (
                <tr key={t.tank} className="border-b border-[var(--sand-dim)] last:border-b-0">
                  <td className="py-3 pr-3 text-[13.5px] font-semibold text-[var(--water-deep)]">{t.tank}</td>
                  <td className="py-3 pr-3 ep-font-mono text-[13px] text-[var(--water-deep)]">
                    {t.dispensedToday}
                  </td>
                  <td className="py-3 pr-3 ep-font-mono text-[13px] text-[var(--water-deep)]">{t.targetToday}</td>
                  <td className="py-3 ep-font-mono text-[13px] text-[var(--mangrove)] font-semibold">{t.fcr}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}