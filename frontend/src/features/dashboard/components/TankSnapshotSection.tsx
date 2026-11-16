import { Link } from "@tanstack/react-router";
import { Icon } from "@/components/ui/Icon";
import { TankSnapshotCard } from "@/features/dashboard/components/TankSnapshotCard";
import type { Tank } from "@/features/dashboard/context/TankContext";
import type { ThresholdSettings } from "@/features/dashboard/lib/thresholds";

interface TankSnapshotSectionProps {
  tanks: Tank[];
  prioritizedTanks: Tank[];
  thresholdSettings: ThresholdSettings;
  noReadingCount: number;
}

export function TankSnapshotSection({
  tanks,
  prioritizedTanks,
  thresholdSettings,
  noReadingCount,
}: TankSnapshotSectionProps) {
  return (
    <section aria-labelledby="tank-snapshot-heading" className="mb-5">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 id="tank-snapshot-heading" className="ep-font-display text-lg font-semibold text-[var(--ep-text)]">Tank snapshot</h2>
        </div>
        <Link to="/dashboard/tanks" className="inline-flex min-h-10 items-center gap-1 rounded-lg px-3 text-xs font-semibold text-[var(--ep-accent)] transition-colors hover:bg-[var(--ep-accent-tint)]">
          Manage tanks <Icon name="arrow-up-right" size={14} />
        </Link>
      </div>
      {tanks.length ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 2xl:grid-cols-3">
          {prioritizedTanks.slice(0, 6).map((tank) => (
            <TankSnapshotCard key={tank.id} tank={tank} thresholdSettings={thresholdSettings} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-[var(--ep-line)] bg-[var(--ep-surface)] p-6 text-center">
          <Icon name="layers" size={24} className="mx-auto mb-2 text-[var(--ep-text-muted)]" />
          <p className="text-sm font-semibold text-[var(--ep-text)]">No tanks yet</p>
          <p className="mt-1 text-xs text-[var(--ep-text-muted)]">Create your first tank.</p>
          <Link to="/dashboard/tanks" className="mt-3 inline-flex min-h-10 items-center rounded-lg bg-[var(--ep-accent)] px-4 text-xs font-semibold text-white">Add a tank</Link>
        </div>
      )}
      {tanks.length > 6 && <p className="mt-2 text-right text-xs text-[var(--ep-text-muted)]">Showing 6 of {tanks.length} · priority order.</p>}
      {noReadingCount > 0 && <p className="mt-3 rounded-xl border border-[var(--ep-line)] bg-[var(--ep-bg)] px-3 py-2 text-xs leading-relaxed text-[var(--ep-text-muted)]"><span className="font-semibold text-[var(--ep-text)]">{noReadingCount} {noReadingCount === 1 ? "tank has" : "tanks have"} no water readings.</span> Missing readings count as needing attention.</p>}
    </section>
  );
}
