import { useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { animate, stagger } from "animejs";

gsap.registerPlugin(ScrollTrigger);

/** Rich About-page choreography. Entrances use transforms only so cards
 * remain visible if a ScrollTrigger is delayed, disabled, or unavailable. */
export function AboutMotion() {
  useLayoutEffect(() => {
    const root = document.querySelector<HTMLElement>(".ep-about-page");
    if (!root) return;

    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const cleanups: Array<() => void> = [];
      const ctx = gsap.context(() => {
        const hero = root.querySelector<HTMLElement>("[data-page-hero]");
        if (hero) {
          const kicker = hero.querySelector<HTMLElement>("[data-page-kicker]");
          const title = hero.querySelector<HTMLElement>("h1");
          const lead = hero.querySelector<HTMLElement>("[data-page-lead]");
          // Shared public-page hero choreography: matching timing, easing,
          // distance and stagger across Home, About and Contact.
          const intro = gsap.timeline({
            defaults: { ease: "power4.out" },
            delay: 0.12,
          });
          if (kicker) intro.from(kicker, {
            y: 22, autoAlpha: 0, scale: .96, duration: .65,
          });
          if (title) intro.from(title, {
            y: 38, rotateX: -8, transformPerspective: 1000,
            autoAlpha: 0, duration: .9,
          }, "-=.28");
          if (lead) intro.from(lead, {
            y: 20, autoAlpha: 0, duration: .7,
          }, "-=.42");

          // Keep the hero atmosphere fixed to its section; no scroll parallax.
        }

        // Every section gets a heading sequence and a subtle scroll-linked depth shift.
        root.querySelectorAll<HTMLElement>("main section").forEach((section) => {
          const heading = section.querySelector<HTMLElement>("h2");
          if (heading) {
            const eyebrow = heading.parentElement?.querySelector<HTMLElement>("div");
            const copy = heading.parentElement?.querySelectorAll<HTMLElement>("p");
            const tl = gsap.timeline({
              scrollTrigger: { trigger: heading, start: "top 88%", once: true },
              defaults: { ease: "power3.out" },
            });
            if (eyebrow && eyebrow !== heading) tl.from(eyebrow, { x: -18, duration: .42 });
            tl.from(heading, { y: 28, rotateX: -4, transformPerspective: 900, duration: .7 }, "-=.12");
            if (copy?.length) tl.from(copy, { y: 14, duration: .5, stagger: .09 }, "-=.3");
          }
          // Section content and its background remain anchored during scrolling.
          // Individual headings/cards still use one-time entrance reveals.
        });

        // Objective, system, scope and limitation cards use a clean
        // vertical reveal without perspective or 3D rotation.
        const cards = gsap.utils.toArray<HTMLElement>("main article", root);
        cards.forEach((card) => {
          gsap.from(card, {
            y: 32,
            duration: .72,
            ease: "expo.out",
            scrollTrigger: { trigger: card, start: "top 91%", once: true },
          });
        });

        // System rows reveal their icon, title and capability points in sequence.
        root.querySelectorAll<HTMLElement>("#systems article").forEach((row) => {
          const icon = row.querySelector<HTMLElement>("svg");
          const title = row.querySelector<HTMLElement>("h3");
          const points = row.querySelectorAll<HTMLElement>(":scope > div:last-child > div");
          const tl = gsap.timeline({
            scrollTrigger: { trigger: row, start: "top 88%", once: true },
            defaults: { ease: "power3.out" },
          });
          if (icon) tl.from(icon, { scale: .72, rotation: -12, duration: .55, ease: "back.out(1.8)" });
          if (title) tl.from(title, { x: 18, duration: .48 }, "-=.3");
          if (points.length) tl.from(points, { x: 16, duration: .42, stagger: .075 }, "-=.22");
        });

        // New editorial mission panel: reveal copy and the orbital system graphic
        // as one composed unit, then gently draw the orbit rings into view.
        const mission = root.querySelector<HTMLElement>(".ep-about-mission-panel");
        if (mission) {
          const copy = mission.querySelectorAll<HTMLElement>(":scope > div:first-child > *");
          const visual = mission.querySelector<HTMLElement>(".ep-about-orbit-visual");
          const rings = mission.querySelectorAll<HTMLElement>(".ep-about-orbit");
          const tl = gsap.timeline({
            scrollTrigger: { trigger: mission, start: "top 82%", once: true },
            defaults: { ease: "power3.out" },
          });
          if (copy.length) tl.from(copy, { y: 22, autoAlpha: 0, stagger: .09, duration: .62 });
          if (visual) tl.from(visual, { scale: .9, autoAlpha: 0, duration: .8 }, "-=.42");
          if (rings.length) tl.from(rings, { scale: .72, autoAlpha: 0, stagger: .1, duration: .72 }, "-=.5");
        }

        // Workflow cards enter in sequence. Their CSS hover state remains
        // independent of the entrance transform.
        const journeyCards = root.querySelectorAll<HTMLElement>(".ep-about-journey-card");
        if (journeyCards.length) {
          gsap.from(journeyCards, {
            y: 30, autoAlpha: 0, stagger: .1, duration: .68, ease: "power3.out",
            clearProps: "opacity,visibility,transform",
            scrollTrigger: { trigger: ".ep-about-journey-grid", start: "top 84%", once: true },
          });
        }

        // System-section accent markers remain static during page scrolling.
        // The decorative deep-water background is not driven by ScrollTrigger.

        // Scope list items reveal in reading order.
        root.querySelectorAll<HTMLElement>("#scope article").forEach((card) => {
          const items = card.querySelectorAll<HTMLElement>(":scope > div:last-child > div");
          if (items.length) gsap.from(items, {
            x: 14, duration: .48, stagger: .075, ease: "power2.out",
            scrollTrigger: { trigger: card, start: "top 82%", once: true },
          });
        });

        // Cards keep a restrained lift and shadow on hover; no 3D tilt.
        root.querySelectorAll<HTMLElement>("main article").forEach((card) => {
          const icon = card.querySelector<SVGElement>("svg");
          const enter = () => {
            gsap.to(card, {
              y: -6, scale: 1.01, borderColor: "var(--ep-accent)",
              boxShadow: "0 24px 48px -30px rgba(7,42,48,.42)",
              duration: .3, ease: "power3.out", overwrite: "auto",
            });
            if (icon) animate(icon, { scale: [1, 1.14, 1], rotate: [0, -8, 5, 0], duration: 520, ease: "outElastic(1,.6)" });
          };
          const leave = () => gsap.to(card, {
            y: 0, scale: 1, borderColor: "var(--ep-line)",
            boxShadow: "0 12px 28px -24px rgba(11,46,51,.25)",
            duration: .42, ease: "power3.out", overwrite: "auto",
          });
          card.addEventListener("pointerenter", enter);
          card.addEventListener("pointerleave", leave);
          card.addEventListener("focusin", enter);
          card.addEventListener("focusout", leave);
          cleanups.push(() => {
            card.removeEventListener("pointerenter", enter);
            card.removeEventListener("pointerleave", leave);
            card.removeEventListener("focusin", enter);
            card.removeEventListener("focusout", leave);
          });
        });

        root.querySelectorAll<HTMLElement>("main a, main button").forEach((control) => {
          const icon = control.querySelector<SVGElement>("svg");
          const enter = () => {
            gsap.to(control, { y: -3, duration: .2, ease: "power2.out" });
            if (icon) animate(icon, { translateX: [0, 4], rotate: [0, -6, 0], duration: 340, ease: "outBack(1.5)" });
          };
          const leave = () => gsap.to(control, { y: 0, duration: .25, ease: "power2.out" });
          control.addEventListener("pointerenter", enter);
          control.addEventListener("pointerleave", leave);
          cleanups.push(() => {
            control.removeEventListener("pointerenter", enter);
            control.removeEventListener("pointerleave", leave);
          });
        });

        // The objective statement and section navigation get the same tactile
        // response as the article cards, using only existing theme tokens.
        const featureSurfaces = root.querySelectorAll<HTMLElement>(
          ".ep-about-objective, [data-section-nav] a"
        );
        featureSurfaces.forEach((surface) => {
          const enter = () => gsap.to(surface, {
            y: -5, borderColor: "var(--ep-accent)",
            boxShadow: "0 24px 48px -32px rgba(7,42,48,.48)",
            duration: .28, ease: "power3.out", overwrite: "auto",
          });
          const leave = () => gsap.to(surface, {
            y: 0, borderColor: "var(--ep-line)",
            boxShadow: "0 12px 28px -24px rgba(11,46,51,.25)",
            duration: .4, ease: "power3.out", overwrite: "auto",
          });
          surface.addEventListener("pointerenter", enter);
          surface.addEventListener("pointerleave", leave);
          cleanups.push(() => {
            surface.removeEventListener("pointerenter", enter);
            surface.removeEventListener("pointerleave", leave);
          });
        });

        // Decorative dots and markers have a gentle stagger, never affecting layout.
        const markers = root.querySelectorAll<HTMLElement>("section [aria-hidden='true'].h-2, section [aria-hidden='true'].rounded-full");
        if (markers.length) animate(markers, {
          scale: [0.7, 1], delay: stagger(65), duration: 480, ease: "outBack(1.7)",
        });

        // Anime.js gives every About section a small, readable accent sequence.
        // Only icons, index markers and chevrons animate; cards stay visible.
        const sectionAccents = root.querySelectorAll<HTMLElement>(
          "main section svg, #scope article > div:last-child > div > div > span:first-child, #systems article > div:last-child > div > span:first-child"
        );
        let sectionAccentObserver: IntersectionObserver | undefined;
        if (sectionAccents.length) {
          sectionAccentObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
              if (!entry.isIntersecting) return;
              const target = entry.target as HTMLElement;
              animate(target, {
                scale: [0.78, 1],
                rotate: target.tagName.toLowerCase() === "svg" ? [-10, 0] : [0, 0],
                translateY: [5, 0],
                duration: 540,
                ease: "outElastic(1,.65)",
              });
              sectionAccentObserver?.unobserve(target);
            });
          }, { threshold: 0.35 });
          sectionAccents.forEach((target) => sectionAccentObserver?.observe(target));
        }

        // Section eyebrow dots pulse once when their own section enters view.
        root.querySelectorAll<HTMLElement>("main section").forEach((section) => {
          const dot = section.querySelector<HTMLElement>(":scope [aria-hidden='true'].h-2");
          if (!dot) return;
          const observer = new IntersectionObserver((entries) => {
            if (!entries.some((entry) => entry.isIntersecting)) return;
            animate(dot, { scale: [0.65, 1.35, 1], duration: 620, ease: "outElastic(1,.6)" });
            observer.disconnect();
          }, { threshold: 0.5 });
          observer.observe(section);
          cleanups.push(() => observer.disconnect());
        });
        cleanups.push(() => sectionAccentObserver?.disconnect());
      }, root);

      return () => {
        cleanups.forEach((cleanup) => cleanup());
        ctx.revert();
      };
    });

    return () => mm.revert();
  }, []);

  return null;
}
