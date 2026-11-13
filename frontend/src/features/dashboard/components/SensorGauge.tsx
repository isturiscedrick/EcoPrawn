import type { SensorReading } from "@/types";

type SensorGaugeProps = Omit<SensorReading, "pct"> & { pct: number | null; statusLabel?: string; note?: string };

export function SensorGauge({ label, value, pct, status, statusLabel, note }: SensorGaugeProps) {
  const circumference = 2 * Math.PI * 26;
  const clampedPct = Math.max(0, Math.min(100, pct ?? 0));
  const dashLength = circumference * (clampedPct / 100);
  const color = status === "ok" ? "var(--ep-status-success)" : "var(--ep-status-warning)";

  return (
    <div className="dashboard-sensor-gauge border border-[var(--sand-dim)] rounded-[10px] p-3.5 text-center">
      <div className="ep-font-mono text-[10px] uppercase tracking-wide text-[rgba(11,35,32,0.5)] mb-2">
        {label}
      </div>
      <div
        className="dashboard-sensor-gauge-meter mx-auto mb-1.5"
        role="progressbar"
        aria-label={`${label} level`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={clampedPct}
        aria-valuetext={`${value}, ${statusLabel ?? (status === "ok" ? "Nominal" : "Watch")}`}
      >
        <svg viewBox="0 0 64 64" aria-hidden="true" className="w-16 h-16">
          <circle cx="32" cy="32" r="26" fill="none" stroke="var(--ep-line)" strokeWidth="6" />
          <circle
            cx="32"
            cy="32"
            r="26"
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeDasharray={`${dashLength} ${circumference - dashLength}`}
            strokeDashoffset={0}
            strokeLinecap="round"
            transform="rotate(-90 32 32)"
          />
        </svg>
      </div>
      <div className="ep-font-mono font-semibold text-[15px] text-[var(--water-deep)]">
        {value}
      </div>
      <div
        className={`text-[10px] mt-0.5 font-semibold ${
          status === "ok" ? "dashboard-status-text-success" : "dashboard-status-text-warning"
        }`}
      >
        {statusLabel ?? (status === "ok" ? "Nominal" : "Watch")}
      </div>
      {note ? <p className="mt-1 text-[10px] text-[rgba(11,35,32,0.6)]">{note}</p> : null}
    </div>
  );
}
