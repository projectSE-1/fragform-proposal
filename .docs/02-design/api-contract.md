<!-- AI Perfumery Engine project documentation; ownership follows the owner's existing agreement. No new licence is granted. -->
# REST Contract — Imported MVP, Honney Implementation

**Updated:** 2026-10-04. [api/openapi.yaml](api/openapi.yaml) is a local design draft adapted from the pinned frontend MVP's OpenAPI 3.1 contract. It is not a running API. The Go + Gin server will implement it; the Next.js app consumes it. No upstream mock handler or fixture is imported.

## Origin and local adaptations

Upstream: `sattasarasadaw-crypto/ai-perfumery-engine-frontend`, commit `aa572abaede14c11796a1551434858171eb37363`, `api/openapi.yaml`: 68 paths / 75 operations. Its internal `x-source`/PDC references are provenance only; the absent underlying documents and numerical models have not been locally approved.

The local draft adds six operations on five paths: `GET /me/data`, `PATCH /me`, `DELETE /me`, `GET /app/admin/access-log`, `GET /app/admin/access-log/export`, and `GET /app/formulas/{formula_id}/export`. These specify intended rights/logging/export operations which the upstream contract does not fully represent; they are not implementations. The draft therefore has **73 paths / 81 operations**. `/app/auth/step-up` also supports re-authentication for one's own high-risk action, without granting admin/domain permissions.

| Family | Intended behavior | Local requirement |
|---|---|---|
| `/app/public/*` | Public configuration/legal text only, no confidential data | FR-018 |
| `/app/auth/*` | Signup, verification, login/MFA, active context, logout/reset/step-up | FR-001 |
| `/app/account/*`, `/app/users/me`, `/me*` | Own account/settings/sessions/consent/rights, including actual erasure execution | FR-017; PRIV-001–003 |
| `/app/users*` | Invitations, user details, role changes, recovery and activation, with step-up/reasons | FR-016; SEC-006 |
| `/app/dashboard`, reference collections | Server-produced summary and read-only reference data | FR-015 |
| `/app/formulas*`, `/app/analysis-runs*`, `/app/predictions*`, `/app/provenance*` | Versioned formula inputs, transient analysis, results/provenance and scoped export | FR-002–011 |
| `/app/batches*`, instruments, label layouts | Batch/instrument/weighing workflows and authorized lab PDFs | FR-012–013 |
| `/app/documents*`, completeness/findings | Typed documents, processing and compliance data | FR-005, FR-014 |
| `/app/admin/access-log*` | Restricted, itself-logged log query/export; metadata only | LR2; SEC-003 |

## Security and record scope

Every protected request passes session verification, action permission and server-selected record/tenant authorization. Own-account endpoints need authentication but no domain role. Public pages and demo tutorial data may be visible without a domain role. A pending account receives no formulas, reference data, batches, system documents or analysis results.

The active context is selected only after Go verifies the user's membership/role. Resource requests never acquire scope by supplying `org_id` or guessing an id. A system-admin cross-tenant operation requires explicit authorized context, reason and access logging; it is not a wildcard domain-data grant.

Cookies are HttpOnly/Secure with an appropriate SameSite policy; unsafe authenticated operations verify CSRF. High-risk actions verify a fresh, purpose-bound server-side re-authentication challenge including expiry, actor and action; a token string from a mock is not proof. `/me/data` and `/me` operate only on the caller. `DELETE /me` executes the deletion workflow with the required retained identity/log/backup-purge exceptions; `/app/account/deletion-request` is an intake/status flow, not a substitute for erasure.

Authorized users may export only the single formula snapshot they can read, subject to `formula.export`. This extension is available to the same seven domain roles as formula read, within their active tenant. Export format/layout remains a design decision; the contract uses a binary download envelope and does not authorize rule-table/dataset dumps. Log query/export requires `org_admin`/`system_admin` plus the respective action permissions and record scope. These GET operations carry a server-validated `X-Access-Reason-Code`, not free-text reasons in a URL. The reviewed purpose catalogue determines valid codes; proxy/request logs must not copy sensitive headers or free-text user explanations.

## Values and analysis

- Internal Go engine: pure `Result[T]` with status, citations and missing inputs; no DB, clock or model service inside calculations.
- API presentation: `ReportedValue` for estimates with approved interval/tier/provenance; `Quantity` for declared/exact quantities; `MissingValue` when a supported number cannot be produced. An adapter does not manufacture a confidence interval or silently rename a computed value as exact.
- User-entered decimals remain strings through validation, storage and server numeric handling; browser formatting uses the server's decimals. Formula versions and model/input versions are pinned independently.
- The source only describes saved-formula `analyze`. Transient what-if inputs must have an explicitly reviewed request schema before FR-007 is built; a saved-formula id alone does not specify a trial snapshot. The current draft does not claim to resolve this interface.
- Fixture thresholds, unit/mixture assumptions, tier definitions, model equations, session settings and weighing tolerances are not production defaults. Schema examples are illustrative only.

## Before implementation or release

Review the local additions and upstream request schemas against the backlog, roles and rules. Resolve the transient what-if request, purpose/expiry and action binding of re-authentication, erasure workflow response and domain-dependent statuses. Some upstream administrative operations omit a reason or step-up header in their request shape; before those handlers are Ready, extend and version those shapes to meet rule 80 for invitations/recovery/grants and every protected operation on another account. Logging an unexplained request or checking a mock token string is insufficient. The imported draft is not an assertion that every operation already meets the local security policy.

Validate OpenAPI references/operation uniqueness, generate or maintain TypeScript request/response types with a reviewed tool, and test real Go handlers against the same contract. Add mocks with labelled synthetic data only when their tool and lifecycle are selected. This revision checks contract structure, not semantic completeness or a production backend.
