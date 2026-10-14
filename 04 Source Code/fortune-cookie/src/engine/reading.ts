/**
 * Turns a birth chart, a little about the person, and a calendar day into a
 * Fortune Cookie reading, plus the month, year, and lifetime views.
 *
 * The chart math (pillars.ts) is classical and verified. This file is the
 * editorial layer: which hand-written sentence each part gets, and how "easy"
 * each energy is for this chart. The scoring is Fortune Cookie's own and is
 * labelled that way in the app. Everything here is a pure function: the same
 * details and the same date always give the same reading.
 */
import {
  BRANCHES,
  ELEMENTS,
  ENERGY_FAMILY,
  FIVE_TIGERS_BASE,
  PILLAR_KEYS,
  STEMS,
  branchRelation,
  computePillars,
  coreStrength,
  dayNumber,
  elementShare,
  energyOf,
  familyOf,
  isKnownTimeZone,
  jdToDate,
  mod,
  msToJD,
  partsInZone,
  solarMonthEnd,
  solarMonthStart,
  solarMonthStartJD,
  springStartJD,
  zoneOffsetMinutes,
  zonedWallClockToMs,
  type BranchRelation,
  type Chart,
  type ElementName,
  type ElementShare,
  type Energy,
  type Family,
  type PillarKey,
  type StrengthBand,
} from "./pillars";
import {
  AREA_META,
  AREA_TEXT,
  AREA_TONE,
  ASK,
  CORE,
  ELEMENT_LESS,
  ELEMENT_MORE,
  ENERGY_MEANS,
  FAMILY_MEANS,
  FAMILY_NAME,
  HELPFUL,
  OVERALL_TONE,
  PILLAR_LINK,
  PILLAR_META,
  RELATION_NOTE,
  SEASON,
  SLIP,
  TONE_LABEL,
  type AreaId,
  type LoadState,
  type Tone,
} from "./copy";
import {
  CAREER_FOR,
  CORE_NICK,
  CORE_TODAY,
  GROWTH_FOR,
  HOME_FOR,
  LIFE_AREA,
  LOVE_FOR,
  MATCH_DAY,
  MATCH_FAM,
  MATCH_HEADLINE,
  MATCH_TIP,
  MATCH_YEAR,
  STEPS,
  TOMORROW,
  TWEAK,
  TWEAK_WHY,
  YEAR,
  YEAR_AREA,
  YEAR_LINK,
  YEAR_ENERGY,
  OVERALL_DEEP,
  MONTH_DEEP,
  AREA_DEEP,
  type CareerCtx,
  type GrowthCtx,
  type HomeCtx,
  type LoveCtx,
  type Step,
} from "./copy-more";

export type { AreaId, Tone } from "./copy";
export { AREA_META, FAMILY_NAME, PILLAR_META, TONE_LABEL } from "./copy";
export type { CareerCtx, GrowthCtx, HomeCtx, LoveCtx } from "./copy-more";

export const AREAS: AreaId[] = ["growth", "career", "love", "family"];

// ------------------------------------------------------------ inputs

export type BirthDetails = {
  date: string; // YYYY-MM-DD
  time: string; // HH:MM, or "" when unknown
  timeKnown: boolean;
  place: string;
  tz: string;
  lat: number;
  lon: number;
};

export type Person = {
  name: string;
  interests: AreaId[];
  career: CareerCtx[];
  love: LoveCtx[];
  home: HomeCtx[];
  growth: GrowthCtx[];
};

export const DEFAULT_PERSON: Person = { name: "", interests: [...AREAS], career: [], love: [], home: [], growth: [] };

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME_RE = /^(\d{2}):(\d{2})$/;

export function validateBirth(b: BirthDetails): string | null {
  const d = DATE_RE.exec(b.date);
  if (!d) return "Add your date of birth.";
  const year = Number(d[1]);
  if (year < 1902 || year > 2099) return "Birth year needs to be between 1902 and 2099.";
  if (b.timeKnown && !TIME_RE.test(b.time)) return "Add your birth time, or tick “I don't know my birth time”.";
  if (!b.tz || !isKnownTimeZone(b.tz)) return "Pick your birthplace from the list so we know its time zone.";
  if (!Number.isFinite(b.lat) || !Number.isFinite(b.lon) || Math.abs(b.lon) > 180 || Math.abs(b.lat) > 90) {
    return "Pick your birthplace from the list so we know where it is.";
  }
  return null;
}

// ------------------------------------------------------------ the chart

export type PillarCard = {
  key: PillarKey;
  known: boolean;
  animal: string;
  element: ElementName;
  yang: boolean;
  animalElement: ElementName;
};

export type Profile = {
  birth: BirthDetails;
  person: Person;
  chart: Chart;
  keys: PillarKey[];
  pillars: PillarCard[];
  core: { element: ElementName; yang: boolean; title: string; text: string; nick: string };
  share: ElementShare;
  most: ElementName;
  least: ElementName;
  mostLine: string;
  leastLine: string;
  band: StrengthBand;
  ease: Record<ElementName, number>;
  helpful: { element: ElementName; color: string; ideas: string };
  how: {
    localTime: string;
    utcOffset: string;
    sunTime: string | null;
    correctionMinutes: number;
    chartYear: number;
    springStart: string;
    nearBoundary: boolean;
    lateNight: boolean;
  };
};

/**
 * Fortune Cookie's own scoring of how easy each kind of energy is for a chart.
 * A chart whose core element has little backup finds Nurture and Company easy;
 * one with plenty finds Expression and Harvest easy. The chart's least and most
 * common elements then shift by a notch. Not a classical rule; labelled as ours.
 */
const BAND_EASE: Record<StrengthBand, Record<Family, number>> = {
  light: { nurture: 1.5, company: 1, expression: -0.5, harvest: -1, structure: -1.5 },
  balanced: { nurture: 0.5, company: 0, expression: 0.5, harvest: 0.5, structure: -0.5 },
  full: { nurture: -1, company: -1.5, expression: 1.5, harvest: 1, structure: 0.5 },
};

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));
const pad = (n: number) => String(n).padStart(2, "0");
const yy = (yang: boolean) => (yang ? "yang" : "yin");
export const polarity = (yang: boolean) => (yang ? "Yang" : "Yin");

function fmtClock(h: number, m: number) {
  const suffix = h < 12 ? "AM" : "PM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${pad(m)} ${suffix}`;
}

function fmtOffset(min: number) {
  const sign = min >= 0 ? "+" : "−";
  const a = Math.abs(min);
  return `UTC${sign}${Math.floor(a / 60)}${a % 60 ? `:${pad(a % 60)}` : ""}`;
}

const fmtDay = (d: Date, tz: string, opts: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("en-US", { timeZone: tz, ...opts }).format(d);

const ymdInZone = (d: Date, tz: string) => {
  const p = partsInZone(d.getTime(), tz);
  return `${p.year}-${pad(p.month)}-${pad(p.day)}`;
};

export function readChart(birth: BirthDetails, person: Person = DEFAULT_PERSON): Profile {
  const [y, mo, d] = birth.date.split("-").map(Number);
  const [h, mi] = birth.timeKnown ? birth.time.split(":").map(Number) : [12, 0];
  const ms = zonedWallClockToMs(y, mo, d, h, mi, birth.tz);
  const chart = computePillars(ms, birth.tz, birth.lon, birth.timeKnown);
  const keys = birth.timeKnown ? PILLAR_KEYS : PILLAR_KEYS.filter((k) => k !== "hour");

  const dm = STEMS[chart.dayMasterIdx];
  const share = elementShare(chart, keys);
  const ranked = [...ELEMENTS].sort((a, b) => share[b] - share[a]);
  const most = ranked[0];
  const least = ranked[ranked.length - 1];
  const { band } = coreStrength(chart, keys);

  const ease = {} as Record<ElementName, number>;
  for (const e of ELEMENTS) {
    let v = BAND_EASE[band][familyOf(dm.element, e)];
    if (e === least) v += 0.75;
    if (e === most) v -= 0.75;
    ease[e] = clamp(v, -2, 2);
  }
  const helpfulEl = [...ELEMENTS].sort((a, b) => ease[b] - ease[a] || share[a] - share[b])[0];

  const pillars: PillarCard[] = PILLAR_KEYS.map((key) => ({
    key,
    known: keys.includes(key),
    animal: chart[key].branch.animal,
    element: chart[key].stem.element,
    yang: chart[key].stem.yang,
    animalElement: chart[key].branch.element,
  }));

  const core = CORE[dm.element][yy(dm.yang)];
  const m = chart.meta;

  return {
    birth,
    person,
    chart,
    keys,
    pillars,
    core: { element: dm.element, yang: dm.yang, ...core, nick: CORE_NICK[`${dm.element}.${yy(dm.yang)}`] },
    share,
    most,
    least,
    mostLine: `More ${most}: ${ELEMENT_MORE[most]}.`,
    leastLine: `Less ${least}: ${ELEMENT_LESS[least]}.`,
    band,
    ease,
    helpful: { element: helpfulEl, ...HELPFUL[helpfulEl] },
    how: {
      localTime: birth.timeKnown ? fmtClock(m.civil.hour, m.civil.minute) : "Unknown",
      utcOffset: fmtOffset(zoneOffsetMinutes(ms, birth.tz)),
      sunTime: birth.timeKnown ? fmtClock(m.effective.hour, m.effective.minute) : null,
      correctionMinutes: Math.round(m.solarCorrectionMinutes),
      chartYear: m.chartYear,
      springStart: fmtDay(new Date(m.springStartISO), birth.tz, { month: "short", day: "numeric", year: "numeric" }),
      nearBoundary: birth.timeKnown && (m.minutesToHourBoundary < 15 || m.degreesToTermBoundary < 0.25),
      lateNight: birth.timeKnown && m.lateNight,
    },
  };
}

// ------------------------------------------------------------ scoring

const REL_MOD: Record<BranchRelation, number> = { clash: -1.25, harmony: 1, echo: 0.5, none: 0 };
const REL_RANK: Record<BranchRelation, number> = { clash: 3, harmony: 2, echo: 1, none: 0 };

/**
 * The daily number. The raw score (about -3 to +3) maps onto 0 to 100, with a
 * small fixed wobble so two days with the same energy don't print the same
 * number. Same details and same date always give the same number.
 */
export function toNumber(raw: number, wobble = 0): number {
  return Math.round(clamp(64 + raw * 12 + wobble, 28, 99));
}

/** The color band behind a number. */
export function toneOfNumber(n: number): Tone {
  if (n >= 76) return "flowing";
  if (n >= 61) return "steady";
  if (n >= 49) return "mixed";
  return "gentle";
}

export function toneOf(score: number): Tone {
  return toneOfNumber(toNumber(score));
}

/** A fixed wobble between -3 and +3 for a day, a chart, and a slot. */
const wobble = (n: number, salt: number, slot: number) => (mod(n * 7 + salt * 13 + slot * 29 + Math.floor(n / 3) * 5, 7) - 3);

type Scored = {
  stemEl: ElementName;
  stemEnergy: Energy;
  branchEl: ElementName;
  branchEnergy: Energy;
  rel: Record<PillarKey, BranchRelation>;
  best: { relation: BranchRelation; pillar: PillarKey | null };
  scores: Record<"overall" | AreaId, number>;
};

/**
 * Score any stem-and-branch pair (a day, a month, or a year) against the chart.
 * Each life area reads a different part of the pair against a different pillar.
 */
function score(profile: Profile, stemIdx: number, branchIdx: number, seasonEl: ElementName): Scored {
  const { chart: natal, keys, ease } = profile;
  const dm = natal.dayMasterIdx;
  const stemEl = STEMS[stemIdx].element;
  const stemEnergy = energyOf(dm, stemIdx);
  const branchStem = BRANCHES[branchIdx].hidden[0];
  const branchEl = STEMS[branchStem].element;
  const branchEnergy = energyOf(dm, branchStem);

  const rel = {} as Record<PillarKey, BranchRelation>;
  for (const k of PILLAR_KEYS) rel[k] = keys.includes(k) ? branchRelation(branchIdx, natal[k].branchIdx) : "none";
  let best: { relation: BranchRelation; pillar: PillarKey | null } = { relation: "none", pillar: null };
  for (const k of ["day", "month", "hour", "year"] as PillarKey[]) {
    if (REL_RANK[rel[k]] > REL_RANK[best.relation]) best = { relation: rel[k], pillar: k };
  }

  return {
    stemEl,
    stemEnergy,
    branchEl,
    branchEnergy,
    rel,
    best,
    scores: {
      overall: 0.6 * ease[stemEl] + 0.4 * ease[branchEl] + 0.75 * REL_MOD[best.relation],
      growth: ease[stemEl] + REL_MOD[rel.hour],
      career: 0.7 * ease[stemEl] + 0.3 * ease[seasonEl] + REL_MOD[rel.month],
      love: ease[branchEl] + REL_MOD[rel.day],
      family: 0.6 * ease[branchEl] + 0.4 * ease[stemEl] + REL_MOD[rel.year] + 0.5 * REL_MOD[rel.hour],
    },
  };
}

// ------------------------------------------------------------ rotation

const EPOCH = 2451545; // day number of 1 January 2000
const stemOfDay = (n: number) => mod(n - 1, 10);
const branchOfDay = (n: number) => mod(n + 1, 12);

/**
 * How many times, since 2000, a day matched `test` before day `n`. `test` only
 * depends on the day's place in a cycle of `period` days, so this is exact and
 * cheap. Consecutive matches get consecutive counts, which is what makes a
 * rotated line wait its turn instead of repeating.
 */
function countBefore(n: number, period: number, test: (day: number) => boolean): number {
  const span = n - EPOCH;
  const q = Math.floor(span / period);
  let per = 0;
  for (let j = 0; j < period; j++) if (test(EPOCH + j)) per++;
  let count = q * per;
  for (let j = 0; j < span - q * period; j++) if (test(EPOCH + q * period + j)) count++;
  return count;
}

function stepFits(step: Step, person: Person): boolean {
  if (typeof step === "string") return true;
  const pets = person.home.some((h) => h === "cat" || h === "dog" || h === "pet");
  switch (step.needs) {
    case "pet":
      return pets;
    case "kids":
      return person.home.includes("kids");
    case "partner":
      return person.love.includes("dating") || person.love.includes("partnered");
    case "single":
      return person.love.includes("single");
  }
}

function petName(person: Person): string {
  const pets = person.home.filter((h) => h === "cat" || h === "dog" || h === "pet");
  if (pets.length > 1) return "your pets";
  return pets[0] === "cat" ? "your cat" : pets[0] === "dog" ? "your dog" : "your pet";
}

const stepText = (step: Step, person: Person) =>
  (typeof step === "string" ? step : step.t).replace(/\{pet\}/g, petName(person)).replace(/^your /, "Your ");

const fill = (tpl: string, vars: Record<string, string>) => tpl.replace(/\{(\w+)\}/g, (_, k: string) => vars[k] ?? "");

// ------------------------------------------------------------ the day

export type AreaReading = {
  id: AreaId;
  title: string;
  covers: string;
  score: number;
  tone: Tone;
  toneLabel: string;
  focus: boolean;
  interested: boolean;
  text: string;
  forYou: string | null;
  toneLine: string;
  link: string | null;
  why: string;
  step: string;
  deep: string;
};

export type DailyReading = {
  date: string;
  slip: string;
  today: { element: ElementName; yang: boolean; animal: string; animalElement: ElementName };
  energy: { element: ElementName; family: Family; familyName: string; means: string };
  undercurrent: { element: ElementName; family: Family; familyName: string; means: string; animal: string };
  personal: { nick: string; text: string };
  overall: { score: number; tone: Tone; toneLabel: string; toneLine: string; ask: string; deep: string };
  tweaks: Tweaks;
  season: { text: string; element: ElementName; familyName: string; until: string | null };
  areas: AreaReading[];
  focus: AreaId;
  keys: Record<string, string>;
};

const SPOTLIGHT: Record<Family, AreaId> = {
  company: "love",
  expression: "growth",
  harvest: "career",
  structure: "career",
  nurture: "family",
};

/** With several answers for one question, the day rotates through them. */
const pickFor = <T,>(list: T[], n: number): T | null => (list.length ? list[mod(n, list.length)] : null);

function forYou(person: Person, area: AreaId, fam: Family, n: number): string | null {
  const career = pickFor(person.career, n);
  const love = pickFor(person.love, n);
  const growth = pickFor(person.growth, n);
  if (area === "career" && career) return CAREER_FOR[career][fam];
  if (area === "love" && love) return LOVE_FOR[love][fam];
  if (area === "growth" && growth) return GROWTH_FOR[growth][fam];
  if (area === "family" && person.home.length) {
    const order: HomeCtx[] = ["cat", "dog", "pet", "kids", "parents", "roommates", "solo"];
    const present = order.filter((h) => person.home.includes(h));
    const first = pickFor(present, n);
    return first ? HOME_FOR[first][fam] : null;
  }
  return null;
}

const parseYmd = (ymd: string) => ymd.split("-").map(Number) as [number, number, number];
const fmtShort = (ymd: string) => {
  const [y, m, d] = parseYmd(ymd);
  return fmtDay(new Date(Date.UTC(y, m - 1, d, 12)), "UTC", { month: "short", day: "numeric" });
};

export function readDay(profile: Profile, date: string): DailyReading {
  const { birth, chart: natal, person } = profile;
  const [ty, tm, td] = parseYmd(date);
  // Read the day at noon in the birth zone, so (details, date) -> reading is fixed
  // no matter where the reader happens to be.
  const noonMs = zonedWallClockToMs(ty, tm, td, 12, 0, birth.tz);
  const day = computePillars(noonMs, birth.tz, 0, false);
  const n = dayNumber(ty, tm, td);
  const dm = natal.dayMasterIdx;
  const dmEl = STEMS[dm].element;
  const seasonEl = day.month.branch.element;
  const s = score(profile, day.day.stemIdx, day.day.branchIdx, seasonEl);
  const stemFam = ENERGY_FAMILY[s.stemEnergy];
  const branchFam = ENERGY_FAMILY[s.branchEnergy];
  const salt = natal.day.branchIdx * 3 + natal.hour.branchIdx;

  // slip: the day's visible energy against how common that element is in the chart
  const dayIndex = mod(day.day.stemIdx * 6 - day.day.branchIdx * 5, 60);
  const variant = mod(Math.floor(dayIndex / 10) + natal.day.branchIdx, 2) as 0 | 1;
  const ranked = [...ELEMENTS].sort((a, b) => profile.share[b] - profile.share[a]);
  const load: LoadState = s.stemEl === profile.least || s.stemEl === ranked[3] ? "scarce" : s.stemEl === profile.most ? "saturated" : "present";
  const slip = SLIP[`${s.stemEnergy}.${load}`][variant];

  const overallScore = toNumber(s.scores.overall, wobble(n, salt, 0));
  const overallTone = toneOfNumber(overallScore);
  const askKey = s.best.pillar ? `${s.best.relation}.${s.best.pillar}` : `none.${branchFam}`;

  const monthEnd = solarMonthEnd(noonMs);
  const until = monthEnd ? fmtDay(monthEnd, birth.tz, { month: "short", day: "numeric" }) : null;

  const todayAnimal = day.day.branch.animal;
  const linkFor = (k: PillarKey): string | null => {
    const r = s.rel[k];
    if (r === "none") return null;
    return fill(RELATION_NOTE[r], { today: todayAnimal, pillar: PILLAR_META[k].label, natal: natal[k].branch.animal, link: PILLAR_LINK[k] });
  };

  const stemWhy = `Today's ${s.stemEl} works as ${FAMILY_NAME[stemFam]} for you: ${ENERGY_MEANS[s.stemEnergy]}.`;
  const branchWhy = `Today's ${todayAnimal} carries ${s.branchEl}, which works as ${FAMILY_NAME[branchFam]} for you: ${ENERGY_MEANS[s.branchEnergy]}.`;
  const familyHome: PillarKey = s.rel.year !== "none" || !profile.keys.includes("hour") ? "year" : "hour";

  const stemFamOf = (k: number) => familyOf(dmEl, STEMS[stemOfDay(k)].element);
  const branchFamOf = (k: number) => familyOf(dmEl, STEMS[BRANCHES[branchOfDay(k)].hidden[0]].element);

  const areas: AreaReading[] = AREAS.map((id, i) => {
    const byStem = id === "growth" || id === "career";
    const energy = byStem ? s.stemEnergy : s.branchEnergy;
    const fam = ENERGY_FAMILY[energy];
    const pool = STEPS[id][fam].filter((st) => stepFits(st, person));
    const occ = byStem ? countBefore(n, 10, (k) => stemFamOf(k) === fam) : countBefore(n, 12, (k) => branchFamOf(k) === fam);
    const step = stepText(pool[mod(occ + salt + i * 7, pool.length)], person);
    const areaScore = toNumber(s.scores[id], wobble(n, salt, i + 1));
    const tone = toneOfNumber(areaScore);
    const home: PillarKey = id === "growth" ? "hour" : id === "career" ? "month" : id === "love" ? "day" : familyHome;
    return {
      id,
      ...AREA_META[id],
      score: areaScore,
      tone,
      toneLabel: TONE_LABEL[tone],
      focus: false,
      interested: person.interests.includes(id),
      text: AREA_TEXT[id][energy],
      forYou: forYou(person, id, fam, n),
      deep: AREA_DEEP[id][fam],
      toneLine: AREA_TONE[id][tone],
      link: linkFor(home),
      why: byStem ? stemWhy : branchWhy,
      step,
    };
  });

  // In focus: the area today's energy points at, if the reader cares about it;
  // otherwise the chosen area with something happening, then the easiest one.
  const chosen = areas.filter((a) => a.interested);
  const pool = chosen.length ? chosen : areas;
  const natural = SPOTLIGHT[stemFam];
  const focus =
    pool.find((a) => a.id === natural)?.id ??
    pool.find((a) => a.link)?.id ??
    [...pool].sort((a, b) => s.scores[b.id] - s.scores[a.id])[0].id;
  areas.forEach((a) => (a.focus = a.id === focus));

  const coreKey = `${dmEl}.${yy(STEMS[dm].yang)}` as const;

  return {
    date,
    slip,
    today: { element: s.stemEl, yang: day.day.stem.yang, animal: todayAnimal, animalElement: day.day.branch.element },
    energy: { element: s.stemEl, family: stemFam, familyName: FAMILY_NAME[stemFam], means: FAMILY_MEANS[stemFam] },
    undercurrent: { element: s.branchEl, family: branchFam, familyName: FAMILY_NAME[branchFam], means: FAMILY_MEANS[branchFam], animal: todayAnimal },
    personal: { nick: CORE_NICK[coreKey], text: CORE_TODAY[coreKey][stemFam] },
    overall: {
      score: overallScore,
      tone: overallTone,
      toneLabel: TONE_LABEL[overallTone],
      toneLine: OVERALL_TONE[overallTone],
      deep: OVERALL_DEEP[stemFam],
      ask: ASK[askKey],
    },
    tweaks: readTweaks(profile, n, stemFam, day.day.branchIdx, salt),
    season: {
      text: SEASON[`${familyOf(dmEl, seasonEl)}.${profile.band}`],
      element: seasonEl,
      familyName: FAMILY_NAME[familyOf(dmEl, seasonEl)],
      until,
    },
    areas,
    focus,
    keys: {
      slip: `${s.stemEnergy}.${load}.${variant}`,
      ask: askKey,
      season: `${familyOf(dmEl, seasonEl)}.${profile.band}`,
      tones: areas.map((a) => `${a.id}:${a.tone}`).join(","),
      overall: overallTone,
    },
  };
}

/** A one-line reason to come back: tomorrow's best-looking area among the ones you chose. */
export function tomorrowTeaser(profile: Profile, tomorrow: string): { area: string; tone: Tone; text: string } {
  const r = readDay(profile, tomorrow);
  const order: Tone[] = ["flowing", "steady", "mixed", "gentle"];
  const chosen = r.areas.filter((a) => a.interested);
  const pick = [...(chosen.length ? chosen : r.areas)].sort((a, b) => order.indexOf(a.tone) - order.indexOf(b.tone) || b.score - a.score)[0];
  return { area: pick.title, tone: pick.tone, text: fill(TOMORROW[pick.tone], { area: pick.title }) };
}

// ------------------------------------------------------------ small tweaks

export type Tweaks = {
  element: ElementName;
  why: string;
  wear: { color: string; hex: string };
  eat: string;
  do: string;
  time: { label: string; animal: string };
};

/** The element a family points at, seen from your core element. */
function elementOfFamily(core: ElementName, fam: Family): ElementName {
  return ELEMENTS.find((e) => familyOf(core, e) === fam) as ElementName;
}

/**
 * Concrete, two-second changes for the day. The tweak element is the one that
 * eases today's main energy for this chart: pressure and spending are eased by
 * support, money and tasks by backup, and a crowd of your own element by an
 * outlet. Which color, food, and action within that element rotates daily.
 */
function readTweaks(profile: Profile, n: number, todayFam: Family, dayBranch: number, salt: number): Tweaks {
  const core = profile.core.element;
  const light = profile.band === "light";
  const ease: Record<Family, Family> = {
    structure: "nurture",
    expression: "nurture",
    harvest: "company",
    company: light ? "nurture" : "expression",
    nurture: light ? "nurture" : "harvest",
  };
  const fam = ease[todayFam];
  const el = elementOfFamily(core, fam);
  const set = TWEAK[el];
  const color = set.wear[mod(n + salt, set.wear.length)];

  // Best two hours while awake (5 AM to 9 PM): an easy element that gets along with today and with you.
  let best = 3;
  let bestScore = -Infinity;
  for (let b = 3; b <= 10; b++) {
    const bEl = BRANCHES[b].element;
    const v =
      profile.ease[bEl] +
      REL_MOD[branchRelation(b, dayBranch)] +
      0.5 * REL_MOD[branchRelation(b, profile.chart.day.branchIdx)] +
      (b >= 4 && b <= 9 ? 0.2 : 0) +
      ((mod(n, 5) === b % 5 ? 0.15 : 0));
    if (v > bestScore) [best, bestScore] = [b, v];
  }
  const start = mod(best * 2 - 1, 24);
  const hr = (h: number) => `${h % 12 === 0 ? 12 : h % 12}`;
  const ampm = (h: number) => (h < 12 ? "AM" : "PM");
  const end = start + 2;
  const label = ampm(start) === ampm(end) ? `${hr(start)} to ${hr(end)} ${ampm(end)}` : `${hr(start)} ${ampm(start)} to ${hr(end)} ${ampm(end)}`;

  return {
    element: el,
    why: fill(TWEAK_WHY[todayFam], { el, core }),
    wear: color,
    eat: set.eat[mod(n * 3 + salt, set.eat.length)],
    do: set.do[mod(n * 5 + salt * 2, set.do.length)],
    time: { label, animal: BRANCHES[best].animal },
  };
}

// ------------------------------------------------------------ compatibility

export type MatchReading = {
  score: number;
  tone: Tone;
  them: { name: string; core: ElementName; yang: boolean; nick: string; title: string; yearAnimal: string; dayAnimal: string };
  headline: string;
  rows: { label: string; text: string }[];
};

const TRINE = (a: number, b: number) => a !== b && mod(a - b, 4) === 0;
type Bond = "harmony" | "trine" | "echo" | "clash" | "none";
const bondOf = (a: number, b: number): Bond => {
  const r = branchRelation(a, b);
  return r !== "none" ? r : TRINE(a, b) ? "trine" : "none";
};

/** How two charts get along, read from core elements, day animals, and year animals. */
export function readMatch(me: Profile, other: Profile, name: string): MatchReading {
  const myEl = me.core.element;
  const theirEl = other.core.element;
  const fam = familyOf(myEl, theirEl);
  const day = bondOf(me.chart.day.branchIdx, other.chart.day.branchIdx);
  const year = bondOf(me.chart.year.branchIdx, other.chart.year.branchIdx);
  const FAM_PTS: Record<Family, number> = { nurture: 10, company: 6, expression: 6, harvest: 3, structure: -3 };
  const BOND_PTS: Record<Bond, number> = { harmony: 11, trine: 8, echo: 3, none: 0, clash: -9 };
  const fills = other.most === me.helpful.element ? 6 : 0;
  const raw = 60 + FAM_PTS[fam] + BOND_PTS[day] + 0.8 * BOND_PTS[year] + fills + (me.core.yang !== other.core.yang ? 3 : 0);
  const score = Math.round(clamp(raw, 34, 98));
  const tone = toneOfNumber(score);
  const nick = CORE_NICK[`${theirEl}.${yy(other.core.yang)}`];
  return {
    score,
    tone,
    them: {
      name,
      core: theirEl,
      yang: other.core.yang,
      nick,
      title: other.core.title,
      yearAnimal: other.chart.year.branch.animal,
      dayAnimal: other.chart.day.branch.animal,
    },
    headline: MATCH_HEADLINE[tone],
    rows: [
      { label: "How they feel to you", text: fill(MATCH_FAM[fam], { them: nick, you: me.core.nick }) },
      { label: "Day to day", text: MATCH_DAY[day] },
      { label: `${me.chart.year.branch.animal} and ${other.chart.year.branch.animal}`, text: MATCH_YEAR[year] },
      { label: "One tip", text: fills ? MATCH_TIP.fills : MATCH_TIP[fam] },
    ],
  };
}

// ------------------------------------------------------------ this month

export type MonthReading = {
  element: ElementName;
  familyName: string;
  text: string;
  start: string; // first day, YYYY-MM-DD
  range: string;
  score: number;
  days: { date: string; tone: Tone; score: number }[];
  smoother: string[];
  deep: string;
  areas: { id: AreaId; title: string; tone: Tone; toneLabel: string; score: number }[];
};

export function readMonth(profile: Profile, date: string): MonthReading {
  const { birth, chart: natal } = profile;
  const [ty, tm, td] = parseYmd(date);
  const noonMs = zonedWallClockToMs(ty, tm, td, 12, 0, birth.tz);
  const here = computePillars(noonMs, birth.tz, 0, false);
  const seasonEl = here.month.branch.element;
  const dmEl = STEMS[natal.dayMasterIdx].element;
  const start = solarMonthStart(noonMs) ?? new Date(noonMs);
  const end = solarMonthEnd(noonMs) ?? new Date(noonMs + 30 * 86400000);

  const salt = natal.day.branchIdx * 3 + natal.hour.branchIdx;
  const days: { date: string; tone: Tone; score: number }[] = [];
  let [y, m, d] = parseYmd(ymdInZone(start, birth.tz));
  for (let guard = 0; guard < 34; guard++) {
    const ymd = `${y}-${pad(m)}-${pad(d)}`;
    const noon = zonedWallClockToMs(y, m, d, 12, 0, birth.tz);
    if (noon >= end.getTime()) break;
    if (noon >= start.getTime()) {
      const n = dayNumber(y, m, d);
      const sc = toNumber(score(profile, stemOfDay(n), branchOfDay(n), seasonEl).scores.overall, wobble(n, salt, 0));
      days.push({ date: ymd, tone: toneOfNumber(sc), score: sc });
    }
    const next = new Date(Date.UTC(y, m - 1, d + 1));
    [y, m, d] = [next.getUTCFullYear(), next.getUTCMonth() + 1, next.getUTCDate()];
  }

  const ms = score(profile, here.month.stemIdx, here.month.branchIdx, seasonEl);
  const fam = familyOf(dmEl, seasonEl);
  return {
    element: seasonEl,
    familyName: FAMILY_NAME[fam],
    text: SEASON[`${fam}.${profile.band}`],
    deep: MONTH_DEEP[fam],
    start: days[0]?.date ?? date,
    range: days.length ? `${fmtShort(days[0].date)} to ${fmtShort(days[days.length - 1].date)}` : "",
    score: toNumber(ms.scores.overall),
    days,
    smoother: days.filter((x) => x.tone === "flowing").map((x) => x.date),
    areas: AREAS.map((id) => {
      const sc = toNumber(ms.scores[id]);
      const tone = toneOfNumber(sc);
      return { id, title: AREA_META[id].title, tone, toneLabel: TONE_LABEL[tone], score: sc };
    }),
  };
}

// ------------------------------------------------------------ this year

export type YearReading = {
  chartYear: number;
  label: string;
  range: string;
  familyName: string;
  flavor: string;
  text: string;
  link: string | null;
  score: number;
  months: { label: string; element: ElementName; tone: Tone; score: number; current: boolean }[];
  areas: { id: AreaId; title: string; tone: Tone; toneLabel: string; text: string; score: number }[];
};

export function readYear(profile: Profile, date: string): YearReading {
  const { birth, chart: natal } = profile;
  const [ty, tm, td] = parseYmd(date);
  const noonMs = zonedWallClockToMs(ty, tm, td, 12, 0, birth.tz);
  const here = computePillars(noonMs, birth.tz, 0, false);
  const cy = here.meta.chartYear;
  const yp = here.year;
  const dmEl = STEMS[natal.dayMasterIdx].element;
  const fam = familyOf(dmEl, yp.stem.element);
  const nowJD = msToJD(noonMs);

  const starts = Array.from({ length: 12 }, (_, i) => solarMonthStartJD(cy, i));
  const nextSpring = springStartJD(cy + 1);
  const base = FIVE_TIGERS_BASE(yp.stemIdx);
  const months = starts.map((jd, i) => {
    const b = mod(2 + i, 12);
    const sc = score(profile, mod(base + i, 10), b, BRANCHES[b].element);
    const endJD = i < 11 ? starts[i + 1] : nextSpring;
    return {
      label: fmtDay(jdToDate(jd), birth.tz, { month: "short", day: "numeric" }),
      element: BRANCHES[b].element,
      score: toNumber(sc.scores.overall),
      tone: toneOf(sc.scores.overall),
      current: nowJD >= jd && nowJD < endJD,
    };
  });

  const ys = score(profile, yp.stemIdx, yp.branchIdx, here.month.branch.element);
  let link: string | null = null;
  if (ys.best.pillar) {
    const k = ys.best.pillar;
    link = fill(YEAR_LINK[ys.best.relation as "clash" | "harmony" | "echo"], {
      today: yp.branch.animal,
      pillar: PILLAR_META[k].label,
      natal: natal[k].branch.animal,
      link: PILLAR_LINK[k],
    });
  }

  const fmtLong = (jd: number) => fmtDay(jdToDate(jd), birth.tz, { month: "short", day: "numeric", year: "numeric" });
  return {
    chartYear: cy,
    label: `${polarity(yp.stem.yang)} ${yp.stem.element} ${yp.branch.animal}`,
    range: `${fmtLong(springStartJD(cy))} to ${fmtLong(nextSpring - 1)}`,
    familyName: FAMILY_NAME[fam],
    flavor: YEAR_ENERGY[energyOf(natal.dayMasterIdx, yp.stemIdx)],
    text: YEAR[`${fam}.${profile.band}`],
    link,
    score: toNumber(ys.scores.overall),
    months,
    areas: AREAS.map((id) => {
      const sc = toNumber(ys.scores[id]);
      const tone = toneOfNumber(sc);
      return { id, title: AREA_META[id].title, tone, toneLabel: TONE_LABEL[tone], text: YEAR_AREA[id][fam], score: sc };
    }),
  };
}

// ------------------------------------------------------------ the years ahead

export type YearsReading = {
  count: number;
  from: number;
  to: number;
  rows: {
    year: number;
    label: string;
    animal: string;
    element: ElementName;
    tone: Tone;
    toneLabel: string;
    flavor: string;
    current: boolean;
    score: number;
    areas: { id: AreaId; tone: Tone; score: number }[];
  }[];
  smoothest: { year: number; label: string } | null;
  gentlest: { year: number; label: string } | null;
  bestFor: { id: AreaId; title: string; year: number }[];
};

/**
 * The next few chart years, each read with the same method as a day but using
 * that year's pillar. Chart years turn at the start of spring (early February).
 */
export function readYears(profile: Profile, date: string, count: number): YearsReading {
  const { birth, chart: natal } = profile;
  const [ty, tm, td] = parseYmd(date);
  const here = computePillars(zonedWallClockToMs(ty, tm, td, 12, 0, birth.tz), birth.tz, 0, false);
  const cy = here.meta.chartYear;
  const scored = Array.from({ length: count }, (_, k) => {
    const year = cy + k;
    const cyc = mod(year - 1984, 60);
    const stem = mod(cyc, 10);
    const branch = mod(cyc, 12);
    const sc = score(profile, stem, branch, BRANCHES[branch].element);
    return { year, stem, branch, sc };
  });
  const rows = scored.map(({ year, stem, branch, sc }) => {
    const sco = toNumber(sc.scores.overall);
    const tone = toneOfNumber(sco);
    return {
      year,
      label: `${polarity(STEMS[stem].yang)} ${STEMS[stem].element} ${BRANCHES[branch].animal}`,
      animal: BRANCHES[branch].animal,
      element: STEMS[stem].element,
      tone,
      toneLabel: TONE_LABEL[tone],
      flavor: YEAR_ENERGY[energyOf(natal.dayMasterIdx, stem)],
      current: year === cy,
      score: sco,
      areas: AREAS.map((id) => ({ id, tone: toneOf(sc.scores[id]), score: toNumber(sc.scores[id]) })),
    };
  });
  const byOverall = [...scored].sort((a, b) => b.sc.scores.overall - a.sc.scores.overall);
  const lbl = (x: (typeof scored)[number]) => ({ year: x.year, label: rows.find((r) => r.year === x.year)!.label });
  return {
    count,
    from: cy,
    to: cy + count - 1,
    rows,
    smoothest: count > 1 ? lbl(byOverall[0]) : null,
    gentlest: count > 1 && byOverall[byOverall.length - 1].sc.scores.overall < -0.25 ? lbl(byOverall[byOverall.length - 1]) : null,
    bestFor: AREAS.map((id) => {
      const best = [...scored].sort((a, b) => b.sc.scores[id] - a.sc.scores[id])[0];
      return { id, title: AREA_META[id].title, year: best.year };
    }),
  };
}

// ------------------------------------------------------------ your lifetime

export type LifeReading = {
  areas: { id: AreaId; title: string; text: string; source: string }[];
};

/**
 * Lifetime themes read each area from the pillar traditionally linked to it:
 * the month pillar for work, the day's animal for your closest relationship,
 * the year pillar for family roots, and your overall element mix for growth.
 */
export function readLife(profile: Profile): LifeReading {
  const natal = profile.chart;
  const dmEl = STEMS[natal.dayMasterIdx].element;
  const famShare: Record<Family, number> = { company: 0, expression: 0, harvest: 0, structure: 0, nurture: 0 };
  for (const e of ELEMENTS) famShare[familyOf(dmEl, e)] += profile.share[e];
  const dominant = (Object.keys(famShare) as Family[]).sort((a, b) => famShare[b] - famShare[a])[0];
  const monthFam = familyOf(dmEl, natal.month.stem.element);
  const loveFam = familyOf(dmEl, STEMS[natal.day.branch.hidden[0]].element);
  const yearFam = familyOf(dmEl, natal.year.stem.element);
  const src: Record<AreaId, { fam: Family; source: string }> = {
    growth: { fam: dominant, source: `Your element mix leans ${FAMILY_NAME[dominant]}` },
    career: { fam: monthFam, source: `Your Month pillar brings ${FAMILY_NAME[monthFam]}` },
    love: { fam: loveFam, source: `Your Day ${natal.day.branch.animal} brings ${FAMILY_NAME[loveFam]}` },
    family: { fam: yearFam, source: `Your Year pillar brings ${FAMILY_NAME[yearFam]}` },
  };
  return {
    areas: AREAS.map((id) => ({ id, title: AREA_META[id].title, text: LIFE_AREA[id][src[id].fam], source: src[id].source })),
  };
}
