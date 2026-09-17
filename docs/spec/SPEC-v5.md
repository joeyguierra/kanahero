# kanahero — build spec v5 · the Joker, decks, sets

**Design file:** `docs/design/KanaHero v5 Handoff.dc.html` (every screen). Drill and bank detail states: `KanaHero v3 Handoff.dc.html`. Where this file and the canvas disagree, **this file wins on behavior, the canvas wins on pixels.** Read §0 before opening the canvas.

**Scope of this build, exactly three things:** (1) the Joker on every screen, (2) the deck screens and the set round, (3) three platform sets — two kana, one kanji. **No Supabase, no accounts, no user-created sets, no S6c.** Offline, localStorage, $0 — unchanged.

## STEP 0 — GATE: vendor the station kanji and verify by eye. STOP HERE.
Do this first and nothing else. The build does not continue until the creator signals proceed.
1. Write and run `scripts/fetch-kanjivg.mjs` per §5: the 14 distinct characters of `public/sets/station-kanji.json` → `public/strokes/<hex>.svg`, normalized to strokesvg's `0 0 1024 1024`, stroke weight tuned to match, `public/licenses/kanjivg-LICENSE.txt` vendored.
2. Extend `/verify` (`app/verify/page.tsx`, the page used to check the base kana) so it also renders every character in every platform set, kanji included, with the existing replay control — animated stroke order at the same size and speed as the kana. Put あ and 出 side by side at the top of the page so the two sources can be compared directly.
3. Extend `scripts/verify-strokes.mjs` to assert set coverage: every character of every word in `public/sets/*.json` has a stroke file. It must pass.
4. Report: the stroke-weight number chosen, the 14 codepoints written, and the `/verify` URL. Then **stop**.
**Proceed signal:** the creator checks `/verify` by eye and answers one of: *proceed* (weights match — go to §1), *retune N* (re-run step 1 with a new weight, stop again), or *switch kana to KanjiVG* (the two hands don't match and consistency wins — re-vendor all kana from KanjiVG under the same normalization, keeping strokesvg files as fallback, update §8 credits accordingly, stop again).

## 0. Canvas errata — the spec overrides these
1. S1 keeps its selection model and `START SESSION` / `OPEN BANK` CTA (creator decision). Ignore the SPEC sheet's "no global CTA on S1" line.
2. The station set is **9 words**, not 12. Every fraction on S3, S6b, S7 and S8 that says 12 reads 9. 21 is the deck *ceiling* (S8 full-deck screen), not a set size.
3. S7b's note "one kanji at a time at full canvas size" is wrong. Kanji words reveal exactly like kana words: the whole word, one cell per character, canvas-width ÷ N. 改札 renders in two cells.
4. S6c (NEW SET) and the `YOUR SETS` group are **not built**. The deck screens show `PLATFORM` sets only, with no `YOUR SETS` label, no NEW SET row, no empty-state copy.
5. Result layout: fan for ≤5 cards, 7-column grid from 6 (S8 "grid" instance). The "three fans of seven" instance is rejected.
6. Undrawn states, derived: a set at N/N shows the earned hand on S6b and no DEAL; cold-start S1 shows `0/71`, `0/71`, `1 SET · 0/9`, `BANK 0`; tapping a card on S8 shows its earned face at 214×300 in a plain overlay, tap anywhere to dismiss.

## 1. Screens and flows
- **S1 Home** — rows: HIRAGANA, KATAKANA, KANJI (`1 SET · n/9`), BANK strip. Tap selects; CTA commits (`START SESSION` → the deck screen; `OPEN BANK` → S5). Ghost glyph follows selection. Joker line per selection from the table (§6). Footer: `CREDITS` (→ S9, §8).
- **S2 / S2k Deck (kana)** — CHARACTERS card (count, bar, dakuten toggle, replay note; tap → S4, the existing drill) and SETS → PLATFORM → one row (name, `N WORDS · ≤5 KANA`, fraction, foil count, bar; tap → S6b).
- **S3 Deck (kanji)** — SETS only. One row: STATION · `9 WORDS · EXITS, SIGNS` · fraction · foil · bar.
- **S4 Drill** — the v3 session, untouched, plus the Joker in the header slot. Back → deck.
- **S5 Bank** — unchanged, back → HOME, Joker line added.
- **S6b Set** — face-down grid of unearned prompts (deck mark on backs), earned faces with rarity chips, `ROUND LENGTH · n LEFT · NO TIMER`, `DEAL`. At N/N: hand shown, no DEAL.
- **S7 Round** — Joker + dealt prompt card + the 334px canvas + CLEAR / UNDO / FLIP. Chrome: `DECK n · HAND n`. `✕` abandons, keeps earned cards.
- **S7b Flipped** — model word over ink (§4), footer `ATTEMPT n`, `GOT IT` / `MISSED`.
- **S7c Earned** — prompt becomes earned face in place, slides to the hand strip (§7 motion). Tap anywhere → next prompt.
- **S8 Result** — count, foil chip, breakdown line, Joker line, fan or grid, `BACK TO DECK`.
- **S9 Credits** — plain list, §8.

**Flows.** F10 S1 → deck → set row → S6b → DEAL → S7 (four taps). F11 prompt → write → FLIP → grade → earned/missed → deck at 0 → S8. F12 S8 → BACK TO DECK, row shows new fraction. F13 S1 → S2 → characters → S4.

## 2. Data
**Platform sets** — `public/sets/{everyday-hiragana,countries-katakana,station-kanji}.json`, already written. Schema:
`{id, name, glyph, place?, script, origin:"platform", words:[{word, reading, romaji, meaning, kind?}]}`. Kana sets: `word === reading`. Word id = `word` (unique within a set). IDs are permanent.
**Progress** — extend `kanahero:v1` (bump blob version; migrate by adding an empty key):
`joker: { [setId]: { [wordId]: { tries: number, rarity: "foil"|"base"|"worn", earnedAt: ISO } } }`.
A word is *earned* iff it has an entry. `tries` counts attempts up to and including the first correct one, across rounds — a missed word abandoned mid-round keeps its miss count. Rarity: 1 → foil, 2 → base, ≥3 → worn; fixed at the earn, never recomputed.
**Round state** — in memory only. Nothing about a round persists except entries written at each earn.
**Export** — the bank ZIP gains `progress.json` (the whole `kanahero:v1` blob).

## 3. The dealer — `lib/joker.ts`
`deal(set, progress, seed)` → queue of unearned words, seeded shuffle (seed logged to console for bug reports). `miss(queue, word)` → pushes to the tail; if the queue is shorter than 3, insert at index 2 or the end, whichever is earlier — a missed word never returns immediately. `earn(word, tries)` → writes the progress entry and returns rarity. Round ends when the queue is empty. No difficulty model, no scheduling, no SRS.

## 4. Whole-word reveal — the only new canvas code
On FLIP, the model word draws over the user's ink: N characters, each in a cell of width `canvasWidth / N`, vertically centred, no cell lines. Glyph scale = cell width / 1024 (strokesvg viewBox), and stroke SVGs render at the existing animation speed per character, left to right. Small kana (ぁぃぅぇぉっゃゅょゎ / ァィゥェォッャュョヮ) render at 0.7× inside their cell, bottom-left aligned. Strike colour at 30% over ink, as in v3. The user's ink is untouched — self-grade is the comparison. Words of 1 character (駅) fall out of the same code with N = 1.

## 5. Stroke data
- Kana: `public/strokes/` (strokesvg, 142 files) already covers every kana in both kana sets. Verify with a script that every character of every kana word has a file; fail the build if not.
- Kanji: vendored in STEP 0. `scripts/fetch-kanjivg.mjs`: collect the distinct characters across kanji platform sets (station: 出 口 入 新 幹 線 禁 煙 東 中 央 西 南 北 — 14), fetch each KanjiVG SVG (`kanjivg.tagaini.net` / GitHub raw, `0xxxx.svg` by codepoint), normalize: viewBox `0 0 109 109` → `0 0 1024 1024` via a wrapping transform, strip stroke-number text, set `stroke-linecap: round`, thicken stroke width to visually match strokesvg (tune by eye against あ; record the number in the script). Write to `public/strokes/<hex>.svg`, vendor `public/licenses/kanjivg-LICENSE.txt`. Precache.

## 6. The Joker
- Component `components/Joker.tsx`: mascot SVG (placeholder art, swap later; single file, currentColor + strike), 78px, 110px on S1; flat panel, 1px seam, square tail, mono `JOKER` tag. Never animates.
- Lines: `lib/joker-lines.ts`, one table keyed `screen × state`. Source of truth is the canvas JOKER sheet — copy those lines verbatim, plus: S1 per-selection lines from the five S1 boards; S3 row description `EXITS, SIGNS`; station Joker aside on first 口 word: "Five of these share 口. You'll know it by the third." Rules: one line per screen, under twelve words, never two lines at once, never explains a mechanic twice (keyed by a `seen` set in localStorage: `kanahero:v1.joker.seen[lineId]` for the two first-time lines — "Whole word, one box" and the 口 aside).

## 7. Layout, motion, chrome
Thumb zone and fill rules as the canvas SPEC sheet. Motion budget: the flip (existing) and the slide (~260 ms, one ease). `prefers-reduced-motion` cuts to end state. `MISSED` has no animation. Card component `components/Card.tsx`: faces `promptKanji | promptKana | earned(rarity)`, sizes `round 150×210 | earn 214×300 | fan 104×146 | grid 5:7 auto`. No card text wraps; type steps down with word length (5 kana must fit one line at every size). Foil is the only glowing element on any screen.

## 8. Credits — S9 and the footer
S1 footer becomes the single word `CREDITS` → S9. S9 lists exactly what ships: `strokesvg · MIT` (link), `Klee One · SIL OFL 1.1` (kana strokes derived), `KanjiVG · CC BY-SA 3.0` (link — required, this is the one attribution the license demands visibly), and the UI typefaces with their licenses in one line. License texts live in `public/licenses/`. Remove the old three-name footer.

## 9. Service worker, verification, e2e
- `gen-sw.mjs`: precache `sets/*.json` and the new stroke files; bump cache version.
- `verify-strokes.mjs`: extend to check set coverage (§5).
- `e2e-loop.mjs`: add a round — deal a kana set, earn one on first try (foil), miss then earn one (base), abandon, reopen S6b and assert the fraction and chips. Add an offline run of the same (airplane-mode precedent in `e2e-offline.mjs`).
- README: attribution section updated to §8; "no account, no install" stays true for this build as a whole.

## 10. Not in this build
Supabase or any server · accounts · user-created sets / S6c · bank → card conversion · more than one set per script · any recognition input · sound · timers · streaks · share · tier words or lock icons · the Joker's final art.

## 11. Truth table for the video that films this build
| key | consumer | value | status |
| :-- | :-- | :-- | :-- |
| station set size | title, S3, S8 | 9 | ✅ from `station-kanji.json` |
| kana set sizes | S2, S2k | 10 · 12 | ✅ |
| distinct kanji vendored | build log | 14 | ✅ vendored from KanjiVG at weight 58 |
| build minutes | build log → title | — | ⚠️ owed |
| first-run baseline (pen test on the 9) | video ring | — | ⚠️ owed, filmed |

---

# Post-build audit — what shipped that this spec did not ask for
*Appended 2026-09-16, against `ef4124b`. Read this before writing v5a.*

The five commits since `8c05a49 implement v5` (`c9ce57c` stroke animator, `d04948a` canvas, `14d8448` dialogue, `ef4124b` daily basics) carry work that no line above authorizes. Nothing here is a bug report — most of it is deliberate and good. It is listed so v5a can either adopt it into the spec or take it back out, rather than leaving the spec and the tree disagreeing in silence.

## 12. Off-spec additions

**12.1 A fourth platform set — `daily-basics-kanji`.** §Scope says "exactly three things … three platform sets — two kana, one kanji"; §10 excludes "more than one set per script". `lib/sets.ts:PLATFORM_SET_IDS` ships four: `everyday-hiragana`, `countries-katakana`, `daily-basics-kanji` (10 words: 日月火水木金土人大小), `station-kanji`. Ten more KanjiVG files vendored, so the §11 count of 14 distinct kanji is now 24. Knock-on: §0.6's cold-start S1 reads `1 SET · 0/9`; the built S1 kanji row reads `2 SETS · 0/19`.

**12.2 The Joker types his line.** `components/Joker.tsx` streams the line RPG-style — 22 ms per character, 120 ms lead-in, tap the panel to finish, `prefers-reduced-motion` skips it. §6 says "Never animates"; §7's motion budget is two items (the flip, the slide). The component documents itself as a creator override. The spec still says the opposite.

**12.3 The mascot is a raster.** `public/joker-mascot.png`, 92 KB, placed by hand-measured alpha bounds (`ART = {box:1080, x:61, y:158, w:958, h:764}`) and negative margins. BUILD-MAP §6 asked for SVG, single colour + strike, ≤ 8 KB. Consequences: no `currentColor`, no strike tint, 11× the asset budget, and it is the one element on screen that cannot follow a theme.

**12.4 The Joker's lines are generated, not tabled.** §6 says one table keyed `screen × state`, lines copied verbatim from the canvas sheet. `lib/joker-lines.ts` adds `setLine()`, `revealLine()` and `resultLine()` — templates plus a number-word array (`No, One, Two … Twenty-one`) — so most lines the user meets on S6b, S7b and S8 are assembled at runtime. `drill.prompt` is an invented line (S4's prompt state had none, and an empty panel moved the canvas).

**12.5 Schema fields beyond §2.** `WordSet` gained `label` (the kanji card's kind word, defaults `PLACE`) and `blurb` (the deck row's description, defaults per script). `daily-basics-kanji.json` uses both — `"label":"KANJI"`, `"blurb":"NATURE, PEOPLE"`. §2 fixes the schema at `{id, name, glyph, place?, script, origin, words}`.

**12.6 `tries` lives in memory, not in the blob.** `lib/joker.ts` counts attempts in a module-level `Map`, reasoning that §3 wants tries counted across rounds while §2 wants nothing of a round persisted. The gap: a reload clears the map, so a word missed twice and then written correctly after a refresh mints as **foil**. Rarity is the one thing the app promises never changes, and it currently depends on whether the tab was reloaded.

**12.7 Unspecced canvas and screen work.**
- `lib/strokes.ts:scopeSvgIds` — strokesvg keys clipPath ids off the codepoint, so ちょっと / こんにちは inlined two elements with the same id and strokes vanished. Real fix, but new canvas code beyond §4's "only new canvas code".
- S6b tap-a-card detail overlay. §0.6 specced tap-detail on **S8** only.
- Screen copy in no sheet: the `REVEALING` LED chip, `RARITY IS WRITTEN ON THE CARD / AND NEVER CHANGES`, `TAP A CARD TO SEE ITS FACE …`, the `· FULL` title suffix, `NOTHING LEFT TO DEAL`.
- Earned kanji faces print `word.reading` under the word. Consistent with the CARD rule (earned, never shown), but the placement is undesigned.

**12.8 Dev artifacts tracked in git.** `.wide2.mjs` (a Playwright screenshot scratch script, from `d04948a`) and `set-title-overlap.png` (58 KB debug shot) sit at the repo root and are committed. `banner.png` too.

**12.9 Dead exports.** `hasSeen()` (`joker-lines.ts`), `isEarned()` and `resetAttempts()` (`joker.ts`, commented "only for tests" — no test calls it).

## 13. Specced but still owed

- **§11 truth table** — `build minutes` and `first-run baseline` remain ⚠️ owed. `distinct kanji vendored: 14` is stale at 24 (see 12.1).
- **Supabase.** BUILD-MAP §1 says "initialised in v5, creator decision 2026-09-17". §10 here forbids any server. Nothing is initialised — this file won, correctly — but the two documents still contradict each other in the repo. v5a should delete one of the two claims.
- **BUILD-MAP §3** says station-kanji is "12 distinct characters". It is 14 (出口入新幹線禁煙東中央西南北). §5 above is right; the build map is wrong.
- **§9 e2e** is done — `e2e-loop.mjs` §10/§10b cover deal → foil → abandon → miss → base → S8, and `e2e-offline.mjs` §3b runs a round with no network. `sets.json` in the export ZIP (BUILD-MAP §1) is absent and should stay absent while user sets are out of scope.

## 14. Candidates for v5a, ranked

1. **Persist pending attempts.** The only item above that can mint a wrong card. Key them into the `kanahero:v1` blob beside `joker`; clear the entry at the earn. Small change, and it makes the rarity promise true.
2. **Reconcile spec to tree.** Amend §6 (he types), §Scope and §10 (four sets), §2 (`label`, `blurb`), §11 (24 kanji), and drop BUILD-MAP §1's Supabase line. The spec is the artifact the build is filmed against; it should not describe a different app.
3. **Vector the mascot.** Biggest asset win, unblocks tinting, and deletes the alpha-bounds arithmetic in `Joker.tsx`.
4. **Decide the generated lines.** Either bless `setLine`/`revealLine`/`resultLine` in §6 as the design (they read well) or move their output back into the table as authored variants.
5. **Untrack `.wide2.mjs` and `set-title-overlap.png`;** decide whether `banner.png` belongs at the root or in `public/`.
