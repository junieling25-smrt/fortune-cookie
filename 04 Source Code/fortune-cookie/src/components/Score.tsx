import type { AreaId, Tone } from "../engine/reading";

export const SHORT: Record<AreaId, string> = { growth: "Growth", career: "Career", love: "Love", family: "Family" };

/** A score inside a ring that fills to the number. */
export function ScoreRing({ score, tone, size = 132, label }: { score: number; tone: Tone; size?: number; label?: string }) {
  const r = 44;
  const c = 2 * Math.PI * r;
  return (
    <div className="ring" data-tone={tone} style={{ width: size, height: size }} role="img" aria-label={`${label ?? "Score"}: ${score} out of 100`}>
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <circle cx="50" cy="50" r={r} className="ring-track" />
        <circle cx="50" cy="50" r={r} className="ring-fill" strokeDasharray={`${(score / 100) * c} ${c}`} transform="rotate(-90 50 50)" />
      </svg>
      <span className="ring-num">{score}</span>
    </div>
  );
}

/** A small score pill: a dot in the tone color and the number. */
export function ScorePill({ score, tone }: { score: number; tone: Tone }) {
  return (
    <span className="score-pill" data-tone={tone}>
      <i className="dot" />
      {score}
    </span>
  );
}

/** A thin bar that fills to the score. */
export function ScoreBar({ score, tone }: { score: number; tone: Tone }) {
  return (
    <span className="score-bar" data-tone={tone} aria-hidden="true">
      <span style={{ width: `${score}%` }} />
    </span>
  );
}
