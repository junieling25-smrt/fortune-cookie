import { useMemo, useState } from "react";
import { ELEMENTS } from "../engine/pillars";
import { PILLAR_META, readLife, readMonth, readYear, readYears, type Profile, type Tone } from "../engine/reading";
import { AnimalIcon } from "./Animals";
import { ReadMore } from "./ReadMore";
import { fmtMonthDay, localToday, weekdayIndex } from "../lib";
import { AREA_ICON, Spark, ToneIcon } from "./Icons";

type Tab = "month" | "year" | "y3" | "y5" | "y10";
const TONES: [Tone, string][] = [
  ["flowing", "Flowing"],
  ["steady", "Steady"],
  ["mixed", "Mixed"],
  ["gentle", "Go gently"],
];

function Legend() {
  return (
    <ul className="legend" aria-label="Legend">
      {TONES.map(([t, l]) => (
        <li key={t}>
          <i data-tone={t} />
          {l}
        </li>
      ))}
    </ul>
  );
}

function Month({ profile, date, onPick }: { profile: Profile; date: string; onPick: (d: string) => void }) {
  const m = useMemo(() => readMonth(profile, date), [profile, date]);
  const today = localToday();
  const lead = m.days.length ? weekdayIndex(m.days[0].date) : 0;
  return (
    <div className="bp-body">
      <div className="bp-intro">
        <p className="bp-kicker">
          {m.element} month · {m.range}
        </p>
        <h3>{m.text}</h3>
        <p className="muted">
          {m.element} works as {m.familyName} for you. Solar months turn with the sun, so this one runs {m.range}.
        </p>
        <ReadMore text={m.deep} label="Read more about this month" resetKey={m.range} />
        <div className="bp-areas">
          {m.areas.map((a) => {
            const Icon = AREA_ICON[a.id];
            return (
              <span key={a.id} className="chip chip-area" data-tone={a.tone}>
                <Icon size={15} /> {a.title}: {a.toneLabel}
              </span>
            );
          })}
        </div>
        {m.smoother.length ? (
          <p className="bp-smooth">
            <Spark size={12} /> Smoother days this month: {m.smoother.slice(0, 6).map(fmtMonthDay).join(", ")}
          </p>
        ) : null}
      </div>
      <div className="cal-wrap">
        <div className="cal" role="grid" aria-label={`Daily conditions, ${m.range}`}>
          {"SMTWTFS".split("").map((d, i) => (
            <span key={`h${i}`} className="cal-h" aria-hidden="true">
              {d}
            </span>
          ))}
          {Array.from({ length: lead }, (_, i) => (
            <span key={`b${i}`} />
          ))}
          {m.days.map((d) => (
            <button
              key={d.date}
              type="button"
              className={`cal-day ${d.date === today ? "is-today" : ""} ${d.date === date ? "is-picked" : ""}`}
              data-tone={d.tone}
              onClick={() => onPick(d.date)}
              aria-label={`${fmtMonthDay(d.date)}: ${TONES.find((t) => t[0] === d.tone)?.[1]}`}
            >
              {Number(d.date.slice(8))}
            </button>
          ))}
        </div>
        <Legend />
        <p className="hint">Tap a day to read it.</p>
      </div>
    </div>
  );
}

function Year({ profile, date }: { profile: Profile; date: string }) {
  const y = useMemo(() => readYear(profile, date), [profile, date]);
  return (
    <div className="bp-body bp-body-stack">
      <div className="bp-intro">
        <p className="bp-kicker">
          Your {y.chartYear} · {y.label} year · {y.range}
        </p>
        <h3>{y.flavor}</h3>
        <p className="muted">{y.text}</p>
        {y.link ? (
          <p className="ap-link">
            <Spark size={12} />
            <span>{y.link}</span>
          </p>
        ) : null}
      </div>
      <div>
        <p className="label">Month by month</p>
        <ol className="year-strip">
          {y.months.map((mo) => (
            <li key={mo.label} className={mo.current ? "is-now" : ""} data-tone={mo.tone}>
              <ToneIcon tone={mo.tone} size={18} />
              <span className="ys-el">{mo.element}</span>
              <span className="ys-date">{mo.label}</span>
            </li>
          ))}
        </ol>
        <Legend />
      </div>
      <ul className="outlook">
        {y.areas.map((a) => {
          const Icon = AREA_ICON[a.id];
          return (
            <li key={a.id} data-area={a.id}>
              <span className="area-icon">
                <Icon size={20} />
              </span>
              <div>
                <p className="outlook-title">
                  {a.title}
                  <span className="chip" data-tone={a.tone}>
                    <i className="dot" />
                    {a.toneLabel}
                  </span>
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

export function Lifetime({ profile }: { profile: Profile }) {
  return (
    <section className="section" id="lifetime" aria-labelledby="life-title">
      <div className="section-head">
        <p className="eyebrow">Your lifetime</p>
        <h2 id="life-title">The part of you that doesn't change</h2>
        <p className="lede">Your birth chart stays the same for life. This is the starting point every daily, monthly, and yearly reading is measured against.</p>
      </div>
      <div className="bp-panel">
        <Life profile={profile} />
      </div>
    </section>
  );
}

function Life({ profile }: { profile: Profile }) {
  const life = useMemo(() => readLife(profile), [profile]);
  const peak = Math.max(...ELEMENTS.map((e) => profile.share[e]));
  const core = `${profile.core.yang ? "Yang" : "Yin"} ${profile.core.element}`;
  return (
    <div className="bp-body bp-body-stack">
      <div className="life-top">
        <article className="core-card" data-el={profile.core.element}>
          <p className="label">Your core element</p>
          <h3>
            {core} <span className="core-title">· {profile.core.title}</span>
          </h3>
          <p>{profile.core.text}</p>
          <p className="muted small">It comes from your Day pillar and is the lens every reading uses. A starting sketch, not a box.</p>
        </article>
        <article className="mix-card">
          <p className="label">Your element mix</p>
          <ul className="bars">
            {ELEMENTS.map((e) => (
              <li key={e} data-el={e}>
                <span className="bar-name">{e}</span>
                <span className="bar-track">
                  <span className="bar-fill" style={{ width: `${Math.max(3, (profile.share[e] / peak) * 100)}%` }} />
                </span>
                <span className="bar-val">{Math.round(profile.share[e] * 100)}%</span>
              </li>
            ))}
          </ul>
          <p className="small">{profile.mostLine}</p>
          <p className="small">{profile.leastLine}</p>
          <div className="helpful" data-el={profile.helpful.element}>
            <span className="swatch" aria-hidden="true" />
            <p className="small">
              <strong>Balancing element: {profile.helpful.element}</strong> ({profile.helpful.color.toLowerCase()}). {profile.helpful.ideas}
            </p>
          </div>
        </article>
      </div>

      <div>
        <p className="label">You're more than your year animal</p>
        <div className="pillars">
          {profile.pillars.map((p) => {
            const meta = PILLAR_META[p.key];
            return (
              <article key={p.key} className={`pillar ${p.known ? "" : "is-unknown"}`} data-el={p.known ? p.element : undefined}>
                {p.key === "day" && p.known ? <span className="pillar-you">This one is you</span> : null}
                <p className="pillar-label">
                  {meta.label} <span>· {meta.theme}</span>
                </p>
                <div className="pillar-top">
                  {p.known ? <AnimalIcon animal={p.animal} size={56} /> : <span className="animal-unknown">?</span>}
                  <p className="pillar-animal">{p.known ? p.animal : "Unknown"}</p>
                </div>
                <p className="pillar-el">
                  {p.known ? (
                    <>
                      <i className="dot" /> {p.yang ? "Yang" : "Yin"} {p.element}
                    </>
                  ) : (
                    "Add a birth time to see it"
                  )}
                </p>
                <p className="pillar-means">{meta.means}</p>
              </article>
            );
          })}
        </div>
      </div>

      <ul className="outlook">
        {life.areas.map((a) => {
          const Icon = AREA_ICON[a.id];
          return (
            <li key={a.id} data-area={a.id}>
              <span className="area-icon">
                <Icon size={20} />
              </span>
              <div>
                <p className="outlook-title">{a.title}</p>
                <p>{a.text}</p>
                <p className="muted small">{a.source}.</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Years({ profile, date, count }: { profile: Profile; date: string; count: number }) {
  const ys = useMemo(() => readYears(profile, date, count), [profile, date, count]);
  return (
    <div className="bp-body bp-body-stack">
      <div className="bp-intro">
        <p className="bp-kicker">
          Your next {count} years · {ys.from} to {ys.to}
        </p>
        <h3>
          {ys.smoothest ? `${ys.smoothest.year} looks like your smoothest year in this stretch.` : ""}
          {ys.gentlest ? ` Go easier on yourself in ${ys.gentlest.year}.` : ""}
        </h3>
        <p className="muted">
          Each chart year starts when spring begins, in early February. Best years by area:{" "}
          {ys.bestFor.map((b, i) => (
            <span key={b.id}>
              {i ? ", " : ""}
              {b.title} in <strong>{b.year}</strong>
            </span>
          ))}
          .
        </p>
      </div>
      <ol className={`years ${count >= 10 ? "years-compact" : ""}`}>
        {ys.rows.map((r) => (
          <li key={r.year} className={r.current ? "is-now" : ""} data-tone={r.tone}>
            <div className="yr-head">
              <AnimalIcon animal={r.animal} size={count >= 10 ? 38 : 48} />
              <div>
                <p className="yr-year">
                  {r.year} {r.current ? <span className="yr-now">now</span> : null}
                </p>
                <p className="yr-label">{r.label}</p>
              </div>
            </div>
            <span className="chip yr-chip" data-tone={r.tone}>
              <ToneIcon tone={r.tone} size={16} />
              {r.toneLabel}
            </span>
            {count < 10 ? <p className="yr-flavor">{r.flavor}</p> : null}
            <div className="yr-areas">
              {r.areas.map((a) => {
                const Icon = AREA_ICON[a.id];
                return (
                  <span key={a.id} className="yr-area" data-tone={a.tone} data-area={a.id} title={`${a.id}: ${a.tone}`}>
                    <Icon size={14} />
                  </span>
                );
              })}
            </div>
          </li>
        ))}
      </ol>
      <Legend />
    </div>
  );
}

export function BiggerPicture({ profile, date, onPick }: { profile: Profile; date: string; onPick: (d: string) => void }) {
  const [tab, setTab] = useState<Tab>("month");
  const tabs: [Tab, string, string][] = [
    ["month", "This month", "Changes about every 30 days"],
    ["year", "This year", "Month by month"],
    ["y3", "3 years", "One row per year"],
    ["y5", "5 years", "One row per year"],
    ["y10", "10 years", "The long view"],
  ];
  return (
    <section className="section" id="bigger" aria-labelledby="bigger-title">
      <div className="section-head">
        <p className="eyebrow">The bigger picture</p>
        <h2 id="bigger-title">Zoom out from today</h2>
        <p className="lede">Days change fast. Months, years, and the decade ahead change slowly, so they're worth a look once in a while.</p>
      </div>
      <div className="seg" role="tablist" aria-label="Time scale">
        {tabs.map(([id, label, hint]) => (
          <button key={id} type="button" role="tab" aria-selected={tab === id} className={tab === id ? "is-on" : ""} onClick={() => setTab(id)}>
            <strong>{label}</strong>
            <small>{hint}</small>
          </button>
        ))}
      </div>
      <div className="bp-panel" role="tabpanel">
        {tab === "month" ? (
          <Month profile={profile} date={date} onPick={onPick} />
        ) : tab === "year" ? (
          <Year profile={profile} date={date} />
        ) : (
          <Years profile={profile} date={date} count={tab === "y3" ? 3 : tab === "y5" ? 5 : 10} />
        )}
      </div>
    </section>
  );
}
