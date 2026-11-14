// Pure-function check of the v7 scheduler (SPEC-v7-skeleton §5)
// and of the state around it (§8). No browser, no build: transpiles the DOM-free
// lib files to a temp dir.
// Run: node scripts/e2e-schedule.mjs

import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";

// Transpile the DOM-free lib files into a temp dir so they can import each other.
const dir = await mkdtemp(path.join(tmpdir(), "kanahero-schedule-"));
for (const name of ["schedule", "session", "words", "store"]) {
  const src = await readFile(new URL(`../lib/${name}.ts`, import.meta.url), "utf8");
  const { outputText } = ts.transpileModule(src, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  });
  await writeFile(
    path.join(dir, `${name}.mjs`),
    outputText.replace(/from "\.\/([\w-]+)"/g, 'from "./$1.mjs"'),
  );
}
const load = (name) => import(pathToFileURL(path.join(dir, `${name}.mjs`)).href);

const S = await load("schedule");
const { requeue, REQUEUE_AT } = await load("session");
const St = await load("store");
const { promptFor } = await load("words");

const D = "2026-11-14";
const D2 = "2026-11-15";
const order = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l"];
const seen = (id, due, rung = 1, lastDay) => ({ id, rung, due, lastDay, seen: true });
const base = (items, over = {}) => ({ today: D, items, order, newLeft: 10, room: 30, ...over });
let n = 0;
const rule = (name, fn) => { fn(); n++; console.log(`  ok  ${name}`); };

rule("days: addDays crosses months, years and DST without drift", () => {
  assert.equal(S.addDays("2026-11-30", 1), "2026-12-01");
  assert.equal(S.addDays("2026-12-31", 1), "2027-01-01");
  assert.equal(S.addDays("2026-03-07", 30), "2026-04-06");
  assert.equal(S.localDay(new Date(2026, 10, 14, 23, 59)), D);
});

rule("the rule's two numbers: 10 new in a deal, 30 words in a day", () => {
  assert.equal(S.NEW_CAP, 10);
  assert.equal(S.PILE_MAX, 30);
});

rule("1: due first — oldest due first, then list order; future items wait", () => {
  const items = [seen("c", D), seen("a", D), seen("b", "2026-11-10"), seen("d", "2026-11-15")];
  assert.deepEqual(S.deal(base(items)).due, ["b", "a", "c"]);
});

rule("1: over the pile — oldest first, the rest are held, untouched", () => {
  const old = Array.from({ length: 25 }, (_, k) => seen(`o${k}`, "2026-11-12"));
  const recent = Array.from({ length: 10 }, (_, k) => seen(`r${k}`, D));
  const d = S.deal(base([...recent, ...old, S.unseen("a")]));
  assert.equal(d.due.length, 30);
  assert.deepEqual(d.due.slice(0, 25), old.map((s) => s.id), "the oldest all make the pile");
  assert.equal(d.held, 5);
  assert.deepEqual(d.fresh, [], "no new words on a day reviews fill the pile");
});

rule("2: then new — unseen in list order, up to what the deal may take", () => {
  const items = order.map(S.unseen);
  assert.deepEqual(S.deal(base(items)).fresh, order.slice(0, 10));
  assert.deepEqual(S.deal(base(items, { newLeft: 3 })).fresh, ["a", "b", "c"]);
  assert.deepEqual(S.deal(base(items, { newLeft: 0 })).fresh, []);
});

rule("2: new words take only the room the reviews leave under 30", () => {
  const pile = (k) => Array.from({ length: k }, (_, j) => seen(`p${j}`, D));
  const fresh = (k) => S.deal(base([...pile(k), ...order.map(S.unseen)])).fresh.length;
  assert.equal(fresh(20), 10, "20 due leaves room for all 10");
  assert.equal(fresh(24), 6);
  assert.equal(fresh(29), 1);
  assert.equal(fresh(30), 0);
});

rule("2: a pile already part-written has less room, for reviews and new alike", () => {
  const items = [seen("a", D), seen("b", D), seen("c", D), ...order.slice(3).map(S.unseen)];
  const d = S.deal(base(items, { room: 2 }));
  assert.deepEqual(d.due, ["a", "b"]);
  assert.equal(d.held, 1);
  assert.deepEqual(d.fresh, []);
  assert.deepEqual(S.deal(base(items, { room: 0 })), { due: [], fresh: [], held: 3 });
});

rule("3: got-it on a fresh day climbs one rung along 1·3·7·14·30", () => {
  let s = seen("a", D, 1, "2026-11-13");
  const want = [[2, 3], [3, 7], [4, 14], [5, 30], [5, 30]];
  let day = D;
  for (const [rung, days] of want) {
    s = S.grade(s, day, true);
    assert.equal(s.rung, rung);
    assert.equal(s.due, S.addDays(day, days));
    assert.equal(s.lastDay, day);
    day = s.due;
  }
});

rule("3: a second got-it the same day changes nothing", () => {
  const once = S.grade(seen("a", D, 1, "2026-11-13"), D, true);
  assert.deepEqual(S.grade(once, D, true), once);
});

rule("4: a miss drops to rung 1, due tomorrow; a same-day got-it does not lift it", () => {
  const missed = S.grade(seen("a", D, 4, "2026-11-01"), D, false);
  assert.deepEqual(missed, seen("a", D2, 1, D));
  assert.deepEqual(S.grade(missed, D, true), missed);
});

rule("4: a missed item requeues five later, or last if fewer remain", () => {
  assert.equal(REQUEUE_AT, 5);
  assert.deepEqual(requeue(["x", 1, 2, 3, 4, 5, 6]), [1, 2, 3, 4, 5, "x", 6]);
  assert.deepEqual(requeue(["x", 1, 2]), [1, 2, "x"]);
  assert.deepEqual(requeue(["x"]), ["x"]);
});

rule("5: a study trial lands on rung 1, due tomorrow, got or missed", () => {
  for (const ok of [true, false]) {
    assert.deepEqual(S.grade(S.unseen("a"), D, ok), seen("a", D2, 1, D));
  }
});

rule("8: the next line names the nearest future day and its count", () => {
  const items = [seen("a", "2026-11-17", 2), seen("b", "2026-11-17", 2), seen("c", "2026-11-21", 3)];
  assert.deepEqual(S.nextDue(items, D), { day: "2026-11-17", count: 2 });
  assert.equal(S.nextDue([S.unseen("a")], D), null);
  assert.equal(S.nextDue([seen("a", D)], D), null, "a word due today is not 'next'");
});

rule("9: fresh items are never shuffled, whatever order storage returns them in", () => {
  const items = [...order].reverse().map(S.unseen);
  for (let k = 0; k < 20; k++) assert.deepEqual(S.deal(base(items)).fresh, order.slice(0, 10));
});

rule("10: a session keeps its start day — grading with it ignores the clock", () => {
  // The caller passes the session's start day; an item graded after midnight
  // still lands relative to that day and cannot advance twice in the session.
  const first = S.grade(seen("a", D, 1, "2026-11-13"), D, true);
  assert.equal(first.due, "2026-11-17");
  assert.deepEqual(S.grade(first, D, true), first);
});

// ---- the state around the scheduler (§8) ----

const LIST = Array.from({ length: 45 }, (_, k) => `w${String(k + 1).padStart(2, "0")}`);
const play = (state, queue, ok, day = D) =>
  queue.reduce((st, q) => St.applyGrade(st, q, day, ok), state);
const ids = (q) => q.map((x) => x.id);
/** write a whole deal, got-it throughout */
const dealAndPlay = (state, day, more = false) =>
  play(state, St.buildQueue(state, LIST, day, more), true, day);

rule("store: first run is 0 due · 10 new, every word a study trial, in list order", () => {
  const st = St.emptyState();
  assert.deepEqual(St.todayView(st, LIST, D), { kind: "deal", due: 0, fresh: 10, next: null });
  const q = St.buildQueue(st, LIST, D);
  assert.deepEqual(ids(q), LIST.slice(0, 10));
  assert.ok(q.every((x) => x.trial));
});

rule("store: new words are counted as written — a half-finished deal leaves the rest", () => {
  const q = St.buildQueue(St.emptyState(), LIST, D);
  const half = play(St.emptyState(), q.slice(0, 4), true);
  assert.equal(St.newLeft(half, D), 6);
  assert.equal(St.roomLeft(half, D), 26);
  assert.deepEqual(ids(St.buildQueue(half, LIST, D)), LIST.slice(4, 10));
  assert.equal(St.newLeft(half, D2), 10, "tomorrow has its own ten");
});

rule("store: a missed trial is one new word, however often it comes back", () => {
  const q = St.buildQueue(St.emptyState(), LIST, D);
  let st = St.applyGrade(St.emptyState(), q[0], D, false);
  st = St.applyGrade(st, { ...q[0], trial: false }, D, true);
  assert.deepEqual(st.newSpent, { day: D, n: 1 });
  assert.equal(St.roomLeft(st, D), 29);
  assert.deepEqual([st.items[LIST[0]].rung, st.items[LIST[0]].due], [1, D2]);
});

rule("store: deal written → MORE, ten at a time, until the day's pile is 30", () => {
  let st = dealAndPlay(St.emptyState(), D);
  assert.deepEqual(St.todayView(st, LIST, D), { kind: "more", due: 0, fresh: 0, next: { day: D2, count: 10 } });
  assert.deepEqual(St.buildQueue(st, LIST, D), [], "DEAL has nothing left to give");
  assert.deepEqual(ids(St.buildQueue(st, LIST, D, true)), LIST.slice(10, 20));
  st = dealAndPlay(st, D, true);
  assert.equal(St.todayView(st, LIST, D).kind, "more");
  st = dealAndPlay(st, D, true);
  assert.equal(St.roomLeft(st, D), 0);
  assert.deepEqual(St.todayView(st, LIST, D), { kind: "done", due: 0, fresh: 0, next: { day: D2, count: 30 } });
  assert.deepEqual(St.buildQueue(st, LIST, D, true), [], "never past 30");
});

rule("store: MORE left half-way offers the rest of the room, not a fresh ten past it", () => {
  let st = dealAndPlay(St.emptyState(), D);
  st = dealAndPlay(st, D, true);
  st = play(st, St.buildQueue(st, LIST, D, true).slice(0, 7), true);
  assert.equal(St.todayView(st, LIST, D).kind, "more");
  assert.deepEqual(ids(St.buildQueue(st, LIST, D, true)), LIST.slice(27, 30));
});

rule("store: extra words today cost tomorrow nothing but their reviews", () => {
  let st = dealAndPlay(St.emptyState(), D);
  st = dealAndPlay(st, D, true);
  assert.deepEqual(St.todayView(st, LIST, D2), { kind: "deal", due: 20, fresh: 10, next: null });
  const q = St.buildQueue(st, LIST, D2);
  assert.deepEqual(q.map((x) => x.trial), [...Array(20).fill(false), ...Array(10).fill(true)]);
  assert.deepEqual(ids(q).slice(20), LIST.slice(20, 30), "the list carries on where it stopped");
});

rule("store: reviews fill the pile → no new words, and no MORE after it", () => {
  let st = dealAndPlay(St.emptyState(), D);
  st = dealAndPlay(st, D, true);
  st = dealAndPlay(st, D, true);
  assert.deepEqual(St.todayView(st, LIST, D2), { kind: "deal", due: 30, fresh: 0, next: null });
  st = dealAndPlay(st, D2);
  assert.equal(St.todayView(st, LIST, D2).kind, "done");
});

rule("store: more than 30 due — oldest first, the rest slide a day", () => {
  const items = {};
  LIST.slice(0, 35).forEach((id, k) => {
    items[id] = seen(id, k < 5 ? D2 : "2026-11-13", 1, "2026-11-12");
  });
  let st = { version: 2, items };
  assert.deepEqual(St.todayView(st, LIST, D2), { kind: "deal", due: 30, fresh: 0, next: null });
  const q = St.buildQueue(st, LIST, D2);
  assert.deepEqual(ids(q), LIST.slice(5, 35), "the 30 oldest; the five due today wait");
  st = play(st, q, true, D2);
  const after = St.todayView(st, LIST, D2);
  assert.equal(after.kind, "done", "the pile is full: the five are not offered today");
  assert.deepEqual(after.next, { day: "2026-11-16", count: 5 });
  assert.equal(St.todayView(st, LIST, "2026-11-16").due, 5);
  assert.deepEqual(ids(St.buildQueue(st, LIST, "2026-11-16")).slice(0, 5), LIST.slice(0, 5));
});

rule("store: the whole list written and nothing due → done, no button", () => {
  const items = {};
  LIST.forEach((id) => { items[id] = seen(id, "2026-11-20", 3, "2026-11-13"); });
  assert.deepEqual(St.todayView({ version: 2, items }, LIST, D), {
    kind: "done", due: 0, fresh: 0, next: { day: "2026-11-20", count: 30 },
  });
});

rule("store: state survives a round trip; garbage in storage is dropped", () => {
  const st = play(St.emptyState(), St.buildQueue(St.emptyState(), LIST, D).slice(0, 3), false);
  assert.deepEqual(St.parseState(JSON.stringify(st)), st);
  assert.deepEqual(St.parseState("{nope"), St.emptyState());
  const dirty = { version: 2, items: { a: { rung: 9, due: D }, b: { rung: 2, due: "soon" }, c: { rung: 2, due: D } } };
  assert.deepEqual(Object.keys(St.parseState(JSON.stringify(dirty)).items), ["c"]);
});

rule("store: state saved under the old sets is not carried over", () => {
  const v1 = { version: 1, items: { "n5-mock-words/外": { rung: 2, due: D } }, placement: {}, capSpent: {} };
  assert.deepEqual(St.parseState(JSON.stringify(v1)), St.emptyState());
});

rule("prompt: names the script, never shows the written form", () => {
  const w = (write, ask, reading) => ({ write, ask, reading, kanji: null, romaji: "r", meaning: "m" });
  assert.deepEqual(promptFor(w("水", "kanji", "みず")), { script: "kanji", main: "m", reading: "みず" });
  assert.deepEqual(promptFor(w("つける", "hiragana", "つける")), { script: "hiragana", main: "m" });
  assert.deepEqual(promptFor(w("ホテル", "katakana", "ホテル")), { script: "katakana", main: "m" });
});

await rm(dir, { recursive: true, force: true });

console.log(`e2e-schedule: ${n} cases passed`);
