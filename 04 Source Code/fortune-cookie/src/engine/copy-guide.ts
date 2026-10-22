/**
 * Explainers: the welcome, the "What it means" page, and the little
 * definitions that pop up over terms. Same house rules as copy.ts.
 */
import type { ElementName } from "./pillars";

// ------------------------------------------------------------ welcome

export const INTRO = {
  bazi: {
    kicker: "How we read your fortune",
    title: "BaZi: eight signs from the moment you were born.",
    body: "BaZi, also called the Four Pillars, is a Chinese birth chart used for over a thousand years. Your birth year, month, day, and hour each get one of five elements and one of twelve animals: eight signs in all. Every day has signs of its own, and we compare them with yours.",
    pillars: [
      { label: "Year", element: "Wood", animal: "Dog" },
      { label: "Month", element: "Fire", animal: "Rabbit" },
      { label: "Day", element: "Water", animal: "Tiger" },
      { label: "Hour", element: "Wood", animal: "Dragon" },
    ] as const,
  },
  app: {
    kicker: "How the app works",
    title: "One cookie a day. About a minute.",
    steps: [
      "Crack today's cookie for your fortune and a score from 0 to 100. On a phone, pull it apart.",
      "Meet your year animal, the zodiac sign most people know. It sits by your score, dresses for the season, and cheers when you try a tweak.",
      "Try small tweaks picked for your chart: a color, a food, an action, and a kind of music.",
      "Look ahead at your year, check a match with a friend, and explore places in the day's direction.",
    ],
  },
};

/** One short line under the logo while the app opens. */
export const SPLASH: string[] = [
  "Your chart has four animals, not just one.",
  "The Chinese year starts in early February, not on January 1.",
  "Each day has its own element and animal.",
  "Five elements, twelve animals, one you.",
  "The Four Pillars have been read for over a thousand years.",
];

// ------------------------------------------------------------ what it means

export const ELEMENT_INFO: Record<ElementName, { nature: string; traits: string; season: string; colors: string }> = {
  Wood: { nature: "Trees and plants", traits: "Growth, ideas, kindness, fresh starts", season: "Spring", colors: "Greens" },
  Fire: { nature: "Sun and flame", traits: "Warmth, energy, joy, being seen", season: "Summer", colors: "Reds, pinks, purples" },
  Earth: { nature: "Mountains and fields", traits: "Steadiness, care, trust, routine", season: "The turn of each season", colors: "Yellows and browns" },
  Metal: { nature: "Stone, ore, and blades", traits: "Focus, clarity, standards, letting go", season: "Autumn", colors: "Whites, grays, golds" },
  Water: { nature: "Rain, rivers, and sea", traits: "Wisdom, flow, rest, imagination", season: "Winter", colors: "Blues and black" },
};

export const CYCLE_LINES = {
  feeds: "Each element feeds the next: Wood feeds Fire, Fire makes Earth, Earth holds Metal, Metal carries Water, Water grows Wood.",
  checks: "Each also keeps another in check: Wood holds Earth, Earth dams Water, Water calms Fire, Fire melts Metal, Metal cuts Wood.",
};

export const YIN_YANG = {
  yang: "Yang is the outward side: bold, direct, moving.",
  yin: "Yin is the inward side: gentle, adaptable, deep.",
  both: "Every element comes in a yang and a yin version, like a tall tree and a climbing vine.",
};

export const ANIMAL_INFO: Record<string, { trait: string; hours: string }> = {
  Rat: { trait: "Quick, clever, resourceful", hours: "11 PM to 1 AM" },
  Ox: { trait: "Patient, steady, hardworking", hours: "1 to 3 AM" },
  Tiger: { trait: "Brave, bold, big-hearted", hours: "3 to 5 AM" },
  Rabbit: { trait: "Gentle, tactful, graceful", hours: "5 to 7 AM" },
  Dragon: { trait: "Confident, lively, ambitious", hours: "7 to 9 AM" },
  Snake: { trait: "Wise, calm, intuitive", hours: "9 to 11 AM" },
  Horse: { trait: "Free, energetic, warm", hours: "11 AM to 1 PM" },
  Goat: { trait: "Creative, kind, easygoing", hours: "1 to 3 PM" },
  Monkey: { trait: "Curious, playful, inventive", hours: "3 to 5 PM" },
  Rooster: { trait: "Sharp, honest, organized", hours: "5 to 7 PM" },
  Dog: { trait: "Loyal, fair, protective", hours: "7 to 9 PM" },
  Pig: { trait: "Generous, sincere, easy to love", hours: "9 to 11 PM" },
};

export const PILLAR_INFO: { key: "year" | "month" | "day" | "hour"; title: string; text: string }[] = [
  { key: "year", title: "Year", text: "Your zodiac animal. Family roots and first impressions." },
  { key: "month", title: "Month", text: "Your work, routines, and the world you grew up in." },
  { key: "day", title: "Day", text: "You. Its element is your core, and its animal is your closest relationship." },
  { key: "hour", title: "Hour", text: "Hopes, plans, and the little ones in your life. Needs a birth time." },
];

export const CHANGES: { when: string; text: string }[] = [
  { when: "Every day", text: "Each day has an element and an animal. Your daily cookie reads that pair against your chart." },
  { when: "About every 30 days", text: "Solar months follow the sun, so they start around the 4th to 8th of each month." },
  { when: "Every early February", text: "The new year starts with the start of spring, around February 4." },
  { when: "Never", text: "Your own four pillars are fixed at birth. They're the lens for everything else." },
];

/** Why a day and its month can score very differently. */
export const LONG_VIEW_NOTE =
  "Your daily score reads one day. This score reads the month or year as a whole, from its own pillar, so a great day can sit inside a harder month.";

export const SCORE_INFO = {
  what: "The daily number is our own shorthand for how easy today's energy is for your chart, from 0 to 100.",
  bands: [
    { tone: "flowing", range: "91 to 100", text: "Leans your way" },
    { tone: "steady", range: "83 to 90", text: "Balanced" },
    { tone: "mixed", range: "74 to 82", text: "Some push and pull" },
    { tone: "gentle", range: "Below 74", text: "Go gently" },
  ] as const,
  note: "A low number is a reason to be kind to yourself, never a bad day in disguise.",
};

// ------------------------------------------------------------ pop-up definitions

export const GLOSSARY: Record<string, string> = {
  Yang: YIN_YANG.yang,
  Yin: YIN_YANG.yin,
  Wood: "Wood is growth: trees, spring, new ideas.",
  Fire: "Fire is warmth: sun, summer, energy, being seen.",
  Earth: "Earth is steadiness: fields, routine, care.",
  Metal: "Metal is clarity: autumn, focus, clean edges.",
  Water: "Water is flow: winter, rest, imagination.",
  core: "Your core element comes from the day you were born. Every reading looks through it.",
  score: SCORE_INFO.what,
  "year animal": "Your year animal is the zodiac sign most people know. It's one of four in your chart.",
  "day energy": "Every day has an element and an animal of its own, in a cycle of 60 days.",
  tweak: "The element that eases today for your chart. The color, food, and action all carry it.",
};

export const animalTip = (animal: string) => {
  const a = ANIMAL_INFO[animal];
  return a ? `The ${animal}: ${a.trait.toLowerCase()}.` : "";
};
