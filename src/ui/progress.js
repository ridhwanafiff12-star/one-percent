/** Progress screen: compound multiplier, curve, heatmap, streak. */
import { el, svg } from './dom.js';
import { scoreSeries, streak, heatmap, formatMultiplier } from '../score.js';

const fmtDate = (key, opts) => new Date(`${key}T12:00:00`).toLocaleDateString('en-GB', opts);

function curve(series) {
  const W = 320, H = 150, PAD = 6;
  const ideal = series.map((_, i) => 1.01 ** (i + 1));
  const max = Math.max(1.01, ...ideal);
  const x = (i) => PAD + (series.length === 1 ? (W - 2 * PAD) : (i / (series.length - 1)) * (W - 2 * PAD));
  const y = (m) => H - PAD - ((m - 1) / (max - 1)) * (H - 2 * PAD);
  const pts = (vals) => vals.map((m, i) => `${x(i).toFixed(1)},${y(m).toFixed(1)}`).join(' ');
  const you = series.map((p) => p.multiplier);
  const start = series.length === 1 ? [`${PAD},${y(1)}`] : [];
  return svg('svg', { class: 'curve', viewBox: `0 0 ${W} ${H}`, role: 'img',
    'aria-label': `Growth curve over ${series.length} days. Ideal is ${formatMultiplier(ideal.at(-1))}, you are at ${formatMultiplier(you.at(-1))}.` },
  svg('line', { class: 'curve-base', x1: PAD, x2: W - PAD, y1: y(1), y2: y(1) }),
  svg('polyline', { class: 'curve-ideal', points: [...start, pts(ideal)].join(' ') }),
  svg('polyline', { class: 'curve-you', points: [...start, pts(you)].join(' ') }));
}

function dots(cells) {
  const S = 22, R = 7.5;
  const g = svg('svg', { class: 'heatmap', viewBox: `0 0 ${12 * S} ${7 * S}`, role: 'img', 'aria-label': 'Tasks done per day, last 12 weeks' });
  cells.forEach((c, i) => {
    const col = Math.floor(i / 7), row = i % 7;
    const circle = svg('circle', { class: `dot level-${c.level}`, cx: col * S + S / 2, cy: row * S + S / 2, r: c.level ? 2.5 + c.level * (R - 2.5) / 4 : 1.6, 'aria-label': `${c.key}: ${c.level} of 4` });
    // nosemgrep: missing-template-string-indicator — false positive: object literal inside ${}
    circle.append(svg('title', {}, document.createTextNode(`${fmtDate(c.key, { day: 'numeric', month: 'short' })}: ${c.level} of 4`)));
    g.append(circle);
  });
  return g;
}

function streakText(cur, best) {
  if (cur === 0) return 'No streak yet. Finish one task today to start one.';
  const days = `${cur} ${cur === 1 ? 'day' : 'days'} in a row.`;
  return best > cur ? `${days} Your best is ${best}.` : `${days} That’s your best yet.`;
}

export function renderProgress(root, { state, todayKey }) {
  const series = scoreSeries(state, todayKey);
  const m = series.at(-1)?.multiplier ?? 1;
  const since = fmtDate(state.firstDay, { day: 'numeric', month: 'long', year: 'numeric' });
  const cur = streak(state, todayKey);
  root.replaceChildren(
    el('header', { class: 'score' },
      el('h1', { class: 'score-num', text: formatMultiplier(m) }),
      el('p', { class: 'score-caption', text: `better than you were on ${since}.` })),
    el('section', { class: 'panel', attrs: { 'aria-labelledby': 'curve-h' } },
      el('h2', { class: 'panel-title', text: 'Compounding', attrs: { id: 'curve-h' } }),
      curve(series),
      el('p', { class: 'legend' },
        el('span', { class: 'key key-you', text: 'You' }),
        el('span', { class: 'key key-ideal', text: `Every day at 4 of 4: ${formatMultiplier(1.01 ** series.length)}` }))),
    el('section', { class: 'panel', attrs: { 'aria-labelledby': 'dots-h' } },
      el('h2', { class: 'panel-title', text: 'Last 12 weeks', attrs: { id: 'dots-h' } }),
      dots(heatmap(state, todayKey)),
      el('p', { class: 'streak', text: streakText(cur, state.bestStreak) })));
}
