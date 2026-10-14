# Fortune Cookie reading engine: worked example

Every number below was produced by the same code the app runs (`04 Source Code/fortune-cookie/src/engine`). None were typed by hand.

## Three layers, stated plainly

**1. Real calculation (classical rules, verified).** Given a birth moment:

- the sun's exact position (full VSOP87 series via the `astronomia` library, after Jean Meeus, *Astronomical Algorithms*),
- the time zone in force that day, including daylight saving and wartime rules, from the browser's time-zone database,
- clock time corrected to sun time for that longitude,
- the year pillar, which turns at the start of spring (the sun at 315°), not on 1 January,
- the month pillar, set by the twelve solar terms,
- the day pillar, from the continuous 60-day count,
- the hour pillar, from the two-hour blocks,
- how each element relates to your core element, and whether today's animal clashes, pairs, or matches with each of yours.

Sources are cited on each rule in `src/engine/pillars.ts`, carried over unchanged from MING.

**2. Fortune Cookie's own scoring (editorial, labelled in the app).**

- The element mix percentages weight hidden elements 0.6 / 0.3 / 0.15. The classical table gives their order but no universal weights ([OpenFate](https://wiki.openfate.ai/en/bazi/hidden-stems-roots/twelve-branch-hidden-stems-table)).
- How much backup your core element has (light, balanced, full). The bands are set so each covers about a third of possible charts.
- The **ease** of each kind of energy for your chart, and the four condition labels that follow from it.
- Which area is "In focus today", and which pillar each life area reads.

**3. Hand-written language (authored once, picked by the keys above).**

| Library | Lines |
| --- | --- |
| Fortune slips (10 energies × 3 chart states × 2 variants) | 60 |
| Life-area explanations (4 areas × 10 energies) | 40 |
| Condition lines (4 areas × 4 conditions) | 16 |
| Tiny steps (4 areas × 5 energy families × 10) | 200 |
| Small tweaks (5 elements × 5 colors, 6 foods, 6 actions) | 85 |
| Your element today (10 core elements × 5 families) | 50 |
| For you, by situation (work, love, home, growth) | 105 |
| This month (5 families × 3 backup levels) | 15 |
| This year themes, year area lines, lifetime area lines | 15 + 20 + 20 |
| Ask yourself | 17 |
| Overall condition lines, tomorrow's teasers, links | 4 + 4 + 6 |

Round 3 added 40 more: 20 area "read more" paragraphs, 5 overall and 5 month paragraphs, and 10 year themes (one per energy). That makes 806 authored strings in total, counting labels and names.

No language model runs when a reading is produced. The same birth details and the same date always give the same reading.

## Plain names used in place of jargon

| Plain name | What it means for you | Classical term, for reference only |
| --- | --- | --- |
| Company | same element as you: friends, peers, a bit of competition | Friend / Rob Wealth |
| Expression | what you produce: creativity, speaking up, caring for others | Eating God / Hurting Officer |
| Harvest | what you shape: money, results, practical tasks | Indirect / Direct Wealth |
| Structure | what shapes you: rules, deadlines, bosses, responsibility | Seven Killings / Direct Officer |
| Nurture | what feeds you: learning, rest, support | Indirect / Direct Resource |

The classical column exists here so a practitioner can check the mapping. It never appears in the app.

## Worked example

**Birth:** 17 March 1994, 7:42 AM, San Francisco. **Day read:** Tuesday, 22 September 2026.

### Step 1: the birth moment

San Francisco was on UTC−8 that day (daylight saving started on 3 April in 1994). The sun there ran 18 minutes behind the clock: −489.7 min for longitude, +480 min to remove the zone offset, and −8.4 min for the equation of time. The chart is read at **7:24 AM sun time**.

### Step 2: the four pillars

| Pillar | Result | What it's linked to |
| --- | --- | --- |
| Year | Yang Wood **Dog** | roots, family background |
| Month | Yin Fire **Rabbit** | work, routine, parents |
| Day | Yang Water **Tiger** | you and your closest relationship |
| Hour | Yang Wood **Dragon** | plans, dreams, kids, and pets |

The chart year is 1994 because the birth came after spring began (3 February 1994, local time). This chart matches MING's published worked example exactly.

**Core element:** Yang Water, "The Ocean".
**Element mix:** Wood 45%, Fire 19%, Earth 17%, Water 15%, Metal 4%.
**Backup for the core element:** light.
**Balancing element:** Metal (silver and white).

### Step 3: ease of each energy for this chart

For a chart with light backup, Nurture and Company come easiest and Structure is hardest. The least common element (Metal) moves up a notch, and the most common (Wood) moves down one.

| Element | Works as | Ease |
| --- | --- | --- |
| Metal | Nurture | +2.0 (1.5 + 0.75, capped at 2) |
| Water | Company | +1.0 |
| Fire | Harvest | −1.0 |
| Wood | Expression | −1.25 (−0.5 − 0.75) |
| Earth | Structure | −1.5 |

### Step 4: the day

22 September 2026 is a **Yin Earth Pig** day in a **Metal** month (until 7 October).

- Today's main energy is Earth, which is **Structure** for Yang Water. The polarity differs, so it's the "clear expectations" kind (rules) rather than the "pressure" kind (push).
- Underneath, the Pig's main hidden element is Yang Water, which is **Company**.
- Today's Pig pairs with the natal Day Tiger (one of the six classical pairs). It has no clash, pair, or match with the Dog, Rabbit, or Dragon.

### Step 5: the condition for each section

The pair with the Day pillar adds +1 to "Love & friends" and +0.75 to "Overall". Labels: 1 or more is Flowing, −0.25 or more is Steady, −1.25 or more is Mixed, anything lower is Go gently.

| Section | Reads | Arithmetic | Label |
| --- | --- | --- | --- |
| Overall | 0.6 × day + 0.4 × animal + 0.75 × strongest link | 0.6(−1.5) + 0.4(1) + 0.75(1) = 0.25 | Steady |
| Personal growth | day energy + link to Hour | −1.5 + 0 = −1.5 | Go gently |
| Career & money | 0.7 × day + 0.3 × month + link to Month | 0.7(−1.5) + 0.3(2) + 0 = −0.45 | Mixed |
| Love & friends | animal energy + link to Day | 1 + 1 = 2 | Flowing |
| Family & pets | 0.6 × animal + 0.4 × day + links to Year and Hour | 0.6(1) + 0.4(−1.5) + 0 = 0 | Steady |

"In focus today" goes to **Career & money**, because Structure leads the day.

### Step 6: the personal layer

The worked example person is named Maya. She works a job, is in a relationship, has a cat and kids at home, and is working on calm and balance.

- **Your element today** comes from her core element (Yang Water, "the Ocean") meeting today's family (Structure).
- **For you** lines come from her answers, matched to the energy each area reads that day. When someone gives several answers to one question (say, studying and running their own thing), the reading rotates through them day by day.
- **Tiny steps** come from a pool of ten per family per area. Steps tagged for pets, kids, or a partner are filtered by her answers. The pick then rotates by how many times that family has come round since 2000, so consecutive occurrences get consecutive steps. The same day for someone with no answers gives different love and family steps, because their filtered pools differ.

### The reading those keys produce

> **Maya's fortune:** Clear lines make things easier today. Follow them and save your energy.
>
> **Today's score · 68.** A balanced day. Nothing needs forcing.
> *Your Ocean:* Oceans don't love walls, though a riverbank turns a flood into a current. Today's structure can give you direction.
>
> **Small tweaks** (a Metal day for her, because today's Earth presses on Water and Metal turns that pressure into support): wear silver gray, drink peppermint tea, clean your glasses or your phone screen, and the best two hours are 5 to 7 PM (Rooster hours).
>
> **Career & money · 62 · In focus today.** Expectations at work are clear today. Follow the process, tidy your files, and let reliability speak.
> *For you:* Your manager's priorities set the weather today. Check that you're working on what they need first.
> Some friction around work. Double-check the details before you hit send.
> *Tiny step:* Confirm one deadline with the person who set it.
>
> **Personal growth · 48.** Structure helps you today. A simple plan or checklist can feel surprisingly calming.
> *For you:* Build a small buffer into your day: ten minutes between things instead of zero.
> *Tiny step:* Plan tomorrow's meals in two minutes.
>
> **Love & friends · 85.** You know what you want from your relationships today. Say it kindly and clearly.
> *For you:* Be teammates today. Tackle one shared chore or plan side by side.
> *Today's Pig gets along with your Day Tiger, the part of your chart linked to your closest relationships.*
> *Tiny step:* Tell a friend what you value about them.
>
> **Family & pets · 62.** At home, you may want things done your way. Leave room for everyone else's way too.
> *For you:* Your cat may want company on their own terms today. Sit nearby and let them come to you.
> *Tiny step:* Say a proper hello to a neighbor.

### The bigger picture for the same chart

**This month** (Metal month, Sep 7 to Oct 7): "This month refills your tank. Taking the support is the job right now." Every day of the solar month is scored with the same method. In the app, a day's score appears on the calendar only after that day's cookie is cracked. The month pillar itself, scored the same way, gives the month a 55 and the areas Growth 64, Career 48, Love 88, Family 80.

**This year** (Yang Fire Horse year, Feb 3, 2026 to Feb 2, 2027): Fire is Harvest for Yang Water, and this chart's core element has light backup, so the theme is "A year with real openings and limited energy. Choose one or two goals and give them your best." The year scores 52. The 12-month strip scores each solar month's pillar, highest in Dec (83) and Mar (81), lowest in Oct (35).

**Your lifetime** reads each area from the pillar traditionally linked to it:

- Growth from the overall element mix (leans Expression): "You grow by making and sharing."
- Career from the Month pillar (Yin Fire, Harvest): "You have a practical head for results, resources, and money."
- Love from the Day animal (Tiger, Expression): "You love out loud."
- Family from the Year pillar (Yang Wood, Expression): "You're the fun one at home."

**The next 3, 5, and 10 years** read each chart year's pillar the same way as a day. Each row gets its animal, a condition, a theme line keyed to how that year's element meets the core element, and a condition per area. The summary names the smoothest year and the best year for each area. For this chart, the next five years (2026 to 2030) run Horse, Goat, Monkey, Rooster, and Dog.

**Tomorrow's teaser:** "Tomorrow looks Flowing for Personal growth. Come back and crack it."

## Verification

Run `npm test` inside `04 Source Code/fortune-cookie`. Current result: **all checks pass.**

| Check | Result |
| --- | --- |
| Start of spring 2024, 2025, 2026 against [Hong Kong Observatory published times](https://www.hko.gov.hk/en/gts/astronomy/Solar_Term.htm) | agree to the minute |
| Day pillars on 1970-01-01, 2000-01-01, 2019-01-27, 2024-06-15 against the [published 60-day cycle formula](https://ytliu0.github.io/ChineseCalendar/sexagenary.html) | exact |
| Full chart for 2024-06-15 12:00 UTC against a pyswisseph-derived fixture | exact |
| This worked example against MING's published chart | exact |
| 4,000 random charts (1940 to 2035) against `lunar-javascript`, an independent implementation | 0 mismatches on all four pillars |
| Distinct full readings in a year, per chart | 365 of 365 (MING: 271) |
| Shortest gap before the headline fortune repeats | 20 days |
| Shortest gap before a tiny step repeats, same area | 27 days |
| Days two unrelated charts share the same question, over a year | 0 of 365 |
| Every hand-written line reachable (500 random charts and life situations) | 60 slips, 40 area lines, 16 condition lines, 200 steps, 50 tries, 50 element-today lines, 105 for-you lines, 15 month lines, 15 year themes, 20 year and 20 lifetime area lines, 17 questions |
| Pet, kid, and partner steps never shown to someone single, living solo | 0 of 365 days |
| Month view covers one solar month; year view has 12 months with one current | yes |
| Condition label spread across random charts | Flowing 25%, Steady 36%, Mixed 24%, Go gently 15% |
| Copy check across 766 authored strings | no Chinese characters, no em dashes, no "will", no luck talk, no "missing / broken", no "it's not X, it's Y" |

## Known limits

1. **Births in the 11 PM hour.** Schools disagree on which day these belong to. Fortune Cookie keeps them on the same calendar day and says so in the app.
2. **Near a boundary.** If a birth time is within 15 minutes of a two-hour block edge, or within hours of a solar month change, the app warns that a pillar could shift.
3. **The 60-day cycle.** Day pillars repeat every 60 days. Variants for slips, tries, and steps rotate on different cycles, so a full reading doesn't repeat within a year, but individual lines do come back. The slip returns after 20 days at the earliest, and a step after 27.
4. **The scoring is ours.** The ease table and condition labels are an editorial method. They are consistent and testable, but not a classical rule, and the app says so.
5. **Places.** The app knows about 49,000 places with 5,000 or more people, and a world map covers anywhere else: a tapped spot keeps its exact coordinates and gets its time zone from a bundled boundary lookup.
6. **Years 1902 to 2099** only, the range with reliable time-zone history.
7. **No real readers yet.** The copy has not been tested with users.
