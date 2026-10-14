import { useEffect, useRef, useState } from "react";
import { CAREER_CTX, GROWTH_CTX, HOME_CTX, LOVE_CTX } from "../engine/copy-more";
import {
  AREA_META,
  AREAS,
  DEFAULT_PERSON,
  validateBirth,
  type AreaId,
  type BirthDetails,
  type CareerCtx,
  type GrowthCtx,
  type HomeCtx,
  type LoveCtx,
  type Person,
} from "../engine/reading";
import type { Saved } from "../lib";
import { Floaties } from "./Floaties";
import { AREA_ICON, Check, Chevron } from "./Icons";
import { CookieArt, Mark } from "./Mark";
import { PlaceField, type Place } from "./PlaceField";

const STEPS = ["name", "date", "time", "place", "areas", "about"] as const;
type StepId = (typeof STEPS)[number];

export function Chips<T extends string>({
  label,
  options,
  value,
  multi,
  onChange,
}: {
  label: string;
  options: Record<T, string>;
  value: T[];
  multi?: boolean;
  onChange: (v: T[]) => void;
}) {
  return (
    <fieldset className="chips-q">
      <legend>{label}</legend>
      <div className="chips">
        {(Object.keys(options) as T[]).map((k) => {
          const on = value.includes(k);
          return (
            <button
              key={k}
              type="button"
              className={`chip-btn ${on ? "is-on" : ""}`}
              aria-pressed={on}
              onClick={() => {
                if (multi) onChange(on ? value.filter((x) => x !== k) : [...value, k]);
                else onChange(on ? [] : [k]);
              }}
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

export function Onboarding({
  initial,
  onDone,
  onCancel,
}: {
  initial: Saved | null;
  onDone: (s: Saved) => void;
  onCancel?: () => void;
}) {
  const p0 = initial?.person ?? { ...DEFAULT_PERSON, interests: [] };
  const [step, setStep] = useState(0);
  const [name, setName] = useState(p0.name);
  const [date, setDate] = useState(initial?.birth.date ?? "");
  const [time, setTime] = useState(initial?.birth.timeKnown ? initial.birth.time : "");
  const [timeKnown, setTimeKnown] = useState(initial?.birth.timeKnown ?? true);
  const [place, setPlace] = useState<Place | null>(
    initial ? { place: initial.birth.place, tz: initial.birth.tz, lat: initial.birth.lat, lon: initial.birth.lon } : null
  );
  const [interests, setInterests] = useState<AreaId[]>(p0.interests);
  const [career, setCareer] = useState<CareerCtx[]>(p0.career ? [p0.career] : []);
  const [love, setLove] = useState<LoveCtx[]>(p0.love ? [p0.love] : []);
  const [home, setHome] = useState<HomeCtx[]>(p0.home);
  const [growth, setGrowth] = useState<GrowthCtx[]>(p0.growth ? [p0.growth] : []);
  const [error, setError] = useState<string | null>(null);
  const [opening, setOpening] = useState(false);
  const [wobble, setWobble] = useState(0);
  const cardRef = useRef<HTMLFormElement>(null);

  const id: StepId = STEPS[step];
  const progress = opening ? 1 : step / STEPS.length;

  useEffect(() => {
    const el = cardRef.current?.querySelector<HTMLElement>("input:not([type=checkbox]), button.area-pick");
    el?.focus({ preventScroll: true });
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
      const e = validateBirth({ ...birth(), timeKnown: false, tz: "UTC", lat: 0, lon: 0 });
      return e;
    }
    if (id === "time" && timeKnown && !/^\d{2}:\d{2}$/.test(time)) return "Add a time, or tick “I don't know my birth time”.";
    if (id === "place" && !place) return "Pick your birthplace from the list so we know its time zone.";
    if (id === "areas" && interests.length === 0) return "Pick at least one. You can change it later.";
    return null;
  };

  const next = () => {
    const e = problem();
    setError(e);
    if (e) return;
    if (step < STEPS.length - 1) {
      setStep(step + 1);
      setWobble((w) => w + 1);
      return;
    }
    const b = birth();
    const final = validateBirth(b);
    if (final) {
      setError(final);
      return;
    }
    const person: Person = {
      name: name.trim().slice(0, 30),
      interests: AREAS.filter((a) => interests.includes(a)),
      career: career[0] ?? null,
      love: love[0] ?? null,
      home,
      growth: growth[0] ?? null,
    };
    setOpening(true);
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    window.setTimeout(() => onDone({ birth: b, person }), reduce ? 200 : 1500);
  };

  const back = () => {
    setError(null);
    if (step > 0) setStep(step - 1);
    else onCancel?.();
  };

  const title: Record<StepId, string> = {
    name: initial ? "Want to change anything?" : "Hi! What should we call you?",
    date: "When's your birthday?",
    time: "What time were you born?",
    place: "Where were you born?",
    areas: "What should your fortune cover?",
    about: "A little more about you",
  };
  const sub: Record<StepId, string> = {
    name: "Optional. Your name only lives on this device.",
    date: "The full date, year included. Your year animal starts here.",
    time: "The time on your birth record. It sets your fourth animal.",
    place: "Type your town, or find it on the map. We use it for sun time.",
    areas: "Pick as many as you like. We'll put these first.",
    about: "All optional, and each answer makes your readings feel more like yours.",
  };

  return (
    <div className={`onboard ${opening ? "is-opening" : ""}`}>
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
        ) : (
          <span className="step-count">
            {Math.min(step + 1, STEPS.length)} of {STEPS.length}
          </span>
        )}
      </header>

      <div className="onboard-stage">
        <div className="onboard-cookie" key={wobble}>
          <CookieArt progress={progress} open={opening} />
          <span className="crumbs" aria-hidden="true">
            {step > 0 && !opening ? Array.from({ length: 3 }, (_, i) => <i key={i} style={{ left: `${44 + i * 6}%`, animationDelay: `${i * 0.08}s` }} />) : null}
          </span>
        </div>
        <div className="onboard-progress" aria-hidden="true">
          {STEPS.map((s, i) => (
            <i key={s} className={i < step || opening ? "is-done" : i === step ? "is-now" : ""} />
          ))}
        </div>
        {opening ? <p className="onboard-reveal">Your fortune is out{name.trim() ? `, ${name.trim()}` : ""}!</p> : null}
      </div>

      {!opening ? (
        <form
          className="onboard-card"
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
            <input
              id="ob-name"
              className="field field-big"
              type="text"
              autoComplete="given-name"
              placeholder="Your first name or a nickname"
              value={name}
              maxLength={30}
              onChange={(e) => setName(e.target.value)}
            />
          ) : null}

          {id === "date" ? (
            <input id="ob-date" className="field field-big" type="date" min="1902-01-01" max="2099-12-31" value={date} onChange={(e) => setDate(e.target.value)} aria-label="Date of birth" />
          ) : null}

          {id === "time" ? (
            <div className="stack">
              <input
                id="ob-time"
                className="field field-big"
                type="time"
                value={time}
                disabled={!timeKnown}
                onChange={(e) => setTime(e.target.value)}
                aria-label="Time of birth"
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
              {place ? <p className="hint">Time zone: {place.tz.replace(/_/g, " ")}</p> : null}
            </div>
          ) : null}

          {id === "areas" ? (
            <div className="area-picks">
              {AREAS.map((a) => {
                const Icon = AREA_ICON[a];
                const on = interests.includes(a);
                return (
                  <button
                    key={a}
                    type="button"
                    className={`area-pick ${on ? "is-on" : ""}`}
                    data-area={a}
                    aria-pressed={on}
                    onClick={() => setInterests(on ? interests.filter((x) => x !== a) : [...interests, a])}
                  >
                    <span className="area-icon">
                      <Icon size={22} />
                    </span>
                    <span className="area-pick-text">
                      <strong>{AREA_META[a].title}</strong>
                      <small>{AREA_META[a].covers}</small>
                    </span>
                    <span className="area-pick-box">{on ? <Check size={13} /> : null}</span>
                  </button>
                );
              })}
            </div>
          ) : null}

          {id === "about" ? (
            <div className="about-qs">
              {interests.includes("career") ? <Chips label="Work life right now" options={CAREER_CTX} value={career} onChange={setCareer} /> : null}
              {interests.includes("love") ? <Chips label="Love life right now" options={LOVE_CTX} value={love} onChange={setLove} /> : null}
              {interests.includes("family") ? <Chips label="Who's at home? Pick all that apply" options={HOME_CTX} value={home} multi onChange={setHome} /> : null}
              {interests.includes("growth") ? <Chips label="What are you working on?" options={GROWTH_CTX} value={growth} onChange={setGrowth} /> : null}
            </div>
          ) : null}

          {error ? (
            <p className="form-error" role="alert">
              {error}
            </p>
          ) : null}

          <div className="onboard-actions">
            {step > 0 || onCancel ? (
              <button type="button" className="btn btn-quiet" onClick={back}>
                <Chevron dir="left" size={16} /> Back
              </button>
            ) : (
              <span />
            )}
            <button type="submit" className="btn btn-cookie">
              {step === STEPS.length - 1 ? (initial ? "Save and crack" : "Crack my cookie") : id === "name" && !name.trim() ? "Skip" : "Next"}
            </button>
          </div>
          {step === 0 && !initial ? <p className="privacy">No account, no server. Everything is worked out in your browser.</p> : null}
        </form>
      ) : null}
    </div>
  );
}
