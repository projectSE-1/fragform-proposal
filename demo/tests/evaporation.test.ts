// AI Perfumery Engine; ownership follows the owner's existing agreement. No new licence granted.
import test from 'node:test';
import assert from 'node:assert/strict';
import {simulate} from '../lib/evaporation.ts';
import type {Component} from '../lib/evaporation.ts';

// Invented inputs. These tests check the arithmetic, not any real substance.
const fast: Component = {id: 'fast', pct: 50, mw: 136, psatPa: 200};
const slow: Component = {id: 'slow', pct: 50, mw: 152, psatPa: 0.05};

test('starts at the declared share and never rises or goes negative', () => {
  for (const model of ['independent', 'raoult'] as const) {
    const [a, b] = simulate([fast, slow], model, 8, 40);
    assert.equal(a.points.length, 41);
    assert.ok(Math.abs(a.points[0] - 50) < 1e-9 && Math.abs(b.points[0] - 50) < 1e-9);
    for (const s of [a, b]) s.points.forEach((v, i) => {
      assert.ok(v >= 0, 'negative remaining');
      if (i > 0) assert.ok(v <= s.points[i - 1] + 1e-12, 'remaining rose');
    });
  }
});

test('higher vapour pressure evaporates faster', () => {
  const [a, b] = simulate([fast, slow], 'raoult', 1, 10);
  assert.ok(a.points[10] < b.points[10]);
});

test('Raoult and each-alone agree for a single material', () => {
  const [x] = simulate([{...fast, pct: 100}], 'raoult', 1, 10);
  const [y] = simulate([{...fast, pct: 100}], 'independent', 1, 10);
  x.points.forEach((v, i) => assert.ok(Math.abs(v - y.points[i]) < 1e-9));
});

test('in a mixture, Raoult slows the fast material compared with each-alone', () => {
  const [mix] = simulate([fast, slow], 'raoult', 0.25, 10);
  const [alone] = simulate([fast, slow], 'independent', 0.25, 10);
  assert.ok(mix.points[10] > alone.points[10]);
});
