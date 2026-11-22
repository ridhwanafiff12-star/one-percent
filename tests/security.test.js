import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const CSP = "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; form-action 'none'";

function walk(dir) {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

test('no HTML-injection or eval sinks in app code', () => {
  const files = [...walk(join(ROOT, 'src')), join(ROOT, 'index.html')];
  for (const f of files) {
    const src = readFileSync(f, 'utf8');
    assert.doesNotMatch(src, /innerHTML|outerHTML|insertAdjacentHTML|document\.write|\beval\(|new Function/, f);
  }
});

test('index.html sets the exact CSP', () => {
  const html = readFileSync(join(ROOT, 'index.html'), 'utf8');
  assert.ok(html.includes(`<meta http-equiv="Content-Security-Policy" content="${CSP}">`));
});

test('index.html has no inline scripts or style attributes', () => {
  const html = readFileSync(join(ROOT, 'index.html'), 'utf8');
  for (const tag of html.match(/<script\b[^>]*>/g) ?? []) assert.match(tag, /\bsrc=/, tag);
  assert.doesNotMatch(html, /\sstyle=/);
});
