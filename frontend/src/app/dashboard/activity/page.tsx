import { Panel } from "@/features/dashboard/components/DashboardPrimitives";

const activityItems = [
  { action: "Dashboard session opened", detail: "Facility overview loaded", time: "Just now", tone: "coral" },
  { action: "Sensor ranges reviewed", detail: "Water-quality thresholds checked", time: "Today · 09:42", tone: "green" },
  { action: "Alerts reviewed", detail: "Recent tank notifications opened", time: "Yesterday · 16:18", tone: "blue" },
  { action: "Feed schedule checked", detail: "Daily feeding plan viewed", time: "Yesterday · 08:05", tone: "amber" },
];

export default function ActivityPage() {
  return (
    <>
      <div className="mb-7 border-b border-[rgba(11,46,51,0.12)] pb-7">
        <div className="mb-2 ep-font-mono text-xs font-semibold uppercase tracking-[0.14em] text-[var(--mangrove-text)]">
          Facility history
        </div>
        <h1 className="ep-font-display text-[30px] font-semibold leading-tight tracking-[-0.02em] text-[var(--water-deep)]">
          Activity Log
        </h1>
        <p className="mt-2 text-[15px] text-[rgba(11,35,32,0.68)]">
          A simple record of recent dashboard actions and reviews.
        </p>
      </div>

      <Panel title="Recent activity" badge={`${activityItems.length} entries`} icon="clock">
        <div className="divide-y divide-[var(--sand-dim)]">
          {activityItems.map((item) => (
            <div key={`${item.action}-${item.time}`} className="flex items-start gap-4 py-4 first:pt-0 last:pb-0">
              <span className={`mt-1.5 h-3 w-3 shrink-0 rounded-full ${
                item.tone === "coral"
                  ? "bg-[var(--coral)]"
                  : item.tone === "green"
                    ? "bg-[var(--mangrove)]"
                    : item.tone === "amber"
                      ? "bg-[var(--amber)]"
                      : "bg-[#4b8db8]"
              }`} aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <div className="text-base font-semibold text-[var(--water-deep)]">{item.action}</div>
                <div className="mt-1 text-sm text-[rgba(11,35,32,0.68)]">{item.detail}</div>
              </div>
              <time className="shrink-0 text-sm text-[rgba(11,35,32,0.55)]">{item.time}</time>
            </div>
          ))}
        </div>
      </Panel>
    </>
  );
}
