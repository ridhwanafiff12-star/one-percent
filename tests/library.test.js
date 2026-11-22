import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CATEGORIES, CATEGORY_LABELS, LIBRARY, getTask } from '../src/library/index.js';
import { validateLibrary } from '../src/library/validate.js';

const ok = (over = {}) => ({
  id: 'h01', category: 'health', title: 'Walk', minutes: 5, why: 'Because.',
  source: { label: 'WHO' }, ...over,
});
const lib = (health = [], rest = {}) => ({ health, ibadah: [], knowledge: [], finance: [], ...rest });

test('categories in spec order with labels', () => {
  assert.deepEqual(CATEGORIES, ['health', 'ibadah', 'knowledge', 'finance']);
  assert.deepEqual(CATEGORY_LABELS, { health: 'Health', ibadah: 'Ibadah', knowledge: 'Knowledge', finance: 'Finance' });
});

test('bundled library is valid', () => {
  assert.deepEqual(validateLibrary(LIBRARY), []);
});

test('validator accepts a well-formed task', () => {
  assert.deepEqual(validateLibrary(lib([ok()])), []);
});

test('validator rejects duplicate ids', () => {
  assert.equal(validateLibrary(lib([ok(), ok()])).length, 1);
});

test('validator rejects ids with wrong pattern or prefix', () => {
  assert.equal(validateLibrary(lib([ok({ id: 'k01' })])).length, 1);
  assert.equal(validateLibrary(lib([ok({ id: 'h1' })])).length, 1);
});

test('validator rejects minutes outside 2–10', () => {
  assert.equal(validateLibrary(lib([ok({ minutes: 1 })])).length, 1);
  assert.equal(validateLibrary(lib([ok({ minutes: 11 })])).length, 1);
  assert.deepEqual(validateLibrary(lib([ok({ minutes: 2 }), ok({ id: 'h02', minutes: 10 })])), []);
});

test('validator rejects empty title/why/source label and long titles', () => {
  assert.equal(validateLibrary(lib([ok({ title: '' })])).length, 1);
  assert.equal(validateLibrary(lib([ok({ why: ' ' })])).length, 1);
  assert.equal(validateLibrary(lib([ok({ source: { label: '' } })])).length, 1);
  assert.equal(validateLibrary(lib([ok({ title: 'x'.repeat(81) })])).length, 1);
});

test('validator rejects non-https urls', () => {
  assert.equal(validateLibrary(lib([ok({ source: { label: 'x', url: 'http://a.b' } })])).length, 1);
  assert.deepEqual(validateLibrary(lib([ok({ source: { label: 'x', url: 'https://a.b' } })])), []);
});

test('validator rejects task whose category field mismatches its list', () => {
  assert.equal(validateLibrary(lib([ok({ category: 'finance' })])).length, 1);
});

test('every category has at least 30 tasks', () => {
  for (const c of CATEGORIES) assert.ok(LIBRARY[c].length >= 30, `${c}: ${LIBRARY[c].length}`);
});

test('getTask finds by id and returns undefined for unknown', () => {
  assert.equal(getTask(LIBRARY.health[0].id), LIBRARY.health[0]);
  assert.equal(getTask('h99zz'), undefined);
});

const IBADAH_REF = /^(Qur'an \d{1,3}:\d{1,3}(-\d{1,3})?|Sahih al-Bukhari \d+|Sahih Muslim \d+|Sunan (Abi Dawud|at-Tirmidhi|an-Nasa'i|Ibn Majah) \d+|Riyad as-Salihin \d+)/;

test('every ibadah task cites a Qur\'an or hadith reference', () => {
  for (const task of LIBRARY.ibadah) assert.match(task.source.label, IBADAH_REF, task.id);
});
