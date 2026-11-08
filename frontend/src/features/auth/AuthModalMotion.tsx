import type { RefObject } from "react";

const SPECKS = [
  { left: "5%", top: "78%", size: 6 }, { left: "11%", top: "34%", size: 4 },
  { left: "18%", top: "88%", size: 8 }, { left: "26%", top: "56%", size: 5 },
  { left: "33%", top: "18%", size: 6 }, { left: "41%", top: "84%", size: 4 },
  { left: "49%", top: "40%", size: 7 }, { left: "57%", top: "10%", size: 5 },
  { left: "64%", top: "90%", size: 6 }, { left: "72%", top: "30%", size: 4 },
  { left: "79%", top: "68%", size: 8 }, { left: "86%", top: "14%", size: 5 },
  { left: "92%", top: "52%", size: 6 }, { left: "96%", top: "82%", size: 4 },
];

const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Browser-native closing transition; no animation package required. */
export function playAuthExit(
  overlay: HTMLElement | null,
  panel: HTMLElement | null,
  done: () => void,
) {
  if (!overlay || !panel || prefersReducedMotion() || typeof panel.animate !== "function") {
    done();
    return;
  }

  const backdrop = overlay.querySelector<HTMLElement>("[data-auth-backdrop]");
  const decor = overlay.querySelector<HTMLElement>("[data-auth-decor]");
  const targets = [panel, backdrop, decor].filter(Boolean) as HTMLElement[];
  let remaining = targets.length;
  const finish = () => {
    remaining -= 1;
    if (remaining <= 0) done();
  };

  targets.forEach((target) => {
    const isPanel = target === panel;
    const animation = target.animate(
      isPanel
        ? [{ opacity: 1, transform: "translateY(0) scale(1)" }, { opacity: 0, transform: "translateY(16px) scale(.98)" }]
        : [{ opacity: 1 }, { opacity: 0 }],
      { duration: 210, easing: "ease-in", fill: "forwards" },
    );
    animation.onfinish = finish;
  });
}

interface AuthModalMotionProps {
  overlayRef: RefObject<HTMLDivElement | null>;
  panelRef: RefObject<HTMLDivElement | null>;
}

/** Static decorative details; modal entrance and field feedback are CSS-native. */
export function AuthModalMotion({ overlayRef, panelRef }: AuthModalMotionProps) {
  void overlayRef;
  void panelRef;

  return (
    <div data-auth-decor="" aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
      {SPECKS.map((speck) => (
        <span
          key={`${speck.left}-${speck.top}`}
          className="ep-auth-speck absolute rounded-full bg-[rgba(255,255,255,0.6)] opacity-[0.08]"
          style={{ left: speck.left, top: speck.top, width: speck.size, height: speck.size }}
        />
      ))}
    </div>
  );
}
