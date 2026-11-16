import { Icon } from "@/components/ui/Icon";
import { Panel } from "@/features/dashboard/components/DashboardPrimitives";
import type { RecentDashboardActivity } from "@/features/dashboard/lib/dashboard-activity";

interface RecentActivityPanelProps {
  activities: RecentDashboardActivity[];
}

export function RecentActivityPanel({ activities }: RecentActivityPanelProps) {
  return (
    <section className="mb-5" aria-label="Recent facility activity">
      <Panel title="Recent facility activity" icon="clock" badge={activities.length ? `Latest ${activities.length}` : "No activity"}>
        {activities.length ? (
          <ol className="divide-y divide-[var(--ep-line)]">
            {activities.map((activity) => (
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
            <p className="mt-1 text-xs text-[var(--ep-text-muted)]">New readings and scans appear here.</p>
          </div>
        )}
      </Panel>
    </section>
  );
}
