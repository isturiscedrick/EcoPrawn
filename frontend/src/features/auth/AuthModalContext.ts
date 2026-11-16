import { createContext } from "react";

import type { AuthMode } from "./LoginForm";

export interface AuthModalValue {
  /** Opens the modal on the Sign in tab (default) or the Sign up tab. */
  open: (mode?: AuthMode) => void;
  close: () => void;
}

export const AuthModalContext = createContext<AuthModalValue | null>(null);
