import { useMemo, useRef, useState } from "react";
import { ANIMAL_INFO, ELEMENT_INFO, GLOSSARY, PILLAR_INFO } from "../engine/copy-guide";
import { CAREER_CTX, GROWTH_CTX, HOME_CTX, LOVE_CTX } from "../engine/copy-more";
import { ELEMENTS } from "../engine/pillars";
import {
  AREA_META,
  AREAS,
  validateBirth,
  type AreaId,
  type BirthDetails,
  type CareerCtx,
  type GrowthCtx,
  type HomeCtx,
  type LoveCtx,
  type Profile as ProfileT,
} from "../engine/reading";
import {
  downloadBlob,
  fmtBirthDate,
  fmtBirthTime,
  inFrame,
  reminderGoogleUrl,
  reminderIcs,
  reminderTimes,
  saveReminder,
  squareImage,
  type Reminder,
  type RepeatOn,
  type Saved,
} from "../lib";
import { AREA_ICON, Bell, Camera, Check } from "./Icons";
import { AnimalIcon } from "./Animals";
import { DateFields, hhmmToParts, isoToParts, TimeFields } from "./DateTimeFields";
import { Mark } from "./Mark";
import { Chips } from "./Onboarding";
import { PlaceField, type Place } from "./PlaceField";
import { Term } from "./Term";

export function Avatar({ url, name, size = 40 }: { url: string | null; name: string; size?: number }) {
  return (
    <span className="avatar" style={{ width: size, height: size }}>
      {url ? <img src={url} alt="" /> : name.trim() ? <span style={{ fontSize: size * 0.42 }}>{name.trim()[0].toUpperCase()}</span> : <Mark size={size * 0.62} />}
    </span>
  );
}

/** Year animal on its own row, since it's the zodiac sign people know; the other three below. */
export function Animals({ profile }: { profile: ProfileT }) {
  const [year, ...rest] = profile.pillars;
  const info = (k: string) => PILLAR_INFO.find((p) => p.key === k);
  return (
    <div className="animals">
      <article className="animal animal-year" data-el={year.element}>
        <AnimalIcon animal={year.animal} size={76} />
        <p className="label">Year animal · your zodiac sign</p>
        <p className="animal-name">{year.animal}</p>
        <p className="animal-el">
          <Term tip={`${GLOSSARY[year.yang ? "Yang" : "Yin"]} ${GLOSSARY[year.element]}`}>
            {year.yang ? "Yang" : "Yin"} {year.element}
          </Term>{" "}
          · {ANIMAL_INFO[year.animal]?.trait}
        </p>
        <p className="muted small">{info("year")?.text}</p>
      </article>
      <div className="animal-row">
        {rest.map((p) => (
          <article key={p.key} className={`animal ${p.known ? "" : "is-unknown"}`} data-el={p.known ? p.element : undefined}>
            <p className="label">
              {info(p.key)?.title}
              {p.key === "day" && p.known ? <span className="you-tag">You</span> : null}
            </p>
            {p.known ? <AnimalIcon animal={p.animal} size={40} /> : <span className="animal-unknown">?</span>}
            <p className="animal-name">{p.known ? p.animal : "?"}</p>
            <p className="animal-el">{p.known ? `${p.yang ? "Yang" : "Yin"} ${p.element}` : "Add a birth time"}</p>
            <p className="muted small">{info(p.key)?.text}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

export function ElementMix({ profile }: { profile: ProfileT }) {
  const peak = Math.max(...ELEMENTS.map((e) => profile.share[e]));
  return (
    <div className="mix">
      <ul className="bars">
        {ELEMENTS.map((e) => (
          <li key={e} data-el={e}>
            <span className="bar-name">
              <Term tip={GLOSSARY[e]}>{e}</Term>
            </span>
            <span className="bar-track">
              <span className="bar-fill" style={{ width: `${Math.max(3, (profile.share[e] / peak) * 100)}%` }} />
            </span>
            <span className="bar-val">{Math.round(profile.share[e] * 100)}%</span>
          </li>
        ))}
      </ul>
      <p className="small">
        <strong>Balancing element: {profile.helpful.element}.</strong> {ELEMENT_INFO[profile.helpful.element].colors}. {profile.helpful.ideas}
      </p>
    </div>
  );
}

function ReminderBox({ reminder, onChange }: { reminder: Reminder | null; onChange: (r: Reminder | null) => void }) {
  const [time, setTime] = useState(reminder?.time ?? "08:30");
  const [repeat, setRepeat] = useState<RepeatOn>(reminder?.repeat ?? "daily");
  const [added, setAdded] = useState(false);
  const groups = useMemo(reminderTimes, []);
  const r: Reminder = { time, repeat };
  const framed = inFrame();
  const commit = (next: Reminder) => {
    saveReminder(next);
    onChange(next);
  };

  return (
    <div className="reminder">
      <div className="reminder-row">
        <label className="field-label">
          Time
          <select className="field" value={time} onChange={(e) => setTime(e.target.value)}>
            {groups.map((g) => (
              <optgroup key={g.group} label={g.group}>
                {g.times.map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>
        <div className="field-label">
          Repeat
          <div className="chips">
            {(
              [
                ["daily", "Every day"],
                ["weekdays", "Weekdays"],
                ["weekends", "Weekends"],
              ] as [RepeatOn, string][]
            ).map(([v, l]) => (
              <button key={v} type="button" className={`chip-btn ${repeat === v ? "is-on" : ""}`} aria-pressed={repeat === v} onClick={() => setRepeat(v)}>
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="reminder-actions">
        {framed ? null : (
          <button
            type="button"
            className="btn btn-ink"
            onClick={() => {
              commit(r);
              downloadBlob(reminderIcs(r), "fortune-cookie-reminder.ics");
              setAdded(true);
            }}
          >
            <Bell /> Apple or Outlook calendar
          </button>
        )}
        <a className="btn btn-soft" href={reminderGoogleUrl(r)} target="_blank" rel="noreferrer" onClick={() => commit(r)}>
          Google Calendar
        </a>
      </div>
      <p className="hint">
        {added
          ? "Downloaded. Open the file to add it."
          : reminder
            ? `Saved: ${fmtBirthTime(reminder.time)}, ${reminder.repeat === "daily" ? "every day" : reminder.repeat}.`
            : "Your calendar does the reminding, so it works even when this page is closed."}
      </p>
    </div>
  );
}

export function ProfilePage({
  profile,
  saved,
  avatar,
  reminder,
  onAvatar,
  onSave,
  onReminder,
  onForget,
  forgetArmed,
}: {
  profile: ProfileT;
  saved: Saved;
  avatar: string | null;
  reminder: Reminder | null;
  onAvatar: (url: string | null) => void;
  onSave: (s: Saved) => void;
  onReminder: (r: Reminder | null) => void;
  onForget: () => void;
  forgetArmed: boolean;
}) {
  const { birth, person } = saved;
  const fileRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(person.name);
  const [date, setDate] = useState(birth.date);
  const [dateParts, setDateParts] = useState(() => isoToParts(birth.date));
  const [time, setTime] = useState(birth.timeKnown ? birth.time : "");
  const [timeParts, setTimeParts] = useState(() => hhmmToParts(birth.timeKnown ? birth.time : ""));
  const [timeKnown, setTimeKnown] = useState(birth.timeKnown);
  const [place, setPlace] = useState<Place | null>({ place: birth.place, tz: birth.tz, lat: birth.lat, lon: birth.lon });
  const [error, setError] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);

  const draft: BirthDetails = {
    date,
    time: timeKnown ? time : "",
    timeKnown,
    place: place?.place ?? "",
    tz: place?.tz ?? "",
    lat: place?.lat ?? NaN,
    lon: place?.lon ?? NaN,
  };
  const dirty = name.trim() !== person.name || JSON.stringify(draft) !== JSON.stringify({ ...birth, time: birth.timeKnown ? birth.time : "" });

  const say = (msg: string) => {
    setFlash(msg);
    window.setTimeout(() => setFlash(null), 2200);
  };

  const saveDetails = () => {
    const e = validateBirth(draft);
    setError(e);
    if (e) return;
    onSave({ birth: draft, person: { ...person, name: name.trim().slice(0, 30) } });
    say("Saved. Your readings are updated.");
  };

  const setPerson = (patch: Partial<Saved["person"]>) => onSave({ birth, person: { ...person, ...patch } });

  return (
    <section className="page-body profile" aria-labelledby="me-title">
      <header className="me-head">
        <button type="button" className="avatar-edit" onClick={() => fileRef.current?.click()} aria-label="Change profile photo">
          <Avatar url={avatar} name={person.name} size={88} />
          <span className="avatar-cam">
            <Camera size={15} />
          </span>
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          hidden
          onChange={async (e) => {
            const f = e.target.files?.[0];
            e.target.value = "";
            if (!f) return;
            try {
              onAvatar(await squareImage(f));
            } catch {
              say("That file didn't work. Try a JPG or PNG.");
            }
          }}
        />
        <div>
          <h1 id="me-title">{person.name || "You"}</h1>
          <p className="muted">
            {profile.core.title} · {profile.core.yang ? "Yang" : "Yin"} {profile.core.element} · {profile.pillars[0].animal} year
          </p>
          {avatar ? (
            <button type="button" className="link-btn" onClick={() => onAvatar(null)}>
              Remove photo
            </button>
          ) : null}
        </div>
      </header>
      {flash ? (
        <p className="flash" role="status">
          {flash}
        </p>
      ) : null}

      <section className="block">
        <h2 className="block-title">Your animals</h2>
        <Animals profile={profile} />
      </section>

      <section className="block">
        <h2 className="block-title">Your elements</h2>
        <ElementMix profile={profile} />
      </section>

      <section className="block" aria-labelledby="details-title">
        <h2 className="block-title" id="details-title">
          Your details
        </h2>
        <form
          className="details"
          onSubmit={(e) => {
            e.preventDefault();
            saveDetails();
          }}
          noValidate
        >
          <label className="field-label">
            Name
            <input className="field" value={name} maxLength={30} placeholder="Optional" onChange={(e) => setName(e.target.value)} />
          </label>
          <div className="field-label">
            Birthday
            <DateFields
              parts={dateParts}
              onParts={(p, iso) => {
                setDateParts(p);
                setDate(iso);
              }}
            />
          </div>
          <div className="field-label">
            Birth time
            <TimeFields
              parts={timeParts}
              disabled={!timeKnown}
              onParts={(p, hhmm) => {
                setTimeParts(p);
                setTime(hhmm);
              }}
            />
          </div>
          <label className="check">
            <input type="checkbox" checked={!timeKnown} onChange={(e) => setTimeKnown(!e.target.checked)} />
            <span>I don't know my birth time</span>
          </label>
          <div className="field-label">
            Birthplace
            <PlaceField value={place} onChange={setPlace} />
            {place ? <span className="hint">Time zone: {place.tz.replace(/_/g, " ")}</span> : null}
          </div>
          {error ? (
            <p className="form-error" role="alert">
              {error}
            </p>
          ) : null}
          <div className="details-actions">
            <span className="hint">
              Now: {fmtBirthDate(birth.date)}
              {birth.timeKnown ? `, ${fmtBirthTime(birth.time)}` : ""}, {birth.place}
            </span>
            <button type="submit" className="btn btn-cookie" disabled={!dirty}>
              Save changes
            </button>
          </div>
        </form>
      </section>

      <section className="block">
        <h2 className="block-title">What your cookie covers</h2>
        <div className="area-picks">
          {AREAS.map((a) => {
            const Icon = AREA_ICON[a];
            const on = person.interests.includes(a);
            return (
              <button
                key={a}
                type="button"
                className={`area-pick ${on ? "is-on" : ""}`}
                data-area={a}
                aria-pressed={on}
                onClick={() => {
                  const next = on ? person.interests.filter((x) => x !== a) : [...person.interests, a];
                  if (next.length) setPerson({ interests: AREAS.filter((x) => next.includes(x)) as AreaId[] });
                }}
              >
                <span className="area-icon area-icon-sm">
                  <Icon size={18} />
                </span>
                <span className="area-pick-text">
                  <strong>{AREA_META[a].title}</strong>
                </span>
                <span className="area-pick-box">{on ? <Check size={13} /> : null}</span>
              </button>
            );
          })}
        </div>
        <div className="about-qs">
          <Chips<CareerCtx> label="Work life" options={CAREER_CTX} value={person.career} onChange={(v) => setPerson({ career: v })} />
          <Chips<LoveCtx> label="Love life" options={LOVE_CTX} value={person.love} onChange={(v) => setPerson({ love: v })} />
          <Chips<HomeCtx> label="Who's at home" options={HOME_CTX} value={person.home} onChange={(v) => setPerson({ home: v })} />
          <Chips<GrowthCtx> label="Working on" options={GROWTH_CTX} value={person.growth} onChange={(v) => setPerson({ growth: v })} />
        </div>
      </section>

      <section className="block" id="reminder" aria-labelledby="remind-title">
        <h2 className="block-title" id="remind-title">
          Daily reminder
        </h2>
        <ReminderBox reminder={reminder} onChange={onReminder} />
      </section>

      <section className="block block-quiet">
        <h2 className="block-title">Privacy</h2>
        <p className="small muted">Everything stays on this device. No account, no server.</p>
        <button type="button" className={`btn btn-small ${forgetArmed ? "btn-danger" : "btn-soft"}`} onClick={onForget}>
          {forgetArmed ? "Tap again to erase everything" : "Forget me on this device"}
        </button>
      </section>
    </section>
  );
}
