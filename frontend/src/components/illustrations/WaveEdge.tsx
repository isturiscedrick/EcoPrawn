/**
 * A wavy edge that fills with the current text color. Place it at the bottom
 * of a dark band (text color = the next section's background). Add
 * "rotate-180" and "top-[-1px]" to use it on the top edge instead.
 */
export function WaveEdge({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1440 48"
      preserveAspectRatio="none"
      className={`pointer-events-none absolute inset-x-0 h-8 w-full sm:h-12 ${className}`}
    >
      <path d="M0 24C240 48 480 0 720 24S1200 48 1440 24V48H0Z" fill="currentColor" />
    </svg>
  );
}