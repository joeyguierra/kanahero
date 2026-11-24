# BRIEF — study time dashboard, local only (2026-11-24)

**Revised 2026-11-24** after agent review (learner: "update brief based on your recommendations"):
morning items stored as their own part (§2, §4, §7) · falsifier 2 now measures transcription, not
share timed (§9) · every total labelled "measured" (§5) · words-by-script kept out, sent to
`backlog.md` (§6) · build order against the audio build is open decision 4 (§11).

**Revised again 2026-11-24, at the build** (learner: "add a menu in the splash screen that opens
options, one of them being /time"): the page **is now linked**, from a `menu` item in Today's
footer (§5). This replaces "not linked from Today or any app screen". The menu is for the creator
only and **has to be redesigned before kanahero is public** (`backlog.md` 2026-11-24, "Menu and
internal pages before public").

**Scope (learner, 2026-11-24): an internal dashboard, local only, for the creator only.** It is
outside v7. It is not v7.1 or any v7 point release, and it supersedes **no** decision about the
Joker or the look of the app itself. Its Joker and its v6 look are this page's alone (§5, §6).

**Status:** a brief, not a spec. It is the input to `SPEC-internal-study-time.md`, then a design
handoff, then the build. Nothing here is decided until the spec says so.
**Asked for by:** the learner, 2026-11-24 (day 10): see logged study time per day, split into
pre-check, app drill and night drill, inside the app, on the phone, with nothing leaving it.
**Prototype:** a claude.ai dashboard built the same day from `results.md`
(https://claude.ai/artifact/BrmeCLK5ukgxtyHGmNpHTA). It shows the shape: four totals, a stacked
bar per day, a daily table. It is a picture, not a source: `results.md` and the phone's ledger
are the sources.

Read first: project instructions → `HANDOFF.md` → `HANDOFF-week2.md` → `research/06-daily-study-time.md`
→ `results.md` (Definitions, Time per day) → `decisions.md` → `spec/SPEC-v7-skeleton.md` §7–§9
→ `backlog.md` ("Run timer") → `AGENTS.md` before any framework code.

---

## 1. What kind of feature this is

**A measurement instrument, not a learning feature.** It teaches nothing, so it doesn't need a
learning finding of its own. It still serves one: `research/06` sets 60 min a day as a budget to be
judged on the learner's own numbers, with the decision put off until a **fully timed week**
(through Fri 11-27). Today the paper parts are timed by stopwatch and typed into `results.md` by an
agent in chat. Untimed parts are the main gap (days 2–6 checks, night 1).

It still freezes to one milestone with a measurement (§9), because a time screen is the feature
most likely to turn into a treadmill (§6).

## 2. The three parts (learner, 2026-11-24)

| Part | When | What it covers | Where its minutes come from today |
|---|---|---|---|
| **Pre-check** | daytime, before the app drill | paper reading/meaning check **+ the morning items** from the night before (shown as one bar, **stored as two parts**, see below) | stopwatch → chat → `results.md` |
| **App drill** | mostly daytime | every Kana Hero session that day, summed | ledger `SessionRow` `startTs`→`endTs` |
| **Night drill** | night | the nightly sheet (A–D, sealed checks, form ladder) | stopwatch → chat → `results.md` (none timed yet) |

- **The morning items are stored apart from the check** (`check` and `morning`), and shown together
  as the pre-check bar. Reasons: `results.md` → Time per day keeps them in separate columns, so the
  screen can only be checked against it column by column; and the morning items are a cost of the
  **night routine**, not of the check. If the night routine is cut or reshaped (`research/06`,
  falsifiers), its full cost is night + morning, and a merged number can't be split afterwards.
- **Split A checks are left out** for now (learner: still gathering data). No column for them, and
  they are not folded into another part.
- **Untimed is not zero, and never estimated.** It shows as untimed and adds nothing to any total
  (truth law; `results.md` Definitions, "Time per day").
- Rest days (Saturday, `decisions.md` 2026-11-22) are not study days.

## 3. What the app already has, and what it lacks

**Has:**
- `lib/ledger.ts`: `kanahero-ledger` IndexedDB, append-only rows, `ItemRow` + `SessionRow`
  (`day`, `startTs`, `endTs`, …), `exportLedger()` from Today's footer. Every drill since
  2026-11-15 should already be on the phone.
- `lib/idb.ts`: one store per database, with its two rules (don't cache a rejected open; resolve on
  transaction complete).
- `lib/schedule.ts` `localDay()` (the phone's wall-clock day) and `addDays()` (UTC arithmetic);
  `lib/days.ts` `dayLabel()`.
- S5 DONE already prints session minutes.
- `app/page.tsx` is a phase switch (`today | loop | done | credits`), not routing. The app's
  screens are phases. **`app/verify/page.tsx` is the precedent for this page**: its own route,
  "not part of the app's screens", unlinked from them.

**Lacks:** any record of the paper parts. The app can't know how long a paper check took unless it
is told. **This is the whole build.** The drill column is a read of data the app already has.

## 4. Data — proposal for the spec

**One new row type in the existing ledger**, so one export still carries everything `results.md`
needs:

```ts
interface TimeRow {
  type: "time";
  day: string;            // the study day it counts for, YYYY-MM-DD (chosen, not inferred)
  part: "check" | "morning" | "night";   // three stored; the screen groups check + morning
  ms: number | null;      // null = clears the part back to untimed
  ts: number;             // when the row was written
  how: "manual" | "timer";
}
```

- **Append-only, latest wins.** A correction is a new row for the same `day` + `part`. Nothing is
  edited or deleted (the ledger's existing habit). Aggregation takes the row with the newest `ts`.
- **No DB version bump.** The store is `autoIncrement` with no indexes. Old rows parse unchanged.
  `LedgerRow` becomes a three-member union. Check that nothing narrows on `type` in a way that
  breaks (`app/page.tsx`, the e2e scripts).
- **App drill is not stored again.** It is computed from `SessionRow`s by `day`, as
  `Σ(endTs − startTs)`, the same **wall-clock** definition `results.md` uses. The open backlog
  question (wall clock vs active time, "Run timer", 2026-11-14) stays open: this build must not
  change the definition quietly. If the spec changes it, `results.md` Definitions changes in the same
  commit.
- **`day` is chosen, not taken from the clock.** A night sheet that runs past midnight still
  belongs to the day it started. The entry form defaults to `localDay(new Date())` and allows the
  previous day.
- **Pure aggregation in `lib/time.ts`** (DOM-free): `rows → per-day { check, morning, drill,
  night, total, timed: {check, morning, drill, night} }` + totals. The pre-check bar is
  `check + morning`, and counts as timed only when both of the day's parts that happened are
  timed (a day with no morning items, e.g. after a rest day, needs only `check`; the spec says how
  the form marks "no morning items today" as distinct from untimed). Unit-tested from node like `e2e-schedule.mjs`.
  Don't copy `exportLedger`'s DOM use into new lib code (it is an existing exception, not the
  pattern).

## 5. Screen — proposal for the design handoff

- **Where:** its own route, `app/time/page.tsx`, like `/verify`. **Linked from Today's footer:
  `menu` → MENU → TIME** (learner, 2026-11-24; this replaces "not linked"). MENU is one more phase
  in `app/page.tsx` (`components/Menu.tsx`), a list of internal pages; `/insights` and others are
  expected to join it. `/time` links back with `← kanahero`. Both links are client-side
  (`next/link`), so they work offline from the precache. **Before kanahero is public the menu has
  to be redesigned**: it puts creator-only pages one tap from Today. The page reads the same
  origin's `kanahero-ledger`, so it sees exactly what that phone holds. The route's code ships in
  the public build (as `/verify` does); its data never does: a stranger opening `/time` sees an
  empty page.
- **What it shows** (from the prototype): totals per part and overall · one stacked bar per day,
  three parts · a table, newest first: day · pre-check · app drill · night drill · total. Untimed
  cells read `—`. Opening a pre-check cell shows its two stored parts (check, morning).
- **Every total says "measured".** Days 2–6 have untimed checks and night 1 is untimed, so any sum
  undercounts the real time. A total is labelled as measured minutes and states how many parts
  behind it are untimed (e.g. "measured · 7 parts untimed"). No bare totals.
- **Entry:** per day, per stored part (check, morning, night), `m:ss`. Opening an untimed cell for today (or yesterday) gives the
  field. Saving writes a `TimeRow`. Clearing writes `ms: null`.
- **Look:** the **v6 look at its latest** (`docs/design/v6/KanaHero v6 Receipt.dc.html`): THE LOG
  tokens from `globals.css`, Archivo 900 numbers, mono labels, the v6 Joker seat. This is the
  page's own choice and says nothing about the app's look. The three part colors come from the
  existing palette (`--blueprint`, `--live`, `--caution` are candidates). `--strike` stays the
  action color. The design handoff picks. Styles stay scoped to the page (a class prefix, as
  `/verify` does), so `globals.css` isn't reshaped for it.
- **Offline:** `gen-sw` precaches all of `out/`, so the route works offline with no change. It makes
  no network call.

## 6. Treadmill guard — what it must not do

Taken from `HANDOFF.md` §3, the backlog "Run timer" entry and `research/06` ("not a quota"):

- No goal line, no 60-min target, no progress ring, no "x min to go". **60 min is not a decision**
  (`HANDOFF-week2.md` open question 1). A budget shown in the app would act as a quota.
- No streak, no calendar of filled/empty squares, no count of days in a row.
- No best day, no comparison with yesterday or last week, no averages put forward as a score.
- No red, no "missed", no copy about absence. Today never comments on absence (SPEC-v7 §7), and
  this screen doesn't either.
- No push, no reminder to log.
- **The Joker is on this page** (learner, 2026-11-24). Internal only: this does **not** bring him
  back to the app, start v7.1, or touch `joker/corpus.md`, `joker/facts.json` or `joker-audit`.
  His lines live in the page's own file. **How he talks still holds** (project instructions;
  `joker-character.md` READ FIRST): positive only, information first, under twelve words, kana
  only, and rule 10, never streaks, days, XP or time since. Here that means he explains the page
  (untimed vs 0, which day a late night counts for), and never comments on how many minutes or
  how many days. Five candidate lines are in `docs/design/time/time-hifi-prompt.md`.

- **No word counts on this screen.** A breakdown of words learned by script (kanji / katakana /
  hiragana) was asked about on 2026-11-24 and left out: the app deals words in a fixed list order,
  so the count only mirrors the list (210 words = 105 hiragana · 84 kanji · 21 katakana) and
  nothing can be done with it. The cuts that could drive a decision (miss rate by script, distinct
  kanji covered) need a definition of "learned" and their own spec → `backlog.md` 2026-11-24.

That leaves one open conflict: `results.md` writes day 7 as **missed** (research record). The app
should show what was done, not what wasn't. → open decision 1.

## 7. Backfill (days 1–10)

- **No seed file in the repo.** `public/` is deployed. The learner's numbers are local by default
  (privacy law), so they never ship in the build.
- Drill minutes for 11-15 → 11-24 come from the ledger already on the phone. **Verify on the
  phone:** the TIME screen's drill column must match `results.md` → Time per day: 9.6 · 18.5 ·
  15.1 · 14.8 · 17.3 · 16.5 · — · 8.8 · 10.4 · 11.1.
- The paper parts are entered by hand once, through the normal form: check **11-22 11.2 ·
  11-23 8.9 · 11-24 8.0**; morning **11-24 5.6** (the first morning items). The 11-24 pre-check bar
  then reads 13.6. Night: nothing timed yet. Days 2–6
  pre-checks stay untimed.

## 8. Standing constraints that bind this build

- Offline, $0 runtime, no server, no account, no sync. Local by default; any export is a file the
  learner chooses to make (the existing export button).
- `lib/` stays DOM-free. Don't pre-abstract `WritingCanvas.tsx`, `strokeAnimator.ts` or
  `globals.css`.
- No "pro", locks or teased features.
- This Next.js is not the one in training data: read `node_modules/next/dist/docs/` for anything
  framework-shaped (`AGENTS.md`).
- **The learner does every commit and push** (`HANDOFF-week2.md` Housekeeping). Agents write files
  and say which.
- Build log filled in the moment (minutes, prompts, stumbles, cost) in the spec's §10.

## 9. Freeze, measurement, falsifiers

**Milestone:** one fully timed study week (6 study days) entered in the app, every part timed,
with the TIME screen agreeing with `results.md`.

**Measurement:** transcription, app against chat. For each study day and part: (a) is there an
entry, and (b) does it match the stopwatch. Paper baseline = the fully timed paper week (through
Fri 11-27), where an agent types each time into `results.md`: count parts with no entry and
entries later corrected. Share of parts timed is no longer the measure: agents now ask for a time
on every part (`HANDOFF-week2.md` routine 4), so paper may already reach 100%.

**Falsified / removed if:**
1. **Wrong numbers.** Any day where the screen and `results.md` disagree on a measured part by more
   than 0.1 min on hand-entered values, or on drill minutes from the same ledger. Fix before use.
2. **No better than paper.** After two study weeks in the app, missing entries + corrected entries
   are no fewer than in the paper week, **and** the learner still pastes times into chat for an
   agent to log. The screen saves no step → remove it, keep the stopwatch.
3. **Treadmill signal.** The learner reports padding a part to fill a bar, guilt at a short day, or
   opening the screen in place of studying → strip what caused it (or remove the screen).
4. **Build > study.** Build minutes for this feature exceed one week's study minutes, or a study day
   is skipped for build work → stop and reorder (project instructions).

## 10. Gates (from SPEC-v7 §9, extended)

- `npm run build` (incl. `gen-sw`), `/time` in the precache list.
- `npm run e2e` + a new **`scripts/e2e-time.mjs`**: pure aggregation cases with *synthetic* rows,
  never the learner's. Cases: latest-wins, a `null` clear, untimed vs 0, two sessions summed, a
  night row dated the day before midnight, check + morning grouped into one bar, a pre-check with
  check timed and morning untimed (bar shows the measured part and is marked partly untimed),
  totals carrying their untimed count, old ledger rows without `type: "time"`. Plus a
  Playwright pass against `out/`: Today → time → enter `11:12` for check → table shows `11.2` →
  export contains the `TimeRow`. Offline pass unchanged.
- iPhone Safari on the live build before it is called shipped (HANDOFF debt 6).
- `joker-audit`: not a gate here. The page is outside the app's Joker pipeline (§6); its lines are checked by hand against the READ FIRST list in the spec.
- Post-build audit section in the spec if the build departs from it.

## 11. Open decisions, in the order to ask (one at a time)

1. **Days with nothing.** Missed and rest days are left off the chart and table entirely (default,
   §6), or shown as an empty, unmarked column so the time axis stays even?
2. **Entry method.** Manual `m:ss` only (default: smallest build, matches the stopwatch habit), or a
   start/stop timer for the paper parts too (`how: "timer"`). A timer changes how the parts are
   measured, so it should start at a week boundary, not mid-week.
3. **Units.** Minutes with one decimal (as `results.md`), or `m:ss` (as the backlog's S5 proposal)?
   Pick one for both screens.
4. **Build order against the audio build.** Tap-to-play audio is planned for the week of 11-30
   (`backlog.md`, decided 2026-11-23). This screen teaches nothing; the audio is the first step
   toward the one skill never trained (`research/03`). **Agent's recommendation: audio first.**
   Stopwatch + chat already covers time tracking; nothing covers listening. Asked 2026-11-24,
   not yet answered.
5. **When to build.** Recommendation: write the spec and design handoff this week, **start the
   build after Fri 11-27** (and after the audio build if decision 4 goes that way). The first fully timed week stays on paper with one method from start to
   finish. Changing the method mid-week muddies the number `research/06` is waiting for.

## Next physical-world action

Tonight: time the Night 2 sheet on the stopwatch. It is the first measured night drill and the
column this screen exists for. Then answer open decision 1.
