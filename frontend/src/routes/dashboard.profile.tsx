import { createFileRoute, Link } from "@tanstack/react-router";
import { Icon } from "@/components/ui/Icon";
import { DashboardViewSkeleton } from "@/features/dashboard/components/DashboardStates";
import { ProfileEditForm } from "@/features/dashboard/components/ProfileEditForm";

function ProfileLoading() {
  return <DashboardViewSkeleton variant="profile" />;
}

function ProfilePage() {
  return (
    <>
      <div className="mb-7 border-b border-[var(--ep-line)] pb-7">
        <Link to="/dashboard/settings" className="mb-3 inline-flex items-center gap-2 text-xs font-semibold text-[var(--ep-primary)] hover:underline">
          <Icon name="arrow-left" size={14} /> Back to Settings
        </Link>
        <div className="mb-2 ep-font-mono text-xs font-semibold uppercase tracking-[0.14em] text-[var(--ep-accent-hover)]">
          Account settings
        </div>
        <h1 className="ep-font-display text-[30px] font-semibold leading-tight tracking-[-0.02em] text-[var(--water-deep)]">
          User Profile
        </h1>
        <p className="mt-2 text-[15px] text-[var(--ep-text-muted)]">
          Update your profile details.
        </p>
      </div>
      <ProfileEditForm />
    </>
  );
}

export const Route = createFileRoute("/dashboard/profile")({
  pendingComponent: ProfileLoading,
  component: ProfilePage,
});
