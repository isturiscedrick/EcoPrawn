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
          const intro = gsap.timeline({ defaults: { ease: "power4.out" } });
          if (kicker) intro.from(kicker, { y: 22, duration: .55 });
          if (title) intro.from(title, { y: 42, rotateX: -8, transformPerspective: 1000, duration: .85 }, "-=.24");
          if (lead) intro.from(lead, { y: 18, duration: .6 }, "-=.42");

          const atmosphere = hero.querySelector<HTMLElement>(".ep-hero-atmosphere");
          if (atmosphere) gsap.to(atmosphere, {
            yPercent: 18, scale: 1.08, ease: "none",
            scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: .8 },
          });
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
          const inner = section.querySelector<HTMLElement>(":scope > div");
          if (inner) gsap.fromTo(inner, { y: 12 }, {
            y: 0, ease: "none",
            scrollTrigger: { trigger: section, start: "top bottom", end: "top 30%", scrub: .7 },
          });
        });

        // Objective, system, scope and limitation cards enter with a 3D lift.
        const cards = gsap.utils.toArray<HTMLElement>("main article", root);
        cards.forEach((card, index) => {
          gsap.from(card, {
            y: 42,
            rotateX: index % 2 ? 3 : -3,
            rotateY: index % 3 === 0 ? -2 : 2,
            transformPerspective: 1100,
            transformOrigin: "center bottom",
            duration: .82,
            ease: "expo.out",
            scrollTrigger: { trigger: card, start: "top 91%", once: true },
          });
        });

        // System rows reveal their icon, title and capability points in sequence.
        root.querySelectorAll<HTMLElement>("#systems article").forEach((row) => {
          const icon = row.querySelector<HTMLElement>("svg");
          const title = row.querySelector<HTMLElement>("h3");
          const points = row.querySelectorAll<HTMLElement>(".col-span-2 > div");
          const tl = gsap.timeline({
            scrollTrigger: { trigger: row, start: "top 88%", once: true },
            defaults: { ease: "power3.out" },
          });
          if (icon) tl.from(icon, { scale: .72, rotation: -12, duration: .55, ease: "back.out(1.8)" });
          if (title) tl.from(title, { x: 18, duration: .48 }, "-=.3");
          if (points.length) tl.from(points, { x: 16, duration: .42, stagger: .075 }, "-=.22");
        });

        // Scope cards get a light depth hover with pointer tracking.
        root.querySelectorAll<HTMLElement>("main article").forEach((card) => {
          const icon = card.querySelector<SVGElement>("svg");
          const rx = gsap.quickTo(card, "rotationX", { duration: .3, ease: "power2.out" });
          const ry = gsap.quickTo(card, "rotationY", { duration: .3, ease: "power2.out" });
          const enter = () => {
            gsap.to(card, { y: -7, scale: 1.012, boxShadow: "0 26px 54px -34px rgba(7,42,48,.5)", duration: .28, ease: "power3.out", overwrite: "auto" });
            if (icon) animate(icon, { scale: [1, 1.16, 1], rotate: [0, -10, 6, 0], duration: 560, ease: "outElastic(1,.6)" });
          };
          const move = (event: PointerEvent) => {
            const rect = card.getBoundingClientRect();
            if (!rect.width || !rect.height) return;
            ry(((event.clientX - rect.left) / rect.width - .5) * 6);
            rx(-((event.clientY - rect.top) / rect.height - .5) * 5);
          };
          const leave = () => {
            rx(0); ry(0);
            gsap.to(card, { y: 0, scale: 1, rotationX: 0, rotationY: 0, duration: .48, ease: "elastic.out(1,.65)", overwrite: "auto" });
          };
          card.addEventListener("pointerenter", enter);
          card.addEventListener("pointermove", move);
          card.addEventListener("pointerleave", leave);
          card.addEventListener("focusin", enter);
          card.addEventListener("focusout", leave);
          cleanups.push(() => {
            card.removeEventListener("pointerenter", enter);
            card.removeEventListener("pointermove", move);
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

        // Decorative dots and markers have a gentle stagger, never affecting layout.
        const markers = root.querySelectorAll<HTMLElement>("section [aria-hidden='true'].h-2, section [aria-hidden='true'].rounded-full");
        if (markers.length) animate(markers, {
          scale: [0.7, 1], delay: stagger(65), duration: 480, ease: "outBack(1.7)",
        });
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
