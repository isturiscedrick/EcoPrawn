import type { ReactNode } from "react";
import { Bubbles } from "@/components/illustrations/Bubbles";
import { WaveEdge } from "@/components/illustrations/WaveEdge";

interface PageHeroProps {
  kicker: string;
  title: ReactNode;
  lead: string;
}

/** Deep-water header band shared by the About and Contact pages. */
export function PageHero({ kicker, title, lead }: PageHeroProps) {
  return (
    <section className="relative isolate overflow-hidden bg-[var(--ep-primary)] text-[var(--ep-bg)]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(700px circle at 85% 0%, rgba(95,184,196,0.22), transparent 60%), linear-gradient(180deg, var(--ep-primary-soft) 0%, var(--ep-primary) 100%)",
        }}
      />
      <Bubbles />

      <div className="relative z-10 mx-auto max-w-[1200px] px-5 pb-24 pt-14 sm:px-8 sm:pb-28 sm:pt-20">
        <p className="mb-5 inline-flex items-center gap-2 rounded-full border-2 border-[rgba(242,235,221,0.35)] px-3.5 py-1.5 text-sm font-semibold">
          <span
            aria-hidden="true"
            className="ep-pulse-dot h-2 w-2 rounded-full bg-[var(--mangrove-light)]"
          />
          {kicker}
        </p>

        <h1 className="ep-font-display text-[clamp(34px,5vw,56px)] font-semibold leading-[1.08] tracking-tight">
          {title}
        </h1>

        <p className="mt-5 max-w-[36rem] text-lg leading-relaxed text-[rgba(242,235,221,0.82)]">
          {lead}
        </p>
      </div>

      <WaveEdge className="bottom-[-1px] z-20 text-[var(--ep-bg)]" />
    </section>
  );
}