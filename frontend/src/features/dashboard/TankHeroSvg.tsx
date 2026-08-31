export function TankHeroSvg() {
  return (
    <svg
      className="w-full h-full"
      viewBox="0 0 380 440"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="ep-water-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1D5B62" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#0B2E33" stopOpacity="0.85" />
        </linearGradient>
        <linearGradient id="ep-caustic-1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#5FB8C4" stopOpacity="0" />
          <stop offset="50%" stopColor="#5FB8C4" stopOpacity="0.14" />
          <stop offset="100%" stopColor="#5FB8C4" stopOpacity="0" />
        </linearGradient>
        <clipPath id="ep-tank-clip">
          <rect x="31" y="101" width="298" height="288" />
        </clipPath>
      </defs>

      <rect
        x="30"
        y="60"
        width="300"
        height="330"
        rx="14"
        stroke="rgba(242,235,221,0.35)"
        strokeWidth="2"
      />

      {/* waterline with gentle ripple */}
      <path
        className="ep-ripple"
        d="M30,100 Q60,97 90,100 T150,100 T210,100 T270,100 T330,100"
        fill="none"
        stroke="rgba(242,235,221,0.5)"
        strokeWidth="1.5"
        strokeDasharray="2 6"
      />
      <text x="336" y="104" fill="rgba(242,235,221,0.45)" fontFamily="IBM Plex Mono" fontSize="10">
        waterline
      </text>

      <rect x="31" y="101" width="298" height="288" fill="url(#ep-water-grad)" />

      {/* drifting caustic light bands */}
      <g clipPath="url(#ep-tank-clip)" opacity="0.8">
        <rect
          className="ep-caustic"
          x="-100"
          y="110"
          width="220"
          height="270"
          fill="url(#ep-caustic-1)"
          style={{ animationDuration: "9s", animationDelay: "0s" }}
        />
        <rect
          className="ep-caustic"
          x="-100"
          y="110"
          width="180"
          height="270"
          fill="url(#ep-caustic-1)"
          style={{ animationDuration: "12s", animationDelay: "-4s" }}
        />
      </g>

      <rect x="31" y="368" width="298" height="21" fill="#081E22" />

      <line x1="270" y1="60" x2="270" y2="170" stroke="rgba(242,235,221,0.4)" strokeWidth="2" />
      <circle className="ep-probe-pulse" cx="270" cy="175" r="5" fill="var(--coral)" />
      <text x="238" y="46" fill="rgba(242,235,221,0.6)" fontFamily="IBM Plex Mono" fontSize="9.5">
        DO / pH probe
      </text>

      {/* aerator with multiple bubble streams */}
      <rect x="85" y="365" width="26" height="10" rx="2" fill="rgba(242,235,221,0.3)" />
      {[
        { cx: 90, r: 3, dur: "2.6s", delay: "0s", op: 0.55 },
        { cx: 94, r: 2.4, dur: "2.2s", delay: "0.4s", op: 0.5 },
        { cx: 98, r: 2.8, dur: "3s", delay: "0.9s", op: 0.5 },
        { cx: 101, r: 2, dur: "2.4s", delay: "1.3s", op: 0.45 },
        { cx: 105, r: 2.5, dur: "2.8s", delay: "1.7s", op: 0.5 },
        { cx: 108, r: 1.8, dur: "2.1s", delay: "2.1s", op: 0.45 },
      ].map((b, i) => (
        <circle
          key={i}
          className="ep-bubble"
          cx={b.cx}
          cy="365"
          r={b.r}
          fill="rgba(242,235,221,0.55)"
          opacity={b.op}
          style={{ animationDuration: b.dur, animationDelay: b.delay }}
        />
      ))}

      {/* second aerator, smaller stream, opposite side */}
      <rect x="255" y="365" width="20" height="8" rx="2" fill="rgba(242,235,221,0.22)" />
      {[
        { cx: 259, r: 2.2, dur: "2.9s", delay: "0.2s" },
        { cx: 263, r: 1.8, dur: "2.4s", delay: "1s" },
        { cx: 267, r: 2, dur: "3.2s", delay: "1.6s" },
      ].map((b, i) => (
        <circle
          key={i}
          className="ep-bubble"
          cx={b.cx}
          cy="365"
          r={b.r}
          fill="rgba(242,235,221,0.4)"
          style={{ animationDuration: b.dur, animationDelay: b.delay }}
        />
      ))}

      {/* shrimp school — varied sizes, depths, speeds */}
      <g className="ep-shrimp-drift" style={{ transformOrigin: "150px 260px", animationDuration: "7s", animationDelay: "0s" }}>
        <path d="M150 260 q14 -14 28 -2 q6 6 0 12 q-4 4 -10 0 l-4 -4 q-6 6 -14 2 q-6 -3 0 -8z" fill="var(--coral)" opacity="0.88" />
      </g>
      <g className="ep-shrimp-drift" style={{ transformOrigin: "210px 310px", animationDuration: "8.4s", animationDelay: "1.8s" }}>
        <path d="M210 310 q12 -12 24 -2 q5 5 0 10 q-3 3 -9 0 l-3 -3 q-5 5 -12 2 q-5 -3 0 -7z" fill="var(--amber)" opacity="0.78" />
      </g>
      <g className="ep-shrimp-drift" style={{ transformOrigin: "95px 220px", animationDuration: "6.2s", animationDelay: "3.4s" }}>
        <path d="M95 220 q10 -10 20 -2 q4 4 0 8 q-3 3 -7 0 l-3 -3 q-4 4 -10 1 q-4 -2 0 -6z" fill="var(--coral)" opacity="0.6" />
      </g>
      <g className="ep-shrimp-drift" style={{ transformOrigin: "255px 235px", animationDuration: "9s", animationDelay: "0.9s" }}>
        <path d="M255 235 q11 -11 22 -2 q5 5 0 9 q-3 3 -8 0 l-3 -3 q-5 5 -11 1 q-5 -3 0 -5z" fill="var(--mangrove-light)" opacity="0.5" />
      </g>
      <g className="ep-shrimp-drift" style={{ transformOrigin: "130px 340px", animationDuration: "5.6s", animationDelay: "2.6s" }}>
        <path d="M130 340 q9 -9 18 -2 q4 4 0 7 q-2 2 -6 0 l-3 -3 q-4 4 -9 1 q-4 -2 0 -5z" fill="var(--amber)" opacity="0.5" />
      </g>
      <g className="ep-shrimp-drift" style={{ transformOrigin: "185px 190px", animationDuration: "7.8s", animationDelay: "4.2s" }}>
        <path d="M185 190 q8 -8 16 -1 q3 3 0 6 q-2 2 -5 0 l-2 -2 q-3 3 -8 1 q-3 -2 0 -4z" fill="var(--coral)" opacity="0.4" />
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
