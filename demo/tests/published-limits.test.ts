// AI Perfumery Engine; ownership follows the owner's existing agreement. No new licence granted.
//
// Guards the transcription in lib/published-limits.ts. These are PUBLISHED values, so the test
// pins the numbers: an accidental edit to a real regulatory limit must fail the build, not ship.
import test from 'node:test';
import assert from 'node:assert/strict';
import {toCsv} from '../lib/csv.ts';
import {checkDataset, LIMIT_COLUMNS, builtInRows, toLimitRules, validCas} from '../lib/reference.ts';
import {IFRA_CATEGORY_4, IFRA_CATEGORY_5A, NO_IFRA_STANDARD, publishedLimitRows} from '../lib/published-limits.ts';
import {initialFormulas, materials} from '../lib/model.ts';
import type {FormulaVersion} from '../lib/model.ts';
import {checkActiveLimit} from '../lib/limit-check.ts';

const rows = publishedLimitRows();
const at = (cas: string, category: string) => rows.find(r => r.CAS === cas && r['Product category'] === category);

test('the transcribed rows pass the same upload check as a real file, with no errors', () => {
  const csv = toCsv([[...LIMIT_COLUMNS], ...rows.map(r => LIMIT_COLUMNS.map(c => r[c] ?? ''))]);
  const {report} = checkDataset('limits', csv);
  assert.equal(report.errorCount, 0, JSON.stringify(report.errors));
  assert.equal(report.warningCount, 0, JSON.stringify(report.warnings));
  assert.equal(report.rows, rows.length);
  assert.deepEqual(report.columns.missing, []);
});

test('every row sits on a real CAS that the demo actually carries, and names its source', () => {
  const known = new Set(materials.map(m => m.id));
  for (const r of rows) {
    assert.ok(validCas(r.CAS), `${r.CAS} must be a valid CAS number`);
    assert.ok(known.has(r.CAS), `${r.CAS} is not a material in lib/model.ts`);
    assert.ok(r.Source, 'Source is required');
    assert.ok(r.Amendment, 'Amendment is required');
    assert.match(r.Citation, /51st Amendment \(January 2024\), p\. \d+/);
  }
});

// The published figures. Read 2026-10-07 from "The complete IFRA Standards, up to and including the
// 51st Amendment" (January 2024). Changing a number here means re-reading the source document.
test('transcribed maximums match the published IFRA Standards', () => {
  assert.equal(at('106-24-1', IFRA_CATEGORY_4)!['Max % in finished product'], '4.7', 'Geraniol, Category 4');
  assert.equal(at('106-24-1', IFRA_CATEGORY_5A)!['Max % in finished product'], '1.2', 'Geraniol, Category 5A');
  assert.equal(at('120-51-4', IFRA_CATEGORY_4)!['Max % in finished product'], '4.8', 'Benzyl benzoate, Category 4');
  assert.equal(at('120-51-4', IFRA_CATEGORY_5A)!['Max % in finished product'], '4.3', 'Benzyl benzoate, Category 5A');
  assert.equal(at('97-53-0', IFRA_CATEGORY_4)!['Max % in finished product'], '2.5', 'Eugenol, Category 4');
  assert.equal(at('97-53-0', IFRA_CATEGORY_5A)!['Max % in finished product'], '0.64', 'Eugenol, Category 5A');
  for (const r of rows.filter(x => x['Restriction type'] === 'restricted')) {
    assert.match(r['Max % in finished product'], /^\d+(\.\d+)?$/);
    assert.ok(Number(r['Max % in finished product']) > 0 && Number(r['Max % in finished product']) <= 100);
  }
});

test('a peroxide-value specification carries no number, so it can never read as a pass', () => {
  for (const cas of ['5989-27-5', '78-70-6']) for (const category of [IFRA_CATEGORY_4, IFRA_CATEGORY_5A]) {
    const row = at(cas, category)!;
    assert.equal(row['Restriction type'], 'specification');
    assert.equal(row['Max % in finished product'], '');
  }
  assert.equal(toLimitRules(rows).filter(r => r.type === 'specification').every(r => r.maxPct === null), true);
});

test('substances with no IFRA Standard get no row at all, never a guessed one', () => {
  for (const {cas} of NO_IFRA_STANDARD) assert.equal(rows.filter(r => r.CAS === cas).length, 0, cas);
  // The absence must be documented against a material the demo really has.
  const known = new Set(materials.map(m => m.id));
  for (const {cas} of NO_IFRA_STANDARD) assert.ok(known.has(cas), cas);
});

test('the built-in version id serves exactly these rows', () => {
  assert.deepEqual(builtInRows('ifra-limits'), rows);
});

// End to end: the engine's verdicts on the real seeded formulas under the published rules.
const seeded = (code: string, category: string): FormulaVersion =>
  ({...structuredClone(initialFormulas().find(f => f.code === code)!.versions.at(-1)!), category});

test('published rules give real verdicts on the seeded formulas in Category 4', () => {
  const rules = toLimitRules(rows);
  const status = (draft: FormulaVersion, cas: string) => checkActiveLimit(draft, cas, rules, 'IFRA').status;

  // F-002: alpha-Pinene 50 / Benzyl benzoate 30 / Eugenol 20 at 20% dilution -> 10 / 6 / 4 in product.
  const woods = seeded('F-002', IFRA_CATEGORY_4);
  assert.equal(status(woods, '120-51-4'), 'exceed', '6% in product is over the 4.8% Category 4 maximum');
  assert.equal(status(woods, '97-53-0'), 'exceed', '4% in product is over the 2.5% Category 4 maximum');
  assert.equal(status(woods, '80-56-8'), 'no_limit_defined', 'alpha-Pinene has no IFRA Standard');

  // F-003: Linalool 45 / Geraniol 30 / Vanillin 25 at 20% dilution -> 9 / 6 / 5 in product.
  const petal = seeded('F-003', IFRA_CATEGORY_4);
  assert.equal(status(petal, '106-24-1'), 'exceed', '6% in product is over the 4.7% Category 4 maximum');
  assert.equal(status(petal, '78-70-6'), 'no_limit_defined', 'Linalool is a specification, not a maximum');
  assert.equal(status(petal, '121-33-5'), 'no_limit_defined', 'Vanillin has no IFRA Standard');

  // Geraniol at 20% of the formula is 4% in product, inside the 4.7% maximum. The 10 freed points go
  // to Vanillin, which has no Standard, so the formula still sums to exactly 100 and stays checkable.
  const reduced = {...petal, ingredients: petal.ingredients.map(i =>
    i.materialId === '106-24-1' ? {...i, amount: '20'} : i.materialId === '121-33-5' ? {...i, amount: '35'} : i)};
  assert.equal(reduced.ingredients.reduce((sum, i) => sum + Number(i.amount), 0), 100);
  assert.equal(status(reduced, '106-24-1'), 'pass');
});

test('a demo application never matches a published IFRA rule, and the reverse', () => {
  const rules = toLimitRules(rows);
  const demoCategory = seeded('F-002', 'Fine fragrance (demo category)');
  assert.equal(checkActiveLimit(demoCategory, '120-51-4', rules, 'IFRA').status, 'no_limit_defined',
    'an IFRA Category 4 rule must not be applied to an illustrative demo category');
});
