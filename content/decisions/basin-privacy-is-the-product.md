---
id: basin-privacy-is-the-product
project: basin
date: 2026-08-30
question: Where do the photos live, and what does the app say about it?
considered:
  - An account and a server, with a privacy policy page
  - Local only, no account; export everything; hold to erase; "Data Not Collected"
decided: Local-first IndexedDB, no account, export everything as a zip with a letter, hold-to-erase with no dialog. About is a heading, one sentence, two buttons.
mine: true
evidence: ["src/lib/basin/export.ts", "src/components/home/about-page.tsx", "docs/app-store-privacy.md"]
---
TODO(emily): why. The export should feel like a loving, caring touch; privacy as a feature, not a page.
