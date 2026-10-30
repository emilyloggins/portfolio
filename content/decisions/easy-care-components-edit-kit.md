---
id: easy-care-components-edit-kit
project: easy-care
date: 2026-10-23
question: When a screen needs a component the kit doesn't have, or an existing one changed, what happens?
considered:
  - Build local components as needed
  - Edit the kit first; add a variant if close enough; a new component only if net new
decided: "Edit the kit before adding. Kit Select and Input gained a radius=sm variant; the two local replacements made before the rule were deleted. Four net-new components kept: nav item, step, option row, check row."
mine: true
evidence: ["system-theme"]
---
If it's close enough to be a variant, add it to the existing kit; if it's net new, add a new component. The theming story only holds if the kit stays the kit. The Select and Input got a small-radius variant instead of local copies; the option row, check row, nav item and step are new because nothing in HeroUI does those jobs.
