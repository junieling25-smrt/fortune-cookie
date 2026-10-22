import { useEffect, useState } from "react";

export type SkyTime = "morning" | "day" | "evening" | "night";

/** Morning 5 to 11, day 11 to 5 PM, evening 5 to 7 PM, night after that. */
const skyAt = (h: number): SkyTime => (h >= 5 && h < 11 ? "morning" : h >= 11 && h < 17 ? "day" : h >= 17 && h < 19 ? "evening" : "night");

/** ?sky=night pins the sky, for screenshots. */
const skyNow = (): SkyTime => {
  const pinned = new URLSearchParams(window.location.search).get("sky");
  return pinned === "morning" || pinned === "day" || pinned === "evening" || pinned === "night" ? pinned : skyAt(new Date().getHours());
};

/** A spiral from the middle of a lobe outward, about one and a quarter turns. */
function curl(cx: number, cy: number, r: number) {
  const pts: string[] = [];
  for (let i = 0; i <= 28; i++) {
    const t = i / 28;
    const a = Math.PI * 0.6 + t * Math.PI * 2.5;
    const rr = r * (0.12 + 0.6 * t);
    pts.push(`${(cx + Math.cos(a) * rr).toFixed(2)} ${(cy + Math.sin(a) * rr).toFixed(2)}`);
  }
  return `M${pts.join(" L")}`;
}

const LOBES: [number, number, number][] = [
  [26, 32, 10],
  [72, 31, 12],
  [48, 24, 15],
];

/** A classic auspicious cloud: three round heads, each with a curl, on a flat base. */
function Cloud({ w, flip }: { w: number; flip?: boolean }) {
  return (
    <svg className="sky-cloud-art" width={w} height={w / 2} viewBox="0 0 100 50" style={flip ? { scale: "-1 1" } : undefined}>
      <rect x="10" y="33" width="80" height="11" rx="5.5" />
      {LOBES.map(([cx, cy, r]) => (
        <g key={cx}>
          <circle cx={cx} cy={cy} r={r} />
          <path d={curl(cx, cy, r)} className="sky-curl" />
        </g>
      ))}
    </svg>
  );
}

/** Hand-placed in the gaps between the floating slips, moons, and sparkles. */
const CLOUDS: { x: number; y: number; w: number; flip?: boolean; wide?: boolean }[] = [
  { x: 1.5, y: 24, w: 104 },
  { x: 89, y: 35, w: 92, flip: true },
  { x: 2.5, y: 64, w: 84, flip: true, wide: true },
  { x: 90, y: 73, w: 100, wide: true },
  { x: 14, y: 87, w: 76, wide: true },
  { x: 80, y: 14, w: 70, wide: true, flip: true },
];

/**
 * The page sky behind everything: a gradient for the time of day, a few faint
 * auspicious clouds, and stars at night. Night also switches the
 * app to its dark theme.
 */
export function Sky() {
  const [sky, setSky] = useState(skyNow);

  useEffect(() => {
    const tick = () => setSky(skyNow());
    const id = window.setInterval(tick, 5 * 60 * 1000);
    window.addEventListener("focus", tick);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("focus", tick);
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.sky = sky;
    if (sky === "night") root.dataset.theme = "dark";
    else delete root.dataset.theme;
  }, [sky]);

  return (
    <div className="sky" aria-hidden="true">
      <div className="sky-glow" />
      {sky === "night" ? <div className="sky-stars" /> : null}
      {CLOUDS.map((c, i) => (
        <span key={i} className={`sky-cloud ${c.wide ? "is-wide" : ""}`} style={{ left: `${c.x}%`, top: `${c.y}%`, animationDelay: `${i * -2.3}s` }}>
          <Cloud w={c.w} flip={c.flip} />
        </span>
      ))}
    </div>
  );
}
