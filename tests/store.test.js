import { test } from 'node:test';
import assert from 'node:assert/strict';
import { STORAGE_KEY, CORRUPT_KEY, SCHEMA_VERSION, load, save, migrate, requestPersistence } from '../src/store.js';
import { emptyState, ensureDay } from '../src/day.js';
import { seeded } from './helpers.js';

const D = '2026-11-22';
function fakeStorage(init = {}, { throwOnSet } = {}) {
  const m = new Map(Object.entries(init));
  return {
    map: m,
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => { if (throwOnSet) throw throwOnSet; m.set(k, String(v)); },
    removeItem: (k) => m.delete(k),
  };
}

test('constants', () => {
  assert.equal(STORAGE_KEY, 'kaizen.state');
  assert.equal(CORRUPT_KEY, 'kaizen.state.corrupt');
  assert.equal(SCHEMA_VERSION, 1);
});

test('nothing stored → empty state, no error', () => {
  assert.deepEqual(load(fakeStorage(), D), { state: emptyState(D), error: null });
});

test('save then load round-trips', () => {
  const st = fakeStorage();
  const s = ensureDay(emptyState(D), D, seeded(1));
  assert.deepEqual(save(st, s), { ok: true, error: null });
  assert.deepEqual(load(st, D), { state: s, error: null });
});

test('corrupt JSON → empty state, raw copy kept, original not overwritten', () => {
  const st = fakeStorage({ [STORAGE_KEY]: '{bad json' });
  const r = load(st, D);
  assert.equal(r.error, 'corrupt');
  assert.deepEqual(r.state, emptyState(D));
  assert.equal(st.map.get(CORRUPT_KEY), '{bad json');
  assert.equal(st.map.get(STORAGE_KEY), '{bad json');
});

test('structurally invalid data is corrupt', () => {
  assert.equal(load(fakeStorage({ [STORAGE_KEY]: '{"schemaVersion":1}' }), D).error, 'corrupt');
});

test('future schemaVersion is treated as corrupt (no downgrade)', () => {
  const s = { ...emptyState(D), schemaVersion: 2 };
  assert.equal(load(fakeStorage({ [STORAGE_KEY]: JSON.stringify(s) }), D).error, 'corrupt');
});

test('null storage → unavailable', () => {
  assert.deepEqual(load(null, D), { state: emptyState(D), error: 'unavailable' });
  assert.deepEqual(save(null, emptyState(D)), { ok: false, error: 'unavailable' });
});

test('getItem throwing → unavailable', () => {
  const st = { getItem: () => { throw new Error('SecurityError'); }, setItem() {} };
  assert.equal(load(st, D).error, 'unavailable');
});

test('quota exceeded on save', () => {
  const st = fakeStorage({}, { throwOnSet: new DOMException('full', 'QuotaExceededError') });
  assert.deepEqual(save(st, emptyState(D)), { ok: false, error: 'quota' });
});

test('migrate: v1 identity, future version throws', () => {
  const s = emptyState(D);
  assert.deepEqual(migrate(s), s);
  assert.throws(() => migrate({ ...s, schemaVersion: 2 }));
});

test('requestPersistence resolves to a boolean in all cases', async () => {
  assert.equal(await requestPersistence({ storage: { persist: async () => true } }), true);
  assert.equal(await requestPersistence({ storage: { persist: async () => { throw new Error('x'); } } }), false);
  assert.equal(await requestPersistence({}), false);
});
