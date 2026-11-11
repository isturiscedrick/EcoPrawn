import { useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { bindPublicHoverMotion } from "./PublicHoverMotion";
import { animate, stagger } from "animejs";
import { HeroEnhance } from "./HeroEnhance";
import { MOTION_ALLOWED_QUERY, registerMotionPlugins } from "./motionRuntime";



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
    registerMotionPlugins();
    const mm = gsap.matchMedia();
    let cancelled = false;
    let previewTabCleanup: (() => void) | undefined;
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
    mm.add(MOTION_ALLOWED_QUERY, () => {
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

    mm.add(MOTION_ALLOWED_QUERY, () => {
      // HERO INTRO: target the real data attributes in LandingPage.
      // The old grid-column selector no longer matched after the hero layout
      // changed to a centered single-column composition.
      const hero = document.querySelector<HTMLElement>("#top");
      const heroText = hero?.querySelector<HTMLElement>("[data-hero=text]");
      const eyebrow = heroText?.querySelector<HTMLElement>("p:first-child");
      const headline = heroText?.querySelector<HTMLElement>("[data-hero=headline]");
      const lead = heroText?.querySelector<HTMLElement>("[data-hero=lead]");
      const actions = heroText?.querySelector<HTMLElement>("[data-hero=cta]");

      // Hero choreography: copy arrives first, followed by the water
      // monitoring console and its individual sensor tiles.
      const monitorPanel = hero?.querySelector<HTMLElement>("[data-hero=monitor-panel]");
      if (heroText || monitorPanel) {
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
        if (monitorPanel) {
          gsap.set(monitorPanel, { transformPerspective: 1200, transformStyle: "preserve-3d" });
          intro.from(monitorPanel, {
            x: 42, y: 24, rotateY: 7, autoAlpha: 0,
            duration: 1.05, ease: "power4.out",
          }, "-=.68");
          const sensorTiles = monitorPanel.querySelectorAll<HTMLElement>(".ep-hero-sensor-tile");
          if (sensorTiles.length) intro.from(sensorTiles, {
            y: 16, scale: .96, autoAlpha: 0,
            duration: .62, stagger: .085, ease: "power3.out",
          }, "-=.62");
        }
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

      const homeRoot = document.querySelector<HTMLElement>(
        ".ep-landing:not(.ep-about-page):not(.ep-contact-page)"
      );
      const microAnimations: Array<{ revert: () => unknown }> = [];

      // Keep the hero background and hero copy anchored during page scroll.
      // No scroll-scrubbed transforms are applied to the hero atmosphere.

      // Scroll-linked section headings: masked upward reveal with a subtle
      // accent underline that draws as each section reaches the viewport.
      ["#readings-title", "#capabilities-title", "#process h2"].forEach((selector) => {
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
          trigger: '[aria-label="Connected EcoPrawn capabilities"]',
          targets: '[aria-label="Connected EcoPrawn capabilities"] .ep-platform-ribbon-item',
          y: 14,
          stagger: 0.1,
        },
        {
          trigger: '[aria-label="EcoPrawn at a glance"]',
          targets: '.ep-stats-panel > div',
          y: 18,
          stagger: 0.08,
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

      // Process cards are driven by the horizontal pinned timeline on
      // desktop. Do not attach vertical ScrollTriggers to the same cards:
      // those triggers fire at the wrong time while the track is translated.
      // On smaller screens the list stays stacked and uses CSS-only presentation.

      // Keep every landing-page section surface in its natural position.
      // One-time reveal effects remain, but section backgrounds/content do not drift.

      // Capability-card detail rows receive a small secondary reveal after
      // their parent cards enter view. Keep this separate from GSAP's card motion.
      const capabilityDetails = homeRoot?.querySelectorAll<HTMLElement>(
        "#capabilities [data-capability-detail]"
      );
      let capabilityDetailObserver: IntersectionObserver | undefined;
      if (capabilityDetails?.length) {
        capabilityDetailObserver = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const detail = entry.target as HTMLElement;
            microAnimations.push(animate(detail, {
              opacity: [0, 1],
              translateY: [8, 0],
              duration: 520,
              ease: "out(3)",
            }));
            capabilityDetailObserver?.unobserve(detail);
          });
        }, { threshold: 0.4 });
        capabilityDetails.forEach((detail) => capabilityDetailObserver?.observe(detail));
      }

      // Anime.js handles icon personality across all Home sections.
      // Each icon animates once as it enters view; hover listeners below can
      // then provide a separate, short response.
      const homeIcons = homeRoot?.querySelectorAll<HTMLElement>("#capabilities [data-business-card] > span:first-child svg, #dashboard-preview-window svg");
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

      const cleanupSharedHover = homeRoot ? bindPublicHoverMotion(homeRoot) : () => {};

      return () => {
        cleanupSharedHover();
        restores.forEach((restore) => restore());
        microAnimations.forEach((animation) => animation.revert());
        homeIconObserver?.disconnect();
        homeAccentObserver?.disconnect();
        capabilityDetailObserver?.disconnect();
      };
    });

    // HERO + WATER DEPTH: restrained scrubbed movement on desktop only.
    // These transforms belong exclusively to decorative background layers;
    // content, cards, and the monitoring panel keep their own motion owners.
    mm.add(
      `(min-width: 1024px) and ${MOTION_ALLOWED_QUERY}`,
      () => {
        const hero = document.querySelector<HTMLElement>("#top");
        if (hero) {
          const grid = hero.querySelector<HTMLElement>('[data-hero="grid"]');
          const atmosphere = hero.querySelector<HTMLElement>(".ep-hero-atmosphere");
          const specks = hero.querySelectorAll<HTMLElement>(".ep-hero-speck");
          if (grid) gsap.to(grid, {
            yPercent: 12,
            ease: "none",
            scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: 1.1 },
          });
          if (atmosphere) gsap.to(atmosphere, {
            yPercent: 7,
            scale: 1.035,
            ease: "none",
            scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: 1.35 },
          });
          if (specks) gsap.to(specks, {
            yPercent: -8,
            ease: "none",
            scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: 1.5 },
          });
        }

        const readings = document.querySelector<HTMLElement>("#readings");
        const readingsBackdrop = readings?.querySelector<HTMLElement>("[data-readings-bg]");
        if (readings && readingsBackdrop) gsap.to(readingsBackdrop, {
          yPercent: 5,
          ease: "none",
          scrollTrigger: { trigger: readings, start: "top bottom", end: "bottom top", scrub: 1.2 },
        });
      }
    );

    // Dashboard preview tabs retain their React state and accessibility.
    // Animate the panel once when the selected tab changes; the observer is
    // disconnected with this effect so route changes cannot leave stale work.
    const previewPanel = document.querySelector<HTMLElement>(
      "#dashboard-preview .ep-preview-tab-panel"
    );
    const tabList = previewPanel?.previousElementSibling;
    if (previewPanel && tabList && window.matchMedia(MOTION_ALLOWED_QUERY).matches) {
      let previousTab = tabList.querySelector<HTMLElement>('[aria-pressed="true"]')?.textContent?.trim();
      const tabObserver = new MutationObserver(() => {
        const selected = tabList.querySelector<HTMLElement>('[aria-pressed="true"]');
        const nextTab = selected?.textContent?.trim();
        if (!nextTab || nextTab === previousTab) return;
        previousTab = nextTab;
        const content = Array.from(previewPanel.children) as HTMLElement[];
        if (content.length) gsap.fromTo(content,
          { y: 12, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.46,
            stagger: 0.055,
            ease: "power3.out",
            clearProps: "transform,opacity,visibility",
            overwrite: "auto",
          }
        );
      });
      tabObserver.observe(tabList, {
        subtree: true,
        attributes: true,
        attributeFilter: ["aria-pressed"],
      });
      previewTabCleanup = () => {
        tabObserver.disconnect();
        gsap.killTweensOf(Array.from(previewPanel.children));
      };
    }

    // PROCESS: the four stages remain in a natural, responsive grid.

    // HERO DEPTH: keep the lens figure free of competing transforms.
    // Its internal rings and glare are scroll-linked inside HeroLens.

    // MORE SCROLL EFFECTS
    mm.add(MOTION_ALLOWED_QUERY, () => {
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
        "[data-preview-reading]"
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

      // Anime.js counts the illustrative dashboard values up only when the
      // KPI row enters view. Keep the unit spans untouched and restore the
      // exact original text on cleanup (including React Strict Mode reruns).
      const previewCounterNodes = dashboardPreview?.querySelectorAll<HTMLElement>(
        "[data-preview-reading] > p.mt-2"
      );
      const previewCounterAnimations: Array<{ revert: () => unknown }> = [];
      const previewCounterRestores: Array<() => void> = [];
      let previewCounterObserver: IntersectionObserver | undefined;

      if (previewCounterNodes?.length) {
        previewCounterObserver = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const valueElement = entry.target as HTMLElement;
            const valueNode = valueElement.firstChild;
            if (!valueNode || valueNode.nodeType !== Node.TEXT_NODE) {
              previewCounterObserver?.unobserve(valueElement);
              return;
            }

            const original = valueNode.nodeValue ?? "";
            const target = Number.parseFloat(original);
            if (!Number.isFinite(target)) {
              previewCounterObserver?.unobserve(valueElement);
              return;
            }

            const decimals = (original.trim().split(".")[1] ?? "").length;
            const counter = { value: 0 };
            valueNode.nodeValue = counter.value.toFixed(decimals);
            previewCounterRestores.push(() => {
              valueNode.nodeValue = original;
            });

            previewCounterAnimations.push(animate(counter, {
              value: target,
              duration: 1050,
              ease: "out(3)",
              onUpdate: () => {
                valueNode.nodeValue = counter.value.toFixed(decimals);
              },
              onComplete: () => {
                valueNode.nodeValue = original;
              },
            }));
            previewCounterObserver?.unobserve(valueElement);
          });
        }, { threshold: 0.55 });

        previewCounterNodes.forEach((node) => previewCounterObserver?.observe(node));
      }

      // Anime.js owns these number counters; GSAP continues to own the
      // dashboard's entrance, card reveals, and chart-bar choreography.
      return () => {
        previewCounterObserver?.disconnect();
        previewCounterAnimations.forEach((animation) => animation.revert());
        previewCounterRestores.forEach((restore) => restore());
      };
    });


    return () => {
      cancelled = true;
      previewTabCleanup?.();
      mm.revert();
    };
  }, []);

  return <HeroEnhance />;
}
