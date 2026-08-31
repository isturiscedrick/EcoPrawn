import { SystemLayout } from "@/features/dashboard/SystemLayout";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SystemLayout>{children}</SystemLayout>;
}
