import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const walk = (d) => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]));

test('service worker precaches every app file', () => {
  const sw = readFileSync(join(ROOT, 'sw.js'), 'utf8');
  const listed = new Set([...sw.matchAll(/'([^']+)'/g)].map((m) => m[1]));
  const needed = [
    'index.html', 'styles.css', 'manifest.webmanifest',
    ...['src', 'fonts', 'icons'].flatMap((d) => walk(join(ROOT, d)).map((f) => relative(ROOT, f))).filter((f) => !f.endsWith('.txt') && f !== 'src/library/validate.js' /* dev-only, used by tests */),
  ];
  for (const f of needed) assert.ok(listed.has(f), `sw.js is missing ${f}`);
});
