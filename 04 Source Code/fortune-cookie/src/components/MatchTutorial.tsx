import { useId, useState } from "react";
import { FAMILY_NAME, MATCH_CHART, MATCH_MONTH, type Bond, type MatchPillarKey, type MatchReading } from "../engine/reading";
import { MATCH_DAY, MATCH_YEAR } from "../engine/copy-more";
import { AnimalIcon } from "./Animals";
import { Chevron, Close } from "./Icons";
import { MatchChart, type ChartFocus } from "./MatchChart";

/**
 * "See how your charts connect": a short walk through the parts of both charts
 * that produced this Match reading. Only lives inside the Match result card.
 */

type Step = "core" | MatchPillarKey | "tip";
const STEPS: Step[] = ["core", "day", "month", "year", "tip"];
const PILLAR_COPY: Record<MatchPillarKey, Record<Bond, string>> = { day: MATCH_DAY, month: MATCH_MONTH, year: MATCH_YEAR };
const fill = (s: string, v: Record<string, string>) => s.replace(/\{(\w+)\}/g, (_, k) => v[k] ?? "");
const yy = (yang: boolean) => (yang ? "Yang" : "Yin");

type Props = {
  result: MatchReading;
  onClose: () => void;
};

export function MatchTutorial({ result, onClose }: Props) {
  const [step, setStep] = useState<Step>("core");
  const titleId = useId();
  const e = result.evidence;
  const them = result.them.name;
  const i = STEPS.indexOf(step);
  const focus: ChartFocus = step === "tip" ? "all" : step;
  const who = MATCH_CHART.who[result.rel];
  const maxW = Math.max(...e.links.map((l) => l.weight));
  const tip = result.rows.find((r) => r.label === "One tip")?.text ?? "";

  const weightLine = (w: number) => {
    const level = w >= maxW ? "most" : w >= 0.5 ? "some" : "little";
    return { level, text: fill(MATCH_CHART.weight[level], { who }) };
  };

  let eyebrow = "";
  let title = "";
  let body: string[] = [];
  let weight: { level: string; text: string } | null = null;
  let pair: { mine: string; theirs: string } | null = null;

  if (step === "core") {
    eyebrow = "Your cores";
    title = `${yy(e.core.mineYang)} ${e.core.mine} meets ${yy(e.core.theirsYang)} ${e.core.theirs}`;
    body = [
      MATCH_CHART.coreAbout,
      result.rows.find((r) => r.label === "How they feel to you")?.text ?? "",
      e.polarityContrast ? MATCH_CHART.polarity.contrast : MATCH_CHART.polarity.same,
    ];
  } else if (step === "tip") {
    eyebrow = "What to do with it";
    title = tip;
    body = [MATCH_CHART.tipAbout, ...(e.fillsHelpfulElement ? [fill(MATCH_CHART.fills, { el: e.helpfulElement })] : [])];
  } else {
    const l = e.links.find((x) => x.key === step)!;
    eyebrow = MATCH_CHART.pillar[step].title;
    title =
      l.bond === "echo"
        ? `You're both ${l.mine.animal}s here`
        : `${l.mine.animal} and ${l.theirs.animal} are ${MATCH_CHART.bondName[l.bond]}`;
    body = [MATCH_CHART.pillar[step].about, PILLAR_COPY[step][l.bond]];
    weight = weightLine(l.weight);
    pair = { mine: l.mine.animal, theirs: l.theirs.animal };
  }

  return (
    <section className="mt" aria-labelledby={titleId}>
      <div className="mt-stage">
        <div className="mt-chart">
          <MatchChart
            evidence={e}
            theirName={them}
            focus={focus}
            bondName={MATCH_CHART.bondName}
            onFocus={(f) => setStep(f === "all" ? "tip" : f)}
          />
        </div>

        <div className="mt-card" data-step={step} aria-live="polite">
          <div className="mt-card-head">
            <p className="label">
              <span className="mt-count">
                {i + 1} / {STEPS.length}
              </span>{" "}
              {eyebrow}
            </p>
            <button type="button" className="mt-x" aria-label="Hide chart" onClick={onClose}>
              <Close size={14} />
            </button>
          </div>

          <div className="mt-body" key={step}>
          {pair ? (
            <div className="mt-pair" aria-hidden="true">
              <span className="mt-who">
                <AnimalIcon animal={pair.mine} size={40} />
                <span>You</span>
              </span>
              <span className="mt-pair-line" data-bond={e.links.find((x) => x.key === step)?.bond} />
              <span className="mt-who">
                <AnimalIcon animal={pair.theirs} size={40} />
                <span>{them}</span>
              </span>
            </div>
          ) : null}

          <h3 id={titleId} className="mt-title">
            {title}
          </h3>
          {body.filter(Boolean).map((t) => (
            <p key={t} className="mt-text">
              {t}
            </p>
          ))}
          {weight ? (
            <p className="mt-weight" data-level={weight.level}>
              <span className="mt-meter" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
              {weight.text}
            </p>
          ) : step === "core" ? (
            <p className="mt-weight" data-level="most">
              <span className="mt-meter" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
              {fill(MATCH_CHART.coreWeight, { fam: FAMILY_NAME[e.core.family] })}
            </p>
          ) : null}
          </div>

          <div className="mt-nav">
            <div className="mt-dots" role="tablist" aria-label="Steps">
              {STEPS.map((s, k) => (
                <button
                  key={s}
                  type="button"
                  role="tab"
                  aria-selected={s === step}
                  aria-label={`Step ${k + 1}`}
                  className="mt-dot"
                  onClick={() => setStep(s)}
                />
              ))}
            </div>
            <div className="mt-arrows">
              <button type="button" className="btn btn-quiet btn-small" disabled={i === 0} onClick={() => setStep(STEPS[i - 1])}>
                <Chevron dir="left" size={14} /> Back
              </button>
              {i < STEPS.length - 1 ? (
                <button type="button" className="btn btn-soft btn-small" onClick={() => setStep(STEPS[i + 1])}>
                  Next <Chevron dir="right" size={14} />
                </button>
              ) : (
                <button type="button" className="btn btn-soft btn-small" onClick={() => setStep("core")}>
                  Start over
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-legend" aria-hidden="true">
        {(["harmony", "trine", "echo", "clash"] as const).map((b) => (
          <span key={b} className="mt-key">
            <svg width="28" height="8" viewBox="0 0 28 8">
              <line x1="1" y1="4" x2="27" y2="4" className={`mc-line mc-line-${b}`} strokeWidth="2" strokeDasharray={b === "echo" ? "1 4" : b === "clash" ? "5 4" : undefined} />
            </svg>
            {MATCH_CHART.bondLegend[b]}
          </span>
        ))}
        <span className="mt-key">
          <span className="mt-key-none" />
          {MATCH_CHART.bondLegend.none}: no line
        </span>
      </div>
      <p className="mt-foot">
        <span className="mt-swatch mt-swatch-me" /> You <span className="mt-swatch mt-swatch-them" /> {them}. Thicker lines count more for this bond. {MATCH_CHART.hour}
      </p>
    </section>
  );
}
