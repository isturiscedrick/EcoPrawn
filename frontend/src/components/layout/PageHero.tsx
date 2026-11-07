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

      <div className="relative z-10 mx-auto flex w-full max-w-[1200px] flex-col items-center px-4 pb-10 pt-24 text-center sm:px-8 sm:pb-16 sm:pt-28 lg:pb-20 lg:pt-32">
        <p
          data-page-kicker=""
          className="mb-4 inline-flex max-w-full flex-wrap items-center justify-center gap-2 rounded-full border border-[var(--ep-line)] bg-[var(--ep-surface)] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] sm:px-4 sm:text-[11px] sm:tracking-[0.16em] text-[var(--ep-accent)] shadow-sm"
        >
          <span aria-hidden="true" className="ep-pulse-dot h-2 w-2 rounded-full bg-[var(--ep-accent)]" />
          {kicker}
        </p>

        <h1 data-page-hero-headline="" className="ep-font-display mx-auto w-full max-w-[1000px] text-balance text-[clamp(2.35rem,10vw,4.75rem)] sm:text-[clamp(40px,5.2vw,76px)] font-bold leading-[1.04] tracking-[-0.05em] text-[var(--ep-text)] [&_[data-page-hero-accent]]:text-[var(--ep-accent)]">
          {title}
        </h1>

        <p data-page-lead="" className="mx-auto mt-4 max-w-[42rem] text-pretty text-base leading-[1.75] text-[var(--ep-text-muted)] sm:mt-6 sm:text-lg">
          {lead}
        </p>
      </div>
    </section>
  );
}