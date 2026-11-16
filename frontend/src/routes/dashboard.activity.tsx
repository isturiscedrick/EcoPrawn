import { createFileRoute } from "@tanstack/react-router";
import { Panel } from "@/features/dashboard/components/DashboardPrimitives";
import { DonutChart } from "@/features/dashboard/components/AnalyticsCharts";
import { DashboardViewSkeleton } from "@/features/dashboard/components/DashboardStates";
import { useTanks } from "@/features/dashboard/context/TankContext";

function ActivityPage() {
  const { loading, error, isDbConnected, visionScanLog, effluentLog } = useTanks();
  if (loading) return <DashboardViewSkeleton variant="activity" />;

  const items = [
    ...visionScanLog.map((scan) => ({
      key: `scan-${scan.id}`, action: "Vision scan recorded", detail: `${scan.tank}: ${scan.note}`,
      time: scan.time, color: "bg-[var(--mangrove)]",
    })),
    ...effluentLog.map((log) => ({
      key: `effluent-${log.id}`, action: log.event, detail: log.detail,
      time: log.time, color: "bg-[var(--amber)]",
    })),
  ].sort((a, b) => Date.parse(b.time) - Date.parse(a.time));

  return (
    <>
      <div className="dashboard-page-header mb-7 border-b border-[var(--ep-line)] pb-7">
        <div className="mb-2 ep-font-mono text-xs font-semibold uppercase tracking-[0.14em] text-[var(--mangrove-text)]">Facility history</div>
        <h1 className="ep-font-display text-[30px] font-semibold leading-tight tracking-[-0.02em] text-[var(--water-deep)]">Activity Log</h1>
        <p className="mt-2 text-[15px] text-[var(--ep-text-muted)]">Vision scans and effluent records.</p>
      </div>
      <div className="mb-5">
        <Panel title="Activity composition" badge="recorded events">
          <DonutChart items={[
            { label: "Vision scans", value: visionScanLog.length, color: "var(--ep-status-info)" },
            { label: "Effluent events", value: effluentLog.length, color: "var(--ep-status-warning)" },
          ]} unit="events" emptyLabel="No activity yet." />
        </Panel>
      </div>
      <Panel title="Recent activity" badge={`${items.length} entries`} icon="clock">
        {!isDbConnected && error && (
          <div role="alert" className="mb-4 text-sm text-[var(--water-deep)]">
            <p>{items.length > 0 ? "Showing saved records. Pull down to refresh." : "Activity data is unavailable. Pull down to try again."}</p>
          </div>
        )}
        {items.length === 0 && isDbConnected ? (
          <p className="text-sm text-[var(--ep-text-muted)]">No activity recorded yet.</p>
        ) : (
          <div className="divide-y divide-[var(--sand-dim)]">
            {items.map((item) => (
              <div key={item.key} className="flex items-start gap-4 py-4 first:pt-0 last:pb-0">
                <span className={`mt-1.5 h-3 w-3 shrink-0 rounded-full ${item.color}`} aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <div className="text-base font-semibold text-[var(--water-deep)]">{item.action}</div>
                  <div className="mt-1 text-sm text-[var(--ep-text-muted)]">{item.detail}</div>
                </div>
                <time dateTime={item.time} className="shrink-0 text-sm text-[var(--ep-text-muted)]">{new Date(item.time).toLocaleString()}</time>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </>
  );
}

export const Route = createFileRoute("/dashboard/activity")({
  pendingComponent: () => <DashboardViewSkeleton variant="activity" />,
  component: ActivityPage,
});
