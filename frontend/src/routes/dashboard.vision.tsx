import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/vision")({
  beforeLoad: () => {
    throw redirect({ to: "/dashboard/analytics" });
  },
});
