// The plane test, headless. Run: node scripts/e2e-offline.mjs
//
// Everything here happens with the network switched off at the browser, so a
// pass means the service worker's precache is genuinely carrying the app:
//   1. The SW installs and takes control of the page
//   2. Offline cold reload: home renders from cache
//   3. Offline: a session starts and the stroke SVG animates (fetched, not
//      bundled — the precache is what makes it arrive)
//   4. Offline: a capture saves, the count ticks, and it survives a reload
//   5. Only one cache exists, and it is the current content hash
//   6. A URL the host does not serve costs that URL, not the whole install

import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";
import { chromium } from "playwright";

const PORT = 3214;
const URL = `http://localhost:${PORT}`;

const tmp = await mkdtemp(path.join(os.tmpdir(), "kanahero-offline-"));
const fixture = path.join(tmp, "sign.jpg");
await sharp({
  create: { width: 2000, height: 1500, channels: 3, background: { r: 20, g: 20, b: 24 } },
})
  .jpeg()
  .toFile(fixture);

const generated = await readFile(path.join(import.meta.dirname, "..", "out", "sw.js"), "utf8");
const cacheName = generated.match(/const CACHE = "(kanahero-[0-9a-f]+)"/)?.[1];
assert.ok(cacheName, "out/sw.js carries a content-hash cache name — run the build first");

const server = spawn("npx", ["-y", "serve", "-l", String(PORT), "out"], { stdio: "ignore" });
const kill = () => server.kill();
process.on("exit", kill);

for (let i = 0; i < 40; i++) {
  try {
    if ((await fetch(URL)).ok) break;
  } catch {}
  await new Promise((r) => setTimeout(r, 250));
}

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await context.newPage();
page.setDefaultTimeout(60000);

// --- 1. install and take control ---
await page.goto(URL);
await page.waitForSelector("button:has-text('Start session'):not([disabled])");
// `ready` resolves once the SW is activated, which is after cache.addAll has
// pulled the entire export down
await page.evaluate(() => navigator.serviceWorker.ready);
await page.waitForFunction(() => navigator.serviceWorker.controller !== null);
const cached = await page.evaluate(async (name) => (await (await caches.open(name)).keys()).length, cacheName);
assert.ok(cached > 500, `the whole export is precached, got ${cached} entries`);
console.log(`1. service worker installed and controlling: ${cached} URLs in ${cacheName}`);

// --- 2. offline cold reload ---
await context.setOffline(true);
await page.reload();
await page.waitForSelector("button:has-text('Start session'):not([disabled])");
assert.equal(
  await page.locator(".track:has-text('Hiragana') .trackCount").innerText(),
  "0/71",
  "home renders offline, from cache",
);
console.log("2. offline: the shell boots and home renders");

// --- 3. offline: the writing loop, including the stroke data ---
await page.click("button:has-text('Start session')");
const box = await page.locator("canvas.ink").boundingBox();
await page.mouse.move(box.x + box.width * 0.3, box.y + box.height * 0.3);
await page.mouse.down();
await page.mouse.move(box.x + box.width * 0.7, box.y + box.height * 0.55, { steps: 5 });
await page.mouse.up();
await page.click("button:has-text('Show')");
await page.waitForSelector(".canvasOverlay svg path");
const running = await page.evaluate(
  () =>
    document
      .getAnimations()
      .filter((a) => a.effect?.target?.closest?.(".canvasOverlay")).length,
);
assert.ok(running > 0, "the stroke animation runs offline — its SVG came from the precache");
console.log("3. offline: a session starts and the stroke SVG animates");

// --- 4. offline: capture, the whole point of the trip ---
// a second offline reload gets back to home, and re-proves the shell boots
await page.reload();
await page.waitForSelector(".bankStrip");
await page.click(".bankStrip");
await page.setInputFiles(".bankInput", fixture);
await page.waitForSelector(".thumb");
assert.equal(await page.locator(".bankHeadCount").innerText(), "1", "the count ticks offline");
await page.reload();
await page.waitForSelector(".bankStrip");
assert.equal(await page.locator(".bankStripCount").innerText(), "1", "capture survives an offline reload");
console.log("4. offline: capture saves, count ticks, and it is still there after a reload");

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
  assert.ok(survived > 500, `the rest of the export still installed, got ${survived}`);
  await hostile.setOffline(true);
  await page2.reload();
  await page2.waitForSelector("button:has-text('Start session'):not([disabled])");
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
