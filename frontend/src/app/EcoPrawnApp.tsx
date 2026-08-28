import { useView } from "../context/ViewContext";
import { LandingPage } from "./LandingPage";
import { LoginPage } from "./LoginPage";
import { SystemPage } from "./system/page";
import "./theme.css";

export function EcoPrawnApp() {
  const { view } = useView();

  return (
    <div className="ecoprawn-root">
      {view === "landing" && <LandingPage />}
      {view === "login" && <LoginPage />}
      {view === "dashboard" && <SystemPage />}
    </div>
  );
}
