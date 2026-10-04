<!-- AI Perfumery Engine; ownership follows the owner's existing agreement. No new licence is granted. -->
# Demo validation — 2026-10-04

Local synthetic prototype checks, not acceptance of the production engine/security/legal implementation.

- `npm run typecheck`: passed.
- `npm test`: 3 passed, 0 failed; exact decimal declarations, immutable prior snapshots/independent new ingredients, pending and admin/lab permission mapping.
- `npm run build`: passed with Next.js 16.3.8; root and not-found pages prerender successfully. `npm start` serves the standalone demo on loopback only; local HTTP status 200.
- `npm audit --json`: 0 reported vulnerabilities in the locked packages on this date.
- Focused code review: fixed modal accessible names, editor-only discard reset, transient what-if for read roles, typed document subjects, preserved consent history and correct reset/recovery landing steps. Admin reason/step-up/self-refusal and pending/tutorial boundaries reviewed.

## Browser walkthrough

Tested in the Codex in-app Chromium browser using public-safe invented inputs.

| Scenario | Observed result |
|---|---|
| Edit 40/30 to 35/35, save a version note | New v4 appended; selecting v3 still shows 40/30 |
| Safety Assessor starts/edits/evaluates what-if | Transient input accepted; insufficient-data result; no save action |
| Select instrument/lots, create batch, record then reweigh | Original and new readings both visible with instrument/lot/reason |
| Record BLOCK, then select NORMAL | Hard block persists; recording/preparation disabled |
| Dirty formula → navigate Lab → discard | Existing 2-entry batch trail and its hard block remain visible |
| Org Admin opens Lab | Create/record actions disabled; readable records remain |
| SDS typed embedded sample for DEMO-SKU02 | Processing reaches Demo ready; v2 links to retained v1/DEMO-SOURCE-D02, which still opens with its original sample; no real file accepted |
| Account reset button | Opens Password reset preview rather than default login |
| Withdraw synthetic consent | Both acceptance and withdrawal visible; pending nav omits formulas/lab; repeated withdrawal disabled |
| Admin tests self-grant after reason/mock MFA | Explicit refusal; no grant changed |
| Shared Error preview → Retry | Records hidden in error illustration; synthetic ready view restored |
| Mobile navigation → Escape | Focus moves into drawer; main is inert; focus returns to menu trigger |

Formula view had no page-wide horizontal overflow at **360×800, 390×844, 768×1024, 1024×768, 1366×768, 1440×900 and 844×390 landscape**. Lab, docs, references, account, admin and public overview also had no page-wide overflow at 360×800; wide tables scroll within their containers. Visible focus and labelled native dialogs were checked. A DOM text-contrast spot check led to darker secondary labels/badges/table headings; this is not a full independent accessibility audit. Reduced motion is handled by stylesheet media rules; OS preference switching was not tested.

Keyboard/reference/account/public tab handling, fixed profile/reason presets, isolated tutorial and lack of external services were checked in code. No claim is made that every browser or every scenario has been automatically tested. Real Go permissions, concurrent saves, rights execution, durable evidence, PDF generation, scan rejection and scientific/regulatory outputs remain unimplemented.

## Refined persona menu — 2026-10-04

Browser checks passed for opening the custom role menu, ArrowDown/End/Home navigation, Escape restoring the trigger, Tab and Shift+Tab closing without trapping focus, outside-click navigation, and the selected marker. Selecting the current role with dirty inputs opens no discard dialog. Selecting another role still prompts: Keep editing retains Formulator and the edited amount; Discard & continue changes to Org Admin and exposes Administration. Pending access still removes formula navigation.

The popup stays within the visible viewport at 375×812, 360×800, 320×568 and 844×390 landscape, without page-wide horizontal overflow. The narrowest case was corrected after browser measurement. In landscape, End scrolls the focused Pending access item into view above the footer. A focused read-only review found no material role, focus or permission issues. No production permission behavior is claimed.

## Shared dropdowns — 2026-10-04

All 27 select definitions use the shared Dropdown; the remaining persona control uses its dedicated menu. Browser checks confirmed Vehicle Escape preserves A while End/Enter commits B; dirty-version selection still opens the confirmation dialog, Keep editing retains the draft, and Discard and switch opens read-only v2. Disabled historical fields stay disabled.

Within the upload dialog, the Document type popup enters the native top layer; SDS selection enables the correct SKU subject and DEMO-SKU02 remains selectable. Selecting an option inside a wrapping label closes the popup without reopening it. Escape dismisses only the dropdown and keeps the dialog open. End reaches the last document type with focus retained on the labelled combobox; Tab removes the list and continues to Subject type. Profile presets without explicit option values still select Robin Demo and enable Save.

Popup and page bounds passed at 375×812 and 320×568 in the upload dialog. The account dropdown opens upwards within bounds at 844×390 landscape. Read-only review found no material callback, disabled-option, label or focus regressions. These are focused current-Chromium UI checks, not a full browser/screen-reader certification.
