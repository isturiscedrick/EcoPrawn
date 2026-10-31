import type { Metadata } from "next";
import "./globals.css";
import { AuthModalProvider } from "@/features/auth/AuthModalProvider";
import { LogoIntroGate } from "@/components/motion/LogoIntroGate";

export const metadata: Metadata = {
  title: "EcoPrawn",
  description:
    "An AIoT-Enabled Indoor White Shrimp Farming & Water Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className="ecoprawn-root">
        <LogoIntroGate />
        <AuthModalProvider>{children}</AuthModalProvider>
      </body>
    </html>
  );
}