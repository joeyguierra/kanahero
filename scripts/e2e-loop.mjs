// End-to-end check of the whole loop against the static export in `out/`.
// Not a test suite — a verification script. Run: node scripts/e2e-loop.mjs
//
// Walks the real flows:
//   1. Home selects a deck and the CTA commits; the deck row shows 0/71
//   2. Show is gated on ink; Clear re-disables it
//   2b. The canvas is the same box before and after the flip, every card
//   3. Miss the first card -> it requeues exactly REQUEUE_AT positions later
//   4. Got-it on the requeue does NOT earn the number (first-attempt rule)
//   5. Finish all 71 -> complete screen shows 70 got / 1 missed, "+70 from memory",
//      and offers to replay exactly the missed card
//   6. Reload -> count persisted
//   7. Second session: the once-missed kana earns on its new first attempt -> 71
//   8. The dakuten toggle and Katakana produce the right deck, and the
//      katakana count is scored separately
//  10. The run: S1 and the deck row carry no fractions; S6d is empty before
//      any run; a finished run earns one copy per word; a replay earns a
//      second; leaving through the Joker's confirm earns nothing, and neither
//      does a reload; a v2 blob is wiped once with a line about it
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

// S1 carries no counts at all now (v5a §3) — a deck row says how many sets it
// holds and nothing else. The character fraction lives on the deck screen's
// CHARACTERS card, which is the only place it is still true.
const charCount = async () =>
  (await page.locator(".deckCharacters .panelCount").innerText()).split("/")[0];
const setsLabel = (name) =>
  page.locator(`.deckRow:has-text("${name.toUpperCase()}") .deckCount`).innerText();

/** back to S1 from wherever we are, without throwing the blob away */
const goHome = async () => {
  if (await page.locator(".deckRow").count()) return;
  const back = page.locator("button:has-text('← HOME')");
  if (await back.count()) await back.click();
  else await page.goto(URL);
};

/** S1 selects, the CTA commits — every deck is two taps from home now */
const openDeck = async (name = "HIRAGANA") => {
  await goHome();
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
/** open a deck and wait for its characters card to read n/71 */
const waitTrack = async (name, n) => {
  await openDeck(name);
  await page.waitForFunction(
    (n) => document.querySelector(".deckCharacters .panelCount")?.textContent.trim() === `${n}/71`,
    n,
  );
};
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
await page.waitForSelector(".deckRow");
assert.ok(
  await page.locator("button:has-text('Start session')").isDisabled(),
  "the CTA is present but inert until a deck is selected",
);
// 10.1 cold start: rows carry set counts, no fraction and no bar anywhere
await page.waitForFunction(
  () =>
    [...document.querySelectorAll(".deckRow")].every((r) =>
      /^\d+ SETS?$/.test(r.querySelector(".deckCount")?.textContent.trim() ?? ""),
    ),
);
assert.equal(await setsLabel("KANJI"), "3 SETS", "the kanji deck ships three sets");
assert.equal(await setsLabel("HIRAGANA"), "1 SET", "and hiragana one");
assert.equal(await page.locator(".deckRow .bar").count(), 0, "S1 rows carry no progress bar");
console.log("home: rows read '1 SET' / '2 SETS', no fractions, no bars");

await openDeck("HIRAGANA");
assert.equal(
  await page.locator(".setRow .setRowMeta").innerText(),
  "≤5 KANA",
  "the set row's description drops its word count",
);
assert.equal(await page.locator(".setRow .setRowWords").innerText(), "10 WORDS");
assert.equal(await page.locator(".setRow .bar").count(), 0, "and the set row has no bar");
assert.equal(await charCount(), "0", "the characters card still counts characters");
console.log("deck: set row reads '10 WORDS · ≤5 KANA', no bar, no stock count");
await page.click(".deckCharacters");
await page.waitForSelector("canvas.ink");

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
assert.equal(await charCount(), "70", "the deck's characters card shows 70 after the session");
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

await page.click("button:has-text('← HOME')");
await waitTrack("hiragana", 71);
console.log("decks are scored separately: hiragana still 71 after a katakana earn");

// --- 10. the run ---
// A run is the whole set, dealt every time, and nothing of it is kept until
// it finishes (v5a §1). Everything below is that rule, from both sides.
await page.goto(URL);
await openDeck("HIRAGANA");
await page.click(".setRow");
await page.waitForSelector("button:has-text('DEAL')");
assert.equal(
  await page.locator(".cardBackMark").count(),
  10,
  "every word of the set is face-down on S6b, earned or not",
);
assert.equal(await page.locator(".setHead .panelCount").innerText(), "10 WORDS");

/** the three stock counts under the grid, as numbers */
const totals = async () =>
  (await page.locator(".setTotal").allInnerTexts()).map((t) => parseInt(t, 10));
const sum = (xs) => xs.reduce((a, b) => a + b, 0);
assert.deepEqual(await totals(), [0, 0, 0], "a set with no finished run owns nothing");

// 10.2 the collection, before any run has finished
await page.click("button:has-text('VIEW COLLECTION')");
await page.waitForSelector(".collectionRow");
assert.equal(await page.locator(".collectionRow").count(), 10, "one row per word, always");
assert.equal(
  await page.locator(".collectionRowEmpty").count(),
  10,
  "and every one of them is still a back",
);
assert.equal(
  await page.locator(".shelfSlot").count(),
  30,
  "three empty stock slots per word, thirty in all",
);
assert.equal(await page.locator(".collectionRow .card").count(), 0, "not one card on the shelf");
assert.equal(await page.locator(".collectionRow .cardWord").count(), 0, "no word is shown yet");
assert.deepEqual(
  await page.locator(".collectionRow").first().locator(".collectionTimes").allInnerTexts(),
  ["×0", "×0", "×0"],
  "all three stocks are listed at zero",
);
// his line is typed out: the untyped tail is hidden, so read textContent
assert.match(await page.locator(".jokerLine").textContent(), /Nothing here yet/);
console.log("S6d: thirty empty slots, no faces, and he says so");
await page.click(".backLink"); // ← back to the set

/** draw a mark, flip, and grade — the run's own loop */
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

/** play a whole run out, missing the first word once. Returns the S8 count. */
async function playRun({ missFirst = true } = {}) {
  await page.click("button:has-text('DEAL')");
  let missed = null;
  if (missFirst) {
    missed = (await round("MISSED")).word;
    assert.notEqual(
      await page.locator(".cardPromptRomaji").innerText(),
      missed,
      "a missed word never returns as the next prompt",
    );
  }
  let guard = 0;
  let missedRarity = null;
  while (!(await page.locator(".resultCount").count())) {
    assert.ok(++guard < 16, "a run should finish inside its own deck");
    const isMissed = (await page.locator(".cardPromptRomaji").innerText()) === missed;
    const { cells } = await round("GOT IT");
    if (guard === 1) assert.ok(cells >= 2, `the reveal draws a cell per character, got ${cells}`);
    await page.waitForSelector(".earnCard");
    if (isMissed) missedRarity = await page.locator(".earnLabel").innerText();
    await page.click(".roundEarned");
  }
  return missedRarity;
}

// 10.3 one finished run earns exactly one copy of every word
const missedRarity = await playRun();
assert.equal(missedRarity, "BASE · 2 TRIES", "a word written on its second try is base, not shiny");
assert.match(await page.locator(".resultCount").innerText(), /^10\s*EARNED$/);
assert.equal(await page.locator(".resultShiny").innerText(), "9 SHINY");
assert.equal(await page.locator(".resultRest").innerText(), "1 BASE · 0 WORN");
assert.equal(await page.locator(".resultGrid .card").count(), 10, "past five, the hand is a grid");
await page.click("button:has-text('BACK TO DECK')");
await page.click(".setRow");
const afterOne = await totals();
assert.equal(sum(afterOne), 10, "the run earned one copy per word, in one write");
assert.ok(afterOne[1] >= 1, "and at least one of them is base");
assert.equal(
  await page.locator("button:has-text('DEAL')").count(),
  1,
  "a set is never finished — DEAL is always there",
);
await page.click("button:has-text('VIEW COLLECTION')");
assert.equal(await page.locator(".collectionRowEmpty").count(), 0, "every word now has a face");
assert.equal(await page.locator(".collectionRow .card").count(), 10, "one card each, one stock each");
assert.equal(await page.locator(".collectionRow .cardWord").count(), 10);
const rowSums = async () =>
  Promise.all(
    (await page.locator(".collectionRow").all()).map(async (row) =>
      sum((await row.locator(".collectionTimes").allInnerTexts()).map((t) => parseInt(t.slice(1), 10))),
    ),
  );
assert.deepEqual(await rowSums(), Array(10).fill(1), "one copy per word, no more, no less");
console.log("run 1: 10 EARNED, one copy of every word, S6d shows ten faces");

// 10.4 a replay earns a second copy of the same ten words
await page.click(".backLink"); // ← back to the set
await playRun({ missFirst: false });
await page.click("button:has-text('BACK TO DECK')");
await page.click(".setRow");
assert.equal(sum(await totals()), 20, "the second run stacked on the first");
await page.click("button:has-text('VIEW COLLECTION')");
assert.deepEqual(await rowSums(), Array(10).fill(2), "every word is two copies deep");
console.log("run 2: the set replays and the copies stack");
await page.click(".backLink"); // ← back to the set

// 10.5 leaving costs the run — and cancelling costs nothing
const banked = await totals();
await page.click("button:has-text('DEAL')");
await round("GOT IT");
await page.click(".roundEarned");
await round("GOT IT"); // ink is on the canvas, the card is not yet flipped away
await page.click(".roundEarned");
await page.click(".quit");
await page.waitForSelector(".dialogPanel");
assert.match(await page.locator(".dialogPanel .jokerLine").textContent(), /Leave now/);
await page.click("button:has-text('KEEP WRITING')");
assert.equal(await page.locator(".dialogPanel").count(), 0, "cancel closes the dialog");
assert.equal(await page.locator(".canvasBox").count(), 1, "and the run is still standing");
const held = await page.locator(".roundDeck").innerText();
assert.match(held, /HAND 2/, "the hand it held is untouched");
await page.click(".quit");
await page.click("button:has-text('LEAVE RUN')");
await page.waitForSelector("button:has-text('DEAL')");
assert.deepEqual(await totals(), banked, "leaving a run earns nothing at all");
console.log("abandon: KEEP WRITING resumes the run, LEAVE RUN discards it whole");

// 10.6 and neither does a reload
await page.click("button:has-text('DEAL')");
await round("GOT IT");
await page.click(".roundEarned");
await page.reload();
await openDeck("HIRAGANA");
await page.click(".setRow");
assert.deepEqual(await totals(), banked, "a run that never finished was never written");
console.log("reload: an unfinished run leaves storage exactly as it found it");

// 10.7 a v2 blob is wiped once, with a line about it, and keeps its characters
await page.evaluate(() => {
  localStorage.setItem(
    "kanahero:v1",
    JSON.stringify({
      v: 2,
      earned: ["あ", "い", "う"],
      setChoice: "all",
      script: "hiragana",
      joker: {
        "everyday-hiragana": { はい: { tries: 1, rarity: "foil", earnedAt: "2026-01-01T00:00:00Z" } },
      },
    }),
  );
});
await page.goto(URL);
await page.waitForSelector(".deckRow");
assert.match(
  await page.locator(".jokerLine").textContent(),
  /reshuffled/,
  "he owns the wipe on the way in",
);
await page.click(".deckRow:has-text('HIRAGANA')"); // reading it spends it
await page.click("button:has-text('Start session')");
assert.equal(await charCount(), "3", "the characters the v2 blob earned are still there");
await page.click(".setRow");
assert.deepEqual(await totals(), [0, 0, 0], "the v2 cards are gone, not converted");
await page.goto(URL);
await page.waitForSelector(".deckRow");
assert.equal(
  await page.locator(".jokerLine").textContent(),
  "Pick a deck. I'll deal, you write.",
  "and he says it exactly once",
);
console.log("migration: v2 cards wiped once, characters kept, one line about it");

// 10.8 nothing anywhere still calls it foil.
// This file is the one exemption, and it is the reason for the rule: it has to
// write a v2 blob with a foil card in it to prove the migration throws one away.
const SRC = ["lib", "components", "app", "scripts"];
const SELF = path.resolve(import.meta.filename);
const offenders = [];
for (const dir of SRC) {
  const root = path.join(import.meta.dirname, "..", dir);
  const walk = async (d) => {
    for (const entry of await readdir(d, { withFileTypes: true })) {
      if (entry.name.startsWith(".")) continue;
      const full = path.join(d, entry.name);
      if (entry.isDirectory()) await walk(full);
      else if (/\.(ts|tsx|css|mjs|json)$/.test(entry.name) && path.resolve(full) !== SELF) {
        if (/foil/i.test(await readFile(full, "utf8"))) offenders.push(full);
      }
    }
  };
  await walk(root);
}
assert.deepEqual(offenders, [], `foil survives in: ${offenders.join(", ")}`);
console.log("rename: no 'foil' left in lib, components, app or scripts");

await browser.close();
kill();
console.log("\nALL CHECKS PASSED");
process.exit(0);
