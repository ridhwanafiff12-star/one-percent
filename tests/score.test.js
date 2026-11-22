import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dayFraction, scoreSeries, currentMultiplier, streak, heatmap, formatMultiplier } from '../src/score.js';

const slot = (done) => ({ id: 'h01', done, doneAt: null, note: '', rerolled: false });
const day = (n) => ({ health: slot(n > 0), ibadah: slot(n > 1), knowledge: slot(n > 2), finance: slot(n > 3) });
const state = (firstDay, days) => ({ schemaVersion: 1, firstDay, bags: {}, bestStreak: 0, lastBackupAt: null, days });

test('dayFraction counts done slots out of 4', () => {
  assert.equal(dayFraction(undefined), 0);
  assert.equal(dayFraction(day(0)), 0);
  assert.equal(dayFraction(day(3)), 0.75);
  assert.equal(dayFraction(day(4)), 1);
});

test('three full days compound to 1.01^3', () => {
  const s = state('2026-11-20', { '2026-11-20': day(4), '2026-11-21': day(4), '2026-11-22': day(4) });
  assert.ok(Math.abs(currentMultiplier(s, '2026-11-22') - 1.01 ** 3) < 1e-12);
});

test('partial days count proportionally, missed days are ×1', () => {
  const s = state('2026-11-19', { '2026-11-19': day(4), '2026-11-20': day(2), '2026-11-22': day(4) });
  assert.ok(Math.abs(currentMultiplier(s, '2026-11-22') - 1.01 * 1.005 * 1 * 1.01) < 1e-12);
});

test('scoreSeries has one point per calendar day from firstDay to today', () => {
  const s = state('2026-11-20', { '2026-11-20': day(4) });
  const series = scoreSeries(s, '2026-11-22');
  assert.deepEqual(series.map((p) => p.key), ['2026-11-20', '2026-11-21', '2026-11-22']);
  assert.ok(Math.abs(series[0].multiplier - 1.01) < 1e-12);
  assert.ok(Math.abs(series[2].multiplier - 1.01) < 1e-12);
});

test('streak: yesterday + today done = 2', () => {
  assert.equal(streak(state('2026-11-21', { '2026-11-21': day(1), '2026-11-22': day(4) }), '2026-11-22'), 2);
});

test('streak: yesterday done, today not yet = 1', () => {
  assert.equal(streak(state('2026-11-21', { '2026-11-21': day(1), '2026-11-22': day(0) }), '2026-11-22'), 1);
});

test('streak: gap yesterday, done today = 1', () => {
  assert.equal(streak(state('2026-11-20', { '2026-11-20': day(4), '2026-11-22': day(1) }), '2026-11-22'), 1);
});

test('streak: gap yesterday and nothing today = 0', () => {
  assert.equal(streak(state('2026-11-20', { '2026-11-20': day(4) }), '2026-11-22'), 0);
});

test('days after today (clock moved back) are ignored', () => {
  const s = state('2026-11-22', { '2026-11-22': day(4), '2026-11-30': day(4) });
  assert.ok(Math.abs(currentMultiplier(s, '2026-11-22') - 1.01) < 1e-12);
  assert.equal(streak(s, '2026-11-22'), 1);
});

test('firstDay after today yields ×1 and no throw', () => {
  const s = state('2026-11-30', {});
  assert.equal(currentMultiplier(s, '2026-11-22'), 1);
});

test('heatmap has 84 cells ending today with level = tasks done', () => {
  const h = heatmap(state('2026-11-22', { '2026-11-22': day(3) }), '2026-11-22');
  assert.equal(h.length, 84);
  assert.deepEqual(h.at(-1), { key: '2026-11-22', level: 3 });
  assert.equal(h[0].level, 0);
});

test('formatMultiplier shows × and 2 decimals', () => {
  assert.equal(formatMultiplier(1.2649), '×1.26');
  assert.equal(formatMultiplier(1), '×1.00');
});

test('scoreSeries always has at least today when firstDay is in the future', () => {
  const s = state('2026-11-30', {});
  assert.deepEqual(scoreSeries(s, '2026-11-22'), [{ key: '2026-11-22', multiplier: 1 }]);
});
