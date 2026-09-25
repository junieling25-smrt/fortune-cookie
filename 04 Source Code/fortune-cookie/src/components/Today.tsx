import { useCallback, useState } from "react";
import type { DailyReading, Profile } from "../engine/reading";
import { fmtLongDate, fmtShortDate, greeting, localToday, shiftDate } from "../lib";
import { Check, Chevron, Copy, ImageIcon, Spark, ToneIcon } from "./Icons";
import { CookieArt, Mark } from "./Mark";
import { ReadMore } from "./ReadMore";
import { ShareModal } from "./ShareCard";

const STARS: [number, number, number, number][] = [
  [9, 12, 12, 0],
  [86, 9, 9, 1.2],
  [80, 32, 6, 2.1],
  [12, 44, 7, 0.6],
  [92, 50, 11, 1.7],
  [6, 74, 8, 2.6],
  [68, 5, 6, 3.1],
  [30, 7, 5, 1.4],
];

export function DateNav({ date, onChange }: { date: string; onChange: (d: string) => void }) {
  const today = localToday();
  return (
    <div className="date-nav" role="group" aria-label="Choose a day">
      <button type="button" className="icon-btn" aria-label="Previous day" onClick={() => onChange(shiftDate(date, -1))}>
        <Chevron dir="left" />
      </button>
      <label className="date-pill" htmlFor="reading-date">
        <span>{date === today ? "Today" : fmtShortDate(date)}</span>
        <input id="reading-date" type="date" value={date} min="1902-01-01" max="2099-12-31" onChange={(e) => e.target.value && onChange(e.target.value)} aria-label="Reading date" />
      </label>
      <button type="button" className="icon-btn" aria-label="Next day" onClick={() => onChange(shiftDate(date, 1))}>
        <Chevron dir="right" />
      </button>
      {date !== today ? (
        <button type="button" className="btn btn-quiet btn-small" onClick={() => onChange(today)}>
          Back to today
        </button>
      ) : null}
    </div>
  );
}

export type CheckIn = { date: string; items: { id: string; label: string; text: string }[] } | null;

export function Today({
  profile,
  reading,
  sealed,
  onCrack,
  onDateChange,
  tryDone,
  onToggleTry,
  checkIn,
  onCheckIn,
  onDismissCheckIn,
}: {
  profile: Profile;
  reading: DailyReading;
  sealed: boolean;
  onCrack: () => void;
  onDateChange: (d: string) => void;
  tryDone: boolean;
  onToggleTry: () => void;
  checkIn: CheckIn;
  onCheckIn: (id: string) => void;
  onDismissCheckIn: () => void;
}) {
  const [sharing, setSharing] = useState(false);
  const [cracking, setCracking] = useState(false);
  const [copied, setCopied] = useState(false);
  const closeShare = useCallback(() => setSharing(false), []);
  const name = profile.person.name;
  const core = `${profile.core.yang ? "Yang" : "Yin"} ${profile.core.element}`;
  const { energy, undercurrent, overall, personal } = reading;
  const isToday = reading.date === localToday();

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
      await navigator.clipboard.writeText(`${reading.slip}\n\nFortune Cookie, ${fmtLongDate(reading.date)}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard refused; text stays selectable */
    }
  };

  return (
    <section className="today" id="today" aria-labelledby="today-title">
      <div className="today-head">
        <div>
          <p className="eyebrow">
            {isToday ? greeting() : "Looking at another day"}
            {name ? `, ${name}` : ""}
          </p>
          <h1 id="today-title">{fmtLongDate(reading.date)}</h1>
        </div>
        <DateNav date={reading.date} onChange={onDateChange} />
      </div>

      <div className="today-grid">
        <div className="stage">
          <div className="sky" aria-hidden="true">
            <span className="moon" />
            <span className="orbit" />
            {STARS.map(([x, y, s, delay], i) => (
              <span key={i} className="star" style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${delay}s` }}>
                <Spark size={s} />
              </span>
            ))}
          </div>

          {sealed ? (
            <div className="sealed">
              <button type="button" className={`crack-me ${cracking ? "is-cracking" : ""}`} onClick={crack} disabled={cracking} aria-label="Crack today's cookie">
                <CookieArt progress={cracking ? 1 : 0} open={cracking} />
              </button>
              <p className="sealed-title">Today's cookie is ready.</p>
              <button type="button" className="btn btn-cookie" onClick={crack} disabled={cracking}>
                Crack it open
              </button>
              <p className="sealed-note">Crack one every day to grow your streak.</p>
            </div>
          ) : (
            <>
              <div className="stage-cookie">
                <CookieArt progress={1} open />
              </div>
              <article className="slip" key={reading.date}>
                <span className="slip-tag">{name ? `${name}'s fortune` : "Your fortune"}</span>
                <p className="slip-date">{fmtShortDate(reading.date)}</p>
                <p className="slip-text" id="slip-text">
                  {reading.slip}
                </p>
                <div className="slip-foot">
                  <span className="chip" data-el={reading.today.element}>
                    {reading.today.yang ? "Yang" : "Yin"} {reading.today.element} {reading.today.animal} day
                  </span>
                  <span className="chip" data-tone={overall.tone}>
                    <i className="dot" />
                    {overall.toneLabel}
                  </span>
                </div>
              </article>
              <div className="stage-actions">
                <button type="button" className="btn btn-night" onClick={() => setSharing(true)}>
                  <ImageIcon /> Share image
                </button>
                <button type="button" className="btn btn-night-quiet" onClick={copy}>
                  <Copy /> {copied ? "Copied" : "Copy text"}
                </button>
              </div>
            </>
          )}
        </div>

        <div className="ritual">
          {checkIn ? (
            <div className="checkin">
              <div className="checkin-head">
                <p className="label">Yesterday's tiny steps</p>
                <button type="button" className="link-btn" onClick={onDismissCheckIn}>
                  Dismiss
                </button>
              </div>
              <p className="checkin-q">Did you get to these?</p>
              <ul>
                {checkIn.items.map((it) => (
                  <li key={it.id}>
                    <span>
                      <small>{it.label}</small>
                      {it.text}
                    </span>
                    <button type="button" className="btn btn-small btn-soft" onClick={() => onCheckIn(it.id)}>
                      <Check size={12} /> Did it
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <article className="overall" data-tone={overall.tone}>
            <header className="overall-head">
              <span className="tone-badge" data-tone={overall.tone}>
                <ToneIcon tone={overall.tone} size={24} />
              </span>
              <div>
                <p className="label">Overall</p>
                <h2>{overall.toneLabel}</h2>
              </div>
            </header>
            <p className="overall-line">{overall.toneLine}</p>
            <p className="overall-why">
              Today carries <strong>{energy.element}</strong>. For a {core} like you, that works as{" "}
              <strong className="fam">{energy.familyName}</strong>: {energy.means}. Underneath, the {undercurrent.animal} brings{" "}
              {undercurrent.familyName.toLowerCase()}.
            </p>
            <ReadMore text={overall.deep} label="Read more about today" resetKey={reading.date} />
            <div className="personal">
              <span className="personal-mark" aria-hidden="true">
                <Mark size={26} />
              </span>
              <div>
                <p className="label">Your {personal.nick} today</p>
                <p>{personal.text}</p>
              </div>
            </div>
          </article>

          <div className="prompts">
            <button type="button" className={`prompt prompt-try ${tryDone ? "is-done" : ""}`} aria-pressed={tryDone} onClick={onToggleTry}>
              <span className="step-box">{tryDone ? <Check size={13} /> : null}</span>
              <span>
                <span className="label">Try this</span>
                <span className="prompt-text">{overall.try}</span>
              </span>
            </button>
            <div className="prompt prompt-ask">
              <p className="label">Ask yourself</p>
              <p className="ask">{overall.ask}</p>
            </div>
          </div>
        </div>
      </div>

      {sharing ? <ShareModal reading={reading} name={name} onClose={closeShare} /> : null}
    </section>
  );
}
