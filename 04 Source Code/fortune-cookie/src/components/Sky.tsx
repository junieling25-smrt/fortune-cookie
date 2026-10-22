import { useEffect, useState } from "react";

export type SkyTime = "morning" | "day" | "evening" | "night";

/** Morning 5 to 11, day 11 to 5 PM, evening 5 to 7 PM, night after that. */
const skyAt = (h: number): SkyTime => (h >= 5 && h < 11 ? "morning" : h >= 11 && h < 17 ? "day" : h >= 17 && h < 19 ? "evening" : "night");

export type SkyMode = "auto" | "day" | "sunset" | "night";
const MODE_KEY = "fc.sky";
const MODE_EVENT = "fc-sky";
const isTime = (v: unknown): v is SkyTime => v === "morning" || v === "day" || v === "evening" || v === "night";

export const loadSkyMode = (): SkyMode => {
  try {
    const v = window.localStorage.getItem(MODE_KEY);
    return v === "day" || v === "sunset" || v === "night" ? v : "auto";
  } catch {
    return "auto";
  }
};

export const setSkyMode = (m: SkyMode) => {
  try {
    if (m === "auto") window.localStorage.removeItem(MODE_KEY);
    else window.localStorage.setItem(MODE_KEY, m);
  } catch {
    /* fine: it still changes for this visit */
  }
  window.dispatchEvent(new CustomEvent(MODE_EVENT, { detail: m }));
};

/** ?sky=night pins the sky for screenshots; otherwise your pick, or the clock. */
export const skyNow = (mode: SkyMode = loadSkyMode()): SkyTime => {
  const pinned = new URLSearchParams(window.location.search).get("sky");
  if (isTime(pinned)) return pinned;
  if (mode === "day") return "day";
  if (mode === "sunset") return "evening";
  if (mode === "night") return "night";
  return skyAt(new Date().getHours());
};

/** Follow the sky from anywhere: the toggle and the backdrop share it. */
export function useSky(): [SkyTime, SkyMode] {
  const [mode, setMode] = useState(loadSkyMode);
  const [sky, setSky] = useState(() => skyNow(mode));
  useEffect(() => {
    const onMode = (e: Event) => {
      const m = (e as CustomEvent<SkyMode>).detail;
      setMode(m);
      setSky(skyNow(m));
    };
    const tick = () => setSky(skyNow(loadSkyMode()));
    const id = window.setInterval(tick, 5 * 60 * 1000);
    window.addEventListener(MODE_EVENT, onMode);
    window.addEventListener("focus", tick);
    return () => {
      window.clearInterval(id);
      window.removeEventListener(MODE_EVENT, onMode);
      window.removeEventListener("focus", tick);
    };
  }, []);
  return [sky, mode];
}

/**
 * A classic auspicious cloud in one line: scalloped heads, a curl tucked
 * into the left and middle, and a tail that tapers off to the right.
 */
const CLOUD_PATHS = [
  "M130.0 135.0 C124.7 134.1 119.4 132.5 114.1 132.2 C108.7 131.9 103.1 132.0 97.9 133.2 C92.7 134.4 87.5 136.4 82.9 139.1 C78.3 141.8 73.9 145.3 70.3 149.2 C66.7 153.1 63.6 157.7 61.2 162.5 C58.8 167.3 57.0 172.6 55.9 177.8 C54.8 183.0 54.4 188.6 54.8 193.9 C55.2 199.2 56.4 204.7 58.4 209.6 C60.4 214.6 63.2 219.5 66.6 223.6 C70.0 227.7 74.3 231.3 78.8 234.0 C83.4 236.7 88.7 238.9 93.9 239.8 C99.1 240.7 105.0 240.8 109.9 239.3 C114.8 237.8 120.2 234.6 123.4 230.7 C126.6 226.8 129.3 220.8 129.2 215.9 C129.1 211.1 126.7 204.2 123.1 201.5 C119.6 198.8 111.9 197.6 108.1 199.4 C104.2 201.3 102.7 208.5 100.0 213.0",
  "M130.0 135.0 C129.3 130.1 128.0 125.2 128.0 120.3 C128.0 115.4 128.3 110.1 130.2 105.8 C132.1 101.5 135.4 97.0 139.2 94.3 C143.0 91.6 148.3 90.0 153.0 89.6 C157.7 89.2 162.8 90.5 167.5 91.9 C172.2 93.3 176.5 96.0 181.0 98.0",
  "M181.0 98.0 C182.9 92.9 184.2 87.6 186.7 82.8 C189.1 78.0 192.1 73.2 195.7 69.3 C199.3 65.4 203.9 62.2 208.5 59.5 C213.1 56.8 218.3 54.6 223.5 53.1 C228.7 51.6 234.2 50.8 239.5 50.7 C244.9 50.6 250.4 51.4 255.6 52.8 C260.8 54.2 266.0 56.3 270.5 59.1 C275.1 61.9 279.4 65.5 282.9 69.5 C286.4 73.5 289.3 78.3 291.5 83.2 C293.7 88.1 295.3 93.5 296.0 98.8 C296.7 104.1 296.4 109.6 295.9 115.0 C295.4 120.4 294.0 125.7 293.0 131.0",
  "M293.0 131.0 C297.3 128.6 301.3 125.4 305.9 123.9 C310.4 122.4 315.7 121.0 320.3 121.7 C324.9 122.4 329.6 124.9 333.4 127.8 C337.2 130.7 339.8 135.3 343.0 139.0",
  "M352.0 188.0 C346.7 188.0 340.9 189.7 336.2 188.1 C331.5 186.5 326.4 182.7 323.9 178.5 C321.4 174.4 320.3 168.0 321.1 163.2 C321.9 158.4 325.3 153.2 328.8 149.5 C332.3 145.8 337.4 142.9 342.2 141.0 C347.0 139.1 352.6 138.2 357.8 138.1 C363.0 138.0 368.5 139.0 373.5 140.5 C378.6 142.0 383.4 144.4 388.1 146.9 C392.8 149.3 397.3 152.3 401.7 155.2 C406.1 158.1 410.3 161.4 414.7 164.5 C419.0 167.5 423.3 170.7 427.8 173.5 C432.3 176.3 436.9 179.1 441.7 181.4 C446.5 183.7 451.5 185.7 456.6 187.2 C461.7 188.6 466.9 189.7 472.2 190.1 C477.5 190.5 483.0 190.5 488.2 189.7 C493.4 188.9 498.6 187.6 503.5 185.6 C508.4 183.6 513.0 180.7 517.4 177.8 C521.8 174.9 525.8 171.3 530.0 168.0",
  "M530.0 168.0 C527.3 172.7 524.8 177.6 521.8 182.0 C518.7 186.5 515.6 191.0 511.7 194.7 C507.8 198.4 503.2 201.6 498.5 204.0 C493.7 206.5 488.4 208.2 483.2 209.4 C478.0 210.6 472.5 211.1 467.1 211.3 C461.7 211.5 456.3 211.2 450.9 210.8 C445.5 210.4 440.1 209.5 434.7 208.8 C429.3 208.1 424.1 206.9 418.7 206.4 C413.3 205.8 407.9 205.1 402.5 205.5 C397.2 205.9 391.7 206.9 386.6 208.5 C381.5 210.1 376.5 212.6 371.8 215.3 C367.1 217.9 362.7 221.2 358.4 224.4 C354.0 227.6 350.0 231.2 345.7 234.5 C341.4 237.7 337.0 241.0 332.5 243.9 C327.9 246.8 323.2 249.6 318.4 252.1 C313.6 254.6 308.7 257.0 303.7 259.0 C298.7 261.0 293.6 262.9 288.4 264.3 C283.2 265.7 277.8 267.0 272.5 267.3 C267.1 267.6 261.5 267.4 256.3 266.3 C251.1 265.2 245.8 263.3 241.1 260.7 C236.4 258.1 232.0 254.7 228.2 250.9 C224.4 247.1 221.0 242.7 218.3 238.1 C215.5 233.5 213.3 228.4 211.7 223.3 C210.1 218.2 208.8 212.7 208.6 207.4 C208.4 202.1 208.8 196.3 210.4 191.3 C212.0 186.3 214.7 181.1 218.2 177.3 C221.7 173.5 226.7 170.1 231.6 168.4 C236.5 166.7 242.5 166.0 247.6 166.9 C252.6 167.8 258.5 170.4 261.9 174.0 C265.2 177.6 268.2 184.1 267.7 188.7 C267.2 193.2 263.0 199.0 259.0 201.4 C254.9 203.9 248.3 202.5 243.0 203.0",
  "M100.0 243.0 C102.3 248.0 103.4 254.1 106.8 258.0 C110.2 261.9 115.5 265.2 120.5 266.6 C125.6 268.0 131.8 265.3 137.1 266.2 C142.3 267.1 147.7 268.9 152.1 271.7 C156.6 274.6 159.6 280.0 163.9 283.4 C168.2 286.8 173.0 289.8 178.0 291.9 C183.0 294.0 188.6 295.4 194.0 296.0 C199.4 296.6 205.3 296.8 210.6 295.7 C215.9 294.6 221.4 292.6 225.8 289.6 C230.2 286.6 233.9 282.0 237.1 277.6 C240.3 273.2 242.4 267.9 245.0 263.0",
];

function Cloud({ w, flip }: { w: number; flip?: boolean }) {
  return (
    <svg className="sky-cloud-art" width={w} height={(w * 280) / 500} viewBox="40 30 500 280" style={flip ? { scale: "-1 1" } : undefined}>
      {CLOUD_PATHS.map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}

/** Hand-placed in the gaps between the floating slips, moons, and sparkles. */
const CLOUDS: { x: number; y: number; w: number; flip?: boolean; wide?: boolean }[] = [
  { x: 2, y: 23, w: 88 },
  { x: 89.5, y: 35, w: 82, flip: true },
  { x: 2.5, y: 63, w: 76, wide: true },
  { x: 90, y: 72, w: 86, flip: true, wide: true },
  { x: 11, y: 86, w: 68, wide: true },
];

/**
 * The page sky behind everything: a gradient for the time of day, a few faint
 * auspicious clouds, and stars at night. Night also switches the
 * app to its dark theme.
 */
export function Sky() {
  const [sky] = useSky();

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
      {CLOUDS.map((c, i) => (
        <span key={i} className={`sky-cloud ${c.wide ? "is-wide" : ""}`} style={{ left: `${c.x}%`, top: `${c.y}%`, animationDelay: `${i * -2.3}s` }}>
          <Cloud w={c.w} flip={c.flip} />
        </span>
      ))}
    </div>
  );
}

const ICONS: Record<SkyMode, React.JSX.Element> = {
  auto: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  day: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4" />
    </>
  ),
  sunset: (
    <>
      <path d="M7 16a5 5 0 0 1 10 0" />
      <path d="M3 19h18M12 6v3M5.5 9.5l1.6 1.4M18.5 9.5l-1.6 1.4" />
    </>
  ),
  night: <path d="M18 14.5A7 7 0 0 1 9.5 6a7 7 0 1 0 8.5 8.5Z" />,
};

const LABEL: Record<SkyMode, string> = { auto: "Follow the clock", day: "Day", sunset: "Sunset", night: "Night" };

function SkyIcon({ mode }: { mode: SkyMode }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {ICONS[mode]}
    </svg>
  );
}

/** A small button in the top bar: day, sunset, night, or follow the clock. */
export function SkyToggle() {
  const [sky, mode] = useSky();
  const [open, setOpen] = useState(false);
  const shown: SkyMode = mode !== "auto" ? mode : sky === "night" ? "night" : sky === "evening" ? "sunset" : "day";
  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [open]);
  return (
    <div className="sky-toggle">
      <button
        type="button"
        className="sky-toggle-btn"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Background: ${mode === "auto" ? "follows the clock" : LABEL[mode]}`}
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
      >
        <SkyIcon mode={shown} />
      </button>
      {open ? (
        <div className="sky-menu" role="menu">
          {(["auto", "day", "sunset", "night"] as SkyMode[]).map((m) => (
            <button key={m} type="button" role="menuitemradio" aria-checked={mode === m} className={mode === m ? "is-on" : ""} onClick={() => setSkyMode(m)}>
              <SkyIcon mode={m} /> {LABEL[m]}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
