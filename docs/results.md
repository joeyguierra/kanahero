# results — real-world measurement

Every number here is measured, once, as it happened. Nothing rounded, nothing re-taken.
Read this BEFORE workshopping anything new. Data beats doctrine: if a number here contradicts
a doctrine test, the conflict gets surfaced, not ignored.

## Definitions
- **Drill day:** one completed Kana Hero session with at least one graded item. Minutes logged.
- **Mock:** official JLPT N5 sample workbook, 言語知識（文字・語彙）section only, timed, no
  lookup, guesses marked. Source: https://www.jlpt.jp/samples/pdf/N5-mondai.pdf
  The sample section has **8 items** (もんだい1–4, two each). Denominator is 8.
- **Meaning recognition:** words pulled by the learner from the section, Japanese shown →
  write the English. Measures meaning, not production.
- **Production check:** English meaning only → handwrite the Japanese as printed. 10 min.
- **Writing recall (ledger):** the drill's own self-graded `ok` on the *first* attempt of a word
  in a session, for words introduced on an earlier day. Measures production only — see the
  2026-11-16 receptive probe for why that is not word knowledge.
- **Receptive probe (cold, paper):** before drilling, the word is shown as written (kanji or
  kana), nothing else; learner says reading + meaning aloud, scores himself, model checks.
  Kanji words scored on reading AND meaning; kana words on meaning.

- **Time per day:** every part timed separately (stopwatch on paper; drill from the ledger
  session `startTs`→`endTs`), then summed. "—" = not timed; totals count measured parts only and
  never fill a gap with an estimate.

## Baseline — 2026-11-14, 01:51–02:30
- **Mock 文字・語彙: 5 / 8** · 5 guessed (items 1, 2, 3, 7, 8) · 3 guesses right (1, 2, 8) ·
  8 min used. Wrong: item 3 (guess, 外 — narrowed to 2 vs 4 by familiarity, picked the wrong
  single-stroke variant), item 5 (confident, タクシーに＋のる collocation), item 7 (guess, つとめる).
  Item 3 was first graded ✓ from a screenshot misread; learner checked the official key → 4.
  Item 4 (ホテル) confident: "a very common word… weird that the question wrote hoteru in
  hiragana"; also knew ゆうめい. Counts as known, not guessed.
- **Meaning recognition: 18 / 20** (2 half: かいもの written かじもの, "things to buy";
  やすんで glossed "to close/off", actual: resting). Learner chose the 20 words himself from
  the section; chose no kanji words; skipped ゆうべ, 新しい, 電気, そと, つける, まつ, つとめる.
- **Production check: 17 / 20** · 1 miss · 2 unclear · 9 min. Learner's own 20 (all kana,
  no kanji), English → handwrite, originals covered.
  Miss: ゆうめい written ゆめい (long vowel dropped; パーティ had the same slip in recognition
  round, fixed here). Unclear: はいりました (い reads as じ — recurring), やすむ (final kana
  reads お/ね, not む). Notes: あぶない dakuten faint, second attempt; small ィ in パーティー
  leans ト; かいもの corrected from earlier かじもの.
  Finding: production of *known kana words* is near ceiling. The gap is not kana output; it is
  (a) the nine unknown words and (b) kanji, of which zero were attempted because the learner's
  list had none. Week-one plan should place kana sets as "already know" and move to kanji/words.
  Recurring ink issues to watch in the app's overlay: long vowels, い/じ, dakuten weight.
- **Days drilled in the 14 days before: 0.**
- Notes, learner's own words:
  - Item 1 (新しい→あたらしい): "I don't know what あたらしい means, I just recognize the word
    as familiar." Correct by familiarity, not knowledge.
  - Item 2 (電気→でんき): same. Familiar sound, no meaning, no kanji→sound link.
  - Pattern across 1 and 2: recognition by familiarity of the kana string, with neither the
    meaning nor the kanji attached. The mock scores this as correct. It is not knowledge.
  - Item 3 (そと→外): "both 2 and 4 were my options… they looked the most right, perhaps from
    previous recognition in the wild — this is where immersion helps." Narrowed by familiarity,
    lost on a single stroke.
  - Item 4 (ほてる→ホテル): confident; known word; the hiragana spelling of a loanword read as
    the tell; also knew ゆうめい.
  - Item 5 (タクシーに のりました): "I was confident because I knew はいる; the difference between
    entering a building and boarding a taxi/train is what tripped me." Not a vocabulary miss:
    a verb+particle+noun collocation (sentence unit).
  - Item 6 (うるさい): "I knew all the words in the question and was able to translate the whole
    sentence; I know all the choices besides くらい; confident because the image had a guy
    playing guitar." Fully known. Gap noted: くらい (dark).
  - Item 7 (つとめて います): "I knew every choice, I just didn't know つとめる." Target word
    unknown, all four paraphrase words known.
  - Item 8 (ゆうべ): "I knew most words besides ゆうべ and おととい." Guessed right; target
    unknown. Gaps: ゆうべ (last night), おととい (day before yesterday).
  - Finding: in both もんだい4 items every word was known except the one the item turned on, and
    both were words the learner skipped when pulling his own 20. Self-selected word lists
    measure what is already known. The app, not the learner, picks what gets drilled.
- **Unknown-word list from this mock** (seed for the first N5 word set): 新しい, 電気, 外,
  つける, つとめる, ゆうべ, おととい, くらい, のる (collocation に のる).
- Handwriting legibility (model read of the sheet): 19/20 kana readable at once;
  う in ゆうめい reads as ラ, い in かいもの reads as じ, dakuten on デ faint,
  パーティ missing long vowel.

## Baseline 2 — grammar, reading, listening — 2026-11-23
- **Source:** official N5 sample (same set as Baseline 1): `N5-mondai.pdf` 言語知識（文法）・読解,
  `N5Sample.mp3` 聴解, scored with `N5-seikai.pdf`. Timed, no lookup, guesses marked, audio once.
- **文法・読解: 8 / 13** · 34:44 · 12 of 13 guessed. Learner's grading checked against the key: correct.
  - **Grammar (もんだい1–3, items 1–9): 4 / 9.** ✓ 2 6 7 9 (all guessed) · ✗ 1 3 4 5 8.
    Item 1 the only unguessed answer, and wrong: chose に for へや（の）そうじ.
    Items 3–4 (★ sentence-order, もんだい2): blind — learner did not understand the instructions
    or the ★. These measure instruction-reading, not grammar.
  - **Reading (もんだい4–6, items 10–13): 4 / 4,** all guessed. n = 4; not read as a strength.
  - 12 guesses → 7 right, vs ~3 expected at chance: partial knowledge (recognised words), not
    blind guessing.
- **聴解: 2 / 4** (sample has one item per type; ~10 min). もんだい1 1ばん ✓, もんだい2 1ばん ✓
  (both confident, picture choices) · もんだい3 2ばん ✗ (g), もんだい4 1ばん ✗ (g) — both missed
  where the choices are heard, not printed.
- Learner: "I barely understand the instructions"; many words unknown, some recognised.
- **Weakest measured: grammar (44%)**, listening close (50%, n = 4). Particles are the confident
  miss on both mocks (Baseline 1 item 5 タクシーに のる; Baseline 2 item 1 の/に).
- **Contamination:** the 13 items are being reviewed item by item with answers from 11-23, so this
  sample can no longer re-measure grammar. The sealed check below is the falsifier instead.
- **Sealed particle check, baseline (model-written, 8 items, key in `docs/sealed-particle-check.md`):
  5 / 7** · 0 marked as guesses · item 5 **voided** (two valid answers: ホテルの / ホテルで パン —
  item defect, not learner error). ✗ 7, 8. Retest on or after 2026-12-21, same items, same rules.

## Log
<!-- one line per drill day: date · set · items due/done/missed · minutes -->
<!-- source: app ledger export (kanahero-ledger-2026-11-16.json). Times UTC+7. -->
- **Day 1 — 2026-11-15** · N5 week-1 · 2 sessions · 20 fresh words, 0 due ·
  25 attempts, 20 ✓ / 5 ✗ · **9.6 min** (12:22–12:28, 5.3 min · 13:44–13:48, 4.3 min)
  - Session 1: due 0 · fresh 10 · done 14 · missed 4. Session 2: due 0 · fresh 10 · done 11 · missed 1.
  - First-try ✓ on new words: 17 / 20. First-try ✗: 言う (76 s), それ, やる (104 s).
  - Median 16.6 s per attempt.
- **Day 2 — 2026-11-16** · N5 week-1 · 1 session (17:22–17:40) · due 20 · fresh 10 ·
  done 46 · missed 16 · **18.5 min**
  - **Writing recall, day-1 words, first try: 11 / 20.**
    ✓ する パン つける いい それ ある 人 バス これ 一 ゆうべ ·
    ✗ 何 あの 言う 行く 外 来る もう 見る やる.
    Day-1 first-try ✓ that held overnight: 10 / 17. Day-1 first-try ✗ that held: 1 / 3 (それ).
    言う and やる ✗ on first try both days; 言う slowest item both days (76 s, 83 s).
    何 and 見る needed 3 attempts.
  - New words first try: 6 / 10. ✗ なる 今 食べる 新しい (all ✓ by end of session).
  - All 46 attempts: 30 ✓ / 16 ✗. Median 16.9 s per attempt (day 1: 16.6 s).

- **Day 3 — 2026-11-17** · N5 week-1 · 1 session (12:54–13:09), after the day-3 probe ·
  due 19 · fresh 10 · done 38 · missed 9 · **14.8 min**
  - **Writing recall, due words, first try: 16 / 19.** ✗ やる 食べる 新しい.
    Not due today (scheduler): する パン つける いい それ ある 人 バス これ 一 ゆうべ.
    Caveat: the probe ran minutes before — reading/meaning had just been retrieved and corrected.
  - New words first try: 9 / 10. ✗ 後 — 6 attempts, ✓ only on the last (39 s, 16 s, 39 s,
    32 s, 42 s, 31 s). Slowest-to-stick word so far.
  - New kanji words: 後 十 出る 三. New kana words: ほんとう わたし テレビ どう くらい この.
  - All 38 attempts: 29 ✓ / 9 ✗. Median 20.3 s per attempt.
  - "More" (extra session, learner-reported, ledger not exported): 1 fresh word, 違う ✓ first try.
    Learner then glossed it unprompted as "chigao — to be different": meaning ✓, reading off by
    one vowel (ちがう chigau). That is a same-day reading retrieval, so 違う counts as arm A.

- **Day 4 — 2026-11-18** · N5 week-1 · 1 session (15:47–16:01), after the day-4 check ·
  due 14 · fresh 10 · done 37 · missed 13 · **14.8 min**
  - **Writing recall, due words, first try: 13 / 14.** ✗ 後 (✓ on 2nd).
  - New words first try: 7 / 10. ✗ **多分** (5 attempts), **前** (6 attempts), **電気** (4 attempts).
    ✓ ここ 入る カメラ その そこ つとめる (71 s) できる.
    New kanji: 多分 入る 前 電気. New kana: ここ カメラ その そこ つとめる できる.
  - All 37 attempts: 24 ✓ / 13 ✗. Median 21.4 s per attempt.
  - Day-3 extra session confirmed in ledger: 13:26, 1 fresh word, ちがう ✓.

- **Day 5 — 2026-11-19** · N5 week-1 · 2 sessions, after the day-5 check · **17.3 min wall**
  (11:47–11:48, stopped after 4 items · 11:48–12:05, 16.4 min). Session 2: due 18 · fresh 8 ·
  done 32 · missed 6. One item (ある, 220 s) is a pause, not recall time.
  - **Writing recall, due words, first try: 21 / 22** (both sessions). ✗ 多分 (✓ on 2nd).
    いい: ledger says ✗ (8 s, session 1, session stopped right after); **learner-reported mis-tap —
    written correctly, graded wrong.** Counted ✓; ledger row left as exported (20 / 22 raw). Day-2/3 batch back after 3 days: する パン つける それ ある 人 バス これ 一 ゆうべ ✓.
  - New words first try: 6 / 8 (app dealt 8 fresh, not 10). ✗ **話** (3 attempts), **書く** (4).
    ✓ みんな 入れる パーティー けっこう おいしい 五.
    New kanji: 話 入れる 書く 五. New kana: みんな パーティー けっこう おいしい.
  - All 36 attempts: 29 ✓ / 7 ✗. Median 20.4 s.
  - Grammar + listening baseline: deferred by learner to week 2; bedtime routine starts then.

- **Day 6 — 2026-11-20** · N5 week-1 · 1 session (17:34–17:50), after the day-6 check ·
  due 26 · fresh 4 · done 41 · missed 11 · **16.5 min**
  - **Writing recall, due words, first try: 18 / 26.** ✗ あの 言う 行く (✗ twice) 来る いる けっこう
    書く 五 (8 s — likely the dakuten slip again).
    Week-1 verbs 言う 行く 来る all ✗ in writing after a 3-day gap, while all three were ✓ on
    reading in the checks. Writing and reading are drifting separately (cf. research/02).
  - New words first try: 3 / 4 (app dealt 4 fresh — due load is crowding out new words).
    ✓ おととい どこ とる · ✗ 買う (✓ on 2nd). New kanji: 買う only.
  - All 41 attempts: 30 ✓ / 11 ✗. Median 18.9 s.

- **Day 7 — 2026-11-21 · missed.** No pre-drill check, no drill, no ledger rows. First missed day.
  Effect: day-7 checks and day-6 new words' first check slide to day 8 (a 2-day gap, not 1 —
  day-6 first-probe numbers, incl. split word 買う, are not comparable to the 1-day ones).

- **Day 8 — 2026-11-22** · 1 session (19:04–19:13), after the day-8 check ·
  due 30 · **fresh 0** · done 30 · missed 0 · **8.8 min**
  - **Writing recall, due words, first try: 30 / 30.** Includes 言う 行く 来る (✗ in writing day 6)
    and おととい 買う とる (✗ on reading in this morning's check, corrected before the drill).
  - 言う: blank on reading in the morning check, ✓ in writing an hour later — the day-2 split again
    (writing ≠ reading), this time with the morning correction in between.
  - **No new words dealt — by design.** `lib/schedule.ts`: `PILE_MAX = 30`, due first, fresh only
    in the room left (rule 2). Due was 30 (day 7 missed → held words piled up), so fresh = 0.
    Effect: no split words today; no first-check words tomorrow.
    Arithmetic, not yet measured: on ladder 1·3·7·14·30 each learned word costs ~5 reviews, so at
    steady state due ≈ 5 × fresh and 6 × fresh ≈ 30 → **~5 new words/day**, fewer with misses.
    At that pace the N5 list (`public/words/n5.json`, 210 words) takes ~6 weeks after week 1.
    A pace question for doctrine, not a build item.
  - Median per attempt ~11 s; 新しい 116 s is a pause.

- **Day 9 — 2026-11-23** (week 2, Mon) · 1 session (16:39–16:50), after the day-9 check ·
  due 12 · fresh 10 · done 28 · missed 6 · **10.4 min**
  - **Writing recall, due words, first try: 12 / 12.** 前 そこ 電気 つとめる できる いい 多分 話 みんな
    入れる パーティー おいしい.
  - **New words first try: 6 / 10.** ✓ クラス ゆうめい 四 つかう もつ しる ·
    ✗ **飲む** (3 attempts), **だいじょうぶ** (2), **聞く** (2), **先** (3).
    New kanji: 飲む 聞く 四 先. New kana: クラス ゆうめい つかう もつ しる だいじょうぶ.
  - All 28 attempts: 22 ✓ / 6 ✗. Median 17.2 s. Words introduced to date: 73.
  - First fresh words since day 6 (pile had room: due 12).

- **Day 10 — 2026-11-24** (week 2, Tue) · 1 session (12:10–12:21), after the day-10 check ·
  due 10 · fresh 10 · done 28 · missed 8 · **11.1 min**
  - **Writing recall, due words, first try: 7 / 10.** ✓ 飲む クラス だいじょうぶ 聞く ゆうめい 四 しる ·
    ✗ つかう (2 attempts) · もつ (2) · **先 (3)**.
    Writing vs reading split again: しる ✓ in writing, blank in the morning check.
    先 ✗ twice in the drill right after the 先生 study trial (shared kanji).
  - **New words first try: 8 / 10.** ✓ ゼロ こちら 日 ところ つくる じぶん 今日 まだ ·
    ✗ **先生** (2 attempts) · **時間** (4).
    New kanji: 先生 日 時間 今日. New kana: ゼロ こちら ところ つくる じぶん まだ.
  - All 28 attempts: 20 ✓ / 8 ✗. Median 22.0 s (day 9: 17.2). Words introduced to date: 83.

## Time per day
<!-- added 2026-11-24 at the learner's request. Minutes. Drill = ledger sessions summed.
     Check = pre-drill check. Morning = the nightly point's morning items. Split A = same-day
     arm-A check. Night = nightly sheet (A–D + any sealed check). — = not timed. -->
| Day | Date | Check | Morning | Drill | Split A | Night | **Total (measured)** |
|---|---|---|---|---|---|---|---|
| 1 | 11-15 | — | — | 9.6 | — | — | **9.6** |
| 2 | 11-16 | — | — | 18.5 | — | — | **18.5** |
| 3 | 11-17 | — | — | 15.1 | — | — | **15.1** |
| 4 | 11-18 | — | — | 14.8 | — | — | **14.8** |
| 5 | 11-19 | — | — | 17.3 | — | — | **17.3** |
| 6 | 11-20 | — | — | 16.5 | — | — | **16.5** |
| 7 | 11-21 | missed | | | | | **0** |
| 8 | 11-22 | 11.2 | — | 8.8 | — | — | **20.0** |
| 9 | 11-23 | 8.9 | — | 10.4 | — | — (clock ~22:15 → after ~22:50, not timed) | **19.3** |
| 10 | 11-24 | 8.0 | 5.6 | 11.1 | — | 17.1 | **41.8** |

- Checks before day 8 were untimed; the grammar/listening baseline (day 9) is a one-off and not in
  the table. From night 2 on, time the night sheet and the split A check.

## Probes
- **2026-11-16 (day 2, after drilling) — receptive probe, cold, all 30 words**
  - Learner's observation that started it: of 何 行く 外 来る 見る, he could write all five in the
    drill but read + gloss only 何 and 見る. "Even if I am able to write the words in the drill,
    it doesn't mean I remember the reading and meaning."
  - Drill prompt format (learner's description): kana-only words show **English meaning only**;
    kanji words show **meaning AND reading**. So for kanji words the drill never asks for
    the reading or meaning — both are given. Only the shape is recalled.
  - **Kanji words (12), reading + meaning: 7 / 12.** Meaning alone 9 / 12.
    Day-1 kanji words only: 4 / 8. (今 食べる 新しい were introduced the same day.)
    ✗ 行く (iku, go — blank) · 外 (soto, outside — blank) · 来る (kuru, come — blank) ·
    二 read "nichi" (= 日; meaning ✓) · 言う read "au" (= 会う; actual いう/yuu; meaning ✓).
  - **Kana words (18), meaning: 15 / 18.** Excluding loanwords パン バス ホテル: 12 / 15.
    Day-1 kana words only: 10 / 12.
    ✗ それ → "there" (actual: that; "there" is そこ) · やる → "to come (casual)" (actual: do/give) ·
    なる → "to come" (actual: become). いる → "exist (animals, things)": counted ✓ — "exist" is right
    but it is for living things only (ある for objects). Homophone 要る (need) exists; if the drill
    prompt for いる is "need", this is ✗ and kana becomes 14 / 18. Check prompt and amend.
  - **Prediction tested:** if the kanji prompt giving away reading + meaning is the cause, kana
    words (where producing the word = retrieving its sound) should score clearly above kanji
    words. **Held: 83% vs 58%** (day-1 words: 83% vs 50%). Small n, one day; same-day words inflate
    the kanji score.
  - Finding (provisional): writing recall ≠ word knowledge. For kanji words the drill's prompt
    supplies the reading and meaning, so they are re-read, not retrieved. Consistent with
    direction-specific learning (receptive vs productive vocabulary, Nation; Webb ~2009) and the
    testing effect (Roediger & Karpicke 2006) — citations to be verified into `docs/research/`
    before any spec rests on them.
  - Second pattern: verbs. Kanji misses except 外 and 二 were verbs (行く 来る 言う); both kana
    misses on meaning were verbs (やる なる), both glossed "come" while 来る itself was unknown.
    Basic motion/action verbs are collapsing into each other. Watch, not a build item.
  - **Retest:** day 3 (2026-11-17), same 30, cold, BEFORE drilling. Spec trigger: kanji words stay
    ≤ ~60% while kana words hold → write a spec for hiding the reading on kanji prompts, with this
    probe as its baseline and the same probe as its falsifier.
- **2026-11-17 (day 3, before drilling) — receptive probe retest, cold, same 30 words**
  - **Kanji words (12), reading + meaning: 11 / 12.** Readings 12 / 12. Meaning 11 / 12.
    ✗ 来る: reading kuru ✓, meaning blank (actual: come). All five day-2 misses fixed on reading
    (行く iku, 外 soto, 来る kuru, 二 ni, 言う iu).
  - **Kana words (18), meaning: 17 / 18.**
    ✗ やる → "to become (casual)" (actual: do/give — corrected on day 2, still wrong; now carries
    なる's meaning). それ and なる fixed. いる → "need or to exist": ✓ (both are real verbs:
    要る / 居る), resolving the day-2 open item.
  - **Spec trigger not met** (kanji stayed ≤ ~60%: no, 92%). No spec.
  - **Confound — the probe is not clean.** Day-2 misses were corrected in-session (model gave the
    answers). Between the two probes there was no drill: the only exposure was one cold retrieval
    + corrective feedback. So the jump (kanji 7 → 11 / 12) measures the probe+feedback, not the
    drill. Read: one retrieval with feedback fixed all 5 kanji-reading misses (4 of 5 with
    meaning) that two drill days of seeing the reading had not. Consistent with the testing effect; n = 5 words, one learner,
    one day.
  - The day-2 finding (kanji prompts supply reading + meaning, so the drill does not retrieve
    them) is **neither confirmed nor refuted** by this retest: the treatment changed.
  - Verb slot: "come" is unattached. Day 2 it sat on やる and なる; day 3 it is gone from both and
    still not on 来る. 来る + やる are the two open items.
  - **Clean test next:** kanji words introduced in day-3's drill, probed cold on day 4 before
    drilling, with no probe or feedback in between. That isolates drill-only reading retention.

- **2026-11-18 (day 4, before drilling) — pre-drill check, 19 words, paper (photo)**
  - **Part 1 — first check of day-3 new words: 9 / 11.**
    Kana 6 / 6: ほんとう really/true · わたし I/me · テレビ television · どう how · くらい dark · この this.
    Kanji 3 / 5: 十 じゅう ten ✓ (small kana reads more like ょ than ゅ — learner to confirm) ·
    出る でる go out ✓ · 三 さん three ✓ · **後 ✗ blank** · **違う ✗ blank**.
  - **Split, first read (n tiny, not a result):** A (same-day check) 出る ✓ 三 ✓ 違う ✗ = 2 / 3 ·
    B (untouched) 十 ✓ 後 ✗ = 1 / 2. 違う was recalled in chat on day 3 and blank on day 4.
  - **Part 2 — due by check history: 6 / 8.** ✓ やる (to do, casual — first ✓ after three
    misses) · 行く いく go · 二 に two · 言う いう say · それ that · なる become.
    ✗ **来る — blank** (reading and meaning; day 2 blank, day 3 reading only, day 4 blank) ·
    ✗ **外 — そと ✓, meaning "last night"** (= ゆうべ; actual: outside).
  - **Total 15 / 19 as given; 15 / 18 valid.** Correction (agent error): the app's word is
    **ちがう, kana only** (ledger), not 違う. The check showed a kanji the drill never taught, so
    item 7 is void. Part 1 valid score: **9 / 10**; new kanji 3 / 4. ちがう leaves the split
    (kana words are not in it): A = 出る ✓ 三 ✓ (2 / 2) · B = 十 ✓ 後 ✗ (1 / 2).
    Rule: build every check list from the ledger's `word` field, exactly as the drill shows it.
  - 来る is the first leech: 3 checks, never ✓ in full. Its kanji has three readings in common
    verb forms (く る · き ます · こ ない), which may be part of it. Not a build item; a note.
  - Ink: テレビ written with レ leaning ル.
  - Next check due: 後 違う 来る 外 (✗) + every day-3 new word ✓ today (first ✓ → 1 day) +
    day-4 new words. やる 行く 二 言う それ なる → day 7. Day-2/3 ✓✓ batch (20) → day 6.
  - Grammar + listening baseline: not yet taken.

- **2026-11-19 (day 5, before drilling) — pre-drill check, 23 words, paper (photo)**
  - **Part 1 — first check of day-4 new words: 7 / 10.**
    Kana 5 / 6: ここ here · カメラ camera · その that (before noun) · そこ there · できる "available /
    possible" (✓; core meaning is can / be able to) · **✗ つとめる blank** (= work for, be employed;
    also the baseline-mock miss, item 7).
    Kanji 2 / 4: 多分 たぶん probably ✓ · 電気 でんき electricity ✓ · **✗ 入る blank** (はいる, enter —
    known as kana はいる at baseline; kanji→reading link missing) · **✗ 前 blank** (まえ, front/before —
    ✓ in the same-day A check yesterday).
  - **Part 2 — second check: 9 / 9.** ほんとう 十 じゅう(ゅ clear) わたし 出る でる テレビ どう 三 さん くらい この.
  - **Part 3 — re-checks: 4 / 4.** 後 あと later ✓ · **来る くる to come ✓** (first full ✓ after three
    misses) · 外 そと outside ✓ · ちがう to be different ✓ (first valid check).
  - **Total 20 / 23.**
  - **Split, running (n tiny):** day 4 A 電気 ✓ 前 ✗ · B 多分 ✓ 入る ✗.
    Cumulative first-probe: **A 3 / 4 · B 2 / 4.**
  - Day 5 split, pairs by type — verbs 書く/入れる, other 話/五 (each pair one hard, one easy):
    **A = 話, 入れる · B = 書く, 五.**
    Arm A same-day check: 話 はなし "speak / story" ✓ (noun: talk, story; "speak" is 話す) ·
    入れる いれる ✓ reading, meaning blank ✗ (put in). A: 1 / 2.

- **2026-11-20 (day 6, before drilling) — pre-drill check, 30 words (cap), paper (photo)**
  - **Part 1 — first check of day-5 new words: 5 / 8.** Kana 3 / 4: みんな everyone · パーティー
    party · おいしい delicious ✓ · **✗ けっこう blank** (fine / quite / no thanks).
    Kanji 2 / 4: 話 はなし story ✓ · **✗ 入れる** いれる ✓ reading, meaning blank (put in) ·
    **✗ 書く blank** (かく, write) · 五 ご five ✓ — written こ; learner: knew ご, dropped the dakuten in ink (recurring, see baseline "dakuten weight").
  - **Part 2 — missed last time: 1 / 3.** 前 まえ front ✓ · **✗ 入る → いる "need"** (はいる, enter) ·
    **✗ つとめる blank** (third miss).
  - **Part 3 — one ✓ so far: 11 / 12.** ✓ 多分 ここ カメラ その そこ 電気 できる ちがう 来る 外 やる ·
    **✗ 後 blank** (あと; ✗ d4, ✓ d5, ✗ d6).
  - **Part 4 — day-2/3 ✓✓, back after 3 days: 7 / 7.** 何 なに (confirmed; ink of に leans た) 見る 人 一 今 食べる 新しい.
  - **Total 24 / 30.** 15 kana week-1 words overflowed the cap → day 7.
  - **Interference, first clear case:** 入る was read いる "need" the morning after 入れる (いれる)
    was learned. Same kanji, new reading learned on top of an unsteady old one.
  - **Leech watch:** つとめる (3 ✗), 後 (2 ✗ of 3), 入る (2 ✗).
  - **Split, running first-probe:** day 5 A 話 ✓ 入れる ✗ · B 書く ✗ 五 ✓.
    Cumulative: **A 4 / 6 · B 3 / 6.** Still small n.
  - Day 6 split: one new kanji (買う), unpaired → **B** (no same-day check). No A word today.
  - Scheduling slip (agent): やる was due day 5 and left off; checked day 6 ✓.

- **2026-11-22 (day 8, before drilling) — pre-drill check, 40 words (new cap), paper (photo)**
  - **Time: 11:11 for 40 words (≈ 17 s / word)** — first timed check; just over the ~10 min line
    in `decisions.md` (2026-11-20). One data point; decide on the median of the next 3.
  - **Part 1 — first check of day-6 new words (2-day gap, day 7 missed): 1 / 4.** どこ where ✓ ·
    **✗ おととい → "yesterday"** (day before yesterday; yesterday = きのう) · **✗ 買う blank** (かう, buy) ·
    **✗ とる blank** (take). Split: 買う (B) ✗ — logged, excluded from the 1-day comparison.
  - **Part 2 — missed last time: 6 / 6.** 入れる いれる put in · けっこう fine/(no) thanks · 書く かく
    write · 入る はいる enter · **つとめる work for (first ✓ after 3 ✗; ink め→ぬ)** · 後 あと later.
  - **Part 3 — one ✓ so far: 6 / 6.** 話 はなし · みんな · パーティー · おいしい · 五 ご (dakuten ✓) · 前 まえ.
  - **Part 4 — ✓✓ after a day-2 miss: 4 / 5.** 行く 二 それ なる ✓ · **✗ 言う blank** (いう, say;
    ✓ on days 3–4 and 4 checks running, ✗ in writing day 6 too).
  - **Part 5 — overdue since day 6: 14 / 15.** **✗ あの → "this (before noun)"** (that … over there;
    discussed day 6). Rest ✓.
  - **Part 6 — due today: 3 / 4.** ほんとう 十 三 ✓ · **✗ 出る → "outside"** (でる ✓; meaning go out —
    "outside" is 外; was ✓ "go out" on days 4–5).
  - **Total 34 / 40.**
  - Pattern: misses are now mostly *mix-ups inside a family*, not blanks — おととい/きのう,
    あの/この, 出る/外. The new words are pressing on the old ones (interference, as 入る/入れる on day 6).

- **2026-11-23 (day 9, before drilling) — pre-drill check, 29 words, paper (photo)**
  - **Time: 8:55 for 29 words (≈ 18 s / word).** Second timed check (day 8: 17 s / word).
  - **Total 29 / 29** — first perfect check. Kanji 11 / 11 (reading + meaning), kana 18 / 18.
  - All day-8 misses ✓: おととい 買う とる (1-day re-check after the 2-day gap), あの, 言う, 出る.
    Leeches ✓: 来る つとめる 後 言う. Family pairs ✓: 入る/入れる, あの/この, 出る/外.
  - Counted ✓ with notes: 入れる written じれる — ink of い leans じ (baseline pattern), learner
    confirmed い · 出る "to go outside" (list: to go out) · できる "possible" (N5 sense: can do).
  - Split first-probe: none today (no new words on day 8).

- **2026-11-24 (day 10, before drilling) — pre-drill check, 16 words, paper (photo)**
  - **Time: 8:00 for 16 words (≈ 30 s / word)** — slower than days 8–9 (17–18 s); the three blanks.
  - **Part 1 — first check of day-9 new words: 6 / 10.** Kanji 3 / 4: 飲む のむ drink ✓ · 聞く きく
    listen ✓ · 四 よん four ✓ · **✗ 先 さき ✓ reading, meaning "?"** (ahead — blank again after the
    day-9 A check + correction). Kana 3 / 6: クラス class · ゆうめい famous · だいじょうぶ it's OK ✓ ·
    **✗ つかう blank** (to use) · **✗ もつ blank** (to hold) · **✗ しる blank** (to know).
  - **Part 2 — ✓ once after a day-8 miss: 6 / 6.** おととい 買う かう 言う いう 出る でる "to exit" とる あの.
  - **Total 12 / 16.** All three kana misses are verbs, all blanks (verbs again, as weeks 1–2).
  - 先: reading held, meaning lost overnight twice (A check d9 blank → corrected → blank d10). One
    correction did not fix it, unlike the d2→d3 kanji readings. n = 1.
  - **Split first-probe, day 9:** A 飲む ✓ (flagged: extra exposure night 1) · 先 ✗ → A 1 / 2 ·
    B 四 ✓ · 聞く ✓ void → B 1 / 1. **Cumulative: A 5 / 8 · B 4 / 7.** Still inconclusive.
  - Next checks: 11-25 → 先 つかう もつ しる (✗) · 飲む 聞く 四 クラス ゆうめい だいじょうぶ (first ✓ → 1 day) ·
    前 話 みんな パーティー おいしい 五 (handoff) · + day-10 new words (先生 ゼロ こちら 日 ところ 時間
    つくる じぶん 今日 まだ) = 26. 11-26 → 入れる けっこう 書く 入る
    つとめる 後 どこ. 11-27 → 何 見る 人 一 今 食べる 新しい + おととい 買う とる あの 言う 出る. 11-28 rest:
    anything due slides to 11-29. 11-30 → わたし テレビ どう くらい この 外 来る やる ちがう 多分 ここ カメラ
    その そこ 電気 できる.

## Experiments
- **Split: same-day reading check, from 2026-11-17** (`decisions.md`, same date)
  - Each day's new kanji words split in pairs (matched by type), one of each pair to A, one to B.
  - **A:** cold reading + meaning check right after the drill, with correction.
  - **B:** untouched until the next day's pre-drill probe.
  - Measure: next-day first-probe score, A vs B. B is also the clean drill-only number.
  - Day 3: A = 三, 出る · B = 十, 後. (Pairs: numbers 三/十, other 出る/後.)
    Plus 違う → A (learner recalled it in chat right after the extra session; unpaired).
    **Void 2026-11-18:** the drill word is ちがう (kana only), so it is not in the split.
    Arm A same-day check (right after drill): 三 san, three ✓ · 出る deru, to go out ✓ ·
    違う chigao(→chigau), to be different — meaning ✓, reading ✗ by one vowel. A: 2 / 3 full.
  - Day 4: pairs matched by type — compounds 電気/多分, single kanji 前/入る.
    **A = 電気, 前 · B = 多分, 入る.** A drew both of the day's hardest single-session words
    (前 6 attempts, 電気 4); B has 多分 (5) and the easy 入る. Biased *against* A: if A still wins,
    the case is stronger.
    Arm A same-day check: 電気 でんき electricity ✓ · 前 まえ front ✓ (also "before"). A: 2 / 2.

  - Day 9: pairs by type — verbs 飲む/聞く, other 先/四. **A = 飲む, 先 · B = 聞く, 四.**
    A takes the two 3-attempt words (biased against A, as day 4).
    Arm A same-day check: 飲む のむ to drink ✓ · 先 さき ✓ reading, **meaning blank** (ahead;
    corrected in chat). A: 1 / 2 full.
    **Contamination (night 1, logged 2026-11-23):** 聞く (B) was used in the sealed forms check
    (聞くません) the same night → **聞く void** for the split; its next-day check is not drill-only.
    飲む (A) was used in the form ladder (飲みます): one extra exposure beyond the A check → kept,
    flagged; decide keep/void when the split is read. Rule added: `decisions.md` 2026-11-23,
    "Building check and sheet items".
    **First probe (d10):** A 飲む ✓ · 先 ✗ (meaning) · B 四 ✓ · 聞く ✓ (void). A 1 / 2 · B 1 / 1.
  - Day 10: new kanji 先生 日 時間 今日. **日 and 今日 share a kanji, so they go to the same arm**
    (a same-day check of one would expose the other — arm B must stay untouched). Not type-matched
    pairs this time. **A = 先生, 時間 · B = 日, 今日.** A takes both drill misses (先生 2, 時間 4);
    B both first-try ✓ — biased against A, as days 4 and 9.
    Arm A same-day check: 先生 せんせい teacher ✓ · 時間 じかん time ✓. A: 2 / 2.

## Nightly (trial, `decisions.md` 2026-11-23)
- **Night 1 — 2026-11-23, ~22:15 · point: に (go to / arrive / get on).** Paper, self-graded, model-checked.
  - **に itself: 8 / 8** understood (B) or placed (C).
  - **B, JP → EN, full sentence: 2 / 4.** ✓ 5 タクシーにのりました ("entered/ride the taxi" — hedged
    with はいる) · ✓ 7 へやに入りました, but furigana written はじ over 入 (actual はい) ·
    ✗ 4 あの人はホテルに来ました → "This person went" (あの = that; 来る = come — the open "come"
    item from day 3, still unattached) · ½ 6 何にのりますか → "What did you ride?" (ます is
    non-past: will ride).
  - **C, EN → JP handwritten: 2 / 4.** ✓ 10 わたしはホテルに来ました · ✓ 11 わたしのへやに行きます ·
    ✗ 8 今はパスにのりす (バス dakuten written as handakuten パ; ます → す) ·
    ✗ 9 その人はうちにかります (かります = borrow; target かえりました, past).
  - Every miss is a **verb** (meaning, form or tense), none a particle. Same pattern as the week-1
    checks (verbs collapsing into each other).

  - **Sealed forms check, baseline (night 1, ~22:40; key in `docs/sealed-forms-check.md`): 3 / 8** ·
    0 marked as guesses. ✓ わかりました · のりません · ありました.
    ✗ 言うません (いいません) · 見ません for "didn't see" (みませんでした) · します for "did" (しました) ·
    held-out 聞くません (ききません) · held-out 出りません (でませんでした).
    Two separate gaps: **(a) the ます stem** — dictionary form kept before ます on u-verbs (言う, 聞く),
    り over-applied to a drop-る verb (出る); right only on り-verbs わかる のる ある. **(b) past and
    negative-past** — ませんでした 0 / 2, "did" given as します. Learner's romaji for 12 read
    "wakarimasen"; the sheet says わかりました; sheet scored.

  - **Form ladder (night 1, ~22:50, right after reading the rule): 5 / 5 on form.**
    行きませんでした · 食べました · 言いました · しませんでした · 飲みます.
    Kana slip: 食べる / 食べました written with katakana **バ** for hiragana べ (cue copied the same
    way). Same-session, rule just read: not learning evidence; the morning form item is.

  - **Night 1 morning items (2026-11-24, after the d10 check, cold, handwritten).** Built by the
    agent that morning (checked against d9 new words, arm B, sealed items).
    ✓ 17 Everyone came to the party → みんなはパーティーに来ました · ✓ 18 I entered the hotel →
    わたしはホテルに入りました · ✗ 19 書く → didn't write → **書ませんでした** (target 書きませんでした).
    **Point 2 / 2 · form 0 / 1.** Form gap split: past-negative ending ✓ (was 0 / 2 in the sealed
    baseline), **ます stem ✗** — き dropped after the kanji (書 = か only; 書き = かき). Same stem gap as
    言うません / 聞くません. Time: 13:34 cumulative from check start (learner
    confirmed) → **≈ 5:34 for the 3 items.**

- **Night 2 — 2026-11-24, ~00:50 → 01:07 (11-25 clock) · point: Minna L1 は…です · じゃありません · か.**
  Paper, photo, model-checked. **Time 17:06** (whole sheet, A–D) — over the ~13 min estimate and the
  15-min line in the fixed-shape rule; one night, watch.
  Words checked before sending against day-10 new words (先生 ゼロ こちら 日 ところ 時間 つくる じぶん
  今日 まだ) and arm B (日, 今日); 聞く 出る kept out of D.
  - **B, JP → EN: 4 / 4.** わたしはゆうめいじゃありません · それはテレビですか · ほんとうですか ·
    ここはホテルじゃありません ("Here/this is not a hotel").
  - **C, EN → JP: 4 / 4.** 11 "Is this a hotel?" → ここはホテルですか (target これは; ここ = this place —
    natural for a building you are at; counted ✓, noted).
  - **D, forms: 5 / 5.** 書きました · 買いません · 来ませんでした · 入りました · 食べません.
    書きました ✓ — the stem the morning item missed (書ませんでした) ~12 h earlier. べ in 食べる now
    hiragana (night 1: katakana バ).
  - At ceiling: L1 is mostly words already known. The morning items are the measure, not this sheet.

## Week 1 review — 2026-11-15 → 11-22
- **Drill:** 7 of 8 days · 100.6 min · 63 words introduced · 254 attempts, 193 ✓ (76%).
- **Writing recall, review words, first try, by day:** 11/20 · 16/19 · 13/14 · 21/22 (20 raw) ·
  18/26 · 30/30 → 55% → 84 → 93 → 95 → 69 → 100.
- **New words, first try:** 17/20 · 6/10 · 10/11 · 7/10 · 6/8 · 3/4 · 0/0.
- **Checks (reading/meaning, cold):** d2 22/30 · d3 28/30 · d4 15/18 · d5 20/23 · d6 24/30 ·
  d8 34/40 (11:11). Next-day first check of new words: 9/10 · 7/10 · 5/8 · (1/4 after 2-day gap).
- **Split:** A 4/6 · B 3/6 — inconclusive.
- **Mock re-measure:** none yet. No claim about JLPT score can be made from week 1.
- Against research: testing effect (one check + correction fixed d2 misses, kanji 7→11/12) ✓ ·
  direction-specific learning (writing ✓ predicted reading ✓ 4/7; 言う flipped d6/d8) ✓ ·
  spacing (words at 3-day+ gaps: d8 Parts 3–5 24/26) ✓ · same-day retrieval weak (A words 前,
  ちがう lost overnight) — consistent, n tiny · interference between similar words emerging
  (needs: source in `research/`) · sleep, grammar, listening: untested.

## Re-measurements
<!-- same mock, same rules, on a schedule decided in doctrine. Date · score · what changed since -->
