# Research survey 00 — candidate learning techniques (2026-10-27)

High-level pass over HANDOFF §7. Purpose: pick the few concepts worth a deep dive, and name
what each would have to prove before it becomes doctrine. Nothing here is doctrine. Sources
were read at the abstract/summary level unless marked **read**; effect sizes are quoted from
the papers, not recomputed.

Confidence legend: **A** meta-analysis or multiple replications · **B** a few controlled
studies · **C** single study / review essay / unverified citation.

## 1. The candidate table

| # | Technique | Evidence (conf.) | Fit to Kana Hero today | Falsifying measurement | Verdict |
| :-- | :-- | :-- | :-- | :-- | :-- |
| 1 | **Spaced retrieval across sessions** (spacing × testing effect) | **A.** Latimier et al. 2021, 29 studies: spacing + retrieval beats either alone; *no clear evidence* expanding beats uniform intervals. Kim & Webb 2022 (L2 meta): spacing helps, lag findings mixed. Cepeda 2008 ISI/RI ≈ 10–40 % (trivia, not L2). | App has **zero** cross-session memory per item. Requeue is within-session only; a character "joins the set" and is never scheduled again. This is the biggest gap. | 7-day delayed write-from-memory score, scheduled vs unscheduled characters, same learner. | **Dive** |
| 2 | **Successive relearning** (recall to criterion, then relearn in spaced sessions) | **A/B.** Rawson & Dunlosky (read): 1 correct recall in each of 3 spaced sessions → 68 % at 1 week vs 26 % for 3 recalls in one session; d = 1.82 for one relearning session; gains flatten after 3; initial overlearning not worth it. Relearning sessions take < 2 min then < 1 min per item. | Direct hit. "Correct on first attempt" and all-or-nothing runs are *already* criterion rules — just the wrong ones. SR gives the right criterion and the stop rule. | Same as #1; plus time-per-item per session (should fall). | **Dive — merge with #1** |
| 3 | **Learner-controlled dropping is the failure mode** | **B.** Kornell & Bjork 2008 (read): monitoring is fine (JOL 51 % vs recall 56 %, γ = .59); *decisions* are bad — 68 % of items dropped after one correct; final recall .19 / .62 / .88 after 0 / 1 / 2 prior corrects. | Self-grade stays. But the app, not the learner, must own "is this item done." Receipts (v6) let us later blind-re-grade own ink → a measurable honesty-drift number. | Receipt re-grade disagreement rate over time. | **Design constraint inside #1**, not its own dive |
| 4 | **Interleaving** | **A, but material-specific.** Brunmair & Richter 2019 (read): g = 0.42 overall; *words/translations g = −0.39* (blocking wins); strongest for visually confusable categories (paintings 0.67). | Kana are the painting case, not the word case: シ/ツ, ソ/ン, ぬ/め are visual-discrimination problems. Mixing confusables within a session is cheap. | Confusable-pair error rate, mixed vs blocked. | **Rule inside #1** |
| 5 | **Handwriting trains recognition** ("hand teaches the eye") | **B.** Guan, Meng & Perfetti 2015 (read, CFL adults, 5 days): handwriting → 96 % vs typing 73 % on lexical decision; writing strengthens **orthography↔meaning**; typing strengthens **orthography↔sound**. Guan 2011, Cao 2013 fMRI, Guan 2021 N170 agree. Caveats: Chinese not Japanese, no long-term retention test, no pure-writing control. Matsuo 2011 (kanji, classroom) cited secondhand, **unverified**. | Validates the core — and exposes its hole: **writing does not train readings.** For JLPT (reading + listening only, no writing section) the readings gap is the thing. | Delayed test split three ways: form (write it), meaning, reading. Expect the reading column to lag. | **Dive** |
| 6 | **Pretesting / errorful generation** | **B.** Finnish–English pairs: guessing helps item memory (dz ≈ 0.7) but **not novel associations** (BF for null). | App is already pure retrieval; the gain is where it already is. | — | **Drop** for now |
| 7 | **Keyword mnemonics** (Heisig-style stories) | **B, negative long-term.** Wang 1992/1995: better immediate recall, *worse* at 2–7 days unless reviewed ≥ 5×. | High research-washing risk ("everyone uses RTK"). Maybe for kanji meaning only, later. | — | **Drop** |
| 8 | **Shadowing / listening** | **C.** Hamada 2019 review (read): helps bottom-up listening for low-proficiency learners; speaking evidence thin, short studies, mostly Japan EFL, author cites himself. | Needs audio → runtime posture decision first (HANDOFF §8). | — | **Later**, after posture decision |
| 9 | **Extensive reading / incidental vocab** (Nation) | **A** for the effect, but requires ~N4 reading to start. | Too early. | — | **Later** |
| 10 | **Production vs recognition in retrieval** (write the word, not pick it) | Testing-effect literature generally favours recall tests over recognition; **needs: source** — not retrieved this pass. | Would extend writing from characters to N5 words with reading + meaning. Natural bridge between #1 and #5. | Mock vocab score, production items vs recognition items. | **Candidate third dive** |

## 2. Recommendation: two dives, maybe three

**Dive A — Spaced criterion relearning** (#1 + #2, with #3 and #4 as rules).
The scheduling layer the old doctrine banned. Research question to settle: criterion per
session, number of sessions, interval shape (uniform is fine per Latimier — don't over-engineer
an FSRS; vendor benchmarks are marketing, not findings), what counts as "a session," and how
all-or-nothing runs and fixed rarity survive contact with it (HANDOFF §3 flagged both as reward
design). Offline, local, $0 — no posture decision needed.

**Dive B — What writing trains, and what it doesn't** (#5).
Not to justify writing — it's justified — but to design the reading channel. The 2015 result
says writing builds form↔meaning and typing builds form↔sound. Kana Hero already shows the
reading (romaji prompt) *before* the write, so kana get both; kanji sets don't. Question: what
is the cheapest offline retrieval task for readings that doesn't demote writing?

**Dive C (provisional) — Word-level production retrieval** (#10).
Only if A and B leave room. It is the bridge to N5 vocabulary and to the mock score. Needs a
source first; if the testing-effect literature on recall vs recognition is as expected, this
may collapse into A as "the unit is the word, not the character."

Not a dive, but a prerequisite: **the baseline.** JLPT publishes level descriptions, not lists
(since 2010); community estimates are N5 ≈ 100 kanji / 800 words, N4 ≈ 300 / 1,500,
N3 ≈ 650 / 3,750 — label as unofficial. Nothing in Dive A or B can be measured without a
mock score and a definition of "a drill day."

## 3. What this survey did not do
- Did not retrieve full text of Latimier 2021 or Kim & Webb 2022 (paywalled / robots); numbers
  above are from secondary summaries. Dive A should get the PDFs.
- Did not verify Matsuo et al. 2011 exists as cited.
- Did not look at JLPT N5 mock formats — that's the baseline task, not research.

## Sources
- [Latimier, Peyre & Ramus 2021 — meta-analytic review of spacing retrieval practice (summary)](https://communities.springernature.com/amp/posts/september-2021-research-round-up)
- [Kim & Webb 2022 — spaced practice in L2, meta-analysis](https://onlinelibrary.wiley.com/doi/abs/10.1111/lang.12479)
- [Rogers — optimizing distributed practice (cites Kim & Webb, Cepeda 2008)](https://ira.lib.polyu.edu.hk/bitstream/10397/113055/1/Rogers_Optimizing_Distributed_Practice.pdf)
- [Rawson & Dunlosky — successive relearning (Current Directions)](https://journals.sagepub.com/doi/full/10.1177/09637214221100484)
- [Kornell & Bjork 2008 — optimising self-regulated study / dropping flashcards](https://bjorklab.psych.ucla.edu/wp-content/uploads/sites/13/2016/07/Kornell_Bjork_2008_Memory.pdf)
- [Brunmair & Richter 2019 — meta-analysis of interleaved learning](https://www.psychologie.uni-wuerzburg.de/fileadmin/06020400/2019/Brunmair_Richter_in_press__2019_META-ANALYSIS_OF_INTERLEAVED_LEARNING.pdf)
- [Guan, Meng & Perfetti 2015 — writing quality and Chinese character learning](https://www.lrdc.pitt.edu/perfettilab/PubPDFs/WritingQualityChinese_Perfetti_2015.pdf)
- [Guan et al. 2021 — handwriting and visual word recognition, Frontiers](https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2021.628160/pdf)
- [Mikey Does — writing kanji by hand, research summary (secondary; Matsuo 2011 cited here)](https://mikeydoes.com/articles/writing-kanji-by-hand-research/)
- [Pretesting effect with Finnish–English pairs, Memory & Cognition 2021](https://link.springer.com/article/10.3758/s13421-021-01218-6)
- [Wang & Thomas 1995 — keyword mnemonic long-term retention (summary)](https://archive.memory-key.com/node/1518)
- [Hamada 2019 — Shadowing: what is it, RELC Journal](https://journals.sagepub.com/doi/10.1177/0033688218771380)
- [Nation — principles guiding vocabulary learning through extensive reading](https://scholarspace.manoa.hawaii.edu/bitstream/10125/66705/1/27_1_10125_66705_nation.pdf)
- [JLPT official level summary](https://jlpt.jp/sp/e/about/levelsummary.html)
