// AI Perfumery Engine; ownership follows the owner's existing agreement. No new licence granted.
//
// Local store for reference data (system data, never user formulas). Server only.
//
//   data/reference.json            index: which versions exist, which one is active per category
//   data/datasets/<id>.json        one file per uploaded version, written once and never changed
//   data/backups/reference-*.json  the index before each change, newest 10 kept
//   data/backups/datasets/         deleted versions, moved here rather than erased
//
// Each category always has a built-in mock version, which cannot be deleted. An upload is checked,
// saved as a new inactive version, and becomes active only when the admin activates it.
import {promises as fs} from 'node:fs';
import path from 'node:path';
import {createHash, randomUUID} from 'node:crypto';
import {backupFile, renameWithRetry, writeJsonAtomic} from './fs-safe.ts';
import {categories, checkDataset, columnsOf, LIMITS as DATA_LIMITS, mockRows} from './reference.ts';
import type {Category, CheckReport, DatasetRow} from './reference.ts';
import {StoreError} from './store.ts';

export const MAX_VERSIONS = 10; // per category, besides the mock
export type VersionMeta = {
  id: string; category: Category; number: number; label: string; builtIn: boolean;
  fileName: string | null; sha256: string | null; uploadedAt: string | null; rows: number;
  coverage: {column: string; filled: number}[]; warningCount: number;
};
export type ReferenceIndex = {schemaVersion: 1; revision: number; active: Record<Category, string>; versions: VersionMeta[]};
export type ReferenceView = ReferenceIndex & {recovered?: string};

const mockId = (c: Category) => `mock-${c}`;
// The built-in version: invented values (lib/reference.ts mockRows), shown as "Built-in sample".
function mockMeta(c: Category): VersionMeta {
  const rows = mockRows(c);
  return {id: mockId(c), category: c, number: 0, label: 'Built-in sample', builtIn: true, fileName: null, sha256: null, uploadedAt: null,
    rows: rows.length, coverage: columnsOf(c).map(column => ({column, filled: rows.filter(r => r[column]).length})), warningCount: 0};
}
const emptyIndex = (): ReferenceIndex =>
  ({schemaVersion: 1, revision: 0, active: {materials: mockId('materials'), limits: mockId('limits')}, versions: []});

function readIndex(value: unknown): ReferenceIndex {
  const bad = (why: string): never => { throw new StoreError('invalid', `Reference index: ${why}`); };
  const v = value as ReferenceIndex;
  if (!v || v.schemaVersion !== 1 || !Number.isInteger(v.revision) || !v.active || !Array.isArray(v.versions)) bad('shape');
  for (const c of categories) if (typeof v.active[c] !== 'string') bad(`active ${c}`);
  for (const m of v.versions) if (!m || typeof m.id !== 'string' || !categories.includes(m.category) || !Number.isInteger(m.number)) bad('version');
  return v;
}

export function createReferenceStore({dir, now = () => new Date()}: {dir: string; now?: () => Date}) {
  const indexFile = path.join(dir, 'reference.json');
  const dataDir = path.join(dir, 'datasets');
  const backupDir = path.join(dir, 'backups');
  const stamp = () => now().toISOString().replace(/[:.]/g, '-');
  let queue: Promise<unknown> = Promise.resolve();
  function serial<T>(task: () => Promise<T>): Promise<T> { const run = queue.then(task, task); queue = run.catch(() => undefined); return run; }

  async function load(): Promise<ReferenceView> {
    let text: string | undefined;
    try { text = await fs.readFile(indexFile, 'utf8'); }
    catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; }
    if (text === undefined) { const fresh = emptyIndex(); await writeJsonAtomic(indexFile, fresh); return fresh; }
    try { return readIndex(JSON.parse(text)); }
    catch {
      // Keep the damaged index; dataset files are untouched, so nothing uploaded is lost. Everything
      // returns to mock until the admin re-activates, which is safer than guessing what was active.
      const aside = `reference.corrupt-${stamp()}.json`;
      await renameWithRetry(indexFile, path.join(dir, aside));
      const fresh = emptyIndex(); await writeJsonAtomic(indexFile, fresh);
      return {...fresh, recovered: `The reference index could not be read. It was kept as ${aside}; every category is back on mock. Uploaded files are still in data/datasets.`};
    }
  }
  const view = (index: ReferenceIndex): ReferenceView =>
    ({...index, versions: [...categories.map(mockMeta), ...index.versions]});

  async function change(baseRevision: unknown, edit: (index: ReferenceIndex) => Promise<void> | void): Promise<ReferenceView> {
    return serial(async () => {
      const {recovered: _r, ...index} = await load();
      if (baseRevision !== index.revision) throw new StoreError('stale', `Reference data changed elsewhere (now revision ${index.revision}). Reload and try again.`);
      const next: ReferenceIndex = structuredClone(index);
      await edit(next);
      next.revision = index.revision + 1;
      readIndex(next);
      await backupFile(indexFile, backupDir, `reference-${stamp()}-r${String(index.revision).padStart(8, '0')}.json`, 'reference-', 10);
      await writeJsonAtomic(indexFile, next);
      return view(next);
    });
  }

  async function rowsOf(index: ReferenceIndex, id: string): Promise<DatasetRow[]> {
    for (const c of categories) if (id === mockId(c)) return mockRows(c);
    if (!index.versions.some(v => v.id === id)) throw new StoreError('not_found', 'This data version does not exist.');
    const data = JSON.parse(await fs.readFile(path.join(dataDir, `${id}.json`), 'utf8'));
    if (!Array.isArray(data?.rows)) throw new StoreError('invalid', 'The data file for this version is damaged.');
    return data.rows as DatasetRow[];
  }

  return {
    read: () => serial(async () => { const index = await load(); return {...view(index), recovered: index.recovered}; }),

    rows: (id: string) => serial(async () => rowsOf(await load(), id)),

    // The active version of each category, as the engine reads it. A missing file gives no rows and
    // a stated problem, never another version's data.
    active: () => serial(async () => {
      const index = await load();
      const out = {} as Record<Category, {meta: VersionMeta; rows: DatasetRow[]; problem: string | null}>;
      for (const c of categories) {
        const meta = view(index).versions.find(v => v.id === index.active[c]) ?? mockMeta(c);
        try { out[c] = {meta, rows: await rowsOf(index, meta.id), problem: null}; }
        catch { out[c] = {meta, rows: [], problem: `The data file for ${meta.label} could not be read.`}; }
      }
      return {revision: index.revision, ...out};
    }),

    // Dry run: the report only. Nothing is written.
    check: (category: Category, text: string): CheckReport => {
      if (text.length > DATA_LIMITS.bytes) throw new StoreError('limit', 'The file is larger than 5 MB.');
      return checkDataset(category, text).report;
    },

    upload: (category: Category, fileName: string, text: string, baseRevision: unknown) => change(baseRevision, async index => {
      if (!categories.includes(category)) throw new StoreError('invalid', 'Unknown data category.');
      if (text.length > DATA_LIMITS.bytes) throw new StoreError('limit', 'The file is larger than 5 MB.');
      if (index.versions.filter(v => v.category === category).length >= MAX_VERSIONS)
        throw new StoreError('limit', `Keep at most ${MAX_VERSIONS} uploaded versions per category. Delete an old one first.`);
      const {report, rows} = checkDataset(category, text);
      if (report.errorCount) throw new StoreError('invalid', `The file has ${report.errorCount} error(s). Run the check and fix them first.`);
      const number = Math.max(0, ...index.versions.filter(v => v.category === category).map(v => v.number)) + 1;
      const id = `${category}-v${number}-${randomUUID().slice(0, 8)}`;
      const meta: VersionMeta = {id, category, number, label: `Uploaded v${number}`, builtIn: false,
        fileName: String(fileName).slice(0, 200), sha256: createHash('sha256').update(text).digest('hex'),
        uploadedAt: now().toISOString(), rows: rows.length, coverage: report.coverage, warningCount: report.warningCount};
      // The data file is written before the index points at it, so the index never names a missing file.
      await writeJsonAtomic(path.join(dataDir, `${id}.json`), {meta, rows});
      index.versions.push(meta);
    }),

    activate: (category: Category, id: string, baseRevision: unknown) => change(baseRevision, index => {
      const exists = id === mockId(category) || index.versions.some(v => v.id === id && v.category === category);
      if (!exists) throw new StoreError('not_found', 'This data version does not exist in that category.');
      index.active[category] = id;
    }),

    // Only an inactive upload can be deleted. Its file is moved to backups, not erased.
    remove: (id: string, baseRevision: unknown) => change(baseRevision, async index => {
      const meta = index.versions.find(v => v.id === id);
      if (!meta) throw new StoreError('not_found', categories.some(c => id === mockId(c)) ? 'The built-in mock cannot be deleted.' : 'This data version does not exist.');
      if (index.active[meta.category] === id) throw new StoreError('invalid', 'This version is active. Activate another one first.');
      const from = path.join(dataDir, `${id}.json`);
      await fs.mkdir(path.join(backupDir, 'datasets'), {recursive: true});
      try { await renameWithRetry(from, path.join(backupDir, 'datasets', `${id}-deleted-${stamp()}.json`)); }
      catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; }
      index.versions = index.versions.filter(v => v.id !== id);
    }),
  };
}
