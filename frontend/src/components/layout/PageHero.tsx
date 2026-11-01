import type { ReactNode } from "react";

interface PageHeroProps {
  kicker: string;
  title: ReactNode;
  lead: string;
}

/** Landing-style hero shared by the About and Contact pages. */
export function PageHero({ kicker, title, lead }: PageHeroProps) {
  return (
    <section className="relative isolate overflow-hidden bg-white text-[var(--ep-primary)]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(640px circle at 82% 30%, rgba(95,184,196,0.16), transparent 62%), radial-gradient(520px circle at 8% 95%, rgba(178,63,28,0.07), transparent 60%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(var(--ep-primary) 1px, transparent 1px), linear-gradient(90deg, var(--ep-primary) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          WebkitMaskImage: "radial-gradient(ellipse at 60% 40%, black 25%, transparent 72%)",
          maskImage: "radial-gradient(ellipse at 60% 40%, black 25%, transparent 72%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-[1200px] px-5 pb-16 pt-14 sm:px-8 sm:pb-20 sm:pt-20">
        <p className="mb-5 inline-flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.14em] text-[var(--ep-text-muted)]">
          <span
            aria-hidden="true"
            className="ep-pulse-dot h-2 w-2 rounded-full bg-[var(--ep-ok)]"
          />
          {kicker}
        </p>

        <h1 className="ep-font-display max-w-[52rem] text-[clamp(40px,5.4vw,68px)] font-semibold leading-[1.06] tracking-tight">
          {title}
        </h1>

        <p className="mt-6 max-w-[40rem] text-lg leading-relaxed text-[var(--ep-text-muted)]">
          {lead}
        </p>
      </div>
    </section>
  );
}