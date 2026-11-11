import { useEffect, useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import { animate, stagger, utils } from "animejs";
import { MOTION_ALLOWED_QUERY, MOTION_FINE_POINTER_QUERY, motionIsAllowed } from "./motionRuntime";

// Fixed values (no Math.random) so the markup is stable between renders.
const SPECKS = [
  { left: "4%", top: "72%", size: 5 },
  { left: "9%", top: "38%", size: 3 },
  { left: "15%", top: "84%", size: 6 },
  { left: "22%", top: "52%", size: 4 },
  { left: "28%", top: "20%", size: 5 },
  { left: "35%", top: "78%", size: 3 },
  { left: "42%", top: "44%", size: 7 },
  { left: "48%", top: "12%", size: 4 },
  { left: "55%", top: "88%", size: 5 },
  { left: "61%", top: "30%", size: 3 },
  { left: "68%", top: "66%", size: 6 },
  { left: "74%", top: "16%", size: 4 },
  { left: "81%", top: "58%", size: 5 },
  { left: "87%", top: "34%", size: 3 },
  { left: "92%", top: "80%", size: 6 },
  { left: "96%", top: "46%", size: 4 },
];

/**
 * Extra hero motion. anime.js: ambient loops (plankton specks, proof dots).
 * GSAP: pointer tilt and magnetic buttons. Renders its
 * specks into #top through a portal; everything else targets existing DOM.
 */
export function HeroEnhance() {
  const [host, setHost] = useState<HTMLElement | null>(null);

  // Only mount the specks when motion is allowed.
  useEffect(() => {
    if (!motionIsAllowed()) return;
    setHost(document.getElementById("top"));
  }, []);

  // anime.js: ambient loops.
  useEffect(() => {
    if (!host) return;

    const specks = Array.from(
      host.querySelectorAll<HTMLElement>(".ep-hero-speck")
    );
    const dots = Array.from(host.querySelectorAll<HTMLElement>("[data-hero-sensor-dot]"));
    const bars = Array.from(host.querySelectorAll<HTMLElement>("[data-hero-sensor-bar]"));
    const glow = host.querySelector<HTMLElement>(".ep-hero-monitor-glow");

    const drift = animate(specks, {
      x: () => utils.random(-40, 40),
      y: () => utils.random(-90, -30),
      opacity: [0.15, 0.6],
      duration: () => utils.random(4000, 8000),
      delay: () => utils.random(0, 2500),
      ease: "inOutSine",
      loop: true,
      alternate: true,
    });

    // Sensor status lights breathe softly; progress tracks fill once on entry.
    const pulse = animate(dots, {
      scale: [1, 1.55],
      opacity: [.72, 1],
      duration: 900,
      delay: stagger(180),
      loopDelay: 1500,
      ease: "inOutSine",
      loop: true,
      alternate: true,
    });
    const glowBreath = glow ? animate(glow, {
      scale: [.9, 1.12],
      opacity: [.38, .72],
      duration: 5200,
      ease: "inOutSine",
      loop: true,
      alternate: true,
    }) : null;
    bars.forEach((bar, index) => {
      animate(bar, {
        scaleX: [0, 1],
        transformOrigin: "left center",
        duration: 850,
        delay: 240 + index * 95,
        ease: "out(3)",
      });
    });

    return () => {
      drift.revert();
      pulse.revert();
      glowBreath?.revert();
      bars.forEach((bar) => { bar.style.transform = ""; });
    };
  }, [host]);

  // GSAP: tilt and magnetic buttons.
  useLayoutEffect(() => {
    const mm = gsap.matchMedia();

    // Pointer effects: real mouse, tablet width and up.
    mm.add(
      `${MOTION_FINE_POINTER_QUERY} and ${MOTION_ALLOWED_QUERY}`,
      () => {
        const cleanups: Array<() => void> = [];

        // Tank panel tilts toward the cursor. Rotation only, so it stacks
        // with the scroll parallax (y) and the intro (scale on the wrapper).
        const zone = document.querySelector<HTMLElement>("#top [data-hero=monitor-panel]");
        const panel = zone;
        if (zone && panel) {
          gsap.set(panel, { transformPerspective: 900 });
          const rotX = gsap.quickTo(panel, "rotationX", {
            duration: 0.6,
            ease: "power3.out",
          });
          const rotY = gsap.quickTo(panel, "rotationY", {
            duration: 0.6,
            ease: "power3.out",
          });
          const onMove = (e: PointerEvent) => {
            const r = zone.getBoundingClientRect();
            const nx = (e.clientX - r.left) / r.width - 0.5;
            const ny = (e.clientY - r.top) / r.height - 0.5;
            rotY(nx * 10);
            rotX(-ny * 8);
          };
          const onLeave = () => {
            rotX(0);
            rotY(0);
          };
          zone.addEventListener("pointermove", onMove);
          zone.addEventListener("pointerleave", onLeave);
          cleanups.push(() => {
            zone.removeEventListener("pointermove", onMove);
            zone.removeEventListener("pointerleave", onLeave);
          });
        }

        // Hero buttons lean toward the cursor. x/y use `transform`; the
        // Tailwind hover lift uses the separate `translate` property, so
        // they combine instead of overwriting each other.
        gsap
          .utils.toArray<HTMLElement>('#top [data-dashboard-entry], #top a[href="/about"]')
          .forEach((btn) => {
            const moveX = gsap.quickTo(btn, "x", {
              duration: 0.5,
              ease: "power3.out",
            });
            const moveY = gsap.quickTo(btn, "y", {
              duration: 0.5,
              ease: "power3.out",
            });
            const onMove = (e: PointerEvent) => {
              const r = btn.getBoundingClientRect();
              moveX((e.clientX - (r.left + r.width / 2)) * 0.2);
              moveY((e.clientY - (r.top + r.height / 2)) * 0.3);
            };
            const onLeave = () => {
              moveX(0);
              moveY(0);
            };
            btn.addEventListener("pointermove", onMove);
            btn.addEventListener("pointerleave", onLeave);
            cleanups.push(() => {
              btn.removeEventListener("pointermove", onMove);
              btn.removeEventListener("pointerleave", onLeave);
            });
          });

        return () => cleanups.forEach((fn) => fn());
      }
    );

    return () => mm.revert();
  }, []);

  if (!host) return null;

  return createPortal(
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      {SPECKS.map((s) => (
        <span
          key={`${s.left}-${s.top}`}
          className="ep-hero-speck absolute rounded-full bg-[var(--ep-primary)] opacity-[0.15]"
          style={{ left: s.left, top: s.top, width: s.size, height: s.size }}
        />
      ))}
    </div>,
    host
  );
}