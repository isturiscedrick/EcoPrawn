import { Link } from "@tanstack/react-router";
import { LANDING_NAV_LINKS } from "@/config/nav";

interface NavLinksProps {
  variant: "desktop" | "mobile";
  activeHref: string;
  onLinkClick?: () => void;
  monochrome?: boolean;
  darkMode?: boolean;
}

const focusRing =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ep-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ep-bg)]";

export function NavLinks({ variant, activeHref, onLinkClick, monochrome = false, darkMode = false }: NavLinksProps) {
  if (variant === "desktop") {
    return (
      <nav
        className={`hidden items-center gap-0.5 rounded-full border p-1 shadow-sm backdrop-blur-xl lg:flex ${monochrome ? "ep-nav-monochrome" : "border-[var(--ep-line)] bg-[var(--ep-surface)]/90"}`}
        style={monochrome ? { backgroundColor: darkMode ? "#000000" : "#ffffff", borderColor: darkMode ? "#ffffff" : "#000000", color: darkMode ? "#ffffff" : "#000000" } : undefined}
        aria-label="Primary navigation"
      >
        {LANDING_NAV_LINKS.map(([label, href]) => {
          const isActive = href === activeHref;
          return (
            <Link
              key={label}
              to={href}
              aria-current={isActive ? "page" : undefined}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-semibold leading-none transition-colors duration-200 ${focusRing} ${monochrome ? "ep-nav-monochrome-link" : isActive ? "bg-[var(--ep-accent)] text-[var(--ep-bg)]" : "text-[var(--ep-primary)] hover:bg-[var(--ep-tint)]"}`}
              style={monochrome ? { backgroundColor: isActive ? (darkMode ? "#ffffff" : "#000000") : "transparent", color: isActive ? (darkMode ? "#000000" : "#ffffff") : (darkMode ? "#ffffff" : "#000000"), borderColor: darkMode ? "#ffffff" : "#000000" } : undefined}
              activeOptions={{ exact: true }}
            >
              <span
                aria-hidden="true"
                className="inline-flex shrink-0 items-center justify-center"
              >
                {label === "Home" ? (
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path d="m4 10 8-6 8 6v9a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-9Z" />
                    <path d="M9 20v-6h6v6" />
                  </svg>
                ) : label === "About" ? (
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 10v6M12 7h.01" />
                  </svg>
                ) : (
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path d="M4 5h16v12H4z" />
                    <path d="m4 7 8 6 8-6M8 21h8" />
                  </svg>
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
      aria-label="Mobile navigation"
      className={`border-t px-4 py-2 sm:px-5 lg:hidden ${monochrome ? "ep-nav-monochrome" : "border-[var(--ep-line)] bg-[var(--ep-bg)]"}`}
      style={monochrome ? { backgroundColor: darkMode ? "#000000" : "#ffffff", borderColor: darkMode ? "#ffffff" : "#000000", color: darkMode ? "#ffffff" : "#000000" } : undefined}
    >
      <ul className="flex flex-col pb-1">
        {LANDING_NAV_LINKS.map(([label, href]) => {
          const isActive = href === activeHref;
          return (
            <li key={label}>
              <Link
                to={href}
                onClick={onLinkClick}
                aria-current={isActive ? "page" : undefined}
                className={`group flex items-center gap-3 rounded-lg px-2 py-3.5 text-base font-semibold transition-colors duration-200 ${focusRing} ${monochrome ? "ep-nav-monochrome-link" : `hover:bg-[var(--ep-tint)] ${isActive ? "text-[var(--ep-accent)]" : "text-[var(--ep-primary)] hover:text-[var(--ep-accent)]"}`}`}
                style={monochrome ? { backgroundColor: isActive ? (darkMode ? "#ffffff" : "#000000") : "transparent", color: isActive ? (darkMode ? "#000000" : "#ffffff") : (darkMode ? "#ffffff" : "#000000") } : undefined}
                activeOptions={{ exact: true }}
              >
                <span
                  aria-hidden="true"
                  className={`h-2.5 w-2.5 rounded-full transition-colors duration-200 ${monochrome ? "" : isActive ? "bg-[var(--ep-accent)]" : "bg-transparent group-hover:bg-[var(--ep-line)]"}`}
                  style={monochrome ? { backgroundColor: isActive ? (darkMode ? "#000000" : "#ffffff") : "transparent" } : undefined}
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
