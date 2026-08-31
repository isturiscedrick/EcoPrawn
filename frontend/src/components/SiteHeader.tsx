"use client";

import { useState } from "react";
import Link from "next/link";
import { BrandMark } from "./BrandMark";
import { NavLinks } from "./NavLinks";

interface SiteHeaderProps {
  showLinks?: boolean;
}

export function SiteHeader({ showLinks = true }: SiteHeaderProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[rgba(11,35,32,0.08)] bg-[var(--sand)]/95 backdrop-blur-md">
      <div className="mx-auto flex h-[64px] max-w-[1240px] items-center justify-between px-5 sm:px-8 lg:px-10">
        <Link
          href="/"
          className="group flex items-center gap-2.5 text-[var(--coral)] rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--coral)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--sand)]"
          aria-label="EcoPrawn home"
        >
          <BrandMark size={64} />
        </Link>

        {showLinks && <NavLinks variant="desktop" />}

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="rounded-xl bg-[var(--water-deep)] px-4 py-2 text-[11px] font-semibold text-[var(--sand)] shadow-[0_8px_20px_-10px_rgba(11,35,32,0.7)] transition-all hover:-translate-y-0.5 hover:bg-[#123F43] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--coral)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--sand)] sm:px-5 sm:text-[12px]"
          >
            Log in
          </Link>

          {showLinks && (
            <button
              type="button"
              onClick={() => setMobileNavOpen((v) => !v)}
              aria-expanded={mobileNavOpen}
              aria-controls="mobile-nav-panel"
              aria-label={mobileNavOpen ? "Close menu" : "Open menu"}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[rgba(11,35,32,0.12)] text-[var(--water-deep)] transition-colors hover:bg-[rgba(11,35,32,0.05)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--coral)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--sand)] md:hidden"
            >
              <span className="sr-only">Toggle navigation</span>
              {mobileNavOpen ? (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M2 2L14 14M14 2L2 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M1.5 4H14.5M1.5 8H14.5M1.5 12H14.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>

      {showLinks && mobileNavOpen && (
        <NavLinks variant="mobile" onLinkClick={() => setMobileNavOpen(false)} />
      )}
    </header>
  );
}
