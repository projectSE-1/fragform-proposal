<!-- AI Perfumery Engine; ownership follows the owner's existing agreement. No new licence is granted. -->
# Fragrance Studio — interactive MVP demo

Local, standalone **Next.js App Router + TypeScript** prototype on the Honney branch. All materials, formulas, people, documents, measurements and charts are invented. This directory is separate from the future production `src/frontend` app under rule 85. It has no Go API, database, identity provider, email, scanner or scientific engine.

## Run

Requires Node.js >=20.9 (verified locally with 24.18.1) and npm. From the repository root:

```powershell
cd demo
npm ci --ignore-scripts
npm run dev
```

Open http://127.0.0.1:3000. It binds to loopback only. To build and run the standalone demo instead: `npm run build`, then `npm start`. The build is still a **synthetic demo**, never a production implementation of the perfumery product. Changes exist only in memory and reset on refresh or Reset demo. Switching pages preserves the current exercise. Pending access hides domain views; role switches only exercise presentation permissions.

## Try the workflow

1. Open Morning Reverie. Change the first two amounts to `35` and `35`, leaving `20` and `10`. Save with an invented version note. Inspect history: earlier versions remain intact.
2. Start what-if, change amounts and Evaluate. The official-result placeholder returns **insufficient data**. “Show layout illustration” displays hand-authored coordinates independent of the input. Discard or explicitly save the trial.
3. In Lab workspace select a saved version, instrument and lots. Create a batch, record a preset reading, then reweigh with a reason. Try BLOCK: choosing NORMAL does not dismiss the recorded block. Walk through the labelled remediation simulation.
4. In Compliance & docs choose a document type and its matching SKU or lot, then an embedded sample. Observe simulated queued/scanning/parsing/ready or rejected states. Repeating a type/subject appends another version with a link to the retained earlier record. No actual file is accepted.
5. Switch the Demo persona to Pending access or Org Admin. Inspect pending access, fixed role controls, synthetic MFA, account rights and the reasoned metadata query. Persona switching is a presentation test; it never grants real access. Account consent history persists when the withdrawal preview changes access to pending.
6. Use Ready view / Loading preview / Error preview to exercise shared request states; Retry restores only the synthetic display.
7. Opt into the isolated tutorial. Q6 is available to administrator personas only; pending personas have Q0–Q5. Use the public overview, how-to/FAQ and labelled draft legal notice.

## Scope and limitations

| Design requirement | Demo scenario | Real implementation still required |
|---|---|---|
| FR-001, FR-016–018 / waves 0–1 | Public pages, preset signup/verification/pending, mock MFA/reset, own rights, scoped admin and reasoned log query | Reviewed notices/consent, Go sessions/CSRF/server authorization, rights execution, durable logs, email/backup/incident controls |
| FR-002–007, FR-009–011, FR-015 / wave 2 | Search/create/edit, exact decimal input validation, immutable versions, what-if, missing reasons, profile/evolution illustration, evidence list/tree | Concurrent server versioning, approved models/data/rules/uncertainty and official Go results |
| FR-008, FR-012–013 / wave 3 | Pinned batch, explicit instrument/lots, append-only fixture readings, WARN/BLOCK/remediation, printable previews and text downloads | Approved targets/conversions/tolerances, actual measurements, official mixing-sheet/label PDF and export logging |
| FR-005, FR-014 / wave 4 | Separate jurisdiction findings, document completeness and typed embedded-sample processing | Approved legal sources, storage/scanning, actual bytes, append-only SDS versions and authorization |
| FR-019–020 / wave 5 | Opt-in synthetic missions, progress, dismissible static tip and FAQ | Reviewed tutorial scripts and own-progress service |

No panels, production approvals, client portal, SaaS billing, AI chat, reference editing, regulatory report export, notifications or dark mode. No real password, OTP, user upload or owner dataset is requested. Legal notice examples are not agreements. Charts are not predictions, measurements, confidence intervals or chemical rules. UI persona guards are not server security.

Input validation here demonstrates decimal-string handling and the 100% declaration contract. The 12-decimal UI limit is a bounded demo input choice, not a selected production numeric policy. Scientific evaluation always lacks approved evidence. PDF generation is not claimed: sample files are text/JSON, and print preview uses the browser's print dialog.

## Editing and checking

`components/demo-app.tsx` owns navigation/personas/dirty confirmation. `formula-pages.tsx`, `lab-pages.tsx` and `access-pages.tsx` own the workflows. `dropdown.tsx`/`dropdown.css` provide shared form menus; `persona-switcher.tsx` owns the dedicated role preview menu. `app/globals.css` defines semantic tokens and responsive shell; page styles live next to components. Pure fixtures/action mapping are in `lib/model.ts`, decimal validation in `lib/formula-validation.ts`. No external font, icon or chart service is used.

```powershell
npm run typecheck
npm test
npm run build
```

Tests check exact sums, immutable version history and role boundaries for this demo only. They do not establish Go authorization or scientific correctness. See [validation record](validation.md), [dependency review](dependency-review.md), [design decisions](design-decisions.md) and [prototype status](../.docs/02-design/prototype/prototype.md).
