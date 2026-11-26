import { Fragment, useState } from "react";
import { useEsp32 } from "@/features/dashboard/context/Esp32Context";
import { Icon } from "@/components/ui/Icon";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { AddTankModal } from "@/features/dashboard/components/AddTankModal";
import { EditTankModal } from "@/features/dashboard/components/EditTankModal";
import { DashboardViewSkeleton } from "@/features/dashboard/components/DashboardStates";
import { useTanks, type Tank, type NewTankInput } from "@/features/dashboard/context/TankContext";
import { recordAuditEvent } from "@/features/dashboard/lib/audit-log";
import { DashboardPageHeader } from "@/features/dashboard/components/DashboardPageHeader";

export function TanksView() {
  const { tanks, loading, error, addTank, updateTank, removeTank } = useTanks();
  const { status: esp32Status, tankId: connectedTankId } = useEsp32();
  const [adding, setAdding] = useState(false);
  const [editingTank, setEditingTank] = useState<Tank | null>(null);
  const [deletingTank, setDeletingTank] = useState<Tank | null>(null);
  const [actionError, setActionError] = useState("");
  const [expandedTankId, setExpandedTankId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "healthy" | "attention">("all");

  async function handleAdd(input: NewTankInput) {
    setActionError("");
    const saved = await addTank(input);
    if (saved) recordAuditEvent({ entity: "Tank", action: "Created tank", target: input.name, details: `Created tank record for PL batch ${input.pl}.` });
    if (!saved) setActionError("Unable to add this tank. Please check the details and try again.");
  }

  async function handleEdit(id: string, patch: Pick<Tank, "name" | "pl" | "biomass" | "targetToday" | "dispensedToday" | "fcr">) {
    const tankName = tanks.find(tank => tank.id === id)?.name ?? id;
    const saved = await updateTank(id, patch);
    if (saved) recordAuditEvent({ entity: "Tank", action: "Updated tank", target: patch.name ?? tankName, details: `Updated tank details: ${Object.keys(patch).join(", ")}.` });
    if (!saved) setActionError("Unable to update this tank. Please try again.");
    return saved;
  }

  async function handleDelete() {
    if (!deletingTank) return;
    const tank = deletingTank;
    setDeletingTank(null);
    setActionError("");
    const removed = await removeTank(tank.id);
    if (removed) recordAuditEvent({ entity: "Tank", action: "Deleted tank", target: tank.name, details: `Removed tank record for PL batch ${tank.pl}.` });
    if (!removed) setActionError(`Unable to delete ${tank.name}. Please try again.`);
  }

  const normalizedSearch = searchTerm.trim().toLocaleLowerCase();
  const filteredTanks = tanks.filter(tank => {
    const displayId = `#${tank.id.replace(/^tank-?/i, "").padStart(2, "0") || tank.id}`.toLocaleLowerCase();
    const matchesSearch =
      !normalizedSearch ||
      tank.name.toLocaleLowerCase().includes(normalizedSearch) ||
      tank.pl.toLocaleLowerCase().includes(normalizedSearch) ||
      tank.id.toLocaleLowerCase().includes(normalizedSearch) ||
      displayId.includes(normalizedSearch);
    const matchesStatus = statusFilter === "all" || (statusFilter === "healthy" ? tank.status === "ok" : tank.status !== "ok");
    return matchesSearch && matchesStatus;
  });

  if (loading) return <DashboardViewSkeleton variant="tanks" />;

  return (
    <div className="tanks-page mx-auto w-full max-w-none space-y-4 sm:space-y-6">
      <DashboardPageHeader
        eyebrow="Facility management"
        title="Tanks"
        description="Stocking records and live tank metrics."
        actions={<button
          type="button"
          onClick={() => setAdding(true)}
          className="inline-flex min-h-11 w-auto items-center justify-center gap-2 rounded-xl bg-[var(--ep-accent)] px-4 py-2.5 text-sm font-semibold text-[var(--ep-on-accent)] shadow-sm transition hover:bg-[var(--ep-accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ep-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ep-bg)]"
        >
          <Icon name="plus" size={17} /> Add tank
        </button>}
      />

      <section className="grid grid-cols-3 gap-2 sm:gap-3">
        <div className="rounded-2xl border border-[var(--ep-line)] bg-[var(--ep-surface)] p-3 shadow-sm sm:p-4">
          <p className="text-[10px] font-medium leading-tight text-[var(--ep-text-muted)] sm:text-xs">Total tanks</p>
          <p className="mt-1.5 text-xl font-semibold tabular-nums text-[var(--ep-text)] sm:mt-2 sm:text-2xl">{tanks.length}</p>
        </div>
        <div className="rounded-2xl border border-[var(--ep-line)] bg-[var(--ep-surface)] p-3 shadow-sm sm:p-4">
          <p className="text-[10px] font-medium leading-tight text-[var(--ep-text-muted)] sm:text-xs">Healthy</p>
          <p className="mt-1.5 text-xl font-semibold tabular-nums text-emerald-600 sm:mt-2 sm:text-2xl">{tanks.filter(tank => tank.status === "ok").length}</p>
        </div>
        <div className="rounded-2xl border border-[var(--ep-line)] bg-[var(--ep-surface)] p-3 shadow-sm sm:p-4">
          <p className="text-[10px] font-medium leading-tight text-[var(--ep-text-muted)] sm:text-xs">Attention</p>
          <p className="mt-1.5 text-xl font-semibold tabular-nums text-amber-600 sm:mt-2 sm:text-2xl">{tanks.filter(tank => tank.status !== "ok").length}</p>
        </div>
      </section>

      {(error || actionError) && (
        <p role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-sm text-rose-700 dark:text-rose-300">
          {actionError || error}
        </p>
      )}

      <section className="space-y-4" aria-labelledby="tank-list-heading">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 id="tank-list-heading" className="text-base font-semibold text-[var(--ep-text)]">
              All facility tanks
            </h2>
          </div>
          <div className="flex w-full flex-col gap-2.5 sm:w-auto sm:flex-row sm:items-center">
            <label className="relative block min-w-0 sm:w-64">
              <span className="sr-only">Search tanks by ID, name, or PL batch</span>
              <Icon name="search" size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ep-text-muted)]" />
              <input
                type="search"
                value={searchTerm}
                onChange={event => setSearchTerm(event.target.value)}
                placeholder="Search by ID, name, or batch…"
                className="min-h-11 w-full touch-manipulation rounded-xl border border-[var(--ep-line)] bg-[var(--ep-surface)] py-2 pl-9 pr-3 text-sm text-[var(--ep-text)] outline-none transition placeholder:text-[var(--ep-text-muted)] focus:border-[var(--ep-primary)] focus:ring-2 focus:ring-[var(--ep-primary)]/15"
              />
            </label>
            <label className="block sm:w-44">
              <span className="sr-only">Filter tanks by health status</span>
              <select
                value={statusFilter}
                onChange={event => setStatusFilter(event.target.value as "all" | "healthy" | "attention")}
                className="min-h-11 w-full touch-manipulation rounded-xl border border-[var(--ep-line)] bg-[var(--ep-surface)] px-3 py-2 text-sm font-medium text-[var(--ep-text)] outline-none transition focus:border-[var(--ep-primary)] focus:ring-2 focus:ring-[var(--ep-primary)]/15"
              >
                <option value="all">All statuses</option>
                <option value="healthy">Healthy only</option>
                <option value="attention">Needs attention</option>
              </select>
            </label>
            <span className="whitespace-nowrap rounded-full border border-[var(--ep-line)] px-3 py-2 text-xs font-medium text-[var(--ep-text-muted)]">
              {filteredTanks.length} of {tanks.length} shown
            </span>
          </div>
        </div>

        {tanks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--ep-line)] bg-[var(--ep-surface)] px-5 py-14 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--ep-tint)] text-[var(--ep-primary)]">
              <Icon name="layers" size={22} />
            </div>
            <h3 className="mt-4 text-sm font-semibold text-[var(--ep-text)]">No tanks registered yet</h3>
            <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-[var(--ep-text-muted)]">
              Create a tank record to start tracking stocking biomass and sensor telemetry.
            </p>
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-xl bg-[var(--ep-accent)] px-4 text-sm font-semibold text-[var(--ep-on-accent)] shadow-sm transition hover:bg-[var(--ep-accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ep-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ep-surface)]"
            >
              <Icon name="plus" size={16} /> Add tank
            </button>
          </div>
        ) : filteredTanks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--ep-line)] bg-[var(--ep-surface)] px-5 py-10 text-center">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--ep-tint)] text-[var(--ep-primary)]">
              <Icon name="search" size={20} />
            </div>
            <h3 className="mt-3 text-sm font-semibold text-[var(--ep-text)]">No matching tanks found</h3>
            <p className="mt-1 text-sm text-[var(--ep-text-muted)]">Try another ID, name, batch, or status filter.</p>
            <button
              type="button"
              onClick={() => { setSearchTerm(""); setStatusFilter("all"); }}
              className="mt-4 inline-flex min-h-9 items-center rounded-lg border border-[var(--ep-line)] px-3 text-xs font-semibold text-[var(--ep-primary)] transition hover:bg-[var(--ep-tint)]"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-[var(--ep-line)] bg-[var(--ep-surface)] shadow-sm">
            <table className="w-full min-w-[850px] border-collapse text-left text-sm">
              <caption className="sr-only">Facility tanks and their current metrics</caption>
              <thead className="bg-[var(--ep-bg)] text-xs uppercase tracking-wide text-[var(--ep-text-muted)]">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">Tank</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Status</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Biomass</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Population</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Temp / pH</th>
                  <th scope="col" className="px-4 py-3 font-semibold">ESP32</th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--ep-line)]">
                {filteredTanks.map(tank => {
                  const displayId = `#${tank.id.replace(/^tank-?/i, "").padStart(2, "0") || tank.id}`;
                  const isExpanded = expandedTankId === tank.id;
                  const isConnected = esp32Status === "connected" && connectedTankId === tank.id;

                  return (
                    <Fragment key={tank.id}>
                      <tr className="text-[var(--ep-text)] hover:bg-[var(--ep-tint)]/40">
                        <th scope="row" className="px-4 py-4 font-normal">
                          <div className="font-semibold">{tank.name}</div>
                          <div className="mt-0.5 text-xs text-[var(--ep-text-muted)]">
                            {displayId} · PL batch {tank.pl}
                          </div>
                        </th>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${tank.status === "ok" ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : "bg-amber-500/10 text-amber-700 dark:text-amber-300"}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${tank.status === "ok" ? "bg-emerald-500" : "bg-amber-500"}`} />
                            {tank.status === "ok" ? "Healthy" : "Attention"}
                          </span>
                        </td>
                        <td className="px-4 py-4 tabular-nums">{tank.biomass.toLocaleString()} kg</td>
                        <td className="px-4 py-4 tabular-nums">{tank.population.toLocaleString()}</td>
                        <td className="px-4 py-4 tabular-nums">
                          {tank.hasWaterReadings ? `${tank.temperature.toFixed(1)} °C · pH ${tank.ph.toFixed(1)}` : "—"}
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${isConnected ? "text-emerald-700 dark:text-emerald-300" : "text-[var(--ep-text-muted)]"}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${isConnected ? "bg-emerald-500" : "bg-slate-400"}`} />
                            {isConnected ? "Connected" : "Offline"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              aria-expanded={isExpanded}
                              aria-controls={`tank-details-${tank.id}`}
                              aria-label={`${isExpanded ? "Hide" : "View"} details for ${tank.name}`}
                              onClick={() => setExpandedTankId(isExpanded ? null : tank.id)}
                              className="inline-flex min-h-10 items-center justify-center rounded-lg px-2 text-xs font-semibold text-[var(--ep-primary)] hover:bg-[var(--ep-tint)]"
                            >
                              {isExpanded ? "Hide" : "Details"}
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingTank(tank)}
                              aria-label={`Edit ${tank.name}`}
                              className="inline-flex min-h-10 items-center gap-1 rounded-lg border border-[var(--ep-line)] px-2.5 text-xs font-semibold text-[var(--ep-text)] hover:bg-[var(--ep-tint)]"
                            >
                              <Icon name="pencil" size={13} /> Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeletingTank(tank)}
                              aria-label={`Delete ${tank.name}`}
                              className="inline-flex min-h-10 items-center justify-center rounded-lg border border-red-500/25 px-2.5 text-rose-600 hover:bg-rose-500/10"
                            >
                              <Icon name="trash-2" size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr id={`tank-details-${tank.id}`}>
                          <td colSpan={7} className="bg-[var(--ep-bg)] px-4 py-4">
                            <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm sm:grid-cols-4 lg:grid-cols-6">
                              <div><p className="text-xs text-[var(--ep-text-muted)]">Dissolved oxygen</p><p className="mt-1 font-semibold">{tank.hasWaterReadings ? `${tank.dissolvedOxygen.toFixed(1)} mg/L` : "—"}</p></div>
                              <div><p className="text-xs text-[var(--ep-text-muted)]">Salinity</p><p className="mt-1 font-semibold">{tank.hasWaterReadings ? `${tank.salinity.toFixed(1)} ppt` : "—"}</p></div>
                              <div><p className="text-xs text-[var(--ep-text-muted)]">Water level</p><p className="mt-1 font-semibold">{tank.hasWaterReadings ? `${tank.waterLevel.toFixed(1)}%` : "—"}</p></div>
                              <div><p className="text-xs text-[var(--ep-text-muted)]">Avg. body length</p><p className="mt-1 font-semibold">{tank.bodyLength > 0 ? `${tank.bodyLength.toFixed(1)} cm` : "—"}</p></div>
                              <div><p className="text-xs text-[var(--ep-text-muted)]">Avg. weight</p><p className="mt-1 font-semibold">{tank.weight > 0 ? `${tank.weight.toFixed(2)} g` : "—"}</p></div>
                              <div><p className="text-xs text-[var(--ep-text-muted)]">Abnormal count</p><p className="mt-1 font-semibold">{tank.abnormal.toLocaleString()}</p></div>
                              <div><p className="text-xs text-[var(--ep-text-muted)]">Feed conversion</p><p className="mt-1 font-semibold">{tank.fcr.toFixed(2)}</p></div>
                              <div><p className="text-xs text-[var(--ep-text-muted)]">Feed target</p><p className="mt-1 font-semibold">{tank.targetToday.toLocaleString()} kg</p></div>
                              <div><p className="text-xs text-[var(--ep-text-muted)]">Feed dispensed</p><p className="mt-1 font-semibold">{tank.dispensedToday.toLocaleString()} kg</p></div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
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
