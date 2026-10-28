"use client";

import { useEffect, useState } from "react";

const ITEMS = [
  ["objectives", "Objectives"],
  ["systems", "Systems"],
  ["scope", "Scope"],
] as const;

export function SectionNav() {
  const [active, setActive] = useState<string>(ITEMS[0][0]);

  useEffect(() => {
    const sections = ITEMS.map(([id]) => document.getElementById(id)).filter(
      (el): el is HTMLElement => el !== null
    );

    // A thin band around 30-40% down the viewport decides the active section.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-30% 0px -60% 0px" }
    );

    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <nav
      aria-label="On this page"
      className="sticky top-[calc(4rem+1px)] z-40 border-b border-[var(--ep-line)] bg-[var(--ep-bg)]"
    >
      <div className="mx-auto flex max-w-[1200px] gap-2 overflow-x-auto px-5 py-2.5 sm:px-8">
        {ITEMS.map(([id, label]) => {
          const isActive = active === id;
          return (
            <a
              key={id}
              href={`#${id}`}
              aria-current={isActive ? "true" : undefined}
              className={`inline-flex shrink-0 items-center rounded-full border-2 border-[var(--ep-primary)] px-4 py-1.5 text-sm font-semibold transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ep-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ep-bg)] ${
                isActive
                  ? "bg-[var(--ep-primary)] text-[var(--ep-bg)]"
                  : "text-[var(--ep-primary)] hover:bg-[var(--ep-tint)]"
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