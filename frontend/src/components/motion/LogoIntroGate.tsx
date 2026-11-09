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
  const [visible, setVisible] = useState(false);

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

  // Decide whether to show the intro before mounting the overlay. Starting
  // hidden prevents a one-frame flash on reloads after the intro was completed.
  useEffect(() => {
    let seen = false;
    try {
      seen = window.sessionStorage.getItem(SEEN_KEY) === "1";
    } catch {
      // If storage is unavailable, play the intro.
    }
    if (!seen && !firstPath.current.startsWith("/dashboard")) setVisible(true);
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
      const brand = content.querySelector<HTMLElement>(".ep-loading-brand");
      const caption = content.querySelector<HTMLElement>(".ep-loading-caption");
      const logoWordmark = content.querySelector<HTMLElement>(".ep-logo-wordmark");

      // Start every visible element from a known state. Animate the complete
      // brand lockup as one unit instead of relying on SVG path-length drawing.
      gsap.set(content, { autoAlpha: 1, y: 0, scale: 1 });
      gsap.set(brand, {
        autoAlpha: 0,
        y: reducedMotion ? 0 : 18,
        scale: reducedMotion ? 1 : 0.82,
        clipPath: "inset(0 0 100% 0)",
        transformOrigin: "50% 50%",
      });
      gsap.set(logoWordmark, { autoAlpha: 0, x: reducedMotion ? 0 : -10 });
      gsap.set(caption, { autoAlpha: 0, y: reducedMotion ? 0 : 8 });
      gsap.set(progress, { scaleX: 0, transformOrigin: "left center" });

      const timeline = gsap.timeline({
        defaults: { ease: "power3.out" },
        onComplete: () => finish.current(),
      });

      // Six-second sequence: reveal the full logo lockup, bring in the
      // wordmark and caption, complete the progress bar, then fade out.
      timeline
        .to(brand, {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          clipPath: "inset(0 0 0% 0)",
          duration: reducedMotion ? 0.45 : 1.15,
          ease: "power3.out",
        })
        .to(
          logoWordmark,
          { autoAlpha: 1, x: 0, duration: reducedMotion ? 0.35 : 0.7 },
          "-=0.35"
        )
        .to(
          caption,
          { autoAlpha: 1, y: 0, duration: reducedMotion ? 0.3 : 0.55 },
          "-=0.05"
        )
        .to(
          progress,
          { scaleX: 1, duration: reducedMotion ? 1.4 : 2.8, ease: "power2.inOut" },
          "-=0.02"
        )
        .to(
          ".ep-loading-shimmer",
          { xPercent: 260, duration: 0.9, ease: "power1.inOut" },
          "<0.4"
        )
        .to(content, { autoAlpha: 0, y: reducedMotion ? 0 : -6, duration: 0.45 }, "+=1.0")
        .to(screen, { autoAlpha: 0, duration: 0.55, ease: "power1.out" }, "<0.02");
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