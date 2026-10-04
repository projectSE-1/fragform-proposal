# Scope Lock — Alpha Demo, 7 October 2026

Team decision, 2026-10-04. The locked list for the BUILD month, in the MoSCoW form the W6 class
asks for.

**This does not change the backlog.** `backlog.md` assigns a requirement's priority for the
product. This file orders those requirements for one demo on one date. Where the two differ, the
backlog is the authority on what the product needs; this file is the authority on what gets built
first.

**The one workflow, read in one breath:**

> Log in, open a formula, and see every material with its percentage and its restriction flag,
> each one citing the rule behind it.

---

## MUST — ship or the demo fails

| # | Item | Traces to | Done when |
|---|---|---|---|
| M1 | Database schema and migrations | `data-model.md`, `roles-permissions.md` §4 | Migrations run on a clean database and `org_id` is on every tenant-owned table |
| M2 | Synthetic seed data: one organisation, two users, ten materials, one formula with its restriction rows | rule.md rule 19, IP-002 | `make seed` fills a database you can open a formula from. No real dataset file, no real person |
| M3 | Login and logout | FR-001, NFR-003, SEC-004 | Valid credentials reach the formula list; invalid ones get one generic error; both write an `access_log` row |
| M4 | The three gates: verify session, action check, record check on `org_id` | SEC-001, SEC-004, `roles-permissions.md` §5 | A formula id from another organisation is refused server side, with the client sending whatever it likes |
| M5 | Access log writer, append only | LR2, SEC-003, rule 26 | Login, formula view, and calculation run each write a row with the rule 27 fields and a server clock timestamp |
| M6 | `Result[T]` envelope and the citation type | CER-001, CER-002 | No value can leave the engine without citations, and a missing input returns `insufficient_data` naming it |
| M7 | Proportions: `pct_in_formula` and `pct_in_product` | FR-004 | A test proves the dilution is applied exactly once, using the 2% × 15% = 0.3% example |
| M8 | Restriction check with citations | FR-005, FR-006 | Within, over and insufficient data each render, and each flag names its regulation, version and threshold |
| M9 | Formula list endpoint and screen | FR-002 | Lists only this organisation's formulas, name and last modified only |
| M10 | Formula detail endpoint and screen | FR-003, NFR-001 | Every material, its quantities, both percentages, its flag and its explanation, in one view |
| M11 | Three tests traced to acceptance criteria | course rubric, LR4 | Each test names the requirement it proves, in a short `test-report.md` |

Rule 26 is why M5 is a MUST and not a SHOULD: the access log has to ship in the same sprint that
adds authentication, not afterwards.

M2 is synthetic on purpose. Seeding real people would trigger the consent requirement (PRIV-001),
and the consent records table is not modelled yet. Synthetic accounts hold no real personal data,
so the first real account is what triggers it, not the demo.

## SHOULD — real value, the product still works without it

| Item | Traces to | Why not MUST |
|---|---|---|
| What-if recalculation in place | FR-007, NFR-002 | It answers the fourth pain point and it is the best thing to show on stage, but the demo still tells a complete story without it. Build it the moment M1 to M11 are green |

## COULD — only if there is time left

| Item | Traces to | Note |
|---|---|---|
| Export the displayed view | FR-008, IP-003 | The file format is still undecided (Open Question 6) |
| Odour profile chart, `mass` weighting only | FR-009 | Needs no stakeholder decision now that the weighting is selectable (`calculation-engine.md` §4) |

## WON'T — not this build, written down so nobody argues about it again

| Item | Why |
|---|---|
| Evaporation curve | The model is not chosen (decision 4), and `feature-list.md` already records it as not ready to implement |
| Material groups and material pair checks | No supplied field, no table, no engine output (decision 11, Open Question 16) |
| Formula authoring from an empty state | Out of scope by Open Question 1 |
| Raw material database editing | No requirement behind it anywhere in FR-001 to FR-010 |
| Experiment history | Deferred, `roles-permissions.md` §2 |
| Client portal and every external account | Its permission design is unresolved (SEC-005) |
| SaaS tenant administration, onboarding, billing | Deferred, `roles-permissions.md` §2 |
| Supplier document download | A different feature from export, and nothing this cycle reads those PDFs |
| Admin user management screens | Admin capabilities and account provisioning are open (Open Questions 10 and 2) |
| Deployment to Railway | Hosting approval is not obtained, and Railway would hold owner IP outside Thailand (Open Question 15, IP-004) |
| Any AI or model feature | No generative feature this cycle (NFR-004, CER-003) |
| Evaluation panels, agreements, e-signature | Out of scope (Open Question 8); the agreement law requirement is not triggered (Open Question 4) |

If the stakeholder asks for one of these during the build, the answer is "it goes on the WON'T
list for this build, and we come back to it after the 7th", and it gets recorded here rather than
argued about again.

---

## The eleven MUST items as board issues

Each row above is one issue. Titles ready to paste:

```
M1  chore: database schema and migrations
M2  chore: synthetic seed data (no real dataset, no real people)
M3  feat: login and logout, with access log rows
M4  feat: the three gates (session, action, record on org_id)
M5  feat: append-only access log writer
M6  feat: Result[T] envelope and citation type
M7  feat: proportions, dilution applied exactly once
M8  feat: restriction check with cited thresholds
M9  feat: formula list endpoint and screen
M10 feat: formula detail endpoint and screen
M11 test: three tests traced to acceptance criteria
```

Only these become "To do". SHOULD, COULD and WON'T live in a parked column, visible but not in
this sprint.
