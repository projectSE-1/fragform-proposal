// AI Perfumery Engine; ownership follows the owner's existing agreement. No new licence granted.
import test from 'node:test';
import assert from 'node:assert/strict';
import {parseCsv, toCsv} from '../lib/csv.ts';
import {checkDataset, familyOf, mockRows, rulesFor, toLimitRules, toMaterialRefs, validCas} from '../lib/reference.ts';

// Invented rows. 50-00-0 and 64-17-5 are well-known valid CAS numbers used only to exercise the check digit.
const materialsCsv = (rows: string[][]) => toCsv([['CAS', 'Name (TGSC)', 'TGSC Odor Type', 'MW (g/mol)', 'TGSC ODT'], ...rows]);

test('CSV reader handles quotes, commas, line breaks, CRLF, a BOM and blank lines', () => {
  const rows = parseCsv('﻿a,b\r\n"x, y","say ""hi"""\n"two\nlines",\n\n');
  assert.deepEqual(rows, [['a', 'b'], ['x, y', 'say "hi"'], ['two\nlines', '']]);
  assert.deepEqual(parseCsv(toCsv(rows)), rows);
  assert.throws(() => parseCsv('"never closed'));
});

test('CAS check digit', () => {
  for (const ok of ['50-00-0', '64-17-5', '7732-18-5']) assert.ok(validCas(ok), ok);
  for (const bad of ['50-00-1', '64-17', 'DEMO-M01', '', '1-00-0']) assert.ok(!validCas(bad), bad);
});

test('a clean materials file passes, with coverage counted and missing values left empty', () => {
  const {report, rows} = checkDataset('materials', materialsCsv([['50-00-0', 'Study A', 'citrus', '30', ''], ['64-17-5', 'Study B', '', '46', '0.5']]));
  assert.equal(report.errorCount, 0);
  assert.equal(report.rows, 2);
  assert.deepEqual(report.coverage.find(c => c.column === 'TGSC ODT'), {column: 'TGSC ODT', filled: 1});
  assert.equal(rows[0]['TGSC ODT'], '');
  assert.ok(report.columns.missing.includes('SMILES'));
});

test('headers match ignoring case and spaces', () => {
  const {report} = checkDataset('materials', 'cas,name (tgsc)\n50-00-0,Study A\n');
  assert.equal(report.errorCount, 0);
});

test('bad CAS, duplicates, a missing name and missing required columns are errors', () => {
  const {report} = checkDataset('materials', materialsCsv([['50-00-1', 'Typo', '', '', ''], ['64-17-5', '', '', '', ''], ['64-17-5', 'Dup', '', '', '']]));
  assert.equal(report.errorCount, 3);
  assert.equal(checkDataset('materials', 'Name (TGSC)\nx\n').report.errors[0].column, 'CAS');
  assert.equal(checkDataset('materials', 'CAS,Name (TGSC)\n').report.errorCount, 1);
});

test('a non-numeric property is a warning and is not used as a number', () => {
  const {report, rows} = checkDataset('materials', materialsCsv([['50-00-0', 'Study A', '', '30', '0.1 ppm']]));
  assert.equal(report.errorCount, 0);
  assert.equal(report.warnings.filter(w => w.column === 'TGSC ODT').length, 1);
  assert.equal(toMaterialRefs(rows)[0].threshold, null);
});

test('limit rows: type rules, a source on every row, and no duplicate rule', () => {
  const head = ['CAS', 'Product category', 'Restriction type', 'Max % in finished product', 'Source', 'Amendment'];
  const ok = checkDataset('limits', toCsv([head, ['50-00-0', 'Cat 4', 'Restricted', '1.5', 'Demo law', 'v1'], ['50-00-0', 'Cat 5', 'prohibited', '', 'Demo law', 'v1'], ['64-17-5', 'Cat 4', 'specification', '', 'Demo law', 'v1']]));
  assert.equal(ok.report.errorCount, 0);
  assert.equal(ok.rows[0]['Restriction type'], 'restricted');
  const rules = toLimitRules(ok.rows);
  assert.deepEqual(rules.map(r => r.maxPct), ['1.5', '0', null]);
  assert.equal(rulesFor('50-00-0', rules).length, 2);
  assert.equal(rulesFor('7732-18-5', rules).length, 0);
  const bad = checkDataset('limits', toCsv([head, ['50-00-0', 'Cat 4', 'restricted', '', 'Demo law', 'v1'], ['50-00-0', 'Cat 4', 'banned', '', '', 'v1'], ['50-00-0', 'Cat 4', 'prohibited', '2', 'Demo law', 'v1']]));
  // row 2: no max · row 3: bad type and no source · row 4: prohibited with a max, and same key as row 2
  assert.equal(bad.report.errorCount, 5);
});

test('odour family comes from the first odour-type term', () => {
  assert.equal(familyOf('CITRUS; fresh'), 'Citrus');
  assert.equal(familyOf(''), 'Unassigned');
});

test('the built-in mock versions are in the same format as an upload', () => {
  const materials = toMaterialRefs(mockRows('materials'));
  assert.ok(materials.find(m => m.id === 'DEMO-M01')?.fictional);
  assert.equal(materials.find(m => m.id === '5989-27-5')?.cas, '5989-27-5');
  const rules = toLimitRules(mockRows('limits'));
  assert.ok(rules.length > 0 && rules.every(r => r.cas.startsWith('DEMO-M') && r.source.includes('fictional')));
});
