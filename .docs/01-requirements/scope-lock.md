<!-- AI Perfumery Engine project documentation; ownership follows the owner's existing agreement. No new licence is granted. -->
# Scope Lock — Alpha Demo, 7 October 2026

**Updated:** 2026-10-04. Team decision. Replaces the eleven-item view-only lock written earlier
the same day, which the owner's scope revision superseded.

This is **not** a change to the backlog or to [mvp-scope.md](../02-design/mvp-scope.md). Those
define the product across waves 0 to 5. This file says which slice is built first, for one demo,
on one date. Where they differ, the backlog is the authority on what the product needs and this
file is the authority on build order.

**The slice: wave 2's calculation core, and nothing else.** No accounts, no team, no laboratory.

**The one workflow, read in one breath:**

> Open a formula, change a quantity, and watch the percentages and the restriction findings
> recalculate, each one citing the rule behind it.

---

## Why authentication is out, and what that costs

Wave 1 is the account lifecycle. Skipping it is a deliberate choice with two consequences, one
good and one that constrains the whole build.

**The good one.** With no accounts there is no personal data, so prior consent (PRIV-001), the
data-rights endpoints (PRIV-002) and the append-only access log (LR2, rule 26) are not triggered
by this build. They are not deferred obligations; they are obligations that do not yet apply.

**The constraint, and it is absolute.** With no authentication there is no authorisation, so this
build has nothing protecting a formula. Therefore:

- **Synthetic data only.** No real material row, no real formula, no supplied dataset file, in the
  database, the seed, the fixtures or a screenshot (IP-002, rule 0.1).
- **Local only.** It is not deployed, not exposed on a network, not demonstrated against anything
  but the seed. Hosting approval is open anyway (IP-004).

**Amendment, 2026-10-06 (team decision).** The demo prototype gains two things beyond this lock:
formulas saved to a local JSON file, and the Reference data page (FR-021). Neither changes the
rule above for the alpha: the presentation and every team machine use the synthetic sample files
in `demo/samples/` only. The owner may upload her own files on her own computer, where they stay
in `demo/data/` (gitignored) and are never shown on a shared screen. The prototype's role check is
a persona menu, not authorisation, so it must not be used by more than one person.
- **The moment a login is added, three things ship in the same increment**: consent evidence
  before any personal-data write, the own-data rights endpoints, and the append-only log. Rule 26
  is explicit that logging is not a later hardening task. Nobody adds a sign-in form to this
  codebase on its own.

---

## MUST — ship or the demo fails

| # | Item | Traces to | Done when |
|---|---|---|---|
| M1 | Migrations for the calculation tables only: formulas, formula_versions, formula_components, materials, odor_types, material_odor_properties, material_volatility, material_restrictions, regulation_sources, regulation_versions, product_categories | `data-model.md` §3–§6 | Migrations run on a clean database. No users, organisations, consent or log tables exist yet |
| M2 | Synthetic seed: ten materials, their restriction rows, one formula with components | rule 19, IP-002 | A seeded formula opens and recalculates. Nothing in the seed came from the supplied dataset |
| M3 | `Result[T]` envelope, citation type and the three REST value types | CER-001, CER-002, `calculation-engine.md` §2 | No value leaves the engine without citations, and a missing input returns a named missing state rather than a zero |
| M4 | `ProportionCalculator`: exact declared sum, dilution applied once, both bases returned | FR-004 | A test proves 2% of a concentrate at 15% dilution is 0.3% of the product, and a second test fails if the dilution step is skipped |
| M5 | `ComplianceChecker`: compare against the category limit, cite regulation and version, return pass, exceed or a named missing state | FR-005, FR-006 | A missing category or dilution returns `data_missing` naming it. Dilution is never assumed to be 100% |
| M6 | `EvaluationService` loads a snapshot and the pure engine computes on it | `calculation-engine.md` §3, CER-003 | The engine package imports no repository, no pgx, no Gin and no clock. The same snapshot always gives the same result |
| M7 | Three routes, no auth middleware: list formulas, open a formula, recalculate a trial | FR-002, FR-003, FR-007 | A trial recalculation changes nothing in the database |
| M8 | Formula list and formula detail screens: components, both percentages, findings, citations and missing states | FR-003, NFR-001, NFR-006 | Every figure on screen can be traced to its source without leaving the view. Loading, empty and error states are distinct |
| M9 | Three tests, each naming the requirement it proves | course rubric, LR4 | A short `test-report.md` maps each test to an acceptance criterion |

M6 is on the list because it is the one piece that is expensive to retrofit. If the engine starts
with a database handle in it, taking that out later touches everything.

## SHOULD — build it the moment the MUST list is green

| Item | Traces to | Note |
|---|---|---|
| Odour profile chart, `mass` weighting only | FR-009 | Needs no domain decision now that the weighting is selectable (`calculation-engine.md` §6.1). It is the one chart that can ship honestly |

## COULD — only with time to spare

| Item | Traces to | Note |
|---|---|---|
| Export the displayed formula view | FR-008 | Output format is undecided |
| Explicit version save | FR-011 | Only if the trial-versus-saved distinction is already solid |

## WON'T — not in this build, written down so it is not argued about again

| Item | Why |
|---|---|
| Login, signup, MFA, sessions, password reset | Out by this decision. Adding any of it pulls in consent, rights and logging in the same increment |
| Accounts, organisations, roles, invitations, admin screens, team management | Same decision. Nothing in this build knows who a user is |
| Access log, consent records, data-rights endpoints | Not deferred obligations. With no personal data they do not yet apply |
| Batch, mixing sheet, per-item weighing, instruments, pre-dilution | Wave 3, and its tolerances are domain-gated |
| Document vault, upload, completeness | Wave 4 |
| Tutorial sandbox and mascot | Wave 5 |
| Evaporation and evolution curves | The model is not chosen |
| Material groups and pair checks | No supplied data, no table, no rule |
| Odour-unit and strength weightings | No detection thresholds in the sample, no approved strength mapping |
| Any deployment | Hosting approval is open, and an unauthenticated build must not be exposed |
| Any AI or model feature | No generative feature in this MVP |

The demo still shows several WON'T items, under a navigation group labelled **Roadmap preview · not in this build**, with a banner on every such page. That is presentation of where the product goes next, decided 2026-10-05 so a teammate's preview pages are kept rather than deleted. It does not move any item out of the WON'T column.

If the owner asks for one of these during the build, the answer is that it goes on this list for
now and is revisited after the 7th, and it gets recorded here rather than argued about again.

---

## The nine MUST items as board issues

```
M1 chore: migrations for the calculation tables
M2 chore: synthetic seed, ten materials and one formula
M3 feat: Result envelope, citations and REST value types
M4 feat: proportions, dilution applied exactly once
M5 feat: compliance findings with cited thresholds
M6 feat: EvaluationService snapshot and pure engine boundary
M7 feat: list, detail and recalculate routes
M8 feat: formula list and detail screens
M9 test: three tests traced to acceptance criteria
```

Only these are "To do". SHOULD, COULD and WON'T live in a parked column, visible but not in this
sprint.

## What the demo shows, and what it must not claim

It shows a formulator opening a real formula structure, changing a quantity, and getting
server-computed percentages and cited restriction findings back, with missing data visible as
missing. That is the interview's first three pain points answered end to end.

It must not be presented as a validated chemistry engine, a compliance certificate, or evidence
that authentication, the laboratory workflow or the predictive models exist. The README already
states this; keep it true.
