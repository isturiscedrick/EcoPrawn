import { AlertRow } from "@/features/dashboard/components/DashboardRows";
import { Panel, KpiCard } from "@/features/dashboard/components/DashboardPrimitives";
import { useTanks } from "@/features/dashboard/context/TankContext";
import { deriveTankAlerts } from "@/features/dashboard/lib/alerts";
import { SmsSettings } from "@/features/dashboard/components/SmsSettings";
import { DashboardViewSkeleton, DashboardErrorState, DashboardEmptyState } from "@/features/dashboard/components/DashboardStates";

export function AlertsView() {
  const { tanks, alertsLog, loading, error, refreshTanks } = useTanks();

  if (loading) return <DashboardViewSkeleton variant="alerts" />;

  if (error && tanks.length === 0 && alertsLog.length === 0) {
    return (
      <DashboardErrorState
        title="Alerts unavailable"
        description={error}
        action={{ label: "Try again", onClick: () => void refreshTanks() }}
      />
    );
  }

  const liveAlerts = deriveTankAlerts(tanks);
  const allAlerts = [...liveAlerts, ...alertsLog];
  const openCount = liveAlerts.length;

  return (
    <>
      {error && (
        <div className="mb-4">
          <DashboardErrorState
            title="Some alert data may be out of date"
            description={error}
            action={{ label: "Retry", onClick: () => void refreshTanks() }}
          />
        </div>
      )}
      <div className="dashboard-page-header flex justify-between items-start mb-7 flex-wrap gap-4 pb-6 border-b border-[var(--ep-line)]">
        <div>
          <div className="ep-font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ep-primary)] mb-2">
            Facility Monitoring
          </div>
          <h1 className="ep-font-display text-[28px] font-semibold text-[var(--ep-text)] leading-tight">
            Alerts
          </h1>
          <div className="text-[13px] text-[var(--ep-text-muted)] mt-1.5">
            Parameter warnings, automated actions &amp; system events
          </div>
        </div>
        <div className="inline-flex items-center gap-2 bg-[var(--ep-surface)] border border-[var(--ep-line)] px-4 py-[9px] rounded-full text-[12.5px] font-semibold text-[var(--ep-text)] shadow-sm">
          <span
            className={`w-[7px] h-[7px] rounded-full ${
              openCount === 0 ? "ep-pulse-dot bg-[var(--ep-primary)]" : "bg-[var(--ep-accent)]"
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
          delta={openCount === 0 ? "No active warnings" : "Parameters out of range"}
          deltaTone={openCount === 0 ? "ok" : "warn"}
        />
        <KpiCard label="Auto-Resolved Today" value="1" unit="event" delta="Aerator relay auto-triggered" deltaTone="ok" />
        <KpiCard
          label="Events Logged"
          value={String(allAlerts.length)}
          unit="last 24h"
          delta={`${liveAlerts.length} live · ${alertsLog.length} logged`}
          deltaTone="ok"
        />
      </div>

      <div className="mb-5"><SmsSettings /></div>
      <Panel title="Alert & Event Log" badge={`${allAlerts.length} events`}>
        <div>
          {allAlerts.length > 0 ? (
            allAlerts.map((a) => (
              <AlertRow key={`${a.title}-${a.detail}-${a.time}`} {...a} />
            ))
          ) : (
            <DashboardEmptyState
              title="No alerts or events yet"
              description="When tank readings move outside their target ranges or system events are recorded, they will appear here."
            />
          )}
        </div>
      </Panel>
    </>
  );
}
