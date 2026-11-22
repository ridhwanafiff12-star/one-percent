/** Daily state transitions. All functions are pure: they return a new State. */
import { draw, reconcileBag } from './bag.js';
import { CATEGORIES, LIBRARY } from './library/index.js';

/** @typedef {import('./library/index.js').Category} Category */
/** @typedef {{id:string, done:boolean, doneAt:string|null, note:string, rerolled:boolean}} Slot */
/** @typedef {Record<Category, Slot>} Day */
/** @typedef {{schemaVersion:1, firstDay:string, bags:Record<Category,string[]>, bestStreak:number, lastBackupAt:string|null, days:Record<string,Day>}} State */

export const NOTE_MAX = 140;

const idsOf = (cat) => LIBRARY[cat].map((t) => t.id);

/** @param {string} todayKey @returns {State} */
export function emptyState(todayKey) {
  return {
    schemaVersion: 1,
    firstDay: todayKey,
    bags: Object.fromEntries(CATEGORIES.map((c) => [c, []])),
    bestStreak: 0,
    lastBackupAt: null,
    days: {},
  };
}

function drawFor(state, cat, rng, exclude) {
  const all = idsOf(cat);
  return draw(reconcileBag(state.bags[cat] ?? [], all), all, rng, exclude);
}

/** @param {State} state @param {string} key @param {() => number} rng @returns {State} */
export function ensureDay(state, key, rng) {
  if (state.days[key]) return state;
  const bags = { ...state.bags };
  const day = {};
  for (const cat of CATEGORIES) {
    const { id, bag } = drawFor({ bags }, cat, rng);
    bags[cat] = bag;
    day[cat] = { id, done: false, doneAt: null, note: '', rerolled: false };
  }
  return { ...state, bags, days: { ...state.days, [key]: day } };
}

function updateSlot(state, key, cat, patch) {
  const day = state.days[key];
  return { ...state, days: { ...state.days, [key]: { ...day, [cat]: { ...day[cat], ...patch } } } };
}

/** @returns {State} */
export function toggleDone(state, key, cat, now) {
  const done = !state.days[key][cat].done;
  return updateSlot(state, key, cat, { done, doneAt: done ? now.toISOString() : null });
}

/** @returns {State} */
export function setNote(state, key, cat, text) {
  return updateSlot(state, key, cat, { note: String(text).trim().slice(0, NOTE_MAX) });
}

/** @returns {State} unchanged (same object) if already rerolled or done */
export function reroll(state, key, cat, rng) {
  const slot = state.days[key][cat];
  if (slot.rerolled || slot.done) return state;
  const { id, bag } = drawFor(state, cat, rng, slot.id);
  const next = updateSlot(state, key, cat, { id, rerolled: true });
  return { ...next, bags: { ...next.bags, [cat]: [slot.id, ...bag] } };
}
