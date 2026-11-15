import { createFileRoute } from "@tanstack/react-router";
import { AboutPage } from "@/features/about/AboutPage";

function DashboardAboutPage() {
  return <AboutPage />;
}

export const Route = createFileRoute("/dashboard/about")({
  component: DashboardAboutPage,
});
