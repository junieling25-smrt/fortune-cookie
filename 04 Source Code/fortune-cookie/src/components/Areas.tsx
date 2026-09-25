import { useEffect, useState } from "react";
import { ReadMore } from "./ReadMore";
import type { AreaId, AreaReading, DailyReading } from "../engine/reading";
import { AREA_ICON, Check, Pencil, Spark, Star5, ToneIcon } from "./Icons";

export function Areas({
  reading,
  done,
  onToggle,
  tryDone,
  plans,
  onPlan,
}: {
  reading: DailyReading;
  done: string[];
  onToggle: (id: AreaId) => void;
  tryDone: boolean;
  plans: Partial<Record<AreaId, string>>;
  onPlan: (id: AreaId, text: string | null) => void;
}) {
  const ordered = [...reading.areas.filter((a) => a.interested), ...reading.areas.filter((a) => !a.interested)];
  const [open, setOpen] = useState<AreaId>(reading.focus);
  useEffect(() => setOpen(reading.focus), [reading.date, reading.focus]);
  const area = reading.areas.find((a) => a.id === open) as AreaReading;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  useEffect(() => setEditing(false), [open, reading.date]);
  const plan = plans[area.id];
  const stepText = plan ?? area.step;
  const total = reading.areas.length + 1;
  const count = done.length + (tryDone ? 1 : 0);

  return (
    <section className="section areas-section" id="areas" aria-labelledby="areas-title">
      <div className="section-head section-head-row">
        <div>
          <p className="eyebrow">Your day, area by area</p>
          <h2 id="areas-title">Today's weather for your life</h2>
        </div>
        <div className="steps-progress" aria-label={`${count} of ${total} tiny steps done today`}>
          <span className="steps-dots">
            {Array.from({ length: total }, (_, i) => (
              <i key={i} className={i < count ? "is-done" : ""} />
            ))}
          </span>
          <span>
            {count} of {total} tiny steps done
          </span>
        </div>
      </div>

      <div className="forecast" role="tablist" aria-label="Life areas">
        {ordered.map((a) => {
          const Icon = AREA_ICON[a.id];
          const selected = a.id === open;
          return (
            <button
              key={a.id}
              type="button"
              role="tab"
              id={`tab-${a.id}`}
              aria-selected={selected}
              aria-controls="area-panel"
              className={`fc-tab ${selected ? "is-selected" : ""} ${a.interested ? "" : "is-extra"}`}
              data-area={a.id}
              data-tone={a.tone}
              onClick={() => setOpen(a.id)}
            >
              {a.focus ? (
                <span className="fc-focus">
                  <Star5 size={10} /> In focus
                </span>
              ) : null}
              <span className="fc-top">
                <span className="area-icon">
                  <Icon size={20} />
                </span>
                {done.includes(a.id) ? (
                  <span className="fc-done" aria-label="Step done">
                    <Check size={11} />
                  </span>
                ) : null}
              </span>
              <span className="fc-title">{a.title}</span>
              <span className="fc-weather">
                <ToneIcon tone={a.tone} size={20} />
                {a.toneLabel}
              </span>
            </button>
          );
        })}
      </div>

      <article className="area-panel" id="area-panel" role="tabpanel" aria-labelledby={`tab-${area.id}`} data-area={area.id}>
        <div className="ap-main">
          <header className="ap-head">
            <span className="area-icon">{(() => {
              const Icon = AREA_ICON[area.id];
              return <Icon size={24} />;
            })()}</span>
            <div>
              <h3>{area.title}</h3>
              <p className="muted small">{area.covers}</p>
            </div>
            <span className="chip" data-tone={area.tone}>
              <i className="dot" />
              {area.toneLabel}
            </span>
          </header>
          <p className="ap-text">{area.text}</p>
          {area.forYou ? (
            <div className="for-you">
              <p className="label">For you</p>
              <p>{area.forYou}</p>
            </div>
          ) : null}
          <p className="ap-tone">{area.toneLine}</p>
          {area.link ? (
            <p className="ap-link">
              <Spark size={12} />
              <span>{area.link}</span>
            </p>
          ) : null}
          <ReadMore text={area.deep} resetKey={`${reading.date}-${area.id}`} />
          <p className="ap-why">{area.why}</p>
        </div>
        <aside className="ap-side">
          {editing ? (
            <form
              className="step-edit"
              onSubmit={(e) => {
                e.preventDefault();
                const t = draft.trim();
                onPlan(area.id, t && t !== area.step ? t.slice(0, 200) : null);
                setEditing(false);
              }}
            >
              <label className="label" htmlFor="step-draft">
                Your own tiny step · {area.title}
              </label>
              <textarea id="step-draft" className="field" rows={3} maxLength={200} value={draft} autoFocus onChange={(e) => setDraft(e.target.value)} />
              <div className="step-edit-actions">
                <button type="submit" className="btn btn-cookie btn-small">
                  Save my step
                </button>
                <button type="button" className="btn btn-quiet btn-small" onClick={() => setEditing(false)}>
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button type="button" className={`step ${done.includes(area.id) ? "is-done" : ""}`} aria-pressed={done.includes(area.id)} onClick={() => onToggle(area.id)}>
              <span className="step-box">{done.includes(area.id) ? <Check size={13} /> : null}</span>
              <span className="step-copy">
                <small>{plan ? "Your step" : "Tiny step"} · {area.title}</small>
                {stepText}
              </span>
            </button>
          )}
          {!editing ? (
            <div className="step-tools">
              <button
                type="button"
                className="link-btn"
                onClick={() => {
                  setDraft(stepText);
                  setEditing(true);
                }}
              >
                <Pencil size={13} /> Edit step
              </button>
              {plan ? (
                <button type="button" className="link-btn" onClick={() => onPlan(area.id, null)}>
                  Use the suggestion
                </button>
              ) : null}
              <span className="ap-side-note">{done.includes(area.id) ? "Nice. That counts." : "Tap the step when it's done."}</span>
            </div>
          ) : null}
        </aside>
      </article>
    </section>
  );
}
