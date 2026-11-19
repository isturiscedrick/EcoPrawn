import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Icon } from "@/components/ui/Icon";
import { DashboardViewSkeleton } from "@/features/dashboard/components/DashboardStates";
import { Esp32Connection } from "@/features/dashboard/components/Esp32Connection";
import { SmsSettings } from "@/features/dashboard/components/SmsSettings";
import { useEsp32 } from "@/features/dashboard/context/Esp32Context";
import { useTanks } from "@/features/dashboard/context/TankContext";
import { DashboardPageHeader } from "@/features/dashboard/components/DashboardPageHeader";

export function ConfigurationView() {
  const { tanks, loading, error } = useTanks();
  const { status, tankId: connectedTankId } = useEsp32();
  const [selectedTankId, setSelectedTankId] = useState("");
  const selectedTank = useMemo(
    () => tanks.find(tank => tank.id === (selectedTankId || connectedTankId)) ?? tanks[0] ?? null,
    [tanks, selectedTankId, connectedTankId],
  );

  if (loading) return <DashboardViewSkeleton variant="tanks" />;

  return (
    <div className="mx-auto w-full max-w-none">
      <DashboardPageHeader
        eyebrow="Settings"
        title="Configuration"
        description="ESP32 connection and alert delivery."
        actions={<>
          <Link to="/dashboard/settings" className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--ep-line)] bg-[var(--ep-surface)] px-3 text-xs font-semibold text-[var(--ep-primary)] hover:bg-[var(--ep-tint)]">
            <Icon name="arrow-left" size={14} /> Back to Settings
          </Link>
          <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold ${status === "connected" ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : status === "connecting" ? "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300" : "border-[var(--ep-line)] bg-[var(--ep-surface)] text-[var(--ep-text-muted)]"}`}>
            <span className={`h-2 w-2 rounded-full ${status === "connected" ? "bg-emerald-500" : status === "connecting" ? "bg-amber-500" : "bg-[var(--ep-text-muted)]"}`} />
            ESP32 {status === "connected" ? "Connected" : status === "connecting" ? "Connecting" : "Disconnected"}
          </span>
        </>}
      />

      <div className="space-y-6">
        <section className="rounded-2xl border border-[var(--ep-line)] bg-[var(--ep-surface)] p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--ep-tint)] text-[var(--ep-primary)]"><Icon name="cpu" size={21} /></span>
            <div>
              <h2 className="text-base font-semibold text-[var(--ep-text)]">ESP32 device connection</h2>
              <p className="mt-1 text-sm leading-6 text-[var(--ep-text-muted)]">Assign a tank and calibrate its sensors.</p>
            </div>
          </div>

          {error && <p role="alert" className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-300">{error}</p>}

          {tanks.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[var(--ep-line)] px-5 py-10 text-center">
              <Icon name="layers" size={25} />
              <h3 className="mt-3 text-sm font-semibold text-[var(--ep-text)]">No tanks available</h3>
              <p className="mt-1 text-sm text-[var(--ep-text-muted)]">Add a tank to assign this device.</p>
              <Link to="/dashboard/tanks" className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[var(--ep-primary)] px-4 py-2.5 text-sm font-semibold text-white"><Icon name="plus" size={15} /> View tanks</Link>
            </div>
          ) : (
            <>
              <label htmlFor="configuration-tank" className="mb-2 block text-sm font-semibold text-[var(--ep-text)]">Assign device to tank</label>
              <select id="configuration-tank" value={selectedTank?.id ?? ""} onChange={event => setSelectedTankId(event.target.value)} disabled={status !== "disconnected"} className="mb-5 min-h-11 w-full max-w-xl rounded-xl border border-[var(--ep-line)] bg-[var(--ep-bg)] px-3 text-sm text-[var(--ep-text)] outline-none focus:border-[var(--ep-primary)] disabled:opacity-60">
                {tanks.map(tank => <option key={tank.id} value={tank.id}>{tank.name}</option>)}
              </select>
              {selectedTank && <div className="border-t border-[var(--ep-line)] pt-5"><Esp32Connection key={selectedTank.id} tankId={selectedTank.id} tankName={selectedTank.name} /></div>}
            </>
          )}
        </section>

        <section className="rounded-2xl border border-[var(--ep-line)] bg-[var(--ep-surface)] p-5 shadow-sm sm:p-6">
          <div className="mb-4 flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--ep-tint)] text-[var(--ep-primary)]"><Icon name="bell-ring" size={20} /></span>
            <div>
              <h2 className="text-base font-semibold text-[var(--ep-text)]">Notification settings</h2>
              <p className="mt-1 text-sm text-[var(--ep-text-muted)]">Configure SMS notifications for water-quality alerts.</p>
            </div>
          </div>
          <SmsSettings />
        </section>
      </div>
    </div>
  );
}
