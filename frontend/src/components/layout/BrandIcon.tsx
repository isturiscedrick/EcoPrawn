import type { CSSProperties } from "react";
import { SHAPES } from "./BrandMark";

interface BrandIconProps {
  className?: string;
  /** Multiplies every delay and duration. 1 = same speed as the full logo. */
  timeScale?: number;
}

// The shrimp from the full logo, without the "EcoPrawn" wordmark. It reuses
// the traced shapes and the draw-on CSS from BrandMark, so there is one copy
// of the path data. The viewBox is cropped to the shrimp's bounds (the full
// logo is 1086 x 362; the shrimp spans x 76-475, y 10-355).
const SHRIMP = SHAPES.filter((shape) => shape.kind === "shrimp");

export function BrandIcon({ className = "", timeScale = 1 }: BrandIconProps) {
  return (
    <svg
      role="img"
      aria-label="EcoPrawn shrimp"
      viewBox="70 4 411 357"
      className={`ep-logo ${className}`}
    >
      {SHRIMP.map((shape, i) => (
        <path
          key={i}
          className="ep-logo-shape ep-logo-shrimp"
          pathLength={1}
          fillRule="evenodd"
          d={shape.d}
          style={
            {
              "--d": `${(shape.delay * timeScale).toFixed(2)}s`,
              "--t": `${(shape.dur * timeScale).toFixed(2)}s`,
            } as CSSProperties
          }
        />
      ))}
    </svg>
  );
}