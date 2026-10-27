export function TrendChart({ values = [] }: { values?: number[] }) {
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
  return (
    <svg viewBox="0 0 560 160" className="h-[180px] w-full">
      <polyline
        points={points}
        fill="none"
        stroke="var(--mangrove)"
        strokeWidth="2.5"
      />
    </svg>
  );
}
