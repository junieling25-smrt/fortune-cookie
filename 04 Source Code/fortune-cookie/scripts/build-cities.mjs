/**
 * Builds src/engine/cities.json, each place with its region, country,
 * coordinates, and IANA time zone. Two layers:
 *
 * 1. scripts/cities-geonames15000.json: every GeoNames city with 15,000+
 *    people (34,149), with GeoNames' own region names. This is the base.
 * 2. all-the-cities: smaller towns with 5,000+ people, plus seats of
 *    government that GeoNames lists without a population (such as Shaoyang).
 *    A place is skipped when the base already has the same name within 15 km.
 *
 * Sources (dev dependencies): all-the-cities (GeoNames), country-state-city
 * (country and region names), @photostructure/tz-lookup (time zone from
 * coordinates). Region names are first learned from the previous hand-checked
 * list, then filled from country-state-city where the codes agree.
 *
 * Run: node scripts/build-cities.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const cities = require("all-the-cities");
const { Country, State } = require("country-state-city");
const tzlookup = require("@photostructure/tz-lookup");

const MIN_POP = 5000;
const OUT = new URL("../src/engine/cities.json", import.meta.url);

const COUNTRY_FIX = {
  US: "USA",
  GB: "UK",
  BS: "Bahamas",
  GM: "Gambia",
  CI: "Ivory Coast",
  CZ: "Czechia",
  FJ: "Fiji",
  HK: "Hong Kong",
  MO: "Macao",
  CG: "Republic of the Congo",
  PS: "Palestinian Territory",
  IM: "Isle of Man",
  KN: "Saint Kitts and Nevis",
  VC: "Saint Vincent and the Grenadines",
  MF: "Saint Martin",
  SX: "Sint Maarten",
  VG: "British Virgin Islands",
  VI: "US Virgin Islands",
  BL: "Saint Barthelemy",
  KR: "South Korea",
  KP: "North Korea",
};
const countryName = new Map(Country.getAllCountries().map((c) => [c.isoCode, COUNTRY_FIX[c.isoCode] ?? c.name]));

// Region names: learn GeoNames admin codes from the earlier list (name, region, country, lat, lon)...
const learned = new Map();
const previous = JSON.parse(readFileSync(new URL("./cities-v1.json", import.meta.url), "utf8"));
const byCountryName = new Map(Country.getAllCountries().map((c) => [c.name, c.isoCode]));
const OLD_ALIAS = { "United States of America": "US", "United Kingdom": "GB", Russia: "RU", "Republic of Serbia": "RS", "Ivory Coast": "CI", Czechia: "CZ", "South Korea": "KR", "North Korea": "KP", Vietnam: "VN", Laos: "LA", Syria: "SY", Iran: "IR", Myanmar: "MM", Tanzania: "TZ", Bolivia: "BO", Venezuela: "VE", Taiwan: "TW", Macedonia: "MK", "The Bahamas": "BS", "East Timor": "TL", Swaziland: "SZ", "Guinea Bissau": "GW", Moldova: "MD", "Congo (Kinshasa)": "CD", "Congo (Brazzaville)": "CG", "Macau S.A.R": "MO", "Papua New Guinea": "PG", "Trinidad and Tobago": "TT", Fiji: "FJ" };
const SEATS = new Set(["PPLC", "PPLA", "PPLA2"]);
const pool = cities.filter((c) => c.population >= MIN_POP || (c.population === 0 && SEATS.has(c.featureCode)));
const byCountry = new Map();
for (const c of pool) {
  if (!byCountry.has(c.country)) byCountry.set(c.country, []);
  byCountry.get(c.country).push(c);
}
// Each admin code's center, to reject a learned name whose source city sits far from that region.
const centers = new Map();
for (const c of pool) {
  const k = `${c.country}.${c.adminCode}`;
  const [lo, la] = c.loc.coordinates;
  const v = centers.get(k) ?? { la: 0, lo: 0, n: 0 };
  centers.set(k, { la: v.la + la, lo: v.lo + lo, n: v.n + 1 });
}
const km = (a, b, c, d) => Math.hypot((d - b) * Math.cos(((a + c) / 2) * (Math.PI / 180)), c - a) * 111;
const votes = new Map();
for (const [, region, country, lat, lon] of previous) {
  const iso = OLD_ALIAS[country] ?? byCountryName.get(country);
  if (!iso || !region) continue;
  let best = null;
  let bd = Infinity;
  for (const c of byCountry.get(iso) ?? []) {
    const [lo, la] = c.loc.coordinates;
    const d = (la - lat) ** 2 + (lo - lon) ** 2;
    if (d < bd) [best, bd] = [c, d];
  }
  if (!best || bd >= 0.1) continue;
  const key = `${iso}.${best.adminCode}`;
  const ctr = centers.get(key);
  if (ctr && ctr.n > 1 && km(lat, lon, ctr.la / ctr.n, ctr.lo / ctr.n) > 350) continue;
  const v = votes.get(key) ?? new Map();
  v.set(region, (v.get(region) ?? 0) + 1);
  votes.set(key, v);
}
// Keep a learned name only when the earlier list agrees with itself.
for (const [key, v] of votes) {
  const ranked = [...v.entries()].sort((a, b) => b[1] - a[1]);
  if (ranked.length === 1 || ranked[0][1] > ranked[1][1]) learned.set(key, ranked[0][0]);
}
// ...then fill the rest where country-state-city uses the same codes.
// Codes don't line up in every country, so a name is used only when that region's
// published center sits near the center of the places GeoNames gives the same code.
const states = new Map();
for (const st of State.getAllStates()) {
  const key = `${st.countryCode}.${st.isoCode}`;
  const ctr = centers.get(key);
  if (!ctr || !st.latitude) continue;
  if (km(Number(st.latitude), Number(st.longitude), ctr.la / ctr.n, ctr.lo / ctr.n) < 250) states.set(key, st.name);
}
const regionOf = (c) => learned.get(`${c.country}.${c.adminCode}`) ?? states.get(`${c.country}.${c.adminCode}`) ?? "";

const countries = [];
const regions = [];
const zones = [];
const idx = (list, map, v) => {
  if (!map.has(v)) {
    map.set(v, list.length);
    list.push(v);
  }
  return map.get(v);
};
const cMap = new Map();
const rMap = new Map();
const zMap = new Map();
const rows = [];
const round = (n) => Math.round(n * 1000) / 1000;
const norm = (t) => t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

// 1. the base list, in its own population order
const base = JSON.parse(readFileSync(new URL("./cities-geonames15000.json", import.meta.url), "utf8"));
const grid = new Map();
const cell = (lat, lon) => `${Math.round(lat * 4)}|${Math.round(lon * 4)}`;
const near = (name, lat, lon) => {
  for (let a = -1; a <= 1; a++)
    for (let b = -1; b <= 1; b++)
      for (const q of grid.get(`${Math.round(lat * 4) + a}|${Math.round(lon * 4) + b}`) ?? [])
        if (q.n === name && km(lat, lon, q.lat, q.lon) < 15) return true;
  return false;
};
const remember = (name, lat, lon) => {
  const k = cell(lat, lon);
  if (!grid.has(k)) grid.set(k, []);
  grid.get(k).push({ n: norm(name), lat, lon });
};
for (const [name, a, c, lat, lon, t] of base.rows) {
  const region = base.admins[a] ?? "";
  rows.push([name, region ? idx(regions, rMap, region) : -1, idx(countries, cMap, base.countries[c]), lat, lon, idx(zones, zMap, base.tzs[t])]);
  remember(name, lat, lon);
}
const fromBase = rows.length;

// 2. smaller towns and unlisted seats of government
const seen = new Set();
for (const c of [...pool].sort((a, b) => b.population - a.population)) {
  const country = countryName.get(c.country);
  if (!country) continue;
  const [lon, lat] = c.loc.coordinates;
  if (near(norm(c.name), lat, lon)) continue;
  const region = regionOf(c);
  const key = `${c.name}|${region}|${country}`;
  if (seen.has(key)) continue;
  seen.add(key);
  remember(c.name, lat, lon);
  rows.push([c.name, region ? idx(regions, rMap, region) : -1, idx(countries, cMap, country), round(lat), round(lon), idx(zones, zMap, tzlookup(lat, lon))]);
}

writeFileSync(OUT, JSON.stringify({ countries, regions, zones, rows }));
console.log(`${rows.length} places (${fromBase} from the 15,000+ list), ${countries.length} countries, ${regions.length} regions, ${zones.length} time zones`);
