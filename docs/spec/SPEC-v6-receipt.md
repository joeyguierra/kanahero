# kanahero — build spec v6 · the receipt

**Status: READY TO BUILD, after v5d (2026-09-18).** `SPEC-v5d-sound.md` ships first; this file is
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
screen, and the first data the app keeps that is not a number or a photo. It is the seam the
online tier will one day sync across (§8), which is exactly the kind of thing a version boundary
should sit on. So: v6, and its own store, so a later version can move it without touching the
counts.

## 1. Scope

**In this build**
1. The receipt: the ink graded `GOT IT`, kept with the copy it earned (§2).
2. A receipts store in IndexedDB, separate from the bank and from `kanahero:v1` (§3).
3. `WritingCanvas` gives up its ink; the drawing code becomes a pure module so a receipt renders
   exactly as the canvas drew it (§4).
4. S6e Receipt — a new screen off the collection: the face, the ink, the model over it (§5).
5. S8's tap-to-view shows the ink under the face, from run state (§5).
6. The export ZIP carries receipts (§6).
7. One Joker screen key (§7).

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
4. **Counts stay the source of truth.** `kanahero:v1` is not touched by this build — no version
   bump, no new key. A copy with no receipt is a full copy: every copy earned before v6, and any
   copy whose receipt failed to write. A receipt with no copy behind it is ignored by every
   screen and never deleted.
5. **The receipt write failing costs nothing the user can see on S8.** The reveal is not the
   place. The copy shows `NO RECEIPT` on S6e, which is the same thing a pre-v6 copy shows, and is
   true of both.
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
- `receiptsFor(setId, wordId, rarity): Receipt[]` — newest first — for S6e.
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

**S6d Collection** — one change: tapping a shelf card opens **S6e** instead of the overlay. Remove
the `cardOverlay` from `Collection.tsx`. Rows, slots, counts, empty state: unchanged.

**S6e Receipt — NEW.** A full screen, like the bank's S5b: the receipt is the subject and gets the
room. No Joker on it.
- Header: back `← COLLECTION` → S6d; right slot `RECEIPT n / m` in `detailPosition` style, where
  `m` is the receipts this stock of this word has. `m` is not the copy count — the chip below
  carries that.
- **The face**, `size="earn"`, centred. With a receipt on screen: `card={{ rarity, tries }}` from
  the receipt, so the chip reads `SHINY · 1st TRY` / `BASE · 2nd TRY` / `WORN · n TRIES` — the
  face `Card.tsx` already draws when it knows the tries. With no receipt (`m = 0`): the current
  shelf face, `copies` chip and all.
- **The ink panel**, below the face, full column width, `aspect-ratio: box.w / box.h` (capped so
  the face and the panel both fit a 390×844 screen without scrolling; letterbox inside the cap,
  never crop). Bone paper, the canvas's own dashed guides, tag `RECEIPT` top-left in the
  `canvasTag` style. Inside it, in this order:
  1. the receipt's ink, drawn at rest through `drawInk` with `scale = panelWidth / box.w`;
  2. the model word over it, exactly S7b: `WordReveal` with a new `animate={false}` prop that
     mounts every character finished (the reduced-motion path it already has, made a prop).
     Cells are `panelWidth / N`, so it lays over the ink where it lay on the day.
  A foot line under the panel: `EARNED 2026-09-18 21:47` in local time (the bank's `timestamp`
  format), then ` · ×k COPIES` where `k` is the copy count of that stock.
- **Replay.** A tap on the panel redraws the ink in its own time from `t` — the model stays put
  underneath. A second tap during replay snaps it finished. `prefers-reduced-motion`: no replay;
  the tap does nothing. This is the one thing points can do that a PNG cannot, and it is the whole
  reason §3 stores points.
- **Pager.** `‹` `›` in the header slot step through receipts, newest first. Wrap at the ends.
  Hidden when `m ≤ 1`.
- **No receipt** (`m = 0`): the panel is the empty bone paper with `NO RECEIPT` set in it, in the
  `shelfSlotStock` style; no replay, no pager, the foot line reads `×k COPIES` only. True for every
  copy earned before this build and for a copy whose write failed; the screen does not
  distinguish them because it cannot.
- Ink on S6e is `pointer-events: none` except the replay tap; the viewport lock is unchanged (only
  S5b unlocks it).

**S8 Result** — the tap-to-view overlay gains the ink panel from §5 under the face, static, drawn
from `open.ink` in run state — no storage read, and it works even if `keepRun` failed. No replay
(a tap anywhere closes the overlay, as today), no foot line, no pager. Cards with no ink (none in
practice — every `GOT IT` needs ink to have flipped) show the face alone.

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

One new screen key, `collection.unreceipted`, chosen by `Collection.tsx` when the shelf has at
least one copy and `receiptCount(set.id) === 0` — i.e. every card here predates v6. It is a pool,
not a once-line: it is true on every visit until the first receipted run, and then it is never
true again. Precedence and eligibility per v5b §4–5, unchanged. Add the key to `JokerScreen`; the
audit will demand a pool for it.

Wording belongs to the corpus (`docs/design/joker-corpus.md`, under `joker-character.md`'s laws —
information first, under twelve words). Interim, until the corpus owner replaces it:

| key | line |
| :-- | :-- |
| `collection.unreceipted` | These predate receipts. Your next run keeps its ink. |

No `{receipts}` token, no line on S6e, no line on S8 about the ink.

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
  2. S6d → tap the base-stock card of the missed word → S6e reads `RECEIPT 1 / 1`, the chip reads
     `BASE · 2nd TRY`, the panel has `N` reveal cells and a drawn canvas.
  3. replay the set → that word's S6e reads `RECEIPT 1 / 2`; `›` shows `2 / 2`; `‹` wraps back.
  4. start a run, earn one card, `✕` → `LEAVE RUN` → receipt count unchanged. Same for a reload.
  5. a v3 blob with copies and an empty receipts DB → S6d's line id is `collection.unreceipted.*`;
     S6e for any card reads `NO RECEIPT`, no pager.
  6. S8 after a run: tap a card → the overlay holds a face and a panel with ink.
  7. export → the ZIP has `receipts.json` with `n` entries and a manifest at version 2; with no
     captures and receipts present, export is not `"empty"`.
- `e2e-offline.mjs`: steps 1, 2 and 6 with no network.
- `e2e-bank.mjs`: unchanged and passing — that is the check that lifting `idb.ts` broke nothing.
- Report: commits, and 390px screenshots of S6e with a receipt, S6e with `NO RECEIPT`, S6e
  mid-replay, and the S8 overlay with ink.

## 10. Build order

1 `lib/ink.ts` + `snapshot()` (§4) → 2 `lib/idb.ts` lifted, `e2e-bank` green → 3
`lib/receipts.ts` + `keepRun` from the round (§3, §4) → 4 S8 overlay panel (§5) → 5 S6e + the
S6d tap (§5) → 6 replay → 7 export (§6) → 8 Joker key + pool (§7) → 9 e2e + report. Commit per
step; step 4 before step 5 so the panel component is proven on run state before it reads storage.
