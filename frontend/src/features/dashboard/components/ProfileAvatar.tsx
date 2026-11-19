import { Icon } from "@/components/ui/Icon";
import { getProfileInitials } from "../layout/system-layout-utils";

interface ProfileAvatarProps {
  name: string;
  image?: string | null;
  size?: "sm" | "md";
  className?: string;
}

export function ProfileAvatar({
  name,
  image,
  size = "md",
  className = "",
}: ProfileAvatarProps) {
  const sizeClass = size === "sm" ? "h-9 w-9" : "h-10 w-10";

  return (
    <span
      className={`relative inline-flex ${sizeClass} shrink-0 items-center justify-center overflow-hidden rounded-full border border-[var(--ep-accent)]/25 bg-[var(--ep-accent-tint)] text-xs font-bold text-[var(--ep-primary)] ${className}`}
      aria-hidden="true"
    >
      {image ? (
        <img src={image} alt="" className="h-full w-full object-cover" />
      ) : name ? (
        getProfileInitials(name)
      ) : (
        <Icon name="user-round" size={18} />
      )}
    </span>
  );
}
