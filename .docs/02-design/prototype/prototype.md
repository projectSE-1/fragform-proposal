# Prototype

**Figma (Desktop):** https://www.figma.com/design/2lsQN0yKWdzkUSm6V74bn1/Fragrance-Studio-—-Desktop-Prototype

**Claude Design canvas (Perfumery Engine MVP):** https://claude.ai/artifact/Veb49S4E12Cuw4j56fGYop

**Design overview (Perfumery Engine Blueprint):** https://claude.ai/artifact/NRNQHJFDiCbwWH5iRJaP7n

## Known gaps

Neither prototype matches the approved design yet. Resolve these before presenting either one as
the core workflow (`user-journey.md`).

### Claude Design canvas — closest to the design

| Shows | Conflicts with |
|---|---|
| "Save as version" on a trial change | FR-007 recalculates without saving and lets the user save explicitly, but whether a trial edit can become a real formula change, and with what permission, is `backlog.md` Open Question 7. "Version" also assumes formula versions, which are not modelled yet (`data-model.md` §7, decision 9; Open Question 13) |
| "Interaction checks" of material pairs against masking and synergy rules | No supplied rule defines masking or synergy (`.docs/00-context/dataset-structure.md` §1; `data-model.md` §7, decision 11). Under CER-002 and rule.md rule 59 an uncovered pair must show `insufficient data` (`backlog.md` Open Question 16) |
| "Near limit means 90 to 100 % of the maximum" | The near-limit band is an undecided stakeholder call (`backlog.md` Open Question 11) |
| A dashed "extrapolation" curve at skin temperature | Behaviour outside the Antoine range is still open (`data-model.md` §7, decision 5) |
| The admin ticks the new user's consent on "Create account" | Consent must be the account holder's own act (rule.md rules 1, 41, 44, 49; PRIV-001). The screen also presupposes that admins create accounts (`backlog.md` Open Questions 2 and 4) |
| Granting the admin role with no re-authentication | rule.md rule 47 lists it as a high-risk act; whether re-authentication applies now is `backlog.md` Open Question 4 (`roles-permissions.md` §3) |
| The Account page says "Nothing else is stored" | `users` also holds `purpose_code`, `consent_id`, `retention_until` and `created_at` (`roles-permissions.md` §4) |

### Figma — out of date

| Shows | Conflicts with |
|---|---|
| Compose / "Generate formula" from a brief; "Start something new" | Formula authoring is out of scope, and the build has no generative feature (`proposal.md`; `backlog.md` Open Question 1) |
| "Any credentials will open the studio" on the login | FR-001, NFR-003: authenticated login, no public sign-up |
| Named "Fragrance Studio"; COST column; Version History tab; Top/Heart/Base grouping | Product name is AI Perfumery Engine; none of these has a requirement in FR-001–FR-010 |
