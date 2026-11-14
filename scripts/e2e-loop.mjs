// End-to-end check of the v7 loop against the static export in `out/`
// (SPEC-v7-skeleton §9). Not a test suite — a verification script.
// Run: npm run build && node scripts/e2e-loop.mjs
//
// The clock is pinned per step (Date only — timers run for real), so "the next
// day" is a line of code. Walks:
//   1. first-ever launch lands on S0: six sets, no test set
//   2. a set's first open asks the placement question, once
//   3. first run: every item is a study trial; the board is gated on ink; the
//      board is the same box on S3 and S4; a miss requeues five later and
//      comes back as plain retrieval; the prompt never shows the written form
//   4. S5 lists the session; CLOSE lands on a done set with no button
//   5. the ledger has a row per grade and one per session, and exports
//   6. next day: launch lands on Today for the last set; due is dealt, blind;
//      a got-it climbs a rung; a miss then a same-day got-it does not
//   7. ✕ leaves mid-deal and keeps what was graded; the cap is counted per word
//   8. the day after: due first, then new
//   9. WRITE ANYWAY deals new first, then tomorrow's — never further
//  10. "I can already write some" deals blind and lands a got-it on rung 2
//  11. v6 progress is imported once, due today, and the v6 blob is not touched

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { chromium } from "playwright";
import { counts, ledger, playItem, readPrompt, row, serveOut, stored } from "./e2e-lib.mjs";

const { url: BASE, kill } = await serveOut(3211);
const browser = await chromium.launch();
const VIEW = { viewport: { width: 390, height: 844 }, reducedMotion: "reduce", acceptDownloads: true };

const DAY1 = new Date(2026, 10, 14, 10, 0);
const DAY2 = new Date(2026, 10, 15, 10, 0);
const DAY3 = new Date(2026, 10, 16, 10, 0);

const context = await browser.newContext(VIEW);
const page = await context.newPage();
page.setDefaultTimeout(20000);
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));

const big = () => page.locator(".v7Counts").innerText();
const toSets = async () => {
  await page.click(".v7HeadLink");
  await page.waitForSelector(".v7SetRow");
};

// --- 1. first-ever launch ---
await page.clock.setFixedTime(DAY1);
await page.goto(BASE);
await page.waitForSelector(".v7SetRow");
const names = (await page.locator(".v7SetName").allInnerTexts()).map((t) => t.replace(/\s+/g, " "));
assert.deepEqual(names, [
  "DAILY BASICS hiragana",
  "COUNTRIES katakana",
  "DAILY BASICS kanji",
  "STATION kanji",
  "CALENDAR kanji",
  "N5 MOCK words",
]);
assert.equal(await counts(page, "N5 MOCK", "words"), "0 due · 9 new");
assert.equal(await counts(page, "CALENDAR", "kanji"), "0 due · 10 new");
console.log("1. first launch lands on the set list: six sets, each with its counts");

// --- 2. placement, once ---
await row(page, "N5 MOCK", "words").click();
await page.waitForSelector(".v7Question");
await page.click("button:has-text('New to these')");
assert.equal(await big(), "0 due · 9 new");
assert.equal(await page.locator(".v7SpreadCard").count(), 9, "the spread shows one card per item");
assert.equal(await page.locator(".v7SpreadDue").count(), 0);
await toSets();
await row(page, "N5 MOCK", "words").click();
await page.waitForSelector(".v7Counts");
assert.equal(await page.locator(".v7Question").count(), 0, "placement is never asked twice");
console.log("2. placement is asked on a set's first open, and only then");

// --- 3. first run ---
await page.click("button:has-text('DEAL')");
const shown = await readPrompt(page);
assert.ok(shown.trial, "a first exposure is a study trial");
await page.waitForSelector(".v7TrialForm svg path");
await page.waitForSelector("canvas.ink");
assert.ok(await page.locator("button:has-text('DONE')").isDisabled(), "DONE waits for ink");
// ink, CLEAR, and the gate closes again
let box = await page.locator("canvas.ink").boundingBox();
await page.mouse.move(box.x + 60, box.y + 60);
await page.mouse.down();
await page.mouse.move(box.x + 160, box.y + 160, { steps: 4 });
await page.mouse.up();
assert.ok(await page.locator("button:has-text('DONE')").isEnabled());
await page.click("button:has-text('CLEAR')");
assert.ok(await page.locator("button:has-text('DONE')").isDisabled(), "CLEAR empties the board");
// two strokes, UNDO twice: the last stroke goes each time, then the gate closes
for (const y of [60, 120]) {
  await page.mouse.move(box.x + 60, box.y + y);
  await page.mouse.down();
  await page.mouse.move(box.x + 160, box.y + y + 40, { steps: 4 });
  await page.mouse.up();
}
await page.click("button:has-text('UNDO')");
assert.ok(await page.locator("button:has-text('DONE')").isEnabled(), "one stroke is still on the board");
await page.click("button:has-text('UNDO')");
assert.ok(await page.locator("button:has-text('DONE')").isDisabled(), "UNDO takes back the last stroke");
assert.equal(await page.locator(".v7Divider").count(), 2, "新しい: three boxes, two dividers");

const set = JSON.parse(await readFile(new URL("../public/sets/n5-mock-words.json", import.meta.url)));
const order = set.words.map((w) => w.word);
const seen = [];
const first = await playItem(page, false, shown);
seen.push(first);
for (let i = 0; i < 9; i++) seen.push(await playItem(page, true));
assert.deepEqual(first.board, first.revealBoard, "the board does not move between S3 and S4");
assert.deepEqual(
  seen.map((s) => s.word),
  [order[0], ...order.slice(1, 6), order[0], ...order.slice(6)],
  "the missed item came back five places later",
);
assert.deepEqual(
  seen.map((s) => s.trial),
  [true, true, true, true, true, true, false, true, true, true],
  "every first exposure is a trial; the requeue is plain retrieval",
);
assert.equal(seen[0].head, "PROMPT 1 / 9");
assert.equal(seen[6].head, "PROMPT 6 / 9", "a miss does not advance the count");
assert.ok(!seen[6].prompt.includes(order[0]), "the prompt never shows the written form");
assert.equal(seen[6].prompt.replace(/\s+/g, " "), "new あたらしい", "a kanji word: meaning + reading");
console.log("3. first run: trials, the ink gate, a fixed board, and a miss back five later");

// --- 4. done ---
await page.waitForSelector(".v7Done");
assert.equal(await page.locator(".v7DoneRow").count(), 10);
assert.deepEqual(
  (await page.locator(".v7DoneMark").allInnerTexts()).join(""),
  "✗✓✓✓✓✓✓✓✓✓",
);
assert.equal(await page.locator(".v7Done .v7Head").innerText().then((t) => t.replace(/\s+/g, " ")), "DONE SAT 14 NOV");
assert.match(await page.locator(".v7Done .v7Counts").innerText(), /^\d+ min$/);
assert.equal(await page.locator(".v7Done .v7Next").innerText(), "next: 9 due tomorrow");
await page.click("button:has-text('CLOSE')");
assert.equal(await big(), "next: Sun 15 Nov · 9 due");
assert.equal(await page.locator(".v7Today button.actionBar").count(), 0, "a done set has no button");
let st = await stored(page);
assert.deepEqual(
  Object.values(st.items).map((i) => [i.rung, i.due]),
  Array(9).fill([1, "2026-11-15"]),
  "every trial lands on rung 1, due tomorrow",
);
console.log("4. S5 lists the session; the set is done until tomorrow");

// --- 5. the ledger ---
let rows = await ledger(page);
const itemRows = rows.filter((r) => r.type === "item");
assert.equal(itemRows.length, 10);
assert.deepEqual(Object.keys(itemRows[0]).sort(), ["day", "ms", "ok", "setId", "trial", "ts", "type", "word"]);
assert.deepEqual(
  [itemRows[0].day, itemRows[0].setId, itemRows[0].word, itemRows[0].trial, itemRows[0].ok],
  ["2026-11-14", "n5-mock-words", order[0], true, false],
);
assert.ok(itemRows.every((r) => r.ms > 0));
const sessionRows = rows.filter((r) => r.type === "session");
assert.equal(sessionRows.length, 1);
assert.deepEqual(
  [sessionRows[0].due, sessionRows[0].fresh, sessionRows[0].done, sessionRows[0].missed],
  [0, 9, 10, 1],
);
await toSets();
const [download] = await Promise.all([page.waitForEvent("download"), page.click("text=export ledger")]);
assert.equal(download.suggestedFilename(), "kanahero-ledger-2026-11-14.json");
const exported = JSON.parse(await readFile(await download.path(), "utf8"));
assert.equal(exported.rows.length, 11);
console.log("5. the ledger holds a row per grade and per session, and exports as JSON");

// --- 6. the next day ---
await page.clock.setFixedTime(DAY2);
await page.reload();
await page.waitForSelector(".v7Counts");
assert.equal(await page.locator(".v7HeadLink").innerText().then((t) => t.replace(/\s+/g, " ")), "N5 MOCK WORDS");
assert.equal(await big(), "9 due · 0 new", "launch lands on Today for the last-used set");
assert.equal(await page.locator(".v7SpreadDue").count(), 9);
await page.click("button:has-text('DEAL')");
const day2 = [await playItem(page, false)];
for (let i = 0; i < 9; i++) day2.push(await playItem(page, true));
assert.ok(day2.every((s) => !s.trial), "due items are retrieved blind");
assert.equal(day2[3].prompt, "to turn on", "a kana-only word prompts with its meaning alone");
await page.waitForSelector(".v7Done");
st = await stored(page);
const item = (w) => st.items[`n5-mock-words/${w}`];
assert.deepEqual([item(order[0]).rung, item(order[0]).due], [1, "2026-11-16"], "missed, then got: no climb");
assert.deepEqual([item(order[1]).rung, item(order[1]).due], [2, "2026-11-18"], "got on a fresh day: rung 2, +3 days");
assert.equal(await page.locator(".v7Done .v7Next").innerText(), "next: 1 due tomorrow");
await page.click("button:has-text('CLOSE')");
console.log("6. next day: due dealt blind; a got-it climbs, a same-day got-it after a miss does not");

// --- 7. ✕ mid-deal ---
await page.clock.setFixedTime(DAY1);
await page.reload();
await page.waitForSelector(".v7Counts");
await toSets();
await row(page, "CALENDAR", "kanji").click();
await page.click("button:has-text('New to these')");
assert.equal(await big(), "0 due · 10 new");
await page.click("button:has-text('DEAL')");
await playItem(page, true);
await playItem(page, true);
await page.waitForSelector("canvas.ink");
await page.click(".quit");
await page.waitForSelector(".v7Today");
assert.equal(await big(), "0 due · 8 new", "two graded words stay graded; eight of the cap are left");
rows = await ledger(page);
const quit = rows.filter((r) => r.type === "session").at(-1);
assert.deepEqual([quit.setId, quit.done], ["calendar-kanji", 2], "a session left early still logs its row");
console.log("7. ✕ leaves with no dialog and loses nothing");

// --- 8. due first, then new ---
await page.clock.setFixedTime(DAY2);
await page.reload();
await page.waitForSelector(".v7Counts");
assert.equal(await big(), "2 due · 10 new");
assert.equal(await page.locator(".v7SpreadCard").count(), 12);
assert.equal(await page.locator(".v7SpreadDue").count(), 2);
await page.click("button:has-text('DEAL')");
const mixed = [await playItem(page), await playItem(page), await playItem(page)];
assert.deepEqual(mixed.map((s) => s.trial), [false, false, true], "the two due come before the first new");
await page.waitForSelector("canvas.ink");
await page.click(".quit");
console.log("8. the day after: due first, then new");

// --- 9. WRITE ANYWAY ---
// STATION, seeded: four unseen, three due tomorrow, two due later, cap spent.
await page.evaluate(() => {
  const s = JSON.parse(localStorage.getItem("kanahero:v7"));
  const words = ["出口", "入口", "新幹線", "禁煙", "東口"];
  const due = ["2026-11-16", "2026-11-16", "2026-11-16", "2026-11-19", "2026-11-19"];
  words.forEach((w, i) => {
    s.items[`station-kanji/${w}`] = { id: `station-kanji/${w}`, rung: 1, due: due[i], lastDay: "2026-11-13", seen: true };
  });
  s.placement["station-kanji"] = "new";
  s.capSpent["station-kanji"] = { day: "2026-11-15", n: 10 };
  s.lastSet = "station-kanji";
  localStorage.setItem("kanahero:v7", JSON.stringify(s));
});
await page.reload();
await page.waitForSelector(".v7Counts");
assert.equal(await big(), "0 due · 0 new");
assert.equal(await page.locator(".v7Today .v7Next").innerText(), "next: Mon 16 Nov · 3 due");
assert.equal(await page.locator("button:has-text('DEAL')").count(), 0);
await page.click("button:has-text('WRITE ANYWAY')");
const early = await playItem(page, true);
assert.equal(early.head, "PROMPT 1 / 7", "four new, then tomorrow's three — not the two due later");
assert.ok(early.trial, "new items come first");
await page.waitForSelector("canvas.ink");
await page.click(".quit");
st = await stored(page);
assert.deepEqual(st.capSpent["station-kanji"], { day: "2026-11-16", n: 1 }, "it spends tomorrow's cap");
console.log("9. WRITE ANYWAY: new first, then tomorrow's, never further; tomorrow's cap pays");

// --- 10. placed known ---
await toSets();
await row(page, "DAILY BASICS", "hiragana").click();
await page.click("button:has-text('I can already write some')");
assert.equal(await big(), "0 due · 10 new");
await page.click("button:has-text('DEAL')");
const blind = await playItem(page, true);
assert.equal(blind.trial, false, "a placed-known set is dealt blind");
assert.equal(blind.prompt, "arigatou", "a kana word prompts with romaji");
await page.waitForSelector("canvas.ink");
assert.equal(await page.locator(".v7Divider").count(), 3, "おはよう: four boxes, three dividers");
await page.click(".quit");
st = await stored(page);
assert.deepEqual(
  [st.items["everyday-hiragana/ありがとう"].rung, st.items["everyday-hiragana/ありがとう"].due],
  [2, "2026-11-18"],
);
assert.equal(st.capSpent["everyday-hiragana"], undefined, "placement spends no cap");
console.log("10. placed known: blind, uncapped, and a got-it lands on rung 2");
await context.close();

// --- 11. the v6 import ---
const old = await browser.newContext(VIEW);
const page2 = await old.newPage();
page2.setDefaultTimeout(20000);
const V6 = JSON.stringify({
  v: 4,
  earned: [..."ありがとう"],
  setChoice: "all",
  joker: { "station-kanji": { 出口: { shiny: 1, base: 0, worn: 0 } } },
});
await page2.addInitScript((blob) => {
  if (!localStorage.getItem("kanahero:v1")) localStorage.setItem("kanahero:v1", blob);
}, V6);
await page2.clock.setFixedTime(DAY3);
await page2.goto(BASE);
await page2.waitForSelector(".v7SetRow");
assert.equal(await counts(page2, "STATION", "kanji"), "1 due · 8 new", "a v6 card is due today");
assert.equal(await counts(page2, "DAILY BASICS", "hiragana"), "1 due · 9 new", "so is a kana word v6 knew every character of");
assert.equal(await page2.evaluate(() => localStorage.getItem("kanahero:v1")), V6, "the v6 blob is left as it was");
assert.equal((await stored(page2)).importedV6, true);
console.log("11. v6 progress is imported once, due today; the v6 blob is untouched");

assert.deepEqual(errors, [], "no page errors");
await browser.close();
kill();
console.log("\nALL CHECKS PASSED");
process.exit(0);
