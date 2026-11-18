import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { MOTION_ALLOWED_QUERY, MOTION_REDUCED_QUERY, MOTION_FINE_POINTER_QUERY } from "./motionPolicy";
export { MOTION_ALLOWED_QUERY, MOTION_REDUCED_QUERY, MOTION_FINE_POINTER_QUERY } from "./motionPolicy";

/** Shared public-page animation runtime. */

/** Keep Anime.js instances reversible so route changes never leave stale motion behind. */
export function trackAnime<T extends { revert: () => unknown }>(
  runs: T[],
  run: T
): T {
  runs.push(run);
  return run;
}

/** Disconnect an observer and stop observing every target during effect cleanup. */
export function disconnectObserver(observer: IntersectionObserver | undefined): void {
  observer?.disconnect();
}

let pluginsRegistered = false;

/** Register the free GSAP plugins once, before page motion is initialized. */
export function registerMotionPlugins(): void {
  if (pluginsRegistered) return;
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
  pluginsRegistered = true;
}

/** A single policy gate for optional ambient and pointer-driven effects. */
export function motionIsAllowed(): boolean {
  return typeof window !== "undefined" &&
    window.matchMedia(MOTION_ALLOWED_QUERY).matches;
}
