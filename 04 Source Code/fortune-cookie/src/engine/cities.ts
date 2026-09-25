import data from "./cities.json";

/**
 * 34,149 cities with at least 15,000 people, from GeoNames (geonames.org, CC BY 4.0),
 * each with coordinates and IANA time zone. Sorted by population, largest first.
 */
export type City = { name: string; region: string; country: string; lat: number; lon: number; tz: string };

type Row = [string, number, number, number, number, number];
const { admins, countries, tzs, rows } = data as { admins: string[]; countries: string[]; tzs: string[]; rows: Row[] };

const CITIES: City[] = rows.map(([name, a, c, lat, lon, t]) => ({ name, region: admins[a], country: countries[c], lat, lon, tz: tzs[t] }));

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const NAMES = CITIES.map((c) => normalize(c.name));
const HAYSTACK = CITIES.map((c) => normalize(`${c.name} ${c.region} ${c.country}`));

/**
 * The first word of the query must start the city name (or the whole query must
 * start it); any other words must appear in the region or country, so
 * "shaoyang, hunan" and "portland oregon" both work. Bigger cities rank first.
 */
export function searchCities(query: string, limit = 8): City[] {
  const q = normalize(query);
  if (q.length < 2) return [];
  const words = q.split(" ");
  const starts: City[] = [];
  const loose: City[] = [];
  for (let i = 0; i < CITIES.length && starts.length < limit; i++) {
    if (NAMES[i].startsWith(q)) {
      starts.push(CITIES[i]);
    } else if (loose.length < limit && NAMES[i].startsWith(words[0]) && words.slice(1).every((w) => HAYSTACK[i].includes(w))) {
      loose.push(CITIES[i]);
    } else if (loose.length < limit && q.length >= 4 && words.length === 1 && NAMES[i].includes(q)) {
      loose.push(CITIES[i]);
    }
  }
  return [...starts, ...loose].slice(0, limit);
}

export const describeCity = (c: City) =>
  [c.name, c.region && c.region !== c.name ? c.region : null, c.country].filter(Boolean).join(", ");

export function findCity(name: string): City | undefined {
  const q = normalize(name);
  return CITIES.find((c) => normalize(c.name) === q);
}

export const CITY_COUNT = CITIES.length;
