import { Link } from "@tanstack/react-router";
import { Icon } from "@/components/ui/Icon";
import { Panel } from "@/features/dashboard/components/DashboardPrimitives";
import { useTanks } from "@/features/dashboard/context/TankContext";
import { DashboardErrorState, DashboardLoadingState } from "@/features/dashboard/components/DashboardStates";

const destinations = [
  { to: "/dashboard/tanks", title: "Manage tanks", description: "Add, edit, and organize facility tanks.", icon: "layers" },
  { to: "/dashboard/water", title: "Water quality", description: "Review sensor readings and parameter thresholds.", icon: "waves" },
  { to: "/dashboard/feeding", title: "Feeding", description: "Manage dispense schedules and feed allocation.", icon: "utensils" },
  { to: "/dashboard/analytics", title: "Analytics", description: "Explore biomass distribution and shrimp growth trends.", icon: "chart-no-axes-combined" },
  { to: "/dashboard/alerts", title: "Alerts", description: "Review active warnings and recorded alert events.", icon: "bell-ring" },
  { to: "/dashboard/activity", title: "Activity log", description: "Browse facility scans and operational history.", icon: "clock" },
] as const;

export function Dashboard() {
  const { tanks, loading, error, isDbConnected, refreshTanks } = useTanks();

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

  return (
    <>
      <div className="dashboard-page-header mb-7 flex flex-wrap items-end justify-between gap-4 border-b border-[var(--ep-line)] pb-6">
        <div>
          <div className="ep-font-mono mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ep-primary)]">
            Facility workspace
          </div>
          <h1 className="ep-font-display text-[30px] font-semibold leading-tight tracking-[-0.02em] text-[var(--ep-text)]">
            Dashboard
          </h1>
          <p className="mt-2 text-sm text-[var(--ep-text-muted)]">
            Choose a workspace to manage operations or review facility performance.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-[var(--ep-line)] bg-[var(--ep-surface)] px-4 py-2 text-xs font-semibold text-[var(--ep-text)]">
          <span className={isDbConnected ? "h-2 w-2 rounded-full bg-[var(--ep-status-success)]" : "h-2 w-2 rounded-full bg-[var(--ep-status-warning)]"} />
          {isDbConnected ? "System connected" : "Using last available data"}
        </div>
      </div>

      <Panel title="Workspace" badge={`${tanks.length} tank${tanks.length === 1 ? "" : "s"} registered`}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {destinations.map((destination) => (
            <Link
              key={destination.to}
              to={destination.to}
              className="group flex min-h-32 flex-col rounded-xl border border-[var(--ep-line)] bg-[var(--ep-surface)] p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--ep-accent)] hover:bg-[var(--ep-accent-tint)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ep-primary)]"
            >
              <span className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--ep-accent-tint)] text-[var(--ep-primary)]" aria-hidden="true">
                <Icon name={destination.icon} size={18} strokeWidth={1.8} />
              </span>
              <span className="text-sm font-semibold text-[var(--ep-text)]">{destination.title}</span>
              <span className="mt-1 text-xs leading-relaxed text-[var(--ep-text-muted)]">{destination.description}</span>
            </Link>
          ))}
        </div>
        {tanks.length === 0 && (
          <div className="mt-4 rounded-xl border border-dashed border-[var(--ep-line)] bg-[var(--ep-bg)] p-4 text-sm text-[var(--ep-text-muted)]">
            Your facility has no tanks yet. Open <Link to="/dashboard/tanks" className="font-semibold text-[var(--ep-primary)] underline underline-offset-2">Manage tanks</Link> to add the first one.
          </div>
        )}
      </Panel>
    </>
  );
}
