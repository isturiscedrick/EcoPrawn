import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Icon } from "@/components/ui/Icon";
import { KpiCard, Panel } from "@/features/dashboard/components/DashboardPrimitives";
import { useTanks } from "@/features/dashboard/context/TankContext";
import { DashboardErrorState, DashboardLoadingState } from "@/features/dashboard/components/DashboardStates";
import { getThresholds, rangeStatus } from "@/features/dashboard/lib/thresholds";
import { DashboardDataStatus } from "@/features/dashboard/components/DashboardDataStatus";

const quickActions = [
  { to: "/dashboard/water", title: "Water quality", description: "View water readings.", icon: "waves" },
  { to: "/dashboard/feeding", title: "Feeding", description: "View feeding schedules.", icon: "utensils" },
  { to: "/dashboard/alerts", title: "View alerts", description: "Review active alerts.", icon: "bell-ring" },
] as const;

export function Dashboard() {
  const navigate = useNavigate();
  const { tanks, waterHistory = [], visionScanLog = [], loading, error, refreshTanks } = useTanks();
  const [thresholdSettings, setThresholdSettings] = useState(getThresholds);

  useEffect(() => {
    const syncThresholds = () => setThresholdSettings(getThresholds());
    window.addEventListener("ecoprawn:thresholds-updated", syncThresholds);
    window.addEventListener("storage", syncThresholds);
    return () => {
      window.removeEventListener("ecoprawn:thresholds-updated", syncThresholds);
      window.removeEventListener("storage", syncThresholds);
    };
  }, []);

  if (loading) return <DashboardLoadingState />;
  if (error && tanks.length === 0) {
    return (
      <DashboardErrorState
        title="Dashboard data unavailable"
        description={error}
        action={{ label: "Try again", onClick: () => void refreshTanks() }}
      />
    );
  }

  const healthyCount = tanks.filter((tank) => tank.status === "ok").length;
  const attentionCount = tanks.length - healthyCount;
  const noReadingCount = tanks.filter((tank) => !tank.hasWaterReadings).length;
  const outOfRangeCount = attentionCount - noReadingCount;
  const healthyPercent = tanks.length ? (healthyCount / tanks.length) * 100 : 0;
  const attentionPercent = tanks.length ? (attentionCount / tanks.length) * 100 : 0;
  const prioritizedTanks = [...tanks].sort((a, b) => {
    if (a.status !== b.status) return a.status === "warn" ? -1 : 1;
    if (a.hasWaterReadings !== b.hasWaterReadings) return a.hasWaterReadings ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
  const recentActivity = [
    ...waterHistory.map((point) => ({
      id: `water-${point.tankId}-${point.recordedAt}`,
      kind: "Water reading" as const,
      tankName: tanks.find((tank) => tank.id === point.tankId)?.name ?? "Unknown tank",
      detail: `DO ${point.dissolvedOxygen.toFixed(1)} mg/L · pH ${point.ph.toFixed(1)} · ${point.temperature.toFixed(1)} °C`,
      timestamp: new Date(point.recordedAt),
    })),
    ...visionScanLog.map((scan) => ({
      id: `scan-${scan.id}`,
      kind: "Vision scan" as const,
      tankName: scan.tank,
      detail: scan.note || "Scan recorded",
      timestamp: new Date(scan.time),
    })),
  ]
    .filter((activity) => Number.isFinite(activity.timestamp.getTime()))
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 5);

  return (
    <>
      <header className="dashboard-page-header mb-7 block w-full border-b border-[var(--ep-line)] pb-6">
        <div className="block w-full min-w-0">
          <div className="ep-font-mono mb-2 block text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ep-primary)]">
            Facility overview
          </div>
          <h1 className="ep-font-display block w-full text-[26px] font-semibold leading-tight tracking-[-0.02em] text-[var(--ep-text)] sm:text-[30px]">
            Dashboard
          </h1>
          <p className="mt-2 block w-full text-sm text-[var(--ep-text-muted)]">
            Monitor tank health and key activity.
          </p>
        </div>
      </header>

      <DashboardDataStatus />

      <section aria-label="Facility health summary" className="mb-5 grid grid-cols-2 gap-2.5 sm:grid-cols-2 sm:gap-3 2xl:grid-cols-4">
        <KpiCard label="Registered tanks" value={String(tanks.length)} unit="tanks" delta="Total tanks" deltaTone="ok" onDetails={() => { void navigate({ to: "/dashboard/tanks" }); }} />
        <KpiCard label="Healthy tanks" value={String(healthyCount)} unit="tanks" delta={tanks.length ? `${Math.round(healthyPercent)}% of facility` : "No tanks yet"} deltaTone="ok" onDetails={() => { void navigate({ to: "/dashboard/tanks" }); }} />
        <KpiCard label="Need attention" value={String(attentionCount)} unit="tanks" delta={outOfRangeCount ? `${outOfRangeCount} with out-of-range readings` : attentionCount ? "Awaiting readings" : "No warnings"} deltaTone={attentionCount ? "warn" : "ok"} onDetails={() => { void navigate({ to: "/dashboard/water" }); }} />
        <KpiCard label="No water readings" value={String(noReadingCount)} unit="tanks" delta={noReadingCount ? "Awaiting data" : "Readings available"} deltaTone={noReadingCount ? "warn" : "ok"} onDetails={() => { void navigate({ to: "/dashboard/water" }); }} />
      </section>

      <section aria-labelledby="tank-snapshot-heading" className="mb-5">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 id="tank-snapshot-heading" className="ep-font-display text-lg font-semibold text-[var(--ep-text)]">Tank snapshot</h2>
            <p className="mt-1 text-xs text-[var(--ep-text-muted)]">Latest readings by tank.</p>
          </div>
          <Link to="/dashboard/tanks" className="inline-flex min-h-10 items-center gap-1 rounded-lg px-3 text-xs font-semibold text-[var(--ep-accent)] transition-colors hover:bg-[var(--ep-accent-tint)]">
            Manage tanks <Icon name="arrow-up-right" size={14} />
          </Link>
        </div>
        {tanks.length ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 2xl:grid-cols-3">
            {prioritizedTanks.slice(0, 6).map((tank) => {
              const readings = [
                { label: "DO", unit: "mg/L", value: tank.dissolvedOxygen, status: rangeStatus(tank.dissolvedOxygen, thresholdSettings.dissolvedOxygen.min) },
                { label: "pH", unit: "", value: tank.ph, status: rangeStatus(tank.ph, thresholdSettings.ph.min, thresholdSettings.ph.max) },
                { label: "Temp", unit: "°C", value: tank.temperature, status: rangeStatus(tank.temperature, thresholdSettings.temperature.min, thresholdSettings.temperature.max) },
                { label: "Salinity", unit: "ppt", value: tank.salinity, status: rangeStatus(tank.salinity, thresholdSettings.salinity.min, thresholdSettings.salinity.max) },
                { label: "Water level", unit: "%", value: tank.waterLevel, status: rangeStatus(tank.waterLevel, thresholdSettings.waterLevel.min) },
              ];
              const warningLabels = tank.hasWaterReadings
                ? readings.filter((reading) => reading.status === "warn").map((reading) => reading.label)
                : [];
              const warningCount = warningLabels.length;
              return (
                <Link key={tank.id} to="/dashboard/water" onClick={() => window.sessionStorage.setItem("ecoprawn.dashboard.selected-tank", tank.id)} className="dashboard-tank-snapshot group min-w-0 rounded-2xl border border-[var(--ep-line)] bg-[var(--ep-surface)] p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--ep-accent)] hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ep-accent)]">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--ep-accent-tint)] text-[var(--ep-accent)]"><Icon name="layers" size={17} /></span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-[var(--ep-text)]">{tank.name}</span>
                        <span className="block truncate text-[11px] text-[var(--ep-text-muted)]">{tank.pl}</span>
                      </span>
                    </div>
                    <span className={!tank.hasWaterReadings ? "dashboard-status-badge" : warningCount ? "dashboard-status-badge dashboard-status-warning" : "dashboard-status-badge dashboard-status-success"}>
                      {!tank.hasWaterReadings ? "No readings" : warningCount ? `${warningCount} to check` : "Healthy"}
                    </span>
                  </div>
                  {warningLabels.length > 0 && (
                    <p className="mb-3 rounded-lg border border-[var(--ep-status-warning)]/25 bg-[var(--ep-status-warning)]/5 px-2.5 py-2 text-[11px] leading-relaxed text-[var(--ep-status-warning)]">
                      <span className="font-semibold">Check:</span> {warningLabels.join(" · ")}
                    </p>
                  )}
                  {tank.hasWaterReadings ? (
                    <div className="grid grid-cols-2 gap-2 border-t border-[var(--ep-line)] pt-3 sm:grid-cols-3">
                      {readings.map((reading) => (
                        <div key={reading.label} className={`min-w-0 rounded-lg border p-2 ${reading.status === "warn" ? "border-[var(--ep-status-warning)]/35 bg-[var(--ep-status-warning)]/5" : "border-[var(--ep-line)] bg-[var(--ep-bg)]"}`}>
                          <div className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-[var(--ep-text-muted)]">
                            {reading.label}
                            {reading.status === "warn" && <span className="h-1.5 w-1.5 rounded-full bg-[var(--ep-status-warning)]" aria-label="Outside configured range" />}
                          </div>
                          <div className={`mt-1 text-sm font-semibold tabular-nums ${reading.status === "warn" ? "text-[var(--ep-status-warning)]" : "text-[var(--ep-text)]"}`}>
                            {reading.value.toFixed(1)}{reading.unit ? ` ${reading.unit}` : ""}
                          </div>
                          <div className="mt-0.5 text-[9px] text-[var(--ep-text-muted)]">{reading.status === "warn" ? "Check range" : "In range"}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="border-t border-[var(--ep-line)] pt-3">
                      <p className="text-xs font-medium text-[var(--ep-text-muted)]">No readings yet</p>
                      <p className="mt-1 text-[11px] text-[var(--ep-text-muted)]">Status appears when data arrives.</p>
                    </div>
                  )}
                  <div className="mt-3 flex items-center justify-end gap-1 text-[11px] font-semibold text-[var(--ep-accent)]">View water quality <Icon name="arrow-right" size={12} /></div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[var(--ep-line)] bg-[var(--ep-surface)] p-6 text-center">
            <Icon name="layers" size={24} className="mx-auto mb-2 text-[var(--ep-text-muted)]" />
            <p className="text-sm font-semibold text-[var(--ep-text)]">No tanks yet</p>
            <p className="mt-1 text-xs text-[var(--ep-text-muted)]">Add a tank to monitor water quality.</p>
            <Link to="/dashboard/tanks" className="mt-3 inline-flex min-h-10 items-center rounded-lg bg-[var(--ep-accent)] px-4 text-xs font-semibold text-white">Add a tank</Link>
          </div>
        )}
        {tanks.length > 6 && <p className="mt-2 text-right text-xs text-[var(--ep-text-muted)]">Showing 6 of {tanks.length} tanks · highest priority first.</p>}
        {noReadingCount > 0 && <p className="mt-3 rounded-xl border border-[var(--ep-line)] bg-[var(--ep-bg)] px-3 py-2 text-xs leading-relaxed text-[var(--ep-text-muted)]"><span className="font-semibold text-[var(--ep-text)]">{noReadingCount} {noReadingCount === 1 ? "tank has" : "tanks have"} no water readings.</span> Missing readings count as needing attention.</p>}
      </section>

      <section className="mb-5" aria-label="Recent facility activity">
        <Panel title="Recent facility activity" icon="clock" badge={recentActivity.length ? `Latest ${recentActivity.length}` : "No activity"}>
          {recentActivity.length ? (
            <ol className="divide-y divide-[var(--ep-line)]">
              {recentActivity.map((activity) => (
                <li key={activity.id} className="flex min-w-0 items-start gap-3 py-3 first:pt-0 last:pb-0">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--ep-accent-tint)] text-[var(--ep-accent)]">
                    <Icon name={activity.kind === "Water reading" ? "waves" : "camera"} size={15} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                      <p className="text-xs font-semibold text-[var(--ep-text)]">{activity.kind} · {activity.tankName}</p>
                      <time dateTime={activity.timestamp.toISOString()} className="text-[10px] text-[var(--ep-text-muted)]">
                        {activity.timestamp.toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
                      </time>
                    </div>
                    <p className="mt-1 break-words text-xs text-[var(--ep-text-muted)]">{activity.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <div className="rounded-xl border border-dashed border-[var(--ep-line)] bg-[var(--ep-bg)] px-4 py-7 text-center">
              <Icon name="clock" size={21} className="mx-auto mb-2 text-[var(--ep-text-muted)]" />
              <p className="text-sm font-semibold text-[var(--ep-text)]">No recent activity yet</p>
              <p className="mt-1 text-xs text-[var(--ep-text-muted)]">Water readings and vision scans will appear here.</p>
            </div>
          )}
        </Panel>
      </section>

      <div className="mb-5 grid grid-cols-1 gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <Panel title="Tank health" icon="activity" badge={tanks.length ? `${tanks.length} monitored` : "No tanks"}>
          {tanks.length ? (
            <>
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <div className="ep-font-display text-3xl font-semibold text-[var(--ep-text)]">{Math.round(healthyPercent)}%</div>
                  <div className="text-xs text-[var(--ep-text-muted)]">of tanks healthy</div>
                </div>
                <div className="text-right text-xs text-[var(--ep-text-muted)]">
                  <div><span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-[var(--ep-status-success)]" />{healthyCount} healthy</div>
                  <div className="mt-1"><span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-[var(--ep-status-warning)]" />{attentionCount} need attention</div>
                </div>
              </div>
              <div className="flex h-3 overflow-hidden rounded-full bg-[var(--ep-line)]" role="img" aria-label={`${healthyCount} healthy tanks and ${attentionCount} tanks needing attention`}>
                {healthyCount > 0 && <div className="h-full bg-[var(--ep-status-success)] transition-[width] duration-500" style={{ width: `${healthyPercent}%` }} />}
                {attentionCount > 0 && <div className="h-full bg-[var(--ep-status-warning)] transition-[width] duration-500" style={{ width: `${attentionPercent}%` }} />}
              </div>
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--ep-line)] bg-[var(--ep-bg)] p-4">
                <div>
                  <div className="text-sm font-semibold text-[var(--ep-text)]">{attentionCount ? "Tanks need attention" : "All tanks healthy"}</div>
                  <div className="mt-1 text-xs text-[var(--ep-text-muted)]">{attentionCount ? "Check readings and thresholds in Water Quality." : "Keep monitoring in Water Quality."}</div>
                </div>
                <Link to="/dashboard/water" className="inline-flex min-h-9 shrink-0 items-center gap-1 rounded-lg px-3 text-xs font-semibold text-[var(--ep-primary)] transition-colors hover:bg-[var(--ep-accent-tint)]">
                  Inspect readings <Icon name="arrow-up-right" size={14} />
                </Link>
              </div>
            </>
          ) : (
            <div className="rounded-xl border border-dashed border-[var(--ep-line)] bg-[var(--ep-bg)] p-6 text-center">
              <Icon name="layers" size={24} className="mx-auto mb-2 text-[var(--ep-text-muted)]" />
              <p className="text-sm font-semibold text-[var(--ep-text)]">No tanks yet yet</p>
              <p className="mt-1 text-xs text-[var(--ep-text-muted)]">Add a tank to monitor facility health.</p>
              <Link to="/dashboard/tanks" className="mt-3 inline-flex min-h-9 items-center rounded-lg bg-[var(--ep-accent)] px-4 text-xs font-semibold text-white">Set up tanks</Link>
            </div>
          )}
        </Panel>

        <Panel title="Quick actions" icon="zap">
          <div className="space-y-2">
            {quickActions.map((action) => (
              <Link key={action.to} to={action.to} className="group flex items-center gap-3 rounded-xl border border-[var(--ep-line)] bg-[var(--ep-surface)] p-3 transition-colors hover:border-[var(--ep-accent)] hover:bg-[var(--ep-accent-tint)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ep-accent)]">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--ep-accent-tint)] text-[var(--ep-primary)]"><Icon name={action.icon} size={18} /></span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-[var(--ep-text)]">{action.title}</span>
                  <span className="mt-0.5 block text-xs text-[var(--ep-text-muted)]">{action.description}</span>
                </span>
                <Icon name="arrow-right" size={16} className="text-[var(--ep-text-muted)] transition-transform group-hover:translate-x-0.5" />
              </Link>
            ))}
          </div>
        </Panel>
      </div>
    </>
  );
}
