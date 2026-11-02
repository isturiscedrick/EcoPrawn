import { DashboardViewSkeleton } from "@/features/dashboard/components/DashboardStates";

function ProfileLoading() {
  return <DashboardViewSkeleton variant="profile" />;
}

import { createFileRoute } from "@tanstack/react-router";
import { ProfileEditForm } from "@/features/dashboard/components/ProfileEditForm";

function ProfilePage() {
  return (
    <>
      <div className="mb-7 border-b border-[rgba(11,46,51,0.12)] pb-7">
        <div className="mb-2 ep-font-mono text-xs font-semibold uppercase tracking-[0.14em] text-[var(--mangrove-text)]">
          Account settings
        </div>
        <h1 className="ep-font-display text-[30px] font-semibold leading-tight tracking-[-0.02em] text-[var(--water-deep)]">
          User Profile
        </h1>
        <p className="mt-2 text-[15px] text-[rgba(11,35,32,0.68)]">
          Manage the identity shown in your EcoPrawn dashboard.
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
