<!-- AI Perfumery Engine project documentation; ownership follows the owner's existing agreement. No new licence is granted. -->
# Legal Requirements (Traced from W2)

**Updated:** 2026-10-04. Authoritative source: [rule.md](rule.md), especially §§0–5. This file maps
the existing W2 LR1–LR5 to the owner-directed MVP revision in [mvp-scope.md](../02-design/mvp-scope.md).
The linked frontend's stronger engineering controls were adapted in rule.md §§6–7; its draft legal
text, fixture thresholds and references to unavailable internal decisions are not approved law or
local domain evidence. This revision does not independently verify current statutes or certify compliance.

| ID | Law / basis | Requirement | Priority | Local backlog mapping |
|---|---|---|---|---|
| LR1 | PDPA | Consent before storing account/panel personal data; real own-data view/correct/delete features; sensitive data requires the owner's explicit written plan. | Must | FR-001, FR-016–018; PRIV-001–004; SEC-001, SEC-005–006 |
| LR2 | Computer Crime Act §26 | Local append-only, tamper-evident access logs retained ≥90 days, including identifying evidence ≥90 days after the account ends; restricted querying, backup/restore and logged access. | Must | FR-001, FR-007–008, FR-011–014, FR-016–017; SEC-002–004, SEC-006; backlog LR2 |
| LR3 | Electronic Transactions Act §9/26 | Every agreement/consent/approval records actor, server timestamp, exact document version/hash and authentication method; included high-risk actions require re-authentication even without a separate agreement screen. | Must | FR-001, FR-016–018; PRIV-001–002; SEC-004, SEC-006; backlog LR3 |
| LR4 | ETDA principles | Explainable results, insufficient data instead of guesses, human review/feedback and a core workflow without an AI/model dependency. Review cannot bypass sourced hard blocks. | Should (W2); applicable CER controls Must | FR-004–010, FR-012–014; CER-001–005; NFR-004, NFR-007–008 |
| LR5 | Owner IP / project agreement | Dataset, rules, thresholds and formulas stay in approved infrastructure; repository stays private; scoped authorised exports never grant permission to send owner IP to another service. | Must | FR-002–020 where domain/demo/export data is involved; IP-001–004; SEC-001–002, SEC-005–006; NFR-008 |

## MVP obligations and verification evidence

The scope is adopted; implementation has not started. The controls below belong in the corresponding
acceptance criteria and tests. A mock, a draft document or a test that was skipped is not evidence that
the obligation is implemented.

| Obligation | Rule numbers | MVP/design mapping | Required evidence |
|---|---|---|---|
| Consent before a pending signup or invitation writes personal data; no default domain role | 1–4, 16, 24, 41–46, 77 | FR-001, FR-016–018; [journey](../02-design/user-journey.md), [roles](../02-design/roles-permissions.md) | Refusal of writes without valid purpose/consent; version/hash of the exact text accepted; server refusal of automatic/self-granted roles. |
| Own-data view, correction and executable erasure regardless of domain role | 11–15, 30, 47, 53, 81 | FR-017; PRIV-002; [data model](../02-design/data-model.md) | Real `GET /me/data`, `PATCH /me`, `DELETE /me` behavior; re-auth, derived-row handling, backup purge record and minimum retained log/signature evidence. An admin-only request screen is insufficient. |
| Mandatory local log writer, restricted query/export, retention and operational controls with authentication | 22–23, 26–40 | FR-001, FR-016; SEC-003; [architecture](../02-design/diagrams.md), [data model](../02-design/data-model.md) | Log coverage of accounts/roles/formula versions/analysis/weighing/documents/downloads; metadata only, append-only/tamper detection, server time, retained identity, backup/restore and logged log reads. Full X4-S6 dashboard deferral does not waive this. |
| Active LR3 evidence and step-up | 41–53, 77–81 | FR-001, FR-016–018; SEC-006; [roles](../02-design/roles-permissions.md) | Signup terms/consent and withdrawal records; fresh step-up and reason on privileged account actions; re-auth at erasure; immutable signatures and a copy for the signer. |
| Honest analysis/compliance/lab output | 58–71, 82–85 | FR-004–010, FR-012–014; CER-001–005; [engine](../02-design/calculation-engine.md) | Rule/input/version references; reported intervals/tier versus exact quantities; complete provenance list/tree; distinct missing/inconclusive/stale states; server hard-block enforcement. Unknown domain values remain gated. |
| Safe UI, tutorial and confidential storage/downloads | 17–20, 31, 64, 72–76, 83, 85 | FR-008, FR-014, FR-018–020; SEC-002, SEC-005–006; NFR-005–008 | No secrets/owner data in public builds, logs, demos or shared caches; authorised download checks; safe text rendering; sandbox does not write real data; TH/EN/accessibility checks. |
| Approved tools and traceable delivery | §0.1, 86–90 | [tech stack](../02-design/tech-stack.md); all affected backlog/design items | Primary-source dependency/license review, pinned reproducible dependencies, updated contract/docs/types/mocks together, meaningful security/business checks and review evidence. |

**LR3 is active now.** The old “conditional this cycle — no agreement step” assumption is superseded by
signup consent/terms, own-account consent and erasure, and administrative actions. Production approval,
external dataset transfer and IP-assignment screens are outside the MVP, but rule 47 applies whenever
any included high-risk action runs.

**Sensitive-personal-data features are not adopted.** No allergy, patch-test, pregnancy, medical restriction
or religion-revealing preference is implemented by this MVP revision. A future feature still requires
the explicit owner plan and separate controls in rules 7–10; generic tutorial preferences do not justify
collecting these fields.

## Traceability chain

```text
W2 legal research (existing PDPA / CCA / ETA basis)
  -> rule.md §§1–5 / LR1–LR5        (retained legal requirements)
Owner instruction 2026-10-04 + source commit aa572aba...
  -> mvp-scope.md + tech-stack.md  (source MVP, retained Honney stack)
  -> rule.md §§6–7                (adapted engineering controls and adoption record)
  -> backlog.md                   (FR-001–020, CER/SEC/PRIV/IP/NFR acceptance criteria)
  -> .docs/02-design/              (roles, engine, schema, journey, diagrams and prototype)
  -> src/                         (not implemented)
  -> meaningful tests/review       (not implemented)
```

The full acceptance criteria remain in [backlog.md](../01-requirements/backlog.md). The five LR IDs
and their W2 priority are retained; the mapping and active MVP triggers are updated. If this file and
rule.md disagree, rule.md wins under AGENTS.md. The scope change is an owner decision, not a fabricated
interview answer or approval of missing upstream PDC references.

**Before the affected task becomes Ready:** resolve approved hosting/storage/email/scanning and transfers;
controller/contact/retention and privacy/terms/disclaimer text; initial role-holder/bootstrap and MFA/session policy; domain/reference
rules, calibration and thresholds. Record missing information rather than copying source demo values.
