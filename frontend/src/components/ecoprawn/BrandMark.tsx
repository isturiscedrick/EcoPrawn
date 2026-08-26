interface BrandMarkProps {
  size?: number;
  className?: string;
}

/**
 * Placeholder brand mark for EcoPrawn.
 * Swap the <img> usage in Nav/Sidebar for your real logo file
 * (e.g. import logo from "./logo.png") whenever you have the asset —
 * this avoids shipping a large inline base64 string in source.
 */
export function BrandMark({ size = 30, className = "" }: BrandMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="40" height="40" rx="9" fill="var(--water-deep)" />
      <path
        d="M11 24 q7 -9 15 -3 q3 3 0 6 q-2 2 -5 0 l-2 -2 q-3 3 -7 1 q-3 -1.5 -1 -2z"
        fill="var(--coral)"
      />
      <circle cx="27" cy="14" r="2.4" fill="var(--mangrove-light)" />
    </svg>
  );
}