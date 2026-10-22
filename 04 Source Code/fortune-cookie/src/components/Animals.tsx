/** Twelve little animal faces for the pillars. Drawn in one style: round head, dot eyes, pink cheeks. */

const INK = "#2A1C44";
const LINE = "#5A3A22";
const BLUSH = "#FF9FB8";

function Face({ x = 24, y = 29 }: { x?: number; y?: number }) {
  return (
    <>
      <circle cx={x - 6} cy={y - 2} r="2.2" fill={INK} />
      <circle cx={x + 6} cy={y - 2} r="2.2" fill={INK} />
      <circle cx={x - 5.3} cy={y - 2.8} r="0.7" fill="#fff" />
      <circle cx={x + 6.7} cy={y - 2.8} r="0.7" fill="#fff" />
      <ellipse cx={x - 10} cy={y + 3} rx="3" ry="1.9" fill={BLUSH} opacity=".75" />
      <ellipse cx={x + 10} cy={y + 3} rx="3" ry="1.9" fill={BLUSH} opacity=".75" />
    </>
  );
}

const stroke = { stroke: LINE, strokeWidth: 1.6, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

const ANIMALS: Record<string, () => React.JSX.Element> = {
  Rat: () => (
    <>
      <circle cx="12" cy="15" r="7" fill="#C9C4D6" {...stroke} />
      <circle cx="36" cy="15" r="7" fill="#C9C4D6" {...stroke} />
      <circle cx="12" cy="15" r="3.8" fill="#FFC6D4" />
      <circle cx="36" cy="15" r="3.8" fill="#FFC6D4" />
      <circle cx="24" cy="28" r="14" fill="#DCD8E6" {...stroke} />
      <Face />
      <circle cx="24" cy="31" r="1.8" fill="#FF8DB0" />
      <path d="M17 32 L9 30 M17 34 L9 35 M31 32 L39 30 M31 34 L39 35" stroke={LINE} strokeWidth="1" strokeLinecap="round" />
    </>
  ),
  Ox: () => (
    <>
      <path d="M13 17 C 8 15, 6 10, 8 6 C 10 10, 13 12, 17 13 Z" fill="#FFF3DE" {...stroke} />
      <path d="M35 17 C 40 15, 42 10, 40 6 C 38 10, 35 12, 31 13 Z" fill="#FFF3DE" {...stroke} />
      <ellipse cx="9" cy="23" rx="5" ry="3" fill="#C99A6A" {...stroke} />
      <ellipse cx="39" cy="23" rx="5" ry="3" fill="#C99A6A" {...stroke} />
      <rect x="11" y="13" width="26" height="30" rx="13" fill="#D9B283" {...stroke} />
      <Face y={25} />
      <ellipse cx="24" cy="36" rx="9" ry="5.5" fill="#F4D9B8" {...stroke} />
      <circle cx="20.5" cy="36" r="1.2" fill={LINE} />
      <circle cx="27.5" cy="36" r="1.2" fill={LINE} />
    </>
  ),
  Tiger: () => (
    <>
      <path d="M11 20 L10 9 L20 14 Z" fill="#F6A94C" {...stroke} />
      <path d="M37 20 L38 9 L28 14 Z" fill="#F6A94C" {...stroke} />
      <circle cx="24" cy="28" r="15" fill="#F7B35C" {...stroke} />
      <path d="M24 14 L24 19 M19 15 L20 19 M29 15 L28 19 M9 26 L13 27 M9 31 L13 30 M39 26 L35 27 M39 31 L35 30" stroke={LINE} strokeWidth="1.8" strokeLinecap="round" />
      <ellipse cx="24" cy="35" rx="7" ry="5" fill="#FFF6E8" />
      <Face />
      <path d="M22 33 L26 33 L24 35.5 Z" fill="#E6788F" />
    </>
  ),
  Rabbit: () => (
    <>
      <ellipse cx="18" cy="11" rx="4.5" ry="10" fill="#FFF7F7" {...stroke} />
      <ellipse cx="30" cy="11" rx="4.5" ry="10" fill="#FFF7F7" {...stroke} />
      <ellipse cx="18" cy="11" rx="2" ry="7" fill="#FFC6D4" />
      <ellipse cx="30" cy="11" rx="2" ry="7" fill="#FFC6D4" />
      <circle cx="24" cy="30" r="13.5" fill="#FFF7F7" {...stroke} />
      <Face y={30} />
      <path d="M22.5 33 L25.5 33 L24 34.8 Z" fill="#FF8DB0" />
      <path d="M24 34.8 C 23 37, 21 37, 20.5 36 M24 34.8 C 25 37, 27 37, 27.5 36" fill="none" stroke={LINE} strokeWidth="1" strokeLinecap="round" />
    </>
  ),
  Dragon: () => (
    <>
      <path d="M16 15 C 14 9, 15 5, 18 3 C 18 7, 19 10, 21 13 Z" fill="#F7D27E" {...stroke} />
      <path d="M32 15 C 34 9, 33 5, 30 3 C 30 7, 29 10, 27 13 Z" fill="#F7D27E" {...stroke} />
      <path d="M9 30 C 4 28, 3 24, 5 21 M39 30 C 44 28, 45 24, 43 21" fill="none" stroke={LINE} strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="24" cy="28" r="14.5" fill="#9EDFC0" {...stroke} />
      <path d="M17 16 C 20 14, 28 14, 31 16" fill="none" stroke="#6CBF9A" strokeWidth="2" strokeLinecap="round" />
      <Face />
      <ellipse cx="24" cy="35" rx="7" ry="4.5" fill="#C9F0DD" {...stroke} />
      <circle cx="21.5" cy="34.5" r="1" fill={LINE} />
      <circle cx="26.5" cy="34.5" r="1" fill={LINE} />
    </>
  ),
  Snake: () => (
    <>
      <path d="M8 42 C 8 36, 16 35, 24 37 C 32 39, 40 38, 40 43" fill="none" stroke="#B9A6F2" strokeWidth="6" strokeLinecap="round" />
      <ellipse cx="24" cy="24" rx="14" ry="12.5" fill="#C8B8F6" {...stroke} />
      <circle cx="17" cy="15" r="1.6" fill="#9E88E6" />
      <circle cx="24" cy="13" r="1.6" fill="#9E88E6" />
      <circle cx="31" cy="15" r="1.6" fill="#9E88E6" />
      <Face y={25} />
      <path d="M24 31 L24 35 L22 37 M24 35 L26 37" fill="none" stroke="#FF6F96" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  Horse: () => (
    <>
      <path d="M13 16 L14 6 L20 12 Z" fill="#C98B5A" {...stroke} />
      <path d="M35 16 L34 6 L28 12 Z" fill="#C98B5A" {...stroke} />
      <ellipse cx="24" cy="27" rx="12.5" ry="16" fill="#D69A68" {...stroke} />
      <path d="M18 12 C 21 8, 27 8, 30 12 C 28 15, 26 17, 24 17 C 22 15, 20 14, 18 12 Z" fill="#7A4A2E" />
      <Face y={25} />
      <ellipse cx="24" cy="37" rx="8" ry="5.5" fill="#F0C79E" {...stroke} />
      <circle cx="21" cy="37" r="1.1" fill={LINE} />
      <circle cx="27" cy="37" r="1.1" fill={LINE} />
    </>
  ),
  Goat: () => (
    <>
      <path d="M15 16 C 8 16, 6 9, 11 7 C 14 6, 15 9, 13 10" fill="none" stroke="#9A93B0" strokeWidth="3" strokeLinecap="round" />
      <path d="M33 16 C 40 16, 42 9, 37 7 C 34 6, 33 9, 35 10" fill="none" stroke="#9A93B0" strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="8" cy="24" rx="5" ry="2.8" fill="#EDE3CC" {...stroke} />
      <ellipse cx="40" cy="24" rx="5" ry="2.8" fill="#EDE3CC" {...stroke} />
      <ellipse cx="24" cy="27" rx="12.5" ry="14" fill="#F5EEDD" {...stroke} />
      <Face y={25} />
      <path d="M22.5 31 L25.5 31 L24 33 Z" fill="#E6788F" />
      <path d="M21 39 C 22 44, 26 44, 27 39 Z" fill="#EDE3CC" {...stroke} />
    </>
  ),
  Monkey: () => (
    <>
      <circle cx="9" cy="27" r="6" fill="#B07A52" {...stroke} />
      <circle cx="39" cy="27" r="6" fill="#B07A52" {...stroke} />
      <circle cx="9" cy="27" r="3" fill="#F2C9A6" />
      <circle cx="39" cy="27" r="3" fill="#F2C9A6" />
      <circle cx="24" cy="27" r="14.5" fill="#B98158" {...stroke} />
      <path d="M24 17 C 30 14, 36 19, 33 25 C 36 30, 32 39, 24 39 C 16 39, 12 30, 15 25 C 12 19, 18 14, 24 17 Z" fill="#F4D2B0" />
      <Face y={27} />
      <path d="M20 33 C 22 35.5, 26 35.5, 28 33" fill="none" stroke={LINE} strokeWidth="1.4" strokeLinecap="round" />
    </>
  ),
  Rooster: () => (
    <>
      <path d="M17 13 C 16 7, 20 5, 21 9 C 22 4, 27 4, 27 9 C 29 5, 33 8, 31 13 Z" fill="#FF7A6E" {...stroke} />
      <circle cx="24" cy="27" r="14" fill="#FFF8EC" {...stroke} />
      <Face y={25} />
      <path d="M20.5 29 L27.5 29 L24 34 Z" fill="#F7C04A" {...stroke} />
      <path d="M22.5 34 C 22 38, 26 38, 25.5 34" fill="#FF7A6E" {...stroke} />
    </>
  ),
  Dog: () => (
    <>
      <circle cx="24" cy="28" r="14" fill="#EBCB9C" {...stroke} />
      <path d="M12 16 C 6 16, 4 26, 7 32 C 10 34, 13 30, 13 25 Z" fill="#A9754B" {...stroke} />
      <path d="M36 16 C 42 16, 44 26, 41 32 C 38 34, 35 30, 35 25 Z" fill="#A9754B" {...stroke} />
      <circle cx="29" cy="23" r="4" fill="#D9A970" opacity=".7" />
      <Face y={27} />
      <ellipse cx="24" cy="33" rx="2.6" ry="1.9" fill={INK} />
      <path d="M24 35 L24 36.5 M21.5 37 C 23 38.5, 25 38.5, 26.5 37" fill="none" stroke={LINE} strokeWidth="1.2" strokeLinecap="round" />
    </>
  ),
  Pig: () => (
    <>
      <path d="M11 19 L10 9 L19 14 Z" fill="#FFB1C4" {...stroke} />
      <path d="M37 19 L38 9 L29 14 Z" fill="#FFB1C4" {...stroke} />
      <circle cx="24" cy="28" r="14.5" fill="#FFC6D4" {...stroke} />
      <Face y={25} />
      <ellipse cx="24" cy="34" rx="6.5" ry="4.5" fill="#FF9FB8" {...stroke} />
      <ellipse cx="21.8" cy="34" rx="1.2" ry="1.7" fill={LINE} />
      <ellipse cx="26.2" cy="34" rx="1.2" ry="1.7" fill={LINE} />
    </>
  ),
};

export function AnimalIcon({ animal, size = 48, label, children }: { animal: string; size?: number; label?: string; children?: React.ReactNode }) {
  const Draw = ANIMALS[animal];
  if (!Draw) return null;
  return (
    <svg className="animal-icon" width={size} height={size} viewBox="0 0 48 48" role="img" aria-label={label ?? animal}>
      <Draw />
      {children}
    </svg>
  );
}

/** Just the drawing, for use inside another svg (the pet adds a body). */
export function AnimalHead({ animal }: { animal: string }) {
  const Draw = ANIMALS[animal];
  return Draw ? <Draw /> : null;
}

/** Where each face sits, so the pet's glasses land on its eyes. */
export const FACE_Y: Record<string, number> = { Rat: 29, Ox: 25, Tiger: 29, Rabbit: 30, Dragon: 29, Snake: 25, Horse: 25, Goat: 25, Monkey: 27, Rooster: 25, Dog: 27, Pig: 25 };

export const ANIMAL_NAMES = Object.keys(ANIMALS);
