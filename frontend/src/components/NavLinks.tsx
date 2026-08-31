import { LANDING_NAV_LINKS } from "@/config/nav";

interface NavLinksProps {
  variant: "desktop" | "mobile";
  onLinkClick?: () => void;
}

export function NavLinks({ variant, onLinkClick }: NavLinksProps) {
  if (variant === "desktop") {
    return (
      <nav className="hidden h-full items-center gap-7 md:flex" aria-label="Primary navigation">
        {LANDING_NAV_LINKS.map(([label, href], index) => (
          <a
            key={label}
            href={href}
            className={`relative flex h-full items-center px-1 text-[12px] font-semibold text-[var(--water-deep)] transition-colors hover:text-[var(--coral)] rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--coral)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--sand)] ${
              index === 0 ? "after:absolute after:bottom-[8px] after:left-0 after:right-0 after:h-[2px] after:bg-[var(--coral)]" : ""
            }`}
          >
            {label}
          </a>
        ))}
      </nav>
    );
  }

  return (
    <nav id="mobile-nav-panel" aria-label="Mobile navigation" className="border-t border-[rgba(11,35,32,0.08)] bg-[var(--sand)] px-5 py-3 md:hidden">
      <ul className="flex flex-col">
        {LANDING_NAV_LINKS.map(([label, href]) => (
          <li key={label}>
            <a href={href} onClick={onLinkClick} className="block rounded-md px-1.5 py-2.5 text-[13px] font-semibold text-[var(--water-deep)] transition-colors hover:text-[var(--coral)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--coral)]">
              {label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
