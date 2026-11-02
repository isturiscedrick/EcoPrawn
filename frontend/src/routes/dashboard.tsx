import { DashboardSkeleton } from "@/features/dashboard/components/DashboardStates";

function DashboardLoading() {
  return <DashboardSkeleton />;
}

import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { verifyBrowserSession } from "@/server/session";
import { SystemLayout } from "@/features/dashboard/layout/SystemLayout";
import { TankProvider } from "@/features/dashboard/context/TankContext";
import { Esp32Provider } from "@/features/dashboard/context/Esp32Context";
import { ToastProvider } from "@/features/dashboard/components/Toast";

function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <TankProvider>
        <Esp32Provider>
          <SystemLayout>{children}</SystemLayout>
        </Esp32Provider>
      </TankProvider>
    </ToastProvider>
  );
}
export const Route = createFileRoute("/dashboard")({
  loader: async () => {
    if (typeof window === "undefined") return;
    const status = await verifyBrowserSession();
    if (status === 401) throw redirect({ to: "/login" });
    if (status !== 200)
      throw new Error(
        "Unable to verify your session. Please refresh to try again.",
      );
  },
  pendingComponent: DashboardLoading,
  component: () => (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  ),
});
