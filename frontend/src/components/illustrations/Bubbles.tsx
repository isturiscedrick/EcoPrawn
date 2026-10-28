const BUBBLES = [
  { left: "6%", size: 6, dur: "7s", delay: "0s" },
  { left: "17%", size: 4, dur: "9s", delay: "2.2s" },
  { left: "29%", size: 8, dur: "8s", delay: "4.1s" },
  { left: "43%", size: 5, dur: "10s", delay: "1s" },
  { left: "58%", size: 7, dur: "7.5s", delay: "3.3s" },
  { left: "71%", size: 4, dur: "9.5s", delay: "5.4s" },
  { left: "84%", size: 6, dur: "8.5s", delay: "0.6s" },
  { left: "93%", size: 5, dur: "11s", delay: "2.8s" },
];

/** Decorative bubbles that rise from the bottom of a relatively-positioned parent. */
export function Bubbles({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      {BUBBLES.map((b) => (
        <span
          key={b.left}
          className="ep-bubble absolute bottom-0 rounded-full bg-[rgba(242,235,221,0.45)]"
          style={{
            left: b.left,
            width: b.size,
            height: b.size,
            animationDuration: b.dur,
            animationDelay: b.delay,
          }}
        />
      ))}
    </div>
  );
}