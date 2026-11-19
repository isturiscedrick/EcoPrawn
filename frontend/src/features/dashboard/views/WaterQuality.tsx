import { useEffect, useState, type KeyboardEvent } from "react";
import { Panel } from "@/features/dashboard/components/DashboardPrimitives";
import { WaterHistoryChart } from "@/features/dashboard/components/AnalyticsCharts";
import { useTanks } from "@/features/dashboard/context/TankContext";
import { downloadCsv } from "@/utils/downloadCsv";
import { DashboardInlineEmptyState, DashboardViewSkeleton } from "@/features/dashboard/components/DashboardStates";
import { saveThresholds, THRESHOLDS } from "@/features/dashboard/lib/thresholds";
import { useThresholdSettings } from "@/features/dashboard/hooks/useThresholdSettings";
import { DashboardPageHeader } from "@/features/dashboard/components/DashboardPageHeader";
export function WaterQuality() {
  const { tanks, waterHistory = [], loading } = useTanks();
  const [selectedTankId, setSelectedTankId] = useState<string | null>(null);
  const [thresholdSettings, setThresholdSettings] = useThresholdSettings();
  const [editingThresholds, setEditingThresholds] = useState(false);
  const [thresholdMessage, setThresholdMessage] = useState("");

  useEffect(() => {
    if (!tanks.length) return;
    const storageKey = "ecoprawn.dashboard.selected-tank";
    const requestedTankId = window.sessionStorage.getItem(storageKey);
    if (!requestedTankId) return;
    window.sessionStorage.removeItem(storageKey);
    if (tanks.some((tank) => tank.id === requestedTankId)) {
      setSelectedTankId(requestedTankId);
    }
  }, [tanks]);

  if (loading) return <DashboardViewSkeleton variant="water" />;

  const tankCount = tanks.length;
  const warnCount = tanks.filter((t) => t.status === "warn").length;
  const selectedTank = tanks.find((tank) => tank.id === selectedTankId) ?? tanks[0];
  const selectedTankIndex = tanks.findIndex((tank) => tank.id === selectedTank?.id);

  function handleTankTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let nextIndex: number;
    switch (event.key) {
      case "ArrowRight":
        nextIndex = (index + 1) % tankCount;
        break;
      case "ArrowLeft":
        nextIndex = (index - 1 + tankCount) % tankCount;
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = tankCount - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    setSelectedTankId(tanks[nextIndex].id);
    event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>("[role='tab']")[nextIndex]?.focus();
  }

  const thresholds = selectedTank
    ? [
        {
          label: "Dissolved O₂",
          range: `≥ ${thresholdSettings.dissolvedOxygen.min} mg/L`,
          current: selectedTank.hasWaterReadings ? `${selectedTank.dissolvedOxygen.toFixed(1)} mg/L` : "—",
          status: !selectedTank.hasWaterReadings ? "unavailable" : selectedTank.dissolvedOxygen >= thresholdSettings.dissolvedOxygen.min ? "ok" : "warn",
        },
        {
          label: "pH",
          range: `${thresholdSettings.ph.min} – ${thresholdSettings.ph.max}`,
          current: selectedTank.hasWaterReadings ? selectedTank.ph.toFixed(1) : "—",
          status: !selectedTank.hasWaterReadings ? "unavailable" : selectedTank.ph >= thresholdSettings.ph.min && selectedTank.ph <= thresholdSettings.ph.max ? "ok" : "warn",
        },
        {
          label: "Temperature",
          range: `${thresholdSettings.temperature.min} – ${thresholdSettings.temperature.max} °C`,
          current: selectedTank.hasWaterReadings ? `${selectedTank.temperature.toFixed(1)} °C` : "—",
          status: !selectedTank.hasWaterReadings ? "unavailable" : selectedTank.temperature >= thresholdSettings.temperature.min && selectedTank.temperature <= thresholdSettings.temperature.max ? "ok" : "warn",
        },
        {
          label: "Salinity",
          range: `${thresholdSettings.salinity.min} – ${thresholdSettings.salinity.max} ppt`,
          current: selectedTank.hasWaterReadings ? `${selectedTank.salinity} ppt` : "—",
          status: !selectedTank.hasWaterReadings ? "unavailable" : selectedTank.salinity >= thresholdSettings.salinity.min && selectedTank.salinity <= thresholdSettings.salinity.max ? "ok" : "warn",
        },
        {
          label: "Water Level",
          range: `≥ ${thresholdSettings.waterLevel.min}%`,
          current: selectedTank.hasWaterReadings ? `${selectedTank.waterLevel}%` : "—",
          status: !selectedTank.hasWaterReadings ? "unavailable" : selectedTank.waterLevel >= thresholdSettings.waterLevel.min ? "ok" : "warn",
        },
      ]
    : [];

  return (
    <div className="dashboard-water-quality-page">
      <DashboardPageHeader
        eyebrow="Operations"
        title="Water Quality"
        description="Live readings, safe ranges, and sensor history."
      />
      <div className="mb-4 flex flex-wrap items-center justify-end gap-3">
        
        <button type="button" onClick={() => {
          const rows = [
            ...tanks.map(tank => [tank.name, "Current", "", tank.dissolvedOxygen, tank.ph, tank.temperature, tank.salinity, tank.waterLevel]),
            ...waterHistory.map(point => [tanks.find(tank => tank.id === point.tankId)?.name ?? point.tankId, "Historical", point.recordedAt, point.dissolvedOxygen, point.ph, point.temperature, point.salinity, point.waterLevel]),
          ];
          downloadCsv(`ecoprawn-water-quality-${new Date().toISOString().slice(0, 10)}.csv`, ["Tank", "Record type", "Recorded at", "Dissolved oxygen (mg/L)", "pH", "Temperature (°C)", "Salinity (ppt)", "Water level (%)"], rows);
        }} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-[var(--ep-line)] bg-[var(--ep-surface)] px-3 text-xs font-semibold text-[var(--ep-primary)] transition-colors hover:bg-[var(--ep-tint)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ep-primary)] sm:w-auto">
          <span aria-hidden="true">↓</span> Export readings
        </button>
        <div className="inline-flex items-center gap-2 bg-[var(--ep-surface)] border border-[var(--ep-line)] px-4 py-[9px] rounded-full text-[12.5px] font-semibold text-[var(--water-deep)] shadow-[var(--shadow-pill)]">
          <span
            className={`w-[7px] h-[7px] rounded-full ${
              warnCount === 0 ? "ep-pulse-dot bg-[var(--ep-accent)]" : "bg-[var(--amber)]"
            }`}
          />
          {warnCount === 0 ? "All parameters nominal" : `${warnCount} tank${warnCount !== 1 ? "s" : ""} out of range`}
        </div>
      </div>
      {tankCount > 0 ? (
        <>
          <div className="mb-4">
            <div className="ep-font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ep-accent)] mb-2">
              Tank details
            </div>
            <div role="tablist" aria-label="Water quality by tank" className="flex gap-2 overflow-x-auto pb-1">
              {tanks.map((tank, index) => (
                <button
                  key={tank.id}
                  id={`water-tank-tab-${index}`}
                  type="button"
                  role="tab"
                  aria-selected={selectedTankIndex === index}
                  aria-controls="water-tank-details"
                  tabIndex={selectedTankIndex === index ? 0 : -1}
                  onClick={() => { setSelectedTankId(tank.id); window.sessionStorage.setItem("ecoprawn.dashboard.selected-tank", tank.id); }}
                  onKeyDown={(event) => handleTankTabKeyDown(event, index)}
                  className={`min-h-11 shrink-0 touch-manipulation rounded-full border px-4 py-2 text-[12.5px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ep-accent)] ${
                    selectedTankIndex === index
                      ? "border-[var(--ep-accent)] bg-[var(--ep-accent)] text-[var(--ep-on-accent)]"
                      : "border-[var(--ep-line)] bg-[var(--ep-surface)] text-[var(--water-deep)] hover:border-[var(--ep-accent)]"
                  }`}
                >
                  <span className={`mr-2 inline-block h-2 w-2 rounded-full align-middle ${!tank.hasWaterReadings ? "bg-slate-400" : tank.status === "ok" ? "bg-emerald-500" : "bg-amber-500"}`} aria-hidden="true" />
                  <span className="mr-1.5 ep-font-mono text-[11px] font-bold opacity-80">#{String(index + 1).padStart(2, "0")}</span>
                  {tank.name}
                </button>
              ))}
            </div>
          </div>

          <div
            id="water-tank-details"
            role="tabpanel"
            aria-labelledby={`water-tank-tab-${selectedTankIndex}`}
            className="mb-4"
          >
            <Panel title={`Water quality limits — #${String(selectedTankIndex + 1).padStart(2, "0")} ${selectedTank.name}`} badge="Sensor limits">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <button type="button" onClick={() => { setEditingThresholds(value => !value); setThresholdMessage(""); }} className="min-h-9 rounded-lg border border-[var(--ep-line)] px-3 text-xs font-semibold text-[var(--ep-primary)] hover:bg-[var(--ep-tint)]">{editingThresholds ? "Close settings" : "Customize limits"}</button>
              </div>
              {editingThresholds && (
                <div className="mb-4 rounded-xl border border-[var(--ep-line)] bg-[var(--ep-bg)] p-3">
                  <p className="mb-3 text-xs font-semibold text-[var(--ep-text)]">Warning limits</p>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {([
                      ["dissolvedOxygen", "Dissolved oxygen minimum", "min", "mg/L"],
                      ["ph", "pH minimum", "min", ""], ["ph", "pH maximum", "max", ""],
                      ["temperature", "Temperature minimum", "min", "°C"], ["temperature", "Temperature maximum", "max", "°C"],
                      ["salinity", "Salinity minimum", "min", "ppt"], ["salinity", "Salinity maximum", "max", "ppt"],
                      ["waterLevel", "Water level minimum", "min", "%"],
                    ] as const).map(([key, label, bound, unit]) => (
                      <label key={label} className="block text-xs font-medium text-[var(--ep-text-muted)]">
                        {label} {unit && <span>({unit})</span>}
                        <input type="number" step="0.1" value={(thresholdSettings[key] as { min: number; max?: number })[bound]} onChange={event => {
                          const value = Number(event.target.value);
                          setThresholdSettings(current => ({ ...current, [key]: { ...current[key], [bound]: value } }));
                        }} className="mt-1 min-h-10 w-full rounded-lg border border-[var(--ep-line)] bg-[var(--ep-surface)] px-3 text-sm text-[var(--ep-text)] outline-none focus:border-[var(--ep-primary)]" />
                      </label>
                    ))}
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <button type="button" onClick={() => {
                      const s = thresholdSettings;
                      const valid = Number.isFinite(s.dissolvedOxygen.min) && s.dissolvedOxygen.min >= 0 && s.dissolvedOxygen.min <= 20 &&
                        s.ph.min >= 0 && s.ph.max <= 14 && s.ph.min < s.ph.max &&
                        s.temperature.min >= -5 && s.temperature.max <= 60 && s.temperature.min < s.temperature.max &&
                        s.salinity.min >= 0 && s.salinity.max <= 100 && s.salinity.min < s.salinity.max &&
                        s.waterLevel.min >= 0 && s.waterLevel.min <= 100 &&
                        [s.ph.min,s.ph.max,s.temperature.min,s.temperature.max,s.salinity.min,s.salinity.max,s.waterLevel.min].every(Number.isFinite);
                      if (!valid) { setThresholdMessage("Check the values and ensure every minimum is below its maximum."); return; }
                      saveThresholds(s);
                      setThresholdMessage("Limits saved on this device.");
                      setEditingThresholds(false);
                    }} className="min-h-9 rounded-lg bg-[var(--ep-accent)] px-3 text-xs font-semibold text-[var(--ep-on-accent)] hover:opacity-90">Save limits</button>
                    <button type="button" onClick={() => { setThresholdSettings(THRESHOLDS); setThresholdMessage("Default limits restored. Save to apply them."); }} className="min-h-9 rounded-lg border border-[var(--ep-line)] px-3 text-xs font-semibold text-[var(--ep-text)] hover:bg-[var(--ep-tint)]">Restore defaults</button>
                    {thresholdMessage && <span role="status" className="text-xs text-[var(--ep-text-muted)]">{thresholdMessage}</span>}
                  </div>
                </div>
              )}
              {!selectedTank.hasWaterReadings && <p role="status" className="mb-3 rounded-xl border border-slate-400/30 bg-slate-400/10 px-3 py-2 text-xs text-[var(--ep-text-muted)]">Waiting for sensor data; range status is unavailable.</p>}
              <div className="mb-3 grid grid-cols-3 gap-2" aria-label="Parameter status summary">
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3"><div className="text-[10px] text-[var(--ep-text-muted)]">In range</div><div className="mt-1 text-lg font-semibold tabular-nums text-emerald-600">{thresholds.filter(item => item.status === "ok").length}</div></div>
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3"><div className="text-[10px] text-[var(--ep-text-muted)]">Watch</div><div className="mt-1 text-lg font-semibold tabular-nums text-amber-600">{thresholds.filter(item => item.status === "warn").length}</div></div>
                <div className="rounded-xl border border-[var(--ep-line)] bg-[var(--ep-bg)] p-3"><div className="text-[10px] text-[var(--ep-text-muted)]">No reading</div><div className="mt-1 text-lg font-semibold tabular-nums text-[var(--ep-text-muted)]">{thresholds.filter(item => item.status === "unavailable").length}</div></div>
              </div>
              <div className="flex flex-col gap-2.5">
                {thresholds.map((t) => (
                  <div
                    key={t.label}
                    className="dashboard-hover flex items-center justify-between rounded-[10px] border border-[var(--ep-line)] p-3"
                  >
                    <div>
                      <div className="text-[13px] font-semibold text-[var(--water-deep)]">{t.label}</div>
                      <div className="ep-font-mono text-[11px] text-[var(--ep-text-muted)]">{t.range}</div>
                    </div>
                    <div className="text-right">
                      <div className="ep-font-mono text-[12.5px] font-semibold text-[var(--water-deep)]">
                        {t.current}
                      </div>
                      <div
                        className={`text-[10px] font-semibold ${
                          t.status === "ok" ? "text-emerald-600 dark:text-emerald-400" : t.status === "warn" ? "text-amber-600 dark:text-amber-400" : "text-[var(--ep-text-muted)]"
                        }`}
                      >
                        {t.status === "ok" ? "In range" : t.status === "warn" ? "Watch" : "No reading"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          </div>

          <div className="mb-4">
            <Panel title="Water quality over time" badge={`${waterHistory.length} readings`}>
              <WaterHistoryChart data={waterHistory} tanks={tanks.map(tank => ({ id: tank.id, name: tank.name }))} />
            </Panel>
          </div>

        </>
      ) : (
        <Panel title="Water Quality" badge="0 tanks">
          <DashboardInlineEmptyState message="No tanks yet. Add one on the Tanks page." />
        </Panel>
      )}
    </div>
  );
}
