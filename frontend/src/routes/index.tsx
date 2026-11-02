import { createFileRoute } from "@tanstack/react-router";
import { LandingPage } from "@/features/landing/LandingPage";

function Home() {
  return <LandingPage />;
}

export const Route = createFileRoute("/")({ component: Home });
