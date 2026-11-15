import { useMemo, useState } from "react";
import { DashboardViewSkeleton } from "@/features/dashboard/components/DashboardStates";
import { Esp32Connection } from "@/features/dashboard/components/Esp32Connection";
import { useEsp32 } from "@/features/dashboard/context/Esp32Context";
import { useTanks } from "@/features/dashboard/context/TankContext";

export function TanksView() {
  const { tanks, loading, error: tanksError } = useTanks();
  const { status, tankId: connectedTankId } = useEsp32();
  const [selectedTankId, setSelectedTankId] = useState<string | null>(null);

  const selectedTank = useMemo(
    () =>
      tanks.find((tank) => tank.id === selectedTankId) ??
      tanks.find((tank) => tank.id === connectedTankId) ??
      tanks[0] ??
      null,
    [tanks, selectedTankId, connectedTankId],
  );

  if (loading) return <DashboardViewSkeleton variant="tanks" />;

  const statusLabel =
    status === "connected"
      ? "Connected"
      : status === "connecting"
        ? "Connecting"
        : "Disconnected";

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <header className="dashboard-page-header border-b border-[var(--ep-line)] pb-6">
        <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--ep-primary)]">
          Settings
        </div>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-[var(--ep-text)] sm:text-3xl">
              Configuration
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--ep-text-muted)]">
              Configure the ESP32 USB connection for a tank. Choose the tank,
              connect the device, and optionally calibrate its water-level sensor.
            </p>
          </div>
          <span
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold ${
              status === "connected"
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                : status === "connecting"
                  ? "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300"
                  : "border-[var(--ep-line)] bg-[var(--ep-surface)] text-[var(--ep-text-muted)]"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                status === "connected"
                  ? "bg-emerald-500"
                  : status === "connecting"
                    ? "bg-amber-500"
                    : "bg-[var(--ep-text-muted)]"
              }`}
            />
            ESP32 {statusLabel}
          </span>
        </div>
      </header>

      <section className="overflow-hidden rounded-2xl border border-[var(--ep-line)] bg-[var(--ep-surface)] shadow-sm">
        <div className="border-b border-[var(--ep-line)] px-5 py-4 sm:px-6">
          <h2 className="text-base font-semibold text-[var(--ep-text)]">
            ESP32 device connection
          </h2>
          <p className="mt-1 text-sm leading-5 text-[var(--ep-text-muted)]">
            Select the tank this device will send readings to, then manage its
            USB connection.
          </p>
        </div>

        <div className="space-y-5 p-5 sm:p-6">
          {tanksError && (
            <p
              role="alert"
              className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-300"
            >
              {tanksError}
            </p>
          )}

          {tanks.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[var(--ep-line)] px-5 py-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--ep-tint)] text-[var(--ep-primary)]">
                <span aria-hidden="true" className="text-xl">⌁</span>
              </div>
              <h3 className="mt-4 text-sm font-semibold text-[var(--ep-text)]">
                No tanks available for configuration
              </h3>
              <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-[var(--ep-text-muted)]">
                Add a tank before assigning an ESP32 device. Tank management
                remains separate from this configuration page.
              </p>
            </div>
          ) : (
            <>
              <div className="max-w-xl">
                <label
                  htmlFor="esp32-tank-select"
                  className="mb-2 block text-sm font-semibold text-[var(--ep-text)]"
                >
                  Tank assignment
                </label>
                <select
                  id="esp32-tank-select"
                  value={selectedTank?.id ?? ""}
                  onChange={(event) => setSelectedTankId(event.target.value)}
                  disabled={status !== "disconnected"}
                  className="min-h-11 w-full rounded-xl border border-[var(--ep-line)] bg-[var(--ep-bg)] px-3 text-sm text-[var(--ep-text)] outline-none transition focus:border-[var(--ep-primary)] focus:ring-2 focus:ring-[var(--ep-primary)]/15 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {tanks.map((tank) => (
                    <option key={tank.id} value={tank.id}>
                      {tank.name}
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-xs leading-5 text-[var(--ep-text-muted)]">
                  {status === "disconnected"
                    ? "Choose the tank that should receive readings from this ESP32."
                    : "Disconnect the ESP32 before changing its tank assignment."}
                </p>
              </div>

              {selectedTank && (
                <div className="border-t border-[var(--ep-line)] pt-5">
                  <Esp32Connection
                    key={selectedTank.id}
                    tankId={selectedTank.id}
                    tankName={selectedTank.name}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
