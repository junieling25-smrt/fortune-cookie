/**
 * The personal layer: steps, "for you" lines, your element today, and the
 * long-term readings. Same house rules as copy.ts, enforced by the same test:
 * plain English, conditions not outcomes, no luck, no em dashes, cookie-sized.
 */
import type { ElementName, Energy, Family } from "./pillars";
import type { AreaId } from "./copy";

// ------------------------------------------------------------ about you

export type CareerCtx = "study" | "job" | "own" | "search" | "break";
export type LoveCtx = "single" | "dating" | "partnered" | "complicated";
export type HomeCtx = "cat" | "dog" | "pet" | "kids" | "parents" | "roommates" | "solo";
export type GrowthCtx = "energy" | "skill" | "confidence" | "calm" | "creative";

export const CAREER_CTX: Record<CareerCtx, string> = {
  study: "Studying",
  job: "Working a job",
  own: "Running my own thing",
  search: "Looking for work",
  break: "Taking a break",
};
export const LOVE_CTX: Record<LoveCtx, string> = {
  single: "Single",
  dating: "Dating",
  partnered: "In a relationship",
  complicated: "It's complicated",
};
export const HOME_CTX: Record<HomeCtx, string> = {
  cat: "A cat",
  dog: "A dog",
  pet: "Another pet",
  kids: "Kids",
  parents: "Parents",
  roommates: "Roommates",
  solo: "Just me",
};
export const GROWTH_CTX: Record<GrowthCtx, string> = {
  energy: "Energy & health",
  skill: "Learning a skill",
  confidence: "Confidence",
  calm: "Calm & balance",
  creative: "Creativity",
};

// ------------------------------------------------------------ your element today

/** "Your Ocean today": how your core element meets today's main energy. */
export const CORE_TODAY: Record<`${ElementName}.${"yang" | "yin"}`, Record<Family, string>> = {
  "Wood.yang": {
    company: "Tall trees grow in forests. Standing beside people who share your roots makes you stronger today.",
    expression: "Your branches want to spread today. Let yourself bloom a little louder than usual.",
    harvest: "A tree shapes the ground around it. Today you can put down roots in something practical.",
    structure: "Even tall trees get pruned. Today's limits can shape where you grow next.",
    nurture: "Rain on the roots today. Take in what's offered and grow quietly.",
  },
  "Wood.yin": {
    company: "Vines grow best with something to hold. Lean on friends today and climb together.",
    expression: "You want to flower today. Share what you've been quietly growing.",
    harvest: "Vines find every foothold. Today you can make clever use of small openings.",
    structure: "A trellis feels strict until you notice it's helping you climb. Today's rules may work the same way.",
    nurture: "Soft soil and sunshine today. Let yourself be cared for and let your roots do the rest.",
  },
  "Fire.yang": {
    company: "Two suns in one sky is a lot of light. Share the spotlight today and both of you shine.",
    expression: "The sun is at full strength today. Your warmth and ideas reach further than usual.",
    harvest: "Sunlight ripens fruit. Today your energy can turn plans into something real.",
    structure: "Even the sun sets on schedule. A little structure keeps your glow from burning out today.",
    nurture: "A good day to recharge the sun. Let other people warm you for a change.",
  },
  "Fire.yin": {
    company: "Candles light each other without losing any flame. Share your warmth freely today.",
    expression: "Your candle glows brightest in a quiet room. Share something personal with one person today.",
    harvest: "A steady candle gets the whole book read. Patient focus goes far today.",
    structure: "Candles need a holder. The right structure keeps your flame steady today.",
    nurture: "Wood feeds fire. Soak up support, stories, and good company today.",
  },
  "Earth.yang": {
    company: "Mountains come in ranges. Stand with people who are as steady as you today.",
    expression: "The mountain wants to bloom today. Let your softer, playful side show.",
    harvest: "Mountains hold treasure. Dig into the practical tasks you've been saving.",
    structure: "Wind and rain shape even mountains. Let a little pressure refine you today.",
    nurture: "Sunlight warms the mountain today. Rest in it. You don't have to hold everyone up.",
  },
  "Earth.yin": {
    company: "Gardens spread by sharing seeds. Trade ideas and favors with the people nearby today.",
    expression: "Your garden is blooming today. Show people what you've grown.",
    harvest: "Harvest day in the garden. Collect the results of your earlier effort.",
    structure: "Good gardens have tidy borders. A few boundaries help everything grow today.",
    nurture: "Sun and rain for the garden today. Let yourself be tended too.",
  },
  "Metal.yang": {
    company: "Two swords can spar or stand guard together. Choose to be on the same side today.",
    expression: "Your edge is sharp today. Use it to cut through confusion, gently.",
    harvest: "A sword is a tool as much as a weapon. Cut today's tasks down to size.",
    structure: "The forge makes the blade. Today's heat may be shaping your strength.",
    nurture: "Even a sword needs a sheath. Rest your edge today and let yourself be protected.",
  },
  "Metal.yin": {
    company: "Jewels look best in good company. Let the right people bring out your shine today.",
    expression: "Your polish shows today. Share the work you're proud of.",
    harvest: "Jewels hold their value. Today is good for knowing your worth and asking for it.",
    structure: "Polishing takes a little pressure. Today's friction can bring out your shine.",
    nurture: "A velvet-box kind of day. Let yourself be treasured and cared for.",
  },
  "Water.yang": {
    company: "Rivers join the ocean. People who flow like you make you feel bigger today, in a good way.",
    expression: "Waves want to move today. Let your ideas travel somewhere new.",
    harvest: "The ocean carves coastlines. Your persistence can shape something real today.",
    structure: "Oceans don't love walls, though a riverbank turns a flood into a current. Today's structure can give you direction.",
    nurture: "Rain refills the ocean. Take in support today and let your tide come back in.",
  },
  "Water.yin": {
    company: "Raindrops become a stream together. Collaboration carries you further today.",
    expression: "Your rain falls where it's needed today. A quiet insight of yours can help someone grow.",
    harvest: "Steady rain fills the reservoir. Small practical efforts add up today.",
    structure: "Rain follows the shape of the land. Let structure guide you today instead of fighting it.",
    nurture: "Clouds gather before rain. Rest and collect yourself today.",
  },
};

export const CORE_NICK: Record<`${ElementName}.${"yang" | "yin"}`, string> = {
  "Wood.yang": "Tall Tree",
  "Wood.yin": "Vine",
  "Fire.yang": "Sun",
  "Fire.yin": "Candle",
  "Earth.yang": "Mountain",
  "Earth.yin": "Garden",
  "Metal.yang": "Sword",
  "Metal.yin": "Jewel",
  "Water.yang": "Ocean",
  "Water.yin": "Rain",
};

// ------------------------------------------------------------ for you, by situation

export const CAREER_FOR: Record<CareerCtx, Record<Family, string>> = {
  study: {
    company: "Classmates are your best resource today. A study buddy or group chat can move you further than solo cramming.",
    expression: "Your ideas come out well today. A good day to draft an essay, present, or ask the question everyone else is thinking.",
    harvest: "Practical study pays today: past papers, flashcards, the reading you skimmed. Small reps add up.",
    structure: "Deadlines and grading rules are front and center. Read the rubric twice before you start.",
    nurture: "Learning sinks in easily today. Office hours or a good explainer video could unlock a tough topic.",
  },
  job: {
    company: "Teammates matter more than the org chart today. A quick sync with a peer could save you an afternoon.",
    expression: "Your ideas land well today. If there's a fix you've been holding back, put a rough version on the table.",
    harvest: "A good day for the tasks that show up in numbers: closing tickets, sending invoices, finishing the report.",
    structure: "Your manager's priorities set the weather today. Check that you're working on what they need first.",
    nurture: "Ask for context today. The person who knows the history of this project can save you hours.",
  },
  own: {
    company: "Other founders and freelancers are good company today. Compare notes with someone a few steps ahead.",
    expression: "Show your work today. A post, a pitch, or a portfolio update can reach the right people.",
    harvest: "Money matters are clear today. Chase one unpaid invoice or raise a price you've been undercharging.",
    structure: "Clients and commitments set the pace today. Deliver what you promised before chasing anything new.",
    nurture: "A mentor or an old client may have exactly the advice you need. Reach out and ask.",
  },
  search: {
    company: "Your network is the job board today. Message one person who works where you'd like to be.",
    expression: "Tell your story well today. Rewrite the first line of your resume or intro so it sounds like you.",
    harvest: "Practical moves pay off today. Send two focused applications instead of ten rushed ones.",
    structure: "Requirements matter today. Read the full job post and echo its words in your answers.",
    nurture: "Support makes the search lighter today. Ask someone to review your resume or run a practice interview.",
  },
  break: {
    company: "Friends who are also in between things are great company today. Swap plans, or just swap stories.",
    expression: "Use the free time to make something just for you. Side projects often turn into next steps.",
    harvest: "A good day to sort the practical side of your break: budget, paperwork, one small admin task.",
    structure: "A light routine keeps a break restful instead of aimless. Pick a wake-up time and one daily anchor.",
    nurture: "Rest is the work right now. Let the break actually refill you before you plan what's next.",
  },
};

export const LOVE_FOR: Record<LoveCtx, Record<Family, string>> = {
  single: {
    company: "Friends are the main event today. A group plan could introduce you to someone new, or just make you laugh.",
    expression: "Your charm is easy to reach today. Flirt a little, message first, or say yes to the invite.",
    harvest: "Get clear on what you want in a partner today. Knowing your list makes a good match easier to spot.",
    structure: "A good day to set a standard for next time. Boundaries make room for the right person.",
    nurture: "Take yourself on a date today. Being good company for yourself is attractive in every sense.",
  },
  dating: {
    company: "Keep it light and friendly today. The dates that feel like hanging out with a friend are often the promising ones.",
    expression: "Tell them what you liked about them. A specific compliment beats any clever opener.",
    harvest: "Make an actual plan today instead of “we should hang out”. Pick a time and a place.",
    structure: "Clarity is kind today. If you want to know where this is going, it's fine to ask.",
    nurture: "Notice how you feel after seeing them: calmer or more anxious. That feeling is useful information.",
  },
  partnered: {
    company: "Be teammates today. Tackle one shared chore or plan side by side.",
    expression: "Tell your partner one thing you appreciate that you've never said out loud.",
    harvest: "Practical love counts today: split a task, sort the calendar, handle the thing they've been dreading.",
    structure: "A good day to talk about plans and expectations, calmly and with snacks.",
    nurture: "Let them look after you a little today, or offer the same. Comfort is the whole point.",
  },
  complicated: {
    company: "Talk it through with a friend who knows you well. An outside view can untangle a lot.",
    expression: "Write down what you actually feel before you say anything. Clarity first, conversation second.",
    harvest: "Focus on what you can control today: your time, your energy, your next message.",
    structure: "Some lines may need drawing today. A kind boundary is still a boundary.",
    nurture: "Be gentle with yourself today. You don't have to solve this by tonight.",
  },
};

export const HOME_FOR: Record<HomeCtx, Record<Family, string>> = {
  cat: {
    company: "Your cat may want company on their own terms today. Sit nearby and let them come to you.",
    expression: "Playtime is the move today. Ten minutes with a string or a crinkly toy makes both of you happier.",
    harvest: "A good day for cat upkeep: fresh water, a clean litter box, and a restock of the good treats.",
    structure: "Cats love a routine. Feed and play at the usual times today and home stays calm.",
    nurture: "A slow evening with your cat on your lap counts as self-care today.",
  },
  dog: {
    company: "Your dog is your best social connector. A longer walk might mean a friendly chat with a neighbor.",
    expression: "Try a new trick or a new route today. Dogs love novelty as much as you do.",
    harvest: "A good day for dog admin: book the vet, order food, wash the favorite blanket.",
    structure: "Walks and meals on schedule keep everyone steady today, your dog most of all.",
    nurture: "A long, sniffy walk is good for both of you today. Let your dog set the pace.",
  },
  pet: {
    company: "Spend a quiet moment with your pet today. Small animals notice who shows up.",
    expression: "Give your pet something new to explore today, like a fresh toy or a rearranged corner.",
    harvest: "A good day to check supplies: food, bedding, and anything that needs cleaning.",
    structure: "Keep feeding and care times steady today. Pets feel safest with a rhythm.",
    nurture: "Watching your pet do their thing is surprisingly calming. Take five minutes for it today.",
  },
  kids: {
    company: "Kids may want your full attention today. Twenty phone-free minutes can mean more than a distracted afternoon.",
    expression: "Let the kids lead a game today. Their silliness is contagious if you let it be.",
    harvest: "A good day for family logistics: lunches, forms, and the calendar for the week ahead.",
    structure: "Routines help kids feel safe today. Keep bedtime and meals as steady as you can.",
    nurture: "Small comforts go far today: a favorite snack, a story, a hug that lasts a bit longer.",
  },
  parents: {
    company: "Your parents may want to feel included today. Share one small update from your life.",
    expression: "Tell a parent something you're proud of, or something funny that happened. They like hearing it.",
    harvest: "Help with one practical thing today, like a form, a phone setting, or an errand.",
    structure: "Family expectations may feel louder today. Listen first, then decide what's yours to carry.",
    nurture: "Let a parent look after you a little, even if it's just advice. It means a lot to them too.",
  },
  roommates: {
    company: "Home runs better as a team today. A quick check-in with your roommates clears the air.",
    expression: "Suggest a shared dinner or a movie night. Small rituals make a shared place feel like home.",
    harvest: "A good day to settle shared costs or restock the basics everyone uses.",
    structure: "House rules may need a refresh today. Keep it friendly and specific.",
    nurture: "Your own corner matters today. Make your room the calmest spot in the place.",
  },
  solo: {
    company: "Living solo makes you a great host. Invite someone over for something small, even just tea.",
    expression: "Make your space more yours today: move a lamp, hang a print, change the playlist.",
    harvest: "A good day for home admin: bills, groceries, and the thing that's needed fixing for weeks.",
    structure: "A simple routine makes solo living feel cozy instead of loose. Pick one ritual for tonight.",
    nurture: "Treat yourself like a guest today: clean sheets, a proper meal, a quiet evening.",
  },
};

export const GROWTH_FOR: Record<GrowthCtx, Record<Family, string>> = {
  energy: {
    company: "Move with someone today. A walk with a friend counts twice: exercise and connection.",
    expression: "Try movement that feels like play today. Dancing in the kitchen counts.",
    harvest: "Small, practical health wins today: water, a real lunch, an earlier bedtime.",
    structure: "Energy likes a schedule. Eat and sleep at regular times today and notice the difference.",
    nurture: "Rest is part of the plan today. A nap or an early night is progress too.",
  },
  skill: {
    company: "Learn alongside someone today. Explaining what you know to a friend makes it stick.",
    expression: "Make something with your new skill today, even something small and imperfect.",
    harvest: "Focused practice pays today. Pick the part you avoid and give it fifteen minutes.",
    structure: "A clear plan helps today. Write down what “good enough for this week” looks like.",
    nurture: "A good day to take things in: a lesson, a tutorial, a chapter. Absorb first, practice tomorrow.",
  },
  confidence: {
    company: "Stand next to people who believe in you today. Their view of you is worth borrowing.",
    expression: "Say one thing out loud today that you'd usually keep in your head.",
    harvest: "Keep a tiny list of things you did well today. Evidence beats pep talks.",
    structure: "Confidence grows from kept promises. Pick one small one and keep it today.",
    nurture: "Ask someone what they think you're good at. The answer may surprise you in a nice way.",
  },
  calm: {
    company: "Calm is contagious. Spend time with the steadiest person you know today.",
    expression: "Get the noise out of your head and onto paper. A messy page can make a calmer mind.",
    harvest: "Clear one small mess today, like a drawer or an inbox. Order outside helps order inside.",
    structure: "Build a small buffer into your day: ten minutes between things instead of zero.",
    nurture: "Give yourself real quiet today, no input and no scrolling. Even five minutes resets a lot.",
  },
  creative: {
    company: "Show a work in progress to someone today. Fresh eyes spark fresh ideas.",
    expression: "Ideas are flowing today. Catch them fast and judge them later.",
    harvest: "Finish something small today. One finished sketch beats ten half-started ones.",
    structure: "Constraints help today. Give yourself a rule, like one color or ten minutes, and see what happens.",
    nurture: "Feed your creativity today with a museum, a playlist, or a book outside your usual taste.",
  },
};

// ------------------------------------------------------------ tiny steps, 50 per area

/**
 * Ten per energy family per area. Tags keep a step away from people it doesn't
 * fit: "pet" and "kids" need a matching home, "partner" needs someone you're
 * dating or with, "single" needs single. {pet} becomes "your cat", "your dog"...
 */
export type StepTag = "pet" | "kids" | "partner" | "single";
export type Step = string | { t: string; needs: StepTag };

export const STEPS: Record<AreaId, Record<Family, Step[]>> = {
  growth: {
    company: [
      "Keep one promise to yourself before noon.",
      "Tell a friend one goal for this week, so someone knows.",
      "Spend ten minutes with someone who's good at what you're learning.",
      "Make one decision today without asking for opinions first.",
      "Write down three things you like about who you are right now.",
      "Take a walk with someone and talk about anything except work.",
      "Text a friend a song that matches your mood today.",
      "Catch one moment you compared yourself to someone, and let it go.",
      "Say no to one small thing you don't want to do.",
      "Sit up tall for your next call or meeting. Small posture, big difference.",
    ],
    expression: [
      "Make something small: a sketch, a note, a playlist.",
      "Write three sentences about how you actually feel today.",
      "Take one photo of something beautiful you'd normally walk past.",
      "Hum, sing, or dance through one full song.",
      "Cook something with one ingredient you've never used.",
      "Write a short thank-you note to your past self.",
      "Doodle for five minutes without erasing anything.",
      "Share one opinion you've been keeping to yourself.",
      "Rearrange one small corner so it feels more like you.",
      "Write a six-word story about your week.",
    ],
    harvest: [
      "Spend ten minutes on a skill you'd love to be paid for someday.",
      "Clear one to-do that's been on your list for over a week.",
      "Track where your time goes for one afternoon.",
      "Cancel one subscription or habit you don't actually use.",
      "Put a small amount of money toward a goal, even a tiny one.",
      "Finish one chapter, lesson, or episode you already started.",
      "Batch three small errands into one trip.",
      "Set a 20-minute timer and start the task you've been avoiding.",
      "Write down one thing you learned today and where you could use it.",
      "Tidy your desktop, digital or physical, for five minutes.",
    ],
    structure: [
      "Write tomorrow's top three tasks before bed.",
      "Go to bed fifteen minutes earlier than usual.",
      "Do one daily habit at the same time as yesterday.",
      "Plan tomorrow's meals in two minutes.",
      "Put your phone in another room for 30 minutes.",
      "Break one big goal into three small steps.",
      "Set an alarm for a break, and actually take it.",
      "Look at your week and circle the one thing that matters most.",
      "Say one boundary out loud, kindly.",
      "Finish one thing completely before starting the next.",
    ],
    nurture: [
      "Read ten pages of a real book.",
      "Drink a full glass of water before your next coffee.",
      "Take a 15-minute nap or a quiet lie-down.",
      "Watch one video from someone who teaches something you're curious about.",
      "Ask someone wiser one question you've been wondering about.",
      "Take a slow shower with no podcast.",
      "Step outside for five minutes of daylight.",
      "Write down the advice you'd give a friend in your situation.",
      "Stretch for five minutes before bed.",
      "Have one guilt-free treat.",
    ],
  },
  career: {
    company: [
      "Share one opinion at work or class that you'd normally keep to yourself.",
      "Ask a colleague or classmate how they handle the part you find hardest.",
      "Give someone credit by name in a message or meeting.",
      "Have a five-minute chat with someone outside your usual circle.",
      "Offer help on one small task someone is stuck on.",
      "Write down your own view before reading anyone else's.",
      "Reply to the message you've left on read.",
      "Pair up with someone for a 25-minute focus session.",
      "Ask for feedback on one specific thing you did.",
      "Add one recent win to your profile or portfolio.",
    ],
    expression: [
      "Draft the idea you've been sitting on, even roughly.",
      "Turn one long email into three clear bullet points.",
      "Sketch your plan on paper before opening a screen.",
      "Record a two-minute voice note explaining your idea.",
      "Rename one messy file or folder so future you can find it.",
      "Suggest one small fix to a process that annoys you.",
      "Write the first line of the thing you're avoiding.",
      "Show your work to one friendly person before the real audience.",
      "Make one slide, just one, for the idea in your head.",
      "Explain your project to someone outside your field in one minute.",
    ],
    harvest: [
      "Check one number that matters: a budget, an invoice, a grade, a goal.",
      "Finish the task that's closest to done.",
      "Follow up on one thing you're waiting on.",
      "Write down what you got done this week.",
      "Spend ten minutes learning something that makes you more valuable.",
      "Work out what one hour of your time is worth.",
      "Close five browser tabs and finish the one that matters.",
      "Get your inbox down to fewer than ten messages.",
      "Cancel one work expense or tool you forgot about.",
      "Send the invoice, form, or application you've been putting off.",
    ],
    structure: [
      "Confirm one deadline with the person who set it.",
      "Block 45 minutes of focus time and protect it.",
      "Write down your top priority before you open email.",
      "Re-read the instructions for your biggest task, slowly.",
      "Say “let me check and get back to you” instead of an instant yes.",
      "List what's due this week in date order.",
      "Turn off notifications for one hour of work.",
      "Tidy your workspace for five minutes before you start.",
      "Ask “what does done look like?” about one task.",
      "End the day by noting exactly where to pick up tomorrow.",
    ],
    nurture: [
      "Ask someone more experienced one good question.",
      "Take a real lunch break away from your screen.",
      "Read one article about your field just for curiosity.",
      "Thank someone who helped you, even months ago.",
      "Watch a short tutorial on a tool you use every day.",
      "Take a ten-minute walk between two tasks.",
      "Ask your manager, teacher, or client what they'd love to see more of.",
      "Write down one thing you're proud of from this month.",
      "Read the story of someone whose career you admire.",
      "Leave on time today and do something restful.",
    ],
  },
  love: {
    company: [
      "Text a friend just to check in. No reason needed.",
      "Send something funny to the group chat that's gone quiet.",
      "Plan a low-key hangout for this week.",
      "Tell a friend what you value about them.",
      "Reply to a message you've been putting off.",
      "Invite someone new for coffee or a walk.",
      { t: "Do one small thing together, side by side, like cooking or a walk.", needs: "partner" },
      { t: "Say yes to one social invite you'd usually skip.", needs: "single" },
      "Call someone instead of texting.",
      "Put a friend's upcoming birthday or big day in your calendar.",
    ],
    expression: [
      "Give someone a compliment that's specific.",
      "Send a voice note instead of a text.",
      "Share a song that reminds you of someone, and tell them why.",
      "Leave a short note where someone can find it.",
      "Tell someone a story from your day that made you laugh.",
      { t: "Tell your person one thing you appreciate that you've never said.", needs: "partner" },
      { t: "Update one photo or line on your profile so it sounds more like you.", needs: "single" },
      "Ask someone a question you've always wondered about them.",
      "Say “I missed you” to someone you did miss.",
      "Plan a tiny surprise, like their favorite snack.",
    ],
    harvest: [
      "Make a small plan with someone and actually book it.",
      "Pay for a friend's coffee, just because.",
      { t: "Split one chore so neither of you carries it alone.", needs: "partner" },
      "Put a hangout or date in the calendar with a real time.",
      "Pick up the small thing someone mentioned they needed.",
      "Come up with one budget-friendly date or hangout idea.",
      { t: "Write down three things you want in a partner and one you don't.", needs: "single" },
      "Return something you borrowed, with a thank-you.",
      "Help a friend with one practical task.",
      "Save a place or activity you'd both like to try.",
    ],
    structure: [
      "Ask a partner or friend what they need this week.",
      "Keep one plan exactly as promised, on time.",
      "Put your phone away for a whole conversation.",
      "Say one boundary, kindly and clearly.",
      { t: "Agree on one small shared plan for the weekend.", needs: "partner" },
      "Apologize for one small thing without adding “but”.",
      "Check in with someone you haven't heard from in a while.",
      "Reply today to someone who's waiting on you.",
      { t: "Decide one thing you won't compromise on next time.", needs: "single" },
      "Set up a regular catch-up with a friend, like the first Sunday of the month.",
    ],
    nurture: [
      "Let someone do something nice for you, and say thank you.",
      "Ask a friend how they're really doing, and wait for the real answer.",
      "Send a small treat to someone far away.",
      { t: "Cuddle, hold hands, or sit close for ten quiet minutes.", needs: "partner" },
      "Tell someone you're proud of them.",
      "Listen for five minutes without offering advice.",
      "Share something you're struggling with a friend you trust.",
      "Cook or order someone's comfort food.",
      { t: "Plan a solo treat, like a movie, a café, or a long walk, and enjoy your own company.", needs: "single" },
      "Write down three people who make you feel safe, then message one.",
    ],
  },
  family: {
    company: [
      "Share a chore instead of doing it all yourself.",
      "Eat one meal together with no screens.",
      { t: "Spend ten minutes just sitting with {pet}.", needs: "pet" },
      "Ask someone at home about the best part of their day.",
      "Call a sibling or cousin for no particular reason.",
      { t: "Let a kid teach you a game they love.", needs: "kids" },
      "Play one board game or card game with whoever's around.",
      "Say a proper hello to a neighbor.",
      { t: "Take {pet} somewhere new, even a new corner of the room or yard.", needs: "pet" },
      "Share an old family photo with someone.",
    ],
    expression: [
      "Play for fifteen minutes with whoever's at home, furry ones included.",
      { t: "Teach {pet} a new trick, or at least try.", needs: "pet" },
      "Put on music and cook together.",
      "Tell a family story to someone who hasn't heard it.",
      "Send a silly photo or video to family.",
      { t: "Draw or build something with a kid, no rules.", needs: "kids" },
      "Write a short note for someone at home.",
      { t: "Make a DIY toy for {pet} out of something in the recycling.", needs: "pet" },
      "Decorate one small spot at home for the season.",
      "Start a just-for-fun topic in the family group chat.",
    ],
    harvest: [
      "Restock whatever your home always runs out of.",
      { t: "Check {pet}'s food, treats, and supplies before they run low.", needs: "pet" },
      "Pay one household bill or sort one piece of paperwork.",
      "Fix one small thing at home, like a loose knob or a dead bulb.",
      "Plan three easy meals for the week.",
      "Clear out one drawer and donate what you don't use.",
      { t: "Book or check the date of {pet}'s next vet visit.", needs: "pet" },
      { t: "Sort one bag of outgrown clothes or toys.", needs: "kids" },
      "Start a shared shopping list everyone can add to.",
      "Set aside a small amount for a family treat.",
    ],
    structure: [
      "Keep one routine right on time, like dinner, a walk, or bedtime.",
      { t: "Feed and play with {pet} at the usual times.", needs: "pet" },
      "Agree on one small house rule and write it down.",
      "Put tomorrow's things by the door tonight.",
      "Tidy the entryway so mornings start calmer.",
      { t: "Keep bedtime steady tonight, story included.", needs: "kids" },
      "Check the family calendar for the week ahead.",
      "Set a quiet hour at home with no loud screens.",
      { t: "Clean {pet}'s bed, bowl, or litter box.", needs: "pet" },
      "Do the dishes before bed so tomorrow starts clear.",
    ],
    nurture: [
      "Call a family member you haven't heard from in a while.",
      { t: "Give {pet} a long, slow brush or cuddle.", needs: "pet" },
      "Cook something warm for the people at home.",
      "Ask a parent or elder for a recipe or a story.",
      "Make your bed with clean sheets.",
      { t: "Read a story together, with all the voices.", needs: "kids" },
      "Light a candle or play soft music at dinner.",
      { t: "Let {pet} set the pace of a walk or play today.", needs: "pet" },
      "Send a photo to family who live far away.",
      "Thank someone at home for something they always do.",
    ],
  },
};

/**
 * Small tweaks: concrete, two-second changes. Grouped by the element that eases
 * the day for this chart (see readTweaks in reading.ts).
 */
export const TWEAK: Record<ElementName, { wear: { color: string; hex: string }[]; eat: string[]; do: string[] }> = {
  Wood: {
    wear: [
      { color: "Sage green", hex: "#9DBF9E" },
      { color: "Leaf green", hex: "#5E9F62" },
      { color: "Mint", hex: "#A8E0C4" },
      { color: "Olive", hex: "#7C8B4A" },
      { color: "Teal", hex: "#2E8A86" },
    ],
    eat: [
      "Something green with lunch",
      "A squeeze of lemon in your water",
      "A handful of leafy greens",
      "Green tea instead of one coffee",
      "Something sour, like yogurt or a pickle",
      "A crunchy salad",
    ],
    do: [
      "Stand under a tree for one minute",
      "Water a plant, or buy a small one",
      "Take a ten-minute walk somewhere green",
      "Stretch your arms up high, three times",
      "Open a window first thing",
      "Start one tiny new thing",
    ],
  },
  Fire: {
    wear: [
      { color: "Coral", hex: "#FF8A7A" },
      { color: "Tomato red", hex: "#E5533D" },
      { color: "Rose pink", hex: "#F27BA0" },
      { color: "Plum", hex: "#8E4A8C" },
      { color: "Burnt orange", hex: "#D9682B" },
    ],
    eat: [
      "Something warm and a little spicy",
      "A square of dark chocolate",
      "Tomatoes or red peppers",
      "A bowl of berries or cherries",
      "A hot tea, sipped slowly",
      "Something grilled or toasted",
    ],
    do: [
      "Sit in sunlight for five minutes",
      "Light a candle at dinner",
      "Play one upbeat song, loud",
      "Send one warm compliment",
      "Turn the lights up bright while you work",
      "Call someone instead of texting",
    ],
  },
  Earth: {
    wear: [
      { color: "Mustard", hex: "#D9A520" },
      { color: "Sand beige", hex: "#DCC9A3" },
      { color: "Camel", hex: "#B98A55" },
      { color: "Terracotta", hex: "#C46A45" },
      { color: "Honey yellow", hex: "#F2C14E" },
    ],
    eat: [
      "Rice, oats, or another comfort grain",
      "A roasted sweet potato or pumpkin",
      "A spoon of honey in something warm",
      "Corn, carrots, or squash",
      "One home-cooked meal, sitting down",
      "A banana and a few nuts",
    ],
    do: [
      "Make your bed first thing",
      "Cook one thing from scratch",
      "Stand barefoot on grass or the floor for a minute",
      "Clear one surface at home",
      "Eat lunch away from your screen",
      "Keep one routine exactly as usual",
    ],
  },
  Metal: {
    wear: [
      { color: "Crisp white", hex: "#F6F4F0" },
      { color: "Silver gray", hex: "#B9BCC6" },
      { color: "Cream", hex: "#F3E9D2" },
      { color: "Pale gold", hex: "#D8C27A" },
      { color: "Light gray", hex: "#D7D9DE" },
    ],
    eat: [
      "A crisp pear or apple",
      "Something with ginger or garlic",
      "Radish, cauliflower, or white beans",
      "A plain bowl of rice",
      "Peppermint tea",
      "Something fresh and crunchy, like cucumber",
    ],
    do: [
      "Clear your desk before you start",
      "Delete ten old photos or emails",
      "Write a three-item list and stop there",
      "Wear a ring, a watch, or anything metal",
      "Clean your glasses or your phone screen",
      "Take three slow breaths by an open window",
    ],
  },
  Water: {
    wear: [
      { color: "Navy", hex: "#23365E" },
      { color: "Black", hex: "#1B1B22" },
      { color: "Deep blue", hex: "#2D5DA8" },
      { color: "Ink blue", hex: "#2B3A67" },
      { color: "Slate", hex: "#4C5868" },
    ],
    eat: [
      "A bowl of soup or broth",
      "Black beans or black sesame",
      "Blueberries or blackberries",
      "Seaweed snacks or sushi",
      "An extra big glass of water",
      "Miso soup",
    ],
    do: [
      "Take a long shower or bath",
      "Drink a glass of water before each meal",
      "Listen to rain sounds for five minutes",
      "Walk near water if you can",
      "Go to bed 20 minutes earlier",
      "Sit for three minutes with no phone",
    ],
  },
};

/**
 * Why today's tweaks lean on one element, in BaZi terms. Keyed by how today's
 * main element meets the reader's core element ({today}, {core}, {el}).
 */
export const TWEAK_WHY: Record<"structure" | "expression" | "harvest" | "company" | "company.light" | "nurture" | "nurture.light", string> = {
  structure: "Today's {today} presses on your {core}. {el} sits between them: {today} feeds {el}, and {el} feeds {core}, so the pressure turns into support.",
  expression: "Today's {today} draws on your {core}. {el} feeds {core} back, so you don't run dry.",
  harvest: "Today's {today} asks your {core} to do a lot of work. More {el}, the same element as your core, gives you backup.",
  company: "Today brings more {today}, the same element as your {core}. {el} gives that extra energy somewhere useful to go.",
  "company.light": "Today brings more {today}, the same element as your {core}. {el} feeds it further, which suits a chart with little backup.",
  nurture: "Today's {today} feeds your {core} plenty. {el} keeps all that support moving instead of piling up.",
  "nurture.light": "Today's {today} feeds your {core}, and your chart can use it. More {el} helps you take it all in.",
};

/** What ties each tweak to its element, in the five-element tradition. */
export const TWEAK_NOTE: Record<ElementName, { wear: string; eat: string; do: string; listen: string }> = {
  Wood: { wear: "Green is Wood's color in the five elements.", eat: "Five-element food lore links sour tastes and fresh greens to Wood.", do: "Trees, plants, and stretching all carry Wood.", listen: "Chinese music theory gives each element a tone. Wood's is bright and rising, like acoustic strings and open air." },
  Fire: { wear: "Reds, pinks, and purples are Fire's colors.", eat: "Bitter and warming foods belong to Fire.", do: "Sunlight, warmth, and good company all carry Fire.", listen: "Chinese music theory gives each element a tone. Fire's is quick and bright, so anything with a beat you can move to carries it." },
  Earth: { wear: "Yellows and browns are Earth's colors.", eat: "Sweet, grounding foods like grains and squash belong to Earth.", do: "Cooking, routines, and tending your home all carry Earth.", listen: "Chinese music theory gives each element a tone. Earth's is the warm center note, steady and full, like soul and slow grooves." },
  Metal: { wear: "White, gray, and gold are Metal's colors.", eat: "Pungent foods like ginger, garlic, and radish belong to Metal.", do: "Clearing, sorting, and slow breaths all carry Metal.", listen: "Chinese music theory gives each element a tone. Metal's is clear and ringing, so clean, precise sounds carry it." },
  Water: { wear: "Black and deep blues are Water's colors.", eat: "Salty, dark foods like seaweed and black beans belong to Water.", do: "Rest, quiet, and time near water all carry Water.", listen: "Chinese music theory gives each element a tone. Water's is low and flowing, so slow, spacious sounds carry it." },
};

/** Kinds of music for the day's helpful element. Genres only, never song names. */
export const MUSIC: Record<ElementName, string[]> = {
  Wood: ["Acoustic folk", "Indie folk", "Bossa nova", "Bluegrass", "Fingerstyle guitar", "Chamber strings"],
  Fire: ["Upbeat pop", "Funk", "Disco", "Salsa", "Afrobeats", "K-pop"],
  Earth: ["Classic soul", "Old-school R&B", "Country", "Soft rock", "Reggae", "Gospel"],
  Metal: ["Classical piano", "Baroque", "Minimal electronic", "Synth-pop", "Cool jazz", "Brass band"],
  Water: ["Lo-fi beats", "Ambient", "Dream pop", "Trip-hop", "Smooth jazz", "Rain and piano"],
};

/** The almanac's joy direction, by day stem (Jia and Ji, Yi and Geng, Bing and Xin, Ding and Ren, Wu and Gui). */
export const WALK_DIRS: { dir: string; short: string; deg: number }[] = [
  { dir: "Northeast", short: "NE", deg: 45 },
  { dir: "Northwest", short: "NW", deg: 315 },
  { dir: "Southwest", short: "SW", deg: 225 },
  { dir: "South", short: "S", deg: 180 },
  { dir: "Southeast", short: "SE", deg: 135 },
];

export const WALK_NOTE =
  "Old Chinese almanacs name a joy direction for every day, set by the day's stem. Today it points {dir}. {el} is your helpful element today, so the places below carry it.";

/** Places to look for, by element. Each one is also a map search. */
export const WALK_PLACES: Record<ElementName, string[]> = {
  Wood: ["Park", "Garden", "Bookstore", "Plant shop"],
  Fire: ["Cafe", "Dessert shop", "Dance studio", "Sunny plaza"],
  Earth: ["Bakery", "Farmers market", "Pottery studio", "Neighborhood diner"],
  Metal: ["Museum", "Art gallery", "Record store", "Stationery shop"],
  Water: ["Waterfront", "Tea house", "Aquarium", "Swimming pool"],
};

// ------------------------------------------------------------ compatibility

export const MATCH_HEADLINE: Record<"flowing" | "steady" | "mixed" | "gentle", string> = {
  flowing: "An easy match. You tend to bring out each other's best.",
  steady: "A solid match. Comfortable, with room to grow.",
  mixed: "A match that takes a little work and teaches you both something.",
  gentle: "Different rhythms. Patience makes this one work.",
};

/** Their core element, seen from yours. */
export const MATCH_FAM: Record<Family, string> = {
  nurture: "They feel like support. Around them, you can rest and refill.",
  company: "They feel like a peer. Same wavelength, and sometimes the same stubborn streak.",
  expression: "They bring out your playful side. You may give a lot, so keep it even.",
  harvest: "They feel like someone to look after. You tend to show up for them.",
  structure: "They keep you on your toes. A little pressure, a lot of growth.",
};

export const MATCH_DAY: Record<"harmony" | "trine" | "echo" | "clash" | "none", string> = {
  harmony: "Your day animals are a natural pair. Everyday life together tends to feel easy.",
  trine: "Your day animals are on the same team. You share a pace and a sense of humor.",
  echo: "You share a day animal. Very familiar, sometimes too familiar.",
  clash: "Your day animals sit opposite each other. Expect sparks, and give each other room.",
  none: "Your day animals are neutral. You build the closeness yourselves, one habit at a time.",
};

export const MATCH_YEAR: Record<"harmony" | "trine" | "echo" | "clash" | "none", string> = {
  harmony: "A classic zodiac pair. Friends and family often see you as a good fit.",
  trine: "Zodiac allies. Your year animals share a group and a way of seeing the world.",
  echo: "Same year animal. You get each other's roots.",
  clash: "Opposite year animals. Your backgrounds may need a little translating.",
  none: "A neutral zodiac pairing. Nothing to fix, nothing handed to you.",
};

export const MATCH_TIP: Record<Family | "fills", string> = {
  nurture: "Say thanks out loud. Support feels better when it's noticed.",
  company: "Take turns leading. Two captains need a schedule.",
  expression: "Let them give back to you sometimes.",
  harvest: "Ask what they need before you fix it.",
  structure: "When they push, ask what they're aiming for.",
  fills: "They carry the element that balances your chart. Shared routines suit you two.",
};

// ------------------------------------------------------------ the bigger picture

export const YEAR: Record<`${Family}.${"light" | "balanced" | "full"}`, string> = {
  "company.light": "This year brings more of your own element into the air. After stretching for a while, it's a good stretch to lean on friends and find your footing.",
  "company.balanced": "A year of peers and partnerships. Things move when you team up, and some competition may show up in the same places.",
  "company.full": "A year that turns up the volume on who you already are. Your strengths are loud, and making room for others keeps them useful.",
  "expression.light": "A year that asks you to create and share a lot. Pace yourself: pick the projects that matter and let the rest wait.",
  "expression.balanced": "A creative, expressive year. Good conditions for launching, writing, performing, or finally saying what you mean.",
  "expression.full": "A year that gives your energy somewhere to go. Make things, teach things, and let your ideas out into the world.",
  "harvest.light": "A year with real openings and limited energy. Choose one or two goals and give them your best.",
  "harvest.balanced": "A practical, productive year. Effort turns into results at a fair rate, so it's a good time to build.",
  "harvest.full": "A year full of openings, and you have the strength to use them. Keep an eye on overcommitting.",
  "structure.light": "A year with more demands than usual. Protect your rest, ask for help early, and keep your promises small and solid.",
  "structure.balanced": "A year of responsibility and recognition. Roles are clearer, and stepping up tends to count.",
  "structure.full": "A year that tests what you can carry, and you can carry a lot. Choose which responsibilities are really yours.",
  "nurture.light": "A year that refills you. Learning, mentors, and rest are on your side. Take them.",
  "nurture.balanced": "A year for learning and settling in. Good conditions for study, home, and growing slowly.",
  "nurture.full": "A comfortable, well-supported year. The trap is staying too comfortable, so pick one thing to stretch toward.",
};

export const YEAR_LINK: Record<"clash" | "harmony" | "echo", string> = {
  clash: "This year's {today} bumps into your {pillar} {natal}, the part of your chart linked to {link}. That area may ask for extra patience this year.",
  harmony: "This year's {today} gets along with your {pillar} {natal}, the part of your chart linked to {link}. That area may feel easier this year.",
  echo: "This year's {today} matches your {pillar} {natal}, the part of your chart linked to {link}. Old patterns there may come around for another look.",
};

export const YEAR_AREA: Record<AreaId, Record<Family, string>> = {
  growth: {
    company: "Your sense of self firms up this year. Good for habits you build alongside friends.",
    expression: "A year to try new creative outlets and let people see more of you.",
    harvest: "Practical self-improvement pays: skills, money habits, health routines.",
    structure: "Growth comes through challenge this year. Discipline is your friend.",
    nurture: "A year of learning and healing. Books, teachers, and rest all count.",
  },
  career: {
    company: "Collaboration and networks matter most this year. Watch for competition over the same roles.",
    expression: "A good year to put your work out there: portfolios, launches, presentations.",
    harvest: "Money and results are in focus. A strong year to negotiate, build, or sell.",
    structure: "Responsibility and visibility tend to rise together this year. Pace yourself.",
    nurture: "A year to learn, retrain, or find a mentor. Study and credentials are well supported.",
  },
  love: {
    company: "Friendships are the heart of the year. Partners feel more like teammates.",
    expression: "A flirty, expressive year. Say how you feel and let people see your fun side.",
    harvest: "Practical love: shared plans, shared costs, and building something together.",
    structure: "Commitment is in the air. Talks about the future come more naturally.",
    nurture: "A cozy, caring year for relationships. Comfort and loyalty matter more than sparks.",
  },
  family: {
    company: "Siblings, cousins, and friends who feel like family are a big part of the year.",
    expression: "A lively year at home: kids, pets, hobbies, and noise, in a good way.",
    harvest: "Home projects and household money are in focus. A good year to invest in your space.",
    structure: "Family responsibilities may grow this year. Share the load where you can.",
    nurture: "A year of support from home. Parents, elders, and your own nest feel extra important.",
  },
};

export const LIFE_AREA: Record<AreaId, Record<Family, string>> = {
  growth: {
    company: "Independence is your lifelong teacher. You grow most when you trust your own judgment.",
    expression: "You grow by making and sharing. Creative outlets keep you well.",
    harvest: "You grow through doing. Real projects teach you more than theory.",
    structure: "You grow under challenge. Discipline and responsibility shape you over the years.",
    nurture: "You grow through learning and reflection. Teachers, books, and quiet time matter to you.",
  },
  career: {
    company: "You do well alongside peers: partnerships, teams, and work where you set your own course.",
    expression: "Your work tends to shine where ideas, words, or craft are the product.",
    harvest: "You have a practical head for results, resources, and money. Building things suits you.",
    structure: "You're built for responsibility. Leadership and trust tend to grow across your career.",
    nurture: "Knowledge is your edge. Teaching, research, care, or advising often suit you.",
  },
  love: {
    company: "You want a partner who's also a best friend. Equality matters to you.",
    expression: "You love out loud. Affection, fun, and good conversation keep you close.",
    harvest: "You show love by doing. Reliability and shared plans matter to you.",
    structure: "You take commitment seriously. Loyalty, respect, and clear promises matter most.",
    nurture: "You love by caring and being cared for. Emotional safety comes first.",
  },
  family: {
    company: "Siblings and friends often feel like family to you. You build your own tribe.",
    expression: "You're the fun one at home: the one who plays, cooks, and brings people together.",
    harvest: "You're the practical one at home: the one who keeps things running.",
    structure: "You often carry responsibility in your family. Remember to share the load.",
    nurture: "Home is your recharge station. Roots and comfort matter deeply to you.",
  },
};

export const TOMORROW: Record<"flowing" | "steady" | "mixed" | "gentle", string> = {
  flowing: "Something easy is tucked inside for {area}.",
  steady: "There's a quiet note in there for {area}.",
  mixed: "There's a heads-up in there about {area}.",
  gentle: "There's a soft note in there about {area}.",
};

// ------------------------------------------------------------ read more

/** The longer "read more" under Overall, keyed by the day's main energy family. */
export const OVERALL_DEEP: Record<Family, string> = {
  company:
    "Days like this put people like you in your path: friends, peers, teammates, maybe a rival or two. You might notice you're comparing notes, or comparing yourself. Today works better for doing things alongside someone than for proving you can do it all alone. Stand on your own backbone and let good company carry some of the weight.",
  expression:
    "Today your energy wants a way out: words, ideas, cooking, a joke, a sketch, a strong opinion. When this kind of energy has nowhere to go it can come out as restlessness or sharpness, so give it a job. Make or share one thing on purpose, even something small, and notice how much lighter the rest of the day feels.",
  harvest:
    "Today is practical. Effort tends to show up as something you can hold: a finished task, a paid bill, a tidy result. It's a good day for errands and follow-ups and a less good one for grand plans. If you've been waiting for a moment to deal with money or logistics, this is a friendly one.",
  structure:
    "Today leans on you a little. Rules, deadlines, and other people's expectations may feel louder than usual. That pressure can feel heavy, and it can also make things clear: you find out what actually matters when the room gets tight. Pick what you'll carry today and put the rest down without guilt.",
  nurture:
    "Today is a refill day. Support, advice, rest, and learning come easier than usual, and it's fine to take them. You don't need to earn a quiet evening or a good conversation. Things you read or hear today may stay with you longer than usual, so feed yourself something good.",
};

/** The longer "read more" under This month, keyed by how the month's element relates to you. */
export const MONTH_DEEP: Record<Family, string> = {
  company:
    "This month surrounds you with your own kind of energy. It can feel like confidence one week and crowdedness the next. Good for teamwork, friendships, and projects where you set the pace. Watch for spreading yourself thin by saying yes to every like-minded plan.",
  expression:
    "This month asks you to put things out into the world: work, ideas, feelings. It's a productive, visible stretch, and it uses up energy fast. Pace yourself by choosing one or two things to really show, and let the rest stay in drafts.",
  harvest:
    "This month is about results you can measure. Money, chores, and practical goals move at a fair rate if you keep showing up. It's a good month to finish things, tidy loose ends, and reward yourself for the unglamorous work.",
  structure:
    "This month brings responsibility and a bit of pressure. Deadlines and expectations are clearer, which can be tiring and useful at the same time. Protect your rest, say no early, and notice which obligations are actually yours.",
  nurture:
    "This month refills you. Learning, advice, home comforts, and rest come more easily, and taking them is the smart move. Use the extra support to recover and to learn something that pays off later.",
};

/** The longer "read more" for each life area, keyed by the energy family that area reads today. */
export const AREA_DEEP: Record<AreaId, Record<Family, string>> = {
  growth: {
    company: "Your sense of self is sturdy today, which makes it a good day to keep the promises you make to yourself. You may feel less need for outside approval. If a comparison creeps in, flip it: what does that person's progress show you about what's possible for you?",
    expression: "Growth today looks like play. Making something, even something silly, loosens up the parts of you that have been stiff. Pay attention to what you enjoy without being asked; those small pulls often point at what you actually want.",
    harvest: "Today favors practical self-improvement: the small habits that add up. A tidy routine, a budget check, ten minutes of practice. It isn't glamorous, and it's the kind of progress you can feel by the end of the week.",
    structure: "Growth today comes through a little friction. A deadline, a rule, or a tough conversation can show you what you're made of. Try treating structure as a trellis instead of a cage: something to climb, not something to escape.",
    nurture: "Your mind is especially open today. Something you read, hear, or get told could stay with you for a while. Rest counts here too: a nap or a quiet hour is how new ideas settle in.",
  },
  career: {
    company: "At work, today is about people who do what you do: peers, teammates, classmates, competitors. Collaboration moves faster than solo effort, and a quick chat can save you hours. If someone's going after the same goal, make your case clearly and let your work speak.",
    expression: "Your ideas have momentum today. Drafts, pitches, and presentations come out more naturally than usual. The trap is saying the sharp thing before the helpful thing, so pair every criticism with a suggestion and pick your audience.",
    harvest: "Today is good for work that shows up in numbers: tasks closed, invoices sent, grades checked, goals ticked. Steady effort converts well. If there's a money conversation you've been putting off, conditions support it.",
    structure: "Work may bring clear expectations today, and some pressure with them. Bosses, clients, teachers, or deadlines set the pace. Meeting them well builds trust, so only take on what you can finish; reliable beats impressive.",
    nurture: "Today is a good day to learn at work. Ask the question, read the docs, find the mentor. People are more willing to help than you might assume, and what you pick up now can pay off later.",
  },
  love: {
    company: "Friendship energy runs through your relationships today. With a partner, you may feel more like teammates than romantic leads, and that's a good thing. With friends, a simple plan or a check-in goes a long way. Keep any competitiveness playful.",
    expression: "You express yourself easily today, which is lovely for flirting, compliments, and honest talks. Words also land harder than usual, so say the true thing kindly. A voice note, a silly message, or a small gesture can say more than a long speech.",
    harvest: "Love today shows up in practical care: plans made, chores shared, details remembered. It's a good day to turn “we should” into a date on the calendar. Small reliable gestures build more closeness than grand ones.",
    structure: "Today brings commitment and fairness into focus. You may want clarity about where things stand, or feel other people's expectations more strongly. A calm, specific conversation works better than hints. Boundaries said kindly make relationships safer, and no colder.",
    nurture: "Warmth is easy to give and receive today. Let someone look after you, or offer a little comfort to someone who needs it. Listening without fixing is the gift of the day. Feeling safe matters more than excitement right now.",
  },
  family: {
    company: "Home life today is about sharing the load and the space. Siblings, housemates, cousins, or friends who feel like family may be around more. Fairness helps: split chores evenly and keep small squabbles light.",
    expression: "Home has playful energy today. Kids, pets, and your own inner kid want fun more than order. A game, a new toy, a song while cooking, or a silly photo in the family chat can shift the whole mood of the house.",
    harvest: "Today is good for the practical side of home: groceries, bills, repairs, and restocking. It's satisfying work, and it quietly makes everyone's week easier. Check on the supplies your pets or family always run out of.",
    structure: "Routines hold home together today. Regular meals, walks, and bedtimes help everyone feel settled, pets especially. If family expectations feel heavy, listen first, then decide what's really yours to carry.",
    nurture: "Home feels like a refuge today. It's a good day to call a parent, cook something warm, or spend a slow evening with the people and animals you love. Let yourself be looked after too.",
  },
};

// ------------------------------------------------------------ the years ahead

/** One flavor line per year, keyed by how that year's element meets your core element. */
export const YEAR_ENERGY: Record<Energy, string> = {
  self: "A year to stand on your own feet. Your opinions and choices carry more weight than usual.",
  rival: "A year of shared stages. Collaborators and competitors often turn out to be the same people.",
  play: "An easygoing, creative year. Things you make for fun can quietly turn into something bigger.",
  voice: "A year that wants you to speak up. Honest ideas travel far, and tact decides how well they land.",
  windfall: "A year of surprise openings: side projects, new places, people you didn't expect to meet.",
  savings: "A steady, building year. Savings, skills, and routines pay back more than bold swings.",
  push: "A stretching year with real pressure in it. Taken at your own pace, it tends to leave you stronger.",
  rules: "A year of commitments and clear roles. Titles, agreements, and promises take shape.",
  intuition: "A thoughtful, inward year. Unusual interests and time alone lead somewhere worth going.",
  care: "A supported, learning year. Teachers, family, and rest give you more than usual.",
};
