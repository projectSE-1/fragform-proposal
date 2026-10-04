<!-- AI Perfumery Engine project documentation; ownership follows the owner's existing agreement. No new licence is granted. -->
# AI Perfumery Engine — Legal & Compliance Rules (rule.md)

**Company / Product:** AI Perfumery Engine — ระบบผู้ช่วยคำนวณและออกแบบกลิ่นน้ำหอมด้วยฟิสิกส์เคมี
**Course:** 1305493 SE Case Studies, 1/2569 — Week 2 in-class case
**Status:** Living document. Read this before writing any code that touches user data or user actions.
**Updated:** 2026-10-04 — owner-directed MVP revision: retain Honney's stack and adapt the linked frontend's MVP and stronger engineering controls. Rules 1–63 keep their existing numbering; rules 64–90 below are project controls, not additional statutory claims.

**Baselines:** [MVP scope](../02-design/mvp-scope.md) · [Honney technology stack](../02-design/tech-stack.md) · [backlog](../01-requirements/backlog.md). The source frontend is a design/mock reference at commit `aa572abaede14c11796a1551434858171eb37363`, not an implemented or legally validated service. This revision retains the W2 legal research; it does not independently verify current law or approve the source's draft legal text.

---

## 0. Scope — what this product actually holds

The engine takes a chemical/physical dataset of 100 aroma materials (supplied by the domain expert),
applies interaction rules (synergy / masking / evaporation over time, thresholds, material groups),
and shows the predicted result on a dashboard. Around that engine there are **accounts, logins,
saved formulas, evaluation panels and agreements** — that is where the law bites.

| Class | Examples in this system | Governing rule below |
|---|---|---|
| **A. Personal data** | perfumer/user account (name, email, role), `created_by` / `edited_by` on a formula, client-brief contact, panel-tester identity, interview notes from DISCOVER | PDPA |
| **B. Sensitive personal data** | skin allergy / sensitisation records, patch-test results, pregnancy status, "alcohol-free / halal only" preference (**reveals religion**) | PDPA — sensitive |
| **C. Owner IP / trade secret** | the 100-material dataset, interaction logic, thresholds, group definitions, saved formulas | not PDPA, but §0.1 below |
| **D. Access / traffic logs** | login, export, formula edit, calculation run | Computer Crime Act §26 |
| **E. Agreements** | consent tick-box, IP-assignment acceptance by co-developers, "approve this formula for production" sign-off | Electronic Transactions Act |

### 0.1 Owner-IP rules (contract, not statute — but non-negotiable)

- The agent must **never** send the material dataset, interaction rules, thresholds or any saved formula
  to a third-party AI/API/cloud service that is not on the approved list, even for "just testing".
- The agent must **never** make the repository, database dump, or dataset public, and must not commit
  real dataset files to a public branch, a Gist, a screenshot, or a demo deployment.
- If a feature requires an external service to see class-C data, **stop and ask the project owner in
  writing first**. Silent adoption of a new SaaS/model provider is a breach.
- Every generated file must carry the ownership header agreed with the owner; the agent must not add
  its own licence file (MIT/Apache) to this repo.

### 0.2 MVP obligations and readiness

Public signup creates a pending account. It does not grant access to formulas, reference data, lab records or other owner IP. Personal-data writes, including pending signup records, still require consent evidence before the write. Public pages show static approved content only.

Authentication ships with consent evidence, own-data view/correction/erasure, local access-log writing, restricted log querying/export, retention, backup/restore and incident controls (rules 1–40). Deferring the source's full X4-S6 audit dashboard does **not** defer rule 38's restricted query/export capability or any mandatory log control. An admin-handled deletion request alone does not satisfy rule 11's working erasure endpoint.

The scope decision does not approve a production regulatory dataset, chemical model, uncertainty tier, weighing tolerance, external service or privacy notice. Where these are unresolved, the affected implementation task remains unready and the system must return `insufficient data` rather than use source fixture values. Sensitive-personal-data features remain outside this MVP and subject to rules 7–10.

---

## 1. PDPA (Personal Data Protection Act B.E. 2562)

**What it is (TH):** กฎหมายคุ้มครองข้อมูลส่วนบุคคล — ถ้าระบบเก็บ "คน" ไม่ใช่แค่ "สาร" เรามีหน้าที่ตามกฎหมายทันที
**What it is (EN):** Thailand's data-protection law. The moment this system stores something that identifies
a real person — a perfumer's email, a panel tester's name, an interview note — we become a data controller
with duties, and that person gets rights we must ship as **features**.

**What it requires:** lawful basis (consent) · purpose limitation · data minimisation ·
access / correct / delete · extra protection for sensitive data (health, religion, biometrics).

### Rules for the agent

**Collecting & storing**

1. If the system stores a person's name, email, phone, photo or free-text note about a person, it must first
   record a consent record, and the write must fail (not warn) if `consent_id` is null.
2. If the agent creates any table containing personal data, it must add these columns in the same migration:
   `purpose_code`, `consent_id`, `created_at`, `retention_until` — no personal-data table ships without them.
3. If the agent designs the user account, it must store **only** `display_name`, `email`, `password_hash`,
   `role`, `organisation`. It must not add date of birth, ID-card number, home address, or gender
   "for later" — if a field has no stated purpose today, do not create the column.
4. If a screen asks for a field that is not used by the engine or the dashboard, the agent must delete the
   field from the design instead of storing it. "Store everything in case" fails PDPA minimisation.
5. If the system records evaluation-panel results (people smelling a blend and rating it), it must store the
   rating against a **pseudonymous panelist code**, and keep the code-to-identity mapping in a separate table
   that only the `panel_admin` role can read.
6. If the system stores a client brief for a perfumer, contact details belong in a `client_contact` table
   linked by id — the agent must not copy customer names into the formula's free-text notes.

**Sensitive data (class B) — highest bar**

7. If a feature needs allergy, skin-reaction, patch-test, pregnancy or medical-restriction data, the agent must
   **stop and ask the owner before implementing it**, and must not create the column until an explicit written
   plan exists (Guardrail 4).
8. If the goal is only "this person must avoid material X", the agent must model it as a non-medical flag
   (`avoid_material_id`, `reason = 'user_preference'`) instead of storing a diagnosis or a test result.
9. If the system offers an "alcohol-free / halal" preference, it must treat that field as sensitive
   (religion-revealing): explicit separate consent, encrypted at rest, excluded from every export,
   report, CSV and analytics event.
10. Sensitive fields must never appear in logs, error messages, stack traces, crash reports, or LLM prompts.

**Rights as features**

11. If the system has user accounts, it must ship three real screens/endpoints in the same sprint as login:
    **`GET /me/data` (export as JSON/CSV), `PATCH /me` (correct), `DELETE /me` (erase)**.
    "Email the admin" is not an implementation.
12. If a delete request is executed, it must cascade to derived rows (panel entries, comments, session rows,
    search caches), and the agent must list in the PR description every table touched and every table
    deliberately kept.
13. If personal data exists in backups, the deletion routine must record a `pending_backup_purge` entry with a
    date; the agent must not silently leave the data in backups without documenting it.
14. A delete must **not** delete the §26 access log — see rule 30. The agent must instead strip the profile
    and keep the minimum identifier, and must document this exception in the privacy notice.
15. If consent is withdrawn, the system must stop the processing for that purpose within 24 hours and mark the
    consent row `withdrawn_at` — it must not hard-delete the consent row (that row is our evidence).

**Purpose, sharing, transfer**

16. If data was collected for "using the perfumery engine", the agent must not reuse it for marketing,
    newsletters, model training or ranking. Any new purpose = new purpose code + new consent.
17. If the agent adds analytics, telemetry, crash reporting or a third-party widget, it must not send
    `user_id`, email, or formula content, and the vendor must be named in the privacy notice first.
18. If any component (DB, storage, LLM API, hosting) is outside Thailand, the agent must list it in
    `docs/privacy/transfers.md` and flag it to the owner before deploying.
19. The agent must never paste real interview transcripts, user emails, or panel records into a public LLM.
    For development it must generate clearly-labelled **synthetic** records (`seed_demo_*`), and must never
    present synthetic people as real research participants.
20. If a bug requires production data to reproduce, the agent must use a masked copy — never a raw dump.

**Access control, breach, notice**

21. Every read of personal data must be permission-checked server-side. A user may read their own profile;
    reading another person's data requires the documented administrative permission and rule 22's log.
    Formula access requires both an action permission and a record check against the active organisation
    and any narrower ownership restriction in `roles-permissions.md`. An authorised lab user may read
    permitted formulas in that organisation, including formulas created by another authorised lab user;
    signup, a client-supplied organisation id, or hiding a button never grants that access.
22. If an admin views another user's personal data, the system must write an access record
    (who, whose data, when, why).
23. If the system detects a personal-data breach, it must alert the owner immediately and support notifying
    the PDPC **within 72 hours** — the agent must build an incident log, not rely on an ad-hoc email.
24. The privacy notice must live in the repo as a versioned file (`docs/privacy/notice-v{n}.md`).
    If the notice changes materially, the system must re-ask for consent, not silently update the text.
25. Retention: DISCOVER interview notes and recruitment data must have an explicit deletion date; the agent
    must implement a scheduled purge, not a manual promise.

---

## 2. Computer Crime Act B.E. 2550, Section 26

**What it is (TH):** ผู้ให้บริการต้องเก็บ "ข้อมูลจราจรทางคอมพิวเตอร์" (ใคร/เมื่อไหร่/จากไหน) ไม่น้อยกว่า 90 วัน
และเก็บข้อมูลที่ระบุตัวผู้ใช้ต่ออีก ≥90 วันหลังเลิกใช้บริการ — ไม่ทำ ปรับไม่เกิน 500,000 บาท
**What it is (EN):** If people log into our system, we are a "service provider" (§3 covers any app that stores
data for other people's benefit — not just ISPs). We must be able to say **who accessed what, and when**, and
keep that trail for at least 90 days.

**What it requires:** an access/traffic log tied to a real user, retained ≥90 days (extendable to 2 years on
official order), including ≥90 days after the user stops using the service.

### Rules for the agent

26. If the system has a login, it must create the `access_log` table in the **first** sprint that adds
    authentication — logging is a Must backlog item, not a later hardening task.
27. Every access-log row must contain: `event_id`, `actor_user_id` (or `role` + session id for pre-auth
    events), `source_ip`, `user_agent`, `occurred_at` (UTC, ISO-8601 with offset; displayed as Asia/Bangkok),
    `action`, `target_type`, `target_id`, `result` (success/fail).
28. The system must log at minimum: login success, login failure, logout, password change/reset, role or
    permission change, account creation/deletion, formula create/update/delete, **calculation run**,
    **every export or download** (CSV/PDF/JSON of formulas or the material dataset), API-key use,
    and any admin access to another user's data.
29. Retention must be **≥90 days** and configurable upward to 2 years. If the agent writes a TTL, cron job,
    log-rotation policy, S3 lifecycle rule or container log limit shorter than 90 days, that is a defect —
    the agent must refuse the config and say why. Saving storage cost is not a valid reason.
30. If a user deletes their account, the system must keep the identifying information linked to their past log
    entries for **at least 90 days after the account ends** (§26 paragraph 2) in a restricted
    `retained_identity` table, then purge it automatically.
31. The log is **metadata, not content**: the agent must log `formula_id` + `version`, not the formula body,
    the chat text, or the material percentages. Logging content is both unnecessary under §26 and a PDPA
    minimisation failure.
32. Logs must be append-only: the application database role gets INSERT and SELECT on `access_log`, and no
    UPDATE or DELETE. Purging runs under a separate scheduled role.
33. The agent must add tamper-evidence: a per-row hash chained to the previous row (or an external write-once
    log store), so an altered log is detectable.
34. Timestamps must come from the NTP-synced server clock. The agent must never write a client-supplied
    timestamp into the access log.
35. If authentication uses Firebase / Google OAuth / any external identity provider, the system must still
    write its own access log inside our system. Relying only on the provider's console is a §26 failure.
36. Reads of the access log must themselves be logged (who queried the logs, when, for what date range).
37. Logs must survive redeploy: never write them only to an ephemeral container filesystem, and include them
    in backup and restore testing.
38. The agent must build an admin query/export screen that can answer "what did user X do between date A and
    date B" within minutes, because that is the shape an official request takes.
39. Any environment with real users (production, and staging if real accounts log in) must have full logging
    enabled; the agent must not gate logging behind a flag that defaults to off.
40. The agent must record in `README.md` who the log custodian is, where logs are stored, and the current
    retention setting.

---

## 3. Electronic Transactions Act B.E. 2544, §9 / §26 / §28

**What it is (TH):** การกดยอมรับ/ติ๊ก checkbox มีผลทางกฎหมายเป็น "ลายมือชื่ออิเล็กทรอนิกส์" ถ้าพิสูจน์ได้ว่าใครเป็นคนกด
แสดงเจตนาอะไร และวิธีนั้น "น่าเชื่อถือพอ" กับมูลค่า/ความเสี่ยงของธุรกรรมนั้น
**What it is (EN):** An electronic action counts as a signature if it (1) identifies the signer and shows their
intent, and (2) uses a method reliable enough for the value and risk of that transaction (§9). Meet the four
control/tamper tests and the law presumes it reliable (§26). Issuing certificates to other people makes you a
Certification Authority with its own duties (§28) — we are not going to do that.

**What it requires:** identify + intent + reliability proportionate to risk (§9) · signer-linked,
signer-controlled, alteration-detectable records (§26) · CA duties if you ever issue certificates (§28).

### Rules for the agent

**Recording any agreement**

41. If the user clicks "I agree", "Accept", "Approve" or "Confirm" on **anything**, the system must record:
    `user_id`, the signer's name at that moment, `signed_at` (server clock, UTC + Asia/Bangkok),
    `document_type`, `document_version_id`, `document_hash` (SHA-256 of the exact text shown),
    `auth_method`, `ip`, `user_agent`. "The user clicked OK" with no timestamp, no text version and no user id
    fails §9's own reliability test.
42. The system must store an **immutable copy or hash of the exact text version the user saw** — never just a
    link to a page whose content can change later.
43. Consent and agreement texts must be versioned files in the repo. If the text changes, the agent must create
    a new version id and must not retro-apply it to existing signature records.
44. The tick-box must be unticked by default, the button must state the actual act
    ("I agree to assign IP in this project", not "Continue"), and intent must be a separate deliberate action —
    the agent must never infer agreement from scrolling, browsing, or continued use.
45. Signature records are append-only: the agent must never UPDATE or DELETE a signature row. A correction
    creates a new row that references the old one.

**Reliability must scale with risk (§9)**

46. Low-risk acts (free account sign-up, accepting the privacy notice) may be a tick-box plus a logged session.
47. High-risk acts must require **re-authentication at the moment of signing** (password re-entry or OTP), and
    the method used must be stored in `auth_method`. In this product, high-risk means:
    - accepting the **IP-assignment / confidentiality agreement** as a co-developer,
    - approving a formula for production or external release,
    - exporting or transferring the material dataset,
    - granting another account admin or dataset-read rights,
    - deleting a user account or a formula's version history.
    This control applies whenever an included high-risk action is performed, even if it is not labelled
    as an agreement screen. Administrative actions on other users require fresh MFA step-up under rule 80.
    Formula history remains immutable under the MVP; listing a high-risk act here does not authorise
    a history-deletion feature or bypass its retention/ownership controls.
48. The agent must not apply one signature standard to every feature; a per-action risk level belongs in the
    design doc before the code is written.

**Presumed-reliable tests (§26)**

49. The signing credential must belong to one identified person: no shared team accounts, no shared login on
    the lab machine, no "signed by the admin on behalf of X". If the design needs delegation, stop and ask
    the owner.
50. If an admin-impersonation ("view as user") mode exists, the system must block every signing action inside
    it and mark the session as impersonated in the log.
51. The system must make alteration detectable on both sides: hash the signature record **and** the signed
    document, and expose a verification view showing who signed, when, which version, and the hash.
52. The signer must be able to download or receive a copy of exactly what they signed, immediately after signing.
53. Withdrawing consent must not erase the signature evidence — mark it withdrawn and keep the record under its
    own retention rule (see rule 15).

**Certificates (§28)**

54. The agent must not build a Certificate Authority, issue digital certificates to outside parties, or design a
    "we issue signing keys to clients" feature. If a requirement seems to need one, stop and escalate — that
    triggers §28 duties plus §§32–34 registration/licensing.
55. If certificate-grade identity is ever required, the system must integrate an existing CA
    (Thai Digital ID, a bank, or DBD e-Certificate) rather than becoming one.
56. Self-signed certificates are allowed only for internal transport inside our own closed environment, never
    issued to an outside party as proof of identity.
57. If any PKI-based signing is added, the design must include a key-compromise report channel and an immediate
    revocation path, plus a revocation/expiry check before a signature is accepted.

---

## 4. Extra — AI-specific rules (ETDA principles; beyond today's three laws)

The engine *predicts* how materials interact. A wrong prediction can end up as a blend someone puts on skin,
so the Air Canada rule applies: **we own what our system says.**

58. Every calculated result must show which rule, threshold and source rows produced it — no unexplained score.
59. If the engine has no rule covering a material pair, it must return "insufficient data", never a guessed value.
60. Any generative/LLM feature must be labelled as a suggestion, must cite the dataset rows it used, and must
    never invent a material, a CAS number, a concentration limit, or a safety claim.
61. Every safety-relevant output must carry the disclaimer agreed with the owner and a human-override path.
    Human review may correct inputs or escalate a disputed rule; it must not bypass a sourced hard block
    or present an inconclusive result as safe (rules 66, 69, 84).
62. The core workflow (browse materials, record a formula) must still work when the AI/model service is down.
63. Users must have a feedback channel to report a wrong result, and every report must be logged as a defect.

---

## 5. Legal requirements traced from W2

| ID | Law | Requirement | Priority |
|---|---|---|---|
| **LR1** | PDPA | If we store a user's name/email or any panel-tester record, we take consent first and ship view / correct / delete as real features; sensitive fields need the owner's written plan. | Must |
| **LR2** | CCA §26 | Keep an append-only access log (who, when, from where, what action) ≥90 days, including ≥90 days after an account ends. | Must |
| **LR3** | ETA §9/26 | Every "I agree" / approval is recorded with user id, timestamp, text version and hash; included high-risk actions require re-authentication even without a separate agreement screen. | Must |
| **LR4** | ETDA principles | Explainable results, "insufficient data" instead of guesses, human override, and a core workflow that works without the model. | Should |
| **LR5** | Owner IP | Dataset, rules and formulas never leave approved infrastructure; the repo stays private. | Must |

**Backlog note:** LR1–LR3 go into the same sprint as signup/login and the first relevant write. LR3 is active
for signup consent/terms, consent changes, privileged account actions and erasure in this MVP. Production
approval and IP-assignment screens remain deferred; their absence does not make LR3 conditional. LR4 keeps
its W2 priority, while the local CER-001–005 requirements make the applicable result controls Must.
Compliance sits inside the core workflow, not in a hardening sprint at the end.

---

## 6. Adopted MVP and engineering controls (rules 64–90)

These rules adapt the source's presentation, access, lab and collaboration controls to **Next.js + TypeScript,
Go + Gin, PostgreSQL, sqlc + pgx**. They do not adopt its Vite/Mantine/FastAPI implementation or source-specific
dependency versions. Traceability uses local FR/CER/SEC/PRIV/NFR IDs in the backlog.

### Result honesty and domain boundaries

64. The browser is a presentation/input layer. Quantities, percentages, totals, conversions, uncertainty,
    compliance verdicts and reportable rounding come from the Go service and approved engine. A shared
    formatter displays the server's decimal precision and units; locale may change separators and labels,
    never the numeric value. Client format validation does not replace server business validation.
65. Every estimated/reportable result must include its interval, confidence/tier, unit, display precision
    and provenance reference (`ReportedValue`). Exact, entered or declared quantities use `Quantity` and
    must not receive a fabricated interval. An uncertain computed result must not be relabelled exact merely
    because the source schema allows it. Unapproved tier definitions or unquantified uncertainty yield a
    missing/insufficient-data state, not a synthetic confidence score.
66. `MissingValue` must have an explicit reason such as not measured, no data, out of scope, unquantified or
    calibration required. Missing, zero, loading and empty are distinct. Compliance has distinct pass,
    exceed and inconclusive states; neither a central estimate nor missing evidence can turn inconclusive
    into pass. Preserve the source status and reason instead of hiding the affected result.
67. Results identify formula version, input/context, model/rule/dataset versions, server evaluation time and
    the seed when the approved engine uses one. An input change and a model/version change have separate
    indicators. A stale result is marked unavailable/stale and cannot be treated as a current result;
    fresh analysis is required. Sampling and seed behavior require an approved model, not an LLM.
68. Every result and error-budget contribution must navigate to **complete** provenance, accessible as a
    list/tree in this MVP even though a graphical DAG viewer is deferred. Profile A and Profile B must
    preserve their explicit physical/context inputs, equations and assumptions and be presented side by
    side where the model supports them, with uncertainty bands for curves. Missing definitions/inputs or
    source rows remain insufficient data; the UI must not invent either profile.
69. A prohibited-material or lab hard block has no bypass, dismissal or override for any role. Enforce it
    in Go as well as the UI and show its rule/source/version and remediation. Domain thresholds, scope gates
    and their action effects require approved evidence; source fixture thresholds are not production rules.
70. Do not silently normalise formula mass percentages to 100%. The server validates declared totals and
    returns the actual shortfall/excess for correction before persistence. User-entered decimals travel as
    decimal strings preserving entered precision; displayed percentage, mass and total derive from the
    same server result. A what-if result is distinct from an explicitly saved immutable formula version.
71. Unit conversions need approved source inputs and uncertainty. A volume-to-mass conversion needs density
    and its uncertainty; drops need measured calibration for the material/instrument pair. Do not use a
    universal drops-per-millilitre constant. Unsupported units or absent calibration return insufficient
    data and cannot produce a ready-to-use mixing instruction.

### UI, access and account controls

72. Fail closed on 401/403/409/422/5xx, timeout or unavailable analysis. Do not show a previous response as
    current success, infer a missing number, or claim a write was not saved when its outcome is unknown.
    Show an appropriate error/state and reference code with safe retry/reconciliation; never disclose
    stack traces, SQL, credentials or personal data. Each screen has loading, success, empty and error states.
73. Render document/user text as text, never executable HTML. Reject unsafe link schemes; externally
    supplied links permit only reviewed HTTP(S) destinations. Server-side file validation and safe download
    headers remain required; client sanitisation does not authorise a resource or make a file safe.
74. No secrets in frontend source, bundle, commits, screenshots or reports. Do not persist tokens, formulas,
    personal data or results in browser local storage or a shared Next.js cache/public build. Session cookies
    are HttpOnly and securely server-controlled; CSRF/step-up tokens stay in memory. Local preferences may
    contain only non-confidential values such as pre-login language. A leaked secret is reported and rotated,
    not merely deleted from a later commit.
75. All user-facing copy has TH/EN translations; scientific vocabulary requires a confirmed glossary.
    Numeric precision stays identical between languages. Inputs have labels, keyboard access and visible
    focus; states use text/icons as well as colour. Respect reduced-motion settings and test desktop/mobile
    layouts and accessibility. Shared theme/components enforce consistent design without requiring the
    source's component library. Font/icon/image assets are locally bundled with verified usage rights.
76. Tutorials are opt-in, skippable and reopenable; every sandbox screen is labelled demo. They do not write
    real formulas, analyses, lab measurements or grants; only own tutorial progress may be persisted.
    Mascot tips are static and do not invent numbers or safety claims. Tutorial/game effects never cover
    MFA, a block, an error or required confirmation; rewards stay in the tutorial and there is no leaderboard.
77. Signup and invitations require the current versioned consent/terms evidence before writing personal
    account data. Separate deliberate unticked controls record their purpose and document versions;
    continued use is not consent. A newly created account has no domain role or automatic permission.
    Pending users may access public content, authentication and their own account/rights only; a role is
    granted through the authorised administrative flow, never selected at signup.
78. Login, signup, resend-verification and reset flows do not disclose whether an account exists. Email
    verification/reset/invitation links are single-use and expiring; emails carry links, never passwords,
    formulas or computed results. Password minimums, throttling and token/session expiry are server policy
    values to be settled locally, not copied from mock examples. Tokens are not printed in production logs
    or browser consoles; resetting/changing credentials revokes the other sessions as designed.
79. Go verifies every session, MFA requirement and CSRF token on state changes. A role that requires MFA
    cannot skip enrolment or turn MFA off while holding that role. Clearing frontend state or selecting
    another tenant never satisfies an auth/MFA gate. Keep the active organisation in server-verified context
    and invalidate confidential client state on logout, revoked permission or context change.
80. Only the fixed role identifiers and action/record mapping in `roles-permissions.md` may be used. Refuse
    self-grants server-side and record the security event. Administrative actions on other accounts need
    fresh MFA step-up, an explicit reason and an append-only access event; a client-submitted grant, role
    name or step-up token is never trusted without verification. Cross-organisation administrative access
    requires a separately permitted explicit action and logging, not a permanently open all-tenant view.
81. Own-profile correction, data export and executable erasure stay available without a domain role under
    rule 11; ownership is checked in Go. An optional request/review workflow must not replace these real
    rights endpoints. Deletion and consent withdrawal keep only the documented minimum log/signature evidence
    and pending backup purge, with re-authentication and retention exceptions explained to the requester.

### Lab, documents and production evidence

82. Each weighing requires the user's explicit instrument choice and verified calibration/eligibility;
    no silently chosen instrument. The server enforces the instrument's input precision and returns its
    uncertainty/verdict. A valid actual measurement is retained even when its verdict is BLOCK; BLOCK
    prevents the next step. Reweighing appends a reason-linked record, never overwrites history. A blocked
    step resumes only through the approved pre-dilution/remediation flow; numeric WARN/BLOCK tolerances,
    calibration and dilution rules remain gated until evidenced and approved locally.
    Log weighing/reweigh/pre-dilution actions as metadata without measured contents or formula bodies.
83. Document uploads are typed and server-checked: CoA/GC-MS bind to a lot; SDS/TDS/IFRA certificate of
    conformity/allergen declarations bind to a SKU. Reject an unsupported type or wrong subject. Validate
    content type/size, quarantine unsafe/unscanned files and show processing/failure states. Authorisation
    and record checks also protect storage/download paths. A new SDS is retained alongside the earlier
    version with provenance rather than overwriting it. Scanner/storage services need existing IP/privacy
    approval; uploading a file does not itself approve the file's scientific or legal content.
    Log document creation/versioning/upload/download actions as metadata without document contents.
84. Compliance findings remain grouped by supported jurisdiction and applicable category/rule version;
    no single unsupported worldwide-compliant claim. The owner-approved disclaimer is versioned source
    content shown with safety views and included safety findings in authorised exports. Every such finding
    cites its underlying rule/source; incomplete citation is `data_missing` and blocks a safety/compliance
    export. R2 regulatory export/notification stays deferred in the MVP; this control does not add it.
85. Source mocks, tutorial datasets and demo legal copy are labelled synthetic and separated from real
    services/data. A mock response is evidence of a UI scenario only, never proof of an implemented engine,
    valid identity check, successful scan, measurement or compliance. Mocks cannot enter production builds
    or act as a fallback for an unavailable real service. No real owner dataset/formula/personal record is
    added to a fixture, screenshot, public page or unapproved AI prompt.

### Supply chain, traceability and delivery

86. Before adding a package/action/tool, verify its exact name, version, official registry/repository,
    maintainer history, install/lifecycle scripts, transitive risks, licence and compatibility from primary
    sources; record the check. Do not install a name just because an AI recommends it or run downloaded code
    by piping it into a shell. Use free tools first; paid or AGPL dependencies require an explicit owner
    decision. Preserve licence obligations for third-party assets without adding a new licence to owner IP.
87. Pin reviewed dependency versions and maintain reproducible lock/module checksums for Next.js and Go;
    review upgrades with their compatibility/security evidence separately from feature work. Pin CI actions
    to reviewed commit SHAs. Upstream version tables and claims of previous testing do not count as local
    verification. Select commands/libraries for `tech-stack.md`, not the source's Vite/FastAPI scripts.
88. Start significant implementation only when the task is Ready: problem/user/behavior, local acceptance
    criteria, permission/record boundary, engine/API contract, applicable rules and no unresolved domain/legal
    decision. Maintain backlog → design → compliance → implementation → meaningful test traceability.
    When information is missing or sources conflict, record `insufficient information` and resolve the
    local decision; unavailable source PDC/INV references do not supply a decision or waived gate.
89. Changes update affected local backlog/design/rules and the reviewed API contract, generated types,
    Go handlers and mocks together. Do not hand-edit generated types or silently introduce incompatible
    shapes; version a breaking contract. Local law/rules/backlog retain the AGENTS.md authority order;
    the source repo's separate-repository/copy-only policy is adapted to this repository, not imposed here.
90. Work is reviewed through focused branches/PRs with the requirement, validation and applicable security
    changes explained; existing owner-authorised edits on Honney remain valid. Do not push/force-push directly
    to the protected integration branch. Done means acceptance criteria met and meaningful Go/frontend/
    contract/browser/security checks pass, with review/merge evidence for delivered changes. CI must not
    report skipped application tests as proof that an application works. Keep screenshots/data synthetic.

---

## 7. Source-rule adoption record

**Source:** `sattasarasadaw-crypto/ai-perfumery-engine-frontend` at
`aa572abaede14c11796a1551434858171eb37363` (2026-10-04 review). References below name inspected source
paths/sections; their upstream requirement numbers are not local requirement IDs.

| Decision | Source and useful rule | Local treatment / reason |
|---|---|---|
| Retain local | Existing rules 1–63; W2 LR1–LR5 | Keep consent-before-write, minimisation, real rights endpoints, immutable agreements, local append-only logs, incident/backup/retention and owner-IP approval. Clarify rule 21's authorised org scope and unconditional rule 47 step-up. |
| Adapt | `docs/handoff/README.md` §2 rules 1–8; `api/README.md` §4; `api/openapi.yaml` `info.description` | Rules 64–66, 72–75, 77–80: server-owned numbers, honest reported/exact/missing types, deny-by-default domain access, safe errors, no secrets, TH/EN and XSS controls. Go is the authority. |
| Adapt | `docs/wireframes/R1-analyze-formula-workspace.md` §0 | Rules 67–70: error budget → complete provenance, no silent normalisation, Profile A/B with intervals, seed/version/input distinctions. Complete list/tree replaces a deferred graphical DAG. |
| Adapt | `docs/wireframes/R2-comply-compliance-panel.md` §0 | Rules 69, 83–84: jurisdiction separation, inconclusive state, hard blocks, typed documents, append-only SDS and cited/versioned disclaimer. All regulatory values need approved sources; deferred R2-S4–S6 remain deferred. |
| Adapt | `docs/wireframes/X1-login-mfa-access.md` §0; `X4-admin-users-roles-audit.md` §0; `X6-account-signup-self-service.md` §0 | Rules 77–81: non-enumerating authentication, no self-grants, pending users' own-account exception, enforced MFA, explicit cross-org administration, consent and expiring links. Minimal own rights/log controls remain mandatory. |
| Adapt | `docs/wireframes/X3-manual-weighing-per-item-balance.md` §0; `J15-mixing-sheet-unit-bridge.md` §0 | Rules 71, 82: explicit calibrated instrument, preserve blocked measurements, no bypass, append-only reweigh, sourced density/drop calibration. Do not import the source's numerical tolerances or unmerged batch-instrument fallback. |
| Adapt | `docs/wireframes/X7-public-pages-onboarding-tutorial.md` §0 | Rules 76, 85: static public content, opt-in sandbox, static mascot, no live-data games or excessive claims, reduced motion. |
| Adapt | `CONTRIBUTING.md` §§2, 3.6, 7–10, 12–13; `api/README.md` §5 | Rules 75, 86–90: language/accessibility, supply-chain checks, pinned dependencies/actions, contract synchronisation, focused review, CI, Ready/Done and written decisions. Check tools against the Honney stack when implementing. |
| Do not adopt | `CONTRIBUTING.md` §§0, 3–6, 11; `docs/handoff/README.md` §§3–4 | Vite/Mantine, FastAPI/SQLAlchemy, exact package/runtime versions, source commands and separate-repo ownership conflict with the owner's retained Honney stack. No package/version testing claim is copied. |
| Do not adopt | `api/README.md` §§2, 7; `docs/handoff/README.md` §9 H11–H12; `content/legal/*` drafts | Fixture limits, toy analysis/confidence, draft privacy terms and references to absent PDC/internal specs are unverified source material, not approved local domain/legal rules. Public legal copy still needs owner identity/contact/retention and review before real use. |
| Do not adopt | `docs/handoff/README.md` §1 audit deferral; `X6-account-signup-self-service.md` §0(8); `X4-admin-users-roles-audit.md` §0(6) | Do not defer mandatory log writing/query/backup/incident controls, replace rule 11 erasure with only an admin request, or let a general signer-export ban remove rule 52's right to receive their own signed copy. Restrict third-party/internal exports under the retained local rules. |

**Remaining owner/domain inputs:** approved infrastructure and external-service list; ownership-header text;
controller/contact and reviewed privacy/terms/retention text; initial role-holder/bootstrap approval and operational MFA/session policy;
official regulatory/category mappings and disclaimers; chemical/profile models, uncertainty tiers, instruments,
calibration and WARN/BLOCK/pre-dilution thresholds. The MVP scope alone does not resolve these values.

---

*Refs: PDPA B.E. 2562 · Computer Crime Act B.E. 2550 §3, §26, §27 (fine ≤ 500,000 THB) ·
Electronic Transactions Act B.E. 2544 §9, §26, §28, §§32–34 · ETDA "Digital Thailand AI Ethics Guideline" (2019).*


note Athichon kaewla 6631503046 wrote it.
