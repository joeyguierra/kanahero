// The plane test, headless. Run: npm run build && node scripts/e2e-offline.mjs
//
// Everything after step 1 happens with the network switched off at the
// browser, so a pass means the service worker's precache is carrying the app:
//   1. The SW installs and takes control of the page
//   2. Offline cold reload: Today renders from cache, word list and all
//   3. Offline: a whole session — study trials draw, the word reveals over
//      the ink, the session finishes and the schedule and ledger are written.
//      The word list and every character's stroke file came from the precache.
//   4. Offline reload: the state is still there
//   5. Only one cache exists, and it is the current content hash
//   6. A URL the host does not serve costs that URL, not the whole install

import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";
import { big, ledger, serveOut } from "./e2e-lib.mjs";

const generated = await readFile(path.join(import.meta.dirname, "..", "out", "sw.js"), "utf8");
const cacheName = generated.match(/const CACHE = "(kanahero-[0-9a-f]+)"/)?.[1];
assert.ok(cacheName, "out/sw.js carries a content-hash cache name — run the build first");

const { url: URL, kill } = await serveOut(3214);
const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  reducedMotion: "reduce",
});
const page = await context.newPage();
page.setDefaultTimeout(60000);

// --- 1. install and take control ---
await page.goto(URL);
await page.waitForSelector(".v7Counts");
// `ready` resolves once the SW is activated, which is after cache.addAll has
// pulled the entire export down
await page.evaluate(() => navigator.serviceWorker.ready);
await page.waitForFunction(() => navigator.serviceWorker.controller !== null);
const cached = await page.evaluate(async (name) => (await (await caches.open(name)).keys()).length, cacheName);
assert.ok(cached > 200, `the whole export is precached, got ${cached} entries`);
console.log(`1. service worker installed and controlling: ${cached} URLs in ${cacheName}`);

// --- 2. offline cold reload ---
await context.setOffline(true);
await page.reload();
await page.waitForSelector(".v7Counts");
assert.equal(await big(page), "0 due · 10 new", "the word list loads offline");
console.log("2. offline: the shell boots and Today renders with its counts");

// --- 3. offline: a whole session ---
await page.click("button:has-text('DEAL')");
await page.waitForSelector(".v7TrialForm svg path");
let widest = 0;
for (let i = 0; i < 10; i++) {
  await page.waitForSelector(".v7Prompt");
  await page.waitForSelector("canvas.ink");
  const box = await page.locator("canvas.ink").boundingBox();
  await page.mouse.move(box.x + 80, box.y + 80);
  await page.mouse.down();
  await page.mouse.move(box.x + 200, box.y + 200, { steps: 4 });
  await page.mouse.up();
  await page.click("button:has-text('DONE')");
  await page.waitForSelector(".wordRevealCell svg path");
  widest = Math.max(widest, await page.locator(".wordRevealCell svg").count());
  await page.click("button:has-text('GOT IT')");
}
assert.ok(widest >= 3, `the whole word reveals one cell per character offline, got ${widest}`);
await page.waitForSelector(".v7Done");
assert.equal(await page.locator(".v7DoneRow").count(), 10);
const rows = await ledger(page);
assert.equal(rows.filter((r) => r.type === "item").length, 10, "the ledger is written offline");
await page.click("button:has-text('CLOSE')");
console.log("3. offline: a session deals, draws its strokes, finishes and is logged");

// --- 4. offline reload: still there ---
await page.reload();
await page.waitForSelector(".v7Counts");
assert.match(await page.locator(".v7Next").innerText(), /^next: .+ · 10 due$/, "the schedule survives an offline reload");
console.log("4. offline: the schedule is still there after a reload");

// --- 5. one cache, the current one ---
const keys = await page.evaluate(() => caches.keys());
assert.deepEqual(keys, [cacheName], `exactly one cache, the current hash — got ${keys.join(", ")}`);
console.log("5. exactly one cache, named for the content hash of this export");

await context.setOffline(false);

// --- 6. a hidden URL must not cost the whole offline install ---
// This is the shape of the real failure: a host with a clean-URL rule answers
// 404 for /index.html, and an atomic addAll would take the entire cache down
// with it — a stuck splash screen on a train, for one missing file.
const swPath = path.join(import.meta.dirname, "..", "out", "sw.js");
const original = await readFile(swPath, "utf8");
try {
  await writeFile(
    swPath,
    original.replace('const PRECACHE = [\n  "/"', 'const PRECACHE = [\n  "/no-such-file-here.txt",\n  "/"'),
  );
  const hostile = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page2 = await hostile.newPage();
  page2.setDefaultTimeout(60000);
  await page2.goto(URL);
  await page2.evaluate(() => navigator.serviceWorker.ready);
  await page2.waitForFunction(() => navigator.serviceWorker.controller !== null);
  const survived = await page2.evaluate(
    async (name) => (await (await caches.open(name)).keys()).length,
    cacheName,
  );
  assert.ok(survived > 200, `the rest of the export still installed, got ${survived}`);
  await hostile.setOffline(true);
  await page2.reload();
  await page2.waitForSelector(".v7Counts");
  await hostile.setOffline(false);
  await hostile.close();
  console.log(`6. one unserved URL costs one URL: ${survived} cached, the app still boots offline`);
} finally {
  await writeFile(swPath, original);
}

await browser.close();
kill();
console.log("\nALL CHECKS PASSED");
process.exit(0);
