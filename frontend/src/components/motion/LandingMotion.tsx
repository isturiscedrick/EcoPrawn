import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { animate } from "animejs";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";
import { HeroEnhance } from "./HeroEnhance";

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, MorphSVGPlugin);

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

const WATER_INTRO_KEY = "ep-water-intro-seen";

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
    let playWaterIntro = true;

    try {
      playWaterIntro = sessionStorage.getItem(WATER_INTRO_KEY) !== "1";
      if (playWaterIntro) {
        sessionStorage.setItem(WATER_INTRO_KEY, "1");
      }
    } catch {
      // Session storage may be unavailable; the intro can still fail safely.
    }

    // Google Fonts (Lexend/Inter) swap in after first paint and reflow the
    // text, which shifts every scroll trigger's start position. Re-measure
    // once they are ready.
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => {
        if (!cancelled) ScrollTrigger.refresh();
      });
    }

    // SMOOTH SCROLL: normalize touch/inertial scrolling with GSAP.
    // ScrollSmoother is a paid plugin, so this uses the free ScrollTrigger
    // normalizer and ScrollToPlugin already included with GSAP.
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      // Keep native wheel/touch scrolling responsive. GSAP is used only
      // for deliberate in-page anchor navigation, not to intercept every wheel event.
      const anchorLinks = gsap.utils.toArray<HTMLAnchorElement>(
        'a[href^="#"]:not([href="#"])'
      );
      const handlers: Array<() => void> = [];

      anchorLinks.forEach((link) => {
        const handleClick = (event: MouseEvent) => {
          const href = link.getAttribute("href");
          if (
            !href ||
            event.defaultPrevented ||
            event.button !== 0 ||
            event.metaKey ||
            event.ctrlKey ||
            event.shiftKey ||
            event.altKey ||
            link.target === "_blank" ||
            link.hasAttribute("download")
          ) return;
          const targetId = href.startsWith("#") ? decodeURIComponent(href.slice(1)) : "";
          if (!targetId) return;
          const target = document.getElementById(targetId);
          if (!target) return;

          event.preventDefault();
          gsap.to(window, {
            duration: 1.05,
            ease: "power3.inOut",
            overwrite: "auto",
            scrollTo: {
              y: target,
              offsetY: 84,
              autoKill: true,
            },
            onComplete: () => {
              history.replaceState(null, "", href);
            },
          });
        };

        link.addEventListener("click", handleClick);
        handlers.push(() => link.removeEventListener("click", handleClick));
      });

      return () => {
        handlers.forEach((cleanup) => cleanup());
        gsap.killTweensOf(window);
      };
    });

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      // HERO: lens and text columns stagger in. The delay
      // lets the water drain past the hero before the text appears.
      gsap
        .timeline({ defaults: { ease: "power3.out" }, delay: 1.2 })
        .from("#top .grid > div:nth-child(2) > *", {
          y: 24,
          opacity: 0,
          duration: 0.7,
          stagger: 0.1,
        })
        .from(
          "#top .grid > div:nth-child(2)",
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

      // No dashboard-preview animation here: the current landing page
      // intentionally has no preview section, so avoid registering dead triggers.

      const hoverCleanups: Array<() => void> = [];
      const microAnimations: Array<{ revert: () => unknown }> = [];

      // HOME micro-interactions: Anime.js handles icon/button details while
      // GSAP owns scroll reveals and card elevation. Keep those transforms separate.
      const homeRoot = document.querySelector<HTMLElement>(".ep-landing:not(.ep-about-page):not(.ep-contact-page)");
      if (homeRoot) {
        homeRoot.querySelectorAll<HTMLElement>("#top [data-hero=cta] a, #top [data-hero=cta] button").forEach((control) => {
          const icon = control.querySelector<HTMLElement>("svg");
          const enter = () => {
            microAnimations.push(animate(control, {
              translateY: -3, scale: 1.025, duration: 230, ease: "out(3)",
            }));
            if (icon) microAnimations.push(animate(icon, {
              translateX: 3, duration: 260, ease: "out(3)",
            }));
          };
          const leave = () => {
            microAnimations.push(animate(control, {
              translateY: 0, scale: 1, duration: 300, ease: "out(3)",
            }));
            if (icon) microAnimations.push(animate(icon, {
              translateX: 0, duration: 280, ease: "out(3)",
            }));
          };
          control.addEventListener("mouseenter", enter);
          control.addEventListener("mouseleave", leave);
          control.addEventListener("focusin", enter);
          control.addEventListener("focusout", leave);
          hoverCleanups.push(() => {
            control.removeEventListener("mouseenter", enter);
            control.removeEventListener("mouseleave", leave);
            control.removeEventListener("focusin", enter);
            control.removeEventListener("focusout", leave);
          });
        });

        homeRoot.querySelectorAll<HTMLElement>("[data-reading], #process ol > li, .ep-stats-panel > div").forEach((card) => {
          const icon = card.querySelector<HTMLElement>("svg");
          const enter = () => {
            if (icon) microAnimations.push(animate(icon, {
              scale: [1, 1.13, 1], rotate: [0, -5, 0], duration: 420, ease: "out(3)",
            }));
          };
          card.addEventListener("mouseenter", enter);
          card.addEventListener("focusin", enter);
          hoverCleanups.push(() => {
            card.removeEventListener("mouseenter", enter);
            card.removeEventListener("focusin", enter);
          });
        });

        homeRoot.querySelectorAll<HTMLElement>("#site-header nav a, [data-site-footer] nav a").forEach((link) => {
          const enter = () => microAnimations.push(animate(link, {
            translateX: 3, duration: 200, ease: "out(3)",
          }));
          const leave = () => microAnimations.push(animate(link, {
            translateX: 0, duration: 240, ease: "out(3)",
          }));
          link.addEventListener("mouseenter", enter);
          link.addEventListener("mouseleave", leave);
          hoverCleanups.push(() => {
            link.removeEventListener("mouseenter", enter);
            link.removeEventListener("mouseleave", leave);
          });
        });
      }

      // CINEMATIC HOME SCROLL CHOREOGRAPHY
      // A slow atmosphere parallax and layered section reveals create depth
      // without scaling the HeroLens SVG (which must remain crisp).
      const heroAtmosphere = document.querySelector<HTMLElement>("#top .ep-hero-atmosphere");
      if (heroAtmosphere) {
        gsap.to(heroAtmosphere, {
          yPercent: 28, scale: 1.12, ease: "none",
          scrollTrigger: { trigger: "#top", start: "top top", end: "bottom top", scrub: 1 },
        });
      }

      const heroEyebrow = document.querySelector<HTMLElement>("#top [data-hero=eyebrow]");
      if (heroEyebrow) {
        gsap.to(heroEyebrow, {
          y: -18, autoAlpha: .35, ease: "none",
          scrollTrigger: { trigger: "#top", start: "top top", end: "65% top", scrub: .7 },
        });
      }

      // Scroll-linked section headings: masked upward reveal with a subtle
      // accent underline that draws as each section reaches the viewport.
      ["#readings-title", "#preview-title", "#process h2"].forEach((selector) => {
        const heading = document.querySelector<HTMLElement>(selector);
        if (!heading) return;
        const underline = heading.parentElement?.querySelector<HTMLElement>("[data-heading-accent]");
        gsap.from(heading, {
          y: 46, autoAlpha: 0, clipPath: "inset(0 0 100% 0)",
          duration: .95, ease: "power4.out",
          scrollTrigger: { trigger: heading, start: "top 84%", once: true },
        });
        if (underline) gsap.fromTo(underline,
          { scaleX: 0, transformOrigin: "left center" },
          { scaleX: 1, duration: .8, ease: "power3.out",
            scrollTrigger: { trigger: heading, start: "top 80%", once: true } }
        );
      });

      // Reading tiles get a soft 3D entrance, while their contents stay legible.
      const readingTiles = gsap.utils.toArray<HTMLElement>('[aria-labelledby="readings-title"] dl > div');
      readingTiles.forEach((tile, index) => {
        gsap.from(tile, {
          y: 58, rotateX: 13, rotateY: index % 2 ? 5 : -5,
          transformPerspective: 1100, autoAlpha: 0, duration: .95,
          ease: "expo.out",
          scrollTrigger: { trigger: tile, start: "top 90%", once: true },
        });
      });

      //      // SECTION FLOW: reveal supporting sections with a restrained,
      // consistent lift-and-fade as they enter the viewport.
      const sectionReveals = [
        {
          trigger: '[aria-label="EcoPrawn at a glance"]',
          targets: '[aria-label="EcoPrawn at a glance"] > div > div',
          y: 18,
          stagger: 0.08,
        },
        {
          trigger: "#process",
          targets: "#process ol > li",
          y: 22,
          stagger: 0.12,
        },
        {
          trigger: "[data-band]",
          targets: "[data-band] > div",
          y: 24,
          stagger: 0.12,
        },
        {
          trigger: "[data-site-footer]",
          targets: "[data-site-footer] .mx-auto > div",
          y: 16,
          stagger: 0.1,
        },
      ];

      sectionReveals.forEach(({ trigger, targets, y, stagger }) => {
        const section = document.querySelector<HTMLElement>(trigger);
        const items = gsap.utils.toArray<HTMLElement>(targets);
        if (!section || !items.length) return;
        gsap.from(items, {
          y,
          autoAlpha: 0,
          duration: 0.75,
          stagger,
          ease: "power3.out",
          clearProps: "all",
          scrollTrigger: {
            trigger: section,
            start: "top 82%",
            once: true,
          },
        });
      });

      // Give the CTA a soft hover response without changing its layout.
      const ctaBand = document.querySelector<HTMLElement>("[data-band]");
      if (ctaBand) {
        const enter = () =>
          gsap.to(ctaBand, {
            y: -3,
            boxShadow: "0 24px 55px -32px rgba(11,46,51,.55)",
            duration: 0.35,
            ease: "power2.out",
            overwrite: "auto",
          });
        const leave = () =>
          gsap.to(ctaBand, {
            y: 0,
            boxShadow: "0 12px 32px -24px rgba(11,46,51,.35)",
            duration: 0.45,
            ease: "power2.out",
            overwrite: "auto",
          });
        ctaBand.addEventListener("mouseenter", enter);
        ctaBand.addEventListener("mouseleave", leave);
        hoverCleanups.push(() => {
          ctaBand.removeEventListener("mouseenter", enter);
          ctaBand.removeEventListener("mouseleave", leave);
        });
      }

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

      // Animate every meaningful Home section's content in a deliberate
      // reading order. Text remains crisp: use transforms/opacity, never blur.
      const processSteps = gsap.utils.toArray<HTMLElement>("#process ol > li");
      processSteps.forEach((step) => {
        const number = step.querySelector<HTMLElement>(":scope > div span");
        const title = step.querySelector<HTMLElement>("h3");
        const copy = step.querySelector<HTMLElement>("p");
        const tl = gsap.timeline({
          scrollTrigger: { trigger: step, start: "top 86%", once: true },
          defaults: { ease: "power3.out" },
        });
        if (number) tl.from(number, { x: -12, autoAlpha: 0, duration: .35 });
        if (title) tl.from(title, { y: 22, autoAlpha: 0, duration: .55 }, "-=.12");
        if (copy) tl.from(copy, { y: 14, autoAlpha: 0, duration: .48 }, "-=.28");
      });

      // Section-level atmosphere movement gives the page a continuous
      // scroll narrative while leaving the HeroLens itself untouched.
      ["[aria-label='EcoPrawn at a glance']", "#readings", "#process", "[data-band]"].forEach((selector) => {
        const section = document.querySelector<HTMLElement>(selector);
        const surface = section?.querySelector<HTMLElement>(":scope > div");
        if (!section || !surface) return;
        gsap.fromTo(surface,
          { y: 18 },
          { y: 0, ease: "none",
            scrollTrigger: { trigger: section, start: "top bottom", end: "top 35%", scrub: .65 } }
        );
      });

      // Anime.js handles icon personality across all Home sections.
      // Each icon animates once as it enters view; hover listeners below can
      // then provide a separate, short response.
      const homeIcons = homeRoot?.querySelectorAll<HTMLElement>("main svg");
      let homeIconObserver: IntersectionObserver | undefined;
      if (homeIcons?.length) {
        homeIconObserver = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const icon = entry.target as HTMLElement;
            microAnimations.push(animate(icon, {
              scale: [.72, 1], rotate: [-12, 0], opacity: [0, 1],
              duration: 620, ease: "outElastic(1,.6)",
            }));
            homeIconObserver?.unobserve(icon);
          });
        }, { threshold: .3 });
        homeIcons.forEach((icon) => homeIconObserver?.observe(icon));
      }

      // Animate small decorative marks with a soft stagger as the hero arrives.
      const crosses = homeRoot?.querySelectorAll<HTMLElement>("[data-cross]");
      if (crosses?.length) {
        microAnimations.push(animate(crosses, {
          opacity: [.12, .55, .18], scale: [.65, 1.15, 1],
          delay: stagger(90), duration: 1100, ease: "inOutSine",
        }));
      }

      // Shared 3D hover interaction for data cards and process steps.
      gsap.utils.toArray<HTMLElement>("[data-hover-lift]").forEach((el) => {
        const icon = el.querySelector<HTMLElement>("svg");
        const rx = gsap.quickTo(el, "rotationX", { duration: .32, ease: "power3.out" });
        const ry = gsap.quickTo(el, "rotationY", { duration: .32, ease: "power3.out" });
        const enter = () => {
          gsap.to(el, {
            y: -8, scale: 1.018,
            boxShadow: "0 28px 60px -34px rgba(7,42,48,.42)",
            duration: .35, ease: "power3.out", overwrite: "auto",
          });
          if (icon) microAnimations.push(animate(icon, {
            scale: [1, 1.18, 1], rotate: [0, -9, 6, 0],
            duration: 560, ease: "outElastic(1,.55)",
          }));
        };
        const pointer = (event: PointerEvent) => {
          const rect = el.getBoundingClientRect();
          ry(((event.clientX - rect.left) / rect.width - .5) * 8);
          rx(-((event.clientY - rect.top) / rect.height - .5) * 6);
        };
        const leave = () => {
          rx(0); ry(0);
          gsap.to(el, {
            y: 0, scale: 1, rotationX: 0, rotationY: 0,
            boxShadow: "0 12px 28px -24px rgba(11,46,51,.25)",
            duration: .55, ease: "elastic.out(1,.65)", overwrite: "auto",
          });
        };
        el.addEventListener("mouseenter", enter);
        el.addEventListener("pointermove", pointer);
        el.addEventListener("mouseleave", leave);
        el.addEventListener("focusin", enter);
        el.addEventListener("focusout", leave);
        hoverCleanups.push(() => {
          el.removeEventListener("mouseenter", enter);
          el.removeEventListener("pointermove", pointer);
          el.removeEventListener("mouseleave", leave);
          el.removeEventListener("focusin", enter);
          el.removeEventListener("focusout", leave);
        });
      });

      return () => {
        restores.forEach((restore) => restore());
        hoverCleanups.forEach((cleanup) => cleanup());
        microAnimations.forEach((animation) => animation.revert());
        homeIconObserver?.disconnect();
      };
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

    // HERO DEPTH: keep the lens figure free of competing transforms.
    // Its internal rings and glare are scroll-linked inside HeroLens.

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
      if (!playWaterIntro) {
        gsap.set(overlay, { display: "none" });
        return;
      }

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
            className="ep-water-bubble absolute rounded-full border border-[rgba(255,255,255,0.5)] bg-[rgba(255,255,255,0.18)]"
            style={{ left: b.left, bottom: -24, width: b.size, height: b.size }}
          />
        ))}
      </div>
      <HeroEnhance />
    </>
  );
}