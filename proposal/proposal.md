<!-- AI Perfumery Engine project documentation; ownership follows the owner's existing agreement. No new licence is granted. -->
# AI Perfumery Engine — Project Proposal (Updated)

**Course:** 1305493 Software Engineering Case Studies, 1/2569

**Team / Company name:** projectSE-1

**Updated:** 2026-10-04

**Status:** Owner-directed MVP scope baseline; scientific, legal and deployment decisions still require the checks below. This document describes intended work, not implemented features.

## Problem Statement

Before a fragrance formula is mixed, a formulator needs to understand its ingredients, calculate
quantities, check relevant restrictions and identify missing evidence. Doing these tasks manually
costs time and makes it easier to discover a mistake only after using real material.

The real stakeholder interview on **2026-09-02** identified four pain points:

1. **Too much information to track:** many ingredients, concentrations, quantities and restrictions.
2. **Manual calculation:** weights, percentages and totals are calculated and checked by hand.
3. **Complicated restriction checks:** applicable rules and limits are easy to overlook.
4. **Discovering problems too late:** the user needs to evaluate the formula before physically mixing it.

The historical interview evidence is recorded in
[project-context.md](../.docs/00-context/project-context.md), §3. The expanded account, lab,
document and tutorial workflows below come from the **2026-10-04 owner's instruction** and
the referenced frontend MVP; they are not attributed to new interviews.

## Target Users

- **Formulator:** the primary user with direct interview evidence; creates, evaluates and versions
  formulas, understands restrictions and prepares lab work.
- **Lab personnel and students:** use batch/mixing sheets, select instruments and record actual
  weighing. This workflow is adopted from the frontend MVP.
- **Organisation administrator:** invites users, decides pending access, grants/revokes permitted
  roles and operates the restricted log-query capability required by the local rules.
- **Reference/document reviewers:** access the lab/document workflows only where their approved
  action and record permissions allow it. Their role identifiers do not automatically grant
  production approval or reference-data editing.
- **Visitor or pending account holder:** reads public help/legal pages; after login, can manage
  their own account and practise using synthetic tutorial data without accessing lab data.

The seven role identifiers and the server-side permission boundaries are defined in
[roles-permissions.md](../.docs/02-design/roles-permissions.md). The domain expert supplies and
validates the material/rule dataset; reference-data management remains outside this MVP.

## Proposed Solution

Build a web application that accepts declared formula inputs and uses a server-side calculation
engine to return quantities, rule findings and supported odour/evolution results with their
sources. The application connects this evaluation to immutable formula versions, laboratory
batch records and technical-document evidence. Every unavailable result states `insufficient
data`; the system never invents an interaction, scientific value or safety claim.

The intended dataset contains approximately 100 aroma materials. A supplied sample contains
10 substances with 34 fields covering identity, physical properties, odour information and
regulatory references. [dataset-structure.md](../.docs/00-context/dataset-structure.md) documents
its structure only. Historical sample references, including IFRA Standards 51st Amendment and
EU CosIng status, are evidence of the sample's contents, not a claim that current regulations or
complete production models have been verified. Real data stays within approved infrastructure.

There is no generative-AI feature in this MVP. The core formulation and calculation workflow
must continue to work if an optional future model service is unavailable.

## MVP Scope and Delivery

The owner directed this revision on **2026-10-04**: retain the **Honney technology stack** and
adopt the MVP of
[ai-perfumery-engine-frontend](https://github.com/sattasarasadaw-crypto/ai-perfumery-engine-frontend/tree/aa572abaede14c11796a1551434858171eb37363),
pinned to `aa572abaede14c11796a1551434858171eb37363`. The source is a design/API handoff with
synthetic mocks; it does not demonstrate a functioning application or validated engine.

| Wave | Intended deliverable |
|---|---|
| 0 | Application shell, shared result/error presentation, Thai/English, responsive public overview/help/legal pages and a safe demo boundary |
| 1 | Signup/email verification, login/MFA, pending access, own-account security/consent/data rights, administrator invitations/role decisions and required access logging |
| 2 | Formula list/create/editor/immutable versions, explicit analysis inputs, server calculation, Profile A/B where supported, uncertainty, missing-data states and complete provenance as a list/tree |
| 3 | Batches, mixing sheets, per-item instrument choice and weighing, reweigh/pre-dilution and authorised lab PDFs |
| 4 | Separate jurisdiction compliance findings, sourced hard blocks, document completeness/vault, typed uploads and processing states |
| 5 | Opt-in Q0–Q6 tutorial sandbox, dismissible static mascot tips and FAQ search |

Signup creates a **pending account**, not permission to read formulas. Formula access requires
both the permitted action and the permitted organisation/record scope. In-memory what-if
evaluation is distinct from explicitly saving a new version; the editor does not calculate
official results locally. Formula downloads are scoped and logged; lab label PDFs are in scope,
while regulatory-label generation/export and notification are deferred.

The detailed baseline is [mvp-scope.md](../.docs/02-design/mvp-scope.md); acceptance criteria
are in [backlog.md](../.docs/01-requirements/backlog.md).

## Retained Technology Stack

| Layer | Honney choice |
|---|---|
| Frontend | Next.js App Router + TypeScript |
| Backend / API | Go + Gin, REST |
| Database / access | PostgreSQL, sqlc + pgx |
| Packaging / CI | Docker, GitHub Actions |
| Intended verification | Go tests, Vitest, Playwright |
| Hosting candidate | Railway, subject to owner-IP/privacy/deployment approval |

Keep `src/frontend/` and `src/backend/` in this repository. The imported MVP's Vite/Mantine
and Python/FastAPI/SQLAlchemy choices are not adopted. Authentication/provider, file storage,
library versions and optional UI/chart/i18n packages remain engineering decisions recorded in
[tech-stack.md](../.docs/02-design/tech-stack.md).

## Boundaries and Readiness

Outside this MVP: client ordering/production approvals, external-client formula adjustment,
SaaS billing, evaluation panels, reference-data editing, offline synchronization/desktop
packaging, formula comparison, graphical provenance rendering, the full audit dashboard,
R2 regulatory labels/export/notification, R3–R6, AI mascot chat, notification bell and dark mode.
Deferring the audit dashboard does not defer the restricted log-query/export capability,
append-only evidence or privacy rights required with authentication.

Significant implementation needs a ready task with acceptance criteria, reviewed API/permission
contracts and resolved domain decisions. In particular, the owner/domain expert must validate
scientific models, Profile A/B definitions, uncertainty/tier methods, material-group/pair rules,
regulatory sources and thresholds, instrument tolerances/calibrations and pre-dilution methods.
Unresolved inputs produce `insufficient data`, not borrowed mock values. Legal texts,
controller/contact details, retention and approved infrastructure must be settled before real
users or confidential data are introduced. Sensitive personal-data features require explicit
owner approval and remain outside the MVP.

[rule.md](../.docs/03-compliance/rule.md) governs privacy, server authorization, logs,
agreement evidence and owner IP throughout delivery. The scope instruction approves this
direction; it does not approve production deployment or unresolved scientific/legal choices.

## Note on User Validation

Per the lecturer-confirmed exception on **2026-09-02**, the original problem and primary persona
are sourced from one real customer relationship rather than the course's usual ≥15-interview
panel. The new MVP direction is an explicit owner decision. Validation of its additional lab,
administration and onboarding journeys remains work to be done; no synthetic person or mock
test is presented as a real interview or production verification.
