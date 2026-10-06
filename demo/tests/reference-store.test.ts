// AI Perfumery Engine; ownership follows the owner's existing agreement. No new licence granted.
import test from 'node:test';
import assert from 'node:assert/strict';
import {promises as fs} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createReferenceStore, MAX_VERSIONS} from '../lib/reference-store.ts';
import type {StoreError} from '../lib/store.ts';

async function setup() {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'perfumery-ref-'));
  let t = Date.UTC(2026, 9, 6, 9, 0, 0);
  const make = () => createReferenceStore({dir, now: () => new Date(t += 1000)});
  return {dir, make, store: make()};
}
// Invented substances; the CAS numbers only exercise the check digit.
const goodMaterials = 'CAS,Name (TGSC),TGSC Odor Type,MW (g/mol),Psat_25C_Pa,TGSC ODT\n50-00-0,Study A,citrus,30,100,0.5\n64-17-5,Study B,woody,46,5,\n';
const code = (e: unknown) => (e as StoreError).code;

test('a new store has the mock active in every category, and mock rows readable', async () => {
  const {store} = await setup();
  const ref = await store.read();
  assert.equal(ref.active.materials, 'mock-materials');
  assert.equal(ref.active.limits, 'mock-limits');
  assert.ok((await store.rows('mock-limits')).length > 0);
});

test('upload saves an inactive version; activate switches what the engine reads', async () => {
  const {store, make} = await setup();
  const r0 = (await store.read()).revision;
  const up = await store.upload('materials', 'study.csv', goodMaterials, r0);
  const v1 = up.versions.find(v => v.category === 'materials' && !v.builtIn)!;
  assert.equal(v1.number, 1);
  assert.equal(up.active.materials, 'mock-materials', 'upload never activates');
  const act = await store.activate('materials', v1.id, up.revision);
  const active = await make().active();
  assert.equal(active.revision, act.revision);
  assert.deepEqual(active.materials.rows.map(r => r.CAS), ['50-00-0', '64-17-5']);
  assert.equal(active.limits.meta.id, 'mock-limits', 'other categories unaffected');
});

test('a file with errors is not saved, and the check alone writes nothing', async () => {
  const {dir, store} = await setup();
  const r0 = (await store.read()).revision;
  const bad = 'CAS,Name (TGSC)\n50-00-1,Typo\n';
  assert.equal(store.check('materials', bad).errorCount, 1);
  await assert.rejects(store.upload('materials', 'bad.csv', bad, r0), e => code(e) === 'invalid');
  assert.equal((await store.read()).revision, r0);
  assert.deepEqual(await fs.readdir(path.join(dir, 'datasets')).catch(() => []), []);
});

test('an active version cannot be deleted; an inactive one is moved to backups', async () => {
  const {dir, store} = await setup();
  let r = (await store.read()).revision;
  const up = await store.upload('materials', 'a.csv', goodMaterials, r);
  const id = up.versions.find(v => !v.builtIn)!.id;
  r = (await store.activate('materials', id, up.revision)).revision;
  await assert.rejects(store.remove(id, r), e => code(e) === 'invalid');
  await assert.rejects(store.remove('mock-materials', r), e => code(e) === 'not_found');
  r = (await store.activate('materials', 'mock-materials', r)).revision;
  const after = await store.remove(id, r);
  assert.ok(!after.versions.some(v => v.id === id));
  assert.equal((await fs.readdir(path.join(dir, 'backups', 'datasets'))).length, 1);
});

test('stale revisions are refused and version numbers keep counting per category', async () => {
  const {store} = await setup();
  const r0 = (await store.read()).revision;
  const one = await store.upload('materials', 'a.csv', goodMaterials, r0);
  await assert.rejects(store.upload('materials', 'b.csv', goodMaterials, r0), e => code(e) === 'stale');
  const two = await store.upload('materials', 'b.csv', goodMaterials, one.revision);
  assert.deepEqual(two.versions.filter(v => !v.builtIn).map(v => v.number), [1, 2]);
});

test(`at most ${MAX_VERSIONS} uploads per category`, async () => {
  const {store} = await setup();
  let r = (await store.read()).revision;
  for (let i = 0; i < MAX_VERSIONS; i++) r = (await store.upload('materials', `${i}.csv`, goodMaterials, r)).revision;
  await assert.rejects(store.upload('materials', 'one-more.csv', goodMaterials, r), e => code(e) === 'limit');
});

test('a damaged index returns every category to mock and keeps the uploaded files', async () => {
  const {dir, store, make} = await setup();
  const up = await store.upload('materials', 'a.csv', goodMaterials, (await store.read()).revision);
  await store.activate('materials', up.versions.find(v => !v.builtIn)!.id, up.revision);
  await fs.writeFile(path.join(dir, 'reference.json'), '{broken');
  const ref = await make().read();
  assert.match(ref.recovered ?? '', /back on mock/);
  assert.equal(ref.active.materials, 'mock-materials');
  assert.equal((await fs.readdir(path.join(dir, 'datasets'))).length, 1);
});
