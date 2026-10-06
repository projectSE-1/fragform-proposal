<!-- AI Perfumery Engine project documentation; ownership follows the owner's existing agreement. No new licence is granted. -->
# MVP Scope Baseline

**Updated:** 2026-10-04. **Decision:** the project owner instructed this revision in the current chat: retain Honney's technology stack and adopt the linked frontend repository's MVP. This replaces the internal-view-only build-cycle decision of 2026-09-16. It approves the scope direction, not unverified chemistry, legal text, infrastructure, or a production deployment.

## Sources and boundaries

- Technology: [tech-stack.md](tech-stack.md), extracted from Honney `42ae528`'s architecture and `src/README.md`.
- MVP source: `sattasarasadaw-crypto/ai-perfumery-engine-frontend`, `main` commit `aa572abaede14c11796a1551434858171eb37363`; `docs/handoff/README.md`, `screens-mvp.md`, the eight `docs/wireframes/` files, and `api/openapi.yaml`. The source is a design/handoff with synthetic mocks, not a working frontend or validated engine.
- Rules: [../03-compliance/rule.md](../03-compliance/rule.md) retains existing privacy, logging, agreements and owner-IP controls, with selected frontend/workflow rules adapted to this stack.
- The frontend repository's React/Vite/Mantine, Python/FastAPI/SQLAlchemy, dependency versions, separate-repository policy, email vendor and local-AI choices are **not adopted**. Its internal PDC/INV/NFR references do not become approved local decisions.
- No upstream fixture value, toy model, confidence tier, regulatory threshold, session duration or weighing tolerance is an approved production value. Where its underlying source is absent, record `insufficient information` and keep the affected task gated.

## Delivery waves

| Wave | MVP work | Requirement IDs |
|---|---|---|
| 0 | Next.js shell, shared result/error components, TH/EN, responsive public pages, safe demo/mock boundary | FR-018; NFR-001, NFR-005–008 |
| 1 | Signup and email verification, login/MFA, pending access, own account, sessions/consent/rights, admin invitations and role changes | FR-001, FR-016, FR-017; PRIV-001–004; SEC-001–006; LR1–LR3 |
| 2 | Formula list/create/edit/version, vehicle/application inputs, analysis, Profile A/B, missing-data states, uncertainty and complete provenance as a list/tree | FR-002–007, FR-009–011, FR-015; CER-001–005 |
| 3 | Batch, mixing sheet, per-item weighing, instrument choice, reweigh, pre-dilution and lab PDFs | FR-008, FR-012, FR-013 |
| 4 | Compliance findings, hard blocks, document completeness/vault, typed upload and processing status | FR-005, FR-014 |
| 5 | Opt-in tutorial sandbox and static mascot tips/FAQ | FR-019, FR-020 |

Access logs, rights endpoints, consent evidence and the restricted log-query capability required by `rule.md` ship with authentication; the source's deferral of a full audit dashboard does not defer these controls.

## Stable functional IDs

Keep FR-001–FR-010 recognizable rather than silently reusing their IDs for unrelated features. Their behavior is extended by this scope revision.

| ID | Meaning |
|---|---|
| FR-001 | Account authentication lifecycle: signup, verification, login/MFA, reset, active tenant/context, logout |
| FR-002 | Authorized formula list |
| FR-003 | Formula detail/editor: inputs, quantities, groups only when supported, displayed results |
| FR-004 | Server-side quantities/proportions/totals; declared batch targets and unit conversions only with approved inputs |
| FR-005 | Versioned/category-aware compliance findings: pass, exceed, inconclusive; non-dismissable hard block where a sourced rule requires it |
| FR-006 | Explanations and complete provenance navigation |
| FR-007 | In-memory what-if evaluation distinct from explicit persisted formula versions |
| FR-008 | Authorized formula/lab downloads, scoped content and export logging |
| FR-009 | Odour/profile charts, including Profile A/B views where supported |
| FR-010 | Time-dependent evaporation/evolution charts under an approved model |
| FR-011 | Create a formula, validate and explicitly save immutable versions |
| FR-012 | Create/view batches, target quantities, mixing sheet and label PDF |
| FR-013 | Per-item weighing/instrument selection, precision warnings/blocks, reweigh and pre-dilution |
| FR-014 | Document vault/completeness, typed upload, authorized document access and processing states |
| FR-015 | Browse reference materials, vehicles, categories, SKUs/lots and instruments; no reference-data editor |
| FR-016 | Admin users, invitations, pending-access decisions, fixed role grants/revocation and mandatory step-up/reasons |
| FR-017 | Own profile, credentials/MFA, sessions, preferences, consent, data export/correction/erasure |
| FR-018 | Public overview/how-to/FAQ and versioned legal pages; no system data |
| FR-019 | Opt-in Q0–Q6 tutorial sandbox; only tutorial progress may write to the own-account service |
| FR-020 | Static mascot tips and FAQ search; dismissible and never covering a block/error/MFA flow |

## What stays outside this MVP

Offline synchronization and desktop wrapping; reference-data cell editing (import and version activation are FR-021); formula comparison R1-S6; a graphical provenance editor/view (all underlying provenance remains available as a list/tree); R2 regulatory label/export/notification S4–S6 (lab PDFs in wave 3 remain in scope); the full X4-S6 audit dashboard; R3–R6; client ordering/production approvals; external-client formula adjustment and SaaS billing; evaluation panels; AI mascot chat; notification bell; production dark mode.

Owner-requested prototype addition, 2026-10-04: a light/dark appearance switch is available in the standalone synthetic demo. Production dark mode remains deferred; see [prototype status](prototype/prototype.md).

Public signup creates a pending account, not access to confidential formulas. The seven role identifiers in the source contract are used for the lab access model, not a public client portal. The complete action/record mapping belongs in [roles-permissions.md](roles-permissions.md).

## Readiness and evidence

The MVP describes intended behavior. `src/` still contains placeholders; neither copied contracts nor mock success count as implementation or tests. Tasks need their acceptance criteria, server contract, permission/record checks, applicable rules and resolved domain decisions before significant implementation. Package versions and optional UI/chart/i18n/mock libraries remain unselected until checked for this stack.

The local backlog is the acceptance baseline; diagrams, engine, data model, journeys and prototype must refer to it. Historical interview evidence stays historical: newly added features trace to the 2026-10-04 owner instruction and the pinned source, not to fabricated interview answers.
