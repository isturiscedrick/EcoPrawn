import { createFileRoute } from "@tanstack/react-router";
import { LandingPage } from "@/features/landing/LandingPage";
import { OpenAuthOnMount } from "@/features/auth/OpenAuthOnMount";

function LoginPage() {
  return (
    <>
      <LandingPage />
      <OpenAuthOnMount />
    </>
  );
}
export const Route = createFileRoute("/login")({ component: LoginPage });
