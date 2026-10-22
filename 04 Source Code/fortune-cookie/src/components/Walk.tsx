import { useEffect, useMemo, useState } from "react";
import { EXPLORE, readWalk, type ExploreItem, type Profile, type Walk } from "../engine/reading";

type Spot = { lat: number; lon: number };
type Place = { name: string; kind: string; el: string; lat: number; lon: number; dist: number; off: number };
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

type Raw = { name: string; kind: string; el: string; lat: number; lon: number };
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

/** Does a set of OpenStreetMap tags pass a filter like ["cuisine"~"sushi"]["amenity"="cafe"]? */
function passes(filter: string, tags: Record<string, string>) {
  return [...filter.matchAll(/\["([^"]+)"(=|!=|~)"([^"]+)"\]/g)].every(([, k, op, v]) => {
    const t = tags[k];
    if (op === "=") return t === v;
    if (op === "!=") return t !== v;
    return t != null && new RegExp(v).test(t);
  });
}

/** The cone of today's direction, as a polygon. */
const cone = (spot: Spot, walk: Walk) => [spot, ...Array.from({ length: 9 }, (_, i) => destination(spot.lat, spot.lon, walk.deg - CONE + i * 10, RADIUS))];

/** Overpass: one query for every kind in the category, asked only inside the cone. */
async function fromOverpass(spot: Spot, walk: Walk, items: ExploreItem[], signal: AbortSignal): Promise<Raw[]> {
  const poly = `(poly:"${cone(spot, walk).map((p) => `${p.lat.toFixed(5)} ${p.lon.toFixed(5)}`).join(" ")}")`;
  const parts = items.flatMap((it) => it.osm.flatMap((f) => [`node${f}["name"]${poly};`, `way${f}["name"]${poly};`]));
  const query = `[out:json][timeout:15];(${parts.join("")});out center 1000;`;
  type Osm = { elements: { lat?: number; lon?: number; center?: { lat: number; lon: number }; tags?: Record<string, string> }[] };
  const data = await getJson<Osm>(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`, signal, 9000);
  return data.elements.flatMap((e) => {
    const lat = e.lat ?? e.center?.lat;
    const lon = e.lon ?? e.center?.lon;
    const tags = e.tags ?? {};
    const it = items.find((i) => i.osm.some((f) => passes(f, tags)));
    return lat != null && lon != null && tags.name && it ? [{ name: tags.name, kind: it.label, el: it.el, lat, lon }] : [];
  });
}

/** Nominatim: one plain search per kind inside the box around the cone, one a second. */
async function fromNominatim(spot: Spot, walk: Walk, items: ExploreItem[], signal: AbortSignal, onHits: (r: Raw[]) => void): Promise<void> {
  const pts = cone(spot, walk);
  const box = [Math.min(...pts.map((p) => p.lon)), Math.max(...pts.map((p) => p.lat)), Math.max(...pts.map((p) => p.lon)), Math.min(...pts.map((p) => p.lat))].map((n) => n.toFixed(5)).join(",");
  const seen = new Set<string>();
  let answered = 0;
  for (const it of items) {
    if (seen.has(it.phrase)) continue;
    seen.add(it.phrase);
    if (seen.size > 1) await new Promise((r) => window.setTimeout(r, 1000));
    if (signal.aborted) return;
    type Hit = { lat: string; lon: string; name?: string };
    const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=40&bounded=1&viewbox=${box}&q=${encodeURIComponent(it.phrase)}`;
    try {
      const hits = await getJson<Hit[]>(url, signal, 6000);
      answered++;
      onHits(hits.flatMap((h) => (h.name ? [{ name: h.name, kind: it.label, el: it.el, lat: Number(h.lat), lon: Number(h.lon) }] : [])));
    } catch {
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

/**
 * Overpass and Nominatim side by side, feeding one pool that's shown as it
 * grows. Done when both answer, or sooner once there's plenty to show.
 */
function search(spot: Spot, walk: Walk, items: ExploreItem[], signal: AbortSignal, onList: (list: Place[], done: boolean) => void, onError: () => void) {
  const overCtl = new AbortController();
  const nomCtl = new AbortController();
  signal.addEventListener("abort", () => (overCtl.abort(), nomCtl.abort()));
  let pool: Raw[] = [];
  let settled = false;
  let overDone = false;
  let nomDone = false;
  const finish = () => {
    if (settled || signal.aborted) return;
    settled = true;
    overCtl.abort();
    nomCtl.abort();
    onList(rank(pool, spot, walk), true);
  };
  const check = () => {
    const n = rank(pool, spot, walk).length;
    if ((overDone && nomDone) || (overDone && n >= 6) || (nomDone && n >= 3)) finish();
  };
  const over = fromOverpass(spot, walk, items, overCtl.signal)
    .then((raw) => {
      pool = [...raw, ...pool];
      if (!settled) onList(rank(pool, spot, walk), false);
    })
    .finally(() => {
      overDone = true;
      check();
    });
  const nom = fromNominatim(spot, walk, items, nomCtl.signal, (hits) => {
    if (settled || signal.aborted) return;
    pool = [...pool, ...hits];
    onList(rank(pool, spot, walk), false);
  }).finally(() => {
    nomDone = true;
    check();
  });
  Promise.allSettled([over, nom]).then(([o, n]) => {
    if (settled || signal.aborted) return;
    if (o.status === "rejected" && n.status === "rejected") {
      settled = true;
      onError();
    } else finish();
  });
}

/**
 * Kept for the day, per spot and kind, so coming back is instant: in memory
 * for this visit, and in this browser for later ones. The spot itself is kept
 * for the browser tab.
 */
const memory = new Map<string, Place[]>();
const cacheKey = (spot: Spot, date: string, cat: string) => `fc.places3.${date}.${cat}.${spot.lat.toFixed(3)},${spot.lon.toFixed(3)}`;
const readCache = (k: string): Place[] | null => {
  if (memory.has(k)) return memory.get(k) as Place[];
  try {
    const v = JSON.parse(window.localStorage.getItem(k) ?? "null");
    return Array.isArray(v) ? v : null;
  } catch {
    return null;
  }
};
const writeCache = (k: string, list: Place[]) => {
  memory.set(k, list);
  try {
    window.localStorage.setItem(k, JSON.stringify(list));
  } catch {
    /* fine */
  }
};
const SPOT_KEY = "fc.spot";
const readSpot = (): Spot | null => {
  try {
    const v = JSON.parse(window.sessionStorage.getItem(SPOT_KEY) ?? "null");
    return v && typeof v.lat === "number" && typeof v.lon === "number" ? v : null;
  } catch {
    return null;
  }
};
const writeSpot = (s: Spot) => {
  try {
    window.sessionStorage.setItem(SPOT_KEY, JSON.stringify(s));
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
  const cats = useMemo(
    () => [
      { id: "eat", label: "Eat today", items: walk.eat.items },
      { id: "mine", label: `For your ${walk.element}`, items: walk.mine },
      ...EXPLORE,
    ],
    [walk],
  );
  const [spot, setSpot] = useState<Spot | null>(readSpot);
  const [status, setStatus] = useState<"asking" | "denied" | "ok">(() => (readSpot() ? "ok" : "asking"));
  const [cat, setCat] = useState<string | null>(null);
  const [found, setFound] = useState<Found | null>(null);
  const [pick, setPick] = useState(0);
  const [fresh, setFresh] = useState(0);

  const locate = (then?: () => void) => {
    if (!navigator.geolocation) return setStatus("denied");
    setStatus("asking");
    navigator.geolocation.getCurrentPosition(
      (p) => {
        const s = { lat: p.coords.latitude, lon: p.coords.longitude };
        writeSpot(s);
        setSpot(s);
        setStatus("ok");
        then?.();
      },
      () => setStatus("denied"),
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 600000 },
    );
  };

  // Ask for the location once per tab; coming back to the page reuses it.
  useEffect(() => {
    if (!spot) locate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Only search once a kind is picked, and only that kind. Saved results come back instantly.
  useEffect(() => {
    if (!spot || !cat) return;
    const items = cats.find((c) => c.id === cat)?.items ?? [];
    const key = cacheKey(spot, date, cat);
    setPick(0);
    const cached = fresh ? null : readCache(key);
    if (cached) return setFound({ status: "done", list: cached });
    const ctl = new AbortController();
    setFound({ status: "loading", list: [] });
    search(
      spot,
      walk,
      items,
      ctl.signal,
      (list, done) => {
        setFound({ status: done ? "done" : "loading", list });
        if (done) writeCache(key, list);
      },
      () => setFound({ status: "error", list: [] }),
    );
    return () => ctl.abort();
  }, [spot, cat, cats, walk, date, fresh]);

  const refresh = () =>
    locate(() => {
      setFound(null);
      setFresh((n) => n + 1);
    });

  const places = cat ? (found?.list ?? []) : [];
  const current = cats.find((c) => c.id === cat);

  return (
    <section className="page-body" aria-labelledby="walk-title">
      <header className="page-head">
        <p className="eyebrow">Explore</p>
        <h1 id="walk-title">Head {walk.dir.toLowerCase()} today</h1>
        <p className="lede">Pick what you feel like, and we'll look {walk.dir.toLowerCase()} of you.</p>
      </header>

      <div className="block walk-head" data-el={walk.element}>
        <Compass deg={walk.deg} short={walk.short} />
        <p>
          {walk.note} Places that carry {walk.element} get a <span className="suits">Suits today</span> tag.
        </p>
      </div>

      {spot ? (
        <>
          <div className="explore-cats" role="radiogroup" aria-label="What to look for">
            {cats.map((c) => (
              <button key={c.id} type="button" role="radio" aria-checked={cat === c.id} className={`chip-btn ${cat === c.id ? "is-on" : ""}`} onClick={() => setCat(c.id)}>
                {c.label}
              </button>
            ))}
          </div>
          {cat === "eat" ? <p className="hint">Today's eat tweak: {walk.eat.text}. We look for {walk.eat.items.map((i) => i.label.toLowerCase()).join(", ")}.</p> : null}
          <MapView here={spot} walk={walk} places={places} pick={pick} />
          <div className="block walk-results">
            <div className="walk-results-head">
              <p className="label block-label">{current ? `${current.label} ${walk.dir.toLowerCase()} of you` : `Places ${walk.dir.toLowerCase()} of you`}</p>
              <button type="button" className="btn btn-soft btn-small" onClick={refresh} disabled={status === "asking" || found?.status === "loading"}>
                ↻ Refresh
              </button>
            </div>
            {!cat ? <p className="muted">Pick a kind of place above to start looking.</p> : null}
            {cat && found?.status === "loading" ? <p className="muted">{places.length ? "Finding more…" : `Looking ${walk.dir.toLowerCase()}…`}</p> : null}
            {cat && found?.status === "error" ? (
              <p className="muted">
                The map service is busy right now.{" "}
                <button type="button" className="link-btn" onClick={() => setFresh((n) => n + 1)}>
                  Try again
                </button>
              </p>
            ) : null}
            {cat && found?.status === "done" && !places.length ? (
              <p className="muted">Nothing like that on the map {walk.dir.toLowerCase()} of you. Try another kind, or head that way anyway.</p>
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
                        {p.el === walk.element ? <span className="suits">Suits today</span> : null}
                      </span>
                    </span>
                  </button>
                  <a className="btn btn-soft btn-small" href={walkLink(spot, p)} target="_blank" rel="noreferrer">
                    Directions ↗
                  </a>
                </li>
              ))}
            </ol>
            {cat && found?.status === "done" && places.length ? (
              <p className="hint">These are just a few nearby examples. You're welcome to go farther {walk.dir.toLowerCase()}.</p>
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
                <button type="button" className="btn btn-cookie" onClick={() => locate()}>
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
