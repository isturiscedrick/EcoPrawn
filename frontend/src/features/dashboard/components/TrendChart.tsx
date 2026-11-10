import { useId, useState } from "react";

interface TrendChartProps {
  values?: number[];
  onPointClick?: (value: number, index: number) => void;
  label?: string;
  unit?: string;
}

export function TrendChart({ values = [], onPointClick, label = "Trend", unit = "" }: TrendChartProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const gradientId = `ep-trend-fill-${useId().replace(/:/g, "")}`;

  if (values.length < 2)
    return (
      <p className="py-8 text-base text-[var(--ep-text-muted)]">Not enough readings to display a trend.</p>
    );
  const min = Math.min(...values),
    max = Math.max(...values);
  const range = max - min || 1;
  const points = values
    .map(
      (v, i) =>
        (i / (values.length - 1)) * 560 +
        "," +
        (174 - ((v - min) / range) * 144),
    )
    .join(" ");
  const pointCoordinates = values.map((v, i) => ({
    x: (i / (values.length - 1)) * 560,
    y: 174 - ((v - min) / range) * 144,
  }));
  const selectedValue = selectedIndex === null ? null : values[selectedIndex];

  function selectPoint(index: number) {
    setSelectedIndex(index);
    onPointClick?.(values[index], index);
  }

  return (
    <div className="dashboard-trend-chart space-y-3">
      <div className="flex items-center justify-between gap-3 text-sm font-medium text-[var(--ep-text-muted)]">
        <span>{label}{unit ? ` (${unit})` : ""}</span>
        {selectedValue !== null && (
          <span className="rounded-full bg-[var(--ep-accent-tint)] px-3 py-1 font-semibold text-[var(--ep-accent)]">
            {selectedValue.toFixed(2)}{unit ? ` ${unit}` : ""}
          </span>
        )}
      </div>
      <svg
        viewBox="0 0 560 200"
        className="h-[230px] w-full overflow-visible"
        role="group"
        aria-label={`${label} chart. Select a point for details.`}
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
          <g key={`${point.x}-${point.y}`}>
            <circle
              cx={point.x}
              cy={point.y}
              r="13"
              fill="transparent"
              tabIndex={0}
              role="button"
              aria-label={`Reading ${index + 1}: ${values[index].toFixed(2)}${unit ? ` ${unit}` : ""}`}
              onClick={() => selectPoint(index)}
              onFocus={() => setSelectedIndex(index)}
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
              r={selectedIndex === index ? 8 : 6}
              fill="var(--ep-surface)"
              stroke="var(--ep-accent)"
              strokeWidth={selectedIndex === index ? 4 : 3}
              pointerEvents="none"
            />
          </g>
        ))}
      </svg>
      <p className="text-sm text-[var(--ep-text-muted)]">Select any point to inspect that reading.</p>
    </div>
  );
}