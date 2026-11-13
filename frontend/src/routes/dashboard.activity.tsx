import { createFileRoute } from "@tanstack/react-router";
import { Panel } from "@/features/dashboard/components/DashboardPrimitives";
import { DashboardViewSkeleton } from "@/features/dashboard/components/DashboardStates";
import { useTanks } from "@/features/dashboard/context/TankContext";

function ActivityPage() {
  const { loading, error, isDbConnected, refreshTanks, visionScanLog, effluentLog, alertsLog } = useTanks();
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
    ...alertsLog.map((alert, index) => ({
      key: `alert-${index}-${alert.time}`, action: alert.title, detail: alert.detail,
      time: alert.time, color: alert.icon === "warn" ? "bg-[var(--coral)]" : "bg-[#4b8db8]",
    })),
  ].sort((a, b) => Date.parse(b.time) - Date.parse(a.time));

  return (
    <>
      <div className="dashboard-page-header mb-7 border-b border-[rgba(11,46,51,0.12)] pb-7">
        <div className="mb-2 ep-font-mono text-xs font-semibold uppercase tracking-[0.14em] text-[var(--mangrove-text)]">Facility history</div>
        <h1 className="ep-font-display text-[30px] font-semibold leading-tight tracking-[-0.02em] text-[var(--water-deep)]">Activity Log</h1>
        <p className="mt-2 text-[15px] text-[rgba(11,35,32,0.68)]">Recent alerts, vision scans, and effluent records.</p>
      </div>
      <Panel title="Recent activity" badge={`${items.length} entries`} icon="clock">
        {!isDbConnected && error && (
          <div role="alert" className="mb-4 text-sm text-[var(--water-deep)]">
            <p>Could not refresh activity. {items.length > 0 ? "Showing the last loaded records." : "Please try again."}</p>
            <button type="button" onClick={() => void refreshTanks()} className="mt-2 font-semibold text-[var(--ep-accent)] underline">Retry</button>
          </div>
        )}
        {items.length === 0 && isDbConnected ? (
          <p className="text-sm text-[rgba(11,35,32,0.68)]">No activity recorded yet.</p>
        ) : (
          <div className="divide-y divide-[var(--sand-dim)]">
            {items.map((item) => (
              <div key={item.key} className="flex items-start gap-4 py-4 first:pt-0 last:pb-0">
                <span className={`mt-1.5 h-3 w-3 shrink-0 rounded-full ${item.color}`} aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <div className="text-base font-semibold text-[var(--water-deep)]">{item.action}</div>
                  <div className="mt-1 text-sm text-[rgba(11,35,32,0.68)]">{item.detail}</div>
                </div>
                <time dateTime={item.time} className="shrink-0 text-sm text-[rgba(11,35,32,0.55)]">{new Date(item.time).toLocaleString()}</time>
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
