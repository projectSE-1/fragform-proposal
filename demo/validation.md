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

## Light/dark appearance and local source — 2026-10-04

- Final `npm run build` passed with TypeScript checks; existing model tests remain 3 passed, 0 failed. No dependency was added. Read-only theme and CSS review found no material findings.
- Current Chromium: mouse and Enter/Space switch between light/dark with focus retained; dark background, surfaces, input text and selected state update. Refresh restores dark; Reset demo restores workflow inputs while retaining dark. Changing appearance keeps an unsaved amount (`35`) and opens no discard dialog. TH/EN action labels update. Two current-version tabs synchronize after a switch. The final standalone build had no observed browser-console errors.
- Formula, lab, compliance, account, tutorial and public surfaces use the dark palette. Role menu and Vehicle dropdown render dark; the typed-upload dialog and its native top-layer list remain readable. The upload popup stays within a 375×812 viewport.
- Phone header/page bounds pass at 320×568, 375×812 and 390×844. Added-button overflow was fixed by compacting the persona control; existing 320px history/hidden-table-label overflow was corrected with wrapping and a positioned scroll container. Wide tables retain local scrolling. Theme button target is 44×44px.
- Independent token spot checks: dark body text about 14.5:1, muted text 7.8:1, primary action 6.3:1 and danger action 4.69:1. This is focused visual/DOM checking, not a full accessibility or screen-reader certification. Storage denial and print media fallback were reviewed in code; browser storage-denial and physical printing were not exercised.
- `DEMO.md` documents portable source startup with Node/npm, loopback URLs, an alternative port and optional build/start. The alternative-port invocation was checked against the installed Next CLI. The source archive excludes installed packages, build outputs, secrets and owner data; first package installation needs internet. Startup on a second physical computer or another OS was not tested.

## Windows PowerShell startup correction — 2026-10-04

Owner reported PowerShell blocking `npm.ps1` while running from the repository root. Startup instructions now enter `demo/` first and explicitly invoke `npm.cmd`; macOS/Linux retain `npm`. Locally, the installed `npm.cmd` exists and `npm.cmd --version` returns 11.16.0. No execution policy was changed.

The subsequent install reported Windows `EPERM` while unlinking the native Next SWC file. Stopped the agent-owned demo server, then repeated `npm.cmd ci --ignore-scripts`: 27 packages installed, audit reported 0 vulnerabilities. A temporary dev server on loopback port 3001 started and rendered the complete formula page in the in-app browser (HTTP 200 in server output), verifying that the native compiler works after reinstallation. The temporary server and tab were closed so the owner can run their own terminal. Documented stopping the demo before reinstalling and using only `npm.cmd run dev` for later launches.

## Three user groups and interaction examples — 2026-10-04

- TypeScript check passed after both component changes; no dependency, permission-map or calculation logic changed. Independent read-only review found no material issues in either component.
- Current Chromium: the first menu level shows exactly Internal Team, SaaS Workspace and Client Portal. ArrowDown focuses SaaS and Enter does not activate it. Home/ArrowRight opens Internal; Home focuses the styled Back row (44px high, 12px text, appearance reset). Escape returns to groups, then closes and restores trigger focus. The separate system-administration and pending-status captions remain visible.
- Same-role selection with an unsaved amount opens no dialog. Selecting Org Admin prompts; Keep editing retains Formulator and the amount `35`. Discard & continue changes to Org Admin and exposes Administration. Selecting Pending access removes formula navigation.
- Menu/page bounds passed at 375×812, 320×568 and 844×390. End scrolls Pending access above the footer at phone and landscape sizes. The 320px interaction cards stack within the page without horizontal overflow. Light/dark and TH/EN menu rendering were visually inspected; these are focused browser checks, not a full screen-reader certification.
- Enter and Space open native example disclosures, showing the fixture ID and hand-authored basis. Opening details retains Saved v3 and a disabled Save new version action. Evaluate still reports Insufficient data with missing model/rule evidence. All three examples remain explicitly independent of the selected formula. Export isolation was reviewed in code; no fixture is added to the snapshot contract.

## Presentation help, standards and mock assessment — 2026-10-04

- Final TypeScript check and Next.js build passed after the guide, analytical explanations, standards cards and MOCK report changes. Existing model tests remain three passed. No dependency, production contract, calculation or role grant changed.
- Current Chromium: page guides change with formula, compliance, lab and account navigation. Pending-access Overview has an account/tutorial-only guide. Loading preview hides the guide; Ready restores it. Enter/Space expand/collapse native help. Editing an amount and opening help preserves the unsaved value without a discard dialog.
- With Formulator, saved 35/35/20/10 as v4 with a note, then evaluated a 30/40/20/10 what-if. The missing-data state kept entered values; Show sample charts restored the labelled illustration, not a scientific result. Discard retained the saved snapshot. Sample profile 2 data kept 63/47/69/49/26; time help explains three arbitrary lines and S0–S5. Uncertainty and Sources disclosures show their evidence gaps; Tree view still works.
- The fixed MOCK report renders three hypothetical pair/group findings in TH/EN, with report/version/UI-reference basis. Changing the first amount to 34 and opening the basis kept that input and all three scripted findings. The separate Actual evaluation footer stays Insufficient data. Independent read-only review confirmed the mock is imported only by the display component, with no draft/save/Evaluate/export dependency; export isolation was reviewed in code rather than through a new download test.
- The Regulations & IFRA shortcut opens Compliance & docs. With an unsaved edit it prompts; Keep editing retains Formulator and the value, then Discard restores v4. Standards links match verified official Thai FDA, ASEAN and IFRA sources. The IFRA document help expands with keyboard, its vault anchor reaches Sample documents, and choosing IFRA certificate of conformity in the existing upload dialog selects SKU. The modal was closed without adding a record. Four independent jurisdiction cards remain visible and missing, with no IFRA fifth-jurisdiction or safety-pass claim.
- Guide, contextual help and mock bounds passed at 375×812 and 320×568; standards cards stack within 320×568 without page-wide overflow. TH light and EN dark were checked, and the desktop standards/mock views were visually inspected at 1280×900. Existing theme preference was restored and temporary viewport/tab cleaned up. No browser-console errors were observed in the temporary test tab. These are focused current-browser checks, not a full accessibility or scientific validation.

## Mock limit check (pass / exceed) — 2026-10-04

- `npm run typecheck` and `npm run build` passed. `npm test`: 12 passed, 0 failed. The new limit-check tests cover:
  - exact product share with dilution applied once, plus decimal comparison;
  - the seeded pass / exceed / no-limit states and counts;
  - application-specific rows;
  - the exact at-limit boundary and one step above it;
  - a rounded-down non-terminating maximum;
  - invalid totals and dilutions, including `100.0000000000000001`, giving `data_missing` (never a pass);
  - supplier certificates that are missing, unlisted or reported separately, and never looser than the standard;
  - fixtures that hold only DEMO IDs and no CAS-shaped strings.
- A scripted comparison of every added line found none of the owner sample's CAS numbers, names, identifiers, supplier names or document IDs. The owner files stayed outside the repository.
- Multi-lens review (compliance, logic, UI in a real browser, documentation), each finding checked by an independent verifier. Fixed after review:
  - the combined "อย. / IFRA" verdict label: the column is now Mock limit / เกณฑ์สมมติ, and a separate Thai FDA row is shown as not mocked;
  - mock marking where the verdict is shown;
  - supplier chips that could read as material verdicts, and certificate values that were looser than the standard;
  - focus loss after "Evaluate now";
  - visible chip text missing from the accessible name;
  - the "incomplete" wording and the English-only reason in Thai mode;
  - the meter label overlapping 0% far above the limit;
  - the phone table widened by the new column, now an inline chip;
  - "1 percentage points";
  - percent signs on the calculation operands;
  - the inexact dilution bound;
  - test gaps;
  - presentation numbers that assumed the seeded formula after earlier script steps had changed it;
  - stale DEMO.md and prototype status.
- Current Chromium checks:
  - TH/EN, light/dark, 1440×1000 and 390×844 rendered without page overflow, and on phones the composition table keeps its previous scroll width (366 px).
  - Before Evaluate, the row name is "เกณฑ์สมมติของ Soft study 04: ตรวจ (ยังไม่ได้ประเมิน)". Evaluate now moves focus to the "ผ่านเกณฑ์สมมติ" heading.
  - Soft study 04 is within (2% ≤ 2.5%, 0.5 points of headroom). Petal study 02 exceeds (6% > 5%, over by 1, maximum 25%). Wood study 03 has no mock limit, and Application B flips the verdicts.
  - An edit clears the result. A 41% first row reports the Thai reason for an invalid total in every row.
  - Escape returns focus to the row button.
  - Export isolation was reviewed in code.
- These are focused checks of a synthetic demo, not a regulatory, scientific or full accessibility validation.

## ui-ux-pro-max refinement — 2026-10-04

- `npm run typecheck` and `npm run build` passed. `npm test`: 12 passed, 0 failed. Logic is unchanged; the changes are presentation only.
- Three skill-guided audits ran in current Chromium, each checked by a second reviewer: accessibility/feedback, layout/typography/colour, data display. 11 recommendations were adopted, several in modified form, and 3 were rejected. See design-decisions.md.
- Browser checks after the change:
  - Exceed chips are filled (white on danger: 6.31:1 light, 4.69:1 dark).
  - The status phrase is "ผลตรวจเกณฑ์สมมติ: เกิน 1 ไม่มีเกณฑ์ 1 ผ่าน 2 จาก 4 รายการ". The summary names "Petal study 02 (6% > 5%)".
  - "แก้สัดส่วนของ Petal study 02" closes the dialog and focuses `editor-amount-row-2`.
  - A 41% first row shows the Thai total-error cause under the table and in the status phrase.
  - Composition table overflow at 1024×768 drops to 0 px, from 62–101 px before.
  - At 390×844 the inline chip button is 44 px tall. The table keeps its pre-feature 8 px scroll, and the page does not overflow.
  - The meter shows the value label, a hatched over-limit segment and the haloed 3 px marker, in light and dark.

## Merge of parallel mock limit implementations — 2026-10-05

- Merging `origin/Honney` brought in the limit check above while a parallel local per-ingredient variant existed. The limit check was retained; the local variant was removed with its code and tests.
- The owner-steering removal of the Interaction checks section, its fixed MOCK report and the Compliance & docs standards cards was kept. The 2026-10-04 checks of those elements and of the Regulations & IFRA shortcut are now historical. The formula shortcut reads Document vault, and the official Thai FDA and IFRA Standards Library links live in `lib/official-sources.ts`, shown only in the limit dialog.
- `npm test`: 12 passed, 0 failed. `npm run typecheck` and `npm run build` passed. No browser re-check was run for this merge.
