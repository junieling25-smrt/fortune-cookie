import { useEffect, useRef, useState } from "react";
import type { SeasonName } from "../engine/reading";
import { AnimalIcon, FACE_Y } from "./Animals";

const LINE = "#5A3A22";
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
        <AnimalIcon animal={animal} size={64} label={`${animal} in ${season} clothes`}>
          <Outfit season={season} faceY={FACE_Y[animal] ?? 29} />
        </AnimalIcon>
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
