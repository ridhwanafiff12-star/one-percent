import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FACTS, FACT_TOPICS, factForDay } from '../src/facts.js';
import { addDays } from '../src/date.js';

test('at least 50 facts with unique ids', () => {
  assert.ok(FACTS.length >= 50, String(FACTS.length));
  assert.equal(new Set(FACTS.map((f) => f.id)).size, FACTS.length);
});

test('every fact is short, sourced and in a known topic', () => {
  for (const f of FACTS) {
    assert.match(f.id, /^x\d{2}$/, f.id);
    assert.ok(FACT_TOPICS.includes(f.topic), `${f.id} topic ${f.topic}`);
    assert.ok(f.text.trim().length > 0 && f.text.length <= 220, `${f.id} length ${f.text.length}`);
    assert.ok(f.source.label.trim().length > 0, `${f.id} source`);
    if (f.source.url) assert.ok(f.source.url.startsWith('https://'), f.id);
  }
});

test('factForDay is stable for a given day', () => {
  assert.equal(factForDay('2026-11-22'), factForDay('2026-11-22'));
});

test('no fact repeats until every fact has been shown', () => {
  const seen = new Set();
  for (let i = 0; i < FACTS.length; i++) seen.add(factForDay(addDays('2026-11-22', i)).id);
  assert.equal(seen.size, FACTS.length);
});

test('works for dates before the reference day', () => {
  assert.ok(FACTS.includes(factForDay('2020-01-01')));
});
