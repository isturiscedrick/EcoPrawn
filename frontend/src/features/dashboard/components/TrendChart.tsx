interface TrendChartProps {
  values?: number[];
  onPointClick?: (value: number, index: number) => void;
}

export function TrendChart({ values = [], onPointClick }: TrendChartProps) {
  if (values.length < 2)
    return (
      <p className="py-6 text-sm">Not enough readings to display a trend.</p>
    );
  const min = Math.min(...values),
    max = Math.max(...values);
  const points = values
    .map(
      (v, i) =>
        (i / (values.length - 1)) * 560 +
        "," +
        (150 - ((v - min) / (max - min || 1)) * 140),
    )
    .join(" ");
  const pointCoordinates = values.map((v, i) => ({
    x: (i / (values.length - 1)) * 560,
    y: 150 - ((v - min) / (max - min || 1)) * 140,
  }));
  return (
    <svg
      viewBox="0 0 560 160"
      className="h-[180px] w-full cursor-pointer"
      role={onPointClick ? "group" : undefined}
      aria-label={onPointClick ? "Clickable dissolved oxygen trend chart" : undefined}
    >
      <polyline
        points={points}
        fill="none"
        stroke="var(--mangrove)"
        strokeWidth="2.5"
      />
      {onPointClick &&
        pointCoordinates.map((point, index) => (
          <circle
            key={`${point.x}-${point.y}`}
            cx={point.x}
            cy={point.y}
            r="6"
            fill="var(--ep-surface)"
            stroke="var(--coral)"
            strokeWidth="2"
            tabIndex={0}
            role="button"
            aria-label={`Reading ${index + 1}: ${values[index].toFixed(2)}`}
            onClick={() => onPointClick(values[index], index)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onPointClick(values[index], index);
              }
            }}
          />
        ))}
    </svg>
  );
}
