"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "./Icon";

/** Coral bar fixed to the top of the viewport showing page progress. */
export function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onScroll() {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      if (barRef.current) barRef.current.style.transform = `scaleX(${ratio})`;
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-[calc(4rem+1px)] z-[60] h-[3px]">
      <div
        ref={barRef}
        className="h-full origin-left bg-[var(--ep-accent)]"
        style={{ transform: "scaleX(0)", willChange: "transform" }}
      />
    </div>
  );
}

/** Floating button that appears after the hero and scrolls back to the top. */
export function BackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    function onScroll() {
      setShow(window.scrollY > 600);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function scrollTop() {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  }

  return (
    <button
      type="button"
      onClick={scrollTop}
      aria-label="Back to top"
      aria-hidden={!show}
      tabIndex={show ? 0 : -1}
      className={`fixed bottom-5 right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full border-2 border-[var(--ep-bg)] bg-[var(--ep-accent)] text-white shadow-[0_12px_28px_-8px_rgba(11,46,51,0.6)] transition-all duration-200 hover:-translate-y-1 hover:bg-[var(--ep-accent-hover)] active:translate-y-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ep-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ep-bg)] ${
        show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
      }`}
    >
      <Icon name="arrow-up" size={20} strokeWidth={2.2} />
    </button>
  );
}

/** Mount both scroll helpers with one tag. */
export function ScrollEnhancements() {
  return (
    <>
      <ScrollProgress />
      <BackToTop />
    </>
  );
}