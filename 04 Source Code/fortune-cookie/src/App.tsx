import { useEffect, useMemo, useState } from "react";
import { Areas } from "./components/Areas";
import { BiggerPicture } from "./components/BiggerPicture";
import { ComeBack } from "./components/ComeBack";
import { HowPage } from "./components/HowPage";
import { ArrowRight } from "./components/Icons";
import { Mark } from "./components/Mark";
import { Onboarding } from "./components/Onboarding";
import { Today, type CheckIn } from "./components/Today";
import { describeCity, findCity } from "./engine/cities";
import { AREAS, DEFAULT_PERSON, readChart, readDay, tomorrowTeaser, validateBirth, type AreaId, type Person } from "./engine/reading";
import {
  crackedDays,
  forgetEverything,
  isSaved,
  load,
  loadSteps,
  localToday,
  markCracked,
  save,
  saveSteps,
  shiftDate,
  streakInfo,
  type Saved,
} from "./lib";

const STORE_KEY = "fc.profile.v2";
const DISMISS_KEY = "fc.checkin.dismissed";

/**
 * Optional link parameters, for demos and screenshots:
 * ?d=1994-03-17&t=07:42&city=San%20Francisco&day=2026-09-24&name=Maya
 *  &areas=career,love&career=job&love=partnered&home=cat,kids&growth=calm&sealed=1
 */
function fromLink(): { saved: Saved | null; day: string | null; sealed: boolean } {
  try {
    const q = new URLSearchParams(window.location.search);
    const day = /^\d{4}-\d{2}-\d{2}$/.test(q.get("day") ?? "") ? q.get("day") : null;
    const city = q.get("city") ? findCity(q.get("city") as string) : undefined;
    const sealed = q.get("sealed") === "1";
    if (!q.get("d") || !city) return { saved: null, day, sealed };
    const t = q.get("t") ?? "";
    const birth = { date: q.get("d") as string, time: t, timeKnown: /^\d{2}:\d{2}$/.test(t), place: describeCity(city), tz: city.tz, lat: city.lat, lon: city.lon };
    const list = (k: string) => (q.get(k) ?? "").split(",").filter(Boolean);
    const areas = list("areas").filter((a): a is AreaId => (AREAS as string[]).includes(a));
    const person = {
      ...DEFAULT_PERSON,
      name: q.get("name") ?? "",
      interests: areas.length ? areas : [...AREAS],
      career: q.get("career") || null,
      love: q.get("love") || null,
      home: list("home"),
      growth: q.get("growth") || null,
    } as Person;
    return { saved: validateBirth(birth) ? null : { birth, person }, day, sealed };
  } catch {
    return { saved: null, day: null, sealed: false };
  }
}

const route = () => (window.location.hash === "#how" ? "how" : "main");

export function App() {
  const link = useMemo(fromLink, []);
  const [saved, setSaved] = useState<Saved | null>(() => link.saved ?? load(STORE_KEY, isSaved));
  const [editing, setEditing] = useState(false);
  const [page, setPage] = useState(route);
  const [today, setToday] = useState(localToday);
  const [date, setDate] = useState(() => link.day ?? localToday());
  const [cracked, setCracked] = useState(crackedDays);
  const [done, setDone] = useState<string[]>(() => loadSteps(link.day ?? localToday()));
  const [yDone, setYDone] = useState<string[]>(() => loadSteps(shiftDate(localToday(), -1)));
  const [dismissed, setDismissed] = useState(() => load(DISMISS_KEY, (v): v is string => typeof v === "string"));
  const [revealing, setRevealing] = useState(false);
  const [forgetArmed, setForgetArmed] = useState(false);

  useEffect(() => {
    const onHash = () => {
      setPage(route());
      window.scrollTo(0, 0);
    };
    const onFocus = () => setToday(localToday());
    window.addEventListener("hashchange", onHash);
    window.addEventListener("focus", onFocus);
    return () => {
      window.removeEventListener("hashchange", onHash);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  useEffect(() => setDone(loadSteps(date)), [date]);

  const profile = useMemo(() => (saved ? readChart(saved.birth, saved.person) : null), [saved]);
  const reading = useMemo(() => (profile ? readDay(profile, date) : null), [profile, date]);
  const teaser = useMemo(() => (profile ? tomorrowTeaser(profile, shiftDate(today, 1)) : null), [profile, today]);
  const streak = streakInfo(cracked, today);

  const yesterday = shiftDate(today, -1);
  const checkIn: CheckIn = useMemo(() => {
    if (!profile || date !== today || dismissed === today || !cracked.includes(yesterday)) return null;
    const y = readDay(profile, yesterday);
    const items = [
      ...y.areas.filter((a) => a.interested && !yDone.includes(a.id)).map((a) => ({ id: a.id, label: a.title, text: a.step })),
      ...(yDone.includes("try") ? [] : [{ id: "try", label: "Try this", text: y.overall.try }]),
    ].slice(0, 3);
    return items.length ? { date: yesterday, items } : null;
  }, [profile, date, today, dismissed, cracked, yesterday, yDone]);

  const finishOnboarding = (s: Saved) => {
    setSaved(s);
    if (!link.saved) save(STORE_KEY, s);
    setCracked(markCracked(localToday()));
    setDate(localToday());
    setEditing(false);
    setRevealing(true);
    window.scrollTo(0, 0);
    window.setTimeout(() => setRevealing(false), 1200);
  };

  const toggleStep = (id: string) => {
    const next = done.includes(id) ? done.filter((x) => x !== id) : [...done, id];
    setDone(next);
    saveSteps(date, next);
  };

  const forget = () => {
    if (!forgetArmed) {
      setForgetArmed(true);
      window.setTimeout(() => setForgetArmed(false), 4000);
      return;
    }
    forgetEverything();
    setSaved(null);
    setCracked([]);
    setDone([]);
    setForgetArmed(false);
    window.location.hash = "";
  };

  if (!saved || !profile || !reading || !teaser) return <Onboarding initial={null} onDone={finishOnboarding} />;
  if (editing) return <Onboarding initial={saved} onDone={finishOnboarding} onCancel={() => setEditing(false)} />;

  const sealed = date === today && !cracked.includes(today) && !(link.saved && !link.sealed);
  const goHow = () => {
    window.location.hash = "how";
  };
  const goHome = () => {
    history.pushState("", document.title, window.location.pathname + window.location.search);
    setPage("main");
    window.scrollTo(0, 0);
  };

  return (
    <div className={`page ${revealing ? "is-revealing" : ""}`}>
      <header className="topbar">
        <button type="button" className="brand" onClick={goHome} aria-label="Fortune Cookie, today's reading">
          <Mark size={36} />
          <span className="wordmark">fortune cookie</span>
        </button>
        <nav className="topnav" aria-label="Main">
          <span className="streak-chip" title={`${streak.total} cookies cracked`}>
            <Mark size={18} />
            <strong>{streak.streak}</strong>
            <span>day streak</span>
          </span>
          <button type="button" className="topnav-link" onClick={() => setEditing(true)}>
            Your details
          </button>
          <button type="button" className={`topnav-link nav-how ${page === "how" ? "is-on" : ""}`} onClick={goHow}>
            How it works
          </button>
        </nav>
      </header>

      {page === "how" ? (
        <HowPage profile={profile} reading={reading} onBack={goHome} />
      ) : (
        <main id="top">
          <Today
            profile={profile}
            reading={reading}
            sealed={sealed}
            onCrack={() => setCracked(markCracked(today))}
            onDateChange={setDate}
            tryDone={done.includes("try")}
            onToggleTry={() => toggleStep("try")}
            checkIn={checkIn}
            onCheckIn={(id) => {
              const next = [...yDone, id];
              setYDone(next);
              saveSteps(yesterday, next);
            }}
            onDismissCheckIn={() => {
              setDismissed(today);
              save(DISMISS_KEY, today);
            }}
          />
          <Areas reading={reading} done={done.filter((d) => d !== "try")} tryDone={done.includes("try")} onToggle={toggleStep} />
          <ComeBack streak={streak} teaser={teaser} />
          <BiggerPicture
            profile={profile}
            date={date}
            onPick={(d) => {
              setDate(d);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        </main>
      )}

      <footer className="closing">
        <div className="closing-inner">
          <Mark size={64} detail />
          <p className="closing-line">
            We describe the weather.
            <br />
            <em>You choose the route.</em>
          </p>
          {page === "how" ? (
            <button type="button" className="btn btn-cookie" onClick={goHome}>
              Back to today's fortune
            </button>
          ) : (
            <button type="button" className="how-link" onClick={goHow}>
              How Fortune Cookie works, and the math behind your chart <ArrowRight />
            </button>
          )}
        </div>
        <p className="fineprint">
          Fortune Cookie is a prototype for reflection and fun. It describes conditions, never outcomes, and it isn't advice for health, money, or
          legal decisions.{" "}
          <button type="button" className="link-btn link-btn-night" onClick={forget}>
            {forgetArmed ? "Tap again to erase everything" : "Forget me"}
          </button>
        </p>
      </footer>
    </div>
  );
}
