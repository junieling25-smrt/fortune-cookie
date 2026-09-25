import { useEffect, useRef } from "react";
import { Spark, Star5 } from "./Icons";
import { Mark } from "./Mark";

type Bit = { kind: "star" | "spark" | "dot" | "crumb"; x: number; y: number; s: number; r?: number; depth?: number };

/** Hand-placed confetti after the reference art: five-point stars, sparks, dots, and crumbs. */
const FIELD: Bit[] = [
  { kind: "star", x: 8, y: 14, s: 18, r: -12 },
  { kind: "spark", x: 20, y: 30, s: 12 },
  { kind: "dot", x: 14, y: 52, s: 7 },
  { kind: "crumb", x: 6, y: 72, s: 14, r: 30 },
  { kind: "spark", x: 24, y: 86, s: 16 },
  { kind: "star", x: 90, y: 10, s: 14, r: 18 },
  { kind: "crumb", x: 80, y: 24, s: 12, r: -20 },
  { kind: "dot", x: 94, y: 38, s: 8 },
  { kind: "spark", x: 86, y: 58, s: 14 },
  { kind: "star", x: 94, y: 78, s: 20, r: 8 },
  { kind: "crumb", x: 74, y: 90, s: 10, r: 60 },
  { kind: "dot", x: 40, y: 8, s: 6 },
  { kind: "spark", x: 62, y: 6, s: 10 },
  { kind: "dot", x: 66, y: 94, s: 7 },
];

function Bits({ bits }: { bits: Bit[] }) {
  return (
    <>
      {bits.map((c, i) => (
        <span
          key={i}
          className={`cf cf-${c.kind}`}
          style={{
            left: `${c.x}%`,
            top: `calc(${c.y}% - var(--sy, 0) * ${(c.depth ?? 0).toFixed(3)}px)`,
            width: c.s,
            height: c.s,
            rotate: `${c.r ?? 0}deg`,
            animationDelay: `${(i % 7) * 0.9}s`,
            animationDuration: `${6 + (i % 5) * 1.4}s`,
          }}
        >
          {c.kind === "star" ? <Star5 size={c.s} /> : c.kind === "spark" ? <Spark size={c.s} /> : null}
        </span>
      ))}
    </>
  );
}

/** The confetti field behind onboarding. */
export function Confetti() {
  return (
    <div className="confetti" aria-hidden="true">
      <Bits bits={FIELD} />
    </div>
  );
}

/** Deterministic scatter so the page looks the same on every load. */
function scatter(n: number, seed: number): Bit[] {
  let s = seed;
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  const kinds: Bit["kind"][] = ["star", "spark", "dot", "crumb", "spark", "dot"];
  return Array.from({ length: n }, (_, i) => ({
    kind: kinds[i % kinds.length],
    x: Math.round(rnd() * 96 + 2),
    y: Math.round(rnd() * 96 + 2),
    s: Math.round(6 + rnd() * 14),
    r: Math.round(rnd() * 60 - 30),
    depth: 0.03 + rnd() * 0.12,
  }));
}

const PAGE_BITS = scatter(34, 17);

const FLOATERS = [
  { x: 4, y: 22, size: 54, r: -18, delay: 0 },
  { x: 91, y: 44, size: 46, r: 16, delay: 2.5 },
  { x: 6, y: 70, size: 40, r: 10, delay: 4.2 },
  { x: 88, y: 86, size: 52, r: -12, delay: 1.3 },
];

/**
 * The main page's living background: drifting confetti, a few floating fortune
 * cookies trailing ribbon slips, and a shooting star now and then. It sits behind
 * everything and moves at different depths as you scroll.
 */
export function PageBackground() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => ref.current?.style.setProperty("--sy", String(window.scrollY)));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);
  return (
    <div className="page-bg" ref={ref} aria-hidden="true">
      <Bits bits={PAGE_BITS} />
      {FLOATERS.map((f, i) => (
        <span key={i} className="floater" style={{ left: `${f.x}%`, top: `calc(${f.y}% - var(--sy, 0) * ${(0.12 + i * 0.04).toFixed(2)}px)`, rotate: `${f.r}deg`, animationDelay: `${f.delay}s` }}>
          <span className="ribbon" />
          <Mark size={f.size} />
        </span>
      ))}
      <span className="shooting" />
      <span className="shooting shooting-2" />
    </div>
  );
}
