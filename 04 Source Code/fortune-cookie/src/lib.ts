import { AREAS, type BirthDetails, type Person } from "./engine/reading";

export const viewerTz = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
};

/** Today's date (YYYY-MM-DD) where the reader is. */
export function localToday(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: viewerTz(), year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

export function shiftDate(ymd: string, delta: number): string {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + delta)).toISOString().slice(0, 10);
}

const atNoon = (ymd: string) => {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12));
};
const fmt = (opts: Intl.DateTimeFormatOptions) => (ymd: string) => new Intl.DateTimeFormat("en-US", { timeZone: "UTC", ...opts }).format(atNoon(ymd));

export const fmtLongDate = fmt({ weekday: "long", month: "long", day: "numeric" });
export const fmtShortDate = fmt({ weekday: "short", month: "short", day: "numeric" });
export const fmtMonthDay = fmt({ month: "short", day: "numeric" });
export const fmtBirthDate = fmt({ month: "short", day: "numeric", year: "numeric" });
export const weekdayIndex = (ymd: string) => atNoon(ymd).getUTCDay();
export const weekdayLetter = (ymd: string) => "SMTWTFS"[weekdayIndex(ymd)];

export function fmtBirthTime(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return `${h % 12 === 0 ? 12 : h % 12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}

export function greeting(): string {
  const h = new Date().getHours();
  return h < 5 ? "Hello, night owl" : h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

// ------------------------------------------------------------ storage

// Storage can be missing or blocked (private windows, embedded previews), so
// every read and write is wrapped and the app works without it.
export function load<T>(key: string, guard: (v: unknown) => v is T): T | null {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const v: unknown = JSON.parse(raw);
    return guard(v) ? v : null;
  } catch {
    return null;
  }
}

export function save(key: string, value: unknown) {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable: the reading still works for this visit */
  }
}

export function forgetEverything() {
  try {
    Object.keys(window.localStorage)
      .filter((k) => k.startsWith("fc."))
      .forEach((k) => window.localStorage.removeItem(k));
  } catch {
    /* nothing stored */
  }
}

export const isStringArray = (v: unknown): v is string[] => Array.isArray(v) && v.every((x) => typeof x === "string");

export function isBirthDetails(v: unknown): v is BirthDetails {
  if (typeof v !== "object" || v === null) return false;
  const b = v as Record<string, unknown>;
  return (
    typeof b.date === "string" &&
    typeof b.time === "string" &&
    typeof b.timeKnown === "boolean" &&
    typeof b.place === "string" &&
    typeof b.tz === "string" &&
    typeof b.lat === "number" &&
    typeof b.lon === "number"
  );
}

export type Saved = { birth: BirthDetails; person: Person };

export function isSaved(v: unknown): v is Saved {
  if (typeof v !== "object" || v === null) return false;
  const s = v as Record<string, unknown>;
  const p = s.person as Record<string, unknown> | undefined;
  return (
    isBirthDetails(s.birth) &&
    !!p &&
    typeof p.name === "string" &&
    isStringArray(p.interests) &&
    p.interests.every((a) => (AREAS as string[]).includes(a)) &&
    isStringArray(p.home)
  );
}

const asList = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x) => typeof x === "string") : typeof v === "string" ? [v] : []);

/** Profiles saved by earlier versions stored one answer per question; newer ones store lists and always cover all four areas. */
export function normalizeSaved(s: Saved | null): Saved | null {
  if (!s) return null;
  const p = s.person as unknown as Record<string, unknown>;
  return {
    birth: s.birth,
    person: {
      name: typeof p.name === "string" ? p.name : "",
      interests: [...AREAS],
      career: asList(p.career) as Person["career"],
      love: asList(p.love) as Person["love"],
      home: asList(p.home) as Person["home"],
      growth: asList(p.growth) as Person["growth"],
    },
  };
}

// ------------------------------------------------------------ the daily habit

const CRACKED = "fc.cracked";
const stepsKey = (date: string) => `fc.steps.${date}`;

export function crackedDays(): string[] {
  return load(CRACKED, isStringArray) ?? [];
}

export function markCracked(date: string): string[] {
  const days = crackedDays();
  if (days.includes(date)) return days;
  const next = [...days, date].sort().slice(-500);
  save(CRACKED, next);
  return next;
}

export type Streak = { streak: number; total: number; crackedToday: boolean; week: { date: string; letter: string; cracked: boolean }[] };

export function streakInfo(days: string[], today: string): Streak {
  const set = new Set(days);
  const crackedToday = set.has(today);
  let streak = 0;
  let d = crackedToday ? today : shiftDate(today, -1);
  while (set.has(d)) {
    streak++;
    d = shiftDate(d, -1);
  }
  const week = Array.from({ length: 7 }, (_, i) => {
    const date = shiftDate(today, i - 6);
    return { date, letter: weekdayLetter(date), cracked: set.has(date) };
  });
  return { streak, total: days.length, crackedToday, week };
}

const plansKey = (date: string) => `fc.plans.${date}`;
const isPlans = (v: unknown): v is Record<string, string> =>
  typeof v === "object" && v !== null && !Array.isArray(v) && Object.values(v).every((x) => typeof x === "string");
/** The reader's own tiny steps for a day, by area, replacing the suggestion. */
export const loadPlans = (date: string): Partial<Record<(typeof AREAS)[number], string>> => load(plansKey(date), isPlans) ?? {};
export const savePlans = (date: string, plans: Record<string, string>) => save(plansKey(date), Object.keys(plans).length ? plans : null);

export const loadSteps = (date: string) => load(stepsKey(date), isStringArray) ?? [];
export const saveSteps = (date: string, ids: string[]) => save(stepsKey(date), ids);

// ------------------------------------------------------------ files

/** True when the page runs inside another page (an embedded preview), where downloads are blocked. */
export function inFrame(): boolean {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 4000);
}

type Downloads = { save: (r: { filename: string; data: Blob }) => Promise<{ status: string }> };
type HostBridge = { use?: (name: string) => Promise<unknown> };

/**
 * Inside the Claude artifact viewer a page can't start downloads itself; it asks
 * the host, which shows the viewer a confirmation. Resolves null elsewhere.
 */
export async function hostDownloads(): Promise<Downloads | null> {
  try {
    const bridge = (window as unknown as { claude?: HostBridge }).claude;
    if (!bridge?.use) return null;
    return ((await bridge.use("downloads")) as Downloads | null) ?? null;
  } catch {
    return null;
  }
}

/** A daily calendar event, so the reminder lives in the reader's own calendar app. */
export function reminderIcs(hhmm: string): Blob {
  const [h, m] = hhmm.split(":");
  const today = localToday().replace(/-/g, "");
  const stamp = new Date().toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z";
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Fortune Cookie//Daily reminder//EN",
    "BEGIN:VEVENT",
    `UID:fortune-cookie-daily-${today}@fortunecookie`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${today}T${h}${m}00`,
    `DTEND:${today}T${h}${String(Number(m) + 5).padStart(2, "0")}00`,
    "RRULE:FREQ=DAILY",
    "SUMMARY:Crack your fortune cookie",
    "DESCRIPTION:Two minutes: today's fortune\\, one tiny step\\, and your streak.",
    "BEGIN:VALARM",
    "TRIGGER:PT0M",
    "ACTION:DISPLAY",
    "DESCRIPTION:Crack your fortune cookie",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  return new Blob([ics], { type: "text/calendar" });
}
