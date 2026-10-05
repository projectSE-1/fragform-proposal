# Prototype Status — Adopted MVP

**Updated:** 2026-10-04. The owner selected the frontend repository's MVP while retaining Honney's technology stack. The old formula-view prototypes below are historical references; they do not cover the current waves 0–5.

## Local interactive demo

Owner request, 2026-10-04: create a runnable synthetic demo using ui-ux-pro-max and the linked Claude artboard as a visual reference. [The standalone demo](../../../demo/README.md) uses the retained Next.js App Router/TypeScript stack and purple-accented table/explanation/chart composition in light and dark themes. [Design decisions](../../../demo/design-decisions.md) record the skill/reference choices. Run instructions are in the demo README.

The demo presents waves 0–5 with formula search/create/immutable versions/what-if, explicitly synthetic analytical illustration and missing reasons, lab fixture recording/reweigh/block states, typed embedded document processing, read-only references, public/account/admin paths and opt-in tutorial. The user menu shows three business groups; Internal Team nests the seven fixed permission personas and the separate pending account status. SaaS Workspace and Client Portal are labelled planned and unavailable, retaining their scope deferral. Exact input checks and immutable-state tests cover prototype behavior only.

Current owner steering, 2026-10-04, removes the Interaction checks presentation (three synergy / masking / material-group example cards and its fixed scientific MOCK report) and the explanatory Thai FDA / ASEAN / IFRA standards cards from Compliance & docs. The formula evidence-panel shortcut is now **Document vault** and opens Compliance & docs.

Owner request, 2026-10-04: show with mock data what a material looks like when it passes or exceeds a limit. On Evaluate, each composition row is compared with a fictional, IFRA-style limit table (`DEMO-STD v1`) per demo application. The finished-product share is the declared % × dilution ÷ 100, applied once with exact decimals. The states are pass, exceed, no limit (insufficient data) and data missing. A per-material "อย. / IFRA" dialog shows the calculation, its source row, two mock supplier document sets reported separately, and a Thai FDA row that is not mocked. The owner-supplied substance sample, IFRA extract and supplier documents shaped the layout only; no real value is in the public repository. Results clear on any edit and never enter saved versions or exports. There is no near-limit band or hard block. The actual evaluation and jurisdiction findings still report insufficient data, so this adds no regulatory rule or production requirement.

For lecturer presentations, every ready page has a collapsible TH/EN guide explaining purpose, benefit, three demonstration steps and its limits. Analysis has contextual explanations; the per-material limit dialog explains its mock calculation separately. Synthetic profile tabs are labelled Sample profile 1/2, while production Profile A/B definitions remain unresolved. Time series are labelled Sample line 1–3 without physical duration or approved chemical meaning. [The presentation walkthrough](../../../demo/PRESENTATION.md) records the explanation and requirement mapping.

Official Thai FDA cosmetic-laws and IFRA Standards Library links appear inside the limit dialog as reading links only; they are not the source of the fictional limits. Compliance & docs retains its TH / EU / US / ASEAN findings and typed sample vault, including SKU-bound IFRA certificate-of-conformity samples. IFRA is not a fifth jurisdiction. The removed standards cards and interaction mock do not remove FR-005/006/014 or production pair/group checks. This presentation support adds no approved legal/scientific rule; production checking still needs category/version/dilution-aware evidence, independent findings and Go-side enforcement.

Owner request, 2026-10-04: add a top-bar light/dark switch to the standalone demo. Only the appearance value is retained in browser local storage; it is applied before paint and survives refresh/reset. This prototype addition does not change the production MVP deferral of dark mode.

All workflow records are invented and held in memory. `demo/` is separate from production `src/` under rule 85; its standalone build must never be imported into a production product build. There is no Go API, PostgreSQL, real authentication/consent/rights/log service, scanner, approved chemical or regulatory model. Print/text/JSON previews are demonstrators, not the official PDF deliverables. Draft legal text, sample measurements, charts and mock MFA are not evidence of acceptance, measurement, safety or authorization.

Current coverage and missing implementation are mapped to FR IDs in the demo README. Domain/legal/security readiness gates remain unchanged. Final brand/copy, full bilingual terminology, approved scientific result charts/error budgets and lab PDFs still require review.

## Current design baseline

Use [mvp-scope.md](../mvp-scope.md), [feature-list.md](../feature-list.md), [user-journey.md](../user-journey.md) and the [backlog](../../01-requirements/backlog.md) for acceptance. Source commit: `aa572abaede14c11796a1551434858171eb37363` in `sattasarasadaw-crypto/ai-perfumery-engine-frontend`.

The source's screen cards/wireframes provide behavior for SH/PUB, X1/ACC/X4, R1, LAB, R2 and TUT. They are design inputs, not completed pages. Adapt routing/layout/components to Next.js; Mantine/Vite/Python packages are not local stack decisions. No source mock value is a supported domain result.

## Historical links

- Figma desktop: https://www.figma.com/design/2lsQN0yKWdzkUSm6V74bn1/Fragrance-Studio-—-Desktop-Prototype
- Claude Design canvas: https://claude.ai/artifact/Veb49S4E12Cuw4j56fGYop
- Design overview: https://claude.ai/artifact/NRNQHJFDiCbwWH5iRJaP7n

The local demo task opened the supplied Claude canvas to inspect its visual layout; it did not edit the external canvases or validate their scientific/legal content. Do not present them as current, accepted MVP coverage.

## Required prototype revision

| Area | Current behavior to show |
|---|---|
| Public/auth/account | TH/EN public pages without system data; explicit consent/verification; login/MFA/pending access; own rights; no automatic domain role on signup |
| Admin | Source seven roles, no self-grant, reason and fresh step-up for protected actions, server record boundaries; restricted log query |
| Formula editor | Create and explicitly save immutable versions; separate transient evaluation; no numerical preview calculated in the editor |
| Analysis | Profile A/B where supported, complete provenance list/tree, interval/tier for estimates, exact quantities separately, missing reasons and formula/model freshness |
| Lab | Batch/instrument selection, per-item weighing, WARN/BLOCK with approved rules, reweigh/pre-dilution, mixing sheet and label |
| Compliance/docs | Independently displayed findings, hard blocks, document completeness, typed upload/status and authorized access |
| Tutorial/mascot | Opt-in synthetic sandbox, static tips/FAQ, dismissible helper that never covers errors/blocks/MFA |
| Every screen | Loading/success/empty/error states; responsive desktop/mobile, keyboard access, reduced motion; fail-closed on API failure |

## Known unresolved details

The earlier canvases assumed a near-limit band, interaction rules, extrapolation, admin consent on behalf of a user and incomplete account storage disclosures. Those assumptions remain unsupported. Formula saving/versioning is now in scope, but the canvases' particular version flow is not approved solely by that scope change.

Final visual mockups, domain model/uncertainty rules, scientific glossary, legal text, brand assets and lab print layouts still need review. Placeholder visuals and labelled synthetic demos may be used for development; they do not count as production data, model validation or owner consent.
