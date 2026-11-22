/** Today screen: the day's four tasks. */
import { el } from './dom.js';
import { categoryIcon } from './icons.js';
import { CATEGORIES, CATEGORY_LABELS, getTask } from '../library/index.js';
import { NOTE_MAX } from '../day.js';
import { daysBetween } from '../date.js';
import { factForDay } from '../facts.js';

const RETIRED = { title: 'Retired task', minutes: 0, why: 'This task is no longer in the library.', source: { label: 'Kaizen' } };

function heading(todayKey, state, now) {
  const weekday = now.toLocaleDateString('en-GB', { weekday: 'long' });
  const date = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' });
  const dayNo = Math.max(1, daysBetween(state.firstDay, todayKey) + 1);
  const done = CATEGORIES.filter((c) => state.days[todayKey][c].done).length;
  const status = done === 4 ? 'All four done. See you tomorrow.' : `${done} of 4 done`;
  return el('header', { class: 'page-head' },
    el('h1', { class: 'page-title' }, el('span', { class: 'weekday', text: weekday }), el('span', { class: 'date', text: date })),
    el('p', { class: 'day-no', text: `Day ${dayNo}` }),
    el('p', { class: 'lede', text: status }));
}

function sourceLine(source) {
  const p = el('p', { class: 'source' });
  if (source.url) {
    p.append(el('a', { text: source.label, attrs: { href: source.url, target: '_blank', rel: 'noopener noreferrer' } }));
  } else {
    p.textContent = source.label;
  }
  return p;
}

function entry(cat, slot, ctx) {
  const task = getTask(slot.id) ?? RETIRED;
  const { actions, ui } = ctx;
  const whyKey = `${cat}:${slot.id}`;
  const why = el('details', { class: 'why', attrs: { open: ui.openWhy.has(whyKey) },
    on: { toggle: (e) => (e.target.open ? ui.openWhy.add(whyKey) : ui.openWhy.delete(whyKey)) } },
  el('summary', { text: 'Why it works' }),
  el('p', { text: task.why }),
  sourceLine(task.source));

  const note = slot.done && el('input', {
    class: 'note',
    attrs: { type: 'text', maxlength: NOTE_MAX, placeholder: 'Add a note (optional)', 'aria-label': `Note for ${task.title}`, value: slot.note, 'data-focus': `note:${cat}` },
    on: { change: (e) => actions.setNote(cat, e.target.value) },
  });

  const swapLabel = slot.rerolled ? 'Swapped' : 'Swap task';
  return el('li', { class: `entry${slot.done ? ' is-done' : ''}`, attrs: { 'data-cat': cat } },
    el('button', {
      class: 'stamp',
      attrs: { type: 'button', 'aria-pressed': String(slot.done), 'aria-label': `Done: ${task.title}`, 'data-focus': `stamp:${cat}` },
      on: { click: () => actions.toggleDone(cat) },
    }),
    el('div', { class: 'entry-body' },
      el('p', { class: 'entry-meta' },
        el('span', { class: 'entry-cat' }, categoryIcon(cat), CATEGORY_LABELS[cat]),
        task.minutes ? el('span', { class: 'entry-min', text: `${task.minutes} min` }) : null),
      el('h2', { class: 'entry-title', text: task.title }),
      note,
      el('div', { class: 'entry-foot' },
        why,
        el('button', {
          class: 'swap', text: swapLabel,
          attrs: { type: 'button', disabled: slot.rerolled || slot.done, 'aria-label': `${swapLabel}: ${task.title}`, 'data-focus': `swap:${cat}` },
          on: { click: () => actions.reroll(cat) },
        }))));
}

function factCard(todayKey) {
  const fact = factForDay(todayKey);
  const source = sourceLine(fact.source);
  source.className = 'fact-source';
  return el('aside', { class: 'fact', attrs: { 'aria-label': 'Fact of the day' } },
    el('p', { class: 'fact-topic', text: `${fact.topic} fact` }),
    el('p', { class: 'fact-text', text: fact.text }),
    source);
}

/** @param {HTMLElement} root @param {{state: any, todayKey: string, now: Date, actions: any, ui: {openWhy: Set<string>}}} ctx */
export function renderToday(root, ctx) {
  const day = ctx.state.days[ctx.todayKey];
  root.replaceChildren(
    heading(ctx.todayKey, ctx.state, ctx.now),
    factCard(ctx.todayKey),
    el('ul', { class: 'entries' }, ...CATEGORIES.map((c) => entry(c, day[c], ctx))));
}
