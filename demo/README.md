<!-- AI Perfumery Engine; ownership follows the owner's existing agreement. No new licence is granted. -->
# Fragrance Studio — interactive MVP demo

Local, standalone **Next.js App Router + TypeScript** prototype on the Honney branch. All materials, formulas, people, documents, measurements and charts are invented. This directory is separate from the future production `src/frontend` app under rule 85. It has no Go API, database, identity provider, email, scanner or scientific engine.

## Run

For a copy/ZIP opened on another local machine, start with [DEMO.md](DEMO.md). The demo has complete source files and a lockfile; it requires no project-specific absolute path, environment secret or external API.

Requires Node.js >=20.9 (verified locally with 24.18.1) and npm. From the repository root:

```powershell
cd demo
npm.cmd ci --ignore-scripts
npm.cmd run dev
```

These Windows PowerShell examples use `npm.cmd` to select the command wrapper explicitly when `npm.ps1` is blocked. On macOS/Linux, use `npm` instead. Run installation/start commands inside `demo/`, where its package manifest and lockfile live.

Open http://127.0.0.1:3000. It binds to loopback only. To build and run the standalone demo instead: `npm.cmd run build`, then `npm.cmd start`. The build is still a **synthetic demo**, never a production implementation of the perfumery product. Workflow changes exist only in memory and reset on refresh or Reset demo. The Light/Dark button in the top bar stores only `light` or `dark` under `fragrance-studio.theme` in this browser; refresh and Reset demo preserve that appearance choice. If storage is unavailable, switching still works for the open page. Switching pages preserves the current exercise. Pending access hides domain views; role switches only exercise presentation permissions.

## Try the workflow

1. Open Morning Reverie. Change the first two amounts to `35` and `35`, leaving `20` and `10`. Save with an invented version note. Inspect history: earlier versions remain intact.
2. Start what-if, change amounts and Evaluate. The official-result placeholder returns **insufficient data**. “Show sample charts” displays hand-authored coordinates independent of the input. Discard or explicitly save the trial.
3. In Lab workspace select a saved version, instrument and lots. Create a batch, record a preset reading, then reweigh with a reason. Try BLOCK: choosing NORMAL does not dismiss the recorded block. Walk through the labelled remediation simulation.
4. In Compliance & docs choose a document type and its matching SKU or lot, then an embedded sample. Observe simulated queued/scanning/parsing/ready or rejected states. Repeating a type/subject appends another version with a link to the retained earlier record. No actual file is accepted.
5. Open the user menu: its first level shows Internal Team, SaaS Workspace and Client Portal. Open Internal Team to choose an existing permission profile such as Org Admin or the separate Pending access account status. The two external groups are planned and unavailable in this MVP. Inspect pending access, fixed role controls, synthetic MFA, account rights and the reasoned metadata query. Persona switching is a presentation test; it never grants real access. Account consent history persists when the withdrawal preview changes access to pending.
6. Use Ready view / Loading preview / Error preview to exercise shared request states; Retry restores only the synthetic display.
7. Opt into the isolated tutorial. Q6 is available to administrator personas only; pending personas have Q0–Q5. Use the public overview, how-to/FAQ and labelled draft legal notice.
8. In the formula workspace, choose Evaluate. Each row's **Mock limit** chip (TH: เกณฑ์สมมติ) now shows a result against the fictional `DEMO-STD v1` table: with the seeded 40/30/20/10 (or the 35/35/20/10 from step 1), Soft study 04 and Citrus study 01 are within, Petal study 02 exceeds and Wood study 03 has no mock limit (insufficient data, not a pass). Open a row: the **FDA / IFRA** dialog shows the finished-product calculation (`% in formula × % dilution ÷ 100`), the fictional limit row, the headroom or excess and a rounded-down maximum. A separate Thai FDA (TH) row stays not mocked / insufficient data, and two mock supplier document sets are kept separate. Switch Application to Demo application B and evaluate again to see the verdicts change; any edit clears the mock result. All limits are invented in an IFRA-style layout; the actual evaluation stays insufficient data and nothing is added to saved versions or exports.

For a presentation, follow [PRESENTATION.md](PRESENTATION.md). Every ready page has a collapsible TH/EN Presentation guide with its purpose, benefit, three demonstration steps and boundary. Analytical tabs have contextual “Explain this section” disclosures. Sample profile 1/2 rename the fixture views only; the production Profile A/B definitions remain pending. The three time lines are unnamed synthetic series with no physical time units.

The limit-check dialog keeps the official Thai FDA cosmetic-laws and IFRA Standards Library links as reading links only; they are not the source of the fictional limits. “Document vault” in the formula evidence panel opens Compliance & docs. The former Interaction checks section, fixed scientific MOCK report and explanatory Thai FDA / ASEAN / IFRA standards cards on Compliance & docs have been removed. The document page retains its four independent jurisdiction blocks (TH / EU / US / ASEAN) and typed sample vault, including the existing SKU-bound IFRA certificate-of-conformity type; actual findings remain insufficient data. These presentation removals do not remove FR-005/006/014 or production pair/group checks.

## Scope and limitations

| Design requirement | Demo scenario | Real implementation still required |
|---|---|---|
| FR-001, FR-016–018 / waves 0–1 | Public pages, preset signup/verification/pending, mock MFA/reset, own rights, scoped admin and reasoned log query | Reviewed notices/consent, Go sessions/CSRF/server authorization, rights execution, durable logs, email/backup/incident controls |
| FR-002–007, FR-009–011, FR-015 / wave 2 | Search/create/edit, exact decimal input validation, immutable versions, what-if, missing reasons, profile/evolution illustration, evidence list/tree | Concurrent server versioning, approved models/data/rules/uncertainty and official Go results |
| FR-008, FR-012–013 / wave 3 | Pinned batch, explicit instrument/lots, append-only fixture readings, WARN/BLOCK/remediation, printable previews and text downloads | Approved targets/conversions/tolerances, actual measurements, official mixing-sheet/label PDF and export logging |
| FR-005–006, FR-014 / waves 2, 4 | Per-row mock limit check after Evaluate against the fictional `DEMO-STD v1` table, with calculation, limit row and two separately reported mock supplier document sets (one with a mock certificate of conformity, one without); Thai FDA row not mocked; separate actual jurisdiction findings, document completeness and typed embedded-sample processing | Approved legal sources/category/dilution/thresholds, Go findings, storage/scanning, actual bytes, append-only SDS versions and authorization |
| FR-019–020 / wave 5 | Opt-in synthetic missions, progress, dismissible static tip and FAQ | Reviewed tutorial scripts and own-progress service |

No panels, production approvals, client portal, SaaS billing, AI chat, reference editing, regulatory report export, notifications. Production dark mode remains deferred; the owner requested a light/dark appearance switch for this synthetic demo only. No real password, OTP, user upload or owner dataset is requested. Legal notice examples are not agreements. Charts are not predictions, measurements, confidence intervals or chemical rules. Mock limit results are not regulatory clearance, prohibited-material detection, a certificate or a production hard block. UI persona guards are not server security.

Input validation here demonstrates decimal-string handling and the 100% declaration contract. The 12-decimal UI limit is a bounded demo input choice, not a selected production numeric policy. The mock finished-product quantity is declared material percentage × declared dilution / 100, applied once with exact decimals (dilution validated exactly as greater than 0 and no more than 100%) and labelled as a local presentation calculation; it does not model constituent composition or replace server-owned quantities under rule 64. Actual scientific and regulatory evaluation still lack approved evidence. Mock findings do not enter saved formula versions or exports. PDF generation is not claimed: sample files are text/JSON, and print preview uses the browser's print dialog.

## Editing and checking

`components/demo-app.tsx` owns navigation/personas/dirty confirmation. `formula-pages.tsx`, `lab-pages.tsx` and `access-pages.tsx` own the workflows; the Formula editor owns Evaluate and clears the mock result on any edit. `limit-check.tsx` shows the mock FDA / IFRA limit check; its exact-decimal comparison is in `lib/limit-check.ts`, its fictional limit tables in `lib/limit-check-fixtures.ts` and its official reading links in `lib/official-sources.ts`. `dropdown.tsx`/`dropdown.css` provide shared form menus; `persona-switcher.tsx` owns the three-group menu and nested permission preview. `theme-toggle.tsx` and `lib/theme.ts` own the local appearance preference and pre-paint bootstrap. `app/globals.css` defines light/dark semantic tokens and responsive shell; page styles live next to components. Pure fixtures/action mapping are in `lib/model.ts`, decimal validation in `lib/formula-validation.ts`. No external font, icon or chart service is used.

`presentation-guide.tsx` and `lib/presentation-guide.ts` provide page-level notes; `analysis-explainer.tsx` provides contextual notes.

```powershell
npm.cmd run typecheck
npm.cmd test
npm.cmd run build
```

Tests check exact sums, immutable version history, role boundaries and the mock limit-check states for this demo only. They do not establish Go authorization or scientific correctness. See [validation record](validation.md), [dependency review](dependency-review.md), [design decisions](design-decisions.md) and [prototype status](../.docs/02-design/prototype/prototype.md).
