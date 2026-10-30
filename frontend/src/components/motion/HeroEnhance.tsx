"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import { animate, stagger, utils } from "animejs";

// Same key LandingMotion uses. Decides how long to wait for the hero intro:
// the water intro (first visit) pushes the hero text back to ~1.2s.
const INTRO_KEY = "ep-intro-seen";

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

function introSeen(): boolean {
  try {
    return sessionStorage.getItem(INTRO_KEY) === "1";
  } catch {
    return false;
  }
}

/**
 * Extra hero motion. anime.js: ambient loops (plankton specks, proof dots).
 * GSAP: headline underline, pointer tilt, magnetic buttons. Renders its
 * specks into #top through a portal; everything else targets existing DOM.
 */
export function HeroEnhance() {
  const [host, setHost] = useState<HTMLElement | null>(null);

  // Only mount the specks when motion is allowed.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setHost(document.getElementById("top"));
  }, []);

  // anime.js: ambient loops.
  useEffect(() => {
    if (!host) return;

    const specks = Array.from(
      host.querySelectorAll<HTMLElement>(".ep-hero-speck")
    );
    const dots = Array.from(host.querySelectorAll<HTMLElement>("ul li > span"));

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

    // The dots are flex items (their <li> is flex), so transforms apply.
    const pulse = animate(dots, {
      scale: [1, 1.6],
      duration: 800,
      delay: stagger(250),
      loopDelay: 1400,
      ease: "inOutSine",
      loop: true,
      alternate: true,
    });

    return () => {
      drift.revert();
      pulse.revert();
    };
  }, [host]);

  // GSAP: underline, tilt, magnetic buttons.
  useLayoutEffect(() => {
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      // Underline under the accent phrase, drawn once the headline has
      // landed (hero intro starts at `delay`, headline is done ~0.8s later).
      const accent = document.querySelector<HTMLElement>("#top h1 span");
      if (accent) {
        const introDelay = introSeen() ? 0.15 : 1.2;
        gsap.set(accent, {
          backgroundImage: "linear-gradient(currentColor, currentColor)",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "0 96%",
          backgroundSize: "0% 6px",
        });
        gsap.to(accent, {
          backgroundSize: "100% 6px",
          duration: 0.8,
          ease: "power2.out",
          delay: introDelay + 0.8,
        });
      }
    });

    // Pointer effects: real mouse, tablet width and up.
    mm.add(
      "(hover: hover) and (pointer: fine) and (min-width: 768px) and (prefers-reduced-motion: no-preference)",
      () => {
        const cleanups: Array<() => void> = [];

        // Tank panel tilts toward the cursor. Rotation only, so it stacks
        // with the scroll parallax (y) and the intro (scale on the wrapper).
        const zone = document.querySelector<HTMLElement>(
          "#top .grid > div:last-child"
        );
        const panel = zone?.firstElementChild as HTMLElement | null;
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
          .utils.toArray<HTMLElement>('#top a[href="/login"], #top a[href="/about"]')
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