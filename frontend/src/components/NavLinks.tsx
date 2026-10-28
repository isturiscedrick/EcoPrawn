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
      <nav className="hidden h-full items-center gap-8 md:flex" aria-label="Primary navigation">
        {LANDING_NAV_LINKS.map(([label, href]) => {
          const isActive = href === activeHref;
          return (
            <Link
              key={label}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={`relative flex h-full items-center rounded-sm px-1 text-base font-semibold transition-colors duration-200 ${focusRing} after:absolute after:bottom-[10px] after:left-0 after:right-0 after:h-[3px] after:origin-left after:bg-[var(--ep-accent)] after:transition-transform after:duration-200 ${
                isActive
                  ? "text-[var(--ep-accent)] after:scale-x-100"
                  : "text-[var(--ep-primary)] after:scale-x-0 hover:text-[var(--ep-accent)] hover:after:scale-x-100"
              }`}
            >
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