import { Link } from "@tanstack/react-router";
import { Icon } from "@/components/ui/Icon";
import type { Tank } from "@/features/dashboard/context/TankContext";
import { rangeStatus, type ThresholdSettings } from "@/features/dashboard/lib/thresholds";

interface TankSnapshotCardProps {
  tank: Tank;
  thresholdSettings: ThresholdSettings;
}

export function TankSnapshotCard({ tank, thresholdSettings }: TankSnapshotCardProps) {
  const readings = [
    { label: "DO", unit: "mg/L", value: tank.dissolvedOxygen, status: rangeStatus(tank.dissolvedOxygen, thresholdSettings.dissolvedOxygen.min) },
    { label: "pH", unit: "", value: tank.ph, status: rangeStatus(tank.ph, thresholdSettings.ph.min, thresholdSettings.ph.max) },
    { label: "Temp", unit: "°C", value: tank.temperature, status: rangeStatus(tank.temperature, thresholdSettings.temperature.min, thresholdSettings.temperature.max) },
    { label: "Salinity", unit: "ppt", value: tank.salinity, status: rangeStatus(tank.salinity, thresholdSettings.salinity.min, thresholdSettings.salinity.max) },
    { label: "Water level", unit: "%", value: tank.waterLevel, status: rangeStatus(tank.waterLevel, thresholdSettings.waterLevel.min) },
  ];
  const warningLabels = tank.hasWaterReadings
    ? readings.filter((reading) => reading.status === "warn").map((reading) => reading.label)
    : [];
  const warningCount = warningLabels.length;

  const displayId = `#${tank.id.replace(/^tank-?/i, "").padStart(2, "0") || tank.id}`;

  return (
    <Link
      to="/dashboard/water"
      onClick={() => window.sessionStorage.setItem("ecoprawn.dashboard.selected-tank", tank.id)}
      className="dashboard-tank-snapshot group min-w-0 rounded-2xl border border-[var(--ep-line)] bg-[var(--ep-surface)] p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--ep-accent)] hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ep-accent)]"
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--ep-accent-tint)] text-[var(--ep-accent)] shadow-2xs">
            <Icon name="layers" size={18} />
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="inline-flex items-center rounded-md border border-[var(--ep-accent)]/30 bg-[var(--ep-accent-tint)]/70 px-1.5 py-0.5 font-mono text-[10px] font-bold text-[var(--ep-primary)] shadow-2xs">
                {displayId}
              </span>
              <span className="truncate text-sm font-semibold text-[var(--ep-text)]">{tank.name}</span>
            </div>
            <span className="block truncate text-[11px] text-[var(--ep-text-muted)]">PL batch: {tank.pl}</span>
          </div>
        </div>
        <span className={!tank.hasWaterReadings ? "dashboard-status-badge" : warningCount ? "dashboard-status-badge dashboard-status-warning" : "dashboard-status-badge dashboard-status-success"}>
          {!tank.hasWaterReadings ? "No readings" : warningCount ? `${warningCount} to check` : "Healthy"}
        </span>
      </div>

      {warningLabels.length > 0 && (
        <p className="mb-3 rounded-lg border border-[var(--ep-status-warning)]/25 bg-[var(--ep-status-warning)]/5 px-2.5 py-2 text-[11px] leading-relaxed text-[var(--ep-status-warning)]">
          <span className="font-semibold">Check:</span> {warningLabels.join(" · ")}
        </p>
      )}

      {tank.hasWaterReadings ? (
        <div className="grid grid-cols-2 gap-2 border-t border-[var(--ep-line)] pt-3 sm:grid-cols-3">
          {readings.map((reading) => (
            <div key={reading.label} className={`min-w-0 rounded-lg border p-2 ${reading.status === "warn" ? "border-[var(--ep-status-warning)]/35 bg-[var(--ep-status-warning)]/5" : "border-[var(--ep-line)] bg-[var(--ep-bg)]"}`}>
              <div className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-[var(--ep-text-muted)]">
                {reading.label}
                {reading.status === "warn" && <span className="h-1.5 w-1.5 rounded-full bg-[var(--ep-status-warning)]" aria-label="Outside configured range" />}
              </div>
              <div className={`mt-1 text-sm font-semibold tabular-nums ${reading.status === "warn" ? "text-[var(--ep-status-warning)]" : "text-[var(--ep-text)]"}`}>
                {reading.value.toFixed(1)}{reading.unit ? ` ${reading.unit}` : ""}
              </div>
              <div className="mt-0.5 text-[9px] text-[var(--ep-text-muted)]">{reading.status === "warn" ? "Check range" : "In range"}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="border-t border-[var(--ep-line)] pt-3">
          <p className="text-xs font-medium text-[var(--ep-text-muted)]">No readings yet</p>
        </div>
      )}

      <div className="mt-3 flex items-center justify-between border-t border-[var(--ep-line)]/50 pt-2 text-[11px]">
        <span className="font-mono text-[10px] text-[var(--ep-text-muted)]">ID: {tank.id}</span>
        <span className="flex items-center gap-1 font-semibold text-[var(--ep-accent)] group-hover:translate-x-0.5 transition-transform">
          View water quality <Icon name="arrow-right" size={12} />
        </span>
      </div>
    </Link>
  );
}
