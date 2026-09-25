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
//  10.9 The receipt (SPEC-v6): every earned copy keeps the ink that earned it,
//      in its own store; the card view holds for it, swipes through copies,
//      dates the chip; the export carries the receipts; a v3 blob is wiped
//      once, receipts and all, with a line about it; a copy whose receipt
//      never wrote is one legacy card per stock
//   9. A self-intersecting stroke animates as ONE pen stroke: its clipped
//      copies run concurrently, not one after the other

import assert from "node:assert/strict";
import { execFile, spawn } from "node:child_process";
import { mkdtemp, readFile, readdir } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { chromium } from "playwright";

const run = promisify(execFile);

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
const page = await browser.newPage({
  viewport: { width: 390, height: 844 },
  // The round is animated now (the deal, the melt, the hand tick, the S8
  // reveal). Every one of them has a reduced-motion path that lands on the
  // same end state, so the assertions here are about the app, not the clock.
  reducedMotion: "reduce",
});
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

/** which line he is saying, by corpus id — never his wording: with pools that
    would be a coin flip, and the corpus owns the words (SPEC-v5b §6) */
const said = async (scope = "") => {
  // he picks his line in an effect, a tick after the screen paints — the panel
  // is there first, at its full height, and the id arrives with the words
  await page.waitForSelector(`${scope} .jokerPanel[data-line]`.trim());
  return page.locator(`${scope} .jokerPanel`.trim()).getAttribute("data-line");
};

/** the three stock counts under the grid, as numbers */
const totals = async () =>
  (await page.locator(".setTotal").allInnerTexts()).map((t) => parseInt(t, 10));
const sum = (xs) => xs.reduce((a, b) => a + b, 0);
assert.deepEqual(await totals(), [0, 0, 0], "a set with no finished run owns nothing");

/** every receipt in IndexedDB, strokes summarised — and never a database
    created by asking: an open with no version would make one with no store */
const receipts = () =>
  page.evaluate(async () => {
    const dbs = await indexedDB.databases();
    if (!dbs.some((d) => d.name === "kanahero-receipts")) return [];
    return new Promise((resolve, reject) => {
      const req = indexedDB.open("kanahero-receipts");
      req.onerror = () => reject(req.error);
      req.onsuccess = () => {
        const db = req.result;
        const all = db.transaction("receipts").objectStore("receipts").getAll();
        all.onsuccess = () => {
          db.close();
          resolve(
            all.result.map((r) => ({
              ...r,
              strokes: r.strokes.length,
              points: r.strokes.reduce((n, s) => n + s.length / 3, 0),
            })),
          );
        };
        all.onerror = () => reject(all.error);
      };
    });
  });
/** the chip's date, the way the card prints it: m-d-yy, no leading zeros */
const today = (() => {
  const d = new Date();
  return `${d.getMonth() + 1}-${d.getDate()}-${String(d.getFullYear()).slice(-2)}`;
})();
/** the overlay's backdrop — the one place a tap puts the card back */
const tapOutside = () => page.mouse.click(8, 8);

// 10.1b the MEANING switch (SPEC-v5e): one run-level choice, made here, held
// for the run, remembered per set
/** his line once it has moved on from `was` — a flip is a new beat */
const lineFlipped = async (was) => {
  await page.waitForFunction(
    (before) => {
      const id = document.querySelector(".jokerPanel")?.dataset.line;
      return id && id !== before;
    },
    was,
  );
  return page.getAttribute(".jokerPanel", "data-line");
};
const chosen = async () => page.locator(".setMeaning .toggleOn").innerText();
assert.equal(await chosen(), "ON", "meaning defaults on");
assert.equal(await said(), "set.01", "and he deals the words as usual");
await page.click(".setMeaning .toggleOpt:has-text('OFF')");
assert.equal(await chosen(), "OFF");
assert.equal(await lineFlipped("set.01"), "set.02", "his line answers the choice");
assert.equal(await page.locator(".setMeaningHint").innerText(), "Kana + romaji only");
await page.click("button:has-text('DEAL')");
await page.waitForSelector(".roundCard");
assert.equal(await page.locator(".setMeaning").count(), 0, "locked at DEAL: no switch on S7");
assert.equal(await page.locator(".roundCard .cardMeaning").count(), 0, "the prompt carries no English");
assert.equal(await page.locator(".roundCard .cardMeaningOff").innerText(), "MEANING OFF");
assert.equal(await page.locator(".roundCard .cardKind").innerText(), "WORD · NO KANA YET", "the class tag stays");
{
  // the flipped card is still the prompt face, and still bare
  const box = await page.locator("canvas.ink").boundingBox();
  await page.mouse.move(box.x + box.width * 0.3, box.y + box.height * 0.35);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.7, box.y + box.height * 0.6, { steps: 5 });
  await page.mouse.up();
  await page.click("button:has-text('FLIP')");
  await page.waitForSelector(".wordReveal svg path");
  assert.equal(await page.locator(".roundCard .cardMeaning").count(), 0, "the reveal is bare too");
  assert.equal(await page.locator(".roundCard .cardKind").innerText(), "ATTEMPT 1");
  // the peek: the card gives its English up for a second as it leaves, then
  // the next prompt comes in bare again (SPEC-v5e §2)
  const word = await page.locator(".roundCard .cardPromptRomaji").innerText();
  await page.click("button:has-text('GOT IT')");
  await page.waitForSelector(".roundCardPeek .cardMeaning"); // it shows on the way out
  await page.waitForSelector(".roundCardPeek", { state: "detached" });
  assert.equal(await page.locator(".roundCard .cardMeaningOff").innerText(), "MEANING OFF");
  assert.notEqual(
    await page.locator(".roundCard .cardPromptRomaji").innerText(),
    word,
    "and only then does the next prompt come up",
  );
}
await page.click(".quit");
await page.click("button:has-text('LEAVE RUN')");
await page.waitForSelector("button:has-text('DEAL')");
assert.equal(await chosen(), "OFF", "the choice survives the run");
await openDeck("KATAKANA");
await page.click(".setRow");
await page.waitForSelector("button:has-text('DEAL')");
assert.equal(await chosen(), "ON", "and it is per set: another set is still on");
await openDeck("HIRAGANA");
await page.click(".setRow");
await page.waitForSelector("button:has-text('DEAL')");
assert.equal(await chosen(), "OFF", "remembered when the set is opened again");
await page.click(".setMeaning .toggleOpt:has-text('ON')");
assert.equal(await lineFlipped("set.02"), "set.01");
await page.click("button:has-text('DEAL')");
await page.waitForSelector(".roundCard");
assert.equal(await page.locator(".roundCard .cardMeaningOff").count(), 0);
assert.notEqual(await page.locator(".roundCard .cardMeaning").innerText(), "", "ON deals the meaning back");
await page.click(".quit");
await page.click("button:has-text('LEAVE RUN')");
await page.waitForSelector("button:has-text('DEAL')");
assert.deepEqual(await totals(), [0, 0, 0], "and none of that earned anything");
console.log("S6b: the meaning switch — defaults on, answered by him, locked at DEAL, remembered per set");

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
assert.equal(await said(), "collection.empty.01", "he says the shelf is empty");
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

/** the S7c markup, which must not exist at any point in a run (§9.6.2) */
const S7C = ".roundEarned, .earnStack, .earnLabel, .earnCard, .earnNote, .handStrip, .handCard";

/** the header's HAND count, which ticks as the card lands in it */
const handCount = async () =>
  parseInt((await page.locator(".roundHand").innerText()).replace(/\D/g, ""), 10);

/** play a whole run out, missing the first word once. Returns the missed word. */
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
  while (!(await page.locator(".resultCount").count())) {
    assert.ok(++guard < 16, "a run should finish inside its own deck");
    const before = await handCount();
    const { cells } = await round("GOT IT");
    if (guard === 1) assert.ok(cells >= 2, `the reveal draws a cell per character, got ${cells}`);
    assert.equal(await page.locator(S7C).count(), 0, "S7c is gone, at every point in the run");
    if (await page.locator(".resultCount").count()) break;
    // §9.6.1: the next prompt is already up, with no tap in between, and the
    // hand has the card the last one earned
    assert.equal(await page.locator(".canvasBox").count(), 1, "the next prompt needs no tap");
    assert.equal(await handCount(), before + 1, "the hand ticked as the card landed in it");
    assert.equal(await page.locator("button:has-text('FLIP')").count(), 1);
  }
  return missed;
}

// 10.3 one finished run earns exactly one copy of every word
const missedWord = await playRun();

// §9.6.4: the run reached storage before S8 ever mounted — the reveal is
// presentation, and leaving in the middle of it costs nothing
const storedAtMount = await page.evaluate(
  () => JSON.parse(localStorage.getItem("kanahero:v1")).joker["everyday-hiragana"],
);
assert.equal(
  Object.values(storedAtMount).reduce((n, row) => n + row.shiny + row.base + row.worn, 0),
  10,
  "the run was written before S8 mounted",
);

// §9.6.3: with motion off, S8 arrives finished — every card up, counts final
assert.equal(await page.locator(".revealSlot").count(), 10, "every card is in its slot");
assert.equal(await page.locator(".revealUp").count(), 10, "and face up, motion being off");
assert.deepEqual(
  (await page.locator(".revealFaceUp .card").evaluateAll((els) =>
    els.map((el) => [...el.classList].find((c) => /^card-(shiny|base|worn)$/.test(c))),
  )).filter((c, i, all) => i === 0 || c !== all[i - 1]),
  ["card-base", "card-shiny"],
  "worn, then base, then shiny — the best card of the run lands last",
);
assert.equal(
  await page.locator(".resultRows .card-base .cardRomaji").first().innerText(),
  missedWord,
  "the word missed once is the base card, not a shiny",
);
assert.match(await page.locator(".resultCount").innerText(), /^10\s*EARNED$/);
assert.equal(await page.locator(".resultShiny").innerText(), "9 SHINY");
assert.equal(await page.locator(".resultRest").innerText(), "1 BASE · 0 WORN");
assert.equal(await page.locator(".resultRow").count(), 2, "ten cards is seven and three");
assert.deepEqual(
  await page.locator(".resultRow").evaluateAll((rows) => rows.map((r) => r.children.length)),
  [7, 3],
  "seven to a row, the short row left-aligned",
);
assert.equal(
  await page.locator(".resultNote").innerText(),
  "10 NEW STOCK · 0 COPIES TO THE COLLECTION",
  "the first run on a set is ten stocks nobody had",
);
assert.equal(await said(), "result.01", "and he counts it up once the last card has landed");

// a tap on a card opens its whole face — stock and tries, the mark, the word,
// its reading and what it means — over the screen. A tap on the card does
// nothing; a tap outside puts it back (SPEC-v6 §5.1). Held — here toggled with
// Enter, which is the hold for a keyboard — it turns into its receipt: the ink
// from run state, the model over it, the attempt on the foot (§5.2, §5.5).
await page.locator(".resultRows .revealSlot").first().click();
assert.equal(await page.locator(".cardView .receiptCard").count(), 1, "the full face opens, one card");
assert.match(
  await page.locator(".cardView .cardChip").innerText(),
  /^(SHINY|BASE|WORN) · (1st TRY|2nd TRY|\d+ TRIES)$/,
  "the face carries its stock and the tries that earned it",
);
assert.equal(await page.locator(".cardView .cardMeaning").count(), 1, "and what it means");
assert.equal(await page.locator(".receiptPager").count(), 0, "one card from one run: nothing to page");
assert.equal(await page.locator(".receiptLegendBlank").count(), 0, "the legend is lit: this card has ink");
await page.locator(".receiptCard").click();
assert.equal(await page.locator(".cardView").count(), 1, "a tap on the card does nothing");
await page.locator(".receiptCard").focus();
await page.keyboard.press("Enter");
await page.waitForSelector(".receiptHeld .receiptInk");
assert.match(await page.locator(".receiptHeld .cardKind").innerText(), /^ATTEMPT \d+$/, "held: the foot reads the attempt");
assert.equal(await page.locator(".receiptHeld .cardMeaning").count(), 0, "held: the meaning goes");
await page.waitForSelector(".receiptHeld .wordRevealCell svg");
assert.ok((await page.locator(".receiptHeld .wordRevealCell").count()) >= 1, "held: the model is laid over the ink");
assert.equal(await page.locator(".receiptHeld .cardChip").count(), 1, "held: the chip stays");
await page.keyboard.press("Enter");
assert.equal(await page.locator(".receiptHeld").count(), 0, "released: the print is back");
await tapOutside();
assert.equal(await page.locator(".cardView").count(), 0, "a tap outside puts it back");

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
await page.locator(".collectionRow .card").first().click();
assert.equal(await page.locator(".cardView .receiptCard").count(), 1, "a shelf card opens too: one copy, one card");
assert.equal(
  await page.locator(".cardView .cardChip").innerText(),
  `SHINY · ${today}`,
  "a receipted copy's chip is the date it was earned (SPEC-v6 §5.3)",
);
assert.equal(await page.locator(".receiptPager").count(), 0, "one copy: no pager");
await tapOutside();
assert.equal(await page.locator(".cardView").count(), 0);

// 10.9a the receipts landed with the run: one per word, the missed word's
// counting its second try, every one with ink, all sharing the finishing write
const kept = await receipts();
assert.equal(kept.length, 10, "one receipt per copy, written with the run");
assert.deepEqual(
  kept.map((r) => r.tries).sort(),
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 2],
  "the receipt remembers the tries the count forgot",
);
assert.ok(kept.every((r) => r.strokes > 0 && r.points > 1), "every receipt carries ink");
assert.ok(kept.every((r) => r.box.w > 0 && r.box.h > 0), "and the board it was drawn on");
assert.equal(new Set(kept.map((r) => r.earnedAt)).size, 1, "every receipt of a run shares its moment");
assert.equal(new Set(kept.map((r) => r.seed)).size, 1, "and its seed");
assert.equal(kept.filter((r) => r.rarity === "base").length, 1, "the missed word's receipt is base");
console.log("receipts: ten kept with the run, tries and ink and all");
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

// 10.9b two copies of one stock are two cards on the track, newest first,
// each dated, and the pager steps through them (SPEC-v6 §5.3)
{
  // a word shiny in both runs — the one missed in run 1 is shiny once, base once
  const twice = page.locator('.collectionSlot-shiny:has(.collectionTimes:text-is("×2")) .card').first();
  assert.equal(await twice.count(), 1, "a word shiny twice has one shiny slot to open");
  await twice.click();
  assert.equal(await page.locator(".cardView .receiptCard").count(), 2, "two copies, two cards");
  assert.equal(await page.locator(".receiptPage").innerText(), "1 / 2");
  assert.ok(await page.locator(".receiptStep").first().isDisabled(), "‹ is dead at the newest");
  await page.click(".receiptStep:not([disabled])");
  assert.equal(await page.locator(".receiptPage").innerText(), "2 / 2", "› steps to the older copy");
  assert.ok(await page.locator(".receiptStep").last().isDisabled(), "› is dead at the oldest");
  for (const chip of await page.locator(".cardView .cardChip").allInnerTexts()) {
    assert.equal(chip, `SHINY · ${today}`, "every copy carries its own date");
  }
  await tapOutside();
  assert.equal(await page.locator(".cardView").count(), 0);
  assert.equal((await receipts()).length, 20, "two runs, twenty receipts");
  console.log("stack: two copies page as two cards, newest first");
}

// 10.9c the export carries the receipts — and is live with no photos at all
{
  await goHome();
  await page.click(".bankStrip");
  await page.click("button:has-text('OPEN BANK')");
  await page.waitForSelector(".bankExport");
  assert.equal(await page.locator(".bankExport").isDisabled(), false, "cards with no photos still leave (SPEC-v6 §6)");
  const [download] = await Promise.all([page.waitForEvent("download"), page.click(".bankExport")]);
  const tmp = await mkdtemp(path.join(os.tmpdir(), "kanahero-receipts-"));
  const zipPath = path.join(tmp, download.suggestedFilename());
  await download.saveAs(zipPath);
  await run("unzip", ["-t", zipPath]);
  await run("unzip", ["-o", "-q", zipPath, "-d", path.join(tmp, "unpacked")]);
  const manifest = JSON.parse(await readFile(path.join(tmp, "unpacked", "manifest.json"), "utf8"));
  assert.equal(manifest.version, 2);
  assert.equal(manifest.captures.length, 0);
  assert.equal(manifest.receipts, 20, "the manifest counts them");
  const exported = JSON.parse(await readFile(path.join(tmp, "unpacked", "receipts.json"), "utf8"));
  assert.equal(exported.format, "kanahero-receipts");
  assert.equal(exported.receipts.length, 20, "and receipts.json carries them, strokes inline");
  assert.ok(exported.receipts.every((r) => Array.isArray(r.strokes) && r.strokes.length > 0));
  assert.ok(exported.receipts.every((r, i, all) => i === 0 || all[i - 1].earnedAt <= r.earnedAt), "oldest first");
  console.log("export: the receipts leave with the cards");
  await goHome();
  await openDeck("HIRAGANA");
  await page.click(".setRow");
}

// 10.5 leaving costs the run — and cancelling costs nothing
const banked = await totals();
await page.click("button:has-text('DEAL')");
await round("GOT IT");
await round("GOT IT"); // ink is on the canvas, the card is not yet flipped away
await page.click(".quit");
await page.waitForSelector(".dialogPanel");
assert.equal(await said(".dialogPanel"), "abandon.01", "the dialog is his, and he owns the cost");
await page.click("button:has-text('KEEP WRITING')");
assert.equal(await page.locator(".dialogPanel").count(), 0, "cancel closes the dialog");
assert.equal(await page.locator(".canvasBox").count(), 1, "and the run is still standing");
const held = await page.locator(".roundDeck").innerText();
assert.match(held, /HAND 2/, "the hand it held is untouched");
await page.click(".quit");
await page.click("button:has-text('LEAVE RUN')");
await page.waitForSelector("button:has-text('DEAL')");
assert.deepEqual(await totals(), banked, "leaving a run earns nothing at all");
assert.equal((await receipts()).length, 20, "and leaves no receipt behind");
console.log("abandon: KEEP WRITING resumes the run, LEAVE RUN discards it whole");

// 10.6 and neither does a reload
await page.click("button:has-text('DEAL')");
await round("GOT IT");
await page.reload();
await openDeck("HIRAGANA");
await page.click(".setRow");
assert.deepEqual(await totals(), banked, "a run that never finished was never written");
assert.equal((await receipts()).length, 20, "receipts included");
console.log("reload: an unfinished run leaves storage exactly as it found it");

// 10.9d the v4 wipe (SPEC-v6 §2.4): a v3 blob's cards go on load, and the
// receipts with them; the characters stay, and he says so once
await goHome();
const charsBefore = await page.evaluate(() => JSON.parse(localStorage.getItem("kanahero:v1")).earned.length);
await page.evaluate(() => {
  const blob = JSON.parse(localStorage.getItem("kanahero:v1"));
  blob.v = 3;
  localStorage.setItem("kanahero:v1", JSON.stringify(blob));
});
await page.goto(URL);
await page.waitForSelector(".deckRow");
assert.match(await said(), /^home\.wiped\.0[12]$/, "he owns the wipe on the way in");
assert.equal(
  await page.evaluate(() => JSON.parse(localStorage.getItem("kanahero:v1")).v),
  4,
  "the blob is v4 at once",
);
assert.equal(
  await page.evaluate(() => JSON.parse(localStorage.getItem("kanahero:v1")).earned.length),
  charsBefore,
  "the characters survive the wipe",
);
await page.click(".deckRow:has-text('HIRAGANA')"); // reading the line spends it
await page.click("button:has-text('Start session')");
await page.click(".setRow");
assert.deepEqual(await totals(), [0, 0, 0], "the shelf is bare: every pre-receipt copy is gone");
assert.equal((await receipts()).length, 0, "and the receipts went with the cards they belonged to");
console.log("wipe: v3 cards and their receipts go, characters stay, one line about it");

// 10.9e a copy with no receipt — a write that failed — is one legacy card per
// stock, counted on the chip, with no hold and no pager
await page.evaluate(() => {
  const blob = JSON.parse(localStorage.getItem("kanahero:v1"));
  blob.joker = { "everyday-hiragana": { はい: { shiny: 1, base: 2, worn: 0 } } };
  localStorage.setItem("kanahero:v1", JSON.stringify(blob));
});
await page.goto(URL);
await openDeck("HIRAGANA");
await page.click(".setRow");
assert.deepEqual(await totals(), [1, 2, 0], "the shelf holds three copies with no receipts");
await page.click("button:has-text('VIEW COLLECTION')");
assert.match(await said(), /^collection\.\d+$/, "his ordinary shelf line — nothing predates receipts now");
await page.locator(".collectionSlot-base .card").first().click();
assert.equal(await page.locator(".cardView .receiptCard").count(), 1, "two copies with no receipt are one legacy card");
assert.equal(await page.locator(".cardView .cardChip").innerText(), "BASE · ×2", "counted on its chip");
assert.equal(await page.locator(".receiptPager").count(), 0, "no pager");
assert.equal(await page.locator(".receiptLegendBlank").count(), 1, "the legend's row is there, blank");
await page.locator(".receiptCard").focus();
await page.keyboard.press("Enter");
assert.equal(await page.locator(".receiptHeld").count(), 0, "and nothing to hold for");
await tapOutside();
console.log("legacy: a copy with no receipt is one counted card per stock");

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
assert.match(await said(), /^home\.wiped\.0[12]$/, "he owns the wipe on the way in");
await page.click(".deckRow:has-text('HIRAGANA')"); // reading it spends it
await page.click("button:has-text('Start session')");
assert.equal(await charCount(), "3", "the characters the v2 blob earned are still there");
await page.click(".setRow");
assert.deepEqual(await totals(), [0, 0, 0], "the v2 cards are gone, not converted");
await page.goto(URL);
await page.waitForSelector(".deckRow");
assert.match(await said(), /^home\.\d+$/, "and then an ordinary home line: he says it once");
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

// --- 11. the Joker draws from pools, and never repeats himself into the
// ground (SPEC-v5b §6). Every assertion here is on a corpus id: a pool makes
// his wording a coin flip, and the corpus — not this file — owns the words.

const fresh = async () => {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const pg = await ctx.newPage();
  pg.setDefaultTimeout(15000);
  return { ctx, pg };
};
const lineOn = async (pg) => {
  await pg.waitForSelector(".jokerPanel[data-line]");
  return pg.getAttribute(".jokerPanel", "data-line");
};
/** the line he moves ON to, once the panel has caught up with the screen — he
    picks in an effect, so the old line is still up for a tick after a tap */
const lineAfter = async (pg, was) => {
  await pg.waitForFunction(
    (before) => {
      const id = document.querySelector(".jokerPanel")?.dataset.line;
      return id && id !== before;
    },
    was,
  );
  return pg.getAttribute(".jokerPanel", "data-line");
};

// 11.1 a browser that has never seen this app gets the introduction, once
{
  const { ctx, pg } = await fresh();
  await pg.goto(URL);
  assert.equal(await lineOn(pg), "home.32", "the first line he ever says is who he is");
  const rest = [];
  for (let i = 0; i < 6; i++) {
    await pg.goto(URL);
    rest.push(await lineOn(pg));
  }
  assert.ok(!rest.includes("home.32"), "and he never introduces himself twice");
  assert.ok(rest.every((id) => /^home\.\d+$/.test(id)), `every later line is a home line: ${rest}`);
  await ctx.close();
  console.log("joker: the introduction is said once, ever");
}

// 11.2 forty loads: the bag hands out every eligible line before any repeat
{
  const { ctx, pg } = await fresh();
  const seen = [];
  for (let i = 0; i < 40; i++) {
    await pg.goto(URL);
    seen.push(await lineOn(pg));
  }
  const firstRepeat = seen.findIndex((id, i) => seen.indexOf(id) !== i);
  const distinct = new Set(seen.slice(0, firstRepeat < 0 ? seen.length : firstRepeat)).size;
  assert.ok(
    distinct >= 20,
    `he got through ${distinct} lines before repeating one — the bag is not shuffling`,
  );
  await ctx.close();
  console.log(`joker: ${distinct} distinct home lines before the first repeat, in forty loads`);
}

// 11.3 the corpus changed under a live bag: the new line is the next one shown
{
  const { ctx, pg } = await fresh();
  // twice: the first line a new browser gets is the introduction, which is a
  // once-line and spends nothing out of a bag
  await pg.goto(URL);
  await lineOn(pg);
  await pg.goto(URL);
  await lineOn(pg);
  await pg.evaluate(() => {
    const raw = JSON.parse(localStorage.getItem("kanahero:v1.joker.bags"));
    // a version that is not the shipped one, with a line that did not exist
    // before it — reconciliation puts new ids at the front
    localStorage.setItem(
      "kanahero:v1.joker.bags",
      JSON.stringify({ v: "stale-corpus", bags: { home: ["not.a.real.line", ...raw.bags.home] } }),
    );
  });
  await pg.goto(URL);
  const after = await lineOn(pg);
  const bag = await pg.evaluate(() =>
    JSON.parse(localStorage.getItem("kanahero:v1.joker.bags")),
  );
  assert.ok(!bag.bags.home.includes("not.a.real.line"), "an id that no longer exists is dropped");
  assert.match(after, /^home\.\d+$/, "and he carries on from a reconciled bag");
  await ctx.close();
  console.log("joker: a corpus change drops dead ids and keeps him talking");
}

// 11.4 the aside that belongs to STATION, and only to STATION
{
  const { ctx, pg } = await fresh();
  const stepThrough = async (setName, limit) => {
    await pg.goto(URL);
    await pg.click(".deckRow:has-text('KANJI')");
    await pg.click("button:has-text('Start session')");
    await pg.click(`.setRow:has-text("${setName}")`);
    await pg.click("button:has-text('DEAL')");
    const said = [];
    for (let i = 0; i < limit; i++) {
      // sample the PROMPT's line: FLIP on screen means the write phase is up,
      // so this can never read the line the reveal before it left behind
      await pg.waitForSelector("button:has-text('FLIP')");
      await pg.waitForSelector(".jokerPanel[data-line]");
      said.push({
        id: await pg.getAttribute(".jokerPanel", "data-line"),
        text: (await pg.locator(".jokerLine").textContent()).trim(),
      });
      const box = await pg.locator("canvas.ink").boundingBox();
      await pg.mouse.move(box.x + box.width * 0.3, box.y + box.height * 0.35);
      await pg.mouse.down();
      await pg.mouse.move(box.x + box.width * 0.7, box.y + box.height * 0.6, { steps: 5 });
      await pg.mouse.up();
      await pg.click("button:has-text('FLIP')");
      await pg.click("button:has-text('GOT IT')");
      if (await pg.locator(".resultCount").count()) break;
    }
    return said;
  };

  const station = await stepThrough("STATION", 10);
  const aside = station.find((l) => l.id === "station-kanji/kuchi");
  assert.ok(aside, `the station aside never came up: ${station.map((l) => l.id).join(" ")}`);
  assert.match(aside.text, /Seven/, `it counts the set it is about, got "${aside.text}"`);

  const test = await stepThrough("TEST", 5);
  assert.ok(
    !test.some((l) => l.id === "station-kanji/kuchi"),
    "and it cannot be spent in a set it is not about",
  );
  await ctx.close();
  console.log("joker: the 口 aside fires in STATION, says Seven, and never fires in TEST");
}

// 11.5 he reacts to the card just graded, not the one now in front of him.
// By the time an `earned.*` line goes up the prompt has already moved on, so
// `{tries}` is the one token that can silently count the wrong card. The bag
// is seeded to the single worn line that carries it, to pin the number.
{
  const { ctx, pg } = await fresh();
  // twice: the first line a new browser gets is the introduction, a once-line
  // that spends nothing, so there is no bag to read the hash off yet
  await pg.goto(URL);
  await lineOn(pg);
  await pg.goto(URL);
  await lineOn(pg);
  await pg.evaluate(() => {
    const raw = JSON.parse(localStorage.getItem("kanahero:v1.joker.bags"));
    // the shipped corpus hash, so this is a seeded bag and not a stale one
    localStorage.setItem(
      "kanahero:v1.joker.bags",
      JSON.stringify({ v: raw.v, bags: { ...raw.bags, "earned.worn": ["earned.worn.02"] } }),
    );
    // and the STATION aside is spent before the run starts: it is a once-line,
    // it outranks any earned line, and whether it has already fired otherwise
    // depends on which word the shuffle deals first
    const seen = JSON.parse(localStorage.getItem("kanahero:v1.joker.seen") ?? "[]");
    localStorage.setItem(
      "kanahero:v1.joker.seen",
      JSON.stringify([...seen, "station-kanji/kuchi"]),
    );
  });

  await pg.goto(URL);
  await pg.click(".deckRow:has-text('KANJI')");
  await pg.click("button:has-text('Start session')");
  await pg.click(".setRow:has-text('STATION')");
  await pg.click("button:has-text('DEAL')");

  // miss whatever comes up until some word is on its third attempt — the card
  // itself says which attempt it is, so nothing here has to track the queue
  let reaction = null;
  let reached = 0;
  let showing = await lineOn(pg);
  for (let i = 0; i < 24 && !reaction; i++) {
    const box = await pg.locator("canvas.ink").boundingBox();
    await pg.mouse.move(box.x + box.width * 0.3, box.y + box.height * 0.35);
    await pg.mouse.down();
    await pg.mouse.move(box.x + box.width * 0.7, box.y + box.height * 0.6, { steps: 5 });
    await pg.mouse.up();
    await pg.click("button:has-text('FLIP')");
    showing = await lineAfter(pg, showing);
    const attempt = parseInt(
      (await pg.locator(".roundCard .cardKind").innerText()).replace(/\D/g, ""),
      10,
    );
    if (attempt < 3) {
      await pg.click("button:has-text('MISSED')");
      showing = await lineAfter(pg, showing);
      continue;
    }
    reached = attempt;
    await pg.click("button:has-text('GOT IT')");
    if (await pg.locator(".resultCount").count()) break;
    showing = await lineAfter(pg, showing);
    reaction = {
      id: showing,
      text: (await pg.locator(".jokerLine").textContent()).trim(),
    };
  }
  assert.equal(reached, 3, "no word ever reached a third attempt");
  assert.ok(reaction, "the third attempt never got graded");
  assert.equal(reaction.id, "earned.worn.02", "a card that took three tries is worn stock");
  assert.match(
    reaction.text,
    /^Three tries\b/,
    `he counts the card he just graded, not the next prompt — got "${reaction.text}"`,
  );
  await ctx.close();
  console.log("joker: the earned line counts the card just graded, three tries deep");
}

// --- 12. S8 with motion on: face down, then turned over, and skippable
// (SPEC-v5a §9.6)
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const pg = await ctx.newPage();
  pg.setDefaultTimeout(15000);
  await pg.goto(URL);
  await pg.click(".deckRow:has-text('KANJI')");
  await pg.click("button:has-text('Start session')");
  await pg.click(".setRow:has-text('TEST')");
  await pg.click("button:has-text('DEAL')");
  for (let i = 0; i < 6 && !(await pg.locator(".resultCount").count()); i++) {
    const box = await pg.locator("canvas.ink").boundingBox();
    await pg.mouse.move(box.x + box.width * 0.3, box.y + box.height * 0.35);
    await pg.mouse.down();
    await pg.mouse.move(box.x + box.width * 0.7, box.y + box.height * 0.6, { steps: 5 });
    await pg.mouse.up();
    await pg.click("button:has-text('FLIP')");
    await pg.click("button:has-text('GOT IT')");
  }
  await pg.waitForSelector(".resultCount");
  assert.equal(await pg.locator(".revealUp").count(), 0, "S8 mounts with every card face down");
  assert.match(await pg.locator(".resultCount").innerText(), /^0\s*EARNED$/, "and nothing counted");
  assert.equal(await pg.locator(".jokerPanel[data-line]").count(), 0, "he waits for the last card");

  // a tap anywhere hurries the rest of the hand over: every card still turns,
  // it just stops taking its time, so the whole of it lands inside a second
  const slots = await pg.locator(".revealSlot").count();
  const tapped = Date.now();
  await pg.click(".resultTally");
  await pg.waitForFunction(
    (n) => document.querySelectorAll(".revealUp").length === n,
    slots,
    { timeout: 2000 },
  );
  assert.ok(Date.now() - tapped < 2000, "a hurried reveal is over in well under two seconds");
  assert.match(await pg.locator(".resultCount").innerText(), new RegExp(`^${slots}\\s*EARNED$`));
  assert.equal(await lineOn(pg), "result.01", "and he speaks as the last one lands");
  await ctx.close();
  console.log("S8: mounts face down at zero, and one tap hurries the rest over");
}

await browser.close();
kill();
console.log("\nALL CHECKS PASSED");
process.exit(0);
