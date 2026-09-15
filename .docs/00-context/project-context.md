# AI Perfumery Engine — Project Context

> **Purpose:** Background context for Claude Code.
>
> This document summarizes the current understanding of the AI Perfumery Engine project based on project discussions and development work so far.
>
> **Important:** This document is contextual information, not the authoritative source for final requirements.
>
> When information in this document conflicts with an authoritative project document, the authoritative document takes precedence.

---

# 1. Project Overview

## Project Name

**AI Perfumery Engine**

Thai description:

**ระบบผู้ช่วยคำนวณและออกแบบกลิ่นน้ำหอมด้วยข้อมูลทางเคมี/กายภาพ**

The project is a student software-engineering project related to cosmetic science/perfumery.

The system is intended to help users work with fragrance formulas using a structured dataset of aroma materials and calculation/rule-based logic.

The project combines:

* Perfumery domain knowledge
* Chemical/physical material data
* Formula calculation
* Regulatory/compliance rules
* User and formula management
* Explainable calculation results
* AI-assisted software development

The project should prioritize a useful and understandable core application rather than attempting to reproduce every feature of a large commercial fragrance platform.

---

# 2. Current Product Concept

The system uses a dataset of approximately **100 aroma materials**.

Each material may have chemical/physical properties and domain information used by the calculation engine.

The engine is intended to model or evaluate concepts such as:

* Material groups
* Synergy
* Masking
* Evaporation over time
* Thresholds
* Regulatory restrictions/rules
* Formula quantities and concentrations

The system presents calculation and analysis results through a web-based dashboard/interface.

The surrounding application may include:

* User accounts
* Authentication/login
* Saved formulas
* Formula viewing
* Formula creation/editing
* Evaluation panels
* Agreements/approvals
* Regulatory information

The exact final feature scope is still being refined through the product backlog and design process.

**Access model (confirmed 2026-09-02, via real interview):** this is a bespoke tool built for
one real fragrance-producer customer's own internal use — not a public platform. Unlike the
reference product examined earlier (fragrance-engine.com), which lets any signed-up user
generate and order a custom fragrance, this system has **no public self-service
generation/ordering flow**. Access is restricted to our customer's own users. This narrows the
account/auth model (no public signup) and is a confirmed scope decision, not an assumption.

**Access model, stakeholder revision (2026-09-10):** asked directly who is able to use the app,
the stakeholder described two user groups, which widens the 2026-09-02 note above. Recorded here
as stakeholder input; the build-cycle scope is still to be negotiated and is **not** yet an
approved requirement.

*Group 1 — Internal team (perfumer lab).* Perfumer, R&D, lab staff. Described as managing the
raw-material database (essential oils, aroma chemicals), designing formulas, calculating
concentration and proportion, recording experiment history, and managing technical documents
(MSDS/CoA).

*Group 2 — External users / clients.* Customers who buy or rent the system, B2B clients ordering
production, or outside manufacturers. Two modes were described:

- **SaaS mode** — each customer gets their own workspace for their organisation's formulas and
  material inventory, with data kept separate from other tenants.
- **Client portal** — a client views the formulas they ordered, adjusts note/aroma profile within
  defined bounds, and downloads formula certification documents.

What this settles: formula visibility is **organisation-scoped**, not per-individual (Open
Question 3 in `backlog.md`), and internal versus external accounts are provisioned differently
(Open Question 2). It also confirms MSDS/CoA handling is a real need, matching the per-supplier
documents in the supplied sample (`dataset-structure.md` §3).

What it conflicts with, and must be negotiated before any of it becomes a requirement:

- "One customer's internal use" above. A multi-tenant SaaS mode is a different product shape.
- Formula authoring from an empty state, currently out of scope (`backlog.md` Open Question 1).
  "Designing formulas" is authoring.
- Raw-material database management. Nothing in FR-001–FR-010 edits material data; the dataset is
  currently read-only input.
- "Within defined bounds" for client profile adjustment is undefined. Bounds set by whom, against
  what limit, is an open domain question.

Security implication to carry into design regardless of scope: a client portal puts a person from
**outside the customer's company** behind a login. Every owner-IP protection (LR5, IP-001,
IP-002) currently assumes all authenticated users are the customer's own staff. That assumption
stops holding, and server-side authorisation (SEC-001) becomes the only thing separating one
organisation's formulas from another's.

**Outcome, team scope decision (2026-09-16):** this build cycle serves the internal team only.
The client portal and SaaS mode are deferred, and supplier document download goes with them.
Permissions are checked per action, with two roles (`member`, `admin`). See
`.docs/02-design/roles-permissions.md` §2–§3.

---

# 3. Project Problem

**Source: real interview (2026-09-02) with our primary stakeholder** — a cosmetic-science
student who formulates fragrance and is acting as our real customer for this project. This
replaces the earlier hypothetical framing with what was actually said in that interview.

Main pain point, in the stakeholder's own framing:

> Fragrance formulation is complex and requires formulators to keep track of many pieces of
> information at once.

This breaks down into four concrete sub-problems she identified:

1. **Too much information to track** — many ingredients, different concentrations, different
   quantities, different properties/restrictions.
2. **Manual calculation** — calculating ingredient weight, percentage/concentration, totals,
   and checking whether the values are correct.
3. **Rule/compliance checking is complicated** — knowing which rules apply to which
   ingredients, checking limits/restrictions, easy to overlook something.
4. **Needing to calculate/check before physically mixing** — a formulator may want to evaluate
   a formula first, rather than discover a calculation mistake or a rule violation only after
   physically mixing materials.

The stakeholder's own framing of the solution direction:

> Our program helps formulators understand and evaluate fragrance formulas by automatically
> calculating formula information and highlighting relevant rules and restrictions.

The exact behavior should still be determined by the approved requirements and design
documents — this interview is a real input into that process, not the final spec.

---

# 4. Target Users

The project is primarily intended for users involved in fragrance formulation and evaluation.

The stakeholder's 2026-09-10 answer groups these into an internal team and external clients (see
§2, access-model revision). The role descriptions below predate that answer and are kept as the
longer-form notes; where they disagree, the 2026-09-10 note is the newer stakeholder input.

Potential roles discussed include:

## Lab User / Formulator

**Confirmed via real interview (2026-09-02):** this role is backed by an actual stakeholder —
a cosmetic-science student who formulates fragrance and is our real customer for this project
(see §3). The interview-count arrangement based on this single real-customer relationship is
tracked in `lecturer-material-do-not-commit/notes.md`.

A person working with fragrance materials and formulas.

Typical activities may include:

* Viewing formulas
* Creating or editing formulas
* Calculating material quantities
* Preparing materials for laboratory work
* Checking applicable rules
* Reviewing calculation results

## Domain Expert

A person with authoritative knowledge of perfumery/chemistry/regulatory rules.

Supplies the material and rule dataset the engine operates on (see `dataset-structure.md`). Does
not use the product itself in the current build cycle.

## Administrator

A system-level role may manage users, permissions, or other administrative operations.

Exact administrator functionality is still subject to the approved backlog and design.

## Evaluation Panel / Panel Tester

The system may support fragrance evaluation panels.

Potential information includes:

* Panel tester identity
* Evaluation results
* Interview/evaluation notes

Exact workflow remains subject to requirements.

---

# 5. Core Domain Concepts

## Aroma Material

A material used in a fragrance formula.

The project currently uses approximately 100 materials in its core dataset.

Material information may include chemical/physical properties and other domain attributes.

The real dataset is confidential project intellectual property.

---

## Formula

A combination of aroma materials and their quantities/concentrations.

A formula may be:

* Created
* Viewed
* Edited
* Saved
* Calculated
* Evaluated
* Exported

Exact functionality must follow the product backlog.

---

## Material Group

A classification/grouping of aroma materials.

Material groups may be used by the calculation engine and interaction rules.

---

## Synergy

A domain rule/concept representing interactions where materials may produce a combined effect.

The system must not invent unsupported synergy relationships.

Synergy rules are confidential project intellectual property.

---

## Masking

A domain rule/concept representing situations where one material or combination may reduce or hide another sensory effect.

Masking rules are confidential project intellectual property.

---

## Evaporation

The system may model changes in material presence/effect over time based on evaporation-related properties.

The exact mathematical model is not yet considered a universally fixed requirement unless documented in the authoritative design/specification.

---

## Threshold

A threshold represents a relevant limit or point used by the calculation engine.

Thresholds may be:

* Chemical/physical
* Sensory
* Regulatory
* System-defined

Do not assume that all thresholds have the same meaning.

The authoritative rule/design documentation should define how each threshold is used.

---

# 6. Calculation Engine

The calculation engine is a core component of the project.

The engine may combine:

1. Formula input
2. Material data
3. Material groups
4. Interaction rules
5. Synergy rules
6. Masking rules
7. Evaporation behavior
8. Thresholds
9. Regulatory rules

The result should be explainable.

## Explainability Requirement

Every important calculated result should identify, where applicable:

* Rules used
* Relevant thresholds
* Source data

The system should allow a user/domain expert to understand why the system produced a result.

## Insufficient Information

If the engine does not have enough information to produce a supported result, it should return:

> `insufficient data`

It must not guess unsupported chemical/material interactions.

---

# 7. Formula Workflow

A major current product direction is improving the formula workflow for practical laboratory use.

A potential workflow is:

```text
Select/Open Formula
        ↓
View Formula Materials
        ↓
Enter or select Target Batch Size
        ↓
Calculate Required Material Weights
        ↓
Check Relevant Rules
        ↓
Show Warnings / Restrictions
        ↓
Explain Calculation
        ↓
User Proceeds With Laboratory Work
```

This is a conceptual workflow, not yet a final implementation requirement.

Do not implement details that have not been approved through the requirements/design process.

---

# 8. Formula Viewing

The formula-viewing page is an important part of the current product direction.

The user should be able to see the information necessary to understand a formula.

Potential information includes:

* Formula name
* Materials
* Percentage
* Quantity
* Material group
* Relevant calculated information
* Regulatory rules
* Warnings
* Calculation explanations

The existing web application was identified as having limitations around clearly communicating relevant IFRA/regulatory rules and helping users determine practical material weights.

The final UI should be determined by the design draft/prototype.

---

# 9. Regulatory / IFRA Direction

Regulatory compliance is an important part of the project.

The project may need to represent rules such as:

* Maximum allowed concentration
* Restricted materials
* Prohibited materials
* Conditional restrictions
* Material/product-category restrictions
* Warnings
* Combination/interactions between substances
* Other regulatory conditions

However:

**Do not invent IFRA requirements.**

If a regulatory rule is not supported by an authoritative project source, the system should not pretend that the rule exists.

Regulatory information must be traceable to its source.

The project-specific compliance rules are maintained in:

```text
.docs/03-compliance/rule.md
```

Legal requirements traced from W2 are maintained in:

```text
.docs/03-compliance/legal-requirements.md
```

These documents are authoritative for the project's compliance implementation.

---

# 10. Compliance

The lecturer requires the repository to contain:

1. Updated Proposal
2. Product Backlog
3. Design Draft
4. Compliance

The compliance deliverable consists of:

```text
.docs/03-compliance/
├── rule.md
└── legal-requirements.md
```

`legal-requirements.md` should contain the legal requirements traced from the W2 work.

The intended traceability chain is:

```text
W2 Legal Source/Finding
        ↓
Legal Requirement
        ↓
System Requirement
        ↓
Product Backlog Item
        ↓
Design
        ↓
Implementation
        ↓
Test
```

Compliance should therefore not exist only as a standalone legal document.

Where appropriate, requirements should be connected to affected backlog items, designs, implementation, and tests.

---

# 11. Personal Data

The surrounding application may process personal data such as:

* User name
* Email
* Role
* Formula creator/editor identity
* Client brief contact information
* Panel tester identity
* Interview/evaluation notes

Personal-data features must follow the requirements in:

```text
.docs/03-compliance/rule.md
```

The project currently expects privacy principles such as:

* Appropriate consent/legal basis where required
* Purpose definition
* Data minimisation
* Retention definition
* Appropriate user data rights

Do not implement personal-data processing based only on assumptions in this context document.

Consult the authoritative compliance documents first.

---

# 12. Sensitive Personal Data

Potentially sensitive information discussed for the project includes:

* Allergy/sensitisation information
* Patch-test results
* Pregnancy status
* Religion-revealing preferences

These categories require particular care.

Sensitive personal data should not be implemented casually.

Explicit project/domain-owner approval is required before implementing features that process such information.

Do not expose such information in logs, client responses, AI prompts, analytics, or other systems unless explicitly authorized.

---

# 13. Security

The project contains valuable intellectual property and personal data.

Security principles include:

* Never expose passwords.
* Never expose sensitive personal data unnecessarily.
* Authorization must be enforced on the server.
* Do not rely only on client-side UI restrictions.
* Do not expose confidential formulas to unauthorized users.
* Do not commit the real proprietary material dataset to a public repository.
* Do not send confidential project/product data to unapproved external services.

Security-sensitive changes should be documented and tested.

---

# 14. Confidential Intellectual Property

The following are considered confidential project IP:

* 100-material dataset
* Material properties/data
* Interaction rules
* Synergy rules
* Masking rules
* Thresholds
* Material groups
* Saved formulas
* Other proprietary calculation logic

These must not be sent to unapproved:

* AI services
* APIs
* Cloud services
* External databases
* Analytics services
* Third-party tools

unless explicitly approved.

When using Claude Code or another AI tool, do not assume that project data is safe to send externally.

Use the project's approved AI/tool configuration.

---

# 15. Access Logging

If authentication exists, important security-sensitive actions should be logged according to the requirements in `rule.md`.

Potential important events include:

* Login
* Logout
* Password changes
* Permission changes
* Formula creation
* Formula updates
* Formula deletion
* Calculation runs
* Export/download
* Administrative access to another user's data

Logs must follow the retention and append-only requirements defined by the authoritative compliance rules.

Do not invent additional legal logging requirements.

---

# 16. Electronic Agreements

The surrounding system may include agreements and approvals.

Where required by `rule.md`, the system should preserve information such as:

* Signer identity
* Timestamp
* Document version
* Document hash
* Authentication method
* Relevant signing metadata

High-risk actions may require stronger authentication according to the authoritative compliance requirements.

Do not implement a legal/electronic-signature workflow based solely on this context file.

---

# 17. AI

The project may use AI/model capabilities, but AI should not be treated as an unrestricted source of truth.

The AI must not:

* Invent chemical interactions
* Invent regulatory requirements
* Invent material properties
* Guess missing information
* Override approved domain rules
* Modify authoritative rules without approval

For calculation-related functionality, deterministic/project-approved calculation logic should remain authoritative.

If AI-generated information is used, its source and limitations should be clear.

The core workflow should remain useful if an external AI/model service is unavailable where practical.

---

# 18. Offline / Core Workflow

A current project principle is:

> The core workflow should remain usable when an AI/model service is unavailable.

This does not necessarily mean that the entire application must be fully offline.

The important distinction is:

* Core formulation/calculation functionality should not unnecessarily depend on an AI service.
* AI may assist where appropriate.
* External model failure should not make essential deterministic calculations impossible.

The exact architecture remains subject to the approved design.

---

# 19. Current Required Repository Deliverables

The lecturer currently requires the repository to contain:

## 1. Updated Proposal

Must contain at minimum:

* Problem statement
* Target users

Recommended location:

```text
proposal/proposal.md
```

---

## 2. Product Backlog

Required exact location:

```text
.docs/01-requirements/backlog.md
```

The backlog is the primary source for approved product requirements.

Backlog items should eventually be traceable to design, compliance, implementation, and tests where applicable.

---

## 3. Design Draft

Required directory:

```text
.docs/02-design/
```

Current expected contents:

```text
.docs/02-design/
├── feature-list.md
├── user-journey.md
├── prototype/
└── diagrams/
```

The design requires:

* Feature list
* User journey
* Prototype
* Four diagrams

Do not assume specific diagram types unless they have already been decided by the project/course requirements.

---

## 4. Compliance

Required:

```text
.docs/03-compliance/
├── rule.md
└── legal-requirements.md
```

`rule.md` contains the project rules.

`legal-requirements.md` contains the legal requirement specification traced from W2.

---

# 20. Current Project Documentation Hierarchy

The project should treat documents approximately in this order:

## Highest authority

### 1. Approved legal/compliance sources

Actual laws, regulations, authoritative regulatory material, and approved W2 legal findings.

↓

### 2. `rule.md`

Project-specific compliance rules derived from authoritative sources.

↓

### 3. Approved Product Requirements

```text
.docs/01-requirements/backlog.md
```

↓

### 4. Approved Design

```text
.docs/02-design/
```

↓

### 5. Implementation

```text
src/
tests/
```

`project-context.md` is **below these documents in authority**.

It provides context but should not override them.

---

# 21. Current AI-Native SDLC Direction

The project is being developed using an AI-native software-development workflow inspired by the AI-SDLC approach.

The goal is not:

> "Tell AI to build the whole application."

Instead, the workflow should be:

```text
Human Decision
      ↓
Clear Requirement
      ↓
Design
      ↓
Compliance Check
      ↓
Ready Task
      ↓
AI Planning
      ↓
Implementation
      ↓
Testing
      ↓
AI Review
      ↓
Human Approval
```

AI should execute well-defined work rather than independently inventing product decisions.

---

# 22. Human Decision vs AI Execution

## Humans should decide

* Product scope
* Target users
* Business priorities
* Regulatory interpretation
* Legal requirements
* Chemistry/domain rules
* Whether a requirement is acceptable
* Whether a design is acceptable
* Important security/privacy decisions

## AI can assist with

* Requirement analysis
* Identifying ambiguity
* Suggesting alternatives
* Creating implementation plans
* Writing code
* Writing tests
* Reviewing code
* Finding inconsistencies
* Maintaining traceability
* Documentation updates
* Detecting missing edge cases

AI recommendations must not automatically become project requirements.

---

# 23. Definition of Ready Concept

Before asking Claude Code to implement a significant feature, the feature should be sufficiently defined.

A task is more likely to be "ready" when it has:

* Clear problem
* Clear user
* Expected behavior
* Acceptance criteria
* Relevant design
* Relevant compliance requirements
* Important edge cases identified
* No unresolved decisions that require human/domain-expert judgment

If important decisions remain unresolved, Claude should identify them rather than silently making assumptions.

---

# 24. Requirements Traceability

Important requirements should be traceable.

Example:

```text
Problem
  ↓
Backlog Item
  ↓
Design Feature
  ↓
Compliance Requirement (if applicable)
  ↓
Implementation
  ↓
Test
```

Example for formula calculation:

```text
PB-XX
Formula quantity calculation
        ↓
Formula calculation feature
        ↓
Relevant regulatory rules
        ↓
Calculation implementation
        ↓
Calculation tests
```

Example for compliance:

```text
W2
 ↓
LR-XXX
 ↓
PB-XXX
 ↓
Design
 ↓
Implementation
 ↓
Test
```

Do not create fake traceability just to fill a table.

Only create links that are actually justified.

---

# 25. Current Known Product Direction

The following directions have been discussed and are useful context, but they are not automatically final requirements unless present in the approved backlog/design:

### Formula Page

Improve the formula-viewing experience so users can understand the formula and its relevant information.

### Laboratory Calculation Support

Help users determine how much of each material should be weighed for a target amount.

### Regulatory Visibility

Clearly show relevant regulatory/IFRA rules associated with materials/formulas.

### Explainable Results

Show why the system produced a calculation or warning.

### Formula Management

Support saving and managing formulas.

### Evaluation

Support fragrance evaluation/panel workflows where required.

### Agreements

Support agreements/approvals where required.

---

# 26. Important Existing Discussion: Security

A previous discussion considered whether the application should support offline use/licensing.

The important project principle is **not** that the system must be offline.

The important security problem is:

> Protecting the application and confidential project data even when an attacker obtains application files or attempts to bypass the UI.

Therefore, security requirements should focus on:

* Authorization
* Confidentiality
* Protection of proprietary data
* Secure handling of credentials
* Server-side enforcement
* Appropriate logging
* Protection against unauthorized access

Do not treat "offline" itself as a security solution.

---

# 27. Important Existing Discussion: Existing Software

An existing fragrance-engine product/documentation was examined as a reference for understanding what a mature fragrance engine could look like.

It is useful as:

* Inspiration
* Domain reference
* UX reference
* Conceptual reference

It is **not** automatically the project's specification.

Do not simply copy another product's functionality.

The project should focus on its own identified user problems and course requirements.

---

# 28. Important Development Principle

Do not over-engineer the project merely because an existing commercial product has many features.

The goal is to create a coherent, demonstrable software system that solves the project's identified problems.

Prefer:

* Clear core workflow
* Explainable calculations
* Traceable requirements
* Useful lab support
* Clear regulatory information
* Testable business logic

over unnecessary features.

---

# 29. Unknown / Unresolved Items

The following should be treated as unresolved unless confirmed in authoritative project documents:

* Exact final feature list
* Exact four diagram types
* Exact database schema
* Exact calculation equations
* Exact evaporation model
* Exact synergy model
* Exact masking model
* Exact threshold definitions
* Exact IFRA rule dataset
* Exact Thai legal requirements
* Exact AI model/provider
* Exact offline architecture
* Exact authentication mechanism
* Exact agreement/signature implementation
* Exact panel evaluation workflow
* Exact administrator capabilities

Claude must not invent decisions for these areas.

When an unresolved issue materially affects implementation, Claude should identify it and ask for or recommend a human decision.

---

# 30. How Claude Code Should Work With This Project

When starting work:

1. Read `CLAUDE.md`.
2. Read this `project-context.md`.
3. Inspect the relevant authoritative documents.
4. Inspect the existing repository/code.
5. Identify relevant backlog items.
6. Check relevant design documents.
7. Check relevant compliance rules.
8. Identify ambiguity/conflicts.
9. Create an implementation plan.
10. Wait for human approval when an important decision is unresolved.
11. Implement the approved scope.
12. Add/update tests.
13. Check traceability.
14. Review for security/compliance issues.
15. Report what changed and what remains unresolved.

Do not start by rewriting the entire project.

---

# 31. Authority Reminder

When deciding what to do, use this priority:

```text
Authoritative legal/regulatory source
        ↓
Approved project compliance rules
        ↓
Approved product requirements/backlog
        ↓
Approved design
        ↓
Existing implementation
        ↓
Project context
        ↓
AI assumptions
```

**AI assumptions are the lowest authority.**

If information is missing, prefer:

> `insufficient information`

over inventing a requirement or domain rule.

---

# 32. Final Principle

The AI Perfumery Engine is a software project with three particularly important characteristics:

1. **Domain-specific calculation**
2. **Regulatory/compliance constraints**
3. **Confidential intellectual property**

Therefore:

> The AI should help the team move faster, but humans and authoritative project documents remain responsible for deciding what the system is supposed to do and what rules it must follow.
