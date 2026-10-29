
"use client";

import { useEffect, useState } from "react";

const ITEMS = [
  ["objectives", "Objectives"],
  ["systems", "Systems"],
  ["scope", "Scope"],
] as const;

export function SectionNav() {
  const [active, setActive] = useState<string>("objectives");

  useEffect(() => {
    const sections = ITEMS.map(([id]) =>
      document.getElementById(id)
    ).filter(
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
      {
        rootMargin: "-30% 0px -60% 0px",
      }
    );

    sections.forEach((section) => {
      observer.observe(section);
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <nav
      aria-label="On this page"
      className="
        sticky
        top-[72px] md:top-[80px]
        z-40
        border-b border-[var(--ep-line)]
        bg-[var(--ep-bg)]
        shadow-[0_4px_12px_-8px_rgba(11,46,51,0.2)]
      "
    >
      <div
        className="
          mx-auto flex max-w-[1200px]
          items-center gap-3
          overflow-x-auto
          px-5 py-4
          sm:px-8
          [scrollbar-width:none]
          [&::-webkit-scrollbar]:hidden
        "
      >
        {ITEMS.map(([id, label]) => {
          const isActive = active === id;

          return (
            <a
              key={id}
              href={`#${id}`}
              aria-current={
                isActive ? "location" : undefined
              }
              className={`
                inline-flex min-h-[38px]
                shrink-0 items-center justify-center
                rounded-full border-2
                border-[var(--ep-primary)]
                px-5 py-2
                text-sm font-semibold
                transition-all duration-200
                focus:outline-none
                focus-visible:ring-2
                focus-visible:ring-[var(--ep-accent)]
                focus-visible:ring-offset-2
                focus-visible:ring-offset-[var(--ep-bg)]
                ${
                  isActive
                    ? "bg-[var(--ep-primary)] text-[var(--ep-bg)]"
                    : "bg-transparent text-[var(--ep-primary)] hover:bg-[var(--ep-tint)]"
                }
              `}
            >
              {label}
            </a>
          );
        })}
      </div>
    </nav>
  );
}
