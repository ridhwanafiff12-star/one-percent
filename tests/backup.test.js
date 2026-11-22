import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MAX_IMPORT_CHARS, parseState, exportState, backupFilename, parseBackup } from '../src/backup.js';
import { emptyState, ensureDay, toggleDone, setNote } from '../src/day.js';
import { seeded } from './helpers.js';

const D = '2026-11-22';
const sample = () => setNote(toggleDone(ensureDay(emptyState(D), D, seeded(1)), D, 'health', new Date('2026-11-22T01:00:00Z')), D, 'health', 'Good');
const wrap = (state) => JSON.stringify({ app: 'kaizen', exportedAt: '2026-11-22T00:00:00.000Z', state });
const mutate = (fn) => { const s = structuredClone(sample()); fn(s); return wrap(s); };

test('export then parse round-trips', () => {
  const s = sample();
  const r = parseBackup(exportState(s, new Date('2026-11-22T10:00:00Z')));
  assert.equal(r.ok, true);
  assert.deepEqual(r.state, s);
});

test('export includes app marker and exportedAt', () => {
  const o = JSON.parse(exportState(sample(), new Date('2026-11-22T10:00:00Z')));
  assert.equal(o.app, 'kaizen');
  assert.equal(o.exportedAt, '2026-11-22T10:00:00.000Z');
});

test('backupFilename uses local date', () => {
  assert.equal(backupFilename(new Date(2026, 10, 22, 9)), 'kaizen-backup-2026-11-22.json');
});

test('rejects oversize input', () => {
  assert.equal(MAX_IMPORT_CHARS, 1_000_000);
  assert.deepEqual(parseBackup('x'.repeat(1_000_001)), { ok: false, reason: 'too_large' });
});

test('rejects non-JSON and wrong app', () => {
  assert.deepEqual(parseBackup('nope'), { ok: false, reason: 'not_json' });
  assert.deepEqual(parseBackup('{"app":"other"}'), { ok: false, reason: 'wrong_app' });
  assert.deepEqual(parseBackup('null'), { ok: false, reason: 'wrong_app' });
});

test('rejects invalid day key', () => {
  assert.equal(parseBackup(mutate((s) => { s.days['2026-13-01'] = s.days[D]; })).reason, 'invalid');
  assert.equal(parseBackup(mutate((s) => { s.days['2026-02-30'] = s.days[D]; })).reason, 'invalid');
});

test('rejects unknown category key in a day', () => {
  assert.equal(parseBackup(mutate((s) => { s.days[D].sports = s.days[D].health; })).reason, 'invalid');
});

test('rejects wrong field types', () => {
  assert.equal(parseBackup(mutate((s) => { s.days[D].health.done = 'yes'; })).reason, 'invalid');
  assert.equal(parseBackup(mutate((s) => { s.bestStreak = -1; })).reason, 'invalid');
  assert.equal(parseBackup(mutate((s) => { s.schemaVersion = 2; })).reason, 'invalid');
  assert.equal(parseBackup(mutate((s) => { s.bags.health = [1]; })).reason, 'invalid');
});

test('rejects note longer than 140 chars', () => {
  assert.equal(parseBackup(mutate((s) => { s.days[D].health.note = 'x'.repeat(141); })).reason, 'invalid');
});

test('rejects __proto__ key inside days', () => {
  const text = wrap(sample()).replace('"days":{', '"days":{"__proto__":{"polluted":1},');
  assert.equal(parseBackup(text).reason, 'invalid');
  assert.equal(({}).polluted, undefined);
});

test('__proto__ at state level cannot pollute', () => {
  const text = wrap(sample()).replace('"state":{', '"state":{"__proto__":{"polluted":1},');
  const r = parseBackup(text);
  assert.equal(r.ok ? r.state.polluted : undefined, undefined);
  assert.equal(({}).polluted, undefined);
});

test('accepts retired task ids with a valid pattern, rejects bad ones', () => {
  assert.equal(parseBackup(mutate((s) => { s.days[D].health.id = 'h98'; })).ok, true);
  assert.equal(parseBackup(mutate((s) => { s.days[D].health.id = 'k01'; })).reason, 'invalid');
  assert.equal(parseBackup(mutate((s) => { s.days[D].health.id = '<img>'; })).reason, 'invalid');
});

test('parseState returns a fresh object, not the input', () => {
  const s = sample();
  const out = parseState(s);
  assert.deepEqual(out, s);
  assert.notEqual(out, s);
  assert.notEqual(out.days[D], s.days[D]);
});

test('parseState returns null for garbage', () => {
  assert.equal(parseState(null), null);
  assert.equal(parseState([]), null);
  assert.equal(parseState({}), null);
});
