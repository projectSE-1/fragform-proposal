# Feature List

- **View & evaluate a formula** — see every material, its calculated weight/percentage, and
  highlighted rule/restriction status in one place. ⭐ core
- Formula storage — a list of the formulas the logged-in user is authorized to see.
- Login, with append-only access logging.
- In-place "what-if" recalculation — adjust a value, see updated results immediately.
- Export the currently displayed formula view.
- Odour profile chart — the formula's composition grouped by odour family.
- Evaporation curve — per-material intensity over time, with an adjustable time scale.
- Account data rights — view, correct, and delete one's own account data.

Formula authoring from an empty state is explicitly not a feature in this build cycle — see
`backlog.md` Open Question 1 for how formulas get into the system instead. Raw-material database
editing, experiment history, and the external client portal are likewise not in this cycle; see
`roles-permissions.md` §2.

The evaporation curve depends on an evaporation model that has not been chosen yet
(`data-model.md` §7). It is listed as a feature but is not ready to implement.

Traceability: every bullet maps to a Functional Requirement in `.docs/01-requirements/backlog.md`
Section 4 (FR-001–FR-010) plus PRIV-002 for account data rights. FR-009 and FR-010 come from the
team scope decision of 2026-09-10, not from the 2026-09-02 interview.
