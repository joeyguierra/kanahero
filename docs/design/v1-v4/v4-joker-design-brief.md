# kanahero v4 — design brief (rewritten 2026-09-16)

For Claude Design. Supersedes the first v4 draft. Keep the CARD anatomy, the one semantic rule, the motion budget and the data shape from `KanaHero v4 Handoff.dc.html` unchanged; the structure around them changes as below. Spec wins on behavior, this wins on pixels.

## What Kana Hero is now
Four decks. Each deck is an alphabet plus its words. The Joker is the app's voice and its dealer: he speaks on every screen, one line, and every correct stroke comes from him. You write from memory; nothing is learned by recognition.

## S1 Home — four rows, no button
Header: `KANA HERO` only. **No OFFLINE · $0 line.**
The Joker, small, with one line of dialogue — the first thing on the screen after the name.
Four rows, one tap each, tap moves on:
- あ HIRAGANA — fraction of characters, thin bar
- ア KATAKANA — same
- 漢 KANJI — sets collected (e.g. `1 SET · 3/12`), thin bar
- BANK — the count, no bar, lighter row (unbounded; it is where your next set comes from)
No global CTA. No "presets". Nothing greyed, nothing coming soon.

## S2 Deck (hiragana, katakana)
Two things: **CHARACTERS** (the existing drill, untouched — the Joker is added to its header as the one who shows the stroke) and **SETS** (the card loop). Kanji's deck screen is sets only; no fake characters row.

## Sets
Two origins, shown as two groups, same row anatomy (name, word count, fraction, foil count, bar):
- **Platform sets** — shipped in the bundle. v4 ships three: hiragana `everyday words` (≤5 characters each; includes small kana and long vowels), katakana `countries` (the ones you write on a form), kanji `station`.
- **Your sets** — created by the user (online), drilled offline. In the free/offline build the group shows one action: `NEW SET`. No upsell copy.
A set is a closed list; a fraction is honest here.

## The round (S6b → S7 → S7b → S7c → S8)
As drawn in the v4 handoff: face-down set → DEAL → prompt card (reading, romaji, meaning, no kanji) → write → FLIP → model over ink → GOT IT / MISSED → earned face slides to hand → result is the cards. Rarity = tries (1 foil, 2 standard, 3+ worn), fixed forever. Multi-character words: **decided 2026-09-16 — one canvas, the whole word.** The user fits the word in the existing 334px board; self-grading makes alignment irrelevant. On FLIP the model word is laid out left to right, each character in a cell of canvas-width ÷ N, small kana at their true reduced size. No new canvas, no cells drawn on the board. The Joker says it once, the first time a word is dealt: "Whole word, one box. Make it fit."

## The Joker
He is the hero mascot (final art pending; placeholder is not final). Rules: one line per screen, under twelve words, first person, dry, never cheerleading, no streak or nag copy, never explains a mechanic twice. He appears in the character drill header so the correct stroke is his.

## Not on any screen
Tier names, "pro", "upgrade", lock icons, greyed features, JLPT levels, rank letters, dates on cards, timers, streaks, XP, share buttons. Attribution line stays in the footer (strokesvg / Klee One / KanjiVG).
