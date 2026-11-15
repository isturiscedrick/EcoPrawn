import { useMemo, useState } from "react";
import { Panel } from "@/features/dashboard/components/DashboardPrimitives";
import { DashboardViewSkeleton } from "@/features/dashboard/components/DashboardStates";
import { Esp32Connection } from "@/features/dashboard/components/Esp32Connection";
import { useEsp32 } from "@/features/dashboard/context/Esp32Context";
import { useTanks } from "@/features/dashboard/context/TankContext";

export function TanksView() {
  const { tanks, loading, error: tanksError } = useTanks();
  const { supported, status, tankId: connectedTankId, saved, reading, error: deviceError } = useEsp32();
  const [selectedTankId, setSelectedTankId] = useState<string | null>(null);

  const selectedTank = useMemo(
    () => tanks.find((tank) => tank.id === selectedTankId) ?? tanks.find((tank) => tank.id === connectedTankId) ?? tanks[0] ?? null,
    [tanks, selectedTankId, connectedTankId],
  );

  if (loading) return <DashboardViewSkeleton variant="tanks" />;

  const connectedTank = tanks.find((tank) => tank.id === connectedTankId);
  const statusLabel = status === "connected" ? "USB connected" : status === "connecting" ? "Connecting" : "Disconnected";

  return (
    <div className="space-y-6">
      <header className="dashboard-page-header border-b border-[var(--ep-line)] pb-6">
        <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--ep-primary)]">Device management</div>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-[var(--ep-text)] sm:text-3xl">Configuration</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--ep-text-muted)]">Connect your ESP32 over USB, assign it to a tank, and monitor incoming temperature and water-distance readings.</p>
          </div>
          <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold ${status === "connected" ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : status === "connecting" ? "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300" : "border-[var(--ep-line)] bg-[var(--ep-surface)] text-[var(--ep-text-muted)]"}`}>
            <span className={`h-2 w-2 rounded-full ${status === "connected" ? "bg-emerald-500" : status === "connecting" ? "bg-amber-500" : "bg-[var(--ep-text-muted)]"}`} />
            {statusLabel}
          </span>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-[var(--ep-line)] bg-[var(--ep-surface)] p-4">
          <div className="text-xs text-[var(--ep-text-muted)]">Registered tanks</div>
          <div className="mt-2 text-2xl font-semibold tabular-nums text-[var(--ep-text)]">{tanks.length}</div>
        </div>
        <div className="rounded-2xl border border-[var(--ep-line)] bg-[var(--ep-surface)] p-4">
          <div className="text-xs text-[var(--ep-text-muted)]">USB device</div>
          <div className="mt-2 text-lg font-semibold text-[var(--ep-text)]">{statusLabel}</div>
          <div className="mt-1 truncate text-xs text-[var(--ep-text-muted)]">{connectedTank?.name ?? (status === "connected" ? "Assigned tank unavailable" : "No active tank assignment")}</div>
        </div>
        <div className="rounded-2xl border border-[var(--ep-line)] bg-[var(--ep-surface)] p-4">
          <div className="text-xs text-[var(--ep-text-muted)]">Readings this session</div>
          <div className="mt-2 text-2xl font-semibold tabular-nums text-[var(--ep-text)]">{saved}</div>
          <div className="mt-1 text-xs text-[var(--ep-text-muted)]">Saved through the existing hardware API</div>
        </div>
      </section>

      <Panel title="ESP32 connection" badge="USB · 115200 baud">
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-[var(--ep-line)] bg-[var(--ep-bg)] p-4">
          <span className="mt-0.5 text-[var(--ep-primary)]" aria-hidden="true">ⓘ</span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[var(--ep-text)]">Before connecting</p>
            <p className="mt-1 text-xs leading-5 text-[var(--ep-text-muted)]">Connect the ESP32 to this computer with USB and close Arduino Serial Monitor. Use Chrome or Edge on localhost or HTTPS. Select the tank below, then use the connection control to choose the ESP32 serial port.</p>
          </div>
        </div>
        {supported === false && <p role="status" className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-300">Web Serial is not available in this browser or context. Open this page in a supported browser using localhost or HTTPS.</p>}
        {tanksError && <p role="alert" className="mb-4 text-sm text-red-600">{tanksError}</p>}
        {deviceError && <p role="alert" className="mb-4 text-sm text-amber-700 dark:text-amber-300">{deviceError}</p>}
        {tanks.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[var(--ep-line)] px-5 py-10 text-center">
            <p className="font-semibold text-[var(--ep-text)]">No tanks available</p>
            <p className="mt-1 text-sm text-[var(--ep-text-muted)]">Create a tank first before assigning an ESP32 connection.</p>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <label htmlFor="esp32-tank-select" className="mb-2 block text-xs font-semibold text-[var(--ep-text-muted)]">Assign this ESP32 connection to a tank</label>
              <select id="esp32-tank-select" value={selectedTank?.id ?? ""} onChange={(event) => setSelectedTankId(event.target.value)} disabled={status !== "disconnected"} className="min-h-11 w-full max-w-md rounded-xl border border-[var(--ep-line)] bg-[var(--ep-surface)] px-3 text-sm text-[var(--ep-text)] outline-none focus:border-[var(--ep-primary)] disabled:opacity-60">
                {tanks.map((tank) => <option key={tank.id} value={tank.id}>{tank.name}</option>)}
              </select>
              {status !== "disconnected" && <p className="mt-2 text-xs text-[var(--ep-text-muted)]">Disconnect the active session before changing its tank assignment.</p>}
            </div>
            {selectedTank && <Esp32Connection key={selectedTank.id} tankId={selectedTank.id} tankName={selectedTank.name} />}
          </>
        )}
      </Panel>

      <Panel title="Latest device readings" badge={reading ? "Live session" : "No active reading"}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { label: "Temperature · DS18B20", value: reading?.temperature == null ? "—" : `${reading.temperature.toFixed(2)} °C` },
            { label: "Water distance · HC-SR04", value: reading?.distanceCm == null ? "—" : `${reading.distanceCm.toFixed(2)} cm` },
            { label: "Calibrated water level", value: reading?.waterLevel == null ? "Not calibrated" : `${reading.waterLevel.toFixed(1)}%` },
          ].map((item) => <div key={item.label} className="rounded-xl border border-[var(--ep-line)] bg-[var(--ep-bg)] p-4"><div className="text-xs text-[var(--ep-text-muted)]">{item.label}</div><div className="mt-2 text-xl font-semibold text-[var(--ep-text)]">{item.value}</div></div>)}
        </div>
        <p className="mt-3 text-xs text-[var(--ep-text-muted)]">{reading ? `Last saved: ${new Date(reading.recordedAt).toLocaleString()}` : "Connect an ESP32 to display its latest saved sensor measurements here."}</p>
      </Panel>

      <Panel title="Connection scope" badge="Current firmware">
        <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
          <div><p className="font-semibold text-[var(--ep-text)]">Supported by the current USB test</p><ul className="mt-2 list-disc space-y-1 pl-5 text-xs leading-5 text-[var(--ep-text-muted)]"><li>DS18B20 temperature sensor</li><li>HC-SR04 water distance sensor</li><li>Optional empty/full water-level calibration</li></ul></div>
          <div><p className="font-semibold text-[var(--ep-text)]">Not part of this connection yet</p><ul className="mt-2 list-disc space-y-1 pl-5 text-xs leading-5 text-[var(--ep-text-muted)]"><li>Wi-Fi provisioning or remote pairing</li><li>Permanent device identity registration</li><li>Oxygen, pH, and salinity hardware inputs</li></ul></div>
        </div>
        <p className="mt-4 border-t border-[var(--ep-line)] pt-3 text-xs leading-5 text-[var(--ep-text-muted)]">This screen uses the existing browser USB connection and hardware-reading flow. It does not simulate an online device or claim a connection when the ESP32 is disconnected.</p>
      </Panel>
    </div>
  );
}
