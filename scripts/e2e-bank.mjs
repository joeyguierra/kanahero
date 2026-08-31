// End-to-end check of the capture bank against the static export in `out/`.
// Not a test suite — a verification script. Run: node scripts/e2e-bank.mjs
//
// Walks the field loop and the insurance policy:
//   1. Home's BANK strip reads 0, opens S5, and S5 is empty with EXPORT dead
//   2. Capture a photo -> downscaled to the 1600px cap, grid prepends,
//      both counts tick, storage footer reports honestly
//   3. Reload -> the capture is still in IndexedDB with every field intact
//   4. S5b: ordinal and timestamp, the note round-trips through the DB
//   5. Export -> a real ZIP: `unzip -t` accepts it, the manifest validates,
//      and the extracted JPEG is byte-identical to the stored blob
//   6. Delete needs two taps, is permanent, and is the only way down
//   7. Second capture is newest-first, and the writing loop never saw any of it

import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { execFile } from "node:child_process";
import { mkdtemp, readFile } from "node:fs/promises";
import { promisify } from "node:util";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";
import { chromium } from "playwright";

const run = promisify(execFile);
const PORT = 3212;
const URL = `http://localhost:${PORT}`;

const tmp = await mkdtemp(path.join(os.tmpdir(), "kanahero-bank-"));
// oversized on purpose: the pipeline has to bring the long edge down to 1600
const fixture = path.join(tmp, "sign.jpg");
await sharp({
  create: { width: 2400, height: 1800, channels: 3, background: { r: 12, g: 12, b: 14 } },
})
  .jpeg()
  .toFile(fixture);
const fixtureB = path.join(tmp, "sign-b.jpg");
await sharp({
  create: { width: 1200, height: 1600, channels: 3, background: { r: 240, g: 30, b: 120 } },
})
  .jpeg()
  .toFile(fixtureB);

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
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
page.setDefaultTimeout(15000);

/** every capture record, read straight out of IndexedDB */
const records = () =>
  page.evaluate(
    () =>
      new Promise((resolve, reject) => {
        const open = indexedDB.open("kanahero-bank");
        open.onerror = () => reject(open.error);
        open.onsuccess = () => {
          const tx = open.result.transaction("captures", "readonly");
          const all = tx.objectStore("captures").getAll();
          tx.oncomplete = () =>
            resolve(
              all.result.map((c) => ({
                id: c.id,
                w: c.w,
                h: c.h,
                bytes: c.bytes,
                takenAt: c.takenAt,
                note: c.note,
                isBlob: c.blob instanceof Blob,
                type: c.blob.type,
              })),
            );
          tx.onerror = () => reject(tx.error);
        };
      }),
  );

const blobBytes = (id) =>
  page.evaluate(
    (id) =>
      new Promise((resolve, reject) => {
        const open = indexedDB.open("kanahero-bank");
        open.onsuccess = () => {
          const req = open.result.transaction("captures", "readonly").objectStore("captures").get(id);
          req.onsuccess = async () => resolve([...new Uint8Array(await req.result.blob.arrayBuffer())]);
          req.onerror = () => reject(req.error);
        };
      }),
    id,
  );

const stripCount = () => page.locator(".bankStripCount").innerText();
const headCount = () => page.locator(".bankHeadCount").innerText();
const thumbs = () => page.locator(".thumb").count();
const capture = async (file) => {
  const before = await thumbs();
  await page.setInputFiles(".bankInput", file);
  await page.waitForFunction((n) => document.querySelectorAll(".thumb").length === n, before + 1);
};

await page.goto(URL);

// --- 1. the strip is the way in, and it is not a track card ---
await page.waitForSelector("button:has-text('Start session'):not([disabled])");
assert.equal(await stripCount(), "0", "bank strip starts at zero");
assert.equal(
  await page.locator(".bankStrip .bar, .bankStrip .trackCount").count(),
  0,
  "the strip carries no progress bar and no fraction — it is not a fourth track",
);
await page.click(".bankStrip");
assert.match(
  (await page.locator(".bankEmptyLine").innerText()).toLowerCase(),
  /snap what you can/,
  "empty state is one line",
);
assert.ok(
  await page.locator(".bankExport").isDisabled(),
  "EXPORT is dead at zero but still on screen",
);
console.log("1. home strip opens the bank; empty state is one line, export inert");

// --- 2. capture: native input -> downscale -> IndexedDB -> grid ---
await capture(fixture);
assert.equal(await headCount(), "1", "header count ticks to 1");
const [first] = await records();
assert.equal(first.w, 1600, "long edge capped at 1600");
assert.equal(first.h, 1200, "aspect ratio preserved through the downscale");
assert.equal(first.type, "image/jpeg", "stored as JPEG");
assert.ok(first.isBlob, "one blob per capture, stored as a Blob");
assert.equal(first.note, "", "no note is asked for at capture time");
assert.ok(first.bytes > 0 && first.bytes < 2_000_000, `plausible size, got ${first.bytes}`);
assert.match(first.id, /^\d+-[0-9a-f]{4}$/, "id is sortable and collision-safe");
assert.match(
  (await page.locator(".bankFooter").innerText()).toLowerCase(),
  /persistent · 1 items|best-effort/,
  "storage footer reports whatever persist() actually answered",
);
console.log("2. capture saves with zero taps after the shutter, downscaled to 1600px");

// --- 3. it survives a cold reload ---
await page.reload();
await page.click(".bankStrip");
await page.waitForSelector(".thumb");
assert.equal(await thumbs(), 1, "the capture is still there after a reload");
console.log("3. the bank survives a reload — the photo is in IndexedDB, not memory");

// --- 4. detail: ordinal, timestamp, and the note round-trip ---
await page.click(".thumb");
assert.equal(await page.locator(".detailPosition").innerText(), "1 / 1", "position readout");
assert.match(
  await page.locator(".detailStamp").innerText(),
  /^#001 · \d{4}-\d{2}-\d{2} \d{2}:\d{2}$/,
  "ordinal plus local timestamp",
);
await page.click(".noteAdd");
await page.fill(".noteInput", "keihan yodoyabashi, pillar sign by exit 8");
await page.keyboard.press("Enter");
await page.waitForSelector(".noteText");
await page.click("button:has-text('Bank')");
await page.click(".thumb");
assert.equal(
  await page.locator(".noteText").innerText(),
  "keihan yodoyabashi, pillar sign by exit 8",
  "the note round-trips through IndexedDB",
);
console.log("4. detail carries the ordinal, the timestamp, and a note that persists");

// --- 5. export: a ZIP a human and a laptop can both open ---
await page.click("button:has-text('Bank')");
const [download] = await Promise.all([
  page.waitForEvent("download"),
  page.click(".bankExport"),
]);
assert.match(
  download.suggestedFilename(),
  /^kanahero-bank-\d{8}-\d{4}\.zip$/,
  "export filename is timestamped",
);
const zipPath = path.join(tmp, download.suggestedFilename());
await download.saveAs(zipPath);
// an independent reader on the hand-rolled writer: unzip verifies every CRC
await run("unzip", ["-t", zipPath]);
await run("unzip", ["-o", "-q", zipPath, "-d", path.join(tmp, "unpacked")]);
const manifest = JSON.parse(await readFile(path.join(tmp, "unpacked", "manifest.json"), "utf8"));
assert.equal(manifest.format, "kanahero-bank");
assert.equal(manifest.version, 1);
assert.equal(manifest.captures.length, 1);
const entry = manifest.captures[0];
assert.equal(entry.id, first.id);
assert.equal(entry.file, `captures/${first.id}.jpg`);
assert.equal(entry.note, "keihan yodoyabashi, pillar sign by exit 8");
assert.equal(entry.w, 1600);
const extracted = await readFile(path.join(tmp, "unpacked", entry.file));
assert.deepEqual(
  [...extracted],
  await blobBytes(first.id),
  "the exported JPEG is byte-identical to the stored blob",
);
assert.equal(entry.bytes, extracted.length, "manifest byte count matches the file");
await page.click(".bankStrip").catch(() => {});
assert.equal(await thumbs(), 1, "export never mutates the bank");
console.log("5. export is one valid ZIP: CRCs check, manifest validates, bytes identical");

// --- 6. delete: two taps, permanent, the only way the count goes down ---
await page.click(".thumb");
await page.click(".btnDelete");
assert.match(
  (await page.locator(".btnDelete").innerText()).toLowerCase(),
  /tap again/,
  "the first tap only arms it",
);
assert.equal((await records()).length, 1, "one tap deletes nothing");
await page.click(".detailPhoto"); // any other touch disarms
assert.doesNotMatch(
  (await page.locator(".btnDelete").innerText()).toLowerCase(),
  /tap again/,
  "any other touch disarms delete",
);
await page.click(".btnDelete");
await page.click(".btnDelete");
await page.waitForSelector(".bankEmptyLine");
assert.equal((await records()).length, 0, "delete is permanent");
assert.equal(await headCount(), "0", "the count comes back down");
console.log("6. delete needs two taps, is permanent, and empties the bank honestly");

// --- 7. newest first, and the writing loop is untouched ---
await capture(fixture);
await capture(fixtureB);
const two = (await records()).sort((a, b) => b.takenAt - a.takenAt);
assert.equal(await headCount(), "2");
await page.click(".thumb >> nth=0");
assert.equal(
  await page.locator(".detailPosition").innerText(),
  "2 / 2",
  "top-left thumb is the newest capture",
);
assert.equal(two[0].w, 1200, "the portrait capture is the newest one");
await page.click("button:has-text('Bank')");
await page.click("button:has-text('Back')");
await page.waitForSelector("button:has-text('Start session'):not([disabled])");
assert.equal(await stripCount(), "2", "home strip carries the live count");
assert.equal(
  await page.locator(".track:has-text('Hiragana') .trackCount").innerText(),
  "0/71",
  "the writing loop never learned the bank exists",
);
console.log("7. newest first, live count on home, the number untouched by any of it");

await browser.close();
kill();
console.log("\nALL CHECKS PASSED");
process.exit(0);
