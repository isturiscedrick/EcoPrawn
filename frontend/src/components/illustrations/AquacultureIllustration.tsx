import type { ReactNode } from "react";

type IllustrationVariant = "landing" | "about" | "contact";

const accentByVariant: Record<IllustrationVariant, ReactNode> = {
  landing: (
    <>
      <path d="M105 204c34-22 67-22 99 0s65 22 98 0 65-22 98 0" className="ep-illustration-wave" />
      <path d="M135 176c10-18 28-28 49-28 14 0 25 5 34 14l-12 12 12 12c-9 9-20 14-34 14-21 0-39-10-49-28Z" className="ep-illustration-creature" />
      <path d="m135 176-18-15v30l18-15Zm83-14 18-13-5 27m-13 14 18 13-5-27" className="ep-illustration-detail" />
      <circle cx="161" cy="171" r="3" className="ep-illustration-eye" />
      <path d="M290 112v76m-13-62h26m-13 0v-15m-8 77h16" className="ep-illustration-sensor" />
      <circle cx="290" cy="104" r="7" className="ep-illustration-node" />
      <path d="M290 188v16" className="ep-illustration-detail" />
    </>
  ),
  about: (
    <>
      <circle cx="260" cy="160" r="44" className="ep-illustration-core" />
      <path d="M260 139v42m-14-28c7-8 21-8 28 0m-28 14c7 8 21 8 28 0" className="ep-illustration-detail" />
      <path d="M260 116V70m-39 101-42 24m120-24 42 24" className="ep-illustration-connector" />
      <circle cx="260" cy="62" r="18" className="ep-illustration-node" />
      <circle cx="171" cy="200" r="18" className="ep-illustration-node ep-illustration-node--alt" />
      <circle cx="349" cy="200" r="18" className="ep-illustration-node ep-illustration-node--alt" />
      <path d="M260 54v16m-8-8h16M163 200h16m-8-8v16m170-8h16m-8-8v16" className="ep-illustration-detail" />
    </>
  ),
  contact: (
    <>
      <rect x="166" y="108" width="188" height="112" rx="18" className="ep-illustration-card" />
      <path d="m177 123 83 62 83-62" className="ep-illustration-envelope" />
      <path d="M177 207 230 164m113 43-53-43" className="ep-illustration-envelope" />
      <circle cx="260" cy="90" r="8" className="ep-illustration-node" />
      <path d="M260 78v-18m-8 9h16" className="ep-illustration-detail" />
      <circle cx="365" cy="145" r="5" className="ep-illustration-node ep-illustration-node--alt" />
      <circle cx="155" cy="185" r="5" className="ep-illustration-node ep-illustration-node--alt" />
      <path d="M365 145h18m-9-9 9 9-9 9M155 185h-18m9-9-9 9 9 9" className="ep-illustration-detail" />
    </>
  ),
};

export function AquacultureIllustration({
  variant,
  className = "",
}: {
  variant: IllustrationVariant;
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={`ep-page-illustration ep-page-illustration--${variant} ${className}`.trim()}
      data-page-illustration={variant}
    >
      <svg viewBox="0 0 520 280" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id={`ep-illustration-gradient-${variant}`} x1="100" y1="30" x2="420" y2="250" gradientUnits="userSpaceOnUse">
            <stop stopColor="var(--ep-accent)" stopOpacity=".22" />
            <stop offset="1" stopColor="#38BDF8" stopOpacity=".08" />
          </linearGradient>
        </defs>
        <rect x="74" y="26" width="372" height="228" rx="30" fill={`url(#ep-illustration-gradient-${variant})`} />
        <circle cx="260" cy="140" r="102" className="ep-illustration-orbit" />
        <circle cx="260" cy="140" r="78" className="ep-illustration-orbit ep-illustration-orbit--inner" />
        <g className="ep-illustration-art">{accentByVariant[variant]}</g>
        <g className="ep-illustration-bubbles">
          <circle cx="116" cy="88" r="4" />
          <circle cx="400" cy="92" r="6" />
          <circle cx="390" cy="218" r="3" />
          <circle cx="126" cy="218" r="5" />
        </g>
      </svg>
    </div>
  );
}
