import { useState } from "react";
import { Panel, KpiCard } from "@/features/dashboard/components/DashboardPrimitives";
import { ScrollFadeContainer } from "@/components/motion/ScrollFadeContainer";
import { useTanks } from "@/features/dashboard/context/TankContext";
import { DashboardViewSkeleton } from "@/features/dashboard/components/DashboardStates";

function GrowthTrendChart({ values }: { values: number[] }) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  if (values.length < 2) {
    return (
      <p className="py-6 text-sm text-[rgba(11,35,32,0.6)]">
        Not enough scans to display a trend.
      </p>
    );
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const w = 560;
  const h = 220;
  const chartTop = 22;
  const chartBottom = 178;
  const chartLeft = 42;
  const chartRight = 548;
  const chartHeight = chartBottom - chartTop;
  const chartWidth = chartRight - chartLeft;
  const points = values
    .map((v, i) => {
      const x = chartLeft + (i / (values.length - 1)) * chartWidth;
      const y = chartBottom - ((v - min) / (max - min || 1)) * chartHeight;
      return `${x},${y}`;
    })
    .join(" ");
  const coordinates = values.map((value, index) => ({
    x: chartLeft + (index / (values.length - 1)) * chartWidth,
    y: chartBottom - ((value - min) / (max - min || 1)) * chartHeight,
  }));

  return (
    <div className="mt-1.5 space-y-3">
      <div className="flex items-center justify-between gap-3 text-sm font-medium text-[var(--ep-text-muted)]">
        <span>Average body length (cm)</span>
        {selectedIndex !== null && (
          <span className="rounded-full bg-[rgba(232,98,58,0.12)] px-3 py-1 font-semibold text-[var(--ep-accent)]">
            {values[selectedIndex].toFixed(1)} cm
          </span>
        )}
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" height="250" role="group" aria-label="Interactive growth trend chart">
        <defs>
          <linearGradient id="ep-growth-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1d4ed8" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 0.33, 0.66, 1].map((position) => {
          const y = chartTop + chartHeight * position;
          const value = max - (max - min) * position;
          return (
            <g key={position}>
              <line x1={chartLeft} x2={chartRight} y1={y} y2={y} stroke="var(--ep-line)" strokeWidth="1" strokeDasharray="4 6" />
              <text x="0" y={y + 5} fill="var(--ep-text-muted)" fontSize="13">{value.toFixed(1)}</text>
            </g>
          );
        })}
        <line x1={chartLeft} x2={chartRight} y1={chartBottom} y2={chartBottom} stroke="var(--ep-line)" strokeWidth="1.5" />
        {values.map((_, index) => {
          const x = chartLeft + (index / (values.length - 1)) * chartWidth;
          return (
            <text key={index} x={x} y="207" textAnchor="middle" fill="var(--ep-text-muted)" fontSize="13">
              W{index + 1}
            </text>
          );
        })}
        <text x={chartLeft} y="219" fill="var(--ep-text-muted)" fontSize="11">Earlier</text>
        <text x={chartRight} y="219" textAnchor="end" fill="var(--ep-text-muted)" fontSize="11">Latest</text>
        <polyline
          points={points}
          fill="none"
          stroke="#1d4ed8"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <polygon points={`${points} ${chartRight},${chartBottom} ${chartLeft},${chartBottom}`} fill="url(#ep-growth-fill)" />
        {coordinates.map((point, index) => (
          <g key={`${point.x}-${point.y}`}>
            <circle
              cx={point.x}
              cy={point.y}
              r="13"
              fill="transparent"
              tabIndex={0}
              role="button"
              aria-label={`Growth reading ${index + 1}: ${values[index].toFixed(1)} centimeters`}
              onClick={() => setSelectedIndex(index)}
              onFocus={() => setSelectedIndex(index)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setSelectedIndex(index);
                }
              }}
            />
            <circle
              cx={point.x}
              cy={point.y}
              r={selectedIndex === index ? 8 : 6}
              fill="var(--ep-surface)"
              stroke="var(--coral)"
              strokeWidth={selectedIndex === index ? 4 : 3}
              pointerEvents="none"
            />
          </g>
        ))}
      </svg>
      <p className="text-sm text-[var(--ep-text-muted)]">Select any point to inspect that week.</p>
    </div>
  );
}

export function VisionGrowth() {
  const { tanks, growthTrend, visionScanLog, loading } = useTanks();

  if (loading) return <DashboardViewSkeleton variant="vision" />;
  const tankCount = tanks.length;

  const avgBodyLength = tankCount ? tanks.reduce((sum, t) => sum + t.bodyLength, 0) / tankCount : 0;
  const avgWeight = tankCount ? tanks.reduce((sum, t) => sum + t.weight, 0) / tankCount : 0;
  const totalPopulation = tanks.reduce((sum, t) => sum + t.population, 0);
  const abnormalTotal = tanks.reduce((sum, t) => sum + t.abnormal, 0);
  const lastScan = visionScanLog[0]?.time ?? "no scans yet";

  return (
    <>
      <div className="flex justify-between items-start mb-7 flex-wrap gap-4 pb-6 border-b border-[var(--sand-dim)]">
        <div>
          <div className="ep-font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--mangrove)] mb-2">
            AI &amp; Computer Vision
          </div>
          <h1 className="ep-font-display text-[28px] font-semibold text-[var(--water-deep)] leading-tight">
            Vision &amp; Growth Analytics
          </h1>
          <div className="text-[13px] text-[rgba(11,35,32,0.55)] mt-1.5">
            Camera-based growth tracking &amp; biomass estimation · {tankCount} tank{tankCount !== 1 ? "s" : ""}
          </div>
        </div>
        <div className="inline-flex items-center gap-2 bg-white border border-[var(--sand-dim)] px-4 py-[9px] rounded-full text-[12.5px] font-semibold text-[var(--water-deep)] shadow-[var(--shadow-pill)]">
          <span className="ep-pulse-dot w-[7px] h-[7px] rounded-full bg-[var(--mangrove)]" />
          Last scan · {lastScan}
        </div>
      </div>

      {tankCount > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
            <KpiCard label="Avg. Body Length" value={avgBodyLength.toFixed(1)} unit="cm" delta="▲ 0.2 cm vs last week" deltaTone="ok" />
            <KpiCard label="Avg. Weight" value={avgWeight.toFixed(1)} unit="g" delta="▲ 1.4 g vs last week" deltaTone="ok" />
            <KpiCard
              label="Population Est."
              value={totalPopulation.toLocaleString()}
              unit="shrimp"
              delta={`across ${tankCount} tank${tankCount !== 1 ? "s" : ""}`}
              deltaTone="ok"
            />
            <KpiCard
              label="Abnormal Behavior"
              value={String(abnormalTotal)}
              unit="flagged"
              delta={abnormalTotal === 0 ? "No anomalies detected" : "Under observation"}
              deltaTone={abnormalTotal === 0 ? "ok" : "warn"}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-4 mb-4">
            <Panel title="Growth Trend — Avg. Body Length" badge="7-week view">
              <GrowthTrendChart values={growthTrend} />
              <div className="flex gap-5 mt-2.5 text-[11.5px] text-[rgba(11,35,32,0.55)] ep-font-mono">
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-3 h-[2px] bg-[var(--coral)]" /> Body length (cm)
                </span>
              </div>
            </Panel>

            <Panel title="Recent Vision Scans" badge={`${visionScanLog.length} events`}>
              <div className="flex flex-col">
                {visionScanLog.map((s, i) => (
                  <div key={s.id} className={`dashboard-hover rounded-lg px-2 py-3 ${i !== 0 ? "border-t border-[var(--sand-dim)]" : "pt-0"}`}>
                    <div className="ep-font-mono text-[10.5px] text-[rgba(11,35,32,0.45)] mb-1">
                      {s.time} · {s.tank}
                    </div>
                    <div className="text-[13px] text-[var(--water-deep)]">{s.note}</div>
                  </div>
                ))}
              </div>
            </Panel>
          </div>

          <Panel title="Growth Snapshot" badge={`${tankCount} tank${tankCount !== 1 ? "s" : ""}`}>
            <ScrollFadeContainer>
              <table className="w-full text-left border-collapse min-w-[640px]">
                <thead>
                  <tr className="ep-font-mono text-[10px] uppercase tracking-wide text-[rgba(11,35,32,0.45)] border-b border-[var(--sand-dim)]">
                    <th className="py-2.5 pr-3 font-semibold">Tank</th>
                    <th className="py-2.5 pr-3 font-semibold">Body Length</th>
                    <th className="py-2.5 pr-3 font-semibold">Weight</th>
                    <th className="py-2.5 pr-3 font-semibold">Population Est.</th>
                    <th className="py-2.5 font-semibold">Abnormal</th>
                  </tr>
                </thead>
                <tbody>
                  {tanks.map((t) => (
                    <tr key={t.id} className="border-b border-[var(--sand-dim)] last:border-b-0">
                      <td className="py-3 pr-3 text-[13.5px] font-semibold text-[var(--water-deep)]">{t.name}</td>
                      <td className="py-3 pr-3 ep-font-mono text-[13px] text-[var(--water-deep)]">{t.bodyLength.toFixed(1)} cm</td>
                      <td className="py-3 pr-3 ep-font-mono text-[13px] text-[var(--water-deep)]">{t.weight.toFixed(1)} g</td>
                      <td className="py-3 pr-3 ep-font-mono text-[13px] text-[var(--water-deep)]">{t.population.toLocaleString()}</td>
                      <td className="py-3">
                        <span
                          className={`text-[11.5px] font-semibold ${
                            t.abnormal === 0 ? "text-[var(--mangrove)]" : "text-[var(--amber-text)]"
                          }`}
                        >
                          {t.abnormal === 0 ? "None" : `${t.abnormal} flagged`}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ScrollFadeContainer>
          </Panel>
        </>
      ) : (
        <Panel title="Growth Snapshot" badge="0 tanks">
          <div className="py-10 text-center text-[13px] text-[rgba(11,35,32,0.5)]">
            No tanks yet — add one on the Tanks page to see vision &amp; growth data.
          </div>
        </Panel>
      )}
    </>
  );
}