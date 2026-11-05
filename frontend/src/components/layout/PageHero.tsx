import type { ReactNode } from "react";

interface PageHeroProps {
  kicker: string;
  title: ReactNode;
  lead: string;
}

const GRID_STYLE = {
  backgroundImage: "radial-gradient(var(--ep-secondary) 1px, transparent 1px)",
  backgroundSize: "22px 22px",
  WebkitMaskImage: "radial-gradient(ellipse at 60% 40%, black 25%, transparent 72%)",
  maskImage: "radial-gradient(ellipse at 60% 40%, black 25%, transparent 72%)",
} as const;

/** Landing-style hero shared by the About and Contact pages. */
export function PageHero({ kicker, title, lead }: PageHeroProps) {
  return (
    <section data-page-hero="" className="relative isolate overflow-hidden text-[var(--ep-text)]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-[10%] -z-10 h-[120%] opacity-[0.16]"
        style={GRID_STYLE}
      />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 ep-hero-atmosphere" />

      <div className="relative z-10 mx-auto max-w-[1200px] px-5 pb-16 pt-14 sm:px-8 sm:pb-20 sm:pt-20">
        <p
          data-page-kicker=""
          className="mb-5 inline-flex items-center gap-2 rounded-full border border-[var(--ep-line)] bg-[var(--ep-surface)] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--ep-accent)] shadow-sm"
        >
          <span aria-hidden="true" className="ep-pulse-dot h-2 w-2 rounded-full bg-[var(--ep-accent)]" />
          {kicker}
        </p>

        <h1 data-page-hero-headline="" className="ep-font-display max-w-[900px] text-[clamp(40px,5.2vw,76px)] font-bold leading-[1.08] tracking-[-0.05em] text-[var(--ep-text)] [&_[data-page-hero-accent]]:text-[var(--ep-accent)]">
          {title}
        </h1>

        <p data-page-lead="" className="mt-6 max-w-[40rem] text-base leading-[1.75] text-[var(--ep-text-muted)] sm:text-lg">
          {lead}
        </p>
      </div>
    </section>
  );
}