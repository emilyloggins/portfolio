---
id: basin-four-week-check-in
project: basin
date: 2026-10-13
question: A month into the trial, trials sit open with nobody deciding. Does the app ask?
considered:
  - Still nothing; the Trials tab is the reminder
  - A nudge on each trial card
  - A pop-up on the calendar, on open and after a photo lands, every two weeks
  - The same pop-up every four weeks
decided: A four-week check-in, as a pop-up on the calendar. "Still testing X?" with two answers, still testing or I've decided, and a close that asks again next time. Four weeks is one skin-cell turnover, the floor for judging almost anything.
mine: true
evidence: ["src/components/home/home-screen.tsx", "src/lib/basin/trials.ts"]
---
TODO(emily): why, in your words. This reverses the Night One rule. The principle held (the app never decides when you've seen enough; "still testing" is a complete answer); the implementation changed because the trial showed trials sitting open. Say what you saw.
