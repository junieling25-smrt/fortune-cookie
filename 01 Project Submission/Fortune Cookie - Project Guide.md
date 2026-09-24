# Fortune Cookie: project guide

Fortune Cookie is the rebuild of MING: a daily fortune from your Four Pillars birth chart, in plain English. It has sections for overall, personal growth, career, relationships, and family and pets, plus a month, year, and lifetime view.

## Try it

- **Website:** https://junieling25-smrt.github.io/fortune-cookie/. GitHub Pages rebuilds it from https://github.com/junieling25-smrt/fortune-cookie on every push. Here the calendar reminder and image download work directly.
- **Live prototype:** https://claude.ai/artifact/CL1YomkHA1tfgFC8QJK6cT. It's currently shared as "anyone with the link" and can be changed from the page's Share menu. Inside this viewer, "Download image" asks for a quick confirmation. The calendar reminder only works from the full site or the offline file.
- **Offline, no install:** double-click `04 Source Code/Fortune Cookie Prototype (single file).html`. It's one self-contained file; an internet connection is only needed for the fonts.
- **From source:**

  ```bash
  cd "04 Source Code/fortune-cookie"
  npm install
  npm run dev
  ```

  Then open the local address it prints. `npm test` runs the engine checks, and `npm run build:single` rebuilds the single-file version.

On first visit you go through onboarding: six short steps while the cookie cracks. After that, each day starts with a sealed cookie to crack. Everything is calculated in the browser and saved only on your device. "Your details" edits your answers, and "Forget me" in the footer erases them.

## Folder guide

| Folder | What's inside |
| --- | --- |
| `01 Project Submission` | This guide and the project memo draft |
| `02 Research and Strategy` | Product brief (both rounds of changes), reading engine worked example, audience and language notes, competitor snapshot |
| `03 Product Screenshots` | 14 screens: onboarding (4), daily crack, today's fortune, life areas, streak and month, year, lifetime, how it works, share image, mobile, mobile dark |
| `04 Source Code` | The `fortune-cookie` app (Vite, React, TypeScript) and the single-file build |
| `05 Brand Assets` | Cookie mark (SVG and PNG), app icon, lockups, mark system board, identity board, brand system, and editable board sources |

## How it relates to the MING folders

MING's folders one level up are unchanged. Fortune Cookie reuses three things from them:

- **The calculation engine** from `ming-daily-ritual`, with its rules unchanged and re-verified (0 mismatches across 4,000 charts).
- **The research** from `02 Research and Strategy`, condensed here with the original source links.
- **The worked example chart**, so the two projects can be compared line by line.

Everything else is new: the name, the brand, the onboarding, the interface, the reading structure, the long-term views, the habit features, and every sentence of reading copy.
