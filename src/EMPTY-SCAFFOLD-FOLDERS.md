# Empty scaffold folders

Checked on 2026-10-04: `src/` contains 26 directories whose only tracked content is a `.gitkeep` placeholder. These folders contain no implementation files and can be removed. Removing the placeholder files is enough; Git does not track the resulting empty directories.

## Backend (18 folders)

- `backend/cmd/api/`
- `backend/cmd/import/`
- `backend/cmd/purge/`
- `backend/db/migrations/`
- `backend/db/queries/`
- `backend/db/seed/`
- `backend/internal/accesslog/`
- `backend/internal/account/`
- `backend/internal/auth/`
- `backend/internal/engine/`
- `backend/internal/engine/compliance/`
- `backend/internal/engine/evaporation/`
- `backend/internal/engine/odour/`
- `backend/internal/formula/`
- `backend/internal/importer/testdata/`
- `backend/internal/permission/`
- `backend/internal/repository/`
- `backend/internal/router/`

## Frontend (8 folders)

- `frontend/app/account/`
- `frontend/app/formulas/`
- `frontend/app/formulas/[id]/`
- `frontend/app/sign-in/`
- `frontend/components/charts/`
- `frontend/components/formula/`
- `frontend/components/result/`
- `frontend/lib/`

## Safe cleanup boundaries

- The formula and engine folders are nested. Remove the listed placeholders first, then remove any parent directories that become empty.
- Parent scaffolds such as `backend/cmd/`, `backend/db/`, `backend/internal/`, `backend/internal/importer/`, `frontend/components/`, and `frontend/app/formulas/` may become empty and can also be pruned. Keep `frontend/app/`, which contains the app entry files.
- Keep `backend/main.go`, `backend/go.mod`, and `backend/go.sum`, along with the existing frontend app files and project configuration. Do not delete `backend/` or `frontend/`.
- Re-check this list before cleanup if files have been added since the date above.