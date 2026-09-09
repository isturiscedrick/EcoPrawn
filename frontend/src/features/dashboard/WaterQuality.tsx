import { Panel, KpiCard } from "@/components/DashboardPrimitives";
import { TrendChart } from "@/components/TrendChart";
import { waterQualityByTank, waterQualityThresholds } from "@/data/ecoprawn";

export function WaterQuality() {
  const tank = waterQualityByTank[0];
  const warnCount = waterQualityByTank.filter((t) => t.status === "warn").length;

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
            Dissolved oxygen, pH, temperature, salinity &amp; water level · 1 tank
          </div>
        </div>
        <div className="inline-flex items-center gap-2 bg-white border border-[var(--sand-dim)] px-4 py-[9px] rounded-full text-[12.5px] font-semibold text-[var(--water-deep)] shadow-[0_2px_8px_-4px_rgba(11,35,32,0.12)]">
          <span
            className={`w-[7px] h-[7px] rounded-full ${
              warnCount === 0 ? "ep-pulse-dot bg-[var(--mangrove)]" : "bg-[var(--amber)]"
            }`}
          />
          {warnCount === 0 ? "All parameters nominal" : "Tank out of range"}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <KpiCard label="Dissolved O₂" value={tank.dissolvedOxygen.toFixed(1)} unit="mg/L" delta="▲ within target range" deltaTone="ok" />
        <KpiCard label="pH" value={tank.ph.toFixed(1)} unit="pH" delta="▲ within target range" deltaTone="ok" />
        <KpiCard label="Temperature" value={tank.temperature.toFixed(1)} unit="°C" delta="▲ within target range" deltaTone="ok" />
        <KpiCard
          label="Tank Status"
          value={warnCount === 0 ? "OK" : "Watch"}
          unit=""
          delta={warnCount === 0 ? "No active warnings" : "DO trending down"}
          deltaTone={warnCount === 0 ? "ok" : "warn"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-4 mb-4">
        <Panel title="Live Sensor Array — Tank 1" badge="updated 8s ago">
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

        <Panel title="Parameter Thresholds" badge="Tank 1">
          <div className="flex flex-col gap-2.5">
            {waterQualityThresholds.map((t) => (
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

      <Panel title="Tank Readings" badge="1 tank">
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
              {waterQualityByTank.map((t) => (
                <tr key={t.tank} className="border-b border-[var(--sand-dim)] last:border-b-0">
                  <td className="py-3 pr-3 text-[13.5px] font-semibold text-[var(--water-deep)]">{t.tank}</td>
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
  );
}