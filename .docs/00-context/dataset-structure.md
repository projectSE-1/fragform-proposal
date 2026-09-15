# Dataset Structure (What the Stakeholder Supplied)

Describes the **shape** of the sample data handed over by the stakeholder, so requirements and
schema work can proceed without copying the data itself. No values appear here. The data lives in
`.docs/00-context/data-10-example-subtance/` and must not be committed (see `DO-NOT-COMMIT.md` in
that folder).

Received as a sample of **10 substances**, presented as the format the full ~100-material set
follows.

## 1. Substance table (`top10_complete_substances_raw.csv`)

34 columns per substance, in eight groups:

| Group | Columns | What it supports |
|---|---|---|
| Identity / registry | `CAS`, `Name (TGSC)`, `Formula`, `SMILES`, `InChIKey`, `PubChem CID` | Unambiguous material identity; joins to external references |
| Source confidence | `NIST identified`, `NIST confidence` | Whether a row is experimental or estimated — matters for CER-001 citations |
| Thermodynamic | `MW (g/mol)`, `Tb_K`, `Tm_K`, `Tc_K`, `Pc_Pa`, `Hvap_25C_kJ_mol` | Phase behaviour; inputs to evaporation modelling |
| Volatility | `Psat_25C_Pa`, `Psat_32C_Pa`, `antoine_A`, `antoine_B`, `antoine_C`, `antoine_form`, `antoine_Tmin_K/Tmax_K` | Vapour pressure at room and skin temperature, and via Antoine coefficients at any temperature in the stated range |
| Transport | `D_air_m2_s` | Diffusion in air |
| Partition | `logP (o/w) [TGSC]`, `XLogP3 [TGSC]`, `XLogP [PubChem]` | Lipophilicity; substrate behaviour |
| Odour | `TGSC Odor Type`, `TGSC Odor Descriptors`, `TGSC ODT`, `TGSC Tenacity (hours)`, `TGSC Odor Strength`, `odtr odor`, `odtr odor_threshold` | Odour family and descriptors; detection threshold; measured longevity |
| Regulatory / food | `FEMA Number`, `EU CosIng` | Flavour registry number; EU cosmetic status including Annex restriction |

Not every column is populated for every substance. Any material missing the fields a given
calculation needs returns `insufficient data` rather than an estimate (CER-002).

## 2. Regulatory reference

`ifra-51st-amendment-ifra-standards-overview.xlsx` — the IFRA Standards overview, 51st Amendment.
This is the concrete source behind "applicable restrictions" in FR-005, alongside the `EU CosIng`
column above.

## 3. Per-substance supplier documents

`Exdatadocspdf/` holds PDFs per substance, organised by supplier. The same substance may arrive
from more than one supplier with its own document set. Document types seen in the sample include
safety data sheets, certificates of analysis, IFRA certificates, allergen declarations, spec
sheets, and compliance statements (Halal, vegan, non-animal-testing, Prop 65, Canada DSL).

Implication for design: supplier documents attach to a **substance-supplier pair**, not to a
substance alone. Nothing in the current build cycle consumes these PDFs; they are recorded here
so the model is not designed in a way that makes them impossible to add later.

## 4. What this does and does not settle

Settled:

- The physical properties needed for evaporation-over-time modelling are present in the supplied
  format (vapour pressure, Antoine coefficients, enthalpy of vaporisation, diffusion coefficient,
  molecular weight), together with odour detection thresholds and measured tenacity.
- Restriction data has a named source (IFRA 51st Amendment; EU CosIng status).

Still open:

- The **evaporation model itself** (`project-context.md` §29). Having the inputs does not choose
  the equations, the mixture assumptions, or the surface/airflow assumptions any curve would
  need. That remains a domain decision.

Resolved since this document was written: evaporation over time **is** in scope, as FR-010 (team
scope decision, 2026-09-10), alongside the odour profile chart as FR-009. The model choice above
remains open and gates FR-010.
