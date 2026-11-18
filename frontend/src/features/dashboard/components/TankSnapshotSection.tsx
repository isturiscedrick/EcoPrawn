import { Link } from "@tanstack/react-router";
import { Icon } from "@/components/ui/Icon";
import type { Tank } from "@/features/dashboard/context/TankContext";

type StatusFilter = "all" | "healthy" | "attention" | "no-readings";

interface TankSnapshotSectionProps {
  tanks: Tank[];
  search: string;
  statusFilter: StatusFilter;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: StatusFilter) => void;
}

const value = (number: number, unit = "") => Number.isFinite(number) ? `${number.toFixed(1)}${unit ? ` ${unit}` : ""}` : "—";

export function TankSnapshotSection({
  tanks, search, statusFilter, onSearchChange, onStatusFilterChange,
}: TankSnapshotSectionProps) {
  return (
    <section aria-labelledby="tank-snapshot-heading" className="mb-6 overflow-hidden rounded-2xl border border-[var(--ep-line)] bg-[var(--ep-surface)] shadow-sm">
      <div className="flex flex-col gap-3 border-b border-[var(--ep-line)] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div>
          <h2 id="tank-snapshot-heading" className="ep-font-display text-lg font-semibold text-[var(--ep-text)]">Tank snapshot</h2>
          <p className="mt-1 text-xs text-[var(--ep-text-muted)]">Live water parameters and biomass for each tank.</p>
        </div>
        <Link to="/dashboard/tanks" className="inline-flex min-h-9 items-center gap-1 self-start rounded-lg px-3 text-xs font-semibold text-[var(--ep-accent)] transition-colors hover:bg-[var(--ep-accent-tint)] sm:self-auto">
          Manage tanks <Icon name="arrow-up-right" size={14} />
        </Link>
      </div>

      <div className="flex flex-col gap-3 border-b border-[var(--ep-line)] p-4 sm:flex-row sm:items-center">
        <label className="relative block min-w-0 flex-1">
          <span className="sr-only">Search tanks</span>
          <Icon name="search" size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ep-text-muted)]" />
          <input type="search" value={search} onChange={event => onSearchChange(event.target.value)} placeholder="Search tank name or PL batch" className="min-h-10 w-full rounded-xl border border-[var(--ep-line)] bg-[var(--ep-bg)] py-2 pl-9 pr-3 text-sm text-[var(--ep-text)] outline-none focus:border-[var(--ep-primary)]" />
        </label>
        <label className="flex items-center gap-2 text-xs font-semibold text-[var(--ep-text-muted)]">
          <span>Status</span>
          <select value={statusFilter} onChange={event => onStatusFilterChange(event.target.value as StatusFilter)} className="min-h-10 min-w-36 rounded-xl border border-[var(--ep-line)] bg-[var(--ep-bg)] px-3 text-sm text-[var(--ep-text)] outline-none focus:border-[var(--ep-primary)]">
            <option value="all">All statuses</option>
            <option value="healthy">Healthy</option>
            <option value="attention">Needs attention</option>
            <option value="no-readings">No readings</option>
          </select>
        </label>
      </div>

      {tanks.length ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] border-collapse text-left text-sm">
            <thead className="bg-[var(--ep-bg)] text-[10px] font-semibold uppercase tracking-[.1em] text-[var(--ep-text-muted)]">
              <tr>
                <th className="px-4 py-3">Tank</th><th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">DO</th><th className="px-3 py-3">pH</th>
                <th className="px-3 py-3">Temperature</th><th className="px-3 py-3">Salinity</th>
                <th className="px-3 py-3">Water level</th><th className="px-4 py-3 text-right">Total biomass</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--ep-line)]">
              {tanks.map(tank => {
                const status = !tank.hasWaterReadings ? "No readings" : tank.status === "ok" ? "Healthy" : "Needs attention";
                const statusClass = !tank.hasWaterReadings ? "bg-slate-500/10 text-[var(--ep-text-muted)]" : tank.status === "ok" ? "bg-[var(--ep-status-success)]/10 text-[var(--ep-status-success)]" : "bg-[var(--ep-status-warning)]/10 text-[var(--ep-status-warning)]";
                return (
                  <tr key={tank.id} className="transition-colors hover:bg-[var(--ep-tint)]/50">
                    <td className="px-4 py-3">
                      <Link to="/dashboard/water" onClick={() => window.sessionStorage.setItem("ecoprawn.dashboard.selected-tank", tank.id)} className="font-semibold text-[var(--ep-text)] hover:text-[var(--ep-primary)]">{tank.name}</Link>
                      <div className="mt-0.5 text-[11px] text-[var(--ep-text-muted)]">{tank.pl}</div>
                    </td>
                    <td className="px-3 py-3"><span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ${statusClass}`}>{status}</span></td>
                    <td className="px-3 py-3 tabular-nums text-[var(--ep-text)]">{tank.hasWaterReadings ? value(tank.dissolvedOxygen, "mg/L") : "—"}</td>
                    <td className="px-3 py-3 tabular-nums text-[var(--ep-text)]">{tank.hasWaterReadings ? value(tank.ph) : "—"}</td>
                    <td className="px-3 py-3 tabular-nums text-[var(--ep-text)]">{tank.hasWaterReadings ? value(tank.temperature, "°C") : "—"}</td>
                    <td className="px-3 py-3 tabular-nums text-[var(--ep-text)]">{tank.hasWaterReadings ? value(tank.salinity, "ppt") : "—"}</td>
                    <td className="px-3 py-3 tabular-nums text-[var(--ep-text)]">{tank.hasWaterReadings ? value(tank.waterLevel, "%") : "—"}</td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums text-[var(--ep-text)]">{value(tank.biomass, "kg")}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="px-5 py-12 text-center">
          <Icon name="search" size={25} className="mx-auto mb-2 text-[var(--ep-text-muted)]" />
          <p className="text-sm font-semibold text-[var(--ep-text)]">No tanks match these filters</p>
          <p className="mt-1 text-xs text-[var(--ep-text-muted)]">Try another search term or status.</p>
        </div>
      )}
      <div className="border-t border-[var(--ep-line)] px-4 py-3 text-xs text-[var(--ep-text-muted)]">
        Showing {tanks.length} tank{tanks.length === 1 ? "" : "s"} in the current view
      </div>
    </section>
  );
}
