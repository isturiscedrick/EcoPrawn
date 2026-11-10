import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { BrandMark } from "@/components/layout/BrandMark";
import { DASHBOARD_NAV_ITEMS, type DashboardView } from "@/config/nav";
import { Icon } from "@/components/ui/Icon";
import { SidebarNavItem } from "./SidebarNavItem";

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
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
  "flex min-h-11 w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[14.5px] font-medium text-[var(--ep-text-muted)] transition-colors duration-200 hover:bg-[var(--ep-tint)] hover:text-[var(--ep-text)]";

export function Sidebar({
  mobileOpen = false,
  onMobileClose = () => {},
}: SidebarProps) {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const segment = pathname.split("/dashboard/")[1] || "overview";
  const activeView = segment as DashboardView;
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

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = original;
    };
  }, [mobileOpen, closeDrawer, onMobileClose]);


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
      {/* Shared dashboard sidebar drawer at every viewport size. */}
      <div>
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
          className={`ep-dashboard-sidebar-drawer fixed inset-y-0 left-0 z-[90] flex w-[min(88vw,360px)] flex-col overflow-hidden rounded-r-[1.4rem] border-r border-[var(--ep-line)] bg-[var(--ep-bg)] text-[var(--ep-text)] transition-transform duration-300 ease-out ${
            mobileOpen
              ? "translate-x-0 shadow-[8px_0_40px_-12px_rgba(8,30,34,0.45)]"
              : "-translate-x-full shadow-none"
          }`}
        >
          {/* Drawer header */}
          <div className="relative flex shrink-0 items-center justify-between border-b border-[var(--ep-line)] px-5 py-4">
            <div className="flex min-w-0 flex-col gap-1">
              <BrandMark size={32} />
              <span className="ep-mobile-drawer-caption pl-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--ep-text-muted)]">Explore EcoPrawn</span>
            </div>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={closeDrawer}
              aria-label="Close navigation menu"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--ep-line)] bg-[var(--ep-surface)] text-[var(--ep-text-muted)] shadow-sm transition-all duration-200 hover:rotate-90 hover:bg-[var(--ep-tint)] hover:text-[var(--ep-primary)]"
            >
              <Icon name="x" size={20} strokeWidth={2} />
            </button>
          </div>

          {/* Profile */}
          <div className="shrink-0 border-b border-[var(--ep-line)] px-4 py-3">
            <Link
              to="/dashboard/profile"
              aria-label="Edit user profile"
              className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors hover:bg-[var(--ep-tint)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ep-accent)]"
              activeOptions={{ exact: true }}
            >
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold"
                style={{ background: "var(--ep-accent)", color: "var(--ep-on-accent, #fff)" }}
                aria-hidden="true"
              >
                {initials}
              </div>
              <div className="min-w-0">
                <div className="truncate text-[15px] font-semibold text-[var(--ep-text)]">
                  {profileName}
                </div>
                <div className="ep-font-mono truncate text-xs text-[var(--ep-text-muted)]">
                  {profileRole}
                </div>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4">
            <div className="ep-font-mono px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--ep-text-muted)]">
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
          <div className="flex shrink-0 flex-col gap-1 border-t border-[var(--ep-line)] bg-[var(--ep-surface)]/70 px-5 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
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
                onMobileClose();
                onLogoutClick();
              }}
              className="flex min-h-11 w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[14.5px] font-medium text-[var(--ep-text-muted)] transition-colors duration-200 hover:bg-[var(--ep-tint)] hover:text-[var(--ep-accent)]"
            >
              <span className="flex w-4 justify-center" aria-hidden="true">
                <LogoutIcon />
              </span>
              Log out
            </button>
          </div>
        </div>
      </div>

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