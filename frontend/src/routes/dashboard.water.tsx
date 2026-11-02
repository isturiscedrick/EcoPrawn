import { DashboardViewSkeleton } from "@/features/dashboard/components/DashboardStates";

function WaterLoading() {
  return <DashboardViewSkeleton variant="water" />;
}

import { createFileRoute } from "@tanstack/react-router";
import { WaterQuality } from "@/features/dashboard/views/WaterQuality";

function WaterPage() {
  return <WaterQuality />;
}
export const Route = createFileRoute("/dashboard/water")({
  pendingComponent: WaterLoading,
  component: WaterPage,
});
