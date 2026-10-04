# Data Model (MVP — Formula View)

Schema design for the MVP formula view. Covers the four things that view has to produce:
concentration figures, an odour profile chart, an evaporation curve per material, and regulatory
status per material.

Source: team scope decision, 2026-09-10. Field names follow the supplied dataset
(`.docs/00-context/dataset-structure.md`). PostgreSQL, accessed through sqlc + pgx
(`diagrams.md` D3).

Roles, permissions and tenancy live in `roles-permissions.md`; this file assumes the `org_id`
column that document requires.

---

## 1. Core tables

```sql
materials
  id, cas UNIQUE, name, formula, smiles, inchikey, pubchem_cid, mw_g_mol
  nist_identified, nist_confidence      -- provenance; feeds CER-001 citations

formulas
  id, org_id, name, created_by, created_at, updated_at
  product_category_id                   -- required for compliance, see §5
  concentrate_in_product_pct            -- dilution into the finished product, see §5

formula_items
  id, formula_id, material_id, quantity, unit
```

`nist_identified` / `nist_confidence` are kept because CER-001 requires every displayed figure to
cite its source. A value derived from an estimated property should be distinguishable from one
derived from an experimental measurement.

---

## 2. Concentration (FR-004)

Computed, not stored:

```
percentage = item.quantity / SUM(item.quantity) OVER (PARTITION BY formula_id) * 100
```

**Unit: grams. Decided 2026-10-04 (team, decision 1).** The supplied dataset has `MW (g/mol)` and
**no density**, confirmed against the 10-substance sample: 34 columns, none of them a density.
Volume quantities therefore cannot be converted to mass percentage, so `formula_items.quantity` is
stored in grams and the unit column accepts no other value for now.

If a formula ever arrives in millilitres, the engine returns `insufficient data` naming the
missing density rather than converting (CER-002). Supplier spec sheets do carry a relative density
(verified on the one sample substance that has a spec sheet), but it is a specification range per
supplier rather than a measured value for the material in hand, so it would weaken a cited figure
(CER-001). Obtaining density stays a later decision, triggered only by a real volume formula.

---

## 3. Odour profile (bar chart)

```sql
odor_types                    id, name          -- controlled vocabulary
materials.odor_type_id        → odor_types
material_odor_descriptors     material_id, descriptor    -- TGSC supplies a list
material_odor_properties
  material_id PK, odt, tenacity_hours, odor_strength, odor_threshold
```

Odour types arrive as free text and must be normalised into `odor_types` at import.
`TGSC Odor Descriptors` is a list, so it gets its own table rather than a single column.

**Decision needed: what the bar height means.** Grouping formula materials by odour type and
summing mass percentage is simple, and perceptually wrong: a trace material with a very low
detection threshold can dominate what a formula actually smells like. Weighting by odour units
(`concentration / ODT`) reflects perception better. Whichever is chosen must be stated on the
chart, because the two produce visibly different results from identical data.

**Related problem:** `TGSC Odor Strength` is categorical (values like "medium"), not numeric.
Using it as a bar height requires mapping categories onto numbers, which is a domain judgement
and not something the dataset answers.

---

## 4. Evaporation curve (line chart per material, adjustable time scale)

Curves are **computed on request, never stored**. The database holds the parameters:

```sql
material_volatility
  material_id PK
  psat_25c_pa, psat_32c_pa
  antoine_a, antoine_b, antoine_c
  antoine_form TEXT                     -- see the warning below
  antoine_tmin_k, antoine_tmax_k        -- source ships these as one field, e.g. "345/523"
  hvap_25c_kj_mol, d_air_m2_s
```

```
GET /formulas/{id}/evaporation?hours=8&points=100&temp_k=305
```

Adjustable time scale is then a query parameter rather than a schema concern. Evaluating a decay
curve for roughly twenty materials at a hundred points costs microseconds, so computing per
request stays cheap and stays consistent when the model changes. Storing precomputed points would
fix the time scale at import and require a full recompute whenever the equations are revised.

During a what-if edit (FR-007) the curves must come from the overlaid snapshot, not the stored
formula (`calculation-engine.md` §3). The GET route above takes no overrides, so its final shape
is still open.

**Import warning: Antoine coefficients are not interchangeable between sources.** Published
coefficients differ in logarithm base (log₁₀ or ln), pressure unit (Pa or mmHg), and temperature
unit (K or °C). The sample data uses `log10(P/Pa) = A - B/(T/K + C)`. Applying one equation to
rows that use another produces results wrong by orders of magnitude while still looking like a
plausible curve. Either normalise every row to a single form during import, or branch on
`antoine_form` at calculation time.

**Range handling.** The sample's validity range is 345–523 K, while skin is near 305 K, so any
skin-temperature curve is an extrapolation. Whether that returns `insufficient data` (CER-002) or
a flagged estimate is an open decision (§7, decision 5).

**Not in the dataset.** Evaporation from a surface also depends on surface area and airflow.
Those are model assumptions with stated defaults, not values that can be looked up.

---

## 5. Regulatory status

Each material is subject to several unrelated instruments: IFRA Standards, EU CosIng annexes, the
EU allergen list, FEMA, Prop 65, Canada DSL. Modelling each as its own table multiplies schema
work and makes every new regulation a migration.

They share one shape, so one table carries all of them:

```sql
regulation_sources     id, code, name          -- 'IFRA', 'EU_COSING', 'PROP65', 'FEMA'
regulation_versions    id, source_id, label, effective_from, effective_to
product_categories     id, code, name          -- IFRA categories 1–12

material_restrictions
  id, material_id, regulation_version_id
  category_id NULL                -- NULL means it applies to every category
  restriction_type                -- prohibited | restricted | specification | declarable | listed
  max_concentration_pct NULL
  unit, condition_text, citation
```

| Real case | Stored as |
|---|---|
| IFRA prohibited | one row, `prohibited`, no limit |
| IFRA restricted | one row per product category, each with its own limit |
| CosIng Annex III | one row, `restricted`, plus condition text |
| EU declarable allergen | one row, `declarable`, with its threshold |
| A regulation added next year | new source and version rows, no schema change |

FR-005 then reduces to a single query: match the formula's product category, compare the computed
percentage against `max_concentration_pct`, classify as within / near / over / insufficient.
Two parts of that classification are not defined yet: the near-limit band (§7, decision 7), and
how rows with no numeric limit (`prohibited`, `declarable`, `specification`, `listed`) map onto
the four states (§7, decision 10).

**Category codes.** Public IFRA Standards split several of the 12 categories into sub-categories
(5A–5D, for example). Check the supplied 51st Amendment sheet before fixing
`product_categories.code` as a number; it may need to hold codes such as `5A`.

### Two consequences for the requirements

**A formula must declare its product category.** IFRA limits differ per category. The same
material can be acceptable in a candle and over-limit in a lip product. Without
`formulas.product_category_id` there is no correct answer for FR-005 to give, only an
unqualified one.

**Concentrate and finished product are different denominators.** IFRA limits are expressed as a
percentage of the finished consumer product. A perfumer works on a concentrate that is later
diluted, for example 15% concentrate in an eau de parfum. Comparing a concentrate percentage
directly against a finished-product limit reports almost everything as over-limit.

Confirmed 2026-09-10: this step is not optional. The comparison runs in this order, and the
dilution is applied exactly once:

```
pct_in_formula  = item.quantity / SUM(item.quantity) * 100
pct_in_product  = pct_in_formula * (formulas.concentrate_in_product_pct / 100)

compare pct_in_product against material_restrictions.max_concentration_pct
```

Worked example. A material at 2% of a concentrate, where the concentrate is 15% of the finished
eau de parfum, is 2 × 0.15 = **0.3%** of the finished product. Against a category limit of 0.5%
that is within limit. Skipping the dilution compares 2% against 0.5% and reports a false
violation on a compliant formula.

A formula that *is* the finished product stores `concentrate_in_product_pct = 100`, so the
arithmetic stays uniform and there is no special case to forget.

**Display both figures.** The formulator mixes to `pct_in_formula` but is judged on
`pct_in_product`. Showing only one invites the same confusion the calculation avoids, and FR-006
requires the cited comparison to be reconstructable by the user.

`concentrate_in_product_pct` stays nullable rather than NOT NULL, since a formula may legitimately
exist before its final dilution is decided. In that state compliance checks return
`insufficient data` naming the missing input, rather than silently assuming 100.

Both are recorded as requirements in `backlog.md` FR-005.

---

## 6. Supplier documents

The sample data ships per-substance PDFs organised by supplier, and the same substance may arrive
from more than one supplier with its own document set
(`dataset-structure.md` §3). Documents therefore attach to a substance-supplier pair:

```sql
suppliers                     id, name
material_supplier_documents
  id, material_id, supplier_id, doc_type, storage_ref, issued_at
```

Nothing in the MVP consumes these. The tables are described here so the schema does not make them
awkward to add later.

---

## 7. Open decisions

Decisions 1–8 use the same numbers and owners as `calculation-engine.md` §7.

| # | Decision | Blocks | Owner |
|---|---|---|---|
| 1 | ~~Quantities stored in grams, or a density column obtained~~ **Decided 2026-10-04: grams** (§2) | — | Team |
| 2 | Which weighting is the default, and whether odour units or strength is the right perception basis | The default only. All three are selectable (`calculation-engine.md` §4) | Stakeholder |
| 3 | Numeric mapping for categorical odour strength | Odour chart, if strength is used | Stakeholder |
| 4 | Which evaporation equation, and its mixture assumptions | Correctness of the evaporation curve (FR-010) | Stakeholder |
| 5 | Behaviour outside the Antoine validity range | Evaporation curve at skin temperature | Stakeholder |
| 6 | Which product categories the system checks against | Regulatory status (FR-005) | Stakeholder |
| 7 | The near-limit band — what share of a limit counts as near | FR-005's near state only | Stakeholder |
| 8 | Whether a formula declares an expected total or batch size | FR-004's discrepancy flag; the batch-size example in FR-007 | Team |
| 9 | A version column on `formulas`, and what creates a version | Access-log and export rows that record `formula_id` + version (rule.md rule 31, FR-008) | Team |
| 10 | How `prohibited`, `declarable`, `specification` and `listed` rows map onto within / near / over / insufficient | FR-005 for every row without a numeric limit | Stakeholder |
| 11 | Material groups and material-pair (combination) checks: no supplied data, table or engine output supports them | The group and pair criteria in FR-003, FR-005 and CER-002 | Stakeholder |

Decisions 2–7, 10 and 11 are domain judgements and belong to the stakeholder, not to
implementation. Decision 3 is a domain judgement for the reason given in §3, and decision 5 is
the choice §4 leaves open. Both follow `calculation-engine.md`, which assigns them to the
stakeholder.

---

## 8. Effort note

Ranked by cost rather than difficulty:

1. **Extracting the IFRA Standards spreadsheet into `material_restrictions` rows.** Roughly a
   hundred materials against every category column in the supplied sheet, possibly including
   sub-categories such as 5A (see §5). This is the largest single item and it is data entry and
   verification, not engineering.
2. **Choosing the evaporation model.** Small to implement, but it gates whether the curve means
   anything, and it is not a decision the team can make alone.
3. **Normalising odour types and deciding the weighting.** Same shape, smaller.
4. Everything else is ordinary CRUD against the tables above.

---

## 9. Not yet modelled

The design and `rule.md` require these, but no table or column above defines them yet. They are
listed so that nothing is built on the assumption that they exist.

| Missing | Required by |
|---|---|
| `formulas.version` (decision 9) | rule.md rule 31, FR-008 and SEC-002 acceptance criteria: log rows record `formula_id` + version |
| Consent records table (only `users.consent_id` exists) | PRIV-001, rule.md rules 1, 15, 41 |
| `access_log` columns | rule.md rules 27, 32, 33 (fields; the app role has INSERT and SELECT, no UPDATE or DELETE; hash chain) |
| `retained_identity` | rule.md rule 30: a deleted user's log identity is kept for at least 90 days |
| `purpose_code`, `consent_id`, `retention_until` on `formulas` | rule.md rule 2 — `formulas.created_by` is personal data (rule.md §0, class A) |
