import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Reveal } from "@/components/Reveal";
import { ContactForm } from "./ContactForm";

const SECTION_PAD = "px-5 py-16 sm:px-8 sm:py-20 lg:py-24";

// Details taken from the site footer. Add an email / phone here when you
// have one you want to publish.
const CONTACT_DETAILS = [
  { label: "Institution", value: "University of Caloocan City, Congress Campus" },
  { label: "Department", value: "Computer Studies Department" },
  { label: "Course", value: "Thesis Writing 1, CS 118" },
];

export function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--ep-bg)] text-[var(--ep-primary)]">
      <SiteHeader />

      <main className="flex-1">
        <section className={SECTION_PAD}>
          <div className="mx-auto max-w-[1200px]">
            <Reveal>
              <div className="mb-10 max-w-[700px] sm:mb-14">
                <div className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--ep-text-muted)]">
                  Get in touch
                </div>

                <h1 className="ep-font-display text-[clamp(30px,4vw,44px)] font-semibold leading-[1.1] tracking-tight">
                  Contact us.
                </h1>

                <p className="mt-4 max-w-[36rem] text-lg leading-relaxed text-[var(--ep-text-muted)]">
                  Questions about the EcoPrawn system or the thesis behind it?
                  Send a note and we&apos;ll get back to you.
                </p>
              </div>
            </Reveal>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[0.8fr_1.2fr]">
              <Reveal>
                <dl className="flex flex-col gap-4">
                  {CONTACT_DETAILS.map((item) => (
                    <div
                      key={item.label}
                      className="rounded-2xl border-2 border-[var(--ep-primary)] bg-[var(--ep-tint)] p-5"
                    >
                      <dt className="mb-1 text-sm font-semibold uppercase tracking-wide text-[var(--ep-text-muted)]">
                        {item.label}
                      </dt>
                      <dd className="text-lg font-semibold">{item.value}</dd>
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