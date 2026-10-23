export function SiteFooter() {
  return (
    <footer className="bg-[#081E22] px-5 py-10 text-[rgba(242,235,221,0.55)] sm:px-8 sm:py-12">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-7 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2">
            <span className="ep-font-display text-[17px] font-semibold text-[var(--sand)]">
              EcoPrawn
            </span>
          </div>

          <div className="max-w-[420px] text-[12px] leading-[1.6]">
            An AIoT-Enabled Indoor White Shrimp Farming &amp; Water
            Management System
          </div>
        </div>

        <div className="text-left text-[11.5px] leading-[1.7] sm:text-right">
          University of Caloocan City, Congress Campus — Computer Studies
          Department
          <br />
          Thesis Writing 1, CS 118 · Completed System
        </div>
      </div>
    </footer>
  );
}