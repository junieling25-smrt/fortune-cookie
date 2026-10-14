/**
 * Birthplaces: about 49,000 places with 5,000+ people (GeoNames), each with an
 * IANA time zone. Built by scripts/build-cities.mjs. The list is large, so it
 * loads on first use instead of with the app.
 */
export type City = { name: string; region: string; country: string; lat: number; lon: number; tz: string };

type Data = { countries: string[]; regions: string[]; zones: string[]; rows: [string, number, number, number, number, number][] };

let CITIES: City[] = [];
let NAMES: string[] = [];
let HAYSTACK: string[] = [];
let loading: Promise<City[]> | null = null;

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export function loadCities(): Promise<City[]> {
  loading ??= import("./cities.json").then((m) => {
    const d = (m.default ?? m) as unknown as Data;
    CITIES = d.rows.map(([name, r, c, lat, lon, z]) => ({ name, region: r >= 0 ? d.regions[r] : "", country: d.countries[c], lat, lon, tz: d.zones[z] }));
    NAMES = CITIES.map((c) => normalize(c.name));
    HAYSTACK = CITIES.map((c) => normalize(`${c.name} ${c.region} ${c.country}`));
    return CITIES;
  });
  return loading;
}

export const citiesReady = () => CITIES.length > 0;

/**
 * Ranked search, biggest places first within each rank: exact name, name
 * prefix, then every word found in "name region country" ("springfield
 * illinois", "paris tx").
 */
export function searchCities(query: string, limit = 8): City[] {
  const q = normalize(query);
  if (q.length < 2 || !CITIES.length) return [];
  const words = q.split(" ");
  const exact: City[] = [];
  const starts: City[] = [];
  const contains: City[] = [];
  for (let i = 0; i < CITIES.length; i++) {
    if (NAMES[i] === q) exact.push(CITIES[i]);
    else if (starts.length < limit && NAMES[i].startsWith(q)) starts.push(CITIES[i]);
    else if (contains.length < limit && words.every((w) => HAYSTACK[i].includes(w))) contains.push(CITIES[i]);
    if (exact.length >= limit) break;
  }
  return [...exact, ...starts, ...contains].slice(0, limit);
}

export const describeCity = (c: City) => [c.name, c.region && c.region !== c.name ? c.region : null, c.country].filter(Boolean).join(", ");

export function findCity(name: string): City | undefined {
  const q = normalize(name);
  return CITIES.find((_, i) => NAMES[i] === q);
}

const distKm = (a: { lat: number; lon: number }, b: { lat: number; lon: number }) => {
  const r = Math.PI / 180;
  const x = (b.lon - a.lon) * r * Math.cos(((a.lat + b.lat) / 2) * r);
  const y = (b.lat - a.lat) * r;
  return Math.sqrt(x * x + y * y) * 6371;
};

/** The closest listed place to a point, and how far away it is. */
export function nearestCity(lat: number, lon: number): { city: City; km: number } | null {
  let best: City | null = null;
  let bd = Infinity;
  for (const c of CITIES) {
    if (Math.abs(c.lat - lat) > 3) continue;
    const d = distKm({ lat, lon }, c);
    if (d < bd) [best, bd] = [c, d];
  }
  return best ? { city: best, km: bd } : null;
}

/** The biggest places inside a box, for the map. */
export function citiesIn(box: { n: number; s: number; e: number; w: number }, limit: number): City[] {
  const out: City[] = [];
  const wrap = box.w > box.e;
  for (const c of CITIES) {
    if (c.lat > box.n || c.lat < box.s) continue;
    if (wrap ? c.lon < box.w && c.lon > box.e : c.lon < box.w || c.lon > box.e) continue;
    out.push(c);
    if (out.length >= limit) break;
  }
  return out;
}
