---
id: easy-care-checkout-embedded
project: easy-care
date: 2026-10-19
question: Does Easy Care own the payment screen, or is payment an embedded third party?
considered:
  - Easy Care's own card form
  - A redirect to the processor's hosted page
  - The processor's embedded card element inside the Sign-off screen
decided: "Embedded element. Easy Care owns the layout, the cart, name on card, billing address, receipt and the recurring-charge consent; the processor renders the card fields, so card data never enters Easy Care. The card is saved as the payment method on file."
mine: false
evidence: ["03-sign-off"]
---
TODO(emily): why, in your words. Your instruction was "handle it in a professional, industry appropriate way"; the original had a placeholder because the processor was never chosen.
