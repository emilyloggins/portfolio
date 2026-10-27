---
id: basin-no-expectation-windows
project: basin
date: 2026-08-01
question: Should the app tell you when to expect results, or check in on a schedule?
considered:
  - Expectation windows per product type, with check-ins at weeks 2, 4, 8, 12 and a countdown
  - No windows, no check-ins, no countdown; comparing is always available
decided: None of it shipped. The user is the only clock. "Basin does not decide when someone is allowed to look at their own photos."
mine: true
reversedBy: basin-four-week-check-in
evidence: ["src/lib/basin/trials.ts"]
---
TODO(emily): why. The log: "Why limit them? They decide when they've had enough time."
