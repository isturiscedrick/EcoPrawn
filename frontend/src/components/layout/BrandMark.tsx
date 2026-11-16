import type { CSSProperties } from "react";
import { SHAPES } from "./BrandMarkPaths";
import "@/styles/components/brand-mark.css";

interface BrandMarkProps {
  size?: number;
  className?: string;
  logoColor?: string;
  logoTextColor?: string;
  showWordmark?: boolean;
}

export function BrandMark({ size = 30, className = "", logoColor, logoTextColor, showWordmark = true }: BrandMarkProps) {
  return (
    <span
      role="img"
      aria-label="EcoPrawn"
      className={`ep-logo inline-flex items-center whitespace-nowrap ${className}`}
      style={{
        gap: size * 0.18,
        ...(logoColor ? { "--ep-logo-color": logoColor } : {}),
        ...(logoTextColor ? { "--ep-logo-text": logoTextColor } : {}),
      } as CSSProperties}
    >
      {/* Shrimp only. Cropped to the shrimp's bounds, same as BrandIcon. */}
      <svg
        aria-hidden="true"
        viewBox="60 0 430 362"
        style={{ height: size, width: "auto" }}
      >
        {SHAPES.filter((shape) => shape.kind === "shrimp").map((shape, i) => (
          <path
            key={i}
            className="ep-logo-shape ep-logo-shrimp"
            pathLength={1}
            fillRule="evenodd"
            d={shape.d}
            style={{ "--d": `${shape.delay}s`, "--t": `${shape.dur}s` } as CSSProperties}
          />
        ))}
      </svg>

      {/* Real text, not paths. Color comes from --ep-logo-text. */}
      {showWordmark && (
        <span
          aria-hidden="true"
          className="ep-logo-wordmark ep-font-display font-semibold leading-none tracking-normal"
          style={{ fontSize: size * 0.8, letterSpacing: "0", paddingRight: size * 0.1, overflow: "visible" }}
        >
          EcoPrawn
        </span>
      )}
    </span>
  );
}