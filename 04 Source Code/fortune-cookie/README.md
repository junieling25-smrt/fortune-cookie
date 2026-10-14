# fortune-cookie

A daily fortune from your Four Pillars birth chart, in plain English. It is a single-page app that runs entirely in the browser: no server, no account, and details saved only on the device.

```bash
npm install
npm run dev           # local dev server
npm test              # engine checks: astronomy, 4,000-chart cross-check, variety, step rotation, copy rules
npm run build         # typecheck + production build into dist/
npm run build:single  # build, then fold dist/ into one self-contained HTML file
```

## Where things live

| Path | What it does |
| --- | --- |
| `src/engine/pillars.ts` | Four Pillars calculation: sun position (VSOP87), time zones, sun time, the four pillars, solar months, element balance. Sources are cited on each rule. |
| `src/engine/reading.ts` | Turns a chart, the person's answers, and a date into the day (with 0 to 100 scores and small tweaks), month, year, lifetime, and match readings. Pure functions. |
| `src/engine/copy.ts` | Hand-written core copy: fortunes, area lines, questions, month themes. |
| `src/engine/copy-more.ts` | Hand-written personal layer: 200 tiny steps, small tweaks, "your element today", "For you" lines, year, lifetime, and match lines. |
| `src/engine/copy-guide.ts` | The welcome cards, splash facts, "What it means" guide, and pop-up definitions |
| `src/engine/cities.ts` | Birthplace search over about 49,000 places with time zones, loaded on first use |
| `scripts/build-cities.mjs` | Rebuilds `cities.json` from GeoNames (`npm run build:cities`) |
| `src/components/Intro.tsx` | First-visit welcome and the opening splash |
| `src/components/Onboarding.tsx` | Six-step onboarding with the progressively cracking cookie |
| `src/components/PlaceField.tsx`, `MapPicker.tsx` | Birthplace search and the offline world map |
| `src/components/Today.tsx` | Sealed cookie, fortune, score, focus area, other areas, small tweaks, streak, tomorrow |
| `src/components/BiggerPicture.tsx` | Forecast tab: this month (fills in as days are cracked), this year, lifetime |
| `src/components/Profile.tsx` | Photo, animals, elements, editable details, areas, reminder, privacy |
| `src/components/Match.tsx` | Compatibility with another person |
| `src/components/Meaning.tsx`, `HowPage.tsx` | The plain guide and the math page |
| `src/components/Term.tsx` | Pop-up definitions |
| `src/components/Floaties.tsx` | The floating slips, sparkles, and moons |
| `src/components/ShareCard.tsx` | Canvas-drawn 1080 × 1350 fortune card, and the share dialog |
| `src/components/Mark.tsx` | The cookie paths: logo, favicon, and the crack animation |
| `src/styles.css` | Brand tokens, light and dark themes, layout |
| `scripts/verify.ts` | The test suite behind `npm test` |
| `scripts/build-single-file.mjs` | Makes the one-file build (`--fragment` drops the html/head/body wrapper for embedding) |

Pages are hash routes: `#forecast`, `#match`, `#me`, `#meaning`, `#how`.

## Link parameters

For demos and screenshots, a reading can be opened directly, skipping onboarding and without saving anything:

```
?d=1994-03-17&t=07:42&city=San%20Francisco&day=2026-09-24&name=Maya
 &areas=growth,career,love,family&career=job&love=partnered&home=cat,kids&growth=calm
```

`t` is optional (leave it out for "time unknown"), `day` defaults to today, `sealed=1` shows the daily cookie still sealed, and `streak=6` pretends the last six days were cracked. The allowed values for `career`, `love`, `home`, and `growth` are the keys in `src/engine/copy-more.ts`.

## Rules for editing copy

Edit `src/engine/copy.ts` or `copy-more.ts`, then run `npm test`. The test fails on:

- Chinese characters
- em dashes
- "will"
- luck talk
- "missing" or "broken"
- "it's not X, it's Y"

It also fails if any line becomes unreachable. Steps that mention a pet, kids, or a partner need the matching `needs` tag.
