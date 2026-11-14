import { useMemo, useState } from "react";
import { SensorGauge } from "@/features/dashboard/components/SensorGauge";
import { TankRow, AlertRow } from "@/features/dashboard/components/DashboardRows";
import { Panel } from "@/features/dashboard/components/DashboardPrimitives";
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
    alertsLog: alerts,
    loading,
    error,
    refreshTanks,
  } = useTanks();
  const [selectedTankId, setSelectedTankId] = useState<string | null>(null);
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
    tanksById, avgDO, avgPh, avgTemp, avgSalinity, tanksWithWaterReadings,
    openAlertTanks, dispensedToday, targetToday, avgFcr,
  } = useMemo(() => {
    const tanksById = new Map(tanks.map((tank) => [tank.id, tank]));
    const tanksWithWaterReadings = tanks.filter((tank) => tank.hasWaterReadings);
    const readingCount = tanksWithWaterReadings.length || 1;
    const readingTotals = tanksWithWaterReadings.reduce((sum, tank) => ({
      dissolvedOxygen: sum.dissolvedOxygen + tank.dissolvedOxygen,
      ph: sum.ph + tank.ph,
      temperature: sum.temperature + tank.temperature,
      salinity: sum.salinity + tank.salinity,
    }), { dissolvedOxygen: 0, ph: 0, temperature: 0, salinity: 0 });
    return {
      tanksById,
      tanksWithWaterReadings: tanksWithWaterReadings.length,
      avgDO: readingTotals.dissolvedOxygen / readingCount,
      avgPh: readingTotals.ph / readingCount,
      avgTemp: readingTotals.temperature / readingCount,
      avgSalinity: readingTotals.salinity / readingCount,
      openAlertTanks: tanks.filter((tank) => tank.status === "warn").length,
      dispensedToday: tanks.reduce((sum, tank) => sum + tank.dispensedToday, 0),
      targetToday: tanks.reduce((sum, tank) => sum + tank.targetToday, 0),
      avgFcr: tanks.length ? tanks.reduce((sum, tank) => sum + tank.fcr, 0) / tanks.length : 0,
    };
  }, [tanks]);
  const selectedTank = selectedTankId ? tanksById.get(selectedTankId) : undefined;
  const hasSelectedWaterReadings = selectedTank ? selectedTank.hasWaterReadings : tanksWithWaterReadings > 0;
  const sensorValues = {
    dissolvedOxygen: selectedTank?.dissolvedOxygen ?? avgDO,
    ph: selectedTank?.ph ?? avgPh,
    temperature: selectedTank?.temperature ?? avgTemp,
    salinity: selectedTank?.salinity ?? avgSalinity,
  };
  const feedPct = targetToday > 0 ? Math.round((dispensedToday / targetToday) * 100) : 0;

  // Statuses derived from the averaged readings, so KPI text, gauge color
  // and ring fill all come from the same numbers.
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
          value: hasSelectedWaterReadings ? `${sensorValues.dissolvedOxygen.toFixed(1)} mg/L` : "No reading",
          pct: hasSelectedWaterReadings ? scalePct(sensorValues.dissolvedOxygen, GAUGE_SCALE.dissolvedOxygen) : null,
          status: hasSelectedWaterReadings ? rangeStatus(sensorValues.dissolvedOxygen, THRESHOLDS.dissolvedOxygen.min) : "warn",
          statusLabel: hasSelectedWaterReadings ? undefined : "Unavailable",
        },
        {
          label: "pH",
          value: hasSelectedWaterReadings ? sensorValues.ph.toFixed(1) : "No reading",
          pct: hasSelectedWaterReadings ? scalePct(sensorValues.ph, GAUGE_SCALE.ph) : null,
          status: hasSelectedWaterReadings ? rangeStatus(sensorValues.ph, THRESHOLDS.ph.min, THRESHOLDS.ph.max) : "warn",
          statusLabel: hasSelectedWaterReadings ? undefined : "Unavailable",
        },
        {
          label: "Temperature",
          value: hasSelectedWaterReadings ? `${sensorValues.temperature.toFixed(1)} °C` : "No reading",
          pct: hasSelectedWaterReadings ? scalePct(sensorValues.temperature, GAUGE_SCALE.temperature) : null,
          status: hasSelectedWaterReadings ? rangeStatus(sensorValues.temperature, THRESHOLDS.temperature.min, THRESHOLDS.temperature.max) : "warn",
          statusLabel: hasSelectedWaterReadings ? undefined : "Unavailable",
        },
        {
          label: "Salinity",
          value: hasSelectedWaterReadings ? `${Math.round(sensorValues.salinity)} ppt` : "No reading",
          pct: hasSelectedWaterReadings ? scalePct(sensorValues.salinity, GAUGE_SCALE.salinity) : null,
          status: hasSelectedWaterReadings ? rangeStatus(sensorValues.salinity, THRESHOLDS.salinity.min, THRESHOLDS.salinity.max) : "warn",
          statusLabel: hasSelectedWaterReadings ? undefined : "Unavailable",
        },
        waterLevelGauge(selectedTank ? [selectedTank] : tanks),
      ]
    : [];

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

      {/* FIRST-TIME SETUP */}
      {tankCount === 0 && (
        <Panel title="Get your facility started" icon="layers" badge="Setup guide">
          <p className="max-w-2xl text-sm leading-relaxed text-[var(--ep-text-muted)]">
            Your dashboard is ready. Add your first tank to begin tracking water quality, biomass, feeding, and growth in one place.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {[
              { number: "01", title: "Add a tank", detail: "Enter the tank name and its starting measurements." },
              { number: "02", title: "Connect sensors", detail: "Configure your monitoring hardware when ready." },
              { number: "03", title: "Monitor progress", detail: "Review readings, alerts, feeding, and growth data." },
            ].map((step) => (
              <div key={step.number} className="rounded-xl border border-[var(--ep-line)] bg-[var(--ep-bg)] p-4">
                <span className="ep-font-mono text-xs font-semibold text-[var(--ep-accent)]">{step.number}</span>
                <h3 className="mt-2 text-sm font-semibold text-[var(--ep-text)]">{step.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-[var(--ep-text-muted)]">{step.detail}</p>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--ep-accent)] px-5 text-sm font-semibold text-white transition-colors hover:bg-[var(--ep-accent-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ep-accent)]"
          >
            Add your first tank
          </button>
        </Panel>
      )}

      {/* LIVE SENSOR + ALERTS */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4 mb-4">
        <Panel
          title={`Live Sensor Array — ${selectedTank?.name ?? `${tankCount} Tank${tankCount !== 1 ? "s" : ""} (avg)`}`}
          icon="activity"
          badge={usb.status === "connected" ? `USB · ${tanks.find(tank => tank.id === usb.tankId)?.name ?? "ESP32"}` : tanksWithWaterReadings ? "Recorded readings" : "No sensor data"}
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
              {!hasSelectedWaterReadings && <p className="mb-3 rounded-lg border border-dashed border-[var(--ep-line)] px-3 py-2 text-xs text-[var(--ep-text-muted)]">No water-quality telemetry is available for this selection. Zero values are not assumed; gauges will update when readings arrive.</p>}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {sensorGauges.map((s) => (
                  <SensorGauge key={s.label} {...s} />
                ))}
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
            {recentAlerts.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[var(--ep-line)] px-4 py-6 text-center">
                <p className="text-sm font-medium text-[var(--ep-text)]">{tankCount === 0 ? "Alerts will appear here once monitoring begins." : "No recent alerts."}</p>
                <p className="mt-1 text-xs text-[var(--ep-text-muted)]">{tankCount === 0 ? "Add a tank to start monitoring facility conditions." : "Your current tank readings have no recorded alert events."}</p>
              </div>
            ) : recentAlerts.map((a) => (
              <AlertRow key={`${a.title}-${a.detail}-${a.time}`} {...a} />
            ))}
          </div>
        </Panel>
      </div>

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
          {tankCount > 0 ? <>
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
          </> : (
            <div className="rounded-xl border border-dashed border-[var(--ep-line)] px-4 py-6 text-center">
              <p className="text-sm font-medium text-[var(--ep-text)]">Feeding summaries are waiting for your first tank.</p>
              <p className="mt-1 text-xs text-[var(--ep-text-muted)]">Add a tank to start recording daily feed targets and dispensed amounts.</p>
            </div>
          )}
        </Panel>
      </div>

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
