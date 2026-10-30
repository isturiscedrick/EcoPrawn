"use client";

import { useLayoutEffect } from "react";
import gsap from "gsap";

const LOGO_LINK = 'header a[aria-label="EcoPrawn home"]';

/**
 * Header logo motion: entrance, slow idle float, hover flick. Renders
 * nothing; targets the logo link in SiteHeader. Skipped for reduced motion.
 */
export function LogoMotion() {
  useLayoutEffect(() => {
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const link = document.querySelector<HTMLElement>(LOGO_LINK);
      // SiteHeader renders two logos (mobile and desktop); only one shows.
      const logos = gsap.utils.toArray<HTMLElement>(`${LOGO_LINK} img`);
      if (!link || !logos.length) return;

      // While the water intro is covering the page, wait for it to drain
      // past the header before the logo appears.
      const curtain = document.querySelector<HTMLElement>(".ep-water-curtain");
      const waterPlaying =
        !!curtain && getComputedStyle(curtain).display !== "none";
      const delay = waterPlaying ? 1.4 : 0.1;

      // Entrance: on the image.
      gsap.from(logos, {
        y: -18,
        rotation: -8,
        scale: 0.85,
        opacity: 0,
        duration: 0.9,
        ease: "back.out(1.8)",
        delay,
      });

      // Idle float: on the link, so it never fights the image tweens.
      gsap.to(link, {
        y: -3,
        duration: 2.4,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        delay: delay + 1,
      });

      // Hover flick: quick tilt, then an elastic settle.
      const onEnter = () => {
        gsap
          .timeline({ defaults: { overwrite: "auto" } })
          .to(logos, {
            rotation: -10,
            scale: 1.08,
            duration: 0.15,
            ease: "power2.out",
          })
          .to(logos, {
            rotation: 0,
            scale: 1,
            duration: 0.9,
            ease: "elastic.out(1, 0.4)",
          });
      };
      link.addEventListener("pointerenter", onEnter);

      return () => link.removeEventListener("pointerenter", onEnter);
    });

    return () => mm.revert();
  }, []);

  return null;
}