import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

interface DashboardLogoutDialogsProps {
  confirmOpen: boolean;
  errorOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
  onErrorDismiss: () => void;
}

export function DashboardLogoutDialogs({
  confirmOpen,
  errorOpen,
  onCancel,
  onConfirm,
  onErrorDismiss,
}: DashboardLogoutDialogsProps) {
  return (
    <>
      <ConfirmDialog
        open={confirmOpen}
        title="Log out of EcoPrawn?"
        description="Are you sure you want to end your current session?"
        confirmLabel="Log out"
        tone="danger"
        onCancel={onCancel}
        onConfirm={onConfirm}
      />
      <ConfirmDialog
        open={errorOpen}
        title="Unable to log out"
        description="Logout could not be completed. Please try again."
        confirmLabel="Okay"
        showCancel={false}
        onCancel={onErrorDismiss}
        onConfirm={onErrorDismiss}
      />
    </>
  );
}
