import { useLayoutEffect } from "react";
import gsap from "gsap";
import { animate, stagger } from "animejs";
import { MOTION_ALLOWED_QUERY, registerMotionPlugins } from "./motionRuntime";



/**
 * Shared motion for the public-site chrome. Page-specific motion components
 * continue to own their sections; this component owns navigation, mobile
 * menu choreography, footer details, and route-entry polish.
 */
export function PublicChromeMotion() {
  useLayoutEffect(() => {
    registerMotionPlugins();
    const root = document.querySelector<HTMLElement>(".ep-landing");
    if (!root) return;

    const mm = gsap.matchMedia();
    mm.add(MOTION_ALLOWED_QUERY, () => {
      const cleanups: Array<() => void> = [];
      const animeRuns: Array<{ revert: () => unknown }> = [];
      const ctx = gsap.context(() => {
        const header = root.querySelector<HTMLElement>("#site-header");
        const nav = header?.querySelector<HTMLElement>('nav[aria-label="Primary navigation"]');

        // The active pill is the sole active-state indicator; no extra underline.
        if (nav) {
          const links = Array.from(nav.querySelectorAll<HTMLElement>("a"));
          // Nav enters as a compact, staggered control group.
          gsap.fromTo(links,
            { y: -9, opacity: 0, scale: .96 },
            { y: 0, opacity: 1, scale: 1, duration: .48, stagger: .075, ease: "power3.out", delay: .08, clearProps: "transform,opacity" }
          );

          links.forEach((link) => {
            const enter = () => {
              gsap.to(link, {
                y: -2,
                scale: 1.035,
                backgroundColor: "var(--ep-tint)",
                duration: .22,
                ease: "power2.out",
                overwrite: "auto",
              });
              const icon = link.querySelector<SVGElement>("svg");
              if (icon) animeRuns.push(animate(icon, {
                translateY: [-2, 0],
                scale: [0.9, 1.08, 1],
                duration: 360,
                ease: "outBack(1.7)",
              }));
            };
            const leave = () => {
              gsap.to(link, {
                y: 0,
                scale: 1,
                backgroundColor: link.getAttribute("aria-current") === "page" ? "var(--ep-accent)" : "transparent",
                duration: .26,
                ease: "power2.out",
                overwrite: "auto",
              });
            };
            link.addEventListener("pointerenter", enter);
            link.addEventListener("pointerleave", leave);
            cleanups.push(() => {
              link.removeEventListener("pointerenter", enter);
              link.removeEventListener("pointerleave", leave);
            });
          });
          cleanups.push(() => {
            gsap.killTweensOf(links);
          });
        }

        // Header actions receive small, tactile feedback without changing layout.
        const themeButton = header?.querySelector<HTMLElement>('button[role="switch"]');
        if (themeButton) {
          const icon = themeButton.querySelector<SVGElement>("svg");
          const onThemeClick = () => {
            if (icon) animeRuns.push(animate(icon, {
              rotate: [-180, 0],
              scale: [0.72, 1],
              duration: 520,
              ease: "outBack(1.7)",
              // anime.js leaves its last transform inline; clear it so the icon rests unrotated.
              onComplete: () => { icon.style.transform = ""; },
            }));
            gsap.fromTo(themeButton,
              { scale: .92 },
              { scale: 1, duration: .42, ease: "elastic.out(1,.55)", overwrite: "auto" }
            );
          };
          themeButton.addEventListener("click", onThemeClick);
          cleanups.push(() => themeButton.removeEventListener("click", onThemeClick));
        }

        // Keep the menu glyph upright when opening the drawer.
        // The drawer itself animates; rotating the three-line menu icon made
        // it appear tilted after the button was clicked.

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

        // Premium pointer interactions: small magnetic pull on primary actions,
        // plus restrained image zoom. Keep these effects desktop-only and local
        // to the hovered element so page/card transforms retain ownership.
        const finePointer = window.matchMedia("(hover: hover) and (pointer: fine) and (min-width: 768px)");
        if (finePointer.matches && main) {
          const magneticTargets = main.querySelectorAll<HTMLElement>(
            '[data-band] a, [data-contact-form] button[type="submit"]'
          );
          magneticTargets.forEach((target) => {
            const moveX = gsap.quickTo(target, "x", { duration: .38, ease: "power3.out", overwrite: "auto" });
            const moveY = gsap.quickTo(target, "y", { duration: .38, ease: "power3.out", overwrite: "auto" });
            const onMove = (event: PointerEvent) => {
              const rect = target.getBoundingClientRect();
              const dx = (event.clientX - rect.left - rect.width / 2) / Math.max(rect.width / 2, 1);
              const dy = (event.clientY - rect.top - rect.height / 2) / Math.max(rect.height / 2, 1);
              moveX(dx * 5);
              moveY(dy * 4 - 2);
            };
            const reset = () => { moveX(0); moveY(0); };
            target.addEventListener("pointermove", onMove);
            target.addEventListener("pointerleave", reset);
            target.addEventListener("pointercancel", reset);
            cleanups.push(() => {
              target.removeEventListener("pointermove", onMove);
              target.removeEventListener("pointerleave", reset);
              target.removeEventListener("pointercancel", reset);
              gsap.killTweensOf(target, "x,y");
            });
          });

          main.querySelectorAll<HTMLImageElement>("img").forEach((img) => {
            const enter = () => gsap.to(img, {
              scale: 1.045, duration: .65, ease: "power3.out", overwrite: "auto",
            });
            const leave = () => gsap.to(img, {
              scale: 1, duration: .75, ease: "power3.out", overwrite: "auto",
            });
            img.addEventListener("pointerenter", enter);
            img.addEventListener("pointerleave", leave);
            cleanups.push(() => {
              img.removeEventListener("pointerenter", enter);
              img.removeEventListener("pointerleave", leave);
              gsap.killTweensOf(img);
              gsap.set(img, { clearProps: "transform" });
            });
          });
        }

        // Page-specific motion components own main controls and card transforms.
        // This shared layer intentionally avoids competing transform tweens.

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
