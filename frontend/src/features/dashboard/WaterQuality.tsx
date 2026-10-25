"use client";

import { useState, type KeyboardEvent } from "react";
import { Panel, KpiCard } from "@/features/dashboard/components/DashboardPrimitives";
import { TrendChart } from "@/features/dashboard/components/TrendChart";
import { ScrollFadeContainer } from "@/components/motion/ScrollFadeContainer";
import { useTanks } from "@/features/dashboard/context/TankContext";
import { THRESHOLDS, rangeStatus } from "@/features/dashboard/lib/thresholds";
import { Esp32Connection } from "@/features/dashboard/components/Esp32Connection";

export function WaterQuality() {
  const { tanks, waterTrend } = useTanks();
  const [selectedTankId, setSelectedTankId] = useState<string | null>(null);
  const tankCount = tanks.length;
  const warnCount = tanks.filter((t) => t.status === "warn").length;
  const selectedTank = tanks.find((tank) => tank.id === selectedTankId) ?? tanks[0];
  const selectedTankIndex = tanks.findIndex((tank) => tank.id === selectedTank?.id);

  function handleTankTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let nextIndex: number;
    switch (event.key) {
      case "ArrowRight":
        nextIndex = (index + 1) % tankCount;
        break;
      case "ArrowLeft":
        nextIndex = (index - 1 + tankCount) % tankCount;
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = tankCount - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    setSelectedTankId(tanks[nextIndex].id);
    event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>("[role='tab']")[nextIndex]?.focus();
  }

  const avgDO = tankCount ? tanks.reduce((sum, t) => sum + t.dissolvedOxygen, 0) / tankCount : 0;
  const avgPh = tankCount ? tanks.reduce((sum, t) => sum + t.ph, 0) / tankCount : 0;
  const avgTemp = tankCount ? tanks.reduce((sum, t) => sum + t.temperature, 0) / tankCount : 0;

  const doStatus = rangeStatus(avgDO, THRESHOLDS.dissolvedOxygen.min);
  const phStatus = rangeStatus(avgPh, THRESHOLDS.ph.min, THRESHOLDS.ph.max);
  const tempStatus = rangeStatus(avgTemp, THRESHOLDS.temperature.min, THRESHOLDS.temperature.max);

  const thresholds = selectedTank
    ? [
        {
          label: "Dissolved O₂",
          range: "≥ 4.5 mg/L",
          current: `${selectedTank.dissolvedOxygen.toFixed(1)} mg/L`,
          status: selectedTank.dissolvedOxygen >= 4.5 ? "ok" : "warn",
        },
        {
          label: "pH",
          range: "7.5 – 8.5",
          current: selectedTank.ph.toFixed(1),
          status: selectedTank.ph >= 7.5 && selectedTank.ph <= 8.5 ? "ok" : "warn",
        },
        {
          label: "Temperature",
          range: "26 – 30 °C",
          current: `${selectedTank.temperature.toFixed(1)} °C`,
          status: selectedTank.temperature >= 26 && selectedTank.temperature <= 30 ? "ok" : "warn",
        },
        {
          label: "Salinity",
          range: "10 – 20 ppt",
          current: `${selectedTank.salinity} ppt`,
          status: selectedTank.salinity >= 10 && selectedTank.salinity <= 20 ? "ok" : "warn",
        },
        {
          label: "Water Level",
          range: "≥ 90%",
          current: `${selectedTank.waterLevel}%`,
          status: selectedTank.waterLevel >= 90 ? "ok" : "warn",
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
            <KpiCard
              label="Dissolved O₂ (avg)"
              value={avgDO.toFixed(1)}
              unit="mg/L"
              delta={doStatus === "ok" ? "▲ within target range" : "Below target (≥ 4.5)"}
              deltaTone={doStatus}
            />
            <KpiCard
              label="pH (avg)"
              value={avgPh.toFixed(1)}
              unit="pH"
              delta={phStatus === "ok" ? "▲ within target range" : "Outside target (7.5 – 8.5)"}
              deltaTone={phStatus}
            />
            <KpiCard
              label="Temperature (avg)"
              value={avgTemp.toFixed(1)}
              unit="°C"
              delta={tempStatus === "ok" ? "▲ within target range" : "Outside target (26 – 30 °C)"}
              deltaTone={tempStatus}
            />
            <KpiCard
              label="Tanks Status"
              value={warnCount === 0 ? "OK" : "Watch"}
              unit=""
              delta={warnCount === 0 ? "No active warnings" : "Review flagged tanks"}
              deltaTone={warnCount === 0 ? "ok" : "warn"}
            />
          </div>

          <div className="mb-4">
            <div className="ep-font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--mangrove)] mb-2">
              Tank details
            </div>
            <div role="tablist" aria-label="Water quality by tank" className="flex gap-2 overflow-x-auto pb-1">
              {tanks.map((tank, index) => (
                <button
                  key={tank.id}
                  id={`water-tank-tab-${index}`}
                  type="button"
                  role="tab"
                  aria-selected={selectedTankIndex === index}
                  aria-controls="water-tank-details"
                  tabIndex={selectedTankIndex === index ? 0 : -1}
                  onClick={() => setSelectedTankId(tank.id)}
                  onKeyDown={(event) => handleTankTabKeyDown(event, index)}
                  className={`shrink-0 rounded-full border px-4 py-2 text-[12.5px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mangrove)] ${
                    selectedTankIndex === index
                      ? "border-[var(--mangrove)] bg-[var(--mangrove)] text-white"
                      : "border-[var(--sand-dim)] bg-white text-[var(--water-deep)] hover:border-[var(--mangrove)]"
                  }`}
                >
                  {tank.name}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <Esp32Connection key={selectedTank.id} tankId={selectedTank.id} tankName={selectedTank.name} />
          </div>

          <div
            id="water-tank-details"
            role="tabpanel"
            aria-labelledby={`water-tank-tab-${selectedTankIndex}`}
            className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-4 mb-4"
          >
            <Panel title={`Recorded oxygen history · ${selectedTank.name}`} badge="Recorded readings">
              <TrendChart values={waterTrend.filter((reading) => reading.tankId === selectedTank.id).map((reading) => reading.value)} />
              <div className="flex gap-5 mt-2.5 text-[11.5px] text-[rgba(11,35,32,0.55)] ep-font-mono">
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-3 h-[2px] bg-[var(--mangrove)]" /> DO (mg/L)
                </span>
              </div>
            </Panel>

            <Panel title="Parameter Thresholds" badge={selectedTank.name}>
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
                          t.status === "ok" ? "text-[var(--mangrove)]" : "text-[var(--amber-text)]"
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
            <ScrollFadeContainer>
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
                            t.status === "ok" ? "text-[var(--mangrove)]" : "text-[var(--amber-text)]"
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
            </ScrollFadeContainer>
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
