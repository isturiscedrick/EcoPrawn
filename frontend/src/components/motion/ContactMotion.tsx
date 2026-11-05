import { useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { animate } from "animejs";

gsap.registerPlugin(ScrollTrigger);

export function ContactMotion() {
  useLayoutEffect(() => {
    const root = document.querySelector<HTMLElement>(".ep-contact-page");
    if (!root) return;
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const ctx = gsap.context(() => {
        const hero = root.querySelector<HTMLElement>("[data-page-hero]");
        if (hero) {
          const kicker = hero.querySelector("[data-page-kicker]");
          const title = hero.querySelector("h1");
          const lead = hero.querySelector("[data-page-lead]");
          gsap.timeline({ defaults: { ease: "power3.out" } })
            .from(kicker, { y: 14, autoAlpha: 0, duration: .45 })
            .from(title, { y: 34, autoAlpha: 0, duration: .8 }, "-=.2")
            .from(lead, { y: 18, autoAlpha: 0, duration: .6 }, "-=.4");
        }

        const details = root.querySelector<HTMLElement>("[data-contact-details]");
        const cards = gsap.utils.toArray<HTMLElement>("[data-contact-card]", root);
        if (details && cards.length) gsap.from(cards, {
          y: 30, rotateX: 3, transformPerspective: 800, duration: .7, stagger: .12,
          ease: "power3.out",
          scrollTrigger: { trigger: details, start: "top 80%", once: true },
        });

        const form = root.querySelector<HTMLElement>("[data-contact-form]");
        if (form) gsap.from(form, {
          y: 34, scale: .985, duration: .85, ease: "power3.out",
          scrollTrigger: { trigger: form, start: "top 82%", once: true },
        });

        const footer = root.querySelector<HTMLElement>("[data-site-footer]");
        const columns = footer?.querySelectorAll<HTMLElement>(":scope .grid > div");
        if (footer && columns?.length) gsap.from(columns, {
          y: 22, duration: .65, stagger: .1, ease: "power3.out",
          scrollTrigger: { trigger: footer, start: "top 88%", once: true },
        });
      }, root);

      const cleanups: Array<() => void> = [];
      const animations: Array<{ revert: () => unknown }> = [];
      root.querySelectorAll<HTMLElement>("[data-contact-card]").forEach((card) => {
        const icon = card.querySelector<HTMLElement>("svg");
        const enter = () => {
          animations.push(animate(card, { translateY: -5, scale: 1.012, duration: 260, ease: "out(3)" }));
          if (icon) animations.push(animate(icon, {
            scale: [1, 1.14, 1], rotate: [0, -6, 0], duration: 420, ease: "out(3)",
          }));
        };
        const leave = () => animations.push(animate(card, {
          translateY: 0, scale: 1, duration: 320, ease: "out(3)",
        }));
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

      root.querySelectorAll<HTMLElement>("main button, main a[class*='rounded']").forEach((el) => {
        const enter = () => animations.push(animate(el, {
          translateY: -2, scale: 1.015, duration: 220, ease: "out(3)",
        }));
        const leave = () => animations.push(animate(el, {
          translateY: 0, scale: 1, duration: 280, ease: "out(3)",
        }));
        el.addEventListener("mouseenter", enter);
        el.addEventListener("mouseleave", leave);
        cleanups.push(() => {
          el.removeEventListener("mouseenter", enter);
          el.removeEventListener("mouseleave", leave);
        });
      });

      return () => {
        ctx.revert();
        cleanups.forEach((fn) => fn());
        animations.forEach((animation) => animation.revert());
      };
    });
    return () => mm.revert();
  }, []);
  return null;
}
