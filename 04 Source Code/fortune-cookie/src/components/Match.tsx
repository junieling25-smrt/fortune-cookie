import { useMemo, useState } from "react";
import { ANIMAL_INFO } from "../engine/copy-guide";
import { readChart, readMatch, validateBirth, type BirthDetails, type Profile } from "../engine/reading";
import { isBirthDetails, load, save } from "../lib";
import { DateFields, TimeFields } from "./DateTimeFields";
import { Close } from "./Icons";
import { PlaceField, type Place } from "./PlaceField";
import { ScoreRing } from "./Score";
import { Term } from "./Term";

type Person = { name: string; birth: BirthDetails };
const KEY = "fc.people";
const isPeople = (v: unknown): v is Person[] =>
  Array.isArray(v) && v.every((p) => p && typeof p === "object" && typeof (p as Person).name === "string" && isBirthDetails((p as Person).birth));

/** Compatibility with a partner, friend, or family member, from their birthday. */
export function MatchPage({ profile }: { profile: Profile }) {
  const [people, setPeople] = useState<Person[]>(() => load(KEY, isPeople) ?? []);
  const [current, setCurrent] = useState<Person | null>(people[0] ?? null);
  const [adding, setAdding] = useState(people.length === 0);
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [dateParts, setDateParts] = useState({ m: "", d: "", y: "" });
  const [time, setTime] = useState("");
  const [timeParts, setTimeParts] = useState({ h: "", min: "", pm: false });
  const [place, setPlace] = useState<Place | null>(null);
  const [error, setError] = useState<string | null>(null);

  const result = useMemo(() => (current ? readMatch(profile, readChart(current.birth), current.name) : null), [profile, current]);

  const add = () => {
    const mine = profile.birth;
    const birth: BirthDetails = {
      date,
      time: /^\d{2}:\d{2}$/.test(time) ? time : "",
      timeKnown: /^\d{2}:\d{2}$/.test(time),
      place: place?.place ?? mine.place,
      tz: place?.tz ?? mine.tz,
      lat: place?.lat ?? mine.lat,
      lon: place?.lon ?? mine.lon,
    };
    const e = validateBirth(birth);
    if (e) return setError(e.replace("your", "their").replace("Your", "Their"));
    const p = { name: name.trim().slice(0, 30) || "Them", birth };
    const next = [p, ...people.filter((x) => x.name !== p.name)].slice(0, 8);
    setPeople(next);
    save(KEY, next);
    setCurrent(p);
    setAdding(false);
    setError(null);
    setName("");
    setDate("");
    setDateParts({ m: "", d: "", y: "" });
    setTime("");
    setTimeParts({ h: "", min: "", pm: false });
    setPlace(null);
  };

  const remove = (p: Person) => {
    const next = people.filter((x) => x !== p);
    setPeople(next);
    save(KEY, next);
    if (current === p) setCurrent(next[0] ?? null);
    if (!next.length) setAdding(true);
  };

  return (
    <section className="page-body" aria-labelledby="match-title">
      <header className="page-head">
        <p className="eyebrow">Match</p>
        <h1 id="match-title">How do you two fit?</h1>
        <p className="lede">A partner, a friend, a sister. Add their birthday and see how your charts get along.</p>
      </header>

      {people.length ? (
        <div className="people">
          {people.map((p) => (
            <span key={p.name} className={`person-chip ${current === p ? "is-on" : ""}`}>
              <button type="button" onClick={() => (setCurrent(p), setAdding(false))}>
                {p.name}
              </button>
              <button type="button" className="person-x" aria-label={`Remove ${p.name}`} onClick={() => remove(p)}>
                <Close size={12} />
              </button>
            </span>
          ))}
          <button type="button" className="chip-btn" onClick={() => setAdding(true)}>
            + Add someone
          </button>
        </div>
      ) : null}

      {adding ? (
        <form
          className="block details"
          onSubmit={(e) => {
            e.preventDefault();
            add();
          }}
          noValidate
        >
          <label className="field-label">
            Their name
            <input className="field" value={name} maxLength={30} placeholder="Or a nickname" onChange={(e) => setName(e.target.value)} />
          </label>
          <div className="field-label">
            Their birthday
            <DateFields
              parts={dateParts}
              onParts={(p, iso) => {
                setDateParts(p);
                setDate(iso);
              }}
            />
          </div>
          <div className="field-label">
            Birth time <span className="muted">(optional)</span>
            <TimeFields
              parts={timeParts}
              onParts={(p, hhmm) => {
                setTimeParts(p);
                setTime(hhmm);
              }}
            />
          </div>
          <div className="field-label">
            Birthplace <span className="muted">(optional, we'll assume yours)</span>
            <PlaceField value={place} onChange={setPlace} />
          </div>
          {error ? (
            <p className="form-error" role="alert">
              {error}
            </p>
          ) : null}
          <div className="details-actions">
            <span className="hint">Saved only on this device.</span>
            <button type="submit" className="btn btn-cookie">
              See our match
            </button>
          </div>
        </form>
      ) : null}

      {result && !adding ? (
        <article className="block match" data-tone={result.tone}>
          <div className="match-top">
            <ScoreRing score={result.score} tone={result.tone} size={120} label={`Match with ${result.them.name}`} />
            <div>
              <p className="label">You and {result.them.name}</p>
              <p className="match-headline">{result.headline}</p>
              <p className="muted small">
                They're{" "}
                <Term tip={`Their core element is ${result.them.yang ? "Yang" : "Yin"} ${result.them.core}.`}>
                  {result.them.title.replace(/^The /, "a ")}
                </Term>
                , a {result.them.yearAnimal} ({(ANIMAL_INFO[result.them.yearAnimal]?.trait ?? "").toLowerCase()}).
              </p>
            </div>
          </div>
          <dl className="match-rows">
            {result.rows.map((r) => (
              <div key={r.label}>
                <dt className="label">{r.label}</dt>
                <dd>{r.text}</dd>
              </div>
            ))}
          </dl>
        </article>
      ) : null}
    </section>
  );
}
