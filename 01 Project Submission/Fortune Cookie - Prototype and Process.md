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
