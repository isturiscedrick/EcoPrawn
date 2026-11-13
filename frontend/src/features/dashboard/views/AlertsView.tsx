import { useState } from "react";
import { AlertRow } from "@/features/dashboard/components/DashboardRows";
import { Panel, KpiCard } from "@/features/dashboard/components/DashboardPrimitives";
import { useTanks } from "@/features/dashboard/context/TankContext";
import { deriveTankAlerts } from "@/features/dashboard/lib/alerts";
import { SmsSettings } from "@/features/dashboard/components/SmsSettings";
import { DashboardViewSkeleton, DashboardErrorState, DashboardEmptyState } from "@/features/dashboard/components/DashboardStates";

type AlertFilter = "all" | "warning" | "info";

const filterOptions: { value: AlertFilter; label: string }[] = [
  { value: "all", label: "All events" },
  { value: "warning", label: "Warnings" },
  { value: "info", label: "Information" },
];

export function AlertsView() {
  const { tanks, alertsLog, loading, error, refreshTanks } = useTanks();
  const [filter, setFilter] = useState<AlertFilter>("all");

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
  const warningEvents = alertsLog.filter((alert) => alert.icon === "warn");
  const infoEvents = alertsLog.filter((alert) => alert.icon === "info");
  const allAlerts = [...liveAlerts, ...alertsLog];
  const openCount = liveAlerts.length;
  const visibleLiveAlerts = filter === "info" ? [] : liveAlerts;
  const visibleWarningEvents = filter === "info" ? [] : warningEvents;
  const visibleInfoEvents = filter === "warning" ? [] : infoEvents;
  const visibleCount = visibleLiveAlerts.length + visibleWarningEvents.length + visibleInfoEvents.length;

  const filterButtonClass = (active: boolean) =>
    "min-h-10 rounded-full border px-3.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ep-primary)] " +
    (active
      ? "border-[var(--ep-primary)] bg-[var(--ep-accent-tint)] text-[var(--ep-primary)]"
      : "border-[var(--ep-line)] bg-[var(--ep-surface)] text-[var(--ep-text-muted)] hover:text-[var(--ep-text)]");

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
              openCount === 0 ? "ep-pulse-dot bg-[var(--ep-primary)]" : "bg-[var(--ep-status-danger)]"
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
      <Panel title="Alert & Event Log" badge={`${visibleCount} shown`}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter alerts">
            {filterOptions.map((option) => {
              const selected = filter === option.value;
              const count = option.value === "all"
                ? allAlerts.length
                : option.value === "warning"
                  ? liveAlerts.length + warningEvents.length
                  : infoEvents.length;
              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setFilter(option.value)}
                  className={filterButtonClass(selected)}
                >
                  {option.label}
                  <span className="ml-1.5 tabular-nums opacity-75">{count}</span>
                </button>
              );
            })}
          </div>
          <span className="text-[11px] text-[var(--ep-text-muted)]">
            Live readings update automatically
          </span>
        </div>

        {visibleCount > 0 ? (
          <div className="space-y-5">
            {visibleLiveAlerts.length > 0 && (
              <section aria-labelledby="active-alerts-heading">
                <div className="mb-1 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[var(--ep-status-danger)]" />
                  <h2 id="active-alerts-heading" className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--ep-text)]">
                    Active parameter warnings
                  </h2>
                  <span className="text-[11px] text-[var(--ep-text-muted)]">{visibleLiveAlerts.length}</span>
                </div>
                {visibleLiveAlerts.map((alert, index) => (
                  <AlertRow key={`live-${alert.title}-${alert.detail}-${index}`} {...alert} />
                ))}
              </section>
            )}

            {visibleWarningEvents.length > 0 && (
              <section aria-labelledby="warning-events-heading">
                <div className="mb-1 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[var(--ep-status-warning)]" />
                  <h2 id="warning-events-heading" className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--ep-text)]">
                    Warning events
                  </h2>
                  <span className="text-[11px] text-[var(--ep-text-muted)]">{visibleWarningEvents.length}</span>
                </div>
                {visibleWarningEvents.map((alert, index) => (
                  <AlertRow key={`warning-${alert.title}-${alert.detail}-${alert.time}-${index}`} {...alert} />
                ))}
              </section>
            )}

            {visibleInfoEvents.length > 0 && (
              <section aria-labelledby="info-events-heading">
                <div className="mb-1 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[var(--ep-primary)]" />
                  <h2 id="info-events-heading" className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--ep-text)]">
                    Informational events
                  </h2>
                  <span className="text-[11px] text-[var(--ep-text-muted)]">{visibleInfoEvents.length}</span>
                </div>
                {visibleInfoEvents.map((alert, index) => (
                  <AlertRow key={`info-${alert.title}-${alert.detail}-${alert.time}-${index}`} {...alert} />
                ))}
              </section>
            )}
          </div>
        ) : (
          <DashboardEmptyState
            title={filter === "warning" ? "No warning events" : "No informational events"}
            description={
              filter === "warning"
                ? "There are no active parameter warnings or logged warning events."
                : "Informational system events will appear here when they are recorded."
            }
          />
        )}
      </Panel>
    </>
  );
}
