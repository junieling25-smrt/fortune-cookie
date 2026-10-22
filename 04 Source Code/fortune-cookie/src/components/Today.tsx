import { useCallback, useEffect, useRef, useState } from "react";
import { ANIMAL_INFO, ELEMENT_INFO, GLOSSARY } from "../engine/copy-guide";
import type { AreaId, DailyReading, Profile, Tone } from "../engine/reading";
import { fmtLongDate, fmtShortDate, greeting, type Streak } from "../lib";
import { Floaties } from "./Floaties";
import { AREA_ICON, Bowl, Check, Chevron, Copy, Hand, ImageIcon, Info, Music, Shirt } from "./Icons";
import { CookieArt, Mark } from "./Mark";
import { Pet } from "./Pet";
import { ReadMore } from "./ReadMore";
import { ScoreBar, ScorePill, ScoreRing, SHORT } from "./Score";
import { ShareModal } from "./ShareCard";
import { Term } from "./Term";

export type CheckIn = { date: string; items: { id: string; label: string; text: string }[] } | null;
export type TweakId = "wear" | "eat" | "do" | "listen";

const firstTrait = (el: keyof typeof ELEMENT_INFO) => ELEMENT_INFO[el].traits.split(",")[0].toLowerCase();

/** A small (i) that explains why on hover or tap. */
function Why({ tip }: { tip: string }) {
  return (
    <Term tip={tip} wide>
      <span className="why-i" aria-label="Why it helps">
        <Info size={15} />
      </span>
    </Term>
  );
}

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
  onToggle: (id: TweakId) => void;
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
  const [cheer, setCheer] = useState(0);
  const [pull, setPull] = useState(0);
  const touch = useRef<{ pts: Map<number, { x: number; y: number }>; start: number; last: string }>({ pts: new Map(), start: 0, last: "" });
  const closeShare = useCallback(() => setSharing(false), []);
  useEffect(() => setOpen(null), [reading.date]);

  const name = profile.person.name;
  const { overall, personal, today, tweaks } = reading;
  const core = `${profile.core.yang ? "Yang" : "Yin"} ${profile.core.element}`;
  const ordered = [...reading.areas.filter((a) => a.interested), ...reading.areas.filter((a) => !a.interested)];
  const focus = reading.areas.find((a) => a.focus) ?? ordered[0];
  const others = ordered.filter((a) => a.id !== focus.id);
  const tried = (["wear", "eat", "do", "listen"] as TweakId[]).filter((t) => done.includes(t)).length;

  const crack = () => {
    if (cracking) return;
    setCracking(true);
    setPull(0);
    navigator.vibrate?.([18, 40, 30]);
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    window.setTimeout(() => {
      onCrack();
      setCracking(false);
    }, reduce ? 50 : 900);
  };

  // On a touch screen you pull the cookie apart: two fingers spread, or one finger drags sideways.
  const spread = () => {
    const p = [...touch.current.pts.values()];
    return p.length >= 2 ? Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y) : p.length ? p[0].x : 0;
  };
  const onDown = (e: React.PointerEvent) => {
    touch.current.last = e.pointerType;
    if (e.pointerType === "mouse" || cracking) return;
    touch.current.pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    touch.current.start = spread();
  };
  const onMove = (e: React.PointerEvent) => {
    const t = touch.current;
    if (!t.pts.has(e.pointerId) || cracking) return;
    t.pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const p = Math.max(0, Math.min(1, Math.abs(spread() - t.start) / (t.pts.size >= 2 ? 110 : 140)));
    if (p >= 1) {
      t.pts.clear();
      crack();
    } else {
      if (Math.floor(p * 4) > Math.floor(pull * 4)) navigator.vibrate?.(8);
      setPull(p);
    }
  };
  const onUp = (e: React.PointerEvent) => {
    const t = touch.current;
    t.pts.delete(e.pointerId);
    if (t.pts.size === 0 && !cracking) setPull(0);
    else t.start = spread() - (pull * (t.pts.size >= 2 ? 110 : 140));
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

  const tweakRows: { id: TweakId; label: string; Icon: (p: { size?: number }) => React.JSX.Element; value: React.ReactNode; tip: string }[] = [
    {
      id: "wear",
      label: "Wear",
      Icon: Shirt,
      value: (
        <>
          <i className="swatch" style={{ background: tweaks.wear.hex }} /> {tweaks.wear.color}
        </>
      ),
      tip: `${tweaks.notes.wear} ${tweaks.why}`,
    },
    { id: "eat", label: "Eat", Icon: Bowl, value: tweaks.eat, tip: `${tweaks.notes.eat} ${tweaks.why}` },
    { id: "do", label: "Do", Icon: Hand, value: tweaks.do, tip: `${tweaks.notes.do} ${tweaks.why}` },
    { id: "listen", label: "Listen", Icon: Music, value: tweaks.listen, tip: `${tweaks.notes.listen} ${tweaks.why}` },
  ];

  const stage = (
    <div className={`stage ${sealed ? "is-sealed" : ""}`}>
      <Floaties dense={false} />
      {sealed ? (
        <div className="sealed">
          <button
            type="button"
            className={`crack-me ${cracking ? "is-cracking" : ""} ${pull > 0 ? "is-pulling" : ""}`}
            onClick={(e) => (e.detail === 0 || touch.current.last === "mouse" || !touch.current.last ? crack() : undefined)}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
            disabled={cracking}
            aria-label="Crack today's cookie"
          >
            <CookieArt progress={cracking ? 1 : pull} open={cracking} />
          </button>
          <p className="sealed-title">Today's cookie is sealed.</p>
          <button type="button" className="btn btn-cookie crack-click" onClick={crack} disabled={cracking}>
            Crack it open
          </button>
          <p className="crack-touch">Pull it apart with your fingers</p>
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
  );

  const scoreBlock = (
    <section className="block score-block" aria-label="Today's score">
      <Pet animal={profile.chart.year.branch.animal} season={reading.season.name} mood={overall.tone} cheer={cheer} />
      <ScoreRing score={overall.score} tone={overall.tone} label="Today's score" />
      <div className="score-copy">
        <p className="label">
          <Term tip={GLOSSARY.score}>Today's score</Term>
        </p>
        <p className="score-line">{overall.toneLine}</p>
        <p className="score-personal">
          <Term tip={`Your core element is ${core}, ${profile.core.title.toLowerCase()}. ${GLOSSARY.core}`}>Your {personal.nick}</Term>: {personal.text}
        </p>
        <ReadMore text={overall.deep} label="Read more about today" resetKey={reading.date} />
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
  );

  return (
    <section className={`today ${sealed ? "is-sealed" : ""}`} aria-labelledby="today-title">
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
            <span className="label">Yesterday's tweak</span>
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

      <div className="today-grid">
        <div className="today-main">
          {stage}
          {sealed ? null : scoreBlock}
        </div>

        <div className="today-side">
          {sealed ? null : (
            <>
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
                <p className="area-text">{focus.forYou ?? focus.text}</p>
              </section>

              <section className="block others" aria-label="Other areas">
                <p className="label block-label">Other areas</p>
                {others.map((a) => {
                  const I = AREA_ICON[a.id];
                  const isOpen = open === a.id;
                  return (
                    <div key={a.id} className={`other ${isOpen ? "is-open" : ""}`} data-area={a.id}>
                      <button type="button" className="other-row" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : a.id)}>
                        <span className="area-icon area-icon-sm">
                          <I size={18} />
                        </span>
                        <span className="other-title">{a.title}</span>
                        <ScorePill score={a.score} tone={a.tone} />
                        <Chevron dir="down" size={16} />
                      </button>
                      {isOpen ? (
                        <div className="other-body">
                          <p className="area-text">{a.forYou ?? a.text}</p>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </section>

              <section className="block tweaks" aria-labelledby="tweaks-title" data-el={tweaks.element}>
                <header className="tweaks-head">
                  <h2 id="tweaks-title">Small tweaks</h2>
                  <span className="muted small">
                    {tried} of 4 tried · a{" "}
                    <Term tip={tweaks.why} wide>
                      {tweaks.element}
                    </Term>{" "}
                    day for you
                  </span>
                </header>
                <ul className="tweak-list">
                  {tweakRows.map(({ id, label, Icon, value, tip }) => {
                    const on = done.includes(id);
                    return (
                      <li key={id} className={on ? "is-done" : ""}>
                        <button type="button" className="tweak-btn" aria-pressed={on} onClick={() => (on || setCheer((c) => c + 1), onToggle(id))}>
                          <span className="tweak-ic">{on ? <Check size={16} /> : <Icon />}</span>
                          <span className="label">{label}</span>
                          <span className="tweak-val">{value}</span>
                        </button>
                        <Why tip={tip} />
                      </li>
                    );
                  })}
                </ul>
                <p className="hint">Tap one when you've tried it. Tap the (i) to see why it helps.</p>
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
        </div>
      </div>

      {sharing ? <ShareModal reading={reading} name={name} onClose={closeShare} /> : null}
    </section>
  );
}
