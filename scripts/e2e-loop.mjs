// End-to-end check of the whole loop against the static export in `out/`.
// Not a test suite — a verification script. Run: node scripts/e2e-loop.mjs
//
// Walks the real flows:
//   1. Home shows 0, Start disabled until storage loads
//   2. Show is gated on ink; Clear re-disables it
//   3. Miss the first card -> it requeues exactly REQUEUE_AT positions later
//   4. Got-it on the requeue does NOT mint the number (first-attempt rule)
//   5. Finish all 71 -> complete screen shows count 70, "+70 this session"
//   6. Reload -> count persisted
//   7. Second session: the once-missed kana earns on its new first attempt -> 71
//   8. Base 46 and Katakana toggles produce the right deck, and the katakana
//      count is scored separately from the hiragana one
//   9. A self-intersecting stroke animates as ONE pen stroke: its clipped
//      copies run concurrently, not one after the other

import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

// Kana whose stroke file has a <g style="--i:N"> — one pen stroke drawn as
// several clipped copies. These are the ones the animator used to stall on.
const STROKES_DIR = path.join(import.meta.dirname, "..", "public", "strokes");
const grouped = new Set();
for (const file of await readdir(STROKES_DIR)) {
  if (!file.endsWith(".svg")) continue;
  const svg = await readFile(path.join(STROKES_DIR, file), "utf8");
  if (svg.includes('<g style="--i')) {
    grouped.add(String.fromCodePoint(parseInt(file.slice(0, -4), 16)));
  }
}

const PORT = 3211;
const URL = `http://localhost:${PORT}`;

const server = spawn("npx", ["-y", "serve", "-l", String(PORT), "out"], {
  stdio: "ignore",
  detached: false,
});
const kill = () => server.kill();
process.on("exit", kill);

// wait for server
for (let i = 0; i < 40; i++) {
  try {
    const res = await fetch(URL);
    if (res.ok) break;
  } catch {}
  await new Promise((r) => setTimeout(r, 250));
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
page.setDefaultTimeout(15000);

const hero = () => page.locator(".hero").innerText();
const leftCount = async () =>
  parseInt(await page.locator(".sessionLeft").innerText(), 10);
const promptRomaji = () => page.locator(".cardRomaji").innerText();
// several chips are uppercased in CSS; compare on the underlying text
const text = async (sel) => (await page.locator(sel).innerText()).toLowerCase();
const atComplete = () => page.locator("button:has-text('Again')").count();

/** max stroke animations running at once inside the reveal overlay */
function peakConcurrency(ms) {
  return page.evaluate(
    (ms) =>
      new Promise((resolve) => {
        let peak = 0;
        const t0 = performance.now();
        const tick = () => {
          const n = document
            .getAnimations()
            .filter(
              (a) =>
                a.playState === "running" &&
                a.effect?.target?.closest?.(".canvasOverlay"),
            ).length;
          if (n > peak) peak = n;
          if (performance.now() - t0 < ms) requestAnimationFrame(tick);
          else resolve(peak);
        };
        requestAnimationFrame(tick);
      }),
    ms,
  );
}

async function draw() {
  const box = await page.locator("canvas.ink").boundingBox();
  await page.mouse.move(box.x + box.width * 0.3, box.y + box.height * 0.3);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.7, box.y + box.height * 0.55, { steps: 5 });
  await page.mouse.move(box.x + box.width * 0.4, box.y + box.height * 0.75, { steps: 5 });
  await page.mouse.up();
}

async function showAndGrade(grade, watch = false) {
  await draw();
  await page.click("button:has-text('Show')");
  await page.waitForSelector(".canvasOverlay svg"); // reveal animation mounted
  await page.waitForSelector(".cardKana"); // kana on the flipped card
  const kana = await page.locator(".cardKana").innerText();
  let peak = 0;
  if (watch && grouped.has(kana)) peak = await peakConcurrency(3500);
  await page.click(`button:has-text('${grade}')`);
  return { kana, peak };
}

// --- 1. home ---
await page.goto(URL);
await page.waitForFunction(() => document.querySelector(".hero")?.textContent?.trim() === "0");
console.log("home: count starts at 0");
await page.waitForSelector(".homeBottom button.btnStrike:not([disabled])");
await page.click(".homeBottom button.btnStrike");

// --- 2. ink gating ---
assert.equal(await leftCount(), 71, "session starts with 71 cards");
assert.ok(await page.locator("button:has-text('Show')").isDisabled(), "Show disabled before ink");
await draw();
assert.ok(!(await page.locator("button:has-text('Show')").isDisabled()), "Show enabled after ink");
await page.click("button:has-text('Clear')");
assert.ok(await page.locator("button:has-text('Show')").isDisabled(), "Clear re-disables Show");
console.log("ink gating: ok");

// --- 3. miss the first card, check requeue position ---
const missedRomaji = await promptRomaji();
await showAndGrade("Missed");
assert.equal(await leftCount(), 71, "miss keeps the card in the queue");
const seen = [];
for (let i = 0; i < 5; i++) {
  const r = await promptRomaji();
  seen.push(r);
  assert.notEqual(r, missedRomaji, `missed card must not reappear at position ${i + 1}`);
  await showAndGrade("Got it");
}
assert.equal(await promptRomaji(), missedRomaji, "missed card returns exactly 5 positions later");
console.log(`requeue: '${missedRomaji}' came back after ${seen.join(", ")}`);
await showAndGrade("Got it"); // got it on requeue — must NOT count

// --- 5. finish the rest ---
let guard = 0;
let watched = 0;
const peaks = [];
while ((await atComplete()) === 0) {
  assert.ok(++guard < 80, "session should finish within 80 cards");
  // spot-check the first few looping kana for concurrent stroke copies
  const { kana, peak } = await showAndGrade("Got it", watched < 3);
  if (peak > 0) {
    peaks.push(`${kana}:${peak}`);
    watched++;
  }
  if (guard % 10 === 0) console.log(`...${guard} more cards graded`);
}
assert.equal(await hero(), "70", "complete screen: 70 of 71 (requeued got-it did not count)");
assert.equal(
  await text(".chipLive"),
  "+70 this session",
  "delta reflects first-attempt earns only",
);
console.log("session 1 complete: 70/71, first-attempt rule holds");

// --- 9. a looping stroke is one stroke, drawn by concurrent clipped copies ---
assert.ok(watched > 0, "session should have revealed at least one looping kana");
for (const entry of peaks) {
  const [kana, peak] = entry.split(":");
  assert.ok(
    Number(peak) >= 2,
    `${kana}: clipped copies of a self-intersecting stroke must animate together, ` +
      `saw only ${peak} at once (sequential copies stall the stroke midway)`,
  );
}
console.log(`stroke concurrency: ${peaks.join("  ")}`);

// --- 6. persistence across reload ---
await page.click("button:has-text('Done')");
assert.equal(await hero(), "70", "home shows 70 after session");
await page.reload();
await page.waitForFunction(() => document.querySelector(".hero")?.textContent?.trim() === "70");
console.log("persistence: count survives reload");

// --- 7. second session: the missed kana can now be earned ---
await page.waitForSelector(".homeBottom button.btnStrike:not([disabled])");
await page.click(".homeBottom button.btnStrike");
guard = 0;
while ((await atComplete()) === 0) {
  assert.ok(++guard < 80, "session 2 should finish within 80 cards");
  await showAndGrade("Got it");
  if (guard % 10 === 0) console.log(`...${guard} cards`);
}
assert.equal(await hero(), "71", "the once-missed kana earns in a later session");
assert.equal(await text(".chipLive"), "+1 this session");
console.log("session 2 complete: 71/71, later-session earn works");

// --- 8. base 46 toggle ---
await page.click("button:has-text('Done')");
await page.click("button:has-text('Base 46')");
await page.click(".homeBottom button.btnStrike");
assert.equal(await leftCount(), 46, "Base 46 deck has 46 cards");
console.log("base 46 toggle: ok");
await page.goto(URL); // abandon the session

// --- 8b. katakana is a separate script with its own count ---
await page.waitForSelector(".homeBottom button.btnStrike:not([disabled])");
await page.click("button:has-text('Katakana')");
await page.waitForFunction(() => document.querySelector(".hero")?.textContent?.trim() === "0");
assert.match(
  await text(".chipStrike"),
  /of 71 katakana/,
  "home labels the selected script",
);
console.log("katakana: count is scored separately from hiragana (0, not 71)");

await page.click("button:has-text('All 71')");
await page.click(".homeBottom button.btnStrike");
assert.equal(await leftCount(), 71, "katakana deck has 71 cards");
const first = await showAndGrade("Got it");
assert.match(first.kana, /^[\u30a1-\u30f6]$/, `reveal shows a katakana, got '${first.kana}'`);
await page.goto(URL);
await page.waitForFunction(() => document.querySelector(".hero")?.textContent?.trim() === "1");
console.log("katakana: deck is 71 katakana, earning one moves the katakana number to 1");

await page.click("button:has-text('Hiragana')");
await page.waitForFunction(() => document.querySelector(".hero")?.textContent?.trim() === "71");
console.log("script toggle: hiragana number is untouched at 71");

await browser.close();
kill();
console.log("\nALL CHECKS PASSED");
process.exit(0);
