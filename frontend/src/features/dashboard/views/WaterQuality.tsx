import { useState, type KeyboardEvent } from "react";
import { Panel } from "@/features/dashboard/components/DashboardPrimitives";
import { WaterHistoryChart } from "@/features/dashboard/components/AnalyticsCharts";
import { ScrollFadeContainer } from "@/components/motion/ScrollFadeContainer";
import { useTanks } from "@/features/dashboard/context/TankContext";
import { DashboardViewSkeleton } from "@/features/dashboard/components/DashboardStates";
import { THRESHOLDS } from "@/features/dashboard/lib/thresholds";
import { Esp32Connection } from "@/features/dashboard/components/Esp32Connection";

export function WaterQuality() {
  const { tanks, waterHistory = [], loading } = useTanks();
  const [selectedTankId, setSelectedTankId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "ok" | "warn">("all");

  if (loading) return <DashboardViewSkeleton variant="water" />;

  const tankCount = tanks.length;
  const warnCount = tanks.filter((t) => t.status === "warn").length;
  const filteredTanks = statusFilter === "all" ? tanks : tanks.filter((tank) => tank.status === statusFilter);
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
          range: `≥ ${THRESHOLDS.dissolvedOxygen.min} mg/L`,
          current: `${selectedTank.dissolvedOxygen.toFixed(1)} mg/L`,
          status: selectedTank.dissolvedOxygen >= THRESHOLDS.dissolvedOxygen.min ? "ok" : "warn",
        },
        {
          label: "pH",
          range: `${THRESHOLDS.ph.min} – ${THRESHOLDS.ph.max}`,
          current: selectedTank.ph.toFixed(1),
          status: selectedTank.ph >= THRESHOLDS.ph.min && selectedTank.ph <= THRESHOLDS.ph.max ? "ok" : "warn",
        },
        {
          label: "Temperature",
          range: `${THRESHOLDS.temperature.min} – ${THRESHOLDS.temperature.max} °C`,
          current: `${selectedTank.temperature.toFixed(1)} °C`,
          status: selectedTank.temperature >= THRESHOLDS.temperature.min && selectedTank.temperature <= THRESHOLDS.temperature.max ? "ok" : "warn",
        },
        {
          label: "Salinity",
          range: `${THRESHOLDS.salinity.min} – ${THRESHOLDS.salinity.max} ppt`,
          current: `${selectedTank.salinity} ppt`,
          status: selectedTank.salinity >= THRESHOLDS.salinity.min && selectedTank.salinity <= THRESHOLDS.salinity.max ? "ok" : "warn",
        },
        {
          label: "Water Level",
          range: `≥ ${THRESHOLDS.waterLevel.min}%`,
          current: `${selectedTank.waterLevel}%`,
          status: selectedTank.waterLevel >= THRESHOLDS.waterLevel.min ? "ok" : "warn",
        },
      ]
    : [];

  return (
    <>
      <div className="dashboard-page-header flex justify-between items-start mb-7 flex-wrap gap-4 pb-6 border-b border-[var(--sand-dim)]">
        <div>
          <div className="ep-font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--mangrove)] mb-2">
            Sensor Network
          </div>
          <h1 className="ep-font-display text-[28px] font-semibold text-[var(--water-deep)] leading-tight">
            Water Quality Monitoring
          </h1>
          <div className="text-[13px] text-[rgba(11,35,32,0.55)] mt-1.5">
            Dissolved oxygen, pH, temperature, salinity &amp; water level · {tankCount} tank{tankCount !== 1 ? "s" : ""}
          </div>
        </div>
        <div className="inline-flex items-center gap-2 bg-white border border-[var(--sand-dim)] px-4 py-[9px] rounded-full text-[12.5px] font-semibold text-[var(--water-deep)] shadow-[var(--shadow-pill)]">
          <span
            className={`w-[7px] h-[7px] rounded-full ${
              warnCount === 0 ? "ep-pulse-dot bg-[var(--mangrove)]" : "bg-[var(--amber)]"
            }`}
          />
          {warnCount === 0 ? "All parameters nominal" : `${warnCount} tank${warnCount !== 1 ? "s" : ""} out of range`}
        </div>
      </div>

      {tankCount > 0 ? (
        <>
          <div className="mb-4">
            <div className="ep-font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--mangrove)] mb-2">
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
                  onClick={() => setSelectedTankId(tank.id)}
                  onKeyDown={(event) => handleTankTabKeyDown(event, index)}
                  className={`shrink-0 rounded-full border px-4 py-2 text-[12.5px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mangrove)] ${
                    selectedTankIndex === index
                      ? "border-[var(--mangrove)] bg-[var(--mangrove)] text-white"
                      : "border-[var(--sand-dim)] bg-white text-[var(--water-deep)] hover:border-[var(--mangrove)]"
                  }`}
                >
                  {tank.name}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <Esp32Connection key={selectedTank.id} tankId={selectedTank.id} tankName={selectedTank.name} />
          </div>

          <div
            id="water-tank-details"
            role="tabpanel"
            aria-labelledby={`water-tank-tab-${selectedTankIndex}`}
            className="mb-4"
          >
            <Panel title="Parameter Thresholds" badge={selectedTank.name}>
              <div className="flex flex-col gap-2.5">
                {thresholds.map((t) => (
                  <div
                    key={t.label}
                    className="dashboard-hover flex items-center justify-between rounded-[10px] border border-[var(--sand-dim)] p-3"
                  >
                    <div>
                      <div className="text-[13px] font-semibold text-[var(--water-deep)]">{t.label}</div>
                      <div className="ep-font-mono text-[11px] text-[rgba(11,35,32,0.5)]">{t.range}</div>
                    </div>
                    <div className="text-right">
                      <div className="ep-font-mono text-[12.5px] font-semibold text-[var(--water-deep)]">
                        {t.current}
                      </div>
                      <div
                        className={`text-[10px] font-semibold ${
                          t.status === "ok" ? "text-[var(--mangrove)]" : "text-[var(--amber-text)]"
                        }`}
                      >
                        {t.status === "ok" ? "In range" : "Watch"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          </div>

          <div className="mb-4">
            <Panel title="Historical water quality trends" badge={`${waterHistory.length} readings`}>
              <WaterHistoryChart data={waterHistory} tanks={tanks.map(tank => ({ id: tank.id, name: tank.name }))} />
            </Panel>
          </div>

          <Panel title="Tank Readings" badge={`${filteredTanks.length} of ${tankCount} tanks`}>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs font-medium text-[var(--ep-text-muted)]">Filter readings by status</span>
              <div className="dashboard-table-filters grid grid-cols-3 gap-1 rounded-full border border-[var(--ep-line)] bg-[var(--ep-bg)] p-1" role="group" aria-label="Filter tank readings by status">
                {([{ value: "all", label: "All" }, { value: "ok", label: "Nominal" }, { value: "warn", label: "Watch" }] as const).map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={statusFilter === option.value}
                    onClick={() => setStatusFilter(option.value)}
                    className={statusFilter === option.value
                      ? "min-h-10 rounded-full bg-[var(--ep-accent)] px-3 text-xs font-semibold text-white"
                      : "min-h-10 rounded-full px-3 text-xs font-semibold text-[var(--ep-text-muted)] hover:bg-[var(--ep-accent-tint)]"}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="dashboard-table-scroll" role="region" aria-label="Tank readings table" tabIndex={0}>
              <ScrollFadeContainer>
              <table className="w-full text-left border-collapse min-w-[640px]">
                <thead>
                  <tr className="ep-font-mono text-[10px] uppercase tracking-wide text-[rgba(11,35,32,0.45)] border-b border-[var(--sand-dim)]">
                    <th className="py-2.5 pr-3 font-semibold">Tank</th>
                    <th className="py-2.5 pr-3 font-semibold">DO (mg/L)</th>
                    <th className="py-2.5 pr-3 font-semibold">pH</th>
                    <th className="py-2.5 pr-3 font-semibold">Temp (°C)</th>
                    <th className="py-2.5 pr-3 font-semibold">Salinity (ppt)</th>
                    <th className="py-2.5 pr-3 font-semibold">Water Level</th>
                    <th className="py-2.5 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTanks.map((t) => (
                    <tr key={t.id} className="border-b border-[var(--sand-dim)] last:border-b-0">
                      <td className="py-3 pr-3 text-[13.5px] font-semibold text-[var(--water-deep)]">{t.name}</td>
                      <td className="py-3 pr-3 ep-font-mono text-[13px] text-[var(--water-deep)]">
                        {t.dissolvedOxygen.toFixed(1)}
                      </td>
                      <td className="py-3 pr-3 ep-font-mono text-[13px] text-[var(--water-deep)]">{t.ph.toFixed(1)}</td>
                      <td className="py-3 pr-3 ep-font-mono text-[13px] text-[var(--water-deep)]">
                        {t.temperature.toFixed(1)}
                      </td>
                      <td className="py-3 pr-3 ep-font-mono text-[13px] text-[var(--water-deep)]">{t.salinity}</td>
                      <td className="py-3 pr-3 ep-font-mono text-[13px] text-[var(--water-deep)]">{t.waterLevel}%</td>
                      <td className="py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 text-[11.5px] font-semibold ${
                            t.status === "ok" ? "text-[var(--mangrove)]" : "text-[var(--amber-text)]"
                          }`}
                        >
                          <span
                            className={`w-[7px] h-[7px] rounded-full ${
                              t.status === "ok" ? "bg-[var(--mangrove)]" : "bg-[var(--amber)]"
                            }`}
                          />
                          {t.status === "ok" ? "Nominal" : "Watch"}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filteredTanks.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-sm text-[var(--ep-text-muted)]">
                        No tanks match this status filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              </ScrollFadeContainer>
            </div>
          </Panel>
        </>
      ) : (
        <Panel title="Tank Readings" badge="0 tanks">
          <div className="py-10 text-center text-[13px] text-[rgba(11,35,32,0.5)]">
            No tanks yet — add one on the Tanks page to see water quality data.
          </div>
        </Panel>
      )}
    </>
  );
}
