import { SystemLayout } from "@/features/dashboard/SystemLayout";
import { TankProvider } from "@/features/dashboard/context/TankContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TankProvider>
      <SystemLayout>{children}</SystemLayout>
    </TankProvider>
  );
}