import { SiteHeader } from "@/components/layout/SiteHeader";
import { PublicChromeMotion } from "@/components/motion/PublicChromeMotion";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { PageHero } from "@/components/layout/PageHero";
import { Icon, IconChip, type IconName } from "@/components/ui/Icon";
import { Reveal } from "@/components/motion/Reveal";
import { AboutMotion } from "@/components/motion/AboutMotion";
import { SectionNav } from "./SectionNav";
import { objectives, features, inScope, outOfScope } from "@/content/site";

const SECTION_PAD = "px-4 py-16 sm:px-8 sm:py-24";
const SECTION_HEADER_MARGIN = "mb-10 sm:mb-14";

// Same eyebrow / heading scale as the landing sections.
const eyebrow = "mb-4 flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.14em]";
const heading =
  "ep-font-display text-[clamp(28px,3.6vw,42px)] font-semibold leading-[1.12] tracking-tight";
const lead = "mt-3 max-w-[36rem] text-lg leading-relaxed text-[var(--ep-text-muted)]";

// One icon per objective / system, in the same order as the arrays in content/site.ts.
const OBJECTIVE_ICONS: IconName[] = ["cpu", "droplet", "wifi", "utensils", "camera", "layers"];
const FEATURE_ICONS: IconName[] = ["wrench", "gauge", "eye", "repeat", "leaf"];

export function AboutPage() {
  return (
    <div className="ep-landing ep-about-page flex min-h-screen flex-col">
      <AboutMotion />
      <PublicChromeMotion />
      <SiteHeader tone="white" integrated />

      <main className="flex-1">
        <PageHero
          kicker="How it works"
          title={
            <>
              <span data-page-hero-accent="">One platform.</span>
              <br className="hidden sm:block" />
              <span>Six connected systems.</span>
            </>
          }
          lead="Connected tools for smarter, more efficient shrimp farming."
        />

        <SectionNav />

        <section id="mission" className="ep-about-mission px-4 py-14 sm:px-8 sm:py-20">
          <div className="ep-about-mission-panel mx-auto grid w-full max-w-[1200px] gap-8 overflow-hidden rounded-[2rem] border border-[var(--ep-line)] bg-[var(--ep-surface)] p-6 sm:p-10 lg:grid-cols-[1.1fr_.9fr] lg:items-center lg:p-14">
            <div className="relative z-10">
              <div className={`${eyebrow} text-[var(--ep-text-muted)]`}>
                <span aria-hidden="true" className="h-2 w-2 bg-[var(--ep-accent)]" />
                Our purpose
              </div>
              <h2 className="ep-font-display max-w-[15ch] text-[clamp(2rem,4.5vw,3.75rem)] font-semibold leading-[1.04] tracking-[-.055em]">
                Better visibility for every stage of shrimp farming.
              </h2>
              <p className="mt-5 max-w-[38rem] text-base leading-relaxed text-[var(--ep-text-muted)] sm:text-lg">
                EcoPrawn brings water monitoring, growth observation, and farm operations into a connected workflow—helping teams see conditions more clearly and respond with context.
              </p>
              <a href="#systems" className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-[var(--ep-accent)] transition-transform hover:translate-x-1">
                Explore the connected systems <Icon name="arrow-right" size={17} />
              </a>
            </div>
            <div aria-hidden="true" className="ep-about-orbit-visual">
              <span className="ep-about-orbit ep-about-orbit-a" />
              <span className="ep-about-orbit ep-about-orbit-b" />
              <span className="ep-about-orbit ep-about-orbit-c" />
              <span className="ep-about-orbit-node ep-about-orbit-node-one" />
              <span className="ep-about-orbit-node ep-about-orbit-node-two" />
              <span className="ep-about-orbit-node ep-about-orbit-node-three" />
              <span className="ep-about-orbit-core">
                <Icon name="droplet" size={42} strokeWidth={1.6} />
                <Icon name="waves" size={34} strokeWidth={1.7} />
              </span>
              <span className="ep-about-orbit-tag ep-about-orbit-tag-top">
                <Icon name="droplet" size={17} />
                <span><b>WATER</b><small>Quality &amp; clarity</small></span>
              </span>
              <span className="ep-about-orbit-tag ep-about-orbit-tag-right">
                <Icon name="activity" size={17} />
                <span><b>INSIGHT</b><small>Readings &amp; trends</small></span>
              </span>
              <span className="ep-about-orbit-tag ep-about-orbit-tag-bottom">
                <Icon name="zap" size={17} />
                <span><b>ACTION</b><small>Farm workflows</small></span>
              </span>
            </div>
          </div>
        </section>

        {/* =========================================================
            OBJECTIVES
        ========================================================= */}
        <section id="objectives" className={`w-full box-border scroll-mt-[140px] md:scroll-mt-[150px] ${SECTION_PAD}`}>
          <div className="ep-about-content-frame mx-auto w-full max-w-[1200px]">
            <Reveal>
              <div className="ep-about-objective mb-6 rounded-3xl border border-l-4 border-[var(--ep-line)] border-l-[var(--ep-accent)] bg-[var(--ep-surface)] px-6 py-8 shadow-[0_16px_30px_-28px_rgba(15,23,42,0.18)] sm:px-10 sm:py-10">
                <div className="mb-3 text-sm font-semibold text-[var(--ep-text-muted)]">
                  General objective
                </div>

                <p className="ep-font-display max-w-[52rem] text-xl font-medium leading-relaxed sm:text-2xl">
                  &quot;An AIoT-enabled system for water monitoring, precision feeding, and healthier indoor shrimp farming.&quot;
                </p>
              </div>
            </Reveal>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {objectives.map((objective, i) => (
                <Reveal key={objective.num} delay={(i % 3) * 90} className="h-full">
                  <article className="group h-full rounded-2xl border border-[var(--ep-line)] bg-[var(--ep-surface)] p-6 shadow-[0_12px_28px_-24px_rgba(15,23,42,0.16)] transition-all duration-200 hover:-translate-y-1 hover:border-[var(--ep-accent)] hover:shadow-[0_18px_32px_-24px_rgba(15,23,42,0.22)]">
                    <IconChip
                      name={OBJECTIVE_ICONS[i] ?? "layers"}
                      tone="brand"
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
            SYSTEMS: deep-water band, same tokens as the landing readings band
        ========================================================= */}
        <section
          id="systems"
          className={`relative isolate box-border w-full max-w-none mx-0 scroll-mt-[140px] overflow-hidden bg-[var(--ep-deep)] text-[var(--ep-on-deep)] ${SECTION_PAD}`}
          style={{
            backgroundColor: "var(--ep-deep)",
            backgroundImage:
              "radial-gradient(ellipse at 12% 8%, rgba(96,165,250,.10), transparent 42%), radial-gradient(ellipse at 88% 76%, rgba(0,0,0,.28), transparent 48%)",
            backgroundRepeat: "no-repeat",
            backgroundSize: "100% 100%",
            backgroundPosition: "center",
          }}
        >
          <div className="ep-about-content-frame mx-auto w-full max-w-[1200px]">
            <Reveal>
              <div className={`max-w-[700px] ${SECTION_HEADER_MARGIN}`}>
                <div className={`${eyebrow} text-[var(--ep-on-deep-muted)]`}>
                  <span aria-hidden="true" className="h-2 w-2 bg-[var(--ep-zone)]" />
                  What&apos;s running
                </div>

                <h2 className={heading}>
                  Five systems,
                  <br className="hidden sm:block" />
                  one tank.
                </h2>

                <p className="mt-3 max-w-[36rem] text-lg leading-relaxed text-[var(--ep-on-deep-muted)]">
                  Integrated tools built for everyday farm operations.
                </p>
              </div>
            </Reveal>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, i) => (
                <Reveal key={feature.index} className="h-full">
                  <article className="group h-full rounded-2xl border border-white/20 bg-white/[0.06] p-6 transition-all duration-200 hover:-translate-y-1 hover:border-[var(--ep-marker)] hover:bg-white/[0.09]">
                    <div className="mb-5 flex items-center gap-4">
                      <span
                        aria-hidden="true"
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/35 text-[var(--ep-marker)]"
                      >
                        <Icon name={FEATURE_ICONS[i] ?? "layers"} size={19} />
                      </span>
                      <div className="min-w-0">
                        <div className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--ep-on-deep-muted)]">
                          System module {String(i + 1).padStart(2, "0")}
                        </div>
                        <h3 className="ep-font-display text-xl font-semibold leading-tight transition-colors duration-200 group-hover:text-[var(--ep-marker)] sm:text-2xl">
                          {feature.title}
                        </h3>
                      </div>
                    </div>

                    <div className="flex min-w-0 flex-col gap-3 border-t border-white/15 pt-5">
                      {feature.points.map((point) => (
                        <div key={point.bold} className="flex min-w-0 gap-3">
                          <span aria-hidden="true" className="shrink-0 text-[var(--ep-marker)]">
                            ›
                          </span>
                          <span className="min-w-0 break-words text-sm leading-relaxed text-[var(--ep-on-deep-muted)] sm:text-base">
                            <b className="font-semibold text-[var(--ep-on-deep)]">{point.bold}</b>{" "}
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

        <section className="ep-about-journey px-4 py-14 sm:px-8 sm:py-20" aria-labelledby="ep-about-journey-title">
          <div className="mx-auto w-full max-w-[1200px]">
            <Reveal>
              <div className="mb-10 max-w-[42rem]">
                <div className={`${eyebrow} text-[var(--ep-text-muted)]`}>
                  <span aria-hidden="true" className="h-2 w-2 bg-[var(--ep-accent)]" />
                  A connected workflow
                </div>
                <h2 id="ep-about-journey-title" className={heading}>From water conditions to informed action.</h2>
                <p className={lead}>Each part contributes to a clearer picture of what is happening across the farm.</p>
              </div>
            </Reveal>
            <ol className="ep-about-journey-grid grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { step: "01", title: "Observe", body: "Collect water-quality readings and monitor changing conditions.", icon: "activity" as const },
                { step: "02", title: "Interpret", body: "Bring readings and growth observations into one operational view.", icon: "eye" as const },
                { step: "03", title: "Coordinate", body: "Use operating context to guide aeration and feeding workflows.", icon: "sliders-horizontal" as const },
                { step: "04", title: "Manage", body: "Include biofloc and effluent routing in the production picture.", icon: "leaf" as const },
              ].map((item) => (
                <li key={item.step} className="ep-about-journey-card rounded-2xl border border-[var(--ep-line)] bg-[var(--ep-surface)] p-5 sm:p-6">
                  <div className="mb-8 flex items-center justify-between">
                    <span className="text-xs font-bold tracking-[.16em] text-[var(--ep-accent)]">{item.step}</span>
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-[var(--ep-tint)] text-[var(--ep-accent)]"><Icon name={item.icon} size={21} /></span>
                  </div>
                  <h3 className="ep-font-display text-xl font-semibold text-[var(--ep-text)]">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--ep-text-muted)]">{item.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* =========================================================
            SCOPE / LIMITATIONS
        ========================================================= */}
        <section id="scope" className={`w-full box-border scroll-mt-[140px] md:scroll-mt-[150px] ${SECTION_PAD}`}>
          <div className="ep-about-content-frame mx-auto w-full max-w-[1200px]">
            <Reveal>
              <div className={`max-w-[700px] ${SECTION_HEADER_MARGIN}`}>
                <div className={`${eyebrow} text-[var(--ep-text-muted)]`}>
                  <span aria-hidden="true" className="h-2 w-2 bg-[var(--ep-accent)]" />
                  Boundaries
                </div>

                <h2 className={heading}>Scope and limitations.</h2>

                <p className={lead}>
                  Stated plainly, so expectations line up with what the system
                  actually does.
                </p>
              </div>
            </Reveal>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {/* In scope: solid outline */}
              <Reveal className="h-full">
                <article className="h-full rounded-2xl border-2 border-[var(--ep-primary)] bg-[var(--ep-surface)] p-6 sm:p-8">
                  <div className="mb-6 flex items-center justify-between gap-3">
                    <h3 className="ep-font-display flex items-center gap-3 text-2xl font-semibold">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--ep-accent)] text-[var(--ep-on-status)]">
                        <Icon name="check" size={18} strokeWidth={2.5} />
                      </span>
                      In scope
                    </h3>

                    <span className="rounded-full border-2 border-[var(--ep-accent)] px-3 py-1 text-sm font-semibold text-[var(--ep-accent)]">
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
                          <span className="mt-0.5 text-sm font-semibold tabular-nums text-[var(--ep-accent)]">
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

              {/* Out of scope: dashed outline, a second signal beyond colour */}
              <Reveal delay={120} className="h-full">
                <article className="ep-about-outscope h-full rounded-2xl border border-dashed border-[var(--ep-line)] bg-[var(--ep-surface)] p-6 shadow-[0_12px_28px_-24px_rgba(15,23,42,0.16)] sm:p-8">
                  <div className="mb-6 flex items-center justify-between gap-3">
                    <h3 className="ep-font-display flex items-center gap-3 text-2xl font-semibold">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--ep-accent)] text-[var(--ep-on-status)]">
                        <Icon name="x" size={18} strokeWidth={2.5} />
                      </span>
                      Out of scope
                    </h3>

                    <span className="rounded-full border-2 border-[var(--ep-accent)] px-3 py-1 text-sm font-semibold text-[var(--ep-accent)]">
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
                          <span className="mt-0.5 text-sm font-semibold tabular-nums text-[var(--ep-accent)]">
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