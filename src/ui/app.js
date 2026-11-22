/** App boot: state, persistence, routing, day rollover. */
import { dayKey } from '../date.js';
import { ensureDay, toggleDone, setNote, reroll } from '../day.js';
import { load, save, requestPersistence } from '../store.js';
import { streak } from '../score.js';
import { exportState, backupFilename, parseBackup } from '../backup.js';
import { renderToday } from './today.js';
import { renderProgress } from './progress.js';
import { renderHistory } from './history.js';
import { getTask } from '../library/index.js';

const rng = Math.random;
const storage = (() => { try { return globalThis.localStorage; } catch { return null; } })();

const BANNERS = {
  corrupt: 'Your saved progress couldn’t be read, so Kaizen started fresh. A copy of the old data was kept. Import a backup in History to restore it.',
  unavailable: 'This browser isn’t saving your progress. Allow site storage for Kaizen, or progress will be lost when you close it.',
  quota: 'Your device storage is full, so today’s changes weren’t saved. Free up space or export a backup in History.',
  corrupt_unsaved: 'Your saved progress couldn’t be read, and there wasn’t room to keep a copy. To protect it, today’s changes are not being saved. Free up storage on your phone, then reopen Kaizen.',
};

const root = document.getElementById('app');
const banner = document.getElementById('banner');
const live = document.getElementById('live');
const ui = { openWhy: new Set(), historyMsg: '' };
const screens = { today: renderToday, progress: renderProgress, history: renderHistory };

let todayKey = dayKey(new Date());
let { state, error } = load(storage, todayKey);
// Never overwrite data we could neither read nor copy aside.
const writesBlocked = error === 'corrupt_unsaved';

function showBanner(kind) {
  banner.hidden = !kind;
  banner.dataset.kind = kind ?? '';
  banner.textContent = kind ? BANNERS[kind] : '';
}

function persist() {
  if (writesBlocked) return;
  const r = save(storage, state);
  if (!r.ok) showBanner(r.error);
  else if (banner.dataset.kind === 'quota') showBanner(null);
}

function commit(next, { rerender = true } = {}) {
  if (next === state) return;
  const s = streak(next, todayKey);
  state = s > next.bestStreak ? { ...next, bestStreak: s } : next;
  persist();
  if (rerender) render();
}

const announce = (msg) => { live.textContent = msg; };

export const actions = {
  toggleDone: (cat) => {
    commit(toggleDone(state, todayKey, cat, new Date()));
    const slot = state.days[todayKey][cat];
    announce(`${slot.done ? 'Marked done' : 'Marked not done'}: ${getTask(slot.id)?.title ?? 'Retired task'}`);
  },
  reroll: (cat) => commit(reroll(state, todayKey, cat, rng)),
  // The input already shows the text; re-rendering here would swallow a tap that caused the blur.
  setNote: (cat, text) => commit(setNote(state, todayKey, cat, text), { rerender: false }),
  exportBackup: () => {
    const now = new Date();
    const url = URL.createObjectURL(new Blob([exportState(state, now)], { type: 'application/json' }));
    const a = Object.assign(document.createElement('a'), { href: url, download: backupFilename(now) });
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    ui.historyMsg = `Backup exported as ${backupFilename(now)}.`;
    commit({ ...state, lastBackupAt: now.toISOString() });
  },
  importBackup: (text) => {
    const r = parseBackup(text);
    if (!r.ok) {
      ui.historyMsg = IMPORT_ERRORS[r.reason];
      render();
      return;
    }
    // nosemgrep: javascript-confirm — deliberate native confirmation before replacing all data
    if (!confirm('Replace all current progress with this backup? This can’t be undone.')) return;
    state = ensureDay(r.state, todayKey, rng);
    ui.historyMsg = 'Backup imported.';
    showBanner(null);
    persist();
    render();
  },
};

const IMPORT_ERRORS = {
  too_large: 'That file is too large to be a Kaizen backup (limit 1 MB). Nothing was changed.',
  not_json: 'That file isn’t a Kaizen backup. Choose the .json file you exported from Kaizen. Nothing was changed.',
  wrong_app: 'That file wasn’t exported from Kaizen. Nothing was changed.',
  invalid: 'That backup is damaged or from a newer version of Kaizen. Nothing was changed.',
};

function currentTab() {
  const t = location.hash.slice(1);
  return Object.hasOwn(screens, t) ? t : 'today';
}

function render() {
  const tab = currentTab();
  for (const a of document.querySelectorAll('.tabs a')) {
    if (a.dataset.tab === tab) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  }
  const focusKey = document.activeElement?.dataset?.focus;
  // nosemgrep: unsafe-dynamic-method — tab is restricted to own keys of screens by currentTab()
  screens[tab](root, { state, todayKey, now: new Date(), actions, ui });
  if (focusKey) root.querySelector(`[data-focus="${focusKey}"]`)?.focus({ preventScroll: true });
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

state = ensureDay(state, todayKey, rng);
if (error) showBanner(error);
else persist();
render();

addEventListener('hashchange', () => { ui.historyMsg = ''; render(); root.focus({ preventScroll: true }); scrollTo(0, 0); });
document.addEventListener('visibilitychange', () => { if (!document.hidden) checkRollover(); });
addEventListener('focus', checkRollover);
setInterval(checkRollover, 60_000);

requestPersistence();
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => { /* offline support unavailable; app still works */ });
}
