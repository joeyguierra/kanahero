# kanahero — build spec v7 · the skeleton

**Status: READY TO BUILD (2026-11-14, 03:30).** Written against `results.md` Baseline
(mock 5/8 · meaning 18/20 · production 16/20 · drill days 0) and `docs/research/00-survey.md`.
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
2. A per-item scheduler with due dates, a uniform rung ladder, and a new-item cap that yields
   to due load. Pure function, `lib/`, DOM-free (§5).
3. A study trial for every item's first exposure (§6.2).
4. A placement question per set, asked once (§7 S1a).
5. The unit is the word. Kana sets are single-character words with a romaji prompt; kanji and
   word sets prompt with meaning + reading (§4).
6. A ledger: drill days, items due/done/missed, minutes. Exportable JSON (§8).
7. Five screens + one (§7). THE LOG as the visual system, reused, not redesigned.
8. Sets: existing JSON unchanged in shape; `calendar-kanji` wired; `test-kanji` removed from
   `PLATFORM_SET_IDS`; one new set `n5-mock-words` seeded from the baseline's unknown list (§4).
9. `npm run e2e` gates: e2e-loop (rewritten), e2e-schedule (new), e2e-offline (kept).

**Not in this build — tabled, with return order**
- v7.1 **The Joker**: one seat (Today, miss line). Bible unchanged. `joker-audit` returns with him.
- v7.2 **Cards / collection**: redesigned around *done*, not all-or-nothing (a card is what you
  keep after a set stops asking). Rarity-by-tries does not return unless research says so.
- v7.3 **Receipts** (ink kept per got-it). v7.4 **Sound**. v7.5 **Capture bank**.
- **Readings task** (produce the reading; Dive B) — own spec after research.
- **Pitch accent line** — slot reserved on S4; data + finding needed.
- **Audio / listening via the Joker (ElevenLabs)** — blocked on the runtime posture decision.
  Pre-rendered clips at build time to be tested before any live API.
- Settings beyond set choice, onboarding, dark/light toggle, notifications, goals, streaks,
  XP, badges, a dashboard, accounts, sync.

## 2. What carries over, file by file

Copy as-is, do not refactor: `components/WritingCanvas.tsx`, `lib/strokeAnimator.ts`,
`lib/ink.ts`, `lib/strokes.ts`, `lib/kana.ts`, `components/StrokeOverlay.tsx`,
`components/StrokeChar.tsx`, `components/PromptMelt.tsx`, `public/strokes/**`, `public/sets/**`,
`scripts/verify-strokes.mjs`, `scripts/gen-sw.mjs`, `scripts/e2e-offline.mjs`,
`components/ServiceWorker.tsx`, `app/globals.css` (THE LOG — trim dead card/bank rules only
after v7 ships, not during), attribution/credits content.

Copy and edit: `lib/sets.ts` (§4), `lib/idb.ts` (ledger store), `lib/session.ts` (§5),
`app/page.tsx` (phase switch; new phases), `app/layout.tsx`, `app/manifest.ts`.

Leave behind (in git, not in the v7 tree): `Bank.tsx`, `CaptureDetail.tsx`, `Card.tsx`,
`CardView.tsx`, `Collection.tsx`, `Deck.tsx`, `HandTick.tsx`, `InkPanel.tsx`, `Joker.tsx`,
`Result.tsx`, `RevealCard.tsx`, `Round.tsx`, `Session.tsx`, `SetScreen.tsx`, `Settings.tsx`,
`WordReveal.tsx`, `AbandonDialog.tsx`, `lib/bank.ts`, `lib/joker*.ts`, `lib/progress.ts`,
`lib/receipts.ts`, `lib/reveal.ts`, `lib/sfx*.ts`, `lib/audio.ts`, `lib/zip.ts`, `joker/`,
`scripts/joker-audit.mjs`, `scripts/sfx-*.mjs`, `scripts/e2e-joker.mjs`, `scripts/e2e-bank.mjs`.
`package.json` scripts: `build` = `next build && node scripts/gen-sw.mjs`; `predev` removed.

## 3. Defaults this build bakes in (pending doctrine)

| Default | Value | Finding it rests on | Falsified by |
| :-- | :-- | :-- | :-- |
| D1 rung ladder | 1 · 3 · 7 · 14 · 30 days, uniform | Latimier 2021: spacing×retrieval; no clear evidence expanding > uniform | 7-day delayed production on scheduled vs unscheduled items shows no gap |
| D2 criterion | an item advances on a got-it on a *fresh day*; "done" = two fresh-day corrects (rung ≥ 3) | Rawson & Dunlosky; Kornell & Bjork 2008 (.62 after one correct, .88 after two) | items at rung 3 miss at the same rate as rung 1 |
| D3 unit | the word; kana = 1-char words | Guan & Perfetti 2015 (writing builds form↔meaning); baseline: gap is words + kanji | word-level drilling moves production but not the mock |
| D4 new cap | 10/day per set; 0 when due > 20 | load arithmetic, not a finding — label as such | due pile exceeds 20 min by week 3 |
| D5 study trial | first exposure = show → melt → write | retrieval needs an encoding; pretesting null for novel associations | — (design necessity) |

## 4. Data: sets and items

`SetWord` shape unchanged: `{ word, reading, romaji, meaning, kind? }`. `WordSet` loses `joker`
(field tolerated, ignored). `PLATFORM_SET_IDS` becomes:
`everyday-hiragana · countries-katakana · daily-basics-kanji · station-kanji · calendar-kanji ·
n5-mock-words`.

**New set `public/sets/n5-mock-words.json`** — `script: "kanji"`, 9 words from the baseline:
新しい あたらしい new · 電気 でんき electricity, the light · 外 そと outside ·
つける つける to turn on · つとめる つとめる to work at, be employed · ゆうべ ゆうべ last night ·
おととい おととい the day before yesterday · くらい くらい dark · のる のる to get on, ride.
Stroke coverage: `verify-strokes.mjs` must pass for 新 電 気 外; kana-only words need none.

**Item id** = `${setId}/${word}`. One item per word, not per character. Multi-character words
are written one character per box on one canvas (§7 S3); the grade is for the whole word.

**Prompt per script:** kana sets → romaji. kanji/word sets → meaning + reading (kana). The
prompt never contains the written form.

## 5. The scheduler — `lib/schedule.ts`, pure, DOM-free

```ts
type Rung = 0 | 1 | 2 | 3 | 4 | 5;            // 0 = never seen
const LADDER_DAYS = [0, 1, 3, 7, 14, 30];      // days until due, by rung
interface ItemState { id: string; rung: Rung; due: string /* YYYY-MM-DD local */;
                      lastDay?: string; seen: boolean }
interface DealInput { today: string; items: ItemState[]; setOrder: string[];
                      newCap: number; dueCeiling: number; placedKnown: boolean }
interface Deal { due: string[]; fresh: string[]; pulledForward: string[] }
function deal(i: DealInput): Deal
function grade(s: ItemState, today: string, ok: boolean): ItemState
```

Rules (each one is an e2e case):
1. **Due first.** `due = items where due <= today`, oldest due first, then set order.
2. **Then new.** `fresh = unseen items in set order`, at most `newCap`; **0 if due.length >
   dueCeiling (20).**
3. **Grade got-it:** if `lastDay !== today` → `rung = min(rung+1, 5)`, `due = today +
   LADDER_DAYS[rung]`, `lastDay = today`. If `lastDay === today` (second correct same day)
   → no change. A rung never advances twice in one day.
4. **Grade miss:** `rung = 1`, `due = today + 1`, `lastDay = today`. Within the session the item
   requeues at position 5 (existing `requeue`). A later got-it the same day does not advance it
   (rule 3).
5. **Study trial:** an item with `seen === false` is dealt with `trial: true`; after its first
   grade `seen = true`. First grade of a trial item: got-it → rung 1, due tomorrow (not rung 2;
   the write was seconds after seeing it). Miss → rung 1, due tomorrow, requeue.
6. **Placement "already know":** `placedKnown` → all unseen items dealt once, blind, no trial,
   no cap; got-it → rung 2, due today+3; miss → rung 1 with a trial on the reveal.
7. **Write anyway** (nothing due): first `fresh` up to cap; then `pulledForward` = items with
   `due === today+1`, nearest first; never beyond tomorrow; never items graded today. Fresh
   items pulled on a zero-due day count against tomorrow's cap (persist `capSpentFor: tomorrow`).
8. **Done** for a set = no due and no unseen. Today shows the next due date instead of DEAL.
9. Confusable adjacency (kana only): new items are dealt in gojūon order; no shuffle of fresh.
   Due items keep rule 1 order.
10. Days are local calendar days; a session that crosses midnight keeps its start day.

## 6. The loop

6.1 **Pure retrieval (seen item):** S2 prompt (3 s melt) → S3 write → S4 reveal + grade.
6.2 **Study trial (unseen):** S2 shows the written form large with its stroke animation once,
    reading + meaning beneath, then melts → S3 write → S4. The form is gone when the pen is down.
    No ghost, no trace, no second look before writing.
6.3 **Grade is binary and the user's.** The overlay is the evidence. The S4 copy under the
    buttons says once, small: *dots, long vowels and small kana count*. This is the one place
    the app comments on grading, because the baseline's four misses were all of that kind.
6.4 **Session ends when the deal is empty.** No re-deal. S5.

## 7. Screens (THE LOG; mobile first; no new visual system)

- **S1 TODAY.** `N due · M new` + DEAL. Set name beneath → set list (name · count · how many on
  rung ≥ 1 · tap to open S1b). States: first run (0 due · 10 new); normal; long absence (bigger
  number, no copy about absence); nothing due and new left → WRITE ANYWAY; set done → "next:
  <date> · <n> due", no button. One blank line reserved under the numbers (Joker seat, v7.1).
- **S1a PLACEMENT** — first time a set opens: *New to these* / *I can already write some*. Two
  buttons. Stored per set. Never asked again.
- **S1b SET LIST ITEM** — plain list: word · reading · meaning · rung as a small mark. Reference
  only; no drilling from here.
- **S2 PROMPT** — per §4; trial variant per §6.2.
- **S3 WRITE** — canvas, one box per character, DONE. No hints, no count, no grid.
- **S4 REVEAL + GRADE** — strokes over ink; word · reading · meaning; GOT IT / MISSED equal
  weight; the one grading line (§6.3). Reserved 1-line slot above the reading (pitch accent),
  blank. Joker seat bottom-left, blank.
- **S5 DONE** — list of today's items (word · ✓/✗) · minutes · "next: <n> due <day>" · CLOSE.
  Nothing else. No score, streak, share, rarity.

## 8. Storage

- `kanahero:v7` localStorage — `{ version: 1, items: Record<id, ItemState>, placement:
  Record<setId, "new"|"known">, capSpentFor?: string }`. v6's `kanahero:v1` is read **once**:
  any character with v6 progress enters at `seen: true, rung: 1, due: today` so prior work is
  not thrown away and is immediately re-tested. v1 blob is left in place, never written.
- `kanahero-ledger` IndexedDB (reuse `lib/idb.ts`) — one row per graded item:
  `{ day, ts, setId, word, trial, ok, ms }` + one row per session: `{ day, startTs, endTs,
  due, fresh, done, missed }`. Export: a JSON file from S1's set-list footer, named
  `kanahero-ledger-<day>.json`. This is `results.md`'s data source.
- Receipts (`kanahero-receipts`) and bank (`kanahero-bank`) stores are untouched and unread.

## 9. Verification (build gates)

- `npm run build` = `next build && gen-sw`. `verify-strokes` passes for every char in every
  wired set, including the new one.
- `npm run e2e`:
  - `e2e-schedule.mjs` — pure-function cases for §5 rules 1–10 with fixed dates. No browser.
  - `e2e-loop.mjs` — Playwright against `out/`: first run → placement → trial → write → grade →
    done; next-day (clock injected) → due dealt first; miss requeues at 5; second got-it same
    day does not advance; write-anyway pulls tomorrow only; ledger rows written.
  - `e2e-offline.mjs` — unchanged.
- iPhone Safari on the live build before the version is called shipped (HANDOFF debt 6).

## 10. Build log (fill in the moment)

| Session | Start | End | Min | Prompts/sends | Stumbles | Cost |
| :-- | :-- | :-- | :-- | :-- | :-- | :-- |
| 1 | | | | | | |

Drill minutes today before building: baseline 2026-11-14 01:51–03:20 (measurement, not drill).

## 11. Post-build audit
*(Written after the build. Where the tree contradicts this file, say so here, not in silence.)*

## Next physical-world action
Day 1 drill on the v7 build: open `everyday-hiragana`, answer *I can already write some*, write
the deal, log the line in `results.md`. Then `n5-mock-words`, *New to these*, nine trials.
