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

- **A short welcome:** two pages on the first visit: BaZi in plain words, then how the app works. A ten-second tour follows onboarding.
- **Onboarding that cracks a cookie:** name, birthday (MM/DD/YYYY), birth time (12-hour with AM/PM, or "I don't know"), birthplace, and a little about your life, with several answers allowed per question. Birthplace search covers 63,032 towns and cities, and a world map lets you tap any spot on Earth. The cookie cracks a little more with each step.
- **Real calculation:** clock time converted to sun time for the birthplace, using that day's historical time zone. The four pillars come from the sun's real position, with the year turning at the start of spring.
- **A daily cookie that stays sealed until you open it:** no peeking at future days. Past days can be reread only if you cracked them.
- **A daily score from 0 to 100** for the day and for each of the four life areas, in place of word labels.
- **A short daily page:** the fortune, the score, the area in focus with a "Read more" paragraph behind a tap, the other three areas as one-tap rows, and four small tweaks you can tick off (a color to wear, something to eat, something to do, and your best two hours), each with an (i) giving its BaZi reason.
- **Pop-up definitions:** hover or tap any underlined term ("Yin Metal Rooster day", "Your Ocean") for a one-line explanation.
- **Long-term forecast:** this month (with a calendar that fills in as you crack cookies), this year (a 12-month score strip), the next 3, 5, or 10 years (with the smoothest year and the best year for each area), and your lifetime. These stay open at all times.
- **Profile:** photo upload, your four animals with their hand-drawn faces (year animal on top, the other three below), your element mix, editable birth details, life areas, and a daily reminder that goes into Apple, Outlook, or Google Calendar at any quarter hour.
- **Match:** add someone's birthday and get a compatibility score with four plain lines.
- **What it means:** a plain guide to the pillars, the five elements, yin and yang, the twelve animals, the score, and what changes when.
- **Reasons to return:** a streak, a seven-day cookie row, a "yesterday's tweak" check-in, and a sealed teaser for tomorrow.
- **Sharing:** a designed 1080 × 1350 fortune card with today's score.
- **Add to home screen:** the website installs like an app on a phone.
- **Privacy:** runs entirely in the browser, with no account and no server. "Forget me" erases everything.

## What changed from MING, in five rounds

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

**Round 4** came from the team's notes and an outside tester, written after using the round 3 version:

| Direction given | Result |
| --- | --- |
| Simpler UI, less and less repetitive text, Co-Star-level simplicity | One narrow column, hairline dividers instead of boxes, and each area cut from five paragraphs to two lines plus a step |
| Daily score instead of four levels | A 0 to 100 score for the day and each area, with a ring and bars |
| Short intro to the Four Pillars, the name, and the idea | A four-card welcome and a one-second opening splash with a small fact |
| Users can't find their city; add a map | About 49,000 places at the time (now 63,032), search by "town state", and a draggable world map that works offline |
| Fuller reminder times | Every quarter hour of the day, daily or weekdays or weekends, for Apple, Outlook, or Google Calendar |
| Year animal on its own row | Year animal on top as "your zodiac sign", the other three below |
| Keep the mystery: unlock daily, keep long-term | No future days. The calendar shows only days you cracked. Month, year, and lifetime stay open. |
| A profile page with photo upload | New "You" page with photo, animals, elements, details, areas, reminder, and privacy |
| More doable daily tips | "Small tweaks": a color to wear, something to eat, something to do, and your best two hours |
| The floating cookies looked odd | Replaced with three kinds of floating things: paper fortune slips, sparkles, and crescent moons |
| Tester: hover for terms you don't know | Pop-up definitions on every chart term |
| Tester: a "What it means" page | A plain guide, with the math kept on its own page |
| Tester: compare with another person (like The Pattern) | A Match page |
| Tester: app or web? | Installs to the home screen and has an app-style tab bar on phones |

**Round 5** came from the team after using round 4:

| Direction given | Result |
| --- | --- |
| Intro too vague; explain BaZi; two pages only | Page 1: BaZi as eight signs from your birth moment, with the four pillars drawn. Page 2: how the app works in three lines. |
| City list shrank; Shaoyang missing; example "LA"; explain latitude and longitude | 63,032 places (the 34,149-city list plus smaller towns and seats of government), "e.g. Los Angeles", and a line on why the coordinates matter |
| Love life should be one answer | Love life is single choice; the other questions stay multiple choice |
| The fortune is hard to read | All 60 fortunes rewritten shorter and plainer; the slip no longer tilts and uses calmer type |
| Drop tiny steps now that small tweaks exist | Tiny steps removed; tweaks can be ticked off, and yesterday's check-in asks about a tweak |
| Tweaks need BaZi backing, with an (i) | Each tweak has an (i) explaining its element (color, taste, activity, hour) and why that element helps today |
| Desktop looks like a phone app; floating background gone | Two-column desktop layout, wider pages, and a slowly drifting background across every page |
| Forecast scores too low next to a 96 day | Checked across 80 charts: month and year scores share the daily median (65), so a great day can fall in a hard month. Scores stay read from the month and year pillars, as BaZi does, with a note explaining the difference |
| A tutorial after onboarding | A ten-second tour: six one-sentence steps that spotlight the real screen |

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
- **Copy rules:** an automated check over all 969 authored strings finds no Chinese characters, em dashes, "will", luck talk, "missing" or "broken", or "it's not X, it's Y".
- **Interface:**
  - Tested from 320 to 1440 px wide, in light and dark themes, with no horizontal scrolling.
  - The full flow worked end to end: welcome, onboarding (MM/DD/YYYY, 12-hour time, several answers) and reveal, map pick, daily crack, steps, editing a step, "Read more", and check-ins, the month calendar, the year, years-ahead, and lifetime tabs, profile edits, match, the share card, and the "What it means" and "How it works" pages.
  - Daily scores across a year of readings for 504 charts: median 65, with most days between 45 and 82.
  - The single-file build runs from disk with no console errors.

## Product screenshots

See `03 Product Screenshots`:

1. Welcome: how we read your fortune (BaZi)
2. Welcome: how the app works
3. Onboarding: find your birthplace on a map
4. Daily cookie, sealed
5. Today: the fortune
6. Today: score and focus area
7. Today: other areas
8. Today: small tweaks, with why
9. Pop-up definitions
10. Forecast: this month, and the calendar that fills in daily
11. Forecast: this year
12. Profile: photo and animals
13. Profile: daily reminder
14. Match
15. Share image
16. What it means
17. Desktop: today, scrolled, and forecast
18. Mobile, dark
19. Quick tour

## Vibe coding process

The rebuild was done with Claude Code in five rounds of direction, starting from the MING folders (memo, research, source code, and brand assets).

- **Round 1** set the new name, brand, and plain-English, five-section reading.
- **Round 2** came after reviewing the prototype as a user. It added onboarding, a real fortune-cookie logo, a shorter layout, personalization, 50 steps per area, long-term views, habit features, and share images. It used reference illustrations for the cookie and the lavender, starry style.
- **Round 3** redrew the logo closer to the reference cookies and simplified onboarding. It added multiple answers, editable steps, 12-hour and MM/DD/YYYY inputs, a complete city list, animal pictures, 3-, 5-, and 10-year views, "read more" text, and a moving background. The project also moved to a public GitHub repository with automatic tests and a GitHub Pages website.
- **Round 5** rewrote the intro around BaZi, fixed the city list, made love life one answer, rewrote the fortunes in plainer words, replaced tiny steps with tickable tweaks that explain themselves, gave desktop a real layout with a drifting background, explained why a day and its month can differ, and added a ten-second tour.
- **Round 4** simplified the interface, swapped the four condition words for a daily score, added the welcome, profile, map, match, and "What it means" pages, and kept each day sealed until it's opened.

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
2. **Match as an invite loop.** Today's Match page works from a birthday. Next, the other person joins and answers questions too.
3. **A native app with push notifications** built on the fortune slip, with a tone check so "Go gently" days stay kind.
4. **Decade-long life chapters**, told in the same plain language.
5. **Practitioner review** of the plain-English mapping and the life-area copy.
6. **Accounts and sync**, so streaks survive a new phone. Then deploy from GitHub to Vercel with a custom domain.

## Closing reflection

[Your reflection.]
