"use client";

import { useState } from "react";
import { Panel, KpiCard } from "@/components/DashboardPrimitives";
import { TankRow } from "@/components/DashboardRows";
import { useTanks } from "@/context/TankContext";
import { AddTankModal } from "./AddTankModal";

export function TanksView() {
  const { tanks, addTank, removeTank } = useTanks();
  const [modalOpen, setModalOpen] = useState(false);

  const tankCount = tanks.length;
  const totalBiomass = tanks.reduce((sum, t) => sum + t.biomass, 0);
  const avgFcr = tankCount ? tanks.reduce((sum, t) => sum + t.fcr, 0) / tankCount : 0;
  const openAlertTanks = tanks.filter((t) => t.status === "warn").length;

  return (
    <>
      <div className="flex justify-between items-start mb-7 flex-wrap gap-4 pb-6 border-b border-[var(--sand-dim)]">
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
          <div className="inline-flex items-center gap-2 bg-white border border-[var(--sand-dim)] px-4 py-[9px] rounded-full text-[12.5px] font-semibold text-[var(--water-deep)] shadow-[0_2px_8px_-4px_rgba(11,35,32,0.12)]">
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

      <Panel title="All Tanks" badge={`${tankCount} tank${tankCount !== 1 ? "s" : ""}`}>
        {tankCount > 0 ? (
          <div className="flex flex-col gap-2.5">
            {tanks.map((t) => (
              <TankRow key={t.id} {...t} onRemove={removeTank} />
            ))}
          </div>
        ) : (
          <div className="py-10 text-center text-[13px] text-[rgba(11,35,32,0.5)]">
            No tanks yet — add one to get started.
          </div>
        )}
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