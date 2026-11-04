import { useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { animate, stagger } from "animejs";

gsap.registerPlugin(ScrollTrigger);

/** Scroll reveals and small interactive details for the About page. */
export function AboutMotion() {
  useLayoutEffect(() => {
    const root = document.querySelector<HTMLElement>(".marketing-shell");
    if (!root) return;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const ctx = gsap.context(() => {
        const hero = root.querySelector("[data-page-hero]");
        if (hero) {
          const kicker = hero.querySelector("[data-page-kicker]");
          const title = hero.querySelector("h1");
          const lead = hero.querySelector("[data-page-lead]");
          gsap.timeline({ defaults: { ease: "power3.out" } })
            .from(kicker, { y: 12, opacity: 0, duration: 0.45 })
            .from(title, { y: 30, opacity: 0, duration: 0.75 }, "-=0.2")
            .from(lead, { y: 18, opacity: 0, duration: 0.6 }, "-=0.35");
        }
        root.querySelectorAll<HTMLElement>("main section[id]").forEach((section) => {
          const heading = section.querySelector(":scope > div > div h2");
          const cards = section.querySelectorAll(":scope article");
          if (heading) gsap.from(heading, { y: 22, opacity: 0, duration: 0.65, ease: "power3.out", scrollTrigger: { trigger: heading, start: "top 84%", once: true } });
          if (cards.length) gsap.from(cards, { y: 24, opacity: 0, duration: 0.65, stagger: 0.09, ease: "power3.out", scrollTrigger: { trigger: cards[0], start: "top 86%", once: true } });
        });
      }, root);
      const animations: Array<{ revert: () => unknown }> = [];
      const cleanups: Array<() => void> = [];
      root.querySelectorAll<HTMLElement>("main article").forEach((card) => {
        const icon = card.querySelector<HTMLElement>("svg");
        const onEnter = () => {
          animations.push(animate(card, { translateY: -5, duration: 260, ease: "out(3)" }));
          if (icon) animations.push(animate(icon, { scale: [1, 1.16, 1], rotate: [0, -5, 0], duration: 420, ease: "out(3)" }));
        };
        const onLeave = () => animations.push(animate(card, { translateY: 0, duration: 320, ease: "out(3)" }));
        card.addEventListener("mouseenter", onEnter); card.addEventListener("mouseleave", onLeave);
        card.addEventListener("focusin", onEnter); card.addEventListener("focusout", onLeave);
        cleanups.push(() => {
          card.removeEventListener("mouseenter", onEnter); card.removeEventListener("mouseleave", onLeave);
          card.removeEventListener("focusin", onEnter); card.removeEventListener("focusout", onLeave);
        });
      });
      const icons = root.querySelectorAll<HTMLElement>("#objectives article svg");
      const grid = root.querySelector("#objectives .grid");
      let observer: IntersectionObserver | undefined;
      if (icons.length && grid) {
        observer = new IntersectionObserver((entries) => {
          if (!entries.some((entry) => entry.isIntersecting)) return;
          animations.push(animate(icons, { scale: [0.65, 1], rotate: [-12, 0], opacity: [0, 1], delay: stagger(65), duration: 480, ease: "outBack" }));
          observer?.disconnect();
        }, { threshold: 0.2 });
        observer.observe(grid);
      }
      return () => { ctx.revert(); observer?.disconnect(); cleanups.forEach((fn) => fn()); animations.forEach((animation) => animation.revert()); };
    });
    return () => mm.revert();
  }, []);
  return null;
}