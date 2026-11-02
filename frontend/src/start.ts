import { createStart, createMiddleware } from "@tanstack/react-start";
const gateway = createMiddleware().server(async ({ request, next }) => {
  const url = new URL(request.url);
  const backend = (process.env.BACKEND_URL || "http://localhost:4000").replace(
    /\/$/,
    "",
  );
  if (url.pathname.startsWith("/api/")) {
    try {
      const headers = new Headers(request.headers);
      headers.delete("host");
      headers.delete("connection");
      headers.delete("content-length");
      const upstream = await fetch(backend + url.pathname + url.search, {
        method: request.method,
        headers,
        body: ["GET", "HEAD"].includes(request.method)
          ? undefined
          : await request.arrayBuffer(),
        redirect: "manual",
        signal: AbortSignal.timeout(15000),
      });
      const resultHeaders = new Headers(upstream.headers);
      resultHeaders.delete("content-encoding");
      resultHeaders.delete("content-length");
      return new Response(upstream.body, {
        status: upstream.status,
        headers: resultHeaders,
      });
    } catch {
      return new Response("Unable to reach the API service.", {
        status: 503,
        headers: { "Cache-Control": "private, no-store" },
      });
    }
  }
  if (url.pathname === "/dashboard" || url.pathname.startsWith("/dashboard/")) {
    let session: Response;
    try {
      session = await fetch(backend + "/api/auth/session", {
        headers: { Cookie: request.headers.get("cookie") || "" },
        cache: "no-store",
        signal: AbortSignal.timeout(15000),
      });
    } catch {
      return new Response(
        "Unable to reach the sign-in service. Please refresh to try again.",
        { status: 503, headers: { "Cache-Control": "private, no-store" } },
      );
    }
    const headers = new Headers({ "Cache-Control": "private, no-store" });
    for (const cookie of session.headers.getSetCookie())
      headers.append("Set-Cookie", cookie);
    if (session.status === 401) {
      headers.set("Location", "/login");
      return new Response(null, { status: 307, headers });
    }
    if (!session.ok)
      return new Response(
        "Unable to verify your session. Please refresh to try again.",
        { status: 503, headers },
      );
    const result = await next();
    result.response.headers.set("Cache-Control", "private, no-store");
    for (const cookie of session.headers.getSetCookie())
      result.response.headers.append("Set-Cookie", cookie);
    return result;
  }
  return next();
});
export const startInstance = createStart(() => ({
  requestMiddleware: [gateway],
}));
