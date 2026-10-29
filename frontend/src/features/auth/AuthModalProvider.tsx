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
import { LoginForm } from "./LoginForm";

interface AuthModalValue {
  open: () => void;
  close: () => void;
}

const AuthModalContext = createContext<AuthModalValue | null>(null);

export function useAuthModal() {
  const value = useContext(AuthModalContext);
  if (!value) throw new Error("useAuthModal requires AuthModalProvider");
  return value;
}

// LoginForm still uses the older token names. Inside the popup, point them at
// the Home palette so the form matches without editing LoginForm itself.
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
      panel ? Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)) : [];

    // Desktop: start on the first field. Touch devices: focusing an input
    // opens the on-screen keyboard immediately and covers the form, so focus
    // the dialog panel itself and let the user tap a field when ready.
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    if (isTouch) {
      panel?.focus();
    } else {
      (panel?.querySelector<HTMLElement>("input") ?? items()[0])?.focus();
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
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
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
    <div className="fixed inset-0 z-[100] flex overflow-y-auto overscroll-contain p-2 sm:p-6">
      <div
        aria-hidden="true"
        onClick={onClose}
        className="ep-fade-in fixed inset-0 bg-[rgba(8,30,34,0.65)] backdrop-blur-sm"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Sign in or create an account"
        tabIndex={-1}
        style={SCOPE}
        className="ep-pop-in relative z-10 m-auto w-full max-w-[470px] rounded-2xl border-2 border-[var(--ep-primary)] bg-[var(--ep-bg)] p-4 shadow-[var(--shadow-overlay)] outline-none sm:rounded-3xl sm:p-7 [&_input]:text-[16px] sm:[&_input]:text-[14px] max-sm:[&_h1]:text-[26px] max-sm:[&_h1+p]:hidden max-sm:[&_div:has(>form)]:mt-4 max-sm:[&_div:has(>form)]:gap-3 max-sm:[&_div:has(>form)]:border-0 max-sm:[&_div:has(>form)]:bg-transparent max-sm:[&_div:has(>form)]:p-0 max-sm:[&_div:has(>form)]:shadow-none max-sm:[&_fieldset]:gap-3"
      >
        {/* Mobile: sits in its own row above the form so it never overlaps the
            heading. sm and up: floats in the top-right corner as before. */}
        <div className="flex justify-end sm:block">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="z-10 flex h-11 w-11 items-center justify-center rounded-full text-[var(--ep-primary)] transition-colors duration-200 hover:bg-[var(--ep-tint)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ep-primary)] sm:absolute sm:right-3 sm:top-3"
          >
            <Icon name="x" size={20} strokeWidth={2.2} />
          </button>
        </div>

        <LoginForm />
      </div>
    </div>
  );
}

export function AuthModalProvider({ children }: { children: ReactNode }) {
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

/** A link to /login that opens the popup on a normal click. */
export function AuthLink({ onClick, ...props }: AuthLinkProps) {
  const { open } = useAuthModal();

  function handleClick(e: MouseEvent<HTMLAnchorElement>) {
    onClick?.(e);
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
      return;
    }
    e.preventDefault();
    open();
  }

  return <Link {...props} href="/login" onClick={handleClick} />;
}