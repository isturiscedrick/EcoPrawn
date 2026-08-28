import type { SensorReading } from "../types";

export function SensorGauge({ label, value, pct, status }: SensorReading) {
  const circumference = 2 * Math.PI * 26;
  const offset = circumference * (1 - pct / 100);
  const color = status === "ok" ? "#3C7A5C" : "#E8A23A";

  return (
    <div className="border border-[var(--sand-dim)] rounded-[10px] p-3.5 text-center">
      <div className="ep-font-mono text-[10px] uppercase tracking-wide text-[rgba(11,35,32,0.5)] mb-2">
        {label}
      </div>
      <svg viewBox="0 0 64 64" className="w-16 h-16 mx-auto mb-1.5">
        <circle cx="32" cy="32" r="26" fill="none" stroke="#E4DBC7" strokeWidth="6" />
        <circle
          cx="32"
          cy="32"
          r="26"
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 32 32)"
        />
      </svg>
      <div className="ep-font-mono font-semibold text-[15px] text-[var(--water-deep)]">
        {value}
      </div>
      <div
        className={`text-[10px] mt-0.5 font-semibold ${
          status === "ok" ? "text-[var(--mangrove)]" : "text-[var(--amber)]"
        }`}
      >
        {status === "ok" ? "Nominal" : "Watch"}
      </div>
    </div>
  );
}
