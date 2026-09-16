# Paid tier — prepared, not launched

**Status (2026-09-16): architecture only. No paywall ships, no tier is named in the UI, no video mentions it.** The channel's funnel law holds: a paid layer opens only when the audience asks for it (trigger tracked in the channel's `results.md`; count is 0). This file exists so that when it opens, nothing has to be rebuilt.

## The line that must stay true
The free tier is the whole thing every video promises: drilling, all platform sets, the card loop, bank capture, export. Fully offline, no account, $0. Nothing the free tier has today is ever moved behind the paid line.

## Two modes, one app
- **Offline** — everything above. Works with no network and no account, forever. This is the product the channel gives away.
- **Online** — depth that needs a server: bank conversion (captures → cards), set creation and sync, Joker insights, cross-device progress. Requires an account. This is the only place a paid tier can live.

## Seams to build now (cheap while the code is small)
1. **Identity is optional.** Local progress (`kanahero:v1`, the bank IndexedDB) stays the source of truth; an account, when present, syncs it. Never require sign-in to reach anything offline.
2. **Sets have an origin.** `{origin: "platform" | "user"}` on every set. Platform sets ship as JSON in the bundle; user sets are created online and cached locally so they drill offline once made.
3. **Entitlement is a single flag** read in one place (`lib/tier.ts`), defaulting to free. No feature checks the flag directly; they ask the module. Today the module returns `free` unconditionally.
4. **Stroke data is never entitled.** strokesvg (MIT; kana derived from Klee One, SIL OFL 1.1) and KanjiVG (CC BY-SA 3.0) assets stay in the free bundle. OFL forbids selling the font data on its own; BY-SA forbids technical measures over the licensed data. Paid sells services, never strokes.
5. **Copy guard.** No "upgrade", "pro", "premium", lock icons, or greyed features anywhere in the UI until launch. Absent features are absent, not teased.

## Launch conditions (all three)
- Trigger fired: repeated unprompted asks for deeper access, logged in `results.md`.
- The README's "no account" line already rewritten to describe the free tier only.
- A licensing pass on the OFL derived-asset question (one hour with a lawyer).
