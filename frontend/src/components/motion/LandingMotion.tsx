import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { animate, stagger } from "animejs";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";
import { HeroEnhance } from "./HeroEnhance";

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, MorphSVGPlugin);

const WAVE = {
  covered: "M 0 -18 C 17 -26 33 -10 50 -18 C 67 -26 83 -10 100 -18 V 140 H 0 z",
  high: "M 0 35 C 17 28 33 42 50 35 C 67 28 83 42 100 35 V 140 H 0 z",
  low: "M 0 68 C 17 76 33 60 50 68 C 67 76 83 60 100 68 V 140 H 0 z",
  gone: "M 0 110 C 17 104 33 116 50 110 C 67 104 83 116 100 110 V 140 H 0 z",
};

const BUBBLES = [
  { left: "6%", size: 10 }, { left: "14%", size: 6 },
  { left: "23%", size: 14 }, { left: "33%", size: 8 },
  { left: "42%", size: 12 }, { left: "51%", size: 6 },
  { left: "60%", size: 16 }, { left: "69%", size: 8 },
  { left: "78%", size: 12 }, { left: "86%", size: 6 },
  { left: "93%", size: 10 }, { left: "48%", size: 9 },
];

const WATER_INTRO_KEY = "ep-water-intro-seen";

/**
 * Landing-page motion follows AboutMotion's choreography for all regular
 * page content. HeroLens and its internal scroll/trigger effects remain
 * owned by HeroLens/HeroEnhance and are deliberately not targeted here.
 */
export function LandingMotion() {
  const overlayRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<SVGPathElement>(null);
  const frontRef = useRef<SVGPathElement>(null);

  useLayoutEffect(() => {
    const root = document.querySelector<HTMLElement>(".ep-business-landing");
    if (!root) return;

    const mm = gsap.matchMedia();
    let cancelled = false;
    let playWaterIntro = true;

    try {
      playWaterIntro = sessionStorage.getItem(WATER_INTRO_KEY) !== "1";
      if (playWaterIntro) sessionStorage.setItem(WATER_INTRO_KEY, "1");
    } catch {
      // Storage can be unavailable in private or restricted browsing modes.
    }

    if (document.fonts?.ready) {
      document.fonts.ready.then(() => {
        if (!cancelled) ScrollTrigger.refresh();
      });
    }

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const handlers: Array<() => void> = [];
      const animations: Array<{ revert: () => unknown }> = [];

      // Keep native scrolling; only animate deliberate in-page anchor links.
      root.querySelectorAll<HTMLAnchorElement>('a[href^="#"]:not([href="#"])').forEach((link) => {
        const onClick = (event: MouseEvent) => {
          const href = link.getAttribute("href");
          if (!href || event.defaultPrevented || event.button !== 0 ||
            event.metaKey || event.ctrlKey || event.shiftKey || event.altKey ||
            link.target === "_blank" || link.hasAttribute("download")) return;
          const target = document.getElementById(decodeURIComponent(href.slice(1)));
          if (!target) return;
          event.preventDefault();
          gsap.to(window, {
            duration: 1.05,
            ease: "power3.inOut",
            overwrite: "auto",
            scrollTo: { y: target, offsetY: 84, autoKill: true },
            onComplete: () => history.replaceState(null, "", href),
          });
        };
        link.addEventListener("click", onClick);
        handlers.push(() => link.removeEventListener("click", onClick));
      });

      const ctx = gsap.context(() => {
        // The copy uses the same hero entrance cadence as the About page.
        // The lens itself is intentionally excluded; HeroLens owns its motion.
        const hero = root.querySelector<HTMLElement>("#top");
        const heroText = hero?.querySelector<HTMLElement>("[data-hero=text]");
        if (heroText) {
          const eyebrow = heroText.querySelector<HTMLElement>("[data-hero=eyebrow]");
          const words = heroText.querySelectorAll<HTMLElement>("[data-hero=word]");
          const lead = heroText.querySelector<HTMLElement>("[data-hero=lead]");
          const actions = heroText.querySelector<HTMLElement>("[data-hero=cta]");
          const signature = heroText.querySelector<HTMLElement>("[data-hero=signature]");
          const intro = gsap.timeline({
            defaults: { ease: "power4.out" },
            delay: playWaterIntro ? 1.7 : .12,
          });
          if (eyebrow) intro.from(eyebrow, { y: 22, duration: .55 });
          if (words.length) intro.from(words, {
            y: 42, rotateX: -8, transformPerspective: 1000,
            duration: .85, stagger: .055,
          }, "-=.24");
          if (lead) intro.from(lead, { y: 18, duration: .6 }, "-=.42");
          if (actions) intro.from(actions.children, {
            y: 18, duration: .5, stagger: .09,
          }, "-=.3");
          if (signature) intro.from(signature, { y: 12, duration: .5 }, "-=.25");
        }

        // About-style section heading reveals: eyebrow, heading, then supporting copy.
        root.querySelectorAll<HTMLElement>("main section").forEach((section) => {
          const heading = section.querySelector<HTMLElement>("h2");
          if (!heading) return;
          const eyebrow = heading.parentElement?.querySelector<HTMLElement>("div");
          const copy = heading.parentElement?.querySelectorAll<HTMLElement>("p");
          const timeline = gsap.timeline({
            scrollTrigger: { trigger: heading, start: "top 88%", once: true },
            defaults: { ease: "power3.out" },
          });
          if (eyebrow && eyebrow !== heading) timeline.from(eyebrow, { x: -18, duration: .42 });
          timeline.from(heading, {
            y: 28, rotateX: -4, transformPerspective: 900, duration: .7,
          }, "-=.12");
          if (copy?.length) timeline.from(copy, {
            y: 14, duration: .5, stagger: .09,
          }, "-=.3");
        });

        // Reveal the existing data-reveal wrappers as complete content groups.
        // This keeps eyebrow, heading and supporting copy moving together.
        root.querySelectorAll<HTMLElement>("main [data-reveal]").forEach((group) => {
          // Section headings already have their own About-style timeline above.
          // Avoid animating the same heading group a second time.
          if (group.querySelector("h2")) return;
          gsap.from(group, {
            y: 24,
            duration: .68,
            ease: "power3.out",
            scrollTrigger: { trigger: group, start: "top 90%", once: true },
          });
        });

        // About-style vertical card entrances. Keep content visible while
        // ScrollTrigger waits for each card to enter the viewport.
        const cards = gsap.utils.toArray<HTMLElement>(
          "main article, main [data-reading], .ep-stats-panel > div, #process [data-step]",
          root
        );
        cards.forEach((card) => {
          gsap.from(card, {
            y: 32,
            duration: .72,
            ease: "expo.out",
            scrollTrigger: { trigger: card, start: "top 91%", once: true },
          });
        });

        // Water-quality range bars and markers animate once as their cards enter.
        root.querySelectorAll<HTMLElement>("#readings [data-reading]").forEach((card) => {
          const zone = card.querySelector<HTMLElement>("[data-zone]");
          const marker = card.querySelector<HTMLElement>("[data-marker]");
          if (zone) gsap.fromTo(zone,
            { scaleX: 0, transformOrigin: "left center" },
            { scaleX: 1, duration: .9, ease: "power3.out",
              scrollTrigger: { trigger: card, start: "top 88%", once: true } }
          );
          if (marker) gsap.from(marker, {
            scale: .35, duration: .55, ease: "back.out(1.8)",
            scrollTrigger: { trigger: card, start: "top 88%", once: true },
          });
        });

        // The process progress rule fills as the four stages move through view.
        const processViewport = root.querySelector<HTMLElement>("#process [data-process-viewport]");
        const processLine = processViewport?.querySelector<HTMLElement>("[data-process-line]");
        // The process progress line has one owner: the desktop horizontal
        // story below. Do not attach a second vertical scrub trigger to it.
        // On tablet/mobile the line is hidden by the responsive layout.
        const processNodes = root.querySelectorAll<HTMLElement>("#process [data-step-node]");
        if (processNodes.length) {
          gsap.from(processNodes, {
            scale: .4, autoAlpha: 0, duration: .5, stagger: .12,
            ease: "back.out(1.7)",
            scrollTrigger: {
              trigger: processViewport ?? root.querySelector("#process"),
              start: "top 78%",
              once: true,
            },
          });
        }

        // Readings and process details reveal in sequence, as About system rows do.
        root.querySelectorAll<HTMLElement>("#readings [data-reading], #process [data-step]").forEach((item) => {
          const icon = item.querySelector<SVGElement>("svg");
          const title = item.querySelector<HTMLElement>("dt, h3");
          const details = item.querySelectorAll<HTMLElement>("dd, p");
          const sequence = gsap.timeline({
            scrollTrigger: { trigger: item, start: "top 88%", once: true },
            defaults: { ease: "power3.out" },
          });
          if (icon) sequence.from(icon, {
            scale: .72, rotation: -12, duration: .55, ease: "back.out(1.8)",
          });
          if (title) sequence.from(title, { x: 18, duration: .48 }, "-=.3");
          if (details.length) sequence.from(details, {
            x: 16, duration: .42, stagger: .075,
          }, "-=.22");
        });

        // Card hover treatment mirrors About: small lift, accent border,
        // soft shadow and a brief icon reaction. No 3D tilt.
        const hoverCards = gsap.utils.toArray<HTMLElement>(
          "main article, main [data-reading], .ep-stats-panel > div, #process [data-step]",
          root
        );
        hoverCards.forEach((card) => {
          const icon = card.querySelector<SVGElement>("svg");
          const enter = () => {
            gsap.to(card, {
              y: -6, scale: 1.01,
              borderColor: "var(--ep-accent)",
              boxShadow: "0 24px 48px -30px rgba(7,42,48,.42)",
              duration: .3, ease: "power3.out", overwrite: "auto",
            });
            if (icon) animations.push(animate(icon, {
              scale: [1, 1.14, 1], rotate: [0, -8, 5, 0],
              duration: 520, ease: "outElastic(1,.6)",
            }));
          };
          const leave = () => gsap.to(card, {
            y: 0, scale: 1,
            borderColor: "var(--ep-line)",
            boxShadow: "0 12px 28px -24px rgba(11,46,51,.25)",
            duration: .42, ease: "power3.out", overwrite: "auto",
          });
          card.addEventListener("pointerenter", enter);
          card.addEventListener("pointerleave", leave);
          const onFocusOut = (event: FocusEvent) => {
            if (!card.contains(event.relatedTarget as Node | null)) leave();
          };
          card.addEventListener("focusin", enter);
          card.addEventListener("focusout", onFocusOut);
          handlers.push(() => {
            card.removeEventListener("pointerenter", enter);
            card.removeEventListener("pointerleave", leave);
            card.removeEventListener("focusin", enter);
            card.removeEventListener("focusout", onFocusOut);
          });
        });

        // Links and buttons get About's subtle lift and icon nudge.
        root.querySelectorAll<HTMLElement>("main a, main button").forEach((control) => {
          const icon = control.querySelector<SVGElement>("svg");
          const enter = () => {
            gsap.to(control, { y: -3, duration: .2, ease: "power2.out" });
            if (icon) animations.push(animate(icon, {
              translateX: [0, 4], rotate: [0, -6, 0],
              duration: 340, ease: "outBack(1.5)",
            }));
          };
          const leave = () => gsap.to(control, { y: 0, duration: .25, ease: "power2.out" });
          control.addEventListener("pointerenter", enter);
          control.addEventListener("pointerleave", leave);
          handlers.push(() => {
            control.removeEventListener("pointerenter", enter);
            control.removeEventListener("pointerleave", leave);
          });
        });

        // Accent markers and section icons animate once as they enter view.
        const markers = root.querySelectorAll<HTMLElement>(
          "main section [aria-hidden='true'].h-2, main section [aria-hidden='true'].rounded-full"
        );
        if (markers.length) animations.push(animate(markers, {
          scale: [.7, 1], delay: stagger(65), duration: 480, ease: "outBack(1.7)",
        }));

        const icons = root.querySelectorAll<HTMLElement>("main section svg");
        let iconObserver: IntersectionObserver | undefined;
        if (icons.length) {
          iconObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
              if (!entry.isIntersecting) return;
              const icon = entry.target as HTMLElement;
              animations.push(animate(icon, {
                scale: [.78, 1], rotate: [-10, 0], translateY: [5, 0],
                duration: 540, ease: "outElastic(1,.65)",
              }));
              iconObserver?.unobserve(icon);
            });
          }, { threshold: .35 });
          icons.forEach((icon) => iconObserver?.observe(icon));
        }

        root.querySelectorAll<HTMLElement>("main section").forEach((section) => {
          const dot = section.querySelector<HTMLElement>(":scope [aria-hidden='true'].h-2");
          if (!dot) return;
          const observer = new IntersectionObserver((entries) => {
            if (!entries.some((entry) => entry.isIntersecting)) return;
            animations.push(animate(dot, {
              scale: [.65, 1.35, 1], duration: 620, ease: "outElastic(1,.6)",
            }));
            observer.disconnect();
          }, { threshold: .5 });
          observer.observe(section);
          handlers.push(() => observer.disconnect());
        });

        // Process steps use the same ordinary scroll-reveal pattern as About:
        // no horizontal translation, pinning, scrubbing, or scroll hijacking.
        const processSteps = root.querySelectorAll<HTMLElement>("#process [data-step]");
        if (processSteps.length) {
          gsap.from(processSteps, {
            y: 28,
            opacity: 0,
            duration: .72,
            stagger: .14,
            ease: "power3.out",
            clearProps: "transform,opacity",
            scrollTrigger: {
              trigger: "#process [data-process-viewport]",
              start: "top 82%",
              once: true,
            },
          });
        }
      }, root);

      return () => {
        handlers.forEach((cleanup) => cleanup());
        animations.forEach((animation) => animation.revert());
        ctx.revert();
      };
    });

    // The lens component and its own trigger effects are intentionally untouched.
    // Only the process section keeps its separate desktop horizontal story.
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const overlay = overlayRef.current;
      const back = backRef.current;
      const front = frontRef.current;
      if (!overlay || !back || !front) return;
      if (!playWaterIntro) {
        gsap.set(overlay, { display: "none" });
        return;
      }
      const bubbles = gsap.utils.toArray<HTMLElement>(".ep-water-bubble", overlay);
      const timeline = gsap.timeline({
        onComplete: () => gsap.set(overlay, { display: "none" }),
      });
      timeline.fromTo(bubbles, { y: .7 }, {
        y: -(window.innerHeight + 80), duration: 2.2, ease: "none", stagger: .12,
      }, 0);
      const drain = (target: SVGPathElement, at: number) => {
        timeline.to(target, { morphSVG: WAVE.high, duration: .55, ease: "power1.in" }, at)
          .to(target, { morphSVG: WAVE.low, duration: .55, ease: "sine.inOut" }, at + .55)
          .to(target, { morphSVG: WAVE.gone, duration: .6, ease: "power1.out" }, at + 1.1);
      };
      drain(front, .5);
      drain(back, .7);
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
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
          <defs>
            <linearGradient id="ep-water-curtain-grad" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="100">
              <stop offset="0%" stopColor="#1D5B62" />
              <stop offset="100%" stopColor="#0B2E33" />
            </linearGradient>
          </defs>
          <path ref={backRef} d={WAVE.covered} fill="#2F8791" />
          <path ref={frontRef} d={WAVE.covered} fill="url(#ep-water-curtain-grad)" />
        </svg>
        {BUBBLES.map((bubble) => (
          <span
            key={bubble.left}
            className="ep-water-bubble absolute rounded-full border border-[rgba(255,255,255,0.5)] bg-[rgba(255,255,255,0.18)]"
            style={{ left: bubble.left, bottom: -24, width: bubble.size, height: bubble.size }}
          />
        ))}
      </div>
      <HeroEnhance />
    </>
  );
}
