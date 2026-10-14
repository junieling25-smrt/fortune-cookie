import { useEffect, useRef, useState } from "react";
import { CAREER_CTX, GROWTH_CTX, HOME_CTX, LOVE_CTX } from "../engine/copy-more";
import { AREAS, validateBirth, type BirthDetails, type CareerCtx, type GrowthCtx, type HomeCtx, type LoveCtx, type Person } from "../engine/reading";
import type { Saved } from "../lib";
import { DateFields, TimeFields, hhmmToParts, isoToParts } from "./DateTimeFields";
import { Check, Chevron } from "./Icons";
import { Floaties } from "./Floaties";
import { CookieArt, Mark } from "./Mark";
import { PlaceField, type Place } from "./PlaceField";

const STEPS = ["welcome", "name", "date", "time", "place", "about"] as const;
type StepId = (typeof STEPS)[number];
const CRACK_STEPS = STEPS.length - 1; // the welcome screen doesn't crack anything

/** Multi-select chips, shared with the profile page. */
export function Chips<T extends string>({ label, options, value, onChange }: { label: string; options: Record<T, string>; value: T[]; onChange: (v: T[]) => void }) {
  return (
    <fieldset className="chips-q">
      <legend>
        {label} <span className="muted">· pick any that fit</span>
      </legend>
      <div className="chips">
        {(Object.keys(options) as T[]).map((k) => {
          const on = value.includes(k);
          return (
            <button
              key={k}
              type="button"
              className={`chip-btn ${on ? "is-on" : ""}`}
              aria-pressed={on}
              onClick={() => onChange(on ? value.filter((x) => x !== k) : [...value, k])}
            >
              {on ? <Check size={12} /> : null}
              {options[k]}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export function Onboarding({ initial, onDone, onCancel }: { initial: Saved | null; onDone: (s: Saved) => void; onCancel?: () => void }) {
  const p0 = initial?.person;
  // Step 0 (the old welcome) is covered by the intro cards, so onboarding starts at 1.
  const [step, setStep] = useState(1);
  const [name, setName] = useState(p0?.name ?? "");
  const [dateParts, setDateParts] = useState(isoToParts(initial?.birth.date ?? ""));
  const [date, setDate] = useState(initial?.birth.date ?? "");
  const [timeParts, setTimeParts] = useState(hhmmToParts(initial?.birth.timeKnown ? initial.birth.time : ""));
  const [time, setTime] = useState(initial?.birth.timeKnown ? initial.birth.time : "");
  const [timeKnown, setTimeKnown] = useState(initial?.birth.timeKnown ?? true);
  const [place, setPlace] = useState<Place | null>(initial ? { place: initial.birth.place, tz: initial.birth.tz, lat: initial.birth.lat, lon: initial.birth.lon } : null);
  const [career, setCareer] = useState<CareerCtx[]>(p0?.career ?? []);
  const [love, setLove] = useState<LoveCtx[]>(p0?.love ?? []);
  const [home, setHome] = useState<HomeCtx[]>(p0?.home ?? []);
  const [growth, setGrowth] = useState<GrowthCtx[]>(p0?.growth ?? []);
  const [error, setError] = useState<string | null>(null);
  const [opening, setOpening] = useState(false);
  const [wobble, setWobble] = useState(0);
  const cardRef = useRef<HTMLFormElement>(null);

  const id: StepId = STEPS[step];
  const progress = opening ? 1 : Math.max(0, step - 1) / CRACK_STEPS;

  useEffect(() => {
    if (step === 0) return;
    cardRef.current?.querySelector<HTMLElement>("input:not([type=checkbox])")?.focus({ preventScroll: true });
  }, [step]);

  const birth = (): BirthDetails => ({
    date,
    time: timeKnown ? time : "",
    timeKnown,
    place: place?.place ?? "",
    tz: place?.tz ?? "",
    lat: place?.lat ?? NaN,
    lon: place?.lon ?? NaN,
  });

  const problem = (): string | null => {
    if (id === "date") {
      if (!date) return "Add your birthday as month, day, and a four-digit year.";
      const [y, m, d] = date.split("-").map(Number);
      const real = new Date(Date.UTC(y, m - 1, d));
      if (real.getUTCMonth() !== m - 1 || real.getUTCDate() !== d) return "That date doesn't exist. Check the month and day.";
      return validateBirth({ ...birth(), timeKnown: false, tz: "UTC", lat: 0, lon: 0 });
    }
    if (id === "time" && timeKnown && !time) return "Add an hour and two-digit minutes, or tick “I don't know my birth time”.";
    if (id === "place" && !place) return "Pick your birthplace from the list so we know its time zone.";
    return null;
  };

  const next = () => {
    const e = problem();
    setError(e);
    if (e) return;
    if (step < STEPS.length - 1) {
      setStep(step + 1);
      if (step > 0) setWobble((w) => w + 1);
      return;
    }
    const b = birth();
    const final = validateBirth(b);
    if (final) {
      setError(final);
      return;
    }
    const person: Person = { name: name.trim().slice(0, 30), interests: [...AREAS], career, love, home, growth };
    setOpening(true);
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    window.setTimeout(() => onDone({ birth: b, person }), reduce ? 200 : 1900);
  };

  const back = () => {
    setError(null);
    if (step > 1) setStep(step - 1);
    else onCancel?.();
  };

  const title: Record<StepId, string> = {
    welcome: "Crack open your day.",
    name: initial ? "Want to change anything?" : "Hi! What should we call you?",
    date: "When's your birthday?",
    time: "What time were you born?",
    place: "Where were you born?",
    about: "A little more about you",
  };
  const sub: Record<StepId, string> = {
    welcome: "Answer five quick questions and your cookie cracks open, one step at a time. Inside: a daily fortune for your growth, work, love life, and home.",
    name: "Optional. Your name only lives on this device.",
    date: "Month, day, then year. Your year animal starts here.",
    time: "The time on your birth record. It sets your fourth animal.",
    place: "Type your town, or find it on the map. We use it for sun time.",
    about: "All optional. Pick as many answers as fit; each one makes your readings feel more like yours.",
  };

  return (
    <div className={`onboard ${opening ? "is-opening" : ""} ${id === "welcome" ? "is-welcome" : ""}`}>
      <Floaties />
      <header className="onboard-top">
        <span className="brand">
          <Mark size={30} />
          <span className="wordmark">fortune cookie</span>
        </span>
        {onCancel ? (
          <button type="button" className="btn btn-quiet btn-small" onClick={onCancel}>
            Cancel
          </button>
        ) : step > 0 ? (
          <span className="step-count">
            {step} of {CRACK_STEPS}
          </span>
        ) : (
          <span />
        )}
      </header>

      <div className="onboard-stage">
        <div className="onboard-cookie" key={wobble}>
          <CookieArt progress={progress} open={opening} />
          <span className="crumbs" aria-hidden="true">
            {step > 1 && !opening ? Array.from({ length: 4 }, (_, i) => <i key={i} style={{ left: `${40 + i * 6}%`, animationDelay: `${i * 0.07}s` }} />) : null}
          </span>
        </div>
        {step > 0 ? (
          <div className="onboard-progress" aria-hidden="true">
            {STEPS.slice(1).map((s, i) => (
              <i key={s} className={i < step - 1 || opening ? "is-done" : i === step - 1 ? "is-now" : ""} />
            ))}
          </div>
        ) : null}
        {opening ? <p className="onboard-reveal">Your fortune is out{name.trim() ? `, ${name.trim()}` : ""}!</p> : null}
      </div>

      {!opening ? (
        <form
          className={`onboard-card ${id === "welcome" ? "onboard-welcome" : ""}`}
          ref={cardRef}
          onSubmit={(e) => {
            e.preventDefault();
            next();
          }}
          noValidate
        >
          <h1>{title[id]}</h1>
          <p className="onboard-sub">{sub[id]}</p>

          {id === "name" ? (
            <input id="ob-name" className="field field-big" type="text" autoComplete="given-name" placeholder="Your first name or a nickname" value={name} maxLength={30} onChange={(e) => setName(e.target.value)} />
          ) : null}

          {id === "date" ? (
            <DateFields
              parts={dateParts}
              onParts={(p, iso) => {
                setDateParts(p);
                setDate(iso);
              }}
            />
          ) : null}

          {id === "time" ? (
            <div className="stack">
              <TimeFields
                parts={timeParts}
                disabled={!timeKnown}
                onParts={(p, hhmm) => {
                  setTimeParts(p);
                  setTime(hhmm);
                }}
              />
              <label className="check" htmlFor="ob-time-unknown">
                <input id="ob-time-unknown" type="checkbox" checked={!timeKnown} onChange={(e) => setTimeKnown(!e.target.checked)} />
                <span>I don't know my birth time. We'll read three pillars instead of four.</span>
              </label>
            </div>
          ) : null}

          {id === "place" ? (
            <div className="stack">
              <PlaceField value={place} onChange={setPlace} />
              <p className="hint">{place ? `Time zone: ${place.tz.replace(/_/g, " ")}` : "About 49,000 places. Try “Shaoyang, Hunan” or “Portland, Oregon”, or tap the map."}</p>
            </div>
          ) : null}

          {id === "about" ? (
            <div className="about-qs">
              <Chips label="Work life right now" options={CAREER_CTX} value={career} onChange={setCareer} />
              <Chips label="Love life right now" options={LOVE_CTX} value={love} onChange={setLove} />
              <Chips label="Who's at home?" options={HOME_CTX} value={home} onChange={setHome} />
              <Chips label="What are you working on?" options={GROWTH_CTX} value={growth} onChange={setGrowth} />
            </div>
          ) : null}

          {error ? (
            <p className="form-error" role="alert">
              {error}
            </p>
          ) : null}

          <div className="onboard-actions">
            {step > 1 || onCancel ? (
              <button type="button" className="btn btn-quiet" onClick={back}>
                <Chevron dir="left" size={16} /> Back
              </button>
            ) : (
              <span />
            )}
            <button type="submit" className="btn btn-cookie">
              {id === "welcome" ? "Let's begin" : step === STEPS.length - 1 ? (initial ? "Save and crack" : "Crack my cookie") : id === "name" && !name.trim() ? "Skip" : "Next"}
            </button>
          </div>
          {id === "welcome" ? <p className="privacy">No account, no server. Everything is worked out in your browser.</p> : null}
        </form>
      ) : null}
    </div>
  );
}
