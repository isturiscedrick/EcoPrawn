import { DashboardViewSkeleton } from "@/features/dashboard/components/DashboardStates";

function VisionLoading() {
  return <DashboardViewSkeleton variant="vision" />;
}

import { createFileRoute } from "@tanstack/react-router";
import { VisionGrowth } from "@/features/dashboard/views/VisionGrowth";

function VisionPage() {
  return <VisionGrowth />;
}
export const Route = createFileRoute("/dashboard/vision")({
  pendingComponent: VisionLoading,
  component: VisionPage,
});
