import { useEffect, useState } from "react";

const ITEMS = [
  ["objectives", "Objectives"],
  ["systems", "Systems"],
  ["scope", "Scope"],
] as const;

export function SectionNav() {
  const [active, setActive] = useState<string>("objectives");

  useEffect(() => {
    const sections = ITEMS.map(([id]) => document.getElementById(id)).filter(
      (el): el is HTMLElement => el !== null
    );

    // Detect which section is currently visible.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        }
      },
      { rootMargin: "-22% 0px -58% 0px", threshold: 0 }
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  return (
    <nav
      aria-label="On this page"
      className="sticky top-[64px] z-40 border-b border-[var(--ep-line)] bg-[color-mix(in_srgb,var(--ep-bg)_92%,transparent)] backdrop-blur-xl md:top-[66px]"
    >
      <div className="mx-auto flex max-w-[1200px] items-center gap-2 overflow-x-auto overscroll-x-contain px-4 py-2.5 sm:gap-3 sm:px-8 sm:py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {ITEMS.map(([id, label]) => {
          const isActive = active === id;

          return (
            <a
              key={id}
              href={`#${id}`}
              aria-current={isActive ? "location" : undefined}
              className={`inline-flex min-h-10 shrink-0 items-center justify-center rounded-full border px-4 py-2 text-xs font-semibold sm:px-5 sm:text-sm font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ep-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ep-bg)] ${
                isActive
                  ? "border-[var(--ep-accent)] bg-[var(--ep-accent)] text-[var(--ep-on-accent)]"
                  : "border-[var(--ep-line)] bg-[var(--ep-surface)] text-[var(--ep-text)] hover:border-[var(--ep-accent)] hover:text-[var(--ep-accent)]"
              }`}
            >
              {label}
            </a>
          );
        })}
      </div>
    </nav>
  );
}