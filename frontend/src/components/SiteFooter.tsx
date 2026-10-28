import { ScrollEnhancements } from "./ScrollUi";

export function SiteFooter() {
  return (
    <>
      <footer className="bg-[var(--ep-primary)] px-5 py-10 text-[var(--ep-bg)] sm:px-8 sm:py-12">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-6 border-t border-[var(--ep-bg)] pt-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="ep-font-display text-xl font-semibold">EcoPrawn</div>
            <p className="mt-2 max-w-[26rem] text-sm leading-relaxed">
              An AIoT-Enabled Indoor White Shrimp Farming &amp; Water Management System
            </p>
          </div>

          <p className="text-sm leading-relaxed sm:text-right">
            University of Caloocan City, Congress Campus
            <br />
            Computer Studies Department · CS 118
          </p>
        </div>
      </footer>

      <ScrollEnhancements />
    </>
  );
}