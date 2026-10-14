/**
 * Every sentence a reader sees is written here, by hand, once.
 *
 * Nothing is generated at runtime. The chart math picks which sentence to show;
 * it never writes one. House rules for anything added to this file:
 *
 * - Plain English only. No Chinese characters, no romanized terms, no jargon.
 * - Conditions and choices. Never "will happen", never luck, never a verdict.
 * - Never call an element "missing" or a chart "bad". Every chart is uneven.
 * - No em dashes and no "it's not X, it's Y" lines. Readers spot both as
 *   machine-written, and they're right.
 * - Short. If a line doesn't fit on a cookie slip, cut it.
 */
import type { ElementName, Energy, Family, PillarKey, StrengthBand } from "./pillars";

export type Tone = "flowing" | "steady" | "mixed" | "gentle";
export type AreaId = "growth" | "career" | "love" | "family";
export type LoadState = "scarce" | "present" | "saturated";

// ------------------------------------------------------------ plain names

export const FAMILY_NAME: Record<Family, string> = {
  company: "Company",
  expression: "Expression",
  harvest: "Harvest",
  structure: "Structure",
  nurture: "Nurture",
};

export const FAMILY_MEANS: Record<Family, string> = {
  company: "friends, peers, teammates, and a bit of friendly competition",
  expression: "creativity, speaking up, fun, and caring for others",
  harvest: "money, results, and getting practical things done",
  structure: "rules, deadlines, bosses, and responsibility",
  nurture: "learning, rest, support, and being looked after",
};

export const ENERGY_MEANS: Record<Energy, string> = {
  self: "your own backbone",
  rival: "friendly competition",
  play: "easygoing creativity",
  voice: "bold, honest expression",
  windfall: "unexpected openings",
  savings: "steady, practical gains",
  push: "pressure and challenges",
  rules: "clear expectations",
  intuition: "gut feelings and alone time",
  care: "support and comfort",
};

export const TONE_LABEL: Record<Tone, string> = {
  flowing: "Flowing",
  steady: "Steady",
  mixed: "Mixed",
  gentle: "Go gently",
};

export const AREA_META: Record<AreaId, { title: string; covers: string }> = {
  growth: { title: "Personal growth", covers: "Mood, habits, learning" },
  career: { title: "Career & money", covers: "Work, study, goals, money" },
  love: { title: "Love & friends", covers: "Partners, dates, friends" },
  family: { title: "Family & pets", covers: "Home, parents, kids, pets" },
};

export const PILLAR_META: Record<PillarKey, { label: string; theme: string; means: string }> = {
  year: { label: "Year", theme: "Roots", means: "family background and how the world first sees you" },
  month: { label: "Month", theme: "Work & routine", means: "your daily environment, career, and parents" },
  day: { label: "Day", theme: "You & your person", means: "your inner self and your closest relationship" },
  hour: { label: "Hour", theme: "Hopes & little ones", means: "your plans, dreams, kids, and pets" },
};

/** Short phrase used in "the part of your chart linked to ..." */
export const PILLAR_LINK: Record<PillarKey, string> = {
  year: "family and roots",
  month: "work and daily routine",
  day: "your closest relationships",
  hour: "your plans, kids, and pets",
};

// ------------------------------------------------------------ your chart

export const CORE: Record<ElementName, { yang: { title: string; text: string }; yin: { title: string; text: string } }> = {
  Wood: {
    yang: { title: "The Tall Tree", text: "Steady, principled, always growing toward something. You stand your ground and give others shade. You can also be hard to bend." },
    yin: { title: "The Climbing Vine", text: "Flexible, social, and good at finding a way around obstacles. You grow by connecting. You can also lean too hard on what's around you." },
  },
  Fire: {
    yang: { title: "The Sun", text: "Warm, generous, and hard to miss. You light up a room. You can also burn out if you shine for everyone all day." },
    yin: { title: "The Candle", text: "Focused warmth. Perceptive, thoughtful, and great one on one. You glow best with a little shelter from the wind." },
  },
  Earth: {
    yang: { title: "The Mountain", text: "Solid, reliable, and protective. People lean on you. You can also be slow to move once you've settled." },
    yin: { title: "The Garden", text: "Nurturing, practical, and quietly productive. You help things grow. You can also soak up more than your share." },
  },
  Metal: {
    yang: { title: "The Sword", text: "Direct, decisive, and fair. You cut straight to the point. You can also cut deeper than you meant to." },
    yin: { title: "The Jewel", text: "Refined, precise, and tuned to detail. You notice quality. You can also be hard on yourself when things aren't polished." },
  },
  Water: {
    yang: { title: "The Ocean", text: "Big-picture, restless, and adventurous. You carry a lot and keep moving. You can also be hard to pin down." },
    yin: { title: "The Rain", text: "Intuitive, gentle, and imaginative. You reach places others miss. You can also soak up other people's moods." },
  },
};

export const ELEMENT_MORE: Record<ElementName, string> = {
  Wood: "growth, ideas, and fresh starts come naturally",
  Fire: "warmth, energy, and being seen come naturally",
  Earth: "steadiness and reliability come naturally",
  Metal: "focus, standards, and clear decisions come naturally",
  Water: "curiosity, flow, and adapting come naturally",
};

export const ELEMENT_LESS: Record<ElementName, string> = {
  Wood: "starting new things may take an extra push",
  Fire: "getting fired up or noticed may take extra effort",
  Earth: "staying grounded in routine may take extra effort",
  Metal: "finishing and letting go may take extra effort",
  Water: "resting and reflecting may take extra effort",
};

export const HELPFUL: Record<ElementName, { color: string; ideas: string }> = {
  Wood: { color: "Leafy green", ideas: "Plants, walks under trees, and fresh starts." },
  Fire: { color: "Warm coral", ideas: "Sunlight, good company, and a little spice." },
  Earth: { color: "Honey yellow", ideas: "Routines, home cooking, and time in a garden." },
  Metal: { color: "Silver and white", ideas: "Tidying up, clear lists, and crisp air." },
  Water: { color: "Deep blue", ideas: "Rest, music, a long shower, and time near water." },
};

// ------------------------------------------------------------ today's slip

/** Two variants per key, alternating each time the same day energy comes back. */
export const SLIP: Record<`${Energy}.${LoadState}`, [string, string]> = {
  "self.scarce": [
    "Today asks you to stand on your own two feet. It may feel new, and that's how new strength starts.",
    "Your own opinion matters more than usual today. Give it a little room to speak.",
  ],
  "self.present": [
    "You know where you stand today. Say it out loud instead of waiting for someone to agree first.",
    "Your footing is solid today. Trust the plan you already made.",
  ],
  "self.saturated": [
    "You're extra sure of yourself today. Run your idea past one person who sees it differently.",
    "Your mind is made up today. Leave one small door open for a better idea.",
  ],
  "rival.scarce": [
    "Someone may want the same thing you want today. Wanting it out loud is allowed.",
    "A little competition shows up today. Treat it like a game and it gets lighter.",
  ],
  "rival.present": [
    "You may feel torn between sharing and keeping today. Only give what you can give without a grudge.",
    "Sharing is on the menu today. Split things fairly, including the credit.",
  ],
  "rival.saturated": [
    "Comparison is loud today. Other people's pace says nothing about the quality of yours.",
    "You may feel like keeping score today. Put the scoreboard away for an hour.",
  ],
  "play.scarce": [
    "You may feel like making something just for fun today. Follow that little itch.",
    "A small creative urge may pop up today. It doesn't need a reason to be worth following.",
  ],
  "play.present": [
    "Ideas come easily today. Finish one small thing before you start a big one.",
    "Things you make today come out with ease. Enjoy the easy part.",
  ],
  "play.saturated": [
    "You have more ideas than hours today. Pick one and let the rest wait their turn.",
    "Fun is everywhere today. Make sure one useful thing also gets done.",
  ],
  "voice.scarce": [
    "Something you usually keep quiet may want out today. Notice it before you say it.",
    "Your honest side is close to the surface today. Let it speak gently.",
  ],
  "voice.present": [
    "You can see exactly what's off about something today. Being right and picking the right moment are two separate choices.",
    "You have a sharp eye today. Aim it at problems and go easy on people.",
  ],
  "voice.saturated": [
    "Your critique is probably correct and probably early. Wait until people are ready to hear it.",
    "Opinions come fast today. Let a few pass by without comment.",
  ],
  "windfall.scarce": [
    "A chance may show up today in an unfamiliar shape. Unfamiliar can still be right for you.",
    "Something new may knock today. Open the door a crack and take a look.",
  ],
  "windfall.present": [
    "There's movement available today if you go toward it. You don't have to walk through every open door.",
    "A small opening may appear today. Small and real beats big and vague.",
  ],
  "windfall.saturated": [
    "Plenty of shiny options today. Holding one beats juggling five.",
    "Offers and ideas pile up today. You're allowed to say “not now” to most of them.",
  ],
  "savings.scarce": [
    "Today rewards small upkeep over big moves. Ten boring minutes now saves a messy hour later.",
    "Today favors the practical stuff you usually skip. Future you says thanks.",
  ],
  "savings.present": [
    "The steady version of your plan is the strong one today. Slow and solid counts.",
    "Slow and steady is the smart play today. Protect what's already working.",
  ],
  "savings.saturated": [
    "You may be holding on to more than you need. Ask which things you keep out of love and which out of habit.",
    "You're guarding a lot today. Let go of one thing you no longer need.",
  ],
  "push.scarce": [
    "Pressure may come from somewhere unexpected today. Name it before you react to it.",
    "A challenge may land on your desk today. You're tougher than the first five minutes feel.",
  ],
  "push.present": [
    "There's real demand on you today. You can meet it, move it, or pause it. Pick one on purpose.",
    "Today asks something of you. Answer on your own timeline.",
  ],
  "push.saturated": [
    "Urgency is loud today. Plenty of things that shout can actually wait.",
    "Pressure is piling up today. Put one thing down before you pick up another.",
  ],
  "rules.scarce": [
    "Rules and expectations feel extra visible today. Read the fine print before you push back.",
    "Someone may hand you a rule today. Understand it first, then decide what to do.",
  ],
  "rules.present": [
    "What people expect from you is clear today. That also makes clear what they don't expect.",
    "Clear lines make things easier today. Follow them and save your energy.",
  ],
  "rules.saturated": [
    "You're carrying a lot of “shoulds” today. Some are real duties and some are old habits. Sort them.",
    "Duty feels heavy today. Check which duties you picked and which were handed to you.",
  ],
  "intuition.scarce": [
    "Help may arrive today in a shape you don't recognize. Try not to turn it down on reflex.",
    "An odd idea may make sense today. Write it down before logic talks you out of it.",
  ],
  "intuition.present": [
    "There's room to step back and think today. Enjoy it, then come back out.",
    "Your gut is a good guide today. Give it a quiet moment to talk.",
  ],
  "intuition.saturated": [
    "Your head is a cozy place to hide today. Two laps of overthinking is plenty.",
    "Thinking feels cozy today, maybe too cozy. Set a timer, then act.",
  ],
  "care.scarce": [
    "You may need more backup today than you'd like to admit. Asking early is easier than asking late.",
    "Kindness may come from someone unexpected today. Let it in.",
  ],
  "care.present": [
    "Good support is close by today. Using it doesn't cost anyone anything.",
    "Support flows both ways today. Give some, take some.",
  ],
  "care.saturated": [
    "Comfort is easy to reach today. Take the kind you need and skip the kind you're just used to.",
    "Rest is easy to find today. Take what refuels you, then get moving.",
  ],
};

export const OVERALL_TONE: Record<Tone, string> = {
  flowing: "The day leans your way. Good for starting or asking.",
  steady: "A balanced day. Nothing needs forcing.",
  mixed: "Some push, some pull. Leave slack in your plans.",
  gentle: "A day to go gently. Keep plans light.",
};

/** One question to carry, keyed by today's animal meeting your chart. */
export const ASK: Record<string, string> = {
  "clash.day": "What are you defending that no one has actually attacked?",
  "clash.month": "Whose expectations are you pushing against, and did they ever say them out loud?",
  "clash.hour": "What are you rushing toward that would still be fine next week?",
  "clash.year": "Which old rule of yours is this friction really about?",
  "harmony.day": "What gets easier the moment you stop treating it like a problem?",
  "harmony.month": "Who is easy to work with right now, and have you told them?",
  "harmony.hour": "If this goes well, are you ready for what comes next?",
  "harmony.year": "What are you agreeing to because it's comfortable rather than right?",
  "echo.day": "Where are you repeating yourself and calling it consistency?",
  "echo.month": "What keeps showing up this month that you keep calling a coincidence?",
  "echo.hour": "What do you do at the same time every day without ever choosing to?",
  "echo.year": "What have you believed about yourself for so long that you stopped checking?",
  "none.company": "Who in your life feels like a teammate right now, and do they know it?",
  "none.expression": "What would you make or say today if nobody graded it?",
  "none.harvest": "What small result would make today feel worth it?",
  "none.structure": "Which “should” on your list is actually yours?",
  "none.nurture": "What would it look like to let yourself be looked after today?",
};

// ------------------------------------------------------------ this month

export const SEASON: Record<`${Family}.${StrengthBand}`, string> = {
  "company.light": "This month is on your side, even on days you feel low on fuel. Leaning on friends counts as strength.",
  "company.balanced": "This month wants what you want. That makes it easy to say yes to too much.",
  "company.full": "This month turns up the volume on who you already are. More of you isn't always the answer.",
  "nurture.light": "This month refills your tank. Taking the support is the job right now.",
  "nurture.balanced": "More is coming in than going out this month. A good time to learn something new.",
  "nurture.full": "You're well stocked, and this month keeps giving. Watch for the point where resting turns into stalling.",
  "expression.light": "This month asks you to put a lot out, with less to give than usual. Choosing what to skip is the real decision.",
  "expression.balanced": "This month wants you to make things. Pick one project and let the rest wait.",
  "expression.full": "You have energy to spare and this month wants it used. Spend it on something that matters to you.",
  "harvest.light": "There's something good to work with this month, with less energy than you'd like. Keep the goal, shrink the plan.",
  "harvest.balanced": "Effort turns into results at a fair rate this month. A solid time for practical goals.",
  "harvest.full": "You can handle more than this month asks. Whether you should is a separate question.",
  "structure.light": "This month presses on you while you're not at full strength. A shorter to-do list beats trying to do it all.",
  "structure.balanced": "There's real pressure this month, and you can handle a fair share. You decide how big that share is.",
  "structure.full": "You can carry what this month asks. Watch that you don't pick up things that were never yours.",
};

// ------------------------------------------------------------ life areas

/** What today's energy means in each area. Keyed by the energy that area reads. */
export const AREA_TEXT: Record<AreaId, Record<Energy, string>> = {
  growth: {
    self: "Today supports standing on your own. A good day to keep a promise you made to yourself.",
    rival: "Other people's progress may be on your mind. Use it as information and skip the self-scoring.",
    play: "Your creative side is easy to reach. Doodle, cook, tinker. Fun counts as growth.",
    voice: "You may feel restless with how things are. That itch is useful when it points at something you can change.",
    windfall: "Curiosity is high. Say yes to one small new thing, like a class, a podcast, or a new way home.",
    savings: "Small routines pay off today. One tidy habit beats a big life overhaul.",
    push: "Today may test your patience. How you handle a little pressure is where the growth is.",
    rules: "Structure helps you today. A simple plan or checklist can feel surprisingly calming.",
    intuition: "Your inner voice is louder than usual. Journaling or a quiet walk could turn up something interesting.",
    care: "A good day to learn from someone who's been there. Reading, mentors, and rest all count.",
  },
  career: {
    self: "You feel surer of your position at work today. A good moment to share your view.",
    rival: "Someone at work may be after the same prize. Keep your eyes on your own work and give credit where it's due.",
    play: "Work flows best today when you enjoy it. Lean into tasks where you get to make or design something.",
    voice: "You can spot what needs fixing at work today. Bring the fix along with the problem, and choose your audience.",
    windfall: "Side projects and new contacts are in the air. Worth a reply, even if you're not sure yet.",
    savings: "Steady effort pays today. A good day for budgets, invoices, and the unglamorous tasks.",
    push: "Work may bring tight deadlines or a demanding person. Clear priorities are your best shield.",
    rules: "Expectations at work are clear today. Follow the process, tidy your files, and let reliability speak.",
    intuition: "Unusual ideas come easily. Jot them down before a meeting squeezes them out.",
    care: "Help at work is within reach. Ask a mentor, a teammate, or your manager for what you need.",
  },
  love: {
    self: "You know what you want from your relationships today. Say it kindly and clearly.",
    rival: "A little competitiveness may show up between friends or partners. Keep it playful.",
    play: "Easy, playful energy with people today. A good day for a casual plan or a silly text.",
    voice: "Words may come out sharper than usual. Honest is good. Harsh is optional.",
    windfall: "Your social life has a spark. A new face or an old friend may pop up, so stay open.",
    savings: "Small, steady gestures matter today. Remember the details and keep your plans.",
    push: "Tension may run higher with the people closest to you. Give each other a little extra room.",
    rules: "Commitment and fairness are on the table. A good day to talk about plans and expectations.",
    intuition: "You may want more alone time today. Tell people you're recharging so they don't have to guess.",
    care: "Warmth is easy to give and receive today. Let someone look after you for once.",
  },
  family: {
    self: "At home, you may want things done your way. Leave room for everyone else's way too.",
    rival: "Siblings or housemates may squabble over space or attention. A little fairness goes a long way.",
    play: "Playtime is the move today. Kids, pets, and your inner kid all benefit from a goofy hour.",
    voice: "You may feel like pointing out every mess at home. Pick the one that matters most.",
    windfall: "A good day for a small treat or outing with family. A new toy or a new walk route delights pets too.",
    savings: "Home upkeep feels satisfying today. Tidy one corner, restock the pet food, pay a bill.",
    push: "Family may lean on you more than usual. Help where you can, and say so when you need a break.",
    rules: "Routines keep home calm today. Regular meals and walk times help everyone, pets most of all.",
    intuition: "You may need a quiet corner today. Pets are excellent company for doing nothing together.",
    care: "Home feels like a safe place today. Call a parent, cuddle a pet, cook something warm.",
  },
};

export const AREA_TONE: Record<AreaId, Record<Tone, string>> = {
  growth: {
    flowing: "Momentum is on your side. Small effort goes a long way.",
    steady: "An even day. Consistency beats intensity.",
    mixed: "Some push, some pull. Try a smaller step than you planned.",
    gentle: "Your energy may run lower. Rest counts as progress today.",
  },
  career: {
    flowing: "Conditions support moving work forward.",
    steady: "Steady conditions. Keep going at your usual pace.",
    mixed: "Some friction around work. Double-check the details before you hit send.",
    gentle: "Work may feel heavier than usual. Protect your focus and keep promises small.",
  },
  love: {
    flowing: "Connection comes easily. Reach out first.",
    steady: "An even day with people. Nothing needs forcing.",
    mixed: "Mixed signals are possible. Ask before you assume.",
    gentle: "Feelings may sit close to the surface. Go easy on yourself and others.",
  },
  family: {
    flowing: "Home feels warm and easy today.",
    steady: "A calm, ordinary day at home. Enjoy the ordinary.",
    mixed: "A few bumps at home are possible. Patience does most of the work.",
    gentle: "Home may need extra patience today. Keep plans simple.",
  },
};

/** How today's animal meets one of yours, in plain words. */
export const RELATION_NOTE: Record<"clash" | "harmony" | "echo", string> = {
  clash: "Today's {today} bumps into your {pillar} {natal}, the part of your chart linked to {link}. Things there may feel bumpier than usual.",
  harmony: "Today's {today} gets along with your {pillar} {natal}, the part of your chart linked to {link}. Things there may feel smoother.",
  echo: "Today's {today} matches your {pillar} {natal}, the part of your chart linked to {link}. Familiar patterns may come around again.",
};
