import tzlookup from "@photostructure/tz-lookup";
import { geoMercator, geoPath, type GeoPermissibleObjects } from "d3-geo";
import { useEffect, useMemo, useRef, useState } from "react";
import { feature, mesh } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import { citiesIn, describeCity, loadCities, nearestCity, type City } from "../engine/cities";
import type { Place } from "./PlaceField";

type Geo = { land: GeoPermissibleObjects; borders: GeoPermissibleObjects };
let geoCache: Promise<Geo> | null = null;
const loadGeo = () =>
  (geoCache ??= import("world-atlas/countries-50m.json").then((m) => {
    const topo = (m.default ?? m) as unknown as Topology<{ countries: GeometryCollection; land: GeometryCollection }>;
    return {
      land: feature(topo, topo.objects.land) as GeoPermissibleObjects,
      borders: mesh(topo, topo.objects.countries, (a, b) => a !== b) as GeoPermissibleObjects,
    };
  }));

const W = 640;
const H = 400;
const MAX_Z = 9;
const clampLat = (lat: number) => Math.max(-75, Math.min(80, lat));
const wrapLon = (lon: number) => ((((lon + 180) % 360) + 360) % 360) - 180;

/**
 * A world map for finding a birthplace by sight. Drag to move, scroll or pinch
 * to zoom, tap to pick. Tapping near a listed place picks it; tapping anywhere
 * else keeps the exact spot and looks up its time zone.
 */
export function MapPicker({ value, onPick }: { value: Place | null; onPick: (p: Place) => void }) {
  const [geo, setGeo] = useState<Geo | null>(null);
  const [ready, setReady] = useState(false);
  const [view, setView] = useState(() => (value ? { lon: value.lon, lat: value.lat, z: 4 } : { lon: 10, lat: 25, z: 0 }));
  const svgRef = useRef<SVGSVGElement>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<{ moved: number; startDist: number; startZ: number } | null>(null);

  useEffect(() => {
    let alive = true;
    Promise.all([loadGeo(), loadCities()]).then(([g]) => {
      if (!alive) return;
      setGeo(g);
      setReady(true);
    });
    return () => {
      alive = false;
    };
  }, []);

  // Follow picks made in the search box.
  useEffect(() => {
    if (value) setView((v) => ({ lon: value.lon, lat: value.lat, z: Math.max(v.z, 4) }));
  }, [value]);

  const projection = useMemo(
    () =>
      geoMercator()
        .center([view.lon, view.lat])
        .translate([W / 2, H / 2])
        .scale((W / (2 * Math.PI)) * 2 ** view.z),
    [view]
  );
  const path = useMemo(() => geoPath(projection), [projection]);

  const box = useMemo(() => {
    const nw = projection.invert?.([0, 0]) ?? [-180, 85];
    const se = projection.invert?.([W, H]) ?? [180, -85];
    return view.z < 1.2 ? { n: 85, s: -85, w: -180, e: 180 } : { n: nw[1], s: se[1], w: wrapLon(nw[0]), e: wrapLon(se[0]) };
  }, [projection, view.z]);

  const dots = useMemo(() => (ready ? citiesIn(box, view.z < 2 ? 120 : 260) : []), [ready, box, view.z]);
  // Label the biggest places first and skip any label that would collide with one already placed.
  const labels = useMemo(() => {
    const placed: { x: number; y: number; w: number }[] = [];
    const out: { c: City; x: number; y: number }[] = [];
    for (const c of dots) {
      if (out.length >= (view.z < 3 ? 6 : 14)) break;
      const p = projection([c.lon, c.lat]);
      if (!p || p[0] < 0 || p[0] > W - 40 || p[1] < 14 || p[1] > H - 30) continue;
      const w = c.name.length * 6.2 + 8;
      if (placed.some((q) => Math.abs(q.y - p[1]) < 14 && p[0] < q.x + q.w && q.x < p[0] + w)) continue;
      placed.push({ x: p[0], y: p[1], w });
      out.push({ c, x: p[0], y: p[1] });
    }
    return out;
  }, [dots, projection, view.z]);

  const toLocal = (e: { clientX: number; clientY: number }) => {
    const r = svgRef.current?.getBoundingClientRect();
    if (!r) return { x: 0, y: 0 };
    return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H };
  };

  const zoomAt = (z: number, at?: { x: number; y: number }) => {
    const nz = Math.max(0, Math.min(MAX_Z, z));
    if (!at) return setView((v) => ({ ...v, z: nz }));
    // keep the point under the cursor in place
    const ll = projection.invert?.([at.x, at.y]);
    if (!ll) return;
    const k = 2 ** (nz - view.z);
    const cx = at.x + (W / 2 - at.x) / k;
    const cy = at.y + (H / 2 - at.y) / k;
    const c = projection.invert?.([cx, cy]);
    if (c) setView({ lon: wrapLon(c[0]), lat: clampLat(c[1]), z: nz });
  };

  const pick = (lon: number, lat: number) => {
    const near = nearestCity(lat, lon);
    const pxPerKm = ((W / (2 * Math.PI)) * 2 ** view.z) / 6371;
    if (near && near.km * pxPerKm < 14) {
      const c = near.city;
      onPick({ place: describeCity(c), tz: c.tz, lat: c.lat, lon: c.lon });
      return;
    }
    let tz = "";
    try {
      tz = tzlookup(lat, lon);
    } catch {
      return;
    }
    const where = near && near.km < 80 ? `Near ${describeCity(near.city)}` : `${Math.abs(lat).toFixed(2)}° ${lat >= 0 ? "N" : "S"}, ${Math.abs(lon).toFixed(2)}° ${lon >= 0 ? "E" : "W"}`;
    onPick({ place: where, tz, lat: Math.round(lat * 1000) / 1000, lon: Math.round(lon * 1000) / 1000 });
  };

  const onDown = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    pointers.current.set(e.pointerId, toLocal(e));
    const pts = [...pointers.current.values()];
    gesture.current = {
      moved: gesture.current?.moved ?? 0,
      startDist: pts.length === 2 ? Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) : 0,
      startZ: view.z,
    };
    if (pts.length === 1) gesture.current.moved = 0;
  };

  const onMove = (e: React.PointerEvent) => {
    const prev = pointers.current.get(e.pointerId);
    if (!prev || !gesture.current) return;
    const now = toLocal(e);
    pointers.current.set(e.pointerId, now);
    const pts = [...pointers.current.values()];
    if (pts.length === 2 && gesture.current.startDist > 0) {
      const d = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      gesture.current.moved += 10;
      zoomAt(gesture.current.startZ + Math.log2(d / gesture.current.startDist), { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 });
      return;
    }
    const dx = now.x - prev.x;
    const dy = now.y - prev.y;
    gesture.current.moved += Math.abs(dx) + Math.abs(dy);
    const c = projection.invert?.([W / 2 - dx, H / 2 - dy]);
    if (c) setView((v) => ({ ...v, lon: wrapLon(c[0]), lat: clampLat(c[1]) }));
  };

  const onUp = (e: React.PointerEvent) => {
    const g = gesture.current;
    const was = pointers.current.size;
    pointers.current.delete(e.pointerId);
    if (was === 1 && g && g.moved < 6) {
      const ll = projection.invert?.([toLocal(e).x, toLocal(e).y]);
      if (ll) pick(wrapLon(ll[0]), ll[1]);
    }
    if (pointers.current.size === 0) gesture.current = null;
  };

  // Wheel zoom needs a non-passive listener so the page doesn't scroll.
  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      zoomAt(view.z - Math.sign(e.deltaY) * 0.5, toLocal(e));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  });

  const pin = value ? projection([value.lon, value.lat]) : null;

  return (
    <div className="map">
      <svg
        ref={svgRef}
        className="map-svg"
        viewBox={`0 0 ${W} ${H}`}
        role="application"
        aria-label="World map. Drag to move, scroll or pinch to zoom, tap to pick your birthplace."
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onDoubleClick={(e) => zoomAt(view.z + 1, toLocal(e))}
      >
        <rect width={W} height={H} className="map-sea" />
        {geo ? (
          <>
            <path d={path(geo.land) ?? ""} className="map-land" />
            <path d={path(geo.borders) ?? ""} className="map-border" />
          </>
        ) : null}
        {dots.map((c) => {
          const p = projection([c.lon, c.lat]);
          return p ? <circle key={`${c.name}${c.lat}${c.lon}`} cx={p[0]} cy={p[1]} r={view.z < 3 ? 1.6 : 2.4} className="map-dot" /> : null;
        })}
        {labels.map(({ c, x, y }) => (
          <text key={`l${c.name}${c.lat}`} x={x + 5} y={y + 4} className="map-label">
            {c.name}
          </text>
        ))}
        {pin ? (
          <g transform={`translate(${pin[0]} ${pin[1]})`} className="map-pin">
            <circle r="11" className="map-pin-glow" />
            <path d="M0 -8 C1.2 -2.4 2.4 -1.2 8 0 C2.4 1.2 1.2 2.4 0 8 C-1.2 2.4 -2.4 1.2 -8 0 C-2.4 -1.2 -1.2 -2.4 0 -8 Z" />
          </g>
        ) : null}
        {!geo ? (
          <text x={W / 2} y={H / 2} textAnchor="middle" className="map-label">
            Loading the map…
          </text>
        ) : null}
      </svg>
      <div className="map-zoom">
        <button type="button" aria-label="Zoom in" onClick={() => zoomAt(view.z + 1)}>
          +
        </button>
        <button type="button" aria-label="Zoom out" onClick={() => zoomAt(view.z - 1)}>
          −
        </button>
      </div>
      <p className="map-hint">Drag, zoom, then tap where you were born.</p>
    </div>
  );
}

export type { City };
