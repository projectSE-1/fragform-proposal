<!-- AI Perfumery Engine project documentation; ownership follows the owner's existing agreement. No new licence is granted. -->
# Roles, Permissions and Tenancy

**Updated:** 2026-10-04. This design follows the owner's instruction to adopt the linked frontend MVP while retaining Honney's stack. It replaces the two-role `member`/`admin`, existing-formula-view-only design of 2026-09-16. The canonical scope is [mvp-scope.md](mvp-scope.md); mandatory controls remain in [../03-compliance/rule.md](../03-compliance/rule.md).

Source: `sattasarasadaw-crypto/ai-perfumery-engine-frontend`, commit `aa572abaede14c11796a1551434858171eb37363`, `api/openapi.yaml` operation `x-roles`, X1, X4 and X6 wireframes, and `docs/handoff/screens-mvp.md`. These are design contracts, not evidence of implemented authentication. Upstream pending decision numbers are not local approvals.

## 1. Access boundary

The MVP serves authorized laboratory users in an organisation/tenant. Public pages and public signup do not expose confidential reference data or formulas. Signup starts without roles; verified accounts await an administrator's grant. It does not create a client portal, paid SaaS onboarding or production approval workflow.

Every protected request passes server-side session validation, the required action permission and the target-record check. Go + Gin enforces all three. A Next.js hidden button, `can_edit` flag or client route guard is only presentation.

| Caller | Available behavior |
|---|---|
| Not signed in | Public overview/how-to/FAQ/legal pages and explicitly public signup, verification, login and reset flow |
| Signed in, no role | Pending-access page, own account/rights/session/consent/preferences, and opt-in tutorial using synthetic data |
| Signed in, role present in active tenant | Only domain actions allowed by that role and only authorized records |
| Administrator | Scoped user administration and restricted log queries, with extra controls below |

Public endpoints return no system data. Own-account endpoints bind to the caller's identity and require no lab role. Tutorial domain data is embedded synthetic data: no material, formula, analysis, batch or document endpoint is called from the sandbox. Only tutorial progress may be written by the sandbox; preference changes use the normal own-account service outside it (FR-019, NFR-008).

## 2. Seven fixed identifiers

Use these exact identifiers from the source contract. There is no free-text role creator in the MVP.

| Identifier | Meaning within this MVP | MFA required |
|---|---|---|
| `formulator` | Formula authoring and laboratory recording | Optional unless also holding a mandatory role |
| `data_curator` | Document upload and authorized domain reading; reference-data approval/editor remains deferred | Optional unless also holding a mandatory role |
| `safety_assessor` | Authorized domain reading; professional safety signoff is outside this MVP | Yes |
| `legal_reviewer` | Authorized domain reading; legal-text approval workflow is outside this MVP | Yes |
| `approver` | Authorized domain reading; release/change approval is outside this MVP | Yes |
| `org_admin` | User administration within own tenant; formula authoring and document upload | Yes |
| `system_admin` | Exceptional user administration across explicitly selected tenants; formula authoring/document upload within authorized domain context | Yes |

Roles describe action grants, not chemical competence or legal qualifications. Granting `safety_assessor` does not validate a qualification or enable a signature feature. The source references credential records but does not supply a complete local credential/retention policy: `insufficient information`; do not add qualification or sensitive fields as an implicit extension.

## 3. Action mapping

The following permission names are the local Go implementation design. Their role sets follow source operation `x-roles`; names need not appear in the source contract. Keep the mapping in one reviewed server-side definition and test it independently of the UI.

| Permission/action group | Roles allowed | Record/control requirement | Local requirements |
|---|---|---|---|
| `reference.read`, `dashboard.read` | All seven | Active tenant; shared/personal/organisation reference visibility and licence constraints | FR-015 |
| `formula.view`, `formula.analyze`, `analysis.read`, `provenance.read` | All seven | Target formula in authorized active tenant; child records inherit boundary | FR-002–006, FR-009–011, CER-001–005 |
| `formula.create`, `formula.version.create` | `formulator`, `org_admin`, `system_admin` | Active tenant; validated input/base version; hard-block enforcement | FR-003–005, FR-011 |
| `batch.view`, `batch.mixing_sheet.download`, `batch.label.download` | All seven | Batch/pinned formula version in active tenant; downloads logged | FR-008, FR-012 |
| `batch.create`, `batch.component.add`, `weighing.record`, `weighing.reweigh`, `sample_prep.record` | `formulator` | Batch/component/lot/instrument scope, explicit instrument and append-only measurement | FR-012, FR-013 |
| `compliance.read`, `document.read`, `document.completeness.read` | All seven | Formula/subject/document visibility and licence constraints | FR-005, FR-014 |
| `document.upload` | `formulator`, `data_curator`, `org_admin`, `system_admin` | Authorized SKU/lot, typed attachment, scan/size/type checks | FR-014, SEC-006 |
| `user.manage` | `org_admin`, `system_admin` | Own tenant for org admin; explicit audited target tenant for system admin; step-up/reasons | FR-016, SEC-006 |
| `formula.export` | All seven | One readable formula snapshot in active tenant; allowed content only and export event | FR-008 |
| `access_log.query`, `access_log.export` | `org_admin`, `system_admin` | Authorized active context, query reason, metadata only; log each read/export | LR2, SEC-003 |

An administrator does not implicitly receive laboratory write permissions: a user holding only `org_admin` cannot record weighing. They need a separate `formulator` grant. A reviewer identifier does not imply an approval endpoint absent from the MVP.

FR-007 uses an authorized in-memory what-if request with the same formula/analysis checks; saving the trial is a separate `formula.version.create` action. It never silently edits a stored version.

These two local compliance extensions complete gaps in the upstream contract: `formula.export` produces only an authorized displayed subset (FR-008), and `access_log.query`/restricted internal export satisfy LR2. Their adapted routes and role sets are recorded in [api-contract.md](api-contract.md). Export format/layout, log custodian and intended internal recipients still need resolution before implementation. The full audit dashboard remains deferred; these controls ship with auth.

## 4. Record checks and tenancy

- Every tenant-owned row carries `org_id` from its first migration. Child queries check parent and tenant together: formula version, analysis/prediction/provenance, batch/component/preparation, SKU/lot/document and role grant. An unscoped child id is never enough.
- Domain `org_id` comes from the server session. Context selection may name a tenant candidate, but the server checks membership/grants before updating the session; this is not a trusted `org_id` override.
- Formula listing follows the source's tenant-wide authorized read model as adopted by the owner and reflected in rule 21. `mine=true` filters co-authored formulas; it is not the universal permission boundary.
- Inaccessible records return the same not-found shape as nonexistent records. A calculation's `insufficient data` is a result on an authorized record, not an access denial.
- Reference materials/rules may be shared inside approved infrastructure without becoming public. Personal/organisation vehicles, SKUs, lots, instruments and documents enforce declared visibility; shared rows have explicit scope, not accidental tenant bypass.
- `system_admin` cross-tenant administration requires explicit target context, a stated reason and an access event. No persistent all-tenant confidential-data view. Administrative power is not an automatic domain-data wildcard.
- Document bytes/PDFs use the same authorization checks as metadata. A guessed storage URL or QR target cannot bypass access control; QR contains a minimal opaque identifier, not formula content.

See [data-model.md](data-model.md) for identity, membership, fixed role grants and tenancy constraints. Formula authorship is personal data and receives the privacy/retention treatment required by `rule.md`.

## 5. Authentication, MFA and administration

The retained stack uses a secure server-verified session. The proposed MVP REST boundary uses HttpOnly cookies and CSRF validation for authenticated mutations; tokens/credentials are never stored in browser local storage. Provider/local-session implementation, password policy, idle/absolute expiry, retry limits and step-up expiry remain engineering decisions, not inherited mock numbers.

Mandatory MFA roles cannot postpone enrollment or disable it while holding such a role. Recovery codes display once and are stored as hashes. Enrollment secrets need protected storage and never enter logs. QR images render as images, not injected markup.

Admin actions on another account need fresh MFA step-up, with server binding to the acting identity/session, and an explicit reason/access event under rule 80. This includes grant/revoke, deactivation, pending-access rejection, invitation and recovery actions; incomplete upstream request shapes must be extended before implementation. Expired proof returns a stable refusal; the client requests step-up then retries.

Self-grants are refused on the server and logged. `org_admin` cannot grant `system_admin`; only an authorized system admin can do that to another account. Removing the last role warns that domain access ends and updates authorization promptly. Invites/reset links let recipients set their own password; administrators never see or issue another user's password.

The first system-admin bootstrap, last-administrator protection, privileged session invalidation, step-up expiration and invitation/email provider are not fully specified: `insufficient information`. Resolve and test these before admin implementation. Do not invent override accounts.

## 6. Rights, agreements and access evidence

Login ships with real own-data export, correction and erasure endpoints/screens, consent evidence, sessions and access logging. The imported deletion-request endpoint alone does not satisfy Honney's execution requirement. Withdrawing a purpose stops its processing under `rule.md`; notice updates preserve earlier acceptance evidence.

High-risk acts require re-authentication and recorded method under rule 47, including account erasure and privileged rights grants. Signing actions are blocked in any impersonated context. The MVP does not add production signatures merely because `approver` exists.

Log login success/failure/logout, credentials/MFA/session and role changes, account lifecycle, formula/version writes, analysis runs, exports/downloads, admin reads and security refusals. Log identifiers/version/metadata, never percentages, password/OTP/token, parsed document text or sensitive details. Log reads are logged; append-only/tamper-evident storage and retained identity survive redeploy (LR2).

## 7. Validation and readiness

Tests cover every role/action pair; no-role public/account/tutorial exceptions; direct requests bypassing UI; cross-tenant child ids; forged context/subject ids; expired/revoked sessions; mandatory MFA; self-grants; admin step-up/reasons; blocked lab progress; confidential download/QR access and log evidence. Go tests own authorization/business invariants; Playwright exercises complete journeys (SEC-001–006, NFR-008).

This is a permission design, not implemented enforcement. Unresolved export/log-reader field mapping, reference visibility, bootstrap/session policies and future client linkage must be closed in the local API/backlog before significant implementation. The transient what-if request is also a contract gate: the saved-formula analyze endpoint alone does not carry trial overrides.
