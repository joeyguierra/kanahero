# kanahero — build brief

A Next.js PWA that drills **writing kana from memory** — hiragana or katakana, one script per session. Romaji prompt on top, blank canvas below, you write it by hand, flip the card, the real stroke order animates over your attempt, you grade yourself. Missed cards return until you get them.

No backend, no network calls, no accounts. Fully offline after first load — it works on a plane.

**The number:** how many of the 71 kana you have ever written correctly from memory, stored on device. It is the reason the app exists, so it is the largest element on the home screen. It is **per script** — あ and ア are different characters to write, so knowing one tells you nothing about the other, and a single merged count out of 142 would hide which half you are actually weak in.

---

## Screen map

| # | Screen | Contains (top → bottom) | Actions |
|---|---|---|---|
| **1** | **Home** | `38` — the count for the selected script, hero size, dominant element · label `of 71 hiragana written from memory` · script toggle: `Hiragana` / `Katakana` · set toggle: `All 71` / `Base 46` (both segmented, both remember the last choice) · `Start` button · footer: attribution line, small | `Start` → 2 |
| **2** | **Session · Prompt** | Progress: `12 left` (text only, no bar) · set line: `set · katakana · all 71` · **Prompt card** — romaji `ka`, large, centered · **Canvas** — square, 1:1, ruled with faint centre crosshair, ink follows finger/stylus · `Clear` · `Undo` · **`Show`** (primary) | `Show` → 3 · `Clear` wipes canvas · `Undo` removes last stroke |
| **3** | **Session · Reveal** | Same `12 left` · **Prompt card, flipped** — kana `か` + romaji `ka` + `3 strokes` · **Canvas, frozen** — your ink dimmed, correct character animates stroke-by-stroke on top of it, one stroke at a time · `Replay` · **`Got it`** / **`Missed`** (equal weight, side by side) | `Got it` / `Missed` → next card, or → 4 if queue empty · `Replay` re-runs animation |
| **4** | **Session complete** | `41` — the count, hero size, same position and size as screen 1 · `of 71 written from memory` · delta line: `+3 this session` · `Again` · `Done` | `Again` → 2 (reshuffled) · `Done` → 1 |

No nav bar. No settings screen. No card is reachable except through the session queue.

---

## Reasoning, decisions, and detail

### Why only four screens

Every screen that is not the writing loop is a place to not be writing. Home exists to show the number and start; complete exists to show the number moved. The set and script toggles live on Home rather than in settings because each is a two-state choice made once per session, not a preference.

A session is one script. A romaji prompt cannot say which script to write without the toggle already having said it, and a mixed deck would need the card to label every prompt `katakana` — a second thing to read on a screen whose whole job is one word. The header's `set · katakana · all 71` states it once and stays put.

Screens 2 and 3 are the same screen in two states. The card flips in place, the canvas stays exactly where it is. Nothing reflows between prompt and reveal — the animation has to land on top of your ink at the same size and position, so the canvas cannot move.

### User flows

**Main loop**
1. Home → `Start`. The chosen set (46 or 71) is shuffled into a queue.
2. Card shows romaji only. You write on the canvas.
3. `Show`. Card flips to the kana; your ink dims to ~30%; the correct character animates over it, stroke by stroke, in writing order.
4. `Got it` or `Missed`. Canvas clears, next card.
5. `Missed` cards are pushed back into the queue (a few positions later, not immediately — you should not answer from short-term memory). They keep returning until graded `Got it`.
6. Queue empty → screen 4.

**What counts toward the number**

A kana is marked *written from memory* only on a **first-attempt `Got it`** in a session. If you missed it, watched the animation, and got it on the requeue — you copied what you just saw. That is not from memory, and the number is worth nothing if it counts that. The requeue still has to be cleared to finish the session; it just does not mint the number.

A kana missed on a later session does not lose its mark. The number is cumulative and never goes down — decay would turn it into a score to defend, which is the streak mechanic under a different name.

Consequence, and it is intentional: a kana you miss can only be earned in a *later* session. That is a natural spaced return.

**Interrupted session:** closing mid-session discards the queue. Earned kana are already persisted at the moment of grading, so nothing is lost. There is no resume — resume is state to manage for a loop that takes minutes.

### The 71, twice

46 base + 25 marked = 71, per script — 142 characters of stroke data in all.

- **Base 46:** あいうえお かきくけこ さしすせそ たちつてと なにぬねの はひふへほ まみむめも やゆよ らりるれろ わを ん
- **Dakuten 20:** がぎぐげご ざじずぜぞ だぢづでど ばびぶべぼ
- **Handakuten 5:** ぱぴぷぺぽ

Katakana mirrors this exactly: アイウエオ … ワヲン, ガギグゲゴ …, パピプペポ. Unicode lays the katakana block out as a copy of the hiragana block shifted by `0x60` (あ U+3042 → ア U+30A2), and the two scripts agree on reading and on which kana are base versus marked — so `lib/kana.ts` **derives** the katakana set from the hiragana one rather than restating it. Parity is then structural: a romaji fix or a set-membership change lands on both scripts at once, and the two lists cannot drift apart.

Not included: yōon digraphs (きゃ), small kana (っゃ), katakana. The marked kana are worth keeping in the default set precisely because the dakuten is *two extra strokes at the end* — stroke count and order for が is か plus two, which is the kind of thing you only learn by writing it.

Romaji uses Hepburn: `shi` `chi` `tsu` `fu` `ji` `zu`. を is prompted as `wo`, ん as `n`.

### Stroke data source

**Primary: [strokesvg](https://github.com/zhengkyl/strokesvg)** — kana SVGs purpose-built for stroke animation, derived from the Klee One font.

Verified against the repo: `dist/hiragana/` contains all 71 characters this app needs, including every dakuten and handakuten kana. Files are named by the character (`が.svg`). ViewBox is `0 0 1024 1024` — square, which is why the canvas is square.

**Why this one, and why it moves like a pen.** Each file has two groups. `shadows` holds the filled outline shape of each stroke, used only as a `clipPath`. `strokes` holds a **centerline path — the trajectory the pen travels down the middle of the stroke**, animated with `stroke-dasharray` / `stroke-dashoffset` and clipped to its shadow. The result is a brush-shaped stroke growing from its start point to its end point in the direction a hand writes it. It is not an outline being traced, and it is not a glyph fading in. Strokes that self-intersect (loops in あ, ま, ほ) are split into multiple shadow/stroke pairs so the reveal stays correct through the crossing.

Play strokes strictly in document order with a short pause between them. Stroke duration should scale with path length so a long sweep is not faster than a short tick — `getTotalLength()` divided by a fixed pixels-per-second.

**A `<g>` child is one stroke, not several.** The nested group for a self-intersecting stroke holds the *same trajectory repeated once per clip region* — upstream's own animator notes that "all strokes in a group should be the same length". Its paths must therefore animate **concurrently, on one clock, over one shared length** (average the children's `getTotalLength()`; optimization rounds them slightly apart). Animating them in sequence draws the stroke, stops, and draws it again — which reads as the pen stalling midway. This affects 20 of the 71 hiragana and every looping katakana, so it is not an edge case. `scripts/e2e-loop.mjs` guards it by sampling `document.getAnimations()` during a reveal and asserting the copies overlap.

**Attribution this obliges.** The SVGs are derived from **Klee One**, licensed under the **SIL Open Font License 1.1**; everything else in strokesvg is **MIT**. Both are permissive — neither is copyleft over your app code, unlike the alternative below. Obligations:

- Ship the OFL text and the Klee One copyright notice with the app, and the MIT notice for strokesvg. A `/licenses` route or a bundled `NOTICES` file satisfies this.
- Do not sell the SVG files on their own. Bundled inside the app is fine.
- Do not use the reserved font name "Klee One" as the name of a modified font. Not a concern here — you are shipping SVGs, not a font.

Visible in the app: one small line in the Home footer — *"Stroke data from strokesvg (MIT), derived from Klee One (SIL OFL 1.1)"* — linking to the licenses. That is the only place attribution appears. It does not belong on the writing screen.

Both `dist/hiragana/` and `dist/katakana/` are vendored by `npm run strokes`, into `public/strokes/<codepoint-hex>.svg`.

**Fallback: [KanjiVG](https://kanjivg.tagaini.net/)** — also has kana (`kanji/03042.svg` for あ, `03050.svg` for が, confirmed present), also centerline paths with `fill:none; stroke-width:3`, one `<path>` per stroke in writing order. It animates correctly with the same technique, but renders as a uniform hairline rather than a brush, and it is **CC BY-SA 3.0** — share-alike, which reaches any derivative of the stroke data. Use only if strokesvg turns out to have a bad shape for a specific kana. If used, attribution is *"Kanji stroke data copyright © Ulrich Apel / KanjiVG, CC BY-SA 3.0"* and the derived data must stay under a compatible license.

Both files get vendored into `public/` at build time. Nothing is fetched at runtime.

### Offline and platform

- Next.js with `output: 'export'` — static files, no server, nothing to call.
- Service worker precaches the app shell, the 142 SVGs, and any webfont on install. After the first load the app never touches the network.
- Web app manifest: standalone display, portrait, icons, so it installs to the home screen and opens without browser chrome.
- Persistence is `localStorage`: the set of earned kana (flat across both scripts — the codepoints never collide, and Home counts whichever script is selected), plus the last-used script and set choice. One small JSON blob, versioned so the shape can change later without wiping the number.
- Canvas is Pointer Events — covers finger, stylus, and mouse. Stroke width varies with pointer speed for a pen-like line. `touch-action: none` on the canvas so writing never scrolls the page. Canvas backing store sized to `devicePixelRatio` so ink is not fuzzy.
- Target is a phone held in one hand. The canvas sits in the lower half, inside thumb reach; `Show`, `Got it`, and `Missed` are all in the bottom third.

### Deliberately not building

- **Handwriting recognition.** Self-grading is the mechanism, not a shortcut around a missing feature. You judging your own stroke against the animation is what makes you look closely at it.
- **Hints of any kind.** No first-stroke peek, no ghost outline under the canvas, no stroke count before the reveal. A hint converts recall into tracing, which is the exact failure this app exists to fix.
- **Skip.** There is no way past a card except writing something and grading it. Skip is the pressure valve that lets you avoid the kana you actually need.
- **Nav bar.** Four screens, one path.
- **Settings.** The only choice is 46 vs 71, and it is on Home.
- **Accounts, sync, any backend.** It has to work on a plane, and the number is worth more when it is yours on one device.
- **Streaks, daily goals, notifications.** Retention theater. The number only goes up when you write a character, and that is the only reason to come back.
- **Percentages, accuracy scores, per-kana stats, timers.** A percentage invites you to protect it. `38 of 71` says what is left to learn; `54%` says how much you are failing.
- **Yōon, small kana, kanji, vocabulary, reading practice.** Not this app. Katakana *is* now in — it is the same drill on the same stroke data, and it is the other half of the kana you have to be able to write. A mixed hiragana+katakana deck is not: see the one-script-per-session note above.
- **Session length settings.** A session is the shuffled set, and it ends when the queue is empty.

### Assumptions to confirm

1. **Undo** is on the canvas alongside Clear. It removes your last stroke — writing hygiene for a slipped finger, not a hint about the answer. Cut it if it feels like a crutch.
2. **`Replay`** on the reveal screen re-runs the animation. Post-reveal, so it cannot help you cheat, and one pass is genuinely too fast for a five-stroke kana.
3. Missed cards reinsert **~5 positions later** rather than at the end of the queue — far enough to clear short-term memory, near enough that the tail of a session is not entirely misses.
4. The reveal shows **stroke count** (`3 strokes`) on the flipped card. It is information after the fact, but say the word if it reads as scorekeeping.
