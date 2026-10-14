import type { DailyReading, Profile } from "../engine/reading";
import { fmtLongDate } from "../lib";
import { SCORE_INFO } from "../engine/copy-guide";
import { Chevron, Spark } from "./Icons";

const STEPS = [
  { title: "Your birth moment", body: "Date, time, and place. We turn the clock time into sun time for that spot, the way the old calendar does." },
  { title: "Your four pillars", body: "Year, month, day, and hour each get an element and an animal. Together they make your chart." },
  { title: "Read against the calendar", body: "Every day, month, and year has its own element and animal too. We look at how they meet yours and explain it plainly." },
];

const PROMISES = [
  { title: "Weather, not fate", body: "We describe the conditions around you. What you do with them is always your call." },
  { title: "Written by people", body: "Every sentence was written by hand. The math only picks which ones you see." },
  { title: "Same details, same chart", body: "Real astronomy, checked against 4,000 charts from an independent calculator." },
  { title: "Stays on your device", body: "No account and no server. Your details never leave this browser." },
];


export function HowPage({ profile, reading, onBack }: { profile: Profile; reading: DailyReading; onBack: () => void }) {
  const { how, birth } = profile;
  const calendarYear = Number(birth.date.slice(0, 4));
  const core = `${profile.core.yang ? "Yang" : "Yin"} ${profile.core.element}`;
  const t = reading.today;

  return (
    <div className="page-body subpage">
      <button type="button" className="back-link" onClick={onBack}>
        <Chevron dir="left" size={16} /> What it means
      </button>

      <section className="section" aria-labelledby="how-title">
        <div className="section-head">
          <p className="eyebrow">How it works</p>
          <h1 id="how-title">An old calendar, read in plain English.</h1>
          <p className="lede">
            Fortune Cookie uses Four Pillars, a traditional Chinese way of reading a birth date through the solar calendar (you may have heard it
            called BaZi). No jargon required.
          </p>
        </div>
        <ol className="steps">
          {STEPS.map((s, i) => (
            <li key={s.title}>
              <span className="step-num" aria-hidden="true">
                {i + 1}
              </span>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </li>
          ))}
        </ol>
        <div className="promises">
          {PROMISES.map((p) => (
            <div key={p.title} className="promise">
              <Spark size={14} />
              <div>
                <h3>{p.title}</h3>
                <p>{p.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section" aria-labelledby="labels-title">
        <div className="section-head">
          <p className="eyebrow">The daily score</p>
          <h2 id="labels-title">One number, 0 to 100</h2>
          <p className="lede">{SCORE_INFO.what}</p>
        </div>
        <ul className="bands">
          {SCORE_INFO.bands.map((b) => (
            <li key={b.tone} data-tone={b.tone}>
              <i className="dot" />
              <strong>{b.range}</strong>
              <span>{b.text}</span>
            </li>
          ))}
        </ul>
        <p className="small muted">
          Each area reads a different part of the day against a different pillar: growth against your Hour, career against your Month, love against your
          Day, family against your Year. A small fixed wobble keeps two similar days from printing the same number.
        </p>
      </section>

      <section className="section" aria-labelledby="calc-title">
        <div className="section-head">
          <p className="eyebrow">Behind your chart</p>
          <h2 id="calc-title">How we worked it out</h2>
        </div>
        <dl className="calc">
          <div>
            <dt>Birth time</dt>
            <dd>
              {birth.timeKnown ? (
                <>
                  {how.localTime} in {birth.place.split(",")[0]} ({how.utcOffset}). The sun there ran {Math.abs(how.correctionMinutes)} minutes{" "}
                  {how.correctionMinutes < 0 ? "behind" : "ahead of"} the clock, so we read {how.sunTime}.
                </>
              ) : (
                "Unknown, so we leave out the Hour pillar and read the other three."
              )}
            </dd>
          </div>
          <div>
            <dt>Birth year</dt>
            <dd>
              The chart year starts when spring begins ({how.springStart} that year), not on January 1. Your chart year is {how.chartYear}
              {how.chartYear !== calendarYear ? ", one earlier than the calendar says, because you were born before spring began." : "."}
            </dd>
          </div>
          <div>
            <dt>Core element</dt>
            <dd>Your Day pillar gives your core element: {core}.</dd>
          </div>
          <div>
            <dt>The day</dt>
            <dd>
              {fmtLongDate(reading.date)} is a {t.yang ? "Yang" : "Yin"} {t.element} {t.animal} day in a {reading.season.element} month. Its{" "}
              {t.element} works as {reading.energy.familyName} for you, and its {t.animal} brings {reading.undercurrent.familyName}.
            </dd>
          </div>
          <div>
            <dt>Five plain names</dt>
            <dd>
              Every element relates to yours in one of five ways. Company (the same as yours), Expression (what you create), Harvest (what you
              shape), Structure (what shapes you), and Nurture (what feeds you).
            </dd>
          </div>
          <div>
            <dt>Our own method</dt>
            <dd>
              The pillars follow the standard calendar rules. The element percentages, the daily score, the small tweaks, the match score, and which area is in focus are
              Fortune Cookie's own way of scoring, not a classical rule.
            </dd>
          </div>
          {how.nearBoundary ? (
            <div>
              <dt>Heads up</dt>
              <dd>Your birth time sits close to a boundary. If the recorded time is off by a few minutes, a pillar could change.</dd>
            </div>
          ) : null}
          {how.lateNight ? (
            <div>
              <dt>Heads up</dt>
              <dd>You were born in the 11 PM hour. Traditions disagree on which day that belongs to. We count it as the same calendar day.</dd>
            </div>
          ) : null}
        </dl>
      </section>
    </div>
  );
}
