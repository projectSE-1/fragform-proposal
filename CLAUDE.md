# CLAUDE.md

## Project

**AI Perfumery Engine** — ระบบผู้ช่วยคำนวณและออกแบบกลิ่นน้ำหอมด้วยฟิสิกส์เคมี. A calculation engine (100-material dataset; synergy, masking, evaporation, threshold, and material-group rules) shown on a dashboard, wrapped in accounts, saved formulas, evaluation panels, and agreements.

## Documentation map — read before acting

| Need to know... | Read |
|---|---|
| Background/product context (**not** authoritative) | `.docs/00-context/project-context.md` |
| What the supplied dataset contains (structure, not values) | `.docs/00-context/dataset-structure.md` |
| Approved requirements | `.docs/01-requirements/backlog.md` |
| Approved design (features, journeys, prototype, diagrams) | `.docs/02-design/` |
| Database schema design for the MVP formula view | `.docs/02-design/data-model.md` |
| Roles, permissions, org isolation | `.docs/02-design/roles-permissions.md` |
| Legal/compliance rules (authoritative) | `.docs/03-compliance/rule.md` |
| Legal requirements traced from W2 | `.docs/03-compliance/legal-requirements.md` |

**Authority order when sources conflict:** law/regulation → `rule.md` → `backlog.md` → `.docs/02-design/` → existing `src/` → `project-context.md` → your own assumptions. If information is missing, say `insufficient information` — never invent a requirement or a domain rule.

## Read `.docs/03-compliance/rule.md` before touching

- Personal data (accounts, formula creator/editor, client contacts, panel-tester identity, interview notes)
- Sensitive personal data (allergy, patch-test, pregnancy, religion-revealing preferences) — needs explicit owner approval before implementation, not just a read
- Access logs (login/logout, password/permission changes, formula CRUD, calculation runs, exports, admin access to another user's data)
- Agreements / e-signatures
- Owner IP (100-material dataset, interaction rules, thresholds, material groups, saved formulas)
- AI-generated results

## Non-negotiable rules

- Never send owner IP (dataset, rules, thresholds, formulas) to an unapproved third-party AI/API/cloud service.
- Never commit the real material dataset to a public repo, gist, screenshot, or demo deploy.
- Enforce authorization server-side; never rely on client-side UI hiding.
- Never expose passwords or sensitive personal data — including in logs, error messages, or AI prompts.
- The calculation engine must be explainable: every result cites the rules, thresholds, and source data used. If it lacks enough information, return `insufficient data` — never guess a chemical/material interaction.
- The core formulation/calculation workflow must keep working if the AI/model service is down.

## Development principles

- Do not invent requirements beyond `backlog.md` and `rule.md`.
- Prefer data minimisation; keep confidential data inside approved infrastructure.
- Add tests for business logic; document security-sensitive changes.
- Keep requirements traceable: backlog → design → compliance → implementation → test.
- Follow the AI-native SDLC in `project-context.md` (§21–24): don't start significant implementation until a task is "ready" (clear problem, user, behavior, acceptance criteria, no open domain/legal decisions). Surface unresolved decisions instead of assuming.

## Lecturer-Facing Deliverables

The following files/folders are the main deliverables intended for lecturer review:

1. `proposal/proposal.md`
   - Updated project proposal
   - Problem statement and target users

2. `.docs/01-requirements/backlog.md`
   - Product Backlog

3. `.docs/02-design/`
   - Design draft
   - Feature list
   - User journey
   - Prototype
   - Required diagrams

4. `.docs/03-compliance/rule.md`
   - Project rules and compliance requirements

5. `.docs/03-compliance/legal-requirements.md`
   - Legal requirements traced from the Week 2 legal research

These documents should be kept clear, consistent, and suitable for lecturer review.

Other files such as:
- `CLAUDE.md`
- `.docs/00-context/project-context.md`
- `.claude/skills/`

are primarily working/context files for the development process and are not the main lecturer-facing deliverables unless the lecturer specifically requests them.