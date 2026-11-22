// End-to-end smoke test. Usage: node e2e/smoke.mjs [baseUrl]
// Without a baseUrl it serves the repo on a free local port.
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import assert from 'node:assert/strict';

const { chromium } = createRequire(import.meta.url)('playwright');
const ROOT = new URL('..', import.meta.url).pathname;

let server;
let BASE = process.argv[2];
if (!BASE) {
  const port = 8100 + Math.floor(Math.random() * 800);
  server = spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1'], { cwd: ROOT, stdio: 'ignore' });
  BASE = `http://127.0.0.1:${port}/`;
  for (let i = 0; i < 50; i++) {
    try { await fetch(BASE); break; } catch { await new Promise((r) => setTimeout(r, 100)); }
  }
}

const browser = await chromium.launch();
const results = [];
const consoleErrors = [];

async function scenario(name, fn) {
  const context = await browser.newContext({ viewport: { width: 360, height: 740 } });
  const page = await context.newPage();
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(`${name}: ${m.text()}`); });
  page.on('pageerror', (e) => consoleErrors.push(`${name}: ${e.message}`));
  page.on('dialog', (d) => { if (d.type() === 'alert') consoleErrors.push(`${name}: unexpected alert ${d.message()}`); d.accept(); });
  page.setDefaultTimeout(10_000);
  try {
    await Promise.race([
      fn(page, context),
      new Promise((_, rej) => setTimeout(() => rej(new Error('scenario timed out after 30s')), 30_000)),
    ]);
    results.push(['ok', name]);
  } catch (e) {
    results.push(['FAIL', name, e.message]);
  } finally {
    await context.close();
  }
}

const titles = (page) => page.locator('.entry-title').allTextContents();

await scenario('four cards; completing all four shows ×1.01 and a full dot', async (page) => {
  await page.goto(BASE);
  assert.equal(await page.locator('.entry').count(), 4);
  for (let i = 0; i < 4; i++) await page.locator('.stamp').nth(i).click();
  assert.equal(await page.locator('.lede').textContent(), 'All four done. See you tomorrow.');
  await page.click('a[data-tab="progress"]');
  assert.equal(await page.locator('.score-num').textContent(), '×1.01');
  assert.match(await page.locator('.heatmap circle').last().getAttribute('class'), /level-4/);
});

await scenario('swap changes the task once, then is disabled', async (page) => {
  await page.goto(BASE);
  const before = (await titles(page))[1];
  await page.locator('.swap').nth(1).click();
  const after = (await titles(page))[1];
  assert.notEqual(after, before);
  assert.equal(await page.locator('.swap').nth(1).isDisabled(), true);
});

await scenario('notes render HTML as plain text', async (page) => {
  await page.goto(BASE);
  await page.locator('.stamp').first().click();
  const payload = '<img src=x onerror=alert(1)>';
  await page.locator('.note').fill(payload);
  await page.locator('.note').press('Tab');
  await page.click('a[data-tab="history"]');
  assert.equal(await page.locator('.h-note').first().textContent(), payload);
  assert.equal(await page.locator('img[src="x"]').count(), 0);
});

await scenario('progress persists across reload', async (page) => {
  await page.goto(BASE);
  const t = await titles(page);
  await page.locator('.stamp').nth(2).click();
  await page.reload();
  assert.deepEqual(await titles(page), t);
  assert.equal(await page.locator('.stamp').nth(2).getAttribute('aria-pressed'), 'true');
});

await scenario('a new day starts at midnight while the app is open', async (page) => {
  await page.clock.install({ time: new Date(2026, 10, 22, 23, 59, 0) });
  await page.goto(BASE);
  assert.match(await page.locator('.date').textContent(), /22 November/);
  await page.locator('.stamp').first().click();
  await page.clock.runFor(2 * 60_000);
  assert.match(await page.locator('.date').textContent(), /23 November/);
  assert.equal(await page.locator('.stamp[aria-pressed="true"]').count(), 0);
  await page.click('a[data-tab="history"]');
  const dates = await page.locator('.h-date > span:first-child').allTextContents();
  assert.deepEqual(dates, ['Monday 23 November', 'Sunday 22 November']);
});

await scenario('importing a broken file shows an error and changes nothing', async (page) => {
  await page.goto(BASE);
  await page.locator('.stamp').first().click();
  const before = await page.evaluate(() => localStorage.getItem('kaizen.state'));
  await page.click('a[data-tab="history"]');
  const dir = mkdtempSync(join(tmpdir(), 'kaizen-'));
  const bad = join(dir, 'bad.json');
  writeFileSync(bad, '{not json');
  const [chooser] = await Promise.all([page.waitForEvent('filechooser'), page.click('text=Import backup')]);
  await chooser.setFiles(bad);
  await page.locator('.status').filter({ hasText: 'Nothing was changed' }).waitFor();
  assert.equal(await page.evaluate(() => localStorage.getItem('kaizen.state')), before);
});

await scenario('export then import restores the same progress', async (page) => {
  await page.goto(BASE);
  await page.locator('.stamp').nth(3).click();
  const before = await titles(page);
  await page.click('a[data-tab="history"]');
  const [download] = await Promise.all([page.waitForEvent('download'), page.click('text=Export backup')]);
  assert.match(download.suggestedFilename(), /^kaizen-backup-\d{4}-\d{2}-\d{2}\.json$/);
  const file = await download.path();
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.click('a[data-tab="history"]');
  const [chooser] = await Promise.all([page.waitForEvent('filechooser'), page.click('text=Import backup')]);
  await chooser.setFiles(file);
  await page.locator('.status').filter({ hasText: 'Backup imported.' }).waitFor();
  await page.click('a[data-tab="today"]');
  assert.deepEqual(await titles(page), before);
});

await scenario('works offline after first visit', async (page, context) => {
  await page.goto(BASE);
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await page.evaluate(() => navigator.serviceWorker.ready);
  await context.setOffline(true);
  await page.reload();
  assert.equal(await page.locator('.entry').count(), 4);
});

await scenario('manifest is valid and installable', async (page) => {
  const res = await page.goto(new URL('manifest.webmanifest', BASE).href);
  const m = await res.json();
  assert.equal(m.name, 'Kaizen');
  assert.equal(m.display, 'standalone');
  assert.ok(m.icons.some((i) => i.sizes === '512x512' && i.purpose === 'maskable'));
  for (const i of m.icons) assert.equal((await page.request.get(new URL(i.src, BASE).href)).status(), 200);
});

await browser.close();
server?.kill();

for (const r of results) console.log(r.join(' — '));
if (consoleErrors.length) console.log('console errors:\n  ' + consoleErrors.join('\n  '));
const failed = results.filter((r) => r[0] === 'FAIL').length + (consoleErrors.length ? 1 : 0);
console.log(failed ? `FAILED (${failed})` : `PASSED ${results.length}/${results.length}, 0 console errors`);
process.exit(failed ? 1 : 0);
