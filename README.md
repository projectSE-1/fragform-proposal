# AI Perfumery Engine

A calculation tool for fragrance formulators. Open a formula and see every material with its
weight, its percentage of the concentrate and of the finished product, and any restriction that
applies to it, with the rule and threshold behind every flag.

Built for one real customer, a cosmetic-science student who formulates fragrance, as the project
for **1305493 Software Engineering Case Studies, 1/2569** at Mae Fah Luang University. Team
`projectSE-1`.

## The problem

Before a formula is safe to mix, a formulator has to hold every ingredient and its concentration
in their head, calculate the quantities by hand, and check each restriction manually. A wrong
number or an overlooked limit only shows up after real material has been spent.

## Status

**Pre-alpha.** The design is complete and reviewed; the build starts now. `src/` holds the folder
structure and no code yet, so there is nothing to run. This section changes the day M1 in
[scope-lock.md](.docs/01-requirements/scope-lock.md) lands.

## Stack

| Layer | Choice |
|---|---|
| Frontend | Next.js + TypeScript |
| Backend | Go + Gin, REST |
| Database | PostgreSQL via sqlc + pgx |
| Containers | Docker |
| CI | GitHub Actions |
| Tests | Go tests, Vitest, Playwright |

The authentication mechanism is still open: a managed identity provider, or sessions in Postgres.
The two differ in data ownership and portability (`backlog.md` Open Question 18).

## Layout

```
.docs/          requirements, design, compliance        ← start here
proposal/       the project proposal
src/backend/    Go API, calculation engine, migrations
src/frontend/   Next.js app
```

## Documentation

| Read this | For |
|---|---|
| [proposal.md](proposal/proposal.md) | the problem and who it is for |
| [backlog.md](.docs/01-requirements/backlog.md) | every approved requirement and its acceptance criteria |
| [scope-lock.md](.docs/01-requirements/scope-lock.md) | what this build ships, and what it will not |
| [.docs/02-design/](.docs/02-design/) | feature list, user journey, diagrams D1 to D4, data model, permissions, calculation engine |
| [rule.md](.docs/03-compliance/rule.md) | the project's compliance rules, authoritative |
| [legal-requirements.md](.docs/03-compliance/legal-requirements.md) | the Thai legal requirements these trace to |
| [CLAUDE.md](CLAUDE.md) | how AI agents work in this repository |

When sources disagree the order is: law and regulation, then `rule.md`, then `backlog.md`, then
the design folder. If something is missing, the answer is `insufficient information` rather than
an invented requirement.

## Working here

| Branch | For | Ends as |
|---|---|---|
| `main` | always runs | documents and config land here directly |
| `feat/<slug>` | one new capability | pull request, squash, delete |
| `fix/<slug>` | one bug | same |
| `chore/<slug>` | setup, config, CI | same |

Code always takes a branch. Documents and configuration do not, because they cannot break a build
and a review on a markdown edit costs the team a day for no safety gain. Branches live hours, not
weeks.

Commit one idea at a time, whenever the repository still works. Never leave `main` broken.

## Data

**No material data is in this repository and none ever will be.** The 100-material dataset, the
IFRA extract and the supplier documents belong to the stakeholder, stay on approved
infrastructure, and are excluded in `.gitignore`. Development runs on synthetic seed data. The
same applies to the course material.

Two rules the engine holds to everywhere:

- Every number it shows cites the rule, threshold and source row that produced it.
- Where the data does not cover a case, the answer is `insufficient data` naming what is missing,
  never a guess. That includes chemical behaviour it has no rule for.

No part of the calculation path calls an external AI or model service, so the core workflow keeps
working whether or not one is available.
