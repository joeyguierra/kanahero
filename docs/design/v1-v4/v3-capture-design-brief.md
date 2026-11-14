# kanahero v3 — capture bank design brief

Brief for extending `KanaHero v2 Handoff.dc.html` with the capture bank. Three artboards change or appear: **S1 (delta)**, **S5 Bank**, **S5b Capture detail**. Everything else on the canvas — S1b, S2a/b, S3a/b, S4 — is untouched; the bank never appears on a session screen.

Companion spec: `docs/spec/SPEC-v3.md`. Where this brief and the spec disagree, the spec wins on behavior, this brief wins on pixels.

---

## The one semantic rule

**The bank is not a fourth track.** Every track card is a closed fraction — `46/71`, a progress bar, an end state. The bank count has no denominator, no bar, and no finish line: it is the only unbounded number in the app, it grows in the field, and its growth is the point (it is also the climbing counter the video's outbound montage is built on).

Design consequences, binding:

- **Never a progress bar** on anything bank-related. A bar implies a denominator; the bank has none.
- **Never a track-card silhouette.** The bank entry on S1 is a *strip*, visually lighter than a track card, so the switchboard still reads as exactly three tracks.
- The count renders in **JetBrains Mono, strike-colored** — an instrument reading, not a score.

---

## S1 — Home (delta)

One addition: the **BANK strip**, placed between the track-card stack and the note line.

**Anatomy** (left → right, one row, full width):

- Camera glyph (line-icon, 1.5px stroke, `--rail` — drawn, not emoji)
- `BANK` — JetBrains Mono, 10px, letter-spacing .2em, `--rail`
- Right-aligned: the count — JetBrains Mono, 15–16px, `--strike`. At zero: `0`, in `--carbon`, no special empty styling on S1.
- Chevron or `→`, 9px mono, `--carbon`

**Treatment:** seam border (`--seam`), `--plate` fill, padding ~12px 18px — roughly half a track card's height. No chamfer (chamfers mark primary actions and cards; this is neither). Whole strip is the tap target → S5.

**Vertical budget:** three track cards + strip + note + START + attribution is tight in 844. Reclaim by dropping the note line to a single line (`MISSED CARDS REPLAY UNTIL ZERO.`) — the dakuten line can go; the toggle already says it. If still tight, the strip may sit below the note line instead (spec open question 8) — decide on the canvas.

**Ghost glyph:** S1 keeps あ. No second ghost.

---

## S5 — Bank

Chrome screen: ghost glyph yes, stripe rail no (rail is session-only).

**Ghost glyph:** `未` ("not yet") — the bank is characters not yet readable. Alternatives if it reads wrong at 290px: `謎`, or no glyph. Placement per S1's pattern: 1px outline `#1D1D21`, behind content, bleeding off the top-right.

**Layout (top → bottom):**

1. **Header row:** `← BACK` (mono, 11px, generous hit area, per S1b's pattern) · right side: `BANK` label + count — `BANK · 23` in mono 10px `--rail`, the number in `--strike`.
2. **Thumbnail grid:** 3-across, square cells, `aspect-ratio: 1`, 8–9px gap, newest first at top-left. Each thumb: the photo `object-fit: cover`, inside a 1px `--seam` frame, **square corners** — photos are the only imagery in an app of glyphs, and the seam frame + hard corners is what keeps them inside THE LOG instead of floating on top of it. No labels, no timestamps on thumbs — the grid is a contact sheet, not a list. Scrolls; header and action block stay put.
3. **Empty state** (count 0): centered in the grid area, one mono line, 10px, letter-spaced, `--rail`: `SNAP WHAT YOU CAN'T READ`. Nothing else — no illustration, no onboarding.
4. **Action block** (bottom third, thumb reach, fixed):
   - **`CAPTURE`** — the primary. Strike fill, black text, 20–22px Archivo 900, bottom-left chamfer — same species as START SESSION. This is the button the whole feature exists for; it takes the full width and the biggest target on the screen.
   - **`EXPORT`** — directly below, seam-bordered secondary (CLEAR/UNDO species), mono 11px. Always visible, never buried: it is the insurance policy, and insurance you have to hunt for doesn't get used. Disabled look at count 0.
5. **Storage footer** — one mono line, 8–9px, `--carbon`, centered, the attribution line's species: `STORAGE: PERSISTENT · 23 ITEMS · 9.2 MB` or `STORAGE: BEST-EFFORT — EXPORT OFTEN` (the warning variant in `--caution`). Honest instrument, not decoration.

**States to draw:** empty (0) · light (3–5) · heavy (30+, mid-scroll) · the `BEST-EFFORT` footer variant · a quota-failure line (one `--caution` mono line above the action block: `CAPTURE DID NOT SAVE — STORAGE FULL. EXPORT NOW.`).

**Not drawn:** the native camera (system UI), the share sheet (system UI). The artboard ends where the OS takes over.

---

## S5b — Capture detail

Chrome screen, no ghost glyph — the photo is the subject; nothing competes with it.

**Layout (top → bottom):**

1. `← BANK` header, mono, same species as S5's back control.
2. **The photo** — full-width on `--chassis`, natural aspect, 1px `--seam` frame, square corners. Centered vertically in the available space above the metadata block. Native pinch-zoom behavior; no custom zoom chrome.
3. **Metadata block** — `--plate` card, seam border, top-right notch (card species). Contents, mono:
   - `#023 · 2026-09-14 21:47` — 11px, `--print` (id ordinal + local timestamp)
   - Note row: the note in 13px Archivo if present; if absent, `+ ADD NOTE` in mono 10px `--rail`. Tap → inline text field, one line, no character counter. This is where "where I was" gets written — at the hotel, not on the escalator.
4. **`DELETE`** — bottom, full width, **`--caution` border and text on `--plate`** — the MISSED species, never strike (strike is for actions the app wants; deletion is an action it permits). One confirm state: first tap swaps the label to `DELETE — TAP AGAIN` with a tinted caution fill; any other touch resets. No system dialog.

**States to draw:** with note · without note · note editing · delete-confirm armed.

---

## Filmability notes (this UI gets shot)

The bank is on camera twice: screen-recorded and filmed over-shoulder on a phone in the field. Design for both:

- **The count is the star.** On S1 and S5 it must survive a handheld phone shot at arm's length: strike-on-dark, mono, ≥15px, surrounded by quiet. The montage beat is *shutter → grid gains a thumb → count ticks N → N+1*. If the tick can afford one frame of emphasis (a single strike flash on the digit, ≤200ms, no motion), it earns its place; anything springier is retention theater.
- **The capture loop is the shot.** Home → BANK → CAPTURE → shutter → grid. Every state in that chain should look composed at 390×844 with no popovers, toasts, or transient chrome that could be mid-animation in a frame grab.
- The LOG's existing chrome (mono labels, seam hairlines, the strike) reads beautifully in screen recordings — the bank should add zero new visual vocabulary. If a bank screen needs a component that doesn't already exist in the v2 handoff, the answer is probably a simpler layout, not a new component.

---

## Not to be drawn (scope guard)

No crop UI, no rotate, no edit affordances · no OCR/recognition affordances, no "identify" button, nothing that implies the app reads the photo · no tags, folders, filters, search, sort toggles · no multi-select, no clear-all · no drill entry from the bank, no path from S5/S5b into a session · no nav bar — one button in (S1 strip), one button back per screen · no new colors, no new fonts, no rounded anything.

---

## Open design questions

1. **Ghost glyph for S5:** `未` proposed; confirm it doesn't read as a real vocab prompt. Fallback: none.
2. **Strip position on S1:** above vs. below the note line (spec Q8). Resolve on the canvas with all three track cards populated.
3. **Grid density:** 3-across drawn; try 4 at the heavy-state artboard and see whether thumbs still read as signs rather than texture (spec Q9).
4. **Count tick emphasis:** in or out. Draw both a flat tick and the single-flash variant; pick on the canvas.
