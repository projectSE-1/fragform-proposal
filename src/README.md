# src/ — Honney stack, adopted MVP

**Updated:** 2026-10-04. Production `src/` contains folders and `.gitkeep` placeholders only; no executable app, migration, Dockerfile or tests. The runnable [standalone synthetic demo](../demo/README.md) lives separately under `demo/`. This document describes the intended production structure; it does not claim that the proposed extra modules below already exist.

## Baselines

- [MVP scope](../.docs/02-design/mvp-scope.md): frontend-source waves 0–5, approved scope direction on 2026-10-04.
- [Technology](../.docs/02-design/tech-stack.md): Next.js App Router + TypeScript; Go + Gin; PostgreSQL with sqlc + pgx; REST; Docker; GitHub Actions; Go tests/Vitest/Playwright.
- [Backlog](../.docs/01-requirements/backlog.md), [rules](../.docs/03-compliance/rule.md), [roles](../.docs/02-design/roles-permissions.md) govern implementation. No copied Vite/Mantine/FastAPI setup.

## Proposed backend structure

```text
src/backend/
  cmd/
    api/                 Go API server
    import/              approved reference-data import
    purge/               restricted retention and backup-purge jobs
  internal/
    router/              session → action → record gates
    auth/                signup/verification/session/MFA/re-authentication
    permission/          role grants, active context, action permissions
    account/             own profile, consent, rights, devices/preferences
    admin/               invitations, access decisions, account actions
    formula/             create/version/what-if; EvaluationService
    engine/              pure Result[T], snapshot, proportions
      compliance/        independently sourced compliance findings
      odour/             approved profile model/weighting interface
      evaporation/       approved time-dependent model interface
    analysis/            pinned runs, progress, freshness, API value adapter
    provenance/          complete source/rule/model/input lineage
    lab/                 batch, instrument, per-item weighing, PDFs
    document/            typed vault, authorization, processing lifecycle
    reference/           read-only material/vehicle/SKU/lot/instrument queries
    accesslog/           append-only writer plus restricted query/export
    importer/            normalization; synthetic testdata only
    repository/          sqlc-generated code, not edited by hand
  db/
    migrations/
    queries/
    seed/                labelled synthetic data only
```

Existing backend folders are the earlier auth/account/permission/formula/engine/accesslog/importer/repository/router and cmd/db placeholders. `admin`, `analysis`, `provenance`, `lab`, `document`, `reference` and their contents are a proposed extension, not created by this documentation revision.

| Responsibility | Traceability | Readiness gate |
|---|---|---|
| Account/auth/admin/roles | FR-001, FR-016–017; PRIV; SEC; LR1–LR3 | Auth implementation/provider, email delivery, privacy text, durations and security policy |
| Formula inputs and immutable versions | FR-002–004, FR-007, FR-011 | Numeric/unit handling, version concurrency and transient evaluation request |
| Analysis/provenance/result adaptation | FR-006, FR-009–010; CER-001–005 | Scientific models, uncertainty/tier definitions and source completeness |
| Compliance/document vault | FR-005, FR-014 | Category/rule semantics, approved file storage/scanner and processing schema |
| Batch and per-item weighing | FR-008, FR-012–013 | Unit bridge, instrument metadata, tolerances, pre-dilution rules and print layouts |
| Rights/access logs/purge | FR-017; PRIV-002; LR1–LR3; SEC-003 | Schema/retention/backup-deletion plan; must ship with auth, not a later wave |

The engine never imports Gin, pgx/sqlc, network clients, a clock or a model service. `EvaluationService` loads a versioned snapshot (with an explicit as-of date), applies transient overrides in memory and calls the pure engine. The API adapter cannot invent an uncertainty interval or downgrade a prediction into an exact `Quantity`.

Only the Go API performs domain/rights business operations. Next.js presentation code or server components do not implement a second authorization/calculation API. An active-tenant choice is verified server-side; resource queries use that verified context. Public pages/cache/builds contain no private formula data.

## Proposed frontend structure

```text
src/frontend/
  app/
    (public)/            overview, how-to, FAQ and legal pages
    sign-in/             login/MFA/pending-access flows
    sign-up/             consent and email verification
    account/             profile/security/devices/preferences/rights
    admin/               users and restricted log query
    formulas/
      [id]/              input/editor, analysis and provenance
    batches/
      [id]/              mixing sheet and weighing
    compliance/          findings and document completeness
    documents/           vault/upload/status
    tutorial/            synthetic sandbox, never real-data writes
  components/
    ui/                  wrappers for a component kit if one is selected
    result/              ReportedValue/MissingValue/Quantity + provenance
    formula/
    charts/              client components with approved models
    lab/
    document/
    shared/              errors, loading/empty states, confirmations
  lib/
    api/                 one contract-aware client/error/CSRF boundary
    local-prefs/         non-confidential preferences only
  i18n/                  TH/EN text resources; package not selected
  theme/                 shared tokens; component kit not selected
  mocks/                 future synthetic dev adapter; tool not selected
```

Today only `app/sign-in`, `app/account`, `app/formulas/[id]`, `components/result`, `components/formula`, `components/charts` and `lib` placeholders exist. The expanded structure is a design, not a completed scaffold.

## Contract, tests and packaging

- Local [REST contract](../.docs/02-design/api-contract.md) and [OpenAPI draft](../.docs/02-design/api/openapi.yaml) derive from the pinned source, with explicit local rights/logging/export additions. Generated TypeScript types and the generator are not present/selected yet.
- API mocks use labelled synthetic data in development only. The upstream MSW handlers, toy calculations and fixtures have not been copied or accepted as an engine.
- Go business/access tests sit beside modules; Vitest component tests sit beside UI code; Playwright journeys belong in root `tests/e2e/` when created. A disabled/skipped check is not proof of passing.
- Next.js and Go build as separate Docker deployables. CI/runtime configs remain implementation tasks. Railway remains conditional on approval and privacy-transfer documentation.
- Sensitive personal data, client production approvals, external-client adjustment, offline sync/desktop wrapping, reference-data editing and AI mascot chat are outside the current MVP.
- Privacy notice/consent evidence, incident log, feedback/human override, access-log query and backup-purge tracking are mandatory local completion work; source deferrals do not waive them.

No dataset files belong under `src/`; use a runtime path into the approved gitignored location. No undocumented generic layer or optional library is approved by this folder plan.
