# SPEC — fix: no pull-to-refresh during a drill (2026-11-25)

## Problem (measured)
Day 11 (2026-11-25, `results.md`): the page reloaded mid-drill. Cause, learner: a downward swipe
that overshoots the top of the page triggers the mobile browser's pull-to-refresh. It happens
naturally on the answer reveal: the learner traces the stroke animation with a finger, the browser
reads the trace as a scroll, and at the top of the page that is a refresh gesture.

Cost of one refresh: the open session wrote no session row (/time shows the day's drill as 5 min
instead of 12.9), the in-memory queue was lost (先生's in-session retry never came back), and a
new deal started.

No screen in Kana Hero needs pull-to-refresh: the app is offline-first and reloads nothing from it.

## Change
- `app/globals.css`: `overscroll-behavior-y: none` on `html` and `body`. Disables pull-to-refresh
  and the overscroll bounce in browsers that support it (Chrome Android, Safari 16+). Inner
  scrollers keep their own rules (`.bankGrid` stays `contain`). Drawing on `.ink` is unchanged
  (`touch-action: none` already).
- `scripts/e2e-loop.mjs` step 1b: asserts the computed value is `none` on both elements.

## Not in this fix (backlog)
A refresh can still happen another way (manual reload, tab discarded in the background, service
worker update). Losing the session row and the live queue on reload is its own bug:
`backlog.md` → "Page refresh mid-drill loses the session row and the requeue". Spec first.

## Gates
`npm run lint`, `npm run build`, `npm run e2e` on the Mac (the agent's shell is a Linux VM; the
installed `next` binaries are darwin builds, so it did not build here). No Joker copy touched:
`joker-audit` not needed.

## Falsified by (phone test, the real gate)
On the phone, in the browser tab used for drilling: open a word's reveal, swipe down hard from the
top of the screen while the strokes draw, three times. Pass = no reload, the reveal finishes.
Also: a normal drill day with the finger-tracing habit and no reload over the next week.

## Post-build audit
- **Shipped** in `e9efa93` (2026-11-25).
- **Regression, learner 2026-11-26:** the app is **harder to scroll** since this change — named on
  the /time dashboard, assumed on every screen that scrolls. Phone test for the refresh itself
  (swipe hard during a reveal, ×3): not yet reported. Phone + browser: to record.
- **Not diagnosed — agent cannot reproduce here** (no phone, no build in this shell). What the
  code says: the rule sits on `html` (the page's scroller: `html` has `overflow-x: hidden`, so the
  viewport scrolls) and on `body`. `none` turns off pull-to-refresh **and** the edge bounce / glow.
  Candidates, in order of least change:
  1. `contain` instead of `none` on `html` — still blocks pull-to-refresh in Chrome Android (it stops
     the scroll chain to the browser), keeps the native edge feel. Most likely fix if "harder" means
     the edge feels dead or sticky.
  2. Drop the rule from `body` (it is not the scroller; keep `html` only).
  3. Scope it to the drill only: set it on `html` while the loop is on screen (a class on `<html>`),
     leave every other screen as before. The refresh only mattered mid-drill.
  Pick by a phone A/B, not by guess: build 1, test /time scroll + the ×3 refresh swipe; if either
  fails, try 3. Update the e2e assertion to whatever value ships.
- **Diagnosed and built 2026-11-27 (learner asked).** Reproduced in emulated mobile Chrome
  (Chromium 159, touch swipe of 200 px on /time, viewport 390×500):

  | html | body | page scrolls |
  |---|---|---|
  | none | none (shipped `e9efa93`) | **no — 0 px** |
  | contain | none | **no — 0 px** |
  | none | *no rule* | yes — 162 px |
  | contain | *no rule* | yes — 162 px |
  | *no rule* | *no rule* (before the fix) | yes — 162 px |

  Cause: the rule on **`body`**, not the value on `html`. `body` has `overflow-x: hidden`, which
  makes it a scroll container that never scrolls; with `overscroll-behavior-y` set, a touch that
  starts on it is not handed on to the page. Candidate 1 alone (`contain` on `html`) would not
  have fixed it. Built candidate 2: rule removed from `body`, `html` stays `none` (unchanged from
  what shipped, so the pull-to-refresh fix is as it was). e2e step 1b now asserts `none` / `auto`.
  Gates on the Mac: lint, build, e2e all pass.
- **Not verified here:** pull-to-refresh itself (a browser gesture, not emulated), and Safari.
  The phone test above (×3 swipe during a reveal) is still the real gate, plus: /time scrolls
  as before. Phone + browser: to record.
- **Status: built, uncommitted, awaiting the phone test.**
