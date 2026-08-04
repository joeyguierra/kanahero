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

import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { chromium } from "playwright";

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

async function draw() {
  const box = await page.locator("canvas.ink").boundingBox();
  await page.mouse.move(box.x + box.width * 0.3, box.y + box.height * 0.3);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.7, box.y + box.height * 0.55, { steps: 5 });
  await page.mouse.move(box.x + box.width * 0.4, box.y + box.height * 0.75, { steps: 5 });
  await page.mouse.up();
}

async function showAndGrade(grade) {
  await draw();
  await page.click("button:has-text('Show')");
  await page.waitForSelector(".canvasOverlay svg"); // reveal animation mounted
  await page.waitForSelector(".cardSub"); // kana + stroke count on the card
  await page.click(`button:has-text('${grade}')`);
}

// --- 1. home ---
await page.goto(URL);
await page.waitForFunction(() => document.querySelector(".hero")?.textContent?.trim() === "0");
console.log("home: count starts at 0");
await page.waitForSelector("button.btnStart:not([disabled])");
await page.click("button.btnStart");

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
while ((await page.locator(".delta").count()) === 0) {
  assert.ok(++guard < 80, "session should finish within 80 cards");
  await showAndGrade("Got it");
  if (guard % 10 === 0) console.log(`...${guard} more cards graded`);
}
assert.equal(await hero(), "70", "complete screen: 70 of 71 (requeued got-it did not count)");
assert.equal(
  await page.locator(".delta").innerText(),
  "+70 this session",
  "delta reflects first-attempt earns only",
);
console.log("session 1 complete: 70/71, first-attempt rule holds");

// --- 6. persistence across reload ---
await page.click("button:has-text('Done')");
assert.equal(await hero(), "70", "home shows 70 after session");
await page.reload();
await page.waitForFunction(() => document.querySelector(".hero")?.textContent?.trim() === "70");
console.log("persistence: count survives reload");

// --- 7. second session: the missed kana can now be earned ---
await page.waitForSelector("button.btnStart:not([disabled])");
await page.click("button.btnStart");
guard = 0;
while ((await page.locator(".delta").count()) === 0) {
  assert.ok(++guard < 80, "session 2 should finish within 80 cards");
  await showAndGrade("Got it");
  if (guard % 10 === 0) console.log(`...${guard} cards`);
}
assert.equal(await hero(), "71", "the once-missed kana earns in a later session");
assert.equal(await page.locator(".delta").innerText(), "+1 this session");
console.log("session 2 complete: 71/71, later-session earn works");

// --- base 46 toggle ---
await page.click("button:has-text('Done')");
await page.click("button:has-text('Base 46')");
await page.click("button.btnStart");
assert.equal(await leftCount(), 46, "Base 46 deck has 46 cards");
console.log("base 46 toggle: ok");

await browser.close();
kill();
console.log("\nALL CHECKS PASSED");
process.exit(0);
