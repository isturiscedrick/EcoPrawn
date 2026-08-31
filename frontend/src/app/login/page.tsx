import { SiteHeader } from "@/components/SiteHeader";
import { LoginForm } from "@/features/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen text-[var(--sand)]">
      <SiteHeader showLinks={false} />
      <div
        className="relative min-h-[calc(100vh-64px)] flex items-center justify-center px-6 py-16 overflow-hidden"
        style={{
          background:
            "linear-gradient(180deg, var(--water-mid) 0%, var(--water-deep) 62%, #081E22 100%)",
        }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-[420px] w-[420px] rounded-full opacity-25 blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(232,98,58,0.3), transparent 70%)" }}
        />
        <LoginForm />
      </div>
    </div>
  );
}
