import { useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { animate } from "animejs";

gsap.registerPlugin(ScrollTrigger);

/**
 * Contact-page choreography follows the About page's visual language:
 * confident hero entrance, section reveals, card entrances and tactile
 * hover feedback. The form itself stays stable while its wrapper reveals.
 */
export function ContactMotion() {
  useLayoutEffect(() => {
    const root = document.querySelector<HTMLElement>(".ep-contact-page");
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
          if (title) intro.from(title, {
            y: 42, rotateX: -8, transformPerspective: 1000, duration: .85,
          }, "-=.24");
          if (lead) intro.from(lead, { y: 18, duration: .6 }, "-=.42");
        }

        // Match About's section-heading reveal timing and easing.
        root.querySelectorAll<HTMLElement>("main section").forEach((section) => {
          const heading = section.querySelector<HTMLElement>("h2");
          if (!heading) return;
          const eyebrow = heading.parentElement?.querySelector<HTMLElement>("div");
          const copy = heading.parentElement?.querySelectorAll<HTMLElement>("p");
          const tl = gsap.timeline({
            scrollTrigger: { trigger: heading, start: "top 88%", once: true },
            defaults: { ease: "power3.out" },
          });
          if (eyebrow && eyebrow !== heading) tl.from(eyebrow, { x: -18, duration: .42 });
          tl.from(heading, {
            y: 28, rotateX: -4, transformPerspective: 900, duration: .7,
          }, "-=.12");
          if (copy?.length) tl.from(copy, { y: 14, duration: .5, stagger: .09 }, "-=.3");
        });

        // Contact information cards use the same vertical reveal as About cards.
        const cards = gsap.utils.toArray<HTMLElement>("[data-contact-card]", root);
        cards.forEach((card) => {
          gsap.from(card, {
            y: 32,
            duration: .72,
            ease: "expo.out",
            scrollTrigger: { trigger: card, start: "top 91%", once: true },
          });

          const icon = card.querySelector<SVGElement>("svg");
          const enter = () => {
            gsap.to(card, {
              y: -6,
              scale: 1.01,
              borderColor: "var(--ep-accent)",
              boxShadow: "0 24px 48px -30px rgba(7,42,48,.42)",
              duration: .3,
              ease: "power3.out",
              overwrite: "auto",
            });
            if (icon) animate(icon, {
              scale: [1, 1.14, 1],
              rotate: [0, -8, 5, 0],
              duration: 520,
              ease: "outElastic(1,.6)",
            });
          };
          const leave = () => gsap.to(card, {
            y: 0,
            scale: 1,
            borderColor: "var(--ep-line)",
            boxShadow: "0 12px 28px -24px rgba(11,46,51,.25)",
            duration: .42,
            ease: "power3.out",
            overwrite: "auto",
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

        // The form receives the same gentle card entrance without animating
        // individual inputs or changing their dimensions.
        const form = root.querySelector<HTMLElement>("[data-contact-form]");
        if (form) {
          gsap.from(form, {
            y: 32,
            duration: .72,
            ease: "expo.out",
            clearProps: "transform,opacity,visibility",
            scrollTrigger: { trigger: form, start: "top 91%", once: true },
          });
        }

        // Accent dots echo the one-time marker animation used on About.
        const markers = root.querySelectorAll<HTMLElement>(
          "main section [aria-hidden='true'].h-2, main section .ep-pulse-dot"
        );
        if (markers.length) animate(markers, {
          scale: [.7, 1],
          duration: 480,
          ease: "outBack(1.7)",
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
