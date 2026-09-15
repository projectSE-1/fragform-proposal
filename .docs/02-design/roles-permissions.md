# Roles, Permissions and Tenancy

Design for who can use the system and what each user may do.

Source: stakeholder answer of 2026-09-10, recorded in `project-context.md` §2 (access-model
revision), and the team scope decision of 2026-09-16 that limits this cycle to the internal team.
The stakeholder answer widened the earlier "one customer's internal use" framing, so this document
separates what this cycle builds from what the schema merely keeps possible.

---

## 1. The two groups

**Internal team (perfumer lab).** Perfumer, R&D, lab staff. Described by the stakeholder as
managing the raw-material database, designing formulas, calculating concentration and proportion,
recording experiment history, and handling technical documents (MSDS/CoA).

**External users and clients.** Customers who buy or rent the system, B2B clients ordering
production, outside manufacturers. Two modes were described: a SaaS mode where each customer gets
an isolated workspace, and a client portal where a client views formulas they ordered, adjusts a
profile within defined bounds, and downloads certification documents.

---

## 2. What this cycle builds

Team scope decision, 2026-09-16: this cycle serves the **internal team only**. No external user
gets an account. The client portal is deferred because it is the part of the access model with
the highest risk (an outside party behind a valid login) and its permission design is not
settled yet. SEC-005 records what that design must cover before it starts.

| In this cycle | Deferred |
|---|---|
| Permission check on every action, enforced server-side | Client portal and every external account |
| `org_id` on every tenant-owned row | SaaS mode: tenant administration, onboarding, billing, more than one organisation in production |
| Formula export (FR-008) | Supplier document download (MSDS/CoA) |
| | Client profile adjustment "within defined bounds" |
| | Raw-material database editing |
| | Formula authoring from empty state, experiment history |

Formula export and supplier document download are different features. Export (FR-008) produces the
formula view the user is looking at. Supplier documents are the per-material PDFs that come from
suppliers (`data-model.md` §6), and nothing in this cycle reads them.

Two of the deferred items reverse existing decisions rather than simply adding work. Formula
authoring is out of scope by `backlog.md` Open Question 1, and material editing has no requirement
behind it anywhere in FR-001–FR-010. Neither should be picked up without a scope decision.

"Within defined bounds" is not deferred for effort reasons. Nobody has defined the bounds, who
sets them, or what they are measured against, so it is not yet buildable.

---

## 3. Permissions, not role checks

Server code never asks "what role is this user?". It asks "does this user have permission X?".
A role is only a named set of permissions, defined in one place.

The reason is maintenance. A check written as `role is perfumer or rnd or lab` gets repeated in
every handler. Adding a role later means finding every copy, and one missed copy either locks a
user out or lets a user in. A check on `formula.export` stays the same however many roles exist.

### Permissions in this cycle

| Permission | Allows | Requirement |
|---|---|---|
| `formula.view` | List formulas in own organisation, open one, see its calculations, flags, explanations and both charts | FR-002–FR-006, FR-009, FR-010 |
| `formula.recalculate` | What-if editing with recalculation | FR-007 |
| `formula.export` | Export the displayed formula view | FR-008 |
| `user.manage` | Create user accounts and change a user's role | Open Question 2 |

Two things need no permission. Logging in (FR-001) is how a user gets a session in the first
place. Viewing, correcting and deleting one's own account data (PRIV-002) is a right every
signed-in user holds over their own record.

### Roles in this cycle

| Role | Permissions |
|---|---|
| `member` | `formula.view`, `formula.recalculate`, `formula.export` |
| `admin` | everything `member` has, plus `user.manage` |

An earlier draft had separate perfumer, R&D and lab roles. All three had identical permissions,
so they are one role here. The **Formulator** actor in `user-journey.md` and `diagrams.md` is a
user with the `member` role.

The role-to-permission mapping lives in server code for this cycle, not in a database table. With
two fixed roles there is nothing to configure at runtime. The mapping then changes only through a
reviewed code change with tests, and the only permission change a running system can make is an
admin changing a user's role, which is written to the access log (LR2).

A later client portal adds a role without changing any existing check.

---

## 4. Tables

```sql
organisations       id, name, created_at

users               id, org_id, email, password_hash, display_name, role, created_at
                    -- role: 'member' | 'admin'
                    -- plus PRIV-003 fields: purpose_code, consent_id, retention_until
```

**`org_id` goes on every tenant-owned table from the first migration**, including `formulas`.
This costs one column now. Retrofitting tenancy into a schema that assumed a single tenant means
revisiting every query already written, and any query missed becomes a cross-customer data leak.
Running one organisation this cycle does not change that.

Materials and regulatory tables are shared reference data and are **not** org-scoped. If SaaS
mode later lets a customer hold private materials, that becomes a nullable `org_id`, where NULL
means shared.

---

## 5. Two checks on every formula request

A permission says which **action** a user may take. It does not say which **formula** they may
take it on. Every formula request therefore runs two checks, both server-side (SEC-001):

1. **Action check.** The user's role includes the permission the route needs, for example
   `formula.export`.
2. **Record check.** The requested formula's `org_id` equals the `org_id` in the user's
   server-side session.

Rules for the record check:

- `org_id` comes from the session, never from a request parameter. A request carrying its own
  `org_id` is refused.
- The check runs on the record, not only on the route. Holding `formula.view` does not let a user
  open another organisation's formula.

---

## 6. When external users are added (deferred)

Not built in this cycle. Recorded so the client portal cannot start without it (SEC-005).

**The trust boundary moves.** SEC-001 through SEC-004, LR5, IP-001 and IP-002 were written when
every authenticated user was the customer's own staff. A client portal puts a person from outside
that company behind a valid login. Server-side authorisation then becomes the only separation
between one organisation's formulas and another's.

What that design must cover:

- **Hide whether a formula exists.** A formula outside the requester's organisation returns "not
  found", the same response as an id that does not exist. A different response, such as "not
  allowed", would confirm the id is real and let ids be probed one by one. This applies only to
  access errors. `insufficient data` is a calculation result, and a user still sees it on any
  formula they are allowed to open (FR-005, CER-002).
- **Link clients to formulas.** A client should see the formulas they ordered, not every formula
  in the organisation. A `formula_clients` join, or a client-visibility flag on `formulas`, is
  needed for the record check.
- **No what-if recalculation for clients.** It exposes how a formula responds to changing a
  material, which is closer to revealing the formula than viewing it is.
- **Document download runs through the record check.** A storage URL that works without an
  authorisation check is a leak regardless of how obscure it is.
- **Access logging.** LR2 already requires an append-only access log. External access should be
  distinguishable in it, since an outside party reading formula data is the event most worth being
  able to reconstruct later.

---

## 7. Open questions

1. **Account provisioning mechanism.** Who creates internal accounts and how. The stakeholder says
   internal and external accounts are provisioned differently but does not name the mechanism
   (`backlog.md` Open Question 2).
2. **rule 21 versus organisation scope.** `rule.md` rule 21 says a perfumer may read "their own
   formulas". The stakeholder describes organisation-scoped visibility. Whether rule 21 means
   personally created or organisation-wide still needs settling (`backlog.md` Open Question 3).
3. **Permission design for external users.** Deferred with the client portal, including
   client-to-formula linkage and the undefined bounds for profile adjustment.
