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
          gsap.timeline({ defaults: { ease: "power4.out" } })
            .from(kicker, { y: 20, autoAlpha: 0, duration: .6 })
            .from(title, { y: 50, autoAlpha: 0, duration: .9 }, "-=.32")
            .from(lead, { y: 22, autoAlpha: 0, duration: .65 }, "-=.5");
          const atmosphere = hero.querySelector<HTMLElement>(".ep-hero-atmosphere");
          if (atmosphere) gsap.to(atmosphere, {
            yPercent: 18, ease: "none",
            scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: .8 },
          });
        }

        const mainSection = root.querySelector<HTMLElement>("main section");
        if (mainSection) {
          const sectionHeading = mainSection.querySelector<HTMLElement>("h2");
          const sectionCopy = mainSection.querySelectorAll<HTMLElement>("p");
          const sectionEyebrow = mainSection.querySelector<HTMLElement>("h2")?.parentElement?.querySelector("div");
          const headingTl = gsap.timeline({
            scrollTrigger: { trigger: mainSection, start: "top 82%", once: true },
            defaults: { ease: "power3.out" },
          });
          if (sectionEyebrow) headingTl.from(sectionEyebrow, { x: -18, autoAlpha: 0, duration: .45 });
          if (sectionHeading) headingTl.from(sectionHeading, { y: 28, autoAlpha: 0, duration: .7 }, "-=.2");
          if (sectionCopy.length) headingTl.from(sectionCopy, { y: 16, autoAlpha: 0, stagger: .08, duration: .5 }, "-=.3");
        }

        const cards = gsap.utils.toArray<HTMLElement>("[data-contact-card]", root);
        if (cards.length) gsap.from(cards, {
          x: -58, rotateY: -8, transformPerspective: 1000, autoAlpha: 0,
          duration: .9, stagger: .16, ease: "expo.out",
          scrollTrigger: { trigger: cards[0], start: "top 86%", once: true },
        });

        const form = root.querySelector<HTMLElement>("[data-contact-form]");
        if (form) {
          gsap.from(form, {
            x: 64, y: 24, rotateY: 7, scale: .975, transformPerspective: 1100,
            autoAlpha: 0, duration: 1, ease: "expo.out",
            scrollTrigger: { trigger: form, start: "top 84%", once: true },
          });
          const fields = form.querySelectorAll<HTMLElement>("input, textarea, select");
          gsap.from(fields, {
            y: 16, autoAlpha: 0, stagger: .09, duration: .55, ease: "power3.out",
            scrollTrigger: { trigger: form, start: "top 78%", once: true },
          });
          const labels = form.querySelectorAll<HTMLElement>("label");
          gsap.from(labels, {
            x: -10, autoAlpha: 0, stagger: .07, duration: .4, ease: "power2.out",
            scrollTrigger: { trigger: form, start: "top 76%", once: true },
          });
        }

        const footer = root.querySelector<HTMLElement>("[data-site-footer]");
        const footerGroups = footer?.querySelectorAll<HTMLElement>(":scope .grid > div");
        if (footer && footerGroups?.length) gsap.from(footerGroups, {
          y: 24, autoAlpha: 0, duration: .7, stagger: .12, ease: "power3.out",
          scrollTrigger: { trigger: footer, start: "top 90%", once: true },
        });
      }, root);

      const listeners: Array<() => void> = [];
      const animeRuns: Array<{ revert: () => unknown }> = [];
      const icons = root.querySelectorAll<HTMLElement>("main svg");
      const iconObserver = icons.length ? new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const icon = entry.target as HTMLElement;
          animeRuns.push(animate(icon, {
            scale: [.62, 1], rotate: [-16, 0], opacity: [0, 1],
            duration: 700, ease: "outElastic(1,.65)",
          }));
          iconObserver.unobserve(icon);
        });
      }, { threshold: .35 }) : undefined;
      icons.forEach((icon) => iconObserver?.observe(icon));

      root.querySelectorAll<HTMLElement>("[data-contact-card]").forEach((card) => {
        const icon = card.querySelector<HTMLElement>("svg");
        const rotateX = gsap.quickTo(card, "rotationX", { duration: .3, ease: "power3.out" });
        const rotateY = gsap.quickTo(card, "rotationY", { duration: .3, ease: "power3.out" });
        const enter = () => {
          gsap.to(card, { y: -7, scale: 1.025, boxShadow: "0 28px 64px -34px rgba(7,42,48,.5)", duration: .32, ease: "power3.out" });
          if (icon) animeRuns.push(animate(icon, {
            scale: [1, 1.2, 1], rotate: [0, -12, 8, 0],
            duration: 600, ease: "outElastic(1,.55)",
          }));
        };
        const move = (event: PointerEvent) => {
          const rect = card.getBoundingClientRect();
          rotateY(((event.clientX - rect.left) / rect.width - .5) * 8);
          rotateX(-((event.clientY - rect.top) / rect.height - .5) * 6);
        };
        const leave = () => {
          rotateX(0); rotateY(0);
          gsap.to(card, { y: 0, scale: 1, rotationX: 0, rotationY: 0, duration: .5, ease: "elastic.out(1,.6)" });
        };
        card.addEventListener("mouseenter", enter);
        card.addEventListener("pointermove", move);
        card.addEventListener("mouseleave", leave);
        card.addEventListener("focusin", enter);
        card.addEventListener("focusout", leave);
        listeners.push(() => {
          card.removeEventListener("mouseenter", enter);
          card.removeEventListener("pointermove", move);
          card.removeEventListener("mouseleave", leave);
          card.removeEventListener("focusin", enter);
          card.removeEventListener("focusout", leave);
        });
      });

      const form = root.querySelector<HTMLElement>("[data-contact-form]");
      form?.querySelectorAll<HTMLElement>("input, textarea, select").forEach((field) => {
        const focus = () => {
          gsap.to(field, { scale: 1.006, borderColor: "var(--ep-accent)", boxShadow: "0 0 0 4px color-mix(in srgb, var(--ep-accent) 16%, transparent)", duration: .22, ease: "power2.out" });
          const label = field.parentElement?.querySelector<HTMLElement>("label");
          if (label) animeRuns.push(animate(label, {
            translateX: [0, 4, 0], duration: 320, ease: "outBack",
          }));
        };
        const blur = () => gsap.to(field, { scale: 1, boxShadow: "0 0 0 0 transparent", duration: .3, ease: "power2.out" });
        field.addEventListener("focus", focus);
        field.addEventListener("blur", blur);
        listeners.push(() => {
          field.removeEventListener("focus", focus);
          field.removeEventListener("blur", blur);
        });
      });

      root.querySelectorAll<HTMLElement>("main button, main a").forEach((control) => {
        const icon = control.querySelector<HTMLElement>("svg");
        const enter = () => {
          gsap.to(control, { y: -3, duration: .22, ease: "power2.out" });
          if (icon) animeRuns.push(animate(icon, { translateX: [0, 4], rotate: [0, -7, 0], duration: 360, ease: "outBack" }));
        };
        const leave = () => gsap.to(control, { y: 0, duration: .3, ease: "power2.out" });
        control.addEventListener("mouseenter", enter);
        control.addEventListener("mouseleave", leave);
        listeners.push(() => {
          control.removeEventListener("mouseenter", enter);
          control.removeEventListener("mouseleave", leave);
        });
      });

      return () => {
        ctx.revert();
        iconObserver?.disconnect();
        listeners.forEach((cleanup) => cleanup());
        animeRuns.forEach((animation) => animation.revert());
      };
    });
    return () => mm.revert();
  }, []);
  return null;
}
