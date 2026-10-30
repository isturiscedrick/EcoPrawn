"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";
import { HeroEnhance } from "./HeroEnhance";
import { LogoMotion } from "./LogoMotion";

gsap.registerPlugin(ScrollTrigger, MorphSVGPlugin);

// Water surfaces on a 100x100 viewBox stretched over the screen. Every path
// has the same command structure (M, C, C, V, H, z) so MorphSVG can
// interpolate cleanly. "covered" and "gone" keep the whole wave off-screen.
const WAVE = {
  covered: "M 0 -18 C 17 -26 33 -10 50 -18 C 67 -26 83 -10 100 -18 V 140 H 0 z",
  high: "M 0 35 C 17 28 33 42 50 35 C 67 28 83 42 100 35 V 140 H 0 z",
  low: "M 0 68 C 17 76 33 60 50 68 C 67 76 83 60 100 68 V 140 H 0 z",
  gone: "M 0 110 C 17 104 33 116 50 110 C 67 104 83 116 100 110 V 140 H 0 z",
};

// Fixed positions (no Math.random) so server and client markup match.
const BUBBLES = [
  { left: "6%", size: 10 },
  { left: "14%", size: 6 },
  { left: "23%", size: 14 },
  { left: "33%", size: 8 },
  { left: "42%", size: 12 },
  { left: "51%", size: 6 },
  { left: "60%", size: 16 },
  { left: "69%", size: 8 },
  { left: "78%", size: 12 },
  { left: "86%", size: 6 },
  { left: "93%", size: 10 },
  { left: "48%", size: 9 },
];

/**
 * GSAP motion for the landing page. Renders the underwater intro overlay,
 * then finds its other targets in the DOM by the structure LandingPage
 * already has. Only runs when the user has not asked for reduced motion.
 */
export function LandingMotion() {
  const overlayRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<SVGPathElement>(null);
  const frontRef = useRef<SVGPathElement>(null);

  useLayoutEffect(() => {
    const mm = gsap.matchMedia();
    let cancelled = false;

    // Google Fonts (Lexend/Inter) swap in after first paint and reflow the
    // text, which shifts every scroll trigger's start position. Re-measure
    // once they are ready.
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => {
        if (!cancelled) ScrollTrigger.refresh();
      });
    }

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      // HERO: left column items stagger in, tank card follows. The delay
      // lets the water drain past the hero before the text appears.
      gsap
        .timeline({ defaults: { ease: "power3.out" }, delay: 1.2 })
        .from("#top .grid > div:first-child > *", {
          y: 24,
          opacity: 0,
          duration: 0.7,
          stagger: 0.1,
        })
        .from(
          "#top .grid > div:last-child",
          { y: 32, opacity: 0, scale: 0.97, duration: 0.9 },
          0.15
        );

      // READINGS: each reading rises in, then its bar fills while its
      // number counts up from 0.
      const readings = '[aria-labelledby="readings-title"]';
      const readingsTl = gsap.timeline({
        defaults: { ease: "power3.out" },
        scrollTrigger: { trigger: readings, start: "top 75%", once: true },
      });

      readingsTl
        .from(`${readings} dl > div`, {
          y: 24,
          opacity: 0,
          duration: 0.6,
          stagger: 0.08,
        })
        .addLabel("fill", "-=0.4")
        .from(
          `${readings} dl [aria-hidden="true"] > div`,
          {
            scaleX: 0,
            transformOrigin: "left center",
            duration: 0.9,
            stagger: 0.08,
          },
          "fill"
        );

      // The number is the first text node inside each <dd> (the unit is a
      // <span> after it). Keep the original decimals: "6.2" stays one
      // decimal, "15" stays whole. Originals are restored on cleanup so a
      // re-run (React strict mode) starts from the real value.
      const restores: Array<() => void> = [];
      document
        .querySelectorAll<HTMLElement>(`${readings} dl dd`)
        .forEach((dd, i) => {
          const node = dd.firstChild;
          if (!node || node.nodeType !== Node.TEXT_NODE) return;
          const original = node.nodeValue ?? "";
          const target = parseFloat(original);
          if (!Number.isFinite(target)) return;
          const decimals = (original.trim().split(".")[1] ?? "").length;

          const counter = { value: 0 };
          node.nodeValue = (0).toFixed(decimals);
          restores.push(() => {
            node.nodeValue = original;
          });

          readingsTl.to(
            counter,
            {
              value: target,
              duration: 1.2,
              ease: "power2.out",
              onUpdate: () => {
                node.nodeValue = counter.value.toFixed(decimals);
              },
              onComplete: () => {
                node.nodeValue = original;
              },
            },
            `fill+=${i * 0.08}`
          );
        });

      // DASHBOARD PREVIEW: points slide in from the left, card from the right.
      const preview = '[aria-labelledby="preview-title"]';
      gsap
        .timeline({
          defaults: { ease: "power3.out" },
          scrollTrigger: { trigger: preview, start: "top 70%", once: true },
        })
        .from(`${preview} ul li`, {
          x: -24,
          opacity: 0,
          duration: 0.6,
          stagger: 0.12,
        })
        .from(
          `${preview} .grid > div:last-child`,
          { x: 40, opacity: 0, duration: 0.9 },
          0
        );

      // PROCESS: each step's circle pops in as it enters view.
      gsap.utils
        .toArray<HTMLElement>("#process ol li .rounded-full")
        .forEach((circle) => {
          gsap.from(circle, {
            scale: 0.6,
            opacity: 0,
            duration: 0.5,
            ease: "back.out(1.7)",
            scrollTrigger: { trigger: circle, start: "top 85%", once: true },
          });
        });

      return () => restores.forEach((restore) => restore());
    });

    // PROCESS LINE: desktop only (the line is hidden below lg). It draws
    // left to right, tied to scroll position, in the accent color.
    mm.add(
      "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
      () => {
        const line = document.querySelector<HTMLElement>(
          '#process .relative > [aria-hidden="true"]'
        );
        if (!line) return;
        gsap.fromTo(
          line,
          { scaleX: 0, transformOrigin: "left center" },
          {
            scaleX: 1,
            height: 2,
            backgroundColor: "#b23f1c",
            ease: "none",
            scrollTrigger: {
              trigger: "#process ol",
              start: "top 75%",
              end: "top 35%",
              scrub: true,
            },
          }
        );
      }
    );

    // HERO DEPTH: float for every size, parallax from tablet up.
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const readout = document.querySelector<HTMLElement>(
        "#top .grid > div:last-child > div:last-child"
      );
      if (readout) {
        // yPercent, not y: the parallax below owns y on the same element.
        gsap.to(readout, {
          yPercent: -8,
          duration: 2.6,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });
      }
    });

    mm.add(
      "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
      () => {
        const panel = document.querySelector<HTMLElement>(
          "#top .grid > div:last-child > div:first-child"
        );
        const readout = document.querySelector<HTMLElement>(
          "#top .grid > div:last-child > div:last-child"
        );
        const scrollTrigger = {
          trigger: "#top",
          start: "top top",
          end: "bottom top",
          scrub: true,
        };
        // Both drift down slower than the page; the readout moves less
        // than the tank, which reads as it floating in front.
        if (panel) gsap.to(panel, { y: 40, ease: "none", scrollTrigger });
        if (readout) gsap.to(readout, { y: 16, ease: "none", scrollTrigger });
      }
    );

    // MORE SCROLL EFFECTS
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      // 1. Hero text drifts up and fades as you scroll past (scrubbed).
      //    Targets the column wrapper; the intro animates its children.
      gsap.to("#top .grid > div:first-child", {
        y: -48,
        opacity: 0.25,
        ease: "none",
        scrollTrigger: {
          trigger: "#top",
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      // 2. Readings band heading + intro line rise in before the readings.
      gsap.from("#readings-title, #readings-title + p", {
        y: 20,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: '[aria-labelledby="readings-title"]',
          start: "top 80%",
          once: true,
        },
      });

      // 3. Preview heading + paragraph rise in.
      gsap.from("#preview-title, #preview-title + p", {
        y: 20,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: '[aria-labelledby="preview-title"]',
          start: "top 80%",
          once: true,
        },
      });

      // 4. Preview KPI tiles pop up one by one after the card arrives.
      gsap.from('[aria-labelledby="preview-title"] .grid-cols-3 > div', {
        y: 16,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
        delay: 0.4,
        ease: "power3.out",
        scrollTrigger: {
          trigger: '[aria-labelledby="preview-title"] .grid-cols-3',
          start: "top 80%",
          once: true,
        },
      });

      // 5. Oxygen chart is revealed left to right, tied to scroll.
      //    clip-path, not stroke-dash: the chart uses non-scaling strokes
      //    on a stretched viewBox, which breaks the dash trick.
      const chart = document.querySelector<SVGSVGElement>(
        '[aria-labelledby="preview-title"] svg'
      );
      if (chart) {
        gsap.fromTo(
          chart,
          { clipPath: "inset(0 100% 0 0)" },
          {
            clipPath: "inset(0 0% 0 0)",
            ease: "none",
            scrollTrigger: {
              trigger: chart,
              start: "top 85%",
              end: "top 50%",
              scrub: true,
            },
          }
        );
      }
    });

    // UNDERWATER INTRO: the page starts submerged (markup), bubbles rise,
    // then the water level drains down with a wavy surface.
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const overlay = overlayRef.current;
      const back = backRef.current;
      const front = frontRef.current;
      if (!overlay || !back || !front) return;

      const bubbles = gsap.utils.toArray<HTMLElement>(
        ".ep-water-bubble",
        overlay
      );

      const tl = gsap.timeline({
        onComplete: () => {
          gsap.set(overlay, { display: "none" });
        },
      });

      tl.fromTo(
        bubbles,
        { y: 0, opacity: 0.7 },
        {
          y: -(window.innerHeight + 80),
          opacity: 0,
          duration: 2.2,
          ease: "none",
          stagger: 0.12,
        },
        0
      );

      // The surface passes through two wave shapes on its way down, so it
      // ripples instead of sliding flat.
      const drain = (target: SVGPathElement, at: number) => {
        tl.to(
          target,
          { morphSVG: WAVE.high, duration: 0.55, ease: "power1.in" },
          at
        )
          .to(
            target,
            { morphSVG: WAVE.low, duration: 0.55, ease: "sine.inOut" },
            at + 0.55
          )
          .to(
            target,
            { morphSVG: WAVE.gone, duration: 0.6, ease: "power1.out" },
            at + 1.1
          );
      };

      // The lighter back layer trails the front one: it stays higher, so a
      // pale band of shallower water rides above the deep surface.
      drain(front, 0.5);
      drain(back, 0.7);
    });

    return () => {
      cancelled = true;
      mm.revert();
    };
  }, []);

  return (
    <>
      <style>{`
        @keyframes ep-water-failsafe { to { visibility: hidden; } }
        .ep-water-curtain { animation: ep-water-failsafe 0.01s linear 5s forwards; }
        @media (prefers-reduced-motion: reduce) { .ep-water-curtain { display: none; } }
      `}</style>
      <div
        ref={overlayRef}
        aria-hidden="true"
        className="ep-water-curtain pointer-events-none fixed inset-0 z-[70] overflow-hidden"
      >
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full"
        >
          <defs>
            <linearGradient
              id="ep-water-curtain-grad"
              gradientUnits="userSpaceOnUse"
              x1="0"
              y1="0"
              x2="0"
              y2="100"
            >
              <stop offset="0%" stopColor="#1D5B62" />
              <stop offset="100%" stopColor="#0B2E33" />
            </linearGradient>
          </defs>
          <path ref={backRef} d={WAVE.covered} fill="#2F8791" />
          <path
            ref={frontRef}
            d={WAVE.covered}
            fill="url(#ep-water-curtain-grad)"
          />
        </svg>

        {BUBBLES.map((b) => (
          <span
            key={b.left}
            className="ep-water-bubble absolute rounded-full border border-[rgba(242,235,221,0.5)] bg-[rgba(242,235,221,0.18)]"
            style={{ left: b.left, bottom: -24, width: b.size, height: b.size }}
          />
        ))}
      </div>
      <HeroEnhance />
      <LogoMotion />
    </>
  );
}