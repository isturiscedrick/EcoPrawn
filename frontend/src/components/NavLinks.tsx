import { LANDING_NAV_LINKS } from "@/config/nav";

interface NavLinksProps {
  variant: "desktop" | "mobile";
  activeHref: string;
  onLinkClick?: () => void;
}

export function NavLinks({ variant, activeHref, onLinkClick }: NavLinksProps) {
  if (variant === "desktop") {
    return (
      <nav className="hidden h-full items-center gap-7 md:flex" aria-label="Primary navigation">
        {LANDING_NAV_LINKS.map(([label, href]) => {
          const isActive = href === activeHref;
          return (
            <a
              key={label}
              href={href}
              aria-current={isActive ? "true" : undefined}
              className={`relative flex h-full items-center px-1 text-[12px] font-semibold transition-colors rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--coral)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--sand)] ${
                isActive
                  ? "text-[var(--coral)] after:absolute after:bottom-[8px] after:left-0 after:right-0 after:h-[2px] after:bg-[var(--coral)]"
                  : "text-[var(--water-deep)] hover:text-[var(--coral)]"
              }`}
            >
              {label}
            </a>
          );
        })}
      </nav>
    );
  }

  return (
    <nav id="mobile-nav-panel" aria-label="Mobile navigation" className="border-t border-[rgba(11,35,32,0.08)] bg-[var(--sand)] px-5 py-3 md:hidden">
      <ul className="flex flex-col">
        {LANDING_NAV_LINKS.map(([label, href]) => {
          const isActive = href === activeHref;
          return (
            <li key={label}>
              <a
                href={href}
                onClick={onLinkClick}
                aria-current={isActive ? "true" : undefined}
                className={`flex items-center gap-2 rounded-md px-1.5 py-2.5 text-[13px] font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--coral)] ${
                  isActive
                    ? "text-[var(--coral)]"
                    : "text-[var(--water-deep)] hover:text-[var(--coral)]"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`h-1.5 w-1.5 rounded-full transition-colors ${
                    isActive ? "bg-[var(--coral)]" : "bg-transparent"
                  }`}
                />
                {label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}