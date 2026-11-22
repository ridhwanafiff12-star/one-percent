/** App boot: state, persistence, routing, day rollover. */
import { dayKey } from '../date.js';
import { ensureDay, toggleDone, setNote, reroll } from '../day.js';
import { load, save } from '../store.js';
import { streak } from '../score.js';
import { renderToday } from './today.js';

const rng = Math.random;
const storage = (() => { try { return globalThis.localStorage; } catch { return null; } })();

const BANNERS = {
  corrupt: 'Your saved progress couldn’t be read, so Kaizen started fresh. A copy of the old data was kept. Import a backup in History to restore it.',
  unavailable: 'This browser isn’t saving your progress. Allow site storage for Kaizen, or progress will be lost when you close it.',
  quota: 'Your device storage is full, so today’s changes weren’t saved. Free up space or export a backup in History.',
};

const root = document.getElementById('app');
const banner = document.getElementById('banner');
const ui = { openWhy: new Set() };
const screens = { today: renderToday };

let todayKey = dayKey(new Date());
let { state, error } = load(storage, todayKey);

function showBanner(kind) {
  banner.hidden = !kind;
  banner.textContent = kind ? BANNERS[kind] : '';
}

function persist() {
  const r = save(storage, state);
  if (!r.ok) showBanner(r.error);
}

function commit(next) {
  if (next === state) return;
  const s = streak(next, todayKey);
  state = s > next.bestStreak ? { ...next, bestStreak: s } : next;
  persist();
  render();
}

export const actions = {
  toggleDone: (cat) => commit(toggleDone(state, todayKey, cat, new Date())),
  reroll: (cat) => commit(reroll(state, todayKey, cat, rng)),
  setNote: (cat, text) => commit(setNote(state, todayKey, cat, text)),
  replaceState: (next) => { state = ensureDay(next, todayKey, rng); persist(); render(); },
  getState: () => state,
};

function currentTab() {
  const t = location.hash.slice(1);
  return screens[t] ? t : 'today';
}

function render() {
  const tab = currentTab();
  for (const a of document.querySelectorAll('.tabs a')) {
    if (a.dataset.tab === tab) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  }
  screens[tab](root, { state, todayKey, now: new Date(), actions, ui });
}

function checkRollover() {
  const k = dayKey(new Date());
  if (k === todayKey) return;
  todayKey = k;
  ui.openWhy.clear();
  state = ensureDay(state, todayKey, rng);
  persist();
  render();
}

export function registerScreen(name, fn) { screens[name] = fn; }

state = ensureDay(state, todayKey, rng);
if (error) showBanner(error);
else persist();
render();

addEventListener('hashchange', () => { render(); root.focus({ preventScroll: true }); scrollTo(0, 0); });
document.addEventListener('visibilitychange', () => { if (!document.hidden) checkRollover(); });
addEventListener('focus', checkRollover);
setInterval(checkRollover, 60_000);
