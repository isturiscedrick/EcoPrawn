import { createFileRoute } from "@tanstack/react-router";
import { DashboardViewSkeleton } from "@/features/dashboard/components/DashboardStates";
import { AssistantView } from "@/features/dashboard/views/AssistantView";

function AssistantLoading() {
  return <DashboardViewSkeleton variant="vision" />;
}

function AssistantPage() {
  return <AssistantView />;
}

export const Route = createFileRoute("/dashboard/assistant")({
  pendingComponent: AssistantLoading,
  component: AssistantPage,
});
