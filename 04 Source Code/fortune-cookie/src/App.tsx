import { useCallback, useEffect, useMemo, useState } from "react";
import { BiggerPicture } from "./components/BiggerPicture";
import { HowPage } from "./components/HowPage";
import { Floaties } from "./components/Floaties";
import { Book, TabForecast, TabMap, TabMatch, TabYou } from "./components/Icons";
import { Intro, Splash } from "./components/Intro";
import { Mark } from "./components/Mark";
import { MatchPage } from "./components/Match";
import { MeaningPage } from "./components/Meaning";
import { Onboarding } from "./components/Onboarding";
import { Avatar, ProfilePage } from "./components/Profile";
import { Today, type CheckIn } from "./components/Today";
import { Tour } from "./components/Tour";
import { WalkPage } from "./components/Walk";
import { SkyToggle } from "./components/Sky";
import { describeCity, findCity, loadCities } from "./engine/cities";
import { AREAS, DEFAULT_PERSON, readChart, readDay, tomorrowTeaser, validateBirth, type AreaId, type Person } from "./engine/reading";
import {
  crackedDays,
  forgetEverything,
  introSeen,
  isSaved,
  load,
  loadAvatar,
  loadReminder,
  loadSteps,
  localToday,
  markCracked,
  markIntroSeen,
  normalizeSaved,
  readInvite,
  save,
  saveAvatar,
  saveSteps,
  shiftDate,
  streakInfo,
  type Invite,
  type Saved,
} from "./lib";

const STORE_KEY = "fc.profile.v2";
const DISMISS_KEY = "fc.checkin.dismissed";
const TOUR_KEY = "fc.tour";

type Link = { saved: Saved | null; day: string | null; sealed: boolean };

/**
 * Optional link parameters, for demos and screenshots:
 * ?d=1994-03-17&t=07:42&city=San%20Francisco&day=2026-09-24&name=Maya
 *  &areas=career,love&career=job&love=partnered&home=cat,kids&growth=calm&sealed=1
 */
const linkQuery = () => {
  try {
    return new URLSearchParams(window.location.search);
  } catch {
    return new URLSearchParams();
  }
};
const hasLink = () => !!linkQuery().get("d");

function fromLink(): Link {
  const q = linkQuery();
  const day = /^\d{4}-\d{2}-\d{2}$/.test(q.get("day") ?? "") ? q.get("day") : null;
  const sealed = q.get("sealed") === "1";
  const city = q.get("city") ? findCity(q.get("city") as string) : undefined;
  if (!q.get("d") || !city) return { saved: null, day, sealed };
  const t = q.get("t") ?? "";
  const birth = { date: q.get("d") as string, time: t, timeKnown: /^\d{2}:\d{2}$/.test(t), place: describeCity(city), tz: city.tz, lat: city.lat, lon: city.lon };
  const list = (k: string) => (q.get(k) ?? "").split(",").filter(Boolean);
  const areas = list("areas").filter((a): a is AreaId => (AREAS as string[]).includes(a));
  const person = {
    ...DEFAULT_PERSON,
    name: q.get("name") ?? "",
    interests: areas.length ? areas : [...AREAS],
    career: list("career"),
    love: list("love"),
    home: list("home"),
    growth: list("growth"),
  } as Person;
  return { saved: validateBirth(birth) ? null : { birth, person }, day, sealed };
}

type Page = "today" | "forecast" | "match" | "explore" | "me" | "meaning" | "how";
const PAGES: Page[] = ["today", "forecast", "match", "explore", "me", "meaning", "how"];
const route = (): Page => {
  const raw = window.location.hash.replace(/^#\/?/, "");
  const h = (raw === "walk" ? "explore" : raw) as Page; // old links said walk
  return PAGES.includes(h) ? h : "today";
};
const TABS: { id: Page; label: string; Icon: (p: { size?: number }) => React.JSX.Element }[] = [
  { id: "today", label: "Today", Icon: ({ size }) => <Mark size={size} /> },
  { id: "forecast", label: "Forecast", Icon: TabForecast },
  { id: "match", label: "Match", Icon: TabMatch },
  { id: "explore", label: "Explore", Icon: TabMap },
  { id: "meaning", label: "Meaning", Icon: Book },
  { id: "me", label: "You", Icon: TabYou },
];

const INVITE_KEY = "fc.invite";

/** An invite link is read once, kept for this tab until it's used, and taken out of the address bar. */
function takeInvite(): Invite | null {
  try {
    const q = linkQuery();
    const code = q.get("invite");
    if (code) {
      window.sessionStorage.setItem(INVITE_KEY, code);
      q.delete("invite");
      const rest = q.toString();
      history.replaceState(null, "", window.location.pathname + (rest ? `?${rest}` : "") + "#match");
    }
    return readInvite(window.sessionStorage.getItem(INVITE_KEY));
  } catch {
    return null;
  }
}

const splashDone = () => {
  try {
    return window.sessionStorage.getItem("fc.splash") === "1";
  } catch {
    return true;
  }
};

export function App() {
  const [link, setLink] = useState<Link | null>(() => (hasLink() ? null : { saved: null, day: null, sealed: false }));
  const [saved, setSaved] = useState<Saved | null>(() => normalizeSaved(load(STORE_KEY, isSaved)));
  const [splash, setSplash] = useState(() => !hasLink() && !splashDone() && !window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
  const [intro, setIntro] = useState(() => !introSeen());
  const [invite, setInvite] = useState<Invite | null>(takeInvite);
  const [page, setPage] = useState<Page>(() => (invite ? "match" : route()));
  const [today, setToday] = useState(localToday);
  const [date, setDate] = useState(localToday);
  const [cracked, setCracked] = useState(crackedDays);
  const [done, setDone] = useState<string[]>(() => loadSteps(localToday()));
  const [yDone, setYDone] = useState<string[]>(() => loadSteps(shiftDate(localToday(), -1)));
  const [dismissed, setDismissed] = useState(() => load(DISMISS_KEY, (v): v is string => typeof v === "string"));
  const [avatar, setAvatar] = useState(loadAvatar);
  const [reminder, setReminder] = useState(loadReminder);
  const [revealing, setRevealing] = useState(false);
  const [touring, setTouring] = useState(false);
  const [tourDemo, setTourDemo] = useState(true);
  const [forgetArmed, setForgetArmed] = useState(false);

  // Link demos need the city list before they can build a chart.
  useEffect(() => {
    if (link) return;
    loadCities().then(() => {
      const l = fromLink();
      setLink(l);
      if (l.saved) setSaved(l.saved);
      const day = l.day ?? localToday();
      setDate(day);
      setToday(day);
      // ?streak=6 pretends the last six days were cracked, for screenshots
      const n = Math.min(60, Number(linkQuery().get("streak") ?? 0) || 0);
      if (l.saved && n) setCracked(Array.from({ length: n }, (_, i) => shiftDate(day, i - n + (l.sealed ? 0 : 1))));
    });
  }, [link]);

  useEffect(() => {
    const onHash = () => {
      setPage(route());
      window.scrollTo(0, 0);
    };
    const onFocus = () => !hasLink() && setToday(localToday());
    window.addEventListener("hashchange", onHash);
    window.addEventListener("focus", onFocus);
    return () => {
      window.removeEventListener("hashchange", onHash);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  useEffect(() => {
    setDone(loadSteps(date));
  }, [date]);

  const endSplash = useCallback(() => {
    setSplash(false);
    try {
      window.sessionStorage.setItem("fc.splash", "1");
    } catch {
      /* fine */
    }
  }, []);

  const profile = useMemo(() => (saved ? readChart(saved.birth, saved.person) : null), [saved]);
  const reading = useMemo(() => (profile ? readDay(profile, date) : null), [profile, date]);
  const teaser = useMemo(() => (profile ? tomorrowTeaser(profile, shiftDate(today, 1)) : null), [profile, today]);
  const streak = streakInfo(cracked, today);
  const demo = !!link?.saved;

  const yesterday = shiftDate(today, -1);
  const checkIn: CheckIn = useMemo(() => {
    if (!profile || date !== today || dismissed === today || !cracked.includes(yesterday)) return null;
    const y = readDay(profile, yesterday);
    // Ask about yesterday's "Do" tweak, unless any tweak was already ticked.
    if (yDone.length) return null;
    return { date: yesterday, items: [{ id: "do", label: "Do", text: y.tweaks.do }] };
  }, [profile, date, today, dismissed, cracked, yesterday, yDone]);

  const go = (p: Page) => {
    if (p === "today") {
      history.pushState("", document.title, window.location.pathname + window.location.search);
      setPage("today");
      window.scrollTo(0, 0);
    } else window.location.hash = p;
  };

  const persist = (s: Saved) => {
    setSaved(s);
    if (!demo) save(STORE_KEY, s);
  };

  const finishOnboarding = (s: Saved) => {
    persist(s);
    setCracked(markCracked(localToday()));
    setDate(localToday());
    setRevealing(true);
    go(invite ? "match" : "today");
    window.setTimeout(() => {
      setRevealing(false);
      // ?tour=1 replays the tour, for screenshots
      if (!invite && !load(TOUR_KEY, (v): v is boolean => v === true)) setTouring(true);
    }, 1300);
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
    setAvatar(null);
    setReminder(null);
    setForgetArmed(false);
    setIntro(true);
    go("today");
  };

  const inviteUsed = useCallback(() => {
    setInvite(null);
    try {
      window.sessionStorage.removeItem(INVITE_KEY);
    } catch {
      /* fine */
    }
  }, []);

  if (!link) return <Splash onDone={() => undefined} />;
  if (splash) return <Splash onDone={endSplash} />;
  if (!saved || !profile || !reading || !teaser) {
    if (intro)
      return (
        <Intro
          onDone={() => {
            markIntroSeen();
            setIntro(false);
          }}
        />
      );
    return <Onboarding initial={null} onDone={finishOnboarding} />;
  }

  const isToday = date === today;
  const sealed = isToday && !cracked.includes(today) && !(demo && !link.sealed);

  const pickDay = (d: string) => {
    setDate(d);
    go("today");
  };

  return (
    <div className={`app ${revealing ? "is-revealing" : ""}`}>
      <Floaties page />
      {touring || (demo && linkQuery().get("tour") === "1" && page === "today" && !sealed && tourDemo) ? (
        <Tour
          onDone={() => {
            setTouring(false);
            setTourDemo(false);
            save(TOUR_KEY, true);
            window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
          }}
        />
      ) : null}
      <header className="topbar">
        <button type="button" className="brand" onClick={() => (setDate(today), go("today"))} aria-label="Fortune Cookie, today">
          <Mark size={32} />
          <span className="wordmark">fortune cookie</span>
        </button>
        <nav className="topnav" aria-label="Main">
          {TABS.filter((t) => t.id !== "me").map((t) => (
            <button key={t.id} type="button" className={`topnav-link ${t.id === "meaning" ? "is-quiet" : ""} ${page === t.id || (t.id === "meaning" && page === "how") ? "is-on" : ""}`} onClick={() => go(t.id)}>
              {t.label}
            </button>
          ))}
        </nav>
        <div className="top-right">
          <SkyToggle />
          <button type="button" className={`me-btn ${page === "me" ? "is-on" : ""}`} onClick={() => go("me")} aria-label="Your profile">
          <span className="streak-mini" title={`${streak.streak}-day streak`}>
            <Mark size={16} />
            {streak.streak}
          </span>
            <Avatar url={avatar} name={saved.person.name} size={36} />
          </button>
        </div>
      </header>

      <main className="main" id="top">
        {page === "today" ? (
          <Today
            profile={profile}
            reading={reading}
            sealed={sealed}
            isToday={isToday}
            onCrack={() => setCracked(markCracked(today))}
            onBackToToday={() => setDate(today)}
            done={done}
            onToggle={toggleStep}
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
            streak={streak}
            teaser={teaser}
            onPickDay={pickDay}
          />
        ) : page === "forecast" ? (
          <BiggerPicture profile={profile} date={today} today={today} cracked={cracked} onPick={pickDay} onProfile={() => go("me")} />
        ) : page === "match" ? (
          <MatchPage profile={profile} incoming={invite} onIncoming={inviteUsed} />
        ) : page === "explore" ? (
          <WalkPage profile={profile} date={today} />
        ) : page === "me" ? (
          <ProfilePage
            profile={profile}
            saved={saved}
            avatar={avatar}
            reminder={reminder}
            onAvatar={(url) => {
              setAvatar(url);
              saveAvatar(url);
            }}
            onSave={persist}
            onReminder={setReminder}
            onForget={forget}
            forgetArmed={forgetArmed}
          />
        ) : page === "meaning" ? (
          <MeaningPage profile={profile} onHow={() => go("how")} />
        ) : (
          <HowPage profile={profile} reading={reading} onBack={() => go("meaning")} />
        )}
      </main>

      <footer className="closing">
        <p className="closing-line">
          We describe the weather. <em>You choose the route.</em>
        </p>
        <p className="fineprint">
          <button type="button" className="link-btn" onClick={() => go("meaning")}>
            What it means
          </button>
          <span aria-hidden="true">·</span>
          <button type="button" className="link-btn" onClick={() => go("how")}>
            How it works
          </button>
        </p>
        <p className="fineprint">A prototype for reflection and fun. It describes conditions, never outcomes, and isn't advice for health, money, or legal decisions.</p>
      </footer>

      <nav className="tabbar" aria-label="Main">
        {TABS.map(({ id, label, Icon }) => (
          <button key={id} type="button" className={page === id || (id === "meaning" && page === "how") ? "is-on" : ""} onClick={() => (id === "today" && setDate(today), go(id))}>
            <Icon size={22} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
