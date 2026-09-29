# Diagrams (D1–D4)

All four diagrams describe the same system and the same one core workflow as
`feature-list.md`/`user-journey.md`: primary actor **Formulator**, system **AI Perfumery Engine**.
Rendered as Mermaid (GitHub and most Markdown viewers render these natively); source diagram tool
alternatives (draw.io/Figma/PlantUML) can replace these later without changing what they show.

**Domain Expert** appears only in D1, as the external source of the material/rule dataset (rule.md
§0) — not as a system use case; see `backlog.md` §2 Users for why.

## D1 — System Context

What it shows: the system as one box, plus the actors and data store outside it. No internal
detail — just the boundary.

```mermaid
flowchart LR
    Formulator[Formulator]:::actor
    DomainExpert[Domain Expert]:::actor
    System[AI Perfumery Engine]
    Dataset[(Material & Rule Dataset)]

    Formulator -->|logs in, views & evaluates formulas| System
    DomainExpert -->|supplies dataset/rules| Dataset
    System -->|reads| Dataset

    classDef actor fill:#fff,stroke:#333,stroke-width:2px,font-weight:bold;
```

## D2 — Use Case

What it shows: which actor can do what. The core use case ("View & evaluate a formula") is
central and includes Login, matching the journey's step order. Domain Expert is not shown here —
this cycle has no in-app use case for that role (see note above). The odour profile chart and
evaporation curve (FR-009, FR-010) are part of UC3, not separate use cases. Formulator is a user
with the `member` role (`roles-permissions.md` §3).

```mermaid
flowchart LR
    Formulator[Formulator]:::actor
    subgraph SYS["AI Perfumery Engine"]
        UC1([Login])
        UC2([View formula list])
        UC3([View & evaluate a formula])
        UC4([Adjust value & recalculate])
        UC5([Export formula view])
    end

    Formulator --- UC1
    Formulator --- UC2
    Formulator --- UC3
    Formulator --- UC4
    Formulator --- UC5

    UC2 -.include.-> UC1
    UC3 -.include.-> UC1
    UC4 -.include.-> UC1
    UC5 -.include.-> UC1

    classDef actor fill:#fff,stroke:#333,stroke-width:2px,font-weight:bold;
```

## D3 — High-Level Architecture

What it shows: layers, the six server modules, and the direction of calls, naming the chosen stack
(table below). The modules follow the Backend Map page
(https://claude.ai/artifact/JoF8PwkdQNxjJQZ3cLsjZk). Where the engine sits follows
`calculation-engine.md` §3.

```mermaid
flowchart LR
    subgraph Client
        UI[Next.js + TypeScript]
    end
    subgraph Server["Server — Go + Gin REST API"]
        AUTH[Auth & session<br/>verify session]
        PERM[Permission & tenancy<br/>action check · record check org_id]
        FORM[Formula module<br/>EvaluationService loads snapshot]
        ENGINE[Calculation engine<br/>pure · no DB, network or clock]
        ACC[Account & consent<br/>/me · consent gate]
        LOG[Access log writer<br/>INSERT only]
    end
    subgraph Database
        DB[(PostgreSQL via sqlc + pgx:<br/>organisations · users · consent records*<br/>formulas · formula_items · materials<br/>odour and volatility tables<br/>material_restrictions · regulation_*<br/>access_log*)]
    end

    UI -->|HTTPS| AUTH
    AUTH --> PERM
    PERM --> FORM
    AUTH -->|session only| ACC
    FORM -->|snapshot| ENGINE
    AUTH --> DB
    FORM --> DB
    ACC --> DB
    AUTH --> LOG
    FORM --> LOG
    ACC --> LOG
    LOG --> DB
```

Every formula request passes the same gates: verify session → action check → record check on
`org_id` (`roles-permissions.md` §5). Login creates the session, and the `/me` routes need a valid
session but no permission (`roles-permissions.md` §3). The Formula module's `EvaluationService`
loads the formula through sqlc + pgx, and the engine computes on that snapshot. The engine is the
only module with no path to the database (CER-003), and no module calls an external AI or model
service (NFR-004). The Auth, Formula and Account modules write events to the access-log writer,
which only INSERTs (LR2); the engine writes none, since the Formula module logs each calculation
run.

\* Required by `rule.md` but not yet modelled as tables (`data-model.md` §9).

The engine placement follows `calculation-engine.md` §3. The Backend Map page still draws its gate
chain as handler → engine → sqlc + pgx, which gives the engine database access, and needs the same
change.

### Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | Next.js + TypeScript | Strong web UI, routing, forms, SSR when useful, excellent TypeScript ecosystem |
| Backend | Go + Gin | Simple, fast, strongly typed, excellent for APIs and calculation/business logic |
| Database | PostgreSQL | Excellent relational modeling, constraints, transactions, JSON support |
| DB access | sqlc + pgx | Type-safe SQL without hiding SQL behind a heavy ORM |
| API | REST | Simple and appropriate for this product |
| Auth | Managed auth or secure session-based auth | Avoid building authentication from scratch (still open which of the two — see note below) |
| Containerization | Docker | Consistent development and deployment |
| Cloud | Railway (was Google Cloud Run + Cloud SQL) | Simple container deployment with managed infrastructure |
| CI/CD | GitHub Actions | Easy automated testing/deployment |
| Testing | Go tests + Playwright + Vitest | Backend, end-to-end, and frontend coverage |

Auth is the one line still open: "managed" (a third-party identity provider) vs. self-rolled
session-based auth in Postgres are different enough in data ownership and portability that this
should be pinned down as a real decision, not left as "or," before it's built (`backlog.md` Open
Question 18). If managed auth is
chosen, the identity provider becomes an external box outside the server in D3, and the system
still writes its own access log (rule.md rule 35).

Railway, and a managed identity provider if one is chosen, would process data outside Thailand.
Before the first deployment each must be listed in `docs/privacy/transfers.md` and flagged to the
owner (rule.md rule 18). Railway would also hold owner IP (the dataset and formulas), so it needs
the owner's written approval as well (rule.md §0.1, IP-004). See `backlog.md` Open Question 15.

## D4 — Activity

What it shows: one scenario, start to end — the same steps as `user-journey.md`, including the
two optional branches (what-if edit loops back to review; export is optional before end).

```mermaid
flowchart TD
    Start((Start)) --> Login[Log in]
    Login --> List[Open formula list]
    List --> Select[Select a formula]
    Select --> Calc[System calculates weights/percentages<br/>and highlights applicable rules]
    Calc --> Review[Formulator reviews formula view]
    Review --> Decision1{Adjust a value?}
    Decision1 -->|yes| Recalc[Recalculate in place]
    Recalc --> Review
    Decision1 -->|no| Decision2{Export?}
    Decision2 -->|yes| Export[Export formula view]
    Decision2 -->|no| End((End))
    Export --> End
```
