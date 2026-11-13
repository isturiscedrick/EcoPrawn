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
import { deriveTankAlerts } from "@/features/dashboard/lib/alerts";
import { AddTankModal } from "@/features/dashboard/components/AddTankModal";
import { DashboardDetailModal } from "@/features/dashboard/components/DashboardDetailModal";
import { SensorThresholdModal } from "@/features/dashboard/components/SensorThresholdModal";
import { useToast } from "@/features/dashboard/components/Toast";
import {
  DashboardErrorState,
  DashboardLoadingState,
} from "@/features/dashboard/components/DashboardStates";

const FCR_TARGET = 1.5;
const MAX_RECENT_ALERTS = 5;

export function Dashboard() {
  const {
    tanks,
    addTank,
    removeTank,
    waterTrend,
    feedSchedule,
    alertsLog: alerts,
    visionScanLog,
    loading,
    error,
    refreshTanks,
  } = useTanks();
  const [selectedTankId, setSelectedTankId] = useState<string | null>(null);
  const [comparisonMetric, setComparisonMetric] = useState<"biomass" | "dissolvedOxygen" | "ph" | "temperature">("biomass");
  const [modalOpen, setModalOpen] = useState(false);
  const [thresholdModalOpen, setThresholdModalOpen] = useState(false);
  const [detail, setDetail] = useState<{
    title: string;
    description: string;
    details: string[];
  } | null>(null);
  const usb = useEsp32();
  const { showToast } = useToast();

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
  const comparisonMetrics = [
    { key: "biomass" as const, label: "Biomass", unit: "kg", value: (tank: Tank) => tank.biomass },
    { key: "dissolvedOxygen" as const, label: "Dissolved O₂", unit: "mg/L", value: (tank: Tank) => tank.dissolvedOxygen },
    { key: "ph" as const, label: "pH", unit: "pH", value: (tank: Tank) => tank.ph },
    { key: "temperature" as const, label: "Temperature", unit: "°C", value: (tank: Tank) => tank.temperature },
  ];
  const activeComparison = comparisonMetrics.find((metric) => metric.key === comparisonMetric) ?? comparisonMetrics[0];
  const comparisonMax = Math.max(1, ...tanks.map(activeComparison.value));
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

  // Live warnings for any tank currently out of range (same helper the
  // Alerts page uses), shown ahead of the static event log so the
  // "tanks need attention" header and this panel always agree.
  const liveAlerts = deriveTankAlerts(tanks);
  const recentAlerts = [...liveAlerts, ...alerts].slice(0, MAX_RECENT_ALERTS);

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

  // Latest scan time comes from the scan log in data/ecoprawn.ts, not a
  // hardcoded "22 min ago".
  const lastScan = visionScanLog[0]?.time ?? "no scans yet";

  if (loading) {
    return <DashboardLoadingState />;
  }

  if (error && tanks.length === 0) {
    return (
      <DashboardErrorState
        title="Dashboard data unavailable"
        description={error}
        action={{ label: "Try again", onClick: () => void refreshTanks() }}
      />
    );
  }

  function showDetail(title: string, description: string, details: string[]) {
    setDetail({ title, description, details });
  }

  return (
    <>
      {/* PAGE HEADER */}
      <div className="dashboard-page-header mb-7 flex flex-wrap items-end justify-between gap-5 border-b border-[rgba(11,46,51,0.12)] pb-7">
        <div>
          <div className="mb-2 ep-font-mono text-xs font-semibold uppercase tracking-[0.14em] text-[var(--mangrove-text)]">
            Facility Overview
          </div>
          <h1 className="ep-font-display text-[30px] font-semibold leading-tight tracking-[-0.02em] text-[var(--water-deep)]">
            Tank Overview
          </h1>
          <div className="mt-2 text-[15px] text-[rgba(11,35,32,0.68)]">
            Indoor grow-out facility · {tankCount} tank{tankCount !== 1 ? "s" : ""} ·{" "}
            <em className="not-italic text-[rgba(11,35,32,0.7)]">Penaeus vannamei</em>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--sand-dim)] bg-white px-4 py-2 text-sm font-semibold text-[var(--water-deep)] shadow-[var(--shadow-pill)]">
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
            className="ep-font-mono inline-flex min-h-11 items-center gap-1.5 rounded-full bg-[var(--coral)] px-4 py-2 text-xs font-semibold text-[var(--sand)] transition-colors hover:bg-[var(--coral-dim)]"
          >
            + Add Tank
          </button>
        </div>
      </div>

      {/* KPI ROW */}
      <div className="dashboard-kpi-grid grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
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
          onDetails={() =>
            showDetail("Dissolved oxygen", "Average oxygen level across the selected facility readings.", [
              `Current average: ${avgDO.toFixed(1)} mg/L`,
              `Target minimum: ${THRESHOLDS.dissolvedOxygen.min} mg/L`,
              tankCount ? `Calculated from ${tankCount} tank${tankCount === 1 ? "" : "s"}.` : "Add a tank to begin monitoring.",
            ])
          }
        />
        <KpiCard
          label="Total Biomass"
          value={totalBiomass.toFixed(1)}
          unit="kg"
          delta={`across ${tankCount} tank${tankCount !== 1 ? "s" : ""}`}
          deltaTone="ok"
          onDetails={() =>
            showDetail("Total biomass", "The estimated combined biomass currently recorded across all tanks.", [
              `Current total: ${totalBiomass.toFixed(1)} kg`,
              `Included tanks: ${tankCount}`,
              tankCount ? "Values update as tank records change." : "No tank biomass has been recorded yet.",
            ])
          }
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
          onDetails={() =>
            showDetail("Feed conversion ratio", "A lower FCR indicates more efficient feed usage.", [
              `Current average: ${avgFcr.toFixed(2)}`,
              `Target: ≤ ${FCR_TARGET}`,
              tankCount ? "Average is calculated across the current tank set." : "Add a tank to begin calculating FCR.",
            ])
          }
        />
        <KpiCard
          label="Tanks Needing Attention"
          value={String(openAlertTanks)}
          unit="open"
          delta={openAlertTanks === 0 ? "No active warnings" : "Review thresholds"}
          deltaTone={openAlertTanks === 0 ? "ok" : "warn"}
          onDetails={() =>
            showDetail("Tank attention", "Tanks with readings that currently need operator review.", [
              `Open attention items: ${openAlertTanks}`,
              openAlertTanks ? "Review the Alerts view for each threshold event." : "No active warnings are present.",
              `Recent events shown: ${recentAlerts.length}`,
            ])
          }
        />
      </div>

      {/* SENSOR + ALERTS */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4 mb-4">
        <Panel
          title={`Live Sensor Array — ${selectedTank?.name ?? `${tankCount} Tank${tankCount !== 1 ? "s" : ""} (avg)`}`}
          icon="activity"
          badge={usb.status === "connected" ? `USB · ${tanks.find(tank => tank.id === usb.tankId)?.name ?? "ESP32"}` : "Recorded readings"}
          onDetails={() =>
            showDetail("Live sensor array", "Current water readings and dissolved oxygen trend for the selected tank or facility average.", [
              selectedTank ? `Selected tank: ${selectedTank.name}` : `Facility average across ${tankCount} tank${tankCount === 1 ? "" : "s"}`,
              `Parameters tracked: ${sensorGauges.map((gauge) => gauge.label).join(", ")}`,
              usb.status === "connected" ? "Readings are connected to the USB edge node." : "Readings are currently from recorded dashboard data.",
            ])
          }
        >
          {tankCount > 0 ? (
            <>
              <div className="mb-4 flex flex-wrap items-center gap-2" aria-label="Sensor readings by tank">
                <button
                  type="button"
                  onClick={() => setThresholdModalOpen(true)}
                  className="order-last min-h-11 rounded-full border border-[var(--ep-line)] px-3 py-1.5 text-sm font-semibold text-[var(--ep-primary)] transition-colors hover:border-[var(--coral)] hover:text-[var(--coral)] sm:order-none"
                >
                  Configure ranges
                </button>
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
                    <TrendChart
                      values={trendsByTank.get(selectedTank.id) ?? []}
                      onPointClick={(value, index) =>
                        showDetail(
                          `${selectedTank.name} dissolved oxygen reading`,
                          "Historical sensor point selected from the live trend.",
                          [
                            `Reading ${index + 1}: ${value.toFixed(2)} mg/L`,
                            `Tank: ${selectedTank.name}`,
                            "Open Water Quality for the full reading history and report view.",
                          ],
                        )
                      }
                    />
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

        <Panel
          title="Recent Alerts"
          icon="zap"
          badge={liveAlerts.length > 0 ? `${liveAlerts.length} open` : `${recentAlerts.length} events`}
          onDetails={() =>
            showDetail("Recent alerts", "A concise view of live threshold warnings and recent recorded events.", [
              `Open alerts: ${liveAlerts.length}`,
              `Recent events: ${recentAlerts.length}`,
              liveAlerts.length ? "Open the Alerts view to review each affected parameter." : "All monitored tanks are currently within their configured ranges.",
            ])
          }
        >
          <div>
            {recentAlerts.map((a) => (
              <AlertRow key={`${a.title}-${a.detail}-${a.time}`} {...a} />
            ))}
          </div>
        </Panel>
      </div>

      {/* TANK COMPARISON */}
      {tankCount > 0 && (
        <Panel
          title="Tank Comparison"
          icon="activity"
          badge={`${tankCount} tank${tankCount !== 1 ? "s" : ""}`}

        >
          <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Choose tank comparison metric">
            {comparisonMetrics.map((metric) => (
              <button
                key={metric.key}
                type="button"
                aria-pressed={comparisonMetric === metric.key}
                onClick={() => setComparisonMetric(metric.key)}
                className={comparisonMetric === metric.key
                  ? "min-h-10 rounded-full border border-[var(--ep-accent)] bg-[var(--ep-accent)] px-3 py-2 text-xs font-semibold text-white"
                  : "min-h-10 rounded-full border border-[var(--ep-line)] bg-[var(--ep-bg)] px-3 py-2 text-xs font-semibold text-[var(--ep-text-muted)] hover:border-[var(--ep-accent)] hover:text-[var(--ep-accent)]"}
              >
                {metric.label}
              </button>
            ))}
          </div>
          <div className="space-y-4">
            {tanks.map((tank) => {
              const value = activeComparison.value(tank);
              const width = Math.max(0, Math.min(100, (value / comparisonMax) * 100));
              return (
                <div key={tank.id} className="dashboard-tank-comparison-row min-w-0">
                  <div className="mb-1.5 flex items-baseline justify-between gap-3">
                    <span className="min-w-0 truncate text-sm font-semibold text-[var(--ep-text)]">{tank.name}</span>
                    <span className="ep-font-mono shrink-0 text-sm font-semibold text-[var(--ep-text)]">
                      {value.toFixed(comparisonMetric === "biomass" ? 1 : 2)} {activeComparison.unit}
                    </span>
                  </div>
                  <div
                    className="h-2.5 overflow-hidden rounded-full bg-[var(--ep-line)]"
                    role="img"
                    aria-label={`${tank.name}: ${value.toFixed(2)} ${activeComparison.unit}, relative to the highest tank value`}
                  >
                    <div className="h-full rounded-full bg-[var(--ep-accent)] transition-[width] duration-300" style={{ width: String(width) + "%" }} />
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-4 text-xs leading-relaxed text-[var(--ep-text-muted)]">
            Bars show each tank relative to the highest recorded value for this metric. They are not target or health scores.
          </p>
        </Panel>
      )}

      {/* TANK STATUS + FEED */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-4 mb-4">
        <Panel
          title="Tank Status"
          icon="layers"
          badge={`${tankCount} tank${tankCount !== 1 ? "s" : ""}`}
          onDetails={() =>
            showDetail("Tank status", "A compact overview of each tank’s condition and biomass.", [
              `Registered tanks: ${tankCount}`,
              tankCount ? `${openAlertTanks} tank${openAlertTanks === 1 ? "" : "s"} need attention.` : "No tanks have been added yet.",
              "Use the Tanks view for full records and controls.",
            ])
          }
        >
          {tankCount > 0 ? (
            <div className="flex flex-col gap-2.5">
              {tanks.map((t) => (
                <TankRow
                  key={t.id}
                  {...t}
                  onRemove={async (id) => {
                    showToast("Tank removed.");
                    if (!(await removeTank(id))) showToast("Could not remove tank. Please try again.");
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="py-6 text-center text-[13px] text-[rgba(11,35,32,0.5)]">
              No tanks added yet.
            </div>
          )}
        </Panel>

        <Panel
          title="Feed Dispensed Today"
          icon="utensils"
          badge="biomass-adjusted"
          onDetails={() =>
            showDetail("Feed dispensed today", "Daily feed progress compared with the current biomass-adjusted target.", [
              `Dispensed: ${dispensedToday.toFixed(1)} kg`,
              `Target: ${targetToday.toFixed(1)} kg`,
              `Progress: ${feedPct}%`,
              `Next dispense: 18:00`,
            ])
          }
        >
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
      <Panel
        title="AI Vision — Growth Analytics"
        icon="eye"
        badge={`last scan · ${lastScan}`}
        onDetails={() =>
          showDetail("AI vision", "Growth and behavior estimates from the latest available scan.", [
            `Latest scan: ${lastScan}`,
            `Population estimate: ${totalPopulation.toLocaleString()}`,
            `Abnormal behavior flags: ${totalAbnormal}`,
            tankCount ? "Open Vision & Growth for scan history and tank-level details." : "Add a tank to begin collecting vision data.",
          ])
        }
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {visionMetrics.map((m) => (
            <div
              key={m.label}
              className="rounded-2xl border border-[rgba(11,46,51,0.12)] bg-white px-[22px] py-5 shadow-[0_8px_24px_-18px_rgba(11,46,51,0.38)] transition-all hover:-translate-y-0.5 hover:border-[var(--coral)] hover:shadow-[0_14px_28px_-18px_rgba(11,46,51,0.42)]"
            >
              <div className="mb-2.5 ep-font-mono text-xs font-medium uppercase tracking-wide text-[rgba(11,35,32,0.68)]">
                {m.label}
              </div>
              <div className="ep-font-display text-[28px] font-semibold text-[var(--water-deep)]">
                {m.value}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-xl border border-[rgba(232,98,58,0.22)] bg-[rgba(232,98,58,0.06)] p-4">
          <div className="mb-1 text-sm font-semibold text-[var(--ep-primary)]">AI recommendation</div>
          <p className="text-sm leading-relaxed text-[var(--ep-text-muted)]">
            {tankCount
              ? totalAbnormal > 0
                ? "Review flagged behavior before the next feeding cycle and compare it with water-quality readings."
                : "Growth indicators are stable. Continue scheduled scans and review the next prediction after the next sampling cycle."
              : "Add a tank to receive daily growth predictions and actionable recommendations."}
          </p>
        </div>
      </Panel>

      <AddTankModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={async (input) => {
          showToast(`${input.name} added.`);
          if (!(await addTank(input))) showToast(`Could not save ${input.name}. Please try again.`);
        }}
        existingCount={tankCount}
      />
      <DashboardDetailModal
        open={detail !== null}
        title={detail?.title ?? ""}
        description={detail?.description ?? ""}
        details={detail?.details ?? []}
        onClose={() => setDetail(null)}
      />
      <SensorThresholdModal
        open={thresholdModalOpen}
        onClose={() => setThresholdModalOpen(false)}
      />
    </>
  );
}
