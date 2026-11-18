import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Icon } from "@/components/ui/Icon";
import { AlertRow } from "@/features/dashboard/components/DashboardRows";
import { KpiGrid, Panel, KpiCard } from "@/features/dashboard/components/DashboardPrimitives";
import { DonutChart } from "@/features/dashboard/components/AnalyticsCharts";
import { useTanks } from "@/features/dashboard/context/TankContext";
import { downloadCsv } from "@/utils/downloadCsv";
import { deriveTankAlerts } from "@/features/dashboard/lib/alerts";
import { DashboardViewSkeleton, DashboardErrorState, DashboardEmptyState } from "@/features/dashboard/components/DashboardStates";

type AlertFilter = "all" | "warning" | "info";

const filterOptions: { value: AlertFilter; label: string }[] = [
  { value: "all", label: "All events" },
  { value: "warning", label: "Warnings" },
  { value: "info", label: "Information" },
];

export function AlertsView() {
  const navigate = useNavigate();
  const { tanks, alertsLog, resolvedAlerts, loading, error } = useTanks();
  const [filter, setFilter] = useState<AlertFilter>("all");
  const [search, setSearch] = useState("");
  const [acknowledged, setAcknowledged] = useState<Set<string>>(() => new Set());

  if (loading) return <DashboardViewSkeleton variant="alerts" />;

  if (error && tanks.length === 0 && alertsLog.length === 0) {
    return (
      <DashboardErrorState
        title="Alerts unavailable"
        description={error}
      />
    );
  }

  const liveAlerts = deriveTankAlerts(tanks);
  const warningEvents = alertsLog.filter((alert) => alert.icon === "warn");
  const infoEvents = alertsLog.filter((alert) => alert.icon === "info");
  const allAlerts = [...liveAlerts, ...alertsLog];
  const openCount = liveAlerts.length;
  const tankAttention = liveAlerts.reduce((groups, alert) => {
    if (!alert.tankId) return groups;
    const existing = groups.get(alert.tankId);
    if (existing) existing.alerts.push(alert);
    else groups.set(alert.tankId, { tankId: alert.tankId, tankName: tanks.find(tank => tank.id === alert.tankId)?.name ?? "Tank", alerts: [alert] });
    return groups;
  }, new Map<string, { tankId: string; tankName: string; alerts: typeof liveAlerts }>());
  const affectedTanks = [...tankAttention.values()].sort((a, b) => b.alerts.length - a.alerts.length || a.tankName.localeCompare(b.tankName));
  const visibleLiveAlerts = filter === "info" ? [] : liveAlerts;
  const visibleWarningEvents = filter === "info" ? [] : warningEvents;
  const visibleInfoEvents = filter === "warning" ? [] : infoEvents;
  const normalizedSearch = search.trim().toLowerCase();
  const matchesSearch = (alert: { title?: string; detail?: string; tank?: string }) => !normalizedSearch || `${alert.title ?? ""} ${alert.detail ?? ""} ${alert.tank ?? ""}`.toLowerCase().includes(normalizedSearch);
  const searchedLiveAlerts = visibleLiveAlerts.filter(matchesSearch);
  const searchedWarningEvents = visibleWarningEvents.filter(matchesSearch);
  const searchedInfoEvents = visibleInfoEvents.filter(matchesSearch);
  const alertIdentity = (alert: { title?: string; detail?: string }) => `${alert.title ?? ""}::${alert.detail ?? ""}`;
  const openTank = (tankId?: string) => {
    if (!tankId) return;
    window.sessionStorage.setItem("ecoprawn.dashboard.selected-tank", tankId);
    void navigate({ to: "/dashboard/water" });
  };
  const reviewedCount = liveAlerts.filter(alert => acknowledged.has(alertIdentity(alert))).length;
  const needsReviewCount = Math.max(0, liveAlerts.length - reviewedCount);
  const pendingLiveAlerts = searchedLiveAlerts.filter(alert => !acknowledged.has(alertIdentity(alert)));
  const reviewedLiveAlerts = searchedLiveAlerts.filter(alert => acknowledged.has(alertIdentity(alert)));
  const visibleCount = searchedLiveAlerts.length + searchedWarningEvents.length + searchedInfoEvents.length;

  const filterButtonClass = (active: boolean) =>
    "min-h-10 rounded-full border px-3.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ep-primary)] " +
    (active
      ? "border-[var(--ep-primary)] bg-[var(--ep-accent-tint)] text-[var(--ep-primary)]"
      : "border-[var(--ep-line)] bg-[var(--ep-surface)] text-[var(--ep-text-muted)] hover:text-[var(--ep-text)]");

  return (
    <div className="dashboard-alerts-page">
      {error && (
        <div className="mb-4">
          <DashboardErrorState
            title="Some alert data may be out of date"
            description={error}
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
            Warnings and event history.
          </div>
        </div>
        <button
          type="button"
          onClick={() => void navigate({ to: "/dashboard/activity" })}
          className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--ep-line)] bg-[var(--ep-surface)] px-3 text-xs font-semibold text-[var(--ep-primary)] transition-colors hover:bg-[var(--ep-tint)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ep-primary)] lg:hidden"
        >
          <Icon name="clock" size={15} />
          Activity Log
        </button>
        <button type="button" onClick={() => {
          const rows = [
            ...liveAlerts.map(alert => ["Active warning", alert.title, alert.detail, alert.time]),
            ...alertsLog.map(alert => [alert.icon === "warn" ? "Warning event" : "Information", alert.title, alert.detail, alert.time]),
          ];
          downloadCsv(`ecoprawn-alerts-${new Date().toISOString().slice(0, 10)}.csv`, ["Category", "Title", "Details", "Time"], rows);
        }} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--ep-line)] bg-[var(--ep-surface)] px-3 text-xs font-semibold text-[var(--ep-primary)] transition-colors hover:bg-[var(--ep-tint)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ep-primary)]">
          <span aria-hidden="true">↓</span> Export alerts
        </button>
      </div>

      <KpiGrid label="Alert summary">
        <KpiCard
          label="Open Alerts"
          value={String(openCount)}
          unit="active"
          delta={openCount === 0 ? "No active warnings" : "Out-of-range readings"}
          deltaTone={openCount === 0 ? "ok" : "warn"}
        />
        <KpiCard label="Resolved Alerts" value={String(resolvedAlerts)} unit="resolved" delta="Past events" deltaTone="ok" />
        <KpiCard label="Needs review" value={String(needsReviewCount)} unit="active" delta={needsReviewCount === 0 ? "All warnings reviewed" : "Still need attention"} deltaTone={needsReviewCount === 0 ? "ok" : "warn"} />
      </KpiGrid>

      <div className="mb-5">
        <Panel title="Tank attention overview" badge={`${affectedTanks.length} affected`}>
          {affectedTanks.length ? (
            <div className="space-y-2">
              <p className="mb-3 text-xs text-[var(--ep-text-muted)]">Grouped by tank.</p>
              {affectedTanks.map((group) => (
                <div key={group.tankId} className="flex min-w-0 flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--ep-line)] bg-[var(--ep-surface)] px-3 py-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-[var(--ep-text)]">{group.tankName}</span>
                      <span className="rounded-full bg-[var(--ep-status-warning)]/10 px-2 py-0.5 text-[10px] font-semibold text-[var(--ep-status-warning)]">{group.alerts.length} parameter warning{group.alerts.length === 1 ? "" : "s"}</span>
                    </div>
                    <p className="mt-1 break-words text-xs text-[var(--ep-text-muted)]">{group.alerts.map(alert => alert.title).join(" · ")}</p>
                  </div>
                  <button type="button" onClick={() => openTank(group.tankId)} className="inline-flex min-h-9 shrink-0 items-center gap-1 rounded-lg border border-[var(--ep-line)] px-3 text-xs font-semibold text-[var(--ep-primary)] transition-colors hover:bg-[var(--ep-tint)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ep-primary)]">Inspect tank <Icon name="arrow-right" size={13} /></button>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-[var(--ep-line)] bg-[var(--ep-bg)] px-4 py-6 text-center">
              <p className="text-sm font-semibold text-[var(--ep-text)]">No tanks currently need attention</p>
              <p className="mt-1 text-xs text-[var(--ep-text-muted)]">Alerts appear when readings leave their limits.</p>
            </div>
          )}
        </Panel>
      </div>

      <div className="mb-5">
        <Panel title="Alert composition" badge="current event mix">
          <DonutChart items={[
            { label: "Live alerts", value: liveAlerts.length, color: "var(--ep-status-danger)" },
            { label: "Warning events", value: warningEvents.length, color: "var(--ep-status-warning)" },
            { label: "Information", value: infoEvents.length, color: "var(--ep-status-info)" },
          ]} unit="events" emptyLabel="No alerts or events recorded." />
        </Panel>
      </div>

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
          <label className="flex min-h-10 min-w-[220px] items-center gap-2 rounded-xl border border-[var(--ep-line)] bg-[var(--ep-surface)] px-3 text-xs text-[var(--ep-text-muted)]">
            <Icon name="search" size={14} />
            <span className="sr-only">Search alerts</span>
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search alerts…" className="min-w-0 flex-1 bg-transparent text-[var(--ep-text)] outline-none placeholder:text-[var(--ep-text-muted)]" />
          </label>
        </div>

        {visibleCount > 0 ? (
          <div className="space-y-5">
            {pendingLiveAlerts.length > 0 && (
              <section aria-labelledby="active-alerts-heading">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[var(--ep-status-danger)]" />
                  <h2 id="active-alerts-heading" className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--ep-text)]">
                    Needs review
                  </h2>
                  <span className="text-[11px] text-[var(--ep-text-muted)]">{pendingLiveAlerts.length}</span>
                  <span className="text-[11px] text-[var(--ep-text-muted)]">Active sensor warnings</span>
                </div>
                <div className="space-y-2">
                  {pendingLiveAlerts.map((alert, index) => {
                    const key = alertIdentity(alert);
                    return <AlertRow key={`live-${key}-${index}`} {...alert} acknowledged={false} onViewTank={() => openTank(alert.tankId)} onAcknowledge={() => setAcknowledged(current => new Set(current).add(key))} />;
                  })}
                </div>
              </section>
            )}

            {reviewedLiveAlerts.length > 0 && (
              <section aria-labelledby="reviewed-alerts-heading">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[var(--ep-text-muted)]" />
                  <h2 id="reviewed-alerts-heading" className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--ep-text)]">
                    Reviewed · still active
                  </h2>
                  <span className="text-[11px] text-[var(--ep-text-muted)]">{reviewedLiveAlerts.length}</span>
                </div>
                <div className="space-y-2">
                  {reviewedLiveAlerts.map((alert, index) => {
                    const key = alertIdentity(alert);
                    return <AlertRow key={`reviewed-${key}-${index}`} {...alert} acknowledged onViewTank={() => openTank(alert.tankId)} onAcknowledge={() => setAcknowledged(current => {
                      const next = new Set(current);
                      next.delete(key);
                      return next;
                    })} />;
                  })}
                </div>
                <p className="mt-2 text-[11px] text-[var(--ep-text-muted)]">Reviewing does not clear an alert. It stays active until readings return to range.</p>
              </section>
            )}

            {searchedWarningEvents.length > 0 && (
              <section aria-labelledby="warning-events-heading">
                <div className="mb-1 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[var(--ep-status-warning)]" />
                  <h2 id="warning-events-heading" className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--ep-text)]">
                    Warning events
                  </h2>
                  <span className="text-[11px] text-[var(--ep-text-muted)]">{searchedWarningEvents.length}</span>
                </div>
                {searchedWarningEvents.map((alert, index) => (
                  <AlertRow key={`warning-${alert.title}-${alert.detail}-${alert.time}-${index}`} {...alert} />
                ))}
              </section>
            )}

            {searchedInfoEvents.length > 0 && (
              <section aria-labelledby="info-events-heading">
                <div className="mb-1 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[var(--ep-primary)]" />
                  <h2 id="info-events-heading" className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--ep-text)]">
                    Informational events
                  </h2>
                  <span className="text-[11px] text-[var(--ep-text-muted)]">{searchedInfoEvents.length}</span>
                </div>
                {searchedInfoEvents.map((alert, index) => (
                  <AlertRow key={`info-${alert.title}-${alert.detail}-${alert.time}-${index}`} {...alert} />
                ))}
              </section>
            )}
          </div>
        ) : (
          <DashboardEmptyState
            title={normalizedSearch ? "No matching alerts" : filter === "warning" ? "No warning events" : "No informational events"}
            description={normalizedSearch ? "Try another search term or clear your search." : filter === "warning" ? "No active or logged warnings." : "System updates will appear here."}
          />
        )}
      </Panel>
    </div>
  );
}
