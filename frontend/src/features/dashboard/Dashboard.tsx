"use client";

import { useState } from "react";
import { SensorGauge } from "@/components/SensorGauge";
import { TankRow, AlertRow } from "@/components/DashboardRows";
import { TrendChart } from "@/components/TrendChart";
import { Panel, KpiCard } from "@/components/DashboardPrimitives";
import { alerts } from "@/data/ecoprawn";
import { useTanks } from "@/context/TankContext";
import { AddTankModal } from "./AddTankModal";

export function Dashboard() {
  const { tanks, addTank, removeTank } = useTanks();
  const [modalOpen, setModalOpen] = useState(false);

  const tankCount = tanks.length;
  const totalBiomass = tanks.reduce((sum, t) => sum + t.biomass, 0);
  const avgDO = tankCount ? tanks.reduce((sum, t) => sum + t.dissolvedOxygen, 0) / tankCount : 0;
  const avgPh = tankCount ? tanks.reduce((sum, t) => sum + t.ph, 0) / tankCount : 0;
  const avgTemp = tankCount ? tanks.reduce((sum, t) => sum + t.temperature, 0) / tankCount : 0;
  const avgSalinity = tankCount ? tanks.reduce((sum, t) => sum + t.salinity, 0) / tankCount : 0;
  const avgWaterLevel = tankCount ? tanks.reduce((sum, t) => sum + t.waterLevel, 0) / tankCount : 0;
  const avgFcr = tankCount ? tanks.reduce((sum, t) => sum + t.fcr, 0) / tankCount : 0;
  const openAlertTanks = tanks.filter((t) => t.status === "warn").length;

  const dispensedToday = tanks.reduce((sum, t) => sum + t.dispensedToday, 0);
  const targetToday = tanks.reduce((sum, t) => sum + t.targetToday, 0) || 1;
  const feedPct = Math.round((dispensedToday / targetToday) * 100);

  const totalPopulation = tanks.reduce((sum, t) => sum + t.population, 0);
  const totalAbnormal = tanks.reduce((sum, t) => sum + t.abnormal, 0);
  const avgBodyLength = tankCount ? tanks.reduce((sum, t) => sum + t.bodyLength, 0) / tankCount : 0;
  const avgWeight = tankCount ? tanks.reduce((sum, t) => sum + t.weight, 0) / tankCount : 0;

  const sensorGauges = tankCount
    ? [
        {
          label: "Dissolved O₂",
          value: `${avgDO.toFixed(1)} mg/L`,
          pct: Math.min(100, (avgDO / 8) * 100),
          status: openAlertTanks === 0 ? ("ok" as const) : ("warn" as const),
        },
        { label: "pH", value: avgPh.toFixed(1), pct: 66, status: "ok" as const },
        { label: "Temperature", value: `${avgTemp.toFixed(1)} °C`, pct: 71, status: "ok" as const },
        { label: "Salinity", value: `${Math.round(avgSalinity)} ppt`, pct: 60, status: "ok" as const },
        { label: "Water Level", value: `${Math.round(avgWaterLevel)}%`, pct: avgWaterLevel, status: "ok" as const },
      ]
    : [];

  const visionMetrics = [
    { label: "Avg. Body Length", value: tankCount ? `${avgBodyLength.toFixed(1)} cm` : "—" },
    { label: "Avg. Weight", value: tankCount ? `${avgWeight.toFixed(1)} g` : "—" },
    { label: "Population Est.", value: totalPopulation.toLocaleString() },
    { label: "Abnormal Behavior", value: `${totalAbnormal} flagged` },
  ];

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
          <div className="inline-flex items-center gap-2 bg-white border border-[var(--sand-dim)] px-4 py-[9px] rounded-full text-[12.5px] font-semibold text-[var(--water-deep)] shadow-[0_2px_8px_-4px_rgba(11,35,32,0.12)]">
            <span
              className={`w-[7px] h-[7px] rounded-full ${
                openAlertTanks === 0 ? "ep-pulse-dot bg-[var(--mangrove)]" : "bg-[var(--amber)]"
              }`}
            />
            {openAlertTanks === 0 ? "All systems nominal" : `${openAlertTanks} tank(s) need attention`}
          </div>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="ep-font-mono inline-flex items-center gap-1.5 rounded-full bg-[var(--coral)] px-4 py-[9px] text-[11px] font-semibold text-[var(--sand)] transition-colors hover:bg-[var(--coral-dim)]"
          >
            + Add Tank
          </button>
        </div>
      </div>

      {/* KPI ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <KpiCard
          label="Dissolved O₂ (avg)"
          value={avgDO.toFixed(1)}
          unit="mg/L"
          delta="▲ within target range"
          deltaTone="ok"
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
          delta="▲ improved from 1.42"
          deltaTone="ok"
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
          title={`Live Sensor Array — ${tankCount} Tank${tankCount !== 1 ? "s" : ""} (avg)`}
          badge="updated 8s ago"
        >
          {tankCount > 0 ? (
            <>
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
                    <span
                      className="inline-block w-3 h-[2px] bg-[var(--coral)]"
                      style={{ borderTop: "2px dashed var(--coral)" }}
                    />
                    Temp (°C, scaled)
                  </span>
                </div>
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
              <div className="text-[14px] font-semibold text-[var(--water-deep)]">18:00</div>
            </div>
            <div>
              <div className="ep-font-mono text-[9.5px] uppercase tracking-wide text-[rgba(11,35,32,0.45)] mb-1">
                Avg FCR this cycle
              </div>
              <div className="text-[14px] font-semibold text-[var(--mangrove)]">
                {avgFcr.toFixed(2)}{" "}
                <span className="text-[11px] font-normal text-[rgba(11,35,32,0.5)]">(target ≤ 1.5)</span>
              </div>
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

      <AddTankModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={addTank}
        existingCount={tankCount}
      />
    </>
  );
}