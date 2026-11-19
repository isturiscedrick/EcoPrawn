import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Icon } from "@/components/ui/Icon";
import { ProfileAvatar } from "../components/ProfileAvatar";

interface DashboardProfileMenuProps {
  pathname: string;
  profileName: string;
  profileRole: string;
  profileImage?: string | null;
  onRequestLogout: () => void;
}

export function DashboardProfileMenu({
  pathname,
  profileName,
  profileRole,
  profileImage,
  onRequestLogout,
}: DashboardProfileMenuProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const closeOnOutside = (event: PointerEvent) => {
      if (event.target instanceof Node && !wrapperRef.current?.contains(event.target)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus({ preventScroll: true });
      }
    };
    document.addEventListener("pointerdown", closeOnOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    panelRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
  }, [open]);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <div ref={wrapperRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="Open profile menu"
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-[var(--ep-line)] bg-[var(--ep-accent-tint)] text-xs font-bold text-[var(--ep-primary)] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ep-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ep-bg)]"
      >
        <ProfileAvatar name={profileName} image={profileImage} size="sm" className="border-0" />
      </button>
      {open && (
        <div
          ref={panelRef}
          role="menu"
          aria-label="Profile menu"
          onKeyDown={(event) => {
            if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
            const items = Array.from(
              event.currentTarget.querySelectorAll<HTMLElement>('[role="menuitem"]'),
            );
            if (!items.length) return;
            event.preventDefault();
            const currentIndex = items.indexOf(document.activeElement as HTMLElement);
            const nextIndex = event.key === "Home"
              ? 0
              : event.key === "End"
                ? items.length - 1
                : event.key === "ArrowDown"
                  ? (currentIndex + 1) % items.length
                  : (currentIndex - 1 + items.length) % items.length;
            items[nextIndex].focus();
          }}
          className="absolute right-0 top-[calc(100%+10px)] z-[100] w-[min(19rem,calc(100vw-1.5rem))] max-w-[calc(100vw-1.5rem)] max-h-[calc(100dvh-5.5rem)] overflow-y-auto overscroll-contain rounded-2xl border border-[var(--ep-line)] bg-[var(--ep-surface)] p-3 text-[var(--ep-text)] shadow-[0_18px_48px_-18px_rgba(15,23,42,.28)]"
        >
          <div className="border-b border-[var(--ep-line)] px-3 pb-3 pt-2">
            <p className="truncate text-sm font-semibold">{profileName}</p>
            <p className="mt-0.5 truncate text-[11px] font-medium tracking-wide text-[var(--ep-text-muted)]">{profileRole}</p>
          </div>
          <div className="mt-2 flex flex-col gap-1">
            <Link to="/dashboard/profile" role="menuitem" onClick={() => setOpen(false)} className="flex min-h-11 min-w-0 items-center gap-2 whitespace-nowrap rounded-xl px-2.5 text-sm font-medium transition-colors hover:bg-[var(--ep-tint)] focus-visible:outline-none focus-visible:bg-[var(--ep-accent-tint)] focus-visible:ring-1 focus-visible:ring-[var(--ep-accent)]/50">
              <Icon name="user-round" size={17} className="shrink-0" />
              <span className="whitespace-nowrap">View profile</span>
            </Link>
            <Link to="/dashboard/settings" role="menuitem" onClick={() => setOpen(false)} className="flex min-h-11 items-center gap-2 rounded-xl px-2.5 text-sm font-medium transition-colors hover:bg-[var(--ep-tint)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ep-primary)]">
              <Icon name="settings" size={17} className="shrink-0" />
              <span className="whitespace-nowrap">Settings</span>
            </Link>
          </div>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onRequestLogout();
            }}
            className="mt-1 flex min-h-11 w-full items-center gap-2.5 rounded-xl px-3 text-left text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 focus-visible:outline-none focus-visible:bg-red-50 focus-visible:ring-1 focus-visible:ring-red-400/60 dark:hover:bg-red-950/30 dark:focus-visible:bg-red-950/30"
          >
            <Icon name="log-out" size={17} />
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
