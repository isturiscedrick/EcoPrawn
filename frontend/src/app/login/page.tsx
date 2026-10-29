import { LandingPage } from "@/features/landing/LandingPage";
import { OpenAuthOnMount } from "@/features/auth/OpenAuthOnMount";

export default function LoginPage() {
  return (
    <>
      <LandingPage />
      <OpenAuthOnMount />
    </>
  );
}