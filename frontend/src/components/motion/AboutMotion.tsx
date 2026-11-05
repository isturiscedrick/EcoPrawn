import { useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { animate } from "animejs";

gsap.registerPlugin(ScrollTrigger);

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
          gsap.timeline({ defaults: { ease: "power4.out" } })
            .from(kicker, { y: 20, duration: .6 })
            .from(title, { y: 48, duration: .85 }, "-=.32")
            .from(lead, { y: 22, duration: .65 }, "-=.48");
          const atmosphere = hero.querySelector<HTMLElement>(".ep-hero-atmosphere");
          if (atmosphere) gsap.to(atmosphere, {
            yPercent: 18, ease: "none",
            scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: .8 },
          });
        }

        // Animate each section as a coordinated sequence: eyebrow, heading,
        // supporting copy, then its content. No blur filters are used.
        ["#objectives", "#systems", "#scope"].forEach((selector) => {
          const section = root.querySelector<HTMLElement>(selector);
          if (!section) return;
          const header = section.querySelector<HTMLElement>(":scope > div > div:first-child");
          if (header) {
            const eyebrow = header.querySelector<HTMLElement>("div");
            const heading = header.querySelector<HTMLElement>("h2");
            const copy = header.querySelectorAll<HTMLElement>("p");
            const tl = gsap.timeline({
              scrollTrigger: { trigger: header, start: "top 84%", once: true },
              defaults: { ease: "power3.out" },
            });
            if (eyebrow) tl.from(eyebrow, { x: -20, duration: .45 });
            if (heading) tl.from(heading, { y: 32, duration: .7 }, "-=.2");
            if (copy.length) tl.from(copy, { y: 18, duration: .55, stagger: .1 }, "-=.35");
          }

          const cards = gsap.utils.toArray<HTMLElement>("article", section);
          if (cards.length) gsap.from(cards, {
            y: 48, rotateX: 7, transformPerspective: 1000, transformOrigin: "center bottom", duration: .85, stagger: .12, ease: "expo.out",
            scrollTrigger: { trigger: cards[0], start: "top 86%", once: true },
          });

          // Reveal each card's text in reading order, without animating the
          // whole card a second time.
          cards.forEach((card) => {
            const text = card.querySelectorAll<HTMLElement>("h3, dt, dd, b, p, article > div > span");
            if (text.length) gsap.from(text, {
              y: 14, duration: .48, stagger: .045, ease: "power2.out",
              scrollTrigger: { trigger: card, start: "top 82%", once: true },
            });
          });
        });

        const systemRows = gsap.utils.toArray<HTMLElement>("#systems article", root);
        systemRows.forEach((row, index) => {
          const marker = row.querySelector<HTMLElement>("span.flex");
          if (marker) gsap.from(marker, {
            scale: .55, rotate: index % 2 ? 28 : -28, duration: .75, ease: "back.out(2.4)",
            scrollTrigger: { trigger: row, start: "top 84%", once: true },
          });
          const points = row.querySelectorAll<HTMLElement>(".col-span-2 > div");
          if (points.length) gsap.from(points, {
            x: 18, duration: .5, stagger: .09, ease: "power3.out",
            scrollTrigger: { trigger: row, start: "top 78%", once: true },
          });
        });

        const footer = root.querySelector<HTMLElement>("[data-site-footer]");
        const footerGroups = footer?.querySelectorAll<HTMLElement>(":scope .grid > div");
        if (footer && footerGroups?.length) gsap.from(footerGroups, {
          y: 24, duration: .7, stagger: .12, ease: "power3.out",
          scrollTrigger: { trigger: footer, start: "top 90%", once: true },
        });
      }, root);

      const listeners: Array<() => void> = [];
      const animeRuns: Array<{ revert: () => unknown }> = [];
      const icons = root.querySelectorAll<HTMLElement>("main article svg, main h3 svg, main button svg");
      const iconObserver = icons.length ? new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const icon = entry.target as HTMLElement;
          animeRuns.push(animate(icon, {
            scale: [.65, 1], rotate: [-14, 0], opacity: [0, 1],
            duration: 680, ease: "outElastic(1,.65)",
          }));
          iconObserver.unobserve(icon);
        });
      }, { threshold: .35 }) : undefined;
      icons.forEach((icon) => iconObserver?.observe(icon));

      root.querySelectorAll<HTMLElement>("main article").forEach((card) => {
        const icon = card.querySelector<HTMLElement>("svg");
        const tiltX = gsap.quickTo(card, "rotationX", { duration: .32, ease: "power3.out" });
        const tiltY = gsap.quickTo(card, "rotationY", { duration: .32, ease: "power3.out" });
        const enter = () => {
          gsap.to(card, { y: -7, scale: 1.018, boxShadow: "0 26px 58px -34px rgba(7,42,48,.45)", duration: .32, ease: "power3.out" });
          if (icon) animeRuns.push(animate(icon, {
            scale: [1, 1.18, 1], rotate: [0, -10, 7, 0],
            duration: 560, ease: "outElastic(1,.55)",
          }));
        };
        const move = (event: PointerEvent) => {
          const rect = card.getBoundingClientRect();
          tiltY(((event.clientX - rect.left) / rect.width - .5) * 7);
          tiltX(-((event.clientY - rect.top) / rect.height - .5) * 5);
        };
        const leave = () => {
          tiltX(0); tiltY(0);
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

      root.querySelectorAll<HTMLElement>("main a, main button").forEach((control) => {
        const icon = control.querySelector<HTMLElement>("svg");
        const enter = () => {
          gsap.to(control, { y: -3, duration: .22, ease: "power2.out" });
          if (icon) animeRuns.push(animate(icon, { translateX: [0, 4], duration: 300, ease: "outBack" }));
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
