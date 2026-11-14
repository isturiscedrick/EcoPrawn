import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { AlertRow } from "@/features/dashboard/components/DashboardRows";
import { Panel, KpiCard } from "@/features/dashboard/components/DashboardPrimitives";
import { DonutChart } from "@/features/dashboard/components/AnalyticsCharts";
import { useTanks } from "@/features/dashboard/context/TankContext";
import { downloadCsv } from "@/utils/downloadCsv";
import { deriveTankAlerts } from "@/features/dashboard/lib/alerts";
import { SmsSettings } from "@/features/dashboard/components/SmsSettings";
import { DashboardViewSkeleton, DashboardErrorState, DashboardEmptyState } from "@/features/dashboard/components/DashboardStates";

type AlertFilter = "all" | "warning" | "info";

const filterOptions: { value: AlertFilter; label: string }[] = [
  { value: "all", label: "All events" },
  { value: "warning", label: "Warnings" },
  { value: "info", label: "Information" },
];

function ResolveAlertAction({ alert, onResolved }: { alert: { id?: string }; onResolved: () => void }) {
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  if (!alert.id) return null;
  async function resolve() {
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/alerts/" + encodeURIComponent(alert.id!), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resolutionNote: note }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(payload?.error || "Unable to resolve alert.");
      setMessage("Alert resolved.");
      onResolved();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to resolve alert.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="ml-8 mt-2 flex flex-wrap items-center gap-2">
      <label className="min-w-[180px] flex-1">
        <span className="sr-only">Resolution note</span>
        <input value={note} maxLength={500} onChange={event => setNote(event.target.value)} placeholder="Add resolution note (optional)" className="min-h-9 w-full rounded-lg border border-[var(--ep-line)] bg-[var(--ep-surface)] px-3 text-xs text-[var(--ep-text)] outline-none focus:border-[var(--ep-primary)]" />
      </label>
      <button type="button" disabled={busy} onClick={() => void resolve()} className="min-h-9 rounded-lg bg-[var(--ep-primary)] px-3 text-xs font-semibold text-white disabled:opacity-50">{busy ? "Resolving…" : "Mark resolved"}</button>
      {message && <span role="status" className="text-xs text-[var(--ep-text-muted)]">{message}</span>}
    </div>
  );
}

export function AlertsView() {
  const { tanks, alertsLog, resolvedAlerts, loading, error, refreshTanks } = useTanks();
  const [filter, setFilter] = useState<AlertFilter>("all");
  const [search, setSearch] = useState("");

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
  const warningEvents = alertsLog.filter((alert) => alert.icon === "warn" && !alert.resolved);
  const resolvedEvents = alertsLog.filter((alert) => alert.resolved);
  const infoEvents = alertsLog.filter((alert) => alert.icon === "info");
  const allAlerts = [...liveAlerts, ...alertsLog];
  const openCount = liveAlerts.length;
  const visibleLiveAlerts = filter === "info" ? [] : liveAlerts;
  const visibleWarningEvents = filter === "info" ? [] : warningEvents;
  const visibleResolvedEvents = filter === "info" ? [] : resolvedEvents;
  const visibleInfoEvents = filter === "warning" ? [] : infoEvents;
  const normalizedSearch = search.trim().toLowerCase();
  const matchesSearch = (alert: { title?: string; detail?: string; tank?: string }) => !normalizedSearch || `${alert.title ?? ""} ${alert.detail ?? ""} ${alert.tank ?? ""}`.toLowerCase().includes(normalizedSearch);
  const searchedLiveAlerts = visibleLiveAlerts.filter(matchesSearch);
  const searchedWarningEvents = visibleWarningEvents.filter(matchesSearch);
  const searchedResolvedEvents = visibleResolvedEvents.filter(matchesSearch);
  const searchedInfoEvents = visibleInfoEvents.filter(matchesSearch);
  const visibleCount = searchedLiveAlerts.length + searchedWarningEvents.length + searchedInfoEvents.length + searchedResolvedEvents.length;

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
        <button type="button" onClick={() => {
          const rows = [
            ...liveAlerts.map(alert => ["Active warning", alert.title, alert.detail, alert.time]),
            ...alertsLog.map(alert => [alert.resolved ? "Resolved alert" : alert.icon === "warn" ? "Warning event" : "Information", alert.title, alert.detail, alert.time, alert.resolvedAt ?? "", alert.resolutionNote ?? ""]),
          ];
          downloadCsv(`ecoprawn-alerts-${new Date().toISOString().slice(0, 10)}.csv`, ["Category", "Title", "Details", "Time", "Resolved at", "Resolution note"], rows);
        }} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--ep-line)] bg-[var(--ep-surface)] px-3 text-xs font-semibold text-[var(--ep-primary)] transition-colors hover:bg-[var(--ep-tint)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ep-primary)]">
          <span aria-hidden="true">↓</span> Export alerts
        </button>
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
        <KpiCard label="Resolved Alerts" value={String(resolvedAlerts)} unit="resolved" delta="Previously resolved events" deltaTone="ok" />
      </div>

      <div className="mb-5">
        <Panel title="Alert composition" badge="current event mix">
          <DonutChart items={[
            { label: "Live alerts", value: liveAlerts.length, color: "#D85A35" },
            { label: "Warning events", value: warningEvents.length, color: "#C18A27" },
            { label: "Information", value: infoEvents.length, color: "#167C80" },
          ]} unit="events" emptyLabel="No alerts or events recorded." />
        </Panel>
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
                  ? liveAlerts.length + warningEvents.length + resolvedEvents.length
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
            {searchedLiveAlerts.length > 0 && (
              <section aria-labelledby="active-alerts-heading">
                <div className="mb-1 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[var(--ep-status-danger)]" />
                  <h2 id="active-alerts-heading" className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--ep-text)]">
                    Active parameter warnings
                  </h2>
                  <span className="text-[11px] text-[var(--ep-text-muted)]">{searchedLiveAlerts.length}</span>
                </div>
                {searchedLiveAlerts.map((alert, index) => (
                  <AlertRow key={`live-${alert.title}-${alert.detail}-${index}`} {...alert} />
                ))}
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
                  <div key={alert.id ?? ("warning-" + alert.title + alert.detail + alert.time + index)}>
                    <AlertRow {...alert} />
                    <ResolveAlertAction alert={alert} onResolved={() => void refreshTanks()} />
                  </div>
                ))}
              </section>
            )}

            {searchedResolvedEvents.length > 0 && (
              <section aria-labelledby="resolved-alerts-heading">
                <div className="mb-1 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[var(--ep-status-success)]" />
                  <h2 id="resolved-alerts-heading" className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--ep-text)]">Resolved alerts</h2>
                  <span className="text-[11px] text-[var(--ep-text-muted)]">{searchedResolvedEvents.length}</span>
                </div>
                {searchedResolvedEvents.map((alert, index) => (
                  <div key={alert.id ?? ("resolved-" + index)} className="border-b border-[var(--ep-line)] py-2">
                    <AlertRow {...alert} />
                    <div className="ml-8 mt-1 text-[11px] text-[var(--ep-text-muted)]">
                      {alert.resolvedAt ? "Resolved " + new Date(alert.resolvedAt).toLocaleString() : "Resolved"}
                      {alert.resolvedBy ? " · by " + alert.resolvedBy : ""}{alert.resolutionNote ? " · " + alert.resolutionNote : ""}
                    </div>
                  </div>
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
            description={normalizedSearch ? "Try another search term or clear your search." : filter === "warning" ? "There are no active parameter warnings or logged warning events." : "Informational system events will appear here when they are recorded."}
          />
        )}
      </Panel>
    </>
  );
}
