import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useRouterState } from "@tanstack/react-router";
import { BrandMark } from "@/components/layout/BrandMark";
import { DASHBOARD_NAV_ITEMS, type DashboardView } from "@/config/nav";
import { Icon } from "@/components/ui/Icon";
import { SidebarNavItem } from "./SidebarNavItem";

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export function Sidebar({
  collapsed = false,
  onToggle = () => {},
}: SidebarProps) {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const activeView = (pathname.split("/dashboard/")[1] ??
    "overview") as DashboardView;
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("ep-dashboard-theme") === "dark";
  });
  const [confirmingLogout, setConfirmingLogout] = useState(false);
  const [profileName, setProfileName] = useState("Facility Operator");
  const [profileRole, setProfileRole] = useState("FACILITY OPERATOR");

  useEffect(() => {
    const syncTheme = () => {
      const enabled = window.localStorage.getItem("ep-dashboard-theme") === "dark";
      setDarkMode(enabled);
      document.documentElement.classList.toggle("dark", enabled);
    };
    syncTheme();
    window.addEventListener("ecoprawn-theme-change", syncTheme);
    window.addEventListener("storage", syncTheme);
    return () => {
      window.removeEventListener("ecoprawn-theme-change", syncTheme);
      window.removeEventListener("storage", syncTheme);
    };
  }, [pathname]);

  useEffect(() => {
    const savedName = window.localStorage.getItem("ep-profile-name");
    const savedRole = window.localStorage.getItem("ep-profile-role");
    if (savedName) setProfileName(savedName);
    if (savedRole) setProfileRole(savedRole.toUpperCase());
  }, []);

  function toggleTheme() {
    setDarkMode((current) => {
      const next = !current;
      window.localStorage.setItem(
        "ep-dashboard-theme",
        next ? "dark" : "light",
      );
      document.documentElement.classList.toggle("dark", next);
      window.dispatchEvent(new Event("ecoprawn-theme-change"));
      return next;
    });
  }

  function onLogoutClick() {
    setConfirmingLogout(true);
  }

  const [logoutError, setLogoutError] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);
  async function onConfirmLogout() {
    setLoggingOut(true);
    setLogoutError("");
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) throw new Error("Logout failed");
      window.location.replace("/login");
    } catch {
      setLogoutError("Could not log out. Please try again.");
      setLoggingOut(false);
    }
  }

  function onCancelLogout() {
    setConfirmingLogout(false);
  }

  useEffect(() => {
    if (!confirmingLogout) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setConfirmingLogout(false);
    }
    window.addEventListener("keydown", onKeyDown);
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = original;
    };
  }, [confirmingLogout]);

  return (
    <aside
      className={`relative flex h-full min-w-0 flex-row items-center gap-1.5 overflow-x-auto bg-white p-3 text-[var(--water-deep)] shadow-[1px_0_0_rgba(11,46,51,0.08)] lg:flex-col lg:items-stretch lg:gap-0 lg:overflow-x-visible ${collapsed ? "lg:p-0" : "lg:p-4"}`}
    >
      {/* BRAND */}
      <div
        className={`group relative flex min-w-0 shrink-0 items-center gap-2 overflow-visible px-1 lg:mb-4 lg:w-full lg:border-b lg:border-[rgba(11,46,51,0.12)] ${collapsed ? "lg:justify-center lg:px-0 lg:pb-6 lg:pt-3" : "lg:px-2.5 lg:pb-4 lg:pt-1"}`}
      >
        <BrandMark
          size={30}
          showWordmark={!collapsed}
          className={
            collapsed
              ? "transition-opacity duration-200 group-hover:opacity-0 group-focus-within:opacity-0"
              : ""
          }
        />
        <button
          type="button"
          onClick={onToggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={`hidden h-11 w-11 shrink-0 items-center justify-center rounded-lg text-[rgba(11,46,51,0.62)] transition-all hover:bg-[rgba(11,46,51,0.08)] hover:text-[var(--water-deep)] lg:flex ${
            collapsed
              ? "pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 transition-opacity duration-200 group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100"
              : "ml-auto"
          }`}
        >
          <Icon name="sidebar-toggle" size={17} strokeWidth={1.8} />
        </button>
      </div>

      {/* USER / OPERATOR (desktop only) */}
      <div
        className={`hidden shrink-0 border-b border-[rgba(11,46,51,0.1)] lg:flex lg:w-full lg:pb-4 ${collapsed ? "lg:justify-center lg:px-0" : "lg:px-2"}`}
      >
        <Link
          to="/dashboard/profile"
          className={`flex w-full items-center gap-2.5 rounded-lg text-left transition-colors hover:bg-[rgba(232,98,58,0.08)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--coral)] ${collapsed ? "lg:mx-auto lg:h-11 lg:w-11 lg:justify-center" : ""}`}
          aria-label="Edit user profile"
          activeOptions={{ exact: true }}
        >
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold"
            style={{ background: "var(--coral)" }}
            aria-hidden="true"
          >
            FO
          </div>
          <div className={`min-w-0 ${collapsed ? "lg:hidden" : ""}`}>
            <div className="truncate text-sm font-semibold text-[var(--water-deep)]">
              {profileName}
            </div>
            <div className="ep-font-mono text-xs text-[rgba(11,46,51,0.62)]">
              {profileRole}
            </div>
          </div>
        </Link>
      </div>

      {/* NAV LABEL (desktop only) */}
      <div
        className={`hidden px-3 pt-4 ep-font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-[rgba(11,46,51,0.58)] lg:mb-2 lg:block ${collapsed ? "lg:hidden" : ""}`}
      >
        Navigation
      </div>

      {/* NAV ITEMS */}
      <nav
        aria-label="Dashboard modules"
        className={`flex shrink-0 flex-row items-center gap-1.5 lg:w-full lg:flex-col lg:gap-2 ${collapsed ? "lg:items-center lg:pt-3" : "lg:items-stretch lg:px-2"}`}
      >
        {DASHBOARD_NAV_ITEMS.map((item) => (
          <SidebarNavItem
            key={item.label}
            item={item}
            active={item.view === activeView}
            collapsed={collapsed}
          />
        ))}
      </nav>

      {/* SIDEBAR ACTIONS (desktop only) */}
      <div
        className={`mt-auto hidden shrink-0 flex-col gap-1 border-t border-[rgba(11,46,51,0.1)] lg:flex lg:w-full lg:pt-4 ${collapsed ? "lg:px-0" : "lg:px-2"}`}
      >
        <Link
          to="/dashboard/profile"
          aria-current={pathname === "/dashboard/profile" ? "page" : undefined}
          className={`flex min-h-11 w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-[13.5px] font-medium transition-colors duration-200 ${collapsed ? "lg:mx-auto lg:h-11 lg:w-11 lg:justify-center lg:px-0 lg:py-0" : ""} ${
            pathname === "/dashboard/profile"
              ? "dashboard-nav-active font-semibold"
              : "text-[rgba(11,46,51,0.62)] hover:bg-[rgba(11,46,51,0.06)] hover:text-[var(--water-deep)]"
          }`}
          activeOptions={{ exact: true }}
        >
          <span className="flex w-4 justify-center" aria-hidden="true">
            <Icon name="wrench" size={16} strokeWidth={1.8} />
          </span>
          <span className={collapsed ? "lg:hidden" : undefined}>Settings</span>
        </Link>
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={`Switch to ${darkMode ? "light" : "dark"} mode`}
          className={`flex min-h-11 w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-[13.5px] font-medium text-[rgba(11,46,51,0.62)] transition-colors hover:bg-[rgba(11,46,51,0.06)] hover:text-[var(--water-deep)] ${collapsed ? "lg:mx-auto lg:h-11 lg:w-11 lg:justify-center lg:px-0 lg:py-0" : ""}`}
        >
          <span
            aria-hidden="true"
            className="flex w-4 justify-center text-base"
          >
            {darkMode ? "☀" : "◐"}
          </span>
          <span className={collapsed ? "lg:hidden" : undefined}>
            {darkMode ? "Light mode" : "Dark mode"}
          </span>
        </button>
        <button
          type="button"
          onClick={onLogoutClick}
          className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-[13.5px] font-medium text-[rgba(11,46,51,0.62)] transition-colors duration-200 hover:bg-[rgba(232,98,58,0.12)] hover:text-[var(--coral)] ${collapsed ? "lg:mx-auto lg:h-11 lg:w-11 lg:justify-center lg:px-0 lg:py-0" : ""}`}
        >
          <span className="w-4 text-center text-sm" aria-hidden="true">
            ⏻
          </span>
          <span className={collapsed ? "lg:hidden" : undefined}>Log out</span>
        </button>
      </div>

      {/* LOGOUT (mobile only, icon button) */}
      <button
        type="button"
        onClick={onLogoutClick}
        aria-label="Log out"
        className="ml-auto flex shrink-0 items-center justify-center rounded-lg p-2.5 text-[rgba(11,46,51,0.62)] transition-colors duration-200 hover:bg-[rgba(232,98,58,0.12)] hover:text-[var(--coral)] lg:hidden"
      >
        <span className="text-sm" aria-hidden="true">
          ⏻
        </span>
      </button>

      {/* LOGOUT CONFIRMATION MODAL */}
      {confirmingLogout && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="logout-modal-title"
          className="fixed inset-0 z-[100] flex items-center justify-center p-5"
        >
          <div
            aria-hidden="true"
            onClick={onCancelLogout}
            className="ep-fade-in absolute inset-0 bg-[rgba(8,30,34,0.65)] backdrop-blur-sm dark:bg-[rgba(0,0,0,0.76)]"
          />
          <div className="ep-pop-in relative z-10 w-full max-w-[360px] rounded-2xl border border-[rgba(255,255,255,0.16)] bg-[var(--water-deep)] p-6 text-[var(--sand)] shadow-[0_30px_70px_-20px_rgba(0,0,0,0.6)]">
            <h2
              id="logout-modal-title"
              className="ep-font-display mb-1.5 text-[18px] font-semibold text-white"
            >
              Log out of EcoPrawn?
            </h2>
            <p className="mb-6 text-[13px] leading-[1.55] text-[rgba(255,255,255,0.68)]">
              You&apos;ll need to sign in again to access the facility
              dashboard.
            </p>
            {logoutError && (
              <p role="alert" className="mb-3 text-sm text-red-300">
                {logoutError}
              </p>
            )}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onCancelLogout}
                className="flex-1 rounded-lg border border-[rgba(255,255,255,0.22)] px-4 py-2.5 text-[13.5px] font-semibold text-[rgba(255,255,255,0.84)] transition-colors duration-200 hover:bg-[rgba(255,255,255,0.08)] hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onConfirmLogout}
                disabled={loggingOut}
                className="flex-1 rounded-lg bg-[var(--coral)] px-4 py-2.5 text-[13.5px] font-semibold text-[var(--sand)] transition-colors duration-200 hover:bg-[var(--coral-dim)]"
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
