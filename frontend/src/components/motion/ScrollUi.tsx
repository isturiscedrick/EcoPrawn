import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";

/**
 * Scroll progress bar that automatically stays
 * above the sticky site header.
 */
export function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let frameId = 0;

    function updateProgress() {
      const root = document.documentElement;

      const maxScroll = Math.max(
        0,
        root.scrollHeight - root.clientHeight
      );

      const progress =
        maxScroll > 0
          ? Math.min(
              1,
              Math.max(0, window.scrollY / maxScroll)
            )
          : 0;

      if (barRef.current) {
        barRef.current.style.transform = `scaleX(${progress})`;
      }

    }

    function scheduleUpdate() {
      if (frameId !== 0) return;

      frameId = requestAnimationFrame(() => {
        frameId = 0;
        updateProgress();
      });
    }

    updateProgress();

    window.addEventListener("scroll", scheduleUpdate, {
      passive: true,
    });

    window.addEventListener("resize", scheduleUpdate);

    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);

      cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-[3px]"
    >
      <div
        ref={barRef}
        className="h-full origin-left bg-[var(--ep-accent)]"
        style={{
          transform: "scaleX(0)",
          willChange: "transform",
        }}
      />
    </div>
  );
}

/**
 * Floating Back to Top button.
 * Appears after scrolling 600 pixels.
 */
export function BackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    function onScroll() {
      setShow(window.scrollY > 600);
    }

    onScroll();

    window.addEventListener("scroll", onScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  function scrollTop() {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    window.scrollTo({
      top: 0,
      behavior: reduce ? "auto" : "smooth",
    });
  }

  return (
    <button
      type="button"
      onClick={scrollTop}
      aria-label="Back to top"
      aria-hidden={!show}
      tabIndex={show ? 0 : -1}
      className={`ep-back-to-top fixed bottom-5 right-5 z-[55] flex h-12 w-12 items-center justify-center rounded-full border-2 border-[var(--ep-bg)] bg-[var(--ep-accent)] text-white shadow-[0_12px_28px_-8px_rgba(11,46,51,0.6)] transition-all duration-200 hover:-translate-y-1 hover:bg-[var(--ep-accent-hover)] active:translate-y-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ep-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ep-bg)] ${
        show
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-3 opacity-0"
      }`}
    >
      <Icon
        name="arrow-up"
        size={20}
        strokeWidth={2.2}
      />
    </button>
  );
}

/** Enable both scroll features. */
export function ScrollEnhancements() {
  return (
    <>
      <ScrollProgress />
      <BackToTop />
    </>
  );
}
