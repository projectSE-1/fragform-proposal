# AI Perfumery Engine — Product Backlog & Specification

**Status:** Draft v1 — first pass for human/domain-expert review, not yet approved.
**Date:** 2026-09-02
**Primary source:** real interview (2026-09-02) with a cosmetic-science student who formulates
fragrance, our one real customer for this project. Recorded per lecturer exception to the
course's usual ≥15-interview rule (single real-customer relationship instead of a panel).
**Authoritative references:** `CLAUDE.md` (repo root), `.docs/03-compliance/rule.md`,
`.docs/00-context/project-context.md` (context only, not authoritative where it conflicts with
the above).

This file is both the skimmable backlog and the detailed specification for this build cycle.
Section 0 is the priority table; Sections 4–9 are the full requirement entries.

---

## 0. Prioritized Summary

| ID | Title | Priority |
|---|---|---|
| FR-001 | Authenticated login (no public signup) | Must |
| FR-002 | Formula storage list view | Must |
| FR-003 | Formula detail view — full information in one place | Must |
| FR-004 | Automatic weight / percentage / total calculation | Must |
| FR-005 | Rule & restriction highlighting per material | Must |
| FR-006 | Explanation of calculated/flagged results | Must |
| FR-007 | In-place "what-if" editing with recalculation | Must |
| FR-008 | Export of displayed formula information | Should |
| FR-009 | Odour profile chart | Should |
| FR-010 | Evaporation curve over time | Should |
| NFR-001 | Single-screen formula comprehension | Should |
| NFR-002 | Immediate recalculation feedback, no reload/save gate | Should |
| NFR-003 | Restricted access model, no public self-service | Must |
| NFR-004 | Core workflow independent of any AI/model service | Should |
| LR1 | PDPA — consent, data-subject rights, sensitive-data guardrail | Must |
| LR2 | Computer Crime Act §26 — append-only access log ≥90 days | Must |
| LR3 | Electronic Transactions Act §9/26 — agreements, if any exist in this cycle | Must (conditional) |
| LR4 | ETDA principles — explainability, insufficient data, offline core workflow | Should |
| LR5 | Owner IP — dataset/rules/formulas stay on approved infrastructure | Must |
| CER-001 | Explainable calculation output | Must |
| CER-002 | "Insufficient data" response, never a guess | Must |
| CER-003 | Deterministic engine, no external model dependency | Must |
| SEC-001 | Server-side authorization on formula access | Must |
| SEC-002 | No confidential data in logs/errors/exports beyond scope | Must |
| SEC-003 | Access-log implementation controls (append-only, tamper-evident) | Must |
| SEC-004 | Credential and session handling | Must |
| SEC-005 | External-user trust boundary (org isolation, client portal) | Must (conditional) |
| PRIV-001 | Consent recorded before storing account personal data | Must |
| PRIV-002 | Data-subject rights endpoints (export/correct/delete own data) | Must |
| PRIV-003 | Data minimisation on account fields | Must |
| PRIV-004 | Sensitive personal data — not implemented without owner approval | Must (guardrail) |
| IP-001 | No external transmission of confidential data | Must |
| IP-002 | No public exposure of dataset or formulas | Must |
| IP-003 | Export output is scoped, not a dataset dump | Must |
| IP-004 | External-service approval gate for owner-IP data | Must |

---

## 1. Problem Statement

Fragrance formulation requires a formulator to track many pieces of information at once —
ingredients, concentrations, quantities, and restrictions — while calculating and checking
compliance by hand, with no way to catch a mistake before physically mixing a formula. Section 3
breaks this into the four specific pain points it comes from; Section 2 identifies the persona.

Needed outcome, in the stakeholder's own words: a program that "helps formulators understand and
evaluate fragrance formulas by automatically calculating formula information and highlighting
relevant rules and restrictions." Every requirement below implements a piece of that sentence or
exists because `rule.md`/`CLAUDE.md` require it once the workflow needs a login and stored
formulas.

*(Stakeholder identity, interview context, and sourcing are recorded in `project-context.md`
§3–§4, not repeated here.)*

## 2. Users

- **Formulator (Lab User)** — the primary persona, and the only one with direct evidence from a
  real interview: a cosmetic-science student who formulates fragrance and is our real customer
  for this project (interviewed 2026-09-02; see `project-context.md` §3–§4). All FR/NFR/CER items in
  this backlog are written for her.
- **Domain Expert** — supplies the material/rule dataset the engine operates on (rule.md §0; its
  structure is documented in `.docs/00-context/dataset-structure.md`). Not evidenced by the
  interview itself; no in-app workflow this cycle.
- **Administrator** — referenced in `project-context.md` §4 as a possible role. No admin-specific
  workflow is evidenced by the interview, and none is designed in this backlog beyond the
  server-side authorization guardrail that applies to any role (SEC-001). Open Question below.
- **Panel Tester / Evaluation Panel** — referenced in `project-context.md` as part of the broader
  product concept. Not evidenced by this interview and out of scope for this build cycle.

## 3. Interview Pain Points

Source for all four: real interview, 2026-09-02, with the stakeholder described above (also
recorded in `.docs/00-context/project-context.md` §3).

| # | Pain point (paraphrased from interview) | Requirements addressing it |
|---|---|---|
| 1 | Too much information to track — many ingredients, concentrations, quantities, properties/restrictions. | FR-003, NFR-001 |
| 2 | Manual calculation — weight, percentage/concentration, totals, checking correctness by hand. | FR-004, CER-001 |
| 3 | Rule/compliance checking is complicated — which rules apply, checking limits, easy to overlook something. | FR-005, FR-006, CER-001, CER-002 |
| 4 | Needs to calculate/check before physically mixing, rather than discovering a problem afterward. | FR-007, NFR-002 |

Main pain-point framing ("fragrance formulation is complex and requires formulators to keep
track of many pieces of information at once") and the solution framing ("automatically
calculating formula information and highlighting relevant rules and restrictions") motivate the
overall shape of the core workflow in Section 4, not any single requirement.

---

## 4. Functional Requirements

### FR-001: Authenticated Login (No Public Signup)

**Problem:**
The approved core workflow for this cycle starts with login. This system is a bespoke tool for
one customer's internal users, not a public platform — there is no public self-service signup,
unlike the reference product fragrance-engine.com (confirmed scope decision 1).

**User:**
Formulator.

**Requirement:**
The system must authenticate a user against an existing account before granting access to
formula storage. There is no public registration flow.

**Precondition:**
The user already has an account (provisioned through an internal process — see Open Questions;
this cycle does not build a public signup flow).

**Main Flow:**
1. User navigates to the login screen.
2. User submits credentials.
3. System validates credentials server-side.
4. On success, the user is redirected to the formula storage list (FR-002); on failure, a
   generic error is shown.

**Acceptance Criteria:**
- Given valid credentials, when submitted, then the user reaches the formula list and an
  `access_log` row records login success.
- Given invalid credentials, when submitted, then access is denied with a generic error and an
  `access_log` row records login failure (rule.md rules 27–28).
- Given no session, when a formula-list or formula-detail URL is requested directly, then the
  server denies the request rather than relying on client-side redirect.

**Traceability:** Scope decision 1 (no public platform); rule.md rules 26–28 (LR2); CLAUDE.md
Access Logging.

---

### FR-002: Formula Storage List View

**Problem:**
The approved workflow step 2: after login, the user needs to reach a specific formula. This is a
precondition for every pain point in Section 3, not itself a named pain point.

**User:**
Formulator.

**Requirement:**
After login, the system displays the formulas the user is authorized to access, identified by
name and minimal metadata (e.g., last modified). The list itself must not surface confidential
material-level detail — that belongs in the detail view (FR-003).

**Precondition:**
User is authenticated (FR-001).

**Main Flow:**
1. User lands on the formula list after login.
2. System queries, server-side, the formulas visible to this user.
3. List renders formula name/id/last-modified only.

**Acceptance Criteria:**
- Given an authenticated user, when the formula list loads, then only formulas that user is
  authorized to view appear, enforced server-side (rule.md rule 21).
- Given a request for the list with a tampered or forged client parameter, then the server still
  returns only the authorized set.

**Traceability:** Approved core workflow (this task's scope decision 2); rule.md rule 21.

---

### FR-003: Formula Detail View — Full Information in One Place

**Problem:**
Pain point 1: too much to track at once — many ingredients, each with its own concentration,
quantity, and restrictions.

**User:**
Formulator.

**Requirement:**
Opening a formula must display, in one connected view: every material in the formula, its
quantity/percentage/concentration, its material group(s), and any restriction or rule relevant
to it or to a combination it participates in — without requiring the user to open a separate
page per material.

**Precondition:**
The formula exists in storage, and the calculation engine has the source data (materials,
groups, rules, thresholds) needed to evaluate it.

**Main Flow:**
1. User selects a formula from the list (FR-002).
2. System loads the formula and triggers calculation (FR-004) and rule evaluation (FR-005).
3. System renders materials, quantities/percentages, groups, and restrictions/warnings together.

**Acceptance Criteria:**
- Given an opened formula, when the detail view renders, then every material is listed with its
  quantity, percentage, and any applicable restriction/warning visible without navigating away.
- Given a material for which the engine has no covering rule, then that item shows
  "insufficient data" rather than being silently omitted or guessed (rule.md rule 59; CER-002).

**Traceability:** Interview pain point 1; approved core workflow.

---

### FR-004: Automatic Weight / Percentage / Total Calculation

**Problem:**
Pain point 2: manual calculation of ingredient weight, percentage/concentration, and totals, and
manually checking whether the values are correct.

**User:**
Formulator.

**Requirement:**
The system must automatically compute each material's weight and percentage/concentration and
the formula's total from the stored formula data, rather than requiring the user to calculate
these by hand.

**Precondition:**
The formula has recorded quantities/base data.

**Main Flow:**
1. Formula is opened (FR-003).
2. Engine computes per-material and total values.
3. Values render alongside each material.
4. A total/percentage discrepancy, if any, is flagged rather than silently accepted.

**Acceptance Criteria:**
- Given a formula with several materials, when opened, then each material's weight/percentage is
  computed by the system, not entered by the user.
- Given computed percentages, when they do not sum to the expected total, then the discrepancy is
  explicitly flagged rather than hidden.

**Traceability:** Interview pain point 2.

---

### FR-005: Rule & Restriction Highlighting per Material

**Problem:**
Pain point 3: knowing which rules apply to which ingredients is complicated, and it's easy to
overlook something.

**User:**
Formulator.

**Requirement:**
For each material (and relevant combination) in an opened formula, the system must automatically
check applicable restrictions/limits from the approved rule set and visibly distinguish
"within limit," "at or near limit," "over limit," and "insufficient data."

Two inputs are required for that comparison to be correct, and a formula without them cannot be
checked:

- **Product category.** IFRA limits differ per product category, so the same material may be
  within limit in one category and over limit in another. The formula must declare the category
  it is checked against.
- **Concentrate versus finished product.** IFRA limits are expressed as a percentage of the
  finished consumer product, while a formula is normally a concentrate that is later diluted. The
  dilution must be applied before comparing, or nearly every material reports as over limit.

If either is missing, the result is `insufficient data` rather than an unqualified pass or fail.

**Precondition:**
Rule/threshold data exists for the relevant material(s) in the approved dataset. In the sample
supplied by the stakeholder, restriction data comes from the IFRA Standards (51st Amendment) and
the per-substance `EU CosIng` status — see `.docs/00-context/dataset-structure.md`.

**Main Flow:**
1. Formula is opened (FR-003).
2. Engine checks each material/combination against thresholds, rules, and groups.
3. UI highlights any material at, near, or exceeding a threshold, citing the rule/threshold used.

**Acceptance Criteria:**
- Given a material whose concentration exceeds a known threshold, when the formula is opened,
  then that material is visibly flagged and the specific rule/threshold is cited (rule.md rule
  58; CER-001).
- Given a material pair with no known interaction rule, then the system shows "insufficient
  data" rather than an assumed status (rule.md rule 59).
- Given a formula with no declared product category, or no dilution figure where a limit is
  expressed against the finished product, then the affected checks return `insufficient data`
  and say which input is missing. The dilution is never assumed to be 100%.
- Given a material at a known percentage of the concentrate, the value compared against a
  finished-product limit is the diluted percentage, and both figures are shown to the user so the
  comparison can be checked by hand (FR-006).
- A cited limit names its regulation and version (for example IFRA Standards, 51st Amendment),
  not just a number.

**Traceability:** Interview pain point 3; rule.md rules 58–59. Product-category and dilution
inputs added 2026-09-10 from the supplied regulatory data; design in `data-model.md` §5.

---

### FR-006: Explanation of Calculated/Flagged Results

**Problem:**
Pain point 3: the user needs to trust and quickly understand why something is flagged, not just
see a flag with no context.

**User:**
Formulator.

**Requirement:**
Any calculated value or restriction flag on the formula view must be traceable, on request, to
the specific rule, threshold, and source data that produced it.

**Precondition:**
The engine has produced a result via FR-004/FR-005.

**Main Flow:**
1. User views a flagged or calculated item.
2. User opens an explanation control (e.g., expand/tooltip — exact UI left to design).
3. System shows the rule id, threshold value, and source data reference.

**Acceptance Criteria:**
- Given any displayed calculated or flagged value, when the user requests an explanation, then
  the system shows the rule(s)/threshold(s)/source data used — no unexplained figure (rule.md
  rule 58; CLAUDE.md AI/Calculation Rules).

**Traceability:** Interview pain point 3; rule.md rule 58.

---

### FR-007: In-Place "What-If" Editing With Recalculation

**Problem:**
Pain point 4: the formulator wants to evaluate a formula before physically mixing it, instead of
discovering a calculation mistake or rule violation only afterward.

**User:**
Formulator.

**Requirement:**
From the formula detail view, the user may adjust a displayed value (e.g., a material's quantity
or the batch size), and the system must recalculate and re-render weights, percentages, and rule
flags in place — without requiring the change to be saved first, and without any physical mixing.

**Precondition:**
User has at least view access to the formula. (Whether trial editing requires a distinct write
permission from viewing, or whether every viewer may run a trial edit, is unresolved — see Open
Questions.)

**Main Flow:**
1. User edits a value in the open formula view.
2. System recalculates using the same engine and rules as FR-004/FR-005.
3. Updated values and flags render immediately.
4. User may discard the trial change or explicitly save it.

**Acceptance Criteria:**
- Given an open formula, when the user changes a material's quantity, then percentages, totals,
  and rule flags update to reflect the change without a page reload, and the saved formula is
  unchanged unless the user explicitly saves.
- Given a trial edit that pushes a material over a threshold, then the corresponding rule flag
  updates and cites the rule/threshold per FR-006.

**Traceability:** Interview pain point 4; confirmed scope decision 2 (in-place editing/
recalculation explicitly in scope as an extension of viewing/evaluating; full formula authoring
from an empty state is explicitly out of scope this cycle).

---

### FR-008: Export of Displayed Formula Information

**Problem:**
Confirmed scope decision 2 states export of what's displayed is in scope as an extension of the
viewing/evaluating workflow. This supports the formulator taking the calculated, rule-checked
formula view to use at the point of actually weighing materials (connects to pain points 2 and
4, though export itself was not a phrase used in the interview — flagged here for honesty about
sourcing).

**User:**
Formulator.

**Requirement:**
An authorized user may export the currently displayed formula view (materials, calculated
weights/percentages, cited rules/restrictions) in a fixed format (exact format left to design).
The export contains only what is already shown on screen to that user for that formula — never
the underlying rule tables, threshold definitions, or other formulas.

**Precondition:**
User is viewing a formula they are authorized to see.

**Main Flow:**
1. User triggers export from the formula detail view.
2. System generates an export containing only that formula's displayed data.
3. System logs the export event.
4. File is returned to the user.

**Acceptance Criteria:**
- Given an open formula, when the user exports it, then the export contains exactly the
  materials/values/rule citations already visible to that user for that formula, and an
  `access_log` row records `formula_id` + version (not the formula content) per rule.md rule 31.
- Given a user without view rights to a formula, then export is refused server-side regardless
  of client request.

**Traceability:** Confirmed scope decision 2; rule.md rules 28, 31 (LR2); IP-003.

---

### FR-009: Odour Profile Chart

**Problem:**
A formula's material list does not convey what the formula smells like overall. Grouping the
formula's materials by odour family gives that at a glance.

**User:**
Formulator.

**Requirement:**
The formula view must display the formula's composition grouped by odour type, as a bar chart.
Each material's contribution is derived from the supplied odour fields (`TGSC Odor Type`, and
detection threshold where odour-unit weighting is used). The chart must state which weighting it
applies, since mass percentage and odour-unit weighting give visibly different results from the
same data.

**Precondition:**
Odour type data exists for the materials in the formula.

**Acceptance Criteria:**
- Given a formula whose materials carry odour types, when it is opened, then a bar chart shows
  each odour type's share, and the weighting basis is stated on the chart.
- Given a material with no odour type in the dataset, then it is reported as `insufficient data`
  and is not silently assigned to a family (rule.md rule 59; CER-002).

**Traceability:** Team scope decision 2026-09-10 (MVP formula view). Not evidenced by the
2026-09-02 interview — flagged for honesty about sourcing. Design: `data-model.md` §3.

---

### FR-010: Evaporation Curve over Time

**Problem:**
Materials evaporate at very different rates, so a formula's character changes over the hours after
application. A static list cannot show that.

**User:**
Formulator.

**Requirement:**
The formula view must display, per material, a curve of its predicted intensity over time, with a
time scale the user can adjust. Curves are computed from the supplied volatility fields (Antoine
coefficients, vapour pressure, enthalpy of vaporisation, diffusion coefficient, molecular weight)
against detection threshold. Every curve must cite the equation and the assumptions used
(CER-001), including any assumption not present in the dataset, such as surface area or airflow.

**Precondition:**
Volatility parameters exist for the material, and the requested temperature falls inside the
stated Antoine validity range.

**Acceptance Criteria:**
- Given a formula whose materials carry volatility parameters, when the user requests a time
  range, then a curve per material is returned for that range without a page reload (NFR-002).
- Given a material lacking volatility parameters, or a temperature outside its stated validity
  range, then the result is `insufficient data` or an explicitly flagged extrapolation — never an
  unmarked estimate (rule.md rule 59; CER-002).
- The equation and assumptions behind a displayed curve are retrievable by the user (FR-006).

**Open dependency:** the evaporation model itself is not yet chosen (`project-context.md` §29;
`data-model.md` §7 decision 4). This requirement is not ready to implement until it is.

**Traceability:** Team scope decision 2026-09-10 (MVP formula view). Not evidenced by the
2026-09-02 interview — flagged for honesty about sourcing. Design: `data-model.md` §4.

---

## 5. Non-Functional Requirements

### NFR-001: Single-Screen Formula Comprehension

**Requirement:**
The formula detail view must present composition, quantities, and applicable restrictions
without requiring navigation to a separate page per material.

**Reason:**
Interview pain point 1 — too much information to hold at once. Splitting a formula across a page
per material makes that worse, not better.

**Acceptance Criteria:**
- A user can identify a formula's materials, each one's share of the formula, and any flagged
  restriction from a single open formula view.
- No required navigation to a per-material subpage to see whether that material is flagged.

---

### NFR-002: Immediate Recalculation Feedback

**Requirement:**
Recalculation triggered by an in-place edit (FR-007) must render in the same view without a full
page reload or an explicit save step.

**Reason:**
Interview pain point 4 — evaluating a formula before physically mixing loses its point if
checking a "what if" requires a save-and-reload cycle.

**Acceptance Criteria:**
- Editing a value and triggering recalculation updates the same view in place.
- No save action is required to see the recalculated result.
- Open Question: no numeric response-time target was stated in the interview; this requirement
  is qualitative until a design/performance target is set.

---

### NFR-003: Restricted Access Model, No Public Self-Service

**Requirement:**
The system must not expose a public sign-up flow or a public formula-generation/ordering flow.
Access is limited to the customer organization's internal users.

**Reason:**
Confirmed scope decision 1 — bespoke internal tool, explicitly contrasted with
fragrance-engine.com's public self-service model.

**Acceptance Criteria:**
- No unauthenticated route exposes formula creation, formula viewing, or account
  self-registration.
- New accounts are provisioned only through an internal process (exact mechanism is an Open
  Question).

---

### NFR-004: Core Workflow Independent of Any AI/Model Service

**Requirement:**
Login, formula list, formula view, calculation, rule-highlighting, export, and the odour and
evaporation charts (FR-001–FR-010) must function correctly even if an AI/model service is
unavailable.

**Reason:**
CLAUDE.md "Offline/Core Workflow"; rule.md rule 62 (LR4). Since no generative-AI feature is in
scope this cycle (confirmed via stakeholder meetings, project-context.md §17), this requirement
is currently satisfied by construction — the engine is fully deterministic (CER-003). It is
recorded so a future AI-assisted feature cannot silently introduce a hard dependency into this
workflow.

**Acceptance Criteria:**
- No code path in FR-001–FR-010 calls an external AI/LLM service.
- If a future AI-assisted feature is added elsewhere, its unavailability must not block
  FR-001–FR-010.

---

## 6. Calculation Engine Requirements

No generative-AI/LLM feature is in scope for this build (confirmed via stakeholder meetings,
project-context.md §17, 2026-09-02). The engine is a deterministic physics/chemistry calculation
engine operating on the internal 100-material dataset and its interaction rules. The category
below replaces the generic "AI/Engine Requirement" template with that constraint made explicit.

### CER-001: Explainable Calculation Output

**Requirement:**
Every calculated value and rule flag the engine returns must carry the specific rule id(s),
threshold value(s), and source-data reference(s) used to produce it.

**Input:**
Formula data (materials + quantities), material dataset, rule set, thresholds, material groups.

**Output:**
A calculated value or flag, paired with a citation bundle: rule id, threshold, source data
reference.

**Acceptance Criteria:**
- No numeric result or restriction flag is displayed without an accessible citation.
- The citation includes rule id, threshold, and source data (rule.md rule 58).

---

### CER-002: "Insufficient Data" Response, Never a Guess

**Requirement:**
If the engine lacks a rule, threshold, or source-data row covering a given material or
material-pair, it must return the literal string "insufficient data" for that item — never a
guessed value, and never a silent omission.

**Input:**
A formula item lacking full rule coverage.

**Output:**
"insufficient data" marker in place of a value or flag.

**Acceptance Criteria:**
- Given a material pair with no defined interaction rule, the engine's output for that pair is
  exactly "insufficient data."
- The UI never fabricates a plausible-looking number for an uncovered case (rule.md rule 59).

---

### CER-003: Deterministic Engine, No External Model Dependency

**Requirement:**
The calculations in CER-001–CER-002, and the values shown by FR-004/FR-005/FR-007, must come from
deterministic, project-approved logic operating on the internal dataset. The engine must not call
an external generative-AI/LLM service to derive a material interaction, threshold, or
restriction.

**Input:**
Internal material dataset and rule tables only.

**Output:**
A deterministic calculation, reproducible for the same formula and rule set.

**Acceptance Criteria:**
- No calculation path sends formula, material, or rule data to an external AI/LLM/cloud service.
- Given the same formula and rule set, recalculation produces identical output.

**Traceability:** rule.md §4 framing; confirmed scope decision 3 (no generative-AI feature this
cycle); CLAUDE.md AI/Calculation Rules.

---

## 7. Legal & Compliance Requirements

Derived from `.docs/03-compliance/rule.md` §5. IDs kept identical to rule.md's own labels (LR1–
LR5) for direct traceability; priorities are rule.md's own.

### LR1: PDPA — Consent, Data-Subject Rights, Sensitive-Data Guardrail

**Requirement:**
Because this cycle's core workflow includes login and stored account data, before storing any
account holder's personal data (display_name, email, role, organisation — rule.md rule 3), the
system must record consent (rule 1) and ship, in the same delivery increment as login,
`GET /me/data`, `PATCH /me`, and `DELETE /me` (rule 11). Sensitive personal data (allergy,
patch-test, pregnancy, or religion-revealing preference) is not needed by this cycle's formula-
viewing workflow and must not be implemented without a prior written, owner-approved plan
(rule 7).

**Acceptance Criteria:**
- No account row is created without a non-null `consent_id`.
- An authenticated user can export, correct, and request deletion of their own account data via a
  real endpoint, not an email/manual process.
- No sensitive-data field exists anywhere in this cycle's implementation.

**Traceability:** rule.md rules 1–15; CLAUDE.md Privacy.

---

### LR2: Computer Crime Act §26 — Append-Only Access Log

**Requirement:**
Because login exists in this cycle, `access_log` must ship in the same sprint (rule 26), covering
at minimum login success/failure, logout, formula view, "calculation run," and export/download
(rule 28); append-only (rule 32); tamper-evident (rule 33); retained ≥90 days, configurable up to
2 years (rule 29); timestamps from the server clock, never client-supplied (rule 34).

**Acceptance Criteria:**
- Every login, formula-open (calculation run), and export event produces an `access_log` row with
  the fields listed in rule.md rule 27.
- The application's database role has INSERT/SELECT only on `access_log` — no UPDATE/DELETE.
- Retention is configured to ≥90 days; no TTL/rotation policy shorter than that is accepted.

**Traceability:** rule.md rules 26–40; CLAUDE.md Access Logging.

---

### LR3: Electronic Transactions Act §9/26 — Agreements (Conditional This Cycle)

**Requirement:**
This cycle's core workflow (view, what-if edit, export) has no explicit "I agree / approve" step
— no production-approval or IP-assignment flow is in scope. If a privacy-notice acceptance or any
other tick-to-agree action is introduced as part of account provisioning, it must follow rule.md
rules 41–53: signer identity, server timestamp, document version and hash, auth method recorded,
and re-authentication at the moment of signing for any high-risk act (rule 47) such as dataset
export by an admin or account/version deletion.

**Acceptance Criteria:**
- If any "I agree" control exists in the shipped login/provisioning flow, it records
  `user_id`, `signed_at`, `document_type`, `document_version_id`, `document_hash`, `auth_method`.
- If none exists, this requirement is not yet triggered — flagged as an Open Question below,
  not assumed satisfied or assumed absent.

**Traceability:** rule.md rules 41–53; marked "conditional" because the interview and the
confirmed scope decisions do not establish whether an agreement step exists in this cycle.

---

### LR4: ETDA Principles — Explainability, Insufficient Data, Offline Core Workflow

**Requirement:**
Explainable results (CER-001), "insufficient data" instead of a guess (CER-002), a human
override/feedback path for a wrong result, and a core workflow that keeps working without a
model service (NFR-004).

**Acceptance Criteria:**
- CER-001, CER-002, and NFR-004 are all satisfied (see those entries).
- A feedback channel exists for reporting a wrong calculated result, and each report is logged as
  a defect (rule.md rule 63). Exact channel/UI is left to design — Open Question.

**Traceability:** rule.md §4, rules 58–65; rule.md §5 LR4 (priority: Should).

---

### LR5: Owner IP — Dataset, Rules, and Formulas Stay on Approved Infrastructure

**Requirement:**
The 100-material dataset, interaction/synergy/masking rules, thresholds, material groups, and
saved formulas never leave approved infrastructure; the repository stays private.

**Acceptance Criteria:**
- See IP-001 through IP-004 below.

**Traceability:** rule.md §0.1; rule.md §5 LR5.

---

## 8. Security & Privacy Requirements

### Security

#### SEC-001: Server-Side Authorization on Formula Access

**Requirement:**
Every read of a formula (list or detail) must be authorized server-side against the requesting
user's identity/role. Hiding a link or button on the client is not access control.

Authorization is evaluated against the organisation on the server-side session, never against an
organisation identifier supplied by the client. Every tenant-scoped query filters on that value.

**Acceptance Criteria:**
- A direct request for a formula id the user is not authorized for is denied server-side,
  regardless of client UI state (rule.md rule 21; CLAUDE.md Security Rules).
- A request carrying its own organisation identifier is refused rather than honoured.
- Authorization is checked against the requested record, not only the route, so a permitted route
  cannot return another organisation's formula.

#### SEC-002: No Confidential Data in Logs/Errors/Exports Beyond Scope

**Requirement:**
Access logs, error messages, and the export feature (FR-008) must never contain full formula
content, the underlying rule/threshold tables, or sensitive personal data — only the metadata
needed for the log's or export's stated purpose.

**Acceptance Criteria:**
- `access_log` rows contain `formula_id` + version, never the formula body or material
  percentages (rule.md rule 31).
- Error responses never include a password, password hash, or sensitive personal-data value.

#### SEC-003: Access-Log Implementation Controls

**Requirement:**
`access_log` is append-only (INSERT/SELECT only for the application's DB role); rows are
tamper-evident (chained hash or an equivalent write-once mechanism); timestamps originate from
the server clock; reads of the access log are themselves logged.

**Acceptance Criteria:**
- The application DB role has no UPDATE/DELETE grant on `access_log`.
- Each row's timestamp is server-generated, never accepted from a client (rule.md rules 32–36).
- An admin query of the access log itself produces a logged entry (rule.md rule 36).

#### SEC-004: Credential and Session Handling

**Requirement:**
Passwords are never exposed in logs, error messages, or API responses. Login state is verified
server-side on every formula-list, formula-detail, and export request — not trusted from client
state.

**Acceptance Criteria:**
- No password or password hash appears in any log or error payload.
- A request with an invalid/expired session is rejected server-side even if the client believes
  it is logged in.

#### SEC-005: External-User Trust Boundary

**Requirement:**
SEC-001–SEC-004, LR5, IP-001 and IP-002 were written when every authenticated user was the
customer's own staff. The stakeholder's 2026-09-10 access model adds external clients, who hold a
valid login while sitting outside the customer's company. Server-side authorization therefore
becomes the only separation between one organisation's formulas and another's, and must be
designed for that rather than only for unauthenticated attackers.

**Acceptance Criteria:**
- An external user reaching a formula belonging to another organisation receives a response
  indistinguishable from "not found," so formula identifiers cannot be probed by enumeration.
- Document downloads pass the same record-level authorization check as formula reads; no storage
  reference is served on obscurity alone.
- Access-log entries distinguish external from internal access (LR2).
- No external role has access to what-if recalculation (FR-007), which reveals how a formula
  responds to change.

**Traceability:** `project-context.md` §2 access-model revision (2026-09-10); design in
`.docs/02-design/roles-permissions.md` §6. Priority Must, conditional on the client portal being
in scope for the cycle that ships it. Not triggered in this cycle: the team scope decision of
2026-09-16 keeps the client portal and all external accounts out.

### Privacy

#### PRIV-001: Consent Recorded Before Storing Account Personal Data

**Requirement:**
Before an account record (display_name, email, role, organisation) is created, a consent record
must exist; the write fails if `consent_id` is null.

**Acceptance Criteria:**
- Attempting to create an account without a `consent_id` is rejected at the data layer (rule.md
  rules 1–3).

#### PRIV-002: Data-Subject Rights Endpoints

**Requirement:**
In the same delivery increment as login, ship `GET /me/data` (export), `PATCH /me` (correct), and
`DELETE /me` (erase) for the account holder's own personal data.

**Acceptance Criteria:**
- An authenticated user can retrieve, correct, and request deletion of their own account personal
  data through a real endpoint/screen (rule.md rules 11–15).

#### PRIV-003: Data Minimisation on Account Fields

**Requirement:**
The account schema stores only `display_name`, `email`, `password_hash`, `role`, `organisation`.
No field is added "for later" without a documented purpose tied to the engine or the dashboard.

**Acceptance Criteria:**
- A schema review shows no account field lacking a documented purpose (rule.md rules 3–4;
  CLAUDE.md Privacy).

#### PRIV-004: Sensitive Personal Data — Not Implemented Without Owner Approval

**Requirement:**
This cycle's core workflow does not require allergy, patch-test, pregnancy, or
religion-revealing (e.g., halal/alcohol-free) data. No such field may be added to the
formula-viewing feature without a prior written, owner-approved plan. This is a guardrail against
scope creep, not a designed feature — no sub-problem in the interview raised sensitive data.

**Acceptance Criteria:**
- No sensitive-data column or field exists anywhere in this feature's schema without an attached
  written approval record (rule.md rules 7–10).

---

## 9. Owner IP Requirements

### IP-001: No External Transmission of Confidential Data

**Requirement:**
The 100-material dataset, interaction/synergy/masking rules, thresholds, material groups, and
saved formulas must never be transmitted to a third-party AI/API/cloud service outside the
approved-infrastructure list — including "just for testing."

**Acceptance Criteria:**
- A code/config review shows no call path that sends dataset, rule, or formula content to an
  unapproved external endpoint (rule.md §0.1; CLAUDE.md non-negotiable rules).

### IP-002: No Public Exposure of Dataset or Formulas

**Requirement:**
The real material dataset and saved formulas must never be committed to a public repository or
branch, a gist, a screenshot, or a public demo deployment.

**Acceptance Criteria:**
- Repository review confirms no real dataset file exists outside the approved private location
  (rule.md §0.1).

### IP-003: Export Output Is Scoped, Not a Dataset Dump

**Requirement:**
The export feature (FR-008) returns only the specific formula's already-displayed data for the
requesting authorized user — never the underlying rule tables, threshold definitions, or other
formulas.

**Acceptance Criteria:**
- Exported file content, when reviewed, contains only the single formula's displayed materials,
  values, and citations (rule.md §0.1; LR5).

### IP-004: External-Service Approval Gate

**Requirement:**
If any future feature requires an external service to process owner-IP data, implementation must
stop and the project owner must approve in writing first. Silent adoption of a new SaaS or model
provider is treated as a breach.

**Acceptance Criteria:**
- No new external integration touching dataset, rule, or formula data ships without a recorded
  owner approval (rule.md §0.1, item 3).

---

## 10. Acceptance Criteria — Summary of the Most Important Checks

- A formulator can log in, see her formula list, open a formula, and see every material, its
  computed weight/percentage, its group, and any applicable restriction — all on one view
  (FR-001–FR-005, NFR-001).
- Any number or flag on that view can be explained: which rule, which threshold, which source
  data (FR-006, CER-001).
- A material or pair with no covering rule shows "insufficient data," never a guess
  (FR-003/FR-005, CER-002).
- Editing a value in the open formula recalculates in place, without saving or reloading, so the
  formulator can check a "what if" before mixing (FR-007, NFR-002).
- Exporting a formula produces only what was on screen for that formula and that user, and is
  logged as metadata only (FR-008, IP-003, SEC-002).
- Every login, formula view/edit, and export is written to an append-only, tamper-evident
  `access_log` retained ≥90 days (LR2, SEC-003).
- No account is created without recorded consent, and every account holder can export, correct,
  and delete their own personal data (LR1, PRIV-001, PRIV-002).
- Nothing in the dataset, rules, thresholds, groups, or saved formulas is sent to an unapproved
  external service or made public (LR5, IP-001–IP-004).
- No path in the core workflow depends on an external AI/model service; there is no
  generative-AI feature in this build (NFR-004, CER-003).

---

## 11. Open Questions

These cannot be resolved from the single interview available and must not be guessed:

1. **Formula-creation gap.** Authoring a brand-new formula from an empty state is explicitly out
   of scope for this cycle. How do formulas get into the system in the meantime — seed data,
   import from an existing file/spreadsheet, or direct database insertion by the domain expert?
   Open Question.
2. **Account provisioning.** Since there is no public signup (NFR-003), how are internal user
   accounts created, and by whom? The stakeholder's 2026-09-10 answer (`project-context.md` §2)
   says internal and external accounts are provisioned differently, which narrows this but does
   not name the mechanism. Still Open.
3. **Formula visibility/sharing model.** rule.md rule 21 says "a perfumer may read only their own
   profile and their own formulas," but it was unclear whether "own formulas" means only formulas
   that user personally created, or all formulas within the customer's organization/team. The
   2026-09-10 stakeholder answer says visibility is **organisation-scoped**, not per-individual.
   Remaining question is how that reconciles with rule 21's narrower wording, and what an
   external client may see of an organisation's formulas.
4. **Whether an explicit "I agree" step exists anywhere in the login/provisioning flow**
   (privacy notice acceptance, terms). This determines whether LR3 is triggered now or later.
   Open Question.
5. **Recalculation performance target.** No numeric response-time target for FR-007/NFR-002 was
   stated in the interview. Open Question for design.
6. **Export file format.** PDF, CSV, JSON, or something else — not specified by the interview.
   Open Question for design.
7. **Save semantics for "what-if" edits.** FR-007 is explicitly "light in-place editing" for
   evaluation; it is unresolved whether a trial edit can ever be persisted as a real formula
   change, and if so, whether that requires a different permission level than viewing. Open
   Question.
8. **Evaluation panels and agreements/approvals** are part of the broader product concept in
   `project-context.md` but are not evidenced by this interview and are out of scope for this
   build cycle. Deferred, not designed here.
9. **Sensitive personal data** (allergy, patch-test, pregnancy, religion-revealing preference) is
   not required by anything in this interview. PRIV-004 exists purely as a standing guardrail
   carried over from `rule.md`/`CLAUDE.md` in case such a field is ever proposed later — it is
   not a feature being built now.
10. **Administrator role's exact capabilities** are not evidenced by the interview and are out of
    scope this cycle beyond the general server-side authorization requirement (SEC-001) that
    applies to any role.

---

## Traceability

Every requirement above is traced to one of:
- The 2026-09-02 interview (Section 3 pain points), or
- An explicit rule number in `.docs/03-compliance/rule.md`, or
- An explicit section of `CLAUDE.md`, or
- A confirmed scope decision given directly for this build cycle (cited by number where used).

No requirement in this document is based on invented interview evidence, invented legal rules, or
invented chemistry/domain rules.
