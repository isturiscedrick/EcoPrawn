"use client";

import { useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { animate, utils } from "animejs";

gsap.registerPlugin(ScrollTrigger);

/**
 * Landing page motion. Renders nothing; targets data-* hooks in LandingPage.
 *
 *  GSAP     hero intro timeline, scroll parallax, section reveals,
 *           readings count-up and range bars, scrubbed process rule
 *  anime.js ambient loops: crosshair blink, live-status ping, marker pings
 *
 * Everything is skipped when the user prefers reduced motion.
 */
export function LandingMotion() {
  useLayoutEffect(() => {
    const mm = gsap.matchMedia();
    let cancelled = false;

    // Web fonts reflow the text after first paint; re-measure triggers once ready.
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => {
        if (!cancelled) ScrollTrigger.refresh();
      });
    }

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const anims: Array<{ revert: () => unknown }> = [];
      const restores: Array<() => void> = [];
      const q = <T extends Element = HTMLElement>(sel: string) => gsap.utils.toArray<T>(sel);

      /* ---------- GSAP: hero intro ---------- */
      gsap
        .timeline({ delay: 0.15, defaults: { ease: "power3.out" } })
        .from('[data-hero="eyebrow"]', { y: 12, opacity: 0, duration: 0.6 })
        .from('[data-hero="word"]', { yPercent: 115, duration: 0.95, stagger: 0.07, ease: "power4.out" }, "-=0.3")
        .from('[data-hero="lead"]', { y: 16, opacity: 0, duration: 0.7 }, "-=0.55")
        .from('[data-hero="cta"] > *', { y: 14, opacity: 0, duration: 0.6, stagger: 0.08 }, "-=0.45")
        .from(
          '[data-hero="statline"]',
          { scaleX: 0, transformOrigin: "left center", duration: 1.1, ease: "power2.inOut" },
          "-=0.3"
        )
        .from('[data-hero="stat"]', { y: 14, opacity: 0, duration: 0.6, stagger: 0.1 }, "-=0.8")
        .from('[data-hero="console"]', { opacity: 0, y: 32, duration: 1.1 }, 0.35);

      /* ---------- GSAP: hero parallax (scrubbed). Wrappers own y, children own the intro. ---------- */
      const heroScroll = { trigger: "#top", start: "top top", end: "bottom top", scrub: true };
      gsap.to('[data-hero="text"]', { y: -40, opacity: 0.3, ease: "none", scrollTrigger: heroScroll });
      gsap.to('[data-hero="parallax-console"]', { y: 36, ease: "none", scrollTrigger: heroScroll });
      gsap.to('[data-hero="grid"]', { yPercent: 10, ease: "none", scrollTrigger: heroScroll });
      gsap.to("[data-readings-bg]", {
        yPercent: -8,
        ease: "none",
        scrollTrigger: { trigger: "#readings", start: "top bottom", end: "bottom top", scrub: true },
      });

      /* ---------- GSAP: heading reveals ---------- */
      q("[data-reveal]").forEach((el) => {
        gsap.from(el, {
          y: 24,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
        });
      });

      /* ---------- GSAP: readings. Rise in, zones fill, markers travel, numbers count up. ---------- */
      const readings = q("[data-reading]");
      if (readings.length) {
        const tl = gsap.timeline({
          defaults: { ease: "power3.out" },
          scrollTrigger: { trigger: "#readings", start: "top 70%", once: true },
        });

        tl.from(readings, { y: 28, opacity: 0, duration: 0.7, stagger: 0.1 })
          .addLabel("fill", "-=0.4")
          .from(
            "[data-zone]",
            { scaleX: 0, transformOrigin: "left center", duration: 0.9, stagger: 0.1 },
            "fill"
          )
          .from(
            "[data-marker]",
            { left: "0%", opacity: 0, duration: 1.2, stagger: 0.1, ease: "power3.inOut" },
            "fill+=0.15"
          );

        q("[data-countto]").forEach((node, i) => {
          const original = node.dataset.countto ?? "";
          const target = parseFloat(original);
          if (!Number.isFinite(target)) return;
          const decimals = (original.split(".")[1] ?? "").length;
          const state = { v: 0 };
          node.textContent = (0).toFixed(decimals);
          restores.push(() => {
            node.textContent = original;
          });
          tl.to(
            state,
            {
              v: target,
              duration: 1.3,
              ease: "power2.out",
              onUpdate: () => {
                node.textContent = state.v.toFixed(decimals);
              },
              onComplete: () => {
                node.textContent = original;
              },
            },
            `fill+=${i * 0.1}`
          );
        });

        // anime.js: marker pings start once the markers have landed.
        tl.call(() => {
          anims.push(
            animate("[data-ping]", {
              scale: [1, 2.6],
              opacity: [0.7, 0],
              duration: 1800,
              delay: () => utils.random(0, 1500),
              ease: "outQuad",
              loop: true,
            })
          );
        });
      }

      /* ---------- GSAP: process steps ---------- */
      gsap.from("[data-step]", {
        y: 28,
        opacity: 0,
        duration: 0.7,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: { trigger: "#process ol", start: "top 82%", once: true },
      });

      /* ---------- anime.js: ambient loops ---------- */
      anims.push(
        animate("[data-cross]", {
          opacity: [0.12, 0.7],
          scale: [1, 1.25],
          duration: 2400,
          delay: () => utils.random(0, 2500),
          ease: "inOutSine",
          loop: true,
          alternate: true,
        })
      );
      anims.push(
        animate("[data-live-ping]", {
          scale: [1, 2.8],
          opacity: [0.6, 0],
          duration: 1800,
          ease: "outQuad",
          loop: true,
        })
      );

      return () => {
        anims.forEach((a) => a.revert());
        restores.forEach((r) => r());
      };
    });

    /* ---------- Desktop only: the process rule fills with scroll, nodes light up ---------- */
    mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(
        "[data-process-line]",
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: "none",
          scrollTrigger: { trigger: "#process ol", start: "top 75%", end: "top 30%", scrub: true },
        }
      );

      gsap.utils.toArray<HTMLElement>("[data-step-node]").forEach((node) => {
        gsap.to(node, {
          backgroundColor: "#b23f1c",
          scale: 1.5,
          duration: 0.3,
          ease: "power2.out",
          scrollTrigger: { trigger: node, start: "top 72%", toggleActions: "play none none reverse" },
        });
      });
    });

    return () => {
      cancelled = true;
      mm.revert();
    };
  }, []);

  return null;
}