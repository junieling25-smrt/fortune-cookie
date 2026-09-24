import { useId, useMemo, useRef, useState } from "react";
import { describeCity, searchCities, type City } from "../engine/cities";

export type Place = { place: string; tz: string; lat: number; lon: number };

export function PlaceField({ value, onChange, autoFocus }: { value: Place | null; onChange: (p: Place | null) => void; autoFocus?: boolean }) {
  const [query, setQuery] = useState(value?.place ?? "");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const listId = useId();
  const results = useMemo(() => (open ? searchCities(query) : []), [query, open]);
  const blurTimer = useRef<number | undefined>(undefined);

  const pick = (c: City) => {
    const label = describeCity(c);
    setQuery(label);
    setOpen(false);
    onChange({ place: label, tz: c.tz, lat: c.lat, lon: c.lon });
  };

  return (
    <div className="place">
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
        placeholder="Start typing a city"
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
      {open && results.length > 0 ? (
        <ul className="place-list" id={listId} role="listbox">
          {results.map((c, i) => (
            <li key={`${c.name}-${c.region}-${c.country}`} role="option" aria-selected={i === active}>
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
    </div>
  );
}
