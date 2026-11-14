import { useMemo, useState } from "react";
import { Panel } from "@/features/dashboard/components/DashboardPrimitives";
import { DonutChart, FeedingProgressChart } from "@/features/dashboard/components/AnalyticsCharts";
import { ScrollFadeContainer } from "@/components/motion/ScrollFadeContainer";
import { useTanks } from "@/features/dashboard/context/TankContext";
import { DashboardViewSkeleton } from "@/features/dashboard/components/DashboardStates";
import { downloadCsv } from "@/utils/downloadCsv";

export function Feeding() {
  const { tanks, feedSchedule, loading } = useTanks();
  const [scheduleFilter, setScheduleFilter] = useState<"all" | "upcoming" | "done">("all");

  if (loading) return <DashboardViewSkeleton variant="feeding" />;
  const tankCount = tanks.length;

  const dispensedToday = tanks.reduce((sum, t) => sum + t.dispensedToday, 0);
  const targetToday = tanks.reduce((sum, t) => sum + t.targetToday, 0);
  const nextEntry = [...feedSchedule].filter((f) => f.status === "upcoming").sort((a, b) => a.time.localeCompare(b.time))[0];
  const visibleSchedule = useMemo(() => [...feedSchedule].filter(item => scheduleFilter === "all" || item.status === scheduleFilter).sort((a, b) => a.time.localeCompare(b.time)), [feedSchedule, scheduleFilter]);

  return (
    <>
      <div className="dashboard-page-header flex justify-between items-start mb-7 flex-wrap gap-4 pb-6 border-b border-[var(--sand-dim)]">
        <div>
          <div className="ep-font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--mangrove)] mb-2">
            Automated Smart Feeding
          </div>
          <h1 className="ep-font-display text-[28px] font-semibold text-[var(--water-deep)] leading-tight">
            Feeding
          </h1>
          <div className="text-[13px] text-[rgba(11,35,32,0.55)] mt-1.5">
            Scheduled, biomass-adjusted dispensing · {tankCount} tank{tankCount !== 1 ? "s" : ""}
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            const rows: (string | number)[][] = [
              ...feedSchedule.map(item => ["Scheduled cycle", "", item.time, item.amount, item.status]),
              ...tanks.map(tank => ["Tank allocation", tank.name, "Today", tank.dispensedToday, "kg dispensed"]),
              ...tanks.map(tank => ["Tank target", tank.name, "Today", tank.targetToday, "kg target"]),
              ...tanks.map(tank => ["Feed conversion", tank.name, "Today", tank.fcr, "FCR"]),
            ];
            downloadCsv(`ecoprawn-feeding-${new Date().toISOString().slice(0, 10)}.csv`, ["Record type", "Tank", "Time / period", "Amount / value", "Status / unit"], rows);
          }}
          className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[var(--ep-line)] bg-[var(--ep-surface)] px-4 py-2 text-xs font-semibold text-[var(--ep-primary)] transition-colors hover:bg-[var(--ep-tint)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ep-primary)]"
        >
          <span aria-hidden="true">↓</span> Export CSV
        </button>
        <div className="inline-flex items-center gap-2 bg-white border border-[var(--sand-dim)] px-4 py-[9px] rounded-full text-[12.5px] font-semibold text-[var(--water-deep)] shadow-[var(--shadow-pill)]">
          <span className="ep-pulse-dot w-[7px] h-[7px] rounded-full bg-[var(--mangrove)]" />
          {nextEntry ? `Next dispense · ${nextEntry.time}` : "All cycles complete"}
        </div>
      </div>

      {tankCount > 0 ? (
        <>
          <div className="mb-4">
            <Panel title="Feeding cycle completion" badge={`${feedSchedule.length} scheduled cycles`}>
              <DonutChart items={[
                { label: "Dispensed", value: feedSchedule.filter(f => f.status === "done").length, color: "#39865B" },
                { label: "Upcoming", value: feedSchedule.filter(f => f.status === "upcoming").length, color: "#C18A27" },
              ]} unit="cycles" emptyLabel="No feeding cycles are scheduled." />
            </Panel>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.3fr] gap-4 mb-4">
            <Panel title="Today's Feed Schedule" badge={`${visibleSchedule.length} of ${feedSchedule.length} cycles`}>
              <div className="mb-3 flex flex-wrap gap-2" role="group" aria-label="Filter feeding schedule">
                {(["all", "upcoming", "done"] as const).map(option => <button key={option} type="button" aria-pressed={scheduleFilter === option} onClick={() => setScheduleFilter(option)} className="min-h-9 rounded-full border border-[var(--ep-line)] px-3 text-xs font-semibold capitalize text-[var(--ep-text-muted)] hover:bg-[var(--ep-tint)] focus-visible:outline-2 focus-visible:outline-[var(--ep-primary)]">{option === "all" ? "All cycles" : option === "done" ? "Dispensed" : "Upcoming"}</button>)}
              </div>
              <div className="flex flex-col gap-2.5">
                {visibleSchedule.map((f) => (
                  <div
                    key={f.id}
                    className="dashboard-hover flex items-center justify-between rounded-[10px] border border-[var(--sand-dim)] p-3"
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
                          f.status === "done" ? "text-[var(--mangrove)]" : "text-[var(--amber-text)]"
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
              <FeedingProgressChart tanks={tanks.map(t => ({ id: t.id, name: t.name, dispensedToday: t.dispensedToday, targetToday: t.targetToday }))} />
              <div className="mt-5 pt-4 border-t border-[var(--sand-dim)] text-[13px] text-[rgba(11,35,32,0.6)] leading-[1.6]">
                Dispense volume is recalculated automatically from the latest
                AI-estimated biomass, keeping feed conversion efficient as shrimp grow.
              </div>
            </Panel>
          </div>

          <Panel title="Feed Allocation" badge={`${tankCount} tank${tankCount !== 1 ? "s" : ""}`}>
            <ScrollFadeContainer>
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
                  {tanks.map((t) => (
                    <tr key={t.id} className="border-b border-[var(--sand-dim)] last:border-b-0">
                      <td className="py-3 pr-3 text-[13.5px] font-semibold text-[var(--water-deep)]">{t.name}</td>
                      <td className="py-3 pr-3 ep-font-mono text-[13px] text-[var(--water-deep)]">
                        {t.dispensedToday.toFixed(1)} kg
                      </td>
                      <td className="py-3 pr-3 ep-font-mono text-[13px] text-[var(--water-deep)]">
                        {t.targetToday.toFixed(1)} kg
                      </td>
                      <td className="py-3 ep-font-mono text-[13px] text-[var(--mangrove)] font-semibold">
                        {t.fcr.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ScrollFadeContainer>
          </Panel>
        </>
      ) : (
        <Panel title="Feed Allocation" badge="0 tanks">
          <div className="py-10 text-center text-[13px] text-[rgba(11,35,32,0.5)]">
            No tanks yet — add one on the Tanks page to see feeding data.
          </div>
        </Panel>
      )}
    </>
  );
}