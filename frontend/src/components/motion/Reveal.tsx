import type { ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  /** Kept for backwards compatibility with existing page markup. */
  delay?: number;
  className?: string;
}

/**
 * Layout wrapper for content that is animated by the page-level GSAP
 * choreography. It deliberately never hides its children: if a ScrollTrigger
 * is delayed, disabled, or fails to initialize, all content remains readable.
 */
export function Reveal({ children, className = "" }: RevealProps) {
  return <div className={className}>{children}</div>;
}
