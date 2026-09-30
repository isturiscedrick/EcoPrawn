"use client";

import { useEffect, useRef, useState } from "react";

interface PanelProps {
  title: string;
  badge?: string;
  children: React.ReactNode;
}

export function Panel({ title, badge, children }: PanelProps) {
  return (
    <div className="bg-white border border-[var(--sand-dim)] rounded-[var(--radius-card)] p-[22px_24px] shadow-[var(--shadow-sm)]">
      <div className="flex justify-between items-center mb-[18px] gap-3">
        <h3 className="ep-font-display text-base font-semibold text-[var(--water-deep)]">
          {title}
        </h3>
        {badge && (
          <span className="ep-font-mono text-[10.5px] text-[var(--mangrove)] bg-[rgba(60,122,92,0.1)] px-[9px] py-1 rounded-full whitespace-nowrap">
            {badge}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

interface KpiCardProps {
  label: string;
  value: string;
  unit: string;
  delta: string;
  deltaTone: "ok" | "warn";
}

export function KpiCard({ label, value, unit, delta, deltaTone }: KpiCardProps) {
  // Flashes the value coral for a beat when it changes (tank added/removed,
  // readings updated) instead of snapping silently — the only motion this
  // card needs; no count-up animation, that'd be more motion than the data
  // warrants.
  const [flash, setFlash] = useState(false);
  const prevValue = useRef(value);

  useEffect(() => {
    if (prevValue.current === value) return;
    prevValue.current = value;
    setFlash(true);
    const t = setTimeout(() => setFlash(false), 600);
    return () => clearTimeout(t);
  }, [value]);

  return (
    <div className="bg-white border border-[var(--sand-dim)] rounded-[var(--radius-card)] p-5 px-[22px] shadow-[var(--shadow-sm)] transition-shadow hover:shadow-[var(--shadow-md)]">
      <div className="ep-font-mono text-[11px] uppercase tracking-wide text-[rgba(11,35,32,0.48)] mb-2.5">
        {label}
      </div>
      <div
        className={`ep-font-display text-[28px] font-semibold transition-colors duration-500 ${
          flash ? "text-[var(--coral)]" : "text-[var(--water-deep)]"
        }`}
      >
        {value}
        <span className="text-sm font-medium text-[rgba(11,35,32,0.5)] ml-[3px]">{unit}</span>
      </div>
      <div
        className={`text-xs mt-2 font-semibold ${
          deltaTone === "ok" ? "text-[var(--mangrove)]" : "text-[var(--amber)]"
        }`}
      >
        {delta}
      </div>
    </div>
  );
}