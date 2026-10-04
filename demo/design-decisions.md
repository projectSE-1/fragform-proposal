<!-- AI Perfumery Engine; ownership follows the owner's existing agreement. No new licence is granted. -->
# Demo design decisions

2026-10-04 · requested ui-ux-pro-max skill · Next.js web demo, synthetic data only.

**Reference:** [owner-supplied Claude artboard](https://claude.ai/artifact/Veb49S4E12Cuw4j56fGYop), opened and visually inspected. Retain its light background, purple accents, ingredient table, explanation card and chart composition. It is a historical visual reference: its old two-role/no-new-formula scope, material values, limits and assumed model rules are not adopted. Current behavior follows the local MVP, backlog, roles and rule.md.

**Skill review:** the first design-system search (`scientific laboratory perfumery dashboard`) returned a meditation/neumorphism recommendation and was rejected. The single retry (`saas dashboard minimal light`, density 7) returned useful light SaaS surfaces/accessibility guidance but landing-page/glass/blue choices did not fit the scientific workspace/reference. No unchecked generator output was persisted as an authoritative design system. Targeted Next.js and keyboard/modal searches informed implementation. This curated specification records the actual choices.

| Token/pattern | Choice and purpose |
|---|---|
| Canvas/surfaces | #f6f5f8 / #fff, opaque bordered cards; stable legibility for dense records |
| Brand accent | Deep plum #6d4ca0 and #503276, pale #f0eaf7; follows the supplied visual reference |
| Text | #272333 primary, semantic muted text; restrained type hierarchy and tabular amounts |
| Status | Text + badge/icon for missing, WARN, BLOCK and processing; never color alone |
| Spacing | 4/8-based spacing, 14px card radius, clear compact header + generous card internals |
| Typography | Locally available Segoe UI / Leelawadee UI / Arial; no external font requests |
| Icons/illustration | Original inline SVG icons, original CSS bottle illustration; no third-party image assets |
| Navigation | Persistent workspace/sidebar, mobile drawer with scrim, separate account/admin/tutorial |
| Composition | Formula context → materials with per-ingredient regulatory Mock disclosure + explanation → analytical view/evidence |
| Charts | Hand-authored synthetic SVG/HTML coordinates, accessible text/data view; arbitrary edited inputs yield insufficient data |
| Safety of exploration | Explicit immutable saves, separate what-if, dirty-state confirmation, session-only state |
| Access | 3 business-group cards; Internal Team nests the 7 fixed permission personas and separate pending status; external groups stay planned; server authorization remains future Go work |
| Accessibility | Labels/captions, skip link, visible focus, native modal dialog, Escape, keyboard reference tabs, responsive tables, reduced-motion override |

The skill's automatic-saving suggestion is not used for formulas: the local contract requires explicit immutable saves. The static helper sits after the main content and does not cover critical controls. Full bilingual content/terminology and final brand/legal/domain copy remain review tasks; this prototype translates navigation and principal workflow actions, with some technical fixture explanations in English.

Owner icon feedback, 2026-10-04: forward/open indicators use a compact rounded right chevron instead of a long arrow. The shared inline SVG keeps the existing sizes, theme colors, accessible button names and actions.

## Persona menu refinement

Owner screenshot feedback on 2026-10-04 identified the browser-native role dropdown as visually inconsistent. Replace this specific branded control with an opaque, plum-accented menu: role icons, short scope descriptions and a selected checkmark. Keep the eight existing role IDs and the existing guarded role-change function; this changes presentation only. No additional dependency is needed.

A focused ui-ux-pro-max search (`dropdown keyboard focus`, UX domain) returned applicable visible-focus and unobscured-focus guidance. The menu uses a button with expanded state, radio menu items, roving focus, arrow/Home/End/typeahead navigation, Escape, normal Tab departure and outside-click dismissal. Focus returns before a guarded change so the unsaved-editor dialog retains focus. Width and scrolling are bounded for narrow and landscape viewports; reduced-motion overrides also cover its short entrance animation.

## Business groups and nested permissions — 2026-10-04

Owner clarification: show three main groups, then separate granular permissions. The first menu level is Internal Team, SaaS Workspace and Client Portal. Internal Team opens the existing seven permission profiles; System Admin has a separate caption and Pending access is explicitly an account status. SaaS Workspace and Client Portal are discoverable but unavailable, matching the deferred scope. No new role identifier, tenant switch or action grant is introduced.

UI UX Pro Max guidance on progressive disclosure, predictable Back, visible focus and touch targets informed the hierarchy. The Back row uses a calm secondary surface, a rounded plum icon tile and a left chevron matching the shared icon style. An explicit appearance reset prevents native button styling; its 44px minimum target and hover/pressed/focus states use existing theme tokens. ArrowRight enters Internal, ArrowLeft/Escape returns to groups, and another Escape closes with trigger focus restored. Existing guarded role changes remain intact.

## Replaced interaction presentation — 2026-10-04

The earlier presentation added fixed pair/group examples and a separate scientific MOCK report. Later owner steering removes that section and the explanatory standards cards on Compliance & docs. The current presentation instead opens an input-linked TH/IFRA mock comparison directly from each Material composition row. This replaces demo presentation only; production pair/group and compliance requirements remain unchanged and still require approved evidence.

## Shared form dropdowns

Further owner feedback expanded the refinement to all 27 select definitions in formula, lab, documents, account/admin and preview controls. Use a shared opaque dropdown with a restrained plum selection, checkmark, consistent chevron, 44px option rows and quiet rounded borders. The role/persona menu remains a dedicated menu with short scope descriptions. Existing values, callbacks, disabled choices and permission checks are retained; no package or domain rule is added.

The focused ui-ux-pro-max query `focus not obscured` informed bounded placement and dismissal. The shared control follows the [WAI select-only combobox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-select-only/) for active-descendant keyboard navigation; Tab dismisses without changing the draft. [Native popover top-layer placement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/showPopover) keeps lists above scrolling tables and native dialogs. Space/Enter selects, Escape cancels, arrow/Home/End/typeahead moves the active option; scrolling remains local to the popup. Popup position flips above the trigger when space below is limited. The current Chromium demo is the verified browser; older-browser compatibility and full screen-reader testing remain unverified.

## Light and dark appearance — 2026-10-04

The owner requested a top-bar light/dark switch for this synthetic demo. Keep the established plum identity with paired semantic tokens: light canvas/surface `#f6f5f8`/`#fff`, dark canvas/surface `#17131e`/`#211c29`, dark text/muted `#f3edf8`/`#b9acc9`, and lighter purple `#c9a7f6`. Primary actions have a separate foreground/background pair. Tables, badges, notices, form fields, charts, dialogs and both dropdown components use the paired tokens; original bottle art and labelled multicolor fixture swatches remain illustrations.

A focused ui-ux-pro-max style search (`dark mode`) returned OLED guidance. Its readable dark surfaces, visible focus and `color-scheme` guidance apply; pure black, neon glow and health/power claims are not adopted for this workspace. The targeted contrast guidance requires checking both themes independently. No inversion filter, animation, external service or package is added.

The switch has a keyboard-operable button, sun/moon SVG icon, translated action label and dark-state `aria-pressed`. Default is light; an explicit choice stores only `light`/`dark` at `fragrance-studio.theme`, applies before body paint, survives workflow reset, and synchronizes open tabs. Storage failure falls back to an in-page switch. Appearance changes preserve unsaved editor inputs and do not enter the dirty-navigation guard. Production dark mode remains deferred in the MVP.

## Presentation explanations and ingredient regulation mock — 2026-10-04

The owner uses the demo for presentations and requested explanations of each area. The focused UI UX Pro Max search `progressive disclosure help` returned applicable Consistent Help guidance: keep help in the same relative location. Each ready page therefore shows a native, collapsible guide immediately below the demo ribbon, with purpose, benefit, three steps and a demo boundary. A separate pending guide covers account/tutorial exploration. Loading/error previews do not expose stale page notes. The guide sits outside retained workflow components, so opening it does not remount an editor or clear a draft.

Native contextual disclosures appear in the analysis panel. Their headings and text use TH/EN, theme tokens, readable body text and keyboard targets. Fixture labels become Sample profile 1/2 and Sample line 1–3; original tab IDs and coordinate data remain intact. Copy explains missing Profile A/B definitions, unitless sample stages, unquantified uncertainty and evidence gaps. No chemical, regulatory or numeric meaning is assigned to a chart placeholder.

The ingredient-row control is labelled **FDA / IFRA · Mock** / **อย. / IFRA · Mock**. Evaluate creates a separate synthetic snapshot using the declared formula amounts and dilution. Details show the concentrate declaration, local sample finished-product basis (`amount × dilution / 100`), independently invented TH and IFRA caps, textual outcome, missing reasons and fixture provenance. Bounds apply only to `Demo application A` / `Demo vehicle A`; unsupported context never inherits them. Input edits invalidate the mock snapshot; stale findings cannot describe a changed formula. This presentation calculation does not implement the Go-owned production result contract or constituent chemistry.

The invented default Citrus example uses `40%` declaration and `20%` dilution to show `8% w/w` against invented TH `10%` and IFRA `5%` caps. The independent outcomes explain why one sample check can be within its cap while the other exceeds. Missing or unsupported data remains explicit. Labels say within/above a **sample limit**, never FDA-approved, safe or certified. Mock findings do not become production hard blocks, versioned analysis or exported safety findings; actual evaluation remains insufficient data.

### Immediate pass/exceed presentation examples — 2026-10-05

The detail dialog adds three native, 44px-minimum controls with `aria-pressed`: Current input, Pass example and Exceed example. Without an evaluated finding it opens Pass example; otherwise Current input. Fixed examples in `lib/ingredient-regulation-preview.ts` use Citrus (`DEMO-M01`) at `4%` or `12%` against the same invented TH `10%` / IFRA `5%` caps. They demonstrate green/red result layouts independently of the opened row and formula. The dialog title and ID identify the active example, and “Opened from” retains navigation context. An explicit note separates it from current input. Mode switching changes only local display state; it does not edit a draft or save/export an assessment. Missing current findings remain missing in Current input mode. Text and icons accompany colors; assessments stack on narrow screens. Numeric display preserves near-boundary mock differences instead of showing an above-limit value rounded equal to its cap.

Official Thai FDA and IFRA links sit in ingredient details as discovery references only, explicitly separate from the hand-authored caps. Compliance & docs retains four independent jurisdiction blocks and the typed sample vault, including its existing SKU-bound IFRA certificate type. IFRA is not added as a fifth jurisdiction. Removing the earlier information cards does not remove FR-005/006/014, weaken missing-source requirements or approve a rule engine, amendment version, certificate or upload service.
