"use client";

import { useLayoutEffect, useRef, type CSSProperties } from "react";
import gsap from "gsap";
import { animate, stagger, utils } from "animejs";
import { BrandIcon } from "@/components/layout/BrandIcon";
import { heroReadouts } from "@/content/landing-preview";
import { heroReadoutUnits } from "@/config/sensors";

// LandingMotion fades the right column in at 1.2s. Start just after it.
const INTRO_DELAY = 1.35;

// Iris overlay: transparent inside the radius, solid outside. GSAP tweens --iris.
const IRIS_MASK =
  "radial-gradient(circle closest-side at 50% 50%, transparent var(--iris), #000 calc(var(--iris) + 8%))";

// Fixed values (no Math.random) so server and client markup match.
const TICKS = Array.from({ length: 72 }, (_, i) => {
  const a = (i / 72) * Math.PI * 2;
  const long = i % 6 === 0;
  const r1 = long ? 181 : 186;
  const r2 = 193;
  return {
    x1: (200 + Math.cos(a) * r1).toFixed(2),
    y1: (200 + Math.sin(a) * r1).toFixed(2),
    x2: (200 + Math.cos(a) * r2).toFixed(2),
    y2: (200 + Math.sin(a) * r2).toFixed(2),
    long,
  };
});

// Focus-ring segments at N / E / S / W (r = 112). Corners stay free for readouts.
const ARCS = [
  "M161.7 94.7A112 112 0 0 1 238.3 94.7",
  "M305.3 161.7A112 112 0 0 1 305.3 238.3",
  "M238.3 305.3A112 112 0 0 1 161.7 305.3",
  "M94.7 238.3A112 112 0 0 1 94.7 161.7",
];

const SPECKS = [
  { left: "14%", top: "70%", size: 4 },
  { left: "22%", top: "34%", size: 3 },
  { left: "31%", top: "82%", size: 5 },
  { left: "40%", top: "16%", size: 3 },
  { left: "52%", top: "88%", size: 4 },
  { left: "63%", top: "22%", size: 5 },
  { left: "72%", top: "74%", size: 3 },
  { left: "80%", top: "40%", size: 4 },
  { left: "88%", top: "62%", size: 3 },
  { left: "47%", top: "56%", size: 3 },
];

// One slot per corner, inside the circle.
const SLOTS = [
  "left-[17%] top-[20%] items-start text-left",
  "right-[17%] top-[20%] items-end text-right",
  "left-[17%] bottom-[20%] items-start text-left",
  "right-[17%] bottom-[20%] items-end text-right",
];

export function HeroLens() {
  const ref = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;

    const one = (sel: string) => root.querySelector<HTMLElement>(sel);
    const many = (sel: string) => Array.from(root.querySelectorAll<HTMLElement>(sel));

    const mm = gsap.matchMedia();

    /* ---------- Intro + ambient loops (skipped for reduced motion) ---------- */
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const iris = one(".ep-lens-iris");
      const rings = one(".ep-lens-rings");
      const ticks = one(".ep-lens-ticks");
      const shrimp = one(".ep-lens-shrimp");
      const arcs = one(".ep-lens-arcs");
      const pingEl = one(".ep-lens-ping");
      const scan = one(".ep-lens-scan");
      const flash = one(".ep-lens-flash");
      const caption = one(".ep-lens-caption");
      const readouts = many(".ep-lens-readout");
      const dots = many(".ep-lens-dot");
      const specks = many(".ep-lens-speck");
      if (!iris || !rings || !ticks || !shrimp || !arcs || !pingEl || !scan || !flash || !caption) return;

      const anims: Array<{ revert: () => unknown }> = [];

      /* anime.js: readout count-up. Numbers start at 0 and climb to the real value. */
      const counters: { node: ChildNode; original: string; target: number; decimals: number }[] = [];
      many("[data-count]").forEach((span) => {
        const node = span.firstChild;
        const original = span.dataset.count ?? "";
        const target = parseFloat(original);
        if (!node || !Number.isFinite(target)) return;
        const decimals = (original.split(".")[1] ?? "").length;
        node.nodeValue = (0).toFixed(decimals);
        counters.push({ node, original, target, decimals });
      });

      const startCount = () => {
        counters.forEach((c, i) => {
          const state = { v: 0 };
          anims.push(
            animate(state, {
              v: c.target,
              duration: 1500,
              delay: i * 120,
              ease: "outExpo",
              onUpdate: () => {
                c.node.nodeValue = state.v.toFixed(c.decimals);
              },
              onComplete: () => {
                c.node.nodeValue = c.original;
              },
            })
          );
        });
      };

      /* anime.js: sonar ping that fires on every focus lock */
      const ping = animate(pingEl, {
        scale: [0.55, 1.2],
        opacity: [
          { to: 0.55, duration: 120 },
          { to: 0, duration: 1180 },
        ],
        duration: 1300,
        ease: "outQuad",
        autoplay: false,
      });
      anims.push(ping);

      /* GSAP: one "autofocus lock": brackets squeeze, shutter flash, ping */
      const addLock = (target: gsap.core.Timeline, at: number, refocus: boolean) => {
        target
          .to(arcs, { scale: 0.92, duration: 0.16, ease: "power2.in" }, at)
          .to(arcs, { scale: 1, duration: 0.7, ease: "elastic.out(1, 0.45)" }, at + 0.16)
          .fromTo(flash, { opacity: 0 }, { opacity: 0.2, duration: 0.07, ease: "none" }, at)
          .to(flash, { opacity: 0, duration: 0.5, ease: "power2.out" }, at + 0.07)
          .call(() => ping.restart(), undefined, at);
        if (refocus) {
          target
            .to(shrimp, { filter: "blur(3px)", duration: 0.12, ease: "power2.in" }, at)
            .to(shrimp, { filter: "blur(0px)", duration: 0.5, ease: "power2.out" }, at + 0.12);
        }
      };

      /* GSAP: intro. Iris opens, shrimp hunts focus, brackets lock, readouts arrive. */
      gsap.set(shrimp, { filter: "blur(16px)", scale: 1.12 });

      const tl = gsap.timeline({ delay: INTRO_DELAY, defaults: { ease: "power3.out" } });
      tl.fromTo(iris, { "--iris": "0%" }, { "--iris": "100%", duration: 1.4, ease: "power2.inOut" }, 0)
        .from(rings, { scale: 0.6, opacity: 0, duration: 1.2 }, 0.1)
        .from(ticks, { opacity: 0, duration: 0.9, ease: "none" }, 0.3)
        .to(shrimp, { filter: "blur(6px)", duration: 0.55, ease: "power1.inOut" }, 0.25)
        .to(shrimp, { filter: "blur(11px)", duration: 0.35, ease: "power1.inOut" }, ">")
        .to(shrimp, { filter: "blur(0px)", scale: 1, duration: 0.7, ease: "power2.out" }, ">")
        .from(arcs, { scale: 1.4, opacity: 0, duration: 0.6, ease: "back.out(1.6)" }, 1.3)
        .from(readouts, { y: 14, opacity: 0, duration: 0.6, stagger: 0.1 }, 1.7)
        .call(startCount, undefined, 1.7)
        .from(caption, { opacity: 0, duration: 0.8, ease: "none" }, 2.2)
        .to(scan, { opacity: 0.85, duration: 0.6, ease: "none" }, 2.4);
      addLock(tl, 1.95, false);

      /* GSAP: the lens re-locks focus every few seconds */
      const loop = gsap.timeline({ repeat: -1, repeatDelay: 5.5, delay: INTRO_DELAY + 6 });
      addLock(loop, 0, true);

      /* anime.js: ambient loops */
      anims.push(
        animate(ticks, { rotate: 360, duration: 60000, ease: "linear", loop: true })
      );
      anims.push(
        animate(scan, {
          top: ["16%", "84%"],
          duration: 3600,
          ease: "inOutSine",
          loop: true,
          alternate: true,
        })
      );
      anims.push(
        animate(specks, {
          x: () => utils.random(-20, 20),
          y: () => utils.random(-60, -20),
          opacity: [0.1, 0.55],
          duration: () => utils.random(3500, 7000),
          delay: () => utils.random(0, 2000),
          ease: "inOutSine",
          loop: true,
          alternate: true,
        })
      );
      anims.push(
        animate(dots, {
          scale: [1, 1.7],
          opacity: [1, 0.5],
          duration: 900,
          delay: stagger(250),
          loopDelay: 1400,
          ease: "inOutSine",
          loop: true,
          alternate: true,
        })
      );

      return () => {
        anims.forEach((a) => a.revert());
        counters.forEach((c) => {
          c.node.nodeValue = c.original;
        });
      };
    });

    /* ---------- Pointer depth (real mouse, tablet width and up) ---------- */
    mm.add(
      "(hover: hover) and (pointer: fine) and (min-width: 768px) and (prefers-reduced-motion: no-preference)",
      () => {
        const shrimp = one(".ep-lens-shrimp");
        const rings = one(".ep-lens-rings");
        const glare = one(".ep-lens-glare");
        if (!shrimp || !rings || !glare) return;

        const opts = { duration: 0.8, ease: "power3.out" };
        const sx = gsap.quickTo(shrimp, "x", opts);
        const sy = gsap.quickTo(shrimp, "y", opts);
        const rx = gsap.quickTo(rings, "x", opts);
        const ry = gsap.quickTo(rings, "y", opts);
        const gx = gsap.quickTo(glare, "x", opts);
        const gy = gsap.quickTo(glare, "y", opts);

        const onMove = (e: PointerEvent) => {
          const r = root.getBoundingClientRect();
          const nx = (e.clientX - r.left) / r.width - 0.5;
          const ny = (e.clientY - r.top) / r.height - 0.5;
          sx(nx * -18);
          sy(ny * -18);
          rx(nx * 10);
          ry(ny * 10);
          gx(nx * 80);
          gy(ny * 80);
        };
        const onLeave = () => {
          sx(0);
          sy(0);
          rx(0);
          ry(0);
          gx(0);
          gy(0);
        };

        root.addEventListener("pointermove", onMove);
        root.addEventListener("pointerleave", onLeave);
        return () => {
          root.removeEventListener("pointermove", onMove);
          root.removeEventListener("pointerleave", onLeave);
        };
      }
    );

    return () => mm.revert();
  }, []);

  const readouts = heroReadouts.slice(0, 4);

  return (
    <figure
      ref={ref}
      aria-label="A shrimp inside a camera lens, with example water-quality readings"
      className="relative mx-auto aspect-square w-full max-w-[460px]"
    >
      {/* Lens barrel */}
      <div className="absolute inset-0 rounded-full bg-[linear-gradient(145deg,#1d5b62_0%,#0b2e33_55%,#06191c_100%)] p-[3.2%] shadow-[0_40px_70px_-34px_rgba(11,46,51,0.75),inset_0_2px_0_rgba(255,255,255,0.18)]">
        {/* Glass */}
        <div className="relative isolate h-full w-full overflow-hidden rounded-full bg-[radial-gradient(circle_at_50%_46%,#1d5b62_0%,#12474d_38%,#0b2e33_72%,#071f23_100%)] ring-1 ring-[rgba(251,248,241,0.25)]">
          {/* Concentric rings */}
          <svg
            aria-hidden="true"
            viewBox="0 0 400 400"
            fill="none"
            className="ep-lens-rings pointer-events-none absolute inset-0 h-full w-full"
          >
            <circle cx="200" cy="200" r="176" stroke="rgba(242,235,221,0.14)" strokeWidth="1" />
            <circle cx="200" cy="200" r="146" stroke="rgba(242,235,221,0.10)" strokeWidth="1" />
            <circle
              cx="200"
              cy="200"
              r="112"
              stroke="rgba(242,235,221,0.16)"
              strokeWidth="1"
              strokeDasharray="2 7"
            />
          </svg>

          {/* Focus-ring ticks (anime.js rotates this) */}
          <svg
            aria-hidden="true"
            viewBox="0 0 400 400"
            className="ep-lens-ticks pointer-events-none absolute inset-0 h-full w-full"
          >
            {TICKS.map((t, i) => (
              <line
                key={i}
                x1={t.x1}
                y1={t.y1}
                x2={t.x2}
                y2={t.y2}
                stroke={t.long ? "rgba(242,235,221,0.55)" : "rgba(242,235,221,0.28)"}
                strokeWidth={t.long ? 2 : 1.2}
                strokeLinecap="round"
              />
            ))}
          </svg>

          {/* Plankton */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            {SPECKS.map((s) => (
              <span
                key={`${s.left}-${s.top}`}
                className="ep-lens-speck absolute rounded-full bg-[var(--sand)] opacity-[0.1]"
                style={{ left: s.left, top: s.top, width: s.size, height: s.size }}
              />
            ))}
          </div>

          {/* The prawn */}
          <div
            aria-hidden="true"
            className="ep-lens-shrimp pointer-events-none absolute inset-0 flex items-center justify-center"
          >
            <BrandIcon
              className="h-auto w-[40%] drop-shadow-[0_0_16px_rgba(232,98,58,0.35)]"
              timeScale={1.2}
            />
          </div>

          {/* Autofocus segments */}
          <svg
            aria-hidden="true"
            viewBox="0 0 400 400"
            fill="none"
            className="ep-lens-arcs pointer-events-none absolute inset-0 h-full w-full"
          >
            {ARCS.map((d) => (
              <path key={d} d={d} stroke="var(--coral)" strokeWidth="3" strokeLinecap="round" />
            ))}
          </svg>

          {/* Lock ping + scan line */}
          <span
            aria-hidden="true"
            className="ep-lens-ping pointer-events-none absolute inset-[22%] rounded-full border-2 border-[var(--coral)] opacity-0"
          />
          <span
            aria-hidden="true"
            className="ep-lens-scan pointer-events-none absolute inset-x-[22%] top-[16%] h-px bg-[linear-gradient(90deg,transparent,rgba(255,138,99,0.9),transparent)] opacity-0 shadow-[0_0_14px_rgba(232,98,58,0.7)]"
          />

          {/* Readouts */}
          {readouts.map((r, i) => (
            <div key={r.label} className={`ep-lens-readout absolute flex flex-col ${SLOTS[i]}`}>
              <span className="flex items-center gap-1.5 text-[10px] font-medium text-[rgba(242,235,221,0.78)] sm:text-xs">
                <span
                  aria-hidden="true"
                  className="ep-lens-dot inline-block h-1.5 w-1.5 rounded-full bg-[var(--mangrove-light)]"
                />
                {r.label}
              </span>
              <span className="mt-0.5 text-lg font-semibold tabular-nums text-[var(--ep-bg)] sm:text-2xl">
                <span data-count={r.value}>{r.value}</span>
                <span className="ml-1 text-[10px] font-medium text-[rgba(242,235,221,0.72)] sm:text-xs">
                  {heroReadoutUnits[r.label]}
                </span>
              </span>
            </div>
          ))}

          <p className="ep-lens-caption absolute bottom-[12%] left-1/2 w-[56%] -translate-x-1/2 text-center text-[10px] leading-tight text-[rgba(242,235,221,0.72)] sm:text-[11px]">
            Example readings, not from a real tank.
          </p>

          {/* Glass finish: vignette, specular crescent, cursor glare, shutter flash */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-full shadow-[inset_0_0_70px_rgba(0,0,0,0.5)]"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-[4%] rounded-full border-t-2 border-[rgba(255,255,255,0.2)] [mask-image:linear-gradient(180deg,#000,transparent_40%)]"
          />
          <span
            aria-hidden="true"
            className="ep-lens-glare pointer-events-none absolute -left-[10%] -top-[10%] h-[70%] w-[70%] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.2)_0%,rgba(255,255,255,0.05)_45%,transparent_70%)]"
          />
          <span
            aria-hidden="true"
            className="ep-lens-flash pointer-events-none absolute inset-0 bg-white opacity-0"
          />

          {/* Iris: covers the glass, then opens */}
          <span
            aria-hidden="true"
            className="ep-lens-iris pointer-events-none absolute inset-0 bg-[#061a1d]"
            style={
              {
                "--iris": "100%",
                maskImage: IRIS_MASK,
                WebkitMaskImage: IRIS_MASK,
              } as CSSProperties
            }
          />
        </div>
      </div>
    </figure>
  );
}