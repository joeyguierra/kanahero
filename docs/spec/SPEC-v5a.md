# kanahero — build spec v5a · runs, copies, collection

**Status: READY TO BUILD — part 1 (2026-09-16).** Part 2 — the creator's new flow, new and updated screens, new dialogue — is being written separately and is **not** in this build (§8).
**Base:** `SPEC-v5.md` as built at `ef4124b`, including its post-build audit (§12–14). Where this file is silent, v5 and the shipped tree stand. There is no canvas for v5a part 1: this file is the whole brief. Keep changes inside the existing components and `globals.css`; reuse existing classes and patterns before adding new ones.
**Next.js:** read `AGENTS.md` first — this is Next 16; check `node_modules/next/dist/docs/` before touching framework APIs.

## 0. Scope
**In this build**
1. Runs are all-or-nothing, every run deals the whole set, replays mint copies (§1–2).
2. Set collection screen, S6d (§3).
3. Fractions, progress bars and foil counts removed from S1, deck rows and S6b (§3).
4. Rename foil → shiny everywhere.
5. Abandon confirm as a Joker modal (§3, S7).
6. Joker lines that the new rules make untrue are replaced with interim lines (§4).
7. Housekeeping: dead exports, untracked dev artifacts, mascot SVG swap (§5).

**Not in this build:** spec↔tree reconciliation (audit §14.2), a dialogue system rebuild (lines stay in `lib/joker-lines.ts` as they are structured today), CSS refactor, any general motion / sound / overlay engine, the §11 truth table, the creator's part 2.

## 1. Rules — changed from v5
1. **A run is all-or-nothing.** Cards are minted only when a run finishes (the queue empties). Abandoning through the confirm modal, or reloading/closing mid-run, discards everything from that run. Nothing about a run is written to storage until it finishes. *Reverses v5 §1 S7.*
2. **Every run deals the whole set** in a seeded random order (seed still logged to console). A set is always replayable; the "nothing left to deal" state no longer exists. `miss()` behaviour unchanged. *Replaces v5 §3's unearned-only queue.*
3. **Tries count within a run only**, in memory, reset at the start of every run. *Supersedes audit §14.1 — nothing crosses a run, so the reload-mints-foil bug cannot occur. Delete the module-level attempts `Map` and `resetAttempts()`; keep tries in round state.*
4. **One copy per word per finished run.** Rarity per copy, fixed at mint: 1 try → shiny, 2 → base, ≥3 → worn.
5. **foil → shiny** in UI copy, storage values, types, identifiers, CSS class names, Joker lines, e2e scripts. `base` and `worn` unchanged.
6. **Truth rule:** during a run the hand is provisional. No line or label on S7 / S7c may say a card is earned, kept or "yours" before the run finishes.

## 2. Data
`kanahero:v1` blob → **version 3**. The `joker` key changes shape to counts per rarity:
```
joker: { [setId]: { [wordId]: { shiny: number, base: number, worn: number } } }
```
- A word with no entry has zero copies. `tries` and `earnedAt` are no longer stored.
- Writes happen once per run, at the finish: add 1 to the minted rarity of every word, in a single save.
- **Migration v2 → v3: wipe.** `joker` resets to `{}` — cards from v5 rules are not carried over. Character progress (`earned`, `setChoice`, `script`) and the `kanahero:v1.joker.seen` key are untouched. If the v2 blob held at least one card, set a one-shot flag so the Joker's wipe line (§4) shows once.
- Readers stay defensive as today: a malformed entry is dropped, not thrown.
- Helpers in `lib/joker.ts`: `copies(set, wordId)`, `setTotals(set) → {shiny, base, worn}`. Remove `earnedCount`, `foilCount`, `isEarned` and anything else that assumes one card per word.
- Export ZIP `progress.json` carries the new shape unchanged.

## 3. Screens
**S1 Home**
- HIRAGANA, KATAKANA, KANJI rows: **label + set count only** (`1 SET`, `2 SETS`). No fraction, no progress bar.
- BANK strip unchanged.
- Joker: the wipe line replaces the home line once, when the flag from §2 is set; then the normal home line.

**S2 / S2k / S3 Deck — set rows**
- The fraction slot shows the **word count**: `10 WORDS`, `9 WORDS`. The description line drops its word count: `≤5 KANA`, `EXITS, SIGNS`, `NATURE, PEOPLE`.
- Progress bar removed. Foil count removed.
- The S2 / S2k **CHARACTERS** card is unchanged (fraction and bar stay — it counts characters, not a set).

**S6b Set**
- Every card **always face down**; the back carries the set glyph. No earned faces, no rarity chips, no tap-a-card overlay.
- Title fraction → word count (`9 WORDS`). Remove the `· FULL` suffix.
- Bottom section `ROUND LENGTH · n LEFT · NO TIMER` is replaced by **totals by rarity** for the set: `n SHINY · n BASE · n WORN`, all three always shown, zeros dimmed. In the same section, directly above the CTA, a **`VIEW COLLECTION`** link → S6d.
- `DEAL` always present. Remove `NOTHING LEFT TO DEAL`.

**S6d Set collection — NEW** *(S6c stays reserved for the future NEW SET screen)*
- Header: back → S6b (`← <SET NAME>`), title `COLLECTION`. Joker line (§4).
- The only screen where cards show face up.
- One row per **word**, in set-file order (fixed — never the run order).
- Row = the card at `grid` size in the left slot + three columns: `SHINY ×n` · `BASE ×n` · `WORN ×n`. All three columns always present; a `×0` cell is dimmed.
- **A word with zero copies** shows the **card back** (set glyph), dimmed, in its slot — never its face — with `×0 · ×0 · ×0`. The face appears once the first copy exists. Before any finished run, every row is in this state.
- A collected word's face is the earned face **without a rarity stamp or tries** (rarity lives in the columns).
- Cards are **not tappable**.
- Reference state (station set, 8 finished runs): 新幹線 `×2 · ×3 · ×3` · 出口 `×6 · ×2 · ×0` · 禁煙 `×1 · ×4 · ×3`. Every row sums to the number of finished runs.
- Rows scroll; header stays put. The screen must hold 21 rows (the set ceiling) without wrapping card text.

**S7 Round — abandon**
- `✕` opens a **Joker modal**: a dialog centred over the round containing the Joker (78px), his line (§4), and two actions — `KEEP WRITING` (bone, cancel) and `LEAVE RUN` (caution-bordered, confirm — same species as the bank's delete). Everything behind the dialog is blurred and inert.
- Cancel (or backdrop tap) closes the modal; the run continues untouched, ink on the canvas included.
- Confirm discards the run (§1.1) and returns to S6b.
- `role="dialog"`, `aria-modal`, focus moves into the dialog and returns to `✕` on cancel. Under `prefers-reduced-motion` the blur appears without a transition. No changes to `Joker.tsx` for this — the modal just hosts it.

**S7c Earned** — the slide to the hand stays. Replace `EARNED ON THE FIRST TRY` / `EARNED IN n TRIES` with `SHINY · FIRST TRY` / `BASE · 2 TRIES` / `WORN · n TRIES`. Replace `RARITY IS WRITTEN ON THE CARD / AND NEVER CHANGES` with `KEPT WHEN THE RUN FINISHES`.

**S8 Result** — the run always mints one card per word. Count reads `n MINTED` (was `COLLECTED`); the chip reads `n SHINY`. Remove `· FULL`. Faces in the fan/grid still print tries (they come from round state, not storage). Replace the note `TAP A CARD TO SEE ITS FACE. TRIES ARE / PRINTED ON EVERY CARD, FOREVER.` with `TAP A CARD TO SEE ITS FACE.` — tries are no longer stored. Tap-to-view overlay unchanged. `BACK TO DECK` unchanged.

## 4. Joker lines — interim (the creator's part 2 may replace any of them)
All in `lib/joker-lines.ts`. Same rules as v5 §6: one line, under twelve words, first person, dry.

| key | line |
| :-- | :-- |
| `home.wiped` (once, §2 flag) | New rules, so I reshuffled. Your old cards are gone. |
| `set` (all scripts, via `setLine`) | `{Nine} words, face down. Deal when you're ready.` |
| `collection` | Every copy you've made, word by word. |
| `collection.empty` (no finished run yet) | Nothing here yet. Finish a run. |
| `abandon` | Leave now and this run's cards leave with you. |
| `earned.shiny` | First try. Shiny — if you finish the run. |
| `earned.base` | Second try. Base stock. Finish to keep it. |
| `earned.worn` | Took a few. Worn stock. Finish to keep it. |
| `result` (via `resultLine`) | `{Nine} cards minted, {two} shiny. Deal again whenever.` — with no shiny: `{Nine} cards minted. Deal again whenever.` |

Delete now-dead keys and branches: `set.kana`, `set.kanji`, `set.full`, `result.kana`, `result.kanji`, `result.full`, `earned.foil`, and the `left`/`earned` parameters of `setLine`/`resultLine`. Delete `hasSeen()`. `revealLine`, the once-lines (`wholeWord`, `kuchi`) and all other keys unchanged.

## 5. Assets and housekeeping
- **Untrack and delete** `.wide2.mjs` and `set-title-overlap.png` (`git rm`). Leave `banner.png`.
- **Mascot SVG:** the creator will place the file at `public/joker-mascot.svg`. If it is present: point `JOKER_ART` at it, delete `public/joker-mascot.png`, delete the `ART` alpha-bounds object, the negative-margin sizing and the related CSS, and size the SVG by its own viewBox to the existing 78 / 84 / 110px slots. If it is **not** present, skip this item entirely and say so in the report — do not generate placeholder art.
- `gen-sw.mjs`: bump the cache version; precache follows whatever is in `public/`.

## 6. Verification
- `npm run lint` and `npm run build` clean.
- `e2e-loop.mjs` — replace the v5 abandon assertions with:
  1. cold start: S1 kanji row reads `2 SETS`, no fraction; deck row reads `9 WORDS`, no bar.
  2. S6d before any run: every row shows a dimmed back and `×0 · ×0 · ×0`.
  3. finish a kana run with one word missed once → S8 shows `10 MINTED`; S6b totals sum to 10 with `BASE ≥ 1`; S6d shows every word with a face and its row summing to 1.
  4. replay the same set → every S6d row sums to 2.
  5. start a run, earn one card, `✕` → `KEEP WRITING` → run continues with ink intact; `✕` → `LEAVE RUN` → S6b totals unchanged.
  6. start a run, earn one card, reload → totals unchanged.
  7. a v2 blob with `foil` entries loads with every set at zero, character progress intact, and S1 shows the wipe line once, then the normal line.
  8. `grep -ri foil` over `lib components app scripts` returns nothing.
- `e2e-offline.mjs` — step 3 and 4 with no network.
- Report: commits, anything skipped (mascot), and screenshots at 390px of S1, S3, S6b, S6d empty, S6d after two runs, the abandon modal, S8.

## 7. Build order
1 data shape + migration + dealer rules (§1–2) → 2 foil→shiny rename → 3 S1 + deck rows → 4 S6b → 5 S6d → 6 abandon modal → 7 S7c/S8 copy + Joker lines → 8 housekeeping + mascot → 9 e2e + report. Commit per step.

## 8. Part 2 — not in this build
The creator's new flow (how the app is presented), new and updated screens, and new dialogue. It will arrive as its own section or file and may replace any interim line in §4.

---

# v5a addendum — the reward moment (UI)
*Appended 2026-09-17, against `cb7eada` plus the uncommitted S7 prompt melt (`components/PromptMelt.tsx`). §1–7 above shipped; read this as a change to what shipped. Commit or stash the melt work before starting, and do not fold it into these commits.*
**Wording** of every Joker line named here belongs to `SPEC-v5b-joker.md` and `docs/design/joker-character.md`. This addendum only says **when** a line is shown, never what it says.
**No sound.** There is no sound engine. Build none, add no audio code or assets. §9.4 marks where one will attach later.

## 9. The reward moves from every word to the end of the run
**Why:** the S7c earn screen stops the drill after every correct word and asks for a tap. The run should flow prompt → write → grade → next prompt, with a small, non-blocking acknowledgement on each `GOT IT`, and the full reward — every card, one by one — on S8. This also matches §1.1: nothing is kept until the run finishes, so the celebration belongs there.

### 9.1 S7c removed
- Delete the `"earned"` phase in `Round.tsx`, the `earnStack` / `earnLabel` / `earnNote` / `earnCard` markup, the `handStrip` / `handCards` hand strip, and their CSS (`.earnStack` … `.handCard-shiny`, `@keyframes handDeal`, and any reduced-motion overrides for them).
- `GOT IT` no longer waits for a tap. It adds the card to the run's hand and goes straight to the next prompt (or, on the last word, to S8 — §9.3).
- `MISSED` is unchanged: no animation, the word goes back in the deck, the next prompt melts in as today.

### 9.2 S7 — the hand tick on `GOT IT`
One acknowledgement, under half a second, never blocking input.
1. **The card leaves.** On `GOT IT`, clone the prompt card's box (`getBoundingClientRect`) into a fixed-position ghost showing the **card back** (deck mark, set glyph — the same back as S6b). The ghost flies to the `HAND n` text in the round header: translate to its centre, scale to ~0.2, one ease-out, **~260 ms** (the v5 slide duration). Remove the ghost on finish.
   - No rarity is shown on the ghost. Rarity is revealed on S8.
   - The ghost is `pointer-events: none` and sits above the round, below the abandon dialog.
2. **The count ticks.** When the ghost lands, `HAND n` becomes `n+1` with a single small pop (scale 1 → 1.15 → 1, ~160 ms). `DECK n` updates at the same moment.
3. **The next prompt arrives at the same time as the flight starts** — the slot does not wait for the ghost. The canvas clears, the real card element becomes the next prompt, and the existing melt-in (`meltIn`) fires. Because the ghost is a clone, the flight and the melt never touch the same element.
4. **The Joker** does not get a separate beat. The line shown with the next prompt is the `earned.<rarity>` line for the word just graded, in place of that prompt's usual `round.*` line; the prompt after that returns to `round.*`. A pending once-line (`wholeWord`, set-scoped once-lines from v5b) takes precedence and the earned line is dropped for that prompt. One line at a time, as always.
5. **Input** is never locked: the user can draw on the new prompt during the flight. `✕` stays available; opening the abandon dialog mid-flight lets the flight finish behind the blur.
6. **Reduced motion:** no ghost and no pop. `HAND n` and `DECK n` update immediately; the melt already has its own reduced-motion path.

### 9.3 S8 — the reveal
S8 keeps its layout (fan ≤5, seven-column grid from 6), its tap-to-view overlay and `BACK TO DECK`. What changes is how it arrives.
1. **Order.** Cards are laid out and revealed **worn → base → shiny**; within a rarity, in the order they were graded in the run. The layout uses the same order, so the reveal sweeps left to right, top to bottom, and the shinies land last.
2. **Mount state.** Every card is already in its slot **face down** (the S6b back) — nothing reflows as cards turn. The count reads `0 MINTED`; the tally reads `0 SHINY · 0 BASE · 0 WORN`. The Joker panel is laid out at full height with no text yet.
3. **The flips.** A short beat after mount (~300 ms), cards turn one at a time: a Y-axis flip from back to face (`backface-visibility: hidden`, both faces in one element), **~240 ms** each. Card-to-card interval **160 ms** for worn and base.
   - **Pacing cap:** the whole reveal, excluding the shiny holds, fits in ~2.4 s — interval = `min(160, 2400 / cards)` ms, so a 21-card set does not drag.
4. **Shiny.** Before the **first** shiny turns, hold **~450 ms**. Each shiny turns with a longer interval (**~320 ms**) and, as it lands face up, one sweep of the existing shiny treatment across the face (a single pass, ~400 ms, then the card rests with its normal shiny finish). Shiny stays the only glowing element on the screen.
5. **Counters.** Each flip adds 1 to `MINTED` and 1 to its rarity in the tally, at the moment the face lands.
6. **The Joker's line** (`result`) starts typing when the last card lands — never during the reveal.
7. **Skip.** A tap anywhere on the screen during the reveal (except `BACK TO DECK`) jumps to the end state: every face up, final counts, no shiny sweep, the Joker's line starts. After the reveal ends, taps behave as today (tap a card → face overlay). `BACK TO DECK` works at any time.
8. **Reduced motion:** mount straight into the end state with one 120 ms fade; the Joker's line starts at once.
9. Storage is unchanged: the run is minted in one write the moment the last word is graded, **before** S8 mounts (§1.1, §2). The reveal is presentation only — leaving S8 mid-reveal loses nothing.

### 9.4 Where sound will attach later (comments only)
Mark each moment with a one-line `// sfx: <name>` comment at the exact call site, and nothing else: `hand.tick` (§9.2 step 2), `reveal.flip` with the card's rarity (§9.3 step 3), `reveal.shinyHold` (§9.3 step 4, before the first shiny), `reveal.end` (§9.3 step 6), `reveal.skip` (§9.3 step 7).

### 9.5 Copy and lines
- No new visible copy. Nothing on S7 mentions keeping or rarity during the run (§1.6 still holds).
- `earned.*` stays a live Joker key (now spoken on the next prompt, §9.2 step 4); v5b's pools and audit apply unchanged.
- S8's note `TAP A CARD TO SEE ITS FACE.` appears only once the reveal has ended.

### 9.6 Verification
- `npm run lint`, `npm run build` clean.
- `e2e-loop.mjs`: remove every tap that advanced S7c. Run the round steps with Playwright's `reducedMotion: "reduce"` so they do not depend on animation timing, and assert:
  1. after `GOT IT`, the next prompt is on screen with no further tap, and `HAND` has incremented;
  2. no element matching the old S7c markup exists at any point in a run;
  3. on the last `GOT IT`, S8 mounts with every card face up, counts final, and cards ordered worn → base → shiny;
  4. storage already holds the minted run when S8 mounts.
- One additional run **with motion on**: on S8, assert cards start face down and the count reads `0 MINTED`; tap the screen; assert every card is face up and the counts are final (skip works).
- `e2e-offline.mjs`: the reduced-motion run, offline.
- Report: commits, and a 390px screen recording (or frame sequence) of one kana run showing two hand ticks and the full S8 reveal with at least one shiny.

### 9.7 Build order
1 remove S7c, `GOT IT` advances (§9.1) → 2 hand tick + Joker earned line on next prompt (§9.2) → 3 S8 mount state, ordering, flips, counters (§9.3 steps 1–3, 5) → 4 shiny hold + sweep (§9.3 step 4) → 5 skip, Joker timing, reduced motion (§9.3 steps 6–8) → 6 `// sfx:` markers (§9.4) → 7 e2e + report. Commit per step.
