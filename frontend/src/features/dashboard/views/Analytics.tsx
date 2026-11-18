import { Feeding } from "./Feeding";
import { VisionGrowth } from "./VisionGrowth";
import { WaterQuality } from "./WaterQuality";

export function Analytics() {
  return (
    <>
      <div className="dashboard-page-header mb-6 border-b border-[var(--ep-line)] pb-6">
        <div className="ep-font-mono mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ep-primary)]">
          Production intelligence
        </div>
        <h1 className="ep-font-display text-[26px] font-semibold leading-tight tracking-[-0.02em] text-[var(--ep-text)] sm:text-[30px]">
          Analytics
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--ep-text-muted)]">
          Growth and vision insights, water-quality monitoring, and feeding performance in one place.
        </p>
      </div>

      <nav aria-label="Analytics sections" className="mb-6 flex flex-wrap gap-2">
        <a href="#analytics-growth" className="inline-flex min-h-10 items-center rounded-full border border-[var(--ep-line)] bg-[var(--ep-surface)] px-4 text-xs font-semibold text-[var(--ep-text)] transition-colors hover:border-[var(--ep-accent)] hover:bg-[var(--ep-tint)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ep-primary)]">
          01 · Growth &amp; Vision
        </a>
        <a href="#analytics-water" className="inline-flex min-h-10 items-center rounded-full border border-[var(--ep-line)] bg-[var(--ep-surface)] px-4 text-xs font-semibold text-[var(--ep-text)] transition-colors hover:border-[var(--ep-accent)] hover:bg-[var(--ep-tint)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ep-primary)]">
          02 · Water Quality
        </a>
        <a href="#analytics-feeding" className="inline-flex min-h-10 items-center rounded-full border border-[var(--ep-line)] bg-[var(--ep-surface)] px-4 text-xs font-semibold text-[var(--ep-text)] transition-colors hover:border-[var(--ep-accent)] hover:bg-[var(--ep-tint)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ep-primary)]">
          03 · Feeding
        </a>
      </nav>

      <section id="analytics-growth" aria-label="Growth and vision analytics" className="mb-8 scroll-mt-6">
        <VisionGrowth />
      </section>

      <section id="analytics-water" aria-label="Water quality analytics" className="mb-8 scroll-mt-6">
        <WaterQuality />
      </section>

      <section id="analytics-feeding" aria-label="Feeding analytics" className="mb-8 scroll-mt-6">
        <Feeding />
      </section>
    </>
  );
}
