import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { BrandMark } from "@/components/layout/BrandMark";
import "./logo-intro.css";

/**
 * Displays a short branded loading screen on a fresh page load.
 * In-app navigation only marks the header logo as already seen.
 */
export function LogoIntroGate() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const firstPath = useRef(pathname);
  const [visible, setVisible] = useState(true);

  useLayoutEffect(() => {
    if (pathname !== firstPath.current) {
      document.documentElement.classList.add("ep-nav-seen");
    }
  }, [pathname]);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const delay = reducedMotion ? 250 : 1900;
    const timeout = window.setTimeout(() => setVisible(false), delay);
    return () => window.clearTimeout(timeout);
  }, []);

  if (!visible) return null;

  return (
    <div className="ep-loading-screen" role="status" aria-label="Loading EcoPrawn">
      <div className="ep-loading-content">
        <BrandMark size={30} showWordmark />
        <span className="ep-loading-caption">SMART AQUACULTURE SYSTEM</span>
        <div className="ep-loading-track" aria-hidden="true">
          <span className="ep-loading-progress" />
        </div>
      </div>
    </div>
  );
}
