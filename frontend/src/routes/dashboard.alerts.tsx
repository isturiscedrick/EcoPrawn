import { DashboardViewSkeleton } from "@/features/dashboard/components/DashboardStates";

function AlertsLoading() {
  return <DashboardViewSkeleton variant="alerts" />;
}

import { createFileRoute } from "@tanstack/react-router";
import { AlertsView } from "@/features/dashboard/views/AlertsView";

function AlertsPage() {
  return <AlertsView />;
}
export const Route = createFileRoute("/dashboard/alerts")({
  pendingComponent: AlertsLoading,
  component: AlertsPage,
});
