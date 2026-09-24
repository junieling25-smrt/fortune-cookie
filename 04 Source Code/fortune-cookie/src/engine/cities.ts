import rows from "./cities.json";

/** 2,871 cities above 100,000 people, with coordinates and IANA time zone. */
export type City = { name: string; region: string; country: string; lat: number; lon: number; tz: string };

type Row = [string, string, string, number, number, string, number];

const COUNTRY_SHORT: Record<string, string> = {
  "United States of America": "USA",
  "United Kingdom": "UK",
};

const CITIES: City[] = (rows as Row[]).map(([name, region, country, lat, lon, tz]) => ({
  name,
  region,
  country: COUNTRY_SHORT[country] ?? country,
  lat,
  lon,
  tz,
}));

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

const HAYSTACK = CITIES.map((c) => normalize(`${c.name} ${c.region} ${c.country}`));
const NAMES = CITIES.map((c) => normalize(c.name));

/** Ranked prefix-then-substring search. Population order breaks ties. */
export function searchCities(query: string, limit = 7): City[] {
  const q = normalize(query.trim());
  if (q.length < 2) return [];
  const starts: City[] = [];
  const contains: City[] = [];
  for (let i = 0; i < CITIES.length; i++) {
    if (NAMES[i].startsWith(q)) {
      starts.push(CITIES[i]);
      if (starts.length >= limit) break;
    } else if (contains.length < limit && HAYSTACK[i].includes(q)) {
      contains.push(CITIES[i]);
    }
  }
  return [...starts, ...contains].slice(0, limit);
}

export const describeCity = (c: City) =>
  [c.name, c.region && c.region !== c.name ? c.region : null, c.country].filter(Boolean).join(", ");

export function findCity(name: string): City | undefined {
  const q = normalize(name);
  return CITIES.find((c) => normalize(c.name) === q);
}
