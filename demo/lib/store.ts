// AI Perfumery Engine; ownership follows the owner's existing agreement. No new licence granted.
//
// Local JSON store for the demo's formulas. Server only: route handlers call it, the browser never
// touches the file.
//
// One file, data/store.json, written atomically (temporary file, then rename), with rotating
// backups and a revision number so a stale write is refused instead of overwriting newer work.
// Versions are append-only: the only operations are create, append and reset, so no request can
// change a saved version (FR-011).
//
// This stands in for the Go + PostgreSQL backend in src/backend and copies its contract; it is
// deleted when that backend exists. Synthetic data only: data/ is gitignored, and the owner
// dataset never goes here.
import {promises as fs} from 'node:fs';
import path from 'node:path';
import {randomUUID} from 'node:crypto';
import type {Formula, FormulaVersion} from './model.ts';
import {initialFormulas} from './model.ts';
import {validateDemoContext} from './formula-validation.ts';

export const SCHEMA_VERSION = 1;
export const LIMITS = {
  formulas: 200, versionsPerFormula: 100, ingredients: 50, backups: 10,
  nameLength: 100, noteLength: 500, textLength: 100, amountLength: 32,
};

// Reserved for the reference-dataset importer planned after the alpha (imported dataset versions,
// one active at a time). Always empty until then; kept in the file so adding it needs no migration.
export type DatasetVersion = Record<string, never>;
export type StoreFile = {schemaVersion: number; revision: number; updatedAt: string; formulas: Formula[]; datasets: DatasetVersion[]};
// `recovered` is set once, on the read that had to repair the file, so the interface can say so.
export type StoreRead = StoreFile & {recovered?: string};

export type StoreErrorCode = 'stale' | 'invalid' | 'not_found' | 'limit';
export class StoreError extends Error {
  readonly code: StoreErrorCode;
  constructor(code: StoreErrorCode, message: string) { super(message); this.code = code; }
}

type Options = {dir: string; now?: () => Date; seed?: () => Formula[]};
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export function createStore({dir, now = () => new Date(), seed = initialFormulas}: Options) {
  const file = path.join(dir, 'store.json');
  const backupDir = path.join(dir, 'backups');

  // One operation at a time in this process, so a read and a write never interleave.
  let queue: Promise<unknown> = Promise.resolve();
  function serial<T>(task: () => Promise<T>): Promise<T> {
    const run = queue.then(task, task);
    queue = run.catch(() => undefined);
    return run;
  }

  const fileStamp = () => now().toISOString().replace(/[:.]/g, '-');
  const dayLabel = () => { const d = now(); return `${String(d.getDate()).padStart(2, '0')} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`; };
  const seedFile = (revision: number): StoreFile =>
    ({schemaVersion: SCHEMA_VERSION, revision, updatedAt: now().toISOString(), formulas: seed(), datasets: []});

  // Windows can briefly lock a file that an editor or antivirus is reading; retry a few times.
  async function renameWithRetry(from: string, to: string) {
    for (let attempt = 0; ; attempt++) {
      try { await fs.rename(from, to); return; }
      catch (error) {
        const code = (error as NodeJS.ErrnoException).code;
        if (attempt >= 5 || !['EPERM', 'EBUSY', 'EACCES'].includes(code ?? '')) throw error;
        await new Promise(resolve => setTimeout(resolve, 40 * (attempt + 1)));
      }
    }
  }

  // Write the whole file to a temporary name, flush it to disk, then rename it over the real one.
  // A crash leaves either the old file or the new one, never half of each.
  async function writeAtomic(data: StoreFile) {
    await fs.mkdir(dir, {recursive: true});
    const tmp = `${file}.${process.pid}.tmp`;
    const handle = await fs.open(tmp, 'w');
    try { await handle.writeFile(JSON.stringify(data, null, 2) + '\n', 'utf8'); await handle.sync(); }
    finally { await handle.close(); }
    await renameWithRetry(tmp, file);
  }

  async function listBackups(): Promise<string[]> {
    try { return (await fs.readdir(backupDir)).filter(name => /^store-.+\.json$/.test(name)).sort(); }
    catch { return []; }
  }

  // Copy the current file aside before it is replaced, and keep only the newest few copies.
  async function backupCurrent(revision: number) {
    try { await fs.access(file); } catch { return; }
    await fs.mkdir(backupDir, {recursive: true});
    await fs.copyFile(file, path.join(backupDir, `store-${fileStamp()}-r${String(revision).padStart(8, '0')}.json`));
    const names = await listBackups();
    for (const old of names.slice(0, Math.max(0, names.length - LIMITS.backups))) await fs.rm(path.join(backupDir, old), {force: true});
  }

  async function load(): Promise<StoreRead> {
    let text: string | undefined;
    try { text = await fs.readFile(file, 'utf8'); }
    catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; }
    if (text === undefined) { const fresh = seedFile(0); await writeAtomic(fresh); return fresh; }
    try { return readFile(JSON.parse(text)); }
    catch {
      // Keep the unreadable file for inspection, then fall back to the newest backup that reads.
      const aside = `store.corrupt-${fileStamp()}.json`;
      await renameWithRetry(file, path.join(dir, aside));
      for (const name of (await listBackups()).reverse()) {
        try {
          const restored = readFile(JSON.parse(await fs.readFile(path.join(backupDir, name), 'utf8')));
          await writeAtomic(restored);
          return {...restored, recovered: `The store file could not be read. It was kept as ${aside} and the backup ${name} was restored.`};
        } catch { continue; }
      }
      const fresh = seedFile(0);
      await writeAtomic(fresh);
      return {...fresh, recovered: `The store file could not be read and no backup was usable. It was kept as ${aside} and the demo formulas were reloaded.`};
    }
  }

  async function mutate(baseRevision: unknown, change: (data: StoreFile) => void): Promise<StoreFile> {
    return serial(async () => {
      const {recovered: _ignored, ...data} = await load();
      if (baseRevision !== data.revision)
        throw new StoreError('stale', `The formulas changed elsewhere (now revision ${data.revision}, this change started from ${String(baseRevision)}). Reload and try again.`);
      const next: StoreFile = {...data, formulas: structuredClone(data.formulas)};
      change(next);
      next.revision = data.revision + 1;
      next.updatedAt = now().toISOString();
      readFile(next); // never write a file this module could not read back
      await backupCurrent(data.revision);
      await writeAtomic(next);
      return next;
    });
  }

  function nextCode(formulas: Formula[]): string {
    const used = formulas.map(f => /^F-(\d+)$/.exec(f.code)?.[1]).filter(Boolean).map(Number);
    return `F-${String(Math.max(0, ...used) + 1).padStart(3, '0')}`;
  }

  return {
    file,
    read: () => serial(load),

    createFormula: (input: {name?: unknown; version?: unknown}, baseRevision: unknown) => mutate(baseRevision, data => {
      if (data.formulas.length >= LIMITS.formulas) throw new StoreError('limit', `This demo keeps at most ${LIMITS.formulas} formulas.`);
      const name = cleanText(input.name, 'Formula name', LIMITS.nameLength);
      const draft = cleanDraft(input.version);
      const id = `formula-${randomUUID()}`;
      const label = dayLabel();
      data.formulas.unshift({id, name, code: nextCode(data.formulas), updatedLabel: label,
        versions: [{...draft, id: `${id}-v1`, number: 1, note: 'Initial synthetic version', createdLabel: label}]});
    }),

    appendVersion: (formulaId: string, input: {version?: unknown; note?: unknown}, baseRevision: unknown) => mutate(baseRevision, data => {
      const formula = data.formulas.find(f => f.id === formulaId);
      if (!formula) throw new StoreError('not_found', 'This formula no longer exists. Reload the library.');
      if (formula.versions.length >= LIMITS.versionsPerFormula) throw new StoreError('limit', `This demo keeps at most ${LIMITS.versionsPerFormula} versions per formula.`);
      const note = cleanText(input.note, 'Version note', LIMITS.noteLength);
      const draft = cleanDraft(input.version);
      const number = Math.max(...formula.versions.map(v => v.number)) + 1;
      const label = dayLabel();
      formula.versions.push({...draft, id: `${formula.id}-v${number}`, number, note, createdLabel: label});
      formula.updatedLabel = label;
    }),

    // Back up whatever is there, then write the seed formulas. The revision keeps counting up, so a
    // tab that loaded before the reset cannot write over it.
    reset: () => serial(async () => {
      const current = await load();
      await backupCurrent(current.revision);
      const fresh = seedFile(current.revision + 1);
      await writeAtomic(fresh);
      return fresh;
    }),
  };
}

// ---------------------------------------------------------------------------------------------
// Validation. Everything read from disk or from a request passes through here.

function cleanText(value: unknown, label: string, max: number): string {
  if (typeof value !== 'string' || !value.trim()) throw new StoreError('invalid', `${label} is required.`);
  if (value.trim().length > max) throw new StoreError('invalid', `${label} is longer than ${max} characters.`);
  return value.trim();
}

// Builds a version body from untrusted input, keeping only known fields, then runs the same
// declaration checks as the interface (decimal strings, exact 100% total, dilution range).
function cleanDraft(value: unknown): Omit<FormulaVersion, 'id' | 'number' | 'note' | 'createdLabel'> {
  if (!value || typeof value !== 'object') throw new StoreError('invalid', 'A formula version is required.');
  const v = value as Record<string, unknown>;
  const text = (x: unknown, label: string) => cleanText(x, label, LIMITS.textLength);
  if (!Array.isArray(v.ingredients) || v.ingredients.length > LIMITS.ingredients)
    throw new StoreError('invalid', `A version needs between 1 and ${LIMITS.ingredients} materials.`);
  const ingredients = v.ingredients.map((row, i) => {
    const r = (row ?? {}) as Record<string, unknown>;
    if (typeof r.materialId !== 'string' || typeof r.amount !== 'string' || r.amount.length > LIMITS.amountLength)
      throw new StoreError('invalid', 'Every material needs a listed material and a decimal amount.');
    return {id: `row-${i + 1}`, materialId: r.materialId, amount: r.amount};
  });
  const draft = {vehicle: text(v.vehicle, 'Vehicle'), category: text(v.category, 'Application'),
    dilution: typeof v.dilution === 'string' && v.dilution.length <= LIMITS.amountLength ? v.dilution : '', ingredients};
  const problem = validateDemoContext({...draft, id: 'check', number: 1, note: '', createdLabel: ''});
  if (problem) throw new StoreError('invalid', problem);
  return draft;
}

// Checks a whole file. Throws on anything it does not recognise, so a damaged or hand-edited file
// is caught on load instead of reaching the interface.
export function readFile(value: unknown): StoreFile {
  const bad = (why: string): never => { throw new StoreError('invalid', `Store file: ${why}`); };
  if (!value || typeof value !== 'object') bad('not an object');
  const v = value as Record<string, unknown>;
  // Migration point: a future schema version is converted here before it is checked.
  if (v.schemaVersion !== SCHEMA_VERSION) bad(`unsupported schema version ${String(v.schemaVersion)}`);
  if (!Number.isInteger(v.revision) || (v.revision as number) < 0) bad('revision');
  if (typeof v.updatedAt !== 'string') bad('updatedAt');
  if (!Array.isArray(v.formulas) || v.formulas.length > LIMITS.formulas) bad('formulas');
  const ids = new Set<string>();
  for (const f of v.formulas as Formula[]) {
    if (!f || typeof f.id !== 'string' || ids.has(f.id)) bad('formula id');
    ids.add(f.id);
    if (typeof f.name !== 'string' || typeof f.code !== 'string' || typeof f.updatedLabel !== 'string') bad(`formula ${f.id}`);
    if (!Array.isArray(f.versions) || !f.versions.length || f.versions.length > LIMITS.versionsPerFormula) bad(`versions of ${f.id}`);
    f.versions.forEach((ver, i) => {
      if (!ver || typeof ver.id !== 'string' || ver.number !== i + 1 || typeof ver.note !== 'string' || typeof ver.createdLabel !== 'string') bad(`version ${i + 1} of ${f.id}`);
      if (validateDemoContext(ver)) bad(`version ${i + 1} of ${f.id} fails validation`);
    });
  }
  const datasets = v.datasets === undefined ? [] : v.datasets;
  if (!Array.isArray(datasets)) bad('datasets');
  return {schemaVersion: SCHEMA_VERSION, revision: v.revision as number, updatedAt: v.updatedAt as string,
    formulas: v.formulas as Formula[], datasets: datasets as DatasetVersion[]};
}
