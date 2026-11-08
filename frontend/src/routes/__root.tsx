import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";
import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import stylesheet from "@/styles/globals.css?url";
import { AuthModalProvider } from "@/features/auth/AuthModalProvider";
import { LogoIntroGate } from "@/components/motion/LogoIntroGate";
export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "EcoPrawn" },
      {
        name: "description",
        content:
          "An AIoT-Enabled Indoor White Shrimp Farming & Water Management System",
      },
    ],
    links: [
      { rel: "stylesheet", href: stylesheet },
      { rel: "icon", href: "/icon.svg" },
    ],
  }),
  component: Root,
});
function HomeScrollReset() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  useEffect(() => {
    if (pathname !== "/") return;

    // TanStack scroll restoration can restore the previous position for the
    // home route. Run after the route commit as well, so Home always starts at 0.
    window.scrollTo({ left: 0, top: 0, behavior: "instant" });
    const frame = window.requestAnimationFrame(() => {
      window.scrollTo({ left: 0, top: 0, behavior: "instant" });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [pathname]);

  return null;
}

function Root() {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <HeadContent />
        <script
          dangerouslySetInnerHTML={{
            __html:
              '\n              (function () {\n                try {\n                  var migrationKey = "ep-light-mode-default-v1";\n                  if (localStorage.getItem(migrationKey) !== "done") {\n                    localStorage.setItem("ep-dashboard-theme", "light");\n                    localStorage.setItem(migrationKey, "done");\n                  }\n                  var saved = localStorage.getItem("ep-dashboard-theme");\n                  document.documentElement.classList.toggle("dark", saved === "dark");\n                } catch (_) {\n                  document.documentElement.classList.remove("dark");\n                }\n              }());\n            ',
          }}
        />
      </head>
      <body className="ecoprawn-root">
        <LogoIntroGate />
        <AuthModalProvider>
          <HomeScrollReset />
          <Outlet />
        </AuthModalProvider>
        <Scripts />
      </body>
    </html>
  );
}
