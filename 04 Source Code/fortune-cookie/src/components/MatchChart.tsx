import type { KeyboardEvent } from "react";
import type { Bond, ElementName, MatchEvidence, MatchPillarKey } from "../engine/reading";

/**
 * The Match relationship wheel. Twelve animals around the rim, one orbit per
 * pillar the score compares (Day outside, Month, Year inside), and a line for
 * each pair that has a traditional bond. The two core elements meet in the
 * middle. It draws only what readMatch() already scored: no new math here.
 */

export type ChartFocus = "core" | MatchPillarKey | "all";

const ANIMALS = ["Rat", "Ox", "Tiger", "Rabbit", "Dragon", "Snake", "Horse", "Goat", "Monkey", "Rooster", "Dog", "Pig"];
const SIZE = 440;
const C = SIZE / 2;
const RIM = 182;
const LABEL_R = 202;
const ORBIT: Record<MatchPillarKey, number> = { day: 150, month: 114, year: 78 };
const NODE_R: Record<MatchPillarKey, number> = { day: 12.5, month: 10.5, year: 9 };
const ORBIT_NAME: Record<MatchPillarKey, string> = { day: "Day", month: "Month", year: "Year" };
const EL_VAR: Record<ElementName, string> = {
  Wood: "var(--wood)",
  Fire: "var(--fire)",
  Earth: "var(--earth)",
  Metal: "var(--metal)",
  Water: "var(--water)",
};

const angleFor = (branchIdx: number) => branchIdx * 30;
const point = (angle: number, r: number) => ({
  x: C + r * Math.cos(((angle - 90) * Math.PI) / 180),
  y: C + r * Math.sin(((angle - 90) * Math.PI) / 180),
});
const f = (n: number) => Math.round(n * 10) / 10;

/** Line treatment per bond, from the plan: gold harmony, lavender trine, dotted echo, dashed clash, no line for neutral. */
const LINE: Record<Exclude<Bond, "none">, { cls: string; dash?: string }> = {
  harmony: { cls: "mc-line-harmony" },
  trine: { cls: "mc-line-trine" },
  echo: { cls: "mc-line-echo", dash: "1 5" },
  clash: { cls: "mc-line-clash", dash: "7 6" },
};

type Props = {
  evidence: MatchEvidence;
  theirName: string;
  focus: ChartFocus;
  onFocus: (f: ChartFocus) => void;
  /** Short label for each pillar's bond, for screen readers. */
  bondName: Record<Bond, string>;
};

const activate = (fn: () => void) => (e: KeyboardEvent) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    fn();
  }
};

export function MatchChart({ evidence, theirName, focus, onFocus, bondName }: Props) {
  const initial = (theirName.trim()[0] ?? "T").toUpperCase();
  const lit = (k: ChartFocus) => focus === "all" || focus === k;
  const litAnimals = new Set(
    evidence.links.filter((l) => focus !== "all" && focus === l.key).flatMap((l) => [l.mine.branchIdx, l.theirs.branchIdx]),
  );
  const { core } = evidence;

  return (
    <svg className="mc" viewBox={`0 0 ${SIZE} ${SIZE}`} role="group" aria-label={`How your chart and ${theirName}'s connect`}>
      {/* quiet geometry: rim, twelve spokes, the three orbits */}
      <g className="mc-grid" aria-hidden="true">
        <circle cx={C} cy={C} r={RIM} />
        <circle cx={C} cy={C} r={RIM - 8} className="mc-grid-faint" />
        {ANIMALS.map((_, i) => {
          const a = point(angleFor(i), 44);
          const b = point(angleFor(i), RIM);
          const t1 = point(angleFor(i), RIM - 8);
          return (
            <g key={i}>
              <line x1={f(a.x)} y1={f(a.y)} x2={f(b.x)} y2={f(b.y)} className="mc-grid-faint" />
              <line x1={f(t1.x)} y1={f(t1.y)} x2={f(b.x)} y2={f(b.y)} />
            </g>
          );
        })}
        {(Object.keys(ORBIT) as MatchPillarKey[]).map((k) => (
          <circle key={k} cx={C} cy={C} r={ORBIT[k]} className="mc-orbit" data-on={lit(k) ? "" : undefined} />
        ))}
      </g>

      {/* animal names around the rim; the pair in focus lights up */}
      <g className="mc-rim" aria-hidden="true">
        {ANIMALS.map((name, i) => {
          const p = point(angleFor(i), LABEL_R);
          return (
            <text key={name} x={f(p.x)} y={f(p.y)} className={litAnimals.has(i) ? "is-lit" : undefined}>
              {name}
            </text>
          );
        })}
      </g>

      {/* orbit names, tucked into the empty top-left gap between Rat and Pig */}
      <g className="mc-orbit-names" aria-hidden="true">
        {(Object.keys(ORBIT) as MatchPillarKey[]).map((k) => {
          const p = point(-15, ORBIT[k]);
          return (
            <text key={k} x={f(p.x)} y={f(p.y)} data-on={lit(k) ? "" : undefined}>
              {ORBIT_NAME[k]}
            </text>
          );
        })}
      </g>

      {/* one pair per pillar */}
      {evidence.links.map((l) => {
        const r = ORBIT[l.key];
        const same = l.mine.branchIdx === l.theirs.branchIdx;
        // Same animal: keep the true anchor, nudge the two circles apart along the orbit.
        const nudge = same ? (NODE_R[l.key] + 7) / (r * (Math.PI / 180)) : 0;
        const a = point(angleFor(l.mine.branchIdx) - nudge, r);
        const b = point(angleFor(l.theirs.branchIdx) + nudge, r);
        const line = l.bond === "none" ? null : LINE[l.bond];
        const w = 1 + l.weight * 1.1;
        const label = `${ORBIT_NAME[l.key]}: your ${l.mine.animal} and ${theirName}'s ${l.theirs.animal}, ${bondName[l.bond]}`;
        return (
          <g
            key={l.key}
            className="mc-pair"
            data-bond={l.bond}
            data-dim={lit(l.key) ? undefined : ""}
            data-on={focus === l.key ? "" : undefined}
            role="button"
            tabIndex={0}
            aria-label={label}
            aria-pressed={focus === l.key}
            onClick={() => onFocus(l.key)}
            onKeyDown={activate(() => onFocus(l.key))}
          >
            <line x1={f(a.x)} y1={f(a.y)} x2={f(b.x)} y2={f(b.y)} className="mc-hit" />
            {line ? (
              <line
                x1={f(a.x)}
                y1={f(a.y)}
                x2={f(b.x)}
                y2={f(b.y)}
                className={`mc-line ${line.cls}`}
                strokeWidth={f(same ? 1.6 : w)}
                strokeDasharray={line.dash}
                pathLength={l.bond === "harmony" || l.bond === "trine" ? 100 : undefined}
              />
            ) : null}
            <g className="mc-node mc-node-me">
              <circle cx={f(a.x)} cy={f(a.y)} r={NODE_R[l.key]} />
              <text x={f(a.x)} y={f(a.y)}>Y</text>
            </g>
            <g className="mc-node mc-node-them">
              <circle cx={f(b.x)} cy={f(b.y)} r={NODE_R[l.key]} />
              <text x={f(b.x)} y={f(b.y)}>{initial}</text>
            </g>
          </g>
        );
      })}

      {/* the two cores, overlapping in the middle */}
      <g
        className="mc-core"
        data-dim={lit("core") ? undefined : ""}
        data-on={focus === "core" ? "" : undefined}
        role="button"
        tabIndex={0}
        aria-label={`Core elements: you are ${core.mineYang ? "Yang" : "Yin"} ${core.mine}, ${theirName} is ${core.theirsYang ? "Yang" : "Yin"} ${core.theirs}`}
        aria-pressed={focus === "core"}
        onClick={() => onFocus("core")}
        onKeyDown={activate(() => onFocus("core"))}
      >
        <circle cx={C} cy={C} r={40} className="mc-core-pad" />
        <circle cx={C - 11} cy={C} r={22} style={{ fill: EL_VAR[core.mine] }} className="mc-core-me" />
        <circle cx={C + 11} cy={C} r={22} style={{ fill: EL_VAR[core.theirs] }} className="mc-core-them" />
        <text x={C - 17} y={C} className="mc-core-txt">
          Y
        </text>
        <text x={C + 17} y={C} className="mc-core-txt">
          {initial}
        </text>
      </g>
    </svg>
  );
}
