import { useState } from "react";
import { Panel } from "@/features/dashboard/components/DashboardPrimitives";
import { DonutChart, FeedingProgressChart } from "@/features/dashboard/components/AnalyticsCharts";
import { ScrollFadeContainer } from "@/components/motion/ScrollFadeContainer";
import { useTanks } from "@/features/dashboard/context/TankContext";
import { DashboardInlineEmptyState, DashboardViewSkeleton } from "@/features/dashboard/components/DashboardStates";
import { downloadCsv } from "@/utils/downloadCsv";

export function Feeding() {
  const { tanks, feedSchedule, loading } = useTanks();
  const [scheduleFilter, setScheduleFilter] = useState<"all" | "upcoming" | "done">("all");

  if (loading) return <DashboardViewSkeleton variant="feeding" />;
  const tankCount = tanks.length;

  const dispensedToday = tanks.reduce((sum, t) => sum + t.dispensedToday, 0);
  const targetToday = tanks.reduce((sum, t) => sum + t.targetToday, 0);
  const nextEntry = [...feedSchedule].filter((f) => f.status === "upcoming").sort((a, b) => a.time.localeCompare(b.time))[0];
  const visibleSchedule = [...feedSchedule].filter(item => scheduleFilter === "all" || item.status === scheduleFilter).sort((a, b) => a.time.localeCompare(b.time));

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-end gap-3">
        
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
        <div className="inline-flex items-center gap-2 bg-[var(--ep-surface)] border border-[var(--ep-line)] px-4 py-[9px] rounded-full text-[12.5px] font-semibold text-[var(--water-deep)] shadow-[var(--shadow-pill)]">
          <span className="ep-pulse-dot w-[7px] h-[7px] rounded-full bg-[var(--ep-accent)]" />
          {nextEntry ? `Next dispense · ${nextEntry.time}` : "All complete"}
        </div>
      </div>

      {tankCount > 0 ? (
        <>
          <div className="mb-4">
            <Panel title="Feeding schedule progress" badge={`${feedSchedule.length} scheduled cycles`}>
              <p className="mb-3 text-xs leading-5 text-[var(--ep-text-muted)]">This chart counts how many planned feeding cycles have already been dispensed and how many are still upcoming.</p>
              <DonutChart items={[
                { label: "Dispensed", value: feedSchedule.filter(f => f.status === "done").length, color: "var(--ep-status-success)" },
                { label: "Upcoming", value: feedSchedule.filter(f => f.status === "upcoming").length, color: "var(--ep-status-warning)" },
              ]} unit="cycles" emptyLabel="No data" />
            </Panel>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.3fr] gap-4 mb-4">
            <Panel title="Today's schedule" badge={`${visibleSchedule.length} of ${feedSchedule.length} cycles`}>
              <p className="mb-3 text-xs leading-5 text-[var(--ep-text-muted)]">Review feeding times and filter the list to see all cycles, completed cycles, or cycles still to come.</p>
              <div className="mb-3 flex flex-wrap gap-2" role="group" aria-label="Filter feeding schedule">
                {(["all", "upcoming", "done"] as const).map(option => <button key={option} type="button" aria-pressed={scheduleFilter === option} onClick={() => setScheduleFilter(option)} className="min-h-9 rounded-full border border-[var(--ep-line)] px-3 text-xs font-semibold capitalize text-[var(--ep-text-muted)] hover:bg-[var(--ep-tint)] focus-visible:outline-2 focus-visible:outline-[var(--ep-primary)]">{option === "all" ? "All" : option === "done" ? "Dispensed" : "Upcoming"}</button>)}
              </div>
              <div className="flex flex-col gap-2.5">
                {visibleSchedule.map((f) => (
                  <div
                    key={f.id}
                    className="dashboard-hover flex items-center justify-between rounded-[10px] border border-[var(--ep-line)] p-3"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-[9px] h-[9px] rounded-full ${
                          f.status === "done" ? "bg-[var(--ep-status-success)]" : "bg-[var(--amber)]"
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
                          f.status === "done" ? "text-[var(--ep-status-success)]" : "text-[var(--amber-text)]"
                        }`}
                      >
                        {f.status === "done" ? "Dispensed" : "Upcoming"}
                      </div>
                    </div>
                  </div>
                ))}
                {visibleSchedule.length === 0 && (
                  <p className="rounded-xl border border-dashed border-[var(--ep-line)] px-4 py-7 text-center text-xs text-[var(--ep-text-muted)]">
                    {feedSchedule.length === 0 ? "No cycles scheduled." : "No cycles match this filter."}
                  </p>
                )}
              </div>
            </Panel>

            <Panel title="Feed used vs. target" badge="Target based on biomass">
              <div className="ep-font-mono text-[26px] font-semibold text-[var(--water-deep)]">
                {dispensedToday.toFixed(1)}{" "}
                <span className="text-sm font-medium text-[var(--ep-text-muted)]">
                  kg / {targetToday.toFixed(1)} kg target
                </span>
              </div>
              <p className="mb-3 text-xs leading-5 text-[var(--ep-text-muted)]">The total below compares feed already dispensed today with the planned amount. The bars show the same comparison for each tank.</p>
              <FeedingProgressChart tanks={tanks.map(t => ({ id: t.id, name: t.name, dispensedToday: t.dispensedToday, targetToday: t.targetToday }))} />
              <div className="mt-5 pt-4 border-t border-[var(--ep-line)] text-[13px] text-[var(--ep-text-muted)] leading-[1.6]">
                Feed targets update with the latest biomass estimate.
              </div>
            </Panel>
          </div>

          <Panel title="Feed use by tank" badge={`${tankCount} tank${tankCount !== 1 ? "s" : ""}`}>
            <p className="mb-3 text-xs leading-5 text-[var(--ep-text-muted)]">See how much feed each tank has received today, its planned amount, and its feed conversion ratio (feed used compared with shrimp weight gained).</p>
            <ScrollFadeContainer ariaLabel="Feed allocation table">
              <table className="w-full text-left border-collapse min-w-[560px]">
                <thead>
                  <tr className="ep-font-mono text-[10px] uppercase tracking-wide text-[var(--ep-text-muted)] border-b border-[var(--ep-line)]">
                    <th className="py-2.5 pr-3 font-semibold">Tank</th>
                    <th className="py-2.5 pr-3 font-semibold">Dispensed Today</th>
                    <th className="py-2.5 pr-3 font-semibold">Target Today</th>
                    <th className="py-2.5 font-semibold">Feed conversion ratio</th>
                  </tr>
                </thead>
                <tbody>
                  {tanks.map((t) => (
                    <tr key={t.id} className="border-b border-[var(--ep-line)] last:border-b-0">
                      <td className="py-3 pr-3 text-[13.5px] font-semibold text-[var(--water-deep)]">{t.name}</td>
                      <td className="py-3 pr-3 ep-font-mono text-[13px] text-[var(--water-deep)]">
                        {t.dispensedToday.toFixed(1)} kg
                      </td>
                      <td className="py-3 pr-3 ep-font-mono text-[13px] text-[var(--water-deep)]">
                        {t.targetToday.toFixed(1)} kg
                      </td>
                      <td className="py-3 ep-font-mono text-[13px] text-[var(--ep-accent)] font-semibold">
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
          <DashboardInlineEmptyState message="No tanks yet. Add one to view feeding data." />
        </Panel>
      )}
    </>
  );
}