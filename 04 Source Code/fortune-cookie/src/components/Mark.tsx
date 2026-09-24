/**
 * The Fortune Cookie mark: a folded fortune cookie (two lobes and a crease)
 * with the fortune slip peeking out, printed with a small spark. One set of
 * paths drives the logo, the favicon, the cracking animation, and the share image.
 */

export const COOKIE = {
  right: "M52 22 C 60 10, 88 8, 100 22 C 110 34, 112 58, 108 76 C 106 86, 102 94, 96 100 C 90 90, 76 84, 62 86 C 60 62, 57 40, 52 22 Z",
  fold: "M52 22 C 64 34, 70 60, 62 86 C 60 62, 57 40, 52 22 Z",
  left: "M52 22 C 38 18, 20 28, 15 46 C 10 64, 16 82, 30 92 C 40 99, 54 98, 64 90 C 66 70, 62 44, 52 22 Z",
  rim: "M52 23 C 62 44, 67 70, 64 90 C 64 70, 60 46, 52 23 Z",
  shine: "M22 50 C 25 41, 32 34, 41 31",
  slip: "M57.9 86.3 L81.6 82.1 L86.1 107.7 L62.4 111.9 Z",
  crack: "M52 22 L57 31 L53 40 L59 50 L55 60 L61 70 L58 79 L63 88",
  spark: "M0 -7 C1 -2 2 -1 7 0 C2 1 1 2 0 7 C-1 2 -2 1 -7 0 C-2 -1 -1 -2 0 -7 Z",
  dotsRight: [
    [80, 24],
    [95, 44],
    [92, 68],
    [72, 40],
  ] as [number, number][],
  dotsLeft: [
    [28, 60],
    [40, 78],
    [24, 76],
    [36, 44],
  ] as [number, number][],
};

export const COOKIE_COLORS = {
  right: "#E9A13D",
  fold: "#C97E22",
  left: "#F4B652",
  rim: "#FFDD95",
  shine: "#FFE2A6",
  dots: "#B8741F",
  slip: "#FFF8EC",
  slipEdge: "#E6D8C3",
  spark: "#FF8DB0",
  crack: "#8A4E12",
};

const SPARK_ON_SLIP = "translate(73 97) rotate(-10) scale(0.8)";

function Dots({ pts }: { pts: [number, number][] }) {
  return (
    <g fill={COOKIE_COLORS.dots} opacity="0.45">
      {pts.map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="1.4" />
      ))}
    </g>
  );
}

function Slip() {
  return (
    <>
      <path d={COOKIE.slip} fill={COOKIE_COLORS.slip} stroke={COOKIE_COLORS.slipEdge} strokeWidth="0.8" strokeLinejoin="round" />
      <path d={COOKIE.spark} transform={SPARK_ON_SLIP} fill={COOKIE_COLORS.spark} />
    </>
  );
}

function RightLobe({ detail }: { detail: boolean }) {
  return (
    <>
      <path d={COOKIE.right} fill={COOKIE_COLORS.right} />
      <path d={COOKIE.fold} fill={COOKIE_COLORS.fold} />
      {detail ? <Dots pts={COOKIE.dotsRight} /> : null}
    </>
  );
}

function LeftLobe({ detail }: { detail: boolean }) {
  return (
    <>
      <path d={COOKIE.left} fill={COOKIE_COLORS.left} />
      <path d={COOKIE.rim} fill={COOKIE_COLORS.rim} />
      <path d={COOKIE.shine} fill="none" stroke={COOKIE_COLORS.shine} strokeWidth="3.5" strokeLinecap="round" />
      {detail ? <Dots pts={COOKIE.dotsLeft} /> : null}
    </>
  );
}

/** The logo. `detail` adds the little baking dots, for sizes above ~48px. */
export function Mark({ size = 36, detail = false, title }: { size?: number; detail?: boolean; title?: string }) {
  return (
    <svg
      className="mark"
      width={size}
      height={size}
      viewBox="6 4 110 112"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <RightLobe detail={detail} />
      <Slip />
      <LeftLobe detail={detail} />
    </svg>
  );
}

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

/**
 * The cookie that cracks. `progress` (0 to 1) draws the crack down the crease
 * and eases the halves apart; `open` swings them wide and lifts the slip out.
 */
export function CookieArt({ progress = 0, open = false, className = "" }: { progress?: number; open?: boolean; className?: string }) {
  const crack = clamp01(progress / 0.55);
  const part = clamp01((progress - 0.4) / 0.6);
  const left = open ? "translate(-16px, 8px) rotate(-36deg)" : `rotate(${-part * 13}deg)`;
  const right = open ? "translate(16px, 6px) rotate(30deg)" : `rotate(${part * 11}deg)`;
  const slip = open ? "translate(-2px, -44px) rotate(12deg) scale(1.25)" : `translate(0px, ${-part * 12}px)`;
  return (
    <svg className={`cookie-art ${open ? "is-open" : ""} ${className}`} viewBox="-10 -30 140 160" aria-hidden="true">
      <g className="ca-right" style={{ transform: right }}>
        <RightLobe detail />
      </g>
      <g className="ca-slip" style={{ transform: slip }}>
        <Slip />
      </g>
      <g className="ca-left" style={{ transform: left }}>
        <LeftLobe detail />
        <path
          className="ca-crack"
          d={COOKIE.crack}
          pathLength={1}
          fill="none"
          stroke={COOKIE_COLORS.crack}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ strokeDasharray: 1, strokeDashoffset: 1 - crack, opacity: open ? 0 : crack > 0 ? 0.85 : 0 }}
        />
      </g>
    </svg>
  );
}
