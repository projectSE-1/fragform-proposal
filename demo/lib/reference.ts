// AI Perfumery Engine; ownership follows the owner's existing agreement. No new licence granted.
//
// Reference data: the two system datasets the engine reads, their file formats, the checks an
// upload must pass, and the built-in mock version of each. Pure: no file system, no network, so the
// same checks run in tests, on the server and in the browser preview.
//
// "Reference data" is system data only. User formulas are never part of it.
import {parseCsv} from './csv.ts';
import {materials} from './model.ts';
import {mockOdour} from './mock-odour.ts';
import {demoLimitStandard, demoStandardLimits} from './limit-check-fixtures.ts';

export const categories = ['materials', 'limits'] as const;
export type Category = typeof categories[number];
export type DatasetRow = Record<string, string>;

// The owner's substance table, 34 columns (.docs/00-context/dataset-structure.md §1).
export const MATERIAL_COLUMNS = [
  'CAS', 'Name (TGSC)', 'Formula', 'SMILES', 'InChIKey', 'PubChem CID',
  'NIST identified', 'NIST confidence',
  'MW (g/mol)', 'Tb_K', 'Tm_K', 'Tc_K', 'Pc_Pa', 'Hvap_25C_kJ_mol',
  'Psat_25C_Pa', 'Psat_32C_Pa', 'antoine_A', 'antoine_B', 'antoine_C', 'antoine_form', 'antoine_Tmin_K/Tmax_K',
  'D_air_m2_s',
  'logP (o/w) [TGSC]', 'XLogP3 [TGSC]', 'XLogP [PubChem]',
  'TGSC Odor Type', 'TGSC Odor Descriptors', 'TGSC ODT', 'TGSC Tenacity (hours)', 'TGSC Odor Strength', 'odtr odor', 'odtr odor_threshold',
  'FEMA Number', 'EU CosIng',
] as const;
// One row per limit. Exported from the IFRA sheet (or EU CosIng, Thai FDA) into this template.
export const LIMIT_COLUMNS = [
  'CAS', 'Material name', 'Product category', 'Restriction type', 'Max % in finished product',
  'Source', 'Amendment', 'Effective date', 'Citation',
] as const;
export const RESTRICTION_TYPES = ['restricted', 'prohibited', 'specification'] as const;

export const columnsOf = (c: Category): readonly string[] => c === 'materials' ? MATERIAL_COLUMNS : LIMIT_COLUMNS;
const REQUIRED: Record<Category, readonly string[]> = {
  materials: ['CAS', 'Name (TGSC)'],
  limits: ['CAS', 'Product category', 'Restriction type', 'Source'],
};
// The columns the engine actually reads, shown first in the viewer and in the check report.
export const KEY_COLUMNS: Record<Category, readonly string[]> = {
  materials: ['CAS', 'Name (TGSC)', 'TGSC Odor Type', 'MW (g/mol)', 'Psat_25C_Pa', 'TGSC ODT', 'TGSC Tenacity (hours)', 'EU CosIng'],
  limits: ['CAS', 'Material name', 'Product category', 'Restriction type', 'Max % in finished product', 'Source', 'Amendment'],
};
const NUMERIC_MATERIAL = new Set(['MW (g/mol)', 'Tb_K', 'Tm_K', 'Tc_K', 'Pc_Pa', 'Hvap_25C_kJ_mol', 'Psat_25C_Pa', 'Psat_32C_Pa',
  'antoine_A', 'antoine_B', 'antoine_C', 'D_air_m2_s', 'TGSC ODT', 'TGSC Tenacity (hours)']);
export const LIMITS = {rows: 5000, bytes: 5 * 1024 * 1024, issuesKept: 100};

export type Issue = {row: number | null; column?: string; message: string};
export type CheckReport = {
  category: Category; rows: number;
  columns: {found: string[]; missing: string[]; extra: string[]};
  coverage: {column: string; filled: number}[];
  errors: Issue[]; errorCount: number;
  warnings: Issue[]; warningCount: number;
};

// CAS registry numbers end in a check digit: the other digits, read right to left, weighted 1, 2, 3...
export function validCas(value: string): boolean {
  const m = /^(\d{2,7})-(\d{2})-(\d)$/.exec(value);
  if (!m) return false;
  const digits = (m[1] + m[2]).split('').reverse();
  const sum = digits.reduce((acc, d, i) => acc + Number(d) * (i + 1), 0);
  return sum % 10 === Number(m[3]);
}
const NUMBER = /^[-+]?(\d+\.?\d*|\.\d+)([eE][-+]?\d+)?$/;
const DECIMAL = /^\d+(\.\d+)?$/;
export const numberOf = (cell: string | undefined): number | null => cell && NUMBER.test(cell.trim()) ? Number(cell.trim()) : null;
const norm = (h: string) => h.toLowerCase().replace(/\s+/g, '');

// Reads and checks an upload. Nothing is saved here: the caller decides, and only a report with no
// errors may be saved. Missing values stay empty; nothing is filled in.
export function checkDataset(category: Category, text: string): {report: CheckReport; rows: DatasetRow[]} {
  const errors: Issue[] = []; const warnings: Issue[] = [];
  let errorCount = 0, warningCount = 0;
  const err = (i: Issue) => { errorCount++; if (errors.length < LIMITS.issuesKept) errors.push(i); };
  const warn = (i: Issue) => { warningCount++; if (warnings.length < LIMITS.issuesKept) warnings.push(i); };
  const expected = columnsOf(category);
  const empty: CheckReport = {category, rows: 0, columns: {found: [], missing: [...expected], extra: []}, coverage: [], errors, errorCount: 0, warnings, warningCount: 0};

  let table: string[][];
  try { table = parseCsv(text); } catch (e) { err({row: null, message: `The file is not valid CSV: ${(e as Error).message}`}); return {report: {...empty, errorCount}, rows: []}; }
  if (table.length < 2) { err({row: null, message: 'The file has no data rows under the header.'}); return {report: {...empty, errorCount}, rows: []}; }

  // Match headers by name, ignoring case and spaces, so a re-saved spreadsheet still lines up.
  const header = table[0].map(h => h.trim());
  const byNorm = new Map(expected.map(c => [norm(c), c]));
  const names = header.map(h => byNorm.get(norm(h)) ?? h);
  const found = expected.filter(c => names.includes(c));
  const missing = expected.filter(c => !names.includes(c));
  const extra = names.filter(n => !expected.includes(n) && n !== '');
  for (const c of REQUIRED[category]) if (!found.includes(c)) err({row: null, column: c, message: `Required column "${c}" is missing.`});
  const optionalMissing = missing.filter(c => !REQUIRED[category].includes(c));
  if (optionalMissing.length) warn({row: null, message: `${optionalMissing.length} column(s) not in the file stay empty: ${optionalMissing.join(', ')}.`});
  if (extra.length) warn({row: null, message: `Columns kept but not used: ${extra.join(', ')}.`});
  if (table.length - 1 > LIMITS.rows) err({row: null, message: `The file has ${table.length - 1} rows; the limit is ${LIMITS.rows}.`});
  if (errorCount) return {report: {...empty, columns: {found, missing, extra}, errorCount, warningCount}, rows: []};

  const rows: DatasetRow[] = [];
  const seen = new Map<string, number>();
  table.slice(1).forEach((cells, index) => {
    const line = index + 2; // spreadsheet row number, header is row 1
    if (cells.length > names.length) warn({row: line, message: `Row has ${cells.length} cells but the header has ${names.length}; the extra cells are ignored.`});
    const row: DatasetRow = {};
    names.forEach((n, i) => { if (n) row[n] = (cells[i] ?? '').trim(); });
    const cas = row.CAS ?? '';
    if (!cas) err({row: line, column: 'CAS', message: 'CAS is empty.'});
    else if (!validCas(cas)) err({row: line, column: 'CAS', message: `"${cas}" is not a valid CAS number (format or check digit).`});

    if (category === 'materials') {
      if (!row['Name (TGSC)']) err({row: line, column: 'Name (TGSC)', message: 'Name is empty.'});
      for (const c of NUMERIC_MATERIAL) if (row[c] && numberOf(row[c]) === null) warn({row: line, column: c, message: `"${row[c]}" is not a number; it is kept as text and not used in calculations.`});
      if (cas) { if (seen.has(cas)) err({row: line, column: 'CAS', message: `CAS ${cas} also appears on row ${seen.get(cas)}.`}); else seen.set(cas, line); }
    } else {
      const type = (row['Restriction type'] ?? '').toLowerCase();
      row['Restriction type'] = type;
      const max = row['Max % in finished product'] ?? '';
      if (!row['Product category']) err({row: line, column: 'Product category', message: 'Product category is empty.'});
      if (!row.Source) err({row: line, column: 'Source', message: 'Source is empty; every limit must name the law or standard it comes from.'});
      if (!(RESTRICTION_TYPES as readonly string[]).includes(type)) err({row: line, column: 'Restriction type', message: `Restriction type must be one of ${RESTRICTION_TYPES.join(', ')}.`});
      if (type === 'restricted' && !(DECIMAL.test(max) && Number(max) <= 100)) err({row: line, column: 'Max % in finished product', message: 'A restricted row needs a maximum between 0 and 100, written as a plain decimal.'});
      if (type === 'prohibited' && max && Number(max) !== 0) err({row: line, column: 'Max % in finished product', message: 'A prohibited row cannot carry a maximum above 0.'});
      if (type === 'specification' && max) warn({row: line, column: 'Max % in finished product', message: 'A specification row has no numeric limit; the maximum is ignored.'});
      const key = `${cas}|${row['Product category']}|${row.Source}|${row.Amendment ?? ''}`;
      if (cas && seen.has(key)) err({row: line, message: `Same CAS, category, source and amendment as row ${seen.get(key)}.`}); else seen.set(key, line);
    }
    rows.push(row);
  });
  const coverage = expected.filter(c => found.includes(c)).map(c => ({column: c, filled: rows.filter(r => r[c]).length}));
  return {report: {category, rows: rows.length, columns: {found, missing, extra}, coverage, errors, errorCount, warnings, warningCount}, rows};
}

// ---------------------------------------------------------------------------------------------
// Built-in mock versions. They are today's invented demo data, rewritten into the upload formats so
// the viewer and the engine treat mock and uploaded data the same way.

export function mockRows(category: Category): DatasetRow[] {
  if (category === 'materials') return materials.map(m => {
    const o = mockOdour[m.id];
    return {CAS: m.id, 'Name (TGSC)': m.name, 'TGSC Odor Type': m.family,
      'MW (g/mol)': o ? String(o.mw) : '', 'Psat_25C_Pa': o ? String(o.psat25) : '',
      'TGSC ODT': o?.threshold != null ? String(o.threshold) : '', 'TGSC Tenacity (hours)': o ? String(o.tenacityHours) : ''};
  });
  const rows: DatasetRow[] = [];
  for (const [category, table] of Object.entries(demoStandardLimits))
    for (const [cas, max] of Object.entries(table))
      rows.push({CAS: cas, 'Material name': materials.find(m => m.id === cas)?.name ?? cas, 'Product category': category,
        'Restriction type': 'restricted', 'Max % in finished product': max, Source: `${demoLimitStandard.id} (fictional)`,
        Amendment: demoLimitStandard.version, 'Effective date': '', Citation: `${demoLimitStandard.id} ${demoLimitStandard.version} / ${category} / ${cas}`});
  return rows;
}

// ---------------------------------------------------------------------------------------------
// What the engine reads from the active versions.

export type MaterialRef = {
  id: string; name: string; cas: string | null; family: string; color: string; fictional: boolean;
  mw: number | null; psat25: number | null; threshold: number | null; tenacityHours: number | null;
};
const FAMILY_COLORS: Record<string, string> = {Citrus: '#be904a', Floral: '#9971ad', Woody: '#698474', Green: '#8b9b62',
  Balsamic: '#7c89b2', Sweet: '#b67f65', Spicy: '#a9674f', Soft: '#7c89b2', Amber: '#b67f65'};
const SPARE = ['#5f8fa8', '#a8835f', '#7d6aa8', '#5fa88a', '#a85f7d', '#8a8a5f'];
export function familyColor(family: string): string {
  if (FAMILY_COLORS[family]) return FAMILY_COLORS[family];
  let h = 0; for (const c of family) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return SPARE[h % SPARE.length];
}
// TGSC odour types arrive as free text ("citrus", "floral; fresh"): the first term names the family.
export function familyOf(odorType: string | undefined): string {
  const first = (odorType ?? '').split(/[;,/]/)[0].trim();
  return first ? first[0].toUpperCase() + first.slice(1).toLowerCase() : 'Unassigned';
}
export function toMaterialRefs(rows: DatasetRow[]): MaterialRef[] {
  return rows.map(r => {
    const cas = r.CAS; const fictional = !validCas(cas); const family = familyOf(r['TGSC Odor Type']);
    return {id: cas, name: r['Name (TGSC)'] || cas, cas: fictional ? null : cas, family, color: familyColor(family), fictional,
      mw: numberOf(r['MW (g/mol)']), psat25: numberOf(r['Psat_25C_Pa']), threshold: numberOf(r['TGSC ODT']), tenacityHours: numberOf(r['TGSC Tenacity (hours)'])};
  });
}

export type LimitRule = {cas: string; name: string; category: string; type: string; maxPct: string | null; source: string; amendment: string; effective: string; citation: string};
export function toLimitRules(rows: DatasetRow[]): LimitRule[] {
  return rows.map(r => ({cas: r.CAS, name: r['Material name'] ?? '', category: r['Product category'], type: r['Restriction type'],
    maxPct: r['Restriction type'] === 'prohibited' ? '0' : r['Restriction type'] === 'restricted' ? r['Max % in finished product'] : null,
    source: r.Source, amendment: r.Amendment ?? '', effective: r['Effective date'] ?? '', citation: r.Citation ?? ''}));
}
// Every rule that names this substance, in any category and from any source.
export const rulesFor = (cas: string, rules: LimitRule[]) => rules.filter(r => r.cas === cas);
