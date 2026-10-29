
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ComponentProps,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
} from "react";

import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { BrandMark } from "@/components/layout/BrandMark";
import { LoginForm } from "./LoginForm";
import "./auth-modal.css";

interface AuthModalValue {
  open: () => void;
  close: () => void;
}

const AuthModalContext = createContext<AuthModalValue | null>(null);

export function useAuthModal() {
  const value = useContext(AuthModalContext);

  if (!value) {
    throw new Error("useAuthModal requires AuthModalProvider");
  }

  return value;
}

// Preserve existing LoginForm theme token mappings.
const SCOPE = {
  "--coral": "var(--ep-accent)",
  "--coral-dim": "var(--ep-accent-hover)",
  "--sand-dim": "var(--ep-line)",
  "--mangrove": "var(--mangrove-text)",
} as CSSProperties;

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

function AuthDialog({ onClose }: { onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const originalOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const panel = panelRef.current;

    const items = () =>
      panel
        ? Array.from(
            panel.querySelectorAll<HTMLElement>(FOCUSABLE)
          )
        : [];

    const isTouch = window.matchMedia(
      "(pointer: coarse)"
    ).matches;

    if (isTouch) {
      panel?.focus();
    } else {
      (
        panel?.querySelector<HTMLElement>("input") ??
        items()[0]
      )?.focus();
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
        return;
      }

      if (e.key !== "Tab") return;

      const list = items();

      if (!list.length) return;

      const first = list[0];
      const last = list[list.length - 1];

      if (
        e.shiftKey &&
        document.activeElement === first
      ) {
        e.preventDefault();
        last.focus();
      } else if (
        !e.shiftKey &&
        document.activeElement === last
      ) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = originalOverflow;
      opener?.focus();
    };
  }, [onClose]);

  return (
    <div className="ep-auth-overlay fixed inset-0 z-[100] flex overflow-y-auto overscroll-contain p-3 sm:p-6">
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className="ep-fade-in fixed inset-0 bg-[rgba(8,30,34,0.65)] backdrop-blur-sm"
      />

      {/* Modal panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Sign in or create an account"
        tabIndex={-1}
        style={SCOPE}
        className="ep-auth-modal ep-pop-in relative z-10 m-auto w-full max-w-[440px] overflow-y-auto rounded-[24px] border border-[var(--ep-line)] bg-[var(--ep-bg)] px-5 py-5 shadow-[0_24px_80px_rgba(8,30,34,0.28)] outline-none sm:px-8 sm:py-7"
      >
        {/* Logo and close button */}
        <div className="ep-auth-brand relative mb-5 flex min-h-[72px] items-center justify-center border-b border-[var(--ep-line)] pb-4">
          <div className="flex items-center justify-center px-11">
            <BrandMark
              size={56}
              className="max-w-[190px] sm:max-w-[220px]"
            />
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-0 top-0 z-10 flex h-10 w-10 items-center justify-center rounded-xl text-[var(--ep-text-muted)] transition-colors duration-200 hover:bg-[var(--ep-tint)] hover:text-[var(--ep-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ep-accent)]"
          >
            <Icon
              name="x"
              size={20}
              strokeWidth={2}
            />
          </button>
        </div>

        {/* Existing form and all its logic */}
        <LoginForm />
      </div>
    </div>
  );
}

export function AuthModalProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  return (
    <AuthModalContext.Provider value={{ open, close }}>
      {children}
      {isOpen && <AuthDialog onClose={close} />}
    </AuthModalContext.Provider>
  );
}

type AuthLinkProps = Omit<ComponentProps<typeof Link>, "href">;

export function AuthLink({
  onClick,
  ...props
}: AuthLinkProps) {
  const { open } = useAuthModal();

  function handleClick(e: MouseEvent<HTMLAnchorElement>) {
    onClick?.(e);

    if (
      e.defaultPrevented ||
      e.button !== 0 ||
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey ||
      e.altKey
    ) {
      return;
    }

    e.preventDefault();
    open();
  }

  return <Link {...props} href="/login" onClick={handleClick} />;
}
