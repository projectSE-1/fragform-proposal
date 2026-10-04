<!-- AI Perfumery Engine project documentation; ownership follows the owner's existing agreement. No new licence is granted. -->
# User Journeys — Adopted MVP

**Updated:** 2026-10-04

**Status:** Intended behavior; implementation and user validation are still pending.

The owner directed this revision to adopt the linked frontend MVP while retaining Honney's
Next.js/TypeScript, Go/Gin and PostgreSQL stack. The original 2026-09-02 interview remains
evidence for the Formulator's view/evaluate-before-mixing problem. Additional account, admin,
lab, evidence and tutorial journeys trace to the 2026-10-04 instruction and pinned source;
they are not fabricated interview findings.

The detailed acceptance baseline is [backlog.md](../01-requirements/backlog.md); waves and
source boundaries are in [mvp-scope.md](mvp-scope.md). Roles/actions/record access follow
[roles-permissions.md](roles-permissions.md); [rule.md](../03-compliance/rule.md) governs data,
logs, agreement evidence and owner IP throughout these journeys.

## 1. Visitor → Verified Account → Pending or Authorised Access

**Wave 0–1 · FR-018, FR-001, FR-017 · actor: visitor/account holder**

1. Visitor reads the public overview, limitations, how-to/FAQ and versioned terms/privacy in
   Thai or English. Public pages contain no real formulas/material dataset or user data.
2. Visitor chooses signup, enters minimal account fields and deliberately accepts the exact
   current terms/privacy versions using separate unticked controls.
3. Go records the required consent/agreement evidence and sends a single-use expiring
   verification link. Public responses do not disclose whether an email already has an account.
4. Account holder verifies email and logs in. Required MFA setup/verification cannot be skipped.
   Changed legal texts require deliberate acceptance with new evidence before system processing.
5. Go evaluates permitted memberships/actions and establishes the active organisation/role.
   If there is no lab role, the user sees **pending access**, own account, public help and
   synthetic tutorial links only. Signup never grants a lab role.
6. Authorised users enter the role-appropriate lab home; the active organisation/role stays
   visible. Context switching is verified on the server and clears confidential cached views.
7. Account holder can reset a password through a verified link, or use the configured recovery
   path when email delivery is unavailable; logout/expiry revokes access.

**Alternate states:** signup disabled; invalid input; expired/used verification link; generic
invalid credentials; MFA/recovery failure; rate limit; pending consent; pending role; expired
session; API timeout. Exact TTL/password/rate values remain config/security decisions, not
numbers borrowed from source wireframes.

**Completion evidence:** consent/signature/session/log records and permission checks exist,
with own rights services in the same increment. A pending session cannot call formula/reference/
lab/admin endpoints. Invitation/registration/legal-text gaps keep real-user persistence gated.

## 2. Own Account → Security, Preferences and Personal-Data Rights

**Wave 1 · FR-017, PRIV-001–004 · actor: any authenticated account holder, including pending**

1. User opens **my account** and sees only their own profile and read-only role/context labels.
2. User corrects allowed profile fields, verifies an email change, changes password/MFA settings
   or revokes their own sessions. Required MFA cannot be disabled.
3. Session/device summaries expose only necessary information; normal account UI does not show
   full IP addresses. Expiry warning uses the server's configured session timestamps.
4. User reads immutable consent/document version history and sets language/tip preferences.
   A new version does not rewrite old acceptance evidence.
5. User exports or corrects their personal data through `GET /me/data` / `PATCH /me`.
6. User requests and completes erasure through `DELETE /me`, with required re-authentication.
   The service removes applicable personal/derived data, records backup purge and explains
   retained identity/log/signature exceptions. Consent withdrawal stops its affected purpose
   within the local required period.

**Alternate states:** no sessions/consent entries; invalid current password; mandatory-MFA
conflict; verification link expired; pending rights operation; safe deletion failure. A source
manual-request-only flow is insufficient for the local erasure requirement.

**Completion evidence:** account operations are own-only and logged appropriately; erasure/
backup/retention evidence exists. Deleting a profile never deletes required access-log history.

## 3. Administrator → Invite/Review Access → Controlled Role Change

**Wave 1 · FR-016, SEC-001/003/006, LR2/LR3 · actor: permitted administrator/log custodian**

1. Administrator selects a server-authorised organisation context and loads minimal user/pending
   metadata. Any read of another user's personal data records actor/subject/time/reason.
2. Administrator sends a permitted invitation or opens a pending account. Invitees set their
   own passwords; no administrator receives a readable temporary password.
3. Administrator selects permitted roles from the seven fixed identifiers, or changes account
   status. The action/record permission map decides what can be granted, not a role name alone.
4. Administrator states a reason and performs valid MFA step-up. Self-grant is refused by Go;
   removing a final role warns that the user will lose system access.
5. Go applies the permitted change and appends metadata evidence. Expired step-up triggers
   fresh verification; invitation persistence must satisfy local prior-consent rules.
6. An authorised custodian can query permitted access-log metadata by actor/action/date range
   and export the permitted result. Queries/downloads are themselves logged; no edit/delete
   controls exist. Cross-organisation system-admin access must be explicit, reasoned and logged.

**Alternate states:** no pending accounts; forbidden/self-grant request; changed status;
unknown action mapping; expired MFA step-up; permission revoked during operation; failed
invitation delivery; no log matches; log-query failure. Unknown mappings fail closed.

**Completion evidence:** server denials and success evidence can be verified. The restricted
log-query/export capability ships with authentication; a full audit dashboard is deferred.

## 4. Formulator → Create/Open → Analyse → Explain → Trial/Save

**Wave 2 · FR-002–007, FR-009–011, FR-015 · actor: permitted Formulator**

1. Formulator opens their authorised formula list and chooses an existing immutable version or
   creates a new draft. List-empty and no-filter-match states offer only permitted actions.
2. Formulator searches permitted references and explicitly declares vehicle/application,
   product category, dilution where needed and component proportions/amounts. Unsupported
   model/vehicle scope is explained; no scientific default is silently inserted.
3. Formulator submits validation/save. Go checks decimal-text input, required context,
   percentage total and sourced hard blocks. Invalid sums are rejected with the server's
   missing/excess figure; the UI never normalises them or computes official previews.
4. Explicit save creates a new immutable formula version. A stale base version returns a
   conflict and safe review/reload path; no earlier version is overwritten.
5. Formulator requests analysis. Go reports actual queued/running/completed/failed/unquantified
   stages or verified cache reuse. A missing unsupported stage stays explicit while
   independent supported stages may continue.
6. Workspace presents all ingredients, available quantities and restrictions together.
   Supported odour/evolution results show Profile A/B side-by-side, uncertainty/tier/error
   budget and relevant seed/model/rule/data/input versions. Chemistry and compliance are
   separate sections. A changed formula and changed model have separate freshness indicators.
7. Formulator opens a result/finding, follows every provenance list/tree node to the rule/source
   locator and returns to the same workspace position. Missing groups/pair rules/citations
   return `insufficient data`; the engine never guesses an interaction.
8. Formulator creates a labelled in-memory what-if, then **explicitly evaluates** it through Go.
   Results update in place without reload/persistence; the editor itself computes no preview.
   Trial can be discarded or explicitly saved as a new immutable version under normal write
   permissions/validation.
9. An authorised user downloads the selected displayed formula output under FR-008. Trial,
   stale, missing and blocking labels remain visible; the download is scoped and logged.

**Alternate states:** no components; invalid sum/input; unsupported vehicle; unknown material/
group/pair rule; missing dilution/source/model/uncertainty; sourced hard block; conflict; stale
model; pending analysis; safe timeout; denied result/provenance/export access. A failed new
request never leaves the prior output labelled as current.

**Completion evidence:** reproducible server results with complete evidence, immutable saved
versions and no unintended trial persistence. Domain decisions for models, thresholds,
uncertainty/Profile A/B and numeric representation remain gates before implementation.

## 5. Lab User → Batch → Mixing Sheet → Actual Weighing

**Wave 3 · FR-004/008/012/013/015 · actor: permitted lab user**

1. User selects an authorised immutable formula version, declares batch target/unit and
   available component lots, then creates a batch.
2. Go produces target quantities and a mixing sheet using approved conversion evidence.
   Volume requires density/conditions/uncertainty; drops require actual material/dropper
   calibration. Missing conversion evidence cannot be replaced with a universal assumed value.
3. For each component, user explicitly chooses a valid calibrated instrument and dosing unit.
   Suggested instruments are suggestions only; expired calibration is visibly unavailable.
4. User enters the measured value with permitted instrument precision as decimal text.
   Go records the actual measurement and returns its uncertainty and reviewed verdict.
5. WARN retains the measurement and flag. BLOCK also retains the measurement, locks the affected
   next step and has no bypass for any role.
6. User can add a reasoned linked reweigh record or a reviewed, explicitly confirmed
   pre-dilution record. Old values remain as superseded evidence; ratios are never guessed.
7. User requests Thai/English mixing-sheet or lab-label PDF for the exact batch/server state
   and prints it using normal browser printing. QR identifies an authorised batch/sample,
   without embedding confidential content.

**Alternate states:** batch/lot/instrument list empty; invalid target/precision; calibration
expired; density/drop calibration missing; already-recorded conflict; WARN/BLOCK;
unsupported reweigh/pre-dilution capability; PDF failure/permission denial.

**Completion evidence:** version/lot/instrument/measurement provenance, append-only corrections,
server-enforced block and logged download. Instrument thresholds, conversion/pre-dilution
methods, label/QR schema need local validation; no mock threshold is treated as approved.

## 6. Reviewer/Formulator → Compliance → Evidence Vault → Typed Upload

**Wave 4 · FR-005/006/014/015 · actor: permitted formula/document user**

1. User opens the selected formula version's compliance panel. EU/TH/ASEAN/US remain separate,
   including jurisdictions with missing rules; the panel makes no aggregate “all compliant” claim.
2. Each sourced finding distinguishes pass, exceed and inconclusive. Missing category/dilution/
   rule/citation/uncertainty is explicit; a central value alone cannot erase a crossing interval.
3. A sourced hard block cannot be dismissed or bypassed; Go also blocks its affected actions.
   An approved versioned disclaimer remains visible and cites the applicable data.
4. User follows missing SKU/lot evidence to document completeness/vault. Completeness is a
   server-provided risk/evidence indicator, not a new approval gate by itself.
5. User chooses type and subject: COA/GC-MS/chiral-GC bind to lot; SDS/TDS/IFRA CoC/allergen
   bind to SKU. Both UI and Go reject wrong bindings and unauthorised targets.
6. User uploads an allowed file and follows queued → scanning → parsing → done/rejected.
   Rejection explains safe reasons only; parsed text is plain text, never executable HTML.
7. New document versions remain beside old ones. Parsing completion does not automatically
   authorise a scientific value; applicable reviewed evidence is required before re-evaluation.

**Alternate states:** no documents; completeness missing; invalid subject/type/size; scan
rejected; processing failed; revoked access; unreviewed extracted claims; missing jurisdiction
rules; inconclusive interval; sourced hard block. Regulatory labels/report export/notification
and production/safety signing are outside this journey.

**Completion evidence:** authorised versioned documents, validated findings/citations and safe
upload/download evidence. Storage/scanning/parser/reviewer and legal/source decisions stay gated.

## 7. Account Holder → Opt-In Practice → Static Help

**Wave 5 · FR-019/020, NFR-005/008 · actor: account holder, including pending users**

1. User receives a tutorial invitation and chooses start/later/skip. It never auto-starts.
2. Mission centre offers Q0–Q6 according to the reviewed mission design. Pending users can
   practise Q0–Q5; administration practice Q6 requires the relevant administrator permission.
3. User enters a clearly labelled `/tutorial/*` synthetic sandbox. It reuses shared UI/status
   components but reads/writes no real formula/reference/lab/admin data.
4. User finishes, skips any step/all missions or exits; only their tutorial progress is written
   from the sandbox. The centre remains available for restart/reopen from help.
5. Static mascot tips/FAQ can be opened or dismissed one/all; own preferences are handled
   separately by account services. Tips never invent/report scientific results.
6. Tutorial/help never overlays MFA, hard blocks, weighing BLOCK or errors. Decorative motion
   is disabled under reduced-motion preference; points/badges remain within practice only.

**Alternate states:** no FAQ matches; progress load/write failure; unavailable mission; user
declines/skip-all/restart; critical real-work state suppresses help overlays. Failure to load
progress cannot open real-data APIs as a fallback.

**Completion evidence:** browser request-boundary verification proves sandbox isolation,
including a pending account. Scientific script/content and asset ownership are reviewed;
AI mascot chat is deferred.

## Shared Screen States and Verification

| State | What the user sees |
|---|---|
| Loading / pending | Actual request/job/processing state; no invented progress or current-result claim |
| Success | Authorised current response with context/version/evidence and permitted actions |
| Empty | No records/no matches, distinct from missing scientific evidence; allowed next action |
| Error | Safe message/reference plus permitted retry/review/login route; no secrets or stale success |
| Insufficient/unquantified | Missing evidence/reason/source path rather than zero, guessed result or pass |
| Hard block / BLOCK | Reviewed server reason and affected locked action; no dismiss/bypass |
| Conflict / stale | Separate changed-input/model indicators and explicit review/reload/reanalyse path |
| Pending access | Own account/public help/synthetic tutorial only; no system menus or data |

The journeys need Go business/permission/log tests, shared result/error component checks and
browser paths when the executable projects exist. Verify Thai/English numerical consistency,
keyboard/focus/status labels, reduced motion and 1366×768/390×844/360×800 layouts.
Mock success is presentation evidence only. [api-contract.md](api-contract.md),
[calculation-engine.md](calculation-engine.md) and [data-model.md](data-model.md) must stay
aligned with these paths and the backlog before a task is ready.

Offline synchronization/desktop wrapping, reference-data editing, formula comparison, graphical
provenance rendering, full audit dashboard, R2 regulatory export/label/notification, R3–R6,
client portal/SaaS/orders, production/safety approvals, evaluation panels, AI help chat,
notification bell and dark mode remain outside this MVP.
