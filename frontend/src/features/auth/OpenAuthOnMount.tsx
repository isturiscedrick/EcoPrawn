import { useEffect } from "react";
import { useAuthModal } from "./useAuthModal";

/** Opens the sign-in / sign-up modal as soon as the page mounts. */
export function OpenAuthOnMount() {
  const { open } = useAuthModal();

  useEffect(() => {
    open();
  }, [open]);

  return null;
}