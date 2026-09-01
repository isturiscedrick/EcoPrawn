interface PanelProps {
  title: string;
  badge?: string;
  children: React.ReactNode;
}

export function Panel({ title, badge, children }: PanelProps) {
  return (
    <div className="bg-white border border-[var(--sand-dim)] rounded-[14px] p-[22px_24px] shadow-[0_1px_2px_rgba(11,35,32,0.04)]">
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
  return (
    <div className="bg-white border border-[var(--sand-dim)] rounded-[14px] p-5 px-[22px] shadow-[0_1px_2px_rgba(11,35,32,0.04)] transition-shadow hover:shadow-[0_8px_20px_-12px_rgba(11,35,32,0.18)]">
      <div className="ep-font-mono text-[11px] uppercase tracking-wide text-[rgba(11,35,32,0.48)] mb-2.5">
        {label}
      </div>
      <div className="ep-font-display text-[28px] font-semibold text-[var(--water-deep)]">
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