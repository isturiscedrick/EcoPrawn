import { createFileRoute } from '@tanstack/react-router';
import { PATCH } from '@/handlers/alerts';

export const Route = createFileRoute('/api/alerts/$id')({
  server: {
    handlers: {
      PATCH: ({ request, params }) => PATCH(request, { params }),
      GET: () => new Response(null, { status: 405, headers: { Allow: 'PATCH, OPTIONS' } }),
      POST: () => new Response(null, { status: 405, headers: { Allow: 'PATCH, OPTIONS' } }),
      DELETE: () => new Response(null, { status: 405, headers: { Allow: 'PATCH, OPTIONS' } }),
      PUT: () => new Response(null, { status: 405, headers: { Allow: 'PATCH, OPTIONS' } }),
      OPTIONS: () => new Response(null, { status: 204, headers: { Allow: 'PATCH, OPTIONS' } }),
    },
  },
});
