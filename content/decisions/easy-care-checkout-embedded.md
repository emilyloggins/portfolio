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
Handle it in a professional, industry-appropriate way. For recurring card billing that means the processor renders the card fields inside our page, so card numbers never enter Easy Care and the clinic never takes one over the phone. We own the layout, the cart, name on card, billing address, the receipt, and the consent line that authorizes the schedule and the card on file.
