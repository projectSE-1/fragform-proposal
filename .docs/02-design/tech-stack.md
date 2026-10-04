<!-- AI Perfumery Engine project documentation; ownership follows the owner's existing agreement. No new licence is granted. -->
# Technology Stack — Honney Baseline

**Updated:** 2026-10-04. Source: Honney `42ae528`, architecture D3 and `src/README.md`. The owner's instruction explicitly retains this stack while replacing the MVP scope.

| Layer | Retained choice | Responsibility |
|---|---|---|
| Frontend | Next.js App Router + TypeScript | Public/auth/account/admin/formula/lab/compliance/tutorial pages; presentation and input only |
| Backend | Go + Gin | REST API, authentication/permissions, calculation orchestration, validation, batches, documents and access logging |
| Database | PostgreSQL | Transactional application/reference data, account/consent/session records, immutable formula versions and retained logs |
| Database access | sqlc + pgx | Reviewed SQL compiled into typed Go access; no SQLAlchemy or new ORM |
| API | REST | Versioned machine-readable contract and shared request/response shapes; Go enforces business rules |
| Authentication | Secure server-verified session, or managed auth pending selection | MVP contract uses HttpOnly session cookies and CSRF on state changes; choice of identity provider versus local session implementation remains open |
| Packaging | Docker | Separate Next.js and Go deployables; Dockerfiles have not been implemented |
| Hosting | Railway candidate | Preserved design choice, conditional on owner-IP approval, privacy transfer documentation and deployment review; not an approved deployment |
| CI/CD | GitHub Actions | Backend/frontend checks, contract compatibility and browser tests when executable projects exist |
| Testing | Go tests + Vitest + Playwright | Business logic/server access checks, frontend behavior and complete user journeys |

## Adapt the imported MVP to these choices

- Next.js routing replaces the source's Vite/React Router setup. The frontend has no separate business API: all domain/rights/access-log checks stay in Go. Public Next.js pages may render static content; confidential responses must not enter shared caches or public builds.
- Keep `src/backend/` and `src/frontend/` in this repository. The source's frontend-only repository ownership process is adapted to these two folders.
- Browser-only charts/tutorial effects use suitable client components. Their library, component kit, i18n package, mock tool and exact versions are **not selected by importing the MVP**. Mantine, Plotly, MSW, i18next and other source packages are references, not automatically adopted dependencies.
- Adopt the REST behavior and `ReportedValue`/`MissingValue`/`Quantity` concepts after local contract review; do not import FastAPI/Pydantic implementation assumptions. Preserve the engine's pure `Result[T]` internally and adapt at the Go API boundary.
- Lab web use on Windows and responsive mobile browsers is in scope. Desktop packaging/offline synchronization and Ollama are not part of this stack decision.
- No packages are installed by this documentation revision. Node, Go, PostgreSQL, Next.js and dependency versions must be checked against official sources and locked when the corresponding implementation task becomes ready; no upstream version table is asserted as locally verified.

## Unresolved engineering choices

Auth mechanism/provider and session/step-up expiry settings; password/MFA/email delivery implementation; migration tool; approved storage/file-scanning service; numeric representation and serialization; UI/chart/i18n/mock libraries; approved infrastructure and ownership-header text. These are implementation decisions or owner approvals, not hidden changes to the retained stack.

See [mvp-scope.md](mvp-scope.md) for the adopted waves and [../03-compliance/rule.md](../03-compliance/rule.md) for mandatory controls.
