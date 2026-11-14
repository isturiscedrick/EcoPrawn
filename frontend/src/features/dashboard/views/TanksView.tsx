import { useState } from "react";
import { Panel, KpiCard } from "@/features/dashboard/components/DashboardPrimitives";
import { TankRow } from "@/features/dashboard/components/DashboardRows";
import { useTanks } from "@/features/dashboard/context/TankContext";
import { DashboardViewSkeleton } from "@/features/dashboard/components/DashboardStates";
import { AddTankModal } from "@/features/dashboard/components/AddTankModal";
import { EditTankModal } from "@/features/dashboard/components/EditTankModal";
import { useToast } from "@/features/dashboard/components/Toast";

export function TanksView() {
  const { tanks, addTank, removeTank, updateTank, loading } = useTanks();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTankId, setEditingTankId] = useState<string | null>(null);
  const { showToast } = useToast();

  if (loading) return <DashboardViewSkeleton variant="tanks" />;

  const tankCount = tanks.length;
  const totalBiomass = tanks.reduce((sum, t) => sum + t.biomass, 0);
  const openAlertTanks = tanks.filter((t) => t.status === "warn").length;

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
      </div>


      <Panel title="All Tanks" badge={`${tankCount} tank${tankCount !== 1 ? "s" : ""}`}>
        {tankCount > 0 ? (
          <div className="flex flex-col gap-2.5">
            {tanks.map((t) => (
              <TankRow
                key={t.id}
                {...t}
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