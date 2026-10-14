import { useEffect, useState } from "react";
import { INTRO, SPLASH } from "../engine/copy-guide";
import { Chevron } from "./Icons";
import { CookieArt, Mark } from "./Mark";
import { Floaties } from "./Floaties";

/** The first-visit welcome: four short cards, then onboarding. */
export function Intro({ onDone }: { onDone: () => void }) {
  const [i, setI] = useState(0);
  const card = INTRO[i];
  const last = i === INTRO.length - 1;

  return (
    <div className="intro">
      <Floaties />
      <header className="intro-top">
        <span className="brand">
          <Mark size={30} />
          <span className="wordmark">fortune cookie</span>
        </span>
        <button type="button" className="btn btn-quiet btn-small" onClick={onDone}>
          Skip
        </button>
      </header>

      <div className="intro-cookie">
        <CookieArt progress={i / (INTRO.length - 1)} open={false} />
      </div>

      <article className="intro-card" key={i}>
        <p className="eyebrow">{card.kicker}</p>
        <h1>{card.title}</h1>
        <p className="intro-body">{card.body}</p>
      </article>

      <div className="intro-nav">
        <div className="intro-dots" role="tablist" aria-label="Welcome cards">
          {INTRO.map((c, k) => (
            <button key={c.kicker} type="button" role="tab" aria-selected={k === i} aria-label={c.kicker} className={k === i ? "is-on" : ""} onClick={() => setI(k)} />
          ))}
        </div>
        <div className="intro-actions">
          {i > 0 ? (
            <button type="button" className="btn btn-quiet" onClick={() => setI(i - 1)}>
              <Chevron dir="left" size={16} /> Back
            </button>
          ) : null}
          <button type="button" className="btn btn-cookie" onClick={() => (last ? onDone() : setI(i + 1))}>
            {last ? "Make my cookie" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}

/** A one-second splash while the app opens, with one small fact. Tap to skip. */
export function Splash({ onDone }: { onDone: () => void }) {
  const [line] = useState(() => SPLASH[Math.floor(Math.random() * SPLASH.length)]);
  const [leaving, setLeaving] = useState(false);
  useEffect(() => {
    const t1 = window.setTimeout(() => setLeaving(true), 1300);
    const t2 = window.setTimeout(onDone, 1700);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [onDone]);
  return (
    <button type="button" className={`splash ${leaving ? "is-leaving" : ""}`} onClick={onDone} aria-label="Open Fortune Cookie">
      <Floaties dense={false} />
      <span className="splash-mark">
        <Mark size={84} detail />
      </span>
      <span className="wordmark splash-word">fortune cookie</span>
      <span className="splash-line">{line}</span>
    </button>
  );
}
