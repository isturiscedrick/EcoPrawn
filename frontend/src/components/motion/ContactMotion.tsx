import { useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { animate } from "animejs";

gsap.registerPlugin(ScrollTrigger);

export function ContactMotion() {
  useLayoutEffect(() => {
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const context = gsap.context(() => {
        const cleanups: Array<() => void> = [];

        const hero = document.querySelector("[data-page-hero]");
        if (hero) {
          const kicker = hero.querySelector("[data-page-kicker]");
          const title = hero.querySelector("h1");
          const lead = hero.querySelector("[data-page-lead]");
          gsap.timeline({ defaults: { ease: "power3.out" } })
            .from(kicker, { y: 12, opacity: 0, duration: 0.45 })
            .from(title, { y: 30, opacity: 0, duration: 0.75 }, "-=0.2")
            .from(lead, { y: 18, opacity: 0, duration: 0.6 }, "-=0.35");
        }

        gsap.from("[data-contact-card]", {
          y: 28,
          opacity: 0,
          duration: 0.7,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: {
            trigger: "[data-contact-details]",
            start: "top 78%",
            once: true,
          },
        });

        gsap.from("[data-contact-form]", {
          x: 34,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: "[data-contact-form]",
            start: "top 78%",
            once: true,
          },
        });

        document.querySelectorAll<HTMLElement>("[data-contact-card]").forEach((card) => {
          const enter = () =>
            animate(card, {
              translateY: -5,
              scale: 1.015,
              duration: 260,
              ease: "out(3)",
            });
          const leave = () =>
            animate(card, {
              translateY: 0,
              scale: 1,
              duration: 320,
              ease: "out(3)",
            });

          card.addEventListener("mouseenter", enter);
          card.addEventListener("mouseleave", leave);
          card.addEventListener("focusin", enter);
          card.addEventListener("focusout", leave);
          cleanups.push(() => {
            card.removeEventListener("mouseenter", enter);
            card.removeEventListener("mouseleave", leave);
            card.removeEventListener("focusin", enter);
            card.removeEventListener("focusout", leave);
          });
        });

        return () => cleanups.forEach((cleanup) => cleanup());
      });

      return () => context.revert();
    });

    return () => mm.revert();
  }, []);

  return null;
}
