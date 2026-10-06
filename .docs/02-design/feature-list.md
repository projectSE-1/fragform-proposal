<!-- AI Perfumery Engine project documentation; ownership follows the owner's existing agreement. No new licence is granted. -->
# Feature List — Adopted MVP

**Updated:** 2026-10-04

**Status:** Intended MVP features, not implemented functionality. The owner selected Honney's
technology stack and the pinned frontend repository's MVP; domain/legal/engineering gates
remain explicit in [backlog.md](../01-requirements/backlog.md).

The original **view and evaluate a formula** workflow remains the centre of the product. The
current MVP extends it to account onboarding, formula authoring/versioning, laboratory batches,
technical-document evidence and guided practice. Newly added features trace to the
2026-10-04 owner instruction and pinned source, not a new interview.

## Features and Acceptance Links

| ID | Feature / expected user outcome | Wave |
|---|---|---|
| FR-001 | Signup and verify email; login with required MFA; reset password; select server-approved active organisation/role; logout/expiry. Signup creates pending access, never automatic lab rights. | 1 |
| FR-002 | Find an authorised formula from a minimal list; empty/search/error states make the next allowed action clear. | 2 |
| FR-003 | Read/edit a connected workspace of ingredients, declared amounts and supported server results/restrictions; missing groups/grades/rules stay explicit. | 2 |
| FR-004 | Receive server-calculated weights/proportions/totals and supported batch conversions; no auto-normalisation or silent density/drop assumptions. | 2–3 |
| FR-005 | Read separate EU/TH/ASEAN/US findings with sourced category/version/dilution; distinguish pass/exceed/inconclusive/missing and non-dismissable sourced hard blocks. | 2, 4 |
| FR-006 | Trace every result through its explanation/error budget and complete provenance list/tree to the original source; graphical rendering may be deferred, underlying evidence may not. | 2 |
| FR-007 | Evaluate a labelled in-memory what-if through Go, then discard or explicitly save under FR-011; trials never silently change stored versions. | 2 |
| FR-008 | Download only the authorised formula/batch output; scoped confidential content is allowed, underlying dataset/rule-table dumps are not. Every download is logged. | 3 |
| FR-009 | Inspect supported odour/profile charts and Profile A/B side-by-side, with required uncertainty and evidence. | 2 |
| FR-010 | Inspect time-dependent evolution/evaporation curves with uncertainty bands, model/input freshness and approved applicability. | 2 |
| FR-011 | Create a formula, submit declared decimal-text proportions, explicitly save immutable versions and analyse the selected version; invalid sums/conflicts do not overwrite history. | 2 |
| FR-012 | Create an authorised batch tied to a formula version, declared target and lots; obtain mixing-sheet and lab-label PDFs. | 3 |
| FR-013 | Choose each instrument explicitly, record actual weighing, see reviewed WARN/BLOCK outcomes and add reasoned reweigh/pre-dilution records while preserving history. | 3 |
| FR-014 | Find missing SKU/lot evidence, browse old/new document versions, upload the correct document type/subject and see scanning/parsing/rejected status. | 4 |
| FR-015 | Search/browse permitted reference materials, vehicles, categories, SKUs/lots and instruments; reference-data editing is deferred. | 2–4 |
| FR-016 | Administrators invite/review pending users and manage permitted fixed roles with reasons/MFA step-up; authorised custodians query/export required access-log metadata. | 1 |
| FR-017 | Manage only one's own profile/security/MFA/sessions/preferences/consent; use real personal-data export/correction/erasure with disclosed retention exceptions. | 1 |
| FR-018 | Read public overview/how-to/FAQ and versioned legal texts in Thai/English without real system data or unsupported claims. | 0–1 |
| FR-019 | Opt into, skip and reopen Q0–Q6 tutorial missions using labelled synthetic data; write only one's own tutorial progress from the sandbox. | 5 |
| FR-020 | Open/dismiss reviewed static mascot tips and search FAQ; the mascot never generates scientific advice/results or covers critical states. | 5 |

## Controls Included with Features

Every data-bearing page must show loading, success, empty and safe error states, plus its
relevant pending/validation/conflict/missing/block states. Thai/English preserve numbers and
server precision; keyboard access, readable status labels, reduced motion and responsive layouts
are verified at 1366×768, 390×844 and 360×800.

Frontend components receive/format inputs and display Go results. They never calculate official
results, choose hidden scientific defaults or decide compliance themselves. A failed request
cannot leave a prior result labelled current; formula-change and model-change indicators stay
separate. Predictions/measurements require reviewed uncertainty/tier/error budget and provenance;
declared target/input quantities are distinct.

Server checks apply to the permitted action **and** record/organisation, even if a menu is
hidden. Own-account data stays own-only; a pending user has account/help/tutorial access and no
lab/reference-data access. Consent, real rights endpoints, immutable agreement evidence,
durable append-only metadata logs and the restricted log query ship with authentication.
Deferring the full audit dashboard does not defer those controls.

These are traced to NFR-001–008, CER-001–005, SEC-001–006, PRIV-001–004, IP-001–004 and
LR1–LR5 in [backlog.md](../01-requirements/backlog.md), governed by
[rule.md](../03-compliance/rule.md).

## Readiness and Deferred Work

FR-009/010 and scientific parts of FR-004/005/013 require validated models, sources, units,
uncertainty/tier methods, thresholds/calibrations and applicability. Missing information returns
`insufficient data`; importing source fixtures or a UI/API shape does not validate it. Signup,
invitation/erasure, file storage/scanning and deployment additionally need completed privacy,
security, legal-text and approved-infrastructure decisions.

Outside this MVP: offline sync/desktop wrapping, reference-data cell editing (import and version activation are FR-021), formula comparison,
graphical provenance rendering, R2 regulatory labels/report export/notification, full X4-S6
audit dashboard, R3–R6, external-client portal/SaaS/orders, production/safety approvals,
evaluation panels, AI mascot chat, notification bell and production dark mode. Lab label/mixing PDFs,
complete provenance data and restricted local log query remain in scope.

The owner-requested light/dark switch is implemented in the synthetic demo only; see [prototype status](prototype/prototype.md).

The retained stack and API adaptation are in [tech-stack.md](tech-stack.md) and
[api-contract.md](api-contract.md). [mvp-scope.md](mvp-scope.md) is the wave/ID baseline;
[user-journey.md](user-journey.md) describes the paths. No framework/library change is implied
by adopting these features.
