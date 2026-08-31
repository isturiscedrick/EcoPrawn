import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en">
      <body className="ecoprawn-root">{children}</body>
    </html>
  );
}
