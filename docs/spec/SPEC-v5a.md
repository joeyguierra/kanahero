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
