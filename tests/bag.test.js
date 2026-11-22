import { test } from 'node:test';
import assert from 'node:assert/strict';
import { draw, reconcileBag } from '../src/bag.js';
import { seeded } from './helpers.js';

const ALL = ['a', 'b', 'c', 'd', 'e'];

test('a full cycle of draws yields every id exactly once', () => {
  const rng = seeded(7);
  let bag = [];
  const got = [];
  for (let i = 0; i < ALL.length; i++) ({ id: got[i], bag } = draw(bag, ALL, rng));
  assert.deepEqual([...got].sort(), ALL);
});

test('refill: first draw of a new cycle is not the excluded id', () => {
  for (let seed = 1; seed <= 50; seed++) {
    assert.notEqual(draw([], ALL, seeded(seed), 'a').id, 'a');
  }
});

test('exclude is never returned while another id is available', () => {
  assert.equal(draw(['b', 'a'], ALL, seeded(1), 'a').id, 'b');
  assert.deepEqual(draw(['b', 'a'], ALL, seeded(1), 'a').bag, ['a']);
});

test('exclude is returned only if it is the sole id', () => {
  assert.equal(draw(['a'], ['a'], seeded(1), 'a').id, 'a');
});

test('reconcileBag drops unknown ids, keeping order', () => {
  assert.deepEqual(reconcileBag(['b', 'zz', 'a'], ['a', 'b']), ['b', 'a']);
});

test('reconcileBag does not re-add ids already drawn this cycle', () => {
  assert.deepEqual(reconcileBag(['b'], ['a', 'b', 'c']), ['b']);
});

test('new library ids join on the next refill', () => {
  const got = new Set();
  let bag = [];
  for (let i = 0; i < 3; i++) { const r = draw(bag, ['a', 'b', 'new'], seeded(3)); got.add(r.id); bag = r.bag; }
  assert.ok(got.has('new'));
});

test('inputs are not mutated', () => {
  const bag = Object.freeze(['a', 'b']);
  const all = Object.freeze([...ALL]);
  draw(bag, all, seeded(1));
  draw([], all, seeded(1));
  reconcileBag(bag, all);
});
