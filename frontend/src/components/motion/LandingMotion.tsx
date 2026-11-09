import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { bindPublicHoverMotion } from "./PublicHoverMotion";
import { animate, stagger } from "animejs";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { HeroEnhance } from "./HeroEnhance";

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

// Water surfaces on a 100x100 viewBox stretched over the screen. Every path
// has the same command structure (M, C, C, V, H, z) so MorphSVG can
// interpolate cleanly. "covered" and "gone" keep the whole wave off-screen.
const WATER_INTRO_KEY = "ep-water-intro-seen";

/**
 * GSAP motion for the landing page. Renders the underwater intro overlay,
 * then finds its other targets in the DOM by the structure LandingPage
 * already has. Only runs when the user has not asked for reduced motion.
 */
export function LandingMotion() {
  useLayoutEffect(() => {
    const mm = gsap.matchMedia();
    let cancelled = false;
    // Google Fonts (Lexend/Inter) swap in after first paint and reflow the
    // text, which shifts every scroll trigger's start position. Re-measure
    // once they are ready.
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => {
        if (!cancelled) ScrollTrigger.refresh();
      });
    }

    // SMOOTH SCROLL: normalize touch/inertial scrolling with GSAP.
    // ScrollSmoother is a paid plugin, so this uses the free ScrollTrigger
    // normalizer and ScrollToPlugin already included with GSAP.
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      // Keep native wheel/touch scrolling responsive. GSAP is used only
      // for deliberate in-page anchor navigation, not to intercept every wheel event.
      const anchorLinks = gsap.utils.toArray<HTMLAnchorElement>(
        'a[href^="#"]:not([href="#"])'
      );
      const handlers: Array<() => void> = [];

      anchorLinks.forEach((link) => {
        const handleClick = (event: MouseEvent) => {
          const href = link.getAttribute("href");
          if (
            !href ||
            event.defaultPrevented ||
            event.button !== 0 ||
            event.metaKey ||
            event.ctrlKey ||
            event.shiftKey ||
            event.altKey ||
            link.target === "_blank" ||
            link.hasAttribute("download")
          ) return;
          const targetId = href.startsWith("#") ? decodeURIComponent(href.slice(1)) : "";
          if (!targetId) return;
          const target = document.getElementById(targetId);
          if (!target) return;

          event.preventDefault();
          gsap.to(window, {
            duration: 1.05,
            ease: "power3.inOut",
            overwrite: "auto",
            scrollTo: {
              y: target,
              offsetY: 84,
              autoKill: true,
            },
            onComplete: () => {
              history.replaceState(null, "", href);
            },
          });
        };

        link.addEventListener("click", handleClick);
        handlers.push(() => link.removeEventListener("click", handleClick));
      });

      return () => {
        handlers.forEach((cleanup) => cleanup());
        gsap.killTweensOf(window);
      };
    });

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      // HERO INTRO: target the real data attributes in LandingPage.
      // The old grid-column selector no longer matched after the hero layout
      // changed to a centered single-column composition.
      const hero = document.querySelector<HTMLElement>("#top");
      const heroText = hero?.querySelector<HTMLElement>("[data-hero=text]");
      const eyebrow = heroText?.querySelector<HTMLElement>("p:first-child");
      const headline = heroText?.querySelector<HTMLElement>("[data-hero=headline]");
      const lead = heroText?.querySelector<HTMLElement>("[data-hero=lead]");
      const actions = heroText?.querySelector<HTMLElement>("[data-hero=cta]");

      // Match the About and Contact hero choreography exactly: one restrained
      // staggered lift-and-fade, with the same timing and easing on every page.
      if (heroText) {
        const intro = gsap.timeline({
          defaults: { ease: "power4.out" },
          delay: 0.12,
        });
        if (eyebrow) intro.from(eyebrow, {
          y: 22, autoAlpha: 0, scale: .96, duration: .65,
        });
        if (headline) intro.from(headline, {
          y: 38, rotateX: -8, transformPerspective: 1000,
          autoAlpha: 0, duration: .9,
        }, "-=.28");
        if (lead) intro.from(lead, {
          y: 20, autoAlpha: 0, duration: .7,
        }, "-=.42");
        if (actions) intro.from(actions, {
          y: 18, autoAlpha: 0, scale: .98, duration: .58,
        }, "-=.38");
      }

      // READINGS: each reading rises in, then its bar fills while its
      // number counts up from 0.
      const readings = '[aria-labelledby="readings-title"]';
      const readingsTl = gsap.timeline({
        defaults: { ease: "power3.out" },
        scrollTrigger: { trigger: readings, start: "top 75%", once: true },
      });

      readingsTl
        .from(`${readings} dl > div`, {
          y: 24,
          duration: 0.6,
          stagger: 0.08,
        })
        .addLabel("fill", "-=0.4")
        .from(
          `${readings} dl [aria-hidden="true"] > div`,
          {
            scaleX: 0,
            transformOrigin: "left center",
            duration: 0.9,
            stagger: 0.08,
          },
          "fill"
        );

      // The number is the first text node inside each <dd> (the unit is a
      // <span> after it). Keep the original decimals: "6.2" stays one
      // decimal, "15" stays whole. Originals are restored on cleanup so a
      // re-run (React strict mode) starts from the real value.
      const restores: Array<() => void> = [];
      document
        .querySelectorAll<HTMLElement>(`${readings} dl dd`)
        .forEach((dd, i) => {
          const node = dd.firstChild;
          if (!node || node.nodeType !== Node.TEXT_NODE) return;
          const original = node.nodeValue ?? "";
          const target = parseFloat(original);
          if (!Number.isFinite(target)) return;
          const decimals = (original.trim().split(".")[1] ?? "").length;

          const counter = { value: 0 };
          node.nodeValue = (0).toFixed(decimals);
          restores.push(() => {
            node.nodeValue = original;
          });

          readingsTl.to(
            counter,
            {
              value: target,
              duration: 1.2,
              ease: "power2.out",
              onUpdate: () => {
                node.nodeValue = counter.value.toFixed(decimals);
              },
              onComplete: () => {
                node.nodeValue = original;
              },
            },
            `fill+=${i * 0.08}`
          );
        });

      // The dashboard preview has its own heading, sample KPI cards and CSS chart bars below.

      const hoverCleanups: Array<() => void> = [];
      const microAnimations: Array<{ revert: () => unknown }> = [];

      // HOME micro-interactions: Anime.js handles icon/button details while
      // GSAP owns scroll reveals and card elevation. Keep those transforms separate.
      const homeRoot = document.querySelector<HTMLElement>(".ep-landing:not(.ep-about-page):not(.ep-contact-page)");
      if (homeRoot) {
        homeRoot.querySelectorAll<HTMLElement>("#top [data-hero=cta] a, #top [data-hero=cta] button").forEach((control) => {
          const icon = control.querySelector<HTMLElement>("svg");
          // GSAP owns the subtle magnetic x/y offset; Anime.js owns the
          // icon reaction and small hover lift, so the transform channels do not compete.
          const magnetX = gsap.quickTo(control, "x", { duration: .36, ease: "power3.out", overwrite: "auto" });
          const magnetY = gsap.quickTo(control, "y", { duration: .36, ease: "power3.out", overwrite: "auto" });
          const move = (event: PointerEvent) => {
            const rect = control.getBoundingClientRect();
            magnetX(((event.clientX - rect.left - rect.width / 2) / Math.max(rect.width / 2, 1)) * 5);
            magnetY(((event.clientY - rect.top - rect.height / 2) / Math.max(rect.height / 2, 1)) * 4);
          };
          const resetMagnet = () => { magnetX(0); magnetY(0); };
          const enter = () => {
            microAnimations.push(animate(control, {
              scale: 1.025, duration: 230, ease: "out(3)",
            }));
            if (icon) microAnimations.push(animate(icon, {
              translateX: 3, duration: 260, ease: "out(3)",
            }));
          };
          const leave = () => {
            microAnimations.push(animate(control, {
              scale: 1, duration: 300, ease: "out(3)",
            }));
            if (icon) microAnimations.push(animate(icon, {
              translateX: 0, duration: 280, ease: "out(3)",
            }));
          };
          control.addEventListener("mouseenter", enter);
          control.addEventListener("mouseleave", leave);
          control.addEventListener("focusin", enter);
          control.addEventListener("focusout", leave);
          control.addEventListener("pointermove", move);
          control.addEventListener("pointerleave", resetMagnet);
          hoverCleanups.push(() => {
            control.removeEventListener("mouseenter", enter);
            control.removeEventListener("mouseleave", leave);
            control.removeEventListener("focusin", enter);
            control.removeEventListener("focusout", leave);
            control.removeEventListener("pointermove", move);
            control.removeEventListener("pointerleave", resetMagnet);
            gsap.killTweensOf(control, "x,y");
          });
        });

        homeRoot.querySelectorAll<HTMLElement>("[data-reading], #process ol > li, .ep-stats-panel > div").forEach((card) => {
          const icon = card.querySelector<HTMLElement>("svg");
          const enter = () => {
            if (icon) microAnimations.push(animate(icon, {
              scale: [1, 1.13, 1], rotate: [0, -5, 0], duration: 420, ease: "out(3)",
            }));
          };
          card.addEventListener("mouseenter", enter);
          card.addEventListener("focusin", enter);
          hoverCleanups.push(() => {
            card.removeEventListener("mouseenter", enter);
            card.removeEventListener("focusin", enter);
          });
        });

        homeRoot.querySelectorAll<HTMLElement>("#site-header nav a, [data-site-footer] nav a").forEach((link) => {
          const enter = () => microAnimations.push(animate(link, {
            translateX: 3, duration: 200, ease: "out(3)",
          }));
          const leave = () => microAnimations.push(animate(link, {
            translateX: 0, duration: 240, ease: "out(3)",
          }));
          link.addEventListener("mouseenter", enter);
          link.addEventListener("mouseleave", leave);
          hoverCleanups.push(() => {
            link.removeEventListener("mouseenter", enter);
            link.removeEventListener("mouseleave", leave);
          });
        });
      }

      // Keep the hero background and hero copy anchored during page scroll.
      // No scroll-scrubbed transforms are applied to the hero atmosphere.

      // Scroll-linked section headings: masked upward reveal with a subtle
      // accent underline that draws as each section reaches the viewport.
      ["#readings-title", "#process h2"].forEach((selector) => {
        const heading = document.querySelector<HTMLElement>(selector);
        if (!heading) return;
        const underline = heading.parentElement?.querySelector<HTMLElement>("[data-heading-accent]");
        gsap.from(heading, {
          y: 46, clipPath: "inset(0 0 100% 0)",
          duration: .95, ease: "power4.out",
          scrollTrigger: { trigger: heading, start: "top 84%", once: true },
        });
        if (underline) gsap.fromTo(underline,
          { scaleX: 0, transformOrigin: "left center" },
          { scaleX: 1, duration: .8, ease: "power3.out",
            scrollTrigger: { trigger: heading, start: "top 80%", once: true } }
        );
      });

      //      // SECTION FLOW: reveal supporting sections with a restrained,
      // consistent lift-and-fade as they enter the viewport.
      const sectionReveals = [
        {
          trigger: '[aria-label="EcoPrawn at a glance"]',
          targets: '[aria-label="EcoPrawn at a glance"] > div > div',
          y: 18,
          stagger: 0.08,
        },
        {
          trigger: "#capabilities",
          targets: "#capabilities [data-business-card]",
          y: 26,
          stagger: 0.12,
        },
        {
          trigger: "#process",
          targets: "#process [data-process-track] > li",
          y: 22,
          stagger: 0.1,
        },
        {
          trigger: "[data-band]",
          targets: "[data-band] > div",
          y: 24,
          stagger: 0.12,
        },
        {
          trigger: "[data-site-footer]",
          targets: "[data-site-footer] .mx-auto > div",
          y: 16,
          stagger: 0.1,
        },
      ];

      sectionReveals.forEach(({ trigger, targets, y, stagger }) => {
        const section = document.querySelector<HTMLElement>(trigger);
        const items = gsap.utils.toArray<HTMLElement>(targets);
        if (!section || !items.length) return;
        gsap.from(items, {
          y,
          autoAlpha: 0,
          duration: 0.75,
          stagger,
          ease: "power3.out",
          clearProps: "all",
          scrollTrigger: {
            trigger: section,
            start: "top 82%",
            once: true,
          },
        });
      });

      // Give the CTA a soft hover response without changing its layout.
      const ctaBand = document.querySelector<HTMLElement>("[data-band]");
      if (ctaBand) {
        const enter = () =>
          gsap.to(ctaBand, {
            y: -3,
            boxShadow: "0 24px 55px -32px rgba(11,46,51,.55)",
            duration: 0.35,
            ease: "power2.out",
            overwrite: "auto",
          });
        const leave = () =>
          gsap.to(ctaBand, {
            y: 0,
            boxShadow: "0 12px 32px -24px rgba(11,46,51,.35)",
            duration: 0.45,
            ease: "power2.out",
            overwrite: "auto",
          });
        ctaBand.addEventListener("mouseenter", enter);
        ctaBand.addEventListener("mouseleave", leave);
        hoverCleanups.push(() => {
          ctaBand.removeEventListener("mouseenter", enter);
          ctaBand.removeEventListener("mouseleave", leave);
        });
      }

      // Process cards are driven by the horizontal pinned timeline on
      // desktop. Do not attach vertical ScrollTriggers to the same cards:
      // those triggers fire at the wrong time while the track is translated.
      // On smaller screens the list stays stacked and uses CSS-only presentation.

      // Keep every landing-page section surface in its natural position.
      // One-time reveal effects remain, but section backgrounds/content do not drift.

      // Anime.js handles icon personality across all Home sections.
      // Each icon animates once as it enters view; hover listeners below can
      // then provide a separate, short response.
      const homeIcons = homeRoot?.querySelectorAll<HTMLElement>("main svg");
      let homeIconObserver: IntersectionObserver | undefined;
      if (homeIcons?.length) {
        homeIconObserver = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const icon = entry.target as HTMLElement;
            microAnimations.push(animate(icon, {
              scale: [.72, 1], rotate: [-12, 0], opacity: [0, 1],
              duration: 620, ease: "outElastic(1,.6)",
            }));
            homeIconObserver?.unobserve(icon);
          });
        }, { threshold: .3 });
        homeIcons.forEach((icon) => homeIconObserver?.observe(icon));
      }

      // Animate small decorative marks with a soft stagger as the hero arrives.
      const crosses = homeRoot?.querySelectorAll<HTMLElement>("[data-cross]");
      if (crosses?.length) {
        microAnimations.push(animate(crosses, {
          opacity: [.12, .55, .18], scale: [.65, 1.15, 1],
          delay: stagger(90), duration: 1100, ease: "inOutSine",
        }));
      }

      // Animate section-specific labels and markers with Anime.js as they enter.
      // The existing GSAP timelines continue to own the larger card/section motion.
      const homeAccents = homeRoot?.querySelectorAll<HTMLElement>(
        "main section [aria-hidden='true'].h-2, main section [data-step-node], main section [data-live-ping]"
      );
      let homeAccentObserver: IntersectionObserver | undefined;
      if (homeAccents?.length) {
        homeAccentObserver = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const accent = entry.target as HTMLElement;
            microAnimations.push(animate(accent, {
              scale: [0.65, 1.18, 1],
              opacity: [0.55, 1],
              duration: 580,
              ease: "outElastic(1,.6)",
            }));
            homeAccentObserver?.unobserve(accent);
          });
        }, { threshold: 0.35 });
        homeAccents.forEach((accent) => homeAccentObserver?.observe(accent));
      }

      // Consistent GSAP hover treatment for remaining Home section surfaces.
      // Skip elements already handled by the richer data-hover-lift interaction.
      const homeSurfaces = gsap.utils.toArray<HTMLElement>(
        ".ep-stats-panel > div, [data-band], [data-site-footer] .grid > div"
      ).filter((el) => !el.matches("[data-hover-lift]"));
      homeSurfaces.forEach((surface) => {
        const enter = () => gsap.to(surface, {
          y: -6, scale: 1.012,
          borderColor: "var(--ep-accent)",
          boxShadow: "0 24px 52px -34px rgba(7,42,48,.48)",
          duration: .3, ease: "power3.out", overwrite: "auto",
        });
        const leave = () => gsap.to(surface, {
          y: 0, scale: 1,
          borderColor: "var(--ep-line)",
          boxShadow: "0 12px 28px -24px rgba(11,46,51,.25)",
          duration: .42, ease: "power3.out", overwrite: "auto",
        });
        surface.addEventListener("pointerenter", enter);
        surface.addEventListener("pointerleave", leave);
        hoverCleanups.push(() => {
          surface.removeEventListener("pointerenter", enter);
          surface.removeEventListener("pointerleave", leave);
        });
      });

      // Data cards and process steps use a restrained lift on hover.
      // Their surfaces remain flat; the hero lens keeps its own 3D motion.
      gsap.utils.toArray<HTMLElement>("[data-hover-lift]").forEach((el) => {
        const icon = el.querySelector<HTMLElement>("svg");
        const enter = () => {
          gsap.to(el, {
            y: -6, scale: 1.012,
            boxShadow: "0 24px 52px -32px rgba(7,42,48,.38)",
            duration: .3, ease: "power3.out", overwrite: "auto",
          });
          if (icon) animate(icon, {
            scale: [1, 1.14, 1], rotate: [0, -8, 5, 0],
            duration: 540, ease: "outElastic(1,.6)",
          });
        };
        const leave = () => gsap.to(el, {
          y: 0, scale: 1,
          boxShadow: "0 12px 28px -24px rgba(11,46,51,.25)",
          duration: .45, ease: "power3.out", overwrite: "auto",
        });
        el.addEventListener("mouseenter", enter);
        el.addEventListener("mouseleave", leave);
        el.addEventListener("focusin", enter);
        el.addEventListener("focusout", leave);
        hoverCleanups.push(() => {
          el.removeEventListener("mouseenter", enter);
          el.removeEventListener("mouseleave", leave);
          el.removeEventListener("focusin", enter);
          el.removeEventListener("focusout", leave);
        });
      });

      const cleanupSharedHover = homeRoot ? bindPublicHoverMotion(homeRoot) : () => {};

      return () => {
        cleanupSharedHover();
        restores.forEach((restore) => restore());
        hoverCleanups.forEach((cleanup) => cleanup());
        microAnimations.forEach((animation) => animation.revert());
        homeIconObserver?.disconnect();
        homeAccentObserver?.disconnect();
      };
    });

    // PROCESS: the four stages remain in a natural, responsive grid.

    // HERO DEPTH: keep the lens figure free of competing transforms.
    // Its internal rings and glare are scroll-linked inside HeroLens.

    // MORE SCROLL EFFECTS
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      // Keep hero copy and all section surfaces stationary relative to their
      // own layout while scrolling. Only one-time entrance reveals remain.

      // The readings heading already has a single masked reveal above.
      // Avoid a second GSAP tween on the same heading/paragraph transforms.

      // Dashboard preview: animate the real heading, sample KPI tiles and CSS chart bars.
      const dashboardPreview = document.querySelector<HTMLElement>("#dashboard-preview");
      const previewHeading = dashboardPreview?.querySelector<HTMLElement>("#dashboard-preview-title");
      const previewLead = previewHeading?.nextElementSibling as HTMLElement | null;
      if (previewHeading) {
        gsap.from([previewHeading, ...(previewLead ? [previewLead] : [])], {
          y: 22,
          autoAlpha: 0,
          duration: 0.68,
          stagger: 0.1,
          ease: "power3.out",
          clearProps: "all",
          scrollTrigger: {
            trigger: previewHeading,
            start: "top 84%",
            once: true,
          },
        });
      }

      const previewReadings = dashboardPreview?.querySelectorAll<HTMLElement>(
        ".ep-dashboard-preview-window > .grid > div"
      );
      if (previewReadings?.length) {
        gsap.from(previewReadings, {
          y: 18,
          autoAlpha: 0,
          duration: 0.52,
          stagger: 0.09,
          ease: "power3.out",
          clearProps: "all",
          scrollTrigger: {
            trigger: previewReadings[0],
            start: "top 88%",
            once: true,
          },
        });
      }

      const previewBars = dashboardPreview?.querySelectorAll<HTMLElement>(
        ".ep-preview-chart > span"
      );
      if (previewBars?.length) {
        gsap.from(previewBars, {
          scaleY: 0,
          transformOrigin: "bottom",
          duration: 0.7,
          stagger: 0.045,
          ease: "power3.out",
          clearProps: "transform",
          scrollTrigger: {
            trigger: ".ep-preview-chart",
            start: "top 88%",
            once: true,
          },
        });
      }
    });


    return () => {
      cancelled = true;
      mm.revert();
    };
  }, []);

  return <HeroEnhance />;
}
