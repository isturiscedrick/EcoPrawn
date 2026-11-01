"use client";

import { useEffect, useRef, useState } from "react";
import { Icon, type IconName } from "@/components/ui/Icon";

interface PanelProps {
  title: string;
  badge?: string;
  onDetails?: () => void;
  icon?: IconName;
  children: React.ReactNode;
}

export function Panel({ title, badge, onDetails, icon = "layers", children }: PanelProps) {
  return (
    <div className="rounded-2xl border border-[rgba(11,46,51,0.12)] bg-white p-[22px_24px] shadow-[0_8px_24px_-18px_rgba(11,46,51,0.38)]">
      <div className="mb-[18px] flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 ep-font-display text-[18px] font-semibold text-[var(--water-deep)]">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[rgba(232,98,58,0.12)] text-[var(--coral)]">
            <Icon name={icon} size={15} />
          </span>
          <span>{title}</span>
        </h3>
        <div className="flex items-center gap-2">
          {onDetails && (
            <button type="button" onClick={onDetails} className="min-h-11 rounded-md px-2 text-sm font-semibold text-[var(--ep-accent)] hover:bg-[rgba(232,98,58,0.08)] hover:text-[var(--ep-accent-hover)]">
              Details
            </button>
          )}
          {badge && (
            <span className="ep-font-mono text-xs font-medium text-[var(--mangrove-text)] bg-[rgba(60,122,92,0.1)] px-3 py-1.5 rounded-full whitespace-nowrap">
              {badge}
            </span>
          )}
        </div>
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
  onDetails?: () => void;
}

export function KpiCard({ label, value, unit, delta, deltaTone, onDetails }: KpiCardProps) {
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
    <div className="group rounded-2xl border border-[rgba(11,46,51,0.12)] bg-white p-5 px-[22px] shadow-[0_8px_24px_-18px_rgba(11,46,51,0.38)] transition-all hover:-translate-y-0.5 hover:border-[var(--coral)] hover:shadow-[0_14px_28px_-18px_rgba(11,46,51,0.42)]">
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <div className="ep-font-mono text-xs font-medium uppercase tracking-wide text-[rgba(11,35,32,0.68)]">
          {label}
        </div>
        {onDetails && (
          <button type="button" onClick={onDetails} className="min-h-11 rounded-md px-2 text-sm font-semibold text-[var(--ep-accent)] opacity-0 transition-opacity hover:bg-[rgba(232,98,58,0.08)] group-hover:opacity-100 focus:opacity-100">
            Details
          </button>
        )}
      </div>
      <div
        className={`ep-font-display text-[28px] font-semibold transition-colors duration-500 ${
          flash ? "text-[var(--coral)]" : "text-[var(--water-deep)]"
        }`}
      >
        {value}
        <span className="text-base font-medium text-[rgba(11,35,32,0.68)] ml-[3px]">{unit}</span>
      </div>
      <div
        className={`text-sm mt-2 font-semibold ${
          deltaTone === "ok" ? "text-[var(--mangrove)]" : "text-[var(--amber-text)]"
        }`}
      >
        {delta}
      </div>
    </div>
  );
}