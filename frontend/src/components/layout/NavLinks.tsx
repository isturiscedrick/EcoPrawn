import Link from "next/link";
import { LANDING_NAV_LINKS } from "@/config/nav";

interface NavLinksProps {
  variant: "desktop" | "mobile";
  activeHref: string;
  onLinkClick?: () => void;
}

const focusRing =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ep-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ep-bg)]";

export function NavLinks({ variant, activeHref, onLinkClick }: NavLinksProps) {
  if (variant === "desktop") {
    return (
      <nav
        className="hidden items-center gap-1 rounded-xl border border-[rgba(11,46,51,0.16)] bg-[var(--ep-surface)]/70 p-1 md:flex"
        aria-label="Primary navigation"
      >
        {LANDING_NAV_LINKS.map(([label, href]) => {
          const isActive = href === activeHref;
          return (
            <Link
              key={label}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-sm font-semibold leading-none transition-colors duration-200 ${focusRing} ${
                isActive
                  ? "bg-[var(--ep-primary)] text-[var(--ep-bg)]"
                  : "text-[var(--ep-primary)] hover:bg-[var(--ep-tint)]"
              }`}
            >
              <span aria-hidden="true" className="inline-flex shrink-0 items-center justify-center">
                {label === "Home" ? (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="m4 10 8-6 8 6v9a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-9Z" /><path d="M9 20v-6h6v6" /></svg>
                ) : label === "About" ? (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="9" /><path d="M12 10v6M12 7h.01" /></svg>
                ) : (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 5h16v12H4z" /><path d="m4 7 8 6 8-6M8 21h8" /></svg>
                )}
              </span>
              {label}
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <nav
      id="mobile-nav-panel"
      aria-label="Mobile navigation"
      className="border-t border-[var(--ep-line)] bg-[var(--ep-bg)] px-5 py-2 md:hidden"
    >
      <ul className="flex flex-col">
        {LANDING_NAV_LINKS.map(([label, href]) => {
          const isActive = href === activeHref;
          return (
            <li key={label}>
              <Link
                href={href}
                onClick={onLinkClick}
                aria-current={isActive ? "page" : undefined}
                className={`group flex items-center gap-3 rounded-md px-1.5 py-3 text-base font-semibold transition-colors duration-200 hover:bg-[var(--ep-tint)] ${focusRing} ${
                  isActive
                    ? "text-[var(--ep-accent)]"
                    : "text-[var(--ep-primary)] hover:text-[var(--ep-accent)]"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`h-2.5 w-2.5 rounded-full transition-colors duration-200 ${
                    isActive
                      ? "bg-[var(--ep-accent)]"
                      : "bg-transparent group-hover:bg-[var(--ep-line)]"
                  }`}
                />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}