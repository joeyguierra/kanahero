# kanahero — build spec v7 · the skeleton

**Status: READY TO BUILD (2026-11-14, 03:30).** Written against `results.md` Baseline
(mock 5/8 · meaning 18/20 · production 16/20 · drill days 0) and `docs/research/00-survey.md`.
**Amended 2026-11-14 (workshop):** rule of the build is *simplest first, additions later*.
Entry is Today for the last-used set, with one plain set list (S0) behind the set name; the
per-word list (old S1b) is tabled; six sets stay as six queues, no script decks; the Joker stays
in v7.1. Wireframe to match: `docs/design/v7/v7-wireframe-brief.md`.
**Amended 2026-11-14 (one queue):** sets and placement are retired. The app is one ordered
list of 210 words (`docs/research/01-n5-word-list.md`) and one pile a day, 30 words at most.
§1, §3 D4, §4, §5, §7, §8 and §9 below are rewritten to match; §11 records what the first
build was and what changed. Where an older line and this amendment disagree, this one stands.
**Base:** `11ad5e5` on `main`. Build on a branch `v7`. Where this file is silent, nothing
stands — v7 starts from zero and takes files back one by one (§2).
**Next.js:** read `AGENTS.md` first — this is Next 16; check `node_modules/next/dist/docs/`
before touching framework APIs. Static export, no server, $0 runtime, offline.
**Doctrine:** does not exist. §3 names the three defaults this build bakes in. They are
labelled, not law; the first doctrine workshop ratifies or amends them against the next
re-measurement.

## 0. Why v7 and not v6a

v6 is 7,068 lines; `lib/session.ts` (21 lines, requeue-5-later) is the whole learning engine.
Nothing is remembered between days; a character "joins the set" once and is never asked again.
The baseline says the learner's kana production is near ceiling (16/20) and his gap is nine
unknown words and every kanji on the test. The reward layer couples to the loop at every seam
(audit, facts, rarity, receipts) and makes the loop expensive to change. So: a new tree, the
loop plus a scheduler plus a ledger, and the rest comes back on its own spec when it earns it.

## 1. Scope

**In this build**
1. The write loop, unchanged in behaviour: prompt → write → reveal strokes over ink →
   self-grade → miss requeues 5 later (§6).
2. A per-item scheduler with due dates, a uniform rung ladder, and one daily pile: reviews
   first, then new words in the room left. Pure function, `lib/`, DOM-free (§5).
3. A study trial for every item's first exposure (§6.2).
4. One queue. The app decides what is written each day; there is no set list and no
   placement question. Nothing is assumed known.
5. The unit is the word. The prompt names the script asked for; a kanji word prompts with
   meaning + reading, a kana word with its meaning alone (§4).
6. A ledger: drill days, items due/done/missed, minutes. Exportable JSON (§8).
7. Five screens: S1 Today, S2–S5 (§7). THE LOG as the visual system, reused, not redesigned.
8. Data: one word list, `public/words/n5.json`, 210 words in drill order (§4). The six set
   files stay on disk, unread, until the post-ship trim.
9. `npm run e2e` gates: e2e-loop (rewritten), e2e-schedule (new), e2e-offline (kept).

**Not in this build — tabled, with return order**
- v7.1 **The Joker**: one seat (Today, miss line). Bible unchanged. `joker-audit` returns with him.
- v7.2 **Cards / collection**: redesigned around *done*, not all-or-nothing (a card is what you
  keep after a set stops asking). Rarity-by-tries does not return unless research says so.
- v7.3 **Receipts** (ink kept per got-it). v7.4 **Sound**. v7.5 **Capture bank**.
- v7.0.1 **Scrolling canvas for multi-character words** (decided 2026-11-14, built right
  after the first drill day): one full-width box per character on a canvas N boxes wide. The
  bottom button reads NEXT until the last box, then DONE; a strip of cells under the canvas
  shows the position and jumps back on tap. PREVIEW shrinks the whole word onto one screen,
  read-only; WRITE returns to the boxes. The shrink is a scale of the same canvas, so the ink
  keeps its shape — add a minimum line width only if a phone shows it too faint. The reveal
  lands in the preview. CLEAR clears the current box. `WritingCanvas.tsx` is not edited for it.
- **The user's brush** — the look of the ink the user draws (width, taper, colour) is to
  change. Logged 2026-11-14, not designed yet; it lives in `lib/ink.ts`.
- **Per-word list** (word · reading · meaning · rung mark; was S1b) — reference only, nothing in
  the loop needs it. **Script decks** (grouping sets under Hiragana / Katakana / Kanji) — only
  if six rows prove too many.
- **Readings task** (produce the reading; Dive B) — own spec after research.
- **Pitch accent line** — slot reserved on S4; data + finding needed.
- **Audio / listening via the Joker (ElevenLabs)** — blocked on the runtime posture decision.
  Pre-rendered clips at build time to be tested before any live API.
- Settings beyond set choice, onboarding, dark/light toggle, notifications, goals, streaks,
  XP, badges, a dashboard, accounts, sync.

## 2. What carries over, file by file

Copy as-is, do not refactor: `components/WritingCanvas.tsx`, `lib/strokeAnimator.ts`,
`lib/ink.ts`, `lib/strokes.ts`, `lib/kana.ts`, `components/StrokeOverlay.tsx`,
`components/StrokeChar.tsx`, `components/WordReveal.tsx` (the whole-word reveal on S4 and the
study trial; its tap-to-hurry, tap-again-to-finish comes with it), `components/PromptMelt.tsx`, `public/strokes/**`, `public/sets/**`,
`scripts/verify-strokes.mjs`, `scripts/gen-sw.mjs`, `scripts/e2e-offline.mjs`,
`components/ServiceWorker.tsx`, `app/globals.css` (THE LOG — trim dead card/bank rules only
after v7 ships, not during), attribution/credits content.

Copy and edit: `lib/sets.ts` (§4), `lib/idb.ts` (ledger store), `lib/session.ts` (§5),
`app/page.tsx` (phase switch; new phases), `app/layout.tsx`, `app/manifest.ts`.

Leave behind (in git, not in the v7 tree): `Bank.tsx`, `CaptureDetail.tsx`, `Card.tsx`,
`CardView.tsx`, `Collection.tsx`, `Deck.tsx`, `HandTick.tsx`, `InkPanel.tsx`, `Joker.tsx`,
`Result.tsx`, `RevealCard.tsx`, `Round.tsx`, `Session.tsx`, `SetScreen.tsx`, `Settings.tsx`,
`AbandonDialog.tsx`, `lib/bank.ts`, `lib/joker*.ts`, `lib/progress.ts`,
`lib/receipts.ts`, `lib/reveal.ts`, `lib/sfx*.ts`, `lib/audio.ts`, `lib/zip.ts`, `joker/`,
`scripts/joker-audit.mjs`, `scripts/sfx-*.mjs`, `scripts/e2e-joker.mjs`, `scripts/e2e-bank.mjs`.
`package.json` scripts: `build` = `next build && node scripts/gen-sw.mjs`; `predev` removed.

## 3. Defaults this build bakes in (pending doctrine)

| Default | Value | Finding it rests on | Falsified by |
| :-- | :-- | :-- | :-- |
| D1 rung ladder | 1 · 3 · 7 · 14 · 30 days, uniform | Latimier 2021: spacing×retrieval; no clear evidence expanding > uniform | 7-day delayed production on scheduled vs unscheduled items shows no gap |
| D2 criterion | an item advances on a got-it on a *fresh day*; "done" = two fresh-day corrects (rung ≥ 3) | Rawson & Dunlosky; Kornell & Bjork 2008 (.62 after one correct, .88 after two) | items at rung 3 miss at the same rate as rung 1 |
| D3 unit | the word; kana = 1-char words | Guan & Perfetti 2015 (writing builds form↔meaning); baseline: gap is words + kanji | word-level drilling moves production but not the mock |
| D4 daily pile | 30 words at most: every due word first, then up to 10 new in the room left; MORE adds new words, 10 at a time, up to 30 | load arithmetic, not a finding — label as such. 10 new a day sits inside the 6–15 studied, none with handwriting (research 01 §2) | the pile passes 20 min by week 3 |
| D5 study trial | first exposure = show → melt → write | retrieval needs an encoding; pretesting null for novel associations | — (design necessity) |

## 4. Data: the word list

`public/words/n5.json` is a straight copy of `docs/research/01-n5-week1-words.json`: an array
of 210 words in drill order. Positions 1–70 are week one if nothing is missed.

```ts
interface Word { order: number; write: string; ask: "hiragana" | "katakana" | "kanji";
                 reading: string; kanji: string | null; romaji: string; meaning: string;
                 pos?: string; source?: string; note?: string }
```

- `write` is exactly what is handwritten. **It is the item id.** Every `write` is unique.
- `ask` is the script the prompt names. Kanji plus okurigana (新しい) is `kanji`.
- `kanji` is the usual kanji form of a word asked in hiragana (のる → 乗る), shown on the answer
  screen only; `null` when the word is normally written in kana. The six doubtful cases were
  checked against a dictionary's usually-kana flags on 2026-11-14: つける, あげる, かかる and
  かける stay `null`, おととい keeps 一昨日, and ゆうべ gained 昨夜.
- Every `meaning` is unique, because a kana word is prompted by its meaning alone.

`scripts/verify-strokes.mjs` checks all of this and that every character has a stroke file.
Kanji strokes: `node scripts/fetch-kanjivg.mjs` (reads the word list). The long-vowel mark ー
comes from strokesvg's katakana set, like the other kana.

**Prompt:** the script label, then the cue. `kanji` → meaning + reading (kana). `hiragana`
and `katakana` → the meaning alone, because the reading is the form. The prompt never
contains the written form. Multi-character words are written one character per box on one
canvas (§7 S3); the grade is for the whole word.

## 5. The scheduler — `lib/schedule.ts`, pure, DOM-free

```ts
type Rung = 0 | 1 | 2 | 3 | 4 | 5;            // 0 = never seen
const LADDER_DAYS = [0, 1, 3, 7, 14, 30];      // days until due, by rung
const NEW_CAP = 10;                            // new words in one deal
const PILE_MAX = 30;                           // words in one day, reviews and new together
interface ItemState { id: string; rung: Rung; due: string /* YYYY-MM-DD local */;
                      lastDay?: string; seen: boolean }
interface DealInput { today: string; items: ItemState[]; order: string[];
                      newLeft: number; room: number }
interface Deal { due: string[]; fresh: string[]; held: number }
function deal(i: DealInput): Deal
function grade(s: ItemState, today: string, ok: boolean): ItemState
```

Rules (each one is an e2e case):
1. **Due first.** `due = items where due <= today`, oldest due first, then list order, at most
   `room`. **More due than room:** the rest are `held`. Nothing about them changes, so they
   are older tomorrow and come first.
2. **Then new.** `fresh = unseen items in list order`, at most `newLeft`, and only in the room
   the reviews leave. No new words on a day reviews fill the pile.
3. **Grade got-it:** if `lastDay !== today` → `rung = min(rung+1, 5)`, `due = today +
   LADDER_DAYS[rung]`, `lastDay = today`. If `lastDay === today` (second correct same day)
   → no change. A rung never advances twice in one day.
4. **Grade miss:** `rung = 1`, `due = today + 1`, `lastDay = today`. Within the session the item
   requeues at position 5 (existing `requeue`). A later got-it the same day does not advance it
   (rule 3).
5. **Study trial:** an item with `seen === false` is dealt with `trial: true`; after its first
   grade `seen = true`. First grade of a trial item: got-it → rung 1, due tomorrow (not rung 2;
   the write was seconds after seeing it). Miss → rung 1, due tomorrow, requeue.
6. **The day's pile** (`lib/store.ts` owns the bookkeeping). `room = 30 − words graded today`
   (new or review, got or missed; a word counts once). DEAL passes `newLeft = 10 − new words
   first written today`.
7. **MORE.** When DEAL has nothing left, the pile has room and unseen words remain, MORE deals
   new words with `newLeft = 10`, still inside `room`. It can be taken again until the pile is
   30, never past it. Extra words cost tomorrow nothing but their reviews.
8. **Done for today** = the pile is full, or nothing is due and nothing is unseen. Today shows
   the next line instead of a button. Held words count toward tomorrow's line; the line never
   names more than 30.
9. New items are dealt in list order; no shuffle of fresh. Due items keep rule 1 order.
10. Days are local calendar days; a session that crosses midnight keeps its start day.

Gone with the sets: placement ("already know", blind first write to rung 2), the per-set cap,
"0 new when due > 20", and WRITE ANYWAY with its pull-forward of tomorrow's reviews.

## 6. The loop

6.1 **Pure retrieval (seen item):** S2 prompt (3 s melt) → S3 write → S4 reveal + grade.
    The wait can be hurried: a tap starts the melt, a second tap finishes it. The word itself
    cannot be skipped.
6.2 **Study trial (unseen):** S2 shows the written form large with its stroke animation once,
    reading + meaning beneath, then melts → S3 write → S4. The form is gone when the pen is down.
    No ghost, no trace, no second look before writing. The melt starts when the animation ends,
    not on the 3 s timer; a tap hurries the animation, a second tap finishes it (as on S4).
    Once the form is drawn, the same two taps hurry the hold and the melt.
6.3 **Grade is binary and the user's.** The overlay is the evidence. The S4 copy under the
    buttons says once, small: *dots, long vowels and small kana count*. This is the one place
    the app comments on grading, because the baseline's four misses were all of that kind.
6.4 **Session ends when the deal is empty.** No re-deal. S5.

## 7. Screens (THE LOG; mobile first; no new visual system)

- **Launch.** Opens S1. There is nothing to choose.
- **S1 TODAY.** `TODAY` + the date · `N due · M new` · the spread · the button. Footer:
  *export ledger* · *credits*. The spread is a picture of the deal: one small card per word,
  hatched = due, plain = new, due first; 1–7 in one row, 8–20 in two, 21–30 in three, upper
  rows take the odd cards. States:
  1. first run — `0 due · 10 new`, DEAL;
  2. normal — `N due · M new`, DEAL;
  3. heavy — reviews fill the pile, so `30 due · 0 new`, DEAL; no copy about absence, ever;
  4. the deal is written, the pile has room, unseen words remain — `0 due · 0 new`,
     "next: <day> · <n> due", MORE (outlined, not filled; §5 rule 7);
  5. done for today — "next: <date> · <n> due", no button.
  One blank line reserved under the numbers (Joker seat, v7.1).
- **S2 PROMPT** — the script label above the cue, per §4; trial variant per §6.2. A tap
  anywhere hurries it (§6.1).
- **S3 WRITE** — canvas, one box per character (dashed divider between boxes, all on one screen
  until v7.0.1), CLEAR, UNDO (takes back the last stroke), DONE. A plain ✕ leaves the session for S1 with no confirm: every grade
  is saved as it is made, so nothing is lost. No hints, no count, no grid.
- **S4 REVEAL + GRADE** — strokes over ink; word · reading (when it differs) · the kanji form
  of a word asked in hiragana · meaning; GOT IT / MISSED equal
  weight; the one grading line (§6.3). Reserved 1-line slot above the reading (pitch accent),
  blank. Joker seat bottom-left, blank.
- **S5 DONE** — list of today's items (word · reading where it differs from the word · ✓/✗) ·
  minutes · "next: <n> due <day>" ("tomorrow" when it is) · CLOSE.
  Nothing else. No score, streak, share, rarity.

## 8. Storage

- `kanahero:v7` localStorage — `{ version: 2, items: Record<write, ItemState>, newSpent?:
  { day, n } }`. `newSpent` counts the new words first written on `day`. A `version: 1` blob
  (keyed `setId/word`) is not carried over: the queue starts clean. v6's `kanahero:v1` is no
  longer read; it is left in place, never written.
- `kanahero-ledger` IndexedDB (reuse `lib/idb.ts`) — one row per graded item:
  `{ day, ts, word, trial, ok, ms }` + one row per session: `{ day, startTs, endTs,
  due, fresh, done, missed }`. Rows written before the one-queue rework also carry a `setId`.
  Export: a JSON file from Today's footer, named
  `kanahero-ledger-<day>.json`. This is `results.md`'s data source.
- Receipts (`kanahero-receipts`) and bank (`kanahero-bank`) stores are untouched and unread.

## 9. Verification (build gates)

- `npm run build` = `next build && gen-sw`. `verify-strokes` passes for every character in
  the word list, and for the list's unique `write` and `meaning`.
- `npm run e2e`:
  - `e2e-schedule.mjs` — pure-function cases for §5 with fixed dates, and the state layer. No
    browser.
  - `e2e-loop.mjs` — Playwright against `out/`: launch on Today → trial → write → grade →
    done → MORE; next-day (clock injected) → due dealt first, then new; a tap hurries the
    prompt; miss requeues at 5; second got-it same day does not advance; the pile stops at 30
    and the rest slide; the kanji form on the answer; ledger rows written; old state dropped.
  - `e2e-offline.mjs` — unchanged.
- iPhone Safari on the live build before the version is called shipped (HANDOFF debt 6).

## 10. Build log (fill in the moment)

| Session | Start | End | Min | Prompts/sends | Stumbles | Cost |
| :-- | :-- | :-- | :-- | :-- | :-- | :-- |
| 1 | | | | | | |

Drill minutes today before building: baseline 2026-11-14 01:51–03:20 (measurement, not drill).

## 11. Post-build audit
*(Written after the build. Where the tree contradicts this file, say so here, not in silence.)*

Built 2026-11-14 on branch `v7`. `npm run build` and all three `npm run e2e` scripts pass.
Not yet done: iPhone Safari on the live build (§9), and nobody has looked at the screens by eye.

Where the tree differs from this file:
- **`grade()` takes a fourth argument**, `{ placed }`. §5's signature cannot tell a study trial
  from the blind first write of a placed-known set, and rules 5 and 6 land them on different rungs.
- **A WRITE ANYWAY got-it climbs a rung like any other** (rule 3 as written). An item can only
  be one day early, so the ladder bends by at most a day per rung.
- **The session queue is built in `lib/store.ts`** (`buildQueue`), not `lib/session.ts`, which
  only keeps `requeue`, now generic.
- **The header count is items cleared + 1**, out of the deal's size. A miss does not advance it.
- **`e2e-offline.mjs` was rewritten**, not kept: it drove v6's screens, captures and sound.
- **`e2e-schedule.mjs` also covers the state layer** (`lib/store.ts`): cap, queue, v6 import.
- **A session left through ✕ still writes its ledger session row** if anything was graded.
- **The v6 import** maps v6's two kinds of progress onto words: a word v6 held a card for, or
  a kana word whose every character v6 counted as written from memory.
- **Left in the tree, unused:** `public/sfx` (96 KB), `public/assets` (2.8 MB, the mascot),
  `public/sets/test-kanji.json`, `app/verify`, `StrokeChar.tsx`, `StrokeOverlay.tsx`,
  `lib/kana.ts`. The first three are precached for nothing; remove with the CSS trim.
- **`components/PromptMelt.tsx` gained `meltOut`**: v6 only melted a prompt in; v7 melts it away.

### The one-queue rework (2026-11-14, same day)

The first build above was six sets with a placement question. It was replaced the same day,
before the first drill day, by the amendment at the top of this file. `npm run build` and all
three `npm run e2e` scripts pass on the reworked tree. Not yet done: nobody has looked at the
reworked screens by eye or on a phone.

What changed against the list above:
- **`grade()` is back to three arguments.** Placement is gone, so there is one kind of first write.
- **WRITE ANYWAY is gone; MORE replaced it** (§5 rule 7). Nothing is pulled forward any more.
- **The cap is per day, not per set**, and it is derived: `room` from the words graded today,
  `newLeft` from `newSpent`.
- **`lib/sets.ts`, `Sets.tsx` and `Placement.tsx` are deleted; `lib/words.ts` is new.** The v6
  import is deleted with them.
- **`/verify` shows the word list's characters** instead of the sets'.
- **Tap to hurry the prompt** is built (§6.1). The tap that finishes a trial's drawing does not
  also start the melt: a tap older than the wait it would hurry is ignored.
- **The tests' prompts are tapped through**, so `e2e-loop.mjs` runs in under a minute. One
  prompt is left alone to check the three-second wait.
- **Left in the tree, unused:** the six files in `public/sets/` (still precached), and the
  `.v7Set*`, `.v7Question` and `.v7Choice*` rules in `globals.css`. Remove with the CSS trim.

## Next physical-world action
Day 1 drill on the v7 build: open the app, DEAL, write the ten new words, log the line in
`results.md`. Before it, if the workbook measure is taken up (research 01 §4.1): one official
practice workbook's 文字・語彙 section, unseen.
