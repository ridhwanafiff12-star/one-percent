import { test } from 'node:test';
import assert from 'node:assert/strict';
import { emptyState, ensureDay, toggleDone, setNote, reroll, NOTE_MAX } from '../src/day.js';
import { CATEGORIES, getTask } from '../src/library/index.js';
import { seeded, deepFreeze } from './helpers.js';

const D = '2026-11-22';
const fresh = () => ensureDay(emptyState(D), D, seeded(1));

test('emptyState has schema v1 shape', () => {
  assert.deepEqual(emptyState(D), {
    schemaVersion: 1, firstDay: D, bestStreak: 0, lastBackupAt: null, days: {},
    bags: { health: [], ibadah: [], knowledge: [], finance: [] },
  });
});

test('ensureDay creates 4 undone slots from matching categories', () => {
  const day = fresh().days[D];
  assert.deepEqual(Object.keys(day), CATEGORIES);
  for (const c of CATEGORIES) {
    assert.equal(getTask(day[c].id).category, c);
    assert.deepEqual({ ...day[c], id: undefined }, { id: undefined, done: false, doneAt: null, note: '', rerolled: false });
  }
});

test('ensureDay is idempotent', () => {
  const s = fresh();
  assert.equal(ensureDay(s, D, seeded(99)), s);
});

test('ensureDay after a gap adds only the requested day', () => {
  const s = ensureDay(fresh(), '2026-11-25', seeded(2));
  assert.deepEqual(Object.keys(s.days).sort(), [D, '2026-11-25']);
});

test('ensureDay consumes ids from the bag (no same-day repeat next day)', () => {
  const s1 = fresh();
  const s2 = ensureDay(s1, '2026-11-23', seeded(2));
  for (const c of CATEGORIES) assert.notEqual(s2.days['2026-11-23'][c].id, s1.days[D][c].id);
});

test('toggleDone flips done and sets/clears doneAt', () => {
  const now = new Date('2026-11-22T08:00:00.000Z');
  const s = toggleDone(fresh(), D, 'health', now);
  assert.equal(s.days[D].health.done, true);
  assert.equal(s.days[D].health.doneAt, '2026-11-22T08:00:00.000Z');
  const s2 = toggleDone(s, D, 'health', now);
  assert.equal(s2.days[D].health.done, false);
  assert.equal(s2.days[D].health.doneAt, null);
});

test('reroll once changes id; second reroll is a no-op', () => {
  const s = fresh();
  const r1 = reroll(s, D, 'ibadah', seeded(5));
  assert.notEqual(r1.days[D].ibadah.id, s.days[D].ibadah.id);
  assert.equal(r1.days[D].ibadah.rerolled, true);
  assert.equal(reroll(r1, D, 'ibadah', seeded(6)), r1);
});

test('rerolled-away id goes to the front of the bag (drawn last)', () => {
  const s = fresh();
  const old = s.days[D].ibadah.id;
  assert.equal(reroll(s, D, 'ibadah', seeded(5)).bags.ibadah[0], old);
});

test('reroll after done is a no-op', () => {
  const s = toggleDone(fresh(), D, 'finance', new Date());
  assert.equal(reroll(s, D, 'finance', seeded(5)), s);
});

test('setNote trims and truncates to NOTE_MAX', () => {
  assert.equal(NOTE_MAX, 140);
  assert.equal(setNote(fresh(), D, 'health', 'x'.repeat(200)).days[D].health.note.length, 140);
  assert.equal(setNote(fresh(), D, 'health', '  hi  ').days[D].health.note, 'hi');
});

test('state transitions never mutate their input', () => {
  const s = deepFreeze(fresh());
  ensureDay(s, '2026-11-23', seeded(3));
  toggleDone(s, D, 'health', new Date());
  setNote(s, D, 'health', 'x');
  reroll(s, D, 'health', seeded(3));
});

test('reroll on the day the bag ran out does not duplicate the old id in the bag', () => {
  let s = fresh();
  s = { ...s, bags: { ...s.bags, health: [] } };
  const old = s.days[D].health.id;
  const r = reroll(s, D, 'health', seeded(11));
  const bag = r.bags.health;
  assert.equal(bag.filter((id) => id === old).length, 1);
  assert.equal(new Set(bag).size, bag.length);
});
