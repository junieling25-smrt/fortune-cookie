# Vibe coding project memo: Fortune Cookie

**A daily fortune from your Four Pillars birth chart, in plain English**

> **Draft.** The product sections below are complete and factual. Fill in the bracketed fields and the reflection sections in your own words before submitting.

- **Name:** [your name]
- **Project:** Fortune Cookie (rebuild of MING)
- **Platform used:** Claude Code (AI-assisted vibe coding)
- **Date:** [date]
- **Prototype link:** https://claude.ai/artifact/CL1YomkHA1tfgFC8QJK6cT
- **Previous version:** MING, https://ming-daily-ritual-ashy.vercel.app/

## Project overview

Fortune Cookie turns a person's birth date, time, and place into a Four Pillars chart, a traditional Chinese way of reading a birth date through the solar calendar. Each day the reader cracks a cookie and gets a short fortune. Then comes a plain-English reading of what's in the air overall and in four areas of life: personal growth, career and money, love and friends, and family and pets. Month, year, 3-, 5-, and 10-year, and lifetime views zoom out from the day. It describes conditions, never outcomes: "We describe the weather. You choose the route."

## Target audience

English-speaking, astrology-curious adults, roughly 22 to 38, who already use Co-Star, The Pattern, CHANI, or Human Design but know little or nothing about Chinese astrology. A secondary audience is Chinese diaspora users who heard about this system from family but never got an explanation that meant anything. Because the product never asks anyone to read Chinese or learn a term first, it works for any English reader.

## Problem the project solves

MING proved the calculation could be accurate and transparent, but it read like a calculator. It mixed Chinese characters into English, led with technical analysis, gave one abstract daily message, and had no reason to come back. Fortune Cookie keeps the verified engine and fixes the experience:

- a name and look people already feel warmly about,
- plain English everywhere,
- readings organized by the parts of life people actually think about and personalized to their situation,
- a small daily ritual with a streak.

## What the project does

- **Onboarding that cracks a cookie:** it starts with a welcome cookie. Then come name, birthday (MM/DD/YYYY), birth time (12-hour with AM/PM, or "I don't know"), birthplace from 34,149 cities worldwide, and a little about your life (work, love, who's at home, what you're working on). Every question in the last step takes multiple answers. The cookie cracks a little more with each step and opens at the end.
- **Real calculation:** clock time converted to sun time for the birthplace, using that day's historical time zone. The four pillars come from the sun's real position, with the year turning at the start of spring.
- **A daily cookie:** sealed each morning and cracked with a tap. The fortune carries your name.
- **Overall:** a weather-style condition (Flowing, Steady, Mixed, Go gently), a plain line on today's energy, "Your [element] today" written for your core element, one thing to try, and one question to carry.
- **Four life areas in forecast tabs**, opening on the one "In focus today". Each has a plain explanation, a "For you" line matched to your situation, a "Read more" paragraph, a relationship note when today's animal meets one of yours, and a tiny step in a fixed position that you can edit into your own plan.
- **200 tiny steps (50 per area) and 50 "Try this" lines**, rotated so a step doesn't repeat for at least 27 days. Pet, kid, and partner steps only go to people who have them.
- **Reasons to return:** a streak with a seven-day cookie row, a "yesterday's tiny steps" check-in, tomorrow's teaser, and a daily calendar reminder.
- **The bigger picture:**
  - a colored month calendar of daily conditions
  - a year theme with a 12-month strip
  - 3-, 5-, and 10-year timelines naming the smoothest year and the best year for each area
- **Your lifetime:** its own section with your core element, four animals (each with a small hand-drawn picture), element mix, and lifelong themes per area.
- **A living background:** drifting stars, floating cookies with ribbon slips, and a shooting star now and then, with gentle parallax as you scroll.
- **Sharing:** a designed 1080 × 1350 fortune card to download, or plain text to copy.
- **How it works:** a separate page with the method, the four conditions, and the math behind your chart.
- **Privacy:** runs entirely in the browser, with no account and no server. "Forget me" erases everything.

## What changed from MING, in three rounds

| Direction given | Result |
| --- | --- |
| Rename to "Fortune Cookie" | New name, lowercase wordmark, and a voice built around cracking a cookie |
| Cute but mysterious art style | Midnight plum night stage, cookie gold, sticker pink, pastel element stickers, lavender confetti fields, and rounded type |
| No Chinese mixed with English | Zero Chinese characters in the interface, enforced by an automated test |
| Brief analysis, plain explanations, more sections | One sentence of "why" per section. Overall plus four life areas. Technical detail moved to its own page. |
| Onboarding that starts with a cookie | Six steps, and the cookie cracks progressively, then opens to reveal the page |
| Logo like a real fortune cookie | A folded cookie with its slip peeking out and a pink spark; one set of shapes for logo, favicon, animation, and share image |
| Shorter daily page | Fortune, then Overall, then the in-focus area. The other areas are one tap away. |
| More personal, interesting text | Name, core-element image, and 105 situation-specific "For you" lines |
| Aligned tiny steps; 50 per section | Fixed step column; 200 steps and 50 "Try this" lines |
| Long-term fortune | This month, this year, and your lifetime |
| Reason to come back | Daily sealed cookie, streak, yesterday check-in, tomorrow's teaser, calendar reminder |
| Share as an image | A designed fortune card |
| Logo less round, like the reference art | Redrawn as a classic outlined cartoon cookie with its slip and spark |
| Onboarding starts with a cookie; multiple answers; no section question | Welcome cookie, five steps, multi-select answers rotated day by day |
| Edit each tiny step | "Edit step" saves your own plan for the day |
| 12-hour time, MM/DD/YYYY | Custom date and time fields, independent of browser locale |
| Complete city list | 34,149 cities (GeoNames), with regional search |
| Lifetime separate, with animal pictures; 3/5/10 years | Lifetime section with 12 animal faces; 3-, 5-, and 10-year tabs |
| More text, still readable | "Read more" paragraphs under Overall, areas, and month |
| More art with motion | Living background with parallax and a shooting star |

## Validation performed

- **Calculation:**
  - Start-of-spring times match the Hong Kong Observatory to the minute.
  - Day pillars match published anchors.
  - A pyswisseph-derived fixture matches exactly.
  - 4,000 random charts match an independent library (`lunar-javascript`) with 0 mismatches.
- **Readings:**
  - Every test chart got a different full reading on all 365 days of a year.
  - The headline fortune never repeats within 20 days, and a tiny step never within 27.
  - Two unrelated charts shared a question on 0 of 365 days.
  - Every one of the hand-written lines is reachable across 500 random charts and life situations, including people with several answers per question.
  - The 3-, 5-, and 10-year views start at the current chart year.
  - Pet, kid, and partner steps never reached a single person living solo.
- **Copy rules:** an automated check over all 806 authored strings finds no Chinese characters, em dashes, "will", luck talk, "missing" or "broken", or "it's not X, it's Y".
- **Interface:**
  - Tested from 320 to 1440 px wide, in light and dark themes, with no horizontal scrolling.
  - The full flow worked end to end: onboarding (MM/DD/YYYY, 9:45 PM, Shaoyang, multiple answers) and reveal, daily crack, tabs, editing a step, "read more", the month calendar, year and multi-year tabs, lifetime, the share card, and the "How it works" page.
  - The single-file build runs from disk with no console errors.

## Product screenshots

See `03 Product Screenshots`:

1. Onboarding: welcome cookie
2. Onboarding: birthday (MM/DD/YYYY)
3. Onboarding: 34,000 cities
4. Onboarding: about you, multiple answers
5. Onboarding: the cookie cracks open
6. Daily cookie, ready to crack
7. Today's fortune
8. Life areas, with an edited step
9. Background art, streak, and this month
10. This year
11. Next 5 years
12. Your lifetime, with animals
13. How it works page
14. Share image
15. Mobile
16. Mobile, dark

## Vibe coding process

The rebuild was done with Claude Code in three rounds of direction, starting from the MING folders (memo, research, source code, and brand assets).

- **Round 1** set the new name, brand, and plain-English, five-section reading.
- **Round 2** came after reviewing the prototype as a user. It added onboarding, a real fortune-cookie logo, a shorter layout, personalization, 50 steps per area, long-term views, habit features, and share images. It used reference illustrations for the cookie and the lavender, starry style.
- **Round 3** redrew the logo closer to the reference cookies and simplified onboarding. It added multiple answers, editable steps, 12-hour and MM/DD/YYYY inputs, a complete city list, animal pictures, 3-, 5-, and 10-year views, "read more" text, and a moving background. The project also moved to a public GitHub repository with automatic tests and a GitHub Pages website.

The AI:

- read the existing research and code, and reused the verified calculation engine,
- wrote the reading copy under the house rules (plain English, no predictions, no luck talk),
- built and tested the app,
- checked the running app in a browser at several sizes and themes,
- produced the screenshots, brand boards, and these documents.

**Representative prompts:**

> "Rebuild a prototype, basically follow the stuff in 01 & 02 & 04 ... use the name 'fortune cookie' instead of Ming; redesign the brand assets ... make it look cute but mysterious at the same time; in the texts, avoid using Chinese mixed with English ... be brief about the complicated analysis ... add sections that include not only overall but also personal development, career, relationship, family/pets."

> "Add an onboarding process. It should start with a cookie. As users fill in their basic information and their interested fields step by step, the cookie should gradually crack open ... Add a long-term fortune section ... There's no reason to come back tomorrow yet ... A downloadable image of the fortune slip ... would be your cheapest word-of-mouth."

## Overall experience

[Your reflection.]

## Frustrations

[Your reflection.]

## Key learnings

[Your reflection.]

## Potential next steps

1. **Test with real readers.** Give 8 to 10 people the prototype for two weeks. Track daily cracks, streaks, and check-ins, and note when anything first feels repetitive.
2. **Relationship comparison as an invite loop.** Two charts, questions both people answer, no compatibility score, and free when the other person joins.
3. **Real notifications** built on the fortune slip, with a tone check so "Go gently" days stay kind.
4. **Decade-long life chapters**, told in the same plain language.
5. **Practitioner review** of the plain-English mapping and the life-area copy.
6. **Accounts and sync**, so streaks survive a new phone. Then deploy from GitHub to Vercel with a custom domain.

## Closing reflection

[Your reflection.]
