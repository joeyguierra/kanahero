# Handoff — KanaHero v7, for the next coding agent (2026-11-14)

You are picking up the v7 build mid-way. The loop is built and tested. The next job is to
align with a research round, then rework the app from sets to one queue. Read this, then the
files in §1, before changing anything.

## 1. Read first

| File | Why |
| :-- | :-- |
| `AGENTS.md` | This is Next 16. Read `node_modules/next/dist/docs/` before touching framework APIs. |
| `docs/spec/SPEC-v7-skeleton.md` | The build spec. §11 lists every place the code differs from it. |
| `docs/research/01-handoff-n5-word-list.md` | The research brief, including the creator's amendment at the top of §3. **It overrides the spec on the daily load rule.** |
| `docs/results.md` | The learner's measured baseline. Data beats doctrine. |
| `docs/HANDOFF.md` | Why the app left the YouTube project, and the north star. |
| `docs/backlog.md` | Ideas outside the current freeze (the run timer). |
| `docs/design/v7/KanaHero v7 Wireframe-final.dc.html` | The wireframe the screens were built from. |

## 2. Where things stand

- **Branch:** `v7`, pushed to `origin/v7`. Last commit `0326874`. `main` is v6 and untouched.
- **Uncommitted, all passing:** UNDO on the write screen (`components/Loop.tsx`, a check in
  `scripts/e2e-loop.mjs`, two spec lines), plus `docs/research/01-handoff-n5-word-list.md`,
  `docs/backlog.md` and this file. Commit only when the creator asks.
- **Gates:** `npm run build`, then `npm run e2e` (three scripts: scheduler and state with no
  browser, the loop in Playwright, offline). All pass on the current tree.
- **Not done:** nobody has looked at the screens by eye, and iPhone Safari is untested. The
  creator stopped the screenshot run; ask before doing one.

## 3. What is built

| File | What it is |
| :-- | :-- |
| `lib/schedule.ts` | The scheduler. Pure: `deal`, `grade`, `isDone`, `nextDue`. Ladder 1·3·7·14·30 days. |
| `lib/store.ts` | Saved state (`kanahero:v7` in localStorage), Today's view, the session queue, grading, the one-time v6 import. |
| `lib/ledger.ts` | One IndexedDB row per graded item and per session; JSON export. |
| `lib/sets.ts` | Set loading, `itemId`, `promptFor`, `tagOf`. |
| `app/page.tsx` | The phase switch: sets → placement → today → loop → done. |
| `components/Sets.tsx`, `Placement.tsx`, `Today.tsx` | S0, S1a, S1. |
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
- **Sets are being retired.** The app becomes one queue: it decides what the learner writes
  each day. No set list, no per-set placement question.
- **The daily rule is one pile, 30 words at most:** every due review and miss first, then up to
  10 new words in the room left under 30. Extra work adds new words until the pile reaches 30.
  If more than 30 are due, oldest first and the rest slide a day. This replaces the built
  "10 new per set, none when more than 20 are due".
- **Every new word is shown once before it is written.** A tap hurries the stroke animation and
  a second tap finishes it; the same must apply to the 3-second prompt wait. A word itself
  cannot be skipped.
- **The prompt names the script being asked for** (`hiragana`, `katakana`, `kanji`). A word asked
  in hiragana shows its kanji form in the answer, with the meaning. Kana words prompt with the
  meaning alone, so every meaning in the list must be unique.
- **The word list comes from research:** 210 words in one order, the first 70 being week one,
  the learner's nine baseline words inside those 70.

## 5. What comes next

1. **Research alignment.** A separate agent is producing `docs/research/01-n5-word-list.md`
   (the rules) and `docs/research/01-n5-week1-words.json` (the list). When they arrive:
   - check every distinct character has a stroke file in `public/strokes/`. Kanji come from
     `node scripts/fetch-kanjivg.mjs`, which reads the set files. **The long-vowel mark ー
     (`30fc.svg`) is missing** and loanwords need it; find out whether strokesvg ships it, and
     how a horizontal bar should sit in a box.
   - read what the research argues against in the decisions above, and raise it with the
     creator before building.
2. **The one-queue rework.** Workshop it with the creator first, then update the spec, then
   build. What it touches:
   - `lib/store.ts`: one item list instead of per-set lists; one pile rule; drop placement and
     per-set cap. The scheduler's `deal` takes a plain ordered list already, but its cap logic
     (`newCap`, `dueCeiling`, `placedKnown`) is the old rule and needs replacing.
   - Data: the word list's shape (`write`, `ask`, `reading`, `kanji`, `meaning`) differs from
     `SetWord`. Decide whether it replaces the set files or loads beside them.
   - Screens: S0 and S1a go; Today becomes the only home; the prompt gains the script label;
     the reveal gains the kanji form.
   - Saved state: item ids are `setId/word` today. Decide what happens to state already saved.
   - Tests: `e2e-loop.mjs` and the state half of `e2e-schedule.mjs` are written against sets.
3. **Tap to skip the prompt wait.** Small, and independent of the rework.
4. **v7.0.1, the scrolling canvas** for multi-character words. Design is settled and written in
   spec §1: one full-width box per character, NEXT until the last box then DONE, a PREVIEW
   button that shrinks the whole word onto one screen read-only, WRITE to return. N5 words are
   often four or five characters, so this matters more once the new list lands.
5. **Later, logged only:** a new look for the user's brush (`lib/ink.ts`); the run timer
   (`docs/backlog.md`).

## 6. Things to know before you trip on them

- **The prompt disappears before the board appears.** That follows the wireframe. v6 kept the
  prompt above the board. Watch for the creator's reaction on the first drill day.
- **About 3 MB of unused v6 files still ship** (`public/assets`, `public/sfx`,
  `public/sets/test-kanji.json`). The spec says trim after v7 ships, not during.
- **`innerText` in Playwright returns upper-cased text** where the CSS upper-cases it. The loop
  test's header assertions depend on that.
- **The loop test pins the date with `page.clock.setFixedTime`**, which fakes `Date` only.
  Timers run for real, so each non-trial prompt costs 3 seconds; the script takes about two
  minutes.
- **React's purity lint rejects `Date.now()` inside a component body**, even in handlers
  declared there. Clock reads live in module-level functions in `app/page.tsx`.
- **`npm run strokes` refetches every stroke file from the network.** To add kanji only, run
  `node scripts/fetch-kanjivg.mjs`.

## 7. How the creator works

- He workshops before building: expect "thoughts first, no coding yet". Give a recommendation,
  not a survey.
- He decides in short numbered answers. If one is ambiguous, say how you read it.
- Commit and push only when asked, with the message he gives.
- He drills on a phone. A change is not verified until it runs on one.
