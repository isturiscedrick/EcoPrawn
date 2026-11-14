import { createFileRoute } from "@tanstack/react-router";
import { DashboardViewSkeleton } from "@/features/dashboard/components/DashboardStates";
import { Analytics } from "@/features/dashboard/views/Analytics";

function AnalyticsLoading() {
  return <DashboardViewSkeleton variant="vision" />;
}

export const Route = createFileRoute("/dashboard/analytics")({
  pendingComponent: AnalyticsLoading,
  component: Analytics,
});
