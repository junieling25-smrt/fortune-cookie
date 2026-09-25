import { useId } from "react";

/**
 * The Fortune Cookie mark, drawn after the classic cartoon cookie: a folded
 * shell with a lighter left flap, the dark fold running from the bottom-left
 * corner up to the top, a warm outline, and the fortune slip poking out at the
 * bottom right with a pink spark on it. One set of layers drives the logo, the
 * favicon, the cracking animation, and the share image.
 */

export const OUTLINE = "#6B4423";

export type Layer = { d: string; fill?: string; stroke?: string; width?: number; opacity?: number; transform?: [number, number, number, number] };

export const PATHS = {
  body: "M10 46 C 18 24, 44 10, 70 11 C 94 12, 108 34, 106 58 C 104 82, 88 96, 64 97 L 38 96 C 31 96, 28 92, 30 87 C 33 77, 36 67, 40 58 C 30 55, 19 52, 10 46 Z",
  shade: "M96 26 C 106 40, 108 60, 101 76 C 94 90, 80 96, 64 97 C 82 88, 94 74, 96 56 C 97 44, 98 34, 96 26 Z",
  flap: "M10 46 C 18 24, 42 12, 66 14 C 51 36, 40 62, 33 90 C 32 80, 36 67, 40 58 C 30 55, 19 52, 10 46 Z",
  flapShine: "M16 44 C 22 30, 36 22, 50 19",
  slit: "M33 90 C 40 62, 51 36, 66 16 C 69 13, 72 14, 71 18",
  bodyShine: "M73 24 C 78 32, 80 42, 79 50",
  rim: "M40 92 C 50 94, 62 94, 74 92",
  slip: "M74 84 L108 92 L100 112 L68 100 Z",
  spark: "M0 -7 C1 -2 2 -1 7 0 C2 1 1 2 0 7 C-1 2 -2 1 -7 0 C-2 -1 -1 -2 0 -7 Z",
  crack: "M72 11 L76 23 L70 35 L77 47 L71 59 L78 71 L72 83 L75 97",
  dot1: "M74.3 58 A 2.3 2.3 0 1 1 69.7 58 A 2.3 2.3 0 1 1 74.3 58 Z",
  dot2: "M69.4 64 A 1.4 1.4 0 1 1 66.6 64 A 1.4 1.4 0 1 1 69.4 64 Z",
};

/** The two halves meet along the crack. */
export const CLIP_LEFT = "0,0 72,0 72,11 76,23 70,35 77,47 71,59 78,71 72,83 75,97 75,120 0,120";
export const CLIP_RIGHT = "72,0 120,0 120,120 75,120 75,97 72,83 78,71 71,59 77,47 70,35 76,23 72,11";

/** Slip layers (drawn behind the cookie). transform = [translateX, translateY, rotateDeg, scale]. */
export const SLIP_LAYERS: Layer[] = [
  { d: PATHS.slip, fill: "#FFFDF8", stroke: OUTLINE, width: 2.6 },
  { d: PATHS.spark, fill: "#FF8DB0", transform: [89, 99, 14, 0.8] },
];

/** Cookie layers, bottom to top. */
export const COOKIE_LAYERS: Layer[] = [
  { d: PATHS.body, fill: "#E7AE5D" },
  { d: PATHS.shade, fill: "#D39247" },
  { d: PATHS.flap, fill: "#F4CF8E" },
  { d: PATHS.flapShine, stroke: "#FFF1D2", width: 3, opacity: 0.9 },
  { d: PATHS.slit, stroke: OUTLINE, width: 3.2 },
  { d: PATHS.bodyShine, stroke: "#FFF1D2", width: 3 },
  { d: PATHS.dot1, fill: "#FFF1D2" },
  { d: PATHS.dot2, fill: "#FFF1D2" },
  { d: PATHS.rim, stroke: "#FFE3AE", width: 2.6 },
  { d: PATHS.body, stroke: OUTLINE, width: 3.2 },
];

export const MARK_VIEWBOX = "4 4 112 112";

function Layers({ layers }: { layers: Layer[] }) {
  return (
    <>
      {layers.map((l, i) => (
        <path
          key={i}
          d={l.d}
          fill={l.fill ?? "none"}
          stroke={l.stroke}
          strokeWidth={l.width}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={l.opacity}
          transform={l.transform ? `translate(${l.transform[0]} ${l.transform[1]}) rotate(${l.transform[2]}) scale(${l.transform[3]})` : undefined}
        />
      ))}
    </>
  );
}

/** The logo. */
export function Mark({ size = 36, title }: { size?: number; title?: string }) {
  return (
    <svg
      className="mark"
      width={size}
      height={size}
      viewBox={MARK_VIEWBOX}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <Layers layers={SLIP_LAYERS} />
      <Layers layers={COOKIE_LAYERS} />
    </svg>
  );
}

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

/**
 * The cookie that cracks. `progress` (0 to 1) draws the crack and eases the
 * halves apart; `open` swings them wide and pulls the slip out between them.
 */
export function CookieArt({ progress = 0, open = false, className = "" }: { progress?: number; open?: boolean; className?: string }) {
  const id = useId().replace(/:/g, "");
  const crack = clamp01(progress / 0.55);
  const part = clamp01((progress - 0.4) / 0.6);
  const left = open ? "translate(-10px, 6px) rotate(-17deg)" : `rotate(${-part * 10}deg)`;
  const right = open ? "translate(12px, 6px) rotate(19deg)" : `rotate(${part * 9}deg)`;
  const slip = open ? "translate(-16px, -44px) rotate(-8deg) scale(1.2)" : `translate(${-part * 4}px, ${-part * 8}px)`;
  const crackLine = (
    <path
      className="ca-crack"
      d={PATHS.crack}
      pathLength={1}
      fill="none"
      stroke={OUTLINE}
      strokeWidth="3.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ strokeDasharray: 1, strokeDashoffset: open ? 0 : 1 - crack, opacity: crack > 0 || open ? 1 : 0 }}
    />
  );
  return (
    <svg className={`cookie-art ${open ? "is-open" : ""} ${className}`} viewBox="-22 -30 164 168" aria-hidden="true">
      <defs>
        <clipPath id={`l${id}`}>
          <polygon points={CLIP_LEFT} />
        </clipPath>
        <clipPath id={`r${id}`}>
          <polygon points={CLIP_RIGHT} />
        </clipPath>
      </defs>
      <g className="ca-slip" style={{ transform: slip, transformOrigin: "88px 98px", transformBox: "view-box" }}>
        <Layers layers={SLIP_LAYERS} />
      </g>
      <g className="ca-right" style={{ transform: right, transformOrigin: "90px 96px", transformBox: "view-box" }}>
        <g clipPath={`url(#r${id})`}>
          <Layers layers={COOKIE_LAYERS} />
          {crackLine}
        </g>
      </g>
      <g className="ca-left" style={{ transform: left, transformOrigin: "50px 97px", transformBox: "view-box" }}>
        <g clipPath={`url(#l${id})`}>
          <Layers layers={COOKIE_LAYERS} />
          {crackLine}
        </g>
      </g>
    </svg>
  );
}
