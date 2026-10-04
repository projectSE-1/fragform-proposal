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
| Composition | Formula context → materials + explanation → interactions → analytical view/evidence |
| Charts | Hand-authored synthetic SVG/HTML coordinates, accessible text/data view; arbitrary edited inputs yield insufficient data |
| Safety of exploration | Explicit immutable saves, separate what-if, dirty-state confirmation, session-only state |
| Access | 7 fixed personas plus pending; server authorization remains future Go work |
| Accessibility | Labels/captions, skip link, visible focus, native modal dialog, Escape, keyboard reference tabs, responsive tables, reduced-motion override |

The skill's automatic-saving suggestion is not used for formulas: the local contract requires explicit immutable saves. The static helper sits after the main content and does not cover critical controls. Full bilingual content/terminology and final brand/legal/domain copy remain review tasks; this prototype translates navigation and principal workflow actions, with some technical fixture explanations in English.

## Persona menu refinement

Owner screenshot feedback on 2026-10-04 identified the browser-native role dropdown as visually inconsistent. Replace this specific branded control with an opaque, plum-accented menu: role icons, short scope descriptions and a selected checkmark. Keep the eight existing role IDs and the existing guarded role-change function; this changes presentation only. No additional dependency is needed.

A focused ui-ux-pro-max search (`dropdown keyboard focus`, UX domain) returned applicable visible-focus and unobscured-focus guidance. The menu uses a button with expanded state, radio menu items, roving focus, arrow/Home/End/typeahead navigation, Escape, normal Tab departure and outside-click dismissal. Focus returns before a guarded change so the unsaved-editor dialog retains focus. Width and scrolling are bounded for narrow and landscape viewports; reduced-motion overrides also cover its short entrance animation.

## Shared form dropdowns

Further owner feedback expanded the refinement to all 27 select definitions in formula, lab, documents, account/admin and preview controls. Use a shared opaque dropdown with a restrained plum selection, checkmark, consistent chevron, 44px option rows and quiet rounded borders. The role/persona menu remains a dedicated menu with short scope descriptions. Existing values, callbacks, disabled choices and permission checks are retained; no package or domain rule is added.

The focused ui-ux-pro-max query `focus not obscured` informed bounded placement and dismissal. The shared control follows the [WAI select-only combobox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-select-only/) for active-descendant keyboard navigation; Tab dismisses without changing the draft. [Native popover top-layer placement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/showPopover) keeps lists above scrolling tables and native dialogs. Space/Enter selects, Escape cancels, arrow/Home/End/typeahead moves the active option; scrolling remains local to the popup. Popup position flips above the trigger when space below is limited. The current Chromium demo is the verified browser; older-browser compatibility and full screen-reader testing remain unverified.

## Light and dark appearance — 2026-10-04

The owner requested a top-bar light/dark switch for this synthetic demo. Keep the established plum identity with paired semantic tokens: light canvas/surface `#f6f5f8`/`#fff`, dark canvas/surface `#17131e`/`#211c29`, dark text/muted `#f3edf8`/`#b9acc9`, and lighter purple `#c9a7f6`. Primary actions have a separate foreground/background pair. Tables, badges, notices, form fields, charts, dialogs and both dropdown components use the paired tokens; original bottle art and labelled multicolor fixture swatches remain illustrations.

A focused ui-ux-pro-max style search (`dark mode`) returned OLED guidance. Its readable dark surfaces, visible focus and `color-scheme` guidance apply; pure black, neon glow and health/power claims are not adopted for this workspace. The targeted contrast guidance requires checking both themes independently. No inversion filter, animation, external service or package is added.

The switch has a keyboard-operable button, sun/moon SVG icon, translated action label and dark-state `aria-pressed`. Default is light; an explicit choice stores only `light`/`dark` at `fragrance-studio.theme`, applies before body paint, survives workflow reset, and synchronizes open tabs. Storage failure falls back to an in-page switch. Appearance changes preserve unsaved editor inputs and do not enter the dirty-navigation guard. Production dark mode remains deferred in the MVP.
