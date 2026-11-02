import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { PageHero } from "@/components/layout/PageHero";
import { Icon, IconChip, type IconName } from "@/components/ui/Icon";
import { Reveal } from "@/components/motion/Reveal";
import { SectionNav } from "./SectionNav";
import { objectives, features, inScope, outOfScope } from "@/content/site";

const SECTION_PAD = "px-5 py-16 sm:px-8 sm:py-20 lg:py-24";
const SECTION_HEADER_MARGIN = "mb-10 sm:mb-14";

const eyebrow =
  "mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--ep-text-muted)]";
const heading =
  "ep-font-display text-[clamp(30px,4vw,44px)] font-semibold leading-[1.1] tracking-tight";
const lead =
  "mt-4 max-w-[36rem] text-lg leading-relaxed text-[var(--ep-text-muted)]";

// One icon per objective / system, in the same order as the arrays in data/ecoprawn.ts.
const OBJECTIVE_ICONS: IconName[] = ["cpu", "droplet", "wifi", "utensils", "camera", "layers"];
const FEATURE_ICONS: IconName[] = ["wrench", "gauge", "eye", "repeat", "leaf"];

export function AboutPage() {
  return (
    <div className="marketing-shell flex min-h-screen flex-col bg-white text-[var(--ep-primary)]">
      <SiteHeader tone="white" />

      <main className="flex-1">
        <PageHero
          kicker="How it works"
          title={
            <>
              One general objective.
              <br className="hidden sm:block" />
              Six systems achieving it.
            </>
          }
          lead="A focused system architecture built around measurable aquaculture outcomes, now fully operational."
        />

        <SectionNav />

        {/* =========================================================
            OBJECTIVES
        ========================================================= */}
        <section id="objectives" className={`scroll-mt-[140px] md:scroll-mt-[150px] ${SECTION_PAD}`}>
          <div className="mx-auto max-w-[1200px]">
            {/* General objective: sand panel with an accent bar, since it is a quotation */}
            <Reveal>
              <div className="mb-6 rounded-3xl border border-l-4 border-[var(--ep-line)] border-l-[var(--ep-accent)] bg-white px-6 py-8 shadow-[0_16px_30px_-28px_rgba(11,46,51,0.5)] sm:px-10 sm:py-10">
                <div className="mb-3 text-sm font-semibold text-[var(--ep-text-muted)]">
                  General objective
                </div>

                <p className="ep-font-display max-w-[52rem] text-xl font-medium leading-relaxed sm:text-2xl">
                  &quot;EcoPrawn was designed and developed as an AIoT-enabled
                  smart aquaculture system that automates water quality
                  monitoring and precision feeding, maintaining suitable
                  aquatic conditions and improving the efficiency of
                  small-scale indoor shrimp farming.&quot;
                </p>
              </div>
            </Reveal>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {objectives.map((objective, i) => (
                <Reveal key={objective.num} delay={(i % 3) * 90} className="h-full">
                  <article className="group h-full rounded-2xl border border-[var(--ep-line)] bg-[var(--ep-surface)] p-6 shadow-[0_12px_28px_-24px_rgba(11,46,51,0.45)] transition-all duration-200 hover:-translate-y-1 hover:border-[var(--ep-accent)] hover:shadow-[0_18px_32px_-24px_rgba(11,46,51,0.6)]">
                    <IconChip
                      name={OBJECTIVE_ICONS[i] ?? "layers"}
                      tone="coral"
                      size={20}
                      className="mb-5"
                    />

                    <h3 className="ep-font-display mb-2 text-xl font-semibold leading-tight transition-colors duration-200 group-hover:text-[var(--ep-accent)]">
                      {objective.title}
                    </h3>

                    <p className="text-base leading-relaxed text-[var(--ep-text-muted)]">
                      {objective.body}
                    </p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================================
            FEATURES / SYSTEMS: sand band with ink outlines, like Home readings
        ========================================================= */}
        <section
          id="systems"
          className={`relative isolate scroll-mt-[140px] overflow-hidden border-y border-[var(--ep-primary)] bg-[var(--ep-primary)] text-[var(--ep-bg)] ${SECTION_PAD}`}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 opacity-90"
            style={{
              backgroundImage:
                "radial-gradient(ellipse at 12% 8%, rgba(35, 111, 117, 0.42), transparent 42%), radial-gradient(ellipse at 88% 76%, rgba(4, 25, 34, 0.7), transparent 48%), radial-gradient(ellipse at 52% 118%, rgba(18, 71, 77, 0.6), transparent 52%), linear-gradient(155deg, #0b2e33 0%, #08272f 48%, #061e27 100%)",
            }}
          />
          <div className="mx-auto max-w-[1200px]">
            <Reveal>
              <div className={`max-w-[700px] ${SECTION_HEADER_MARGIN}`}>
                <div className={eyebrow}>What&apos;s running</div>

                <h2 className={heading}>
                  Five systems,
                  <br className="hidden sm:block" />
                  one tank.
                </h2>

                <p className={`${lead} !text-[rgba(255,255,255,0.88)]`}>
                  Every system below is deployed and operating. Nothing here is
                  a mockup.
                </p>
              </div>
            </Reveal>

            <div className="border-t border-[rgba(255,255,255,0.22)]">
              {features.map((feature, i) => (
                <Reveal key={feature.index}>
                  <article className="group relative grid grid-cols-[2.5rem_1fr] gap-x-4 gap-y-4 border-b border-[rgba(255,255,255,0.22)] px-4 py-8 transition-colors duration-200 hover:bg-[rgba(255,255,255,0.06)] sm:grid-cols-[3.5rem_0.8fr_1.2fr] sm:gap-x-8">
                    <span
                      aria-hidden="true"
                      className="absolute left-0 top-0 h-full w-1 origin-top scale-y-0 bg-[var(--ep-accent)] transition-transform duration-200 group-hover:scale-y-100"
                    />

                    <span
                      aria-hidden="true"
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(255,255,255,0.35)] bg-[rgba(255,255,255,0.08)] text-[var(--ep-accent)]"
                    >
                      <Icon name={FEATURE_ICONS[i] ?? "layers"} size={18} />
                    </span>

                    <div>
                      <div                       className="mb-1 hidden text-sm font-semibold uppercase tracking-wide text-[rgba(255,255,255,0.62)] sm:block">
                        System Module
                      </div>

                      <h3 className="ep-font-display text-xl font-semibold leading-tight transition-colors duration-200 group-hover:text-[var(--ep-accent)] sm:text-2xl">
                        {feature.title}
                      </h3>
                    </div>

                    <div className="col-span-2 flex flex-col gap-3 pl-[3.5rem] sm:col-span-1 sm:pl-0">
                      {feature.points.map((point) => (
                        <div key={point.bold} className="flex gap-3">
                          <span aria-hidden="true" className="text-[var(--ep-accent)]">
                            ›
                          </span>

                          <span className="text-base leading-relaxed text-[rgba(255,255,255,0.82)]">
                            <b className="font-semibold text-[var(--ep-bg)]">{point.bold}</b>{" "}
                            {point.body}
                          </span>
                        </div>
                      ))}
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================================
            SCOPE / LIMITATIONS
        ========================================================= */}
        <section id="scope" className={`scroll-mt-[140px] md:scroll-mt-[150px] ${SECTION_PAD}`}>
          <div className="mx-auto max-w-[1200px]">
            <Reveal>
              <div className={`max-w-[700px] ${SECTION_HEADER_MARGIN}`}>
                <div className={eyebrow}>Boundaries</div>

                <h2 className={heading}>Scope and limitations.</h2>

                <p className={lead}>
                  Stated plainly, so expectations line up with what the system
                  actually does.
                </p>
              </div>
            </Reveal>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {/* In scope: solid outline on white */}
              <Reveal className="h-full">
                <article className="h-full rounded-2xl border-2 border-[var(--ep-primary)] bg-[var(--ep-surface)] p-6 sm:p-8">
                  <div className="mb-6 flex items-center justify-between gap-3">
                    <h3 className="ep-font-display flex items-center gap-3 text-2xl font-semibold">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--ep-ok)] text-white">
                        <Icon name="check" size={18} strokeWidth={2.5} />
                      </span>
                      In scope
                    </h3>

                    <span className="rounded-full border-2 border-[var(--ep-ok)] px-3 py-1 text-sm font-semibold text-[var(--ep-ok)]">
                      Included
                    </span>
                  </div>

                  <div>
                    {inScope.map((item, index) => (
                      <div
                        key={item.title}
                        className={`py-4 ${index !== 0 ? "border-t border-[var(--ep-line)]" : "pt-0"}`}
                      >
                        <div className="flex gap-3">
                          <span className="mt-0.5 text-sm font-semibold tabular-nums text-[var(--ep-ok)]">
                            0{index + 1}
                          </span>

                          <div>
                            <b className="mb-1 block text-base font-semibold">{item.title}</b>
                            <span className="text-base leading-relaxed text-[var(--ep-text-muted)]">
                              {item.body}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </article>
              </Reveal>

              {/* Out of scope: dashed outline on sand, a second signal beyond colour */}
              <Reveal delay={120} className="h-full">
                <article className="h-full rounded-2xl border border-dashed border-[var(--ep-line)] bg-white p-6 shadow-[0_12px_28px_-24px_rgba(11,46,51,0.45)] sm:p-8">
                  <div className="mb-6 flex items-center justify-between gap-3">
                    <h3 className="ep-font-display flex items-center gap-3 text-2xl font-semibold">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--ep-warn-text)] text-white">
                        <Icon name="x" size={18} strokeWidth={2.5} />
                      </span>
                      Out of scope
                    </h3>

                    <span className="rounded-full border-2 border-[var(--ep-warn-text)] px-3 py-1 text-sm font-semibold text-[var(--ep-warn-text)]">
                      Excluded
                    </span>
                  </div>

                  <div>
                    {outOfScope.map((item, index) => (
                      <div
                        key={item.title}
                        className={`py-4 ${index !== 0 ? "border-t border-[var(--ep-line)]" : "pt-0"}`}
                      >
                        <div className="flex gap-3">
                          <span className="mt-0.5 text-sm font-semibold tabular-nums text-[var(--ep-warn-text)]">
                            0{index + 1}
                          </span>

                          <div>
                            <b className="mb-1 block text-base font-semibold">{item.title}</b>
                            <span className="text-base leading-relaxed text-[var(--ep-text-muted)]">
                              {item.body}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </article>
              </Reveal>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}