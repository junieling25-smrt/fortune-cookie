# Fortune Cookie: audience and language notes

A condensed carry-over of MING's audience research (Reddit, TikTok, and App Store reviews, collected 2026-09-02). The full source document, with every quote and its method notes, is `../../02 Research and Strategy/MING - Audience and Language Research.md`. Each link below is copied from that document. Nothing new was researched for this rebuild.

The last column of each table says how the Fortune Cookie prototype responds.

## What the audience wants

| Finding | Evidence | In Fortune Cookie |
| --- | --- | --- |
| **Plain language is a stated reason people love an app.** | "No need to know all the astrology speak" ([The Pattern reviews](https://apps.apple.com/us/app/the-pattern/id1071085727), 5★, 2026-08-19) | Plain English on every screen. No Chinese characters or romanized terms. The one technical panel is optional and five rows long. |
| **"Show me why."** The loudest complaint about Co-Star is that it hides the astrology behind the message. | "refuses to tell you what the actual astrology is" ([comment](https://www.reddit.com/r/astrology/comments/pata3s/comment/ha6zqol/)) | Every section says where it came from in one sentence: "Today's Earth works as Structure for you." Animal pairs and clashes are named. |
| **"You are not just a Rat."** Finding out you have four animals, not one, is the highest-energy discovery moment in the data. | "you actually have four animal signs" ([post](https://www.reddit.com/r/ChineseZodiac/comments/1l35qwf/in_chinese_astrology_you_actually_have_four/)) | "You're more than your year animal" is the headline of the chart section. The four animals are the biggest thing on it. |
| **Season and climate language for timing.** The idea that your core nature holds while your conditions change. | Research summary of a real person's post; the original authors warn not to reuse the title verbatim ([source](https://www.reddit.com/r/chineseastrology/comments/1umi8i8/series_09_your_personality_isnt_broken_your/)) | "This month" line with an end date, plus a weather metaphor throughout: "We describe the weather. You choose the route." |
| **"Try it on."** People engage without having to believe. | community framing ([comment](https://www.reddit.com/r/humandesign/comments/eojp6c/comment/feervr0/)) | Tiny steps are small, optional, and tickable. The core element is "a starting sketch, not a box." |
| **The Day Master is the reference point, not the description.** | the community's own correction ([comment](https://www.reddit.com/r/ChineseZodiac/comments/1w1gty0/comment/p6lq86u/)) | The core element card says it is "the lens every reading uses," not a personality type. |

## What pushes them away

| Risk | Evidence | In Fortune Cookie |
| --- | --- | --- |
| **"Missing element" and "broken" framing causes real distress.** | "I have 0% Water. Does this mean I'm going to be poor forever?" ([post](https://www.reddit.com/r/chineseastrology/comments/1uwvfrm/the_missing_element_fallacy_why_having_0_of_an/)) | The element mix says "Less Metal: finishing and letting go may take extra effort" and "Every chart is uneven." The copy check bans "missing", "broken", and "enemy". |
| **Untranslated jargon sounds like "a badly translated fantasy novel."** | ([post](https://www.reddit.com/r/chineseastrology/comments/1ukquug/series_06_stop_trying_to_memorize_bazi_terms/)) | The relationship names (for example "Seven Killings") are replaced by five plain families: Company, Expression, Harvest, Structure, Nurture. |
| **Blunt, roasting, or fear-toned daily copy is now the top reason people leave Co-Star.** | "like having a cruel aunt who is not really trying to help" ([Co-Star reviews](https://apps.apple.com/us/app/co-star-personalized-astrology/id1264782561), 1★, 2026-08-06) | The softest condition is "Go gently" with "Rest counts as progress today." There is no "bad day" label. |
| **AI-sounding copy is a rejection trigger.** Users spot it by em dashes and "it's not X, it's Y". | ([Co-Star reviews](https://apps.apple.com/us/app/co-star-personalized-astrology/id1264782561), 1★, 2026-08-03, "Awesome app ruined by chatgpt") | Every line is hand-written. The test suite fails if an em dash or that construction appears in the copy library. |
| **Compatibility scores read as verdicts.** | "imagine my shock when it said we're literal soulmates... I want to vomit and cry" ([post](https://www.reddit.com/r/Advancedastrology/comments/1ieq4mg/the_awkward_moment_when_costar_and_pattern_say/)) | No scores anywhere. The future relationship feature is planned as questions both people answer. |
| **Unexplained accuracy feels like surveillance.** | "Do they use the microphone to listen...?" ([post](https://www.reddit.com/r/CoStarAstrology/comments/1qhi9ib/your_day_at_a_glance/)) | Nothing claims to know your week. Readings name the calendar mechanism, and the app states that birth details never leave the device. |

## Engine requirement carried over

**Same birth details, same chart, every time.** Calculators visibly disagree, and chatbot-built charts change between runs ("They got seven different charts" from ten runs, [post](https://www.reddit.com/r/chineseastrology/comments/1v2xcgp/why_llms_give_you_a_different_zi_wei_chart_every/)). Fortune Cookie computes pillars from astronomy, not from a model, and the reading is a pure function of (birth details, date).

## Cautions that still apply

- The Co-Star one-star slice is language evidence, not market size. Its lifetime rating remains 4.79 over 205,616 ratings ([App Store](https://apps.apple.com/us/app/co-star-personalized-astrology/id1264782561)).
- TikTok evidence came from 17 of 805 comments, so it is directional only.
- The Chinese diaspora segment still needs 8 to 10 interviews before anything is built for it.
- **The new five-area structure (growth, career, love, family and pets) came from product direction, not from this research.** It should be the first thing tested with real users.
