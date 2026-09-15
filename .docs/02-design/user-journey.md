# User Journey — View & Evaluate a Formula

This is the one core workflow for this build cycle (`backlog.md` Section 4, FR-001–FR-010).
Every diagram and prototype screen in this design set traces back to these same steps, using the
same actor: **Formulator**.

1. Formulator logs in. (FR-001 — no public sign-up; internal account only.)
2. Formulator opens the formula list and sees the formulas she is authorized to view. (FR-002)
3. Formulator selects a formula to open. (FR-002 → FR-003)
4. System automatically calculates each material's weight/percentage and the formula's totals,
   and highlights any applicable rule or restriction. Formulator sees materials, quantities, and
   flags together in one view, and can expand any flagged item to see which rule, threshold, and
   source data produced it. (FR-003, FR-004, FR-005, FR-006)
5. *(Optional)* Formulator adjusts a value to test a "what if" — the view recalculates
   immediately, in place, without saving. (FR-007)
6. *(Optional)* Formulator exports the formula view currently on screen. (FR-008)

**Happy path only** — this is the one thread every diagram (`diagrams.md`) and prototype screen
(`prototype/`) follows. Edge cases and the formula-authoring gap live in `backlog.md`, not here.
