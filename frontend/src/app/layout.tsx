import type { Metadata } from "next";
import "./globals.css";
import { AuthModalProvider } from "@/features/auth/AuthModalProvider";

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
        <AuthModalProvider>{children}</AuthModalProvider>
      </body>
    </html>
  );
}