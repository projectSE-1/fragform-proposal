// AI Perfumery Engine; ownership follows the owner's existing agreement. No new licence granted.
import test from 'node:test';
import assert from 'node:assert/strict';
import {promises as fs} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createStore, LIMITS, StoreError} from '../lib/store.ts';
import {initialFormulas} from '../lib/model.ts';

// Each test gets its own folder and a clock that ticks one second per call, so backup names differ.
async function setup() {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'perfumery-store-'));
  let t = Date.UTC(2026, 9, 6, 9, 0, 0);
  const make = () => createStore({dir, now: () => new Date(t += 1000)});
  return {dir, make, store: make()};
}
const draftOf = (amounts: string[] = ['35', '35', '20', '10']) => {
  const base = structuredClone(initialFormulas()[0].versions.at(-1)!);
  base.ingredients.forEach((row, i) => { row.amount = amounts[i]; });
  return base;
};
const code = (e: unknown) => (e as StoreError).code;

test('first read creates the file from the seed formulas', async () => {
  const {dir, store} = await setup();
  const data = await store.read();
  assert.equal(data.revision, 0);
  assert.equal(data.formulas.length, initialFormulas().length);
  assert.deepEqual(data.datasets, []);
  const onDisk = JSON.parse(await fs.readFile(path.join(dir, 'store.json'), 'utf8'));
  assert.equal(onDisk.schemaVersion, 1);
});

test('a created formula and an appended version survive a restart', async () => {
  const {store, make} = await setup();
  const r0 = (await store.read()).revision;
  const created = await store.createFormula({name: 'Evening Study', version: draftOf()}, r0);
  const id = created.formulas[0].id;
  const appended = await store.appendVersion(id, {version: draftOf(['40', '30', '20', '10']), note: 'More citrus'}, created.revision);
  const again = await make().read();
  const f = again.formulas.find(x => x.id === id)!;
  assert.equal(again.revision, appended.revision);
  assert.equal(f.name, 'Evening Study');
  assert.deepEqual(f.versions.map(v => v.number), [1, 2]);
  assert.equal(f.versions[1].note, 'More citrus');
  assert.equal(f.versions[1].ingredients[0].amount, '40');
});

test('appending never changes an earlier version', async () => {
  const {store} = await setup();
  const before = await store.read();
  const target = before.formulas[0];
  const after = await store.appendVersion(target.id, {version: draftOf(['40', '30', '20', '10']), note: 'n'}, before.revision);
  const updated = after.formulas.find(f => f.id === target.id)!;
  assert.deepEqual(updated.versions.slice(0, target.versions.length), target.versions);
});

test('a write from a stale revision is refused and changes nothing', async () => {
  const {dir, store} = await setup();
  const r0 = (await store.read()).revision;
  await store.createFormula({name: 'First', version: draftOf()}, r0);
  const fileBefore = await fs.readFile(path.join(dir, 'store.json'), 'utf8');
  await assert.rejects(store.createFormula({name: 'Second', version: draftOf()}, r0), e => code(e) === 'stale');
  assert.equal(await fs.readFile(path.join(dir, 'store.json'), 'utf8'), fileBefore);
});

test('two saves racing from the same revision: one wins, one is told to reload', async () => {
  const {store} = await setup();
  const data = await store.read();
  const id = data.formulas[0].id;
  const results = await Promise.allSettled([
    store.appendVersion(id, {version: draftOf(), note: 'tab A'}, data.revision),
    store.appendVersion(id, {version: draftOf(), note: 'tab B'}, data.revision),
  ]);
  assert.equal(results.filter(r => r.status === 'fulfilled').length, 1);
  const lost = results.find(r => r.status === 'rejected') as PromiseRejectedResult;
  assert.equal(code(lost.reason), 'stale');
});

test('invalid input is refused with the interface message, and the revision does not move', async () => {
  const {store} = await setup();
  const r0 = (await store.read()).revision;
  await assert.rejects(store.createFormula({name: 'Bad total', version: draftOf(['35', '35', '20', '9'])}, r0),
    e => code(e) === 'invalid' && /total exactly 100%/.test((e as Error).message));
  await assert.rejects(store.createFormula({name: '  ', version: draftOf()}, r0), e => code(e) === 'invalid');
  await assert.rejects(store.appendVersion('missing', {version: draftOf(), note: 'n'}, r0), e => code(e) === 'not_found');
  assert.equal((await store.read()).revision, r0);
});

test('a corrupt file is kept aside and the newest backup is restored', async () => {
  const {dir, store, make} = await setup();
  const r0 = (await store.read()).revision;
  const one = await store.createFormula({name: 'Kept', version: draftOf()}, r0);
  await store.createFormula({name: 'Also kept', version: draftOf()}, one.revision);
  await fs.writeFile(path.join(dir, 'store.json'), '{"schemaVersion":1, broken');
  const read = await make().read();
  assert.match(read.recovered ?? '', /backup/);
  assert.equal(read.revision, one.revision); // the newest backup holds the state before the last write
  assert.ok(read.formulas.some(f => f.name === 'Kept'));
  const names = await fs.readdir(dir);
  assert.ok(names.some(n => /^store\.corrupt-.+\.json$/.test(n)), 'corrupt copy kept');
});

test('a corrupt file with no usable backup reloads the seed and says so', async () => {
  const {dir, make} = await setup();
  await fs.mkdir(dir, {recursive: true});
  await fs.writeFile(path.join(dir, 'store.json'), 'not json');
  const read = await make().read();
  assert.match(read.recovered ?? '', /no backup/);
  assert.equal(read.formulas.length, initialFormulas().length);
});

test(`only the newest ${LIMITS.backups} backups are kept, and no temporary file is left`, async () => {
  const {dir, store} = await setup();
  let rev = (await store.read()).revision;
  const id = (await store.read()).formulas[0].id;
  for (let i = 0; i < LIMITS.backups + 3; i++) rev = (await store.appendVersion(id, {version: draftOf(), note: `n${i}`}, rev)).revision;
  const backups = await fs.readdir(path.join(dir, 'backups'));
  assert.equal(backups.length, LIMITS.backups);
  assert.ok(!(await fs.readdir(dir)).some(n => n.endsWith('.tmp')));
});

test('reset backs up first, reloads the seed and keeps the revision counting up', async () => {
  const {dir, store} = await setup();
  const r0 = (await store.read()).revision;
  const changed = await store.createFormula({name: 'Gone after reset', version: draftOf()}, r0);
  const fresh = await store.reset();
  assert.ok(fresh.revision > changed.revision);
  assert.ok(!fresh.formulas.some(f => f.name === 'Gone after reset'));
  const backups = await fs.readdir(path.join(dir, 'backups'));
  const newest = JSON.parse(await fs.readFile(path.join(dir, 'backups', backups.sort().at(-1)!), 'utf8'));
  assert.ok(newest.formulas.some((f: {name: string}) => f.name === 'Gone after reset'));
});
