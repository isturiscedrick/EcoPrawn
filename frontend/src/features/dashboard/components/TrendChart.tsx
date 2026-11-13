import { useId, useMemo, useState } from "react";

interface TrendChartProps {
  values?: number[];
  onPointClick?: (value: number, index: number) => void;
  label?: string;
  unit?: string;
}

type ReadingWindow = "5" | "10" | "20" | "all";

const WINDOW_OPTIONS: { value: ReadingWindow; label: string }[] = [
  { value: "5", label: "5" },
  { value: "10", label: "10" },
  { value: "20", label: "20" },
  { value: "all", label: "All" },
];

export function TrendChart({ values = [], onPointClick, label = "Trend", unit = "" }: TrendChartProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [readingWindow, setReadingWindow] = useState<ReadingWindow>("all");
  const gradientId = `ep-trend-fill-${useId().replace(/:/g, "")}`;

  const visibleStart = readingWindow === "all"
    ? 0
    : Math.max(0, values.length - Number(readingWindow));
  const visibleValues = useMemo(() => values.slice(visibleStart), [values, visibleStart]);
  const selectedValue = selectedIndex === null ? null : values[selectedIndex];

  if (values.length < 2)
    return (
      <div className="dashboard-trend-chart space-y-2">
        <p className="py-8 text-base text-[var(--ep-text-muted)]">Not enough readings to display a trend.</p>
      </div>
    );

  const min = Math.min(...visibleValues);
  const max = Math.max(...visibleValues);
  const range = max - min || 1;
  const points = visibleValues
    .map((value, index) =>
      (index / (visibleValues.length - 1)) * 560 +
      "," +
      (174 - ((value - min) / range) * 144),
    )
    .join(" ");
  const pointCoordinates = visibleValues.map((value, index) => ({
    x: (index / (visibleValues.length - 1)) * 560,
    y: 174 - ((value - min) / range) * 144,
  }));

  function selectPoint(index: number) {
    const originalIndex = visibleStart + index;
    setSelectedIndex(originalIndex);
    onPointClick?.(values[originalIndex], originalIndex);
  }

  return (
    <div className="dashboard-trend-chart space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm font-medium text-[var(--ep-text-muted)]">
        <span>{label}{unit ? ` (${unit})` : ""}</span>
        {selectedValue !== null && (
          <span className="rounded-full bg-[var(--ep-accent-tint)] px-3 py-1 font-semibold text-[var(--ep-accent)]" aria-live="polite">
            {selectedValue.toFixed(2)}{unit ? ` ${unit}` : ""}
          </span>
        )}
      </div>

      <div className="dashboard-trend-toolbar flex flex-wrap items-center justify-between gap-2">
        <span className="ep-font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ep-text-muted)]">
          Readings shown
        </span>
        <div className="inline-flex rounded-full border border-[var(--ep-line)] bg-[var(--ep-bg)] p-1" role="group" aria-label="Number of historical readings">
          {WINDOW_OPTIONS.map((option) => {
            const active = readingWindow === option.value;
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={active}
                onClick={() => {
                  setReadingWindow(option.value);
                  setSelectedIndex(null);
                }}
                className={`min-h-9 min-w-10 rounded-full px-3 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ep-accent)] ${
                  active
                    ? "bg-[var(--ep-accent)] text-white shadow-sm"
                    : "text-[var(--ep-text-muted)] hover:bg-[var(--ep-accent-tint)] hover:text-[var(--ep-accent)]"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      <svg
        viewBox="0 0 560 200"
        className="dashboard-trend-svg h-[230px] w-full overflow-visible"
        role="group"
        aria-label={`${label} chart showing ${visibleValues.length} of ${values.length} readings. Select a point for details.`}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--ep-accent)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="var(--ep-accent)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[30, 78, 126, 174].map((y) => (
          <line key={y} x1="0" x2="560" y1={y} y2={y} stroke="var(--ep-line)" strokeWidth="1" strokeDasharray="4 6" />
        ))}
        <text x="0" y="24" fill="var(--ep-text-muted)" fontSize="13">{max.toFixed(1)}</text>
        <text x="0" y="198" fill="var(--ep-text-muted)" fontSize="13">{min.toFixed(1)}</text>
        <polygon points={`${points} 560,174 0,174`} fill={`url(#${gradientId})`} />
        <polyline
          points={points}
          fill="none"
          stroke="var(--ep-accent)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {pointCoordinates.map((point, index) => (
          <g key={`${visibleStart + index}-${point.x}-${point.y}`}>
            <circle
              cx={point.x}
              cy={point.y}
              r="13"
              fill="transparent"
              className="dashboard-trend-point"
              tabIndex={0}
              role="button"
              aria-label={`Reading ${visibleStart + index + 1}: ${visibleValues[index].toFixed(2)}${unit ? ` ${unit}` : ""}`}
              aria-pressed={selectedIndex === visibleStart + index}
              onClick={() => selectPoint(index)}
              onFocus={() => setSelectedIndex(visibleStart + index)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  selectPoint(index);
                }
              }}
            />
            <circle
              cx={point.x}
              cy={point.y}
              r={selectedIndex === visibleStart + index ? 8 : 6}
              fill="var(--ep-surface)"
              stroke="var(--ep-accent)"
              strokeWidth={selectedIndex === visibleStart + index ? 4 : 3}
              pointerEvents="none"
            />
          </g>
        ))}
      </svg>
      <div className="flex items-center justify-between ep-font-mono text-[10px] text-[var(--ep-text-muted)]">
        <span>{visibleStart === 0 ? "Earliest available" : `Reading ${visibleStart + 1}`}</span>
        <span>Latest reading</span>
      </div>
      <p className="text-sm text-[var(--ep-text-muted)]">Select any point to inspect that reading. The range is based on available readings, not calendar dates.</p>
    </div>
  );
}
