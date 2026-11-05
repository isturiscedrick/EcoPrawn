import { useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { animate, stagger } from "animejs";

gsap.registerPlugin(ScrollTrigger);

/**
 * Shared motion for the public-site chrome. Page-specific motion components
 * continue to own their sections; this component owns navigation, mobile
 * menu choreography, footer details, and route-entry polish.
 */
export function PublicChromeMotion() {
  useLayoutEffect(() => {
    const root = document.querySelector<HTMLElement>(".ep-landing");
    if (!root) return;

    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const cleanups: Array<() => void> = [];
      const animeRuns: Array<{ revert: () => unknown }> = [];
      const ctx = gsap.context(() => {
        const header = root.querySelector<HTMLElement>("#site-header");
        const nav = header?.querySelector<HTMLElement>('nav[aria-label="Primary navigation"]');

        // A shared underline follows the active desktop navigation link.
        if (nav) {
          const links = Array.from(nav.querySelectorAll<HTMLElement>("a"));
          const indicator = document.createElement("span");
          indicator.setAttribute("aria-hidden", "true");
          Object.assign(indicator.style, {
            position: "absolute",
            left: "0",
            bottom: "4px",
            height: "2px",
            width: "0",
            borderRadius: "999px",
            background: "var(--ep-accent)",
            pointerEvents: "none",
            opacity: "0",
          });
          nav.style.position = "relative";
          nav.appendChild(indicator);

          const moveIndicator = (link: HTMLElement) => {
            const navRect = nav.getBoundingClientRect();
            const linkRect = link.getBoundingClientRect();
            gsap.to(indicator, {
              x: linkRect.left - navRect.left,
              width: linkRect.width,
              opacity: 1,
              duration: .32,
              ease: "power3.out",
              overwrite: "auto",
            });
          };
          const active = links.find((link) => link.getAttribute("aria-current") === "page");
          if (active) moveIndicator(active);

          links.forEach((link) => {
            const enter = () => {
              moveIndicator(link);
              const icon = link.querySelector<SVGElement>("svg");
              if (icon) animeRuns.push(animate(icon, {
                translateY: [-2, 0],
                scale: [0.9, 1.08, 1],
                duration: 360,
                ease: "outBack(1.7)",
              }));
            };
            const leave = () => {
              const current = links.find((item) => item.getAttribute("aria-current") === "page");
              if (current) moveIndicator(current);
              else gsap.to(indicator, { opacity: 0, duration: .2 });
            };
            link.addEventListener("pointerenter", enter);
            link.addEventListener("pointerleave", leave);
            cleanups.push(() => {
              link.removeEventListener("pointerenter", enter);
              link.removeEventListener("pointerleave", leave);
            });
          });
          cleanups.push(() => indicator.remove());
        }

        // Mobile navigation items enter in sequence whenever the menu opens.
        const menuButton = header?.querySelector<HTMLElement>('button[aria-controls="mobile-nav-panel"]');
        const mobilePanel = root.querySelector<HTMLElement>("#mobile-nav-panel");
        if (menuButton && mobilePanel) {
          const playMenu = () => {
            if (menuButton.getAttribute("aria-expanded") !== "true") return;
            const items = mobilePanel.querySelectorAll<HTMLElement>("li");
            gsap.fromTo(items,
              { x: -14, opacity: .35 },
              { x: 0, opacity: 1, duration: .38, stagger: .065, ease: "power3.out", clearProps: "transform,opacity" }
            );
            const links = mobilePanel.querySelectorAll<HTMLElement>("a");
            links.forEach((link, index) => {
              const icon = link.querySelector<SVGElement>("svg");
              if (icon) animeRuns.push(animate(icon, {
                scale: [0.7, 1],
                rotate: [-8, 0],
                delay: index * 55,
                duration: 420,
                ease: "outElastic(1,.65)",
              }));
            });
          };
          const observer = new MutationObserver(playMenu);
          observer.observe(menuButton, { attributes: true, attributeFilter: ["aria-expanded"] });
          cleanups.push(() => observer.disconnect());
        }

        // Public page content receives a restrained route-entry lift.
        const main = root.querySelector<HTMLElement>("main");
        if (main) gsap.fromTo(main,
          { y: 10 },
          { y: 0, duration: .62, ease: "power3.out", clearProps: "transform" }
        );

        // Footer groups and links animate only as they enter view.
        const footer = root.querySelector<HTMLElement>("[data-site-footer]");
        const groups = footer?.querySelectorAll<HTMLElement>(".grid > div");
        if (footer && groups?.length) {
          gsap.from(groups, {
            y: 22,
            duration: .68,
            stagger: .11,
            ease: "power3.out",
            scrollTrigger: { trigger: footer, start: "top 90%", once: true },
          });
          const links = footer.querySelectorAll<HTMLElement>("a");
          links.forEach((link) => {
            const enter = () => gsap.to(link, { x: 4, duration: .2, ease: "power2.out", overwrite: "auto" });
            const leave = () => gsap.to(link, { x: 0, duration: .25, ease: "power2.out", overwrite: "auto" });
            link.addEventListener("pointerenter", enter);
            link.addEventListener("pointerleave", leave);
            cleanups.push(() => {
              link.removeEventListener("pointerenter", enter);
              link.removeEventListener("pointerleave", leave);
            });
          });
          const marks = footer.querySelectorAll<SVGElement>("svg");
          if (marks.length) {
            const observer = new IntersectionObserver((entries) => {
              if (!entries.some((entry) => entry.isIntersecting)) return;
              animeRuns.push(animate(marks, {
                scale: [0.84, 1],
                rotate: [-5, 0],
                delay: stagger(45),
                duration: 480,
                ease: "outBack(1.6)",
              }));
              observer.disconnect();
            }, { threshold: .2 });
            observer.observe(footer);
            cleanups.push(() => observer.disconnect());
          }
        }

        // Buttons get a small GSAP lift, with pointer movement kept separate
        // from the page-specific card hover effects.
        if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
          root.querySelectorAll<HTMLElement>("main a, main button").forEach((control) => {
            if (control.closest("[data-hover-lift]")) return;
            const enter = () => gsap.to(control, { y: -2, duration: .2, ease: "power2.out", overwrite: "auto" });
            const leave = () => gsap.to(control, { y: 0, duration: .25, ease: "power2.out", overwrite: "auto" });
            control.addEventListener("pointerenter", enter);
            control.addEventListener("pointerleave", leave);
            cleanups.push(() => {
              control.removeEventListener("pointerenter", enter);
              control.removeEventListener("pointerleave", leave);
            });
          });
        }
      }, root);

      return () => {
        cleanups.forEach((cleanup) => cleanup());
        animeRuns.forEach((run) => run.revert());
        ctx.revert();
      };
    });

    return () => mm.revert();
  }, []);

  return null;
}
