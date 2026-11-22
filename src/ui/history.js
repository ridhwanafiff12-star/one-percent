/** History & settings: past days with notes, backup export/import. */
import { el } from './dom.js';
import { CATEGORIES, CATEGORY_LABELS, getTask } from '../library/index.js';
import { needsBackupReminder } from '../backup.js';
import { VERSION } from '../version.js';

const fmtDate = (key) => new Date(`${key}T12:00:00`).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });

function dayEntry(key, day) {
  const done = CATEGORIES.filter((c) => day[c].done).length;
  return el('li', { class: 'h-day' },
    el('h3', { class: 'h-date' }, el('span', { text: fmtDate(key) }), el('span', { class: 'h-count', text: `${done} of 4` })),
    el('ul', { class: 'h-tasks' }, ...CATEGORIES.map((c) => {
      const s = day[c];
      return el('li', { class: `h-task${s.done ? ' is-done' : ''}`, attrs: { 'data-cat': c } },
        el('span', { class: 'h-mark', text: s.done ? '✓' : '–', attrs: { 'aria-hidden': 'true' } }),
        el('span', { class: 'h-text' },
          el('span', { class: 'visually-hidden', text: `${CATEGORY_LABELS[c]}, ${s.done ? 'done' : 'not done'}: ` }),
          getTask(s.id)?.title ?? 'Retired task',
          s.note ? el('span', { class: 'h-note', text: s.note }) : null));
    })));
}

export function renderHistory(root, { state, actions, ui }) {
  const keys = Object.keys(state.days).sort().reverse();
  const fileInput = el('input', {
    class: 'visually-hidden',
    attrs: { type: 'file', accept: 'application/json,.json', tabindex: '-1', 'aria-hidden': 'true' },
    on: { change: async (e) => {
      const file = e.target.files?.[0];
      e.target.value = '';
      if (file) actions.importBackup(await file.text());
    } },
  });

  root.replaceChildren(
    el('header', { class: 'page-head' }, el('h1', { class: 'page-title' }, el('span', { class: 'date', text: 'History' }))),
    needsBackupReminder(state, new Date()) && el('p', { class: 'banner inline', text: 'You haven’t exported a backup in a while. Export one now so you don’t lose your progress.' }),
    el('ol', { class: 'h-days', attrs: { 'aria-label': 'Past days, newest first' } }, ...keys.map((k) => dayEntry(k, state.days[k]))),
    el('section', { class: 'settings', attrs: { 'aria-labelledby': 'backup-h' } },
      el('h2', { class: 'panel-title', text: 'Backup', attrs: { id: 'backup-h' } }),
      el('p', { text: 'Your progress lives only on this device. Export a backup file to keep it safe or move it to a new phone. Backups include your notes, so keep them private.' }),
      el('div', { class: 'actions' },
        el('button', { class: 'btn', text: 'Export backup', attrs: { type: 'button' }, on: { click: () => actions.exportBackup() } }),
        el('button', { class: 'btn', text: 'Import backup', attrs: { type: 'button' }, on: { click: () => fileInput.click() } }),
        fileInput),
      el('p', { class: 'status', text: ui.historyMsg ?? '', attrs: { role: 'status' } }),
      el('p', { class: 'version', text: `Kaizen ${VERSION}` })));
}
