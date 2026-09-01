import { AlertRow } from "@/components/DashboardRows";
import { Panel, KpiCard } from "@/components/DashboardPrimitives";
import { alertsLog } from "@/data/ecoprawn";

export function AlertsView() {
  const openCount = alertsLog.filter((a) => a.icon === "warn").length;

  return (
    <>
      <div className="flex justify-between items-start mb-7 flex-wrap gap-4 pb-6 border-b border-[var(--sand-dim)]">
        <div>
          <div className="ep-font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--mangrove)] mb-2">
            Facility Monitoring
          </div>
          <h1 className="ep-font-display text-[28px] font-semibold text-[var(--water-deep)] leading-tight">
            Alerts
          </h1>
          <div className="text-[13px] text-[rgba(11,35,32,0.55)] mt-1.5">
            Parameter warnings, automated actions &amp; system events
          </div>
        </div>
        <div className="inline-flex items-center gap-2 bg-white border border-[var(--sand-dim)] px-4 py-[9px] rounded-full text-[12.5px] font-semibold text-[var(--water-deep)] shadow-[0_2px_8px_-4px_rgba(11,35,32,0.12)]">
          <span
            className={`w-[7px] h-[7px] rounded-full ${
              openCount === 0 ? "ep-pulse-dot bg-[var(--mangrove)]" : "bg-[var(--amber)]"
            }`}
          />
          {openCount === 0 ? "No open alerts" : `${openCount} open alert${openCount > 1 ? "s" : ""}`}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        <KpiCard
          label="Open Alerts"
          value={String(openCount)}
          unit="active"
          delta="Tank 4 — DO trending down"
          deltaTone={openCount === 0 ? "ok" : "warn"}
        />
        <KpiCard label="Auto-Resolved Today" value="1" unit="event" delta="Aerator relay auto-triggered" deltaTone="ok" />
        <KpiCard
          label="Events Logged"
          value={String(alertsLog.length)}
          unit="last 24h"
          delta="across all tanks"
          deltaTone="ok"
        />
      </div>

      <Panel title="Alert & Event Log" badge={`${alertsLog.length} events`}>
        <div>
          {alertsLog.map((a) => (
            <AlertRow key={a.title + a.time} {...a} />
          ))}
        </div>
      </Panel>
    </>
  );
}