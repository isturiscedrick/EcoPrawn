import { Icon } from "@/components/ui/Icon";
import { useTanks } from "@/features/dashboard/context/TankContext";

export function DashboardDataStatus() {
  const { isDbConnected, lastUpdatedAt, error, refreshTanks, isRefreshing } = useTanks();

  return (
    <section aria-label="Dashboard data status" className="mb-5 flex flex-col gap-3 rounded-2xl border border-[var(--ep-line)] bg-[var(--ep-surface)] p-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
      <div className="flex min-w-0 items-start gap-3">
        <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${isDbConnected ? "bg-[var(--ep-status-success)]" : "bg-[var(--ep-status-warning)]"}`} aria-hidden="true" />
        <div className="min-w-0">
          <p className="text-xs font-semibold text-[var(--ep-text)]">
            {isDbConnected ? "Server connection available" : "Server connection unavailable"}
          </p>
          <p className="mt-1 text-[11px] leading-relaxed text-[var(--ep-text-muted)]">
            {lastUpdatedAt
              ? `Last successful update: ${lastUpdatedAt.toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}`
              : "Waiting for the first successful data update."}
          </p>
          {error && (
            <p role="status" className="mt-1 text-[11px] leading-relaxed text-[var(--ep-status-warning)]">
              {lastUpdatedAt
                ? "The latest refresh failed. Previously loaded data is still displayed."
                : "Dashboard data could not be loaded. Check the server connection and try again."}
              {" "}{error}
            </p>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={() => void refreshTanks()}
        disabled={isRefreshing}
        aria-busy={isRefreshing}
        className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-[var(--ep-line)] bg-[var(--ep-bg)] px-4 text-xs font-semibold text-[var(--ep-text)] transition-colors hover:border-[var(--ep-accent)] hover:bg-[var(--ep-accent-tint)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ep-accent)] disabled:cursor-wait disabled:opacity-60"
      >
        <Icon name="repeat" size={14} />
        {isRefreshing ? "Refreshing…" : "Refresh data"}
      </button>
    </section>
  );
}
