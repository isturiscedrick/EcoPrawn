import { Panel, KpiCard } from "@/components/DashboardPrimitives";
import { growthByTank, growthTrend, visionScanLog } from "@/data/ecoprawn";

function GrowthTrendChart() {
  const min = Math.min(...growthTrend);
  const max = Math.max(...growthTrend);
  const w = 560;
  const h = 160;
  const points = growthTrend
    .map((v, i) => {
      const x = (i / (growthTrend.length - 1)) * w;
      const y = h - ((v - min) / (max - min || 1)) * (h - 20) - 10;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="h-[180px] mt-1.5">
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" height="100%" preserveAspectRatio="none">
        <defs>
          <linearGradient id="ep-growth-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#E8623A" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#E8623A" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polyline
          points={points}
          fill="none"
          stroke="#E8623A"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <polygon points={`${points} ${w},${h} 0,${h}`} fill="url(#ep-growth-fill)" />
      </svg>
    </div>
  );
}

export function VisionGrowth() {
  const totalPopulation = growthByTank.reduce(
    (sum, t) => sum + Number(t.population.replace(/,/g, "")),
    0
  );
  const abnormalTotal = growthByTank.reduce((sum, t) => sum + t.abnormal, 0);

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
            Camera-based growth tracking &amp; biomass estimation · 6 tanks
          </div>
        </div>
        <div className="inline-flex items-center gap-2 bg-white border border-[var(--sand-dim)] px-4 py-[9px] rounded-full text-[12.5px] font-semibold text-[var(--water-deep)] shadow-[0_2px_8px_-4px_rgba(11,35,32,0.12)]">
          <span className="ep-pulse-dot w-[7px] h-[7px] rounded-full bg-[var(--mangrove)]" />
          Last scan · 22 min ago
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <KpiCard label="Avg. Body Length" value="11.4" unit="cm" delta="▲ 0.2 cm vs last week" deltaTone="ok" />
        <KpiCard label="Avg. Weight" value="18.2" unit="g" delta="▲ 1.4 g vs last week" deltaTone="ok" />
        <KpiCard
          label="Population Est."
          value={totalPopulation.toLocaleString()}
          unit="shrimp"
          delta="across 6 tanks"
          deltaTone="ok"
        />
        <KpiCard
          label="Abnormal Behavior"
          value={String(abnormalTotal)}
          unit="flagged"
          delta={abnormalTotal === 0 ? "No anomalies detected" : "Tank 4 — under observation"}
          deltaTone={abnormalTotal === 0 ? "ok" : "warn"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-4 mb-4">
        <Panel title="Facility Growth Trend — Avg. Body Length" badge="7-week view">
          <GrowthTrendChart />
          <div className="flex gap-5 mt-2.5 text-[11.5px] text-[rgba(11,35,32,0.55)] ep-font-mono">
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-[2px] bg-[var(--coral)]" /> Body length (cm)
            </span>
          </div>
        </Panel>

        <Panel title="Recent Vision Scans" badge={`${visionScanLog.length} events`}>
          <div className="flex flex-col">
            {visionScanLog.map((s, i) => (
              <div key={s.time} className={`py-3 ${i !== 0 ? "border-t border-[var(--sand-dim)]" : "pt-0"}`}>
                <div className="ep-font-mono text-[10.5px] text-[rgba(11,35,32,0.45)] mb-1">
                  {s.time} · {s.tank}
                </div>
                <div className="text-[13px] text-[var(--water-deep)]">{s.note}</div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <Panel title="Per-Tank Growth Snapshot" badge="6 tanks">
        <div className="overflow-x-auto">
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
              {growthByTank.map((t) => (
                <tr key={t.tank} className="border-b border-[var(--sand-dim)] last:border-b-0">
                  <td className="py-3 pr-3 text-[13.5px] font-semibold text-[var(--water-deep)]">{t.tank}</td>
                  <td className="py-3 pr-3 ep-font-mono text-[13px] text-[var(--water-deep)]">{t.bodyLength}</td>
                  <td className="py-3 pr-3 ep-font-mono text-[13px] text-[var(--water-deep)]">{t.weight}</td>
                  <td className="py-3 pr-3 ep-font-mono text-[13px] text-[var(--water-deep)]">{t.population}</td>
                  <td className="py-3">
                    <span
                      className={`text-[11.5px] font-semibold ${
                        t.abnormal === 0 ? "text-[var(--mangrove)]" : "text-[var(--amber)]"
                      }`}
                    >
                      {t.abnormal === 0 ? "None" : `${t.abnormal} flagged`}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}