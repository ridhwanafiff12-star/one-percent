/** Scoring: compounding multiplier, streak and heatmap. Pure functions. */
import { addDays, daysBetween } from './date.js';

const SLOTS = ['health', 'ibadah', 'knowledge', 'finance'];

/** @param {import('./day.js').Day|undefined} day */
const doneCount = (day) => (day ? SLOTS.filter((c) => day[c]?.done).length : 0);

/** @returns {number} 0, .25, .5, .75 or 1 */
export const dayFraction = (day) => doneCount(day) / 4;

/** @returns {{key: string, multiplier: number}[]} */
export function scoreSeries(state, todayKey) {
  const n = daysBetween(state.firstDay, todayKey);
  const out = [];
  let m = 1;
  for (let i = 0; i <= n; i++) {
    const key = addDays(state.firstDay, i);
    m *= 1 + 0.01 * dayFraction(state.days[key]);
    out.push({ key, multiplier: m });
  }
  return out;
}

export function currentMultiplier(state, todayKey) {
  return scoreSeries(state, todayKey).at(-1)?.multiplier ?? 1;
}

/** Consecutive days with ≥1 task done, ending today (or yesterday if today has nothing yet). */
export function streak(state, todayKey) {
  let key = doneCount(state.days[todayKey]) > 0 ? todayKey : addDays(todayKey, -1);
  let n = 0;
  while (doneCount(state.days[key]) > 0) { n++; key = addDays(key, -1); }
  return n;
}

/** @returns {{key: string, level: 0|1|2|3|4}[]} weeks*7 cells ending on todayKey */
export function heatmap(state, todayKey, weeks = 12) {
  const len = weeks * 7;
  return Array.from({ length: len }, (_, i) => {
    const key = addDays(todayKey, i - len + 1);
    return { key, level: /** @type {0|1|2|3|4} */ (doneCount(state.days[key])) };
  });
}

export const formatMultiplier = (m) => `×${m.toFixed(2)}`;
