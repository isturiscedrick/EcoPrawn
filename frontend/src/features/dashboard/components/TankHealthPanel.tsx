import { Link } from "@tanstack/react-router";
import { Icon } from "@/components/ui/Icon";
import { Panel } from "@/features/dashboard/components/DashboardPrimitives";

interface TankHealthPanelProps {
  tankCount: number;
  healthyCount: number;
  attentionCount: number;
  healthyPercent: number;
  attentionPercent: number;
}

export function TankHealthPanel({
  tankCount,
  healthyCount,
  attentionCount,
  healthyPercent,
  attentionPercent,
}: TankHealthPanelProps) {
  return (
    <Panel title="Tank health" icon="activity" badge={tankCount ? `${tankCount} monitored` : "No tanks"}>
      {tankCount ? (
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
          <p className="text-sm font-semibold text-[var(--ep-text)]">Facility health unavailable</p>
          <p className="mt-1 text-xs text-[var(--ep-text-muted)]">Add a tank to view its status.</p>
          <Link to="/dashboard/tanks" className="mt-3 inline-flex min-h-9 items-center rounded-lg bg-[var(--ep-accent)] px-4 text-xs font-semibold text-white">Set up tanks</Link>
        </div>
      )}
    </Panel>
  );
}
