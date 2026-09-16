// End-to-end check of the whole loop against the static export in `out/`.
// Not a test suite — a verification script. Run: node scripts/e2e-loop.mjs
//
// Walks the real flows:
//   1. Home selects a deck and the CTA commits; the deck row shows 0/71
//   2. Show is gated on ink; Clear re-disables it
//   2b. The canvas is the same box before and after the flip, every card
//   3. Miss the first card -> it requeues exactly REQUEUE_AT positions later
//   4. Got-it on the requeue does NOT mint the number (first-attempt rule)
//   5. Finish all 71 -> complete screen shows 70 got / 1 missed, "+70 from memory",
//      and offers to replay exactly the missed card
//   6. Reload -> count persisted
//   7. Second session: the once-missed kana earns on its new first attempt -> 71
//   8. The dakuten toggle and Katakana produce the right deck, and the
//      katakana count is scored separately
//  10. The set round: deal, earn one on the first try (foil), miss then earn
//      one (base), abandon, and reopen the set on its new fraction and chips
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

// Home has no single hero number any more: each deck row carries its own
// count, and the complete screen restates it in the track summary.
const trackCount = async (name) =>
  (
    await page.locator(`.deckRow:has-text("${name.toUpperCase()}") .deckCount`).innerText()
  ).split("/")[0];

/** S1 selects, the CTA commits — every deck is two taps from home now */
const openDeck = async (name = "HIRAGANA") => {
  await page.waitForSelector(`.deckRow:has-text("${name}")`);
  await page.click(`.deckRow:has-text("${name}")`);
  await page.waitForSelector("button:has-text('Start session'):not([disabled])");
  await page.click("button:has-text('Start session')");
  await page.waitForSelector(".setRow");
};

/** the characters card on the deck screen is the way into the v3 drill */
const openDrill = async (name = "HIRAGANA") => {
  await openDeck(name);
  await page.click(".deckCharacters");
  await page.waitForSelector("canvas.ink");
};
const doneCount = async () =>
  (await page.locator(".trackSummaryRow span").innerText()).split("/")[0];
const waitTrack = (name, n) =>
  page.waitForFunction(
    ([name, n]) =>
      [...document.querySelectorAll(".deckRow")]
        .find((t) => t.textContent.toLowerCase().includes(name))
        ?.querySelector(".deckCount")
        ?.textContent.trim() === `${n}/71`,
    [name, n],
  );
const leftCount = async () =>
  parseInt(await page.locator(".sessionLeft").innerText(), 10);
const promptRomaji = () => page.locator(".promptRomaji").innerText();
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
  // the load-bearing constraint: the card flips but the canvas must not move,
  // or the animation lands somewhere other than on top of the attempt
  const before = await page.locator(".canvasBox").boundingBox();
  await page.click("button:has-text('Show')");
  await page.waitForSelector(".canvasOverlay svg"); // reveal animation mounted
  await page.waitForSelector(".revealKana"); // kana on the flipped card
  assert.deepEqual(
    await page.locator(".canvasBox").boundingBox(),
    before,
    "canvas must not move or resize between prompt and reveal",
  );
  const kana = await page.locator(".revealKana").innerText();
  let peak = 0;
  if (watch && grouped.has(kana)) peak = await peakConcurrency(3500);
  await page.click(`button:has-text('${grade}')`);
  return { kana, peak };
}

// --- 1. home ---
await page.goto(URL);
await waitTrack("hiragana", 0);
console.log("home: hiragana deck starts at 0/71");
assert.ok(
  await page.locator("button:has-text('Start session')").isDisabled(),
  "the CTA is present but inert until a deck is selected",
);
await openDrill("HIRAGANA");

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
assert.equal(await doneCount(), "70", "complete screen: 70 of 71 (requeued got-it did not count)");
assert.equal(
  await text(".chipLive"),
  "+70 from memory",
  "delta reflects first-attempt earns only",
);
console.log("session 1 complete: 70/71, first-attempt rule holds");

// --- 5b. the complete screen's own numbers: got / missed / replay ---
assert.equal(await page.locator(".stat").nth(0).locator(".statValue").innerText(), "70");
assert.equal(await page.locator(".stat").nth(1).locator(".statValue").innerText(), "1");
assert.equal(await page.locator(".missedChip").count(), 1, "the one fumbled kana is listed");
assert.equal(
  await page.locator("button:has-text('Replay missed (1)')").count(),
  1,
  "replay offers exactly the missed cards",
);
console.log("complete screen: 70 got / 1 missed, replay offers 1");

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
await page.click("button:has-text('Deck')");
await page.click("button:has-text('← HOME')");
assert.equal(await trackCount("hiragana"), "70", "home shows 70 after session");
await page.reload();
await waitTrack("hiragana", 70);
console.log("persistence: count survives reload");

// --- 7. second session: the missed kana can now be earned ---
await openDrill("HIRAGANA");
guard = 0;
while ((await atComplete()) === 0) {
  assert.ok(++guard < 80, "session 2 should finish within 80 cards");
  await showAndGrade("Got it");
  if (guard % 10 === 0) console.log(`...${guard} cards`);
}
assert.equal(await doneCount(), "71", "the once-missed kana earns in a later session");
assert.equal(await text(".chipLive"), "+1 from memory");
console.log("session 2 complete: 71/71, later-session earn works");

// --- 8. the dakuten toggle lives on the deck screen now ---
await page.click("button:has-text('Deck')");
await page.click(".toggleOpt:has-text('OFF')");
await page.click(".deckCharacters");
assert.equal(await leftCount(), 46, "dakuten OFF deals the base 46");
console.log("dakuten toggle: ok");
await page.goto(URL); // abandon the session

// --- 8b. katakana is a separate script with its own count ---
await page.waitForSelector(".deckRow:has-text('KATAKANA')");
await waitTrack("katakana", 0);
console.log("katakana: count is scored separately from hiragana (0, not 71)");

await openDeck("KATAKANA");
assert.equal(
  await text(".deckNote"),
  "missed cards replay until zero.",
  "the replay note moved to the deck's characters card",
);
assert.equal(
  await page.locator(".toggleOn").innerText(),
  "OFF",
  "the dakuten choice is remembered across decks",
);
await page.click(".toggleOpt:has-text('ON')");
await page.click(".deckCharacters");
assert.equal(await leftCount(), 71, "katakana deck has 71 cards");
const first = await showAndGrade("Got it");
assert.match(first.kana, /^[\u30a1-\u30f6]$/, `reveal shows a katakana, got '${first.kana}'`);
await page.goto(URL);
await waitTrack("katakana", 1);
console.log("katakana: deck is 71 katakana, earning one moves the katakana number to 1");

await waitTrack("hiragana", 71);
console.log("switchboard: both deck counts are shown at once, hiragana still 71");

// --- 10. the set round ---
// Four taps from home to a dealt prompt (F10), then the whole of F11: earn on
// the first try, miss one and earn it on its second, and abandon with the
// earned cards kept.
await page.goto(URL);
await openDeck("HIRAGANA");
const rowFraction = () => page.locator(".setRow .panelCount").innerText();
assert.equal(await rowFraction(), "0/10", "the platform set starts undrawn");
assert.equal(
  await page.locator(".setRow .setFoil").innerText(),
  "0 FOIL",
  "and with no foil to its name",
);
await page.click(".setRow");
assert.equal(
  await page.locator(".cardBackMark").count(),
  10,
  "every unearned word is face-down on S6b",
);
assert.match(await page.locator(".roundLengthValue").innerText(), /^10 LEFT/);
await page.click("button:has-text('DEAL')");

/** draw a mark, flip, and grade — the round's own loop */
async function round(grade) {
  const box = await page.locator("canvas.ink").boundingBox();
  await page.mouse.move(box.x + box.width * 0.3, box.y + box.height * 0.35);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.7, box.y + box.height * 0.6, { steps: 5 });
  await page.mouse.up();
  const before = await page.locator(".canvasBox").boundingBox();
  const word = await page.locator(".cardPromptRomaji").innerText();
  await page.click("button:has-text('FLIP')");
  await page.waitForSelector(".wordReveal svg path");
  assert.deepEqual(
    await page.locator(".canvasBox").boundingBox(),
    before,
    "the canvas must not move between the prompt and the reveal",
  );
  const cells = await page.locator(".wordRevealCell").count();
  await page.click(`button:has-text('${grade}')`);
  return { word, cells };
}

// the reveal is one cell per character, at canvas-width / N
const firstWord = await round("GOT IT");
assert.ok(
  firstWord.cells >= 2,
  `whole-word reveal draws a cell per character, got ${firstWord.cells}`,
);
await page.waitForSelector(".earnCard");
assert.equal(
  await page.locator(".earnCard .cardChip").innerText(),
  "FOIL · 1st TRY",
  "first try mints a foil",
);
assert.equal(await page.locator(".handCard").count(), 1, "the card slides into the hand");
await page.click(".roundEarned");

// abandon: the round ends, the card stays
await page.click(".quit");
await page.waitForSelector("button:has-text('DEAL')");
assert.equal(await page.locator(".setHead .panelCount").innerText(), "1/10", "S6b keeps the earn");
assert.equal(await page.locator(".card-foil").count(), 1, "the foil is on the set screen");
assert.equal(await page.locator(".cardBackMark").count(), 9, "the other nine are face-down");
assert.match(
  await page.locator(".roundLengthValue").innerText(),
  /^9 LEFT/,
  "the next round is only what is left",
);
await page.click("button:has-text('← HIRAGANA')");
assert.equal(await rowFraction(), "1/10", "the deck row reads the set's new fraction");
assert.equal(await page.locator(".setRow .setFoil").innerText(), "1 FOIL");
console.log("set round: abandon keeps the earned card, S6b and the deck row agree");

// --- 10b. a miss costs the rarity, and the round ends on S8 ---
await page.click(".setRow");
await page.click("button:has-text('DEAL')");
const missedWord = await page.locator(".cardPromptRomaji").innerText();
await round("MISSED");
assert.notEqual(
  await page.locator(".cardPromptRomaji").innerText(),
  missedWord,
  "a missed word never returns as the next prompt",
);
let guard10 = 0;
let rarity = null;
while (guard10 < 12) {
  assert.ok(++guard10 < 12, "the round should finish inside its own deck");
  const isMissed = (await page.locator(".cardPromptRomaji").innerText()) === missedWord;
  await round("GOT IT");
  await page.waitForSelector(".earnCard");
  if (isMissed) rarity = await page.locator(".earnCard .cardChip").innerText();
  await page.click(".roundEarned");
  if (await page.locator(".resultCount").count()) break;
}
assert.equal(rarity, "BASE · 2nd TRY", "a word earned on its second attempt is base, not foil");

// S8: the count, the foil chip, and the breakdown
assert.match(await page.locator(".resultCount").innerText(), /^9\s*COLLECTED$/);
assert.equal(await page.locator(".resultFoil").innerText(), "8 FOIL");
assert.equal(await page.locator(".resultRest").innerText(), "1 BASE · 0 WORN");
assert.equal(
  await page.locator(".resultGrid .card").count(),
  9,
  "past five cards the result is a grid, not a fan",
);
await page.click("button:has-text('BACK TO DECK')");
assert.equal(await rowFraction(), "10/10", "the deck row reads the set out");
await page.click(".setRow");
assert.equal(
  await page.locator("button:has-text('DEAL')").count(),
  0,
  "a set at N/N has nothing left to deal",
);
console.log("set round: miss then earn is base, S8 tallies, and a full set stops dealing");

await browser.close();
kill();
console.log("\nALL CHECKS PASSED");
process.exit(0);
