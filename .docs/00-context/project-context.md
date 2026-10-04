# AI Perfumery Engine — Project Context

**Updated:** 2026-10-04. Background and historical context, not the authoritative requirements. The owner instructed this revision to use Honney's technology stack and the linked frontend repository's MVP. The current scope is in [mvp-scope.md](../02-design/mvp-scope.md); [backlog.md](../01-requirements/backlog.md) and [rule.md](../03-compliance/rule.md) control behavior.

# 1. Project Overview

AI Perfumery Engine is a student software-engineering project: a system for perfume formula design, evaluation, compliance information and practical laboratory preparation. It combines chemical/physical reference data, explainable calculations and a web interface. AI-assisted development does not imply a generative-AI feature in the product.

# 2. Product Concept and Decision History

| Date | Evidence/decision | Current interpretation |
|---|---|---|
| 2026-09-02 | Real interview with the primary stakeholder, a cosmetic-science student who formulates fragrance | Evidence for formula information overload, manual quantities, restrictions and checking before mixing |
| 2026-09-10 | Stakeholder described internal lab users and possible external clients, organisation-scoped data and technical documents | Historical input; not every proposed external/SaaS feature is part of the MVP |
| 2026-09-16 | Team chose internal formula viewing, two roles and no public signup/authoring | Superseded as current scope by the owner's 2026-10-04 instruction |
| 2026-10-04 | Owner chose Honney stack + MVP from `sattasarasadaw-crypto/ai-perfumery-engine-frontend` | Current scope direction: waves 0–5; scope approval does not approve a scientific model, legal text or infrastructure |

The imported source is pinned at `aa572abaede14c11796a1551434858171eb37363`. It contains handoff/wireframes, OpenAPI and synthetic mocks, but no working frontend. The current local source tree is also still placeholders.

# 3. Research Problem

The real 2026-09-02 interview identified four problems:

1. Too many ingredients, quantities, concentrations, properties and restrictions to track.
2. Manual calculation of weights, percentages and totals.
3. Complicated applicable-rule/limit checks that can be overlooked.
4. A need to evaluate a formula before physically mixing it.

Later account, admin, lab, document and tutorial features trace to the owner-selected MVP source, not additional invented interviews. Real interview files remain in their protected location; do not publish transcripts or portray synthetic users as participants.

# 4. Current Users

The imported MVP is for formulators, lab students and staff, with public visitors and pending account holders seeing only public/demo/own-account flows until granted domain access. The seven role identifiers are `formulator`, `data_curator`, `safety_assessor`, `org_admin`, `system_admin`, `approver`, `legal_reviewer`. Their current actions and record boundaries are defined in [roles-permissions.md](../02-design/roles-permissions.md); a role label does not put production approvals or reference-data editing into scope.

A domain expert supplies/verifies reference data and model/rule decisions. No new research participant or full external-client portal is assumed.

# 5. Domain Concepts

A material has source-linked physical/odour/regulatory properties. A formula has declared component quantities and immutable saved versions. Analysis pins formula/input/model/rule versions separately. A batch records laboratory preparation and measurements. Supplier documents are typed records associated with material/SKU/supplier/lot context as appropriate.

Synergy, masking and material groups are concepts, not invented rules: the supplied sample has no approved pair-rule/group definitions. Missing domain information remains `insufficient data`.

# 6. Calculation Engine

The pure Go engine takes a pinned snapshot and returns `Result[T]` with status, citations and missing inputs. Go orchestration performs I/O and version selection. The REST adapter exposes estimates with interval/tier/provenance, exact declared quantities, or a reasoned missing-data state. It must never fabricate uncertainty, tiers, interactions or thresholds. See [calculation-engine.md](../02-design/calculation-engine.md).

# 7. Formula Workflow

Create/open → enter vehicle/application and components → validate explicitly on server → save a new version or evaluate a transient trial → request analysis → review independent physics/compliance findings and complete provenance → prepare a batch when permitted. The browser does not calculate numerical previews. A trial evaluation does not silently become a persisted version.

# 8. Formula Viewing and Results

Display authorized formula inputs, quantities, analysis state, missing reasons, Profile A/B where supported, and separate formula/model freshness. All provenance nodes remain navigable as a list/tree even while a graphical provenance view is deferred. Old prototype assumptions are not domain approval.

# 9. Regulatory Information

Named IFRA/EU source data, effective version, category, conditions and restriction semantics govern compliance checks. A declaration threshold is not automatically a maximum concentration. Numerical/non-numerical restriction handling and hard blocks must be supported by approved evidence. The source's synthetic compliance fixtures are not regulatory advice.

# 10. Lecturer Deliverables

The main review artifacts remain proposal, backlog, design and compliance: [proposal](../../proposal/proposal.md), [backlog](../01-requirements/backlog.md), [design](../02-design/feature-list.md), [rules](../03-compliance/rule.md), [legal requirements](../03-compliance/legal-requirements.md). New scope/stack/contract documents connect these artifacts; working instructions/skills remain development aids.

# 11. Personal Data

Signup, profiles, role grants, formula creator/editor metadata and access logs contain personal data. Consent-before-write, purpose/retention metadata, own export/correction/erasure, backup purge and access restrictions follow rule.md. Public signup grants no formula access.

# 12. Sensitive Personal Data

Allergy, skin/patch-test, pregnancy and religion-revealing personal preferences remain out of scope without the owner's separate written plan. Supplier compliance documents are not automatically a person's religious preference. No sensitive personal value belongs in logs, exports or model prompts.

# 13. Security

Go verifies session → action → record/tenant on protected requests. Own-account rights remain available without a domain role. Admin actions require fresh re-authentication/reasons as applicable; no self-grant or client-supplied scope. Errors and public/cache/build paths do not expose private values.

# 14. Confidential IP

The real material dataset, source rules/thresholds/groups, saved formulas and proprietary calculation logic stay in approved infrastructure. Do not make them public, send them to unapproved APIs/AI/clouds or silently adopt a licence. Approved infrastructure and agreed ownership-header wording remain owner inputs where absent.

# 15. Access Logging

Authentication ships with append-only, tamper-evident metadata logs, retention at least 90 days, restricted queries/exports and logged reads. Account erasure retains the required minimum identity/log evidence and scheduled purge. A full audit dashboard may be deferred; mandatory log custody/query/backup controls cannot.

# 16. Agreements

Signup consent/terms and account/admin high-risk acts activate LR3. Record the identified actor, deliberate intent, exact text version/hash and server timestamp. High-risk re-authentication is not conditional on a production-approval screen existing. Production/IP-release approvals and certificate-authority features are not in this MVP.

# 17. Product AI

The current mascot provides static tips/FAQ and the tutorial uses synthetic content. No generative model or Ollama integration is selected. Any future model feature must be separately approved and may not invent scientific values or see owner IP without approval.

# 18. Core Availability

Core calculation and formula/lab work do not depend on an AI/model service. This is not a promise of fully disconnected operation: offline synchronization/desktop wrapping is deferred. Locally bundled visual assets are an MVP UI behavior, not a new runtime stack.

# 19. Delivery Waves

0 shell/public/i18n; 1 account/auth/admin; 2 formulas/analysis/provenance; 3 batches/weighing/PDFs; 4 compliance/documents; 5 opt-in tutorial/static helper. Privacy/logging obligations accompany the relevant feature. Scientific/domain readiness may gate a wave independently of UI preparation.

# 20. Document Hierarchy

Law/regulation → project rule.md → owner-directed approved scope and current backlog → design → implementation → this context → assumptions. A linked external handoff is a pinned input, not authority to override local privacy/IP constraints or adopt its stack.

# 21. AI-Native SDLC

Human scope/domain decisions → clear requirements → design → compliance check → Ready task → implementation → tests → review → human acceptance. Scope documentation and mocks do not replace scientific validation or deployment approval.

# 22. Human Decisions and AI Execution

Humans/domain owners decide scientific models, safety/regulatory interpretation, data-sharing approval and unresolved sensitive decisions. AI can edit documents, map requirements, implement Ready tasks and detect inconsistency within authorization. Routine engineering choices do not require re-asking an already authorized scope instruction.

# 23. Definition of Ready

A task needs clear problem/user/behavior, acceptance criteria, contract/design, action/record authorization, applicable rules, important edge cases and no unresolved domain/legal decision. Missing information is explicit; never turn an upstream PDC proposal or fixture into an approved rule.

# 24. Traceability

Interview/owner instruction → stable FR/NFR/CER/SEC/PRIV/IP/LR item → design/contract → implementation → meaningful tests. Source PDC/INV labels retain their upstream provenance only. Current requirement IDs and wave mapping live in the backlog/MVP scope; do not invent test evidence.

# 25. Current Product Direction

The main workflow now includes creation/versioning, analysis with honest uncertainty/provenance, lab preparation, compliance documents and complete account lifecycle. Public pages/tutorial are isolated from private system data. External-client adjustment, SaaS billing, panels, reference editing, production release and AI chat remain deferred.

# 26. Deployment and Offline Discussion

Use the retained Next.js/Go/PostgreSQL stack. Railway remains a candidate requiring written owner-IP approval and privacy-transfer documentation. No deployment, email/scanning provider or offline licence architecture is approved merely by this documentation revision.

# 27. References

The chosen frontend handoff is the scope source. Earlier fragrance-platform/UI references are historical inspiration only; do not copy their code/assets/content or infer chemistry from them. Source ownership and fixture disclaimers must be preserved.

# 28. Development Principle

Build a coherent, testable MVP by waves with explicit server-side scientific and security boundaries. Shared errors/result/number components help consistency. Package versions, optional component/chart/mock tools and migration/auth implementation choices remain unselected until checked.

# 29. Remaining Decisions

Auth/email/session/MFA policy; privacy/terms/controller/contact/retention inputs; scientific models, uncertainty/tier/calibration policies, units/density and measurement tolerances; categories/restriction conditions; storage/scanning; transient evaluation/export schema; print layouts; glossary/visual assets; infrastructure approvals. See backlog/design rather than assuming this list closes any decision.

# 30. Working Instructions

Read AGENTS.md and rule.md, identify the current requirement/design/contract, separate history from current scope, resolve or surface missing decisions, work on Ready tasks, test what was implemented and update traceability. Preserve other collaborators' edits and confidential locations.

# 31. Authority Reminder

The owner's 2026-10-04 instruction supersedes the old cycle scope, not law or data-protection/owner-IP guardrails. This context does not override backlog/rules/design. Use `insufficient information` for decisions and `insufficient data` for unsupported calculation outcomes.

# 32. Core Principle

Useful perfumery software requires supported calculations, explainable results, protected data and honest evidence. An MVP feature being selected is not proof that its model, source data, code, migration or tests exist.
