import { useRef } from "react";

const pad = (n: number) => String(n).padStart(2, "0");
const digits = (v: string, max: number) => v.replace(/\D/g, "").slice(0, max);

/**
 * Birthday as MM / DD / YYYY in three boxes, with auto-advance. Emits YYYY-MM-DD
 * once all three are filled, otherwise "".
 */
export function DateFields({
  parts,
  onParts,
}: {
  parts: { m: string; d: string; y: string };
  onParts: (p: { m: string; d: string; y: string }, iso: string) => void;
}) {
  const dRef = useRef<HTMLInputElement>(null);
  const yRef = useRef<HTMLInputElement>(null);
  const emit = (p: { m: string; d: string; y: string }) => {
    const iso = p.m.length && p.d.length && p.y.length === 4 ? `${p.y}-${pad(Number(p.m))}-${pad(Number(p.d))}` : "";
    onParts(p, iso);
  };
  return (
    <div className="date-fields" role="group" aria-label="Date of birth, month day year">
      <label className="df">
        <span>Month</span>
        <input
          id="ob-month"
          className="field field-big"
          inputMode="numeric"
          placeholder="MM"
          autoComplete="bday-month"
          value={parts.m}
          onChange={(e) => {
            const m = digits(e.target.value, 2);
            emit({ ...parts, m });
            if (m.length === 2 || (m.length === 1 && Number(m) > 1)) dRef.current?.focus();
          }}
        />
      </label>
      <span className="df-slash" aria-hidden="true">/</span>
      <label className="df">
        <span>Day</span>
        <input
          ref={dRef}
          className="field field-big"
          inputMode="numeric"
          placeholder="DD"
          autoComplete="bday-day"
          value={parts.d}
          onChange={(e) => {
            const d = digits(e.target.value, 2);
            emit({ ...parts, d });
            if (d.length === 2 || (d.length === 1 && Number(d) > 3)) yRef.current?.focus();
          }}
        />
      </label>
      <span className="df-slash" aria-hidden="true">/</span>
      <label className="df df-year">
        <span>Year</span>
        <input
          ref={yRef}
          className="field field-big"
          inputMode="numeric"
          placeholder="YYYY"
          autoComplete="bday-year"
          value={parts.y}
          onChange={(e) => emit({ ...parts, y: digits(e.target.value, 4) })}
        />
      </label>
    </div>
  );
}

/** Birth time as hour : minute with an AM / PM switch. Emits 24-hour HH:MM, or "". */
export function TimeFields({
  parts,
  disabled,
  onParts,
}: {
  parts: { h: string; min: string; pm: boolean };
  disabled?: boolean;
  onParts: (p: { h: string; min: string; pm: boolean }, hhmm: string) => void;
}) {
  const minRef = useRef<HTMLInputElement>(null);
  const emit = (p: { h: string; min: string; pm: boolean }) => {
    const h = Number(p.h);
    const m = Number(p.min);
    const ok = p.h.length > 0 && p.min.length === 2 && h >= 1 && h <= 12 && m >= 0 && m <= 59;
    const h24 = (h % 12) + (p.pm ? 12 : 0);
    onParts(p, ok ? `${pad(h24)}:${pad(m)}` : "");
  };
  return (
    <div className={`time-fields ${disabled ? "is-disabled" : ""}`} role="group" aria-label="Time of birth">
      <label className="df">
        <span>Hour</span>
        <input
          id="ob-hour"
          className="field field-big"
          inputMode="numeric"
          placeholder="hh"
          disabled={disabled}
          value={parts.h}
          onChange={(e) => {
            const h = digits(e.target.value, 2);
            emit({ ...parts, h });
            if (h.length === 2 || (h.length === 1 && Number(h) > 1)) minRef.current?.focus();
          }}
        />
      </label>
      <span className="df-slash" aria-hidden="true">:</span>
      <label className="df">
        <span>Minute</span>
        <input
          ref={minRef}
          className="field field-big"
          inputMode="numeric"
          placeholder="mm"
          disabled={disabled}
          value={parts.min}
          onChange={(e) => emit({ ...parts, min: digits(e.target.value, 2) })}
        />
      </label>
      <div className="ampm" role="radiogroup" aria-label="AM or PM">
        {(["AM", "PM"] as const).map((x) => {
          const on = (x === "PM") === parts.pm;
          return (
            <button key={x} type="button" role="radio" aria-checked={on} disabled={disabled} className={on ? "is-on" : ""} onClick={() => emit({ ...parts, pm: x === "PM" })}>
              {x}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export const isoToParts = (iso: string) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  return m ? { m: m[2], d: m[3], y: m[1] } : { m: "", d: "", y: "" };
};

export const hhmmToParts = (hhmm: string) => {
  const m = /^(\d{2}):(\d{2})$/.exec(hhmm);
  if (!m) return { h: "", min: "", pm: false };
  const h = Number(m[1]);
  return { h: String(h % 12 === 0 ? 12 : h % 12), min: m[2], pm: h >= 12 };
};
