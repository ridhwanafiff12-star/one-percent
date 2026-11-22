/** Local calendar-day helpers. Day keys are 'YYYY-MM-DD'; the day starts at 00:00 local time. */

const pad = (n) => String(n).padStart(2, '0');
const MS_PER_DAY = 86_400_000;

/** @param {Date} d @returns {string} */
export function dayKey(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** @param {string} key @returns {number} UTC ms at midnight of that calendar date */
function toUtc(key) {
  const [y, m, d] = key.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
}

/** @param {string} key @param {number} n @returns {string} */
export function addDays(key, n) {
  const d = new Date(toUtc(key) + n * MS_PER_DAY);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

/** Whole days from a to b (b − a). */
export function daysBetween(a, b) {
  return Math.round((toUtc(b) - toUtc(a)) / MS_PER_DAY);
}
