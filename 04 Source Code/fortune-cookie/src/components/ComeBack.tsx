import { useState } from "react";
import type { Tone } from "../engine/reading";
import { downloadBlob, inFrame, reminderIcs, type Streak } from "../lib";
import { Bell, ToneIcon } from "./Icons";
import { Mark } from "./Mark";

const TIMES = [
  ["07:00", "7:00 AM"],
  ["08:00", "8:00 AM"],
  ["08:30", "8:30 AM"],
  ["09:00", "9:00 AM"],
  ["12:30", "12:30 PM"],
  ["21:00", "9:00 PM"],
] as const;

export function ComeBack({ streak, teaser }: { streak: Streak; teaser: { area: string; tone: Tone; text: string } }) {
  const [time, setTime] = useState("08:30");
  const [added, setAdded] = useState(false);
  const framed = inFrame();
  const headline = streak.streak === 0 ? "Start a streak today" : `${streak.streak}-day streak`;
  const sub = !streak.crackedToday && streak.streak > 0 ? "Crack today's cookie to keep it going." : `${streak.total} ${streak.total === 1 ? "cookie" : "cookies"} cracked so far.`;

  return (
    <section className="comeback" aria-label="Your streak and tomorrow">
      <div className="cb-streak">
        <div className="cb-head">
          <span className="cb-flame" aria-hidden="true">
            <Mark size={30} />
          </span>
          <div>
            <p className="cb-title">{headline}</p>
            <p className="cb-sub">{sub}</p>
          </div>
        </div>
        <ol className="week" aria-label="The last seven days">
          {streak.week.map((d) => (
            <li key={d.date} className={d.cracked ? "is-on" : ""} aria-label={`${d.date}${d.cracked ? ", cracked" : ""}`}>
              <span className="week-cookie">{d.cracked ? <Mark size={22} /> : null}</span>
              <span className="week-letter">{d.letter}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="cb-tomorrow" data-tone={teaser.tone}>
        <span className="tone-badge" data-tone={teaser.tone}>
          <ToneIcon tone={teaser.tone} size={24} />
        </span>
        <div>
          <p className="label">Tomorrow's teaser</p>
          <p className="cb-teaser">{teaser.text}</p>
        </div>
      </div>

      <div className="cb-remind">
        <p className="label">Daily reminder</p>
        {framed ? (
          <p className="cb-note">Open this page with your morning coffee, or add it to your home screen. Calendar reminders work from the full site.</p>
        ) : (
          <div className="cb-remind-row">
            <label className="visually-hidden" htmlFor="remind-time">
              Reminder time
            </label>
            <select id="remind-time" className="field field-small" value={time} onChange={(e) => setTime(e.target.value)}>
              {TIMES.map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="btn btn-soft"
              onClick={() => {
                downloadBlob(reminderIcs(time), "fortune-cookie-reminder.ics");
                setAdded(true);
              }}
            >
              <Bell /> {added ? "Added. Open the file" : "Add to my calendar"}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
