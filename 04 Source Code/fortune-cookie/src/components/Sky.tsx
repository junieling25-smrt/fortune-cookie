import { useEffect, useState } from "react";

export type SkyTime = "morning" | "day" | "evening" | "night";

/** Morning 5 to 11, day 11 to 5 PM, evening 5 to 8 PM, night after that. */
const skyAt = (h: number): SkyTime => (h >= 5 && h < 11 ? "morning" : h >= 11 && h < 17 ? "day" : h >= 17 && h < 20 ? "evening" : "night");

/** ?sky=night pins the sky, for screenshots. */
const skyNow = (): SkyTime => {
  const pinned = new URLSearchParams(window.location.search).get("sky");
  return pinned === "morning" || pinned === "day" || pinned === "evening" || pinned === "night" ? pinned : skyAt(new Date().getHours());
};

/**
 * The page sky behind everything: a gradient for the time of day, a faint
 * layer of auspicious clouds, and stars at night. Night also switches the
 * app to its dark theme.
 */
export function Sky() {
  const [sky, setSky] = useState(skyNow);

  useEffect(() => {
    const tick = () => setSky(skyNow());
    const id = window.setInterval(tick, 5 * 60 * 1000);
    window.addEventListener("focus", tick);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("focus", tick);
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.sky = sky;
    if (sky === "night") root.dataset.theme = "dark";
    else delete root.dataset.theme;
  }, [sky]);

  return (
    <div className="sky" aria-hidden="true">
      <div className="sky-glow" />
      {sky === "night" ? <div className="sky-stars" /> : null}
      <div className="sky-clouds" />
    </div>
  );
}
