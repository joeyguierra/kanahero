# Research 02 — learning direction, and how the pre-drill check picks words (2026-11-17)

Question from the workshop: when the writing drill and the reading check disagree about a word
(written ✓, read ✗ — 行く on day 2), should the check's word selection use the drill's result?
- **A — separate:** the check keeps its own per-word schedule from its own results only.
- **B — linked:** the drill's result moves a word up or down the check's queue.

Sources read at abstract/summary level this pass unless marked. Confidence legend as `00-survey.md`.

## Findings

1. **Learning direction decides what is learned (B).** Webb (2009; also 2005, thesis 2002):
   productive word-pair learning gave larger gains on most aspects tested, including
   *productive* meaning; **receptive learning gave larger gains in receptive knowledge of
   meaning.** Griffin & Harley 1996, Mondria & Wiersma 2004 agree that each direction mostly
   trains itself (cited in Webb/UWE word-writing study). Transfer-appropriate processing is the
   usual explanation. → Write-from-meaning and read-for-meaning are two skills; practising one
   only partly trains the other.

2. **Which direction is "better" is not settled (B).** Terai, Yamashita & Pasich 2021 (SSLA):
   no consensus across Griffin & Harley 1996, Schneider et al. 2002, Webb 2009; in their study
   **L2→L1 (receptive) helped lower-proficiency learners more, L1→L2 helped higher-proficiency
   learners.** At N5 the learner is lower-proficiency. Schneider, Healy & Bourne 2002: the harder
   direction (L1→L2) cut forgetting over a week. Not a reason to drop either direction.

3. **For plain word pairs, forward and backward recall track each other (A).** Kahana 2002,
   Caplan et al. 2006, Popov et al. 2019: after studying A–B, recall of B given A ≈ A given B, and
   the two are highly correlated per pair (associative symmetry). → Explains the kana side:
   the drill makes you *retrieve* the kana word from its meaning, and meaning-from-kana came
   along (probe 2026-11-16: 15/18).
   **Does not cover the kanji side:** the kanji prompt *shows* the reading and meaning, so the
   kanji↔reading link is never retrieved in either direction; the cue does the work. Symmetry
   only says retrieval in one direction strengthens the other — there was no retrieval of that
   link to strengthen. Consistent with `00-survey.md` #5 (Guan 2015: writing trains
   form↔meaning, not form↔sound).

4. **Per-item spacing from the item's own history beats generic (B).** Lindsey, Shroyer, Pashler
   & Mozer 2014 (Psych Science, 179 students, Spanish): personalised review gave +16.5% course
   retention over massed study, +10.0% over a generic spaced schedule. The model used each
   student's own history on each item. Interval *shape* (expanding vs uniform) has no clear
   winner (Latimier 2021, in `00-survey.md` #1) — don't over-engineer it.

5. **One retrieval per session is the time-efficient dose (B).** Nakata 2016 (SSLA): 5–7
   retrievals beat 1–3 in raw score, but **when time-on-task was controlled, one retrieval gave
   the largest gain.** → One pass per word in the check, no repeats in the same sitting.

## Answer: A — separate schedules — on two grounds

- **Learning.** Findings 1 and 3 say the reading/meaning link is a different association from
  the writing one, and the drill does not retrieve it for kanji words. A writing ✓ is therefore
  weak evidence about reading. Day 2 is the case: 行く, 外, 来る written ✓ on day 1, read ✗ on day 2.
  Using the writing result to *delay* a word's check would skip exactly the words that need it.
  Finding 4 says schedule each item from its *own* history — here, its own check history.
- **Measurement.** If the drill picks the check's words, the check stops being an independent
  number and the drill-vs-check comparison (the whole reason the check exists) is lost.

**What B gets right, kept without linking schedules:** a word new in the drill gets its first
check the next day regardless (rule 2a in `decisions.md`). That is the only drill→check link,
and it is by date, not by result.

## Rule this produces (manual check, now)
Per word, check-only history:
- First check: the day after the word is introduced in the drill.
- ✗ → back the next day.
- ✓ → gap grows: 1 → 3 → 7 → 14 days. Uniform-ish steps are fine (finding 4); this is a
  starting rule, not a tuned one.
- One pass per word per check (finding 5). Cap 30; overdue words first, then oldest.

## What would reverse this
- **Agreement test:** log both results per word. If over ~2 weeks drill ✓ predicts check ✓ for
  ≥ ~90% of kanji words, the two skills are moving together, linking is harmless, and one
  schedule would do. Data so far says not yet: of the 7 day-1 kanji words written ✓ on the
  first try on day 1 (何 行く 外 人 一 来る 見る), 4 were read ✓ on day 2 (何 人 一 見る) and 3 ✗
  (行く 外 来る) — **4 / 7 ≈ 57%**.
- If the check keeps scoring at ceiling for words on their first probe (rule 2a), the drill is
  teaching reading after all, and the check can shrink.

## Not settled here
- Whether to hide the reading on kanji prompts in the drill (would make the drill retrieve
  kanji→reading in reverse, i.e. reading→kanji, which finding 3 says should then carry
  over). That is a separate spec waiting on the rule-2a number.
