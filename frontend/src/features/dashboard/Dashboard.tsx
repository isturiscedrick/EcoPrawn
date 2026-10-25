"use client";

import { useMemo, useState } from "react";
import type { Tank } from "@/features/dashboard/context/TankContext";
import { SensorGauge } from "@/features/dashboard/components/SensorGauge";
import { TankRow, AlertRow } from "@/features/dashboard/components/DashboardRows";
import { TrendChart } from "@/features/dashboard/components/TrendChart";
import { Panel, KpiCard } from "@/features/dashboard/components/DashboardPrimitives";
import { useTanks } from "@/features/dashboard/context/TankContext";
import { THRESHOLDS, GAUGE_SCALE, rangeStatus, scalePct } from "@/features/dashboard/lib/thresholds";
import { waterLevelGauge } from "@/features/dashboard/lib/water-level";
import { useEsp32 } from "@/features/dashboard/context/Esp32Context";

const FCR_TARGET = 1.5;

export function Dashboard() {
  const { tanks, removeTank, waterTrend, feedSchedule, alertsLog: alerts, visionScanLog } = useTanks();
  const [selectedTankId, setSelectedTankId] = useState<string | null>(null);
  const usb = useEsp32();

  const tankCount = tanks.length;
  const {
    tanksById, totalBiomass, avgDO, avgPh, avgTemp, avgSalinity,
    avgFcr, openAlertTanks, dispensedToday, targetToday, totalPopulation,
    totalAbnormal, avgBodyLength, avgWeight,
  } = useMemo(() => {
    const tanksById = new Map<string, Tank>();
    const totals = {
      biomass: 0, dissolvedOxygen: 0, ph: 0, temperature: 0, salinity: 0,
      fcr: 0, warnings: 0, dispensedToday: 0, targetToday: 0,
      population: 0, abnormal: 0, bodyLength: 0, weight: 0,
    };
    for (const tank of tanks) {
      tanksById.set(tank.id, tank);
      totals.biomass += tank.biomass;
      totals.dissolvedOxygen += tank.dissolvedOxygen;
      totals.ph += tank.ph;
      totals.temperature += tank.temperature;
      totals.salinity += tank.salinity;
      totals.fcr += tank.fcr;
      totals.warnings += tank.status === "warn" ? 1 : 0;
      totals.dispensedToday += tank.dispensedToday;
      totals.targetToday += tank.targetToday;
      totals.population += tank.population;
      totals.abnormal += tank.abnormal;
      totals.bodyLength += tank.bodyLength;
      totals.weight += tank.weight;
    }
    const count = tanks.length || 1;
    return {
      tanksById,
      totalBiomass: totals.biomass,
      avgDO: totals.dissolvedOxygen / count,
      avgPh: totals.ph / count,
      avgTemp: totals.temperature / count,
      avgSalinity: totals.salinity / count,
      avgFcr: totals.fcr / count,
      openAlertTanks: totals.warnings,
      dispensedToday: totals.dispensedToday,
      targetToday: totals.targetToday,
      totalPopulation: totals.population,
      totalAbnormal: totals.abnormal,
      avgBodyLength: totals.bodyLength / count,
      avgWeight: totals.weight / count,
    };
  }, [tanks]);
  const trendsByTank = useMemo(() => {
    const grouped = new Map<string, number[]>();
    for (const reading of waterTrend) {
      const values = grouped.get(reading.tankId);
      if (values) values.push(reading.value);
      else grouped.set(reading.tankId, [reading.value]);
    }
    return grouped;
  }, [waterTrend]);
  const selectedTank = selectedTankId ? tanksById.get(selectedTankId) : undefined;
  const sensorValues = {
    dissolvedOxygen: selectedTank?.dissolvedOxygen ?? avgDO,
    ph: selectedTank?.ph ?? avgPh,
    temperature: selectedTank?.temperature ?? avgTemp,
    salinity: selectedTank?.salinity ?? avgSalinity,
  };
  const feedPct = targetToday > 0 ? Math.round((dispensedToday / targetToday) * 100) : 0;

  // Statuses derived from the averaged readings, so KPI text, gauge color
  // and ring fill all come from the same numbers.
  const doStatus = rangeStatus(avgDO, THRESHOLDS.dissolvedOxygen.min);
  const fcrStatus = avgFcr <= FCR_TARGET ? "ok" : "warn";

  const sensorGauges = tankCount
    ? [
        {
          label: "Dissolved O₂",
          value: `${sensorValues.dissolvedOxygen.toFixed(1)} mg/L`,
          pct: scalePct(sensorValues.dissolvedOxygen, GAUGE_SCALE.dissolvedOxygen),
          status: rangeStatus(sensorValues.dissolvedOxygen, THRESHOLDS.dissolvedOxygen.min),
        },
        {
          label: "pH",
          value: sensorValues.ph.toFixed(1),
          pct: scalePct(sensorValues.ph, GAUGE_SCALE.ph),
          status: rangeStatus(sensorValues.ph, THRESHOLDS.ph.min, THRESHOLDS.ph.max),
        },
        {
          label: "Temperature",
          value: `${sensorValues.temperature.toFixed(1)} °C`,
          pct: scalePct(sensorValues.temperature, GAUGE_SCALE.temperature),
          status: rangeStatus(sensorValues.temperature, THRESHOLDS.temperature.min, THRESHOLDS.temperature.max),
        },
        {
          label: "Salinity",
          value: `${Math.round(sensorValues.salinity)} ppt`,
          pct: scalePct(sensorValues.salinity, GAUGE_SCALE.salinity),
          status: rangeStatus(sensorValues.salinity, THRESHOLDS.salinity.min, THRESHOLDS.salinity.max),
        },
        waterLevelGauge(selectedTank ? [selectedTank] : tanks),
      ]
    : [];

  const visionMetrics = [
    { label: "Avg. Body Length", value: tankCount ? `${avgBodyLength.toFixed(1)} cm` : "—" },
    { label: "Avg. Weight", value: tankCount ? `${avgWeight.toFixed(1)} g` : "—" },
    { label: "Population Est.", value: totalPopulation.toLocaleString() },
    { label: "Abnormal Behavior", value: `${totalAbnormal} flagged` },
  ];

  const lastScan = visionScanLog[0]?.time ?? "no scans yet";

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
            Indoor grow-out facility · {tankCount} tank{tankCount !== 1 ? "s" : ""} ·{" "}
            <em className="not-italic text-[rgba(11,35,32,0.7)]">Penaeus vannamei</em>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="inline-flex items-center gap-2 bg-white border border-[var(--sand-dim)] px-4 py-[9px] rounded-full text-[12.5px] font-semibold text-[var(--water-deep)] shadow-[var(--shadow-pill)]">
            <span
              className={`w-[7px] h-[7px] rounded-full ${
                openAlertTanks === 0 ? "ep-pulse-dot bg-[var(--mangrove)]" : "bg-[var(--amber)]"
              }`}
            />
            {openAlertTanks === 0 ? "All systems nominal" : `${openAlertTanks} tank(s) need attention`}
          </div>
        </div>
      </div>

      {/* KPI ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <KpiCard
          label="Dissolved O₂ (avg)"
          value={avgDO.toFixed(1)}
          unit="mg/L"
          delta={
            tankCount === 0
              ? "No tanks yet"
              : doStatus === "ok"
                ? "▲ within target range"
                : `Below target (≥ ${THRESHOLDS.dissolvedOxygen.min})`
          }
          deltaTone={tankCount === 0 ? "ok" : doStatus}
        />
        <KpiCard
          label="Total Biomass"
          value={totalBiomass.toFixed(1)}
          unit="kg"
          delta={`across ${tankCount} tank${tankCount !== 1 ? "s" : ""}`}
          deltaTone="ok"
        />
        <KpiCard
          label="Avg. Feed Conversion Ratio"
          value={avgFcr.toFixed(2)}
          unit="FCR"
          delta={
            tankCount === 0
              ? "No tanks yet"
              : fcrStatus === "ok"
                ? `▲ within target (≤ ${FCR_TARGET})`
                : `Above target (≤ ${FCR_TARGET})`
          }
          deltaTone={tankCount === 0 ? "ok" : fcrStatus}
        />
        <KpiCard
          label="Tanks Needing Attention"
          value={String(openAlertTanks)}
          unit="open"
          delta={openAlertTanks === 0 ? "No active warnings" : "Review thresholds"}
          deltaTone={openAlertTanks === 0 ? "ok" : "warn"}
        />
      </div>

      {/* SENSOR + ALERTS */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4 mb-4">
        <Panel
          title={`Live Sensor Array — ${selectedTank?.name ?? `${tankCount} Tank${tankCount !== 1 ? "s" : ""} (avg)`}`}
          badge={usb.status === "connected" ? `USB · ${tanks.find(tank => tank.id === usb.tankId)?.name ?? "ESP32"}` : "Recorded readings"}
        >
          {tankCount > 0 ? (
            <>
              <div className="flex flex-wrap gap-2 mb-4" aria-label="Sensor readings by tank">
                <button
                  type="button"
                  aria-pressed={!selectedTank}
                  onClick={() => setSelectedTankId(null)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${!selectedTank ? "border-[var(--mangrove)] bg-[var(--mangrove)] text-white" : "border-[var(--sand-dim)] text-[var(--water-deep)] hover:border-[var(--mangrove)]"}`}
                >
                  All tanks (avg)
                </button>
                {tanks.map((tank) => (
                  <button
                    key={tank.id}
                    type="button"
                    aria-pressed={selectedTank?.id === tank.id}
                    onClick={() => setSelectedTankId(tank.id)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${selectedTank?.id === tank.id ? "border-[var(--mangrove)] bg-[var(--mangrove)] text-white" : "border-[var(--sand-dim)] text-[var(--water-deep)] hover:border-[var(--mangrove)]"}`}
                  >
                    {tank.name}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {sensorGauges.map((s) => (
                  <SensorGauge key={s.label} {...s} />
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-[var(--sand-dim)]">
                {selectedTank ? (
                  <>
                    <TrendChart values={trendsByTank.get(selectedTank.id) ?? []} />
                    <div className="mt-2.5 text-[11.5px] text-[rgba(11,35,32,0.55)] ep-font-mono">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="inline-block w-3 h-[2px] bg-[var(--mangrove)]" /> {selectedTank.name} DO (mg/L)
                      </span>
                    </div>
                  </>
                ) : (
                  <p className="py-6 text-sm text-[rgba(11,35,32,0.6)]">Select a tank to see its dissolved oxygen trend.</p>
                )}
              </div>
            </>
          ) : (
            <div className="py-10 text-center text-[13px] text-[rgba(11,35,32,0.5)]">
              No tanks yet — add one to see live sensor data.
            </div>
          )}
        </Panel>

        <Panel title="Recent Alerts" badge={`${alerts.length} events`}>
          <div>
            {alerts.map((a) => (
              <AlertRow key={a.title} {...a} />
            ))}
          </div>
        </Panel>
      </div>

      {/* TANK STATUS + FEED */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-4 mb-4">
        <Panel title="Tank Status" badge={`${tankCount} tank${tankCount !== 1 ? "s" : ""}`}>
          {tankCount > 0 ? (
            <div className="flex flex-col gap-2.5">
              {tanks.map((t) => (
                <TankRow key={t.id} {...t} onRemove={removeTank} />
              ))}
            </div>
          ) : (
            <div className="py-6 text-center text-[13px] text-[rgba(11,35,32,0.5)]">
              No tanks added yet.
            </div>
          )}
        </Panel>

        <Panel title="Feed Dispensed Today" badge="biomass-adjusted">
          <div className="ep-font-mono text-[26px] font-semibold text-[var(--water-deep)]">
            {dispensedToday.toFixed(1)}{" "}
            <span className="text-sm font-medium text-[rgba(11,35,32,0.5)]">
              kg / {targetToday.toFixed(1)} kg target
            </span>
          </div>
          <div className="bg-[var(--sand-dim)] rounded-full h-2 overflow-hidden mt-3">
            <div
              className="bg-gradient-to-r from-[var(--coral)] to-[var(--amber)] h-full rounded-full transition-all"
              style={{ width: `${Math.min(100, feedPct)}%` }}
            />
          </div>
          <div className="grid grid-cols-2 gap-3 mt-5 pt-4 border-t border-[var(--sand-dim)]">
            <div>
              <div className="ep-font-mono text-[9.5px] uppercase tracking-wide text-[rgba(11,35,32,0.45)] mb-1">
                Next dispense
              </div>
              <div className="text-[14px] font-semibold text-[var(--water-deep)]">{feedSchedule.find(f=>f.status === "upcoming")?.time ?? "—"}</div>
            </div>
            <div>
              <div className="ep-font-mono text-[9.5px] uppercase tracking-wide text-[rgba(11,35,32,0.45)] mb-1">
                Avg FCR this cycle
              </div>
              <div
                className={`text-[14px] font-semibold ${
                  fcrStatus === "ok" ? "text-[var(--mangrove)]" : "text-[var(--amber-text)]"
                }`}
              >
                {avgFcr.toFixed(2)}{" "}
                <span className="text-[11px] font-normal text-[rgba(11,35,32,0.5)]">
                  (target ≤ {FCR_TARGET})
                </span>
              </div>
            </div>
          </div>
        </Panel>
      </div>

      {/* VISION */}
      <Panel title="AI Vision — Growth Analytics" badge={`last scan · ${lastScan}`}>
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
