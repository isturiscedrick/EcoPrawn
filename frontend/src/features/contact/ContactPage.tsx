import { SiteHeader } from "@/components//layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { PageHero } from "@/components/layout/PageHero";
import { IconChip, type IconName } from "@/components/ui/Icon";
import { Reveal } from "@/components/motion/Reveal";
import { ContactForm } from "./ContactForm";

const SECTION_PAD = "px-5 py-16 sm:px-8 sm:py-20 lg:py-24";

// Details taken from the site footer. Add an email / phone here when you
// have one you want to publish.
const CONTACT_DETAILS: { label: string; value: string; icon: IconName }[] = [
  { label: "Institution", value: "University of Caloocan City, Congress Campus", icon: "graduation" },
  { label: "Department", value: "Computer Studies Department", icon: "cpu" },
  { label: "Course", value: "Thesis Writing 1, CS 118", icon: "file-text" },
];

export function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-[var(--ep-primary)]">
      <SiteHeader tone="white" />

      <main className="flex-1">
        <PageHero
          kicker="Get in touch"
          title="Contact us."
          lead="Questions about the EcoPrawn system or the thesis behind it? Send a note and we'll get back to you."
        />

        <section className={SECTION_PAD}>
          <div className="mx-auto max-w-[1200px]">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[0.8fr_1.2fr]">
              <Reveal>
                <dl className="flex flex-col gap-4">
                  {CONTACT_DETAILS.map((item) => (
                    <div
                      key={item.label}
                      className="flex items-start gap-4 rounded-2xl border border-[var(--ep-line)] bg-[var(--ep-tint)] p-6 shadow-[0_12px_28px_-24px_rgba(11,46,51,0.45)] transition-transform duration-200 hover:-translate-y-0.5"
                    >
                      <IconChip name={item.icon} tone="coral" size={20} />
                      <div>
                        <dt className="mb-1 text-sm font-semibold uppercase tracking-wide text-[var(--ep-text-muted)]">
                          {item.label}
                        </dt>
                        <dd className="text-lg font-semibold">{item.value}</dd>
                      </div>
                    </div>
                  ))}
                </dl>
              </Reveal>

              <Reveal delay={120}>
                <ContactForm />
              </Reveal>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}