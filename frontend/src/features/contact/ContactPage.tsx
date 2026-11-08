import { PublicPageLayout } from "@/components/layout/PublicPageLayout";
import { SurfaceCard } from "@/components/ui/SurfaceCard";
import { PageHero } from "@/components/layout/PageHero";
import { IconChip, type IconName } from "@/components/ui/Icon";
import { Reveal } from "@/components/motion/Reveal";
import { ContactForm } from "./ContactForm";
import { ContactMotion } from "@/components/motion/ContactMotion";

const SECTION_PAD = "px-4 py-16 sm:px-8 sm:py-24";

// Details taken from the site footer. Add an email / phone here when you
// have one you want to publish.
const CONTACT_DETAILS: { label: string; value: string; icon: IconName }[] = [
  { label: "Institution", value: "University of Caloocan City, Congress Campus", icon: "graduation" },
  { label: "Department", value: "Computer Studies Department", icon: "cpu" },
  { label: "Course", value: "Thesis Writing 1, CS 118", icon: "file-text" },
];

export function ContactPage() {
  return (
    <PublicPageLayout className="ep-contact-page" motion={<ContactMotion />}>
        <PageHero
          kicker="Get in touch"
          title={
            <>
              <span data-page-hero-accent="">Contact</span>
              <span> us.</span>
            </>
          }
          lead="Questions about EcoPrawn? Send us a message."
        />

        <section className={SECTION_PAD}>
          <div className="mx-auto max-w-[1200px]">
            <div className="grid grid-cols-1 items-stretch gap-5 sm:gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-8">
              <Reveal>
                <dl data-contact-details="" className="flex flex-col gap-4">
                  {CONTACT_DETAILS.map((item) => (
                    <SurfaceCard
                      key={item.label}
                      data-contact-card=""
                      className="flex items-start gap-3 p-4 shadow-[0_8px_20px_-18px_rgba(11,46,51,0.35)]"
                    >
                      <span className="shrink-0"><IconChip name={item.icon} tone="brand" size={20} /></span>
                      <div className="min-w-0 flex-1">
                        <dt className="mb-1 text-sm font-semibold uppercase tracking-wide text-[var(--ep-text-muted)]">
                          {item.label}
                        </dt>
                        <dd className="min-w-0 break-words [overflow-wrap:anywhere] text-sm font-semibold leading-relaxed text-[var(--ep-text)] sm:text-base lg:text-lg">{item.value}</dd>
                      </div>
                    </SurfaceCard>
                  ))}
                </dl>
              </Reveal>

              <Reveal delay={120} className="h-full">
                <div data-contact-form="" className="h-full">
                  <ContactForm />
                </div>
              </Reveal>
            </div>
          </div>
        </section>
    </PublicPageLayout>
  );
}