import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Panel } from "@/features/dashboard/components/DashboardPrimitives";
import { DashboardPageHeader } from "@/features/dashboard/components/DashboardPageHeader";
import { DashboardViewSkeleton } from "@/features/dashboard/components/DashboardStates";
import { useTanks } from "@/features/dashboard/context/TankContext";
import { readAuditEvents, type AuditLogEntry } from "@/features/dashboard/lib/audit-log";

type ActivityItem = {
  key: string;
  entity: "User" | "System";
  action: string;
  target: string;
  detail: string;
  time: string;
};

function ActivityPage() {
  const { loading, error, isDbConnected, visionScanLog, effluentLog } = useTanks();
  const [auditEvents, setAuditEvents] = useState<AuditLogEntry[]>([]);
  const [filter, setFilter] = useState<"all" | "User" | "System">("all");

  useEffect(() => {
    const refresh = () => setAuditEvents(readAuditEvents());
    refresh();
    window.addEventListener("storage", refresh);
    window.addEventListener("ecoprawn:audit-updated", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("ecoprawn:audit-updated", refresh);
    };
  }, []);

  const items = useMemo<ActivityItem[]>(() => [
    ...auditEvents.filter((event) => event.entity !== "Tank").map(event => ({
      key: event.id, entity: event.entity, action: event.action,
      target: event.target, detail: `${event.actor} · ${event.details}`, time: event.time,
    })),
    ...visionScanLog.map(scan => ({
      key: `scan-${scan.id}`, entity: "System" as const, action: "Vision scan recorded",
      target: scan.tank, detail: scan.note, time: scan.time,
    })),
    ...effluentLog.map(log => ({
      key: `effluent-${log.id}`, entity: "System" as const, action: log.event,
      target: "Effluent monitoring", detail: log.detail, time: log.time,
    })),
  ].sort((a, b) => Date.parse(b.time) - Date.parse(a.time)), [auditEvents, visionScanLog, effluentLog]);

  const visibleItems = filter === "all"
    ? items
    : items.filter((item) => item.entity === filter);

  if (loading) return <DashboardViewSkeleton variant="activity" />;

  return (
    <>
      <DashboardPageHeader
        eyebrow="Facility history"
        title="Activity Log"
        description="User actions and monitoring events."
      />

      <Panel title="Activity history" badge={`${visibleItems.length} entries`} icon="clock">
        {!isDbConnected && error && (
          <div role="status" className="mb-4 text-sm text-[var(--ep-text-muted)]">
            {items.length > 0 ? "Showing saved activity. Server monitoring records may be unavailable." : "Server activity data is unavailable."}
          </div>
        )}
        <div className="mb-5 flex flex-wrap gap-2" role="group" aria-label="Filter activity by entity">
          {(["all", "User", "System"] as const).map(value => (
            <button key={value} type="button" onClick={() => setFilter(value)} className={`min-h-9 rounded-full border px-3.5 text-xs font-semibold transition-colors ${filter === value ? "border-[var(--ep-primary)] bg-[var(--ep-accent-tint)] text-[var(--ep-primary)]" : "border-[var(--ep-line)] bg-[var(--ep-surface)] text-[var(--ep-text-muted)] hover:text-[var(--ep-text)]"}`}>
              {value === "all" ? "All activity" : value}
            </button>
          ))}
        </div>

        {visibleItems.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[var(--ep-line)] px-5 py-12 text-center">
            <p className="text-sm font-semibold text-[var(--ep-text)]">No activity recorded yet</p>
            <p className="mt-1 text-xs text-[var(--ep-text-muted)]">User and monitoring events will appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--ep-line)]">
            {visibleItems.map(item => (
              <div key={item.key} className="flex flex-col gap-2 py-4 first:pt-0 sm:flex-row sm:items-start sm:gap-4">
                <span className={`inline-flex w-fit shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${item.entity === "User" ? "bg-sky-500/10 text-sky-600 dark:text-sky-300" : "bg-[var(--ep-tint)] text-[var(--ep-text-muted)]"}`}>{item.entity}</span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-[var(--ep-text)]">{item.action}</div>
                  <div className="mt-0.5 text-xs font-medium text-[var(--ep-text-muted)]">{item.target}</div>
                  <div className="mt-1 break-words text-sm text-[var(--ep-text-muted)]">{item.detail}</div>
                </div>
                <time dateTime={item.time} className="shrink-0 text-xs text-[var(--ep-text-muted)]">{new Date(item.time).toLocaleString()}</time>
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
