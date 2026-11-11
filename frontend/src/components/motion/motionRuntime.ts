import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

/**
 * Shared motion policy for the public EcoPrawn experience.
 * GSAP owns page/scroll choreography; Anime.js owns short-lived accents;
 * native scrolling remains the source of truth for browser navigation.
 */
export const MOTION_ALLOWED_QUERY = "(prefers-reduced-motion: no-preference)";
export const MOTION_REDUCED_QUERY = "(prefers-reduced-motion: reduce)";
export const MOTION_FINE_POINTER_QUERY =
  "(hover: hover) and (pointer: fine) and (min-width: 768px)";

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
