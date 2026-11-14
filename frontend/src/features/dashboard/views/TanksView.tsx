import { useState } from "react";
import { Panel } from "@/features/dashboard/components/DashboardPrimitives";
import { DonutChart } from "@/features/dashboard/components/AnalyticsCharts";
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
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "ok" | "warn">("all");
  const [sortBy, setSortBy] = useState<"name" | "biomass" | "population">("name");
  const { showToast } = useToast();

  if (loading) return <DashboardViewSkeleton variant="tanks" />;

  const tankCount = tanks.length;
  const visibleTanks = tanks
    .filter((tank) => statusFilter === "all" || tank.status === statusFilter)
    .filter((tank) => !search.trim() || `${tank.name} ${tank.pl}`.toLowerCase().includes(search.trim().toLowerCase()))
    .sort((a, b) => sortBy === "biomass" ? b.biomass - a.biomass : sortBy === "population" ? b.population - a.population : a.name.localeCompare(b.name));

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
            Add, remove, and organize facility tank records.
          </div>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="ep-font-mono inline-flex items-center gap-1.5 rounded-full bg-[var(--coral)] px-4 py-[9px] text-[11px] font-semibold text-[var(--sand)] transition-colors hover:bg-[var(--coral-dim)]"
        >
          + Add Tank
        </button>
      </div>

      {tankCount > 0 && (
        <div className="mb-5">
          <Panel title="Population by post-larvae source" badge="estimated population">
            <DonutChart items={Array.from(tanks.reduce((groups, tank) => {
              groups.set(tank.pl, (groups.get(tank.pl) ?? 0) + tank.population);
              return groups;
            }, new Map<string, number>())).map(([source, value], index) => ({
              label: source, value,
              color: ["#D85A35", "#167C80", "#6D67B2", "#C18A27", "#39865B", "#B34E83"][index % 6],
            }))} unit="shrimp" emptyLabel="No population records available yet." />
          </Panel>
        </div>
      )}

      <Panel title="Tank inventory" badge={`${tankCount} tank${tankCount !== 1 ? "s" : ""}`}>
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