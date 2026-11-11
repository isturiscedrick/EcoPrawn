import { SiteHeader } from "@/components/layout/SiteHeader";
import { PublicChromeMotion } from "@/components/motion/PublicChromeMotion";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { PageHero } from "@/components/layout/PageHero";
import { IconChip, type IconName } from "@/components/ui/Icon";
import { Reveal } from "@/components/motion/Reveal";
import { ContactForm } from "./ContactForm";
import { ContactMotion } from "@/components/motion/ContactMotion";
import { AquacultureIllustration } from "@/components/illustrations/AquacultureIllustration";

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
      <PublicChromeMotion />
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
          lead="Questions about EcoPrawn? Send us a message."
        />

        <section className="ep-contact-intro px-4 pb-2 pt-12 sm:px-8 sm:pt-16">
          <div className="ep-contact-intro-panel mx-auto grid w-full max-w-[1200px] gap-6 rounded-[1.75rem] border border-[var(--ep-line)] bg-[var(--ep-tint)] p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center lg:p-10">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.16em] text-[var(--ep-accent)]">Start a conversation</p>
              <h2 className="ep-font-display mt-3 max-w-[18ch] text-[clamp(1.75rem,3.8vw,2.75rem)] font-semibold leading-[1.08] tracking-[-.045em] text-[var(--ep-text)]">
                Tell us what you want to understand better.
              </h2>
              <p className="mt-3 max-w-[42rem] text-sm leading-relaxed text-[var(--ep-text-muted)] sm:text-base">
                Share a question about the platform, its monitoring systems, or the project. The details below help you identify the team behind EcoPrawn.
              </p>
            </div>
            <div className="ep-contact-visuals" aria-hidden="true">
              <AquacultureIllustration variant="contact" />
              <div className="ep-contact-signal">
                <span className="ep-contact-signal-ring ep-contact-signal-ring-one" />
                <span className="ep-contact-signal-ring ep-contact-signal-ring-two" />
                <span className="ep-contact-signal-ring ep-contact-signal-ring-three" />
                <span className="ep-contact-signal-core" />
              </div>
            </div>
            {/* Contact signal is decorative; the message form remains the actual contact action. */}
            {/*
            <div aria-hidden="true" className="ep-contact-signal">
              <span className="ep-contact-signal-ring ep-contact-signal-ring-one" />
              <span className="ep-contact-signal-ring ep-contact-signal-ring-two" />
              <span className="ep-contact-signal-ring ep-contact-signal-ring-three" />
              <span className="ep-contact-signal-core" />
            </div>
            */}
          </div>
        </section>

        <section className={SECTION_PAD}>
          <div className="mx-auto max-w-[1200px]">
            <div className="mb-5 max-w-[32rem]">
              <p className="text-xs font-bold uppercase tracking-[.16em] text-[var(--ep-accent)]">Contact details</p>
              <h2 className="ep-font-display mt-2 text-2xl font-semibold tracking-tight text-[var(--ep-text)] sm:text-3xl">Find the right starting point.</h2>
              <p className="mt-2 text-sm leading-relaxed text-[var(--ep-text-muted)]">Use the form to send your message, and refer to the project details here.</p>
            </div>
            <div className="grid grid-cols-1 items-stretch gap-5 sm:gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-8">
              <Reveal>
                <dl data-contact-details="" className="flex flex-col gap-4">
                  {CONTACT_DETAILS.map((item) => (
                    <div
                      key={item.label}
                      data-contact-card=""
                      className="flex min-w-0 items-start gap-4 rounded-2xl border border-[var(--ep-line)] bg-[var(--ep-surface)] p-4 shadow-[0_12px_28px_-24px_rgba(11,46,51,0.45)] transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-[var(--ep-accent)] hover:shadow-[0_18px_32px_-24px_rgba(11,46,51,0.6)]"
                    >
                      <IconChip name={item.icon} tone="brand" size={20} />
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