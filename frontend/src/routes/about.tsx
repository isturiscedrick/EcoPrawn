import { createFileRoute } from "@tanstack/react-router";
import { AboutPage } from "@/features/about/AboutPage";

function About() {
  return <AboutPage />;
}
export const Route = createFileRoute("/about")({ component: About });
