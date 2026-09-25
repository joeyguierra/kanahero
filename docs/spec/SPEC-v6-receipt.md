# kanahero — build spec v6 · the receipt

**Status: READY TO BUILD, after v5d (2026-09-18; §5 rewritten 2026-09-25 — the receipt lives
in the card overlay, S6e dropped).** `SPEC-v5d-sound.md` ships first; this file is
built against the tree v5d leaves. If v5d slips, this builds against `72f3232` unchanged — the two
share `Round.tsx` and `Result.tsx` but not a line: v5d touches the `// sfx:` sites, this touches
`gotIt` and the S8 overlay. Whichever lands second rebases.
**Base:** `72f3232`. Where this file is silent, v5 / v5a / v5b / v5c and the shipped tree stand.
**Next.js:** read `AGENTS.md` first — this is Next 16; check `node_modules/next/dist/docs/` before
touching framework APIs.
**No server.** `paid-tier-prep.md` puts the card loop in the offline column and this is part of a
card. There is no Supabase in the tree and this build adds none (§8).

## 0. Why v6 and not v5e

v5 was the card loop, and every letter after it finished something v5 promised: v5a the copies and
the reward moment, v5b the voice, v5c the record of building them together, v5d the second
channel the reward moment shipped without. All of it moved things the user already had.

This adds a noun the app does not have. Today a copy is a count — v5a §2 collapsed cards to
`{shiny, base, worn}` on purpose, and nothing in the app can point at *one* copy. A receipt is a
record of one copy: the ink that earned it, the tries, the moment. That is a new store, a new
gesture on the card, and the first data the app keeps that is not a number or a photo. It is the seam the
online tier will one day sync across (§8), which is exactly the kind of thing a version boundary
should sit on. So: v6, and its own store, so a later version can move it without touching the
counts.

## 1. Scope

**In this build**
1. The receipt: the ink graded `GOT IT`, kept with the copy it earned (§2).
2. A receipts store in IndexedDB, separate from the bank and from `kanahero:v1` (§3).
3. `WritingCanvas` gives up its ink; the drawing code becomes a pure module so a receipt renders
   exactly as the canvas drew it (§4).
4. The card view: one overlay for S8 and S6d — hold the card for the ink, swipe through a
   stock's copies, the date on the chip (§5).
5. The export ZIP carries receipts (§6).
6. One Joker screen key (§7).

**Not in this build:** import/restore (the ZIP still has no reader), deleting a receipt, pruning
or a storage budget, receipts for the character drill (`Session.tsx` earns characters, not
cards), a receipt as a shareable image, a server of any kind, any change to how a card is earned
or graded.

## 2. Rules

1. **A receipt is the ink on the canvas at the `GOT IT` that earned the copy.** The canvas is
   frozen from `FLIP`, so the ink graded is the ink kept — nothing between the flip and the grade
   can change it. `CLEAR` and `UNDO` before the flip leave no trace; a receipt is the attempt,
   not the process.
2. **Missed attempts are not kept.** One receipt per copy, from the attempt that earned it. The
   receipt remembers the tries (v5a §2 stopped storing them; the receipt is where they live now).
3. **A receipt is provisional exactly as its card is** (v5a §1.1). It rides in the run's state
   and is written when the run finishes, after the counts. Abandon, reload and close discard it
   with the hand. Nothing about a receipt is on S7; §1.6's truth rule holds unchanged.
4. **Counts stay the source of truth, and they start again.** `kanahero:v1` goes to **version
   4** with the same shape; the migration **wipes `joker`** the way v3 did (v5a §2), and empties
   the receipts store with it, so every copy that exists from here on has the ink that earned it
   (creator decision 2026-09-25: *scrub all earned cards, we'll start fresh*). Characters,
   set choice, script, meaning and audio carry over. If the old blob held cards, the `wiped`
   flag is set and he says so once on S1 — `home.wiped` gains a second line for it, because a
   browser that heard the first for the v3 wipe has spent it. After the wipe a copy with no
   receipt can only be one whose write failed; it is still a full copy.
5. **The receipt write failing costs nothing the user can see on S8.** The reveal is not the
   place. The copy is a legacy card in S6d's stack (§5.3), which is the same card a pre-v6 copy
   is, and is true of both.
6. **The receipt renders the way the canvas did.** Same ink colour, same speed-varied width, same
   round caps. If the panel and the canvas ever disagree, the panel is wrong.

## 3. Data

### 3.1 The record

```ts
interface Receipt {
  id: string;        // `${earnedAt}-${rand4hex}` — the bank's newId() shape, sortable
  setId: string;     // the set the run was of
  wordId: string;    // word.word — what progress keys on
  rarity: Rarity;
  tries: number;     // attempts within the run, up to and including the earning one
  earnedAt: number;  // the finishing write's Date.now(); every receipt of a run shares it
  seed: number;      // the run's deal() seed — the one already logged to console
  box: { w: number; h: number }; // the canvas in CSS px at the time of the grade
  strokes: number[][]; // per stroke, flat [x, y, t, x, y, t, …]
}
```

- `x`, `y` in CSS px of `box`, rounded to 0.1. `t` is whole ms from the first point of the whole
  attempt, so pauses between strokes survive. A tap is a stroke of one point (the canvas already
  draws it as a dot).
- Budget, for the record: a five-kana word is roughly 600 points, under 10 KB as JSON; a 21-word
  run under 200 KB; a hundred runs a few MB. IndexedDB, never the blob. No pruning is built and
  no size is shown anywhere — the S5 footer counts photos and keeps counting only photos.
- `seed` and `earnedAt` are the run's identity: every receipt of one run shares both. Nothing
  reads them in this build; they are cheap now and impossible to recover later.

### 3.2 The store — `lib/receipts.ts`

- IndexedDB `kanahero-receipts`, version 1, object store `receipts` keyed on `id`, one index on
  `[setId, wordId]`. **Its own database**, not a second store in `kanahero-bank`: the bank's
  version and its e2e never move for a receipt change, and a blocked or broken receipts DB
  cannot take a photo down with it (the bank's own principle, one level up).
- Lift `openDB` and `tx` out of `lib/bank.ts` into `lib/idb.ts`, parameterised by database name,
  version, store, and an `onupgradeneeded` callback. `bank.ts` keeps its behaviour to the letter
  — the rejected-promise-is-not-cached rule and resolve-on-transaction-complete included. This is
  the only change to `bank.ts` besides §6.
- Store shape mirrors `bank.ts`: `subscribeReceipts` / `getReceipts` / `getServerReceipts`, async
  load, `ready: false` first snapshot. State is `{ ready, byWord: Map<`${setId}/${wordId}`,
  Receipt[]> }`, each list newest first.
- **`keepRun(receipts: Receipt[]): Promise<boolean>`** — the only write. One transaction, all or
  nothing; resolves `false` on failure and never throws. Called from `Round.tsx` immediately after
  `earnRun`, and nowhere else.
- `receiptsFor(setId, wordId, rarity): Receipt[]` — newest first — for S6d's stack.
- `receiptCount(setId): number` — for the Joker (§7).
- `allReceipts(): Promise<Receipt[]>` — for the export, in `earnedAt` order.

## 4. The canvas gives up its ink

- **`lib/ink.ts`** — pure, no DOM. Move `INK`, `W_MAX`, `W_MIN`, `SPEED_FULL_THIN`, `SMOOTH`,
  `segmentWidth` and the body of `redraw`'s per-stroke loop here as
  `drawInk(ctx, strokes: number[][], scale: number)`. `WritingCanvas` calls it with `scale = 1`
  over its own point arrays (converted to the flat shape once, at draw time or at rest — the
  choice is the builder's, but there is one drawing routine in the app afterwards, not two).
- **`WritingCanvasHandle.snapshot(): { box: { w: number; h: number }; strokes: number[][] } | null`**
  — a deep copy of the current ink in §3.1's shape, `null` if there is none. Quantisation (§3.1)
  happens here, once.
- `Round.tsx`: `RoundCard` gains `ink?: InkSnapshot`. `gotIt` takes the snapshot before
  `nextPrompt` clears the canvas. `Round` gains a `seed` prop — `app/page.tsx` already has it in
  hand where it calls `deal`. At the finish, after `earnRun`, build one `Receipt` per card of the
  hand with one shared `earnedAt` and call `keepRun`. `onFinish` is called regardless of the
  result — §2.5.

## 5. Screens

**Where an earned face is viewed.** Two places, and only two: S8's tap-to-view and S6d's
tap-to-view. Both are the same `cardOverlay` with a `size="earn"` card in it. This build makes
that overlay one component, `CardView`, and everything below is its behaviour. The small faces
(S8's hand, S6d's shelf) are tap targets and do not change. There is no separate receipt screen.

### 5.1 The overlay
- **Tap outside closes; a tap on the card does nothing.** Close fires only when the event target
  is the backdrop itself. Today any tap closes; that ends.
- The card is a button (it already is when given `onClick`). Under it, a legend in the `legend`
  style: `HOLD · YOUR INK`. Shown always in this build; drop it once someone has been watched
  finding the hold unaided. Under reduced motion it is the only signal (§5.4), so it never goes
  there.
- Under the legend, the pager (§5.3), when there is more than one card.

### 5.2 The hold
- `pointerdown` on the card starts a 150 ms timer. `pointerup`, `pointercancel` or leaving before
  it fires: nothing — a tap on the card is inert. When it fires, the card takes pointer capture
  and turns into its receipt in place; release restores the face at once. No toggle state to get
  stuck in.
- **The held face.** The chip stays. The mid and the foot's meaning go; the body under the chip
  becomes bone paper carrying the ink through `drawInk` at
  `scale = min(innerWidth / box.w, bodyHeight / box.h)`, letterboxed, never cropped, with the
  model word over it through `WordReveal animate={false}` laid out inside the **drawn box**
  (`box.w × scale` wide), cells at `box.w × scale / N` — not the card's inner width, or a
  receipt letterboxed by height would put the model where the ink is not. The canvas's own
  dashed centre guides come with it, at the same place in the box: the ink was written against
  them. S7b's layout at half scale (the card's inner width is 182 px against a canvas of roughly
  358; the canvas height is viewport-derived, so the scale is not a constant). **Not S7b's opacities:** the flip
  fades the ink to 0.3 under a full model because the model is the thing to compare against; here
  the ink is the subject, so the ink is full and the model sits over it faint (~0.55, tune by
  eye). §2.6 is about the line — colour, width, caps — not the layer. The foot's kind line reads
  `ATTEMPT n` from the receipt's tries: the round's own words for it. The face says when (§5.3),
  the ink says how.
- **The hold plays the ink.** The strokes draw in their recorded time from `t`, sped up so the
  whole attempt fits 2 s at most; held past the end, it rests finished. Reduced motion: finished
  at once. This is the one thing points can do that a PNG cannot, and it is the whole reason §3
  stores points.
- Suppress the phone's own long press while the overlay is up: `-webkit-touch-callout: none`,
  `user-select: none`, `contextmenu` prevented on the card. `touch-action: pan-x` — not `none` —
  so the swipe in §5.3 stays native: a finger that moves gets the browser's pan and the browser's
  `pointercancel` kills the hold timer; a finger that stays still gets the hold.
- Keyboard and switch users cannot hold: Enter / Space on the card toggles the receipt, and the
  toggle is what e2e drives.
- A card with no receipt has no hold: nothing on `pointerdown`, and the legend's text goes but
  its row stays, blank, so the pager under it does not jump when the track lands on that card.

### 5.3 The stack — S6d only
A shelf slot opens every copy of that stock, one card each, newest first.
- The cards sit on a horizontal scroll-snap track, one card per snap, centred, the native swipe
  with momentum and snapping for free. **The neighbours peek** — about 52 px of the next and
  previous card at each edge, 36 px gap — and that peek is the swipe affordance, so the arrows
  can stay quiet. `‹ 1 / 3 ›` under the legend in the `detailPosition` style; the arrows step
  (44 px targets, dimmed at the ends), the number is not tappable. Hidden when there is one card,
  and a lone card sits centred with nothing peeking.
- One card per receipt, newest first — you open the shelf after a run to see the card you just
  earned, so `1` is the newest, the bank's own rule. Then, if the stock's copy count exceeds its
  receipt count, **one legacy card** last: the current shelf face with `SHINY · ×k`, where `k` is
  the copies with no receipt, no hold, no date. After the v4 wipe (§2.4) that is only a copy
  whose write failed (§2.5), so in practice the stack is receipts all the way down.
- Swiping is scoped to the stock tapped. Three slots stay three overlays.
- **The chip on a receipted card reads `<STOCK> · <date>`** — `SHINY · 9-18-26`: month, day,
  two-digit year, local time, no leading zero on the month or the day (the day is assumed from
  the month rule; say so in the report if that is wrong). The copy count leaves the chip: with one
  card per copy there is nothing for `×4` to count. This is the second date format in the app
  (the bank stamps `2026-09-14 21:47`); it is a decision, not an accident. Two runs on one day
  make two cards with one date, told apart by their ink and tries.
- `Card.tsx`: the `copies` chip stays for the legacy card. Generalise it to one chip-suffix prop
  that the date and the `×k` both go through — one prop, not two.

### 5.4 The opening — the ink first
On open, the first card mounts as its held face with the ink already finished, holds ~500 ms,
then crossfades to the printed face over ~300 ms: the ink drying into print. It says "this card
came from your hand" without a word, and it is how the hold is taught. Once per open, on the first
card only — a card swiped into view shows its printed face; by the third copy the flash would be
old. The legend is visible through it. Reduced motion: no flash, the printed face at once. A card
with no receipt opens printed.

### 5.5 S8
The same `CardView`, one card, from `open.ink` in run state — no storage read, and it works even
if `keepRun` failed. Chip unchanged (`SHINY · 1st TRY`; the tries are already on it), no date, no
pager. The hold and the opening flash as in §5.2 and §5.4. The overlay opens only after the reveal
is done, as today, so the flash never runs over the turn.

**S6d Collection** — the overlay is `CardView` with the stack. Rows, slots, counts, empty state:
unchanged.

**S7 / S7b** — nothing. No copy, no tag, no line mentions the receipt during a run (§2.3).

## 6. Export

- `exportBank()` adds `receipts.json`: `{ format: "kanahero-receipts", version: 1, exportedAt,
  receipts: Receipt[] }`, strokes inline, in `earnedAt` order. `manifest.json` bumps to version 2
  and gains `receipts: n`.
- `"empty"` now means **no captures and no receipts**. A user with cards and no photos can export
  for the first time; the bank screen's empty state copy for that button, if it names photos,
  says `NOTHING TO EXPORT` instead.
- Still no reader. The ZIP is the format the later restore reads, and now it is a whole backup:
  photos, counts, receipts.

## 7. Joker

No new screen key. The wipe (§2.4) is said where wipes are said: one more once-line in
`home.wiped`, eligible on `wiped`, needing `feature.receipts`, so a browser that spent the v3
line still hears this one. Wording belongs to the corpus (`joker/corpus.md`, under
`joker-character.md`'s laws — information first, under twelve words):

| key | line |
| :-- | :-- |
| `home.wiped.02` | Cards keep their ink now. The old ones are gone. |

No `{receipts}` token, no line in the card overlay, no line on S8 about the ink, and nothing on
S6d — after the wipe there is no shelf that predates receipts.

## 8. The seam this leaves for later

`paid-tier-prep.md` §Seams. A receipt is already the row the online tier's progress sync would
carry — it names its set and word, has a stable sortable id, a rarity, tries, and a timestamp
(BUILD-MAP-v5 §1's `progress` table is this record minus the ink). When sync exists it imports
receipts; nothing here needs migrating. Until then the record is private to the device, and the
handwriting in it leaves the phone only in the user's own export.

## 9. Verification

- `npm run lint`, `npm run build` clean; `npm run joker` reports the new pool with no new
  silenced lines.
- `e2e-loop.mjs` (reduced motion, as v5a §9.6 left it), new steps:
  1. finish a kana run with one word missed once → `kanahero-receipts` holds `n` records, one per
     word, `tries` 2 on the missed word, every `strokes` non-empty, one shared `earnedAt`.
  2. S6d → tap the base-stock card of the missed word → one card, no pager, chip
     `BASE · <today m-d-yy>`, legend present; Enter on the card → the foot reads `ATTEMPT 2`, the
     body has `N` reveal cells and a drawn canvas; Enter again → the printed face.
  3. replay the set → that stock shows `1 / 2`; `›` → `2 / 2`; a tap on the backdrop closes, a
     tap on the card does not.
  4. start a run, earn one card, `✕` → `LEAVE RUN` → receipt count unchanged. Same for a reload.
  5. a v3 blob with copies → wiped on load: S1 says a `home.wiped.*` line once, the characters
     stay, the shelf is empty, and the receipts store is empty too. A v4 blob with copies and an
     empty receipts store (a failed write) → any slot opens one legacy card with `×k` on the
     chip, no legend, no pager, Enter does nothing, and his S6d line is the ordinary one.
  6. S8 after a run: tap a card → the overlay holds the face with its tries chip; Enter → ink.
  7. export → the ZIP has `receipts.json` with `n` entries and a manifest at version 2; with no
     captures and receipts present, export is not `"empty"`.
- `e2e-offline.mjs`: steps 1, 2 and 6 with no network.
- `e2e-bank.mjs`: unchanged and passing — that is the check that lifting `idb.ts` broke nothing.
- One run **with motion on**: open a card on S8 and assert the ink face is on screen inside the
  first 400 ms and the printed face after 1 s (the opening flash, §5.4).
- Report: commits, and 390px screenshots of the S6d overlay printed, held mid-play, with the pager
  at `2 / 3`, the legacy card, and the S8 overlay held.

## 10. Build order

1 `lib/ink.ts` + `snapshot()` (§4) → 2 `lib/idb.ts` lifted, `e2e-bank` green → 3
`lib/receipts.ts` + `keepRun` from the round (§3, §4) → 4 `CardView` on S8: backdrop close, the
hold, the held face, the opening flash (§5.1, 5.2, 5.4, 5.5) → 5 the stack on S6d: swipe, pager,
date chip, legacy card (§5.3) → 6 the played hold (§5.2) → 7 export (§6) → 8 Joker key + pool
(§7) → 9 e2e + report. Commit per step; step 4 before step 5 so the held face is proven on run
state before it reads storage.

## 11. As built (2026-09-25) — the decisions the build forced

Built on the working tree with the v5d sound work still uncommitted in it, so nothing here is
committed; the diff is the record. Everything above stands; this is what the tree does where the
spec left a choice.

- **Guides, not cell dividers.** The held face carries the board's own dashed centre cross,
  scaled with the ink, and no cell lines — the ink was written against the cross. The mock's
  divider between 出 and 口 was the two-character case coinciding with the centre.
- **Model at 0.55 over full ink**, as `--stroke` on `.receiptBox .wordReveal`; the flip is
  untouched. The bone body has no border on any stock — checked on worn and base at 390 px, it
  reads on both, so the two artboards the mock lacked were not needed.
- **The ink is the canvas's own weight**, 3.5–9 px scaled by the fit, so at the card it is
  roughly 2–4.5 px and heavier than the mock drew it. Nothing was tuned against the mock.
- **`lib/ink.ts` owns the drawing**; `WritingCanvas` keeps flat strokes and draws through it.
  `snapshot()` quantises: 0.1 px, whole ms from the first point of the attempt.
- **`lib/idb.ts`** is the lifted open/tx pair; `bank.ts` is otherwise untouched but for §6.
- **The held face is mounted only while wanted** (held, or the opening flash), so a stack of
  copies fetches stroke SVGs for one card at a time.
- **The chip is one prop, `chip`**, a suffix after the stock: the date, `×k`, or absent for
  the tries. `copies` is gone.
- **Hold is `pointerdown` + 150 ms**, pointer capture on landing, `touch-action: pan-x` so the
  track's native swipe cancels it; Enter/Space toggle for keyboards and for e2e.
- **The opening flash is lazy initial state**, not an effect (React's set-state-in-effect rule),
  and skipped under reduced motion.
- **The v4 wipe (same day, creator's call):** `VERSION = 4` in `lib/progress.ts`, the same
  `stale` path v3 used, plus `clearReceipts()`. The `collection.unreceipted` pool built earlier
  that day was removed with it — nothing can predate receipts any more — and `home.wiped.02`
  took its place, `needs:feature.receipts` (`joker/facts.json`).
- **Verification as measured:** lint, build, `e2e-bank`, `e2e-joker`, `e2e-offline` clean;
  `e2e-loop` passes every §9 step and fails only 10.8, which predates this build — the word
  `foil` in a comment in `scripts/build-sfx.mjs` (v5d). With that check skipped the rest of the
  loop, the Joker bag steps included, passes.
