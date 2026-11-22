import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dayKey, addDays, daysBetween } from '../src/date.js';

test('dayKey uses local date with midnight boundary', () => {
  assert.equal(dayKey(new Date(2026, 10, 22, 23, 59)), '2026-11-22');
  assert.equal(dayKey(new Date(2026, 10, 23, 0, 0)), '2026-11-23');
});

test('addDays crosses year and leap-day boundaries', () => {
  assert.equal(addDays('2026-12-31', 1), '2027-01-01');
  assert.equal(addDays('2028-03-01', -1), '2028-02-29');
});

test('daysBetween counts whole days, DST-safe', () => {
  assert.equal(daysBetween('2026-11-22', '2026-12-01'), 9);
  assert.equal(daysBetween('2026-03-28', '2026-03-30'), 2);
});
