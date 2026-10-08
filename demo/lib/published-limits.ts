// AI Perfumery Engine; ownership follows the owner's existing agreement. No new licence granted.
//
// PUBLISHED limit rules, transcribed from the official IFRA Standards. Unlike
// limit-check-fixtures.ts, nothing here is invented: every maximum below is printed in the source
// document named in its own Citation column, and the three substances that carry no Standard get no
// row rather than a guessed one.
//
// Source document
//   "The complete IFRA Standards, up to and including the 51st Amendment", January 2024, 709 pp.
//   https://ifrafragrance.org/initiatives-positions/safe-use-fragrance-science/ifra-standards
//   The 51st Amendment (notified 30 June 2023, published 3 July 2023) is the amendment in force on
//   the transcription date. The 52nd Amendment closed consultation on 12 June 2026 and its binding
//   notification is expected end of November 2026: when it lands, these rows need re-checking.
//   Transcribed 2026-10-07 by reading the published PDF; page numbers are that document's.
//
// Limits of this file (rule 84, rule 85, FR-005)
//   - A transcription is not a compliance certification. The engine compares declared input with
//     these numbers and cites them; it does not verify them against ifrafragrance.org at run time,
//     and it is not an IFRA conformity certificate.
//   - IFRA categories are NOT the same thing as the demo's illustrative applications. Category 4
//     and Category 5A below are the real IFRA product categories, so a formula must be set to one
//     of them for these rules to apply.
//   - Contributions from other sources (the IFRA Annex) are not modelled. A real assessment must
//     add fragrance ingredient carried in by naturals; ignoring it can understate an exposure.
//   - Before any real use, re-verify each row against the current amendment at ifrafragrance.org.
import type {DatasetRow} from './reference.ts';

// The two real IFRA product categories this dataset covers, as the Application field must spell them.
// Category 4: fine fragrance applied to neck, face and wrists, hydroalcoholic and non-hydroalcoholic
// (Eau de Toilette, Parfum, Eau de Cologne, solid perfume, fragrance cream, alcoholic aftershave).
// Category 5A: body creams, oils and lotions of all types, foot care, skin-applied insect repellent,
// powders and talc other than baby powder.
export const IFRA_CATEGORY_4 = 'IFRA Category 4 (fine fragrance)';
export const IFRA_CATEGORY_5A = 'IFRA Category 5A (body lotion)';
export const ifraCategories = [IFRA_CATEGORY_4, IFRA_CATEGORY_5A] as const;

const SOURCE = 'IFRA Standard';
const COMPILATION = 'IFRA Standards, up to and including the 51st Amendment (January 2024)';

type Entry = {
  cas: string; name: string;
  // 'restricted' carries a maximum per category; 'specification' carries no number at all.
  type: 'restricted' | 'specification';
  amendment: string;        // the amendment that published THIS Standard, not the compilation
  effective: string;        // IFRA implementation date for a new creation; '' where not applicable
  page: number;             // page in the compilation PDF, so a reader can check the transcription
  cat4: string | null; cat5a: string | null;
  basis: string;            // what the Standard actually says, for the Citation column
};

// Five of the eight publicly documented materials in lib/model.ts carry an IFRA Standard.
// alpha-Pinene (80-56-8), cis-3-Hexen-1-ol (928-96-1) and Vanillin (121-33-5) carry NO Standard in
// the 51st Amendment compilation: searched by CAS and by name, no entry. They deliberately get no
// row, so the engine reports them as no limit recorded, which is not a pass.
const ENTRIES: Entry[] = [
  {cas: '5989-27-5', name: 'Limonene', type: 'specification',
   amendment: 'Amendment 29 (1995)', effective: '', page: 481, cat4: null, cat5a: null,
   basis: 'specification, peroxide value below 20 mmol/L; no maximum concentration'},
  {cas: '78-70-6', name: 'Linalool', type: 'specification',
   amendment: 'Amendment 38 (2004)', effective: '2004-05-06', page: 483, cat4: null, cat5a: null,
   basis: 'specification, peroxide value below 20 mmol/L; no maximum concentration'},
  {cas: '106-24-1', name: 'Geraniol', type: 'restricted',
   amendment: 'Amendment 51 (2023)', effective: '2024-03-30', page: 109, cat4: '4.7', cat5a: '1.2',
   basis: 'restriction, dermal sensitization'},
  {cas: '120-51-4', name: 'Benzyl benzoate', type: 'restricted',
   amendment: 'Amendment 49 (2020)', effective: '2021-02-10', page: 25, cat4: '4.8', cat5a: '4.3',
   basis: 'restriction, dermal sensitization and systemic toxicity'},
  {cas: '97-53-0', name: 'Eugenol', type: 'restricted',
   amendment: 'Amendment 51 (2023)', effective: '2024-03-30', page: 103, cat4: '2.5', cat5a: '0.64',
   basis: 'restriction, dermal sensitization'},
];

// Substances checked and found to have no Standard, kept so the absence is documented, not assumed.
export const NO_IFRA_STANDARD = [
  {cas: '80-56-8', name: 'alpha-Pinene'},
  {cas: '928-96-1', name: 'cis-3-Hexen-1-ol'},
  {cas: '121-33-5', name: 'Vanillin'},
] as const;

// One row per substance per category, in the upload format, so published and uploaded rules run
// through exactly the same reader and the same checks.
export function publishedLimitRows(): DatasetRow[] {
  const rows: DatasetRow[] = [];
  for (const e of ENTRIES)
    for (const [category, max] of [[IFRA_CATEGORY_4, e.cat4], [IFRA_CATEGORY_5A, e.cat5a]] as const) {
      // A specification is not category-specific: it is written out for each covered category so a
      // formula in either one sees it, and it never carries a number.
      const scope = e.type === 'specification' ? 'all categories' : category.replace(/^IFRA /, '').replace(/ \(.*\)$/, '');
      rows.push({
        CAS: e.cas, 'Material name': e.name, 'Product category': category,
        'Restriction type': e.type, 'Max % in finished product': max ?? '',
        Source: SOURCE, Amendment: e.amendment, 'Effective date': e.effective,
        Citation: `${COMPILATION}, p. ${e.page}: ${e.name}, ${scope} — ${e.basis}`,
      });
    }
  return rows;
}
