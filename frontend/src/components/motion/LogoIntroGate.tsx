import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { animate } from "animejs";
import { gsap } from "gsap";
import { BrandMark } from "@/components/layout/BrandMark";
import "@/styles/logo-intro.css";

const particles = Array.from({ length: 10 }, (_, index) => index);
const SEEN_KEY = "ep-logo-intro-seen";

/**
 * A short branded intro (about 5 seconds) for the first page load of a session.
 * It is skipped on dashboard routes and once it has finished or been skipped
 * in this browser session. The button or Escape skips it early.
 * Reduced-motion users get a shorter fade-only intro.
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

  // Marks the intro as seen only once it has actually finished or been skipped.
  const finish = useRef(() => {
    try {
      window.sessionStorage.setItem(SEEN_KEY, "1");
    } catch {
      // Session storage can be unavailable; the intro may replay, which is harmless.
    }
    setVisible(false);
  });

  useLayoutEffect(() => {
    if (pathname !== firstPath.current) {
      document.documentElement.classList.add("ep-nav-seen");
    }
  }, [pathname]);

  // Read-only check on mount. The server and first client render both start
  // visible, so hydration matches; returning visitors drop the overlay before paint.
  useLayoutEffect(() => {
    let seen = false;
    try {
      seen = window.sessionStorage.getItem(SEEN_KEY) === "1";
    } catch {
      // Fall back to playing the intro.
    }
    if (seen || firstPath.current.startsWith("/dashboard")) setVisible(false);
  }, []);

  // Escape skips the intro.
  useEffect(() => {
    if (!visible) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") finish.current();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [visible]);

  useLayoutEffect(() => {
    if (!visible || !screenRef.current || !contentRef.current || !progressRef.current) return;

    const screen = screenRef.current;
    const content = contentRef.current;
    const progress = progressRef.current;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const context = gsap.context(() => {
      const logoShapes = content.querySelectorAll<SVGPathElement>(".ep-logo-shape");
      gsap.set(content, { autoAlpha: 0, y: reducedMotion ? 0 : 16, scale: reducedMotion ? 1 : 0.98 });
      gsap.set(progress, { scaleX: 0, transformOrigin: "left center" });
      if (!reducedMotion && logoShapes.length) {
        gsap.set(logoShapes, {
          strokeDasharray: 1,
          strokeDashoffset: 1,
          fillOpacity: 0,
          strokeOpacity: 1,
        });
      }

      const timeline = gsap.timeline({
        defaults: { ease: "power3.out" },
        onComplete: () => finish.current(),
      });

      // Draw the actual EcoPrawn SVG paths with GSAP. This is deliberately
      // scoped to the intro so global header-logo keyframes cannot shorten it.
      timeline
        .to(content, { autoAlpha: 1, y: 0, scale: 1, duration: reducedMotion ? 0.5 : 0.65 })
        .to(
          logoShapes,
          {
            strokeDashoffset: 0,
            duration: 0.72,
            stagger: 0.075,
            ease: "power2.inOut",
          },
          reducedMotion ? "<" : "-=0.08"
        )
        .to(
          logoShapes,
          {
            fillOpacity: 1,
            strokeOpacity: 0,
            duration: 0.32,
            stagger: 0.035,
            ease: "power1.out",
          },
          "-=0.18"
        )
        .to(".ep-loading-caption", { autoAlpha: 1, y: 0, duration: 0.45 }, "-=0.12")
        .to(progress, { scaleX: 1, duration: reducedMotion ? 1.6 : 2.5, ease: "power2.inOut" }, "-=0.02")
        .to(".ep-loading-shimmer", { xPercent: 260, duration: 0.9, ease: "power1.inOut" }, "<0.4")
        .to(content, { autoAlpha: 0, y: reducedMotion ? 0 : -6, duration: 0.4 }, "+=0.8")
        .to(screen, { autoAlpha: 0, duration: 0.5, ease: "power1.out" }, "<0.02");
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
        delay: (element, index) => (index ?? 0) * 115,
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
      <button
        type="button"
        onClick={() => finish.current()}
        className="absolute bottom-6 right-6 z-3 min-h-11 rounded-lg border border-current px-4 text-sm font-semibold opacity-80 hover:opacity-100"
      >
        Skip intro
      </button>
    </div>
  );
}