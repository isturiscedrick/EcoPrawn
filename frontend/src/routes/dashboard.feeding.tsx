import { DashboardViewSkeleton } from "@/features/dashboard/components/DashboardStates";

function FeedingLoading() {
  return <DashboardViewSkeleton variant="feeding" />;
}

import { createFileRoute } from "@tanstack/react-router";
import { Feeding } from "@/features/dashboard/views/Feeding";

function FeedingPage() {
  return <Feeding />;
}
export const Route = createFileRoute("/dashboard/feeding")({
  pendingComponent: FeedingLoading,
  component: FeedingPage,
});
