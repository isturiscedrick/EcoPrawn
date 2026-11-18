import { createFileRoute } from "@tanstack/react-router";
import { VisionGrowth } from "@/features/dashboard/views/VisionGrowth";

export const Route = createFileRoute("/dashboard/vision")({
  component: VisionGrowth,
});
