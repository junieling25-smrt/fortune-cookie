# Fortune Cookie: prototype and process documentation

## 1. Prototype

**Format: a working web app, provided two ways.**

- **Live link:** https://claude.ai/artifact/CL1YomkHA1tfgFC8QJK6cT. It's private: share it from the page's Share menu before submitting, or reviewers can't open it.
- **Offline file:** `04 Source Code/Fortune Cookie Prototype (single file).html`. It's one self-contained file that opens with a double-click in any browser. No install is needed, only an internet connection for the fonts.

**How to use it (about one minute):**

1. **See a sample.** The page opens with a sample fortune, so you see the product before typing anything.
2. **Crack your own cookie.** Under "Crack your own cookie", enter a birth date, a birth time (or tick "I don't know my birth time"), and a city. Then press **Crack my cookie**.
3. **Read your fortune.** The cookie cracks open and your fortune slip appears.
4. **Read your day, area by area.** Scroll to the Overall section and the four life areas (Personal growth, Career & money, Love & friends, Family & pets). Tick a tiny step, or use the arrows to read another day.
5. **See your chart.** Scroll to your four animals, your core element, and your element mix.
6. **Check the math.** Open "Show how we worked out this chart" for the short calculation.

Screenshots of each step are in `03 Product Screenshots`.

## 2. Prompts used

The rebuild was done in Claude Code (Anthropic's AI coding agent) in one conversation. These are the prompts, word for word.

**Prompt 1: the build brief**

> i hope you can rebuild a prototype, basically follow the stuff in 01 & 02 & 04, put all the stuff in a new folder called "fortune cookie" in this folder, like we have a new 01-05, and i have some suggestions for you
>
> 1. use the name "furtune cookie" instead of Ming
> 2. redesign the brand assests, the mark should be a round triangle with a small sticker inside (or you can design by yourself to make it simple but creative); also redesign the art style especially the color to make it look cute but mysterious at the same time
> 3. in the texts, avoid using chinese mixed with english, so it will be easier to read for global audience
> 4. be brief about the complicated analysis that no one understand
> 5. focus more on the plain explanation, and add section that include not only overall but also, personal development, career, relationship, family/pets

**Prompt 2: submission materials**

> give the following: Prototype – Provide a link to your prototype, or a short video/demo showing how it works, or another clear format (please explain). Process documentation – Share the prompts you used, any code you developed (snippets or files), and a brief summary of how you iterated to reach the final version.

**Prompt 3: round four feedback** (written in Chinese, summarized here in English, after using the round three version)

> 1. Most important: simplify the UI and make the text easier to read. Users say there's too much text, it repeats, and it's hard to follow. Our style is simple but rich; look at how simple Co-Star is.
> 2. Daily score: change the four levels into a daily number.
> 3. When the app first loads, add a very short intro to the Four Pillars calculation, where the name comes from, and our idea.
> 4. Improve the city list (users can't find their cities) and add map interaction.
> 5. Improve the daily reminder time list.
> 6. Put the year animal on its own row at the top, since that's the zodiac sign people know, and the other three below.
> 7. Don't give away every day's fortune at once. Keep it mysterious: users unlock each day by logging in. Keep the long-term forecast.
> 8. Move "change your details" into a new profile page where users can edit their information any time and upload a photo.
> 10. Make the daily tip more doable, like small choices such as the color of your clothes.
> 11. The floating cookies in the background look odd. Change them and add other elements, for three kinds of floating things.

The same message passed on an outside tester's notes: who the product is for, app versus web, a compatibility feature like The Pattern's, hover definitions for unfamiliar terms, a Tzolkin-style wheel, and a "What it means" page.

**Prompt 4: round five feedback** (written in Chinese, summarized here in English)

> 1. The intro isn't good enough and the big text is too general. Add the short BaZi introduction I asked for. Keep it to two pages: one on BaZi (how we predict), one on how the app works.
> 2. Why are there fewer cities than before? Shaoyang can't be found. Change the example to LA only, and explain in the small text that we use latitude and longitude for the fortune.
> 3. Love life must be single choice.
> 4. This one sentence is too hard to read.
> 5. With small tweaks, the tiny steps can go.
> 6. What color to wear on which day should have BaZi support, and so should eat and do. Add an (i) with a short note on why it helps.
> 7. The web version looks like a phone app. And where did the slowly floating background go? It should cover the whole background. Don't make it worse.
> 8. The forecast scores are too low. My score today is 96 but every long-term score is under 50. Check it.
> 9. After onboarding, add a simple tutorial (within 10 seconds), one sentence per feature.

The earlier MING project had its own prompts, recorded in `../../01 Project Submission/MING_Vibe_Coding_Project_Memo.docx`.

## 3. Code developed

All code is in `04 Source Code/fortune-cookie` (Vite, React, TypeScript). It runs entirely in the browser.

| File | What it does |
| --- | --- |
| `src/engine/pillars.ts` | Four Pillars calculation: sun position, time zones, sun time, the four pillars, element balance. Ported from MING. |
| `src/engine/reading.ts` | **New.** Turns a chart and a date into the five-section reading. |
| `src/engine/copy.ts` | **New.** All 273 hand-written sentences, with the writing rules at the top. |
| `src/components/*.tsx` | **New.** Interface: cracking cookie, fortune slip, birth form, life-area cards, chart, how it works. |
| `src/styles.css` | **New.** Brand colors, light and dark themes, layout. |
| `scripts/verify.ts` | Test suite: astronomy checks, a 4,000-chart cross-check, reading variety, copy rules. |
| `scripts/build-single-file.mjs` | Packs the app into one HTML file. |

**Snippet 1. How a life area gets its condition label** (`reading.ts`). Each area reads a different part of the day against a different part of your chart:

```ts
const plan = {
  growth: { energy: stemEnergy,   score: ease[stemEl] + REL_MOD[rel.hour] },
  career: { energy: stemEnergy,   score: 0.7 * ease[stemEl] + 0.3 * ease[seasonEl] + REL_MOD[rel.month] },
  love:   { energy: branchEnergy, score: ease[branchEl] + REL_MOD[rel.day] },
  family: { energy: branchEnergy, score: 0.6 * ease[branchEl] + 0.4 * ease[stemEl] + REL_MOD[rel.year] + 0.5 * REL_MOD[rel.hour] },
};

function toneOf(score: number): Tone {
  if (score >= 1) return "flowing";
  if (score >= -0.25) return "steady";
  if (score >= -1.25) return "mixed";
  return "gentle"; // shown as "Go gently", never "bad"
}
```

**Snippet 2. Plain explanations, written by hand** (`copy.ts`):

```ts
love: {
  play: "Easy, playful energy with people today. A good day for a casual plan or a silly text.",
  voice: "Words may come out sharper than usual. Honest is good. Harsh is optional.",
  care: "Warmth is easy to give and receive today. Let someone look after you for once.",
  // ...
},
```

**Snippet 3. A test that enforces the "no Chinese, plain English" rule** (`verify.ts`):

```ts
rule("no Chinese characters", /[㐀-鿿]/);
rule("no em dashes", /—/);
rule("no fortune-teller future tense", /\b(will|destined|fate|doomed)\b/i);
rule("no luck talk", /\b(lucky|unlucky|bad luck|good luck)\b/i);
rule("no “missing element” framing", /\bmissing\b|\bbroken\b|\benemy\b/i);
```

## 4. How we iterated

1. **Read before building.** The AI read MING's memo, research, brand system, and source code. It kept what worked (the verified calculation and the research findings) and identified what the five directions changed.
2. **Engine first, then tested.** The calculation was ported and re-checked against published solar-term times and 4,000 charts from an independent library (0 mismatches). A new reading layer was then written on top.
3. **Tests caught problems early.** The first run flagged one sentence using the banned word "broken", which was rewritten. It also showed the variety count was leaving out the monthly line, and fixing that confirmed about 294 distinct readings a year (MING had 271).
4. **Checked in a real browser.** Clicking through the app found three bugs:
   - the date buttons stacked vertically because a CSS rule matched them by accident,
   - the pale "Metal" bar almost disappeared against its background,
   - on phones the four animals took one long column, so they became 2×2.
   The flow (enter details, pick a city, crack the cookie, change dates) and dark mode were then retested.
5. **Packaging.** The first single-file build dropped its script, and a second attempt copied the page 24 times. Both came from quirks in how the minified code was inserted. Once fixed, the file was confirmed to run from disk with no errors.
6. **Brand boards.** The mark system board was checked visually. Two layout issues were fixed: size labels wrapping, and the wordmark breaking onto two lines.
7. **Documentation.** The product brief, worked example, research notes, brand system, and screenshots were written last, from the working product, so they describe what actually exists.
8. **Round four.** This round was first built on an older copy, then merged with round three so its logo, date and time fields, editable steps, animal faces, multi-year views, and "Read more" text all carried over, while the floating cookies were replaced. The daily page was rebuilt as one column, with each area cut to two lines and a step. The four labels became a 0 to 100 score, calibrated so the median day lands near 65. The city list grew to about 49,000 places, built from GeoNames with a script. Region names were checked against where each region's towns actually sit, which caught a wrong province name in Algeria. The map draws the world from bundled data, so it works offline and inside the one-file build. Screenshots then caught a pop-up running off the screen edge, map labels overlapping, and dim score colors in dark mode, and each was fixed and rechecked.
9. **Round five.** The missing cities came from the second source listing a population of 0 for many large places, so they fell under the 5,000-person cutoff. The list now starts from the 34,149-city list and adds smaller towns and seats of government. For the long-term scores, averaging the daily scores was tried first, but a check across 80 charts showed the pillar-based scores already share the daily median (65 at the time); averaging only squeezed every month into 57 to 71 and hid hard months. So month and year scores stay read from their own pillars, as BaZi reads them, and the Forecast page now explains that a great day can sit inside a harder month. The tour, desktop layout, and tweak notes were checked in screenshots at phone and laptop sizes. Last, the whole scale was raised so the median day reads 85 instead of 65; only the mapping from the chart's raw score to the number changed, so the order of good and hard days is the same.
