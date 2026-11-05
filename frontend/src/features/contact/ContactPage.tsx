import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
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
    <div className="ep-landing ep-contact-page flex min-h-screen flex-col">
      <ContactMotion />
      <SiteHeader tone="white" integrated />

      <main className="flex-1">
        <PageHero
          kicker="Get in touch"
          title={
            <>
              <span data-page-hero-accent="">Contact</span>
              <span> us.</span>
            </>
          }
          lead="Questions about the EcoPrawn system or the thesis behind it? Send a note and we'll get back to you."
        />

        <section className={SECTION_PAD}>
          <div className="mx-auto max-w-[1200px]">
            <div className="grid grid-cols-1 items-stretch gap-5 sm:gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-8">
              <Reveal>
                <dl data-contact-details="" className="flex flex-col gap-4">
                  {CONTACT_DETAILS.map((item) => (
                    <div
                      key={item.label}
                      data-contact-card=""
                      className="flex min-w-0 items-start gap-4 rounded-2xl border border-[var(--ep-line)] bg-[var(--ep-surface)] p-4 shadow-[0_12px_28px_-24px_rgba(11,46,51,0.45)] transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-[var(--ep-accent)] hover:shadow-[0_18px_32px_-24px_rgba(11,46,51,0.6)]"
                    >
                      <IconChip name={item.icon} tone="coral" size={20} />
                      <div className="min-w-0">
                        <dt className="mb-1 text-sm font-semibold uppercase tracking-wide text-[var(--ep-text-muted)]">
                          {item.label}
                        </dt>
                        <dd className="break-words text-sm font-semibold leading-relaxed text-[var(--ep-text)] sm:text-lg">{item.value}</dd>
                      </div>
                    </div>
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
      </main>

      <SiteFooter />
    </div>
  );
}