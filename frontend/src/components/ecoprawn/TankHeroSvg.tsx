export function TankHeroSvg() {
  return (
    <svg
      className="w-full h-full"
      viewBox="0 0 380 440"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="30"
        y="60"
        width="300"
        height="330"
        rx="14"
        stroke="rgba(242,235,221,0.35)"
        strokeWidth="2"
      />
      <line
        x1="30"
        y1="100"
        x2="330"
        y2="100"
        stroke="rgba(242,235,221,0.5)"
        strokeWidth="1.5"
        strokeDasharray="2 6"
      />
      <text x="336" y="104" fill="rgba(242,235,221,0.45)" fontFamily="IBM Plex Mono" fontSize="10">
        waterline
      </text>
      <rect x="31" y="101" width="298" height="288" fill="url(#ep-water-grad)" />
      <defs>
        <linearGradient id="ep-water-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1D5B62" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#0B2E33" stopOpacity="0.85" />
        </linearGradient>
      </defs>
      <rect x="31" y="368" width="298" height="21" fill="#081E22" />

      <line x1="270" y1="60" x2="270" y2="170" stroke="rgba(242,235,221,0.4)" strokeWidth="2" />
      <circle className="ep-probe-pulse" cx="270" cy="175" r="5" fill="var(--coral)" />
      <text x="238" y="46" fill="rgba(242,235,221,0.6)" fontFamily="IBM Plex Mono" fontSize="9.5">
        DO / pH probe
      </text>

      <rect x="85" y="365" width="26" height="10" rx="2" fill="rgba(242,235,221,0.3)" />
      <circle
        className="ep-bubble"
        cx="94"
        cy="365"
        r="3"
        fill="rgba(242,235,221,0.55)"
        style={{ animationDuration: "2.6s", animationDelay: "0s" }}
      />
      <circle
        className="ep-bubble"
        cx="101"
        cy="365"
        r="2.3"
        fill="rgba(242,235,221,0.5)"
        style={{ animationDuration: "3.1s", animationDelay: "0.6s" }}
      />
      <circle
        className="ep-bubble"
        cx="97"
        cy="365"
        r="2.6"
        fill="rgba(242,235,221,0.45)"
        style={{ animationDuration: "2.3s", animationDelay: "1.2s" }}
      />
      <circle
        className="ep-bubble"
        cx="106"
        cy="365"
        r="2"
        fill="rgba(242,235,221,0.5)"
        style={{ animationDuration: "2.9s", animationDelay: "1.7s" }}
      />

      <g className="ep-shrimp-drift" style={{ transformOrigin: "150px 260px", animationDelay: "0s" }}>
        <path
          d="M150 260 q14 -14 28 -2 q6 6 0 12 q-4 4 -10 0 l-4 -4 q-6 6 -14 2 q-6 -3 0 -8z"
          fill="var(--coral)"
          opacity="0.85"
        />
      </g>
      <g className="ep-shrimp-drift" style={{ transformOrigin: "210px 310px", animationDelay: "1.8s" }}>
        <path
          d="M210 310 q12 -12 24 -2 q5 5 0 10 q-3 3 -9 0 l-3 -3 q-5 5 -12 2 q-5 -3 0 -7z"
          fill="var(--amber)"
          opacity="0.75"
        />
      </g>
      <g className="ep-shrimp-drift" style={{ transformOrigin: "95px 220px", animationDelay: "3.4s" }}>
        <path
          d="M95 220 q10 -10 20 -2 q4 4 0 8 q-3 3 -7 0 l-3 -3 q-4 4 -10 1 q-4 -2 0 -6z"
          fill="var(--coral)"
          opacity="0.6"
        />
      </g>

      <rect x="160" y="34" width="30" height="16" rx="3" fill="rgba(242,235,221,0.5)" />
      <circle cx="175" cy="42" r="4" fill="var(--water-deep)" />
      <line
        x1="175"
        y1="50"
        x2="175"
        y2="100"
        stroke="rgba(242,235,221,0.25)"
        strokeWidth="1"
        strokeDasharray="1 5"
      />
      <text x="196" y="46" fill="rgba(242,235,221,0.6)" fontFamily="IBM Plex Mono" fontSize="9.5">
        vision cam
      </text>
    </svg>
  );
}