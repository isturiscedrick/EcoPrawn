import { useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Contact page motion is intentionally restrained: one page intro and one
 * gentle form reveal. Contact information cards remain still so their text
 * never appears to collide with the card edges during responsive resizing.
 */
export function ContactMotion() {
  useLayoutEffect(() => {
    const root = document.querySelector<HTMLElement>(".ep-contact-page");
    if (!root) return;

    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const ctx = gsap.context(() => {
        const hero = root.querySelector<HTMLElement>("[data-page-hero]");
        const kicker = hero?.querySelector<HTMLElement>("[data-page-kicker]");
        const title = hero?.querySelector<HTMLElement>("h1");
        const lead = hero?.querySelector<HTMLElement>("[data-page-lead]");

        const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
        if (kicker) intro.from(kicker, { y: 10, autoAlpha: 0, duration: 0.35 });
        if (title) intro.from(title, { y: 16, autoAlpha: 0, duration: 0.5 }, "-=0.16");
        if (lead) intro.from(lead, { y: 8, autoAlpha: 0, duration: 0.4 }, "-=0.2");

        const section = root.querySelector<HTMLElement>("main section");
        const heading = section?.querySelector<HTMLElement>("h2");
        if (heading) {
          gsap.from(heading, {
            y: 10,
            autoAlpha: 0,
            duration: 0.45,
            ease: "power2.out",
            scrollTrigger: { trigger: heading, start: "top 90%", once: true },
          });
        }

        // Keep contact detail cards static. Only reveal the form once, with
        // a small opacity/vertical transition that does not affect its layout.
        const form = root.querySelector<HTMLElement>("[data-contact-form]");
        if (form) {
          gsap.from(form, {
            y: 12,
            autoAlpha: 0,
            duration: 0.5,
            ease: "power2.out",
            clearProps: "transform,opacity,visibility",
            scrollTrigger: { trigger: form, start: "top 92%", once: true },
          });
        }
      }, root);

      return () => ctx.revert();
    });

    return () => mm.revert();
  }, []);

  return null;
}
