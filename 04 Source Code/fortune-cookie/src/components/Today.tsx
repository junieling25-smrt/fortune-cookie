import { useCallback, useEffect, useState } from "react";
import { ANIMAL_INFO, ELEMENT_INFO, GLOSSARY } from "../engine/copy-guide";
import type { AreaId, DailyReading, Profile, Tone } from "../engine/reading";
import { fmtLongDate, fmtShortDate, greeting, type Streak } from "../lib";
import { Floaties } from "./Floaties";
import { AREA_ICON, Bowl, Check, Chevron, Clock, Copy, Hand, ImageIcon, Shirt } from "./Icons";
import { CookieArt, Mark } from "./Mark";
import { ScoreBar, ScorePill, ScoreRing, SHORT } from "./Score";
import { ShareModal } from "./ShareCard";
import { Term } from "./Term";

export type CheckIn = { date: string; items: { id: string; label: string; text: string }[] } | null;

const firstTrait = (el: keyof typeof ELEMENT_INFO) => ELEMENT_INFO[el].traits.split(",")[0].toLowerCase();

export function Today({
  profile,
  reading,
  sealed,
  isToday,
  onCrack,
  onBackToToday,
  done,
  onToggle,
  checkIn,
  onCheckIn,
  onDismissCheckIn,
  streak,
  teaser,
  onPickDay,
}: {
  profile: Profile;
  reading: DailyReading;
  sealed: boolean;
  isToday: boolean;
  onCrack: () => void;
  onBackToToday: () => void;
  done: string[];
  onToggle: (id: AreaId) => void;
  checkIn: CheckIn;
  onCheckIn: (id: string) => void;
  onDismissCheckIn: () => void;
  streak: Streak;
  teaser: { area: string; tone: Tone; text: string };
  onPickDay: (date: string) => void;
}) {
  const [sharing, setSharing] = useState(false);
  const [cracking, setCracking] = useState(false);
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState<AreaId | null>(null);
  const closeShare = useCallback(() => setSharing(false), []);
  useEffect(() => setOpen(null), [reading.date]);

  const name = profile.person.name;
  const { overall, personal, today, tweaks } = reading;
  const core = `${profile.core.yang ? "Yang" : "Yin"} ${profile.core.element}`;
  const ordered = [...reading.areas.filter((a) => a.interested), ...reading.areas.filter((a) => !a.interested)];
  const focus = reading.areas.find((a) => a.focus) ?? ordered[0];
  const others = ordered.filter((a) => a.id !== focus.id);
  const stepsDone = reading.areas.filter((a) => done.includes(a.id)).length;

  const crack = () => {
    setCracking(true);
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    window.setTimeout(() => {
      onCrack();
      setCracking(false);
    }, reduce ? 50 : 900);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`${reading.slip}\n\nToday's score: ${overall.score}\nFortune Cookie, ${fmtLongDate(reading.date)}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard refused; text stays selectable */
    }
  };

  const dayTip = `${GLOSSARY["day energy"]} Today is ${today.yang ? "yang" : "yin"} ${today.element} (${firstTrait(today.element)}) with the ${today.animal} (${(ANIMAL_INFO[today.animal]?.trait ?? "").toLowerCase()}).`;

  return (
    <section className="today" aria-labelledby="today-title">
      <header className="today-head">
        <p className="eyebrow">
          {isToday ? greeting() : "Looking back"}
          {name ? `, ${name}` : ""}
        </p>
        <h1 id="today-title">{fmtLongDate(reading.date)}</h1>
        {!isToday ? (
          <button type="button" className="btn btn-soft btn-small" onClick={onBackToToday}>
            <Chevron dir="left" size={14} /> Back to today
          </button>
        ) : null}
      </header>

      {checkIn && !sealed ? (
        <div className="checkin">
          <p>
            <span className="label">Yesterday's step</span>
            {checkIn.items[0].text}
          </p>
          <div className="checkin-actions">
            <button type="button" className="btn btn-small btn-ink" onClick={() => onCheckIn(checkIn.items[0].id)}>
              <Check size={12} /> Did it
            </button>
            <button type="button" className="btn btn-small btn-quiet" onClick={onDismissCheckIn}>
              Not this time
            </button>
          </div>
        </div>
      ) : null}

      <div className={`stage ${sealed ? "is-sealed" : ""}`}>
        <Floaties dense={false} />
        {sealed ? (
          <div className="sealed">
            <button type="button" className={`crack-me ${cracking ? "is-cracking" : ""}`} onClick={crack} disabled={cracking} aria-label="Crack today's cookie">
              <CookieArt progress={cracking ? 1 : 0} open={cracking} />
            </button>
            <p className="sealed-title">Today's cookie is sealed.</p>
            <button type="button" className="btn btn-cookie" onClick={crack} disabled={cracking}>
              Crack it open
            </button>
            <p className="sealed-note">{streak.streak > 0 ? `Keep your ${streak.streak}-day streak going.` : "One cookie a day. Start a streak."}</p>
          </div>
        ) : (
          <>
            <div className="stage-cookie">
              <CookieArt progress={1} open />
            </div>
            <article className="slip" key={reading.date}>
              <span className="slip-tag">{name ? `${name}'s fortune` : "Your fortune"}</span>
              <p className="slip-text" id="slip-text">
                {reading.slip}
              </p>
              <p className="slip-foot">
                <Term tip={dayTip} wide>
                  {today.yang ? "Yang" : "Yin"} {today.element} {today.animal} day
                </Term>
              </p>
            </article>
            <div className="stage-actions">
              <button type="button" className="btn btn-night" onClick={() => setSharing(true)}>
                <ImageIcon /> Share image
              </button>
              <button type="button" className="btn btn-night-quiet" onClick={copy}>
                <Copy /> {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </>
        )}
      </div>

      {sealed ? null : (
        <>
          <section className="block score-block" aria-label="Today's score">
            <ScoreRing score={overall.score} tone={overall.tone} label="Today's score" />
            <div className="score-copy">
              <p className="label">
                <Term tip={GLOSSARY.score}>Today's score</Term>
              </p>
              <p className="score-line">{overall.toneLine}</p>
              <p className="score-personal">
                <Term tip={`Your core element is ${core}, ${profile.core.title.toLowerCase()}. ${GLOSSARY.core}`}>Your {personal.nick}</Term>: {personal.text}
              </p>
            </div>
            <ul className="mini-scores">
              {ordered.map((a) => (
                <li key={a.id} data-area={a.id}>
                  <button type="button" onClick={() => setOpen(a.id === focus.id ? null : a.id)} aria-label={`${a.title}: ${a.score}`}>
                    <span className="mini-name">{SHORT[a.id]}</span>
                    <ScoreBar score={a.score} tone={a.tone} />
                    <span className="mini-num">{a.score}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section className="block focus" data-area={focus.id} aria-labelledby="focus-title">
            <header className="area-head">
              <span className="area-icon">{(() => {
                const I = AREA_ICON[focus.id];
                return <I size={22} />;
              })()}</span>
              <div>
                <p className="label">In focus today</p>
                <h2 id="focus-title">{focus.title}</h2>
              </div>
              <ScorePill score={focus.score} tone={focus.tone} />
            </header>
            <p className="area-text">{focus.text}</p>
            {focus.forYou ? <p className="area-foryou">{focus.forYou}</p> : null}
            <StepButton id={focus.id} text={focus.step} done={done.includes(focus.id)} onToggle={onToggle} />
          </section>

          <section className="block others" aria-label="Other areas">
            <p className="label block-label">
              Other areas <span className="muted">· {stepsDone} of {reading.areas.length} tiny steps done</span>
            </p>
            {others.map((a) => {
              const I = AREA_ICON[a.id];
              const isOpen = open === a.id;
              return (
                <div key={a.id} className={`other ${isOpen ? "is-open" : ""}`} data-area={a.id}>
                  <button type="button" className="other-row" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : a.id)}>
                    <span className="area-icon area-icon-sm">
                      <I size={18} />
                    </span>
                    <span className="other-title">
                      {a.title}
                      {done.includes(a.id) ? <Check size={12} /> : null}
                    </span>
                    <ScorePill score={a.score} tone={a.tone} />
                    <Chevron dir="down" size={16} />
                  </button>
                  {isOpen ? (
                    <div className="other-body">
                      <p className="area-text">{a.text}</p>
                      {a.forYou ? <p className="area-foryou">{a.forYou}</p> : null}
                      <StepButton id={a.id} text={a.step} done={done.includes(a.id)} onToggle={onToggle} />
                    </div>
                  ) : null}
                </div>
              );
            })}
          </section>

          <section className="block tweaks" aria-labelledby="tweaks-title" data-el={tweaks.element}>
            <header className="tweaks-head">
              <h2 id="tweaks-title">Small tweaks</h2>
              <Term tip={tweaks.why} wide>
                <span className="chip" data-el={tweaks.element}>
                  {tweaks.element} day for you
                </span>
              </Term>
            </header>
            <ul className="tweak-list">
              <li>
                <span className="tweak-ic">
                  <Shirt />
                </span>
                <span className="label">Wear</span>
                <span className="tweak-val">
                  <i className="swatch" style={{ background: tweaks.wear.hex }} /> {tweaks.wear.color}
                </span>
              </li>
              <li>
                <span className="tweak-ic">
                  <Bowl />
                </span>
                <span className="label">Eat</span>
                <span className="tweak-val">{tweaks.eat}</span>
              </li>
              <li>
                <span className="tweak-ic">
                  <Hand />
                </span>
                <span className="label">Do</span>
                <span className="tweak-val">{tweaks.do}</span>
              </li>
              <li>
                <span className="tweak-ic">
                  <Clock />
                </span>
                <span className="label">
                  <Term tip={GLOSSARY["best time"]}>Best time</Term>
                </span>
                <span className="tweak-val">
                  {tweaks.time.label} <span className="muted">· {tweaks.time.animal} hours</span>
                </span>
              </li>
            </ul>
          </section>
        </>
      )}

      <section className="block tomorrow" aria-label="Your streak and tomorrow">
        <div className="streak-row">
          <div>
            <p className="streak-num">
              <Mark size={22} /> {streak.streak} <span>day streak</span>
            </p>
            <p className="muted small">{streak.total} cookies cracked</p>
          </div>
          <ol className="week" aria-label="The last seven days">
            {streak.week.map((d) => (
              <li key={d.date}>
                <button
                  type="button"
                  className={`${d.cracked ? "is-on" : ""} ${d.date === reading.date ? "is-viewing" : ""}`}
                  disabled={!d.cracked}
                  onClick={() => onPickDay(d.date)}
                  aria-label={`${fmtShortDate(d.date)}${d.cracked ? ", cracked. Read it again" : ", not cracked"}`}
                >
                  <span className="week-cookie">{d.cracked ? <Mark size={20} /> : null}</span>
                  <span className="week-letter">{d.letter}</span>
                </button>
              </li>
            ))}
          </ol>
        </div>
        <div className="tomorrow-row">
          <span className="sealed-mini" aria-hidden="true">
            <Mark size={30} />
          </span>
          <p>
            <span className="label">Tomorrow's cookie</span>
            {teaser.text} Opens after midnight.
          </p>
        </div>
      </section>

      {sharing ? <ShareModal reading={reading} name={name} onClose={closeShare} /> : null}
    </section>
  );
}

function StepButton({ id, text, done, onToggle }: { id: AreaId; text: string; done: boolean; onToggle: (id: AreaId) => void }) {
  return (
    <button type="button" className={`step ${done ? "is-done" : ""}`} aria-pressed={done} onClick={() => onToggle(id)}>
      <span className="step-box">{done ? <Check size={13} /> : null}</span>
      <span className="step-copy">
        <small>Tiny step</small>
        {text}
      </span>
    </button>
  );
}
