import { useEffect, useRef, useState } from "react";
import type { SeasonName } from "../engine/reading";
import { AnimalHead, FACE_Y } from "./Animals";

const LINE = "#5A3A22";

/** Body and belly colors, matched to each head. */
const BODY: Record<string, [string, string]> = {
  Rat: ["#DCD8E6", "#F2EFF7"],
  Ox: ["#D9B283", "#F4D9B8"],
  Tiger: ["#F7B35C", "#FFF6E8"],
  Rabbit: ["#FFF7F7", "#FFE3EA"],
  Dragon: ["#9EDFC0", "#C9F0DD"],
  Snake: ["#C8B8F6", "#E4DBFF"],
  Horse: ["#D69A68", "#F0C79E"],
  Goat: ["#F5EEDD", "#FFFFFF"],
  Monkey: ["#B98158", "#F4D2B0"],
  Rooster: ["#FFF8EC", "#FFE9C2"],
  Dog: ["#EBCB9C", "#FFF1DC"],
  Pig: ["#FFC6D4", "#FFE0E8"],
};

/** A tail drawn twice: a dark outline, then the color on top. */
function Stroke({ d, color, w }: { d: string; color: string; w: number }) {
  return (
    <>
      <path d={d} fill="none" stroke={LINE} strokeWidth={w + 2.2} strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
    </>
  );
}

const st = { stroke: LINE, strokeWidth: 1.5, strokeLinejoin: "round" as const };

/** Each animal's tail, sitting behind the body on the right. */
const TAILS: Record<string, () => React.JSX.Element> = {
  Rat: () => <Stroke d="M32 53 C 40 55, 44 49, 41 46 C 39 44, 37 47, 39 48" color="#FFB1C4" w={1.6} />,
  Ox: () => (
    <>
      <Stroke d="M32 52 C 37 53, 40 50, 41 47" color="#D9B283" w={1.6} />
      <circle cx="41.5" cy="46" r="2.2" fill="#8A5A3A" {...st} />
    </>
  ),
  Tiger: () => (
    <>
      <Stroke d="M32 52 C 39 54, 43 50, 42 44" color="#F7B35C" w={3.2} />
      <path d="M40 52 L42 50 M42 47 L44 46" stroke={LINE} strokeWidth="1.3" strokeLinecap="round" />
    </>
  ),
  Rabbit: () => <circle cx="34" cy="53" r="3.6" fill="#FFFFFF" {...st} />,
  Dragon: () => (
    <>
      <Stroke d="M32 52 C 39 55, 43 51, 43 45" color="#9EDFC0" w={3.2} />
      <path d="M43 45 L41 41 L45.5 43 Z" fill="#F7D27E" {...st} />
    </>
  ),
  Snake: () => <Stroke d="M30 56 C 40 59, 44 52, 39 49 C 36 47, 34 51, 37 52" color="#C8B8F6" w={3.4} />,
  Horse: () => <path d="M32 50 C 40 49, 43 55, 41 60 C 38 57, 35 55, 32 54 Z" fill="#7A4A2E" {...st} />,
  Goat: () => <ellipse cx="34" cy="52" rx="2.6" ry="1.8" fill="#F5EEDD" {...st} transform="rotate(-30 34 52)" />,
  Monkey: () => <Stroke d="M32 53 C 42 56, 45 47, 41 43 C 38 41, 35 44, 38 46" color="#B98158" w={2.4} />,
  Rooster: () => (
    <g {...st}>
      <ellipse cx="36" cy="47" rx="2.4" ry="5" fill="#FF7A6E" transform="rotate(30 36 47)" />
      <ellipse cx="38" cy="50" rx="2.4" ry="5" fill="#F7C04A" transform="rotate(60 38 50)" />
      <ellipse cx="38" cy="54" rx="2.4" ry="4.5" fill="#7FC8A9" transform="rotate(85 38 54)" />
    </g>
  ),
  Dog: () => <Stroke d="M32 51 C 37 50, 39 47, 39 43" color="#EBCB9C" w={3} />,
  Pig: () => <Stroke d="M32 52 C 35 52, 37 50, 36 48.5 C 35 47, 33 48.5, 34.5 49.5 C 36 50.5, 38 50, 38.5 48.5" color="#FF9FB8" w={1.5} />,
};

/** A small round body under a big head: arms, belly, feet, and a tail. */
function Body({ animal }: { animal: string }) {
  const [fill, belly] = BODY[animal] ?? ["#E7D9C4", "#FFF6E8"];
  const Tail = TAILS[animal];
  const snake = animal === "Snake";
  return (
    <g>
      <g className="pet-tail">{Tail ? <Tail /> : null}</g>
      {snake ? null : (
        <>
          <ellipse cx="19.5" cy="57" rx="3.8" ry="2.5" fill={fill} {...st} />
          <ellipse cx="28.5" cy="57" rx="3.8" ry="2.5" fill={fill} {...st} />
        </>
      )}
      <ellipse cx="24" cy="49" rx={snake ? 11 : 10} ry={snake ? 8 : 8.5} fill={fill} {...st} />
      <ellipse cx="24" cy="50.5" rx="5.5" ry="5" fill={belly} />
      {snake ? null : (
        <>
          <g className="pet-arm-l">
            <ellipse cx="15.5" cy="47" rx="2.4" ry="3.8" fill={fill} transform="rotate(35 15.5 47)" {...st} />
          </g>
          <g className="pet-arm-r">
            <ellipse cx="32.5" cy="47" rx="2.4" ry="3.8" fill={fill} transform="rotate(-35 32.5 47)" {...st} />
          </g>
        </>
      )}
    </g>
  );
}

const CHEERS = ["Yay!", "Nice one!", "Go you!", "Love it!"];

/** One small seasonal accessory, drawn on the 48 by 48 animal. */
function Outfit({ season, faceY }: { season: SeasonName; faceY: number }) {
  if (season === "spring")
    return (
      <g transform="translate(37 12)">
        {[0, 72, 144, 216, 288].map((r) => (
          <circle key={r} cx="0" cy="-3" r="2.6" fill="#FF9FB8" stroke={LINE} strokeWidth="0.8" transform={`rotate(${r})`} />
        ))}
        <circle r="1.8" fill="#FFD66B" />
      </g>
    );
  if (season === "summer") {
    const y = faceY - 2;
    return (
      <g>
        <rect x="12.5" y={y - 3} width="11" height="6.5" rx="3" fill="#2A1C44" />
        <rect x="24.5" y={y - 3} width="11" height="6.5" rx="3" fill="#2A1C44" />
        <path d={`M23.5 ${y - 1} H24.5`} stroke="#2A1C44" strokeWidth="1.6" />
        <path d={`M15 ${y - 1.4} L18 ${y - 1.4} M27 ${y - 1.4} L30 ${y - 1.4}`} stroke="#fff" strokeWidth="1" strokeLinecap="round" opacity=".7" />
      </g>
    );
  }
  if (season === "autumn")
    return (
      <path
        transform="translate(37 12) rotate(18)"
        d="M0 -6 L1.6 -2.4 L5 -3.4 L3.6 0 L6 1.8 L2 2.4 L1.2 5.5 L0 3.6 L-1.2 5.5 L-2 2.4 L-6 1.8 L-3.6 0 L-5 -3.4 L-1.6 -2.4 Z"
        fill="#E8833A"
        stroke={LINE}
        strokeWidth="0.8"
        strokeLinejoin="round"
      />
    );
  return (
    <g stroke={LINE} strokeWidth="1.2" strokeLinejoin="round">
      <rect x="12" y="39" width="24" height="6" rx="3" fill="#E5566F" />
      <rect x="29" y="42" width="5.5" height="8" rx="1.5" fill="#E5566F" />
      <path d="M17 39.5 V44.5 M22 39.5 V44.5 M27 39.5 V44.5" stroke="#fff" strokeWidth="1.2" opacity=".75" />
    </g>
  );
}

/**
 * Your year animal, sitting by today's score. It dresses for the solar season
 * and does a happy hop whenever you try a tweak.
 */
export function Pet({ animal, season, cheer }: { animal: string; season: SeasonName; cheer: number }) {
  const [happy, setHappy] = useState<string | null>(null);
  const first = useRef(true);
  const timer = useRef<number>(0);

  const hop = () => {
    setHappy(CHEERS[Math.floor(Math.random() * CHEERS.length)]);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setHappy(null), 1400);
  };

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (cheer > 0) hop();
  }, [cheer]);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  return (
    <button type="button" className={`pet ${happy ? "is-happy" : ""}`} onClick={hop} aria-label={`Your ${animal}, dressed for ${season}`}>
      {happy ? (
        <span className="pet-bubble" aria-live="polite">
          {happy}
        </span>
      ) : null}
      <span className="pet-body">
        <svg className="animal-icon pet-svg" width="62" height="80" viewBox="0 0 48 62" role="img" aria-label={`${animal} in ${season} clothes`}>
          <Body animal={animal} />
          <AnimalHead animal={animal} />
          <Outfit season={season} faceY={FACE_Y[animal] ?? 29} />
        </svg>
      </span>
      {happy ? (
        <span className="pet-hearts" aria-hidden="true">
          <i>♥</i>
          <i>♥</i>
          <i>♥</i>
        </span>
      ) : null}
    </button>
  );
}
