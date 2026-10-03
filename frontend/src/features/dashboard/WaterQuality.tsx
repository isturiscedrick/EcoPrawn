"use client";

import { Panel, KpiCard } from "@/components/DashboardPrimitives";
import { TrendChart } from "@/components/TrendChart";
import { useTanks } from "@/context/TankContext";

export function WaterQuality() {
  const { tanks } = useTanks();
  const tankCount = tanks.length;
  const warnCount = tanks.filter((t) => t.status === "warn").length;
  const first = tanks[0];

  const avgDO = tankCount ? tanks.reduce((sum, t) => sum + t.dissolvedOxygen, 0) / tankCount : 0;
  const avgPh = tankCount ? tanks.reduce((sum, t) => sum + t.ph, 0) / tankCount : 0;
  const avgTemp = tankCount ? tanks.reduce((sum, t) => sum + t.temperature, 0) / tankCount : 0;

  const thresholds = first
    ? [
        {
          label: "Dissolved O₂",
          range: "≥ 4.5 mg/L",
          current: `${first.dissolvedOxygen.toFixed(1)} mg/L`,
          status: first.dissolvedOxygen >= 4.5 ? "ok" : "warn",
        },
        {
          label: "pH",
          range: "7.5 – 8.5",
          current: first.ph.toFixed(1),
          status: first.ph >= 7.5 && first.ph <= 8.5 ? "ok" : "warn",
        },
        {
          label: "Temperature",
          range: "26 – 30 °C",
          current: `${first.temperature.toFixed(1)} °C`,
          status: first.temperature >= 26 && first.temperature <= 30 ? "ok" : "warn",
        },
        {
          label: "Salinity",
          range: "10 – 20 ppt",
          current: `${first.salinity} ppt`,
          status: first.salinity >= 10 && first.salinity <= 20 ? "ok" : "warn",
        },
        {
          label: "Water Level",
          range: "≥ 90%",
          current: `${first.waterLevel}%`,
          status: first.waterLevel >= 90 ? "ok" : "warn",
        },
      ]
    : [];

  return (
    <>
      <div className="flex justify-between items-start mb-7 flex-wrap gap-4 pb-6 border-b border-[var(--sand-dim)]">
        <div>
          <div className="ep-font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--mangrove)] mb-2">
            Sensor Network
          </div>
          <h1 className="ep-font-display text-[28px] font-semibold text-[var(--water-deep)] leading-tight">
            Water Quality Monitoring
          </h1>
          <div className="text-[13px] text-[rgba(11,35,32,0.55)] mt-1.5">
            Dissolved oxygen, pH, temperature, salinity &amp; water level · {tankCount} tank{tankCount !== 1 ? "s" : ""}
          </div>
        </div>
        <div className="inline-flex items-center gap-2 bg-white border border-[var(--sand-dim)] px-4 py-[9px] rounded-full text-[12.5px] font-semibold text-[var(--water-deep)] shadow-[var(--shadow-pill)]">
          <span
            className={`w-[7px] h-[7px] rounded-full ${
              warnCount === 0 ? "ep-pulse-dot bg-[var(--mangrove)]" : "bg-[var(--amber)]"
            }`}
          />
          {warnCount === 0 ? "All parameters nominal" : `${warnCount} tank${warnCount !== 1 ? "s" : ""} out of range`}
        </div>
      </div>

      {tankCount > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
            <KpiCard label="Dissolved O₂ (avg)" value={avgDO.toFixed(1)} unit="mg/L" delta="▲ within target range" deltaTone="ok" />
            <KpiCard label="pH (avg)" value={avgPh.toFixed(1)} unit="pH" delta="▲ within target range" deltaTone="ok" />
            <KpiCard label="Temperature (avg)" value={avgTemp.toFixed(1)} unit="°C" delta="▲ within target range" deltaTone="ok" />
            <KpiCard
              label="Tanks Status"
              value={warnCount === 0 ? "OK" : "Watch"}
              unit=""
              delta={warnCount === 0 ? "No active warnings" : "Review flagged tanks"}
              deltaTone={warnCount === 0 ? "ok" : "warn"}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-4 mb-4">
            <Panel title={`Live Sensor Array — ${first.name}`} badge="updated 8s ago">
              <TrendChart />
              <div className="flex gap-5 mt-2.5 text-[11.5px] text-[rgba(11,35,32,0.55)] ep-font-mono">
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-3 h-[2px] bg-[var(--mangrove)]" /> DO (mg/L)
                </span>
                <span className="flex items-center gap-1.5 text-[var(--coral)]">
                  <span className="inline-block w-3 h-[2px]" style={{ borderTop: "2px dashed var(--coral)" }} />
                  Temp (°C, scaled)
                </span>
              </div>
            </Panel>

            <Panel title="Parameter Thresholds" badge={first.name}>
              <div className="flex flex-col gap-2.5">
                {thresholds.map((t) => (
                  <div
                    key={t.label}
                    className="flex items-center justify-between p-3 border border-[var(--sand-dim)] rounded-[10px]"
                  >
                    <div>
                      <div className="text-[13px] font-semibold text-[var(--water-deep)]">{t.label}</div>
                      <div className="ep-font-mono text-[11px] text-[rgba(11,35,32,0.5)]">{t.range}</div>
                    </div>
                    <div className="text-right">
                      <div className="ep-font-mono text-[12.5px] font-semibold text-[var(--water-deep)]">
                        {t.current}
                      </div>
                      <div
                        className={`text-[10px] font-semibold ${
                          t.status === "ok" ? "text-[var(--mangrove)]" : "text-[var(--amber)]"
                        }`}
                      >
                        {t.status === "ok" ? "In range" : "Watch"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          </div>

          <Panel title="Tank Readings" badge={`${tankCount} tank${tankCount !== 1 ? "s" : ""}`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[640px]">
                <thead>
                  <tr className="ep-font-mono text-[10px] uppercase tracking-wide text-[rgba(11,35,32,0.45)] border-b border-[var(--sand-dim)]">
                    <th className="py-2.5 pr-3 font-semibold">Tank</th>
                    <th className="py-2.5 pr-3 font-semibold">DO (mg/L)</th>
                    <th className="py-2.5 pr-3 font-semibold">pH</th>
                    <th className="py-2.5 pr-3 font-semibold">Temp (°C)</th>
                    <th className="py-2.5 pr-3 font-semibold">Salinity (ppt)</th>
                    <th className="py-2.5 pr-3 font-semibold">Water Level</th>
                    <th className="py-2.5 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {tanks.map((t) => (
                    <tr key={t.id} className="border-b border-[var(--sand-dim)] last:border-b-0">
                      <td className="py-3 pr-3 text-[13.5px] font-semibold text-[var(--water-deep)]">{t.name}</td>
                      <td className="py-3 pr-3 ep-font-mono text-[13px] text-[var(--water-deep)]">
                        {t.dissolvedOxygen.toFixed(1)}
                      </td>
                      <td className="py-3 pr-3 ep-font-mono text-[13px] text-[var(--water-deep)]">{t.ph.toFixed(1)}</td>
                      <td className="py-3 pr-3 ep-font-mono text-[13px] text-[var(--water-deep)]">
                        {t.temperature.toFixed(1)}
                      </td>
                      <td className="py-3 pr-3 ep-font-mono text-[13px] text-[var(--water-deep)]">{t.salinity}</td>
                      <td className="py-3 pr-3 ep-font-mono text-[13px] text-[var(--water-deep)]">{t.waterLevel}%</td>
                      <td className="py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 text-[11.5px] font-semibold ${
                            t.status === "ok" ? "text-[var(--mangrove)]" : "text-[var(--amber)]"
                          }`}
                        >
                          <span
                            className={`w-[7px] h-[7px] rounded-full ${
                              t.status === "ok" ? "bg-[var(--mangrove)]" : "bg-[var(--amber)]"
                            }`}
                          />
                          {t.status === "ok" ? "Nominal" : "Watch"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </>
      ) : (
        <Panel title="Tank Readings" badge="0 tanks">
          <div className="py-10 text-center text-[13px] text-[rgba(11,35,32,0.5)]">
            No tanks yet — add one on the Tanks page to see water quality data.
          </div>
        </Panel>
      )}
    </>
  );
}