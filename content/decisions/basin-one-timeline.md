---
id: basin-one-timeline
project: basin
date: 2026-08-01
question: Do trials get their own timelines, or is there one timeline of photos?
considered:
  - Parallel trials, each with its own photo series
  - One timeline; photos belong to dates, trials are derived from which tags a photo carried
decided: One timeline. Photos belong to dates, never to trials. A trial is the span from a tag's first photo to now, derived on read; there is no trials table and there must not be one.
mine: true
evidence: ["src/lib/basin/types.ts", "src/lib/basin/trials.ts"]
---
TODO(emily): why, in your words. The Night One log has: simpler data model and more honest UX; a second source of truth for "what am I testing" is a second thing that can disagree with the photos.
