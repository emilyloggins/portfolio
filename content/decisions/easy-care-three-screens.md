---
id: easy-care-three-screens
project: easy-care
date: 2026-10-19
question: Does enrollment stay a linear stepper, or get shorter?
considered:
  - Keep the nine-screen stepper, one decision per screen
  - Collapse to three screens, one per stage that means something
  - Something between
decided: "Three screens: Who (client, pet, weight), What (plan, products, add-ons, with the cart beside it), Sign-off (doctor, payment). Success as its own end state."
mine: true
evidence: ["01-who", "02-what", "03-sign-off", "04-success"]
---
Enrollment is a checkout process, essentially, and the summary card is the cart. The dependencies the stepper enforced still hold inside each screen: the pet list waits on a client, the products wait on a weight. What the stepper added was a screen boundary around every one of them, which is nine Next buttons for a receptionist with a client at the counter. The guardrails move into the screens: field gating, the live cart, and Continue waiting on the required coverages.
