// /time (docs/spec/BRIEF-study-time-dashboard.md §10). Two passes:
//   A. lib/time.ts, pure, from node — synthetic rows only, never the learner's
//   B. the built page: seed a ledger, type a time, read the table and the export
// Run: npm run build && node scripts/e2e-time.mjs

import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";
import { chromium } from "playwright";
import { ledger, serveOut } from "./e2e-lib.mjs";

const dir = await mkdtemp(path.join(tmpdir(), "kanahero-time-"));
for (const name of ["schedule", "time"]) {
  const src = await readFile(new URL(`../lib/${name}.ts`, import.meta.url), "utf8");
  const { outputText } = ts.transpileModule(src, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  });
  await writeFile(
    path.join(dir, `${name}.mjs`),
    outputText.replace(/from "\.\/([\w-]+)"/g, 'from "./$1.mjs"'),
  );
}
const T = await import(pathToFileURL(path.join(dir, "time.mjs")).href);
const { localDay, addDays } = await import(pathToFileURL(path.join(dir, "schedule.mjs")).href);

let n = 0;
const rule = (name, fn) => { fn(); n++; console.log(`  ok  ${name}`); };

const MIN = 60000;
const session = (day, min, startTs = 1000) => ({ type: "session", day, startTs, endTs: startTs + min * MIN, due: 0, fresh: 0, done: 1, missed: 0 });
const time = (day, part, ms, ts = 1, extra = {}) => ({ type: "time", day, part, ms, ts, how: "manual", ...extra });
const TODAY = "2026-03-10";
const agg = (rows, starts = {}) => T.aggregate(rows, { today: TODAY, starts });
const day = (r, d) => r.days.find((x) => x.day === d);

rule("m:ss: 11:12 is 11.2 min; 8:55 is 8.9; anything else is refused", () => {
  assert.equal(T.fmt(T.toTenths(T.parseMSS("11:12"))), "11.2");
  assert.equal(T.fmt(T.toTenths(T.parseMSS("8:55"))), "8.9");
  assert.equal(T.toMSS(T.parseMSS("5:36")), "5:36");
  for (const bad of ["", "11", "11:1", "11:60", "1.5", "a:10"]) assert.equal(T.parseMSS(bad), null, bad);
});

rule("two sessions in a day are summed, wall clock", () => {
  const r = agg([session("2026-03-02", 6), session("2026-03-02", 4.5, 9e6)]);
  assert.equal(day(r, "2026-03-02").drill, 105);
  assert.equal(r.totals.drill, 105);
});

rule("old ledger rows (item, session, with a setId) pass through untouched", () => {
  const r = agg([
    { type: "item", day: "2026-03-02", ts: 1, word: "x", trial: false, ok: true, ms: 900, setId: "a" },
    { ...session("2026-03-02", 10), setId: "a" },
    { type: "session", day: "2026-03-03", startTs: 5 }, // never closed
  ]);
  assert.deepEqual(r.days.map((d) => d.day), ["2026-03-02"]);
  assert.equal(r.totals.total, 100);
});

rule("latest wins: a correction is a newer row; write order breaks a tie", () => {
  const r = agg([
    time("2026-03-02", "check", 10 * MIN, 5),
    time("2026-03-02", "check", 11 * MIN, 9),
    time("2026-03-02", "check", 99 * MIN, 2),
    time("2026-03-02", "night", 7 * MIN, 4),
    time("2026-03-02", "night", 8 * MIN, 4),
  ]);
  assert.equal(day(r, "2026-03-02").check.tenths, 110);
  assert.equal(day(r, "2026-03-02").night.tenths, 80);
});

rule("untimed is not zero: it adds nothing and is counted", () => {
  const r = agg([session("2026-03-02", 10), time("2026-03-02", "check", 0, 1), session("2026-03-03", 10)]);
  assert.deepEqual(day(r, "2026-03-02").check, { kind: "timed", tenths: 0, ms: 0 });
  assert.equal(day(r, "2026-03-03").check.kind, "untimed");
  assert.equal(day(r, "2026-03-03").pre, null);
  assert.equal(day(r, "2026-03-02").pre, 0);
  assert.equal(day(r, "2026-03-03").total, 100);
});

rule("a null row clears the part back to untimed", () => {
  const r = agg([session("2026-03-02", 10), time("2026-03-02", "check", 9 * MIN, 1), time("2026-03-02", "check", null, 2)]);
  assert.equal(day(r, "2026-03-02").check.kind, "untimed");
  assert.equal(r.totals.pre, null);
  assert.equal(r.totals.untimed, 2); // check, and that night's sheet
});

rule("none is not untimed: it did not happen, and is not counted", () => {
  const r = agg([
    session("2026-03-02", 10),
    time("2026-03-02", "check", null, 1, { none: true }),
    time("2026-03-02", "night", null, 1, { none: true }),
  ]);
  assert.equal(day(r, "2026-03-02").check.kind, "none");
  assert.equal(r.totals.untimed, 0);
});

rule("a night row dated the day before midnight counts for that day", () => {
  const afterMidnight = new Date(2026, 2, 3, 0, 40).getTime();
  const r = agg([session("2026-03-02", 10), time("2026-03-02", "night", 20 * MIN, afterMidnight)]);
  assert.equal(day(r, "2026-03-02").night.tenths, 200);
  assert.equal(day(r, "2026-03-03"), undefined);
});

rule("check + morning are stored apart and drawn as one bar", () => {
  const r = agg([
    session("2026-03-01", 10), time("2026-03-01", "night", 15 * MIN),
    session("2026-03-02", 11.1), time("2026-03-02", "check", T.parseMSS("8:00")), time("2026-03-02", "morning", T.parseMSS("5:36")),
  ]);
  const d = day(r, "2026-03-02");
  assert.equal(T.fmt(d.pre), "13.6");
  assert.equal(d.preUntimed, 0);
  assert.equal(T.fmt(d.total), "24.7");
});

rule("check timed, morning untimed: the bar is the measured part, marked partly untimed", () => {
  const r = agg([
    session("2026-03-01", 10), time("2026-03-01", "night", 15 * MIN),
    session("2026-03-02", 10), time("2026-03-02", "check", 8 * MIN),
  ]);
  const d = day(r, "2026-03-02");
  assert.equal(d.pre, 80);
  assert.equal(d.preUntimed, 1);
  assert.equal(d.morning.kind, "untimed");
});

rule("no sheet the night before: no morning items, nothing owed", () => {
  const r = agg([session("2026-03-02", 10), session("2026-03-04", 10), time("2026-03-04", "check", 8 * MIN)]);
  assert.equal(day(r, "2026-03-04").morning.kind, "blank");
  assert.equal(day(r, "2026-03-04").preUntimed, 0);
});

rule("before a routine began the part is blank, not untimed", () => {
  const r = agg([session("2026-03-01", 10), session("2026-03-02", 10), session("2026-03-03", 10)], { check: "2026-03-02", night: "2026-03-03" });
  assert.equal(day(r, "2026-03-01").check.kind, "blank");
  assert.equal(day(r, "2026-03-02").check.kind, "untimed");
  assert.equal(day(r, "2026-03-02").night.kind, "blank");
  assert.equal(day(r, "2026-03-03").night.kind, "untimed");
  assert.equal(r.totals.untimed, 3);
});

rule("today: the night sheet is not yet; the pre-check is owed once the drill has run", () => {
  const before = agg([time(TODAY, "check", 8 * MIN)]);
  assert.equal(day(before, TODAY).night.kind, "blank");
  assert.equal(before.totals.untimed, 0);
  const after = agg([session(addDays(TODAY, -1), 10), session(TODAY, 10)]);
  assert.equal(day(after, TODAY).check.kind, "untimed");
  assert.equal(day(after, TODAY).morning.kind, "untimed");
  assert.equal(day(after, TODAY).night.kind, "blank");
});

rule("totals: measured parts only, with the untimed count beside them", () => {
  const r = agg([
    session("2026-03-01", 9.6),
    session("2026-03-02", 18.5),
    session("2026-03-03", 8.8), time("2026-03-03", "check", T.parseMSS("11:12")),
  ], { check: "2026-03-02", night: "2026-03-09" });
  assert.equal(T.fmt(r.totals.total), "48.1");
  assert.equal(T.fmt(r.totals.pre), "11.2");
  assert.equal(r.totals.night, null); // nothing measured is a dash, not 0.0
  assert.equal(r.totals.untimed, 1);
});

rule("a day with nothing is absent: no row, no gap", () => {
  const r = agg([session("2026-03-02", 10), session("2026-03-04", 10)]);
  assert.deepEqual(r.days.map((d) => d.day), ["2026-03-02", "2026-03-04"]);
});

await rm(dir, { recursive: true, force: true });
console.log(`time: ${n} rules ok`);

// --- B. the built page ---
const { url: BASE, kill } = await serveOut(3215);
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
const page = await context.newPage();
page.setDefaultTimeout(30000);
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));

// an empty device: the page is empty, and says nothing about it
await page.goto(`${BASE}/time`);
await page.waitForSelector("[data-testid=total]");
assert.equal(await page.locator("[data-testid=total]").innerText(), "0.0");
assert.equal(await page.locator("table").count(), 0);

// seed two drill days the way the app writes them
const today = await page.evaluate(() => {
  const d = new Date();
  const p = (x) => String(x).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
});
assert.equal(today, localDay(new Date()));
const yesterday = addDays(today, -1);
await page.evaluate(
  (rows) =>
    new Promise((resolve, reject) => {
      const open = indexedDB.open("kanahero-ledger", 1);
      open.onsuccess = () => {
        const t = open.result.transaction("rows", "readwrite");
        for (const r of rows) t.objectStore("rows").add(r);
        t.oncomplete = resolve;
        t.onerror = () => reject(t.error);
      };
      open.onerror = () => reject(open.error);
    }),
  [session(yesterday, 10.4), session(today, 8.8)],
);
await page.reload();
await page.waitForSelector(`[data-testid=row-${today}]`);
assert.equal(await page.locator("[data-testid=total]").innerText(), "19.2");
assert.match(await page.locator(`[data-testid=row-${today}]`).innerText(), /—\s+8\.8\s+8\.8/);

// enter 11:12 for today's check; a bad value is refused first
await page.click("[data-testid=enter]");
await page.fill("[data-testid=in-check]", "11");
await page.click("[data-testid=save]");
assert.equal(await page.locator("[data-testid=in-check]").getAttribute("aria-invalid"), "true");
await page.fill("[data-testid=in-check]", "11:12");
await page.click("[data-testid=save]");
await page.waitForSelector("[data-testid=sheet]", { state: "detached" });
await page.waitForFunction((d) => document.querySelector(`[data-testid=pre-${d}]`)?.textContent.includes("11.2"), today);
assert.equal(await page.locator("[data-testid=total]").innerText(), "30.4");
assert.match(await page.locator(`[data-testid=row-${today}]`).innerText(), /11\.2\s+8\.8\s+20\.0/);

// the pre-check opens into its two stored parts
await page.click(`[data-testid=pre-${today}]`);
assert.match(await page.locator("[data-testid=inset]").innerText(), /CHECK 11\.2 · MORNING ITEMS .* = 11\.2/);

// the row is in the ledger, and in the file the export button makes
const rows = await ledger(page);
const row = rows.find((r) => r.type === "time");
assert.deepEqual({ ...row, ts: 0 }, { type: "time", day: today, part: "check", ms: 672000, ts: 0, how: "manual" });
const [download] = await Promise.all([page.waitForEvent("download"), page.click("text=export ledger")]);
const file = JSON.parse(await readFile(await download.path(), "utf8"));
assert.ok(file.rows.some((r) => r.type === "time" && r.ms === 672000), "export carries the TimeRow");

// a correction is a second row; clear puts the dash back; nothing is deleted
await page.click(`[data-testid=night-${today}]`);
await page.fill("[data-testid=in-check]", "9:00");
await page.click("[data-testid=save]");
await page.waitForFunction((d) => document.querySelector(`[data-testid=pre-${d}]`)?.textContent.includes("9.0"), today);
await page.click(`[data-testid=night-${today}]`);
await page.click("text=clear");
await page.waitForFunction((d) => document.querySelector(`[data-testid=pre-${d}]`)?.textContent.includes("—"), today);
assert.equal((await ledger(page)).filter((r) => r.type === "time").length, 3);

// the app itself is unchanged by the new rows, and never links here
await page.goto(BASE);
await page.waitForSelector(".v7Counts");
assert.equal(await page.locator("a[href*=time]").count(), 0);
assert.deepEqual(errors, []);

await browser.close();
kill();
console.log("time: page ok");
