/** localStorage persistence ("database"). Never silently destroys data it cannot read. */
import { emptyState } from './day.js';
import { parseState } from './backup.js';

export const STORAGE_KEY = 'kaizen.state';
export const CORRUPT_KEY = 'kaizen.state.corrupt';
export const SCHEMA_VERSION = 1;

/** Upgrade raw stored data to the current schema. v1 is identity. */
export function migrate(raw) {
  if (raw?.schemaVersion !== SCHEMA_VERSION) throw new Error(`unsupported schemaVersion ${raw?.schemaVersion}`);
  return raw;
}

/**
 * @param {Storage|null} storage
 * @param {string} todayKey
 * @returns {{state: import('./day.js').State, error: null|'corrupt'|'corrupt_unsaved'|'unavailable'}}
 * 'corrupt_unsaved': the unreadable data could not be copied aside — callers must not overwrite it.
 */
export function load(storage, todayKey) {
  let raw;
  try {
    if (!storage) throw new Error('no storage');
    raw = storage.getItem(STORAGE_KEY);
  } catch {
    return { state: emptyState(todayKey), error: 'unavailable' };
  }
  if (raw === null) return { state: emptyState(todayKey), error: null };
  let state = null;
  try { state = parseState(migrate(JSON.parse(raw))); } catch { state = null; }
  if (state) return { state, error: null };
  try {
    storage.setItem(CORRUPT_KEY, raw);
  } catch {
    return { state: emptyState(todayKey), error: 'corrupt_unsaved' };
  }
  return { state: emptyState(todayKey), error: 'corrupt' };
}

/** @returns {{ok: boolean, error: null|'quota'|'unavailable'}} */
export function save(storage, state) {
  if (!storage) return { ok: false, error: 'unavailable' };
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(state));
    return { ok: true, error: null };
  } catch (e) {
    return { ok: false, error: e?.name === 'QuotaExceededError' ? 'quota' : 'unavailable' };
  }
}

/** Ask the browser not to evict our storage. Resolves false when unsupported or refused. */
export async function requestPersistence(nav = globalThis.navigator) {
  try {
    return Boolean(await nav?.storage?.persist?.());
  } catch {
    return false;
  }
}
