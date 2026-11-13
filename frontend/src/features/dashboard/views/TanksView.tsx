import { useState } from "react";
import { THRESHOLDS, rangeStatus } from "@/features/dashboard/lib/thresholds";
import { Panel, KpiCard } from "@/features/dashboard/components/DashboardPrimitives";
import { TankRow } from "@/features/dashboard/components/DashboardRows";
import { useTanks } from "@/features/dashboard/context/TankContext";
import { DashboardViewSkeleton } from "@/features/dashboard/components/DashboardStates";
import { AddTankModal } from "@/features/dashboard/components/AddTankModal";
import { EditTankModal } from "@/features/dashboard/components/EditTankModal";
import { useToast } from "@/features/dashboard/components/Toast";

export function TanksView() {
  const { tanks, addTank, removeTank, updateTank, loading, waterTrend, visionScanLog } = useTanks();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTankId, setSelectedTankId] = useState<string | null>(null);
  const [editingTankId, setEditingTankId] = useState<string | null>(null);
  const { showToast } = useToast();

  if (loading) return <DashboardViewSkeleton variant="tanks" />;

  const tankCount = tanks.length;
  const totalBiomass = tanks.reduce((sum, t) => sum + t.biomass, 0);
  const avgFcr = tankCount ? tanks.reduce((sum, t) => sum + t.fcr, 0) / tankCount : 0;
  const openAlertTanks = tanks.filter((t) => t.status === "warn").length;
  const selectedTank = tanks.find((tank) => tank.id === selectedTankId) ?? null;
  const selectedTankTrend = selectedTank ? waterTrend.filter((reading) => reading.tankId === selectedTank.id).slice(-8).reverse() : [];
  const selectedTankScan = selectedTank ? visionScanLog.find((scan) => scan.tank === selectedTank.name) : undefined;


  return (
    <>
      <div className="dashboard-page-header flex justify-between items-start mb-7 flex-wrap gap-4 pb-6 border-b border-[var(--sand-dim)]">
        <div>
          <div className="ep-font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--mangrove)] mb-2">
            Facility Configuration
          </div>
          <h1 className="ep-font-display text-[28px] font-semibold text-[var(--water-deep)] leading-tight">
            Tanks
          </h1>
          <div className="text-[13px] text-[rgba(11,35,32,0.55)] mt-1.5">
            Add, remove, and review tanks in the facility · {tankCount} tank{tankCount !== 1 ? "s" : ""}
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="inline-flex items-center gap-2 bg-white border border-[var(--sand-dim)] px-4 py-[9px] rounded-full text-[12.5px] font-semibold text-[var(--water-deep)] shadow-[var(--shadow-pill)]">
            <span
              className={`w-[7px] h-[7px] rounded-full ${
                openAlertTanks === 0 ? "ep-pulse-dot bg-[var(--mangrove)]" : "bg-[var(--amber)]"
              }`}
            />
            {openAlertTanks === 0 ? "All tanks nominal" : `${openAlertTanks} tank(s) need attention`}
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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        <KpiCard
          label="Total Tanks"
          value={String(tankCount)}
          unit="active"
          delta={tankCount === 0 ? "No tanks yet" : "In facility"}
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
          delta="target ≤ 1.5"
          deltaTone="ok"
        />
      </div>


      {selectedTank && (
        <Panel
          title={`${selectedTank.name} · Tank details`}
          badge={selectedTank.hasWaterReadings ? "Sensor readings available" : "No sensor readings"}
          onDetails={() => setSelectedTankId(null)}
        >
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-[var(--ep-text-muted)]">Current condition, water quality, feeding, and recorded growth information.</p>
            <button
              type="button"
              onClick={() => setSelectedTankId(null)}
              className="min-h-10 rounded-lg border border-[var(--ep-line)] px-3 text-xs font-semibold text-[var(--ep-text-muted)] hover:bg-[var(--ep-bg-subtle)]"
            >
              Close details
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Dissolved O₂", value: selectedTank.hasWaterReadings ? `${selectedTank.dissolvedOxygen.toFixed(1)} mg/L` : "Unavailable", status: selectedTank.hasWaterReadings ? rangeStatus(selectedTank.dissolvedOxygen, THRESHOLDS.dissolvedOxygen.min) : null },
              { label: "pH", value: selectedTank.hasWaterReadings ? selectedTank.ph.toFixed(1) : "Unavailable", status: selectedTank.hasWaterReadings ? rangeStatus(selectedTank.ph, THRESHOLDS.ph.min, THRESHOLDS.ph.max) : null },
              { label: "Temperature", value: selectedTank.hasWaterReadings ? `${selectedTank.temperature.toFixed(1)} °C` : "Unavailable", status: selectedTank.hasWaterReadings ? rangeStatus(selectedTank.temperature, THRESHOLDS.temperature.min, THRESHOLDS.temperature.max) : null },
              { label: "Salinity", value: selectedTank.hasWaterReadings ? `${selectedTank.salinity.toFixed(1)} ppt` : "Unavailable", status: selectedTank.hasWaterReadings ? rangeStatus(selectedTank.salinity, THRESHOLDS.salinity.min, THRESHOLDS.salinity.max) : null },
              { label: "Water level", value: selectedTank.hasWaterReadings ? `${selectedTank.waterLevel.toFixed(1)}%` : "Unavailable", status: selectedTank.hasWaterReadings ? rangeStatus(selectedTank.waterLevel, THRESHOLDS.waterLevel.min) : null },
              { label: "Biomass", value: `${selectedTank.biomass.toFixed(1)} kg`, status: null },
              { label: "Feed today", value: `${selectedTank.dispensedToday.toFixed(1)} / ${selectedTank.targetToday.toFixed(1)} kg`, status: null },
              { label: "Feed conversion", value: selectedTank.fcr.toFixed(2), status: selectedTank.fcr <= 1.5 ? "ok" : "warn" },
            ].map((metric) => (
              <div key={metric.label} className="min-w-0 rounded-xl border border-[var(--ep-line)] bg-[var(--ep-bg)] p-3">
                <div className="text-[11px] font-medium text-[var(--ep-text-muted)]">{metric.label}</div>
                <div className="mt-1 break-words ep-font-mono text-sm font-semibold text-[var(--ep-text)]">{metric.value}</div>
                {metric.status && (
                  <div className={`mt-1 text-[10px] font-semibold ${metric.status === "warn" ? "text-[var(--ep-status-warning)]" : "text-[var(--ep-status-success)]"}`}>
                    {metric.status === "warn" ? "Needs attention" : "In range"}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <section className="rounded-xl border border-[var(--ep-line)] p-4">
              <h3 className="text-sm font-semibold text-[var(--ep-text)]">Recent dissolved oxygen samples</h3>
              {selectedTankTrend.length ? (
                <ol className="mt-3 flex flex-wrap gap-2">
                  {selectedTankTrend.map((reading, index) => (
                    <li key={`${selectedTank.id}-do-${index}`} className="rounded-lg bg-[var(--ep-bg-subtle)] px-3 py-2 ep-font-mono text-xs text-[var(--ep-text)]">
                      {reading.value.toFixed(2)} mg/L
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="mt-2 text-xs text-[var(--ep-text-muted)]">No historical dissolved oxygen samples are recorded for this tank yet.</p>
              )}
              <p className="mt-2 text-[10px] text-[var(--ep-text-muted)]">Latest samples are shown first; timestamps are not provided by the current trend data.</p>
            </section>
            <section className="rounded-xl border border-[var(--ep-line)] p-4">
              <h3 className="text-sm font-semibold text-[var(--ep-text)]">Latest vision scan</h3>
              {selectedTankScan ? (
                <>
                  <p className="mt-2 text-xs text-[var(--ep-text-muted)]">{selectedTankScan.time}</p>
                  <p className="mt-1 text-sm text-[var(--ep-text)]">{selectedTankScan.note}</p>
                </>
              ) : (
                <p className="mt-2 text-xs text-[var(--ep-text-muted)]">No vision scan is recorded for this tank yet.</p>
              )}
            </section>
          </div>

        </Panel>
      )}

      <Panel title="All Tanks" badge={`${tankCount} tank${tankCount !== 1 ? "s" : ""}`}>
        {tankCount > 0 ? (
          <div className="flex flex-col gap-2.5">
            {tanks.map((t) => (
              <TankRow
                key={t.id}
                {...t}
                onViewDetails={setSelectedTankId}
                onEdit={setEditingTankId}
                onRemove={async (id) => {
                  const removed = await removeTank(id);
                  if (removed) showToast("Tank removed.");
                  else showToast("Could not remove tank. Please try again.", "error");
                }}
              />
            ))}
          </div>
        ) : (
          <div className="py-10 text-center text-[13px] text-[rgba(11,35,32,0.5)]">
            No tanks yet — add one to get started.
          </div>
        )}
      </Panel>

      <EditTankModal
        tank={tanks.find((tank) => tank.id === editingTankId) ?? null}
        onClose={() => setEditingTankId(null)}
        onSave={updateTank}
      />

      <AddTankModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={async (input) => {
          const added = await addTank(input);
          if (added) showToast(`${input.name} added.`);
          else showToast(`Could not save ${input.name}. Please try again.`, "error");
        }}
        existingCount={tankCount}
      />
    </>
  );
}