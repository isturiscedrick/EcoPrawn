import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { BrandMark } from "@/components/layout/BrandMark";
import { DASHBOARD_NAV_ITEMS, type DashboardView } from "@/config/nav";
import { Icon } from "@/components/ui/Icon";
import { SidebarNavItem } from "./SidebarNavItem";

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="m16 17 5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}

const drawerRowClass =
  "flex min-h-11 w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-[14.5px] font-medium text-[rgba(11,46,51,0.68)] transition-colors duration-200 hover:bg-[rgba(11,46,51,0.06)] hover:text-[var(--water-deep)]";

export function Sidebar({
  collapsed = false,
  onToggle = () => {},
  mobileOpen = false,
  onMobileClose = () => {},
}: SidebarProps) {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const segment = pathname.split("/dashboard/")[1] || "overview";
  const activeView = segment as DashboardView;
  const currentLabel =
    segment === "profile"
      ? "Settings"
      : DASHBOARD_NAV_ITEMS.find((item) => item.view === activeView)?.label ?? "Dashboard";

  const [confirmingLogout, setConfirmingLogout] = useState(false);
  const [profileName, setProfileName] = useState("Facility Operator");
  const [profileRole, setProfileRole] = useState("FACILITY OPERATOR");

  const drawerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const touchStartX = useRef<number | null>(null);

  const initials =
    profileName
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "FO";

  // Explicit closes (backdrop, X, swipe, Escape) hand focus back to the menu button.
  const closeDrawer = useCallback(() => {
    onMobileClose();
  }, [onMobileClose]);

  useEffect(() => {
    const savedName = window.localStorage.getItem("ep-profile-name");
    const savedRole = window.localStorage.getItem("ep-profile-role");
    if (savedName) setProfileName(savedName);
    if (savedRole) setProfileRole(savedRole.toUpperCase());
  }, []);

  // Any route change closes the mobile drawer.
  useEffect(() => {
    onMobileClose();
  }, [pathname, onMobileClose]);

  // Drawer open: lock page scroll, focus the close button, trap Tab,
  // close on Escape, and close if the viewport grows to desktop width.
  useEffect(() => {
    if (!mobileOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus({ preventScroll: true });

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        closeDrawer();
        return;
      }
      if (e.key !== "Tab") return;
      const focusable = drawerRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])',
      );
      if (!focusable || focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    const desktop = window.matchMedia("(min-width: 1024px)");
    const onChange = (e: MediaQueryListEvent) => {
      if (e.matches) setMobileOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    desktop.addEventListener("change", onChange);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      desktop.removeEventListener("change", onChange);
      document.body.style.overflow = original;
    };
  }, [mobileOpen, closeDrawer]);


  const [logoutError, setLogoutError] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

  function onLogoutClick() {
    setLogoutError("");
    setConfirmingLogout(true);
  }

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
    <>
      {/* MOBILE DRAWER (below lg) */}
      <div className="lg:hidden">
        <div
          aria-hidden="true"
          onClick={closeDrawer}
          className={`fixed inset-0 z-[80] bg-[rgba(8,30,34,0.55)] backdrop-blur-sm transition-opacity duration-300 dark:bg-[rgba(0,0,0,0.72)] ${
            mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        />
        <div
          id="dashboard-mobile-drawer"
          ref={drawerRef}
          role="dialog"
          aria-modal="true"
          aria-label="Dashboard menu"
          inert={!mobileOpen}
          onTouchStart={(e) => {
            touchStartX.current = e.touches[0].clientX;
          }}
          onTouchEnd={(e) => {
            const start = touchStartX.current;
            touchStartX.current = null;
            if (start !== null && e.changedTouches[0].clientX - start < -60) closeDrawer();
          }}
          className={`fixed inset-y-0 left-0 z-[90] flex w-[min(86vw,320px)] flex-col bg-white text-[var(--water-deep)] transition-transform duration-300 ease-out ${
            mobileOpen
              ? "translate-x-0 shadow-[8px_0_40px_-12px_rgba(8,30,34,0.45)]"
              : "-translate-x-full shadow-none"
          }`}
        >
          {/* Drawer header */}
          <div className="flex shrink-0 items-center justify-between border-b border-[rgba(11,46,51,0.12)] px-4 py-3">
            <BrandMark size={30} />
            <button
              ref={closeButtonRef}
              type="button"
              onClick={closeDrawer}
              aria-label="Close navigation menu"
              className="flex h-11 w-11 items-center justify-center rounded-lg text-[rgba(11,46,51,0.68)] transition-colors hover:bg-[rgba(11,46,51,0.08)] hover:text-[var(--water-deep)]"
            >
              <Icon name="x" size={20} strokeWidth={2} />
            </button>
          </div>

          {/* Profile */}
          <div className="shrink-0 border-b border-[rgba(11,46,51,0.1)] px-3 py-3">
            <Link
              to="/dashboard/profile"
              aria-label="Edit user profile"
              className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-[rgba(232,98,58,0.08)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--coral)]"
              activeOptions={{ exact: true }}
            >
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold"
                style={{ background: "var(--coral)" }}
                aria-hidden="true"
              >
                {initials}
              </div>
              <div className="min-w-0">
                <div className="truncate text-[15px] font-semibold text-[var(--water-deep)]">
                  {profileName}
                </div>
                <div className="ep-font-mono truncate text-xs text-[rgba(11,46,51,0.62)]">
                  {profileRole}
                </div>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-3">
            <div className="ep-font-mono px-3 pb-2 text-[11px] font-medium uppercase tracking-[0.1em] text-[rgba(11,46,51,0.58)]">
              Navigation
            </div>
            <nav aria-label="Dashboard modules" className="flex flex-col items-stretch gap-1.5">
              {DASHBOARD_NAV_ITEMS.map((item) => (
                <SidebarNavItem
                  key={item.label}
                  item={item}
                  active={item.view === activeView}
                  collapsed={false}
                />
              ))}
            </nav>
          </div>

          {/* Account actions */}
          <div className="flex shrink-0 flex-col gap-1 border-t border-[rgba(11,46,51,0.1)] px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <Link
              to="/dashboard/profile"
              aria-current={pathname === "/dashboard/profile" ? "page" : undefined}
              className={`${drawerRowClass} ${
                pathname === "/dashboard/profile" ? "dashboard-nav-active font-semibold" : ""
              }`}
              activeOptions={{ exact: true }}
            >
              <span className="flex w-4 justify-center" aria-hidden="true">
                <Icon name="wrench" size={16} strokeWidth={1.8} />
              </span>
              Settings
            </Link>
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                onLogoutClick();
              }}
              className="flex min-h-11 w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-[14.5px] font-medium text-[rgba(11,46,51,0.68)] transition-colors duration-200 hover:bg-[rgba(232,98,58,0.12)] hover:text-[var(--coral)]"
            >
              <span className="flex w-4 justify-center" aria-hidden="true">
                <LogoutIcon />
              </span>
              Log out
            </button>
          </div>
        </div>
      </div>

      {/* DESKTOP SIDEBAR (lg and up) */}
      <aside
        className={`relative hidden h-full min-w-0 flex-col items-stretch bg-white text-[var(--water-deep)] shadow-[1px_0_0_rgba(11,46,51,0.08)] lg:flex ${collapsed ? "lg:p-0" : "lg:p-4"}`}
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

        {/* USER / OPERATOR */}
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
              {initials}
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

        {/* NAV LABEL */}
        <div
          className={`hidden px-3 pt-4 ep-font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-[rgba(11,46,51,0.58)] lg:mb-2 lg:block ${collapsed ? "lg:hidden" : ""}`}
        >
          Navigation
        </div>

        {/* NAV ITEMS */}
        <nav
          aria-label="Dashboard modules"
          className={`flex shrink-0 flex-col items-center gap-2 lg:w-full ${collapsed ? "lg:items-center lg:pt-3" : "lg:items-stretch lg:px-2"}`}
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

        {/* SIDEBAR ACTIONS */}
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
            onClick={onLogoutClick}
            className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-[13.5px] font-medium text-[rgba(11,46,51,0.62)] transition-colors duration-200 hover:bg-[rgba(232,98,58,0.12)] hover:text-[var(--coral)] ${collapsed ? "lg:mx-auto lg:h-11 lg:w-11 lg:justify-center lg:px-0 lg:py-0" : ""}`}
          >
            <span className="w-4 text-center text-sm" aria-hidden="true">
              ⏻
            </span>
            <span className={collapsed ? "lg:hidden" : undefined}>Log out</span>
          </button>
        </div>
      </aside>

      {/* LOGOUT CONFIRMATION MODAL (shared by mobile and desktop) */}
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
                className="flex-1 rounded-lg bg-[var(--coral)] px-4 py-2.5 text-[13.5px] font-semibold text-[var(--sand)] transition-colors duration-200 hover:bg-[var(--coral-dim)] disabled:opacity-60"
              >
                {loggingOut ? "Logging out…" : "Log out"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}