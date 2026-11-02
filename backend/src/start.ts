import { createStart, createMiddleware } from '@tanstack/react-start';
const apiCache = createMiddleware().server(async ({ request, next }) => {
  const result = await next();
  if (new URL(request.url).pathname.startsWith('/api/')) {
    result.response.headers.set('Cache-Control', 'private, no-store');
    result.response.headers.set('Pragma', 'no-cache');
    result.response.headers.set('Expires', '0');
  }
  return result;
});
export const startInstance = createStart(() => ({ requestMiddleware: [apiCache] }));
