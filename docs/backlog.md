# backlog — ideas outside the current freeze

One entry per idea: date, what, why, what is already there, what it needs before it is built.
Nothing here is scheduled. Tabled v7 items with a return order stay in `docs/spec/SPEC-v7-skeleton.md` §1.

## 2026-11-14 · Run timer, shown on the done screen

**Asked for:** a timer running in the background of a run; time spent on the run shown on S5.

**Already built (v7):** `Loop.tsx` records `ms` per graded item (prompt shown → grade tap);
the ledger keeps `startTs` / `endTs` per session; S5 prints whole minutes. So the data exists.
What is missing is an honest figure and a finer display.

**Open before building:**
- *Which time.* Wall clock (`endTs − startTs`) counts a phone left on the table. Active time
  (sum of per-item `ms`, or a clock that stops when the page is hidden) is the number
  `results.md` needs. Decide one; do not show two.
- *Display.* `m:ss` on S5 only. Nothing visible during the run: a ticking clock makes a
  retrieval task a speed task, and the grade is the learner's own.
- *Per word.* Seconds per word (active time ÷ words written) is the figure the 30-word pile
  max is waiting on. Put it in the ledger export; whether S5 shows it is a design call.
- *Not this.* No best time, no comparison with yesterday, no target. A time is a measurement,
  not a score (treadmill guard).

**Falsified by:** the S5 time disagreeing with a stopwatch run by more than a few seconds on
a session with one deliberate pause.
