# Research 09 — how a word moves from hiragana to kanji (2026-11-27)

Question from the learner: the drill asks 65 words in hiragana that have a kanji form (のる →
乗る). When should the kanji come, and what is known about learning a word in kana first and
its kanji later? Nothing here is doctrine or a decision. Confidence legend as `00-survey.md`.
Sources marked *(abstract)* or *(snippet)* were not read in full.

## Where the app stands

- Form rule (`01-n5-word-list.md` §1.2): a word is asked in kanji only if every kanji is on
  the old Level 4 list. Otherwise it is asked in hiragana and the kanji is shown on the answer
  screen. Graded C when written: no study on timing was found then.
- Of the 105 hiragana words, 65 carry a kanji form. By the hardest kanji in each: 34 are old
  Level 3 (about N4), 26 old Level 2 (N3–N2), 3 beyond, and 分かる already qualifies.
- Nothing moves a word from the hiragana queue to a kanji question. That step was never designed.

## Findings

1. **Knowing a word by sound first helps learning its written form (A− for children reading
   an alphabet; B for Chinese children; untested for adult learners of Japanese).**
   Children trained on spoken words read them more easily on first sight, and the benefit to
   written-word recognition lasted (Wegener et al. 2018, 2020). The proposed mechanism there is
   predicting a spelling from sounds, which cannot work for kanji. But in Chinese children,
   knowing the specific spoken word predicted how well its written form was learned, for
   regular and irregular characters alike (Li, Marinus, Castles & Wang 2021 *(abstract)*).
   → The kana stage is not wasted time before kanji. It installs the sound and the meaning the
   kanji will attach to.

2. **Adult learners normally do not get that head start (B).** Native children know the spoken
   word before the character; adult learners in classrooms meet sound, meaning and character
   together (Chen, Xu & Perfetti; Paxton *(snippet)*). A learner who holds a word in kana first
   is closer to the native route than the classroom route.

3. **Japanese schools separate seeing, reading and writing a kanji (C as evidence: it is
   policy, not an experiment).** The curriculum teaches a kanji's *reading* in its allocated
   grade, gives children kanji from higher grades early with furigana "to give many chances to
   read", and expects *writing* to be secure only by the end of the following grade (MEXT
   course-of-study commentary, quoted in prefectural guidance).
   → Three steps, in this order, with a long lag before writing: see it with its reading,
   read it unaided, write it.

4. **A kanji tied to a known word is not harder to recognise than kana (B−, old, small,
   children).** Three- and four-year-olds learned meaningful kanji words far more easily than
   single meaningless kana (Steinberg & Oka 1978; Steinberg, Isozaki & Amano 1981 *(abstracts)*).
   Meaning mattered more than visual complexity. Reading only; says nothing about writing.

5. **What you see is what becomes familiar (B for the effect, C for the implication).** Words
   are read faster in their usual script than transcribed into another (Besner & Hildebrandt
   1987; Tamaoka 1997; Chikamatsu 2006, as cited in a 2017 study). Foreign readers showed this
   familiarity effect for kana words too (Komendzinska *(abstract)*). English-speaking learners
   lean on sound to recognise Japanese words, and that habit fades only slightly over two years
   (Chikamatsu 1996, 2006, as summarised by Martin & Li).
   → A word met only in kana becomes a kana-shaped word. Real text prints 乗る. The kana form
   is a stage, not the destination.

6. **Showing characters while the spoken word is still being learned does not help, and can
   hurt (C by analogy, one study, Chinese).** Adult learners of Chinese learned spoken labels
   no better with accurate, transparent characters on screen than with none; characters that
   were only partly informative or opaque made recall of the spoken word worse (Zhang, Li &
   Liu 2021 *(abstract)*).
   → The kanji on the answer screen of a brand-new kana word is not free exposure. At best it
   is neutral while the word itself is unsettled.

7. **Spoken form before written form may beat both at once (C).** In adults learning Chinese
   words with pinyin, two exploratory experiments found better written recall when the spoken
   form came first (Funk, Huettig & Hintz, in press *(abstract; the result of the preregistered
   third experiment was not visible to me)*). A related conference abstract reports higher
   processing cost for words learned written-first.

8. **In handwriting, knowing the word offsets the kanji's complexity (B−).** Vietnamese
   learners wrote complex kanji less accurately, weaker learners most, but those with stronger
   word knowledge compensated better (Frontiers in Language Sciences 2026 *(abstract)*).
   Learners' kanji writing errors are mostly non-existent forms, where their reading errors
   are mostly about sound (Swedish learners study *(abstract)*): the written shape is the hard
   part, and it is a separate job from the reading. Matsunaga 1999 *(abstract)*: full reading
   skill needs solid oral proficiency plus the ability to decode kanji words through their
   Japanese sounds.

9. **The learner's own data agrees on one point (n small).** Knowing a word in kana did not
   carry over to its kanji: はいる was known at baseline, 入る was written correctly first try
   on day 4, and its reading was blank on the day-5 check (`results.md`). The same-day reading
   check experiment ended A 8/13 vs B 8/12, no gain. A kanji's reading has to be retrieved on
   its own; seeing it beside the word is not enough.

## What this adds up to: four steps, not one switch

| Step | What the learner does | Evidence it rests on |
| :-- | :-- | :-- |
| 1. Word in kana | Writes the word from its meaning | Findings 1, 2, 7 |
| 2. See the kanji | Kanji shown with the reading, once the kana word is steady | 3, 6 |
| 3. Read the kanji | Sees the kanji alone, recalls reading and meaning | 3, 5, 9 |
| 4. Write the kanji | Writes it from meaning and reading | 3, 8 |

The app does step 1, does step 2 from day one (earlier than finding 6 suggests is useful),
has no step 3 (the paper check covers it by hand, for kanji-asked words only), and has no
step 4 for these words.

## Proposals for the three open questions (for a workshop; not decided)

- **Do the kana words come back as kanji?** The evidence leans yes: the word knowledge helps
  (1, 8), and a kana-only word is not the word as Japanese prints it (5).
- **When?** Two separate gates.
  - *Reading (step 3)* when the kana word is steady. The spec's own definition of steady is
    two correct writes on different days. Reading is cheap and N4 and N3 test it.
  - *Writing (step 4)* when the word's kanji are on the list for the level being studied
    (34 words at N4, 26 later). This keeps the current form rule and adds a stroke cost only
    where a test will ask for it.
- **How does the app treat it?** As a new item beside the kana one. The kana item is by then
  on its long reviews and costs almost nothing to keep.

Costs to weigh: the daily pile is capped at 30 and is already full on most days. Step 4 for
34 words is 34 new items. Step 3 needs a reading task the app does not have (backlog:
"Pre-drill review", 2026-11-17).

## Falsifiers

- **"Knowing the word first helps" fails for this learner if** kanji written for already-known
  kana words take as many attempts to first ✓ as brand-new kanji words of similar stroke count.
  The ledger can already test a version of this: among the 84 kanji-asked words, compare
  attempts for words he knew by sound at baseline with words he did not.
- **Step 3 is unnecessary if** first cold reads of kanji for steady kana words score at
  ceiling without any reading practice.
- **Finding 6 does not apply here if** hiding the kanji on the answer screen for new kana
  words changes nothing in their miss rate.

## Looked for and not found

- A controlled study of adult learners of Japanese comparing kana-first-then-kanji with
  kanji-from-the-start for the same words, on any outcome.
- Any study of the best delay between learning a word and learning to write its kanji.
- Any evidence that a kana writing habit interferes with later kanji writing of the same word.
- Full texts of most sources; see the marks above. Chikamatsu 2006 was read only as cited by
  others.

## Sources

- [Wegener et al. 2018 — children reading spoken words](https://acuresearchbank.acu.edu.au/download/00e8247ccc6309d1c24f50fcc44db4b5d34931b4744cf797cc46373ce0a3a022/399617/AM_Wegener_2018_Children_reading_spoken_words_Interactions_between.pdf)
- [Wegener et al. 2020 — evolution of orthographic expectancies](https://acuresearchbank.acu.edu.au/download/c0585c5d71cc33434ca410784013266eddb29fd67a9d6e5b9819cbfbf60c7fa5/561705/AM_Wegener_2020_Tracking_the_evolution_of_orthographic_expectancies.pdf)
- [Li, Marinus, Castles & Wang 2021 — oral vocabulary and orthographic learning in Chinese](https://acuresearchbank.acu.edu.au/items/12510171-ffd0-43ec-97d1-606767c37cc5)
- [Chen, Xu & Perfetti — character-word dual function model (review)](https://files.eric.ed.gov/fulltext/EJ1457276.pdf)
- [Paxton — tackling the kanji hurdle](https://www.researchgate.net/publication/271258201_Tackling_the_Kanji_hurdle_Investigation_of_Kanji_learning_in_Non-Kanji_background_learners)
- [Prefectural guidance quoting the MEXT commentary on kanji teaching](https://www.pref.miyagi.jp/documents/10668/85761.pdf)
- [Steinberg & Oka 1978](https://www.jstage.jst.go.jp/article/jjpsy1926/49/1/49_1_15/_article/-char/ja) · [Steinberg, Isozaki & Amano 1981](https://www.jstage.jst.go.jp/article/jjpsy1926/52/5/52_5_309/_article/-char/ja)
- [Script familiarity effect, 2017 study citing Chikamatsu 2006](https://link.springer.com/doi/10.1007/s11145-017-9796-3)
- [Komendzinska — kana words in second-language readers](https://cogpsy.educ.kyoto-u.ac.jp/psychologia/ab/3832.htm)
- [Martin & Li — summary of Chikamatsu 1996, 2006](https://core.ac.uk/download/129770083.pdf)
- [Zhang, Li & Liu 2021 — orthography and oral vocabulary in learners of Chinese](https://www.cambridge.org/core/journals/studies-in-second-language-acquisition/article/influence-of-orthography-on-oral-vocabulary-acquisition-in-learners-of-chinese-as-a-second-language/C1D3301FDE7161E796D20BFDC3D73380)
- [Funk, Huettig & Hintz — presentational timing of written and spoken forms](https://www.mpi.nl/publications/item3689580/role-presentational-timing-acquiring-novel-written-and-spoken-word-forms)
- [Kanji handwriting in Vietnamese learners, 2026](https://www.mpi.nl/publications/item3699860/how-vietnamese-tackle-japanese-kanji-key-factors-behind-handwriting)
- [Kanji reading and writing errors of Swedish learners](https://rd.springer.com/chapter/10.1007/978-3-319-68434-5_12)
- [Matsunaga 1999 — kanji knowledge transfer](https://jpf.repo.nii.ac.jp/record/284/files/Sekai09_matsunaga.pdf)
