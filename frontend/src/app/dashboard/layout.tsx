import { SystemLayout } from "@/features/dashboard/SystemLayout";
import { TankProvider } from "@/features/dashboard/context/TankContext";
import { Esp32Provider } from "@/features/dashboard/context/Esp32Context";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TankProvider>
      <Esp32Provider>
        <SystemLayout>{children}</SystemLayout>
      </Esp32Provider>
    </TankProvider>
  );
}