"use client";

import { useLayoutEffect, type RefObject } from "react";
import gsap from "gsap";
import { animate, utils } from "animejs";

// Fixed positions (no Math.random) so the markup is stable between renders.
const SPECKS = [
  { left: "5%", top: "78%", size: 6 },
  { left: "11%", top: "34%", size: 4 },
  { left: "18%", top: "88%", size: 8 },
  { left: "26%", top: "56%", size: 5 },
  { left: "33%", top: "18%", size: 6 },
  { left: "41%", top: "84%", size: 4 },
  { left: "49%", top: "40%", size: 7 },
  { left: "57%", top: "10%", size: 5 },
  { left: "64%", top: "90%", size: 6 },
  { left: "72%", top: "30%", size: 4 },
  { left: "79%", top: "68%", size: 8 },
  { left: "86%", top: "14%", size: 5 },
  { left: "92%", top: "52%", size: 6 },
  { left: "96%", top: "82%", size: 4 },
];

const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Direct children of the form's fieldset that are currently on screen. */
function visibleFields(form: HTMLFormElement | null): HTMLElement[] {
  const fieldset = form?.querySelector("fieldset");
  if (!fieldset) return [];
  return (Array.from(fieldset.children) as HTMLElement[]).filter(
    (el) => el.getClientRects().length > 0
  );
}

const CLEAR = "transform,opacity";

/**
 * Closing animation. Plays, then calls `done` (which unmounts the dialog).
 * Reduced-motion users close instantly.
 */
export function playAuthExit(
  overlay: HTMLElement | null,
  panel: HTMLElement | null,
  done: () => void
) {
  if (!overlay || !panel || prefersReducedMotion()) {
    done();
    return;
  }
  const backdrop = overlay.querySelector("[data-auth-backdrop]");
  const decor = overlay.querySelector("[data-auth-decor]");
  const targets = [panel, backdrop, decor].filter(Boolean) as Element[];
  // Stop a still-running entrance so the two don't fight over the panel.
  gsap.killTweensOf(targets);
  gsap
    .timeline({ onComplete: done })
    .to(panel, { opacity: 0, y: 20, scale: 0.97, duration: 0.22, ease: "power2.in" }, 0)
    .to([backdrop, decor], { opacity: 0, duration: 0.22, ease: "none" }, 0);
}

interface AuthModalMotionProps {
  overlayRef: RefObject<HTMLDivElement | null>;
  panelRef: RefObject<HTMLDivElement | null>;
}

/**
 * Motion for the sign-in / sign-up modal. Renders the decorative bubble layer
 * and runs everything else against the existing DOM, so LoginForm and
 * auth-modal.css stay untouched.
 *
 *  GSAP     entrance, step and page transitions, magnetic submit button
 *  anime.js ambient bubbles, error shake, icon pop on focus
 *
 * All of it is skipped when the user prefers reduced motion.
 */
export function AuthModalMotion({ overlayRef, panelRef }: AuthModalMotionProps) {
  useLayoutEffect(() => {
    const overlay = overlayRef.current;
    const panel = panelRef.current;
    if (!overlay || !panel) return;

    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const backdrop = overlay.querySelector("[data-auth-backdrop]");
      const decor = overlay.querySelector("[data-auth-decor]");
      const anims: Array<{ revert: () => unknown }> = [];
      const heading = () => panel.querySelectorAll("h1, h1 + p");

      /* ---------- GSAP: entrance ---------- */
      // Direct children of LoginForm's root: title, intro, form card, footer.
      const content = panel.querySelectorAll(":scope > div:not(.ep-auth-brand) > *");
      const fields = visibleFields(panel.querySelector("form"));

      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .from(backdrop, { opacity: 0, duration: 0.3, ease: "none" }, 0)
        .from(decor, { opacity: 0, duration: 0.7, ease: "none" }, 0)
        .from(
          panel,
          { opacity: 0, y: 32, scale: 0.95, duration: 0.55, ease: "back.out(1.5)", clearProps: CLEAR },
          0.05
        )
        .from(content, { opacity: 0, y: 16, duration: 0.45, stagger: 0.07, clearProps: CLEAR }, 0.25)
        .from(fields, { opacity: 0, y: 12, duration: 0.4, stagger: 0.05, clearProps: CLEAR }, 0.5);

      /* ---------- anime.js: ambient bubbles ---------- */
      const specks = Array.from(overlay.querySelectorAll<HTMLElement>(".ep-auth-speck"));
      anims.push(
        animate(specks, {
          x: () => utils.random(-28, 28),
          y: () => utils.random(-120, -40),
          opacity: [0.08, 0.5],
          duration: () => utils.random(3500, 7000),
          delay: () => utils.random(0, 2000),
          ease: "inOutSine",
          loop: true,
          alternate: true,
        })
      );

      /* ---------- Reactions to what LoginForm does ---------- */
      // LoginForm remounts <form key={step}> when the step changes, and flips
      // sign-up pages by removing the "hidden" class from field wrappers. Both
      // are visible to a MutationObserver without any change to LoginForm.
      const shake = (alert: HTMLElement) => {
        anims.push(
          animate(alert, {
            x: [
              { to: -10, duration: 70 },
              { to: 10, duration: 90 },
              { to: -7, duration: 90 },
              { to: 7, duration: 90 },
              { to: 0, duration: 70 },
            ],
            ease: "inOutSine",
          })
        );
        const icon = alert.querySelector("svg");
        if (icon) {
          anims.push(
            animate(icon, { scale: [0.5, 1], rotate: [-25, 0], duration: 450, ease: "outBack" })
          );
        }
        // Opacity only: anime owns this element's transform.
        gsap.fromTo(alert, { opacity: 0 }, { opacity: 1, duration: 0.2, clearProps: "opacity" });
      };

      const observer = new MutationObserver((records) => {
        const forms: HTMLFormElement[] = [];
        const alerts = new Set<HTMLElement>();
        const statuses = new Set<HTMLElement>();
        const helps: HTMLElement[] = [];
        const revealed: HTMLElement[] = [];

        for (const record of records) {
          if (record.type === "childList") {
            record.addedNodes.forEach((node) => {
              if (node instanceof HTMLFormElement) {
                forms.push(node);
              } else if (node instanceof HTMLElement) {
                if (node.matches('[role="alert"]')) alerts.add(node);
                else if (node.matches('[role="status"]')) statuses.add(node);
                else if (node.matches('span[id$="-help"]')) helps.push(node);
              } else if (node.nodeType === Node.TEXT_NODE) {
                // Same alert, new message: shake again.
                const alert = node.parentElement?.closest<HTMLElement>('[role="alert"]');
                if (alert) alerts.add(alert);
              }
            });
          } else if (record.type === "characterData") {
            const alert = record.target.parentElement?.closest<HTMLElement>('[role="alert"]');
            if (alert) alerts.add(alert);
          } else if (record.target instanceof HTMLElement) {
            const target = record.target;
            if (/(^|\s)hidden(\s|$)/.test(record.oldValue ?? "") && !target.classList.contains("hidden")) {
              revealed.push(target);
            }
          }
        }

        if (forms.length) {
          // New step: fields rise in, title and intro refresh.
          const form = forms[forms.length - 1];
          gsap.fromTo(
            visibleFields(form),
            { opacity: 0, y: 14 },
            { opacity: 1, y: 0, duration: 0.4, stagger: 0.06, ease: "power3.out", clearProps: CLEAR }
          );
          gsap.fromTo(
            heading(),
            { opacity: 0, y: -8 },
            { opacity: 1, y: 0, duration: 0.35, stagger: 0.05, ease: "power3.out", clearProps: CLEAR }
          );
        } else if (revealed.length) {
          // Sign-up page flip: newly shown fields slide in from the side they
          // belong to (username/password = forward, name/phone = back).
          revealed.forEach((el, i) => {
            const forward = el.querySelector('input[name="username"], input[name="password"]');
            gsap.fromTo(
              el,
              { opacity: 0, x: forward ? 28 : -28 },
              { opacity: 1, x: 0, duration: 0.4, delay: i * 0.06, ease: "power3.out", clearProps: CLEAR }
            );
          });
          gsap.fromTo(
            heading(),
            { opacity: 0, y: -8 },
            { opacity: 1, y: 0, duration: 0.35, stagger: 0.05, ease: "power3.out", clearProps: CLEAR }
          );
        }

        alerts.forEach(shake);
        statuses.forEach((el) =>
          gsap.from(el, { opacity: 0, y: -8, duration: 0.3, ease: "power3.out", clearProps: CLEAR })
        );
        helps.forEach((el) =>
          gsap.from(el, { opacity: 0, y: -4, duration: 0.25, ease: "power2.out", clearProps: CLEAR })
        );
      });

      observer.observe(panel, {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: true,
        attributeFilter: ["class"],
        attributeOldValue: true,
      });

      /* ---------- anime.js: icon pop when a field gets focus ---------- */
      // Field markup: <div.relative><span aria-hidden>{icon}</span><input/></div>
      const onFocusIn = (event: FocusEvent) => {
        const input = event.target;
        if (!(input instanceof HTMLInputElement)) return;
        const icon = input.previousElementSibling;
        if (icon instanceof HTMLElement && icon.tagName === "SPAN") {
          anims.push(
            animate(icon, { scale: [1, 1.3], duration: 140, ease: "outQuad", alternate: true, loop: 2 })
          );
        }
      };
      panel.addEventListener("focusin", onFocusIn);

      /* ---------- GSAP: magnetic submit button ---------- */
      const cleanups: Array<() => void> = [];
      if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
        const submitOf = (target: EventTarget | null) => {
          const button = (target as Element | null)?.closest?.('button[type="submit"]');
          return button instanceof HTMLButtonElement ? button : null;
        };
        const onMove = (event: PointerEvent) => {
          const button = submitOf(event.target);
          if (!button || button.disabled) return;
          const r = button.getBoundingClientRect();
          gsap.to(button, {
            x: (event.clientX - (r.left + r.width / 2)) * 0.1,
            y: (event.clientY - (r.top + r.height / 2)) * 0.2,
            duration: 0.4,
            ease: "power3.out",
            overwrite: "auto",
          });
        };
        const onOut = (event: PointerEvent) => {
          const button = submitOf(event.target);
          if (!button || button.contains(event.relatedTarget as Node | null)) return;
          gsap.to(button, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.5)", overwrite: "auto" });
        };
        panel.addEventListener("pointermove", onMove);
        panel.addEventListener("pointerout", onOut);
        cleanups.push(() => {
          panel.removeEventListener("pointermove", onMove);
          panel.removeEventListener("pointerout", onOut);
        });
      }

      return () => {
        observer.disconnect();
        panel.removeEventListener("focusin", onFocusIn);
        cleanups.forEach((fn) => fn());
        anims.forEach((a) => a.revert());
      };
    });

    return () => mm.revert();
  }, [overlayRef, panelRef]);

  return (
    <div
      data-auth-decor=""
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 overflow-hidden"
    >
      {SPECKS.map((s) => (
        <span
          key={`${s.left}-${s.top}`}
          className="ep-auth-speck absolute rounded-full bg-[rgba(242,235,221,0.6)] opacity-[0.08]"
          style={{ left: s.left, top: s.top, width: s.size, height: s.size }}
        />
      ))}
    </div>
  );
}