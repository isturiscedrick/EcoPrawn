import type { ReactNode } from "react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { PublicChromeMotion } from "@/components/motion/PublicChromeMotion";

interface PublicPageLayoutProps {
  className: string;
  motion?: ReactNode;
  children: ReactNode;
}

/** Shared chrome and page frame for public informational pages. */
export function PublicPageLayout({
  className,
  motion,
  children,
}: PublicPageLayoutProps) {
  return (
    <div className={`ep-landing ${className} flex min-h-screen flex-col`}>
      {motion}
      <PublicChromeMotion />
      <SiteHeader tone="white" integrated />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
