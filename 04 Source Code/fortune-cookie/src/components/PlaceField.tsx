import { lazy, Suspense, useEffect, useId, useMemo, useRef, useState } from "react";
import { describeCity, loadCities, searchCities, type City } from "../engine/cities";
import { MapIcon } from "./Icons";

export type Place = { place: string; tz: string; lat: number; lon: number };

const MapPicker = lazy(() => import("./MapPicker").then((m) => ({ default: m.MapPicker })));

export function PlaceField({ value, onChange, autoFocus }: { value: Place | null; onChange: (p: Place | null) => void; autoFocus?: boolean }) {
  const [query, setQuery] = useState(value?.place ?? "");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [ready, setReady] = useState(false);
  const [map, setMap] = useState(false);
  const listId = useId();
  const results = useMemo(() => (open && ready ? searchCities(query) : []), [query, open, ready]);
  const blurTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    let alive = true;
    loadCities().then(() => alive && setReady(true));
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (value) setQuery(value.place);
  }, [value]);

  const pick = (c: City) => {
    const label = describeCity(c);
    setQuery(label);
    setOpen(false);
    onChange({ place: label, tz: c.tz, lat: c.lat, lon: c.lon });
  };

  const empty = open && ready && query.trim().length >= 2 && results.length === 0;

  return (
    <div className="place">
      <div className="place-row">
        <input
          id="birth-place"
          className="field"
          type="text"
          role="combobox"
          aria-expanded={open && results.length > 0}
          aria-controls={listId}
          aria-autocomplete="list"
          autoComplete="off"
          autoFocus={autoFocus}
          placeholder={ready ? "Town or city, e.g. Los Angeles" : "Loading places…"}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setActive(0);
            if (value) onChange(null);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => {
            blurTimer.current = window.setTimeout(() => setOpen(false), 150);
          }}
          onKeyDown={(e) => {
            if (!open || results.length === 0) return;
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActive((i) => (i + 1) % results.length);
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((i) => (i - 1 + results.length) % results.length);
            } else if (e.key === "Enter") {
              e.preventDefault();
              e.stopPropagation();
              pick(results[active]);
            } else if (e.key === "Escape") {
              setOpen(false);
            }
          }}
        />
        <button type="button" className={`btn btn-soft map-toggle ${map ? "is-on" : ""}`} aria-pressed={map} onClick={() => setMap(!map)}>
          <MapIcon /> Map
        </button>
      </div>
      {open && results.length > 0 ? (
        <ul className="place-list" id={listId} role="listbox">
          {results.map((c, i) => (
            <li key={`${c.name}-${c.region}-${c.country}-${c.lat}`} role="option" aria-selected={i === active}>
              <button
                type="button"
                className={i === active ? "is-active" : undefined}
                onMouseEnter={() => setActive(i)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  window.clearTimeout(blurTimer.current);
                  pick(c);
                }}
              >
                <span>{c.name}</span>
                <small>{[c.region && c.region !== c.name ? c.region : null, c.country].filter(Boolean).join(", ")}</small>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {empty ? (
        <p className="hint place-empty">
          Not on our list yet.{" "}
          <button type="button" className="link-btn" onMouseDown={(e) => e.preventDefault()} onClick={() => setMap(true)}>
            Find it on the map
          </button>{" "}
          or try the nearest bigger town.
        </p>
      ) : null}
      {map ? (
        <Suspense fallback={<div className="map map-loading">Loading the map…</div>}>
          <MapPicker
            value={value}
            onPick={(p) => {
              setQuery(p.place);
              setOpen(false);
              onChange(p);
            }}
          />
        </Suspense>
      ) : null}
    </div>
  );
}
