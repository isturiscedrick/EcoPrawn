import { createFileRoute } from "@tanstack/react-router";
import { ConfigurationView } from "@/features/dashboard/views/ConfigurationView";

function ConfigurationPage() {
  return <ConfigurationView />;
}

export const Route = createFileRoute("/dashboard/settings/configuration")({
  component: ConfigurationPage,
});
