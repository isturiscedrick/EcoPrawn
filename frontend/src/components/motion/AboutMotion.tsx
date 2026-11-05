import { useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { animate } from "animejs";

gsap.registerPlugin(ScrollTrigger);

/**
 * Motion for the About page.
 * All scroll entrances use transforms only—content is never hidden with
 * opacity/autoAlpha, so a missed ScrollTrigger can never leave a card invisible.
 */
export function AboutMotion() {
  useLayoutEffect(() => {
    const root = document.querySelector<HTMLElement>(".ep-about-page");
    if (!root) return;

    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const context = gsap.context(() => {
        const hero = root.querySelector<HTMLElement>("[data-page-hero]");
        if (hero) {
          const kicker = hero.querySelector<HTMLElement>("[data-page-kicker]");
          const title = hero.querySelector<HTMLElement>("h1");
          const lead = hero.querySelector<HTMLElement>("[data-page-lead]");
          const intro = gsap.timeline({ defaults: { ease: "power3.out" } });

          if (kicker) intro.from(kicker, { y: 18, duration: 0.5 });
          if (title) intro.from(title, { y: 34, duration: 0.72 }, "-=0.2");
          if (lead) intro.from(lead, { y: 16, duration: 0.5 }, "-=0.32");

          const atmosphere = hero.querySelector<HTMLElement>(".ep-hero-atmosphere");
          if (atmosphere) {
            gsap.to(atmosphere, {
              yPercent: 14,
              ease: "none",
              scrollTrigger: {
                trigger: hero,
                start: "top top",
                end: "bottom top",
                scrub: 0.7,
              },
            });
          }
        }

        // Section headings animate only when a real heading exists.
        root.querySelectorAll<HTMLElement>("main section h2").forEach((heading) => {
          const section = heading.closest("section");
          if (!section) return;
          const eyebrow = heading.parentElement?.querySelector<HTMLElement>("div");
          const lead = heading.parentElement?.querySelectorAll<HTMLElement>("p");
          const timeline = gsap.timeline({
            scrollTrigger: { trigger: heading, start: "top 86%", once: true },
            defaults: { ease: "power3.out" },
          });
          if (eyebrow && eyebrow !== heading) timeline.from(eyebrow, { x: -14, duration: 0.4 });
          timeline.from(heading, { y: 24, duration: 0.62 }, "-=0.12");
          if (lead?.length) timeline.from(lead, { y: 12, duration: 0.45, stagger: 0.08 }, "-=0.28");
        });

        // Animate article cards once. Do not animate nested text visibility;
        // this avoids competing transforms and cards stuck in a hidden state.
        const cards = gsap.utils.toArray<HTMLElement>("main article", root);
        cards.forEach((card, index) => {
          gsap.from(card, {
            y: 34,
            rotateX: index % 2 === 0 ? 3 : -3,
            transformPerspective: 900,
            transformOrigin: "center bottom",
            duration: 0.72,
            ease: "power3.out",
            scrollTrigger: { trigger: card, start: "top 88%", once: true },
          });
        });

        // Stagger system-row detail points as one sequence per row.
        root.querySelectorAll<HTMLElement>("#systems article").forEach((row) => {
          const points = row.querySelectorAll<HTMLElement>(".col-span-2 > div");
          if (points.length) {
            gsap.from(points, {
              x: 12,
              duration: 0.42,
              stagger: 0.07,
              ease: "power2.out",
              scrollTrigger: { trigger: row, start: "top 82%", once: true },
            });
          }
        });

        const footer = root.querySelector<HTMLElement>("footer");
        const footerColumns = footer?.querySelectorAll<HTMLElement>(".grid > div");
        if (footer && footerColumns?.length) {
          gsap.from(footerColumns, {
            y: 18,
            duration: 0.58,
            stagger: 0.1,
            ease: "power3.out",
            scrollTrigger: { trigger: footer, start: "top 92%", once: true },
          });
        }

        // Card hover uses GSAP for depth; Anime.js adds a short icon response.
        root.querySelectorAll<HTMLElement>("main article").forEach((card) => {
          const icon = card.querySelector<SVGElement>("svg");
          const rotateX = gsap.quickTo(card, "rotationX", { duration: 0.28, ease: "power2.out" });
          const rotateY = gsap.quickTo(card, "rotationY", { duration: 0.28, ease: "power2.out" });

          const onEnter = () => {
            gsap.to(card, {
              y: -5,
              scale: 1.012,
              boxShadow: "0 22px 48px -34px rgba(7,42,48,.42)",
              duration: 0.25,
              ease: "power2.out",
            });
            if (icon) {
              animate(icon, {
                scale: [1, 1.14, 1],
                rotate: [0, -8, 5, 0],
                duration: 520,
                ease: "outElastic(1, .6)",
              });
            }
          };

          const onMove = (event: PointerEvent) => {
            const bounds = card.getBoundingClientRect();
            if (!bounds.width || !bounds.height) return;
            rotateY(((event.clientX - bounds.left) / bounds.width - 0.5) * 5);
            rotateX(-((event.clientY - bounds.top) / bounds.height - 0.5) * 4);
          };

          const onLeave = () => {
            rotateX(0);
            rotateY(0);
            gsap.to(card, {
              y: 0,
              scale: 1,
              rotationX: 0,
              rotationY: 0,
              duration: 0.38,
              ease: "power2.out",
            });
          };

          card.addEventListener("pointerenter", onEnter);
          card.addEventListener("pointermove", onMove);
          card.addEventListener("pointerleave", onLeave);
          card.addEventListener("focusin", onEnter);
          card.addEventListener("focusout", onLeave);

          context.add(() => {
            card.removeEventListener("pointerenter", onEnter);
            card.removeEventListener("pointermove", onMove);
            card.removeEventListener("pointerleave", onLeave);
            card.removeEventListener("focusin", onEnter);
            card.removeEventListener("focusout", onLeave);
          });
        });

        root.querySelectorAll<HTMLElement>("main a, main button").forEach((control) => {
          const icon = control.querySelector<SVGElement>("svg");
          const onEnter = () => {
            gsap.to(control, { y: -2, duration: 0.2, ease: "power2.out" });
            if (icon) {
              animate(icon, {
                translateX: [0, 3],
                duration: 260,
                ease: "outBack(1.5)",
              });
            }
          };
          const onLeave = () => gsap.to(control, { y: 0, duration: 0.24, ease: "power2.out" });
          control.addEventListener("pointerenter", onEnter);
          control.addEventListener("pointerleave", onLeave);
          context.add(() => {
            control.removeEventListener("pointerenter", onEnter);
            control.removeEventListener("pointerleave", onLeave);
          });
        });
      }, root);

      return () => context.revert();
    });

    return () => media.revert();
  }, []);

  return null;
}
