import { useEffect, useMemo, useState } from "react";
import { readWalk, type Profile, type Walk } from "../engine/reading";

type Spot = { lat: number; lon: number };
type Place = { name: string; kind: string; lat: number; lon: number; dist: number; off: number };
type Found = { status: "loading" | "done" | "error"; list: Place[] };

const TILE = 256;
const CONE = 40; // degrees either side of today's direction
const NEAR = 120; // closer than this isn't really a walk
const rad = (d: number) => (d * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;

/** The point `m` meters away on a compass bearing. */
function destination(lat: number, lon: number, bearing: number, m: number) {
  const d = m / 6371000;
  const p1 = rad(lat);
  const t = rad(bearing);
  const p2 = Math.asin(Math.sin(p1) * Math.cos(d) + Math.cos(p1) * Math.sin(d) * Math.cos(t));
  const l2 = rad(lon) + Math.atan2(Math.sin(t) * Math.sin(d) * Math.cos(p1), Math.cos(d) - Math.sin(p1) * Math.sin(p2));
  return { lat: deg(p2), lon: ((deg(l2) + 540) % 360) - 180 };
}

/** Distance in meters and compass bearing from a to b. */
function legTo(a: { lat: number; lon: number }, b: { lat: number; lon: number }) {
  const p1 = rad(a.lat);
  const p2 = rad(b.lat);
  const dl = rad(b.lon - a.lon);
  const h = Math.sin((p2 - p1) / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2;
  const dist = 2 * 6371000 * Math.asin(Math.sqrt(h));
  const bearing = (deg(Math.atan2(Math.sin(dl) * Math.cos(p2), Math.cos(p1) * Math.sin(p2) - Math.sin(p1) * Math.cos(p2) * Math.cos(dl))) + 360) % 360;
  return { dist, bearing };
}

/** Web Mercator world pixels at zoom z. */
function project(lat: number, lon: number, z: number) {
  const size = TILE * 2 ** z;
  const s = Math.sin(rad(lat));
  return { x: ((lon + 180) / 360) * size, y: (0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)) * size };
}

const minutes = (m: number) => Math.max(2, Math.round((m * 1.25) / 80)); // streets wind; about 80 m a minute
const fmtDist = (m: number) => (m < 1000 ? `${Math.round(m / 10) * 10} m` : `${(m / 1000).toFixed(1)} km`);
const walkLink = (from: Spot, to: Place) =>
  `https://www.google.com/maps/dir/?api=1&origin=${from.lat.toFixed(5)},${from.lon.toFixed(5)}&destination=${to.lat.toFixed(5)},${to.lon.toFixed(5)}${to.dist <= 1500 ? "&travelmode=walking" : ""}`;

type Raw = { name: string; kind: string; lat: number; lon: number };
const RADIUS = 2000; // meters, about a 30-minute walk at most

/** One fetch with its own time limit, also stopped when the page moves on. */
async function getJson<T>(url: string, signal: AbortSignal, ms: number): Promise<T> {
  const ctl = new AbortController();
  const stop = () => ctl.abort();
  signal.addEventListener("abort", stop);
  const timer = window.setTimeout(stop, ms);
  try {
    const res = await fetch(url, { signal: ctl.signal });
    if (!res.ok) throw new Error(String(res.status));
    return (await res.json()) as T;
  } finally {
    window.clearTimeout(timer);
    signal.removeEventListener("abort", stop);
  }
}

/** First choice: one Overpass query for every kind of place, by OpenStreetMap tag. */
async function fromOverpass(spot: Spot, walk: Walk, signal: AbortSignal): Promise<Raw[]> {
  // Only ask inside today's cone, so a busy city's other directions don't crowd it out.
  const arc = [spot, ...Array.from({ length: 9 }, (_, i) => destination(spot.lat, spot.lon, walk.deg - CONE + i * 10, RADIUS))];
  const around = `(poly:"${arc.map((p) => `${p.lat.toFixed(5)} ${p.lon.toFixed(5)}`).join(" ")}")`;
  const tags = walk.places.flatMap((p) => p.tags.map((t) => ({ t, label: p.label })));
  const parts = tags.flatMap(({ t }) => {
    const [k, v] = t.split("=");
    return [`node["${k}"="${v}"]["name"]${around};`, `way["${k}"="${v}"]["name"]${around};`];
  });
  const query = `[out:json][timeout:15];(${parts.join("")});out center 1000;`;
  type Osm = { elements: { lat?: number; lon?: number; center?: { lat: number; lon: number }; tags?: Record<string, string> }[] };
  const data = await getJson<Osm>(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`, signal, 8000);
  return data.elements.flatMap((e) => {
    const lat = e.lat ?? e.center?.lat;
    const lon = e.lon ?? e.center?.lon;
    const hit = tags.find(({ t }) => {
      const [k, v] = t.split("=");
      return e.tags?.[k] === v;
    });
    return lat != null && lon != null && e.tags?.name ? [{ name: e.tags.name, kind: hit?.label ?? "Place", lat, lon }] : [];
  });
}

/** Nominatim, one plain search per kind inside the box around today's cone. Hands over each batch as it lands. */
async function fromNominatim(spot: Spot, walk: Walk, signal: AbortSignal, onHits: (r: Raw[]) => void): Promise<void> {
  const pts = [spot, ...[-CONE, -CONE / 2, 0, CONE / 2, CONE].map((o) => destination(spot.lat, spot.lon, walk.deg + o, RADIUS))];
  const box = [Math.min(...pts.map((p) => p.lon)), Math.max(...pts.map((p) => p.lat)), Math.max(...pts.map((p) => p.lon)), Math.min(...pts.map((p) => p.lat))].map((n) => n.toFixed(5)).join(",");
  let answered = 0;
  for (const [i, p] of walk.places.entries()) {
    if (i) await new Promise((r) => window.setTimeout(r, 1000)); // Nominatim asks for one request a second
    if (signal.aborted) return;
    type Hit = { lat: string; lon: string; name?: string };
    const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=40&bounded=1&viewbox=${box}&q=${encodeURIComponent(p.phrase)}`;
    try {
      const hits = await getJson<Hit[]>(url, signal, 6000);
      answered++;
      onHits(hits.flatMap((h) => (h.name ? [{ name: h.name, kind: p.label, lat: Number(h.lat), lon: Number(h.lon) }] : [])));
    } catch (e) {
      if (signal.aborted) return;
    }
  }
  if (!answered) throw new Error("no answer");
}

/**
 * Keeps the named places that sit in today's direction, ranked by how close
 * they are and how straight ahead; a near ring is preferred, a wider one fills in.
 */
function rank(raw: Raw[], spot: Spot, walk: Walk): Place[] {
  const seen = new Set<string>();
  const out: Place[] = [];
  for (const r of raw) {
    if (seen.has(r.name)) continue;
    const { dist, bearing } = legTo(spot, r);
    const off = Math.abs(((bearing - walk.deg + 540) % 360) - 180);
    if (off > CONE || dist < NEAR || dist > RADIUS) continue;
    seen.add(r.name);
    out.push({ ...r, dist, off });
  }
  const near = out.filter((p) => p.dist <= 1500);
  const pool = near.length >= 3 ? near : out;
  return pool.sort((a, b) => a.dist * (1 + a.off / CONE) - b.dist * (1 + b.off / CONE)).slice(0, 6);
}

/** Results are kept for the day, per spot, so coming back is instant. */
const cacheKey = (spot: Spot, date: string) => `fc.places2.${date}.${spot.lat.toFixed(3)},${spot.lon.toFixed(3)}`;
const readCache = (k: string): Place[] | null => {
  try {
    const v = JSON.parse(window.localStorage.getItem(k) ?? "null");
    return Array.isArray(v) ? v : null;
  } catch {
    return null;
  }
};
const writeCache = (k: string, list: Place[]) => {
  try {
    window.localStorage.setItem(k, JSON.stringify(list));
  } catch {
    /* fine */
  }
};

function MapView({ here, walk, places, pick }: { here: Spot; walk: Walk; places: Place[]; pick: number }) {
  const reach = Math.max(700, ...places.map((p) => p.dist));
  // Zoom so the farthest place sits about 170 pixels from you.
  const mpp0 = 156543.03 * Math.cos(rad(here.lat)); // meters per pixel at zoom 0
  const z = Math.max(12, Math.min(17, Math.round(Math.log2((170 * mpp0) / reach))));
  const a = project(here.lat, here.lon, z);
  const mid = destination(here.lat, here.lon, walk.deg, reach / 2);
  const c = project(mid.lat, mid.lon, z);
  const n = 2 ** z;
  const tiles: { x: number; y: number }[] = [];
  for (let ty = Math.floor((c.y - 220) / TILE); ty <= Math.floor((c.y + 220) / TILE); ty++)
    for (let tx = Math.floor((c.x - 620) / TILE); tx <= Math.floor((c.x + 620) / TILE); tx++) if (ty >= 0 && ty < n) tiles.push({ x: tx, y: ty });
  const at = (lat: number, lon: number) => {
    const p = project(lat, lon, z);
    return { x: p.x - c.x, y: p.y - c.y };
  };
  const u = { x: a.x - c.x, y: a.y - c.y };
  // the cone of today's direction, drawn as a soft wedge
  const r = (reach * 1.15 * 2 ** z) / mpp0;
  const edge = (b: number) => ({ x: u.x + Math.sin(rad(b)) * r, y: u.y - Math.cos(rad(b)) * r });
  const e1 = edge(walk.deg - CONE);
  const e2 = edge(walk.deg + CONE);
  const chosen = places[pick];
  const t = chosen ? at(chosen.lat, chosen.lon) : null;
  return (
    <div className="walk-map" role="img" aria-label={`Map of places ${walk.dir.toLowerCase()} of you`}>
      {tiles.map((tl) => (
        <img
          key={`${tl.x}/${tl.y}`}
          className="walk-tile"
          alt=""
          draggable={false}
          onError={(e) => (e.currentTarget.style.visibility = "hidden")}
          src={`https://tile.openstreetmap.org/${z}/${((tl.x % n) + n) % n}/${tl.y}.png`}
          style={{ left: `calc(50% + ${tl.x * TILE - c.x}px)`, top: `calc(50% + ${tl.y * TILE - c.y}px)` }}
        />
      ))}
      <svg className="walk-overlay" aria-hidden="true">
        <svg x="50%" y="50%" overflow="visible">
          <path className="walk-cone" d={`M${u.x} ${u.y} L${e1.x} ${e1.y} A ${r} ${r} 0 0 1 ${e2.x} ${e2.y} Z`} />
          {t ? <line x1={u.x} y1={u.y} x2={t.x} y2={t.y} className="walk-line" /> : null}
          {places.map((p, i) => {
            if (i === pick) return null;
            const q = at(p.lat, p.lon);
            return (
              <g key={p.name} transform={`translate(${q.x} ${q.y})`} className="walk-dot">
                <circle r="9" />
                <text y="3.5" textAnchor="middle">
                  {i + 1}
                </text>
              </g>
            );
          })}
          <circle cx={u.x} cy={u.y} r="13" className="walk-halo" />
          <circle cx={u.x} cy={u.y} r="7" className="walk-me" />
          {t ? (
            <g transform={`translate(${t.x} ${t.y})`} className="walk-pin">
              <path d="M0 0 C -4 -8, -11 -12, -11 -20 A 11 11 0 1 1 11 -20 C 11 -12, 4 -8, 0 0 Z" />
              <text y="-16" textAnchor="middle">
                {pick + 1}
              </text>
            </g>
          ) : null}
        </svg>
      </svg>
      <span className="walk-credit">
        ©{" "}
        <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">
          OpenStreetMap
        </a>{" "}
        contributors
      </span>
    </div>
  );
}

function Compass({ deg: d, short }: { deg: number; short: string }) {
  return (
    <svg className="walk-compass" viewBox="-50 -50 100 100" aria-hidden="true">
      <circle r="46" className="wc-ring" />
      {["N", "E", "S", "W"].map((l, i) => (
        <text key={l} x={Math.sin(rad(i * 90)) * 36} y={-Math.cos(rad(i * 90)) * 36 + 4} textAnchor="middle" className="wc-letter">
          {l}
        </text>
      ))}
      <g transform={`rotate(${d})`}>
        <path d="M0 -30 L9 4 L0 -2 L-9 4 Z" className="wc-arrow" />
      </g>
      <text y="22" textAnchor="middle" className="wc-short">
        {short}
      </text>
    </svg>
  );
}

/** Explore: today's joy direction, and real places that lie that way. */
export function WalkPage({ profile, date }: { profile: Profile; date: string }) {
  const walk = useMemo(() => readWalk(profile, date), [profile, date]);
  const [spot, setSpot] = useState<Spot | null>(null);
  const [status, setStatus] = useState<"asking" | "denied" | "ok">("asking");
  const [found, setFound] = useState<Found | null>(null);
  const [pick, setPick] = useState(0);
  const [tries, setTries] = useState(0);

  const locate = () => {
    if (!navigator.geolocation) return setStatus("denied");
    setStatus("asking");
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setSpot({ lat: p.coords.latitude, lon: p.coords.longitude });
        setStatus("ok");
      },
      () => setStatus("denied"),
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 600000 },
    );
  };

  // The page is about where you are, so it asks for your location straight away.
  useEffect(locate, []);

  // Overpass and Nominatim run side by side and feed one pool, shown as it
  // grows. It's done when both answer, or sooner once there's plenty to show.
  useEffect(() => {
    if (!spot) return;
    const key = cacheKey(spot, date);
    const cached = readCache(key);
    setPick(0);
    if (cached?.length) return setFound({ status: "done", list: cached });
    const ctl = new AbortController();
    const overCtl = new AbortController();
    const nomCtl = new AbortController();
    ctl.signal.addEventListener("abort", () => (overCtl.abort(), nomCtl.abort()));
    let pool: Raw[] = [];
    let settled = false;
    let overDone = false;
    let nomDone = false;
    const show = () => setFound({ status: "loading", list: rank(pool, spot, walk) });
    const finish = () => {
      if (settled || ctl.signal.aborted) return;
      settled = true;
      overCtl.abort();
      nomCtl.abort();
      const list = rank(pool, spot, walk);
      setFound({ status: "done", list });
      if (list.length >= 3) writeCache(key, list);
    };
    const check = () => {
      const n = rank(pool, spot, walk).length;
      if ((overDone && nomDone) || (overDone && n >= 6) || (nomDone && n >= 3)) finish();
    };
    setFound({ status: "loading", list: [] });
    const over = fromOverpass(spot, walk, overCtl.signal)
      .then((raw) => {
        pool = [...raw, ...pool];
        if (!settled) show();
      })
      .finally(() => {
        overDone = true;
        check();
      });
    const nom = fromNominatim(spot, walk, nomCtl.signal, (hits) => {
      if (settled || ctl.signal.aborted) return;
      pool = [...pool, ...hits];
      show();
    }).finally(() => {
      nomDone = true;
      check();
    });
    Promise.allSettled([over, nom]).then(([o, n]) => {
      if (settled || ctl.signal.aborted) return;
      if (o.status === "rejected" && n.status === "rejected") {
        settled = true;
        setFound({ status: "error", list: [] });
      } else finish();
    });
    return () => ctl.abort();
  }, [spot, walk, date, tries]);

  const kinds = walk.places.map((p) => p.label.toLowerCase());
  const places = found?.list ?? [];

  return (
    <section className="page-body" aria-labelledby="walk-title">
      <header className="page-head">
        <p className="eyebrow">Explore</p>
        <h1 id="walk-title">Head {walk.dir.toLowerCase()} today</h1>
        <p className="lede">Real places in the day's direction, picked for your element.</p>
      </header>

      <div className="block walk-head" data-el={walk.element}>
        <Compass deg={walk.deg} short={walk.short} />
        <p>
          {walk.note} Today that means a {kinds.slice(0, -1).join(", ")}, or {kinds[kinds.length - 1]}.
        </p>
      </div>

      {spot ? (
        <>
          <MapView here={spot} walk={walk} places={places} pick={pick} />
          <div className="block walk-results">
            <p className="label block-label">Places {walk.dir.toLowerCase()} of you</p>
            {found?.status === "loading" ? <p className="muted">{places.length ? "Finding more…" : `Looking ${walk.dir.toLowerCase()}…`}</p> : null}
            {found?.status === "error" ? (
              <p className="muted">
                The map service is busy right now.{" "}
                <button type="button" className="link-btn" onClick={() => setTries((t) => t + 1)}>
                  Try again
                </button>
              </p>
            ) : null}
            {found?.status === "done" && !places.length ? (
              <p className="muted">Nothing like that on the map {walk.dir.toLowerCase()} of you. Heading that way still counts.</p>
            ) : null}
            <ol className="walk-list">
              {places.map((p, i) => (
                <li key={p.name} className={i === pick ? "is-on" : ""}>
                  <button type="button" className="walk-item" onClick={() => setPick(i)} aria-pressed={i === pick}>
                    <span className="walk-num">{i + 1}</span>
                    <span className="walk-name">
                      {p.name}
                      <span className="muted small">
                        {p.kind} · {fmtDist(p.dist)}
                        {p.dist <= 1500 ? ` · ${minutes(p.dist)} min on foot` : ""}
                      </span>
                    </span>
                  </button>
                  <a className="btn btn-soft btn-small" href={walkLink(spot, p)} target="_blank" rel="noreferrer">
                    Directions ↗
                  </a>
                </li>
              ))}
            </ol>
            {found?.status === "done" ? (
              <p className="hint">
                These are just a few nearby examples. You're welcome to go farther {walk.dir.toLowerCase()}: any {kinds.slice(0, 2).join(" or ")} that way suits today too.
              </p>
            ) : null}
          </div>
        </>
      ) : (
        <div className="block walk-ask">
          {status === "asking" ? (
            <p className="muted">Finding where you are…</p>
          ) : (
            <>
              <p>To find places {walk.dir.toLowerCase()} of you, the app needs your location.</p>
              <div className="walk-ask-actions">
                <button type="button" className="btn btn-cookie" onClick={locate}>
                  Use my location
                </button>
              </div>
              <p className="hint">If nothing happens, allow location for this site in your browser settings.</p>
            </>
          )}
          <p className="hint">Your location stays in this browser tab and is never saved.</p>
        </div>
      )}
    </section>
  );
}
