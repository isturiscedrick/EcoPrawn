"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BrandMark } from "./BrandMark";
import { NavLinks } from "./NavLinks";
import { LANDING_NAV_LINKS } from "@/config/nav";

interface SiteHeaderProps {
  showLinks?: boolean;
}

export function SiteHeader({ showLinks = true }: SiteHeaderProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [activeHref, setActiveHref] = useState(LANDING_NAV_LINKS[0][1]);
  const [scrolled, setScrolled] = useState(false);

  // Elevate the header with a soft shadow + slightly denser background
  // once the page has scrolled, so it reads as "lifted" above content
  // instead of always looking flat against the hero.
  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Scroll-spy: highlight whichever section the user has scrolled past
  // most recently, so the nav always reflects where they actually are.
  // Walking sections by offsetTop against scroll position is more
  // reliable here than IntersectionObserver ratios, which can misfire
  // when sections have very different heights (e.g. a tall hero next
  // to a short Objectives section).
  useEffect(() => {
    if (!showLinks) return;

    const sectionIds = LANDING_NAV_LINKS.map(([, href]) => href.replace("#", ""));

    function onScroll() {
      const sections = sectionIds
        .map((id) => document.getElementById(id))
        .filter((el): el is HTMLElement => el !== null);

      if (sections.length === 0) return;

      const scrollPos = window.scrollY + 80; // offset past sticky header

      let current = sections[0];
      for (const section of sections) {
        if (section.offsetTop <= scrollPos) {
          current = section;
        }
      }

      setActiveHref(`#${current.id}`);
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [showLinks]);

  // Lock body scroll while the mobile menu is open so the page behind
  // it doesn't scroll along with the panel.
  useEffect(() => {
    if (mobileNavOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [mobileNavOpen]);

  // Close mobile menu on Escape for keyboard users.
  useEffect(() => {
    if (!mobileNavOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setMobileNavOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileNavOpen]);

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-all duration-300 ${
        scrolled
          ? "border-[rgba(11,35,32,0.1)] bg-[var(--sand)]/98 shadow-[0_8px_24px_-16px_rgba(11,35,32,0.35)] backdrop-blur-md"
          : "border-[rgba(11,35,32,0.06)] bg-[var(--sand)]/90 backdrop-blur-sm"
      }`}
    >
      <div className="mx-auto flex h-[64px] max-w-[1240px] items-center justify-between px-5 sm:px-8 lg:px-10">
        <Link
          href="/"
          className="group flex items-center gap-2.5 rounded-md text-[var(--coral)] transition-opacity duration-200 hover:opacity-85 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--coral)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--sand)]"
          aria-label="EcoPrawn home"
        >
          <BrandMark size={64} />
        </Link>

        {showLinks && <NavLinks variant="desktop" activeHref={activeHref} />}

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="group inline-flex items-center gap-1.5 rounded-xl bg-[var(--water-deep)] px-4 py-2 text-[11px] font-semibold text-[var(--sand)] shadow-[0_8px_20px_-10px_rgba(11,35,32,0.7)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#123F43] hover:shadow-[0_10px_24px_-10px_rgba(11,35,32,0.8)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--coral)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--sand)] sm:px-5 sm:text-[12px]"
          >
            Log in
            <span
              aria-hidden="true"
              className="text-[10px] transition-transform duration-200 group-hover:translate-x-0.5"
            >
              →
            </span>
          </Link>

          {showLinks && (
            <button
              type="button"
              onClick={() => setMobileNavOpen((v) => !v)}
              aria-expanded={mobileNavOpen}
              aria-controls="mobile-nav-panel"
              aria-label={mobileNavOpen ? "Close menu" : "Open menu"}
              className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-[rgba(11,35,32,0.12)] text-[var(--water-deep)] transition-colors duration-200 hover:border-[rgba(11,35,32,0.22)] hover:bg-[rgba(11,35,32,0.05)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--coral)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--sand)] md:hidden"
            >
              <span className="sr-only">Toggle navigation</span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
                className="transition-transform duration-200"
              >
                <path
                  d="M1.5 4H14.5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  className={`origin-center transition-all duration-200 ${
                    mobileNavOpen ? "translate-y-[3.5px] rotate-45" : ""
                  }`}
                />
                <path
                  d="M1.5 8H14.5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  className={`origin-center transition-opacity duration-150 ${
                    mobileNavOpen ? "opacity-0" : "opacity-100"
                  }`}
                />
                <path
                  d="M1.5 12H14.5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  className={`origin-center transition-all duration-200 ${
                    mobileNavOpen ? "-translate-y-[3.5px] -rotate-45" : ""
                  }`}
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {showLinks && (
        <div
          className={`grid overflow-hidden transition-all duration-300 ease-out md:hidden ${
            mobileNavOpen
              ? "visible grid-rows-[1fr] opacity-100"
              : "invisible grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="min-h-0">
            <NavLinks
              variant="mobile"
              activeHref={activeHref}
              onLinkClick={() => setMobileNavOpen(false)}
            />
          </div>
        </div>
      )}
    </header>
  );
}