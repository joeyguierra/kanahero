# kanahero — build brief v2

A Next.js PWA that drills **writing kana from memory** — hiragana or katakana, one script per session. Romaji prompt on top, blank canvas below, you write it by hand, flip the card, the real stroke order animates over your attempt, you grade yourself. Missed cards return until you get them.

No backend, no network calls, no accounts. Static export, everything vendored at build time.

**The number:** how many of the 71 kana you have ever written correctly from memory, stored on device. It is the reason the app exists. It is **per script** — あ and ア are different characters to write, so knowing one tells you nothing about the other, and a single merged count out of 142 would hide which half you are actually weak in.

> v1 of this brief is in git history: `git show HEAD:SPEC.md`.

---

## What v2 changed

v1 described a working four-screen app and shipped it. v2 is a **visual system pass**, drawn in `docs/design/KanaHero v2 Handoff.dc.html` and now built. The session mechanics are untouched — same deck, same requeue, same first-attempt rule, same stroke animation.

| | v1 | v2 |
|---|---|---|
| **Home** | One hero number for the selected script, plus two segmented toggles | A **track switchboard** — one card per script with its own count and progress bar; the selected card takes the strike border and tinted fill and reveals its set toggle inline |
| **Prompt (2)** | Romaji on a bordered card | Bare centered prompt — `WRITE` in strike above the romaji at 88px. Track badge and `✕ QUIT` in the header |
| **Reveal (3)** | Card flips, border turns strike | Same flip, now a chamfered strike card: glyph + romaji + stroke chip. Green `REVEALING` lamp replaces the quit control |
| **Complete (4)** | Hero number and a delta line | Got it / Missed tiles, the missed glyphs as caution chips, a track summary carrying the `+N from memory` chip, and **Replay missed** as the primary action |
| **Type** | System stack + generic mono | Archivo (display) and JetBrains Mono (instrument labels), self-hosted via `next/font`. Klee One still renders kana; Noto Sans JP 900 draws the ghost glyphs |
| **Livery** | A hazard stripe under the home header, a ghost kana behind the hero number | Ghost glyph of the selected track behind home and complete; a stripe rail down the right gutter of the session screens |

The handoff document also specs a **third track — kanji**, with a preset-picker screen (S1b). That is designed, not built. See [Designed, not built](#designed-not-built).

---

## Status

### Shipped and verified

- Both scripts, 71 characters each, base-46 / all-71 toggle, choices persisted.
- The full writing loop: prompt → write → show → reveal-over-ink → self-grade → requeue → complete.
- 142 stroke SVGs vendored to `public/strokes/<hex>.svg` (71 hiragana + 71 katakana), plus the strokesvg MIT license text.
- The v2 visual system across all four screens.
- `scripts/e2e-loop.mjs` walks the real flows against the static export in `out/` and asserts: the switchboard counts, ink gating on `Show`, the canvas holding the same box across every flip, requeue landing exactly `REQUEUE_AT` positions later, a requeued `Got it` does **not** mint, the complete screen's got/missed/replay numbers, persistence across reload, the later-session earn, both deck sizes, per-script scoring, and concurrent animation of a looping stroke's clipped copies.

### Known gaps

These are places the build does not yet match this brief. They are gaps, not decisions.

1. **There is no service worker.** v1 of this brief claimed one precaches the shell and the 142 SVGs; nothing in the repo registers one. The app is a static export with everything vendored, so it loads offline *if the browser happens to have it cached* — but the plane guarantee is not actually implemented. This is the largest gap.
2. **Attribution is incomplete.** `public/licenses/` holds only `strokesvg-LICENSE.txt`. The OFL 1.1 text and the Klee One copyright notice are obliged and missing. Home's footer links to the strokesvg license alone.
3. **Metadata is stale.** `app/layout.tsx` and `app/manifest.ts` both describe the app as "Write hiragana from memory" — written before katakana shipped.

### Designed, not built

The kanji track from the v2 handoff. It needs, in rough order of weight:

- **Stroke data.** strokesvg has no kanji. KanjiVG does — centerline paths, one `<path>` per stroke in writing order, animates with the same dasharray technique. But it is **CC BY-SA 3.0**: share-alike reaching any derivative of the stroke data. It does not reach app code, but the vendored SVGs and anything generated from them stay under a compatible license, and Home's attribution must name it. Its viewBox is `0 0 109 109` against strokesvg's `0 0 1024 1024` — normalize at vendor time so the overlay math stays one code path. It also renders a uniform hairline rather than a brush, so kana and kanji reveals will not match without thickening and rounding; exact parity may not be reachable.
- **An authored table.** Meanings and readings cannot be derived the way katakana is derived from hiragana. `lib/kana.ts` becomes `lib/decks.ts` with one card shape for all tracks — `{ id, track, char, prompt, strokeCount, deck }`, plus `readings: { kun, on }` on kanji only. `prompt` is romaji for kana and English meaning for kanji, so screen 2 renders one field and never branches on track.
- **Presets and S1b.** `{ id, label, glyph, chars[] }` in one JSON file, one preset per session. The handoff's six categories and their membership are explicitly placeholders — do not hardcode six; the grid is `1fr 1fr` auto-flow and scrolls past eight.
- **Persistence.** Same blob, version bumped, plus `lastTrack` and `lastPreset` beside `lastSet`. Earned characters stay a flat codepoint set — kana and kanji codepoints never collide.

Home currently renders two track cards, not three. The layout is drawn for three, so the middle of the screen is emptier than the mock; the note is pinned to the bottom block so both ends are anchored rather than leaving it floating.

---

## Screen map

| # | Screen | Contains (top → bottom) | Actions |
|---|---|---|---|
| **1** | **Home** | ghost glyph of the selected track · `KANA HERO` · `OFFLINE · $0` · `TRACK` · **track cards** — glyph, name, `46/71`, progress bar; the selected one adds the strike border, tinted fill, and its `Base 46` / `All 71` toggle · note line: *hiragana — all 71, dakuten included / missed cards replay until zero* · **`START SESSION`** · attribution | `Start` → 2 · tapping a card selects that track |
| **2** | **Session · Prompt** | stripe rail down the right gutter · Track badge · `12 LEFT` · `✕ QUIT` · **prompt slot** — `WRITE` label over the romaji, 88px · **canvas** — square, bone, faint centre crosshair, `DRAW` corner tag · `CLEAR` · `UNDO` · **`SHOW`** | `Show` → 3 · `Clear` wipes · `Undo` removes last stroke · `Quit` → 1, queue discarded |
| **3** | **Session · Reveal** | Same badge and `12 LEFT` · green `REVEALING` lamp · **same slot, flipped** — chamfered strike card with kana, romaji, `3 STROKES` · **same canvas, frozen** — ink at 30%, correct character animates over it stroke by stroke, `YOUR INK · 30%` and `STROKE 2/3` corner tags · `↻ REPLAY` · **`GOT IT`** / **`MISSED`** | grade → next card, or → 4 if queue empty · `Replay` re-runs the animation |
| **4** | **Session complete** | ghost glyph · `hiragana · all 71 — 71 cards` · **`Session done.`** · `GOT IT` / `MISSED` tiles · missed glyphs as caution chips · track summary: `+N FROM MEMORY` chip, `Written from memory`, `46/71`, bar · **`REPLAY MISSED (5)`** · `AGAIN` / `HOME` | `Replay missed` → 2 with just those cards · `Again` → 2 reshuffled · `Home` → 1 |

No nav bar. No settings screen. No card is reachable except through the session queue.

---

## Reasoning, decisions, and detail

### Why only four screens

Every screen that is not the writing loop is a place to not be writing. Home exists to pick a track and start; complete exists to show the number moved. The set and track choices live on Home rather than in settings because each is a choice made once per session, not a preference.

A session is one script. A romaji prompt cannot say which script to write without the toggle already having said it, and a mixed deck would need the card to label every prompt `katakana` — a second thing to read on a screen whose whole job is one word. The header badge states it once and stays put.

Screens 2 and 3 are the same screen in two states. **The card flips in place and the canvas does not move** — the animation has to land on top of your ink at the same size and position, so nothing between the header and the canvas may reflow, resize, or reorder. This is the one geometric constraint the whole design is built around.

### Why Home became a switchboard

v1's hero number showed one script's count at a time, so the other track's progress was invisible until you toggled to it. The switchboard shows both at once, which is the point of counting them separately — you can see which half you are weak in without touching anything. It also extends cleanly to a third track, which a single hero number does not.

The set toggle belongs to the selected track and appears only there. An unselected track collapses to a seam card and a gray bar: a card that is not in play should not offer options.

### User flows

**Main loop**
1. Home → pick a track → `Start`. The chosen set (46 or 71) is shuffled into a queue.
2. Card shows romaji only. You write on the canvas.
3. `Show`. Card flips to the kana; your ink dims to 30%; the correct character animates over it, stroke by stroke, in writing order.
4. `Got it` or `Missed`. Canvas clears, next card.
5. `Missed` cards are pushed back into the queue a few positions later — not immediately, you should not answer from short-term memory. They keep returning until graded `Got it`.
6. Queue empty → screen 4.

**What counts toward the number**

A kana is marked *written from memory* only on a **first-attempt `Got it`** in a session. If you missed it, watched the animation, and got it on the requeue — you copied what you just saw. That is not from memory, and the number is worth nothing if it counts that. The requeue still has to be cleared to finish the session; it just does not mint the number.

A kana missed on a later session does not lose its mark. The number is cumulative and never goes down — decay would turn it into a score to defend, which is the streak mechanic under a different name.

Consequence, and it is intentional: a kana you miss can only be earned in a *later* session. That is a natural spaced return.

**Interrupted session:** quitting or closing mid-session discards the queue. Earned kana are already persisted at the moment of grading, so nothing is lost. There is no resume — resume is state to manage for a loop that takes minutes.

**Replay missed** starts a fresh session containing only the cards you fumbled. See [open question 1](#open-questions) — this currently reopens the minting rule.

### The 71, twice

46 base + 25 marked = 71, per script — 142 characters of stroke data in all.

- **Base 46:** あいうえお かきくけこ さしすせそ たちつてと なにぬねの はひふへほ まみむめも やゆよ らりるれろ わを ん
- **Dakuten 20:** がぎぐげご ざじずぜぞ だぢづでど ばびぶべぼ
- **Handakuten 5:** ぱぴぷぺぽ

Katakana mirrors this exactly. Unicode lays the katakana block out as a copy of the hiragana block shifted by `0x60` (あ U+3042 → ア U+30A2), and the two scripts agree on reading and on which kana are base versus marked — so `lib/kana.ts` **derives** the katakana set rather than restating it, and `scripts/fetch-strokes.mjs` applies the same shift when vendoring. Parity is structural: a romaji fix or a set-membership change lands on both scripts at once, and the two lists cannot drift apart.

The marked kana are worth keeping in the default set precisely because the dakuten is *two extra strokes at the end* — stroke count and order for が is か plus two, which is the kind of thing you only learn by writing it.

Romaji uses Hepburn: `shi` `chi` `tsu` `fu` `ji` `zu`. を is prompted as `wo`, ん as `n`.

---

## The visual system

Named "THE LOG" — instrument panel, not stationery. Tokens live at the top of `app/globals.css`.

| Token | Value | Carries |
|---|---|---|
| `--strike` | `#ff2e88` | The primary action, the selected track, the revealed character |
| `--chassis` | `#0a0a0b` | Page ground |
| `--plate` | `#141416` | Cards, unselected tracks, secondary buttons |
| `--seam` | `#2a2a2e` | Every hairline border |
| `--bone` | `#f2f0eb` | Body text, and the canvas — the only large light surface in the app |
| `--live` / `--caution` | `#00e58a` / `#ffb300` | `Got it` / `Missed`, and their tiles and chips. Equal weight, always |
| `--rail` / `--print` / `--carbon` | `#8c8c93` / `#b9b6b1` / `#5a5a5f` | Instrument labels, secondary text, the quietest marks |

**Type.** Four faces. Archivo carries display weights — the 900s do most of the work, at 88px for the prompt, 56px for the stat numbers, 44px for *Session done.* JetBrains Mono carries every instrument label: uppercase, letter-spaced `0.09`–`0.24em`, 9–12px. Klee One renders kana, because it is the font the stroke data derives from. Noto Sans JP 900 is used for the ghost glyphs alone, because that is what the handoff draws them in. All four are self-hosted by `next/font` at build time — no runtime font requests. Archivo, JetBrains Mono and Noto Sans JP are variable fonts, so they take no weight list.

Noto Sans JP costs **124 slice files and 4.8MB** in the static export (7.2MB → 12MB) for two decorative characters. At runtime a browser downloads only the slice holding あ or ア, gated by `unicode-range`, so the user pays roughly one 80KB file — but it is a large footprint for ornament, and it will matter to the precache list when the service worker is written. `next/font/google` has no `text=` subsetting; the fix, if the size becomes a problem, is to vendor a `next/font/local` subset containing just the track glyphs.

**Ambient livery.** Two marks, and nothing else. Chrome screens (home, complete) carry a **ghost glyph** of the selected track — the kana at 230–290px in **Noto Sans JP 900**, drawn as a 1px `#1d1d21` outline on transparent fill, behind all content, at the handoff's own offsets. The face matters here: a 1px outline of a calligraphic letterform reads nothing like an outline of a heavy gothic one, and the offsets are measured against the latter. Session screens carry a **stripe rail** down the right gutter: 13px wide, 45° strike stripes at 18% over a seam hairline, clear of the canvas by 15px at a 390pt viewport. Both are inert and `aria-hidden`. The livery lives in its own clipped layer rather than clipping the screen, so content can never be cut off by it.

**The cut.** Primary actions notch the bottom-left corner (`polygon(0 0, 100% 0, 100% 100%, 18px 100%, 0 calc(100% - 18px))`); cards notch the top-right. Nothing else is chamfered, and nothing anywhere is rounded.

**Canvas geometry — load-bearing.** Square, `--bone`, 334×334 at a 390pt viewport with a 28px gutter, and **the same box in screen 2 and screen 3**. It is sized from the viewport rather than from leftover flex space, because the two action layouts differ in height and the leftover would not match. Both states are one full-width bar plus one two-up row in opposite order, at fixed heights, so the block below the canvas is the same size either way. On a short screen the canvas shrinks — identically in both states. `scripts/e2e-loop.mjs` measures it before and after the flip.

---

## Stroke data source

**Primary: [strokesvg](https://github.com/zhengkyl/strokesvg)** — kana SVGs purpose-built for stroke animation, derived from the Klee One font. `dist/hiragana/` and `dist/katakana/` contain all 142 characters this app needs, including every dakuten and handakuten kana. ViewBox is `0 0 1024 1024` — square, which is why the canvas is square.

**Why this one, and why it moves like a pen.** Each file has two groups. `shadows` holds the filled outline shape of each stroke, used only as a `clipPath`. `strokes` holds a **centerline path — the trajectory the pen travels down the middle of the stroke**, animated with `stroke-dasharray` / `stroke-dashoffset` and clipped to its shadow. The result is a brush-shaped stroke growing from its start point to its end point in the direction a hand writes it. It is not an outline being traced, and it is not a glyph fading in.

Strokes play strictly in document order with a short pause between them, and duration scales with path length so a long sweep is not faster than a short tick — `getTotalLength()` divided by a fixed pixels-per-second.

**A `<g>` child is one stroke, not several.** The nested group for a self-intersecting stroke holds the *same trajectory repeated once per clip region* — upstream's own animator notes that "all strokes in a group should be the same length". Its paths must therefore animate **concurrently, on one clock, over one shared length**. Animating them in sequence draws the stroke, stops, and draws it again, which reads as the pen stalling midway. This affects 20 of the 71 hiragana and every looping katakana, so it is not an edge case. `scripts/e2e-loop.mjs` guards it by sampling `document.getAnimations()` during a reveal and asserting the copies overlap. If kanji ever land, this guard matters more, not less — kanji self-intersect more than kana do.

**Attribution this obliges.** The SVGs are derived from **Klee One** (**SIL OFL 1.1**); everything else in strokesvg is **MIT**. Both are permissive — neither is copyleft over app code. Obligations:

- Ship the OFL text and the Klee One copyright notice, and the MIT notice for strokesvg. **Only the MIT notice is currently shipped** — see [Known gaps](#known-gaps).
- Do not sell the SVG files on their own. Bundled inside the app is fine.
- Do not use the reserved name "Klee One" as the name of a modified font. Not a concern — the app ships SVGs, not a font.

Visible in the app: one small line in the Home footer, linking to the licenses. That is the only place attribution appears. It does not belong on the writing screen.

**KanjiVG** is the fallback for kana and the only option for kanji; its terms are covered under [Designed, not built](#designed-not-built).

---

## Offline and platform

- Next.js `output: 'export'` — static files, no server, nothing to call. Nothing is fetched at runtime; the 142 SVGs and all three fonts are vendored at build time.
- **A service worker is specified but not built.** Until one exists, offline use depends on the browser's own HTTP cache. See [Known gaps](#known-gaps).
- Web app manifest: standalone, portrait, icons — installs to the home screen and opens without browser chrome.
- Persistence is `localStorage` under `kanahero:v1` — one versioned JSON blob holding the earned set (flat across both scripts; the codepoints never collide) plus the last-used script and set choice. Versioned so the shape can change without wiping the number.
- Canvas is Pointer Events — finger, stylus, mouse. Stroke width varies with pointer speed for a pen-like line. `touch-action: none` so writing never scrolls the page. Backing store sized to `devicePixelRatio` so ink is not fuzzy. Strokes are kept as point arrays so `Undo` can pop one and redraw.
- Target is a phone held in one hand. The canvas sits in the upper-middle, and every action — `Show`, `Got it`, `Missed`, `Start` — is in the bottom third, inside thumb reach.

---

## Deliberately not building

- **Handwriting recognition.** Self-grading is the mechanism, not a shortcut around a missing feature. You judging your own stroke against the animation is what makes you look closely at it.
- **Hints of any kind.** No first-stroke peek, no ghost outline under the canvas, no stroke count before the reveal. A hint converts recall into tracing, which is the exact failure this app exists to fix.
- **Skip.** There is no way past a card except writing something and grading it. Skip is the pressure valve that lets you avoid the kana you actually need. (`Quit` abandons the whole session; it is not a per-card escape.)
- **Nav bar, settings screen.** Four screens, one path; the only choices are on Home.
- **Accounts, sync, any backend.** It has to work on a plane, and the number is worth more when it is yours on one device.
- **Streaks, daily goals, notifications.** Retention theater. The number only goes up when you write a character, and that is the only reason to come back.
- **Percentages, accuracy scores, per-kana stats, timers.** A percentage invites you to protect it. `46 of 71` says what is left to learn; `65%` says how much you are failing. The v2 progress bars are the one concession — they are unlabelled, and the fraction beside them is the real number.
- **Mixed decks.** No hiragana+katakana deck, and if kanji lands, no mixed kanji deck either. One deck per session.
- **Yōon, small kana, vocabulary, reading practice.** Not this app. Kanji has moved off this list into *designed, not built* — on the same terms katakana was spent: same drill, same canvas, same self-grade, same animation mechanism.
- **Session length settings.** A session is the shuffled set, and it ends when the queue is empty.

---

## Open questions

1. **Replay missed reopens the minting rule.** It starts a fresh session, so a card you fumbled and then cleared on the replay counts as written from memory — which is what the first-attempt rule exists to prevent, at a two-second remove. Either mark replay sessions non-minting, or accept that a replay is a real second attempt and the rule only ever meant *within one pass*. Currently it mints, because the handoff draws the button as the default action.
2. **The missed chip list caps at 12** glyphs and then shows `+N`. A 71-card session with many misses hits that cap routinely. Confirm the cap, or let the list scroll.
3. **Progress bars on Home** are new in v2 and are the closest thing in the app to a percentage. If they read as scorekeeping, cut them — the fraction beside them carries the information.
4. **Undo** is on the canvas alongside Clear. It removes your last stroke — writing hygiene for a slipped finger, not a hint about the answer. Cut it if it feels like a crutch.
5. **`Replay`** on the reveal re-runs the animation. Post-reveal, so it cannot help you cheat, and one pass is genuinely too fast for a five-stroke kana.
6. Missed cards reinsert **~5 positions later** (`REQUEUE_AT` in `lib/session.ts`) rather than at the end of the queue — far enough to clear short-term memory, near enough that the tail of a session is not entirely misses.
7. The reveal shows **stroke count** on the flipped card. Information after the fact, but say the word if it reads as scorekeeping.

Kanji-specific questions — preset size, homophone meanings, kun/on readings on the reveal, and whether the kanji denominator is a fixed corpus — are held in `docs/design/KanaHero v2 Handoff.dc.html` and are only live once that track is being built.
