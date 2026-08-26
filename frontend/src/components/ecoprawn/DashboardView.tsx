import { BrandMark } from "./BrandMark";
import { SensorGauge } from "./SensorGauge";
import { TankRow, AlertRow } from "./DashboardRows";
import { TrendChart } from "./TrendChart";
import { sensorGauges, tanks, alerts, visionMetrics } from "./data";

const navItems = [
  { icon: "◧", label: "Overview", active: true },
  { icon: "≈", label: "Water Quality", active: false },
  { icon: "◎", label: "Vision & Growth", active: false },
  { icon: "▤", label: "Feeding", active: false },
  { icon: "⇌", label: "Biofloc Loop", active: false },
  { icon: "⚠", label: "Alerts", active: false },
];

export function DashboardView() {
  return (
    <div className="bg-[#F5F1E7] min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] min-h-screen">
        {/* SIDEBAR */}
        <aside className="bg-[var(--water-deep)] text-[var(--sand)] p-4 flex lg:flex-col flex-row items-center lg:items-stretch gap-1.5 overflow-x-auto">
          <div className="flex items-center gap-2.5 py-2 px-2.5 lg:pb-[26px]">
            <BrandMark size={24} />
            <span className="ep-font-display font-semibold text-base text-[var(--sand)] whitespace-nowrap">
              EcoPrawn
            </span>
          </div>
          {navItems.map((item) => (
            <div
              key={item.label}
              className={`flex items-center gap-2.5 py-2.5 px-3 rounded-lg text-[13.5px] font-medium whitespace-nowrap transition-all duration-200 ${
                item.active
                  ? "bg-[rgba(232,98,58,0.16)] text-[var(--coral)] font-semibold"
                  : "text-[rgba(242,235,221,0.62)] hover:bg-[rgba(242,235,221,0.06)] hover:text-[var(--sand)]"
              }`}
            >
              <span className="w-4 text-center text-sm">{item.icon}</span>
              {item.label}
            </div>
          ))}
          <div className="hidden lg:block mt-auto pt-3.5 px-3 text-[11.5px] text-[rgba(242,235,221,0.4)] ep-font-mono">
            EDGE NODE: mini-pc-01
            <br />
            UPTIME 41d 06h
          </div>
        </aside>

        {/* MAIN */}
        <main className="px-5 md:px-[34px] pt-7 pb-[60px]">
          <div className="flex justify-between items-start mb-[26px] flex-wrap gap-3.5">
            <div>
              <h1 className="ep-font-display text-[26px] font-semibold text-[var(--water-deep)]">
                Tank Overview
              </h1>
              <div className="text-[13px] text-[rgba(11,35,32,0.55)] mt-1">
                Indoor grow-out facility · 6 tanks · Penaeus vannamei
              </div>
            </div>
            <div className="inline-flex items-center gap-2 bg-white border border-[var(--sand-dim)] px-4 py-[9px] rounded-full text-[12.5px] font-semibold text-[var(--water-deep)]">
              <span className="ep-pulse-dot w-[7px] h-[7px] rounded-full bg-[var(--mangrove)]" />
              All systems nominal
            </div>
          </div>

          {/* KPI ROW */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-[22px]">
            <div className="bg-white border border-[var(--sand-dim)] rounded-[14px] p-5 px-[22px]">
              <div className="ep-font-mono text-[11px] uppercase tracking-wide text-[rgba(11,35,32,0.48)] mb-2.5">
                Avg. Dissolved O₂
              </div>
              <div className="ep-font-display text-[28px] font-semibold text-[var(--water-deep)]">
                6.2<span className="text-sm font-medium text-[rgba(11,35,32,0.5)] ml-[3px]">mg/L</span>
              </div>
              <div className="text-xs mt-2 font-semibold text-[var(--mangrove)]">
                ▲ within target range
              </div>
            </div>
            <div className="bg-white border border-[var(--sand-dim)] rounded-[14px] p-5 px-[22px]">
              <div className="ep-font-mono text-[11px] uppercase tracking-wide text-[rgba(11,35,32,0.48)] mb-2.5">
                Est. Biomass
              </div>
              <div className="ep-font-display text-[28px] font-semibold text-[var(--water-deep)]">
                184<span className="text-sm font-medium text-[rgba(11,35,32,0.5)] ml-[3px]">kg</span>
              </div>
              <div className="text-xs mt-2 font-semibold text-[var(--mangrove)]">
                ▲ 3.1% vs last week
              </div>
            </div>
            <div className="bg-white border border-[var(--sand-dim)] rounded-[14px] p-5 px-[22px]">
              <div className="ep-font-mono text-[11px] uppercase tracking-wide text-[rgba(11,35,32,0.48)] mb-2.5">
                Feed Conversion Ratio
              </div>
              <div className="ep-font-display text-[28px] font-semibold text-[var(--water-deep)]">
                1.38<span className="text-sm font-medium text-[rgba(11,35,32,0.5)] ml-[3px]">FCR</span>
              </div>
              <div className="text-xs mt-2 font-semibold text-[var(--mangrove)]">
                ▲ improved from 1.46
              </div>
            </div>
            <div className="bg-white border border-[var(--sand-dim)] rounded-[14px] p-5 px-[22px]">
              <div className="ep-font-mono text-[11px] uppercase tracking-wide text-[rgba(11,35,32,0.48)] mb-2.5">
                Active Alerts
              </div>
              <div className="ep-font-display text-[28px] font-semibold text-[var(--water-deep)]">
                1<span className="text-sm font-medium text-[rgba(11,35,32,0.5)] ml-[3px]">open</span>
              </div>
              <div className="text-xs mt-2 font-semibold text-[var(--amber)]">
                Tank 4 — DO trending down
              </div>
            </div>
          </div>

          {/* SENSOR + ALERTS */}
          <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4 mb-4">
            <div className="bg-white border border-[var(--sand-dim)] rounded-[14px] p-[22px_24px]">
              <div className="flex justify-between items-center mb-[18px]">
                <h3 className="ep-font-display text-base font-semibold text-[var(--water-deep)]">
                  Live Sensor Array — Tank 1
                </h3>
                <span className="ep-font-mono text-[10.5px] text-[var(--mangrove)] bg-[rgba(60,122,92,0.1)] px-[9px] py-1 rounded-full">
                  updated 8s ago
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {sensorGauges.map((s) => (
                  <SensorGauge key={s.label} {...s} />
                ))}
              </div>
              <TrendChart />
              <div className="flex gap-5 mt-2.5 text-[11.5px] text-[rgba(11,35,32,0.55)] ep-font-mono">
                <span>— DO (mg/L)</span>
                <span className="text-[var(--coral)]">- - Temp (°C, scaled)</span>
              </div>
            </div>

            <div className="bg-white border border-[var(--sand-dim)] rounded-[14px] p-[22px_24px]">
              <div className="flex justify-between items-center mb-[18px]">
                <h3 className="ep-font-display text-base font-semibold text-[var(--water-deep)]">
                  Recent Alerts
                </h3>
                <span className="ep-font-mono text-[10.5px] text-[var(--mangrove)] bg-[rgba(60,122,92,0.1)] px-[9px] py-1 rounded-full">
                  3 events
                </span>
              </div>
              {alerts.map((a) => (
                <AlertRow key={a.title} {...a} />
              ))}
            </div>
          </div>

          {/* TANK STATUS + FEED */}
          <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-4 mb-4">
            <div className="bg-white border border-[var(--sand-dim)] rounded-[14px] p-[22px_24px]">
              <div className="flex justify-between items-center mb-[18px]">
                <h3 className="ep-font-display text-base font-semibold text-[var(--water-deep)]">
                  Tank Status
                </h3>
                <span className="ep-font-mono text-[10.5px] text-[var(--mangrove)] bg-[rgba(60,122,92,0.1)] px-[9px] py-1 rounded-full">
                  6 tanks
                </span>
              </div>
              <div className="flex flex-col gap-2.5">
                {tanks.map((t) => (
                  <TankRow key={t.name} {...t} />
                ))}
              </div>
            </div>

            <div className="bg-white border border-[var(--sand-dim)] rounded-[14px] p-[22px_24px]">
              <div className="flex justify-between items-center mb-[18px]">
                <h3 className="ep-font-display text-base font-semibold text-[var(--water-deep)]">
                  Feed Dispensed Today
                </h3>
                <span className="ep-font-mono text-[10.5px] text-[var(--mangrove)] bg-[rgba(60,122,92,0.1)] px-[9px] py-1 rounded-full">
                  biomass-adjusted
                </span>
              </div>
              <div className="ep-font-mono text-[26px] font-semibold text-[var(--water-deep)]">
                7.4{" "}
                <span className="text-sm font-medium text-[rgba(11,35,32,0.5)]">
                  kg / 9.0 kg target
                </span>
              </div>
              <div className="bg-[var(--sand-dim)] rounded-full h-2 overflow-hidden mt-2">
                <div className="bg-[var(--coral)] h-full rounded-full" style={{ width: "82%" }} />
              </div>
              <div className="text-xs text-[rgba(11,35,32,0.55)] mt-4 leading-[1.6]">
                Next scheduled dispense:{" "}
                <b className="text-[var(--water-deep)]">18:00</b>
                <br />
                FCR this cycle: <b className="text-[var(--mangrove)]">1.38</b> (target ≤ 1.5)
              </div>
            </div>
          </div>

          {/* VISION */}
          <div className="bg-white border border-[var(--sand-dim)] rounded-[14px] p-[22px_24px]">
            <div className="flex justify-between items-center mb-[18px]">
              <h3 className="ep-font-display text-base font-semibold text-[var(--water-deep)]">
                AI Vision — Growth Analytics
              </h3>
              <span className="ep-font-mono text-[10.5px] text-[var(--mangrove)] bg-[rgba(60,122,92,0.1)] px-[9px] py-1 rounded-full">
                last scan · 22 min ago
              </span>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-1">
              {visionMetrics.map((m) => (
                <div
                  key={m.label}
                  className="rounded-[10px] p-3.5 text-[var(--sand)]"
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
          </div>
        </main>
      </div>
    </div>
  );
}