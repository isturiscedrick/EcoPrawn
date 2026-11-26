import { useMemo, useState } from "react";
import type { GrowthHistoryPoint, WaterHistoryPoint } from "@/types/api";

const PALETTE = [
  "var(--ep-accent)",
  "var(--ep-brand-secondary)",
  "var(--ep-status-success)",
  "var(--ep-status-warning)",
  "#6D67B2",
  "#3680B9",
];
const number = (value: number, digits = 1) =>
  value.toLocaleString(undefined, { maximumFractionDigits: digits });
const shortDate = (value: string) =>
  new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" });
const fullDate = (value: string) =>
  new Date(value).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

export function DonutChart({
  items,
  unit,
  emptyLabel = "No data available",
}: {
  items: { label: string; value: number; color: string }[];
  unit: string;
  emptyLabel?: string;
}) {
  const total = items.reduce((sum, item) => sum + item.value, 0);
  const visibleItems = items.filter((item) => item.value > 0);
  let cursor = 0;
  const segments = visibleItems.map((item) => {
    const start = cursor;
    cursor += total ? (item.value / total) * 100 : 0;
    return `${item.color} ${start}% ${cursor}%`;
  });
  if (!total)
    return (
      <div className="flex min-h-48 items-center justify-center rounded-xl border border-dashed border-[var(--ep-line)] text-sm text-[var(--ep-text-muted)]">
        {emptyLabel}
      </div>
    );
  return (
    <div className="flex flex-col items-center justify-center gap-5 py-2 sm:flex-row sm:gap-7">
      <div
        className="relative h-40 w-40 shrink-0 rounded-full sm:h-44 sm:w-44"
        role="img"
        aria-label={items.map((item) => `${item.label}: ${number(item.value)} ${unit}`).join(", ")}
        style={{ background: `conic-gradient(${segments.join(", ")})` }}
      >
        <div className="absolute inset-[18px] flex flex-col items-center justify-center rounded-full bg-[var(--ep-surface)]">
          <strong className="ep-font-display text-2xl text-[var(--ep-text)]">
            {number(total, 0)}
          </strong>
          <span className="text-xs text-[var(--ep-text-muted)]">{unit} total</span>
        </div>
      </div>
      <div
        className="w-full min-w-0 flex-1 space-y-3 sm:min-w-[150px]"
        aria-label="Chart breakdown"
      >
        {visibleItems.map((item) => (
          <div key={item.label} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex min-w-0 items-center gap-2 text-[var(--ep-text-muted)]">
              <i
                aria-hidden="true"
                className="h-2.5 w-2.5 shrink-0 rounded-sm"
                style={{ background: item.color }}
              />
              <span className="truncate">{item.label}</span>
            </span>
            <strong className="ep-font-mono shrink-0 text-xs text-[var(--ep-text)]">
              {number(item.value)}{" "}
              <span className="font-normal text-[var(--ep-text-muted)]">{unit}</span>
              <span className="ml-1.5 font-medium text-[var(--ep-text-muted)]">
                {((item.value / total) * 100).toFixed(1)}%
              </span>
            </strong>
          </div>
        ))}
      </div>
    </div>
  );
}

type Range = "7" | "30" | "90" | "all";
const RANGE_OPTIONS: { value: Range; label: string }[] = [
  { value: "7", label: "7 days" },
  { value: "30", label: "30 days" },
  { value: "90", label: "90 days" },
  { value: "all", label: "All history" },
];
function RangeControl({ value, onChange }: { value: Range; onChange: (value: Range) => void }) {
  return (
    <div
      className="-mx-1 overflow-x-auto overscroll-x-contain px-1 pb-1"
      role="group"
      aria-label="Chart date range"
    >
      <div className="flex w-max min-w-full flex-nowrap gap-1 rounded-xl border border-[var(--ep-line)] bg-[var(--ep-bg)] p-1">
        {RANGE_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={value === option.value}
            onClick={() => onChange(option.value)}
            className={`min-h-11 shrink-0 whitespace-nowrap rounded-lg px-3 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ep-accent)] ${value === option.value ? "bg-[var(--ep-accent)] text-[var(--ep-on-accent)] shadow-sm" : "text-[var(--ep-text-muted)] hover:bg-[var(--ep-accent-tint)] hover:text-[var(--ep-text)]"}`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
function selectHistory<T extends { recordedAt: string; tankId: string }>(
  items: T[],
  range: Range,
  tankId: string,
) {
  const rangedItems =
    range === "all" || !items.length
      ? items
      : items.filter(
          (item) => new Date(item.recordedAt).getTime() >= Date.now() - Number(range) * 86400000,
        );

  return rangedItems
    .filter((item) => tankId === "all" || item.tankId === tankId)
    .sort((a, b) => Date.parse(a.recordedAt) - Date.parse(b.recordedAt));
}

function ChartFrame({ children, labels }: { children: React.ReactNode; labels: string[] }) {
  return (
    <div className="min-w-0">
      <svg
        viewBox="0 0 720 270"
        className="h-[clamp(190px,38vw,260px)] w-full overflow-visible"
        role="img"
        aria-label={labels.join("; ")}
      >
        {[40, 95, 150, 205].map((y) => (
          <line
            key={y}
            x1="54"
            x2="700"
            y1={y}
            y2={y}
            stroke="var(--ep-line)"
            strokeDasharray="4 6"
          />
        ))}
        {children}
      </svg>
    </div>
  );
}

export function GrowthHistoryChart({ data }: { data: GrowthHistoryPoint[] }) {
  const [range, setRange] = useState<Range>("30");
  const [metric, setMetric] = useState<"bodyLength" | "weight" | "population">("bodyLength");
  const [tankId, setTankId] = useState("all");
  const [hovered, setHovered] = useState<number | null>(null);
  const filtered = useMemo(() => selectHistory(data, range, tankId), [data, range, tankId]);
  const tanks = useMemo(
    () => Array.from(new Map(data.map((p) => [p.tankId, p.tankName] as const)).entries()),
    [data],
  );
  const value = (p: GrowthHistoryPoint) => p[metric];
  const unit = metric === "bodyLength" ? "cm" : metric === "weight" ? "g" : "shrimp";
  const label =
    metric === "bodyLength" ? "Body length" : metric === "weight" ? "Average weight" : "Population";
  const max = Math.max(1, ...filtered.map(value)),
    min = Math.min(0, ...filtered.map(value)),
    span = max - min || 1;
  const coords = filtered.map((p, i) => ({
    x: 54 + (filtered.length < 2 ? 323 : (i / (filtered.length - 1)) * 646),
    y: 205 - ((value(p) - min) / span) * 165,
  }));
  const line = coords.map((p) => `${p.x},${p.y}`).join(" ");
  const area = coords.length ? `54,205 ${line} ${coords[coords.length - 1].x},205` : "";
  const latest = filtered.at(-1);
  return (
    <div className="space-y-4">
      <div className="flex min-w-0 flex-col gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <select
            aria-label="Growth metric"
            value={metric}
            onChange={(e) => {
              setMetric(e.target.value as typeof metric);
              setHovered(null);
            }}
            className="min-h-11 min-w-0 max-w-full flex-1 touch-manipulation rounded-lg border border-[var(--ep-line)] bg-[var(--ep-surface)] px-3 text-sm font-semibold text-[var(--ep-text)] sm:flex-none"
          >
            <option value="bodyLength">Body length (cm)</option>
            <option value="weight">Average weight (g)</option>
            <option value="population">Population</option>
          </select>
          <select
            aria-label="Filter growth by tank"
            value={tankId}
            onChange={(e) => {
              setTankId(e.target.value);
              setHovered(null);
            }}
            className="min-h-11 min-w-0 max-w-full flex-1 touch-manipulation rounded-lg border border-[var(--ep-line)] bg-[var(--ep-surface)] px-3 text-sm font-semibold text-[var(--ep-text)] sm:max-w-44 sm:flex-none"
          >
            <option value="all">All tanks</option>
            {tanks.map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
        </div>
        <RangeControl
          value={range}
          onChange={(value) => {
            setRange(value);
            setHovered(null);
          }}
        />
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div className="col-span-2 rounded-xl border border-[var(--ep-line)] bg-[var(--ep-bg)] p-3 sm:col-span-1">
          <div className="ep-font-display text-xl font-semibold text-[var(--ep-text)]">
            {latest ? number(value(latest)) : "—"}{" "}
            <span className="text-xs font-medium text-[var(--ep-text-muted)]">{unit}</span>
          </div>
          <p className="mt-1 text-[10px] text-[var(--ep-text-muted)]">
            Latest {label.toLowerCase()}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--ep-line)] bg-[var(--ep-bg)] p-3">
          <div className="ep-font-display text-lg font-semibold text-[var(--ep-text)]">
            {filtered.length ? number(Math.min(...filtered.map(value))) : "—"}{" "}
            <span className="text-xs font-medium text-[var(--ep-text-muted)]">{unit}</span>
          </div>
          <p className="mt-1 text-[10px] text-[var(--ep-text-muted)]">Lowest in range</p>
        </div>
        <div className="rounded-xl border border-[var(--ep-line)] bg-[var(--ep-bg)] p-3">
          <div className="ep-font-display text-lg font-semibold text-[var(--ep-text)]">
            {filtered.length ? number(Math.max(...filtered.map(value))) : "—"}{" "}
            <span className="text-xs font-medium text-[var(--ep-text-muted)]">{unit}</span>
          </div>
          <p className="mt-1 text-[10px] text-[var(--ep-text-muted)]">Highest in range</p>
        </div>
        <div className="rounded-xl border border-[var(--ep-line)] bg-[var(--ep-bg)] p-3">
          <div className="ep-font-display text-lg font-semibold text-[var(--ep-text)]">
            {filtered.length.toLocaleString()}
          </div>
          <p className="mt-1 text-[10px] text-[var(--ep-text-muted)]">Scans in range</p>
        </div>
      </div>
      {filtered.length > 1 ? (
        <ChartFrame
          labels={[
            `${label} history chart`,
            ...filtered.map(
              (p) => `${p.tankName}, ${fullDate(p.recordedAt)}: ${number(value(p))} ${unit}`,
            ),
          ]}
        >
          <defs>
            <linearGradient id="ep-growth-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--ep-accent)" stopOpacity=".28" />
              <stop offset="100%" stopColor="var(--ep-accent)" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[max, (max + min) / 2, min].map((v, i) => (
            <text key={i} x="0" y={44 + i * 80} fill="var(--ep-text-muted)" fontSize="11">
              {number(v)}
            </text>
          ))}
          <polygon points={area} fill="url(#ep-growth-area)" />
          <polyline
            points={line}
            fill="none"
            stroke="var(--ep-accent)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {coords.map((p, i) => (
            <g
              key={filtered[i].tankId + filtered[i].recordedAt}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(i)}
              onClick={() => setHovered(i)}
            >
              <circle
                cx={p.x}
                cy={p.y}
                r="12"
                fill="transparent"
                tabIndex={0}
                role="button"
                aria-label={`${filtered[i].tankName}: ${number(value(filtered[i]))} ${unit}, ${fullDate(filtered[i].recordedAt)}`}
              />
              <circle
                cx={p.x}
                cy={p.y}
                r={hovered === i ? 7 : 4.5}
                fill="var(--ep-surface)"
                stroke="var(--ep-accent)"
                strokeWidth="3"
                pointerEvents="none"
              />
            </g>
          ))}
          {coords
            .filter((_, i) => i === 0 || i === coords.length - 1)
            .map((p, i) => (
              <text
                key={i}
                x={p.x}
                y="240"
                textAnchor={i ? "end" : "start"}
                fill="var(--ep-text-muted)"
                fontSize="11"
              >
                {shortDate(filtered[i ? filtered.length - 1 : 0].recordedAt)}
              </text>
            ))}
        </ChartFrame>
      ) : (
        <div className="rounded-xl border border-dashed border-[var(--ep-line)] py-12 text-center text-sm text-[var(--ep-text-muted)]">
          Not enough scan history for this range. Record more vision scans to build a trend.
        </div>
      )}
      {hovered !== null && filtered[hovered] && (
        <div
          role="status"
          aria-live="polite"
          className="rounded-xl border border-[var(--ep-line)] bg-[var(--ep-tint)] p-3 text-xs"
        >
          <strong className="text-[var(--ep-text)]">{filtered[hovered].tankName}</strong>
          <span className="ml-2 text-[var(--ep-text-muted)]">
            {fullDate(filtered[hovered].recordedAt)}
          </span>
          <div className="mt-1 font-semibold text-[var(--ep-accent)]">
            {number(value(filtered[hovered]))} {unit}
          </div>
        </div>
      )}
      <p className="text-[11px] text-[var(--ep-text-muted)]">
        Each point represents an actual vision scan. No missing readings or dates are interpolated.
      </p>
    </div>
  );
}

const WATER_METRICS = {
  dissolvedOxygen: { label: "Dissolved oxygen", unit: "mg/L", color: "#168C83" },
  ph: { label: "pH", unit: "pH", color: "#8066B8" },
  temperature: { label: "Temperature", unit: "°C", color: "var(--ep-status-warning)" },
  salinity: { label: "Salinity", unit: "ppt", color: "#3680B9" },
  waterLevel: { label: "Water level", unit: "%", color: "var(--ep-brand-secondary)" },
} as const;

export function WaterHistoryChart({
  data,
  tanks,
}: {
  data: WaterHistoryPoint[];
  tanks: { id: string; name: string }[];
}) {
  const [range, setRange] = useState<Range>("7");
  const [metric, setMetric] = useState<keyof typeof WATER_METRICS>("dissolvedOxygen");
  const [tankId, setTankId] = useState("all");
  const [hovered, setHovered] = useState<WaterHistoryPoint | null>(null);
  const config = WATER_METRICS[metric];
  const filtered = useMemo(() => selectHistory(data, range, tankId), [data, range, tankId]);
  const grouped = useMemo(
    () =>
      tanks
        .map((tank, index) => ({
          tank,
          index,
          points: filtered.filter((p) => p.tankId === tank.id),
        }))
        .filter((g) => g.points.length),
    [tanks, filtered],
  );
  const values = filtered.map((p) => p[metric]);
  const min = Math.min(...values),
    max = Math.max(...values),
    span = max - min || 1;
  return (
    <div className="space-y-4">
      <div className="flex min-w-0 flex-col gap-3">
        <div className="flex min-w-0 flex-wrap gap-2">
          <select
            aria-label="Water quality parameter"
            value={metric}
            onChange={(e) => {
              setMetric(e.target.value as keyof typeof WATER_METRICS);
              setHovered(null);
            }}
            className="min-h-11 min-w-0 max-w-full flex-1 touch-manipulation rounded-lg border border-[var(--ep-line)] bg-[var(--ep-surface)] px-3 text-sm font-semibold text-[var(--ep-text)] sm:flex-none"
          >
            {Object.entries(WATER_METRICS).map(([key, item]) => (
              <option key={key} value={key}>
                {item.label} ({item.unit})
              </option>
            ))}
          </select>
          <select
            aria-label="Filter water quality by tank"
            value={tankId}
            onChange={(e) => {
              setTankId(e.target.value);
              setHovered(null);
            }}
            className="min-h-11 min-w-0 max-w-full flex-1 touch-manipulation rounded-lg border border-[var(--ep-line)] bg-[var(--ep-surface)] px-3 text-sm font-semibold text-[var(--ep-text)] sm:max-w-44 sm:flex-none"
          >
            <option value="all">All tanks</option>
            {tanks.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
        <RangeControl
          value={range}
          onChange={(value) => {
            setRange(value);
            setHovered(null);
          }}
        />
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <div className="col-span-2 rounded-xl border border-[var(--ep-line)] bg-[var(--ep-bg)] p-3 sm:col-span-1">
          <div className="ep-font-display text-xl font-semibold text-[var(--ep-text)]">
            {values.length ? number(values[values.length - 1]) : "—"}{" "}
            <span className="text-xs font-medium text-[var(--ep-text-muted)]">{config.unit}</span>
          </div>
          <p className="mt-1 text-[10px] text-[var(--ep-text-muted)]">
            Latest recorded {config.label.toLowerCase()}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--ep-line)] bg-[var(--ep-bg)] p-3">
          <div className="ep-font-display text-lg font-semibold text-[var(--ep-text)]">
            {values.length ? number(Math.min(...values)) : "—"}{" "}
            <span className="text-xs font-medium text-[var(--ep-text-muted)]">{config.unit}</span>
          </div>
          <p className="mt-1 text-[10px] text-[var(--ep-text-muted)]">Lowest in range</p>
        </div>
        <div className="rounded-xl border border-[var(--ep-line)] bg-[var(--ep-bg)] p-3">
          <div className="ep-font-display text-lg font-semibold text-[var(--ep-text)]">
            {values.length ? number(Math.max(...values)) : "—"}{" "}
            <span className="text-xs font-medium text-[var(--ep-text-muted)]">{config.unit}</span>
          </div>
          <p className="mt-1 text-[10px] text-[var(--ep-text-muted)]">Highest in range</p>
        </div>
      </div>
      {filtered.length > 1 ? (
        <>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {grouped.map((g) => (
              <span
                key={g.tank.id}
                className="inline-flex items-center gap-2 text-xs text-[var(--ep-text-muted)]"
              >
                <i
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: PALETTE[g.index % PALETTE.length] }}
                />
                {g.tank.name}
              </span>
            ))}
          </div>
          <ChartFrame
            labels={[
              `${config.label} readings by tank`,
              ...filtered.map(
                (p) =>
                  `${tanks.find((t) => t.id === p.tankId)?.name}: ${p[metric]} ${config.unit} at ${fullDate(p.recordedAt)}`,
              ),
            ]}
          >
            {[max, (max + min) / 2, min].map((v, i) => (
              <text key={i} x="0" y={44 + i * 80} fill="var(--ep-text-muted)" fontSize="11">
                {number(v)}
              </text>
            ))}
            {grouped.map((g) => {
              const pts = g.points.map((p) => ({
                p,
                x:
                  54 +
                  ((Date.parse(p.recordedAt) - Date.parse(filtered[0].recordedAt)) /
                    Math.max(
                      1,
                      Date.parse(filtered[filtered.length - 1].recordedAt) -
                        Date.parse(filtered[0].recordedAt),
                    )) *
                    646,
                y: 205 - ((p[metric] - min) / span) * 165,
              }));
              return (
                <g key={g.tank.id}>
                  <polyline
                    points={pts.map((v) => `${v.x},${v.y}`).join(" ")}
                    fill="none"
                    stroke={PALETTE[g.index % PALETTE.length]}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {pts.map(({ p, x, y }) => (
                    <circle
                      key={p.recordedAt + p.tankId}
                      cx={x}
                      cy={y}
                      r={hovered === p ? 7 : 4.5}
                      fill="var(--ep-surface)"
                      stroke={PALETTE[g.index % PALETTE.length]}
                      strokeWidth="2.5"
                      tabIndex={0}
                      role="button"
                      aria-label={`${g.tank.name}: ${number(p[metric])} ${config.unit}, ${fullDate(p.recordedAt)}`}
                      onMouseEnter={() => setHovered(p)}
                      onMouseLeave={() => setHovered(null)}
                      onFocus={() => setHovered(p)}
                      onClick={() => setHovered(p)}
                    />
                  ))}
                </g>
              );
            })}
            <text x="54" y="240" fill="var(--ep-text-muted)" fontSize="11">
              {shortDate(filtered[0].recordedAt)}
            </text>
            <text x="700" y="240" textAnchor="end" fill="var(--ep-text-muted)" fontSize="11">
              {shortDate(filtered[filtered.length - 1].recordedAt)}
            </text>
          </ChartFrame>
          {hovered && (
            <div className="rounded-xl border border-[var(--ep-line)] bg-[var(--ep-bg)] p-3 text-xs">
              <strong className="text-[var(--ep-text)]">
                {tanks.find((t) => t.id === hovered.tankId)?.name}
              </strong>
              <span className="ml-2 text-[var(--ep-text-muted)]">
                {fullDate(hovered.recordedAt)}
              </span>
              <div className="mt-1 font-semibold" style={{ color: config.color }}>
                {number(hovered[metric])} {config.unit}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="rounded-xl border border-dashed border-[var(--ep-line)] py-12 text-center text-sm text-[var(--ep-text-muted)]">
          No timestamped sensor history in this range. New sensor readings will appear here
          automatically.
        </div>
      )}
      <p className="text-[11px] text-[var(--ep-text-muted)]">
        Showing recorded sensor readings only. Values from different tanks are not averaged
        together.
      </p>
    </div>
  );
}

export function FeedingProgressChart({
  tanks,
}: {
  tanks: { id: string; name: string; dispensedToday: number; targetToday: number }[];
}) {
  const rows = tanks.filter((t) => t.targetToday > 0 || t.dispensedToday > 0);
  if (!rows.length)
    return (
      <div className="py-10 text-center text-sm text-[var(--ep-text-muted)]">
        No feed target or dispense data available.
      </div>
    );
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--ep-text-muted)]">
        <span className="inline-flex items-center gap-2">
          <i className="h-2.5 w-2.5 rounded-sm bg-[var(--ep-accent)]" />
          Dispensed
        </span>
        <span className="inline-flex items-center gap-2">
          <i className="h-2.5 w-2.5 rounded-sm bg-[var(--ep-line)]" />
          Remaining target
        </span>
      </div>
      {rows.map((t, index) => {
        const pct =
          t.targetToday > 0 ? Math.min(100, (t.dispensedToday / t.targetToday) * 100) : 100;
        return (
          <div key={t.id}>
            <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
              <div className="flex items-center gap-2 min-w-0">
                <span className="ep-font-mono text-[10px] font-bold text-[var(--ep-accent)] rounded bg-[var(--ep-tint)] px-1.5 py-0.5">
                  #{String(index + 1).padStart(2, "0")}
                </span>
                <strong className="truncate text-[var(--ep-text)]">{t.name}</strong>
              </div>
              <span className="ep-font-mono shrink-0 text-xs text-[var(--ep-text-muted)]">
                {number(t.dispensedToday)} / {number(t.targetToday)} kg
              </span>
            </div>
            <div
              className="flex h-3 overflow-hidden rounded-full bg-[var(--ep-line)]"
              role="img"
              aria-label={`${t.name}: ${number(t.dispensedToday)} of ${number(t.targetToday)} kilograms dispensed`}
            >
              <div
                className="h-full rounded-full bg-[var(--ep-accent)] transition-[width] duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="mt-1 text-right text-[10px] text-[var(--ep-text-muted)]">
              {t.targetToday > 0
                ? `${number((t.dispensedToday / t.targetToday) * 100, 0)}% of target`
                : "No target set"}
            </div>
          </div>
        );
      })}
    </div>
  );
}
