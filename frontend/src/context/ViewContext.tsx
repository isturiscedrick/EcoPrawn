"use client";

import { useRouter } from "next/navigation";

/**
 * In the Next.js version, "views" map to real routes handled by the
 * App Router (src/app). This hook centralizes navigation so components
 * don't need to import next/navigation directly.
 */
export function useView() {
  const router = useRouter();

  return {
    goToLanding: () => router.push("/"),
    goToLogin: () => router.push("/login"),
    goToDashboard: () => router.push("/dashboard"),
  };
}
