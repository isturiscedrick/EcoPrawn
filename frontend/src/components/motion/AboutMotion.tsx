import { useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { animate, stagger } from "animejs";

gsap.registerPlugin(ScrollTrigger);

/** High-impact but restrained motion system for the About page. */
export function AboutMotion() {
  useLayoutEffect(() => {
    const root = document.querySelector<HTMLElement>(".ep-about-page");
    if (!root) return;
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const ctx = gsap.context(() => {
        const hero = root.querySelector<HTMLElement>("[data-page-hero]");
        if (hero) {
          const kicker = hero.querySelector("[data-page-kicker]");
          const title = hero.querySelector("h1");
          const lead = hero.querySelector("[data-page-lead]");
          const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
          tl.from(kicker, { y: 22, autoAlpha: 0, filter: "blur(8px)", duration: .65 })
            .from(title, { y: 64, autoAlpha: 0, filter: "blur(12px)", duration: 1 }, "-=.35")
            .from(lead, { y: 28, autoAlpha: 0, duration: .75 }, "-=.55");
          const grid = hero.querySelector<HTMLElement>(".ep-hero-atmosphere");
          if (grid) gsap.to(grid, {
            yPercent: 22, scale: 1.12, ease: "none",
            scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: .8 },
          });
        }

        const objectiveSection = root.querySelector<HTMLElement>("#objectives");
        const objectiveCards = gsap.utils.toArray<HTMLElement>("#objectives article", root);
        if (objectiveSection && objectiveCards.length) {
          gsap.from(objectiveCards, {
            y: 72, rotateX: 12, rotateY: (i) => i % 2 ? 5 : -5,
            transformPerspective: 1100, transformOrigin: "center bottom",
            autoAlpha: 0, duration: 1, stagger: .13, ease: "expo.out",
            scrollTrigger: { trigger: objectiveSection, start: "top 72%", once: true },
          });
        }

        const systems = gsap.utils.toArray<HTMLElement>("#systems article", root);
        systems.forEach((row, i) => {
          const icon = row.querySelector<HTMLElement>("span.flex");
          const content = row.querySelectorAll<HTMLElement>("h3, .col-span-2");
          gsap.from(row, {
            x: i % 2 ? 80 : -80, autoAlpha: 0, duration: .9, ease: "power4.out",
            scrollTrigger: { trigger: row, start: "top 86%", once: true },
          });
          if (icon) gsap.from(icon, {
            scale: .4, rotate: i % 2 ? 35 : -35, duration: .8, ease: "back.out(2.2)",
            scrollTrigger: { trigger: row, start: "top 82%", once: true },
          });
          if (content.length) gsap.from(content, {
            y: 26, autoAlpha: 0, duration: .7, stagger: .12, ease: "power3.out",
            scrollTrigger: { trigger: row, start: "top 78%", once: true },
          });
        });

        const scopeCards = gsap.utils.toArray<HTMLElement>("#scope article", root);
        if (scopeCards.length) gsap.from(scopeCards, {
          y: 64, scale: .94, rotateZ: (i) => i === 0 ? -2 : 2,
          autoAlpha: 0, duration: 1, stagger: .2, ease: "expo.out",
          scrollTrigger: { trigger: "#scope .grid", start: "top 78%", once: true },
        });

        // Scroll-scrubbed progress accent across the systems list.
        const systemRule = root.querySelector<HTMLElement>("#systems .border-t");
        if (systemRule) gsap.fromTo(systemRule,
          { borderColor: "rgba(139,213,166,0)", scaleX: .35, transformOrigin: "left center" },
          { borderColor: "rgba(139,213,166,.55)", scaleX: 1, ease: "none",
            scrollTrigger: { trigger: "#systems", start: "top 65%", end: "bottom 75%", scrub: 1 } }
        );
      }, root);

      const cleanups: Array<() => void> = [];
      const animeRuns: Array<{ revert: () => unknown }> = [];
      const cardTargets = root.querySelectorAll<HTMLElement>("#objectives article, #scope article, #systems article");
      cardTargets.forEach((card) => {
        const icon = card.querySelector<HTMLElement>("svg");
        const move = gsap.quickTo(card, "y", { duration: .35, ease: "power3.out" });
        const tiltX = gsap.quickTo(card, "rotationX", { duration: .35, ease: "power3.out" });
        const tiltY = gsap.quickTo(card, "rotationY", { duration: .35, ease: "power3.out" });
        const enter = () => {
          gsap.to(card, { scale: 1.018, boxShadow: "0 28px 65px -34px rgba(7,42,48,.48)", duration: .35, ease: "power3.out" });
          if (icon) animeRuns.push(animate(icon, {
            scale: [1, 1.22, 1], rotate: [0, -12, 8, 0], duration: 620, ease: "outElastic(1, .55)",
          }));
        };
        const leave = () => {
          move(0); tiltX(0); tiltY(0);
          gsap.to(card, { scale: 1, boxShadow: "0 12px 28px -24px rgba(11,46,51,.35)", duration: .5, ease: "elastic.out(1,.65)" });
        };
        const pointer = (event: PointerEvent) => {
          const rect = card.getBoundingClientRect();
          const px = (event.clientX - rect.left) / rect.width - .5;
          const py = (event.clientY - rect.top) / rect.height - .5;
          move(-3 + -py * 3);
          tiltX(-py * 5);
          tiltY(px * 6);
        };
        card.addEventListener("mouseenter", enter);
        card.addEventListener("mouseleave", leave);
        card.addEventListener("pointermove", pointer);
        card.addEventListener("focusin", enter);
        card.addEventListener("focusout", leave);
        cleanups.push(() => {
          card.removeEventListener("mouseenter", enter);
          card.removeEventListener("mouseleave", leave);
          card.removeEventListener("pointermove", pointer);
          card.removeEventListener("focusin", enter);
          card.removeEventListener("focusout", leave);
        });
      });

      const objectiveIcons = root.querySelectorAll<HTMLElement>("#objectives article svg");
      const objectiveGrid = root.querySelector("#objectives .grid");
      let observer: IntersectionObserver | undefined;
      if (objectiveIcons.length && objectiveGrid) {
        observer = new IntersectionObserver((entries) => {
          if (!entries.some((entry) => entry.isIntersecting)) return;
          animeRuns.push(animate(objectiveIcons, {
            scale: [.55, 1], rotate: [-18, 0], opacity: [0, 1],
            delay: stagger(85), duration: 780, ease: "outElastic(1,.6)",
          }));
          observer?.disconnect();
        }, { threshold: .18 });
        observer.observe(objectiveGrid);
      }

      return () => {
        ctx.revert(); observer?.disconnect();
        cleanups.forEach((fn) => fn());
        animeRuns.forEach((animation) => animation.revert());
      };
    });
    return () => mm.revert();
  }, []);
  return null;
}
