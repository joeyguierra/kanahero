# kanahero v4 — update brief for Claude Design

Extend `KanaHero v4 Handoff.dc.html`. Keep its CARD sheet, the one semantic rule, the motion budget, the layout law and the data shape as drawn. Redraw or add the screens below so the canvas holds **every screen in the app**. Companion: `v4-joker-design-brief.md` (structure) and `docs/spec/paid-tier-prep.md` (what must never appear).

Global changes first, then screen by screen.

## Global
- **The Joker is on every screen.** One dialogue box, one line, under twelve words, first person, dry. Component: mascot at 78px (110px on S1 and S6b), flat panel, 1px rule, square tail, mono `JOKER` tag — as drawn on S6. He is the only prose on any screen.
- **No global CTA anywhere on S1.** Rows are the actions.
- **Removed everywhere:** `OFFLINE · $0`, `PRESETS`, `DEALER` label, `← JOKER` back links (back goes to the deck), tier words, lock icons, greyed rows, "coming soon".
- **Strike fill = the act of drilling** (START, DEAL, FLIP). Bone = leaving or reviewing. Green/amber = self-grade only. Unchanged.
- Footer attribution line stays on S1 only.

## S1 · Home — REDRAW
`KANA HERO` wordmark. Directly under it: the Joker at 110px, one line ("Pick a deck. I'll deal, you write.").
Label `DECKS`. Four rows, full width, one tap each:
1. あ `HIRAGANA` — `46/71`, thin bar
2. ア `KATAKANA` — `12/71`, thin bar
3. 漢 `KANJI` — `1 SET · 3/12`, thin bar
4. `BANK` — `23 →`, strip treatment (lighter, no bar, half height)
Footer: attribution. Nothing else. Vertical budget is now generous — let it breathe; do not fill it.

## S2 · Deck — Hiragana — NEW
Header: `← HOME` · あ `HIRAGANA`. Joker line ("Characters first, or straight to words. Your call.").
Section `CHARACTERS`: one card — `46/71`, bar, the existing dakuten toggle and the `MISSED CARDS REPLAY UNTIL ZERO.` note moved here from old S1. Tap → S4.
Section `SETS`, two groups:
- `PLATFORM` — one row: `EVERYDAY WORDS` · `10 WORDS · ≤5 KANA` · `4/10` · `2 FOIL` · bar. Tap → S6b.
- `YOUR SETS` — empty in this build: a single row-shaped action `NEW SET` in bone. Tap → S6c. No explanatory copy; the Joker's line covers it if needed.

## S2k · Deck — Katakana — NEW
Identical anatomy to S2. Platform row: `COUNTRIES` · `12 WORDS` · `0/12`. Draw it at 0/12 so the empty-progress state exists on the canvas.

## S3 · Deck — Kanji — NEW
Same header pattern, 漢 `KANJI`. Joker line ("No alphabet here. Only words, only places you've been.").
**No CHARACTERS section.** `SETS` only: `PLATFORM` → `STATION` · `12 WORDS` · `3/12` · `1 FOIL`; `YOUR SETS` → `NEW SET`.

## S4 · Characters drill — DELTA to existing S2/S3/S3b
The drill is untouched: prompt, canvas, CLEAR/UNDO/FLIP, reveal, self-grade, requeue. One change: the header slot gains the Joker at 78px with a line, and the reveal's model strokes are his ("That's the stroke. Yours next to mine — honest?"). Draw one state (reveal) to show the Joker placed; reference the v3 handoff for the rest.

## S5 · Bank — UNCHANGED
Reference the v3 handoff. Only change: the back link reads `← HOME` and the row it returns to is the S1 strip.

## S6b · Set — face-down — DELTA
As drawn. Header back link becomes `← HIRAGANA` / `← KANJI` (the deck, not the Joker). Add a second instance drawn for a **kana set** (`EVERYDAY WORDS`, 10 backs, 4 earned) so the card grid is shown with kana faces too. Rarity chips unchanged.

## S6c · New set — NEW
The creator. Header `← KANJI` · `NEW SET`. Joker line ("Name it. Add the words. I'll deal them.").
Fields: set name; then a word list, each row `word · reading · meaning`, add-row action at the bottom. Primary action `SAVE SET` in bone (creating is not drilling). A quiet mono status line under the header: `NEEDS A CONNECTION` — factual, not a lock, not an upsell. One screen, one state; no account UI is drawn.

## S7 · Round — DELTA
As drawn, plus: draw a **second instance for a kana word** — prompt `ありがとう` / `ARIGATOU` / `THANK YOU` (no kanji, no place glyph; the set glyph is the set's own mark), the same canvas, ink showing a whole word written across the board. Joker line for the first word dealt: "Whole word, one box. Make it fit."

## S7b · Round — flipped — DELTA
As drawn, plus the kana-word instance: on FLIP the model word is laid out left to right, one cell per character at canvas-width ÷ N, small kana at their true reduced size, no cell lines drawn. Footer `ATTEMPT 1`. Self-grade ladder unchanged.

## S7c · Round — earned — UNCHANGED
As drawn. Add the kana earned face variant to the CARD sheet (below).

## S8 · Result — DELTA
As drawn. `BACK TO JOKER` becomes `BACK TO DECK`. Draw a second instance for the kana set (5 collected, 2 foil).

## CARD sheet — DELTA
Add the **kana prompt face** (reading is the word itself, so the face shows romaji + meaning and the word only after earning — the semantic rule still holds: the kana word is absent until written) and the **kana earned face** (word dominant, romaji, meaning, rarity stamp). Keep the three kanji rarities as drawn.

## JOKER sheet — NEW
Component states: idle, prompting, revealing, awarding, missed (no animation, one line). Line library, one per screen, all under twelve words — collect the lines above into a table. Placeholder art noted as not final.

## SPEC sheet — DELTA
Flows: F10 becomes S1 → deck → set → DEAL (four taps, unchanged count). Add F13 · Characters: S1 → S2 → S4. Add F14 · New set: S2/S3 → S6c → SAVE → back to the deck with the row now present under YOUR SETS. Data shape gains `origin: "platform" | "user"` on every set and `script: "hiragana" | "katakana" | "kanji"`. Scope guard adds: no tier names, no lock icons, no account UI beyond S6c's status line.
