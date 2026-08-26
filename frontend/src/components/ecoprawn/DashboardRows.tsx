import type { AlertItem, TankStatus } from "./data";

export function TankRow({ name, pl, biomass, status }: TankStatus) {
  return (
    <div className="flex items-center justify-between p-3.5 border border-[var(--sand-dim)] rounded-[10px]">
      <div className="flex items-center gap-3">
        <span
          className={`w-[9px] h-[9px] rounded-full ${
            status === "ok" ? "bg-[var(--mangrove)]" : "bg-[var(--amber)]"
          }`}
        />
        <div>
          <div className="text-[13.5px] font-semibold text-[var(--water-deep)]">{name}</div>
          <div className="ep-font-mono text-[11.5px] text-[rgba(11,35,32,0.5)]">
            {pl} &middot; {status === "ok" ? "stable" : "DO watch"}
          </div>
        </div>
      </div>
      <div className="text-right">
        <div className="ep-font-mono text-[13.5px] font-semibold text-[var(--water-deep)]">
          {biomass}
        </div>
      </div>
    </div>
  );
}

export function AlertRow({ icon, title, detail, time }: AlertItem) {
  return (
    <div className="flex gap-3 py-3 border-t border-[var(--sand-dim)] first:border-t-0 first:pt-0">
      <div
        className={`w-[26px] h-[26px] rounded-[7px] flex items-center justify-center text-xs flex-shrink-0 ${
          icon === "warn"
            ? "bg-[rgba(232,162,58,0.16)] text-[var(--amber)]"
            : "bg-[rgba(60,122,92,0.14)] text-[var(--mangrove)]"
        }`}
      >
        {icon === "warn" ? "!" : "✓"}
      </div>
      <div className="min-w-0">
        <b className="text-[13px] text-[var(--water-deep)] block mb-0.5">{title}</b>
        <span className="text-xs text-[rgba(11,35,32,0.55)]">{detail}</span>
      </div>
      <div className="ep-font-mono text-[10.5px] text-[rgba(11,35,32,0.4)] ml-auto whitespace-nowrap self-center">
        {time}
      </div>
    </div>
  );
}