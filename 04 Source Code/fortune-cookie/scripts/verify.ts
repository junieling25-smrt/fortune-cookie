/**
 * Fortune Cookie engine checks. Run with `npm test`.
 *
 * 1. Astronomy and calendar anchors against published sources.
 * 2. 4,000 random charts against lunar-javascript, an independent implementation.
 * 3. Reading behaviour: variety, reachability of every authored line, step rotation, tone spread.
 * 4. Copy lint: the house rules in src/engine/copy.ts, enforced.
 */
import * as copy from "../src/engine/copy";
import * as more from "../src/engine/copy-more";
import * as guide from "../src/engine/copy-guide";
import { readFileSync } from "node:fs";
import { computePillars, dayPillarForCivilDate, jdToDate, springStartJD, zonedWallClockToMs } from "../src/engine/pillars";
import { matchRaw, readChart, readDay, readLife, readMatch, readMonth, readYear, readYears, type BirthDetails, type Person } from "../src/engine/reading";
// @ts-expect-error untyped test-only dependency
import lunar from "lunar-javascript";

type EightChar = { setSect: (n: number) => void; getYear: () => string; getMonth: () => string; getDay: () => string; getTime: () => string };
const { Solar } = lunar as { Solar: { fromYmdHms: (...a: number[]) => { getLunar: () => { getEightChar: () => EightChar } } } };

let fail = 0;
const check = (name: string, got: string, want: string) => {
  const ok = got === want;
  if (!ok) fail++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name.padEnd(48)} ${got}${ok ? "" : `   (expected ${want})`}`);
};
const assert = (name: string, ok: boolean, detail = "") => {
  if (!ok) fail++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name.padEnd(48)} ${detail}`);
};

// ------------------------------------------------------------------ 1
console.log("--- start of spring vs Hong Kong Observatory published times (UTC)");
for (const [y, want] of [[2024, "2024-02-04T08:27"], [2025, "2025-02-03T14:10"], [2026, "2026-02-03T20:02"]] as const) {
  check(`Start of spring ${y}`, jdToDate(springStartJD(y)).toISOString().slice(0, 16), want);
}

console.log("\n--- day pillars vs published 60-day cycle anchors");
check("1970-01-01", dayPillarForCivilDate(1970, 1, 1).cn, "辛巳");
check("2000-01-01", dayPillarForCivilDate(2000, 1, 1).cn, "戊午");
check("2019-01-27 (cycle anchor)", dayPillarForCivilDate(2019, 1, 27).cn, "甲子");
check("2024-06-15", dayPillarForCivilDate(2024, 6, 15).cn, "庚戌");

console.log("\n--- full charts");
const f = computePillars(Date.UTC(2024, 5, 15, 12, 0), "UTC", 0, false);
check("2024-06-15 12:00 UTC (pyswisseph fixture)", [f.year.cn, f.month.cn, f.day.cn, f.hour.cn].join(" "), "甲辰 庚午 庚戌 壬午");
const sf = computePillars(zonedWallClockToMs(1994, 3, 17, 7, 42, "America/Los_Angeles"), "America/Los_Angeles", -122.4194, true);
check("Worked example, 1994-03-17 07:42 San Francisco", [sf.year.cn, sf.month.cn, sf.day.cn, sf.hour.cn].join(" "), "甲戌 丁卯 壬寅 甲辰");

// ------------------------------------------------------------------ 2
console.log("\n--- 4,000 random charts vs lunar-javascript");
const miss: Record<string, number> = { year: 0, month: 0, day: 0, hour: 0 };
let lateNight = 0;
const rnd = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1));
for (let i = 0; i < 4000; i++) {
  const y = rnd(1940, 2035), mo = rnd(1, 12), d = rnd(1, 28), h = rnd(0, 23), mi = rnd(0, 59);
  if (h === 23) { lateNight++; continue; }
  const mine = computePillars(Date.UTC(y, mo - 1, d, h - 8, mi), "Etc/GMT-8", 0, false);
  const ec = Solar.fromYmdHms(y, mo, d, h, mi, 0).getLunar().getEightChar();
  ec.setSect(2);
  const theirs = [ec.getYear(), ec.getMonth(), ec.getDay(), ec.getTime()];
  const ours = [mine.year.cn, mine.month.cn, mine.day.cn, mine.hour.cn];
  (["year", "month", "day", "hour"] as const).forEach((k, idx) => { if (ours[idx] !== theirs[idx]) miss[k]++; });
}
for (const k of ["year", "month", "day", "hour"]) check(`${k} pillar mismatches`, String(miss[k]), "0");
console.log(`      (${lateNight} births in the 11 PM hour skipped: known convention split between schools)`);

// ------------------------------------------------------------------ 3
console.log("\n--- readings");
const AREAS = ["growth", "career", "love", "family"] as const;
const pick = <T,>(xs: readonly T[]) => xs[rnd(0, xs.length - 1)];
const randomPerson = (): Person => ({
  name: pick(["", "Maya", "Sam"]),
  interests: AREAS.filter(() => Math.random() < 0.7),
  career: (["study", "job", "own", "search", "break"] as const).filter(() => Math.random() < 0.25),
  love: (["single", "dating", "partnered", "complicated"] as const).filter(() => Math.random() < 0.3),
  home: (["cat", "dog", "pet", "kids", "parents", "roommates", "solo"] as const).filter(() => Math.random() < 0.3),
  growth: (["energy", "skill", "confidence", "calm", "creative"] as const).filter(() => Math.random() < 0.25),
});
const people: BirthDetails[] = [
  { date: "1994-03-17", time: "07:42", timeKnown: true, place: "San Francisco", tz: "America/Los_Angeles", lat: 37.77, lon: -122.4194 },
  { date: "1988-11-02", time: "21:10", timeKnown: true, place: "Taipei", tz: "Asia/Taipei", lat: 25.03, lon: 121.5654 },
  { date: "2001-06-30", time: "14:05", timeKnown: true, place: "London", tz: "Europe/London", lat: 51.5, lon: -0.1276 },
  { date: "1997-09-09", time: "", timeKnown: false, place: "Toronto", tz: "America/Toronto", lat: 43.7, lon: -79.42 },
];
const fullPerson: Person = { name: "Maya", interests: [...AREAS], career: ["job"], love: ["partnered"], home: ["cat", "kids"], growth: ["calm"] };
const seen: Record<string, Set<string>> = {
  slip: new Set(), wear: new Set(), eat: new Set(), act: new Set(), listen: new Set(), ask: new Set(), season: new Set(), areaText: new Set(), areaTone: new Set(),
  step: new Set(), core: new Set(), forYou: new Set(), year: new Set(), yearArea: new Set(), life: new Set(),
};
const toneCount: Record<string, number> = { flowing: 0, steady: 0, mixed: 0, gentle: 0 };
const overallCount: Record<string, number> = { flowing: 0, steady: 0, mixed: 0, gentle: 0 };
const distinctPerChart: number[] = [];
const shortestSlipRepeat: number[] = [];
const shortestStepRepeat: number[] = [];
const days = 365;
const scores: number[] = [];
const asks: string[][] = [];

const extra = Array.from({ length: 500 }, () => ({
  birth: {
    date: `${rnd(1950, 2010)}-${String(rnd(1, 12)).padStart(2, "0")}-${String(rnd(1, 28)).padStart(2, "0")}`,
    time: `${String(rnd(0, 22)).padStart(2, "0")}:${String(rnd(0, 59)).padStart(2, "0")}`,
    timeKnown: true, place: "Singapore", tz: "Asia/Singapore", lat: 1.29, lon: 103.85,
  } as BirthDetails,
  person: randomPerson(),
}));

const dates = Array.from({ length: days }, (_, k) => new Date(Date.UTC(2026, 0, 1 + k)).toISOString().slice(0, 10));
[...people.map((birth) => ({ birth, person: fullPerson })), ...extra].forEach(({ birth, person }, idx) => {
  const profile = readChart(birth, person);
  const main = idx < people.length;
  const full = new Set<string>();
  const slipDays = new Map<string, number>();
  const stepDays = new Map<string, number>();
  let shortest = Infinity;
  let shortestStep = Infinity;
  const personAsks: string[] = [];
  const sampleDates = main ? dates : dates.filter((_, k) => k % 9 === idx % 9);
  sampleDates.forEach((date, k) => {
    const r = readDay(profile, date);
    seen.slip.add(r.keys.slip);
    seen.wear.add(r.tweaks.wear.color);
    seen.eat.add(r.tweaks.eat);
    seen.act.add(r.tweaks.do);
    seen.listen.add(r.tweaks.listen);
    scores.push(r.overall.score, ...r.areas.map((a) => a.score));
    seen.ask.add(r.keys.ask);
    seen.season.add(r.keys.season);
    seen.core.add(r.personal.text);
    r.areas.forEach((a) => {
      seen.areaText.add(`${a.id}.${a.text}`);
      seen.areaTone.add(`${a.id}.${a.tone}`);
      seen.step.add(`${a.id}.${a.step.replace(/\b[Yy]our (cat|dog|pets|pet)\b/g, "{pet}")}`);
      if (a.forYou) seen.forYou.add(a.forYou);
      toneCount[a.tone]++;
      if (main) {
        const last = stepDays.get(`${a.id}.${a.step}`);
        if (last !== undefined) shortestStep = Math.min(shortestStep, k - last);
        stepDays.set(`${a.id}.${a.step}`, k);
      }
    });
    overallCount[r.overall.tone]++;
    if (main) {
      full.add([r.slip, r.season.text, r.tweaks.eat, r.overall.ask, r.personal.text, ...r.areas.map((a) => a.text + a.toneLine + a.step)].join("|"));
      const last = slipDays.get(r.slip);
      if (last !== undefined) shortest = Math.min(shortest, k - last);
      slipDays.set(r.slip, k);
      personAsks.push(r.overall.ask);
    }
  });
  if (idx % 5 === 0) {
    const y = readYear(profile, pick(dates));
    seen.year.add(y.text);
    y.areas.forEach((a) => seen.yearArea.add(`${a.id}.${a.text}`));
    readLife(profile).areas.forEach((a) => seen.life.add(`${a.id}.${a.text}`));
  }
  if (main) {
    distinctPerChart.push(full.size);
    shortestSlipRepeat.push(shortest);
    shortestStepRepeat.push(shortestStep);
    asks.push(personAsks);
  }
});

console.log(`      distinct full readings per chart over ${days} days: ${distinctPerChart.join(", ")}`);
assert("every chart gets 330+ distinct readings a year", distinctPerChart.every((n) => n >= 330), distinctPerChart.join(", "));
assert("headline slip never repeats within 20 days", shortestSlipRepeat.every((n) => n >= 20), `shortest repeat: ${Math.min(...shortestSlipRepeat)} days`);
assert("a tiny step never repeats within 25 days", shortestStepRepeat.every((n) => n >= 25), `shortest repeat: ${Math.min(...shortestStepRepeat)} days`);
const sharedAsk = asks[0].filter((q, k) => q === asks[1][k]).length;
assert("two unrelated charts rarely share a question", sharedAsk < days * 0.1, `${sharedAsk} of ${days} days`);

const count = (o: object) => JSON.stringify(o).match(/"[^"]{12,}"/g)?.length ?? 0;
check("slip lines reached", String(seen.slip.size), String(Object.keys(copy.SLIP).length * 2));
check("wear colors reached", String(seen.wear.size), String(Object.values(more.TWEAK).flatMap((t) => t.wear).length));
check("eat tweaks reached", String(seen.eat.size), String(Object.values(more.TWEAK).flatMap((t) => t.eat).length));
check("do tweaks reached", String(seen.act.size), String(Object.values(more.TWEAK).flatMap((t) => t.do).length));
check("music kinds reached", String(seen.listen.size), String(Object.values(more.MUSIC).flat().length));
const sorted = [...scores].sort((a, b) => a - b);
const q = (p: number) => sorted[Math.floor(p * (sorted.length - 1))];
console.log(`      daily numbers: min ${sorted[0]}, 10% ${q(0.1)}, median ${q(0.5)}, 90% ${q(0.9)}, max ${sorted[sorted.length - 1]}`);
assert("daily numbers center near 85, never below 60, and still spread out", sorted[0] >= 60 && sorted[sorted.length - 1] <= 99 && q(0.5) >= 82 && q(0.5) <= 88 && q(0.9) - q(0.1) >= 16);
const allHigh = dates.slice(0, 120).filter((d) => readDay(readChart(people[0], fullPerson), d).areas.every((a) => a.score >= 95)).length;
assert("the four areas never all reach 95 on the same day", allHigh === 0, `${allHigh} days`);
check("ask lines reached", String(seen.ask.size), String(Object.keys(copy.ASK).length));
check("month-theme lines reached", String(seen.season.size), String(Object.keys(copy.SEASON).length));
check("area lines reached", String(seen.areaText.size), "40");
check("area tone lines reached", String(seen.areaTone.size), "16");
check("tiny steps reached", String(seen.step.size), String(Object.values(more.STEPS).flatMap((a) => Object.values(a).flat()).length));
check("your-element-today lines reached", String(seen.core.size), "50");
check("for-you lines reached", String(seen.forYou.size), String(count(more.CAREER_FOR) + count(more.LOVE_FOR) + count(more.HOME_FOR) + count(more.GROWTH_FOR)));
check("year themes reached", String(seen.year.size), String(Object.keys(more.YEAR).length));
check("year area lines reached", String(seen.yearArea.size), "20");
check("lifetime area lines reached", String(seen.life.size), "20");

const total = Object.values(toneCount).reduce((a, b) => a + b, 0);
const pct = (n: number, t: number) => `${((n / t) * 100).toFixed(0)}%`;
console.log(`      area tones: ${Object.entries(toneCount).map(([k, v]) => `${k} ${pct(v, total)}`).join(", ")}`);
const oTotal = Object.values(overallCount).reduce((a, b) => a + b, 0);
console.log(`      overall tones: ${Object.entries(overallCount).map(([k, v]) => `${k} ${pct(v, oTotal)}`).join(", ")}`);
assert("no tone is rarer than 8% or commoner than 45%", Object.values(toneCount).every((v) => v / total >= 0.08 && v / total <= 0.45));

const tz = readChart(people[3]);
assert("unknown birth time: hour pillar left out", tz.keys.length === 3 && !tz.pillars[3].known);
const noPets = readChart(people[0], { ...fullPerson, home: ["solo"], love: ["single"] });
const petHits = dates.flatMap((d) => readDay(noPets, d).areas.map((a) => a.step)).filter((t) => /\b(your cat|your dog|your pets?|a kid|story together|Cuddle|your person)\b/i.test(t));
assert("no pet, kid, or partner steps for a single person living solo", petHits.length === 0, petHits.slice(0, 3).join(" / "));
const m = readMonth(readChart(people[0], fullPerson), "2026-09-22");
assert("month view covers one solar month", m.days.length >= 29 && m.days.length <= 32, `${m.range}, ${m.days.length} days`);
const yr = readYear(readChart(people[0], fullPerson), "2026-09-22");
for (const n of [3, 5, 10]) {
  const ys = readYears(readChart(people[0], fullPerson), "2026-09-22", n);
  assert(`${n}-year view: ${n} rows from the current year`, ys.rows.length === n && ys.rows[0].current && ys.from === 2026, `${ys.from} to ${ys.to}, smoothest ${ys.smoothest?.year}`);
}
assert("year view has 12 months, one current", yr.months.length === 12 && yr.months.filter((x) => x.current).length === 1, `${yr.label} ${yr.range}`);

const pair = readMatch(readChart(people[0], fullPerson), readChart(people[1]), "Sam");
assert("compatibility gives a score and four rows", pair.score >= 50 && pair.score <= 99 && pair.rows.length === 5, `${pair.score}: ${pair.headline}`);
const selfMatch = readMatch(readChart(people[0]), readChart(people[0]), "Me");
const bonds = (["partner", "friend", "family", "work"] as const).map((r) => readMatch(readChart(people[0], fullPerson), readChart(people[1]), "Sam", r));
assert("each bond reads its own way, never below 65, and the bridge only lifts", bonds.every((m) => m.score >= 65 && m.bridge.score > m.score) && new Set(bonds.map((m) => m.rows[0].text)).size === 4, bonds.map((m) => `${m.rel} ${m.score}->${m.bridge.score}`).join(", "));
// Match chart: the evidence must add back up to exactly what the score used.
const evidenceSums = bonds.every((m) => {
  const e = m.evidence;
  const me = readChart(people[0], fullPerson);
  const them = readChart(people[1]);
  const raw = 60 + e.core.points + e.links.reduce((t, l) => t + l.points, 0) + (e.fillsHelpfulElement ? 6 : 0) + e.polarityPoints;
  return Math.abs(raw - matchRaw(me, them, m.rel)) < 1e-9;
});
assert("match evidence adds up to the raw score for every bond", evidenceSums);
assert("match evidence covers day, month, and year", bonds.every((m) => m.evidence.links.map((l) => l.key).join() === "day,month,year"));
const bondSeen = new Set<string>();
for (let i = 0; i < people.length; i++) for (let j = 0; j < people.length; j++) readMatch(readChart(people[i]), readChart(people[j]), "X").evidence.links.forEach((l) => bondSeen.add(l.bond));
for (let k = 0; k < 400 && bondSeen.size < 5; k++) {
  const d = (n: number) => `${1960 + (n % 50)}-${String(1 + (n % 12)).padStart(2, "0")}-${String(1 + (n % 27)).padStart(2, "0")}`;
  const a = { ...people[0], date: d(k * 7), timeKnown: false, time: "" };
  const b = { ...people[0], date: d(k * 13 + 5), timeKnown: false, time: "" };
  readMatch(readChart(a), readChart(b), "X").evidence.links.forEach((l) => bondSeen.add(l.bond));
}
check("match chart reaches every bond kind", [...bondSeen].sort().join(","), "clash,echo,harmony,none,trine");
assert("self-match: every pillar is the same animal", selfMatch.evidence.links.every((l) => l.bond === "echo"));
assert("compatibility is stable", selfMatch.score === readMatch(readChart(people[0]), readChart(people[0]), "Me").score);

// ------------------------------------------------------------------ 4
console.log("\n--- copy lint");
const strings: string[] = [];
const walk = (v: unknown) => {
  if (typeof v === "string") strings.push(v);
  else if (Array.isArray(v)) v.forEach(walk);
  else if (v && typeof v === "object") Object.values(v).forEach(walk);
};
walk(copy);
walk(more);
walk(guide);
const bad = (re: RegExp) => strings.filter((s) => re.test(s));
const rule = (name: string, re: RegExp) => {
  const hits = bad(re);
  assert(name, hits.length === 0, hits.length ? `\n        ${hits.join("\n        ")}` : `${strings.length} strings clean`);
};
rule("no Chinese characters", /[㐀-鿿]/);
rule("no em dashes", /—/);
rule("no fortune-teller future tense", /\b(will|destined|fate|doomed)\b/i);
rule("no luck talk", /\b(lucky|unlucky|bad luck|good luck)\b/i);
rule("no “missing element” framing", /\bmissing\b|\bbroken\b|\benemy\b/i);
rule("no “it's not X, it's Y”", /\b(it'?s|this is) not\b[^.]*\b(it'?s|but)\b/i);

// ------------------------------------------------------------------ 5
console.log("\n--- visual regression guards");
const css = readFileSync(new URL("../src/styles.css", import.meta.url), "utf8");
const slipRule = css.match(/\.slip\s*\{[\s\S]*?\n\}/)?.[0] ?? "";
assert("fortune slip does not mask its tooltip", !/\b(?:-webkit-)?mask\s*:/.test(slipRule));
assert("fortune slip keeps painted paper notches", /\.slip::before\s*,\s*\n\.slip::after\s*\{/.test(css));

console.log(fail === 0 ? "\nALL CHECKS PASSED" : `\n${fail} CHECK(S) FAILED`);
process.exit(fail === 0 ? 0 : 1);
