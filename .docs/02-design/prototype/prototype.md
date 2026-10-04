# Prototype Status — Adopted MVP

**Updated:** 2026-10-04. The owner selected the frontend repository's MVP while retaining Honney's technology stack. The old formula-view prototypes below are historical references; they do not cover the current waves 0–5.

## Current design baseline

Use [mvp-scope.md](../mvp-scope.md), [feature-list.md](../feature-list.md), [user-journey.md](../user-journey.md) and the [backlog](../../01-requirements/backlog.md) for acceptance. Source commit: `aa572abaede14c11796a1551434858171eb37363` in `sattasarasadaw-crypto/ai-perfumery-engine-frontend`.

The source's screen cards/wireframes provide behavior for SH/PUB, X1/ACC/X4, R1, LAB, R2 and TUT. They are design inputs, not completed pages. Adapt routing/layout/components to Next.js; Mantine/Vite/Python packages are not local stack decisions. No source mock value is a supported domain result.

## Historical links

- Figma desktop: https://www.figma.com/design/2lsQN0yKWdzkUSm6V74bn1/Fragrance-Studio-—-Desktop-Prototype
- Claude Design canvas: https://claude.ai/artifact/Veb49S4E12Cuw4j56fGYop
- Design overview: https://claude.ai/artifact/NRNQHJFDiCbwWH5iRJaP7n

This revision does not edit or verify those external canvases. Do not present them as current, accepted MVP coverage.

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
