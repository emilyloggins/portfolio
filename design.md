# design.md

Rules for building this site. Read before any page. Judgment rules first, then measurements. Values marked (placeholder) change when the specimen page is approved.

## What the site is
The site is the third case study. A reader should be able to tell how Emily works from the site itself. The first thing they sense is taste: nothing on the home page is explained, only shown.

## Judgment
- Evidence over description. Show the real product running, the real decision, the real commit. Never a mockup on a gradient.
- Edited, not decorated. If an element can be removed and the page still reads, remove it.
- One material. One ground, one ink scale, one accent used rarely. No light/dark branch.
- Type does the work. Hierarchy by size and ink, not by colour or weight tricks.
- Motion is fast and physical: 160 to 220ms, decelerating ease, nothing floats or drifts. One ritual only: the blur-to-focus arrival.
- Density trusts the reader. Small type is allowed because it is set well.
- Personal content inside disciplined chrome. Emily's face, skin and words are warm; the frame is cool.
- Emily writes every word of prose. Components carry structure; they never carry copy she has not written.

## Measurements (placeholder until the specimen is approved)
- Ground `--color-ground`; ink `--color-ink` / `-2` / `-3`; line `--color-line`; accent `--color-accent`.
- Type: display 48/1.05/-0.02em; title 24/1.2/-0.01em; body 16/1.55; meta 13/1.4.
- Measure: body text max 64ch.
- Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64, 96.
- Radii: 4, 8. Nothing rounder.
- Easing `--ease-out` cubic-bezier(0.16, 1, 0.3, 1); durations 160 / 220ms.

## Platform
- Static export. No server, no analytics, no cookies.
- Fonts via next/font, one family.
- View Transitions for route changes; scroll-driven animation in CSS for reveals; container queries in components.
- Reduced motion honoured everywhere.
- Lighthouse 95+ on every page.
