import { useState } from "react";
import { TopNav, type View } from "./TopNav";
import { LandingView } from "./LandingView";
import { DashboardView } from "./DashboardView";
import "./theme.css";

export function EcoPrawnApp() {
  const [view, setView] = useState<View>("landing");

  return (
    <div className="ecoprawn-root">
      <TopNav view={view} onChange={setView} />
      {view === "landing" ? (
        <LandingView onOpenDashboard={() => setView("dashboard")} />
      ) : (
        <DashboardView />
      )}
    </div>
  );
}