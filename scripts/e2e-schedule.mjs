// Pure-function check of the v7 scheduler (SPEC-v7-skeleton §5, SPEC-kanji-upgrade
// §2.4) and of the state around it (§8). No browser, no build: transpiles the DOM-free
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
const { promptFor, upgradesOf } = await load("words");

const D = "2026-11-14";
const D2 = "2026-11-15";
const order = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l"];
const seen = (id, due, rung = 1, lastDay) => ({ id, rung, due, lastDay, seen: true });
const base = (items, over = {}) => ({ today: D, items, order, newLeft: 10, room: 40, ...over });
let n = 0;
const rule = (name, fn) => { fn(); n++; console.log(`  ok  ${name}`); };

rule("days: addDays crosses months, years and DST without drift", () => {
  assert.equal(S.addDays("2026-11-30", 1), "2026-12-01");
  assert.equal(S.addDays("2026-12-31", 1), "2027-01-01");
  assert.equal(S.addDays("2026-03-07", 30), "2026-04-06");
  assert.equal(S.localDay(new Date(2026, 10, 14, 23, 59)), D);
});

rule("the rule's numbers: 10 new in a deal, 3 upgrades and 40 words in a day", () => {
  assert.equal(S.NEW_CAP, 10);
  assert.equal(S.UPGRADE_CAP, 3);
  assert.equal(S.PILE_MAX, 40);
});

rule("1: due first — oldest due first, then list order; future items wait", () => {
  const items = [seen("c", D), seen("a", D), seen("b", "2026-11-10"), seen("d", "2026-11-15")];
  assert.deepEqual(S.deal(base(items)).due, ["b", "a", "c"]);
});

rule("1: over the pile — oldest first, the rest are held, untouched", () => {
  const old = Array.from({ length: 35 }, (_, k) => seen(`o${k}`, "2026-11-12"));
  const recent = Array.from({ length: 10 }, (_, k) => seen(`r${k}`, D));
  const d = S.deal(base([...recent, ...old, S.unseen("a")]));
  assert.equal(d.due.length, 40);
  assert.deepEqual(d.due.slice(0, 35), old.map((s) => s.id), "the oldest all make the pile");
  assert.equal(d.held, 5);
  assert.deepEqual(d.fresh, [], "no new words on a day reviews fill the pile");
});

rule("2: then new — unseen in list order, up to what the deal may take", () => {
  const items = order.map(S.unseen);
  assert.deepEqual(S.deal(base(items)).fresh, order.slice(0, 10));
  assert.deepEqual(S.deal(base(items, { newLeft: 3 })).fresh, ["a", "b", "c"]);
  assert.deepEqual(S.deal(base(items, { newLeft: 0 })).fresh, []);
});

rule("2: new words take only the room the reviews leave under 40", () => {
  const pile = (k) => Array.from({ length: k }, (_, j) => seen(`p${j}`, D));
  const fresh = (k) => S.deal(base([...pile(k), ...order.map(S.unseen)])).fresh.length;
  assert.equal(fresh(30), 10, "30 due leaves room for all 10");
  assert.equal(fresh(34), 6);
  assert.equal(fresh(39), 1);
  assert.equal(fresh(40), 0);
});

rule("2: a pile already part-written has less room, for reviews and new alike", () => {
  const items = [seen("a", D), seen("b", D), seen("c", D), ...order.slice(3).map(S.unseen)];
  const d = S.deal(base(items, { room: 2 }));
  assert.deepEqual(d.due, ["a", "b"]);
  assert.equal(d.held, 1);
  assert.deepEqual(d.fresh, []);
  assert.deepEqual(S.deal(base(items, { room: 0 })), { due: [], ups: [], fresh: [], held: 3 });
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

const LIST = Array.from({ length: 60 }, (_, k) => `w${String(k + 1).padStart(2, "0")}`);
const DECK = St.deckOf(LIST);
const play = (state, queue, ok, day = D) =>
  queue.reduce((st, q) => St.applyGrade(st, q, day, ok), state);
const ids = (q) => q.map((x) => x.id);
/** write a whole deal, got-it throughout */
const dealAndPlay = (state, day, more = false, deck = DECK) =>
  play(state, St.buildQueue(state, deck, day, more), true, day);

rule("store: first run is 0 due · 10 new, every word a study trial, in list order", () => {
  const st = St.emptyState();
  assert.deepEqual(St.todayView(st, DECK, D), { kind: "deal", due: 0, fresh: 10, next: null });
  const q = St.buildQueue(st, DECK, D);
  assert.deepEqual(ids(q), LIST.slice(0, 10));
  assert.ok(q.every((x) => x.trial));
});

rule("store: new words are counted as written — a half-finished deal leaves the rest", () => {
  const q = St.buildQueue(St.emptyState(), DECK, D);
  const half = play(St.emptyState(), q.slice(0, 4), true);
  assert.equal(St.newLeft(half, D), 6);
  assert.equal(St.roomLeft(half, D), 36);
  assert.deepEqual(ids(St.buildQueue(half, DECK, D)), LIST.slice(4, 10));
  assert.equal(St.newLeft(half, D2), 10, "tomorrow has its own ten");
});

rule("store: a missed trial is one new word, however often it comes back", () => {
  const q = St.buildQueue(St.emptyState(), DECK, D);
  let st = St.applyGrade(St.emptyState(), q[0], D, false);
  st = St.applyGrade(st, { ...q[0], trial: false }, D, true);
  assert.deepEqual(st.newSpent, { day: D, n: 1 });
  assert.equal(St.roomLeft(st, D), 39);
  assert.deepEqual([st.items[LIST[0]].rung, st.items[LIST[0]].due], [1, D2]);
});

rule("store: deal written → MORE, ten at a time, until the day's pile is 40", () => {
  let st = dealAndPlay(St.emptyState(), D);
  assert.deepEqual(St.todayView(st, DECK, D), { kind: "more", due: 0, fresh: 0, next: { day: D2, count: 10 } });
  assert.deepEqual(St.buildQueue(st, DECK, D), [], "DEAL has nothing left to give");
  assert.deepEqual(ids(St.buildQueue(st, DECK, D, true)), LIST.slice(10, 20));
  for (let k = 0; k < 2; k++) {
    st = dealAndPlay(st, D, true);
    assert.equal(St.todayView(st, DECK, D).kind, "more");
  }
  st = dealAndPlay(st, D, true);
  assert.equal(St.roomLeft(st, D), 0);
  assert.deepEqual(St.todayView(st, DECK, D), { kind: "done", due: 0, fresh: 0, next: { day: D2, count: 40 } });
  assert.deepEqual(St.buildQueue(st, DECK, D, true), [], "never past 40");
});

rule("store: MORE left half-way offers the rest of the room, not a fresh ten past it", () => {
  let st = dealAndPlay(St.emptyState(), D);
  st = dealAndPlay(st, D, true);
  st = dealAndPlay(st, D, true);
  st = play(st, St.buildQueue(st, DECK, D, true).slice(0, 7), true);
  assert.equal(St.todayView(st, DECK, D).kind, "more");
  assert.deepEqual(ids(St.buildQueue(st, DECK, D, true)), LIST.slice(37, 40));
});

rule("store: extra words today cost tomorrow nothing but their reviews", () => {
  let st = dealAndPlay(St.emptyState(), D);
  st = dealAndPlay(st, D, true);
  assert.deepEqual(St.todayView(st, DECK, D2), { kind: "deal", due: 20, fresh: 10, next: null });
  const q = St.buildQueue(st, DECK, D2);
  assert.deepEqual(q.map((x) => x.trial), [...Array(20).fill(false), ...Array(10).fill(true)]);
  assert.deepEqual(ids(q).slice(20), LIST.slice(20, 30), "the list carries on where it stopped");
});

rule("store: reviews fill the pile → no new words, and no MORE after it", () => {
  let st = dealAndPlay(St.emptyState(), D);
  for (let k = 0; k < 3; k++) st = dealAndPlay(st, D, true);
  assert.deepEqual(St.todayView(st, DECK, D2), { kind: "deal", due: 40, fresh: 0, next: null });
  st = dealAndPlay(st, D2);
  assert.equal(St.todayView(st, DECK, D2).kind, "done");
});

rule("store: more than 40 due — oldest first, the rest slide a day", () => {
  const items = {};
  LIST.slice(0, 45).forEach((id, k) => {
    items[id] = seen(id, k < 5 ? D2 : "2026-11-13", 1, "2026-11-12");
  });
  let st = { version: 2, items };
  assert.deepEqual(St.todayView(st, DECK, D2), { kind: "deal", due: 40, fresh: 0, next: null });
  const q = St.buildQueue(st, DECK, D2);
  assert.deepEqual(ids(q), LIST.slice(5, 45), "the 40 oldest; the five due today wait");
  st = play(st, q, true, D2);
  const after = St.todayView(st, DECK, D2);
  assert.equal(after.kind, "done", "the pile is full: the five are not offered today");
  assert.deepEqual(after.next, { day: "2026-11-16", count: 5 });
  assert.equal(St.todayView(st, DECK, "2026-11-16").due, 5);
  assert.deepEqual(ids(St.buildQueue(st, DECK, "2026-11-16")).slice(0, 5), LIST.slice(0, 5));
});

rule("store: the whole list written and nothing due → done, no button", () => {
  const items = {};
  LIST.forEach((id) => { items[id] = seen(id, "2026-11-20", 3, "2026-11-13"); });
  assert.deepEqual(St.todayView({ version: 2, items }, DECK, D), {
    kind: "done", due: 0, fresh: 0, next: { day: "2026-11-20", count: 40 },
  });
});

rule("store: state survives a round trip; garbage in storage is dropped", () => {
  const st = play(St.emptyState(), St.buildQueue(St.emptyState(), DECK, D).slice(0, 3), false);
  assert.deepEqual(St.parseState(JSON.stringify(st)), st);
  assert.deepEqual(St.parseState("{nope"), St.emptyState());
  const up = { ...st, upSpent: { day: D, n: 2 } };
  assert.deepEqual(St.parseState(JSON.stringify(up)), up, "the day's upgrade count is carried");
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

// ---- kanji upgrades (SPEC-kanji-upgrade §2, gates §4) ----
// Fixed dates. T is Thu 2026-12-10. The first six list words are marked:
// w01 → W01 … w06 → W06.

const T = "2026-12-10";
const day = (k) => S.addDays(T, k);
const UPS = St.deckOf(LIST, LIST.slice(0, 6).map((id) => [id, id.toUpperCase()]));
const stateOf = (items) => ({ version: 2, items: Object.fromEntries(items.map((s) => [s.id, s])) });
const many = (prefix, k, make) =>
  Array.from({ length: k }, (_, j) => make(`${prefix}${String(j).padStart(2, "0")}`, j));
const dealOf = (state, deck, today, over = {}) =>
  S.deal({
    today, items: St.itemsFor(state, deck), order: deck.order, upgrades: deck.upgrades,
    newLeft: 10, upLeft: 3, room: 40, ...over,
  });

rule("upgrade 1: a marked kana word at rung 3 is a young review; its kanji is not yet dealt", () => {
  const st = stateOf([seen("w01", T, 3, day(-7))]);
  assert.deepEqual(St.buildQueue(st, UPS, T)[0], { id: "w01", trial: false });
  assert.deepEqual(ids(St.buildQueue(st, UPS, T)), ["w01", ...LIST.slice(1, 11)]);
  assert.deepEqual(dealOf(st, UPS, T).ups, []);
});

rule("upgrade 2: at rung 4 it is parked — not due, not held, not in the next line, even past due", () => {
  const past = stateOf([seen("w01", day(-2), 4, day(-16))]);
  assert.deepEqual(dealOf(past, UPS, T, { newLeft: 0, upLeft: 0 }), { due: [], ups: [], fresh: [], held: 0 });
  assert.deepEqual(dealOf(past, UPS, T, { newLeft: 0, upLeft: 0, room: 0 }).held, 0);
  assert.ok(!ids(St.buildQueue(past, UPS, T)).includes("w01"));
  assert.equal(St.todayView(past, UPS, T).due, 0);
  const ahead = stateOf([seen("w01", day(5), 4, day(-9))]);
  assert.equal(St.todayView(ahead, UPS, T).next, null);
  assert.ok(S.isParked(ahead.items.w01, UPS.upgrades));
  assert.ok(!S.isParked(seen("w01", day(5), 3, day(-2)), UPS.upgrades), "rung 3 is not known yet");
});

rule("upgrade 3: the kanji is not dealt the day the kana word reaches rung 4; it is a trial the next day", () => {
  let st = stateOf([seen("w01", T, 3, day(-7))]);
  st = St.applyGrade(st, { id: "w01", trial: false }, T, true);
  assert.equal(st.items.w01.rung, 4);
  assert.deepEqual(ids(St.buildQueue(st, UPS, T)), LIST.slice(1, 11), "today: neither form");
  const q = St.buildQueue(st, UPS, day(1));
  assert.deepEqual(q[0], { id: "W01", trial: true, upgradeOf: "w01" });
  assert.deepEqual(ids(q), ["W01", ...LIST.slice(1, 11)]);
  assert.deepEqual(St.todayView(st, UPS, day(1)), { kind: "deal", due: 0, fresh: 11, next: null });
});

rule("upgrade 4: an unmarked kana word at rung 4 keeps its late reviews", () => {
  const st = stateOf([seen("w07", T, 4, day(-14))]);
  assert.deepEqual(St.buildQueue(st, UPS, T)[0], { id: "w07", trial: false });
  assert.deepEqual(St.todayView(st, UPS, day(-1)).next, { day: T, count: 1 }, "and stays in the next line");
  assert.ok(!S.isParked(st.items.w07, UPS.upgrades));
});

rule("upgrade 5: three upgrades a day, across two deals too, beside ten new words; upSpent, not newSpent", () => {
  let st = stateOf(LIST.slice(0, 5).map((id) => seen(id, day(20), 4, day(-1))));
  const q = St.buildQueue(st, UPS, T);
  assert.deepEqual(ids(q), ["W01", "W02", "W03", ...LIST.slice(5, 15)]);
  assert.ok(q.every((x) => x.trial));
  assert.deepEqual(St.todayView(st, UPS, T), { kind: "deal", due: 0, fresh: 13, next: null });
  st = play(st, q.slice(0, 2), true, T);
  assert.deepEqual(st.upSpent, { day: T, n: 2 });
  assert.equal(st.newSpent, undefined, "an upgrade's first write spends no new-word slot");
  assert.equal(St.upLeft(st, T), 1);
  assert.deepEqual(ids(St.buildQueue(st, UPS, T)), ["W03", ...LIST.slice(5, 15)], "dealt again: one left");
  st = dealAndPlay(st, T, false, UPS);
  assert.deepEqual([st.upSpent, st.newSpent], [{ day: T, n: 3 }, { day: T, n: 10 }]);
  assert.deepEqual(St.buildQueue(st, UPS, T), [], "the day's three are spent");
  assert.deepEqual(
    ids(St.buildQueue(st, UPS, day(1))),
    ["W01", "W02", "W03", ...LIST.slice(5, 15), "W04", "W05", ...LIST.slice(15, 25)],
    "tomorrow: yesterday's trials are due, then the two that waited, then new",
  );
});

rule("upgrade 6: a full pile — young, waited upgrades, new, other upgrades, late; the rest are held", () => {
  const order = ["a", "b", "c", "d", ...many("n", 20, (id) => id)];
  const upgrades = new Map([["a", "A"], ["b", "B"], ["c", "C"], ["d", "D"]]);
  const kana = [
    seen("a", day(9), 4, day(-1)), seen("b", day(9), 4, day(-4)),
    seen("c", day(9), 4, day(-1)), seen("d", day(9), 4, day(-4)),
  ];
  const young = many("y", 20, (id) => seen(id, T, 2, day(-3)));
  const late = many("l", 12, (id, j) => seen(id, day(-(j % 3)), 4, day(-14)));
  const lateOrder = [...late].sort((x, y) => (x.due < y.due ? -1 : x.due > y.due ? 1 : 0)).map((x) => x.id);
  const items = [...kana, ...late, ...young, ...order.slice(4).map(S.unseen)];
  const d = S.deal({ today: T, items, order, upgrades, newLeft: 10, upLeft: 3, room: 40 });
  assert.deepEqual(d.due, [...young.map((x) => x.id), ...lateOrder.slice(0, 7)]);
  assert.deepEqual(d.ups, ["A", "B", "D"], "the two that waited, and one more under the cap of 3");
  assert.deepEqual(d.fresh, order.slice(4, 14));
  assert.equal(d.held, 5);
  // three places left after the young reviews: the waited upgrades come before a new word
  const more = many("z", 17, (id) => seen(id, T, 1, day(-1)));
  const tight = S.deal({ today: T, items: [...items, ...more], order, upgrades, newLeft: 10, upLeft: 3, room: 40 });
  assert.deepEqual([tight.ups, tight.fresh, tight.held], [["B", "D"], ["n00"], 12]);
  assert.equal(tight.due.length, 37);
});

rule("upgrade 7: an upgrade has waited on the 4th day after its kana word's last write", () => {
  const order = ["a", ...many("n", 5, (id) => id)];
  const upgrades = new Map([["a", "A"]]);
  const young = (k) => many("y", k, (id) => seen(id, T, 2, day(-3)));
  const run = (today, k) =>
    S.deal({
      today, order, upgrades, newLeft: 10, upLeft: 3, room: 40,
      items: [seen("a", day(9), 4, day(-3)), ...young(k), ...order.slice(1).map(S.unseen)],
    });
  let d = run(T, 39);
  assert.deepEqual([d.ups, d.fresh], [[], ["n00"]], "day 3: the one place goes to a new word");
  d = run(day(1), 39);
  assert.deepEqual([d.ups, d.fresh], [["A"], []], "day 4: it goes ahead of new words");
  d = run(day(1), 40);
  assert.deepEqual([d.ups, d.fresh, d.due.length], [[], [], 40], "young reviews alone fill 40: it still waits");
});

rule("upgrade 8: a late review 3 days past due is dealt among the young; a rest day counts", () => {
  // due Fri 12-04, nothing written on Sat 12-05 (rest)
  const order = many("n", 5, (id) => id);
  const young = many("y", 39, (id) => seen(id, "2026-12-01", 2, "2026-11-28"));
  const items = [seen("x", "2026-12-04", 4, "2026-11-20"), ...young, ...order.map(S.unseen)];
  const run = (today) => S.deal({ today, items, order, newLeft: 10, room: 40 });
  let d = run("2026-12-06");
  assert.deepEqual([d.due.includes("x"), d.fresh, d.held], [false, ["n00"], 1], "2 days: new words go first");
  d = run("2026-12-07");
  assert.deepEqual([d.due.at(-1), d.due.length, d.fresh, d.held], ["x", 40, [], 0], "3 days: among the young");
});

rule("upgrade 9: the upgraded word has its own ladder; a miss is due tomorrow and the kana stays parked", () => {
  let st = stateOf([seen("w01", day(-2), 4, day(-16))]);
  st = St.applyGrade(st, St.buildQueue(st, UPS, T)[0], T, true);
  assert.deepEqual(st.items.W01, seen("W01", day(1), 1, T));
  assert.ok(St.itemsFor(st, UPS).some((x) => x.id === "W01" && x.seen), "it is in the scheduler's items");
  assert.deepEqual(S.nextDue(St.itemsFor(st, UPS), T), { day: day(1), count: 1 });
  const q = St.buildQueue(st, UPS, day(1));
  assert.deepEqual(q[0], { id: "W01", trial: false, upgradeOf: "w01" }, "a review, still linked to its kana word");
  st = St.applyGrade(st, q[0], day(1), true);
  assert.deepEqual([st.items.W01.rung, st.items.W01.due], [2, day(4)]);
  st = St.applyGrade(st, { id: "W01", trial: false, upgradeOf: "w01" }, day(4), false);
  assert.deepEqual([st.items.W01.rung, st.items.W01.due], [1, day(5)]);
  assert.deepEqual(st.upSpent, { day: T, n: 1 }, "only the first write counts as an upgrade");
  const next = ids(St.buildQueue(st, UPS, day(5)));
  assert.equal(next[0], "W01");
  assert.ok(!next.includes("w01"), "the kana word never comes back");
});

rule("upgrade 10: the pile never exceeds 40, with and without MORE; MORE never deals an upgrade", () => {
  let st = stateOf(LIST.slice(0, 5).map((id) => seen(id, day(20), 4, day(-1))));
  st = dealAndPlay(st, T, false, UPS);
  const sizes = [];
  for (;;) {
    const q = St.buildQueue(st, UPS, T, true);
    if (q.length === 0) break;
    assert.ok(q.every((x) => !x.upgradeOf && x.trial), "MORE deals new words only");
    sizes.push(q.length);
    st = play(st, q, true, T);
  }
  assert.deepEqual(sizes, [10, 10, 7]);
  assert.equal(Object.values(st.items).filter((x) => x.lastDay === T).length, 40);
  assert.equal(St.todayView(st, UPS, T).kind, "done");
  assert.deepEqual(st.upSpent, { day: T, n: 3 });
  // and one deal: 35 due, 3 upgrades and new words all want in
  const busy = stateOf([
    ...LIST.slice(0, 5).map((id) => seen(id, day(20), 4, day(-1))),
    ...LIST.slice(10, 45).map((id) => seen(id, T, 2, day(-3))),
  ]);
  const q = St.buildQueue(busy, UPS, T);
  assert.equal(q.length, 40);
  assert.deepEqual(St.todayView(busy, UPS, T), { kind: "deal", due: 35, fresh: 5, next: null });
});

rule("upgrade 11: session order is young, late, upgrades, new", () => {
  const st = stateOf([
    seen("w01", day(20), 4, day(-1)), // parked → W01
    seen("w10", T, 2, day(-3)), // young
    seen("w11", day(-3), 4, day(-17)), // late, held: among the young
    seen("w12", T, 5, day(-30)), // late
  ]);
  const unseenFirst = LIST.filter((id) => !["w01", "w10", "w11", "w12"].includes(id)).slice(0, 10);
  const q = St.buildQueue(st, UPS, T);
  assert.deepEqual(ids(q), ["w11", "w10", "w12", "W01", ...unseenFirst]);
  assert.deepEqual(q.map((x) => x.trial), [false, false, false, ...Array(11).fill(true)]);
});

rule("upgrade 12: an upgraded word's cue has the reading on a trial and none otherwise", () => {
  const list = [
    { order: 1, write: "のる", ask: "hiragana", reading: "のる", kanji: "乗る", upgrade: true, romaji: "noru", meaning: "to ride", pos: "verb" },
    { order: 2, write: "むずかしい", ask: "hiragana", reading: "むずかしい", kanji: "難しい", romaji: "r", meaning: "difficult" },
    { order: 3, write: "水", ask: "kanji", reading: "みず", kanji: null, romaji: "mizu", meaning: "water" },
  ];
  const ups = upgradesOf(list);
  assert.deepEqual(ups, [
    { order: 1, write: "乗る", ask: "kanji", reading: "のる", kanji: null, upgradeOf: "のる", romaji: "noru", meaning: "to ride", pos: "verb" },
  ], "one derived word per marked word; an unmarked kanji form is left alone");
  assert.deepEqual(promptFor(ups[0], true), { script: "kanji", main: "to ride", reading: "のる" });
  assert.deepEqual(promptFor(ups[0]), { script: "kanji", main: "to ride" });
  assert.deepEqual(promptFor(list[2]), { script: "kanji", main: "water", reading: "みず" }, "any other kanji word keeps its reading");
});

await rm(dir, { recursive: true, force: true });

console.log(`e2e-schedule: ${n} cases passed`);
