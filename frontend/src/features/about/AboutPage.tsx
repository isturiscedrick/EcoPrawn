import { PublicPageLayout } from "@/components/layout/PublicPageLayout";
import { SurfaceCard } from "@/components/ui/SurfaceCard";
import { PageHero } from "@/components/layout/PageHero";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { Icon, IconChip, type IconName } from "@/components/ui/Icon";
import { Reveal } from "@/components/motion/Reveal";
import { AboutMotion } from "@/components/motion/AboutMotion";
import { SectionNav } from "./SectionNav";
import { objectives, features, inScope, outOfScope } from "@/content/site";

const SECTION_PAD = "px-4 py-16 sm:px-8 sm:py-24";
const SECTION_HEADER_MARGIN = "mb-10 sm:mb-14";

// One icon per objective / system, in the same order as the arrays in content/site.ts.
const OBJECTIVE_ICONS: IconName[] = ["cpu", "droplet", "wifi", "utensils", "camera", "layers"];
const FEATURE_ICONS: IconName[] = ["wrench", "gauge", "eye", "repeat", "leaf"];

export function AboutPage() {
  return (
    <PublicPageLayout className="ep-about-page" motion={<AboutMotion />}>
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

        {/* =========================================================
            OBJECTIVES
        ========================================================= */}
        <section id="objectives" className={`w-full box-border scroll-mt-[140px] md:scroll-mt-[150px] ${SECTION_PAD}`}>
          <div className="ep-about-content-frame mx-auto w-full max-w-[1200px]">
            <Reveal>
              <SurfaceCard className="ep-about-objective mb-6 px-6 py-8 sm:px-10 sm:py-10">
                <div className="mb-3 text-sm font-semibold text-[var(--ep-text-muted)]">
                  General objective
                </div>

                <p className="ep-font-display max-w-[52rem] text-xl font-medium leading-relaxed sm:text-2xl">
                  &quot;An AIoT-enabled system for water monitoring, precision feeding, and healthier indoor shrimp farming.&quot;
                </p>
              </SurfaceCard>
            </Reveal>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {objectives.map((objective, i) => (
                <Reveal key={objective.num} delay={(i % 3) * 90} className="h-full">
                  <SurfaceCard as="article" className="group h-full p-6 shadow-[0_12px_28px_-24px_rgba(11,46,51,0.45)] transition-all duration-200 hover:-translate-y-1 hover:border-[var(--ep-accent)] hover:shadow-[0_18px_32px_-24px_rgba(11,46,51,0.6)]">
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
                  </SurfaceCard>
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
              "radial-gradient(ellipse at 12% 8%, rgba(139,213,166,.16), transparent 42%), radial-gradient(ellipse at 88% 76%, rgba(0,0,0,.28), transparent 48%)",
            backgroundRepeat: "no-repeat",
            backgroundSize: "100% 100%",
            backgroundPosition: "center",
          }}
        >
          <div className="ep-about-content-frame mx-auto w-full max-w-[1200px]">
            <Reveal>
              <SectionHeading
                kicker={"What's running"}
                marker="zone"
                tone="inverse"
                className={`max-w-[700px] ${SECTION_HEADER_MARGIN}`}
                title={
                  <>
                    Five systems,
                    <br className="hidden sm:block" />
                    one tank.
                  </>
                }
                description="Integrated tools built for everyday farm operations."
              />
            </Reveal>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, i) => (
                <Reveal key={feature.index} className="h-full">
                  <SurfaceCard as="article" tone="inverse" className="group h-full p-6 transition-all duration-200 hover:-translate-y-1 hover:border-[var(--ep-marker)] hover:bg-white/[0.09]">
                    <div className="mb-5 flex items-center gap-4">
                      <span
                        aria-hidden="true"
                        className="flex h-11 w-11 shrink-0 items-center justify-center text-[var(--ep-marker)]"
                      >
                        <Icon name={FEATURE_ICONS[i] ?? "layers"} size={19} />
                      </span>
                      <div className="min-w-0">
                        
                        <h3 className="ep-font-display text-xl font-semibold leading-tight transition-colors duration-200 group-hover:text-[var(--ep-marker)] sm:text-2xl">
                          {feature.title}
                        </h3>
                      </div>
                    </div>

                    <div className="flex min-w-0 flex-col gap-3">
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
                  </SurfaceCard>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================================
            SCOPE / LIMITATIONS
        ========================================================= */}
        <section id="scope" className={`w-full box-border scroll-mt-[140px] md:scroll-mt-[150px] ${SECTION_PAD}`}>
          <div className="ep-about-content-frame mx-auto w-full max-w-[1200px]">
            <Reveal>
              <SectionHeading
                kicker="Boundaries"
                className={`max-w-[700px] ${SECTION_HEADER_MARGIN}`}
                title="Scope and limitations."
                description={
                  <>
                    Stated plainly, so expectations line up with what the system
                    actually does.
                  </>
                }
              />
            </Reveal>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {/* In scope */}
              <Reveal className="h-full">
                <SurfaceCard as="article" className="h-full p-6 sm:p-8">
                  <div className="mb-6 flex items-center justify-between gap-3">
                    <h3 className="ep-font-display flex items-center gap-3 text-2xl font-semibold">
                      <span className="flex h-8 w-8 items-center justify-center text-[var(--ep-text-muted)]">
                        <Icon name="check" size={18} strokeWidth={2.5} />
                      </span>
                      In scope
                    </h3>

                    <span className="text-sm font-semibold text-[var(--ep-text-muted)]">Included</span>
                  </div>

                  <div>
                    {inScope.map((item, index) => (
                      <div
                        key={item.title}
                        className={`py-4 ${index !== 0 ? "pt-4" : "pt-0"}`}
                      >
                        <div className="flex gap-3">
                          

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
                </SurfaceCard>
              </Reveal>

              {/* Out of scope */}
              <Reveal delay={120} className="h-full">
                <SurfaceCard as="article" className="ep-about-outscope h-full p-6 sm:p-8">
                  <div className="mb-6 flex items-center justify-between gap-3">
                    <h3 className="ep-font-display flex items-center gap-3 text-2xl font-semibold">
                      <span className="flex h-8 w-8 items-center justify-center text-[var(--ep-text-muted)]">
                        <Icon name="x" size={18} strokeWidth={2.5} />
                      </span>
                      Out of scope
                    </h3>

                    <span className="text-sm font-semibold text-[var(--ep-text-muted)]">Excluded</span>
                  </div>

                  <div>
                    {outOfScope.map((item, index) => (
                      <div
                        key={item.title}
                        className={`py-4 ${index !== 0 ? "pt-4" : "pt-0"}`}
                      >
                        <div className="flex gap-3">
                          

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
                </SurfaceCard>
              </Reveal>
            </div>
          </div>
        </section>
    </PublicPageLayout>
  );
}