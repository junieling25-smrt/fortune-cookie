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
| `src/engine/reading.ts` | Turns a chart, the person's answers, and a date into the day, month, year, and lifetime readings. It also handles step rotation and tomorrow's teaser. Pure functions. |
| `src/engine/copy.ts` | Hand-written core copy: fortunes, area lines, condition lines, questions, month themes. |
| `src/engine/copy-more.ts` | Hand-written personal layer: 200 tiny steps, 50 "Try this", "your element today", "For you" lines, year and lifetime lines. |
| `src/engine/cities.ts` | Birthplace search over 2,871 cities with time zones |
| `src/components/Onboarding.tsx` | Six-step onboarding with the progressively cracking cookie |
| `src/components/Today.tsx` | Daily sealed cookie, fortune slip, Overall, "Try this", "Ask yourself", yesterday check-in |
| `src/components/Areas.tsx` | Forecast tabs and the area panel with its fixed tiny-step column |
| `src/components/ComeBack.tsx` | Streak, week of cookies, tomorrow's teaser, calendar reminder |
| `src/components/BiggerPicture.tsx` | This month (calendar), this year (12-month strip), your lifetime |
| `src/components/HowPage.tsx` | The "How it works" subpage (`#how`) |
| `src/components/ShareCard.tsx` | Canvas-drawn 1080 × 1350 fortune card, and the share dialog |
| `src/components/Mark.tsx` | The cookie paths: logo, favicon, and the crack animation |
| `src/styles.css` | Brand tokens, light and dark themes, layout |
| `scripts/verify.ts` | The test suite behind `npm test` |
| `scripts/build-single-file.mjs` | Makes the one-file build (`--fragment` drops the html/head/body wrapper for embedding) |

## Link parameters

For demos and screenshots, a reading can be opened directly, skipping onboarding and without saving anything:

```
?d=1994-03-17&t=07:42&city=San%20Francisco&day=2026-09-24&name=Maya
 &areas=growth,career,love,family&career=job&love=partnered&home=cat,kids&growth=calm
```

`t` is optional (leave it out for "time unknown"), `day` defaults to today, and `sealed=1` shows the daily cookie still sealed. The allowed values for `career`, `love`, `home`, and `growth` are the keys in `src/engine/copy-more.ts`.

## Rules for editing copy

Edit `src/engine/copy.ts` or `copy-more.ts`, then run `npm test`. The test fails on:

- Chinese characters
- em dashes
- "will"
- luck talk
- "missing" or "broken"
- "it's not X, it's Y"

It also fails if any line becomes unreachable. Steps that mention a pet, kids, or a partner need the matching `needs` tag.
