# Handoff — KanaHero v7, for the next coding agent (2026-11-14)

You are picking up the v7 build mid-way. The loop is built, and the app has been reworked
from sets to one queue against the research round. The next job is the first drill day on a
phone, then the scrolling canvas. Read this, then the files in §1, before changing anything.

## 1. Read first

| File | Why |
| :-- | :-- |
| `AGENTS.md` | This is Next 16. Read `node_modules/next/dist/docs/` before touching framework APIs. |
| `docs/spec/SPEC-v7-skeleton.md` | The build spec. §11 lists every place the code differs from it. |
| `docs/research/01-n5-word-list.md` | The research report behind the word list: the selection, form and ordering rules, and what the evidence argues against (§4). `01-handoff-n5-word-list.md` is the brief it answers. |
| `docs/results.md` | The learner's measured baseline. Data beats doctrine. |
| `docs/HANDOFF.md` | Why the app left the YouTube project, and the north star. |
| `docs/backlog.md` | Ideas outside the current freeze (the run timer). |
| `docs/design/v7/KanaHero v7 Wireframe-final.dc.html` | The wireframe the screens were built from. |

## 2. Where things stand

- **Branch:** `v7`. Last commit `d1478f3` (UNDO and docs). `main` is v6 and untouched.
- **Uncommitted, all passing:** the one-queue rework. That is the word list
  (`public/words/n5.json`), 57 new stroke files, `lib/words.ts`, the rewritten `lib/schedule.ts`
  and `lib/store.ts`, the screens, all three test scripts, the spec, the two research files
  and this file. `lib/sets.ts`, `Sets.tsx` and `Placement.tsx` are deleted (staged by
  `git rm`). Commit only when the creator asks.
- **Gates:** `npm run build`, then `npm run e2e` (three scripts: scheduler and state with no
  browser, the loop in Playwright, offline). All pass on the current tree.
- **Seen by the creator:** every screen of the first build, UNDO included.
- **Not done:** nobody has looked at the reworked screens by eye, and iPhone Safari is
  untested. The creator stopped an earlier screenshot run; ask before doing one.

## 3. What is built

| File | What it is |
| :-- | :-- |
| `lib/schedule.ts` | The scheduler. Pure: `deal`, `grade`, `nextDue`. Ladder 1·3·7·14·30 days; `NEW_CAP` 10, `PILE_MAX` 30. |
| `lib/store.ts` | Saved state (`kanahero:v7` in localStorage, `version: 2`), Today's view, the day's pile, the session queue, grading. |
| `lib/ledger.ts` | One IndexedDB row per graded item and per session; JSON export. |
| `lib/words.ts` | The word list's shape, loading, `promptFor`. |
| `public/words/n5.json` | The 210 words in drill order. A copy of `docs/research/01-n5-week1-words.json`; keep the two identical. |
| `app/page.tsx` | The phase switch: today → loop → done. |
| `components/Today.tsx` | S1, the only home: counts, the spread, DEAL or MORE, export and credits. |
| `components/Loop.tsx` | S2 prompt → S3 write → S4 reveal and grade. |
| `components/Done.tsx` | S5. |
| `app/globals.css` | v7 styles are the last section, all classes prefixed `v7`. Everything above is v6 and mostly dead. |

Carried from v6 and **not to be refactored**: `components/WritingCanvas.tsx` and
`lib/strokeAnimator.ts` (the two most delicate files, tuned for iOS handwriting), plus
`WordReveal.tsx`, `lib/ink.ts`, `lib/strokes.ts`. `PromptMelt.tsx` gained one function, `meltOut`.

## 4. Decisions the creator has made

- **Simplest first, additions later.** This is the standing tiebreaker for every scope and
  design choice. When the spec and a design disagree, recommend the smaller option and name
  what is deferred.
- **The Joker, cards, receipts, sound and the capture bank are tabled** (spec §1 has the return
  order).
- **The write screen has CLEAR, UNDO and DONE**, and a plain ✕ that leaves with no confirm.
- **Sets are retired.** The app is one queue: it decides what the learner writes each day. No
  set list, no placement question. Saved state from the sets was dropped, and the v6 import
  with it.
- **The daily rule is one pile, 30 words at most:** every due review and miss first, then up to
  10 new words in the room left under 30. Extra work adds new words until the pile reaches 30.
  If more than 30 are due, oldest first and the rest slide a day. Extra work is a MORE button
  that deals up to 10 new words at a time.
- **Every new word is shown once before it is written.** A tap hurries the stroke animation and
  a second tap finishes it; the same must apply to the 3-second prompt wait. A word itself
  cannot be skipped.
- **The prompt names the script being asked for** (`hiragana`, `katakana`, `kanji`). A word asked
  in hiragana shows its kanji form in the answer, with the meaning. Kana words prompt with the
  meaning alone, so every meaning in the list must be unique.
- **The word list comes from research:** 210 words in one order, the first 70 being week one,
  the learner's nine baseline words inside those 70.
- **Rulings on the research (2026-11-14):** nothing is assumed known; パーティー and ゆうめい stay
  on the list; 先 stays ahead of 先生; an official practice workbook section is added as the
  unseen measure, one taken before the first drill day and one held for the re-measurement.

## 5. What comes next

1. **The creator looks at the reworked screens on a phone.** Things to watch: the spread at
   21–30 cards (a third row), the script label on the prompt, the kanji line on the answer,
   MORE, and the footer under the button on Today.
2. **The first drill day**, logged in `docs/results.md`. The workbook measure comes before it.
3. **v7.0.1, the scrolling canvas** for multi-character words. Design is settled and written in
   spec §1: one full-width box per character, NEXT until the last box then DONE, a PREVIEW
   button that shrinks the whole word onto one screen read-only, WRITE to return. 31 of the 210
   words are four characters or longer.
4. **Later, logged only:** a new look for the user's brush (`lib/ink.ts`); the run timer
   (`docs/backlog.md`); the trim of unused v6 files and the six set files.

## 6. Things to know before you trip on them

- **The prompt disappears before the board appears.** That follows the wireframe. v6 kept the
  prompt above the board. Watch for the creator's reaction on the first drill day.
- **About 3 MB of unused v6 files still ship** (`public/assets`, `public/sfx`,
  `public/sets/`). The spec says trim after v7 ships, not during.
- **`innerText` in Playwright returns upper-cased text** where the CSS upper-cases it. The loop
  test's header assertions depend on that.
- **The loop test pins the date with `page.clock.setFixedTime`**, which fakes `Date` only.
  Timers run for real, so the test taps its prompts through; the three scripts take under a
  minute together.
- **The tests run with motion reduced.** Tap-to-hurry with the real melt and a real stroke
  animation was checked once by hand-run script, not by `npm run e2e`.
- **A tap on a study trial has two jobs.** On the form it hurries the drawing (`WordReveal`);
  anywhere, once the form is drawn, it hurries the hold and the melt (`Loop.tsx`, `tapPrompt`).
- **React's purity lint rejects `Date.now()` inside a component body**, even in handlers
  declared there. Clock reads live in module-level functions in `app/page.tsx`.
- **`npm run strokes` refetches every stroke file from the network.** To add kanji only, run
  `node scripts/fetch-kanjivg.mjs`, which reads the word list.
- **ゆうべ differs from the research report's text.** Its `kanji` is now 昨夜 in both JSON files,
  after the dictionary check; the report's §1.2 still lists it as a case to check.

## 7. How the creator works

- He workshops before building: expect "thoughts first, no coding yet". Give a recommendation,
  not a survey.
- He decides in short numbered answers. If one is ambiguous, say how you read it.
- Commit and push only when asked, with the message he gives.
- He drills on a phone. A change is not verified until it runs on one.
