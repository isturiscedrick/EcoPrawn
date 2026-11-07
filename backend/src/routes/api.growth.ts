import { createFileRoute } from "@tanstack/react-router";
import { GET, POST, PATCH, DELETE } from "@/handlers/growth";
export const Route = createFileRoute("/api/growth")({ server: { handlers: {
  GET: ({ request }) => GET(request), POST: ({ request }) => POST(request),
  PATCH: ({ request }) => PATCH(request), DELETE: ({ request }) => DELETE(request),
} } });
