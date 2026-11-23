# Research 03 — listening for beginners (2026-11-23)

Question: what helps a beginner (N5, ~73 words known) get better at listening, and is the proposed
nightly item — **hear a sentence (audio only), translate it to English, then reveal and self-grade** —
supported? Context: Baseline 2 listening 2/4 (n = 4, not a measurement); both misses were items whose
choices are heard, not printed. Audio source for a first version: the phone's own TTS engine
(learner, 2026-11-23: "minimum viable feature is phone's engine").

Passes the `decisions.md` "Personal gap, concept fix" test: the gap is a skill (no word in the app is
ever learned by ear), not any of the learner's items.

Sources read at abstract/summary level unless marked. Confidence legend as `00-survey.md`
(**A** meta-analysis / replications · **B** a few controlled studies · **C** single study / review).

## Findings

1. **Vocabulary is the main driver of L2 listening (A).** Zhang & Zhang 2020 (meta-analysis, 100+
   studies, ~21,000 learners): vocabulary–listening r = .56. In'nami et al. 2022 (meta-analysis):
   listening tracks linguistic knowledge (grammar, vocabulary) more than aptitude, working memory,
   metacognition or motivation. Vafaee & Suzuki 2020 (SSLA): vocabulary predicted listening about
   twice as strongly as syntax (.55 vs .28).
   → At N5 the drill's vocabulary work *is* most of listening. A listening item does not replace it.

2. **For listening, knowing the word *by sound* is what counts (B).** Cheng & Matthews 2018
   (Language Testing, 250 learners): productive/phonological vocabulary correlated most with
   listening (r = .71); productive/orthographic with reading (r = .57). Saito et al. 2023 (SSLA):
   listening draws on sound–meaning mapping *and* fast retrieval of it.
   → Same shape as `research/02` (each direction trains itself): written knowledge of a word is not
   aural knowledge of it. Today the app never plays a word, so no word is learned by ear.

3. **Coverage: ~95% of words known for adequate listening (B).** van Zeeland & Schmitt 2013
   (Applied Linguistics): non-native listeners had relatively good, *stable* comprehension at 95%;
   some managed at 90%, but results varied widely below 95%. Coverage–comprehension is roughly
   linear (Schmitt et al. 2011, reading).
   → Rule for picking sentences: **every word already introduced to the learner.** In a 6-word
   sentence, one unknown word is 83% coverage, far below the line. "Level-appropriate" means
   "made of known words," measured per learner from the ledger, not a JLPT tag on the sentence.

4. **Beginners lack bottom-up decoding; dictation trains it (B/C).** Novices guess from context
   (top-down) to cover weak word recognition (bottom-up) (review literature; Field). Siegel &
   Siegel 2015 (small classroom quasi-experiment): bottom-up activities including dictation;
   learners valued them. Kissling 2018: pronunciation instruction improved novices' bottom-up
   processing. Evidence is thinner than for 1–3.
   → "Hear it, write it" (dictation) is a natural fit for a handwriting app and trains word
   recognition. Translation trains meaning. They are different tasks; see the verdict.

5. **Japanese length contrasts are hard for English speakers; training helps, only partly (B).**
   Hirata 2004 and later: auditory training improves perception of Japanese vowel length, but not to
   native level; Tajima et al. 2008: improvement only to a limited extent; Korean listeners trained
   on consonant length did not generalise to vowel length. High-variability phonetic training
   (HVPT: many talkers, trial-by-trial feedback) is the best-supported perception method
   (Uchihara, Karas & Thomson 2025, meta-analysis of 79 studies; talker count is one moderator).
   → Matches the long-vowel slips in the learner's ink (ゆうめい → ゆめい, パーティ) but the fix is
   general: long vowels, small っ and ん are known hard points for English speakers. A phone engine
   is **one talker** — low variability. Logged as a known limit of the MVP, not a blocker.

6. **TTS is usable for comprehension, weaker for perceptual learning (B/C).** Bione & Cardoso 2020
   (LLT): TTS and human voice rated similarly comprehensible, TTS less natural; comprehension,
   dictation and sound-identification scores similar. Matsuda 2017 (JACET): auditory word priming
   was significantly greater with natural human speech.
   → Phone TTS is fine for "hear and understand"; for fine sound learning (finding 5) human or
   multi-voice audio would be better later. Pitch accent from TTS is checked against accent data
   (backlog, pitch line).

7. **Reading-while-listening helps (B).** Chang 2009; Chang & Millett 2014, 2015: reading while
   listening improves listening fluency and comprehension for beginners.
   → Cheap: when the answer is revealed, show the text **and** replay the audio.

8. **Listening strategy instruction works in classrooms (A, poor fit).** Dalman & Plonsky 2022
   (meta-analysis, 45 studies): medium effect, d = 0.69. Teacher-led, metacognitive. Not a drill;
   not for now.

9. **Shadowing (C)** — unchanged from `00-survey.md` #8. Not for now.

## Verdict on the proposed item (audio only → translate → reveal → self-grade)

**Supported, with three conditions.**
- **Known words only** (finding 3). Built from the ledger, same as the pre-drill check rule
  "spell it exactly as the drill taught it."
- **Start at the word, then the sentence.** Finding 2 says the base unit of listening is the word by
  ear. With ~73 words known, very few sentences will qualify anyway. Order: hear a known word →
  say its meaning; then short sentences of known words as the pool allows.
- **Reveal plays it again with the text** (finding 7).

**What translating does and doesn't train.** Hear → English is sound→meaning recall (findings 1–2):
the right target for comprehension. It does not train hearing the exact sounds (finding 4–5).
Dictation (hear → handwrite the kana) does. Keep them as two item types; do not decide between them
on faith. Self-grading a sentence translation is fuzzy: grade on whether every content word and the
role of each particle came through, not on English wording.

**Not this.** No "listening streak", no minutes target, no audio for that day's new drill words
(keeps tomorrow's first check clean — same rule as the nightly grammar sheet).

## Measurement (needed before claiming anything)
- The 4 official listening items are too few and are now contaminated. A **sealed listening check**
  is needed: ~10 audio-only items of known words, never trained on, retested on a fixed date. It
  needs the same player as the trial (the model cannot make audio).
- Falsifier for the nightly listening item: next-morning cold audio recall of the night's items
  < ~50% for a week → change the format; sealed listening check not up after ~4 weeks → cut or
  redesign.
- Later: an official full listening section at the next mock re-measure.

## What this pass did not do
- Did not read full texts; numbers are from abstracts. No source is Japanese-as-L2 except finding 5.
- Did not count how many Tatoeba sentences are made only of the 73 known words (container cannot
  reach Tatoeba downloads).
- Did not test whether Chrome on Android gets the same voice as Takoboto (pending the
  engine-switch test).

## Sources
- [van Zeeland & Schmitt 2013 — lexical coverage and listening (Applied Linguistics)](https://plus.cobiss.net/cobiss/um/en/discovery/eNqNkUtLxDAUhYMoOI4u3WcjuKmTpGkebkTGJxQEHcFdSdPbmUib1qQj-u-tzODGzazugfuds_kQOqXkghKdzkzfN87PTBuJ5HtoQrmUCc_I2z6aEMpZIgihh-goxvcxMCXSCVrl8OWsafC8-4RgloCdxznFxlc4Zzh3cQDv_HL8t32AFfjoOn-JFyvAL6YF3AV84-oaAvgB16Fr8TOY6l_j6hgd1KaJcLK9U_R6d7uYPyT50_3j_DpPDM-yIdGCgVUKNKPaKJOqupRCCcmErqqUCFkKUjLImLbC2tRqQ1jJamBlpiy1WTpF55vdPnQfa4hD0bpooWmMh24dC5qlggquld4F5UxkaieUcE4loWpEkw1qQxdjgLrog2tN-C4oKX49FRtPxcbTyJ9tp00cRdTBeOviX4lJOUKEpD8hyZOf)
- [Zhang & Zhang 2020 — vocabulary and L2 reading/listening, meta-analysis (LTR)](https://bohrium.dp.tech/paper/arxiv/812657818464157696)
- [In'nami et al. 2022 — meta-analysis of L2 listening and its components](https://benjamins.com/catalog/bpa.13.08inn)
- [Vafaee & Suzuki 2020 — syntactic vs vocabulary knowledge in L2 listening (SSLA)](https://www.cambridge.org/core/services/aop-cambridge-core/content/view/FF75AE3040EB0D4CE2EA71BE155465BA/S0272263119000676a.pdf/div-class-title-the-relative-significance-of-syntactic-knowledge-and-vocabulary-knowledge-in-second-language-listening-ability-div.pdf)
- [Cheng & Matthews 2018 — three measures of vocabulary and L2 listening/reading (Language Testing)](https://rune.une.edu.au/web/handle/1959.11/22276)
- [Saito et al. 2023 — phonological vocabulary and L2 listening (SSLA)](https://www.cambridge.org/core/product/0AB54264DF81D0A2CC5A30D8F699BDFE/core-reader)
- [Siegel & Siegel 2015 — bottom-up listening activities](https://pressto.amu.edu.pl/index.php/ssllt/article/download/4322/4386/8384)
- [Kissling 2018 — pronunciation instruction and bottom-up processing](https://core.ac.uk/download/232792424.pdf)
- [Tajima et al. 2008 — training Japanese length contrasts (PubMed)](https://pubmed.ncbi.nlm.nih.gov/18177169)
- [Hirata et al. — auditory learning of Japanese vowel length](https://colgate.edu/media/12166/download)
- [Korean listeners, Japanese length contrast training](https://dx.doi.org/10.1007/s10831-013-9107-1)
- [Uchihara, Karas & Thomson 2025 — HVPT meta-analysis (SSLA)](https://www.cambridge.org/core/product/6ABB8C1F32D88D53EA8D05A4565E76F6/core-reader)
- [Bione & Cardoso 2020 — synthetic voices in the FL context (LLT)](https://scholarspace.manoa.hawaii.edu/items/c348d05b-9168-40ee-8d81-462bee567dbe)
- [Matsuda 2017 — TTS vs natural speech, word priming (JACET)](https://www.jstage.jst.go.jp/article/jacetjournal/61/0/61_149/_article/-char/en)
- [Chang & Millett 2014 and related, reading while listening](https://informahealthcare.com/doi/ref/10.1080/00220671.2022.2027327)
- [Dalman & Plonsky 2022 — listening strategy instruction meta-analysis](https://experts.nau.edu/en/publications/the-effectiveness-of-second-language-listening-strategy-instructi/)
