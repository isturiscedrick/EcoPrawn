import { SystemLayout } from "@/features/dashboard/layout/SystemLayout";
import { TankProvider } from "@/features/dashboard/context/TankContext";
import { Esp32Provider } from "@/features/dashboard/context/Esp32Context";
import { ToastProvider } from "@/features/dashboard/components/Toast";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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