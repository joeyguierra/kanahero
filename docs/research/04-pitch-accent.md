# Research 04 — pitch accent: does a visual pitch line help, and where does the data come from? (2026-11-23)

Question: next week's audio-on-reveal ships with a pitch line under the reading (reference:
`visual-pitchmap.png`, 休憩 きゅうけい, low → step up → high). Is a visual pitch line supported, how much
does pitch accent matter at N5, and which data can the app use?

Concept-level gap (`decisions.md` · Personal gap, concept fix): the app shows a word's shape,
meaning and reading, never its pitch. Not about any word the learner missed.

Confidence legend as `00-survey.md`. Abstract/summary level unless marked.

## Findings

1. **Pitch accent is phonemic but carries a low load (B).** It separates some homophones and some
   verb forms (Schaefer & Darcy 2020), but only a minority of words depend on it: about 14% of
   segmental homophones in one dictionary count (Schaefer & Darcy, citing a 1995 source); about 20% of
   word pairs (Pierrehumbert & Beckman 1988, as cited). Combined with vowel/consonant length errors
   it lowers intelligibility, and it adds listening effort for native listeners (Calgary thesis on
   Japanese prosody, **C**).
   → Low priority for N5 comprehension (vocabulary drives listening, `research/03` finding 1), but
   not zero, and it matters more for speaking — the conversational goal.

2. **English-L1 learners do not pick it up on their own (B/C).** One production study: L1 English
   learners of Japanese did not appear to store pitch accent in long-term memory, and no learner
   produced accurate, stable accent types (Whiterose / PMC 2022). Classrooms largely ignore it
   (Schaefer & Darcy 2020).
   → Without something pointing at pitch, the app teaches none. That is the gap a display fills.

3. **Pitch-height notation helps perception, in one of two experiments (B−).** Hirata, Friedman,
   Kaicher & Kelly 2024 (Language and Cognition, open access, read at summary level). Exp. 1 (66
   naive English speakers, one session, 20 words in carrier sentences): audio + notation whose
   height follows the pitch improved identification on trained **and novel** words; audio + flat
   H/L labels improved trained words only. Exp. 2 (48, within-subjects): no significant difference
   between conditions; learners rated the height notation more intuitive and helpful and said they
   would practise longer with it. Caveats: lab setting, small samples, one session.
   → The step line in `visual-pitchmap.png` *is* height notation. Modest support, best paired with
   audio (it was audio + notation in the study, never notation alone).

4. **Visualised prosody beats model audio alone (B/C, developer-run).** OJAD (Univ. of Tokyo):
   learners reading with visual + audio prosody were rated more natural than with text only, and
   visual presentation worked better than model utterances alone. These evaluations were run by
   the tool's own developers — treat as supportive, not independent.

5. **Production training with visual feedback** (Hirata 2002: learners matched their own pitch
   contour to a model's) improved both production and perception (B−). Needs a microphone and
   analysis → not now; logged for the conversational phase.

6. **Accent shifts in context.** Verb/adjective accents change with conjugation (OJAD exists largely
   for this), and a word that drops after its last mora only shows the drop on a following particle.
   → The line shows the **dictionary form only**, and needs a mark for the drop after the last mora
   (e.g. a down-tick past the word). The reference image has no such case.

## Data

- **Kanjium** (`data/source_files/raw/accents.txt`): pitch accent mora positions for 124,137 words,
  **CC BY-SA 4.0** (github.com/mifunetoshiro/kanjium; mirror mvf/kanjium). Used by JapanDict and
  several Anki/browser tools. Does not cover every word.
  Licence fit: the app already ships KanjiVG under CC BY-SA; attribution stays visible in Credits,
  like the stroke data (project standing constraint). ShareAlike applies to the accent data file.
- OJAD: terms of use unclear for redistribution → not used.
- NHK / Shinmeikai accent dictionaries: copyrighted → not used.
- **Process:** look up all 210 words in `public/words/n5.json`, add an `accent` field (mora index,
  0 = flat), list words with no entry or more than one accent, check those by hand. The TTS clip is
  compared to the data, never the other way round.

## Verdict

**Build the line, as a reference on the answer screen, with the audio.** Supported by findings 2–4;
cheap (one field, one SVG). Not graded, no pitch drill, no pitch on the prompt.
Not this: a pitch quiz, pitch scores, or anything that makes the writing grade depend on pitch.

## Measurement (falsifier)

The display's purpose is that pitch gets stored at all (finding 2). So measure stored pitch, cold:
- **Pitch recall check, paper:** 10 known words, shown as written; learner draws the pitch line from
  memory (no audio). Agent scores against the accent data. Same 10 words each time.
- **Baseline before launch** (this week), retest ~4 weeks after the line ships.
- Falsified if the retest is not clearly above baseline (expect baseline near chance).
- Separate check of the *audio*: share of words where the phone voice audibly disagrees with the
  line. High disagreement → the voice is not fit for pitch, keep the line, rethink the audio source.

## Sources
- [Hirata et al. 2024 — multimodal training on L2 Japanese pitch accent (Language and Cognition, OA)](https://www.cambridge.org/core/product/AB2195C963F348823C8175220F9F9EA1/core-reader)
- [Schaefer & Darcy 2020 — pitch accent in JFL: awareness, rules, intelligibility](https://psyling.sitehost.iu.edu/papers/SchaeferDarcy(2020)fried-persimmons-and-dried-oystersNCOLCTL.pdf)
- [L1 English learners and pitch accent in long-term memory (PMC)](https://pmc.ncbi.nlm.nih.gov/articles/PMC9014664)
- [Japanese prosody and comprehensibility (Univ. of Calgary thesis)](https://prism.ucalgary.ca/items/32924ab3-4761-4716-8c90-6a02c1e0c9cc)
- [Pitch accent perception, Mandarin vs English listeners (functional load ~20%)](https://ah.lib.nccu.edu.tw/bitstream/140.119/129024/1/4.pdf)
- [OJAD — visual prosody vs model utterances (ISAPh 2016)](https://www.isca-archive.org/isaph_2016/minematsu16_isaph.html)
- [OJAD reading practice and prosodic naturalness (J-STAGE)](https://cir.nii.ac.jp/crid/1390001288133898752?lang=en)
- [Hirata 2002 — production training with visual feedback (ICSLP)](https://www.isca-archive.org/icslp_2002/hirata02_icslp.html)
- [Kanjium — licence and accents.txt](https://github.com/mvf/kanjium)
