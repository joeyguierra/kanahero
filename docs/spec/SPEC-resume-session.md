# SPEC — leave a drill and come back: time keeps counting, the queue picks up where it was

Status: **draft, not built — hold until the learner asks** (2026-11-26). Learner request after the
day-11 refresh. Until built: /time's drill column is wrong on any day with a reload (correct number
in `results.md` from item timestamps), and over-counts any drill left in the background. Replaces the
backlog item "Page refresh mid-drill loses the session row and the requeue".

## 1. What the app does today (read from the code, 2026-11-26)
The open drill lives only in React memory (`app/page.tsx` `Session`, `components/Loop.tsx` queue).
Every grade is saved at once (schedule → localStorage `kanahero:v7`; item row → ledger). The
session row (`startTs`→`endTs`, the only thing /time reads for the drill) is written only by
`closeSession`, i.e. on the last word or on ✕.

| How you leave | Time on /time | Rest of the drill | Missed word's retry (five later) |
|---|---|---|---|
| ✕ button | ✓ logged, start → ✕ | DEAL again gives what's left, nothing repeated | **lost** — a miss is already due tomorrow, so it never returns today |
| Switch apps / lock phone, come back (tab alive) | ✓ but **over-counts**: the time away is inside start → end | continues as if nothing happened | kept |
| Reload, swipe the app away, tab discarded | **lost** — no session row (day 11: /time shows 5:00, real 12:52) | DEAL again gives what's left, nothing repeated (day 11 ledger: no word graded twice) | **lost** (day 11: 先生) |

So "no repeats" already holds, because the schedule is saved per grade. Two things break:
**time** (lost on reload, over-counted when away) and **in-session retries of misses** (lost on
any exit). The word on screen at exit was never graded, so it is shown again — that is not a repeat.

## 2. Change
**2.1 Save the open drill.** New localStorage key `kanahero:open`:
`{ day, startTs, queue (remaining, in order, requeued misses in place), due, fresh, done, missed,
segStart, activeMs }`. Written on every grade, on `visibilitychange → hidden` and on `pagehide`.
Cleared when the queue empties (S5) or the day it belongs to has passed.

**2.2 Resume.** On launch, if `kanahero:open` is for today and its queue is not empty, Today's one
button resumes it instead of dealing a new pile. Label: `RESUME · <n> left` (design: one word on the
existing button; no new screen, no new element — Today keeps one button, SPEC-v7 §7). The queue
comes back exactly as saved, so a missed word still returns five later. A drill left open from an
earlier day is closed (its row written with the time it has) and not resumed: its misses are
already due on the new day.

**2.3 Time counts only while the drill is on screen.** A drill is cut into visible stretches.
Each stretch writes its own session row when it ends (hidden, pagehide, ✕, or the last word):
`startTs` = when it became visible, `endTs` = when it stopped. Rows after the first in one drill
carry `cont: true`, `due: 0`, `fresh: 0`, and the `done`/`missed` of that stretch only, so the day's
counts are not doubled. /time already sums every session row of a day: the total continues across
exits with no change to `lib/time.ts`. Done's minutes = the sum of the drill's stretches.

Not covered: a drill left on screen with the phone idle still counts. Out of scope; noted.

**2.4 Ledger compatibility.** `SessionRow` gains optional `cont?: true`. Old rows are unchanged.
`results.md` logging: an agent sums a day's session rows (all of them), as now.

## 3. Gates
- `scripts/e2e-loop.mjs`, new step: deal → grade 3 words with one miss → reload → Today shows
  `RESUME · n left` → resume → the missed word appears five later, no graded word appears again →
  finish → the ledger has two session rows for the day, the second `cont: true`, and their
  `done` sums to the attempts made.
- New step: hide the page for a fake 10 minutes (Playwright clock) mid-drill → the day's session
  time does not include the 10 minutes.
- `npm run lint`, `npm run build`, `npm run e2e`. No Joker copy (`joker-audit` not needed unless
  the RESUME label is given to him — it is not).

## 4. Falsified by (phone)
1. Mid-drill, swipe the app away; reopen; RESUME; finish. Pass: no word graded twice in the
   ledger, a word missed before the exit came back that day, /time's drill = ledger stretches summed.
2. Mid-drill, switch to another app for ~2 min, come back, finish. Pass: /time's drill time is
   ~2 min less than wall clock.

## 5. Post-build audit
(fill in after the phone test)
