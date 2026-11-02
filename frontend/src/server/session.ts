import { createServerFn } from "@tanstack/react-start";
import {
  getRequest,
  appendResponseHeader,
  setResponseHeader,
} from "@tanstack/react-start/server";
export const verifySession = createServerFn({ method: "GET" }).handler(
  async () => {
    const request = getRequest();
    setResponseHeader("Cache-Control", "private, no-store");
    try {
      const response = await fetch(
        `${(process.env.BACKEND_URL || "http://localhost:4000").replace(/\/$/, "")}/api/auth/session`,
        {
          headers: { Cookie: request.headers.get("cookie") || "" },
          cache: "no-store",
          signal: AbortSignal.timeout(15000),
        },
      );
      for (const cookie of response.headers.getSetCookie())
        appendResponseHeader("Set-Cookie", cookie);
      return response.status === 401 ? 401 : response.ok ? 200 : 503;
    } catch {
      return 503;
    }
  },
);

// Only browser navigations share an in-flight check. Server requests never share auth state.
let browserCheck: Promise<number> | undefined;
export function verifyBrowserSession(): Promise<number> {
  if (typeof window === "undefined")
    throw new Error("Browser session check invoked on server");
  if (!browserCheck)
    browserCheck = verifySession().finally(() => {
      browserCheck = undefined;
    });
  return browserCheck;
}
