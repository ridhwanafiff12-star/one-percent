import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { VERSION } from '../src/version.js';

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');

test('one version everywhere: package.json, service worker cache name', () => {
  assert.equal(JSON.parse(read('package.json')).version, VERSION);
  assert.ok(read('sw.js').includes(`const CACHE = 'kaizen-${VERSION}';`));
});

test('service worker revalidates instead of serving cache forever', () => {
  const sw = read('sw.js');
  assert.match(sw, /cache: 'reload'/);
  assert.match(sw, /stale-while-revalidate/i);
});
