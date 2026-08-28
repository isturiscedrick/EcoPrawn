export function TrendChart() {
  return (
    <div className="h-[180px] mt-1.5">
      <svg viewBox="0 0 560 160" width="100%" height="100%" preserveAspectRatio="none">
        <defs>
          <linearGradient id="ep-do-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3C7A5C" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#3C7A5C" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polyline
          points="0,90 40,84 80,88 120,70 160,76 200,60 240,66 280,50 320,58 360,44 400,52 440,40 480,46 520,36 560,42"
          fill="none"
          stroke="#3C7A5C"
          strokeWidth="2.5"
        />
        <polygon
          points="0,90 40,84 80,88 120,70 160,76 200,60 240,66 280,50 320,58 360,44 400,52 440,40 480,46 520,36 560,42 560,160 0,160"
          fill="url(#ep-do-fill)"
        />
        <polyline
          points="0,110 40,112 80,105 120,108 160,98 200,102 240,92 280,96 320,88 360,90 400,84 440,86 480,80 520,82 560,78"
          fill="none"
          stroke="#E8623A"
          strokeWidth="2"
          strokeDasharray="4 4"
          opacity="0.8"
        />
      </svg>
    </div>
  );
}