---
id: basin-first-photo-overlay
project: basin
date: 2026-09-14
question: Which photo does the camera overlay for alignment?
considered:
  - Yesterday's photo
  - The first photo ever
decided: The first photo, always. Labelled "Overlay".
mine: true
evidence: ["src/components/capture/capture-view.tsx"]
---
TODO(emily): why. The log: aligning to yesterday lets each day's small miss compound into drift, and the comparisons furthest apart are the ones drift ruins.
