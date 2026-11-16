import { useContext } from "react";

import { AuthModalContext } from "./AuthModalContext";

export function useAuthModal() {
  const value = useContext(AuthModalContext);

  if (!value) {
    throw new Error("useAuthModal requires AuthModalProvider");
  }

  return value;
}
