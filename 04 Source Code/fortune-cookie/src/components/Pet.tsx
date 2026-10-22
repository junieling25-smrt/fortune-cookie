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

/** A round little body under the head: arms, belly, and two feet. */
function Body({ animal }: { animal: string }) {
  const [fill, belly] = BODY[animal] ?? ["#E7D9C4", "#FFF6E8"];
  const st = { stroke: LINE, strokeWidth: 1.6, strokeLinejoin: "round" as const };
  return (
    <g className="pet-limbs">
      <ellipse cx="18.5" cy="62" rx="4.6" ry="2.8" fill={fill} {...st} />
      <ellipse cx="29.5" cy="62" rx="4.6" ry="2.8" fill={fill} {...st} />
      <ellipse cx="24" cy="51" rx="11.5" ry="11" fill={fill} {...st} />
      <ellipse cx="24" cy="53.5" rx="6.5" ry="6.5" fill={belly} />
      <ellipse className="pet-arm-l" cx="13.5" cy="50" rx="3" ry="5" fill={fill} transform="rotate(28 13.5 50)" {...st} />
      <ellipse className="pet-arm-r" cx="34.5" cy="50" rx="3" ry="5" fill={fill} transform="rotate(-28 34.5 50)" {...st} />
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
        <svg className="animal-icon" width="56" height="80" viewBox="0 0 48 68" role="img" aria-label={`${animal} in ${season} clothes`}>
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
