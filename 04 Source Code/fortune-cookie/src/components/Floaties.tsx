import type { ReactNode } from "react";

/**
 * The floating background: three kinds of drifting things, hand-placed.
 * Paper slips (the note inside a cookie), four-point sparkles, and crescent
 * moons. Each kind moves its own way: slips sway, sparkles twinkle, moons rock.
 */
type Kind = "slip" | "spark" | "moon";
const SPOTS: { k: Kind; x: number; y: number; s: number; r?: number }[] = [
  { k: "slip", x: 4, y: 14, s: 26, r: -14 },
  { k: "spark", x: 8, y: 36, s: 14 },
  { k: "moon", x: 3, y: 56, s: 20, r: -20 },
  { k: "spark", x: 7, y: 76, s: 16 },
  { k: "slip", x: 4, y: 92, s: 20, r: 18 },
  { k: "moon", x: 90, y: 9, s: 24, r: 15 },
  { k: "spark", x: 93, y: 27, s: 12 },
  { k: "slip", x: 91, y: 46, s: 22, r: 22 },
  { k: "spark", x: 94, y: 64, s: 16 },
  { k: "moon", x: 92, y: 84, s: 16, r: 40 },
  { k: "spark", x: 36, y: 3, s: 10 },
  { k: "slip", x: 64, y: 95, s: 18, r: -8 },
  { k: "spark", x: 62, y: 5, s: 13 },
];

function Slip({ s }: { s: number }) {
  return (
    <svg width={s} height={s * 0.6} viewBox="0 0 30 18" aria-hidden="true">
      <rect x="1" y="1" width="28" height="16" rx="2.5" fill="var(--paper)" stroke="var(--float-edge)" strokeWidth="1.2" />
      <path d="M6 7h13M6 11h9" stroke="var(--float-ink)" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="23.5" cy="9" r="1.8" fill="var(--pink)" />
    </svg>
  );
}

function Spark({ s }: { s: number }) {
  return (
    <svg width={s} height={s} viewBox="-8 -8 16 16" aria-hidden="true">
      <path d="M0 -7 C1 -2 2 -1 7 0 C2 1 1 2 0 7 C-1 2 -2 1 -7 0 C-2 -1 -1 -2 0 -7 Z" fill="var(--gold)" />
    </svg>
  );
}

function Moon({ s }: { s: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M17 15.5A8 8 0 0 1 8.5 4a8 8 0 1 0 8.5 11.5Z" fill="var(--float-moon)" />
    </svg>
  );
}

const ART: Record<Kind, (p: { s: number }) => ReactNode> = { slip: Slip, spark: Spark, moon: Moon };

export function Floaties({ dense = true }: { dense?: boolean }) {
  const spots = dense ? SPOTS : SPOTS.filter((_, i) => i % 2 === 0);
  return (
    <div className="floaties" aria-hidden="true">
      {spots.map((f, i) => {
        const Art = ART[f.k];
        return (
          <span key={i} className={`fl fl-${f.k}`} style={{ left: `${f.x}%`, top: `${f.y}%`, rotate: `${f.r ?? 0}deg`, animationDelay: `${(i % 6) * -1.3}s` }}>
            <Art s={f.s} />
          </span>
        );
      })}
    </div>
  );
}
