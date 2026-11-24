# Research 07 — which insights help a language learner, and which are noise (2026-11-24)

Question: the learner wants an INSIGHTS page (internal, beside TIME in MENU). Before any brief:
what kinds of learner-facing data actually help learning, which hurt, and how to keep one
learner's small numbers from becoming noise?

Confidence legend as `00-survey.md`. Abstract/summary level unless marked.

## Findings

1. **Dashboards on their own do little (A−).** Kaliisa & Saqr (systematic review, 38 studies): most
   studies found negligible or small effects of learning analytics dashboards on achievement, with
   little evidence from well-powered studies; effects on motivation and attitude modest. Matcha et
   al. 2020 (IEEE TLT, systematic review): dashboards are rarely grounded in self-regulated learning
   theory. Jivet et al. 2017 ("Awareness is not enough"): dashboards mostly aim at awareness and
   reflection, which alone is not enough to change learning.
   → **An insight earns a place only if it points to a decision.** Every card on the page names the
   decision it feeds (in `decisions.md` / `backlog.md` terms). No decision → not on the page.

2. **Feedback can make things worse, depending on where it points attention (A).** Kluger & DeNisi
   1996 (meta-analysis, 607 effect sizes): feedback improved performance on average (d = .41), but
   over a third of feedback interventions *decreased* performance. Effectiveness falls as feedback
   moves attention from the task toward the self.
   → **Task-level insights only** (which words, which skill, which interval). Nothing that grades
   the person: no overall score, no level, no "you are doing well/badly".

3. **Social comparison is the common default and the wrong frame (B).** Jivet et al. 2017/2018:
   dashboards tend to foster competition rather than mastery, and peer comparison was not perceived
   positively by all learners.
   → Not an issue for one learner, but it closes the door for a public version: no leaderboards,
   no "average learner" lines.

4. **Monitoring progress works — monitor the outcome, not just the behaviour (A).** Harkin et al.
   2016 (Psych Bulletin, 138 randomised studies, N = 19,951): prompting people to monitor goal
   progress improved goal attainment; more frequent monitoring, more effect; larger when the
   information was physically recorded. The authors' own illustration: to lose weight, monitor
   weight, not only meals.
   → The outcome here is **retention and test scores**; minutes and attempts are the "meals".
   TIME already covers behaviour. INSIGHTS should carry outcomes.

5. **In-session accuracy is performance, not learning (A).** Soderstrom & Bjork 2015 (integrative
   review): learning (long-term retention, transfer) and performance during acquisition dissociate;
   some conditions raise one and lower the other; learners favour what boosts immediate
   performance.
   → **Never show same-session % correct as progress.** Show delayed measures only: first-try
   recall when a word comes back after a gap; next-day first check of new words; sealed checks;
   mocks. Spacing and desirable difficulty will make in-session numbers *look* worse while
   learning improves.

6. **Learners misjudge what they know; test results correct it (B).** Judgments of learning are
   typically overconfident at first; repeated study–test cycles reduce overconfidence (Koriat;
   Finn & Metcalfe). Kornell & Bjork 2008 (`00-survey` #3): learners drop items too early.
   `research/02`: writing ✓ predicts reading ✓ only partly (4/7 on day 2).
   → Insights that **contradict a feeling of knowing** are the valuable ones: words written fine
   but missed on reading; words that fail after a long gap. And no "mark as known" control.

## What counts as noise (rules for every card)

- **Minimum n.** No rate on fewer than ~20 attempts; pool by week, not day. Show n beside every
  rate. Below the minimum: show the count, not a percentage.
- **No trend line on fewer than 4 points.** No day-to-day deltas.
- **Measured ≠ zero** (same rule as TIME). Missing paper data is shown as missing.
- **One source per number, named:** ledger (app) or paper (`results.md`). The app can only compute
  from the ledger; paper checks are not in it (gap noted below).
- **No forecasts** (no predicted JLPT score): no valid model, one learner, n tiny.
- **Treadmill guard** as TIME: no goals, streaks, best days, red, or comparison with yesterday.

## Candidate insights, ranked (each with the decision it feeds)

| # | Insight | Source | Feeds decision | Notes |
|---|---|---|---|---|
| 1 | **Retention by gap**: first-try writing recall on due words, grouped by days since last seen (1 · 3 · 7 · 14 · 30) | ledger | ladder intervals; whether to stretch or shorten rungs | Findings 4, 5. The core outcome. |
| 2 | **New-word first try next session** (drill-only number), weekly | ledger | pace: fresh words per day (`research/06` falsifier: < ~60% for a week) | Clean measure of encoding load. |
| 3 | **Trouble list**: words with ≥ 3 misses, or a miss after a ✓ at ≥ 7 days; grouped into look-alike families where two are confused | ledger (+ paper for reading) | interference research; whether a general contrast step is needed | Finding 6. A list of words, not a score. Fix stays general ("Personal gap, concept fix"). |
| 4 | **Skill split**: words ✓ in writing but ✗ on reading (and the reverse) | ledger + paper | reading step in the drill (split experiment); check priority | Needs reading results in the app (gap). |
| 5 | **Accuracy by position in a session** (early vs late items) | ledger | block length (`research/06` falsifier) | Weekly pooled only. |
| 6 | **Measurement events**: sealed checks and mocks, baseline vs retest, with dates | paper | the falsifiers in `decisions.md` | Sparse and honest. The only learning-level scores. |
| 7 | **Pace vs list**: words introduced to date, list length, date the list runs out at the current pace | ledger | pace / N5 sitting | Information, not a target. Weekly at most. |

**Left out on purpose:** daily or session % correct (finding 5) · total attempts, words "learned"
counts (mirror the list; brief §6) · any score, level or grade of the learner (finding 2) ·
comparison with others (finding 3) · predicted test scores · minutes (TIME has them).

## Gap the page depends on
Insights 3, 4 and 6 need paper results in the app. Today the pre-drill check, nightly items and
sealed checks live only in `results.md`. Either (a) the page shows ledger-only insights (1, 2, 3
writing half, 5, 7) first, or (b) the in-app pre-drill check (`backlog.md` 2026-11-17) comes first
and brings reading results into the ledger. (a) is the smaller first build.

## Falsifiers for an INSIGHTS page
- After four weeks, no decision in `decisions.md` cites a card → the page is awareness only
  (finding 1): cut it to the cards that were cited, or remove it.
- The learner reports checking it instead of studying, or feeling graded → strip the card that did it.
- Any card disagrees with the same number computed by hand from the export → fix before use.

## Sources
- [Kaliisa & Saqr — Have learning analytics dashboards lived up to the hype? (systematic review)](https://arxiv.org/pdf/2312.15042)
- [Matcha et al. 2020 — systematic review of LADs, self-regulated learning perspective](https://digital.library.adelaide.edu.au/items/6cb25a66-ac4c-43b5-b12c-d57be8cd9c81)
- [Jivet et al. 2017 — Awareness is not enough (EC-TEL)](https://core.ac.uk/download/225785908.pdf)
- [Jivet et al. 2018 — license to evaluate: dashboards and learning theory (LAK)](https://dx.doi.org/10.1145/3170358.3170421)
- [Kluger & DeNisi 1996 — effects of feedback interventions on performance](https://pluto.huji.ac.il/%7Emskluger/files/Download/Kluger &  DeNisi abstract.doc)
- [Harkin et al. 2016 — does monitoring goal progress promote goal attainment?](https://eprints.whiterose.ac.uk/91437/)
- [APA release on Harkin et al. (monitor weight, not only meals)](https://www.apa.org/news/press/releases/2015/10/progress-goals)
- [Soderstrom & Bjork 2015 — learning versus performance](https://pubmed.ncbi.nlm.nih.gov/25910388/)
- [Finn & Metcalfe — judgments of learning and memory for past test](https://pmc.ncbi.nlm.nih.gov/articles/PMC2836879)
- [Underconfidence-with-practice and overconfidence at first (Metacognition and Learning 2021)](https://link.springer.com/article/10.1007/s11409-021-09288-2)
