/**
 * Four Pillars calculation. Real astronomy, no lookup tables of results.
 *
 * Ported from the MING engine (verified against Hong Kong Observatory solar-term
 * times and 4,000 random charts from an independent implementation). Rules and
 * sources, each cited on the rule it supports:
 *
 * - Year pillar turns at the start of spring (Lichun), the instant the Sun reaches
 *   315 deg apparent ecliptic longitude. Not 1 January and not Lunar New Year.
 *   https://mingming3.com/en/bazi/articles/bazi_format
 * - Month branch is set by the twelve solar terms 30 deg apart, starting at Lichun.
 *   https://mingming3.com/en/bazi/articles/bazi_format
 * - Month stem from the year stem by the Five Tigers rule.
 *   https://wiki.openfate.ai/en/bazi/calendar/five-tigers-method
 * - Day pillar from the continuous 60-day count keyed to the Julian Day Number,
 *   anchored on 27 January 2019 as the first day of the cycle.
 *   https://ytliu0.github.io/ChineseCalendar/sexagenary.html
 * - Hour stem from the day stem by the Five Rats rule.
 *   https://wiki.openfate.ai/en/bazi/calendar/five-rats-method
 * - Hidden stems of the twelve branches.
 *   https://wiki.openfate.ai/en/bazi/hidden-stems-roots/twelve-branch-hidden-stems-table
 * - Relationship of each stem to the day master by five-phase direction plus polarity.
 *   https://wiki.openfate.ai/en/bazi/ten-gods/how-the-ten-gods-are-derived
 * - Solar position from the full VSOP87 series via `astronomia`
 *   (Jean Meeus, "Astronomical Algorithms", 2nd ed.).
 *
 * The `cn` fields exist only so the test script can compare against an independent
 * implementation. The interface never shows them.
 */
import solar from "astronomia/solar";
import eqtime from "astronomia/eqtime";
import { Planet } from "astronomia/planetposition";
import vsop87Bearth from "astronomia/data/vsop87Bearth";
import deltat from "astronomia/deltat";

const earth = new Planet(vsop87Bearth);
const rev360 = (x: number) => ((x % 360) + 360) % 360;
export const mod = (n: number, m: number) => ((n % m) + m) % m;

// ------------------------------------------------------------------ calendar

export function gregorianToJD(year: number, month: number, day: number): number {
  let y = year;
  let m = month;
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + B - 1524.5;
}
export const jdToDate = (jd: number) => new Date((jd - 2440587.5) * 86400000);
export const msToJD = (ms: number) => ms / 86400000 + 2440587.5;
const decimalYear = (jd: number) => 2000 + (jd - 2451545) / 365.25;

/** Apparent solar ecliptic longitude in degrees, for a Julian Day in UT. */
export function sunLonUT(jdUT: number): number {
  const jde = jdUT + deltat.deltaT(decimalYear(jdUT)) / 86400;
  return rev360((solar.apparentVSOP87(earth, jde).lon * 180) / Math.PI);
}

/** Equation of time in minutes (apparent solar time minus mean solar time). */
export function eqTimeMinutes(jdUT: number): number {
  const jde = jdUT + deltat.deltaT(decimalYear(jdUT)) / 86400;
  return eqtime.e(jde, earth) * (180 / Math.PI) * 4;
}

const angleDiff = (a: number, b: number) => {
  let d = a - b;
  while (d > 180) d -= 360;
  while (d < -180) d += 360;
  return d;
};

/** JD (UT) at which apparent solar longitude reaches `target`, searching forward. */
export function findSolarTerm(target: number, startJdUT: number, searchDays = 400): number | null {
  const t = rev360(target);
  let prev = startJdUT;
  let prevLon = sunLonUT(prev);
  for (let i = 1; i <= searchDays; i++) {
    const cur = startJdUT + i;
    const curLon = sunLonUT(cur);
    if (rev360(prevLon - t) > rev360(curLon - t)) {
      let lo = prev;
      let hi = cur;
      for (let k = 0; k < 60 && hi - lo > 0.5 / 86400; k++) {
        const mid = (lo + hi) / 2;
        if (angleDiff(sunLonUT(mid), t) < 0) lo = mid;
        else hi = mid;
      }
      return (lo + hi) / 2;
    }
    prev = cur;
    prevLon = curLon;
  }
  return null;
}

const termCache = new Map<number, number>();
/** Cached start-of-spring instant (Sun at 315 deg) as a JD in UT, for a Gregorian year. */
export function springStartJD(gregYear: number): number {
  const hit = termCache.get(gregYear);
  if (hit !== undefined) return hit;
  const v = findSolarTerm(315, gregorianToJD(gregYear, 1, 28), 12);
  if (v === null) throw new Error(`Start of spring not found for ${gregYear}`);
  termCache.set(gregYear, v);
  return v;
}

// ---------------------------------------------------------------- time zones

const dtfCache = new Map<string, Intl.DateTimeFormat>();
function dtf(tz: string) {
  let f = dtfCache.get(tz);
  if (!f) {
    f = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    dtfCache.set(tz, f);
  }
  return f;
}

export type WallClock = { year: number; month: number; day: number; hour: number; minute: number };

/** Wall-clock parts of an absolute instant in an IANA zone. */
export function partsInZone(ms: number, tz: string): WallClock & { second: number } {
  const p: Record<string, number> = {};
  for (const { type, value } of dtf(tz).formatToParts(ms)) {
    if (type !== "literal") p[type] = Number(value);
  }
  return { year: p.year, month: p.month, day: p.day, hour: p.hour, minute: p.minute, second: p.second };
}

/** UTC offset in minutes the zone had at that instant, from the runtime's IANA database. */
export function zoneOffsetMinutes(ms: number, tz: string): number {
  const p = partsInZone(ms, tz);
  const asUTC = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return (asUTC - Math.floor(ms / 1000) * 1000) / 60000;
}

/** Local wall clock in an IANA zone to an absolute instant (epoch ms). Two-pass DST fix. */
export function zonedWallClockToMs(y: number, mo: number, d: number, h: number, mi: number, tz: string): number {
  const naive = Date.UTC(y, mo - 1, d, h, mi, 0);
  let ms = naive - zoneOffsetMinutes(naive, tz) * 60000;
  ms = naive - zoneOffsetMinutes(ms, tz) * 60000;
  return ms;
}

export function isKnownTimeZone(tz: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

// ------------------------------------------------------------------ symbols

export type ElementName = "Wood" | "Fire" | "Earth" | "Metal" | "Water";
export type Stem = { cn: string; element: ElementName; yang: boolean };
export type Branch = { cn: string; element: ElementName; animal: string; hidden: number[] };

export const STEMS: Stem[] = [
  { cn: "甲", element: "Wood", yang: true },
  { cn: "乙", element: "Wood", yang: false },
  { cn: "丙", element: "Fire", yang: true },
  { cn: "丁", element: "Fire", yang: false },
  { cn: "戊", element: "Earth", yang: true },
  { cn: "己", element: "Earth", yang: false },
  { cn: "庚", element: "Metal", yang: true },
  { cn: "辛", element: "Metal", yang: false },
  { cn: "壬", element: "Water", yang: true },
  { cn: "癸", element: "Water", yang: false },
];

export const BRANCHES: Branch[] = [
  { cn: "子", element: "Water", animal: "Rat", hidden: [9] },
  { cn: "丑", element: "Earth", animal: "Ox", hidden: [5, 9, 7] },
  { cn: "寅", element: "Wood", animal: "Tiger", hidden: [0, 2, 4] },
  { cn: "卯", element: "Wood", animal: "Rabbit", hidden: [1] },
  { cn: "辰", element: "Earth", animal: "Dragon", hidden: [4, 1, 9] },
  { cn: "巳", element: "Fire", animal: "Snake", hidden: [2, 4, 6] },
  { cn: "午", element: "Fire", animal: "Horse", hidden: [3, 5] },
  { cn: "未", element: "Earth", animal: "Goat", hidden: [5, 3, 1] },
  { cn: "申", element: "Metal", animal: "Monkey", hidden: [6, 8, 4] },
  { cn: "酉", element: "Metal", animal: "Rooster", hidden: [7] },
  { cn: "戌", element: "Earth", animal: "Dog", hidden: [4, 7, 3] },
  { cn: "亥", element: "Water", animal: "Pig", hidden: [8, 0] },
];

export const ELEMENTS: ElementName[] = ["Wood", "Fire", "Earth", "Metal", "Water"];
const GEN_NEXT: Record<ElementName, ElementName> = { Wood: "Fire", Fire: "Earth", Earth: "Metal", Metal: "Water", Water: "Wood" };
const CTRL_NEXT: Record<ElementName, ElementName> = { Wood: "Earth", Earth: "Water", Water: "Fire", Fire: "Metal", Metal: "Wood" };

/**
 * How `other` relates to `self` in the five-phase cycle, in plain names:
 * company = same element, expression = what self produces, harvest = what self
 * controls, structure = what controls self, nurture = what produces self.
 */
export type Family = "company" | "expression" | "harvest" | "structure" | "nurture";

export function familyOf(self: ElementName, other: ElementName): Family {
  if (self === other) return "company";
  if (GEN_NEXT[self] === other) return "expression";
  if (CTRL_NEXT[self] === other) return "harvest";
  if (CTRL_NEXT[other] === self) return "structure";
  return "nurture";
}

/**
 * The ten relationships (classically the "Ten Gods"), with plain internal keys.
 * Same polarity first, opposite polarity second, per family.
 */
export type Energy =
  | "self" | "rival"
  | "play" | "voice"
  | "windfall" | "savings"
  | "push" | "rules"
  | "intuition" | "care";

const ENERGY_TABLE: Record<Family, { same: Energy; diff: Energy }> = {
  company: { same: "self", diff: "rival" },
  expression: { same: "play", diff: "voice" },
  harvest: { same: "windfall", diff: "savings" },
  structure: { same: "push", diff: "rules" },
  nurture: { same: "intuition", diff: "care" },
};

export const ENERGY_FAMILY: Record<Energy, Family> = {
  self: "company", rival: "company",
  play: "expression", voice: "expression",
  windfall: "harvest", savings: "harvest",
  push: "structure", rules: "structure",
  intuition: "nurture", care: "nurture",
};

/** Energy of stem `otherIdx` seen from day-master stem `dmIdx`. */
export function energyOf(dmIdx: number, otherIdx: number): Energy {
  const dm = STEMS[dmIdx];
  const o = STEMS[otherIdx];
  return ENERGY_TABLE[familyOf(dm.element, o.element)][dm.yang === o.yang ? "same" : "diff"];
}

// ------------------------------------------------------------------- pillars

export const FIVE_TIGERS_BASE = (yearStemIdx: number) => mod(mod(yearStemIdx, 5) * 2 + 2, 10);
const FIVE_RATS_BASE = (dayStemIdx: number) => mod(mod(dayStemIdx, 5) * 2, 10);

export type Pillar = { stemIdx: number; branchIdx: number; stem: Stem; branch: Branch; cn: string };

const makePillar = (s: number, b: number): Pillar => ({
  stemIdx: s,
  branchIdx: b,
  stem: STEMS[s],
  branch: BRANCHES[b],
  cn: STEMS[s].cn + BRANCHES[b].cn,
});

/** Julian Day Number (integer) of a calendar date: a running day count. */
export const dayNumber = (y: number, m: number, d: number) => gregorianToJD(y, m, d) + 0.5;

export const makePillarOf = (s: number, b: number): Pillar => makePillar(mod(s, 10), mod(b, 12));

/** Pillar of the calendar day containing local date y-m-d. */
export function dayPillarForCivilDate(y: number, m: number, d: number): Pillar {
  const jdn = gregorianToJD(y, m, d) + 0.5; // JD at noon of that date, an integer
  return makePillar(mod(jdn - 1, 10), mod(jdn + 1, 12));
}

export type ChartMeta = {
  instantISO: string;
  solarLongitude: number;
  chartYear: number;
  springStartISO: string;
  monthIdx: number;
  civil: WallClock;
  effective: WallClock;
  zoneOffsetMinutes: number;
  equationOfTimeMinutes: number;
  solarCorrectionMinutes: number;
  minutesToHourBoundary: number;
  degreesToTermBoundary: number;
  lateNight: boolean;
};

export type Chart = {
  year: Pillar;
  month: Pillar;
  day: Pillar;
  hour: Pillar;
  dayMasterIdx: number;
  meta: ChartMeta;
};

/**
 * Four Pillars for an absolute instant at a place.
 *
 * Day boundary: midnight of the effective local date. Births between 23:00 and
 * 23:59 sun time stay on the same civil day. Schools disagree here, and
 * `meta.lateNight` flags it rather than hiding it.
 */
export function computePillars(ms: number, tz: string, lonDeg: number, useSunTime = true): Chart {
  const jdUT = msToJD(ms);
  const lon = sunLonUT(jdUT);

  // year: turns at the start of spring (315 deg)
  const utcYear = new Date(ms).getUTCFullYear();
  const springThisYear = springStartJD(utcYear);
  const chartYear = jdUT < springThisYear ? utcYear - 1 : utcYear;
  const springUsed = jdUT < springThisYear ? springStartJD(utcYear - 1) : springThisYear;
  const yearCycle = mod(chartYear - 1984, 60); // 1984 opened a 60-year cycle
  const yearP = makePillar(mod(yearCycle, 10), mod(yearCycle, 12));

  // month: solar-term interval measured from the start of spring, 30 deg each
  const monthIdx = Math.floor(rev360(lon - 315) / 30);
  const monthP = makePillar(mod(FIVE_TIGERS_BASE(yearP.stemIdx) + monthIdx, 10), mod(2 + monthIdx, 12));

  // effective local clock: recorded time corrected to the sun's position
  const civilFull = partsInZone(ms, tz);
  const civil: WallClock = {
    year: civilFull.year,
    month: civilFull.month,
    day: civilFull.day,
    hour: civilFull.hour,
    minute: civilFull.minute,
  };
  const offsetMin = zoneOffsetMinutes(ms, tz);
  const eot = eqTimeMinutes(jdUT);
  const solarCorrectionMin = lonDeg * 4 - offsetMin + eot;
  let eff: WallClock = civil;
  if (useSunTime) {
    const shifted = new Date(
      Date.UTC(civil.year, civil.month - 1, civil.day, civil.hour, civil.minute, 0) +
        Math.round(solarCorrectionMin) * 60000
    );
    eff = {
      year: shifted.getUTCFullYear(),
      month: shifted.getUTCMonth() + 1,
      day: shifted.getUTCDate(),
      hour: shifted.getUTCHours(),
      minute: shifted.getUTCMinutes(),
    };
  }

  const dayP = dayPillarForCivilDate(eff.year, eff.month, eff.day);

  // hour: twelve two-hour blocks, the first spanning 23:00-00:59
  const minutesOfDay = eff.hour * 60 + eff.minute;
  const hourBranchIdx = Math.floor(mod(minutesOfDay + 60, 1440) / 120);
  const hourP = makePillar(mod(FIVE_RATS_BASE(dayP.stemIdx) + hourBranchIdx, 10), hourBranchIdx);

  const intoBlock = mod(minutesOfDay + 60, 120);
  const intoTerm = rev360(lon - 315) % 30;

  return {
    year: yearP,
    month: monthP,
    day: dayP,
    hour: hourP,
    dayMasterIdx: dayP.stemIdx,
    meta: {
      instantISO: new Date(ms).toISOString(),
      solarLongitude: lon,
      chartYear,
      springStartISO: jdToDate(springUsed).toISOString(),
      monthIdx,
      civil,
      effective: eff,
      zoneOffsetMinutes: offsetMin,
      equationOfTimeMinutes: eot,
      solarCorrectionMinutes: solarCorrectionMin,
      minutesToHourBoundary: Math.min(intoBlock, 120 - intoBlock),
      degreesToTermBoundary: Math.min(intoTerm, 30 - intoTerm),
      lateNight: eff.hour === 23,
    },
  };
}

/** Start of solar month `i` (0 = the month that opens at the start of spring) in a chart year, as a JD in UT. */
export function solarMonthStartJD(chartYear: number, i: number): number {
  if (i === 0) return springStartJD(chartYear);
  const v = findSolarTerm(315 + i * 30, springStartJD(chartYear) + i * 30.44 - 8, 16);
  if (v === null) throw new Error(`Solar month ${i} of ${chartYear} not found`);
  return v;
}

/** The instant the current solar month began (last 30-degree term before `ms`). */
export function solarMonthStart(ms: number): Date | null {
  const jd = msToJD(ms);
  const lon = sunLonUT(jd);
  const monthIdx = Math.floor(rev360(lon - 315) / 30);
  const start = findSolarTerm(315 + monthIdx * 30, jd - 34, 36);
  return start === null ? null : jdToDate(start);
}

/** The instant the current solar month ends (next 30-degree term after `ms`). */
export function solarMonthEnd(ms: number): Date | null {
  const jd = msToJD(ms);
  const lon = sunLonUT(jd);
  const monthIdx = Math.floor(rev360(lon - 315) / 30);
  const next = findSolarTerm(315 + (monthIdx + 1) * 30, jd, 40);
  return next === null ? null : jdToDate(next);
}

// ------------------------------------------------------------- chart balance

export type PillarKey = "year" | "month" | "day" | "hour";
export const PILLAR_KEYS: PillarKey[] = ["year", "month", "day", "hour"];

/**
 * Fortune Cookie's own weighting by hidden-stem layer (main, middle, faint).
 * Not classical: the hidden-stem source records the order of hidden stems but
 * states it "does not establish 60/30 or another universal" weighting.
 */
const HIDDEN_WEIGHTS = [0.6, 0.3, 0.15];

export type ElementShare = Record<ElementName, number>;

/** Weighted element balance across the known pillars, stems plus hidden stems. */
export function elementShare(chart: Chart, keys: PillarKey[]): ElementShare {
  const load: ElementShare = { Wood: 0, Fire: 0, Earth: 0, Metal: 0, Water: 0 };
  for (const key of keys) {
    const p = chart[key];
    load[p.stem.element] += 1;
    p.branch.hidden.forEach((s, i) => {
      load[STEMS[s].element] += HIDDEN_WEIGHTS[i] ?? 0.15;
    });
  }
  const total = ELEMENTS.reduce((a, e) => a + load[e], 0);
  const share = {} as ElementShare;
  for (const e of ELEMENTS) share[e] = load[e] / total;
  return share;
}

export type StrengthBand = "light" | "balanced" | "full";

/**
 * Fortune Cookie's own scoring of how much the chart backs up its core element:
 * support (same element + what feeds it) against everything that draws on it,
 * with the month pillar counted double for season. Bands split the population of
 * possible charts into roughly equal thirds (see scripts/verify.ts).
 */
export function coreStrength(chart: Chart, keys: PillarKey[]): { ratio: number; band: StrengthBand } {
  const dm = STEMS[chart.dayMasterIdx];
  let support = 0;
  let drain = 0;
  const add = (element: ElementName, weight: number) => {
    const fam = familyOf(dm.element, element);
    if (fam === "company" || fam === "nurture") support += weight;
    else drain += weight;
  };
  for (const key of keys) {
    const p = chart[key];
    const seasonal = key === "month" ? 2 : 1;
    if (key !== "day") add(p.stem.element, seasonal);
    p.branch.hidden.forEach((s, i) => add(STEMS[s].element, (HIDDEN_WEIGHTS[i] ?? 0.15) * seasonal));
  }
  const ratio = support / (support + drain);
  const band: StrengthBand = ratio < 0.32 ? "light" : ratio > 0.48 ? "full" : "balanced";
  return { ratio, band };
}

export type BranchRelation = "clash" | "harmony" | "echo" | "none";

/**
 * Six clashes are branches six apart (Rat-Horse, Ox-Goat, Tiger-Monkey,
 * Rabbit-Rooster, Dragon-Dog, Snake-Pig). Six harmonies are the pairs whose
 * indices sum to 1 mod 12 (Rat-Ox, Tiger-Pig, Rabbit-Dog, Dragon-Rooster,
 * Snake-Monkey, Horse-Goat). "Echo" is the same animal repeating.
 */
export function branchRelation(a: number, b: number): BranchRelation {
  if (a === b) return "echo";
  if (mod(a - b, 12) === 6) return "clash";
  if (mod(a + b, 12) === 1) return "harmony";
  return "none";
}
