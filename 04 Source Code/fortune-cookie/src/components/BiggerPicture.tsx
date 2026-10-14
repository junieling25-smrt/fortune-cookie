import { useMemo, useState } from "react";
import { readLife, readMonth, readYear, readYears, toneOfNumber, type Profile } from "../engine/reading";
import { LONG_VIEW_NOTE } from "../engine/copy-guide";
import { AnimalIcon } from "./Animals";
import { ReadMore } from "./ReadMore";
import { fmtMonthDay, weekdayIndex } from "../lib";
import { AREA_ICON } from "./Icons";
import { Mark } from "./Mark";
import { ScorePill, ScoreRing, SHORT } from "./Score";
import { Term } from "./Term";

type Tab = "month" | "year" | "years" | "life";

function Month({ profile, date, today, cracked, onPick }: { profile: Profile; date: string; today: string; cracked: string[]; onPick: (d: string) => void }) {
  const m = useMemo(() => readMonth(profile, date), [profile, date]);
  const lead = m.days.length ? weekdayIndex(m.days[0].date) : 0;
  const opened = new Set(cracked);
  return (
    <div className="fc-body">
      <div className="fc-lead">
        <ScoreRing score={m.score} tone={toneOfNumber(m.score)} size={104} label="This month" />
        <div>
          <p className="label">
            <Term tip={`Solar months follow the sun. This one is a ${m.element} month, which works as ${m.familyName} for you.`}>{m.element} month</Term> · {m.range}
          </p>
          <p className="fc-text">{m.text}</p>
          <ReadMore text={m.deep} resetKey={m.start} />
          <p className="hint">{LONG_VIEW_NOTE.replace("the month or year", "the month")}</p>
        </div>
      </div>
      <ul className="fc-areas">
        {m.areas.map((a) => {
          const I = AREA_ICON[a.id];
          return (
            <li key={a.id} data-area={a.id}>
              <span className="area-icon area-icon-sm">
                <I size={16} />
              </span>
              {SHORT[a.id]}
              <ScorePill score={a.score} tone={a.tone} />
            </li>
          );
        })}
      </ul>
      <div className="cal-wrap">
        <div className="cal" role="grid" aria-label={`Your days, ${m.range}`}>
          {"SMTWTFS".split("").map((d, i) => (
            <span key={`h${i}`} className="cal-h" aria-hidden="true">
              {d}
            </span>
          ))}
          {Array.from({ length: lead }, (_, i) => (
            <span key={`b${i}`} />
          ))}
          {m.days.map((d) => {
            const isOpen = opened.has(d.date);
            const future = d.date > today;
            return (
              <button
                key={d.date}
                type="button"
                className={`cal-day ${isOpen ? "is-open" : future ? "is-future" : "is-missed"} ${d.date === today ? "is-today" : ""}`}
                data-tone={isOpen ? d.tone : undefined}
                disabled={!isOpen}
                onClick={() => onPick(d.date)}
                aria-label={`${fmtMonthDay(d.date)}: ${isOpen ? `score ${d.score}` : future ? "still sealed" : "not cracked"}`}
              >
                <span className="cal-date">{Number(d.date.slice(8))}</span>
                {isOpen ? <span className="cal-score">{d.score}</span> : future ? <Mark size={12} /> : null}
              </button>
            );
          })}
        </div>
        <p className="hint">Each day's score unlocks when you crack that day's cookie. Tap an opened day to read it again.</p>
      </div>
    </div>
  );
}

function Year({ profile, date }: { profile: Profile; date: string }) {
  const y = useMemo(() => readYear(profile, date), [profile, date]);
  return (
    <div className="fc-body">
      <div className="fc-lead">
        <ScoreRing score={y.score} tone={toneOfNumber(y.score)} size={104} label="This year" />
        <div>
          <p className="label">
            {y.label} year · {y.range}
          </p>
          <p className="fc-text">{y.text}</p>
          {y.link ? <p className="muted small">{y.link}</p> : null}
          <p className="hint">{LONG_VIEW_NOTE.replace("the month or year", "the year").replace("a harder month", "a harder year")}</p>
        </div>
      </div>
      <div>
        <p className="label block-label">Month by month</p>
        <ol className="year-strip">
          {y.months.map((mo) => (
            <li key={mo.label} className={mo.current ? "is-now" : ""} data-tone={mo.tone}>
              <span className="ys-num">{mo.score}</span>
              <span className="ys-bar">
                <span style={{ height: `${mo.score}%` }} />
              </span>
              <span className="ys-date">{mo.label}</span>
            </li>
          ))}
        </ol>
      </div>
      <ul className="outlook">
        {y.areas.map((a) => {
          const I = AREA_ICON[a.id];
          return (
            <li key={a.id} data-area={a.id}>
              <span className="area-icon area-icon-sm">
                <I size={16} />
              </span>
              <div>
                <p className="outlook-title">
                  {a.title} <ScorePill score={a.score} tone={a.tone} />
                </p>
                <p>{a.text}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** The next 3, 5, or 10 chart years, one row each. */
function Years({ profile, date }: { profile: Profile; date: string }) {
  const [count, setCount] = useState(5);
  const ys = useMemo(() => readYears(profile, date, count), [profile, date, count]);
  return (
    <div className="fc-body">
      <div className="chips" role="group" aria-label="How many years">
        {[3, 5, 10].map((n) => (
          <button key={n} type="button" className={`chip-btn ${count === n ? "is-on" : ""}`} aria-pressed={count === n} onClick={() => setCount(n)}>
            {n} years
          </button>
        ))}
      </div>
      <p className="fc-text">
        {ys.smoothest ? `${ys.smoothest.year} looks like your smoothest year in this stretch.` : ""}
        {ys.gentlest ? ` Go easier on yourself in ${ys.gentlest.year}.` : ""}
      </p>
      <p className="muted small">
        Best years by area:{" "}
        {ys.bestFor.map((b, i) => (
          <span key={b.id}>
            {i ? ", " : ""}
            {SHORT[b.id]} <strong>{b.year}</strong>
          </span>
        ))}
        . Each year starts in early February.
      </p>
      <ol className="yrows">
        {ys.rows.map((r) => (
          <li key={r.year} className={r.current ? "is-now" : ""}>
            <AnimalIcon animal={r.animal} size={40} />
            <div className="yrow-main">
              <p className="yrow-year">
                {r.year} {r.current ? <span className="yr-now">now</span> : null}
              </p>
              <p className="muted small">{r.label}</p>
              {count < 10 ? <p className="small">{r.flavor}</p> : null}
            </div>
            <ScorePill score={r.score} tone={r.tone} />
          </li>
        ))}
      </ol>
    </div>
  );
}

function Life({ profile, onProfile }: { profile: Profile; onProfile: () => void }) {
  const life = useMemo(() => readLife(profile), [profile]);
  const core = `${profile.core.yang ? "Yang" : "Yin"} ${profile.core.element}`;
  return (
    <div className="fc-body">
      <div className="life-core" data-el={profile.core.element}>
        <p className="label">Your core</p>
        <h3>
          {profile.core.title} <span className="muted">· {core}</span>
        </h3>
        <p>{profile.core.text}</p>
      </div>
      <ul className="outlook">
        {life.areas.map((a) => {
          const I = AREA_ICON[a.id];
          return (
            <li key={a.id} data-area={a.id}>
              <span className="area-icon area-icon-sm">
                <I size={16} />
              </span>
              <div>
                <p className="outlook-title">{a.title}</p>
                <p>{a.text}</p>
              </div>
            </li>
          );
        })}
      </ul>
      <button type="button" className="link-btn" onClick={onProfile}>
        See your four animals and element mix on your profile
      </button>
    </div>
  );
}

export function BiggerPicture({
  profile,
  date,
  today,
  cracked,
  onPick,
  onProfile,
}: {
  profile: Profile;
  date: string;
  today: string;
  cracked: string[];
  onPick: (d: string) => void;
  onProfile: () => void;
}) {
  const [tab, setTab] = useState<Tab>("month");
  const tabs: [Tab, string][] = [
    ["month", "This month"],
    ["year", "This year"],
    ["years", "Years ahead"],
    ["life", "Lifetime"],
  ];
  return (
    <section className="page-body" aria-labelledby="fc-title">
      <header className="page-head">
        <p className="eyebrow">Forecast</p>
        <h1 id="fc-title">The long view</h1>
        <p className="lede">These change slowly. Days stay sealed until you crack them.</p>
      </header>
      <div className="seg" role="tablist" aria-label="Time scale">
        {tabs.map(([id, label]) => (
          <button key={id} type="button" role="tab" aria-selected={tab === id} className={tab === id ? "is-on" : ""} onClick={() => setTab(id)}>
            {label}
          </button>
        ))}
      </div>
      <div role="tabpanel">
        {tab === "month" ? (
          <Month profile={profile} date={today} today={today} cracked={cracked} onPick={onPick} />
        ) : tab === "year" ? (
          <Year profile={profile} date={date} />
        ) : tab === "years" ? (
          <Years profile={profile} date={date} />
        ) : (
          <Life profile={profile} onProfile={onProfile} />
        )}
      </div>
    </section>
  );
}
