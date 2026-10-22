import { useEffect, useLayoutEffect, useState } from "react";

/** One sentence per feature, each pointing at the real thing on screen. */
const STEPS: { sel: string[]; text: string }[] = [
  { sel: [".stage"], text: "Crack a new cookie every day for your fortune." },
  { sel: [".score-block .ring"], text: "Your score from 0 to 100 shows how easy today is for your chart." },
  { sel: [".pet"], text: "This is your year animal. It dresses for the season and cheers when you try a tweak." },
  { sel: [".tweaks"], text: "Small tweaks are quick ways to work with the day. Tap the (i) to see why." },
  { sel: [".tabbar button:nth-child(2)", ".topnav-link:nth-child(2)"], text: "Forecast shows your month, your year, and the years ahead." },
  { sel: [".tabbar button:nth-child(3)", ".topnav-link:nth-child(3)"], text: "Match compares your chart with someone you care about." },
  { sel: [".tabbar button:nth-child(4)", ".topnav-link:nth-child(4)"], text: "Explore finds real places in the day's direction." },
  { sel: [".me-btn"], text: "Your profile holds your animals, your details, and a daily reminder." },
];
const STEP_MS = 1800;

const visible = (el: Element | null): el is HTMLElement => !!el && (el as HTMLElement).getClientRects().length > 0 && getComputedStyle(el).display !== "none";

/** A short tour after onboarding. It moves on by itself; tap to go faster, or skip. */
export function Tour({ onDone }: { onDone: () => void }) {
  const [i, setI] = useState(0);
  const [box, setBox] = useState<DOMRect | null>(null);
  const step = STEPS[i];

  useLayoutEffect(() => {
    const el = step.sel.map((s) => document.querySelector(s)).find(visible) ?? null;
    if (!el) return setBox(null);
    const r0 = el.getBoundingClientRect();
    const fixed = getComputedStyle(el.closest(".tabbar, .topbar") ?? el).position === "fixed" || el.closest(".topbar, .tabbar");
    if (!fixed && (r0.top < 70 || r0.bottom > window.innerHeight - 90)) el.scrollIntoView({ block: "center", behavior: "instant" as ScrollBehavior });
    setBox(el.getBoundingClientRect());
  }, [step]);

  useEffect(() => {
    const t = window.setTimeout(() => (i < STEPS.length - 1 ? setI(i + 1) : onDone()), STEP_MS);
    return () => window.clearTimeout(t);
  }, [i, onDone]);

  const pad = 8;
  const below = box ? box.bottom + 150 < window.innerHeight : true;
  const cardTop = box ? (below ? box.bottom + pad + 12 : Math.max(12, box.top - pad - 12 - 110)) : window.innerHeight / 2 - 60;

  return (
    <div className="tour" role="dialog" aria-label="Quick tour" onClick={() => (i < STEPS.length - 1 ? setI(i + 1) : onDone())}>
      {box ? (
        <span
          className="tour-hole"
          style={{ left: box.left - pad, top: box.top - pad, width: box.width + pad * 2, height: box.height + pad * 2 }}
          aria-hidden="true"
        />
      ) : (
        <span className="tour-dim" aria-hidden="true" />
      )}
      <div className="tour-card" style={{ top: cardTop }} key={i}>
        <p className="tour-text">{step.text}</p>
        <div className="tour-foot">
          <span className="tour-bar" aria-hidden="true">
            {STEPS.map((_, k) => (
              <i key={k} className={k < i ? "is-done" : k === i ? "is-now" : ""} style={k === i ? { animationDuration: `${STEP_MS}ms` } : undefined} />
            ))}
          </span>
          <button
            type="button"
            className="link-btn"
            onClick={(e) => {
              e.stopPropagation();
              onDone();
            }}
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
}
