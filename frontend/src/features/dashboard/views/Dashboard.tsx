import { Link } from "@tanstack/react-router";
import { Icon } from "@/components/ui/Icon";
import { KpiCard, Panel } from "@/features/dashboard/components/DashboardPrimitives";
import { useTanks } from "@/features/dashboard/context/TankContext";
import { DashboardErrorState, DashboardLoadingState } from "@/features/dashboard/components/DashboardStates";

const quickActions = [
  { to: "/dashboard/water", title: "Water quality", description: "Review live water parameters.", icon: "waves" },
  { to: "/dashboard/feeding", title: "Feeding", description: "Manage feeding schedules.", icon: "utensils" },
  { to: "/dashboard/alerts", title: "View alerts", description: "Check warnings that need attention.", icon: "bell-ring" },
] as const;

export function Dashboard() {
  const { tanks, loading, error, isDbConnected, lastUpdatedAt, refreshTanks } = useTanks();

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
  const healthyPercent = tanks.length ? (healthyCount / tanks.length) * 100 : 0;
  const attentionPercent = tanks.length ? (attentionCount / tanks.length) * 100 : 0;

  return (
    <>
      <div className="dashboard-page-header mb-7 flex flex-wrap items-end justify-between gap-4 border-b border-[var(--ep-line)] pb-6">
        <div>
          <div className="ep-font-mono mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ep-primary)]">
            Facility overview
          </div>
          <h1 className="ep-font-display text-[30px] font-semibold leading-tight tracking-[-0.02em] text-[var(--ep-text)]">
            Dashboard
          </h1>
          <p className="mt-2 text-sm text-[var(--ep-text-muted)]">
            Your facility at a glance. Monitor tank health and jump into the operations that need you.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--ep-line)] bg-[var(--ep-surface)] px-4 py-2 text-xs font-semibold text-[var(--ep-text)]">
            <span className={isDbConnected ? "h-2 w-2 rounded-full bg-[var(--ep-status-success)]" : "h-2 w-2 rounded-full bg-[var(--ep-status-warning)]"} />
            {isDbConnected ? "System connected" : "Connection unavailable"}
          </div>
          <button type="button" onClick={() => void refreshTanks()} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[var(--ep-line)] bg-[var(--ep-surface)] px-4 text-xs font-semibold text-[var(--ep-text)] transition-colors hover:border-[var(--ep-accent)] hover:bg-[var(--ep-accent-tint)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ep-accent)]">
            <Icon name="refresh-cw" size={14} />
            Refresh
          </button>
        </div>
      </div>

      <section aria-label="Facility health summary" className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard label="Registered tanks" value={String(tanks.length)} unit="tanks" delta="Total facility inventory" deltaTone="ok" />
        <KpiCard label="Healthy tanks" value={String(healthyCount)} unit="tanks" delta={tanks.length ? `${Math.round(healthyPercent)}% of facility` : "No tanks registered"} deltaTone="ok" />
        <KpiCard label="Need attention" value={String(attentionCount)} unit="tanks" delta={attentionCount ? "Review water conditions" : "No tank warnings detected"} deltaTone={attentionCount ? "warn" : "ok"} />
      </section>

      <div className="mb-5 grid grid-cols-1 gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <Panel title="Tank health" icon="activity" badge={tanks.length ? `${tanks.length} monitored` : "No tanks"}>
          {tanks.length ? (
            <>
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <div className="ep-font-display text-3xl font-semibold text-[var(--ep-text)]">{Math.round(healthyPercent)}%</div>
                  <div className="text-xs text-[var(--ep-text-muted)]">of tanks currently healthy</div>
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
                  <div className="text-sm font-semibold text-[var(--ep-text)]">{attentionCount ? "Some tanks need a closer look" : "All monitored tanks look healthy"}</div>
                  <div className="mt-1 text-xs text-[var(--ep-text-muted)]">{attentionCount ? "Open Water Quality to inspect individual readings and thresholds." : "Continue monitoring your facility from the Water Quality page."}</div>
                </div>
                <Link to="/dashboard/water" className="inline-flex min-h-9 shrink-0 items-center gap-1 rounded-lg px-3 text-xs font-semibold text-[var(--ep-primary)] transition-colors hover:bg-[var(--ep-accent-tint)]">
                  Inspect readings <Icon name="arrow-up-right" size={14} />
                </Link>
              </div>
            </>
          ) : (
            <div className="rounded-xl border border-dashed border-[var(--ep-line)] bg-[var(--ep-bg)] p-6 text-center">
              <Icon name="layers" size={24} className="mx-auto mb-2 text-[var(--ep-text-muted)]" />
              <p className="text-sm font-semibold text-[var(--ep-text)]">No tanks registered yet</p>
              <p className="mt-1 text-xs text-[var(--ep-text-muted)]">Add your first tank to start monitoring facility health.</p>
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
                <Icon name="chevron-right" size={16} className="text-[var(--ep-text-muted)] transition-transform group-hover:translate-x-0.5" />
              </Link>
            ))}
          </div>
          <div className="mt-4 border-t border-[var(--ep-line)] pt-3 text-xs text-[var(--ep-text-muted)]">
            {lastUpdatedAt ? `Last updated ${lastUpdatedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : "Waiting for the first data refresh"}
          </div>
        </Panel>
      </div>
    </>
  );
}
