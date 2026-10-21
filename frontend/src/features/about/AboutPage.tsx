import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { objectives, features, inScope, outOfScope } from "@/data/ecoprawn";

const SECTION_PAD = "px-5 py-20 sm:px-8 sm:py-24 lg:py-28";
const SECTION_HEADER_MARGIN = "mb-12 sm:mb-16";

export function AboutPage() {
  return (
    <div className="min-h-screen bg-[var(--sand)] text-[var(--water-deep)]">
      <SiteHeader />

      {/* =========================================================
          OBJECTIVES
      ========================================================= */}
      <section id="objectives" className={SECTION_PAD}>
        <div className="mx-auto max-w-[1200px]">
          <div className={`max-w-[680px] ${SECTION_HEADER_MARGIN}`}>
            <div className="ep-font-mono mb-3.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--mangrove)]">
              How it works
            </div>

            <h1 className="ep-font-display text-[clamp(30px,4vw,44px)] font-semibold leading-[1.08] tracking-tight text-[var(--water-deep)]">
              One general objective.
              <br className="hidden sm:block" />
              Six systems achieving it.
            </h1>

            <p className="mt-4 max-w-[590px] text-[15px] leading-[1.7] text-[rgba(11,35,32,0.62)]">
              A focused system architecture built around measurable
              aquaculture outcomes — now fully operational.
            </p>
          </div>

          {/* General objective */}
          <div className="relative mb-6 overflow-hidden rounded-2xl bg-[var(--water-deep)] px-6 py-8 text-[var(--sand)] shadow-[0_20px_50px_-25px_rgba(11,35,32,0.4)] sm:px-10 sm:py-10">
            <div
              aria-hidden="true"
              className="absolute -right-20 -top-24 h-[280px] w-[280px] rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(232,98,58,0.22), transparent 70%)",
              }}
            />

            <div className="relative z-10 flex flex-col gap-7 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-[720px]">
                <div className="ep-font-mono mb-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--coral)]">
                  General Objective
                </div>

                <p className="ep-font-display text-[19px] font-medium italic leading-[1.6] sm:text-[21px]">
                  &quot;EcoPrawn was designed and developed as an AIoT-enabled
                  smart aquaculture system that automates water quality
                  monitoring and precision feeding — maintaining suitable
                  aquatic conditions and improving the efficiency of
                  small-scale indoor shrimp farming.&quot;
                </p>
              </div>

              <div className="hidden shrink-0 lg:block">
                <div className="ep-font-mono rounded-full border border-[rgba(242,235,221,0.12)] px-3 py-1.5 text-[9px] uppercase tracking-[0.12em] text-[rgba(242,235,221,0.55)]">
                  Core Objective
                </div>
              </div>
            </div>
          </div>

          {/* Objective cards — a thin connecting rule ties the six
              sub-objectives back to the single general objective above,
              since they genuinely are its component parts rather than
              unrelated feature tiles. */}
          <div className="relative grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute left-0 right-0 top-[26px] hidden h-px bg-[var(--sand-dim)] lg:block"
            />
            {objectives.map((objective) => (
              <article
                key={objective.num}
                className="group relative rounded-xl border border-[var(--sand-dim)] bg-white p-5 transition-all duration-200 hover:-translate-y-1 hover:border-[var(--mangrove-light)] hover:shadow-[0_18px_36px_-16px_rgba(11,35,32,0.2)]"
              >
                <div className="mb-7 flex items-center justify-between">
                  <span className="ep-font-mono text-[11px] font-semibold text-[var(--coral)]">
                    {objective.num}
                  </span>

                  <span className="flex h-6 w-6 items-center justify-center rounded-md border border-[var(--sand-dim)] text-[11px] text-[rgba(11,35,32,0.4)] transition-all group-hover:border-[var(--mangrove-light)] group-hover:text-[var(--mangrove)]">
                    ↗
                  </span>
                </div>

                <h3 className="ep-font-display mb-2 text-[16px] font-semibold leading-tight text-[var(--water-deep)]">
                  {objective.title}
                </h3>

                <p className="text-[12.5px] leading-[1.6] text-[rgba(11,35,32,0.62)]">
                  {objective.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          FEATURES / SYSTEMS
      ========================================================= */}
      <section
        id="systems"
        className={`bg-[var(--water-deep)] text-[var(--sand)] ${SECTION_PAD}`}
      >
        <div className="mx-auto max-w-[1200px]">
          <div className={`max-w-[700px] ${SECTION_HEADER_MARGIN}`}>
            <div className="ep-font-mono mb-3.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--coral)]">
              What&apos;s running
            </div>

            <h2 className="ep-font-display text-[clamp(30px,4vw,44px)] font-semibold leading-[1.08] tracking-tight">
              Five systems,
              <br className="hidden sm:block" />
              one tank.
            </h2>

            <p className="mt-4 max-w-[590px] text-[15px] leading-[1.7] text-[rgba(242,235,221,0.68)]">
              Every system below is deployed and operating — nothing here is
              a mockup.
            </p>
          </div>

          <div className="border-t border-[rgba(242,235,221,0.12)]">
            {features.map((feature) => (
              <article
                key={feature.index}
                className="group relative grid grid-cols-[38px_1fr] gap-5 border-b border-[rgba(242,235,221,0.12)] py-7 pl-0 transition-all duration-200 hover:bg-[rgba(242,235,221,0.025)] hover:pl-3 sm:grid-cols-[55px_0.8fr_1.2fr] sm:gap-7 sm:py-8 lg:grid-cols-[65px_0.8fr_1.2fr] lg:gap-8"
              >
                <span
                  aria-hidden="true"
                  className="absolute left-0 top-0 h-full w-[3px] origin-top scale-y-0 bg-[var(--coral)] transition-transform duration-200 group-hover:scale-y-100"
                />

                <div className="ep-font-mono pt-1 text-[11px] font-medium text-[var(--mangrove-light)]">
                  {feature.index}
                </div>

                <div>
                  <div className="mb-2 hidden text-[9px] uppercase tracking-[0.12em] text-[rgba(242,235,221,0.4)] sm:block">
                    System Module
                  </div>

                  <h3 className="ep-font-display text-[20px] font-semibold leading-tight transition-colors group-hover:text-[var(--coral)] sm:text-[21px]">
                    {feature.title}
                  </h3>
                </div>

                <div className="col-span-2 flex flex-col gap-3 pl-[58px] sm:col-span-1 sm:pl-0">
                  {feature.points.map((point) => (
                    <div key={point.bold} className="flex gap-3">
                      <span aria-hidden="true" className="mt-[2px] text-[var(--coral)]">
                        ›
                      </span>

                      <span className="text-[13px] leading-[1.65] text-[rgba(242,235,221,0.72)] sm:text-[13.5px]">
                        <b className="font-semibold text-[var(--sand)]">{point.bold}</b>{" "}
                        {point.body}
                      </span>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          SCOPE / LIMITATIONS
      ========================================================= */}
      <section id="scope" className={SECTION_PAD}>
        <div className="mx-auto max-w-[1200px]">
          <div className={`max-w-[700px] ${SECTION_HEADER_MARGIN}`}>
            <div className="ep-font-mono mb-3.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--mangrove)]">
              Boundaries
            </div>

            <h2 className="ep-font-display text-[clamp(30px,4vw,44px)] font-semibold leading-[1.08] tracking-tight text-[var(--water-deep)]">
              Scope and limitations.
            </h2>

            <p className="mt-4 max-w-[590px] text-[15px] leading-[1.7] text-[rgba(11,35,32,0.62)]">
              Stated plainly, so expectations line up with what the system
              actually does.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* In scope */}
            <article className="rounded-2xl border border-[var(--sand-dim)] bg-white p-6 shadow-[0_12px_32px_-24px_rgba(11,35,32,0.3)] sm:p-8">
              <div className="mb-7 flex items-center justify-between">
                <h3 className="ep-font-display flex items-center gap-2.5 text-[20px] font-semibold text-[var(--water-deep)]">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[rgba(126,173,135,0.12)]">
                    <span className="h-2.5 w-2.5 rounded-[3px] bg-[var(--mangrove)]" />
                  </span>
                  In scope
                </h3>

                <span className="ep-font-mono rounded-full bg-[rgba(126,173,135,0.1)] px-2.5 py-1 text-[8px] uppercase tracking-[0.1em] text-[var(--mangrove)]">
                  Included
                </span>
              </div>

              <div>
                {inScope.map((item, index) => (
                  <div
                    key={item.title}
                    className={`py-4 ${index !== 0 ? "border-t border-[rgba(11,35,32,0.08)]" : "pt-0"}`}
                  >
                    <div className="flex gap-3">
                      <span className="ep-font-mono mt-0.5 text-[9px] text-[var(--mangrove)]">
                        0{index + 1}
                      </span>

                      <div>
                        <b className="mb-1 block text-[13.5px] font-semibold text-[var(--water-deep)]">
                          {item.title}
                        </b>

                        <span className="text-[13px] leading-[1.6] text-[rgba(11,35,32,0.62)]">
                          {item.body}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </article>

            {/* Out of scope — a dashed border reinforces "boundary /
                excluded" as a distinct signal from the solid-bordered
                "in scope" card, beyond just the warm color shift. */}
            <article className="rounded-2xl border border-dashed border-[#D8C296] bg-[#FBF6EC] p-6 shadow-[0_12px_32px_-24px_rgba(11,35,32,0.25)] sm:p-8">
              <div className="mb-7 flex items-center justify-between">
                <h3 className="ep-font-display flex items-center gap-2.5 text-[20px] font-semibold text-[var(--water-deep)]">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[rgba(181,139,57,0.1)]">
                    <span className="h-2.5 w-2.5 rounded-[3px] bg-[var(--amber)]" />
                  </span>
                  Out of scope
                </h3>

                <span className="ep-font-mono rounded-full bg-[rgba(181,139,57,0.1)] px-2.5 py-1 text-[8px] uppercase tracking-[0.1em] text-[var(--amber)]">
                  Excluded
                </span>
              </div>

              <div>
                {outOfScope.map((item, index) => (
                  <div
                    key={item.title}
                    className={`py-4 ${index !== 0 ? "border-t border-[rgba(11,35,32,0.08)]" : "pt-0"}`}
                  >
                    <div className="flex gap-3">
                      <span className="ep-font-mono mt-0.5 text-[9px] text-[var(--amber)]">
                        0{index + 1}
                      </span>

                      <div>
                        <b className="mb-1 block text-[13.5px] font-semibold text-[var(--water-deep)]">
                          {item.title}
                        </b>

                        <span className="text-[13px] leading-[1.6] text-[rgba(11,35,32,0.62)]">
                          {item.body}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}