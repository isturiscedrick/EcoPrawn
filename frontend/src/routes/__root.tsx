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
function Root() {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <HeadContent />
        <script
          dangerouslySetInnerHTML={{
            __html:
              '\n              (function () {\n                try {\n                  var saved = localStorage.getItem("ep-dashboard-theme");\n                  var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;\n                  if (saved === "dark" || (saved !== "light" && prefersDark)) {\n                    document.documentElement.classList.add("dark");\n                  }\n                } catch (_) {}\n              }());\n            ',
          }}
        />
      </head>
      <body className="ecoprawn-root">
        <LogoIntroGate />
        <AuthModalProvider>
          <Outlet />
        </AuthModalProvider>
        <Scripts />
      </body>
    </html>
  );
}
