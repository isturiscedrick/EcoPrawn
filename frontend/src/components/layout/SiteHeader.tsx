"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandMark } from "./BrandMark";
import { NavLinks } from "./NavLinks";
import { AuthLink } from "@/features/auth/AuthModalProvider";

interface SiteHeaderProps {
  showLinks?: boolean;
  /** "auth" = compact header for login pages (smaller logo, back link instead of Log in). */
  variant?: "default" | "auth";
}

const focusRing =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ep-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ep-bg)]";

export function SiteHeader({ showLinks = true, variant = "default" }: SiteHeaderProps) {
  const isAuth = variant === "auth";
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Solid background always; a darker border and shadow appear once the page scrolls.
  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll while the mobile menu is open.
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
      className={`sticky top-0 z-50 border-b bg-[var(--ep-bg)] transition-shadow duration-200 ${
        scrolled
          ? "border-[var(--ep-primary)] shadow-[0_6px_16px_-10px_rgba(11,46,51,0.4)]"
          : "border-[var(--ep-line)]"
      }`}
    >
      <div
        className={`flex h-[72px] items-center justify-between gap-3 md:h-20 ${
          isAuth
            ? "w-full px-5 sm:px-8 lg:px-12 xl:px-16"
            : "mx-auto max-w-310 px-5 sm:px-8 lg:px-10"
        }`}
      >
        <Link
          href="/"
          className={`flex shrink-0 items-center rounded-md transition-opacity duration-200 hover:opacity-80 ${focusRing}`}
          aria-label="EcoPrawn home"
        >
          <span className="md:hidden">
  <BrandMark size={isAuth ? 42 : 48} />
</span>

<span className="hidden md:block">
  <BrandMark size={isAuth ? 54 : 76} />
</span>
        </Link>

        {showLinks && <NavLinks variant="desktop" activeHref={pathname} />}

        <div className="flex shrink-0 items-center gap-2">
          {isAuth ? (
            <Link
              href="/"
              className={`group inline-flex items-center gap-1.5 rounded-xl border-2 border-[var(--ep-primary)] px-4 py-2 text-sm font-semibold text-[var(--ep-primary)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--ep-primary)] hover:text-[var(--ep-bg)] active:translate-y-0 sm:px-5 ${focusRing}`}
            >
              <span
                aria-hidden="true"
                className="inline-block transition-transform duration-200 group-hover:-translate-x-1"
              >
                ←
              </span>
              Back to home
            </Link>
          ) : (
            <AuthLink
              className={`group inline-flex items-center gap-1.5 rounded-xl border-2 border-[var(--ep-primary)] bg-[var(--ep-primary)] px-4 py-2 text-sm font-semibold text-[var(--ep-bg)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--ep-primary-soft)] hover:shadow-[0_8px_18px_-10px_rgba(11,46,51,0.7)] active:translate-y-0 sm:px-5 ${focusRing}`}
            >
              Log in
              <span
                aria-hidden="true"
                className="inline-block transition-transform duration-200 group-hover:translate-x-1"
              >
                →
              </span>
            </AuthLink>
          )}

          {showLinks && (
            <button
              type="button"
              onClick={() => setMobileNavOpen((v) => !v)}
              aria-expanded={mobileNavOpen}
              aria-controls="mobile-nav-panel"
              aria-label={mobileNavOpen ? "Close menu" : "Open menu"}
              className={`relative flex h-11 w-11 items-center justify-center rounded-lg border-2 border-[var(--ep-primary)] text-[var(--ep-primary)] transition-colors duration-200 hover:bg-[var(--ep-primary)] hover:text-[var(--ep-bg)] md:hidden ${focusRing}`}
            >
              <span className="sr-only">Toggle navigation</span>
              <svg
                width="18"
                height="18"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M1.5 4H14.5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  className={`origin-center transition-all duration-200 ${
                    mobileNavOpen ? "translate-y-[3.5px] rotate-45" : ""
                  }`}
                />
                <path
                  d="M1.5 8H14.5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  className={`origin-center transition-opacity duration-150 ${
                    mobileNavOpen ? "opacity-0" : "opacity-100"
                  }`}
                />
                <path
                  d="M1.5 12H14.5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  className={`origin-center transition-all duration-200 ${
                    mobileNavOpen ? "translate-y-[-3.5px] -rotate-45" : ""
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
              activeHref={pathname}
              onLinkClick={() => setMobileNavOpen(false)}
            />
          </div>
        </div>
      )}
    </header>
  );
}