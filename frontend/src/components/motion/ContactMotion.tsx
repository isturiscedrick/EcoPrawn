import { useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { animate, stagger } from "animejs";

gsap.registerPlugin(ScrollTrigger);

/** Cinematic scroll reveals and tactile interactions for Contact. */
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
          gsap.timeline({ defaults: { ease: "power4.out" } })
            .from(kicker, { y: 22, autoAlpha: 0, filter: "blur(8px)", duration: .65 })
            .from(title, { y: 58, autoAlpha: 0, filter: "blur(12px)", duration: .95 }, "-=.35")
            .from(lead, { y: 28, autoAlpha: 0, duration: .7 }, "-=.5");
          const atmosphere = hero.querySelector<HTMLElement>(".ep-hero-atmosphere");
          if (atmosphere) gsap.to(atmosphere, {
            yPercent: 24, scale: 1.14, ease: "none",
            scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: .8 },
          });
        }

        const section = root.querySelector<HTMLElement>("main section");
        const cards = gsap.utils.toArray<HTMLElement>("[data-contact-card]", root);
        if (section && cards.length) {
          gsap.from(cards, {
            x: -72, rotateY: -12, transformPerspective: 1000, autoAlpha: 0,
            duration: 1, stagger: .18, ease: "expo.out",
            scrollTrigger: { trigger: section, start: "top 75%", once: true },
          });
        }

        const form = root.querySelector<HTMLElement>("[data-contact-form]");
        if (form) {
          gsap.from(form, {
            x: 90, y: 28, rotateY: 10, scale: .96, transformPerspective: 1200,
            autoAlpha: 0, duration: 1.15, ease: "expo.out",
            scrollTrigger: { trigger: form, start: "top 82%", once: true },
          });
          const fields = form.querySelectorAll<HTMLElement>("input, textarea");
          gsap.from(fields, {
            y: 18, autoAlpha: 0, duration: .65, stagger: .1, ease: "power3.out",
            delay: .25,
            scrollTrigger: { trigger: form, start: "top 78%", once: true },
          });
        }

        const footer = root.querySelector<HTMLElement>("[data-site-footer]");
        const columns = footer?.querySelectorAll<HTMLElement>(":scope .grid > div");
        if (footer && columns?.length) gsap.from(columns, {
          y: 34, autoAlpha: 0, duration: .8, stagger: .14, ease: "power3.out",
          scrollTrigger: { trigger: footer, start: "top 88%", once: true },
        });
      }, root);

      const cleanups: Array<() => void> = [];
      const animeRuns: Array<{ revert: () => unknown }> = [];
      root.querySelectorAll<HTMLElement>("[data-contact-card]").forEach((card) => {
        const icon = card.querySelector<HTMLElement>("svg");
        const xTo = gsap.quickTo(card, "rotationY", { duration: .3, ease: "power3.out" });
        const yTo = gsap.quickTo(card, "rotationX", { duration: .3, ease: "power3.out" });
        const enter = () => {
          gsap.to(card, { scale: 1.035, y: -8, boxShadow: "0 30px 70px -34px rgba(7,42,48,.55)", duration: .38, ease: "power3.out" });
          if (icon) animeRuns.push(animate(icon, {
            scale: [1, 1.25, 1], rotate: [0, -14, 10, 0], duration: 650, ease: "outElastic(1,.5)",
          }));
        };
        const leave = () => {
          xTo(0); yTo(0);
          gsap.to(card, { scale: 1, y: 0, boxShadow: "0 12px 28px -24px rgba(11,46,51,.35)", duration: .55, ease: "elastic.out(1,.6)" });
        };
        const pointer = (event: PointerEvent) => {
          const rect = card.getBoundingClientRect();
          xTo(((event.clientX - rect.left) / rect.width - .5) * 9);
          yTo(-((event.clientY - rect.top) / rect.height - .5) * 7);
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

      const form = root.querySelector<HTMLElement>("[data-contact-form]");
      if (form) {
        const fields = form.querySelectorAll<HTMLElement>("input, textarea");
        fields.forEach((field) => {
          const focus = () => {
            gsap.to(field, { scale: 1.008, borderColor: "var(--ep-accent)", boxShadow: "0 0 0 4px color-mix(in srgb, var(--ep-accent) 17%, transparent)", duration: .25, ease: "power2.out" });
            const label = field.parentElement?.querySelector("label");
            if (label) animeRuns.push(animate(label, {
              translateX: [0, 5, 0], color: ["currentColor", "var(--ep-accent)"],
              duration: 360, ease: "out(3)",
            }));
          };
          const blur = () => gsap.to(field, {
            scale: 1, boxShadow: "0 0 0 0 transparent", duration: .35, ease: "power2.out",
          });
          field.addEventListener("focus", focus);
          field.addEventListener("blur", blur);
          cleanups.push(() => {
            field.removeEventListener("focus", focus);
            field.removeEventListener("blur", blur);
          });
        });
      }

      const buttons = root.querySelectorAll<HTMLElement>("main button");
      buttons.forEach((button) => {
        const icon = button.querySelector<HTMLElement>("svg");
        const enter = () => {
          gsap.to(button, { y: -4, scale: 1.025, duration: .24, ease: "power3.out" });
          if (icon) animeRuns.push(animate(icon, { translateX: [0, 5], rotate: [0, -8, 0], duration: 380, ease: "outBack" }));
        };
        const leave = () => gsap.to(button, { y: 0, scale: 1, duration: .35, ease: "elastic.out(1,.65)" });
        button.addEventListener("mouseenter", enter);
        button.addEventListener("mouseleave", leave);
        cleanups.push(() => {
          button.removeEventListener("mouseenter", enter);
          button.removeEventListener("mouseleave", leave);
        });
      });

      return () => {
        ctx.revert();
        cleanups.forEach((fn) => fn());
        animeRuns.forEach((animation) => animation.revert());
      };
    });
    return () => mm.revert();
  }, []);
  return null;
}
