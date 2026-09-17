# kanahero — build record v5c · where v5a §9 and v5b collided, and what was decided

**Status: BUILT (2026-09-17).** This is not a brief. `SPEC-v5a.md` (the reward addendum, §9) and
`SPEC-v5b-joker.md` (the corpus, its engine and the audit) were both READY TO BUILD against the
same three files, and were built as one sequence. This file records **how they were merged** and
**every decision the merge forced that neither spec states** — so the next person does not have to
re-derive it from the diff.

**Base:** `3a55119` (the S7 prompt melt). **Built in:** `954bbca` … `6733492`.
**Where the two specs still govern:** behaviour is v5a's and v5b's. Where this file and either of
them disagree, they win on intent and this file wins on what the tree actually does.

---

## 1. Why they could not be built separately

Four collisions, all in `Round.tsx`, `Result.tsx` and `e2e-loop.mjs`:

| # | collision | resolved |
| :-- | :-- | :-- |
| 1 | v5a §9.3.2 specifies S8's mount state as `0 MINTED`; v5b §10 renames the word. | **Rename first.** v5b §10.3 says so outright: *"If SPEC-v5a §9 (the reveal) is built later, it uses EARNED from the start."* The reveal was written after the rename and has never said "minted". |
| 2 | v5a §9.2.4 moves the `earned.<rarity>` line onto the **next prompt**, with once-lines taking precedence — which is line-selection logic, and v5b §5 replaces the whole of line selection. | **Engine first, §9.2 after.** The earned line became one more screen the prompt can ask for, and once-precedence came free from the engine rather than being written twice. |
| 3 | Both rewrite the round's e2e steps: v5b §6 swaps text assertions for ids, v5a §9.6 strips the S7c taps and moves to `reducedMotion: "reduce"`. | **One pass, at the end.** Both sets of changes landed in `6733492`. |
| 4 | v5b §7 step 3 moves every Joker call site to `useJokerLine`; v5a §9.1 then deletes one of those call sites (S7c). | Migrated it anyway — one commit later it was deleted with the rest of S7c. Cheaper than special-casing. |

**Order as built:** truth fixes → rename → audit → engine → set block → S7c removed → hand tick →
S8 reveal → e2e. v5b §7 and v5a §9.7 interleave cleanly at exactly that seam.

## 2. The precedence chain neither spec states in full

v5b §4 gives S7's order as missed → once → pool. v5a §9.2.4 inserts the earned line and says an
aside outranks it. Together, the line on a prompt is:

```
missed  →  once (global or set aside)  →  earned.<rarity>  →  round.kana | round.kanji
```

It is **not** four branches in `Round.tsx`. The caller picks the screen (missed, earned, or the
prompt's own) and the engine gives a due once-line precedence over whatever the screen asked for.
One rule, in one place — `peekLine` step 2.

## 3. Decisions the build forced

These are the things that are true of the tree and are not in either spec.

### 3.1 The engine (`lib/joker-lines.ts`)

- **`commitLine(pick)`, not `commitLine(id)`** *(v5b §5 sketches the latter)*. A draw may have
  refilled the bag, and the refill is shuffled: only the peek that drew it knows what comes next.
  Passing the whole pick also means a line can only be spent by the thing that actually drew it.
  The first cut took an id, recomputed nothing, and silently never persisted a refilled bag — the
  home pool repeated inside twenty loads.
- **`useJokerLine(screen: JokerScreen | null, …)`.** `app/page.tsx` returns early per phase, so a
  hook for S1's line cannot sit next to S1's markup. A null screen means "not the screen showing":
  the hook is called unconditionally and draws nothing. It is also what keeps a screen he is not
  on from spending a line — S8 uses it to stay silent until the last card lands.
- **One draw per beat, guarded by a ref.** React StrictMode runs effects twice in development; the
  second draw was spending a line that was never on screen, which is the one thing the
  peek/commit split exists to prevent.
- **Asides are opt-in (`allowOnce: true`), not opt-out.** Shipped as opt-out first, and the round's
  "Whole word, one box" aside turned up on the home screen. A once-line **in the screen's own
  pool** (the intro, the wipe line) still needs no permission: it is that screen's line.
- **A comparison against an undefined value is false**, in both the runtime evaluator and the
  audit's twin. This is what actually let the aside escape: with no set on screen, `script!=kanji`
  was holding. Same principle as an unfillable token — a line that asks about something the screen
  cannot know is not eligible.
- **Sitting in a set's `once` block is what makes a set line a once-line.** Entries do not restate
  the tag; the runtime and the audit agree on it independently.
- **Bags hold set-line ids too**, repeated `SET_WEIGHT` (3) times — that is how "set lines are
  drawn at 3× weight" (v5b §4) is made true by a mechanism that only knows about bags.
  Reconciliation keeps any id containing `/`: this bundle cannot see another set's file and must
  not drop what it cannot check.

### 3.2 Hydration and layout (v5b §5's two constraints)

The line depends on `localStorage`, and this is a static export.

- **Nothing is drawn until storage has landed.** `page.tsx` passes `null` until
  `progress !== getServerProgress()`. Drawing earlier meant drawing against an empty context, where
  every conditional line is ineligible — a line spent on a draw he was never going to make. The
  first cut did exactly that, twice per load.
- **`.jokerLine` reserves `min-height: 2.9em`.** The panel is two lines tall before he says
  anything and stays that height whichever line he draws; under twelve words never wraps past two.
  This is what makes "no layout shift" true without guessing a line on the server.

### 3.3 The audit (`scripts/joker-audit.mjs`)

- **Check 4 exempts a pool that is entirely once-lines** (`home.wiped`, the global `once` pool).
  Read literally, "zero eligible non-`once` lines" fails both of them. They are one-shot variant
  keys the caller only asks for when it has a reason and falls back from when spent, so emptiness
  is their normal state, not a defect.
- **Numeric probes have floors.** `chars` and `words` are probed at 1 and 5, never 0: a word always
  has a character in it and a set always has a word, and probing zero invents a context the app
  cannot reach. Check 4 failed `reveal.kana` on exactly that phantom.
- **Check 5's allow-list** is `reveal.kana.02`, `round.kana.01`, `once.wholeWord`, `home.kanji.01`
  — "one box" is a box, and "One character, many readings" is the shape of kanji. Ordinals
  ("first try", "the third") are not number-words and are not allow-listed.
- **`JokerScreen` is read out of the TS union with comments stripped first.** A semicolon inside a
  comment ended the union early and silently shrank the set of valid pool keys.
- **`KANAHERO_JOKER_DIR` / `KANAHERO_JOKER_OUT`** exist only so `scripts/e2e-joker.mjs` can point
  the real audit at a fixture. Nothing else sets them.

### 3.4 The reward moment

- **`lib/reveal.ts` is pure** — the running order and the clock are functions over the hand, with
  no DOM and no timers, so the screen can ask what happens when and a test can ask the same
  question without waiting for it.
- **Reduced motion is the same reveal with no time in it**: every card lands at `t=0`, nothing
  sweeps, the screen fades once. One code path, not two.
- **The fan's overlap moved to the slot; its padding stayed on the card.** S8 turns the slot on its
  Y axis and the fan angle is also a transform, so the two cannot share an element. `.fanCard +
  .fanCard` now carries `margin-left` and `.fanCard + .fanCard .card` carries `padding-left`.
- **The shiny sweep is drawn inside the card** (`.revealSweep .card::after`), so the card's own
  clip — notched corner and all — is what the shine runs behind. On the wrapper it escaped the
  card's edge.
- **The header counts lag the run by one flight.** `DECK`/`HAND` are their own state, updated when
  the ghost lands; the queue and the next prompt have already moved on. That is what makes "the
  count ticks when the ghost lands" (§9.2.2) true without holding the run back.

### 3.5 Interim states that are gone

`StaticScreen` existed for exactly one commit (`20cbe4e`): the audit needed `set` and `result` in
the `JokerScreen` union before the runtime could stop building those two lines from helper
functions. It is not in the tree.

## 4. What this build did not settle

- **`test-kanji` is still in `PLATFORM_SET_IDS`** (v5b §9). It ships, so the kanji deck reads three
  sets, and `e2e-joker`/`e2e-loop` both rely on it being reachable to prove the STATION aside
  cannot fire there. Creator's call: dev fixture or real set.
- **25 pool-depth warnings.** Every pool but `home` is a pool of one, by design (v5b §0). The audit
  names each one and its target depth; check 7 stays warn-only until they are written.
- **Four sets speak generic only** — `countries-katakana`, `daily-basics-kanji`,
  `everyday-hiragana`, `test-kanji` have no `joker` block.
- **No sound.** Five `// sfx:` markers are in place and nothing else (v5a §9.4).
- **The S6b deal and the S7 melt have no e2e.** They were built in `cb7eada`/`3a55119` and are
  covered only by their reduced-motion paths being exercised here.

## 5. Verification, as measured

- `npm run lint`, `npm run build` clean. `npm run joker` (also `prebuild`, `predev`): **60 global +
  1 set line bundled, 0 silenced, 25 warnings** — all 25 are pool depth or a missing set block.
- `npm run e2e` — four suites, all passing: `e2e-joker` (the audit's own fixtures), `e2e-loop`,
  `e2e-bank`, `e2e-offline`.
- The stale assertion that had been failing `e2e-loop` since `fbe1645` (it pinned his home wording)
  is gone, replaced by an id assertion. That is the last of the text assertions.
- Measured in the suite, not from memory: **24 distinct home lines before the first repeat** over
  forty consecutive loads, and the introduction is said exactly once per browser, ever.
