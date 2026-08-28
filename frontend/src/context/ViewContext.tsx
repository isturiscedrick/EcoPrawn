import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { View } from "../types";

interface ViewContextValue {
  view: View;
  setView: (view: View) => void;
}

const ViewContext = createContext<ViewContextValue | undefined>(undefined);

export function ViewProvider({ children }: { children: ReactNode }) {
  const [view, setView] = useState<View>("landing");
  const value = useMemo(() => ({ view, setView }), [view]);

  return <ViewContext.Provider value={value}>{children}</ViewContext.Provider>;
}

export function useView() {
  const ctx = useContext(ViewContext);
  if (!ctx) {
    throw new Error("useView must be used within a ViewProvider");
  }
  return ctx;
}
