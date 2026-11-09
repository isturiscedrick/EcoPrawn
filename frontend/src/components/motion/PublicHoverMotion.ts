import gsap from "gsap";

const CARD_SELECTOR = [
  "main article",
  "main [data-reading]",
  "main [data-step]",
  "main .ep-stats-panel > div",
  "main [data-band]",
  "main [data-contact-form]",
  "main .ep-about-objective",
  "main .ep-about-journey-card",
  "[data-site-footer] .grid > div",
].join(",");

const CONTROL_SELECTOR = "main a, main button, #site-header nav a, [data-site-footer] nav a";

/**
 * One shared hover/focus language for all public marketing pages.
 * Call after page-specific motion setup so this final, common treatment
 * takes precedence over legacy page-level micro-interactions.
 */
export function bindPublicHoverMotion(root: HTMLElement): () => void {
  const cleanups: Array<() => void> = [];

  const bind = (element: HTMLElement, lift: number, scale: number) => {
    const enter = () => gsap.to(element, {
      y: lift,
      scale,
      borderColor: "var(--ep-accent)",
      boxShadow: "0 22px 48px -32px rgba(37,99,235,.34)",
      duration: 0.28,
      ease: "power3.out",
      overwrite: "auto",
    });

    const leave = () => gsap.to(element, {
      y: 0,
      scale: 1,
      borderColor: "var(--ep-line)",
      boxShadow: "0 12px 28px -24px rgba(15,23,42,.18)",
      duration: 0.36,
      ease: "power3.out",
      overwrite: "auto",
    });

    element.addEventListener("pointerenter", enter);
    element.addEventListener("pointerleave", leave);
    element.addEventListener("focusin", enter);
    element.addEventListener("focusout", leave);

    cleanups.push(() => {
      element.removeEventListener("pointerenter", enter);
      element.removeEventListener("pointerleave", leave);
      element.removeEventListener("focusin", enter);
      element.removeEventListener("focusout", leave);
      gsap.killTweensOf(element);
    });
  };

  root.querySelectorAll<HTMLElement>(CARD_SELECTOR).forEach((card) => bind(card, -5, 1.008));
  root.querySelectorAll<HTMLElement>(CONTROL_SELECTOR).forEach((control) => bind(control, -2, 1.01));

  return () => cleanups.forEach((cleanup) => cleanup());
}
