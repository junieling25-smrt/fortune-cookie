import { useEffect, useMemo, useState } from "react";
import { readWalk, type Profile, type Walk } from "../engine/reading";

type Spot = { lat: number; lon: number; from: "here" | "birthplace" };
type Place = { name: string; kind: string; lat: number; lon: number; dist: number; off: number };
type Found = { status: "loading" | "done" | "error"; list: Place[] };

const TILE = 256;
const CONE = 40; // degrees either side of today's direction
const NEAR = 120; // closer than this isn't really a walk
const FAR = [1500, 2500]; // meters; the wider radius is a second try
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
  `https://www.google.com/maps/dir/?api=1&origin=${from.lat.toFixed(5)},${from.lon.toFixed(5)}&destination=${to.lat.toFixed(5)},${to.lon.toFixed(5)}&travelmode=walking`;

/**
 * Named places of the day's element that sit in today's direction, from
 * OpenStreetMap. Each kind is asked for once; places inside the cone are
 * ranked by how close they are and how straight ahead.
 */
async function findPlaces(spot: Spot, walk: Walk, radius: number, signal: AbortSignal): Promise<Place[]> {
  const kindOf = new Map<string, string>();
  const parts = walk.places.flatMap((p) =>
    p.tags.map((t) => {
      kindOf.set(t, p.label);
      const [k, v] = t.split("=");
      return `nwr["${k}"="${v}"]["name"](around:${radius},${spot.lat.toFixed(5)},${spot.lon.toFixed(5)});`;
    }),
  );
  const query = `[out:json][timeout:20];(${parts.join("")});out center tags 400;`;
  const res = await fetch("https://overpass-api.de/api/interpreter", { method: "POST", body: new URLSearchParams({ data: query }), signal });
  if (!res.ok) throw new Error(String(res.status));
  const data = (await res.json()) as { elements: { lat?: number; lon?: number; center?: { lat: number; lon: number }; tags?: Record<string, string> }[] };
  const seen = new Set<string>();
  const out: Place[] = [];
  for (const e of data.elements) {
    const lat = e.lat ?? e.center?.lat;
    const lon = e.lon ?? e.center?.lon;
    const name = e.tags?.name;
    if (lat == null || lon == null || !name || seen.has(name)) continue;
    const tag = [...kindOf.keys()].find((t) => {
      const [k, v] = t.split("=");
      return e.tags?.[k] === v;
    });
    const { dist, bearing } = legTo(spot, { lat, lon });
    const off = Math.abs(((bearing - walk.deg + 540) % 360) - 180);
    if (off > CONE || dist < NEAR || dist > radius) continue;
    seen.add(name);
    out.push({ name, kind: tag ? (kindOf.get(tag) as string) : "Place", lat, lon, dist, off });
  }
  return out.sort((a, b) => a.dist * (1 + a.off / CONE) - b.dist * (1 + b.off / CONE)).slice(0, 6);
}

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

/** Today's joy direction, and real places that lie that way. */
export function WalkPage({ profile, date }: { profile: Profile; date: string }) {
  const walk = useMemo(() => readWalk(profile, date), [profile, date]);
  const [spot, setSpot] = useState<Spot | null>(null);
  const [status, setStatus] = useState<"idle" | "asking" | "denied">("idle");
  const [found, setFound] = useState<Found | null>(null);
  const [pick, setPick] = useState(0);

  useEffect(() => {
    if (!spot) return;
    const ctl = new AbortController();
    setFound({ status: "loading", list: [] });
    setPick(0);
    (async () => {
      try {
        let list = await findPlaces(spot, walk, FAR[0], ctl.signal);
        if (list.length < 2) list = await findPlaces(spot, walk, FAR[1], ctl.signal);
        setFound({ status: "done", list });
      } catch {
        if (!ctl.signal.aborted) setFound({ status: "error", list: [] });
      }
    })();
    return () => ctl.abort();
  }, [spot, walk]);

  const locate = () => {
    if (!navigator.geolocation) return setStatus("denied");
    setStatus("asking");
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setSpot({ lat: p.coords.latitude, lon: p.coords.longitude, from: "here" });
        setStatus("idle");
      },
      () => setStatus("denied"),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 },
    );
  };

  const kinds = walk.places.map((p) => p.label.toLowerCase());
  const places = found?.list ?? [];

  return (
    <section className="page-body" aria-labelledby="walk-title">
      <header className="page-head">
        <p className="eyebrow">Walk</p>
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
          {spot.from === "birthplace" ? (
            <p className="hint">
              Showing {profile.birth.place}.{" "}
              <button type="button" className="link-btn" onClick={locate}>
                Use my location
              </button>
            </p>
          ) : null}
          <div className="block walk-results">
            <p className="label block-label">
              Places {walk.dir.toLowerCase()} of you
            </p>
            {found?.status === "loading" ? <p className="muted">Looking {walk.dir.toLowerCase()}…</p> : null}
            {found?.status === "error" ? <p className="muted">Couldn't reach the map service. Try again in a minute.</p> : null}
            {found?.status === "done" && !places.length ? (
              <p className="muted">Nothing like that on the map {walk.dir.toLowerCase()} of you. A walk that way still counts.</p>
            ) : null}
            <ol className="walk-list">
              {places.map((p, i) => (
                <li key={p.name} className={i === pick ? "is-on" : ""}>
                  <button type="button" className="walk-item" onClick={() => setPick(i)} aria-pressed={i === pick}>
                    <span className="walk-num">{i + 1}</span>
                    <span className="walk-name">
                      {p.name}
                      <span className="muted small">
                        {p.kind} · {fmtDist(p.dist)} · about {minutes(p.dist)} min
                      </span>
                    </span>
                  </button>
                  <a className="btn btn-soft btn-small" href={walkLink(spot, p)} target="_blank" rel="noreferrer">
                    Walk there ↗
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </>
      ) : (
        <div className="block walk-ask">
          <p>Find places {walk.dir.toLowerCase()} of where you are.</p>
          <div className="walk-ask-actions">
            <button type="button" className="btn btn-cookie" onClick={locate} disabled={status === "asking"}>
              {status === "asking" ? "Finding you…" : "Use my location"}
            </button>
            <button type="button" className="btn btn-soft" onClick={() => setSpot({ lat: profile.birth.lat, lon: profile.birth.lon, from: "birthplace" })}>
              Use my birthplace
            </button>
          </div>
          {status === "denied" ? <p className="form-error">Couldn't get your location. You can use your birthplace instead.</p> : null}
          <p className="hint">Your location stays in this browser tab and is never saved.</p>
        </div>
      )}
    </section>
  );
}
