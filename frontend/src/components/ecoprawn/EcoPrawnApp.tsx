import { useState } from "react";
import { TopNav, type View } from "./TopNav";
import { LandingView } from "./LandingView";
import { LoginView } from "./LoginView";
import { DashboardView } from "./DashboardView";
import "./theme.css";

export function EcoPrawnApp() {
  const [view, setView] = useState<View>("landing");

  return (
    <div className="ecoprawn-root">
{view === "login" && <TopNav view={view} onChange={setView} />}
      {view === "landing" && (
        <LandingView onOpenDashboard={() => setView("login")} />
      )}
      {view === "login" && (
        <LoginView
          onLogin={() => setView("dashboard")}
          onBackToLanding={() => setView("landing")}
        />
      )}
      {view === "dashboard" && <DashboardView />}
    </div>
  );
}