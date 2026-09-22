# AI Perfumery Engine — Project Proposal (Updated)

**Course:** 1305493 Software Engineering Case Studies, 1/2569
**Team / Company name:** projectSE-1

## Problem Statement

Before a fragrance formula is safe to mix, a formulator has to know what is in it, work out the
quantities, check the restrictions, spot anything wrong, and finish all of that before touching
real material. Every one of those steps is currently done by hand.

This was confirmed in a real interview with our stakeholder (2026-09-02; full writeup in
`.docs/00-context/project-context.md` §3). The four pain points named there follow the same order
as that workflow:

1. **Holding it all at once.** One formula has many ingredients, each with its own concentration,
   quantity, and restrictions.
2. **Doing the math by hand.** Weights, percentages, and totals are calculated manually, then
   checked manually for mistakes.
3. **Checking restrictions by hand.** Knowing which limit applies to which ingredient is
   complicated, and something is easy to overlook.
4. **Finding out too late.** None of this happens before mixing, so a wrong number or a missed
   restriction only appears once real material has been spent.

Points 1 to 3 cost time. Point 4 is the expensive one: the formulator can do everything right and
still miss a problem, or catch it only after the batch already exists.

## Target Users

- **Formulator** (primary persona, evidenced by a real interview): a fragrance formulator who
  needs to understand and evaluate a formula quickly and correctly before committing to it
  physically.

The material and rule dataset is supplied by a domain expert outside the system (`rule.md` §0).
That role does not use the product itself, so it is not a target user for this build cycle.

## Proposed Solution

A calculation engine that automatically computes a formula's material weights, percentages, and
totals, and highlights the rules and restrictions relevant to that formula — so a formulator can
understand and evaluate it without manual calculation or guesswork. This is a bespoke,
deterministic tool for one real customer's internal use: it does not offer public
formula-generation-and-ordering, and it does not use any generative-AI/LLM feature (confirmed via
stakeholder meetings, `project-context.md` §17).

The stakeholder has supplied a sample of the material data in the format the full set follows: 10
substances with 34 fields each, covering chemical identity, measured physical properties
(including vapour pressure and Antoine coefficients), odour descriptors and detection thresholds,
and regulatory status. Restrictions trace to the IFRA Standards, 51st Amendment, and to EU CosIng
status per substance. Structure is documented in `.docs/00-context/dataset-structure.md`; the data
itself stays out of this repository.

## Scope for This Build Cycle

One core workflow: log in, open the formula list, open a formula, and see all of its information
(materials, calculated weights/percentages, and highlighted rules/restrictions), with optional
in-place "what-if" recalculation and export. Authoring a new formula from scratch is out of scope
for this cycle — see `.docs/01-requirements/backlog.md` Open Question 1.

## Note on User Validation

Per a lecturer-confirmed exception (2026-09-02), this project's requirements are sourced from one
real customer relationship (the stakeholder above) rather than the course's usual ≥15-interview
panel, because this product is a bespoke tool built for that single real customer rather than a
multi-user consumer product. Recorded here per the recommendation to get this in writing.
