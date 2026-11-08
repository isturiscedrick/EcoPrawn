import { useEffect } from "react";

/**
 * Lightweight browser-native landing motion.
 * IntersectionObserver adds an entrance class; CSS owns the transition.
 * Native document scrolling remains untouched.
 */
export function LandingMotion() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".ep-business-landing");
    if (!root) return;

    const targets = root.querySelectorAll<HTMLElement>(
      '[data-hero="text"], [data-reveal], [data-business-card], [data-reading], [data-step]',
    );

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      targets.forEach((target) => target.classList.add("ep-native-in-view"));
      return;
    }

    if (!("IntersectionObserver" in window)) {
      targets.forEach((target) => target.classList.add("ep-native-in-view"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("ep-native-in-view");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -5% 0px" },
    );

    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, []);

  return null;
}
