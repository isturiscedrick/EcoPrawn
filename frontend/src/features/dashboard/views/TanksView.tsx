import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { AddTankModal } from "@/features/dashboard/components/AddTankModal";
import { EditTankModal } from "@/features/dashboard/components/EditTankModal";
import { DashboardViewSkeleton } from "@/features/dashboard/components/DashboardStates";
import { useTanks, type Tank, type NewTankInput } from "@/features/dashboard/context/TankContext";

export function TanksView() {
  const { tanks, loading, error, addTank, updateTank, removeTank, isDbConnected, lastUpdatedAt } = useTanks();
  const [adding, setAdding] = useState(false);
  const [editingTank, setEditingTank] = useState<Tank | null>(null);
  const [deletingTank, setDeletingTank] = useState<Tank | null>(null);
  const [actionError, setActionError] = useState("");

  async function handleAdd(input: NewTankInput) {
    setActionError("");
    const saved = await addTank(input);
    if (!saved) setActionError("Unable to add this tank. Please check the details and try again.");
  }

  async function handleEdit(id: string, patch: Pick<Tank, "name" | "pl" | "biomass" | "targetToday" | "dispensedToday" | "fcr">) {
    const saved = await updateTank(id, patch);
    if (!saved) setActionError("Unable to update this tank. Please try again.");
    return saved;
  }

  async function handleDelete() {
    if (!deletingTank) return;
    const tank = deletingTank;
    setDeletingTank(null);
    setActionError("");
    const removed = await removeTank(tank.id);
    if (!removed) setActionError(`Unable to delete ${tank.name}. Please try again.`);
  }

  if (loading) return <DashboardViewSkeleton variant="tanks" />;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <header className="flex flex-col gap-4 border-b border-[var(--ep-line)] pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--ep-primary)]">Facility management</p>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--ep-text)] sm:text-3xl">Tanks</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--ep-text-muted)]">Add, view, and maintain your facility tanks and their production details.</p>
        </div>
        <button type="button" onClick={() => setAdding(true)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[var(--ep-primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ep-primary)] focus-visible:ring-offset-2">
          <Icon name="plus" size={17} /> Add tank
        </button>
      </header>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-[var(--ep-line)] bg-[var(--ep-surface)] p-4">
          <p className="text-xs text-[var(--ep-text-muted)]">Total tanks</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-[var(--ep-text)]">{tanks.length}</p>
        </div>
        <div className="rounded-2xl border border-[var(--ep-line)] bg-[var(--ep-surface)] p-4">
          <p className="text-xs text-[var(--ep-text-muted)]">Healthy tanks</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-emerald-600">{tanks.filter(tank => tank.status === "ok").length}</p>
        </div>
        <div className="rounded-2xl border border-[var(--ep-line)] bg-[var(--ep-surface)] p-4">
          <p className="text-xs text-[var(--ep-text-muted)]">Needs attention</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-amber-600">{tanks.filter(tank => tank.status !== "ok").length}</p>
        </div>
      </section>

      {(error || actionError) && <p role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-300">{actionError || error}</p>}

      <section className="space-y-3" aria-labelledby="tank-list-heading">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 id="tank-list-heading" className="text-base font-semibold text-[var(--ep-text)]">All tanks</h2>
            <p className="mt-1 text-xs text-[var(--ep-text-muted)]">{isDbConnected ? "Facility data is synced." : "Unable to confirm the latest server connection."}{lastUpdatedAt ? ` Last updated ${lastUpdatedAt.toLocaleTimeString()}.` : ""}</p>
          </div>
          <span className="rounded-full border border-[var(--ep-line)] px-3 py-1 text-xs font-medium text-[var(--ep-text-muted)]">{tanks.length} {tanks.length === 1 ? "tank" : "tanks"}</span>
        </div>

        {tanks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--ep-line)] bg-[var(--ep-surface)] px-5 py-14 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--ep-tint)] text-[var(--ep-primary)]"><Icon name="layers" size={22} /></div>
            <h3 className="mt-4 text-sm font-semibold text-[var(--ep-text)]">No tanks yet</h3>
            <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-[var(--ep-text-muted)]">Create your first tank to start organizing facility records and monitoring its production details.</p>
            <button type="button" onClick={() => setAdding(true)} className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-lg bg-[var(--ep-primary)] px-4 text-sm font-semibold text-white hover:opacity-90"><Icon name="plus" size={16} /> Add your first tank</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {tanks.map(tank => (
              <article key={tank.id} className="rounded-2xl border border-[var(--ep-line)] bg-[var(--ep-surface)] p-5 shadow-sm transition hover:shadow-md">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--ep-tint)] text-[var(--ep-primary)]"><Icon name="layers" size={20} /></div>
                    <div className="min-w-0">
                      <h3 className="truncate text-base font-semibold text-[var(--ep-text)]">{tank.name}</h3>
                      <p className="mt-0.5 text-xs text-[var(--ep-text-muted)]">PL batch: {tank.pl}</p>
                    </div>
                  </div>
                  <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${tank.status === "ok" ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : "bg-amber-500/10 text-amber-700 dark:text-amber-300"}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${tank.status === "ok" ? "bg-emerald-500" : "bg-amber-500"}`} />{tank.status === "ok" ? "Healthy" : "Needs attention"}
                  </span>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div><p className="text-[11px] text-[var(--ep-text-muted)]">Biomass</p><p className="mt-1 text-sm font-semibold text-[var(--ep-text)]">{tank.biomass.toLocaleString()} kg</p></div>
                  <div><p className="text-[11px] text-[var(--ep-text-muted)]">Population</p><p className="mt-1 text-sm font-semibold text-[var(--ep-text)]">{tank.population.toLocaleString()}</p></div>
                  <div><p className="text-[11px] text-[var(--ep-text-muted)]">Temperature</p><p className="mt-1 text-sm font-semibold text-[var(--ep-text)]">{tank.hasWaterReadings ? `${tank.temperature.toFixed(1)} °C` : "—"}</p></div>
                  <div><p className="text-[11px] text-[var(--ep-text-muted)]">pH level</p><p className="mt-1 text-sm font-semibold text-[var(--ep-text)]">{tank.hasWaterReadings ? tank.ph.toFixed(1) : "—"}</p></div>
                </div>
                <div className="mt-5 flex justify-end gap-2 border-t border-[var(--ep-line)] pt-4">
                  <button type="button" onClick={() => setEditingTank(tank)} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-[var(--ep-line)] px-3 text-xs font-semibold text-[var(--ep-text)] transition hover:bg-[var(--ep-tint)]"><Icon name="pencil" size={14} /> Edit</button>
                  <button type="button" onClick={() => setDeletingTank(tank)} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-red-500/25 px-3 text-xs font-semibold text-red-600 transition hover:bg-red-500/10"><Icon name="trash-2" size={14} /> Delete</button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <AddTankModal open={adding} onClose={() => setAdding(false)} onSubmit={handleAdd} existingCount={tanks.length} />
      <EditTankModal tank={editingTank} onClose={() => setEditingTank(null)} onSave={handleEdit} />
      <ConfirmDialog
        open={Boolean(deletingTank)}
        title={deletingTank ? `Delete ${deletingTank.name}?` : "Delete tank?"}
        description="This will remove the tank from the facility. This action cannot be undone."
        confirmLabel="Delete tank"
        tone="danger"
        onCancel={() => setDeletingTank(null)}
        onConfirm={() => void handleDelete()}
      />
    </div>
  );
}
