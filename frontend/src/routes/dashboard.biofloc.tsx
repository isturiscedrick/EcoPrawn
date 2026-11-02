import { DashboardViewSkeleton } from "@/features/dashboard/components/DashboardStates";

function BioflocLoading() {
  return <DashboardViewSkeleton variant="biofloc" />;
}

import { createFileRoute } from "@tanstack/react-router";
import { BioflocLoop } from "@/features/dashboard/views/BioflocLoop";

function BioflocPage() {
  return <BioflocLoop />;
}
export const Route = createFileRoute("/dashboard/biofloc")({
  pendingComponent: BioflocLoading,
  component: BioflocPage,
});
