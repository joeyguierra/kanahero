# Claude Design prompt — TIME screen hi-fi (2026-11-24)

Paste everything under the line into Claude Design. Attach:
1. `docs/design/v6/KanaHero v6 Receipt.dc.html` (the look to match)
2. `public/assets/joker-mascot-open.png` and `public/assets/joker-mascot-close.png`
3. `app/globals.css` (THE LOG tokens)
4. `docs/spec/BRIEF-study-time-dashboard.md` (the brief this designs)

---

Design a hi-fi for an **internal dashboard** that sits beside **Kana Hero**, a mobile-first
offline PWA for learning Japanese handwriting. It is for the creator only, local to his phone, on
its own route (`/time`), and not linked from the app's screens. The page is **TIME**: logged
study minutes per day, split into three parts. Match **the attached v6 Receipt hi-fi exactly**
in look: same design system (THE LOG), same type, same Joker seat. It is a page of its own in the
v6 look, not a change to the app.

## Look — THE LOG, as in v6
- Canvas `#0a0a0b` chassis (board `#151517`), text bone `#F2F0EB`, muted rail `#8C8C93`,
  print `#B9B6B1`, carbon `#5A5A5F`, panels plate `#141416` with 1px seam `#2A2A2E` borders.
- Strike pink `#FF2E88`: the action color and the Joker's accent only. Chips: strike fill, black text.
- Type: **Archivo 900** for the big number (64px/.92, letter-spacing −.04em, unit word at 26px
  beside it, like v6's "10 EARNED"). **JetBrains Mono 10px, uppercase, letter-spacing .2em, rail
  color** for every label and header. Archivo 13–15px for body. Klee One only for Japanese the
  Joker says.
- The three parts take three palette colors: **pre-check `#2E9DFF` blueprint · app drill
  `#00E58A` live · night drill `#FFB300` caution**. Flag it if you'd assign them differently.
- Phone artboards 390×844, safe areas respected, gutter 28px.

## The Joker
Use the attached mascot PNG exactly as v6 S8 places it: 78px, pink drop-shadow
(`0 12px 22px rgba(255,46,136,.28)`), beside a plate speech bubble with a seam border, a rotated
square tail, a `JOKER` label in strike mono 8px, and the line in Archivo 13px/1.45. One line per
state, from the list below. Use them verbatim. Each one is checked against his rules: positive
only, information first, under twelve words, kana only, and never about days, streaks or amounts.
Do not write new lines.

| State | Line |
|---|---|
| 1 Normal | A dash means untimed, not zero. ちゃんと かぞえる. |
| 2 Entry sheet | Late night sheet? It counts for the day it started. ね. |
| 3 Pre-check opened | Check and morning items, kept apart, drawn as one. べんり. |
| 4 First open | Drill minutes fill themselves in. Paper parts, type them here. どうぞ. |
| 5 Just saved | Saved to this phone only. Export carries it. はい. |

## Screen content (use these real numbers)
Header row, mono: `TIME` left · `TUE 24 NOV` right (the S1 TODAY header pattern).

**Headline:** `155.8` + `MEASURED MIN`. Under it, a mono line: `6 PARTS UNTIMED`. The total must
always say "measured" and how many parts are untimed. Never show a bare total.

**Part totals**, three small chips or rows with a color swatch:
`PRE-CHECK 33.7` · `APP DRILL 122.1` · `NIGHT DRILL 0.0`.

**Chart:** one stacked vertical bar per study day, three colors, total printed above each bar in
mono. Untimed parts get **no bar length** (no value is implied). Mark them with a small hatched
tick or a `—` under the day label, styled like the hatched due cards on S1 TODAY. Pick one and
flag it.

**Table**, newest first: DAY · PRE-CHECK · APP DRILL · NIGHT · TOTAL. `—` = untimed, in carbon.

| Day | Date | Pre-check | App drill | Night | Total |
|---|---|---|---|---|---|
| 10 | Tue 24 Nov | 13.6 (check 8.0 + morning 5.6) | 11.1 | not yet | 24.7 |
| 9 | Mon 23 Nov | 8.9 | 10.4 | — untimed | 19.3 |
| 8 | Sun 22 Nov | 11.2 | 8.8 | | 20.0 |
| 6 | Fri 20 Nov | — untimed | 16.5 | | 16.5 |
| 5 | Thu 19 Nov | — untimed | 17.3 | | 17.3 |
| 4 | Wed 18 Nov | — untimed | 14.8 | | 14.8 |
| 3 | Tue 17 Nov | — untimed | 15.1 | | 15.1 |
| 2 | Mon 16 Nov | — untimed | 18.5 | | 18.5 |
| 1 | Sun 15 Nov | (no check) | 9.6 | | 9.6 |

Day 7 (Sat 21 Nov) had no study. **Default: it is simply absent** from the chart and table. No gap
marker, no label.

Footer, mono, like S1: `export ledger` (the same file the app exports). No link into the app.

## Artboards to deliver
- **1 · TIME, normal:** everything above, Joker line 1.
- **1b · Variant for decision 1:** the same screen with day 7 as an **empty, unmarked column** so
  the time axis stays even. No red, no "missed", no label. Side by side with 1 so the learner can
  choose.
- **2 · Entry sheet:** a bottom sheet over TIME for one day. Day picker with only `TODAY` and
  `YESTERDAY`. Three rows, each an `m:ss` field: `CHECK`, `MORNING ITEMS`, `NIGHT SHEET`. The
  morning row has a `NONE TODAY` toggle (none happened, which is not the same as untimed). `SAVE`
  in strike fill, `CLEAR` quiet. Joker line 2.
- **3 · Pre-check cell opened (Tue 24):** the bar or row expands into its two stored parts,
  `CHECK 8.0 · MORNING 5.6 = 13.6`. Joker line 3.
- **4 · First open:** only drill minutes exist and every paper part is untimed. Headline reads
  `122.1 MEASURED MIN · 10 PARTS UNTIMED`. Joker line 4.
- **5 · Just saved:** state 1 with the new value settling in. Show one static frame and describe
  the motion. Respect reduced motion. Joker line 5.
- A notes column in the v6 style ("FLAGS — YOUR CALL"): color assignment, how untimed is shown,
  the chart at 9 vs 30 days (horizontal scroll or compression), table vs chart order.

## Hard rules (the screen fails if it breaks one)
- No goal line, target, 60-minute mark, progress ring or "x to go".
- No streak, no calendar grid of filled or empty squares, no "days in a row".
- No best day, no comparison with yesterday or last week, no average shown as a score.
- No red, no "missed", no copy about absence anywhere.
- An untimed part is never drawn as a length and never counted as zero.
- Nothing suggests sync, accounts, "pro", or locked features. Everything is on this phone.
- Joker lines verbatim from the table, one per state.
