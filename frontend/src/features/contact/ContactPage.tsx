import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ContactForm } from "./ContactForm";

const SECTION_PAD = "px-5 py-20 sm:px-8 sm:py-24 lg:py-28";

// Details taken from the site footer. Add an email / phone here when you
// have one you want to publish.
const CONTACT_DETAILS = [
  { label: "Institution", value: "University of Caloocan City, Congress Campus" },
  { label: "Department", value: "Computer Studies Department" },
  { label: "Course", value: "Thesis Writing 1, CS 118" },
];

export function ContactPage() {
  return (
    <div className="min-h-screen bg-[var(--sand)] text-[var(--water-deep)]">
      <SiteHeader />

      <section className={SECTION_PAD}>
        <div className="mx-auto max-w-[1200px]">
          <div className="mb-12 max-w-[680px] sm:mb-16">
            <div className="ep-font-mono mb-3.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--mangrove)]">
              Get in touch
            </div>

            <h1 className="ep-font-display text-[clamp(30px,4vw,44px)] font-semibold leading-[1.08] tracking-tight text-[var(--water-deep)]">
              Contact us.
            </h1>

            <p className="mt-4 max-w-[590px] text-[15px] leading-[1.7] text-[rgba(11,35,32,0.62)]">
              Questions about the EcoPrawn system or the thesis behind it?
              Send a note and we&apos;ll get back to you.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="flex flex-col gap-3">
              {CONTACT_DETAILS.map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-[var(--sand-dim)] bg-white p-5"
                >
                  <div className="ep-font-mono mb-1.5 text-[10px] uppercase tracking-wide text-[rgba(11,35,32,0.5)]">
                    {item.label}
                  </div>
                  <div className="text-[14px] font-semibold text-[var(--water-deep)]">
                    {item.value}
                  </div>
                </div>
              ))}
            </div>

            <ContactForm />
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}