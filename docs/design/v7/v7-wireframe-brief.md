# KanaHero v7 — wireframe brief (2026-11-14)

For the design agent. This file is self-contained. `docs/spec/SPEC-v7-skeleton.md` is the source
of truth for behaviour; where this brief and the spec disagree, the spec wins and the
disagreement should be called out. The earlier `KanaHero v7 Wireframe.dc.html` is **superseded**
— use it for drawing style only (see §6), not for structure.

## 1. What the app is

A phone web app for writing Japanese by hand from memory. One loop: the app shows a prompt, the
prompt melts away, you write the answer with your finger on a blank canvas, the app animates the
correct strokes over your ink, and you grade yourself GOT IT or MISSED. v7 adds memory between
days: each word has a due date, and a word you get right comes back later and later
(1, 3, 7, 14, 30 days). A word you miss comes back tomorrow, and again five items later in the
same session.

One user for now: the creator, drilling daily toward JLPT N5. Offline, no account, no server.

## 2. The rule of this build

**Simplest first, additions later.** If something is not listed in §4, it is not in v7. Do not
add it, and do not leave a visible placeholder for it except the three reserved slots in §5.

Not in v7: the Joker (mascot / speech bubble), cards and collection, rarity, receipts, sound,
the capture bank, a per-word list, settings, onboarding, streaks, goals, XP, scores, share,
notifications, accounts.

## 3. What to deliver

One low-fidelity wireframe canvas: structure and flow only, no visual design.

1. **Flow map** — every screen as a thumbnail with labelled arrows (§4.1).
2. **Screens at size** — 390 × 844, one frame per state listed in §4.2–4.8 (15 frames).

## 4. Screens

Ids are fixed; use them as labels.

### 4.1 Flow

- Launch → **S1** for the last-used set. First-ever launch (no last set) → **S0**.
- S0: tap a row → that set's S1. First time a set is ever opened → **S1a** first, then S1.
- S1: tap the set name → S0. Tap DEAL (or WRITE ANYWAY) → S2.
- S2 → S3 automatically after about 3 s (the prompt melts).
- S3: tap DONE → S4.
- S4: tap either grade → next item's S2, or S5 when the queue is empty. A MISSED item re-enters
  the queue five positions later (or last, if fewer remain).
- S5: tap CLOSE → S1, which now shows state 4 or 5.

### 4.2 S0 — Set list

A plain list. Six rows, each: set name · script · `N due · M new`. Tapping a row opens it.
No selected state, no start button, no progress marks. Footer, small: *export ledger* · *credits*.

Two sets share the name DAILY BASICS, so the script must be readable on every row.

Frames:
- **S0-a first-ever launch** — nothing opened yet:

  | Set | Script | Counts |
  | :-- | :-- | :-- |
  | DAILY BASICS | hiragana | 0 due · 10 new |
  | COUNTRIES | katakana | 0 due · 10 new |
  | DAILY BASICS | kanji | 0 due · 10 new |
  | STATION | kanji | 0 due · 9 new |
  | CALENDAR | kanji | 0 due · 10 new |
  | N5 MOCK | words | 0 due · 9 new |

- **S0-b a normal day:**

  | Set | Script | Counts |
  | :-- | :-- | :-- |
  | DAILY BASICS | hiragana | 0 due · 0 new |
  | COUNTRIES | katakana | 3 due · 8 new |
  | DAILY BASICS | kanji | 4 due · 0 new |
  | STATION | kanji | 5 due · 0 new |
  | CALENDAR | kanji | 10 due · 10 new |
  | N5 MOCK | words | 9 due · 0 new |

### 4.3 S1a — Placement

Shown once per set, the first time it opens. Set name, one question, two equal buttons:
*New to these* / *I can already write some*. Nothing else.

Frame: **S1a** for N5 MOCK.

### 4.4 S1 — Today

Set name (tappable, leads to S0) · the big line `N due · M new` · one blank reserved line
(§5) · the spread · one button.

The spread is a picture of the deal: one small card per item, hatched = due, plain = new, due
first. 1–7 cards in one row, 8 or more in two rows, the top row takes the odd card. The largest
set today is 21 items.

Frames:
- **S1-1 first run** — CALENDAR, `0 due · 10 new`, DEAL.
- **S1-2 normal** — CALENDAR, `10 due · 10 new`, DEAL.
- **S1-3 heavy** — CALENDAR, `21 due · 0 new`, DEAL. More than 20 due means no new items today.
  No copy about being away. It is just a bigger number.
- **S1-4 today's deal finished, unseen items remain** — COUNTRIES, `0 due · 0 new`,
  "next: Sun 15 Nov · 10 due", button WRITE ANYWAY, outlined rather than filled. No spread.
- **S1-5 set done** — DAILY BASICS hiragana, "next: Tue 17 Nov · 10 due". No button, no spread.

### 4.5 S2 — Prompt

No controls. Header: `Prompt` and position, e.g. `3 / 20`. The prompt never shows the written
answer, except in the study trial.

Frames:
- **S2-a kana** — romaji only, large: `ka`.
- **S2-b word** — meaning + reading: `water` / `みず`.
- **S2-c study trial** — the first time a word is ever shown. The written form large (`水`) with
  its stroke animation playing once, reading and meaning beneath (`みず` · `water`). Then it
  melts like any prompt. The form is gone before the pen goes down.

### 4.6 S3 — Write

A full-width blank canvas and one button, DONE. No ghost glyph, no grid, no stroke count, no
hint. A word with more than one character gets one box per character on the same canvas, split
by a dashed divider.

Frames:
- **S3-a one box** — the user's ink for か.
- **S3-b two boxes** — the user's ink for 出口.

### 4.7 S4 — Reveal + grade

Top to bottom: the canvas with the correct strokes animating over the user's ink · the word
(`水`) · reserved slot (§5) · the reading (`みず`) · the meaning (`water`) · two buttons of equal
weight, GOT IT / MISSED, no colour verdict · one small line under the buttons: *dots, long
vowels and small kana count* · reserved slot (§5).

Frame: **S4**.

### 4.8 S5 — Done

Header: `Done` and the date (`Sat 14 Nov`). A plain list of today's items in the order written:
word · reading · ✓ or ✗. A missed word appears twice — missed, then again five rows later.
Then minutes (`7 min`), "next: 9 due tomorrow", CLOSE. No score, streak, share or praise.

Frame: **S5**, 18 rows, two words missed and repeated.

## 5. Reserved slots

Draw these as dashed blue boxes labelled "reserved — blank in v7". There are exactly three:

1. S1 — one line under the numbers (a one-line message, later).
2. S4 — one line between the word and the reading (pitch accent, later).
3. S4 — bottom left, under the grading line (later).

## 6. Drawing style

Same as the superseded wireframe: black = structure, grey = placeholder content, blue = notes
and reserved slots. Hand-drawn feel, 2 px rules, no colour, no icons, no imagery. Notes sit
beside the frame, not inside the layout.

## 7. Rules every frame must respect

- Self-grade is the only input besides ink. No typing anywhere.
- No loading states. Everything is offline and instant.
- The user never sees rungs, intervals or schedules — only due counts and the "next" line.
- The app never comments on absence, effort or streaks.
- Dates in examples are consistent: today is Sat 14 Nov 2026.
