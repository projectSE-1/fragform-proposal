<!-- AI Perfumery Engine; ownership follows the owner's existing agreement. No new licence is granted. -->
# AI Perfumery Engine — calculation demo

Local, standalone **Next.js App Router + TypeScript** prototype. Every material, formula and chart in it is invented. This directory is separate from the future production `src/frontend` app under rule 85, and it has no Go API, database, identity provider or scientific engine behind it.

**Trimmed on 2026-10-04 to the alpha slice** in [scope-lock.md](../.docs/01-requirements/scope-lock.md): the formula and its calculation, nothing else. Sign-in, accounts, roles and team management, the laboratory and weighing workflow, documents, the tutorial and the mascot were removed from the demo. They remain in the backlog and in [mvp-scope.md](../.docs/02-design/mvp-scope.md) as waves 1 and 3 to 5; they are simply not what this build is showing. Their earlier demo pages are in git history if they are wanted back.

## Run

Requires Node.js >=20.9 and npm. From the repository root:

```powershell
cd demo
npm ci --ignore-scripts
npm run dev
```

Open http://127.0.0.1:3000. It binds to loopback only. `npm run build` then `npm start` runs the same thing as a build. Changes live in memory and reset on refresh or on Reset demo.

## Try the workflow

1. Open **Morning Reverie**. Read the declared composition: amounts are decimal text, w/w, and the demo never normalises them for you.
2. Change the first two amounts to `35` and `35`, leaving `20` and `10`. Save with a version note. Open the history: earlier versions are unchanged.
3. Make the amounts total something other than 100 and try to save. The declaration is rejected with the exact total, rather than being silently corrected.
4. Start a **what-if**, change amounts, and press Evaluate. The result is **insufficient data**, because no approved model or rule set exists yet. That is the intended answer, not a gap in the demo.
5. Switch Ready view / Loading preview / Error preview to exercise the shared request states.
6. Switch EN/TH. Numbers keep their value and precision in both.

## What it does and does not establish

| Design requirement | What the demo shows | What implementation still needs |
|---|---|---|
| FR-002, FR-003 | Formula list and a single connected workspace for composition and context | Server-side authorised list and detail, real records |
| FR-004, FR-011 | Exact decimal input, the 100% declaration contract, immutable version history | Go validation and arithmetic, reviewed numeric precision policy, concurrency |
| FR-005, FR-006 | Where findings and their citations appear, and what a missing state looks like | Approved regulatory sources, versions, categories and the dilution basis |
| FR-007 | A trial separate from a saved version, discarded or explicitly saved | The same pure engine over a server snapshot |
| CER-002 | `insufficient data` as the honest answer, with its reason | The real engine returning the same answer for the same reason |

The charts are hand-authored layout illustrations with no physical units, no model and no prediction behind them. They exist to show where a chart goes, not what it would say. The odour profile cannot be weighted by perception yet: the supplied sample carries no detection threshold at all, and the categorical strength has no approved numeric mapping, so the only honest weighting today is composition share by mass ([calculation-engine.md](../.docs/02-design/calculation-engine.md) §6.1).

No real password, dataset, document or measurement is requested anywhere in this demo, and nothing here is evidence that the engine, authentication or the backend exists.

## Editing and checking

`components/demo-app.tsx` owns the shell, navigation and the unsaved-changes guard. `formula-pages.tsx` owns both screens. `dropdown.tsx` provides the shared form menu. `app/globals.css` defines the tokens and the responsive shell; page styles sit next to their component. Fixtures are in `lib/model.ts` and decimal validation in `lib/formula-validation.ts`. No external font, icon or chart service is used.

```powershell
npm run typecheck
npm test
npm run build
```

Tests cover the exact-sum contract and immutable version history for this demo only. They establish neither server authorisation nor scientific correctness. See [validation record](validation.md), [dependency review](dependency-review.md), [design decisions](design-decisions.md) and [prototype status](../.docs/02-design/prototype/prototype.md).
