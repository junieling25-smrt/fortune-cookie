import { ANIMAL_INFO, CHANGES, CYCLE_LINES, ELEMENT_INFO, PILLAR_INFO, SCORE_INFO, YIN_YANG } from "../engine/copy-guide";
import { ELEMENTS } from "../engine/pillars";
import type { Profile } from "../engine/reading";
import { ArrowRight } from "./Icons";

/** The plain-words guide: pillars, elements, yin and yang, animals, the score, and what changes when. */
export function MeaningPage({ profile, onHow }: { profile: Profile; onHow: () => void }) {
  const mine = new Set(profile.pillars.filter((p) => p.known).map((p) => p.animal));
  return (
    <section className="page-body meaning" aria-labelledby="mean-title">
      <header className="page-head">
        <p className="eyebrow">What it means</p>
        <h1 id="mean-title">The Four Pillars, in plain words</h1>
        <p className="lede">A Chinese birth chart, over a thousand years old. Here's everything you need to read yours.</p>
      </header>

      <section className="block">
        <h2 className="block-title">Four pillars, four animals</h2>
        <ul className="plain-list">
          {PILLAR_INFO.map((p) => {
            const pl = profile.pillars.find((x) => x.key === p.key);
            return (
              <li key={p.key}>
                <span className="pl-key">{p.title}</span>
                <span>{p.text}</span>
                <span className="pl-you">{pl?.known ? `Yours: ${pl.animal}` : "Yours: unknown"}</span>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="block">
        <h2 className="block-title">Five elements</h2>
        <div className="el-grid">
          {ELEMENTS.map((e) => (
            <article key={e} className="el-card" data-el={e}>
              <p className="el-name">
                <i className="dot" /> {e}
              </p>
              <p className="small">{ELEMENT_INFO[e].traits}</p>
              <p className="muted small">
                {ELEMENT_INFO[e].nature} · {ELEMENT_INFO[e].season}
              </p>
              {profile.core.element === e ? <span className="you-tag">Your core</span> : null}
            </article>
          ))}
        </div>
        <p className="small">{CYCLE_LINES.feeds}</p>
        <p className="small muted">{CYCLE_LINES.checks}</p>
      </section>

      <section className="block">
        <h2 className="block-title">Yin and yang</h2>
        <div className="yy">
          <p>
            <strong>Yang.</strong> {YIN_YANG.yang.replace(/^Yang is /, "").replace(/^./, (c) => c.toUpperCase())}
          </p>
          <p>
            <strong>Yin.</strong> {YIN_YANG.yin.replace(/^Yin is /, "").replace(/^./, (c) => c.toUpperCase())}
          </p>
        </div>
        <p className="small muted">{YIN_YANG.both}</p>
      </section>

      <section className="block">
        <h2 className="block-title">Twelve animals</h2>
        <ul className="animal-grid">
          {Object.entries(ANIMAL_INFO).map(([a, info]) => (
            <li key={a} className={mine.has(a) ? "is-mine" : ""}>
              <strong>{a}</strong>
              <span className="small">{info.trait}</span>
              <span className="muted small">{info.hours}</span>
            </li>
          ))}
        </ul>
        <p className="hint">Highlighted: the animals in your chart. Each also rules two hours of the day.</p>
      </section>

      <section className="block">
        <h2 className="block-title">Your daily score</h2>
        <p>{SCORE_INFO.what}</p>
        <ul className="bands">
          {SCORE_INFO.bands.map((b) => (
            <li key={b.tone} data-tone={b.tone}>
              <i className="dot" />
              <strong>{b.range}</strong>
              <span>{b.text}</span>
            </li>
          ))}
        </ul>
        <p className="small muted">{SCORE_INFO.note}</p>
      </section>

      <section className="block">
        <h2 className="block-title">What changes, and when</h2>
        <ul className="plain-list">
          {CHANGES.map((c) => (
            <li key={c.when}>
              <span className="pl-key">{c.when}</span>
              <span>{c.text}</span>
            </li>
          ))}
        </ul>
      </section>

      <button type="button" className="how-link" onClick={onHow}>
        The math behind your chart <ArrowRight />
      </button>
    </section>
  );
}
