// End-to-end check of the v7 loop against the static export in `out/`
// (SPEC-v7-skeleton §9). Not a test suite — a verification script.
// Run: npm run build && node scripts/e2e-loop.mjs
//
// The clock is pinned per step (Date only — timers run for real), so "the next
// day" is a line of code. Walks:
//   1. launch lands on Today, the only home: 0 due · 10 new, no set list
//   2. first run: every word is a study trial and names its script; the board
//      is gated on ink; the board is the same box on S3 and S4; a miss requeues
//      five later and comes back as plain retrieval, never showing the form
//   3. S5 lists the session; CLOSE lands on Today offering MORE
//   4. the ledger has a row per grade and one per session, and exports
//   5. MORE deals the next ten new words; ✕ leaves and keeps what was graded
//   6. next day: due first, oldest and list order, then new in the room left;
//      a prompt left alone waits its three seconds, a tapped one does not;
//      a got-it climbs a rung; a miss then a same-day got-it does not
//   7. the pile stops at 30: what does not fit slides to tomorrow, and a word
//      asked in hiragana shows its kanji form on the answer
//   8. state saved under the old sets is dropped; the v6 blob is left alone

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { chromium } from "playwright";
import { big, hurryPrompt, ledger, playItem, readPrompt, serveOut, stored } from "./e2e-lib.mjs";

const { url: BASE, kill } = await serveOut(3211);
const browser = await chromium.launch();
const VIEW = { viewport: { width: 390, height: 844 }, reducedMotion: "reduce", acceptDownloads: true };

const DAY1 = new Date(2026, 10, 14, 10, 0);
const DAY2 = new Date(2026, 10, 15, 10, 0);
const DAY3 = new Date(2026, 10, 16, 10, 0);

const LIST = JSON.parse(await readFile(new URL("../public/words/n5.json", import.meta.url)));
const order = LIST.map((w) => w.write);
assert.deepEqual(order.slice(0, 4), ["する", "何", "あの", "言う"], "the list this script was written against");

const context = await browser.newContext(VIEW);
const page = await context.newPage();
page.setDefaultTimeout(20000);
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));

const head = (scope = "") =>
  page.locator(`${scope} .v7Head`).innerText().then((t) => t.replace(/\s+/g, " ").trim());
const quit = async () => {
  await page.waitForSelector("canvas.ink");
  await page.click(".quit");
  await page.waitForSelector(".v7Today");
};

// --- 1. launch ---
await page.clock.setFixedTime(DAY1);
await page.goto(BASE);
await page.waitForSelector(".v7Counts");
assert.equal(await head(".v7Today"), "TODAY SAT 14 NOV");
assert.equal(await big(page), "0 due · 10 new");
assert.equal(await page.locator(".v7SpreadCard").count(), 10, "the spread shows one card per word");
assert.equal(await page.locator(".v7SpreadDue").count(), 0);
assert.equal(await page.locator(".v7SetRow, .v7Question").count(), 0, "no set list, no placement question");
await page.click("text=credits");
await page.click("text=← TODAY");
assert.equal(await big(page), "0 due · 10 new");
console.log("1. launch lands on Today: one queue, ten new words, nothing to choose");

// --- 2. first run ---
await page.click("button:has-text('DEAL')");
const shown = await readPrompt(page);
assert.ok(shown.trial, "a first exposure is a study trial");
assert.match(shown.prompt, /^HIRAGANA /, "the prompt names the script");
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
assert.equal(await page.locator(".v7Divider").count(), 1, "する: two boxes, one divider");

const seen = [];
const first = await playItem(page, false, shown);
seen.push(first);
for (let i = 0; i < 10; i++) seen.push(await playItem(page, true));
assert.deepEqual(first.board, first.revealBoard, "the board does not move between S3 and S4");
assert.deepEqual(
  seen.map((s) => s.word),
  [order[0], ...order.slice(1, 6), order[0], ...order.slice(6, 10)],
  "list order, and the missed word came back five places later",
);
assert.deepEqual(
  seen.map((s) => s.trial),
  [true, true, true, true, true, true, false, true, true, true, true],
  "every first exposure is a trial; the requeue is plain retrieval",
);
assert.equal(seen[0].head, "PROMPT 1 / 10");
assert.equal(seen[6].head, "PROMPT 6 / 10", "a miss does not advance the count");
assert.equal(seen[6].prompt, "HIRAGANA to do", "a kana word: the script and the meaning alone");
assert.match(seen[1].prompt, /^KANJI /);
assert.match(seen[4].prompt, /^KATAKANA /);
assert.ok(seen.every((s) => s.kanji === ""), "none of the first ten has a kanji form to show");
console.log("2. first run: trials that name their script, the ink gate, a fixed board, a miss back five later");

// --- 3. done, then MORE ---
await page.waitForSelector(".v7Done");
assert.equal(await page.locator(".v7DoneRow").count(), 11);
assert.equal((await page.locator(".v7DoneMark").allInnerTexts()).join(""), "✗✓✓✓✓✓✓✓✓✓✓");
assert.equal(await head(".v7Done"), "DONE SAT 14 NOV");
assert.match(await page.locator(".v7Done .v7Counts").innerText(), /^\d+ min$/);
assert.equal(await page.locator(".v7Done .v7Next").innerText(), "next: 10 due tomorrow");
await page.click("button:has-text('CLOSE')");
assert.equal(await big(page), "0 due · 0 new");
assert.equal(await page.locator(".v7Today .v7Next").innerText(), "next: Sun 15 Nov · 10 due");
assert.equal(await page.locator("button:has-text('DEAL')").count(), 0);
assert.equal(await page.locator("button:has-text('MORE')").count(), 1, "the pile has room: MORE is offered");
let st = await stored(page);
assert.equal(st.version, 2);
assert.deepEqual(Object.keys(st.items), order.slice(0, 10), "items are keyed by the written word");
assert.deepEqual(
  Object.values(st.items).map((i) => [i.rung, i.due]),
  Array(10).fill([1, "2026-11-15"]),
  "every trial lands on rung 1, due tomorrow",
);
assert.deepEqual(st.newSpent, { day: "2026-11-14", n: 10 });
console.log("3. S5 lists the session; Today then offers MORE");

// --- 4. the ledger ---
let rows = await ledger(page);
const itemRows = rows.filter((r) => r.type === "item");
assert.equal(itemRows.length, 11);
assert.deepEqual(Object.keys(itemRows[0]).sort(), ["day", "ms", "ok", "trial", "ts", "type", "word"]);
assert.deepEqual(
  [itemRows[0].day, itemRows[0].word, itemRows[0].trial, itemRows[0].ok],
  ["2026-11-14", order[0], true, false],
);
assert.ok(itemRows.every((r) => r.ms > 0));
const sessionRows = rows.filter((r) => r.type === "session");
assert.equal(sessionRows.length, 1);
assert.deepEqual(
  [sessionRows[0].due, sessionRows[0].fresh, sessionRows[0].done, sessionRows[0].missed],
  [0, 10, 11, 1],
);
const [download] = await Promise.all([page.waitForEvent("download"), page.click("text=export ledger")]);
assert.equal(download.suggestedFilename(), "kanahero-ledger-2026-11-14.json");
const exported = JSON.parse(await readFile(await download.path(), "utf8"));
assert.equal(exported.rows.length, 12);
console.log("4. the ledger holds a row per grade and per session, and exports from Today");

// --- 5. MORE, and ✕ ---
await page.click("button:has-text('MORE')");
const more = [await playItem(page, true), await playItem(page, true)];
assert.equal(more[0].head, "PROMPT 1 / 10", "MORE deals ten new words");
assert.deepEqual(more.map((s) => [s.word, s.trial]), [[order[10], true], [order[11], true]]);
await quit();
assert.equal(await big(page), "0 due · 0 new");
assert.equal(await page.locator("button:has-text('MORE')").count(), 1);
st = await stored(page);
assert.deepEqual(st.newSpent, { day: "2026-11-14", n: 12 });
rows = await ledger(page);
const left = rows.filter((r) => r.type === "session").at(-1);
assert.deepEqual([left.fresh, left.done], [10, 2], "a session left early still logs its row");
console.log("5. MORE adds new words; ✕ leaves with no dialog and loses nothing");

// --- 6. the next day ---
await page.clock.setFixedTime(DAY2);
await page.reload();
await page.waitForSelector(".v7Counts");
assert.equal(await head(".v7Today"), "TODAY SUN 15 NOV");
assert.equal(await big(page), "12 due · 10 new", "yesterday's extra words cost today only their reviews");
assert.equal(await page.locator(".v7SpreadCard").count(), 22);
assert.equal(await page.locator(".v7SpreadDue").count(), 12);
assert.equal(await page.locator(".v7SpreadRow").count(), 3, "more than twenty cards take a third row");
await page.click("button:has-text('DEAL')");
// left alone, a prompt stands for its three seconds
let t0 = Date.now();
let p = await readPrompt(page);
assert.deepEqual([p.trial, p.prompt, p.head], [false, "HIRAGANA to do", "PROMPT 1 / 22"]);
await page.waitForTimeout(1500);
assert.equal(await page.locator("canvas.ink").count(), 0, "the prompt is still up at 1.5 s");
const day2 = [await playItem(page, false, p, { wait: true })];
assert.ok(Date.now() - t0 >= 2900, "an untouched prompt waits out its time");
// one tap sends it on its way
p = await readPrompt(page);
assert.equal(p.prompt, "KANJI what なに", "a kanji word: the script, the meaning and the reading");
t0 = Date.now();
await hurryPrompt(page, false);
await page.waitForSelector("canvas.ink");
assert.ok(Date.now() - t0 < 1500, `a tap hurries the prompt, took ${Date.now() - t0} ms`);
day2.push(await playItem(page, true, p));
// two taps and it is gone at once
p = await readPrompt(page);
await page.locator(".v7Script").dblclick();
await page.waitForSelector("canvas.ink", { timeout: 1000 });
day2.push(await playItem(page, true, p));
for (let i = 0; i < 10; i++) day2.push(await playItem(page, true));
assert.ok(day2.every((s) => !s.trial), "due words are retrieved blind");
assert.deepEqual(
  day2.map((s) => s.word),
  [order[0], ...order.slice(1, 6), order[0], ...order.slice(6, 12)],
  "due in list order, the miss back five later",
);
p = await readPrompt(page);
assert.deepEqual([p.trial, p.head], [true, "PROMPT 13 / 22"], "then the new words");
const firstNew = await playItem(page, true, p);
assert.equal(firstNew.word, order[12], "the list carries on where MORE stopped");
await quit();
assert.equal(await big(page), "0 due · 9 new");
st = await stored(page);
const item = (w) => [st.items[w].rung, st.items[w].due];
assert.deepEqual(item(order[0]), [1, "2026-11-16"], "missed, then got: no climb");
assert.deepEqual(item(order[1]), [2, "2026-11-18"], "got on a fresh day: rung 2, +3 days");
console.log("6. next day: due first then new; a tap hurries the prompt; a got-it climbs, a same-day one does not");

// --- 7. the pile stops at 30 ---
// Seeded: 28 words already written today, five more due — ゆうべ among them.
await page.clock.setFixedTime(DAY3);
await page.evaluate((order) => {
  const items = {};
  order.slice(30, 58).forEach((id) => {
    items[id] = { id, rung: 2, due: "2026-11-19", lastDay: "2026-11-16", seen: true };
  });
  [order[17], order[2], order[3], order[4], order[5]].forEach((id, k) => {
    const due = k === 0 ? "2026-11-13" : "2026-11-16";
    items[id] = { id, rung: 1, due, lastDay: "2026-11-12", seen: true };
  });
  localStorage.setItem("kanahero:v7", JSON.stringify({ version: 2, items }));
}, order);
await page.reload();
await page.waitForSelector(".v7Counts");
assert.equal(await big(page), "2 due · 0 new", "28 written today leaves room for two, and none of them new");
await page.click("button:has-text('DEAL')");
const last = [await playItem(page, true), await playItem(page, true)];
assert.deepEqual(last.map((s) => s.word), ["ゆうべ", order[2]], "oldest due first, then list order");
assert.equal(last[0].kanji, "昨夜", "a word asked in hiragana shows its kanji form on the answer");
assert.equal(last[1].kanji, "");
await page.waitForSelector(".v7Done");
assert.equal(await page.locator(".v7Done .v7Next").innerText(), "next: 3 due tomorrow");
await page.click("button:has-text('CLOSE')");
assert.equal(await big(page), "next: Tue 17 Nov · 3 due", "the three that did not fit slide a day");
assert.equal(await page.locator(".v7Today button.actionBar").count(), 0, "a full pile has no button");
console.log("7. the pile stops at 30; the rest slide a day; the kanji form shows on the answer");
await context.close();

// --- 8. old state ---
const old = await browser.newContext(VIEW);
const page2 = await old.newPage();
page2.setDefaultTimeout(20000);
page2.on("pageerror", (e) => errors.push(String(e)));
const V6 = JSON.stringify({ v: 4, earned: [..."ありがとう"], setChoice: "all" });
const V1 = JSON.stringify({
  version: 1,
  items: { "n5-mock-words/外": { id: "n5-mock-words/外", rung: 2, due: "2026-11-16", seen: true } },
  placement: { "n5-mock-words": "new" },
  capSpent: {},
  lastSet: "n5-mock-words",
  importedV6: true,
});
await page2.addInitScript(
  ([v6, v1]) => {
    if (!localStorage.getItem("kanahero:v1")) localStorage.setItem("kanahero:v1", v6);
    if (!localStorage.getItem("kanahero:v7")) localStorage.setItem("kanahero:v7", v1);
  },
  [V6, V1],
);
await page2.clock.setFixedTime(DAY3);
await page2.goto(BASE);
await page2.waitForSelector(".v7Counts");
assert.equal(await big(page2), "0 due · 10 new", "the queue starts clean");
assert.equal(await page2.evaluate(() => localStorage.getItem("kanahero:v1")), V6, "the v6 blob is left as it was");
console.log("8. state saved under the old sets is dropped; nothing is imported");

assert.deepEqual(errors, [], "no page errors");
await browser.close();
kill();
console.log("\nALL CHECKS PASSED");
process.exit(0);
