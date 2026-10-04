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

## Interaction examples — 2026-10-04

Owner requested mock data for Interaction checks. Three cards illustrate Synergy, Masking and a material group using invented DEMO material records. Each is marked Illustrative only and exposes a DEMO-INT fixture ID with the hand-authored basis. Fixture IDs are not source-rule identifiers. A permanent explanation states that the examples are independent of the selected formula and provide no chemistry, safety or performance evaluation; the scientific status remains Insufficient data (rules 58–60 and 85).

The focused UI UX Pro Max query `color not only` informed explicit category names, icons and textual status. Native details controls provide keyboard disclosure with 44px targets; existing semantic colors pair light/dark surfaces. Cards stack on narrow layouts. This display has no formula, version, dirty-state or export setters; no interaction engine or synthetic fallback is added.

## Shared form dropdowns

Further owner feedback expanded the refinement to all 27 select definitions in formula, lab, documents, account/admin and preview controls. Use a shared opaque dropdown with a restrained plum selection, checkmark, consistent chevron, 44px option rows and quiet rounded borders. The role/persona menu remains a dedicated menu with short scope descriptions. Existing values, callbacks, disabled choices and permission checks are retained; no package or domain rule is added.

The focused ui-ux-pro-max query `focus not obscured` informed bounded placement and dismissal. The shared control follows the [WAI select-only combobox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-select-only/) for active-descendant keyboard navigation; Tab dismisses without changing the draft. [Native popover top-layer placement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/showPopover) keeps lists above scrolling tables and native dialogs. Space/Enter selects, Escape cancels, arrow/Home/End/typeahead moves the active option; scrolling remains local to the popup. Popup position flips above the trigger when space below is limited. The current Chromium demo is the verified browser; older-browser compatibility and full screen-reader testing remain unverified.

## Light and dark appearance — 2026-10-04

The owner requested a top-bar light/dark switch for this synthetic demo. Keep the established plum identity with paired semantic tokens: light canvas/surface `#f6f5f8`/`#fff`, dark canvas/surface `#17131e`/`#211c29`, dark text/muted `#f3edf8`/`#b9acc9`, and lighter purple `#c9a7f6`. Primary actions have a separate foreground/background pair. Tables, badges, notices, form fields, charts, dialogs and both dropdown components use the paired tokens; original bottle art and labelled multicolor fixture swatches remain illustrations.

A focused ui-ux-pro-max style search (`dark mode`) returned OLED guidance. Its readable dark surfaces, visible focus and `color-scheme` guidance apply; pure black, neon glow and health/power claims are not adopted for this workspace. The targeted contrast guidance requires checking both themes independently. No inversion filter, animation, external service or package is added.

The switch has a keyboard-operable button, sun/moon SVG icon, translated action label and dark-state `aria-pressed`. Default is light; an explicit choice stores only `light`/`dark` at `fragrance-studio.theme`, applies before body paint, survives workflow reset, and synchronizes open tabs. Storage failure falls back to an in-page switch. Appearance changes preserve unsaved editor inputs and do not enter the dirty-navigation guard. Production dark mode remains deferred in the MVP.

## Presentation explanations and standards discovery — 2026-10-04

The owner uses the demo for presentations and requested explanations of each area. The focused UI UX Pro Max search `progressive disclosure help` returned applicable Consistent Help guidance: keep help in the same relative location. Each ready page therefore shows a native, collapsible guide immediately below the demo ribbon, with purpose, benefit, three steps and a demo boundary. A separate pending guide covers account/tutorial exploration. Loading/error previews do not expose stale page notes. The guide sits outside retained workflow components, so opening it does not remount an editor or clear a draft.

Native contextual disclosures appear in the analysis panel and Interaction checks. Their headings and text use TH/EN, theme tokens, readable body text and keyboard targets. Fixture labels become Sample profile 1/2 and Sample line 1–3; original tab IDs and coordinate data remain intact. Copy explains missing Profile A/B definitions, unitless sample stages, unquantified uncertainty and evidence gaps. No chemical, regulatory or numeric meaning is assigned to a placeholder.

The owner also asked where Thai FDA and IFRA appear. Compliance & docs now opens with separate law/regulation and industry-standard cards. Verified Thai FDA, ASEAN and IFRA links are discovery references only; IFRA document guidance points to the existing typed SKU vault. Formula shortcuts use the existing guarded navigation. Four independent jurisdiction blocks and actual insufficient-data conclusions remain intact; IFRA is not added as a fifth jurisdiction. No rule engine, threshold, amendment version, certificate or file upload is fabricated.

Further owner steering requests mock scientific-assessment output for the presentation. A visibly labelled MOCK report below Interaction checks contains three fixed hypothetical findings matching the invented pair/group examples. Every outcome is described as a script, with a report version, UI-only reference IDs and a basis disclosure. No confidence score, scientific magnitude or safety finding is provided. Its data is imported only into the display component; no formula, Evaluate or export path reads it. The footer says Actual evaluation to distinguish the unchanged insufficient-data status.

## Mock limit check in the FDA / IFRA view: pass and exceed — 2026-10-04

The owner asked to see, with mock data, what a material looks like when it exceeds a limit and when it passes. Their screenshot showed a local, unpushed draft of a per-material "อย. / IFRA" dialog. They also shared the stakeholder's 10-substance sample, its IFRA Standards overview extract and two suppliers' document sets as the reference. Those files stay out of the repository: `dataset-structure.md` marks them do-not-commit, rule.md §0.1 and rule 85 bar owner data from fixtures, and this repository is public. They were used only to copy the **shape** of the evidence: an application-category table of maximum % in the finished product, and supplier sets where one supplier sends a usage-level certificate and another does not. Every number, ID and supplier in `lib/limit-check-fixtures.ts` is invented. A unit test rejects CAS-number-shaped strings in that file. The earlier statement that no threshold or certificate is fabricated still holds for real ones; this check adds labelled fictional ones.

Unlike the fixed Interaction MOCK report, this check is computed from the declared input when Evaluate runs. It follows calculation-engine §5: `pct_in_product = pct_in_formula × dilution / 100` is applied exactly once with BigInt decimals and no rounding. Dilution is now bounded exactly as well, so a value above 100% that `Number()` would round down is rejected. It uses the §7 state names: `pass`, `exceed`, `no_limit_defined` and `data_missing`. A missing limit row, a missing certificate, an invalid total or an invalid dilution never becomes a pass. Application changes the applicable row, so the demo shows category awareness. The seeded formula shows pass, exceed and no-limit at once without editing.

Every verdict names its single source; there is no combined FDA/IFRA verdict (FR-005, §7, and the 2026-10-04 decision to keep law and industry standard apart). The table column is labelled **Mock limit / เกณฑ์สมมติ** and the chips are relative to `DEMO-STD v1`, an IFRA-style fictional table. The dialog keeps the owner's "อย. / IFRA" title as the topic, and its result eyebrow names `DEMO-STD v1 (IFRA-style)`. A separate **Thai FDA (TH)** row states that no Thai FDA limit is mocked and stays insufficient data. Supplier certificates are reported per supplier with certificate-specific chips ("within / above certificate", "no certificate"). Where both list a material, the fictional certificate is never looser than the standard, and a sentence says which source governs is a domain decision.

Presentation: each composition row gets a chip button (text + icon + colour, visible text inside the accessible name). When the composition panel is narrower than 700px (phones, and two-column desktops up to about 1365px), the chip moves under the material ID instead of adding a column. A summary with counts appears under the table after Evaluate. The dialog has a MOCK tag, a boundary notice and "ready to check" before evaluation. "Evaluate now" moves focus to the result heading. After evaluation it shows:
- a result card with a limit meter and the four figures (formula %, dilution, product %, mock maximum);
- headroom, or the excess with a rounded-down maximum declared amount;
- a "where do these numbers come from?" disclosure (snapshot, calculation, locator, comparison rule, origin);
- the Thai FDA row and the two mock supplier sets;
- the unchanged "actual evaluation: insufficient data" row and official reading links that are not the source of the limits.

Equal-to-limit counts as within only as a labelled demo choice. No near-limit band, hard block or save restriction is added, because FR-005 keeps those domain-gated. Mock results never enter saved versions or exports. Any edit clears the result until Evaluate runs again.

## ui-ux-pro-max refinement of the mock limit check — 2026-10-04

The owner asked for the ui-ux-pro-max skill to be used for this UI, installed if missing. The toolkit already sits in `.agents/skills/ui-ux-pro-max`, so it was also installed as a local Claude Code skill. This was a review of an existing component, so the skill's own guidance (Query Contract) selected focused domain searches over a new design system. The established plum system above stays. Verified results used: chart "bullet chart target threshold" (Performance vs Target / Bullet Chart: place the value and target text beside the bar, colour is supplementary, the target is a dark 3px marker); ux "color not only status", "live region status announcement" (contextual live badge updates), "error recovery path", "badge chip label wraps" (compact label overflow) and "touch target size"; react stack "modal accessible dialog" (manage focus, return it on close). An off-topic Next.js stack result and two off-topic hierarchy searches were not used.

Three skill-guided audits (accessibility and feedback, layout/typography/colour, data display) ran in a real browser. A second reviewer checked each recommendation against this design system and the no-combined-verdict rule. Changes adopted:
- The exceed chip is filled with the existing danger tokens in the table and summary, so it differs from a pass by luminance, not only by red or green hue. Chips are 12px. Supplier certificate chips stay pale.
- The verdict heading is 20px (18px on phones). The source eyebrow stays above it, so DEMO-STD is named before the verdict.
- The meter is a labelled bullet chart: the product value is printed above the bar, the over-limit segment is hatched, and the 3px limit marker has a surface halo.
- The summary leads with exceeds and names the materials and figures, or states the input error when the formula is invalid. Screen readers hear one concise status phrase.
- The exceed card has an "Edit <material> amount" action that closes the dialog and focuses that row's amount field. Every dialog state ends with a Close button.
- The inline chip switches on a 700px container query, so 1024–1365px projectors no longer clip the column, and it keeps the 44px target.

Rejected after review: putting the verdict above its source line (it would read as a Thai FDA verdict under the "อย. / IFRA" title), moving the phone-only Evaluate-now button, and a third copy of the difference in the figure tiles. No dependency, font, icon library or colour token was added.
