import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { animate } from "animejs";
import { gsap } from "gsap";
import { BrandMark } from "@/components/layout/BrandMark";
import "@/styles/logo-intro.css";

const particles = Array.from({ length: 10 }, (_, index) => index);

/**
 * A short branded intro for a fresh page load.
 * GSAP controls the entrance, progress and exit; Anime.js adds ambient particles.
 */
export function LogoIntroGate() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const firstPath = useRef(pathname);
  const screenRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);
  const [visible, setVisible] = useState(true);

  useLayoutEffect(() => {
    if (pathname !== firstPath.current) {
      document.documentElement.classList.add("ep-nav-seen");
    }
  }, [pathname]);

  useLayoutEffect(() => {
    if (!visible || !screenRef.current || !contentRef.current || !progressRef.current) return;

    const screen = screenRef.current;
    const content = contentRef.current;
    const progress = progressRef.current;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const context = gsap.context(() => {
      gsap.set(content, { autoAlpha: 0, y: reducedMotion ? 0 : 16, scale: reducedMotion ? 1 : 0.98 });
      gsap.set(progress, { scaleX: 0, transformOrigin: "left center" });

      const timeline = gsap.timeline({
        defaults: { ease: "power3.out" },
        onComplete: () => setVisible(false),
      });

      timeline
        .to(content, { autoAlpha: 1, y: 0, scale: 1, duration: reducedMotion ? 0.12 : 0.65 })
        .to(".ep-loading-caption", { autoAlpha: 1, y: 0, duration: reducedMotion ? 0.08 : 0.42 }, "-=0.18")
        .to(progress, { scaleX: 1, duration: reducedMotion ? 0.12 : 1.35, ease: "power2.inOut" }, reducedMotion ? "+=0.02" : "-=0.02")
        .to(".ep-loading-shimmer", { xPercent: 260, duration: 0.65, ease: "power1.inOut" }, "<0.35")
        .to(content, { autoAlpha: 0, y: reducedMotion ? 0 : -8, duration: reducedMotion ? 0.08 : 0.28 }, "+=0.12")
        .to(screen, { autoAlpha: 0, duration: reducedMotion ? 0.08 : 0.38, ease: "power1.out" }, "<0.04");
    }, screen);

    let particleMotion: ReturnType<typeof animate> | undefined;
    if (!reducedMotion) {
      const particleNodes = screen.querySelectorAll(".ep-loading-particle");
      particleMotion = animate(particleNodes, {
        y: [-7, 9],
        x: [-3, 4],
        opacity: [0.12, 0.72, 0.12],
        scale: [0.75, 1.15],
        duration: 2300,
        delay: (element, index) => index * 115,
        alternate: true,
        loop: true,
        ease: "inOutSine",
      });
    }

    return () => {
      particleMotion?.pause();
      context.revert();
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div ref={screenRef} className="ep-loading-screen" role="status" aria-label="Loading EcoPrawn">
      <div className="ep-loading-orbit ep-loading-orbit-one" aria-hidden="true" />
      <div className="ep-loading-orbit ep-loading-orbit-two" aria-hidden="true" />
      {particles.map((particle) => (
        <span className="ep-loading-particle" key={particle} aria-hidden="true" />
      ))}
      <div ref={contentRef} className="ep-loading-content">
        <div className="ep-loading-brand">
          <BrandMark size={30} showWordmark />
        </div>
        <span className="ep-loading-caption">SMART AQUACULTURE SYSTEM</span>
        <div className="ep-loading-track" aria-hidden="true">
          <span ref={progressRef} className="ep-loading-progress">
            <span className="ep-loading-shimmer" />
          </span>
        </div>
      </div>
    </div>
  );
}
