# src/ — folder design

Folders only; no code yet. Every folder traces to a design document. A folder that waits on an
open decision or question says so, and nothing is built on an assumption about it (CLAUDE.md).

`src/` holds the two deployables from `diagrams.md` D3, each with its own Dockerfile (not yet
written):

- `backend/` — the Go + Gin REST API, the calculation engine, and PostgreSQL access via sqlc + pgx
- `frontend/` — the Next.js + TypeScript web app

Tests: Go `*_test.go` files and Vitest `*.test.tsx` files sit beside the code they test.
Playwright end-to-end tests belong in the repo-root `tests/` (`project-context.md` §20), which is
not created yet.

```
src/
├── backend/
│   ├── cmd/
│   │   ├── api/             REST API server
│   │   ├── import/          one-time import of the supplied dataset
│   │   └── purge/           scheduled retention job
│   ├── internal/
│   │   ├── router/          Gin engine and the gate chain
│   │   ├── auth/            Auth & session
│   │   ├── permission/      Permission & tenancy
│   │   ├── formula/         Formula module, EvaluationService, export
│   │   ├── engine/          pure engine: Result[T], snapshot, proportions
│   │   │   ├── compliance/  ComplianceChecker
│   │   │   ├── odour/       OdourProfiler + OdourWeighting
│   │   │   └── evaporation/ EvaporationCalculator + EvaporationModel
│   │   ├── importer/        parsing and normalising the supplied files
│   │   │   └── testdata/    synthetic fixtures only
│   │   ├── account/         Account & consent (/me)
│   │   ├── accesslog/       append-only access-log writer
│   │   └── repository/      sqlc-generated data access
│   └── db/
│       ├── migrations/      schema
│       ├── queries/         SQL for sqlc
│       └── seed/            synthetic development data
└── frontend/
    ├── app/
    │   ├── sign-in/
    │   ├── formulas/
    │   │   └── [id]/
    │   └── account/
    ├── components/
    │   ├── result/
    │   ├── formula/
    │   └── charts/
    └── lib/
```

---

## backend/

The six server modules follow `diagrams.md` D3 and the Backend Map page. The engine structure
follows `calculation-engine.md`. Route paths are proposals (Backend Map) except the `/me`
endpoints and the evaporation query, which are fixed in the design documents.

| Folder | Purpose | Traces to | Waits on |
|---|---|---|---|
| `cmd/api` | Entry point for the deployed API: opens the pgx pool, builds the router, serves HTTPS. No business logic | D3; Backend Map | — |
| `cmd/import` | Loads the supplied substance CSV and IFRA 51st Amendment XLSX into the shared reference tables. The file path is given at run time and points into the gitignored data folder; no dataset file is ever placed under `src/`. Reference data only, never formulas | Backend Map ("import · normalise once"); `data-model.md` §3–§5, §8; `dataset-structure.md` §1–§2; rule.md §0.1; IP-001, IP-002 | Decisions 4, 6; OQ1 (formulas are not imported); OQ15 (real data only on approved infrastructure) |
| `cmd/purge` | Scheduled retention job under its own database role: removes `access_log` rows past the configured retention (at least 90 days, up to 2 years) and `retained_identity` rows 90 days after an account ends | rule.md rules 29, 30, 32; LR2; SEC-003 | `data-model.md` §9 (tables not modelled yet) |
| `internal/router` | Builds the Gin engine. Every formula route passes gate 1 session verify → gate 2 action check → gate 3 record check on `org_id`. `/me` routes pass gate 1 only; login creates the session. Errors are generic and never carry passwords, hashes, formula or rule content | Backend Map (gate chain); `roles-permissions.md` §3, §5; SEC-001, SEC-002, SEC-004, NFR-003 | — |
| `internal/auth` | Auth & session: `POST /session` (no public sign-up), `DELETE /session`, expiry, and the gate-1 middleware. Logs login success, failure and logout | D3; Backend Map; FR-001, NFR-003, SEC-004; rule.md rules 27, 28, 35 | OQ18 (managed identity provider or own sessions) |
| `internal/permission` | Permission & tenancy: the permission constants (`formula.view`, `formula.recalculate`, `formula.export`, `user.manage`), the member/admin map in Go code, gate 2 and gate 3. Handlers ask for a permission, never a role | `roles-permissions.md` §3–§5; SEC-001 | OQ3 (rule 21 "own formulas" vs organisation scope) |
| `internal/formula` | Formula module: `GET /formulas` (name, id, last modified), `GET /formulas/{id}`, `POST /formulas/{id}/recalculate`, `GET /formulas/{id}/evaporation`, `GET /formulas/{id}/export`. Holds `EvaluationService`, the only I/O on the calculation path: it loads the `FormulaSnapshot` (including the as-of date that picks the regulation version in force), applies what-if overrides in memory, and calls the engine. The export contains one formula's displayed figures and citations, never rule tables or other formulas. Logs views, calculation runs and exports as `formula_id` + version only | `calculation-engine.md` §3; D3; Backend Map; FR-002, FR-003, FR-007, FR-008, FR-010, NFR-001, NFR-002, IP-003, SEC-002; rule.md rules 28, 31 | OQ7 (can a trial edit be saved); OQ13 / decision 9 (formula version); OQ6 (export format); `data-model.md` §4 (evaporation and export routes during a what-if) |
| `internal/engine` | The pure, deterministic engine: `Result[T]` (Status, Value, Citations, Missing), the citation type, `FormulaSnapshot`, and `ProportionCalculator` (dilution applied once, total check). Must not import `repository`, pgx, Gin, `net/http` or the clock, and never calls an AI or model service | `calculation-engine.md` §2–§4, §6, §8; FR-004, FR-006, CER-001–CER-003, NFR-004; rule.md rules 58, 59 | Decisions 1, 8 |
| `internal/engine/compliance` | `ComplianceChecker`: compares `pct_in_product` with the category limit and cites regulation, version and threshold | `calculation-engine.md` §6; FR-005 | Decisions 6, 7, 10 |
| `internal/engine/odour` | `OdourProfiler` and the `OdourWeighting` interface; the weighting's label travels with the chart | `calculation-engine.md` §4; FR-009 | Decisions 2, 3 (interface only until decided) |
| `internal/engine/evaporation` | `EvaporationCalculator` and the `EvaporationModel` interface; a model names its own equation and assumptions | `calculation-engine.md` §4; FR-010 | Decisions 4, 5 (interface only until decided) |
| `internal/importer` | Parses and normalises the supplied files: odour types into `odor_types`, Antoine coefficients, IFRA rows into `material_restrictions`, EU CosIng status | `data-model.md` §3–§5, §8; `dataset-structure.md` | Normalise Antoine at import or keep `antoine_form` (`data-model.md` §4, open); decisions 6, 10 |
| `internal/importer/testdata` | Synthetic fixture files in the supplied format. Never real data | rule.md §0.1, rule 19; IP-002 | — |
| `internal/account` | Account & consent: `GET /me/data`, `PATCH /me` (cannot change role or organisation), `DELETE /me` (keeps the access log and a `retained_identity` row; logged), and consent withdrawal (`withdrawn_at`, never deleted) | PRIV-001–PRIV-003; rule.md rules 3, 11–15, 28, 30; `roles-permissions.md` §3 | OQ2 and OQ4 (how and when the account holder gives consent); OQ4 (re-authentication for deletion, rule 47); `data-model.md` §9 |
| `internal/accesslog` | The append-only writer used by the auth, formula and account modules: rule 27 fields, server clock, hash chain, metadata only | LR2; SEC-002, SEC-003; rule.md rules 26–34 | `data-model.md` §9 (columns not modelled) |
| `internal/repository` | sqlc-generated Go code for the SQL in `db/queries` (the "repositories" in `calculation-engine.md` §3). Generated; not edited by hand | D3 (sqlc + pgx) | — |
| `db/migrations` | Schema from `data-model.md` and `roles-permissions.md` §4: `org_id` on every tenant-owned table; `users.consent_id` NOT NULL (PRIV-001, enforced at the data layer); the INSERT + SELECT-only role on `access_log` | `data-model.md`; `roles-permissions.md` §4; PRIV-001; rule.md rules 1, 2, 32 | `data-model.md` §9; OQ18 (users and session tables); migration tool not chosen |
| `db/queries` | SQL that sqlc compiles into `internal/repository` | D3 | — |
| `db/seed` | Synthetic development data only (`seed_demo_*`), never real people or the real dataset | rule.md rule 19, §0.1; IP-002 | OQ1 (how real formulas enter the system) |

## frontend/

Next.js App Router with TypeScript. The screens follow `user-journey.md` and the Claude Design
canvas (`prototype/prototype.md`). The web app calls the Go API; it has no API routes of its own,
so the gates exist in one place.

| Folder | Purpose | Traces to | Waits on |
|---|---|---|---|
| `app/sign-in` | Sign-in screen; no sign-up link | FR-001, NFR-003; journey step 1 | OQ18 |
| `app/formulas` | Formula list: name, id, last modified | FR-002; journey step 2 | — |
| `app/formulas/[id]` | Formula view: ledger, flags, explanations, what-if, both charts, export dialog | FR-003–FR-010, NFR-001, NFR-002; journey steps 3–6 | OQ7; OQ6; `data-model.md` §4 (route shape during a what-if) |
| `app/account` | Own account data: view, correct, download, delete | PRIV-002; rule.md rule 11 | OQ2, OQ4 (consent capture; re-authentication before deletion) |
| `components/result` | Renders a `Result[T]`: the value with its citations, or grey `insufficient data` naming the missing input | CER-001, CER-002, FR-006 | — |
| `components/formula` | Ledger rows with `pct_in_formula` and `pct_in_product`, restriction flags, the explanation panel, what-if inputs, the export dialog | FR-003–FR-008 | Decisions 7, 8; OQ7 (no save control until decided); rule.md rule 61 (disclaimer text not agreed with the owner) |
| `components/charts` | Odour profile and evaporation curve; each chart states its basis or model | FR-009, FR-010 | Decisions 2–5; `data-model.md` §4 |
| `lib` | API client for the Go API and shared types | D3 | Session, formula, recalculate and export routes are proposals (Backend Map) |

---

## Packaging choices

These are engineering choices, not document requirements:

- `engine/compliance`, `engine/odour` and `engine/evaporation` are separate packages so that the
  two interfaces can gain implementations later without touching the rest of the engine.
  `calculation-engine.md` defines them as classes.
- `backend/` and `frontend/` are sibling folders so the two modules build as separate containers,
  matching the Client/Server split in D3.

## Deliberately not created

| Not created | Why |
|---|---|
| Admin user management (screens, routes) | backlog OQ10 and OQ2: admin capabilities and account provisioning are open; backlog outranks `roles-permissions.md` |
| Material-pair (masking/synergy) checks, material groups | Decision 11 / OQ16: no supplied data or rules |
| Client portal, SaaS administration, supplier documents, formula authoring, material editing, experiment history, lab weighing | Deferred (`roles-permissions.md` §2; `feature-list.md`) |
| AI or model integration | No generative feature this cycle (NFR-004, CER-003) |
| Evaluation panels, agreements and e-signature | Out of scope (OQ8); LR3 not triggered (OQ4) |
| A separate explanation route | FR-006 reads the citations attached to `Result[T]` (`calculation-engine.md` §2) |
| Any data or dataset folder | The real dataset is never committed (rule.md §0.1; IP-002; `.gitignore`) |
| Generic `utils`, `common`, `config` or handler layers | No document backs them; each module owns its handlers |

## Needs a design before it gets a folder

rule.md requires these, but no route, screen or table is designed yet:

- Capturing the account holder's own consent, and re-asking when the privacy notice changes
  (rule.md rules 1, 15, 24; OQ2, OQ4).
- The admin query of the access log (rule.md rules 36, 38; SEC-003).
- The disclaimer and human-override path on safety-relevant output (rule.md rule 61).
- The feedback channel for a wrong result (rule.md rule 63; OQ17).
- The breach incident log (rule.md rule 23).
- Recording `pending_backup_purge` on account deletion (rule.md rule 13; not modelled anywhere).
