"use client";
import Link from "next/link";
import { features } from "@/content/site";
import { useDemoData } from "@/hooks/useDemoData";
import { Icon, IconChip, type IconName } from "@/components/ui/Icon";
import { Reveal } from "@/components/motion/Reveal";

/**
 * Shared vertical rhythm for full-width sections. Used by LandingPage and
 * the sections below so spacing stays consistent while scrolling.
 */
export const SECTION_PAD = "px-5 py-20 sm:px-8 sm:py-24 lg:py-28";
export const SECTION_HEADER_MARGIN = "mb-12 sm:mb-16";

/* =========================================================
   STATS BAND — numbers come from the data file, not hardcoded
========================================================= */

export function StatsBand() {
  const { heroReadouts, feedSchedule } = useDemoData();
  const STATS: {
    value: string;
    label: string;
    note: string;
    icon: IconName;
  }[] = [
    {
      value: String(heroReadouts.length),
      label: "Water parameters",
      note: "DO, pH, temperature, salinity, level",
      icon: "droplet",
    },
    {
      value: "24/7",
      label: "Continuous monitoring",
      note: "Sensor telemetry around the clock",
      icon: "clock",
    },
    {
      value: String(feedSchedule.length),
      label: "Feed cycles per day",
      note: "Biomass-adjusted dispensing",
      icon: "utensils",
    },
    {
      value: String(features.length),
      label: "Integrated systems",
      note: "One unified platform",
      icon: "layers",
    },
  ];

  return (
    <section
      aria-label="System at a glance"
      className="border-b border-[var(--sand-dim)] bg-white"
    >
      <div className="mx-auto grid max-w-[1200px] grid-cols-2 gap-px bg-[var(--sand-dim)] md:grid-cols-4">
        {STATS.map((s) => (
          <div
            key={s.label}
            className="group bg-white px-5 py-8 transition-colors duration-200 hover:bg-[#FDFBF6] sm:px-8 sm:py-10"
          >
            <IconChip
              name={s.icon}
              tone="mangrove"
              size={18}
              className="mb-5 transition-transform duration-200 group-hover:-translate-y-0.5"
            />
            <div className="ep-font-display text-[34px] font-semibold leading-none tracking-tight text-[var(--water-deep)] sm:text-[42px]">
              {s.value}
            </div>
            <div className="ep-font-mono mt-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--mangrove)]">
              {s.label}
            </div>
            <div className="mt-1.5 text-[12.5px] leading-[1.5] text-[rgba(11,35,32,0.58)]">
              {s.note}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* =========================================================
   PROCESS FLOW
========================================================= */

const STEPS: { step: string; title: string; body: string; icon: IconName }[] = [
  {
    step: "01",
    title: "Sense",
    icon: "activity",
    body: "Dissolved oxygen, pH, temperature, salinity, and water level sensors stream telemetry to an on-site server and cloud database.",
  },
  {
    step: "02",
    title: "Analyze",
    icon: "eye",
    body: "Machine learning models estimate shrimp growth and biomass directly from camera feeds, with no physical handling.",
  },
  {
    step: "03",
    title: "Act",
    icon: "zap",
    body: "Aerators activate automatically when a parameter crosses its threshold, and feed is dispensed on a biomass-adjusted schedule.",
  },
  {
    step: "04",
    title: "Return",
    icon: "leaf",
    body: "Bio-rich wastewater from the biofloc loop is routed to surrounding mangrove and wetland vegetation.",
  },
];

export function ProcessFlow() {
  return (
    <section
      id="process"
      className={`scroll-mt-[68px] bg-white ${SECTION_PAD}`}
    >
      <div className="mx-auto max-w-[1200px]">
        <Reveal>
          <div className={`max-w-[700px] ${SECTION_HEADER_MARGIN}`}>
            <div className="ep-font-mono mb-3.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--mangrove)]">
              The loop
            </div>
            <h2 className="ep-font-display text-[clamp(30px,4vw,44px)] font-semibold leading-[1.08] tracking-tight text-[var(--water-deep)]">
              From sensor
              <br className="hidden sm:block" />
              to mangrove.
            </h2>
            <p className="mt-4 max-w-[590px] text-[15px] leading-[1.7] text-[rgba(11,35,32,0.62)]">
              Four stages run continuously, so the tank stays in range and
              nothing it doesn&apos;t need goes to waste.
            </p>
          </div>
        </Reveal>

        <div className="relative">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-0 right-0 top-[28px] hidden h-px bg-[var(--sand-dim)] lg:block"
          />
          <ol className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {STEPS.map((s, i) => (
              <li key={s.step} className="relative">
                <Reveal delay={i * 110}>
                  <div className="group">
                    <div className="relative z-10 mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-[var(--sand-dim)] bg-white text-[var(--coral)] shadow-[var(--shadow-sm)] transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-[var(--coral)] group-hover:shadow-[var(--shadow-md)]">
                      <Icon name={s.icon} size={22} />
                    </div>
                    <div className="ep-font-mono mb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[rgba(11,35,32,0.4)]">
                      Step {s.step}
                    </div>
                    <h3 className="ep-font-display mb-2 text-[20px] font-semibold text-[var(--water-deep)]">
                      {s.title}
                    </h3>
                    <p className="text-[13.5px] leading-[1.65] text-[rgba(11,35,32,0.62)]">
                      {s.body}
                    </p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   FAQ — answers match the scope / threshold data
========================================================= */

const FAQS = [
  {
    q: "What species does EcoPrawn support?",
    a: "The system is built for indoor grow-out of white shrimp (Penaeus vannamei), from post-larvae to market size.",
  },
  {
    q: "Which water parameters are monitored?",
    a: "Dissolved oxygen, pH, temperature, salinity, and water level, tracked continuously. Target ranges are DO ≥ 4.5 mg/L, pH 7.5–8.5, 26–30 °C, 10–20 ppt, and water level ≥ 90%.",
  },
  {
    q: "What happens when a reading goes out of range?",
    a: "Parameter-triggered control activates devices such as aerators automatically when a threshold is crossed, and the dashboard raises an alert for the affected tank.",
  },
  {
    q: "How does automated feeding work?",
    a: "Feed is dispensed on a schedule, and the volume is recalculated from the latest AI-estimated biomass so feed conversion stays efficient as the shrimp grow.",
  },
  {
    q: "Can it run outdoors or offshore?",
    a: "No. The system is engineered exclusively for controlled indoor facilities. Open-sea cages and unlined outdoor earthen ponds are out of scope.",
  },
  {
    q: "Does it automate harvesting or run off-grid?",
    a: "No. Harvesting, sorting, and packaging remain manual, and grid connectivity or backup power is still needed when solar availability is insufficient.",
  },
];

export function FaqSection() {
  return (
    <section id="faq" className={`scroll-mt-[68px] ${SECTION_PAD}`}>
      <div className="mx-auto grid max-w-[1200px] gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <Reveal className="lg:sticky lg:top-28 lg:self-start">
          <div className="ep-font-mono mb-3.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--mangrove)]">
            FAQ
          </div>
          <h2 className="ep-font-display text-[clamp(30px,4vw,44px)] font-semibold leading-[1.08] tracking-tight text-[var(--water-deep)]">
            Questions,
            <br className="hidden sm:block" />
            answered plainly.
          </h2>
          <p className="mt-4 max-w-[420px] text-[15px] leading-[1.7] text-[rgba(11,35,32,0.62)]">
            What the system does, and just as important, what it doesn&apos;t.
          </p>
        </Reveal>

        <div className="border-t border-[var(--sand-dim)]">
          {FAQS.map((f, i) => (
            <Reveal key={f.q} delay={i * 60}>
              <details className="group border-b border-[var(--sand-dim)]">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-[15px] font-semibold text-[var(--water-deep)] transition-colors hover:text-[var(--coral)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--coral)] [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <span
                    aria-hidden="true"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--sand-dim)] text-[var(--coral)] transition-all duration-200 group-open:rotate-45 group-open:border-[var(--coral)] group-open:bg-[rgba(232,98,58,0.08)]"
                  >
                    <Icon name="plus" size={15} strokeWidth={2} />
                  </span>
                </summary>
                <p className="pb-5 pr-12 text-[13.5px] leading-[1.7] text-[rgba(11,35,32,0.65)]">
                  {f.a}
                </p>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   FOOTER
========================================================= */

const FOOTER_LINKS: [string, string][] = [
  ["Objectives", "#objectives"],
  ["Systems", "#systems"],
  ["The loop", "#process"],
  ["Scope", "#scope"],
  ["FAQ", "#faq"],
];

const PROJECT_LINES: { icon: IconName; text: string }[] = [
  { icon: "graduation", text: "University of Caloocan City, Congress Campus" },
  { icon: "cpu", text: "Computer Studies Department" },
  { icon: "file-text", text: "Thesis Writing 1, CS 118 · Completed System" },
];

const footerLinkClass =
  "rounded text-[13px] transition-colors hover:text-[var(--coral)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--coral)]";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer
      id="contact"
      className="bg-[#081E22] px-5 pb-8 pt-14 text-[rgba(242,235,221,0.55)] sm:px-8 sm:pt-16"
    >
      <div className="mx-auto max-w-[1200px]">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-[1.6fr_1fr_1.3fr]">
          <div>
            <span className="ep-font-display text-[20px] font-semibold text-[var(--sand)]">
              EcoPrawn
            </span>
            <p className="mt-3 max-w-[380px] text-[12.5px] leading-[1.65]">
              An AIoT-Enabled Indoor White Shrimp Farming &amp; Water Management
              System.
            </p>
          </div>

          <nav aria-label="Footer navigation">
            <div className="ep-font-mono mb-4 text-[10px] uppercase tracking-[0.14em] text-[rgba(242,235,221,0.4)]">
              Explore
            </div>
            <ul className="flex flex-col gap-2.5">
              {FOOTER_LINKS.map(([label, href]) => (
                <li key={label}>
                  <a href={href} className={footerLinkClass}>
                    {label}
                  </a>
                </li>
              ))}
              <li>
                <Link
                  href="/login"
                  className={`${footerLinkClass} inline-flex items-center gap-1.5 font-semibold text-[var(--sand)]`}
                >
                  Sign in
                  <Icon name="arrow-right" size={14} />
                </Link>
              </li>
            </ul>
          </nav>

          <div>
            <div className="ep-font-mono mb-4 text-[10px] uppercase tracking-[0.14em] text-[rgba(242,235,221,0.4)]">
              Project
            </div>
            <ul className="flex flex-col gap-3">
              {PROJECT_LINES.map((l) => (
                <li
                  key={l.text}
                  className="flex gap-2.5 text-[12.5px] leading-[1.6]"
                >
                  <Icon
                    name={l.icon}
                    size={15}
                    className="mt-[3px] shrink-0 text-[var(--coral)]"
                  />
                  {l.text}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-[rgba(242,235,221,0.1)] pt-6 text-[11.5px] sm:flex-row sm:items-center sm:justify-between">
          <span>© {year} EcoPrawn. All rights reserved.</span>
          <a
            href="#top"
            className={`${footerLinkClass} inline-flex items-center gap-1.5 text-[11.5px]`}
          >
            <Icon name="arrow-up" size={13} />
            Back to top
          </a>
        </div>
      </div>
    </footer>
  );
}
