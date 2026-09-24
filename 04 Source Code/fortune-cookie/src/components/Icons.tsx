import type { AreaId, Tone } from "../engine/reading";

type IconProps = { size?: number };

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
});

export function Sprout({ size = 22 }: IconProps) {
  return (
    <svg {...base(size)}>
      <path d="M12 21v-8.5" />
      <path d="M12 13.5C12 9.6 9.2 7.2 5 7.2c0 3.9 2.8 6.3 7 6.3Z" />
      <path d="M12 11.2c0-3.6 2.6-6.2 6.8-6.2 0 3.6-2.6 6.2-6.8 6.2Z" />
    </svg>
  );
}

export function Briefcase({ size = 22 }: IconProps) {
  return (
    <svg {...base(size)}>
      <rect x="3.5" y="7.5" width="17" height="12.5" rx="3" />
      <path d="M9 7.5V6a1.8 1.8 0 0 1 1.8-1.8h2.4A1.8 1.8 0 0 1 15 6v1.5" />
      <path d="M3.5 12.5h17" />
    </svg>
  );
}

export function Hearts({ size = 22 }: IconProps) {
  return (
    <svg {...base(size)}>
      <path d="M10.5 20s-6.5-4-6.5-9.2a3.7 3.7 0 0 1 6.5-2.4 3.7 3.7 0 0 1 6.5 2.4c0 5.2-6.5 9.2-6.5 9.2Z" />
      <path d="M18.6 3.2c.3 1.3.8 1.8 2.1 2.1-1.3.3-1.8.8-2.1 2.1-.3-1.3-.8-1.8-2.1-2.1 1.3-.3 1.8-.8 2.1-2.1Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function HomePaw({ size = 22 }: IconProps) {
  return (
    <svg {...base(size)}>
      <path d="M3.8 11 12 4l8.2 7v8a1.2 1.2 0 0 1-1.2 1.2H5a1.2 1.2 0 0 1-1.2-1.2Z" />
      <g fill="currentColor" stroke="none">
        <ellipse cx="12" cy="16.6" rx="2.3" ry="1.9" />
        <circle cx="9.2" cy="13.6" r="0.95" />
        <circle cx="11" cy="12.2" r="0.95" />
        <circle cx="13" cy="12.2" r="0.95" />
        <circle cx="14.8" cy="13.6" r="0.95" />
      </g>
    </svg>
  );
}

export function Spark({ size = 14 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="-8 -8 16 16" aria-hidden="true">
      <path d="M0 -7 C1 -2 2 -1 7 0 C2 1 1 2 0 7 C-1 2 -2 1 -7 0 C-2 -1 -1 -2 0 -7 Z" fill="currentColor" />
    </svg>
  );
}

export function Star5({ size = 14 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 2.8l2.6 5.6 6.1.7-4.5 4.2 1.2 6-5.4-3-5.4 3 1.2-6-4.5-4.2 6.1-.7Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Chevron({ dir, size = 18 }: IconProps & { dir: "left" | "right" | "down" }) {
  const d = dir === "left" ? "M14.5 6 8.5 12l6 6" : dir === "right" ? "M9.5 6l6 6-6 6" : "M6 9.5l6 6 6-6";
  return (
    <svg {...base(size)} strokeWidth={2.2}>
      <path d={d} />
    </svg>
  );
}

export function Check({ size = 14 }: IconProps) {
  return (
    <svg {...base(size)} strokeWidth={3}>
      <path d="M5 12.5l4.2 4.2L19 7" />
    </svg>
  );
}

export function Copy({ size = 16 }: IconProps) {
  return (
    <svg {...base(size)}>
      <rect x="8" y="8" width="12" height="12" rx="3" />
      <path d="M16 8V6.5A2.5 2.5 0 0 0 13.5 4h-7A2.5 2.5 0 0 0 4 6.5v7A2.5 2.5 0 0 0 6.5 16H8" />
    </svg>
  );
}

export function ImageIcon({ size = 16 }: IconProps) {
  return (
    <svg {...base(size)}>
      <rect x="3.5" y="4.5" width="17" height="15" rx="3" />
      <circle cx="9" cy="10" r="1.8" />
      <path d="M20.5 15.5 15.5 11 6 19.5" />
    </svg>
  );
}

export function Bell({ size = 16 }: IconProps) {
  return (
    <svg {...base(size)}>
      <path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 1.5h-15Z" />
      <path d="M10 20.5a2 2 0 0 0 4 0" />
    </svg>
  );
}

export function Close({ size = 18 }: IconProps) {
  return (
    <svg {...base(size)} strokeWidth={2.2}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

export function ArrowRight({ size = 16 }: IconProps) {
  return (
    <svg {...base(size)} strokeWidth={2.2}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

// ------------------------------------------------------------ weather, one per condition

export function Sun({ size = 22 }: IconProps) {
  return (
    <svg {...base(size)}>
      <circle cx="12" cy="12" r="4.2" fill="currentColor" fillOpacity=".25" />
      <path d="M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5.5 5.5l1.7 1.7M16.8 16.8l1.7 1.7M5.5 18.5l1.7-1.7M16.8 7.2l1.7-1.7" />
    </svg>
  );
}

export function SunCloud({ size = 22 }: IconProps) {
  return (
    <svg {...base(size)}>
      <circle cx="9" cy="9" r="3.4" fill="currentColor" fillOpacity=".25" />
      <path d="M9 2.8v1.6M2.8 9h1.6M4.6 4.6l1.1 1.1M13.4 4.6l-1.1 1.1" />
      <path d="M8.5 19.5h9a3.3 3.3 0 0 0 .3-6.6 4.6 4.6 0 0 0-8.8.9 2.9 2.9 0 0 0-.5 5.7Z" fill="var(--tone, var(--card, #fff))" />
    </svg>
  );
}

export function CloudIcon({ size = 22 }: IconProps) {
  return (
    <svg {...base(size)}>
      <path d="M7 18.5h10.5a3.8 3.8 0 0 0 .4-7.6 5.5 5.5 0 0 0-10.6 1.2A3.2 3.2 0 0 0 7 18.5Z" fill="currentColor" fillOpacity=".2" />
    </svg>
  );
}

export function Moon({ size = 22 }: IconProps) {
  return (
    <svg {...base(size)}>
      <path d="M18.5 14.6A7.5 7.5 0 0 1 9.4 5.5a7.5 7.5 0 1 0 9.1 9.1Z" fill="currentColor" fillOpacity=".25" />
      <path d="M17.5 3.5v3M16 5h3" />
    </svg>
  );
}

export const TONE_ICON: Record<Tone, (p: IconProps) => React.JSX.Element> = {
  flowing: Sun,
  steady: SunCloud,
  mixed: CloudIcon,
  gentle: Moon,
};

export function ToneIcon({ tone, size = 22 }: { tone: Tone; size?: number }) {
  const I = TONE_ICON[tone];
  return <I size={size} />;
}

export const AREA_ICON: Record<AreaId, (p: IconProps) => React.JSX.Element> = {
  growth: Sprout,
  career: Briefcase,
  love: Hearts,
  family: HomePaw,
};
