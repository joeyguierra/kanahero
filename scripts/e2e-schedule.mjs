// Pure-function check of the v7 scheduler (SPEC-v7-skeleton §5, rules 1–10).
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
for (const name of ["schedule", "session", "sets", "store"]) {
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
const { promptFor } = await load("sets");

const D = "2026-11-14";
const order = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l"];
const seen = (id, due, rung = 1, lastDay) => ({ id, rung, due, lastDay, seen: true });
const base = (items, over = {}) => ({
  today: D, items, setOrder: order, newCap: 10, dueCeiling: 20, placedKnown: false, ...over,
});
let n = 0;
const rule = (name, fn) => { fn(); n++; console.log(`  ok  ${name}`); };

rule("days: addDays crosses months, years and DST without drift", () => {
  assert.equal(S.addDays("2026-11-30", 1), "2026-12-01");
  assert.equal(S.addDays("2026-12-31", 1), "2027-01-01");
  assert.equal(S.addDays("2026-03-07", 30), "2026-04-06");
  assert.equal(S.localDay(new Date(2026, 10, 14, 23, 59)), D);
});

rule("1: due first — oldest due first, then set order; future items wait", () => {
  const items = [seen("c", D), seen("a", D), seen("b", "2026-11-10"), seen("d", "2026-11-15")];
  assert.deepEqual(S.deal(base(items)).due, ["b", "a", "c"]);
});

rule("2: then new — unseen in set order, capped", () => {
  const items = order.map(S.unseen);
  assert.deepEqual(S.deal(base(items)).fresh, order.slice(0, 10));
  assert.deepEqual(S.deal(base(items, { newCap: 3 })).fresh, ["a", "b", "c"]);
  assert.deepEqual(S.deal(base(items, { newCap: 0 })).fresh, []);
});

rule("2: no new at all when due exceeds the ceiling", () => {
  const pile = Array.from({ length: 21 }, (_, k) => seen(`p${k}`, D));
  const d = S.deal(base([...pile, S.unseen("a")]));
  assert.equal(d.due.length, 21);
  assert.deepEqual(d.fresh, []);
  const at20 = S.deal(base([...pile.slice(0, 20), S.unseen("a")]));
  assert.deepEqual(at20.fresh, ["a"], "exactly 20 due still deals new");
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
  assert.deepEqual(missed, seen("a", "2026-11-15", 1, D));
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
    assert.deepEqual(S.grade(S.unseen("a"), D, ok), seen("a", "2026-11-15", 1, D));
  }
});

rule("6: placed-known deals every unseen item, uncapped, even past the ceiling", () => {
  const pile = Array.from({ length: 21 }, (_, k) => seen(`p${k}`, D));
  const d = S.deal(base([...pile, ...order.map(S.unseen)], { placedKnown: true }));
  assert.deepEqual(d.fresh, order);
});

rule("6: placed-known got-it → rung 2, due in 3 days; miss → rung 1", () => {
  assert.deepEqual(S.grade(S.unseen("a"), D, true, { placed: true }), seen("a", "2026-11-17", 2, D));
  assert.deepEqual(S.grade(S.unseen("a"), D, false, { placed: true }), seen("a", "2026-11-15", 1, D));
});

rule("7: write anyway pulls tomorrow only, never items graded today", () => {
  const items = [
    seen("a", "2026-11-15", 1, "2026-11-12"),
    seen("b", "2026-11-15", 1, D), // graded today
    seen("c", "2026-11-16", 2, "2026-11-13"), // beyond tomorrow
    seen("d", "2026-11-15", 3, "2026-11-08"),
    S.unseen("e"),
  ];
  const d = S.deal(base(items));
  assert.deepEqual(d.due, []);
  assert.deepEqual(d.fresh, ["e"]);
  assert.deepEqual(d.pulledForward, ["a", "d"]);
});

rule("7: nothing is pulled forward while anything is due", () => {
  const d = S.deal(base([seen("a", D), seen("b", "2026-11-15", 1, "2026-11-12")]));
  assert.deepEqual(d.pulledForward, []);
});

rule("8: done = nothing due and nothing unseen; next line names the nearest day", () => {
  const items = [seen("a", "2026-11-17", 2), seen("b", "2026-11-17", 2), seen("c", "2026-11-21", 3)];
  assert.equal(S.isDone(items, D), true);
  assert.deepEqual(S.nextDue(items, D), { day: "2026-11-17", count: 2 });
  assert.equal(S.isDone([...items, S.unseen("d")], D), false);
  assert.equal(S.isDone([...items, seen("d", D)], D), false);
  assert.equal(S.nextDue([S.unseen("a")], D), null);
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

const words = (list) => list.map((w) => ({ word: w, reading: w, romaji: w, meaning: w }));
const SET = { id: "s", name: "S", glyph: "", script: "kanji", origin: "platform",
  words: words(["一", "二", "三", "四", "五", "六", "七", "八", "九", "十", "百", "千"]) };
const play = (state, queue, ok, wa = false) =>
  queue.reduce((st, q) => St.applyGrade(st, SET.id, q, D, ok, wa), state);

rule("store: first run is 0 due · 10 new, every item a study trial", () => {
  const st = St.emptyState();
  assert.deepEqual(St.todayView(st, SET, D), { kind: "deal", due: 0, fresh: 10, next: null });
  const q = St.buildQueue(st, SET, D);
  assert.equal(q.length, 10);
  assert.ok(q.every((x) => x.trial && !x.placed));
  assert.equal(q[0].word, "一");
});

rule("store: the cap is counted per item — a half-finished deal leaves the rest", () => {
  const q = St.buildQueue(St.emptyState(), SET, D);
  const half = play(St.emptyState(), q.slice(0, 4), true);
  assert.equal(St.capLeft(half, SET.id, D), 6);
  assert.equal(St.todayView(half, SET, D).fresh, 6);
  assert.equal(St.capLeft(half, "other-set", D), 10, "another set keeps its own cap");
});

rule("store: deal finished with unseen left → WRITE ANYWAY; it spends tomorrow's cap", () => {
  const done = play(St.emptyState(), St.buildQueue(St.emptyState(), SET, D), true);
  const view = St.todayView(done, SET, D);
  assert.deepEqual(view, { kind: "writeAnyway", due: 0, fresh: 0, next: { day: "2026-11-15", count: 10 } });
  const wa = St.buildQueue(done, SET, D, true);
  assert.deepEqual(wa.map((x) => x.word), ["百", "千"], "new first; today's graded items are not pulled");
  const after = play(done, wa, true, true);
  assert.equal(St.capLeft(after, SET.id, D), 0);
  assert.equal(St.capLeft(after, SET.id, "2026-11-15"), 8);
  assert.equal(St.todayView(after, SET, D).kind, "done");
});

rule("store: next day deals due first, then what is left of the cap", () => {
  const day1 = play(St.emptyState(), St.buildQueue(St.emptyState(), SET, D), true);
  const q = St.buildQueue(day1, SET, "2026-11-15");
  assert.deepEqual(q.map((x) => x.trial), [...Array(10).fill(false), true, true]);
  assert.equal(St.todayView(day1, SET, "2026-11-15").due, 10);
});

rule("store: placed-known deals the whole set blind, uncapped, and lands on rung 2", () => {
  const st = { ...St.emptyState(), placement: { s: "known" } };
  const q = St.buildQueue(st, SET, D);
  assert.equal(q.length, 12);
  assert.ok(q.every((x) => x.placed && !x.trial));
  const after = play(st, q, true);
  assert.equal(after.items["s/一"].rung, 2);
  assert.deepEqual(after.capSpent, {}, "placement spends no cap");
  assert.equal(St.todayView(after, SET, D).kind, "done");
});

rule("store: state survives a round trip; garbage in storage is dropped", () => {
  const st = play(St.emptyState(), St.buildQueue(St.emptyState(), SET, D).slice(0, 3), false);
  const withSet = { ...st, lastSet: "s", placement: { s: "new" } };
  assert.deepEqual(St.parseState(JSON.stringify(withSet)), withSet);
  assert.deepEqual(St.parseState("{nope"), St.emptyState());
  assert.deepEqual(St.parseState(JSON.stringify({ version: 2, items: {} })), St.emptyState());
  const dirty = { version: 1, items: { a: { rung: 9, due: D }, b: { rung: 2, due: "soon" }, c: { rung: 2, due: D } } };
  assert.deepEqual(Object.keys(St.parseState(JSON.stringify(dirty)).items), ["c"]);
});

rule("store: v6 progress is imported once — seen, rung 1, due today", () => {
  const kana = { ...SET, id: "k", script: "hiragana", words: words(["ねこ", "いぬ"]) };
  const v6 = JSON.stringify({ v: 4, earned: ["ね", "こ", "い"], joker: { s: { 二: { shiny: 1, base: 0, worn: 0 } } } });
  const st = St.importV6(St.emptyState(), [SET, kana], v6, D);
  assert.deepEqual(Object.keys(st.items).sort(), ["k/ねこ", "s/二"]);
  assert.deepEqual(st.items["s/二"], { id: "s/二", rung: 1, due: D, seen: true });
  assert.equal(St.todayView(st, SET, D).due, 1);
  assert.equal(St.buildQueue(st, SET, D)[0].trial, false, "imported items are retrieved, not studied");
  assert.equal(St.importV6(st, [SET, kana], JSON.stringify({ earned: ["い", "ぬ"] }), D), st, "never twice");
  assert.equal(St.importV6(St.emptyState(), [SET], "{nope", D).importedV6, true);
});

rule("prompt: never the written form", () => {
  const w = (word, reading) => ({ word, reading, romaji: "r", meaning: "m" });
  assert.deepEqual(promptFor({ ...SET, script: "hiragana" }, w("か", "か")), { main: "r" });
  assert.deepEqual(promptFor(SET, w("水", "みず")), { main: "m", reading: "みず" });
  assert.deepEqual(promptFor(SET, w("つける", "つける")), { main: "m" });
});

await rm(dir, { recursive: true, force: true });

console.log(`e2e-schedule: ${n} cases passed`);
