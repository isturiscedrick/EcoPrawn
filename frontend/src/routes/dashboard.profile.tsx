import { createFileRoute, Link } from "@tanstack/react-router";
import { Icon } from "@/components/ui/Icon";
import { DashboardViewSkeleton } from "@/features/dashboard/components/DashboardStates";
import { ProfileEditForm } from "@/features/dashboard/components/ProfileEditForm";
import { DashboardPageHeader } from "@/features/dashboard/components/DashboardPageHeader";

function ProfileLoading() {
  return <DashboardViewSkeleton variant="profile" />;
}

function ProfilePage() {
  return (
    <>
      <DashboardPageHeader
        eyebrow="Account settings"
        title="User Profile"
        description="Update your profile details."
        actions={<Link to="/dashboard/settings" className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--ep-line)] bg-[var(--ep-surface)] px-3 text-xs font-semibold text-[var(--ep-primary)] hover:bg-[var(--ep-tint)]">
          <Icon name="arrow-left" size={14} /> Back to Settings
        </Link>}
      />
      <ProfileEditForm />
    </>
  );
}

export const Route = createFileRoute("/dashboard/profile")({
  pendingComponent: ProfileLoading,
  component: ProfilePage,
});
