# Fortune Cookie: product brief

Fortune Cookie is the rebuild of MING. The chart calculation underneath is MING's verified Four Pillars engine. On top of it are a new name, a new look, onboarding that cracks a cookie open, and a reading that explains your day in plain English, one area of life at a time. It also gives people a reason to come back tomorrow.

## The one-line pitch

**Crack open your day.** Tell us when and where you were born and what you care about. Each day you get a cookie to crack: a short fortune, a plain explanation of what's in the air for your growth, work, love life, and home, and one tiny step for each.

## What changed, and why

### Round 1: from MING to Fortune Cookie

| Change requested | What we did |
| --- | --- |
| Rename MING to Fortune Cookie | New name, wordmark, and voice. A fortune cookie is familiar all over the world, and it promises exactly what the product delivers: a short, friendly message about your day. |
| Cute but mysterious art style | Midnight plum "night stage", cookie gold, sticker pink, pastel stickers for the elements, and rounded type (Fraunces soft plus Nunito). |
| No Chinese mixed into English | Zero Chinese characters in the interface, enforced by a test. Pillars are named in English ("Yang Wood Dog"). BaZi is mentioned once, in brackets. |
| Keep the complicated analysis brief | One plain sentence of "why" per section. The derivation moved out of the way. |
| Plain explanations with more sections | Overall, Personal growth, Career & money, Love & friends, Family & pets. |

### Round 2: making it personal and making it a habit

| Change requested | What we did |
| --- | --- |
| 1. Onboarding that starts with a cookie | Six short steps: name, birthday, birth time, birthplace, the areas you care about, and a little about your life. The cookie cracks a bit more after every step. On the last one it splits open, the slip flies out ("Your fortune is out, Maya!"), and the page appears. The old sample reading is gone. |
| 2. Logo like a real fortune cookie | A folded cookie with two lobes, a crease, and a pointed wing, with the fortune slip peeking out and a pink spark on it. The same shapes drive the logo, the favicon, the crack animation, and the share image. |
| 3. Shorter daily page, technical part moved | The order is now fortune, then Overall, then the "In focus today" area. The other areas are one tap away in a four-tab forecast strip with weather icons. The long-term view sits in tabs below. The technical explanation moved to its own "How it works" page, linked from the footer. |
| 4. More interesting, more personal text | Each reading uses your name, your core element as an image ("Your Ocean today: Oceans don't love walls, though a riverbank turns a flood into a current"), and a "For you" line matched to your situation. For example: "Your cat may want company on their own terms today" or "Your manager's priorities set the weather today". |
| 5. Tiny steps at the same position | Each area's tiny step now sits in a fixed right-hand column of the area panel, in the same place for every area. |
| 6. 50 tiny steps per area | 200 hand-written steps, 10 per energy family per area, rotated so a step doesn't come back for at least 27 days. Steps that mention pets, kids, or a partner only reach people who have them. "Try this" went from 10 lines to 50. |
| 7. Long-term fortune | "The bigger picture" has three tabs. **This month** shows a colored calendar of every day's condition, a line on the month, and area outlooks. **This year** shows a theme for the chart year and a 12-month strip. **Your lifetime** shows your core element, four animals, element mix, and a lifelong theme for each area. The month changes about every 30 days, the year each spring, and the lifetime never. |
| 8. A reason to come back | The daily cookie arrives sealed: tap to crack it. Each crack grows a streak, shown in the header and a seven-day cookie row. A check-in asks "Yesterday's tiny steps: did you get to these?", and a teaser previews tomorrow ("Tomorrow looks Flowing for Personal growth"). "Add to my calendar" creates a daily reminder. |
| 10. Shareable image | "Share image" draws a 1080 × 1350 fortune card with the night sky, the open cookie, the slip with your name and fortune, and the wordmark. You can download it or copy the text. |

## Audience

Carried over from the MING brief. It is still correct and still unvalidated.

- **Primary:** English-speaking, astrology-curious people roughly 22 to 38 who already use Co-Star, The Pattern, CHANI, Human Design, or journaling apps, and who know little or nothing about Four Pillars.
- **Secondary:** Chinese diaspora users whose family mentioned this system but never explained it in a way that meant anything.
- **Global by default:** because nothing asks the reader to read Chinese or learn a term first, the same screens work for anyone reading English.

## The daily page, top to bottom

1. **Today's cookie.** It starts sealed. Tap to crack it and see a one- or two-sentence fortune with your name on the slip.
2. **Overall.** A weather-style condition (Flowing, Steady, Mixed, or Go gently) and one plain line on today's energy. Below that: **Your [element] today**, "Try this" (tickable), and "Ask yourself".
3. **Your day, area by area.** Four forecast tabs with weather icons; the "In focus" area opens first. Each area has a plain explanation, a "For you" line, how to work with the condition, a note when today's animal meets one of yours, and the tiny step.
4. **Come back tomorrow.** The streak, the week of cookies, tomorrow's teaser, and a daily reminder.
5. **The bigger picture.** This month, this year, and your lifetime.
6. **Footer link** to "How it works": the calendar method, the four conditions, and the math behind your chart.

Everything is picked by chart math and written by hand. No language model runs when a reading is produced.

## Framing rules (non-negotiable)

- Conditions and choices, never predictions. "May" and "today", never "will happen".
- No luck talk, no verdicts, no compatibility scores, no fear.
- Plain English only on every surface a reader sees.
- Every section shows where it came from, in one plain sentence.
- Human-written. No em dashes and no "it's not X, it's Y" lines. A test enforces both across all 766 authored strings.
- The streak is gentle. Missing a day never shows a warning, and "Start a streak today" is the zero state.

## What the prototype is, and isn't

**Built and working:**

- A single-page web app (Vite, React, TypeScript) that runs entirely in the browser: no server, no account, and details stay on the device.
- MING's verified Four Pillars calculation (true solar time, historical time zones, solar-term months), plus the month and year timelines.
- Onboarding, the daily crack, the five-section reading, tiny steps with check-ins, streaks, tomorrow's teaser, a calendar reminder, the share image, the month, year, and lifetime views, the "How it works" page, editing your details, "Forget me", and light and dark themes.
- A test suite: astronomy anchors, 4,000 charts cross-checked against an independent library, reading variety, step rotation, reachability of every line, and the copy rules.

**Not built yet:** relationship comparison between two charts, accounts and sync across devices, real push notifications, decade-long "life chapters", and any paywall.

## Next experiments

1. **Does the daily crack build a habit?** Give 8 to 10 people in the 22 to 38 range the prototype for two weeks. Track cracks per day, streak length, and check-in answers. Record when a fortune or step first feels repetitive.
2. **Is the five-area structure right?** It came from product direction, not research. Ask testers which areas they open and which they skip.
3. **Does personal context feel personal, or nosy?** Watch drop-off on the "A little more about you" step.
4. **Relationship comparison as an invite loop.** The competitor research found every incumbent charges for adding a second person and none rewards inviting one. The plan is to test "free if they join", with questions both people answer and no score.
5. **Tone floor.** Check that "Go gently" days stay kind for someone having a genuinely bad day.
