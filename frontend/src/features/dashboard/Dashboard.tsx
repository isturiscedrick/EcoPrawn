import { SensorGauge } from "@/components/SensorGauge";
import { TankRow, AlertRow } from "@/components/DashboardRows";
import { TrendChart } from "@/components/TrendChart";
import { sensorGauges, tanks, alerts, visionMetrics } from "@/data/ecoprawn";

export function Dashboard() {
  return (
    <>
      {/* PAGE HEADER */}
      <div className="flex justify-between items-start mb-7 flex-wrap gap-4 pb-6 border-b border-[var(--sand-dim)]">
        <div>
          <div className="ep-font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--mangrove)] mb-2">
            Facility Overview
          </div>
          <h1 className="ep-font-display text-[28px] font-semibold text-[var(--water-deep)] leading-tight">
            Tank Overview
          </h1>
          <div className="text-[13px] text-[rgba(11,35,32,0.55)] mt-1.5">
            Indoor grow-out facility · 6 tanks · <em className="not-italic text-[rgba(11,35,32,0.7)]">Penaeus vannamei</em>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="inline-flex items-center gap-2 bg-white border border-[var(--sand-dim)] px-4 py-[9px] rounded-full text-[12.5px] font-semibold text-[var(--water-deep)] shadow-[0_2px_8px_-4px_rgba(11,35,32,0.12)]">
            <span className="ep-pulse-dot w-[7px] h-[7px] rounded-full bg-[var(--mangrove)]" />
            All systems nominal
          </div>
          <button
            type="button"
            className="ep-font-mono inline-flex items-center gap-1.5 rounded-full border border-[var(--sand-dim)] bg-white px-4 py-[9px] text-[11px] font-semibold text-[var(--water-deep)] transition-colors hover:border-[var(--mangrove-light)] hover:text-[var(--mangrove)]"
          >
            ⟳ Refresh
          </button>
        </div>
      </div>

      {/* KPI ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <KpiCard
          label="Avg. Dissolved O₂"
          value="6.2"
          unit="mg/L"
          delta="▲ within target range"
          deltaTone="ok"
        />
        <KpiCard
          label="Est. Biomass"
          value="184"
          unit="kg"
          delta="▲ 3.1% vs last week"
          deltaTone="ok"
        />
        <KpiCard
          label="Feed Conversion Ratio"
          value="1.38"
          unit="FCR"
          delta="▲ improved from 1.46"
          deltaTone="ok"
        />
        <KpiCard
          label="Active Alerts"
          value="1"
          unit="open"
          delta="Tank 4 — DO trending down"
          deltaTone="warn"
        />
      </div>

      {/* SENSOR + ALERTS */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4 mb-4">
        <Panel
          title="Live Sensor Array — Tank 1"
          badge="updated 8s ago"
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {sensorGauges.map((s) => (
              <SensorGauge key={s.label} {...s} />
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-[var(--sand-dim)]">
            <TrendChart />
            <div className="flex gap-5 mt-2.5 text-[11.5px] text-[rgba(11,35,32,0.55)] ep-font-mono">
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-[2px] bg-[var(--mangrove)]" /> DO (mg/L)
              </span>
              <span className="flex items-center gap-1.5 text-[var(--coral)]">
                <span className="inline-block w-3 h-[2px] bg-[var(--coral)]" style={{ borderTop: "2px dashed var(--coral)" }} />
                Temp (°C, scaled)
              </span>
            </div>
          </div>
        </Panel>

        <Panel title="Recent Alerts" badge="3 events">
          <div>
            {alerts.map((a) => (
              <AlertRow key={a.title} {...a} />
            ))}
          </div>
        </Panel>
      </div>

      {/* TANK STATUS + FEED */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-4 mb-4">
        <Panel title="Tank Status" badge="6 tanks">
          <div className="flex flex-col gap-2.5">
            {tanks.map((t) => (
              <TankRow key={t.name} {...t} />
            ))}
          </div>
        </Panel>

        <Panel title="Feed Dispensed Today" badge="biomass-adjusted">
          <div className="ep-font-mono text-[26px] font-semibold text-[var(--water-deep)]">
            7.4{" "}
            <span className="text-sm font-medium text-[rgba(11,35,32,0.5)]">
              kg / 9.0 kg target
            </span>
          </div>
          <div className="bg-[var(--sand-dim)] rounded-full h-2 overflow-hidden mt-3">
            <div
              className="bg-gradient-to-r from-[var(--coral)] to-[var(--amber)] h-full rounded-full transition-all"
              style={{ width: "82%" }}
            />
          </div>
          <div className="grid grid-cols-2 gap-3 mt-5 pt-4 border-t border-[var(--sand-dim)]">
            <div>
              <div className="ep-font-mono text-[9.5px] uppercase tracking-wide text-[rgba(11,35,32,0.45)] mb-1">
                Next dispense
              </div>
              <div className="text-[14px] font-semibold text-[var(--water-deep)]">18:00</div>
            </div>
            <div>
              <div className="ep-font-mono text-[9.5px] uppercase tracking-wide text-[rgba(11,35,32,0.45)] mb-1">
                FCR this cycle
              </div>
              <div className="text-[14px] font-semibold text-[var(--mangrove)]">1.38 <span className="text-[11px] font-normal text-[rgba(11,35,32,0.5)]">(target ≤ 1.5)</span></div>
            </div>
          </div>
        </Panel>
      </div>

      {/* VISION */}
      <Panel title="AI Vision — Growth Analytics" badge="last scan · 22 min ago">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {visionMetrics.map((m) => (
            <div
              key={m.label}
              className="rounded-[10px] p-3.5 text-[var(--sand)] transition-transform hover:-translate-y-0.5"
              style={{
                background: "linear-gradient(160deg, var(--water-deep), var(--water-mid))",
              }}
            >
              <div className="ep-font-mono text-[10px] uppercase text-[rgba(242,235,221,0.55)] mb-1.5">
                {m.label}
              </div>
              <div className="ep-font-display text-xl font-semibold">{m.value}</div>
            </div>
          ))}
        </div>
      </Panel>
    </>
  );
}

/* ---------- local layout primitives ---------- */

interface PanelProps {
  title: string;
  badge?: string;
  children: React.ReactNode;
}

function Panel({ title, badge, children }: PanelProps) {
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

function KpiCard({ label, value, unit, delta, deltaTone }: KpiCardProps) {
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
