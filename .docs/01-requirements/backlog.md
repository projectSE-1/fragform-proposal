<!-- AI Perfumery Engine project documentation; ownership follows the owner's existing agreement. No new licence is granted. -->
# AI Perfumery Engine — Product Backlog & Specification

**Updated:** 2026-10-04

**Status:** Owner-directed MVP baseline. The scope direction is authorised; unresolved scientific,
legal, infrastructure and implementation decisions remain gated. No item below is declared implemented.

**Historical research:** real stakeholder interview on 2026-09-02, under the lecturer's
single-customer exception to the usual ≥15-interview requirement.

**Current scope decision:** the owner instructed this revision on 2026-10-04: use Honney's
technology stack and the linked frontend repository's MVP, adapting its useful workflow rules
without replacing local compliance or owner-IP controls.

## 0. Baseline and Prioritised Summary

[mvp-scope.md](../02-design/mvp-scope.md) defines the imported waves and stable functional IDs.
[tech-stack.md](../02-design/tech-stack.md) retains Next.js App Router/TypeScript, Go/Gin,
PostgreSQL, sqlc/pgx, REST, Docker, GitHub Actions and the intended Go/Vitest/Playwright checks.
The frontend source's Vite/Mantine and Python/FastAPI/SQLAlchemy stack is not adopted.

**Pinned source:** [frontend handoff](https://github.com/sattasarasadaw-crypto/ai-perfumery-engine-frontend/blob/aa572abaede14c11796a1551434858171eb37363/docs/handoff/README.md),
[screens MVP](https://github.com/sattasarasadaw-crypto/ai-perfumery-engine-frontend/blob/aa572abaede14c11796a1551434858171eb37363/docs/handoff/screens-mvp.md),
eight source wireframes and its API contract at
`aa572abaede14c11796a1551434858171eb37363`. These are design/mock references, not proof of
implemented behavior. Source PDC/INV/NFR references are not local approvals; unavailable
underlying decisions are recorded as `insufficient information`.

Authority: law/regulation → [rule.md](../03-compliance/rule.md) → this backlog → local design →
existing implementation → contextual notes. Historical scope decisions from September remain
history; the 2026-10-04 direction supersedes their view-only/no-signup/two-role restrictions.

| ID | Requirement | Priority / wave |
|---|---|---|
| FR-001 | Account authentication lifecycle: signup/verification/login/MFA/reset/context/logout | Must · 1 |
| FR-002 | Authorised formula list | Must · 2 |
| FR-003 | Formula detail/editor and supported material information | Must · 2 |
| FR-004 | Server-side quantities, proportions, totals and supported conversions | Must · 2–3 |
| FR-005 | Category/version-aware compliance findings and sourced hard blocks | Must · 2, 4 |
| FR-006 | Explanations and complete provenance list/tree | Must · 2 |
| FR-007 | In-memory what-if evaluation, separate from saving | Must · 2 |
| FR-008 | Scoped formula/lab downloads and export logging | Must · 3 |
| FR-009 | Odour/profile charts, including supported Profile A/B | Must · 2; domain-gated |
| FR-010 | Time-dependent evaporation/evolution charts | Must · 2; domain-gated |
| FR-011 | Formula creation, validation and immutable versions | Must · 2 |
| FR-012 | Batch creation/view, mixing sheet and lab label PDF | Must · 3 |
| FR-013 | Per-item instrument/weighing, reweigh and pre-dilution | Must · 3; domain-gated |
| FR-014 | Document vault/completeness, typed upload and processing status | Must · 4 |
| FR-015 | Read-only reference browsing/search | Must · 2–4 |
| FR-016 | Admin invitations, pending access, fixed roles and required log query | Must · 1 |
| FR-017 | Own profile, MFA, sessions, preferences, consent and data rights | Must · 1 |
| FR-018 | Public overview/how-to/FAQ and versioned legal pages | Must · 0–1 |
| FR-019 | Opt-in Q0–Q6 tutorial sandbox and own progress | Must · 5 |
| FR-020 | Dismissible static mascot tips and FAQ search | Must · 5 |
| NFR-001 | Connected formula comprehension | Should · 2 |
| NFR-002 | In-place evaluation feedback without reload/save gate | Should · 2 |
| NFR-003 | Pending signup does not grant lab access | Must · 1 |
| NFR-004 | Core workflow independent of any AI/model service | Must · all |
| NFR-005 | Thai/English, accessibility and reduced motion | Must · 0–5 |
| NFR-006 | Four UI states, responsive layout and safe errors | Must · 0–5 |
| NFR-007 | Contract-driven numbers, freshness and cache boundaries | Must · all |
| NFR-008 | Tutorial/demo isolation from real records | Must · 0, 5 |
| CER-001–003 | Explainability; insufficient data; deterministic server engine | Must · 2–4 |
| CER-004 | Quantified uncertainty/error budget and distinct freshness indicators | Must · 2; domain-gated |
| CER-005 | Complete provenance and explicit analysis inputs/Profile A/B | Must · 2; domain-gated |
| SEC-001–006 | Server/record/tenant checks, safe content/logs/sessions, admin/upload safeguards | Must · all |
| PRIV-001–004 | Prior consent, own rights, minimisation, sensitive-data guardrail | Must · 1 |
| IP-001–004 | Approved infrastructure, no public exposure, scoped export, external-service approval | Must · all |
| LR1 / LR2 / LR3 / LR5 | Local privacy / retained logs / agreement evidence / owner IP | Must · with the affected feature |
| LR4 | Explainability, missing-data handling, feedback and model-independent core | Should as legal mapping; CER/core controls remain mandatory |

FR-008–010 are now deliverables of the adopted MVP, rather than optional additions to a
view-only cycle. Their inclusion does not resolve domain or output-format decisions.

## 1. Problem, Users and Evidence

The original problem is manual formula comprehension, calculation and restriction checking
before physical mixing. The real interview supports the **Formulator** persona and these four
pain points; newly imported capabilities have a different, explicitly recorded source.

| Historical pain point, 2026-09-02 | Requirements preserving that outcome |
|---|---|
| Many ingredients, quantities and restrictions to track | FR-003, NFR-001 |
| Manual weights/percentages/totals and correctness checks | FR-004, CER-001 |
| Complicated applicability/limit checks | FR-005, FR-006, CER-001–002 |
| Evaluate before spending real material | FR-007, NFR-002 |

Additional MVP users are lab personnel/students, authorised document/reference reviewers,
organisation administrators and visitors/pending account holders. These trace to the owner's
2026-10-04 scope instruction and pinned source, not invented interview findings. A supplied
sample of 10 materials/34 fields and intended 100-material dataset remain historical input;
[dataset-structure.md](../00-context/dataset-structure.md) documents structure without values.

The fixed role identifiers are `formulator`, `data_curator`, `approver`,
`safety_assessor`, `legal_reviewer`, `org_admin`, `system_admin`. Their names do not grant
every conceivable capability: the local action/record map is in
[roles-permissions.md](../02-design/roles-permissions.md). Reference-data editing, safety
sign-off, production release and an external-client portal remain outside this MVP.

## 2. Scope, Delivery and Common Acceptance Rules

Waves 0–5 follow [mvp-scope.md](../02-design/mvp-scope.md). Consent, own-data rights,
append-only access logging, restricted log query/export and agreement evidence ship with
authentication. The source's deferral of a full audit dashboard cannot defer those local rules.

Every data-bearing page supports **loading, success, empty and error**. Empty results are
distinct from missing evidence; a missing scientific value uses a reasoned missing-data state.
For a static public page, verify loading/config failure, available content, no matching FAQ
content and safe content-load failure as applicable. The detailed flows below include their
own validation, permission, stale-version, hard-block and pending-account states.

Common acceptance criteria apply to every FR:

- **AC-C1 — authorisation:** Go verifies session, permitted action and permitted record/active
  organisation on every system read/write/export. A route/menu check alone is insufficient.
  Own-account endpoints never return somebody else's account. A pending user has no system-data
  access but retains own-account/help/tutorial access.
- **AC-C2 — safe failure:** 401 requires login; 403 gives a safe permission message; 409 identifies
  a conflict/stale state; 422 identifies allowed field errors; 5xx/timeout gives a safe message
  and reference code. No SQL, stack trace, secrets or sensitive values appear. Failed requests
  do not leave old output labelled as current success.
- **AC-C3 — server authority:** the frontend accepts/formats declared input and displays server
  results; it never computes a reportable number, normalises a formula, supplies a hidden
  scientific default, rounds beyond server instructions or decides a verdict itself.
- **AC-C4 — evidence:** the relevant actions produce metadata-only access records; official
  computed results cite versioned inputs/rules/sources. Unavailable data has a reason, never zero
  or a guessed pass.
- **AC-C5 — UI verification:** Thai/English preserve numerical value/precision, keyboard access,
  labelled inputs/statuses and reduced motion. Verify 1366×768, 390×844 and 360×800; no whole-page
  horizontal scrolling. A wide table may have its own labelled scrolling region.
- **AC-C6 — readiness:** a mock can demonstrate presentation only. Before implementation each
  task needs its reviewed Go API contract, business/domain decisions, permissions, applicable
  rules and meaningful verification. Scientific/policy gaps remain blocked at the affected
  task, rather than silently becoming source defaults.

The draft REST contract and local privacy/log/export extensions are documented in
[api-contract.md](../02-design/api-contract.md); no endpoint here is a claim of an implemented API.

## 3. Functional Requirements

### FR-001 — Account Authentication Lifecycle

**User/problem:** visitors need an account; lab users need verified identity without giving a
public signup access to confidential data.

**Behavior/flow:** public signup captures minimal fields and separate unticked legal acceptance
controls → email verification → login → required MFA setup/verification → any pending legal
acceptance → server-approved organisation/role context → lab home or pending-access page.
Forgot/reset password, one-time expiring invitation/verification links, logout and session expiry
are part of the lifecycle. Provider, password policy and timeout values remain engineering gates.

**Acceptance:**
- Signup/resend/reset/login replies do not reveal whether an email account exists; tokens are
  single-use, expiring and absent from logs. Disabled signup/email delivery has a clear state.
- Signup never auto-grants roles. No-role login reaches only pending access, own account,
  public help and synthetic tutorial; direct lab requests are denied.
- `safety_assessor`, `legal_reviewer`, `approver`, `org_admin` and `system_admin`
  cannot skip required MFA. Recovery codes are displayed once and safely stored server-side.
- The server sets/verifies active organisation/role from authorised memberships; the shell shows
  it persistently. Expiry/logout revokes access and clears confidential cached views.
- Prior consent/evidence, rights endpoints and logs are delivered in wave 1, not postponed.

**Trace:** original login FR; source X1/ACC; 2026-10-04 owner direction; LR1–LR3, SEC-004.

### FR-002 — Authorised Formula List

**User/problem:** a formulator needs to find a formula without receiving records outside the
permitted organisation/record set.

**Behavior/flow:** authenticate/context → request the authorised formula list → filter/search
minimal metadata → select a formula or explicitly start a new one.

**Acceptance:**
- Name/id/version/minimal modification metadata identify entries; the list is not a material or
  rule-table dump. Only authorised records are returned by Go.
- Forged organisation/owner/query parameters do not expand access.
- Loading, no formulas, no filter matches and API failure are distinct; empty state can offer
  creation only where FR-011 permission exists.
- Direct requests for an unauthorised formula disclose no confidential details.

**Trace:** original list FR; source R1-S2; SEC-001/005.

### FR-003 — Formula Detail/Editor

**User/problem:** preserve the interview's single connected view of ingredients, quantities,
restrictions and explanation while allowing the adopted creation/editing workflow.

**Behavior/flow:** open an authorised immutable version or new draft → choose supported
vehicle/application/product-category inputs → edit declared material/SKU amounts → request
server validation/evaluation → view quantities and findings in the same workspace.

**Acceptance:**
- All components, declared inputs and available server values are accessible together; groups,
  grades and restrictions appear only if supported by source evidence.
- Missing groups/rules/grades/data are identified. A system-default grade is explicitly flagged;
  it is not silently represented as a verified supplier grade.
- Input editing itself performs no official calculation or numerical preview. Analysis and
  transient what-if results are separate, labelled server requests (FR-007/011).
- An unsupported vehicle shows the server's scope reason and prevents unsupported analysis.
  Required application inputs have no silent default.
- New-formula empty state, load failure, validation errors and lost access are handled without
  displaying another formula's cached output.

**Trace:** interview pain point 1; source R1-S1/S2; CER-002.

### FR-004 — Automatic Quantities, Proportions and Totals

**User/problem:** replace manual maths while making totals and conversions verifiable.

**Behavior/flow:** submit declared decimal-text amounts/percentages/target batch quantity →
Go validates the selected basis and totals → the deterministic engine computes supported
quantities/conversions → return values, precision instructions and evidence.

**Acceptance:**
- Weights/proportions/totals come from Go; percentages entered by the user remain declared
  inputs. The UI does not recompute or silently normalise them.
- A percentage-based formula is rejected if its server-validated mass proportions do not sum
  to 100%; missing/excess amount comes from the server. Numeric representation/tolerance must
  be explicitly reviewed before implementation.
- Batch discrepancy checks compare against an explicitly declared target/basis, not an
  invented expected total. A missing target is identified where required.
- Volume conversion needs applicable density, conditions and uncertainty; drops need actual
  calibration for the material/dropper pair. Missing evidence prevents that conversion.
  No universal density/drop rate or copied wireframe equation is adopted as an approved rule.

**Trace:** interview pain point 2; source R1 validation/J15 unit bridge; CER-001–003.

### FR-005 — Compliance Findings and Sourced Hard Blocks

**User/problem:** identify applicable restrictions without converting missing evidence into a pass.

**Behavior/flow:** evaluate the version/category/finished-product dilution → display separate
EU/TH/ASEAN/US sections → expand each finding/citation → follow missing evidence to the vault or
correct the formula. Category changes create a new version under FR-011.

**Acceptance:**
- Each applicable numeric finding is pass, exceed or inconclusive according to its reviewed
  sourced decision rule. A confidence interval crossing a limit is not classified solely
  from its central value. Missing/unsupported jurisdiction rules show missing evidence.
- Missing category, required dilution, threshold, regulation version or citation gives
  `insufficient data`/`data_missing` and identifies the missing input. Dilution is never
  assumed to be 100%.
- Jurisdictions remain separate; no combined “all compliant” claim. Each finding names the
  regulation/version and distinguishes concentrate from finished-product values.
- A sourced hard block has no dismiss/override/acknowledge-to-continue action; Go also blocks
  the affected save/analysis/next-step action. Blocking scope must be defined by a reviewed rule.
  Missing rules alone must not be invented as a prohibition.
- The approved, versioned disclaimer comes from the result/document data and remains visible.
  Any near-limit band, nonnumeric restriction mapping or market exception stays domain-gated.

**Trace:** interview pain point 3; source R2-S1; rules 58–61; CER-001/002/004.

### FR-006 — Explanation and Complete Provenance

**User/problem:** answer “why this value/finding?” without a dead-end explanation.

**Behavior/flow:** select a result/finding → open its error budget/evidence → walk every relevant
provenance node as a list/tree → reach the original rule/threshold/document locator → return
to the prior workspace position.

**Acceptance:**
- Every result identifies its input/record versions, applicable rules/thresholds, units/method
  and source locator; a missing field is labelled rather than invented.
- The provenance shown belongs to the selected result. Shared nodes may be referenced, but no
  underlying node is omitted because graphical rendering is deferred.
- Every reportable value's error-budget entry leads onward to the complete provenance.
- References/documents receive the same record-level access check as the formula; plain-text
  excerpts and safe external links do not execute uploaded/user content.

**Trace:** interview pain point 3; source R1-S5; rule 58; CER-001/005.

### FR-007 — In-Memory What-If Evaluation

**User/problem:** evaluate a change before physical mixing without accidentally saving it.

**Behavior/flow:** open an authorised formula → make a labelled trial copy in memory →
explicitly evaluate trial inputs through Go → show current server results in place →
discard, continue the trial or explicitly save a new version via FR-011.

**Acceptance:**
- Trial evaluation does not require reload or persistence; the stored version stays unchanged
  until explicit save. The formula editor itself does not calculate/preview results locally.
- A permitted analysis action is required even for a trial; viewing alone does not silently
  grant evaluation/write access. Go applies the same scientific and compliance checks.
- Loading/progress is visible; invalid/missing inputs show their reasons, and failed evaluation
  never shows the prior run as the successful result of new trial inputs.
- New-version save requires separate write permission and normal validation; discarded trials
  create neither a formula version nor an unlabelled cached official result.

**Trace:** interview pain point 4; original what-if FR, adapted to source R1's server-only editor;
2026-10-04 direction. This resolves the former what-if save ambiguity.

### FR-008 — Authorised Formula/Lab Downloads

**User/problem:** take the relevant displayed formula or lab sheet to the bench safely.

**Behavior/flow:** choose the authorised formula/version or batch/print layout → Go checks
record and download scope → generate the declared fixed output → log metadata → return file.

**Acceptance:**
- Formula export contains only the selected authorised formula's displayed inputs, values,
  findings and citations, with version/context and trial label if applicable. It never includes
  underlying dataset/rule tables or another formula.
- Mixing sheet/lab label PDFs can be viewed/printed in Thai/English; lab QR refers to an
  authorised batch/sample identifier and conveys no confidential payload.
- Passwords, MFA credentials, sensitive personal data and unrelated signer/profile data are
  absent. Each download is logged as metadata, including denied attempts where applicable.
- Stale/blocked/insufficient results retain their labels and restrictions; a lab download is not
  a regulatory certificate or production approval. R2 regulatory report/label/notification
  exports remain deferred.
- Formula format, lab label layout and QR schema require review; no format is silently chosen
  by importing the source's mock handlers.

**Trace:** original export FR; source LAB; LR2/LR5, SEC-002, IP-003.

### FR-009 — Odour/Profile Charts

**Behavior/flow:** open a completed authorised analysis → show supported odour/profile data →
default to Profile A/B side-by-side where the approved model supports both → inspect sources.

**Acceptance:**
- Every plotted reportable value carries supported uncertainty/tier and provenance. Missing
  data is visibly missing, not a zero wedge/point or a guessed family.
- Profile A/B labels/meaning and material-group aggregation require domain approval; the
  source's tier/proxy assumptions do not approve a local prediction method.
- Physical/perceptual charts and regulatory findings are separate sections.
- Empty/unquantified/stale/error states do not resemble a successful chart.

**Trace:** original 2026-09-10 chart direction; source R1-S4; owner direction; CER-004/005.

### FR-010 — Evaporation/Evolution Over Time

**Behavior/flow:** request approved time-dependent analysis → show supplied per-profile/material
curves and uncertainty bands → change the displayed time range → inspect evidence.

**Acceptance:**
- Every reportable curve has its uncertainty band and units; Profile A/B starts side-by-side
  where supported. The UI neither extrapolates nor computes a new physical curve.
- Unsupported range/model/vehicle and missing coefficients return a reasoned missing state.
- Formula version, model/rule/data versions and applicable seed accompany the analysis;
  input-change and model-change indicators are separate.
- Changing display range cannot silently change the model, seed, input version or data source.

**Trace:** original 2026-09-10 curve direction; source R1-S3/S4; CER-002–005.

### FR-011 — Create, Validate and Save Immutable Formula Versions

**Behavior/flow:** create new draft or edit an authorised version → select materials/SKUs and
required context → submit decimal-text inputs → validate totals/source hard blocks →
explicitly save → return a new immutable version → run analysis for that version.

**Acceptance:**
- Starting an empty **unsaved draft** is in scope. First persistence creates immutable version 1
  only after required inputs and the exact 100% total pass server validation. It never depends
  on direct database insertion to make
  ordinary user formulas available.
- Go refuses invalid proportions/inputs and sourced blocking violations; no auto-normalisation.
- Saving creates a new immutable version, retaining prior inputs/results and editor/time
  metadata within privacy/logging rules. Trial evaluation is not automatically persisted.
- A stale base version returns a conflict with a safe reload/review action rather than
  overwriting somebody else's work; version deletion/production approval are out of scope.
- Analysis displays real queued/running/completed/failed/unquantified steps from the server.
  Cache reuse requires matching authorised input, model/rule/data/context versions.

**Trace:** source R1-S2/S3; owner direction. Resolves former formula-creation/version gaps.

### FR-012 — Batches, Mixing Sheet and Lab Label

**Behavior/flow:** select an authorised immutable formula version → declare target quantity/unit
and available lots → create batch → request mixing sheet → select reviewed lab print layout.

**Acceptance:**
- Batch references the exact formula version/context and per-component lot/targets; subsequent
  formula edits do not rewrite an existing batch's intended inputs.
- Targets/conversions come from Go with their basis/source/precision. Missing lot/density/
  calibration/target information is explicit and prevents unsupported conversion.
- Batch list/detail respect organisation and record permission checks; empty batches/lists and
  failed generation have distinct UI states.
- Mixing sheet and lab-label PDFs identify the selected batch/version and actual server state;
  they do not imply safety certification or production release.

**Trace:** source LAB/J15/X3; FR-004/008, LR2, IP-003.

### FR-013 — Per-Item Weighing, Reweigh and Pre-Dilution

**Behavior/flow:** open batch component → explicitly choose instrument and dosing unit →
enter decimal-text actual measurement → Go records and validates precision/calibration →
display sourced pass/WARN/BLOCK → if permitted record a new reweigh or pre-dilution event.

**Acceptance:**
- Each component requires explicit instrument selection. Suggestions are not preselected.
  Expired calibration cannot be used; input precision comes from the selected instrument.
- Actual measurements are retained even when the reviewed rule returns BLOCK. BLOCK prevents
  the next affected lab step and has no role-based bypass; WARN remains visible.
- Existing measurements are immutable. Reweigh creates a linked new record with reason;
  prior records remain visible as superseded, not erased.
- Pre-dilution requires explicit user-confirmed inputs, validated method and preserved evidence;
  it does not silently guess a ratio. Unsupported capability is shown as unavailable.
- Numerical uncertainty thresholds, supported dosing methods and pre-dilution calculations must
  be validated locally before implementation; source demonstration percentages are not adopted.

**Trace:** source X3/J15; owner direction; CER-001–004, SEC-006.

### FR-014 — Document Vault, Completeness and Typed Upload

**Behavior/flow:** open missing evidence from formula/SKU/lot → list authorised document versions
and completeness → choose document type/subject → upload → display queued/scanning/parsing/
done/rejected state → view authorised evidence/re-evaluate only when reviewed data is available.

**Acceptance:**
- COA/GC-MS/chiral-GC documents bind to a lot; SDS/TDS/IFRA CoC/allergen documents bind to a SKU.
  Both UI and Go reject the wrong subject/type. Allowed file sizes/formats remain configured.
- New SDS/document versions remain alongside the older version; upload does not overwrite
  scientific values or make parsed claims authoritative automatically.
- Completeness is a server-provided evidence/risk indicator, not a new independent approval gate.
  Missing required sources still affect actual findings under FR-005.
- File rejection/scan failure has a safe explanation; extracted text/excerpts render as plain
  text, never raw HTML. Downloads/locators are authorised and access logged.
- Storage/scanning/parser choice, reviewer confirmation and approved document retention must be
  settled before handling confidential files; no upstream cloud service is implicitly approved.

**Trace:** source R2-S2/S3; rules 0.1/17–20/28/58; SEC-005/006, IP-004.

### FR-015 — Read-Only Reference Browsing

**Behavior/flow:** request authorised materials/vehicles/categories/SKUs/lots/instruments →
search/filter → select a reference for a formula, batch or evidence link.

**Acceptance:**
- Server returns only permitted reference data, scoped by record/organisation where applicable;
  pending users cannot browse the confidential reference dataset.
- Unsupported vehicle, unknown grade, absent lot/calibration and missing source records are
  labelled; no guessed substitute becomes an approved input.
- No reference-data edit/import/delete action is included in this MVP.
- Reference list loading/empty/search-empty/error states are verified; the UI does not place the
  real dataset in public builds, fixtures or shared caches.

**Trace:** source R1/LAB/R2 lookup operations; IP-001–004.

### FR-016 — Administration, Pending Access and Restricted Log Query

**Behavior/flow:** authorised administrator selects active organisation → filters users/pending
accounts → invites or opens a user → reviews permitted fixed roles/status → states reason →
performs required MFA step-up → Go applies and logs change. Authorised log custodian can query
actor/action/date range and export permitted log metadata.

**Acceptance:**
- Role options are the seven fixed identifiers; grants are limited by the local permission map.
  Go denies self-grant and unauthorised cross-organisation operations.
- Grant/revoke/deactivate/reject operations require a reason and valid MFA step-up; removing the
  final role warns that system access will cease. Expired step-up prompts verification again.
- Invitations/password-reset links let the account holder set their own password; administrators
  never receive/issue a readable temporary password. Pending accounts receive no automatic role.
- Admin reads of another user's personal data record who/whose data/when/why. System-admin
  cross-organisation access is explicit, reasoned and logged, never an always-open aggregate.
- Restricted log query/export is read-only and itself logged; it ships with authentication.
  The full source X4-S6 audit dashboard remains deferred, not the local minimum capability.
- Invitation persistence/consent and initial privileged-account provisioning require reviewed
  design; missing role-to-action detail is denied until specified.

**Trace:** source X4/X6; local rules 21–22/26–40/47; SEC-003/006.

### FR-017 — Own Account and Data Rights

**Behavior/flow:** any authenticated account holder, including pending users, opens their own
profile/security/sessions/preferences/privacy → updates allowed fields/verifies credentials →
views consent versions → exports/corrects/erases own personal data through local rights services.

**Acceptance:**
- Own-account access requires no lab role and returns only that account's information.
  Profile/organisation-role labels do not offer self-assignment.
- Password reset/change invalidates other sessions; email change is verified. Required MFA
  cannot be disabled; recovery regeneration/sensitive credential actions require verification.
- Device/session summaries avoid full IP disclosure in normal account UI; users can revoke own
  sessions. Session warning timing comes from server configuration.
- `GET /me/data`, `PATCH /me`, `DELETE /me` provide real rights workflows with wave 1.
  A source deletion-request-only/manual-email flow does not satisfy erasure.
- Erasure cascades to affected personal/derived rows, records backup purge and retains only
  required evidence/identity for approved retention. Notice explains exceptions; consent
  withdrawal stops the affected purpose within the local rule's required time.
- Consent history is immutable/versioned; acceptance controls remain unticked. A changed notice
  cannot silently replace previous evidence.

**Trace:** source ACC/X6, extended by local rules 1–25/30/41–53; PRIV-001–004, LR1–LR3.

### FR-018 — Public Overview, How-To, FAQ and Legal Pages

**Behavior/flow:** visitor reads overview/capabilities/help/FAQ/legal → selects language →
chooses signup/login. Legal pages serve the exact versioned texts accepted by account controls.

**Acceptance:**
- No real formulas, dataset/rules, user data or computed output is returned or embedded on public
  pages; original/authorised assets and clearly labelled synthetic illustrations only.
- No “100% accurate”, safety-certification or unsupported regulatory claim is made. Unsupported
  scientific/model scope is explained accurately after domain review.
- Terms/privacy pages display version and draft status where applicable; unresolved controller,
  contact/retention/transfer information keeps real-user signup gated.
- Static content/help is Thai/English, readable responsively and respects reduced motion;
  no remote font/widget/service is implicitly approved.

**Trace:** source PUB/X7; LR1/LR5, IP-002.

### FR-019 — Opt-In Tutorial Sandbox Q0–Q6

**Behavior/flow:** offer tutorial once → user starts/later/skips → mission centre →
synthetic sandbox steps → finish/skip/restart at any point → save own tutorial progress.

**Acceptance:**
- Never starts without opt-in; each step/all missions can be skipped and reopened from help.
  Q0–Q5 are available to pending users; Q6 administration practice is available only to the
  relevant authorised administrator. Other mission availability follows reviewed tutorial design.
- Every sandbox page shows “โหมดสอน — ข้อมูลสาธิต / Tutorial — synthetic data”.
  It sends no real formula/reference/lab/admin read or write request.
- Only own tutorial-progress writes occur inside the sandbox; account preference changes are
  handled in FR-017/020. A browser request-boundary test proves this isolation.
- Sandbox uses shared status/error/block components but cannot override them in real work.
  Points/badges stay in tutorial; no leaderboard/streak or actual laboratory gamification.
- Reviewed mission text does not certify toy numbers/models. Tutorial never overlays MFA,
  a hard block, weighing BLOCK or error state.

**Trace:** source TUT/X7; owner direction; NFR-008.

### FR-020 — Static Mascot Tips and FAQ Search

**Behavior/flow:** user opens a route-specific tip or searches approved static FAQ →
dismisses one/all tips → can reopen via help/preferences or start the related tutorial.

**Acceptance:**
- Tips/FAQ are reviewed static content in both languages; no LLM/API chat or generated scientific
  advice is included. The mascot never supplies/changes a calculation result.
- Dismissal preferences belong to the user's own account; synthetic practice stays separate
  from real records. A search with no matches has an explicit empty state.
- The control does not cover main actions, MFA, hard blocks, weighing BLOCK or errors.
  Animation respects reduced motion.
- Placeholder or final assets require clear ownership/licensing; source's UI kit is not implied.

**Trace:** source TUT/X7; owner direction; NFR-005/008, IP-004.

## 4. Non-Functional Requirements

| ID | Requirement and verifiable acceptance |
|---|---|
| NFR-001 | Connected formula comprehension: materials, available server quantities and findings are readable without opening one page per material; detail/provenance may expand on demand. Verify the original interview workflow with representative authorised synthetic records. |
| NFR-002 | Trial evaluation gives visible pending/progress and updates results in place without reload or save. No numeric latency SLA was supplied; establish it on representative workloads before claiming “instant”. |
| NFR-003 | Public self-signup creates pending identity only; lab routes/data require approved roles/action/record scope. Test a valid pending session as well as an unauthenticated request. |
| NFR-004 | Browse/author/version/basic calculation and applicable rule checks work without an optional AI service. No generative model is a dependency of this MVP; unsupported scientific outputs stay unavailable rather than guessed. This does not promise offline network operation. |
| NFR-005 | Complete TH/EN strings preserve numeric values/precision; keyboard/focus/labels and non-colour status cues work; reduced motion disables decorative animation. Scientific glossary needs domain review. |
| NFR-006 | Four UI states plus relevant pending/conflict/block/missing states; responsive widths in AC-C5; safe error reference and a retry/review route. Verify allowed and denied API states, not only mock success. |
| NFR-007 | Reported values/missing values/declared quantities stay distinct; decimal input is text; server controls numerical display/verdicts. Separate formula/model freshness. Cache keys include authorised tenant/record/version/context; clear on logout/context switch/denial and keep confidential responses out of shared/public caches. |
| NFR-008 | Clearly labelled synthetic fixtures/tutorials, development mocks excluded from production, no real system API requests in tutorial, own progress/preferences isolated. No owner data in screenshots/public examples. |

## 5. Calculation Engine Requirements

| ID | Requirement and acceptance |
|---|---|
| CER-001 | Every computed value/finding traces to versioned source inputs, rules/thresholds, units and methods; explanation includes complete accessible provenance. No unexplained score or source-free safety claim. |
| CER-002 | Absent/unverified data, model, group/pair rule, required input or citation produces `insufficient data` with its reason; no guessed interaction, substitute, zero or pass. Independent supported stages may continue without hiding missing stages. |
| CER-003 | Go runs the deterministic calculation/validation core with no external AI dependency; identical approved inputs and rule/model/data/context versions produce reproducible output. Where an approved uncertainty model samples, record its seed/version and make a given seed reproducible. |
| CER-004 | Reportable predictions/measurements have a validated interval/uncertainty, tier, units, display precision and result-specific error budget; declared input/target quantities remain distinguishable. A result whose required uncertainty cannot be quantified is explicitly unquantified. Model-change and input-change freshness are separate; do not fabricate confidence intervals to satisfy UI. |
| CER-005 | Profile A/B and vehicle/application scope require explicit model/input definitions; full provenance is reachable as a list/tree even while graphical rendering is deferred. Record seed when applicable, domain/limitations and all relevant model/rule/data versions. |

The approved pipeline/result contract and scientific decision gates live in
[calculation-engine.md](../02-design/calculation-engine.md). Imported toy models, fixture
thresholds, tier categories and source-local module/PDC names are not validated scientific rules.

## 6. Legal Requirements

[rule.md](../03-compliance/rule.md) is the authoritative project control baseline;
[legal-requirements.md](../03-compliance/legal-requirements.md) traces the Week 2 research.
These entries require compliance implementation/verification; they do not assert new legal advice.

| ID | Requirement and acceptance |
|---|---|
| LR1 | Prior consent/purpose/minimisation and real own-data rights with login. Reject personal-data writes that lack required evidence; erasure covers derived data/backups while documenting lawful retention exceptions. No sensitive-data feature without written owner plan. |
| LR2 | Durable append-only, tamper-evident metadata log from the first auth increment, covering identity/permissions/formula CRUD/calculation/download/admin access and relevant lab/document actions. Server timestamps; required fields; ≥90-day retention and retained identity ≥90 days after account end under local rules, configurable extension. Log query/export is restricted and itself logged. |
| LR3 | Signup and subsequent legal acceptance now trigger agreement evidence in this MVP: signer, server time, exact text/version/hash, auth method and required request metadata; unticked deliberate controls and immutable evidence. High-risk rights/role/dataset/signing actions require re-authentication as applicable. No CA or production approval feature. |
| LR4 | Explainability/missing-data/core independence remain enforced by CER/NFR; a wrong-result reporting channel records each report as a defect. Team must specify safe report route/record/reviewer before the affected engine task is ready. No override may bypass a sourced hard block. |
| LR5 | Dataset/rules/thresholds/groups/formulas and confidential documents remain within approved infrastructure; repo/fixtures/public pages do not expose them. IP-001–004 are verified for every integration/download. |

## 7. Security and Privacy Requirements

### Security

| ID | Requirement and acceptance |
|---|---|
| SEC-001 | Session/action/record authorisation on every system API; active organisation verified server-side from memberships. Forged client organisation/record IDs cannot grant access. Test permitted route with another user's/organisation's record as well as missing sessions. |
| SEC-002 | Logs/errors/analytics contain permitted metadata only, never formula body/percentages, passwords or sensitive data. **Authorised formula/lab export may contain its explicitly scoped confidential content under FR-008**; it cannot include underlying datasets/rule tables, unrelated profiles or sensitive fields. This resolves the former blanket export contradiction. |
| SEC-003 | Access logs are durable, append-only under the application role, tamper-evident, server-timestamped and backed up/restored. Purging uses a separate controlled role and required retention. Restricted log reads/exports are themselves logged; no admin UI edits/deletes log history. |
| SEC-004 | Server-verified secure sessions, HttpOnly cookie boundary/CSRF for state changes, safe password/MFA/token handling, anti-enumeration/rate controls and config-based expiry. Logout/reset/revocation invalidate access; bundles/logs/API/errors contain no credentials or reusable secrets. Mechanism/provider/settings remain gated. |
| SEC-005 | Organisation and record isolation on formulas/versions/results/batches/documents/references. Own profile is always own-only. Unauthorised record probing reveals no confidential existence; document/QR/storage identifiers never act as authorisation. An external-client portal remains deferred; public signup does not introduce client formula rights. |
| SEC-006 | Admin actions require allowed role grants, reason and valid MFA step-up; self-grant is refused server-side. Cross-organisation admin access is explicit/logged. Typed uploads validate ownership/subject/type/size and scan safely; extracted text is plain text, links allow reviewed http(s) destinations, download/file-output content is safely encoded. Unknown action mappings fail closed. |

### Privacy

| ID | Requirement and acceptance |
|---|---|
| PRIV-001 | Consent/evidence exists before storing account personal data; reject missing consent and use required purpose/retention metadata. Pending accounts and invitations must also have reviewed compliant persistence design before implementation. |
| PRIV-002 | Implement real `GET /me/data`, `PATCH /me`, `DELETE /me` services/screens with authentication, retaining local rules even though source offers deletion requests. Handle cascades, retained-log identity, backup purge and withdrawal without deleting evidence silently. |
| PRIV-003 | Profile fields limited to display name/email plus necessary auth/role/organisation and consent/security metadata; preferences/session/tutorial data have explicit purpose/retention. No DOB, ID card, home address, gender or unused “later” fields. Do not copy personal data into formula notes. |
| PRIV-004 | Allergy/patch-test/pregnancy/religion-revealing preferences remain outside MVP and need a prior written owner-approved plan before fields/processing exist. Never place sensitive values in logs/exports/errors/AI prompts. |

## 8. Owner-IP Requirements

| ID | Requirement and acceptance |
|---|---|
| IP-001 | No owner dataset/rules/thresholds/groups/formulas/documents are sent to an unapproved AI/API/cloud endpoint, including tests. Review call paths/configuration for each integration. |
| IP-002 | Keep real IP out of public repositories/gists/builds/screenshots/demo deploys; clearly label synthetic fixtures. Review public/static/tutorial content and bundles. |
| IP-003 | Formula/lab exports contain only the authorised selected record's approved displayed/output fields; never a dataset/rule-table dump or another formula. Regulatory exports are deferred. Log every download as metadata. |
| IP-004 | New external processing of owner IP needs written owner approval before integration; hosting/storage/auth/email/telemetry choices are not approved by adopting this MVP. Record cross-border personal-data transfers and approve infrastructure before deployment. |

## 9. Acceptance and Traceability by Wave

| Wave | Demonstrable acceptance scenario | Required checks |
|---|---|---|
| 0 | Visitor switches language, reads overview/legal/help and receives safe config/content error states without system-data calls | FR-018; NFR-005–008; public/bundle confidentiality |
| 1 | Signup/verification → pending → authorised role/MFA → own account/rights; denied self-grant/foreign-account access; restricted log query | FR-001/016/017; PRIV/SEC; LR1–LR3; Go permission/session/consent/log checks + browser flow |
| 2 | Create/validate immutable formula → analyse supported inputs → view missing/provenance/Profile A/B → trial without persistence → explicit new-version save; stale/blocked cases | FR-002–007/009–011/015; CER; Go business/model/record checks + result component/browser flow |
| 3 | Create batch → select each instrument/lot/unit → record actual measurement → WARN/BLOCK/reweigh/pre-dilution → authorised lab PDF | FR-004/008/012/013/015; reviewed numeric/calibration rules; server append-only/block checks + browser flow |
| 4 | Separate jurisdiction findings → missing document → correct typed upload → scan/parse status → preserve old/new evidence | FR-005/006/014/015; provenance/upload/authorised download and safe-text checks |
| 5 | Opt in/skip/reopen pending-user tutorial → synthetic mission → own progress only; static tips dismiss without covering blocks | FR-019/020; browser network-boundary test, reduced-motion and own-account checks |

When executable projects exist, use the retained Go tests, Vitest and Playwright for meaningful
business, access, result-component and journey checks. Documentation/API/mock presence is not
evidence that these scenarios passed. Every implementation task links its FR/control, design,
reviewed source/decision, test and result; unresolved gates prevent declaring it ready/done.

## 10. Open Decisions and Superseded Questions

The **scope** is now decided. Public signup/pending approval, formula creation, explicit
immutable versions, admin workflows, account legal acceptance, batch/lab PDFs, document upload
and tutorial/static mascot are in scope. What-if is transient until explicit version save;
authorised formula export is permitted within FR-008. Organisation access is action-and-record
scoped under the revised rule 21; own profiles remain own-only. These replace the earlier
creation/provisioning/save/version/admin/visibility scope gaps.

The following require actual information, not assumptions:

| Decision | Gate / affected requirements |
|---|---|
| Scientific methods, applicability/vehicle support, Profile A/B meaning, uncertainty/tier/error-budget definitions, allowed proxies and seed use | Domain expert review; FR-003/009/010, CER-001–005 |
| Material groups and pair/synergy/masking rules absent from the supplied sample | Missing source data; FR-003/005, CER-002; no guessed interaction |
| Current regulatory source versions/thresholds/category/dilution/nonnumeric restrictions, near-limit band and jurisdiction blocking scope | Regulatory/domain review; FR-005; unsupported checks stay insufficient |
| Canonical units, decimal representation/serialization, percentage tolerance, batch targets and supported conversions | Reviewed Go calculation/API contract; FR-004/011–013 |
| Transient what-if request schema, input/version binding and any export of a trial snapshot | Explicit API review before FR-007 or trial export; a saved-formula analysis/export id alone does not specify transient inputs |
| Instrument capabilities/calibration precision, WARN/BLOCK thresholds, drop calibration and pre-dilution method | Domain/lab approval; FR-013; source sample numbers are not approval |
| Auth provider/session implementation, initial privileged-account provisioning, MFA/email/recovery policy and TTL/rate settings | Security/design decision; FR-001/016/017, SEC-004/006 |
| Invitation/pending-registration consent, legal texts/controller/contact details, rights/retention/withdrawal workflows | Privacy/legal review before real-user data; FR-001/016–018, PRIV, LR1/LR3 |
| Fine-grained role actions absent from source, reviewer privileges and any cross-organisation operation | Complete local permission map before enabling action; deny-by-default; SEC-001/005/006 |
| Approved hosting/auth/email/storage/scanning/parser services, cross-border transfer record and ownership header | Owner/IP/privacy approval before integration/deployment; IP-004 |
| Formula output format, batch label layout/QR schema and document-completeness method | Output/domain review; FR-008/012/014 |
| Scientific glossary, public copy/tutorial scripts/assets and accessibility review | Reviewed TH/EN content; FR-018–020, NFR-005 |
| Representative performance targets and wrong-result report route/reviewer/retention | Team decision; NFR-002, LR4 |

Deferred: offline sync/desktop wrapping, reference-data management, R1-S6 formula comparison,
graphical provenance renderer (all provenance data remains in scope), R2-S4–S6 regulatory
label/export/notification, full X4-S6 audit dashboard (restricted local query remains in scope),
R3–R6, external-client portal/SaaS billing/orders, production/safety approvals, evaluation
panels, AI mascot chat, notification bell and dark mode.

## 11. Traceability and Revision Record

- **Interview 2026-09-02:** problem, primary Formulator and four historical pain points only.
- **Honney 2026-09-10/16 decisions:** historical chart/access/build-cycle context; superseded
  where the owner's 2026-10-04 instruction changes scope.
- **Owner 2026-10-04 + pinned source:** expanded FR-001–020 behavior/waves. Source handoff
  validates neither chemistry/legal choices nor a production implementation.
- **Local rules:** privacy/log/agreement/IP/no-guessing requirements remain controlling.
  Source manual erasure/audit deferral is strengthened to retain those requirements.
- **Implementation and tests:** not yet completed; follow links to current design/contract and
  record the actual verification when each ready task is implemented.

No requirement is attributed to invented interview evidence, an unverified scientific value,
a copied fixture verdict or an implicitly approved external service.
