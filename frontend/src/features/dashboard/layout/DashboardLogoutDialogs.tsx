import { useState } from "react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

export function DashboardLogoutDialogs() {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onClick={() => setConfirmOpen(true)}
      />
      <ConfirmDialog
        open={confirmOpen}
        title="Log out of EcoPrawn?"
        description="Are you sure you want to end your current session?"
        confirmLabel="Log out"
        tone="danger"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={async () => {
          setConfirmOpen(false);
          try {
            const response = await fetch("/api/auth/logout", { method: "POST" });
            if (!response.ok) throw new Error("Logout failed");
            window.location.replace("/login");
          } catch {
            setErrorOpen(true);
          }
        }}
      />
      <ConfirmDialog
        open={errorOpen}
        title="Unable to log out"
        description="Logout could not be completed. Please try again."
        confirmLabel="Okay"
        showCancel={false}
        onCancel={() => setErrorOpen(false)}
        onConfirm={() => setErrorOpen(false)}
      />
    </>
  );
}
