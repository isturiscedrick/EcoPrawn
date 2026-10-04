"use client";

import { useEffect, useRef, useState } from "react";

interface ScrollFadeContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function ScrollFadeContainer({ children, className = "" }: ScrollFadeContainerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    function update() {
      if (!el) return;
      setShowLeft(el.scrollLeft > 4);
      setShowRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    }

    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [children]);

  return (
    <div className="relative">
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-white to-transparent transition-opacity duration-200 ${
          showLeft ? "opacity-100" : "opacity-0"
        }`}
      />
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-white to-transparent transition-opacity duration-200 ${
          showRight ? "opacity-100" : "opacity-0"
        }`}
      />
      <div ref={ref} className={`overflow-x-auto ${className}`}>
        {children}
      </div>
    </div>
  );
}