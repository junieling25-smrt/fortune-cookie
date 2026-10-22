import { useMemo, useState } from "react";
import { readWalk, type Profile } from "../engine/reading";

type Spot = { lat: number; lon: number; from: "here" | "birthplace" };

const WALK_M = 800; // about a ten-minute walk
const TILE = 256;
const rad = (d: number) => (d * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;

/** The point `m` meters away on a compass bearing. */
function destination(lat: number, lon: number, bearing: number, m: number) {
  const d = m / 6371000;
  const p1 = rad(lat);
  const t = rad(bearing);
  const p2 = Math.asin(
    Math.sin(p1) * Math.cos(d) + Math.cos(p1) * Math.sin(d) * Math.cos(t),
  );
  const l2 =
    rad(lon) +
    Math.atan2(
      Math.sin(t) * Math.sin(d) * Math.cos(p1),
      Math.cos(d) - Math.sin(p1) * Math.sin(p2),
    );
  return { lat: deg(p2), lon: ((deg(l2) + 540) % 360) - 180 };
}

/** Web Mercator world pixels at zoom z. */
function project(lat: number, lon: number, z: number) {
  const size = TILE * 2 ** z;
  const s = Math.sin(rad(lat));
  return {
    x: ((lon + 180) / 360) * size,
    y: (0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)) * size,
  };
}

const mapsLink = (place: string, at: { lat: number; lon: number }) =>
  `https://www.google.com/maps/search/${encodeURIComponent(place)}/@${at.lat.toFixed(5)},${at.lon.toFixed(5)},16z`;

function MapView({
  here,
  there,
}: {
  here: Spot;
  there: { lat: number; lon: number };
}) {
  // Pick the zoom that puts the walk about 180 pixels long.
  const mpp1 = 156543.03 * Math.cos(rad(here.lat)); // meters per pixel at zoom 0
  const z = Math.max(
    12,
    Math.min(17, Math.round(Math.log2((180 * mpp1) / WALK_M))),
  );
  const a = project(here.lat, here.lon, z);
  const b = project(there.lat, there.lon, z);
  const c = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  const n = 2 ** z;
  const tiles: { x: number; y: number; key: string }[] = [];
  for (
    let ty = Math.floor((c.y - 220) / TILE);
    ty <= Math.floor((c.y + 220) / TILE);
    ty++
  )
    for (
      let tx = Math.floor((c.x - 620) / TILE);
      tx <= Math.floor((c.x + 620) / TILE);
      tx++
    )
      if (ty >= 0 && ty < n) tiles.push({ x: tx, y: ty, key: `${tx}/${ty}` });
  const at = (p: { x: number; y: number }) => ({ x: p.x - c.x, y: p.y - c.y });
  const u = at(a);
  const t = at(b);
  return (
    <div
      className="walk-map"
      role="img"
      aria-label="Map from where you are to a spot about ten minutes away in today's direction"
    >
      {tiles.map((tl) => (
        <img
          key={tl.key}
          className="walk-tile"
          alt=""
          draggable={false}
          onError={(e) => (e.currentTarget.style.visibility = "hidden")}
          src={`https://tile.openstreetmap.org/${z}/${((tl.x % n) + n) % n}/${tl.y}.png`}
          style={{
            left: `calc(50% + ${tl.x * TILE - c.x}px)`,
            top: `calc(50% + ${tl.y * TILE - c.y}px)`,
          }}
        />
      ))}
      <svg className="walk-overlay" aria-hidden="true">
        <svg x="50%" y="50%" overflow="visible">
          <line x1={u.x} y1={u.y} x2={t.x} y2={t.y} className="walk-line" />
          <circle cx={u.x} cy={u.y} r="13" className="walk-halo" />
          <circle cx={u.x} cy={u.y} r="7" className="walk-me" />
          <g transform={`translate(${t.x} ${t.y})`} className="walk-pin">
            <path d="M0 0 C -4 -8, -11 -12, -11 -20 A 11 11 0 1 1 11 -20 C 11 -12, 4 -8, 0 0 Z" />
            <circle cy="-20" r="4.2" fill="#fff" />
          </g>
        </svg>
      </svg>
      <span className="walk-credit">
        ©{" "}
        <a
          href="https://www.openstreetmap.org/copyright"
          target="_blank"
          rel="noreferrer"
        >
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
        <text
          key={l}
          x={Math.sin(rad(i * 90)) * 36}
          y={-Math.cos(rad(i * 90)) * 36 + 4}
          textAnchor="middle"
          className="wc-letter"
        >
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

/** Today's joy direction, with a short walk drawn on a real map. */
export function WalkPage({
  profile,
  date,
}: {
  profile: Profile;
  date: string;
}) {
  const walk = useMemo(() => readWalk(profile, date), [profile, date]);
  const [spot, setSpot] = useState<Spot | null>(null);
  const [status, setStatus] = useState<"idle" | "asking" | "denied">("idle");
  const there = spot ? destination(spot.lat, spot.lon, walk.deg, WALK_M) : null;

  const locate = () => {
    if (!navigator.geolocation) return setStatus("denied");
    setStatus("asking");
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setSpot({
          lat: p.coords.latitude,
          lon: p.coords.longitude,
          from: "here",
        });
        setStatus("idle");
      },
      () => setStatus("denied"),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 },
    );
  };

  return (
    <section className="page-body" aria-labelledby="walk-title">
      <header className="page-head">
        <p className="eyebrow">Walk</p>
        <h1 id="walk-title">Head {walk.dir.toLowerCase()} today</h1>
        <p className="lede">
          A short walk in the day's direction, with a stop that suits your
          chart.
        </p>
      </header>

      <div className="block walk-head" data-el={walk.element}>
        <Compass deg={walk.deg} short={walk.short} />
        <p>{walk.note}</p>
      </div>

      {spot && there ? (
        <MapView here={spot} there={there} />
      ) : (
        <div className="block walk-ask">
          <p>
            See a ten-minute walk {walk.dir.toLowerCase()} from where you are.
          </p>
          <div className="walk-ask-actions">
            <button
              type="button"
              className="btn btn-cookie"
              onClick={locate}
              disabled={status === "asking"}
            >
              {status === "asking" ? "Finding you…" : "Use my location"}
            </button>
            <button
              type="button"
              className="btn btn-soft"
              onClick={() =>
                setSpot({
                  lat: profile.birth.lat,
                  lon: profile.birth.lon,
                  from: "birthplace",
                })
              }
            >
              Use my birthplace
            </button>
          </div>
          {status === "denied" ? (
            <p className="form-error">
              Couldn't get your location. You can use your birthplace instead.
            </p>
          ) : null}
          <p className="hint">
            Your location stays in this browser tab and is never saved.
          </p>
        </div>
      )}
      {spot?.from === "birthplace" ? (
        <p className="hint">
          Showing {profile.birth.place}.{" "}
          <button type="button" className="link-btn" onClick={locate}>
            Use my location
          </button>
        </p>
      ) : null}

      <div className="block">
        <p className="label block-label">Places to look for</p>
        <ul className="walk-places">
          {walk.places.map((p) => (
            <li key={p}>
              {there ? (
                <a
                  className="chip-btn"
                  href={mapsLink(p, there)}
                  target="_blank"
                  rel="noreferrer"
                >
                  {p} ↗
                </a>
              ) : (
                <span className="chip-btn is-static">{p}</span>
              )}
            </li>
          ))}
        </ul>
        <p className="hint">
          {there
            ? "Tap one to search near the pin."
            : "Share a location to search near your walk."}
        </p>
      </div>
    </section>
  );
}
