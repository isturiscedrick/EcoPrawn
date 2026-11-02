import { DashboardSkeleton } from "@/features/dashboard/components/DashboardStates";

function DashboardLoading() {
  return <DashboardSkeleton />;
}

import { createFileRoute } from "@tanstack/react-router";
import { Dashboard } from "@/features/dashboard/views/Dashboard";

function DashboardPage() {
  return <Dashboard />;
}

export const Route = createFileRoute("/dashboard/")({
  pendingComponent: DashboardLoading,
  component: DashboardPage,
});
