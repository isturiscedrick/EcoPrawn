import { useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { animate, stagger } from "animejs";

gsap.registerPlugin(ScrollTrigger);

/** Contact-page motion with transform-only entrances and resilient cleanup. */
export function ContactMotion() {
  useLayoutEffect(() => {
    const root = document.querySelector<HTMLElement>(".ep-contact-page");
    if (!root) return;

    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const cleanups: Array<() => void> = [];
      const ctx = gsap.context(() => {
        const hero = root.querySelector<HTMLElement>("[data-page-hero]");
        if (hero) {
          const kicker = hero.querySelector<HTMLElement>("[data-page-kicker]");
          const title = hero.querySelector<HTMLElement>("h1");
          const lead = hero.querySelector<HTMLElement>("[data-page-lead]");
          const intro = gsap.timeline({ defaults: { ease: "power4.out" } });
          if (kicker) intro.from(kicker, { y: 22, duration: .55 });
          if (title) intro.from(title, { y: 44, rotateX: -7, transformPerspective: 1000, duration: .85 }, "-=.24");
          if (lead) intro.from(lead, { y: 18, duration: .6 }, "-=.42");

          const atmosphere = hero.querySelector<HTMLElement>(".ep-hero-atmosphere");
          if (atmosphere) gsap.to(atmosphere, {
            yPercent: 18, scale: 1.08, ease: "none",
            scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: .8 },
          });
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
            rotateY: index % 2 ? 5 : -5,
            transformPerspective: 1000,
            duration: .8,
            ease: "expo.out",
            scrollTrigger: { trigger: card, start: "top 91%", once: true },
          });
        });

        const form = root.querySelector<HTMLElement>("[data-contact-form]");
        if (form) {
          gsap.from(form, {
            x: 34, y: 26, rotateY: 4, scale: .985,
            transformPerspective: 1100, duration: .9, ease: "expo.out",
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

        // Scroll-linked movement and staggered reveals for contact details.
        const details = root.querySelector<HTMLElement>("[data-contact-details]");
        if (details) {
          gsap.to(details, {
            y: -18, ease: "none",
            scrollTrigger: { trigger: details, start: "top bottom", end: "bottom top", scrub: .8 },
          });
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

        // Depth hover for information cards.
        cards.forEach((card) => {
          const icon = card.querySelector<SVGElement>("svg");
          const rx = gsap.quickTo(card, "rotationX", { duration: .28, ease: "power2.out" });
          const ry = gsap.quickTo(card, "rotationY", { duration: .28, ease: "power2.out" });
          const enter = () => {
            gsap.to(card, { y: -7, scale: 1.02, boxShadow: "0 28px 64px -34px rgba(7,42,48,.5)", duration: .3, ease: "power3.out", overwrite: "auto" });
            if (icon) animate(icon, { scale: [1, 1.2, 1], rotate: [0, -12, 8, 0], duration: 600, ease: "outElastic(1,.55)" });
          };
          const move = (event: PointerEvent) => {
            const rect = card.getBoundingClientRect();
            if (!rect.width || !rect.height) return;
            ry(((event.clientX - rect.left) / rect.width - .5) * 7);
            rx(-((event.clientY - rect.top) / rect.height - .5) * 5);
          };
          const leave = () => {
            rx(0); ry(0);
            gsap.to(card, { y: 0, scale: 1, rotationX: 0, rotationY: 0, duration: .45, ease: "elastic.out(1,.6)", overwrite: "auto" });
          };
          card.addEventListener("pointerenter", enter);
          card.addEventListener("pointermove", move);
          card.addEventListener("pointerleave", leave);
          card.addEventListener("focusin", enter);
          card.addEventListener("focusout", leave);
          cleanups.push(() => {
            card.removeEventListener("pointerenter", enter);
            card.removeEventListener("pointermove", move);
            card.removeEventListener("pointerleave", leave);
            card.removeEventListener("focusin", enter);
            card.removeEventListener("focusout", leave);
          });
        });

        // GSAP hover depth for the form panel and footer content groups.
        // These surfaces complement the individual contact-card interactions.
        const contactSurfaces = root.querySelectorAll<HTMLElement>(
          "[data-contact-form], [data-site-footer] .grid > div"
        );
        contactSurfaces.forEach((surface) => {
          const enter = () => gsap.to(surface, {
            y: -5, borderColor: "var(--ep-accent)",
            boxShadow: "0 26px 56px -34px rgba(7,42,48,.5)",
            duration: .3, ease: "power3.out", overwrite: "auto",
          });
          const leave = () => gsap.to(surface, {
            y: 0, borderColor: "var(--ep-line)",
            boxShadow: "0 12px 28px -24px rgba(11,46,51,.25)",
            duration: .42, ease: "power3.out", overwrite: "auto",
          });
          surface.addEventListener("pointerenter", enter);
          surface.addEventListener("pointerleave", leave);
          cleanups.push(() => {
            surface.removeEventListener("pointerenter", enter);
            surface.removeEventListener("pointerleave", leave);
          });
        });

        // Form controls respond with a calm focus halo; Anime.js accents the label.
        form?.querySelectorAll<HTMLElement>("input, textarea, select").forEach((field) => {
          const focus = () => {
            gsap.to(field, { scale: 1.006, borderColor: "var(--ep-accent)", boxShadow: "0 0 0 4px color-mix(in srgb, var(--ep-accent) 16%, transparent)", duration: .22, ease: "power2.out" });
            const label = field.parentElement?.querySelector<HTMLElement>("label");
            if (label) animate(label, { translateX: [0, 4, 0], duration: 320, ease: "outBack(1.5)" });
          };
          const blur = () => gsap.to(field, { scale: 1, boxShadow: "0 0 0 0 transparent", duration: .28, ease: "power2.out" });
          field.addEventListener("focus", focus);
          field.addEventListener("blur", blur);
          cleanups.push(() => {
            field.removeEventListener("focus", focus);
            field.removeEventListener("blur", blur);
          });
        });

        root.querySelectorAll<HTMLElement>("main a, main button").forEach((control) => {
          const icon = control.querySelector<SVGElement>("svg");
          const enter = () => {
            gsap.to(control, { y: -3, duration: .2, ease: "power2.out" });
            if (icon) animate(icon, { translateX: [0, 4], rotate: [0, -6, 0], duration: 340, ease: "outBack(1.5)" });
          };
          const leave = () => gsap.to(control, { y: 0, duration: .25, ease: "power2.out" });
          control.addEventListener("pointerenter", enter);
          control.addEventListener("pointerleave", leave);
          cleanups.push(() => {
            control.removeEventListener("pointerenter", enter);
            control.removeEventListener("pointerleave", leave);
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
          if (action) animate(action, {
            scale: [0.96, 1.035, 1],
            duration: 520,
            delay: 220,
            ease: "outElastic(1,.65)",
          });
        });
        reviewObserver.observe(root, { childList: true, subtree: true });
        cleanups.push(() => reviewObserver.disconnect());

        // Tiny ornamental marks pulse in a short, non-looping sequence.
        const marks = root.querySelectorAll<HTMLElement>("main [aria-hidden='true'].h-2");
        if (marks.length) animate(marks, { scale: [0.7, 1], delay: stagger(70), duration: 460, ease: "outBack(1.7)" });

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
              animate(target, {
                translateY: [isIcon ? 7 : 5, 0],
                scale: isIcon ? [0.76, 1] : [0.985, 1],
                rotate: isIcon ? [-9, 0] : [0, 0],
                duration: isIcon ? 560 : 430,
                ease: isIcon ? "outElastic(1,.6)" : "out(3)",
              });
              accentObserver?.unobserve(target);
            });
          }, { threshold: 0.3 });
          sectionAccents.forEach((target) => accentObserver?.observe(target));
        }
        cleanups.push(() => accentObserver?.disconnect());
      }, root);

      return () => {
        cleanups.forEach((cleanup) => cleanup());
        ctx.revert();
      };
    });

    return () => mm.revert();
  }, []);

  return null;
}
