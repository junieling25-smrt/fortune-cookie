import { useEffect, useState } from "react";
import { INTRO, SPLASH } from "../engine/copy-guide";
import { AnimalIcon } from "./Animals";
import { Floaties } from "./Floaties";
import { Chevron, Shirt, TabForecast } from "./Icons";
import { CookieArt, Mark } from "./Mark";

/** The first-visit welcome: one page on BaZi, one on the app, then onboarding. */
export function Intro({ onDone }: { onDone: () => void }) {
  const [i, setI] = useState(0);
  const last = i === 1;
  const { bazi, app } = INTRO;
  const icons = [<Mark key="m" size={26} />, <Shirt key="s" size={22} />, <TabForecast key="f" size={22} />];

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

      {i === 0 ? (
        <article className="intro-card" key="bazi">
          <div className="intro-pillars" aria-hidden="true">
            {bazi.pillars.map((p) => (
              <div key={p.label} className="intro-pillar" data-el={p.element}>
                <span className="label">{p.label}</span>
                <AnimalIcon animal={p.animal} size={46} />
                <span className="intro-pillar-el">
                  <i className="dot" /> {p.element}
                </span>
              </div>
            ))}
          </div>
          <p className="eyebrow">{bazi.kicker}</p>
          <h1>{bazi.title}</h1>
          <p className="intro-body">{bazi.body}</p>
        </article>
      ) : (
        <article className="intro-card" key="app">
          <div className="intro-cookie">
            <CookieArt progress={0.5} open={false} />
          </div>
          <p className="eyebrow">{app.kicker}</p>
          <h1>{app.title}</h1>
          <ol className="intro-steps">
            {app.steps.map((t, k) => (
              <li key={t}>
                <span className="intro-step-ic">{icons[k]}</span>
                <span>{t}</span>
              </li>
            ))}
          </ol>
        </article>
      )}

      <div className="intro-nav">
        <div className="intro-dots" role="tablist" aria-label="Welcome pages">
          {[0, 1].map((k) => (
            <button key={k} type="button" role="tab" aria-selected={k === i} aria-label={k ? app.kicker : bazi.kicker} className={k === i ? "is-on" : ""} onClick={() => setI(k)} />
          ))}
        </div>
        <div className="intro-actions">
          {i > 0 ? (
            <button type="button" className="btn btn-quiet" onClick={() => setI(0)}>
              <Chevron dir="left" size={16} /> Back
            </button>
          ) : null}
          <button type="button" className="btn btn-cookie" onClick={() => (last ? onDone() : setI(1))}>
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
        <Mark size={84} />
      </span>
      <span className="wordmark splash-word">fortune cookie</span>
      <span className="splash-line">{line}</span>
    </button>
  );
}
