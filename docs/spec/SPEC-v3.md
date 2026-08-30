# kanahero — build brief v3

A Next.js PWA that does two things. It drills **writing characters from memory** — hiragana or katakana, one script per session: romaji prompt on top, blank canvas below, you write it by hand, flip the card, the real stroke order animates over your attempt, you grade yourself. And, new in v3, it holds a **capture bank** — photos of characters met in the wild that you cannot read yet, taken offline, kept until they can be turned into drillable cards later.

No backend, no accounts, no runtime network for anything the app does today. Static export, everything vendored at build time. (The precise offline law, including the one future exception, is scoped in [The offline law](#the-offline-law-scoped).)

**The numbers.** Each track's earned count — how many of its characters you have ever written correctly from memory — plus, new, the **bank count**: how many captures are waiting. The earned counts are closed fractions (`46/71`). The bank count is a bare integer with no denominator, and that is semantic: it is the only unbounded number in the app, it grows in the field, and it shrinks only when captures are deleted or (later, outside this build) converted.

> v2 of this brief is `docs/spec/SPEC.md` at the v2 commit; v1 is in git history before that. v3 supersedes v2. The v2 visual system ("THE LOG") and all session mechanics carry forward unchanged.

---

## What v3 changed

v2 was a visual system pass. **v3 is a capability pass** — two additions, zero changes to the writing loop:

| | v2 | v3 |
|---|---|---|
| **Home (S1)** | Three-track switchboard + START SESSION | Same, plus a **BANK strip** — camera glyph, `BANK`, and the live count. A strip, not a track card: no progress bar, no denominator, must not read as a fourth track |
| **Screens** | S1, S1b (designed only), S2, S3, S4 | Adds **S5 Bank** (grid + capture + export) and **S5b Capture detail** (full-size, note, delete) |
| **Storage** | `localStorage` (`kanahero:v1`) only | Same blob, byte-for-byte untouched, plus **IndexedDB** (`kanahero-bank`) for capture images |
| **Offline** | Service worker specified but not built — the largest known gap | **Service worker built.** Precache-everything, cache-first, generated from the export at build time |
| **Network** | "No network calls" as a flat law | The law scoped: drills offline always · capture offline always · future conversion may touch network once, at conversion time |

**Why now.** A trip (Osaka → Nagano → Osaka) happens against this app. The bank fills on that trip — underground, in shops, on a night bus, exactly where a network call fails and exactly where the browser may have evicted its HTTP cache. Both v3 additions are trip-blocking: without the bank there is nothing to capture into, and without the service worker the shell that holds the capture button may not boot at all.

**What v3 deliberately does not include: conversion.** Captures do not become drillable cards in this build. No OCR, no recognition, no character identification of any kind. Turning photos into cards is a later build, by hand, and the method (on-device Live Text assist vs. manual lookup) is decided when that build is spec'd — not here. See [The capture bank is not the kanji track](#the-capture-bank-is-not-the-kanji-track).

---

## The offline law, scoped

v1/v2 said "no network calls" flatly. The law's actual origin was always about the *moment of use in the field*: an app that needs signal is useless underground, in a shop, mid-conversation. v3 writes the scoping down so it cannot be relitigated:

1. **Drilling is fully offline, always.** The plane rule. Cards, stroke SVGs, fonts — vendored at build, precached on install, never fetched at runtime.
2. **Capture is fully offline, always.** The field is where the bank fills. Camera, downscale, IndexedDB write, count update, export — all of it works in airplane mode. Non-negotiable.
3. **Conversion (future build, not v3) may touch the network once, at conversion time** — e.g. fetching a character's stroke SVG when a capture becomes a card. That happens seated, on wifi, by choice. Anything fetched is then stored, so *drilling the converted card* is back under rule 1.
4. **$0 runtime, unchanged.** No metered API is called by the shipped app, ever. This survives all three rules above.

---

## The capture bank

### What it is

A holding pen. One button on Home opens it; one button inside opens the native camera; the photo lands in the bank with a timestamp and an optional one-line note. That is the whole feature.

**The photo is never the card.** When a capture eventually becomes drillable (later build), the card is the *character as text* plus stroke data — same as every kana card today. The photo's only job is to answer, later: *which character could I not read, and where was I?* It is a shopping list, not card artwork. This is why there is no crop, no editing, and no recognition: the photo needs to be legible to a human at a hotel table, nothing more.

### The capture bank is not the kanji track

The v2 handoff designs a kanji track (S1b presets, meaning prompts, KanjiVG). That remains **designed, not built**, on exactly its v2 terms. The bank *feeds* it: when conversion happens, the trip's captures become authored cards, and the natural landing place is a preset in S1b's existing model — a closed set whose denominator is the real bank size. Nothing in the handoff needs redrawing for the bank, and nothing in the bank presumes the track. Two features, one seam, crossed in a later build.

### Screens

| # | Screen | Contains (top → bottom) | Actions |
|---|---|---|---|
| **S1** (delta) | **Home** | Unchanged, plus the **BANK strip** between the track cards and the note line: camera glyph · `BANK` label · live count, mono, strike-colored. Whole strip is the tap target | Tap → S5 |
| **S5** | **Bank** | `← BACK` · `BANK` + count · **thumbnail grid** — square, 3-across, seam-framed, newest first, top-left · empty state when count is 0: one mono line, `SNAP WHAT YOU CAN'T READ` · **`CAPTURE`** (primary, strike, chamfered) · `EXPORT` (secondary, seam) · storage status footer, mono: `STORAGE: PERSISTENT · 23 ITEMS · 9.2 MB` (or `BEST-EFFORT — EXPORT OFTEN`) | `Capture` → native camera → save → grid updates, count ticks · `Export` → share/download one file · tap thumb → S5b · `Back` → S1 |
| **S5b** | **Capture detail** | `← BANK` · the photo, full-width on chassis, pinch-zoomable via native image behavior · metadata block, mono: `#023 · 2026-09-XX 21:47` · note — one line, tap to add/edit · **`DELETE`** (caution-bordered, never strike) | `Delete` → confirm → gone, permanently · `Back` → S5 |

No new nav. One button in, one button back — the bank is a cul-de-sac off Home, and no session screen can reach it.

### The capture flow (field conditions are the spec)

The user is on an escalator, at a bus window, holding a shopping basket. The loop must be: **open app → tap BANK → tap CAPTURE → native camera → shutter → done.** Two in-app taps to the camera, zero after the shutter.

1. `CAPTURE` is `<input type="file" accept="image/*" capture="environment">` behind a styled button. Native camera, works offline, no permission dance, no getUserMedia.
2. On the input's `change`: decode with `createImageBitmap(file, { imageOrientation: "from-image" })` — this bakes EXIF rotation in, which phone cameras always set and canvas otherwise ignores.
3. Downscale on canvas: **long edge capped at 1600px**, `toBlob("image/jpeg", 0.82)`. At phone-camera framing that keeps sign text comfortably human-readable (~250–500 KB per capture; 100 captures ≈ 30–50 MB). If legibility is ever in doubt, raise the cap — legibility beats bytes, because a capture you can't read later is a lost capture.
4. Write to IndexedDB, prepend the grid, tick the count. **Save immediately — no confirm step.** Framing happens in the native camera (pinch-zoom there is the crop); a confirm screen is a place to lose a capture to a closing train door.
5. The **note is added later, in S5b**, not at capture time. Typing in the field is friction; the timestamp alone recovers most context, and the note is for the hotel table.

Failure path: if the IndexedDB write throws (quota), say so bluntly in one line and point at EXPORT. Never fail silently — a capture that silently didn't save is worse than one that visibly didn't.

### Storage shape

Photos do **not** go in `kanahero:v1`. That blob is the number; it stays small, stays `localStorage`, and `lib/progress.ts` does not change in this build. Blobs would blow the quota and put the number and the photos in one failure domain.

- **Database:** `kanahero-bank`, version 1. One object store, `captures`, `keyPath: "id"`, index `takenAt`.
- **Record:** `{ id: string, blob: Blob, w: number, h: number, bytes: number, takenAt: number, note: string }` — `id` is `` `${Date.now()}-${rand4}` `` (sortable, collision-safe), `blob` is the downscaled JPEG, `note` defaults to `""`.
- **One blob per capture.** Thumbnails render from the same blob via object URLs (revoked on unmount). A separate thumb blob is an optimization to add only if a 50-item grid measurably janks — not before.
- **`navigator.storage.persist()`** is requested on the first successful capture. The result is surfaced honestly in the S5 footer (`PERSISTENT` / `BEST-EFFORT`) and never blocks anything. Persistence is a request, not a guarantee — which is why export exists.
- New module: `lib/bank.ts`. It owns the DB, the downscale, and the count subscription, mirroring the `progress.ts` store pattern so S1 can subscribe to the count the same way it subscribes to earned counts.

### Export — the feature to fight for

Everything the trip produces lives in one browser's site data, subject to an eviction policy nobody controls. If that data goes mid-trip, the whole shoot goes with it, and there is no second attempt. Export is the insurance, so it is a first-class button on S5, not a settings item.

- **Format: one ZIP file, STORE mode (no compression — the JPEGs are already compressed).** Contents:
  - `captures/<id>.jpg` — every image, filename = record id
  - `manifest.json` — `{ format: "kanahero-bank", version: 1, exportedAt, captures: [{ id, file, takenAt, note, w, h, bytes }] }`
- **Filename:** `kanahero-bank-YYYYMMDD-HHMM.zip`.
- **Implementation:** a hand-rolled STORE-mode ZIP writer (`lib/zip.ts`, ~120 lines: local headers, central directory, CRC-32 table, UTF-8 name flag). No dependency, nothing clever. If the hand-roll fights back, vendoring `fflate` (MIT, build-time, $0 runtime) is the sanctioned fallback — but STORE mode is simple enough that it shouldn't.
- **Delivery:** `navigator.share({ files: [zip] })` when `navigator.canShare` allows it — on iOS that is AirDrop, Files, and messaging in one move, which is exactly "off the phone." Fallback: object-URL anchor download.
- **Export never mutates the bank.** It is a copy, repeatable, idempotent. Export early, export often; the ZIP is also, conveniently, the input format the later conversion build will read.
- Why ZIP over one big JSON with base64: the export must be usable by a human doing hand-conversion — openable photos in a folder — and base64 inflates a trip's bank by a third for no benefit.

### Delete

Only in S5b, behind one confirm, permanent. No multi-select, no "clear bank" — bulk destruction of the trip's irreplaceable data is not a button this app offers.

---

## The service worker

v2's largest known gap, now in scope. Without it, "offline" is HTTP-cache luck, and the plane guarantee — plus every field capture — rides on that luck.

- **Generated, not authored per-route:** `scripts/gen-sw.mjs` runs after `next build`, walks `out/`, and emits `out/sw.js` containing the full precache list and a **content-hash cache name** (`kanahero-<hash>`). The export is small — shell + 142 SVGs + three fonts, a few MB — so precache-everything is correct and no route-level cleverness is needed.
- **Strategy:** `install` → `cache.addAll(everything)` + `skipWaiting`. `activate` → delete caches with other names + `clients.claim`. `fetch` → cache-first (`ignoreSearch: true`), network fallback; navigations fall back to the cached shell.
- **Updates:** when online, the browser refetches `sw.js`; a changed hash installs the new cache and cleans the old on activate. Offline, the current cache serves forever. No update UI — the app quietly becomes current on the next online launch.
- **Registration:** a tiny client-side effect in the root layout, production-only, `if ("serviceWorker" in navigator)`.
- **Scope boundary:** the SW precaches the built app only. It never touches IndexedDB, never caches captures, no background sync, no push. Bank data and app shell stay in separate storage domains on purpose.

---

## Verification — the pre-trip checklist

Automated, in `scripts/` (extend `e2e-loop.mjs` or add `e2e-offline.mjs` beside it):

1. Serve `out/`, load, wait for the SW to control the page → `context.setOffline(true)` → reload → Home renders, a session starts, a stroke SVG animates. (The plane test, headless.)
2. Still offline: `setInputFiles` a fixture JPEG into the capture input → count ticks, grid shows it, IndexedDB holds one record with correct fields → reload → still there.
3. Export → intercept the download → unzip → manifest validates, image byte-identical to the stored blob.
4. Delete → confirm → record gone, count decremented.
5. The existing e2e suite still passes untouched — the writing loop must not know the bank exists.

Manual, **on the actual phone, before the bus is booked** — this is the RUNTIME truth row, and it is filmable:

1. Install to home screen → airplane mode → force-quit → cold launch → Home renders.
2. Still in airplane mode: drill one card (animation plays), capture one photo (count ticks).
3. Force-quit, relaunch offline → capture still there.
4. Export → ZIP lands off the phone (AirDrop/Files) → opens on the laptop, photo readable.

---

## Deliberately not building (bank scope)

- **OCR / recognition / character identification, in any form.** Not a cut corner — the honest version. Hand-converting the bank is a later build's real, on-camera work, and skipping it here would hollow that build out. Also keeps rules 1–4 of the offline law trivially true.
- **Crop, rotate, edit.** The native camera's zoom is the framing tool, at capture time, where framing belongs. The photo is a shopping list, not card art; a crop UI is field-friction solving a problem the pipeline doesn't have.
- **Tags, folders, search, sort options.** Newest-first is the only order a trip needs. Organization happens at conversion, by a human, later.
- **Auto-location / geotagging.** A permission dance to duplicate what the note and timestamp already do. "Where I was" is one typed line.
- **Cloud sync, backup services.** Export is the backup, and it's the user's hand doing it — which is the only backup story that works offline and costs $0.
- **Drilling from the bank.** No path from a capture to the writing loop exists in this build. The bank is a cul-de-sac by design; the seam to the kanji track is a later build's whole subject.
- **A capture-time confirm/annotate screen.** Save-immediately is the spec. Anything between shutter and saved is a place to lose a capture.
- **Multi-select / clear-all delete.**

Everything on v2's deliberately-not-building list stands untouched: no recognition-grading, no hints, no skip, no nav bar, no settings, no accounts, no streaks, no percentages, no mixed decks, no session length settings.

---

## Carried forward from v2, unchanged

Binding as written in v2 (`docs/spec/SPEC.md` at the v2 commit); summarized here so v3 is self-contained:

- **Screens S1–S4 and the writing loop:** switchboard Home, prompt → write → Show → reveal-over-ink → self-grade → requeue (~5 later) → complete. Screens 2/3 flip in place; the 334×334 canvas holds the same box across the flip — still the one load-bearing geometric constraint.
- **The minting rule:** first-attempt `Got it` only; cumulative; never decays; a fumbled character earns only in a later session.
- **The 71, twice; katakana derived by `+0x60`;** Hepburn romaji.
- **THE LOG visual system:** tokens, Archivo/JetBrains Mono/Klee One, the chamfer grammar, nothing rounded. The bank screens are chrome screens: ghost glyph, no stripe rail (rail is session-only). Details in the v3 design brief, `docs/design/v3-capture-design-brief.md`.
- **Stroke data:** strokesvg primary, concurrent group-animation guard, KanjiVG as kana fallback and future kanji source, with its CC BY-SA obligations.
- **Kanji track: designed, not built** — S1b, `lib/decks.ts`, presets, authored table. Untouched by v3 except that the bank now exists as its future feeder.

### Known gaps (v3 restated)

1. ~~No service worker~~ — **in scope this build**, above.
2. **Attribution incomplete.** `public/licenses/` still lacks the OFL 1.1 text and Klee One copyright notice. Small, obliged, still owed — fair game to fold into this build since the SW work touches the export pipeline anyway.
3. **Metadata stale.** Layout/manifest still say "Write hiragana from memory." Same: small, fold in.

### Open questions

v2's seven stand, unresolved by v3 — flagging especially **#1 (Replay missed reopens the minting rule)**, which is still live and not absorbed by anything here. Bank-specific:

8. **Bank strip position on S1.** Between track cards and note line is drawn in the design brief; below the note line is the alternative if the switchboard needs the breathing room. Decide on the canvas, not in code.
9. **Grid density.** 3-across is spec'd (thumbs stay readable); 4-across if a long trip makes scrolling tedious. Cheap to change.
10. **1600px / 0.82.** Confirm on real signage photos from the actual phone before the trip — one evening's test. If station-board text isn't comfortably readable at 1600px, raise the cap and re-run the size math.
