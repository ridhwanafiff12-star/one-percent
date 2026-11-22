/** Backup export and strictly validated import. parseState is also used by the store. */
import { addDays, dayKey } from './date.js';
import { NOTE_MAX } from './day.js';
import { CATEGORIES as CATS } from './library/index.js';

export const MAX_IMPORT_CHARS = 1_000_000;

const ID_RE = { health: /^h\d{2}$/, ibadah: /^i\d{2}$/, knowledge: /^k\d{2}$/, finance: /^f\d{2}$/ };

class Invalid extends Error {}
const fail = () => { throw new Invalid(); };
const check = (cond) => { if (!cond) fail(); };

const isPlain = (v) => v !== null && typeof v === 'object' && !Array.isArray(v) && Object.getPrototypeOf(v) === Object.prototype;
const hasExactKeys = (o, keys) => {
  const own = Object.keys(o);
  return own.length === keys.length && keys.every((k) => Object.hasOwn(o, k));
};
const isDayKey = (k) => typeof k === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(k) && addDays(k, 0) === k;
const isIso = (s) => typeof s === 'string' && s.length <= 30 && !Number.isNaN(Date.parse(s));
const isTaskId = (id, cat) => typeof id === 'string' && ID_RE[cat].test(id);

function parseSlot(o, cat) {
  check(isPlain(o) && hasExactKeys(o, ['id', 'done', 'doneAt', 'note', 'rerolled']));
  check(isTaskId(o.id, cat));
  check(typeof o.done === 'boolean' && typeof o.rerolled === 'boolean');
  check(o.doneAt === null || isIso(o.doneAt));
  check(typeof o.note === 'string' && o.note.length <= NOTE_MAX);
  return { id: o.id, done: o.done, doneAt: o.doneAt, note: o.note, rerolled: o.rerolled };
}

function parseDay(o) {
  check(isPlain(o) && hasExactKeys(o, CATS));
  return Object.fromEntries(CATS.map((c) => [c, parseSlot(o[c], c)]));
}

/**
 * Validate and rebuild a State field by field. Never returns the input object.
 * @param {unknown} obj
 * @returns {import('./day.js').State | null}
 */
export function parseState(obj) {
  try {
    check(isPlain(obj));
    const o = /** @type {any} */ (obj);
    check(hasExactKeys(o, ['schemaVersion', 'firstDay', 'bags', 'bestStreak', 'lastBackupAt', 'days']));
    check(o.schemaVersion === 1);
    check(isDayKey(o.firstDay));
    check(Number.isInteger(o.bestStreak) && o.bestStreak >= 0);
    check(o.lastBackupAt === null || isIso(o.lastBackupAt));
    check(isPlain(o.bags) && hasExactKeys(o.bags, CATS));
    const bags = Object.fromEntries(CATS.map((c) => {
      check(Array.isArray(o.bags[c]) && o.bags[c].every((id) => isTaskId(id, c)));
      return [c, [...o.bags[c]]];
    }));
    check(isPlain(o.days));
    const days = Object.fromEntries(Object.keys(o.days).map((k) => {
      check(isDayKey(k));
      return [k, parseDay(o.days[k])];
    }));
    return { schemaVersion: 1, firstDay: o.firstDay, bags, bestStreak: o.bestStreak, lastBackupAt: o.lastBackupAt, days };
  } catch (e) {
    if (e instanceof Invalid) return null;
    throw e;
  }
}

/** @param {import('./day.js').State} state @param {Date} now */
export function exportState(state, now) {
  return JSON.stringify({ app: 'kaizen', exportedAt: now.toISOString(), state }, null, 2);
}

export const backupFilename = (now) => `kaizen-backup-${dayKey(now)}.json`;

/**
 * @param {string} text
 * @returns {{ok: true, state: import('./day.js').State} | {ok: false, reason: 'too_large'|'not_json'|'wrong_app'|'invalid'}}
 */
export function parseBackup(text) {
  if (typeof text !== 'string' || text.length > MAX_IMPORT_CHARS) return { ok: false, reason: 'too_large' };
  let raw;
  try { raw = JSON.parse(text); } catch { return { ok: false, reason: 'not_json' }; }
  if (!isPlain(raw) || raw.app !== 'kaizen') return { ok: false, reason: 'wrong_app' };
  const state = parseState(raw.state);
  return state ? { ok: true, state } : { ok: false, reason: 'invalid' };
}

const REMIND_AFTER_MS = 30 * 86_400_000;
const MIN_DAYS_FOR_REMINDER = 7;

/** Nudge to export when there is a week+ of data and no backup in the last 30 days. */
export function needsBackupReminder(state, now) {
  if (Object.keys(state.days).length < MIN_DAYS_FOR_REMINDER) return false;
  if (state.lastBackupAt === null) return true;
  return now.getTime() - Date.parse(state.lastBackupAt) > REMIND_AFTER_MS;
}
