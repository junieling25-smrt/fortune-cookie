import { useEffect, useRef, useState } from "react";
import type { AreaId, YearsReading } from "../engine/reading";
import { SHORT } from "./Score";

type SeriesId = AreaId;
const SERIES: SeriesId[] = ["growth", "career", "love", "family"];
const NAME: Record<SeriesId, string> = { growth: SHORT.growth, career: SHORT.career, love: SHORT.love, family: SHORT.family };

const H = 240;
const PAD = { top: 14, right: 72, bottom: 28, left: 34 };
const Y_MIN = 60;
const Y_MAX = 100;

/**
 * Scores by area across the years ahead, one line per area. Chips switch
 * lines on and off; hover or tap a year to read its numbers below the plot.
 */
export function YearsChart({ ys }: { ys: YearsReading }) {
  const wrap = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(640);
  const [on, setOn] = useState<SeriesId[]>(SERIES);
  const [hover, setHover] = useState<number | null>(null);
  const [table, setTable] = useState(false);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(Math.max(280, Math.round(e.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const rows = ys.rows;
  const valueOf = (r: (typeof rows)[number], s: SeriesId) => r.areas.find((a) => a.id === s)?.score ?? 0;
  const innerW = w - PAD.left - PAD.right;
  const x = (i: number) => PAD.left + (rows.length === 1 ? innerW / 2 : (i * innerW) / (rows.length - 1));
  const y = (v: number) => PAD.top + ((Y_MAX - Math.max(Y_MIN, Math.min(Y_MAX, v))) * (H - PAD.top - PAD.bottom)) / (Y_MAX - Y_MIN);
  const visible = SERIES.filter((s) => on.includes(s));
  const nowIdx = rows.findIndex((r) => r.current);

  // Direct labels at the right end, nudged apart so they never overlap.
  const ends = visible.map((s) => ({ s, y: y(valueOf(rows[rows.length - 1], s)) })).sort((a, b) => a.y - b.y);
  for (let i = 1; i < ends.length; i++) if (ends[i].y - ends[i - 1].y < 14) ends[i].y = ends[i - 1].y + 14;

  const toggle = (s: SeriesId) => setOn((cur) => (cur.includes(s) ? (cur.length > 1 ? cur.filter((x) => x !== s) : cur) : [...cur, s]));
  const pickFrom = (clientX: number) => {
    const box = wrap.current?.getBoundingClientRect();
    if (!box) return;
    const px = clientX - box.left;
    let best = 0;
    rows.forEach((_, i) => {
      if (Math.abs(x(i) - px) < Math.abs(x(best) - px)) best = i;
    });
    setHover(best);
  };
  const shown = hover ?? Math.max(0, nowIdx);
  const tipRow = rows[shown];
  const labelEvery = rows.length > 6 && w < 520 ? 2 : 1;

  return (
    <div className="yc">
      <div className="yc-chips" role="group" aria-label="Lines to show">
        {SERIES.map((s) => (
          <button key={s} type="button" className={`yc-chip ${on.includes(s) ? "is-on" : ""}`} data-s={s} aria-pressed={on.includes(s)} onClick={() => toggle(s)}>
            <i aria-hidden="true" /> {NAME[s]}
          </button>
        ))}
      </div>

      <div
        className="yc-plot"
        ref={wrap}
        onPointerMove={(e) => pickFrom(e.clientX)}
        onPointerDown={(e) => pickFrom(e.clientX)}
        onPointerLeave={(e) => (e.pointerType === "mouse" ? setHover(null) : undefined)}
      >
        <svg width={w} height={H} role="img" aria-label={`Scores by area from ${ys.from} to ${ys.to}`}>
          {nowIdx >= 0 ? <rect className="yc-now" x={x(nowIdx) - 14} y={PAD.top} width={28} height={H - PAD.top - PAD.bottom} rx={8} /> : null}
          {[70, 80, 90].map((g) => (
            <g key={g}>
              <line className="yc-grid" x1={PAD.left} x2={w - PAD.right} y1={y(g)} y2={y(g)} />
              <text className="yc-axis" x={PAD.left - 8} y={y(g) + 4} textAnchor="end">
                {g}
              </text>
            </g>
          ))}
          {rows.map((r, i) =>
            i % labelEvery === 0 || r.current ? (
              <text key={r.year} className={`yc-axis ${r.current ? "is-now" : ""}`} x={x(i)} y={H - 8} textAnchor="middle">
                {labelEvery > 1 ? `'${String(r.year).slice(2)}` : r.year}
              </text>
            ) : null,
          )}
          <line className="yc-cross" x1={x(shown)} x2={x(shown)} y1={PAD.top} y2={H - PAD.bottom} />
          {visible.map((s) => (
            <g key={s} className="yc-series" data-s={s}>
              <polyline points={rows.map((r, i) => `${x(i)},${y(valueOf(r, s))}`).join(" ")} />
              {rows.map((r, i) => (
                <circle key={r.year} cx={x(i)} cy={y(valueOf(r, s))} r={shown === i ? 5 : 3.5} />
              ))}
            </g>
          ))}
          {ends.map(({ s, y: ly }) => (
            <g key={s} className="yc-end" data-s={s}>
              <circle cx={w - PAD.right + 12} cy={ly} r={3.5} />
              <text x={w - PAD.right + 20} y={ly + 4}>
                {NAME[s]}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <div className="yc-read" aria-live="polite">
        <p className="yc-read-year">
          {tipRow.year}
          {tipRow.current ? " (now)" : ""} · {tipRow.label}
        </p>
        {visible.map((s) => (
          <p key={s} className="yc-read-row" data-s={s}>
            <i aria-hidden="true" /> {NAME[s]} <strong>{valueOf(tipRow, s)}</strong>
          </p>
        ))}
      </div>

      <button type="button" className="link-btn yc-table-btn" onClick={() => setTable(!table)} aria-expanded={table}>
        {table ? "Hide the numbers" : "Show as a table"}
      </button>
      {table ? (
        <div className="yc-table-wrap">
          <table className="yc-table">
            <thead>
              <tr>
                <th>Year</th>
                {SERIES.map((s) => (
                  <th key={s}>{NAME[s]}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.year} className={r.current ? "is-now" : ""}>
                  <td>{r.year}</td>
                  {SERIES.map((s) => (
                    <td key={s}>{valueOf(r, s)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
