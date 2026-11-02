import { DashboardViewSkeleton } from "@/features/dashboard/components/DashboardStates";

function TanksLoading() {
  return <DashboardViewSkeleton variant="tanks" />;
}

import { createFileRoute } from "@tanstack/react-router";
import { TanksView } from "@/features/dashboard/views/TanksView";

function TanksPage() {
  return <TanksView />;
}
export const Route = createFileRoute("/dashboard/tanks")({
  pendingComponent: TanksLoading,
  component: TanksPage,
});
