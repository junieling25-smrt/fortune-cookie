import { useEffect, useMemo, useState } from "react";
import { ANIMAL_INFO } from "../engine/copy-guide";
import { MATCH_REL_LABEL, readChart, readMatch, validateBirth, type BirthDetails, type MatchRel, type Profile } from "../engine/reading";
import { inviteLink, isBirthDetails, load, save, type Invite } from "../lib";
import { DateFields, TimeFields } from "./DateTimeFields";
import { Close, Copy } from "./Icons";
import { MatchTutorial } from "./MatchTutorial";
import { PlaceField, type Place } from "./PlaceField";
import { ScoreRing } from "./Score";
import { Term } from "./Term";

type Person = { name: string; birth: BirthDetails; rel?: MatchRel };
const RELS: MatchRel[] = ["partner", "friend", "family", "work"];
const KEY = "fc.people";
const isPeople = (v: unknown): v is Person[] =>
  Array.isArray(v) && v.every((p) => p && typeof p === "object" && typeof (p as Person).name === "string" && isBirthDetails((p as Person).birth));

/** Compatibility with a partner, friend, or family member, from their birthday. */
/** Share your own details as a link. Whoever opens it sees your match right away. */
function InviteButton({ profile, label }: { profile: Profile; label: string }) {
  const [done, setDone] = useState(false);
  const send = async () => {
    const url = inviteLink(profile.person.name, profile.birth);
    const who = profile.person.name || "A friend";
    try {
      if (navigator.share && window.matchMedia?.("(pointer: coarse)").matches) {
        await navigator.share({ title: "Fortune Cookie match", text: `${who} wants to see how your charts fit.`, url });
      } else {
        await navigator.clipboard.writeText(url);
        setDone(true);
        window.setTimeout(() => setDone(false), 2000);
      }
    } catch {
      /* share sheet closed */
    }
  };
  return (
    <button type="button" className="btn btn-soft btn-small" onClick={send}>
      <Copy size={14} /> {done ? "Link copied" : label}
    </button>
  );
}

export function MatchPage({ profile, incoming, onIncoming }: { profile: Profile; incoming: Invite | null; onIncoming: () => void }) {
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
  const [invitedBy, setInvitedBy] = useState<string | null>(null);

  // Someone opened an invite link: add them and show the match straight away.
  useEffect(() => {
    if (!incoming) return;
    setPeople((list) => {
      const next = [incoming, ...list.filter((x) => x.name !== incoming.name)].slice(0, 8);
      save(KEY, next);
      return next;
    });
    setCurrent(incoming);
    setAdding(false);
    setInvitedBy(incoming.name);
    onIncoming();
  }, [incoming, onIncoming]);

  const [rel, setRel] = useState<MatchRel>("friend");
  const otherProfile = useMemo(() => (current ? readChart(current.birth) : null), [current]);
  const result = useMemo(
    () => (current && otherProfile ? readMatch(profile, otherProfile, current.name, current.rel ?? "friend") : null),
    [profile, otherProfile, current],
  );
  const [showChart, setShowChart] = useState(false);

  /** Change what someone is to you; the match is read again for that bond. */
  const setBond = (r: MatchRel) => {
    if (!current) return;
    const p = { ...current, rel: r };
    const next = people.map((x) => (x === current ? p : x));
    setPeople(next);
    save(KEY, next);
    setCurrent(p);
  };

  const relChips = (value: MatchRel, onPick: (r: MatchRel) => void) => (
    <div className="chips" role="radiogroup" aria-label="What they are to you">
      {RELS.map((r) => (
        <button key={r} type="button" role="radio" aria-checked={value === r} className={`chip-btn ${value === r ? "is-on" : ""}`} onClick={() => onPick(r)}>
          {MATCH_REL_LABEL[r]}
        </button>
      ))}
    </div>
  );

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
    const p = { name: name.trim().slice(0, 30) || "Them", birth, rel };
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

      {invitedBy ? <p className="invite-banner">{invitedBy} sent you an invite. Here's how your charts fit.</p> : null}

      <div className="block invite">
        <div className="invite-row">
          <p className="label">Easier: send a link</p>
          <InviteButton profile={profile} label="Copy my invite link" />
        </div>
        <p className="hint">Whoever opens it sees your match with them, no typing needed. The link carries your birthday and birthplace, so share it only with people you trust.</p>
      </div>

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
          <div className="field-label">
            They are your
            {relChips(rel, setRel)}
          </div>
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
                  {result.them.title.replace(/^The (?=[AEIOU])/, "an ").replace(/^The /, "a ")}
                </Term>
                , a {result.them.yearAnimal} ({(ANIMAL_INFO[result.them.yearAnimal]?.trait ?? "").toLowerCase()}).
              </p>
            </div>
          </div>
          <button type="button" className="match-chart-toggle" aria-expanded={showChart} onClick={() => setShowChart((open) => !open)}>
            <span className="match-chart-glyph" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="22" height="22">
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="5.5" />
                <line x1="12" y1="2" x2="18.5" y2="16.5" />
                <circle cx="12" cy="2" r="2" className="dot-a" />
                <circle cx="18.5" cy="16.5" r="2" className="dot-b" />
              </svg>
            </span>
            {showChart ? "Hide chart" : "See how your charts connect"}
            <span className="match-chart-chev" aria-hidden="true" />
          </button>
          {showChart ? <MatchTutorial key={current?.name} result={result} onClose={() => setShowChart(false)} /> : null}
          <div className="match-bond">
            <span className="label">They are your</span>
            {relChips(result.rel, setBond)}
          </div>
          <dl className="match-rows">
            {result.rows.map((r) => (
              <div key={r.label}>
                <dt className="label">{r.label}</dt>
                <dd>{r.text}</dd>
              </div>
            ))}
          </dl>
          <section className="bridge" data-el={result.bridge.element}>
            <p className="label">Bring it closer</p>
            <p className="bridge-score">
              <span>Now {result.score}</span>
              <span aria-hidden="true">→</span>
              <strong>
                {result.bridge.score} with more <Term tip={result.bridge.text}>{result.bridge.element}</Term>
              </strong>
            </p>
            <p className="muted small">{result.bridge.text}</p>
            <ul className="bridge-ideas">
              {result.bridge.ideas.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </section>
          <div className="invite-row">
            <span className="muted small">Want {result.them.name} to see this too?</span>
            <InviteButton profile={profile} label={`Send ${result.them.name} my link`} />
          </div>
        </article>
      ) : null}
    </section>
  );
}
