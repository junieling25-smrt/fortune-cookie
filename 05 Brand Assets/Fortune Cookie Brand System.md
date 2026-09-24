# Fortune Cookie brand system

**Cute on the surface. Midnight underneath.** A fortune cookie is the friendliest way anyone has ever been handed a message about their life. We keep that warmth, wrap it in a night sky for the mystery, and let a real Four Pillars chart do the work inside. Version 2.0: the mark is now a real folded cookie, and the lavender confetti fields (stars, sparks, and crumbs) come from the reference illustrations.

The visual references are `01 Fortune Cookie Mark System.png` and `02 Fortune Cookie Identity Board.png`. Their editable sources are in `source/`, and the live code is `04 Source Code/fortune-cookie/src/styles.css`.

## The mark

A **folded fortune cookie**: a front lobe and a back lobe meeting at a crease, with a pointed wing on the right and the **fortune slip** peeking out underneath, printed with a pink **spark**. It is drawn flat, with no outline: toasty golds, a lighter rim along the opening, one highlight, and a few baking dots at larger sizes.

- Geometry: drawn on a 120-unit grid, shown in the box (6, 4, 110, 112). The exact paths live in `source/mark-system.html` and in `04 Source Code/fortune-cookie/src/components/Mark.tsx`, which is the single source for the logo, favicon, crack animation, and share image.
- Colors: front lobe `#F4B652`, back lobe `#E9A13D`, fold `#C97E22`, rim `#FFDD95`, slip `#FFF8EC`, spark `#FF8DB0`, baking dots `#B8741F` at 45%.
- Files:
  - `Fortune Cookie Mark.svg` and `.png` (full color)
  - `Fortune Cookie Mark - One Color.svg` (lobes separated by a knockout gap)
  - `Fortune Cookie App Icon.svg` and `.png` (framed on midnight with three sparks, for 32 px and below)
  - `Fortune Cookie Lockup.png` and `Fortune Cookie Lockup - On Midnight.png`
- Clear space: one slip height on every side.
- Motion: the only animation the mark does is **crack**. During onboarding a crack line draws down the crease, crumbs fall, and the halves part a little more with each step. On the last step they swing open and the slip flies out. Each day's sealed cookie cracks the same way when tapped.
- Don't outline it, give it a face, turn it red and gold or add a lucky coin, rotate or flip it, or stretch it.

**Wordmark:** `fortune cookie`, lowercase, Fraunces 650 with SOFT 100 and WONK 1, letter-spacing −0.02em.

## Color

```css
:root {
  /* core */
  --midnight-plum: #1D1333;  /* the night stage */
  --plum-ink:      #24183D;  /* text on light grounds */
  --lavender-mist: #F6F1FB;  /* light page ground */
  --cookie-gold:   #F2B04A;  /* the cookie, the primary button */
  --sticker-pink:  #FF8DB0;  /* the fortune, tags, small delights */
  --slip-paper:    #FFF8EC;  /* the fortune slip in both themes */
  --moon-lilac:    #BBA7F4;  /* hover, focus, quiet accents */

  /* elements: pastel sticker fill + dark ink */
  --wood:  #A5E0C4; --wood-ink:  #17634A;
  --fire:  #FFAE9E; --fire-ink:  #A33224;
  --earth: #F7D27E; --earth-ink: #7D5406;
  --metal: #C7CBE8; --metal-ink: #4D5270;
  --water: #A9C4FF; --water-ink: #1E4D9C;

  /* conditions: never a score */
  --flowing: #C9F0DD; --flowing-ink: #135E40;
  --steady:  #E4DCFB; --steady-ink:  #45327D;
  --mixed:   #FBE6B5; --mixed-ink:   #7A4A00;
  --gentle:  #FFD8E4; --gentle-ink:  #9C2757;  /* label: "Go gently" */
}
```

- **Light theme:** Lavender Mist page, white cards, Plum Ink text.
- **Dark theme:** page `#130C22`, cards `#1F1534`, text `#F3ECFF`. The night stage goes darker still (`#0B0616`) so it still reads as a stage.
- The **night stage and the fortune slip look the same in both themes.** The slip is always paper on midnight.
- Cookie Gold is for the one action that matters on a screen (Crack my cookie, Crack it open, Next). Sticker Pink marks small delights: tags, the italic headline, sparks.
- Element and condition colors are **stickers**. Use them as small fills with dark text, never as page backgrounds.

## Type

| Role | Setting |
| --- | --- |
| Display | Fraunces 600, SOFT 100, opsz 144, tracking −0.025em. Italics switch WONK on, in Sticker Pink ink. |
| Fortune slip | Fraunces 500, 22 to 27 px, line height 1.28 |
| Body | Nunito 400 at 16.5 to 18 px, line height 1.6, about 65 characters a line |
| Labels | Nunito 800, uppercase, +0.1em, 11 to 13 px |
| The question to carry | Fraunces italic, WONK 1. This is the only italic body text. |

Google Fonts import:

```
https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght,SOFT,WONK@0,9..144,400..700,0..100,0..1;1,9..144,400..700,0..100,0..1&family=Nunito:wght@400;600;700;800&display=swap
```

## Shape and imagery

- Rounded everything: cards 22 px, pills fully round, stickers 8 px with a slight tilt (−3° to +4°).
- The fortune slip has ticket notches on both sides and a dashed divider.
- The only illustration is the cookie. On the night stage: a flat moon disc, one dotted orbit with a pink dot, and a few four-point sparks that twinkle slowly.
- On lavender (onboarding), the cookie floats in a confetti field: five-point stars and crumb blobs in lilac `#C9BAF0`, small gold sparks, and dots, drifting gently.
- Weather icons mark the four conditions: sun (Flowing), sun behind a cloud (Steady), cloud (Mixed), crescent moon (Go gently).
- Primary buttons are "pressable": a gold pill with a darker gold shadow underneath that squashes on click.
- No photos, zodiac clip art, dragons, coins, red-and-gold luck styling, brush calligraphy, gradients as decoration, or star fields dense enough to read as astrology wallpaper.

## Voice

A warm friend reading the weather with you. Plain, short, a little playful.

- **Plain English only.** No Chinese characters and no romanized terms on screen. Name things in English: "Yang Wood Dog", "Structure", "your core element".
- **Conditions, never outcomes.** Say "may" and "today". Don't say "will happen", and never talk about luck.
- **Every chart is uneven.** Never call an element "missing" or a chart "bad". Say "may take extra effort".
- **Show the why in one sentence**, then stop.
- **Cookie-sized.** A fortune is at most two short sentences.
- **Human-written.** No em dashes and no "it's not X, it's Y". Both are banned by a test.
- **Kind on hard days.** The softest condition is "Go gently", followed by "Rest counts as progress today."

| Instead of | Write |
| --- | --- |
| Today's stem is Direct Officer to your Day Master. | Today's Earth works as Structure for you: rules, deadlines, and responsibility. |
| You are missing Metal. | Less Metal: finishing and letting go may take extra effort. |
| A lucky day for love! | Love & friends · Flowing. Connection comes easily. Reach out first. |
| Bad day. Avoid conflict. | Go gently. Feelings may sit close to the surface. Go easy on yourself and others. |

**Taglines:** "Crack open your day." · "Your fortune is out!" (end of onboarding) · "We describe the weather. You choose the route." (closing)
