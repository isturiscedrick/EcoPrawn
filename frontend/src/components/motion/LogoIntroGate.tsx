"use client";

import { useLayoutEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * Marks <html> after the first in-app navigation so the header logo stops
 * replaying its draw-on animation. A full reload starts with a fresh <html>,
 * so the animation plays again.
 */
export function LogoIntroGate() {
  const pathname = usePathname();
  const firstPath = useRef(pathname);

  // Layout effect: runs before paint, so the new header never flashes the animation.
  useLayoutEffect(() => {
    if (pathname !== firstPath.current) {
      document.documentElement.classList.add("ep-nav-seen");
    }
  }, [pathname]);

  return null;
}