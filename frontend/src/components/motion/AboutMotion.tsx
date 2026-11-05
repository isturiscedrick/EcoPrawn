import { useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { animate, stagger } from "animejs";

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
          gsap.timeline({ defaults: { ease: "power3.out" } })
            .from(kicker, { y: 14, autoAlpha: 0, duration: .45 })
            .from(title, { y: 34, autoAlpha: 0, duration: .8 }, "-=.2")
            .from(lead, { y: 18, autoAlpha: 0, duration: .6 }, "-=.4");
        }

        ["#objectives", "#systems", "#scope"].forEach((selector) => {
          const section = root.querySelector<HTMLElement>(selector);
          const heading = section?.querySelector<HTMLElement>("h2");
          const intro = section?.querySelector<HTMLElement>("p");
          if (!section || !heading) return;
          gsap.from([heading, ...(intro ? [intro] : [])], {
            y: 24, autoAlpha: 0, duration: .7, stagger: .1, ease: "power3.out",
            scrollTrigger: { trigger: section, start: "top 76%", once: true },
          });
        });

        const objectives = gsap.utils.toArray<HTMLElement>("#objectives article", root);
        if (objectives.length) gsap.from(objectives, {
          y: 28, rotateX: 4, transformPerspective: 900, transformOrigin: "center bottom",
          duration: .72, stagger: .09, ease: "power3.out",
          scrollTrigger: { trigger: "#objectives .grid", start: "top 82%", once: true },
        });

        const systems = gsap.utils.toArray<HTMLElement>("#systems article", root);
        if (systems.length) gsap.from(systems, {
          x: (i) => i % 2 ? 24 : -24, duration: .65, stagger: .1, ease: "power3.out",
          scrollTrigger: { trigger: "#systems", start: "top 72%", once: true },
        });

        const scope = gsap.utils.toArray<HTMLElement>("#scope article", root);
        if (scope.length) gsap.from(scope, {
          y: 30, scale: .985, duration: .7, stagger: .14, ease: "power3.out",
          scrollTrigger: { trigger: "#scope .grid", start: "top 80%", once: true },
        });
      }, root);

      const cleanups: Array<() => void> = [];
      const animations: Array<{ revert: () => unknown }> = [];
      root.querySelectorAll<HTMLElement>("main article").forEach((card) => {
        const icon = card.querySelector<HTMLElement>("svg");
        if (!icon) return;
        const enter = () => animations.push(animate(icon, {
          scale: [1, 1.16, 1], rotate: [0, -7, 0], duration: 440, ease: "out(3)",
        }));
        card.addEventListener("mouseenter", enter);
        card.addEventListener("focusin", enter);
        cleanups.push(() => {
          card.removeEventListener("mouseenter", enter);
          card.removeEventListener("focusin", enter);
        });
      });

      const icons = root.querySelectorAll<HTMLElement>("#objectives article svg");
      const grid = root.querySelector("#objectives .grid");
      let observer: IntersectionObserver | undefined;
      if (icons.length && grid) {
        observer = new IntersectionObserver((entries) => {
          if (!entries.some((entry) => entry.isIntersecting)) return;
          animations.push(animate(icons, {
            scale: [.72, 1], rotate: [-10, 0], delay: stagger(65), duration: 520, ease: "outBack",
          }));
          observer?.disconnect();
        }, { threshold: .2 });
        observer.observe(grid);
      }

      return () => {
        ctx.revert();
        observer?.disconnect();
        cleanups.forEach((fn) => fn());
        animations.forEach((animation) => animation.revert());
      };
    });
    return () => mm.revert();
  }, []);
  return null;
}
