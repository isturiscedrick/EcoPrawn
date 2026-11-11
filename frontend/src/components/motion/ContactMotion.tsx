import { useLayoutEffect } from "react";
import gsap from "gsap";
import { bindPublicHoverMotion } from "./PublicHoverMotion";
import { registerMotionPlugins, MOTION_ALLOWED_QUERY } from "./motionRuntime";
import { animate, stagger } from "animejs";

registerMotionPlugins();

/** Contact-page motion with transform-only entrances and resilient cleanup. */
export function ContactMotion() {
  useLayoutEffect(() => {
    const root = document.querySelector<HTMLElement>(".ep-contact-page");
    if (!root) return;

    const mm = gsap.matchMedia();
    mm.add(MOTION_ALLOWED_QUERY, () => {
      const cleanups: Array<() => void> = [];
      const animeRuns: Array<{ revert: () => unknown }> = [];
      const ctx = gsap.context(() => {
        const hero = root.querySelector<HTMLElement>("[data-page-hero]");
        if (hero) {
          const kicker = hero.querySelector<HTMLElement>("[data-page-kicker]");
          const title = hero.querySelector<HTMLElement>("h1");
          const lead = hero.querySelector<HTMLElement>("[data-page-lead]");
          // Shared public-page hero choreography: matching timing, easing,
          // distance and stagger across Home, About and Contact.
          const intro = gsap.timeline({
            defaults: { ease: "power4.out" },
            delay: 0.12,
          });
          if (kicker) intro.from(kicker, {
            y: 22, autoAlpha: 0, scale: .96, duration: .65,
          });
          if (title) intro.from(title, {
            y: 38, rotateX: -8, transformPerspective: 1000,
            autoAlpha: 0, duration: .9,
          }, "-=.28");
          if (lead) intro.from(lead, {
            y: 20, autoAlpha: 0, duration: .7,
          }, "-=.42");

          // Keep the hero atmosphere fixed to its section; no scroll parallax.
        }

        const section = root.querySelector<HTMLElement>("main section");
        if (section) {
          const heading = section.querySelector<HTMLElement>("h2");
          const copy = section.querySelectorAll<HTMLElement>("p");
          const eyebrow = heading?.parentElement?.querySelector<HTMLElement>("div");
          const tl = gsap.timeline({
            scrollTrigger: { trigger: section, start: "top 86%", once: true },
            defaults: { ease: "power3.out" },
          });
          if (eyebrow) tl.from(eyebrow, { x: -16, duration: .4 });
          if (heading) tl.from(heading, { y: 26, duration: .65 }, "-=.12");
          if (copy.length) tl.from(copy, { y: 14, stagger: .08, duration: .48 }, "-=.28");
        }

        const cards = gsap.utils.toArray<HTMLElement>("[data-contact-card]", root);
        cards.forEach((card, index) => {
          gsap.from(card, {
            x: index % 2 ? 24 : -24,
            y: 30,
            duration: .8,
            ease: "expo.out",
            scrollTrigger: { trigger: card, start: "top 91%", once: true },
          });
        });

        const form = root.querySelector<HTMLElement>("[data-contact-form]");
        if (form) {
          gsap.from(form, {
            x: 34, y: 26, scale: .985,
            duration: .9, ease: "expo.out",
            scrollTrigger: { trigger: form, start: "top 90%", once: true },
          });
          const fields = form.querySelectorAll<HTMLElement>("input, textarea, select");
          if (fields.length) gsap.from(fields, {
            y: 12, stagger: .07, duration: .48, ease: "power3.out",
            scrollTrigger: { trigger: form, start: "top 82%", once: true },
          });
          const labels = form.querySelectorAll<HTMLElement>("label");
          if (labels.length) gsap.from(labels, {
            x: -8, stagger: .055, duration: .38, ease: "power2.out",
            scrollTrigger: { trigger: form, start: "top 80%", once: true },
          });
        }

        const footer = root.querySelector<HTMLElement>("[data-site-footer]");
        const groups = footer?.querySelectorAll<HTMLElement>(".grid > div");
        if (footer && groups?.length) gsap.from(groups, {
          y: 20, stagger: .1, duration: .62, ease: "power3.out",
          scrollTrigger: { trigger: footer, start: "top 92%", once: true },
        });

        // The intro banner uses the same scroll rhythm as the other public
        // pages, with a small signal pulse that does not move the layout.
        const introPanel = root.querySelector<HTMLElement>(".ep-contact-intro-panel");
        if (introPanel) {
          const copy = introPanel.querySelectorAll<HTMLElement>(":scope > div:first-child > *");
          const signal = introPanel.querySelector<HTMLElement>(".ep-contact-signal");
          const rings = introPanel.querySelectorAll<HTMLElement>(".ep-contact-signal-ring");
          const tl = gsap.timeline({
            scrollTrigger: { trigger: introPanel, start: "top 84%", once: true },
            defaults: { ease: "power3.out" },
          });
          if (copy.length) tl.from(copy, { x: -22, autoAlpha: 0, stagger: .08, duration: .62 });
          if (signal) tl.from(signal, { scale: .82, autoAlpha: 0, duration: .72 }, "-=.38");
          if (rings.length) tl.from(rings, { scale: .65, autoAlpha: 0, stagger: .1, duration: .62 }, "-=.42");
        }

        // Contact details stay in their natural document position. Cards still
        // reveal once as they enter view, without continuous scroll-linked drift.
        const details = root.querySelector<HTMLElement>("[data-contact-details]");
        if (details) {
          gsap.from(details.querySelectorAll<HTMLElement>("[data-contact-card]"), {
            y: 34, stagger: .12, duration: .72, ease: "power3.out",
            scrollTrigger: { trigger: details, start: "top 84%", once: true },
          });
        }

        // Bring the form action into view after its fields.
        if (form) {
          const action = form.querySelector<HTMLElement>("button[type='submit']");
          if (action) gsap.from(action, {
            y: 16, scale: .98, duration: .55, ease: "back.out(1.4)",
            scrollTrigger: { trigger: action, start: "top 94%", once: true },
          });
        }

        // Form controls respond with a calm focus halo; Anime.js accents the label.
        form?.querySelectorAll<HTMLElement>("input, textarea, select").forEach((field) => {
          const focus = () => {
            gsap.to(field, { scale: 1.006, borderColor: "var(--ep-accent)", boxShadow: "0 0 0 4px color-mix(in srgb, var(--ep-accent) 16%, transparent)", duration: .22, ease: "power2.out" });
            const label = field.parentElement?.querySelector<HTMLElement>("label");
            if (label) animeRuns.push(animate(label, { translateX: [0, 4, 0], duration: 320, ease: "outBack(1.5)" }));
          };
          const blur = () => gsap.to(field, { scale: 1, boxShadow: "0 0 0 0 transparent", duration: .28, ease: "power2.out" });
          field.addEventListener("focus", focus);
          field.addEventListener("blur", blur);
          cleanups.push(() => {
            field.removeEventListener("focus", focus);
            field.removeEventListener("blur", blur);
            gsap.killTweensOf(field);
          });
        });

        // The contact form swaps to a local review state after submission.
        // Observe that real state change and animate the confirmation content in.
        const reviewObserver = new MutationObserver(() => {
          const review = root.querySelector<HTMLElement>('[role="status"]');
          if (!review || review.dataset.motionPlayed === "true") return;
          review.dataset.motionPlayed = "true";
          gsap.fromTo(review,
            { y: 22, opacity: 0, scale: .985 },
            { y: 0, opacity: 1, scale: 1, duration: .62, ease: "power3.out", clearProps: "transform,opacity" }
          );
          const rows = review.querySelectorAll<HTMLElement>("dl > div");
          if (rows.length) gsap.from(rows, {
            x: -12, opacity: 0, stagger: .08, duration: .42,
            ease: "power2.out", delay: .12, clearProps: "transform,opacity",
          });
          const action = review.querySelector<HTMLElement>("button");
          if (action) animeRuns.push(animate(action, {
            scale: [0.96, 1.035, 1],
            duration: 520,
            delay: 220,
            ease: "outElastic(1,.65)",
          }));
        });
        reviewObserver.observe(root, { childList: true, subtree: true });
        cleanups.push(() => reviewObserver.disconnect());

        // Tiny ornamental marks pulse in a short, non-looping sequence.
        const marks = root.querySelectorAll<HTMLElement>("main [aria-hidden='true'].h-2");
        if (marks.length) animeRuns.push(animate(marks, { scale: [0.7, 1], delay: stagger(70), duration: 460, ease: "outBack(1.7)" }));

        // Anime.js adds a section-by-section entrance for the contact details,
        // form labels and supporting icons without making any content invisible.
        const sectionAccents = root.querySelectorAll<HTMLElement>(
          "[data-contact-card] svg, [data-contact-card] dt, [data-contact-form] label, [data-site-footer] svg"
        );
        let accentObserver: IntersectionObserver | undefined;
        if (sectionAccents.length) {
          accentObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
              if (!entry.isIntersecting) return;
              const target = entry.target as HTMLElement;
              const isIcon = target.tagName.toLowerCase() === "svg";
              animeRuns.push(animate(target, {
                translateY: [isIcon ? 7 : 5, 0],
                scale: isIcon ? [0.76, 1] : [0.985, 1],
                rotate: isIcon ? [-9, 0] : [0, 0],
                duration: isIcon ? 560 : 430,
                ease: isIcon ? "outElastic(1,.6)" : "out(3)",
              }));
              accentObserver?.unobserve(target);
            });
          }, { threshold: 0.3 });
          sectionAccents.forEach((target) => accentObserver?.observe(target));
        }
        cleanups.push(() => accentObserver?.disconnect());
      }, root);

      const cleanupSharedHover = bindPublicHoverMotion(root);

      return () => {
        cleanupSharedHover();
        cleanups.forEach((cleanup) => cleanup());
        animeRuns.forEach((run) => run.revert());
        ctx.revert();
      };
    });

    return () => mm.revert();
  }, []);

  return null;
}
