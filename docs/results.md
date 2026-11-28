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

- **Slip:** the learner knew the answer (said it aloud or names it at once) but the hand wrote
  something else — a wrong kana, a dropped mark, a dropped part of a form. Scored ✓ on the learner's
  confirmation, never moved forward in the schedule, and tagged **[slip]** so slips can be counted.
  Earlier cases logged before the tag: 五 → こ (d6), 入れる → じれる (d9), バ for べ (night 1).
  Form slips count too: a form recognised in English but written with a part missing.
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

- **Day 11 — 2026-11-25** (week 2, Wed) · after the day-11 check · **page refreshed mid-drill.**
  Ledger has one session row (16:31:22–16:36:24, 5.0 min: due 5 · fresh 5 · done 13 · missed 3); the
  pre-refresh part (22 items, 16:23:32–16:30:39) has items but no session row.
  **Drill time 12.9 min wall clock** (first item's start 16:23:32 → last item 16:36:24; includes
  ~43 s reload gap). Writing time (sum of attempt ms) 12.2 min. Pile: 25 due + 5 new = 30.
  /time shows **5 min** for this day (it sums session rows; the pre-refresh part has none). This
  table's 12.9 is the corrected number. Cause: mobile pull-to-refresh while tracing the reveal
  (learner) → fix `spec/SPEC-fix-overscroll.md`.
  - **Writing recall, due words, first try: 21 / 25.** ✗ 言う (2 attempts) · 書く (2) · 先生 (1 — its
    requeue was lost in the refresh, never re-attempted) · 時間 (3).
    時間: blank in the morning check and ✗ twice in the drill — reading and writing both weak.
  - **New words first try: 4 / 5.** ✓ 中 ページ もの 出す · ✗ あまり (2). New kanji: 中 出す.
  - All 35 attempts: 29 ✓ / 6 ✗. Median 15.6 s (day 10: 22.0). Words introduced to date: 88.

- **Day 12 — 2026-11-26** (week 2, Thu) · 1 session (21:52:59–22:00:05), after the day-12 check ·
  due 19 · fresh 10 · done 30 · missed 1 · **7:06**
  - **Writing recall, due words, first try: 18 / 19.** ✗ あまり (2 attempts; also blank in the check).
    出す ✓ in writing, meaning blank in the check (writing/reading split again).
  - **New words first try: 10 / 10** (first perfect new set). 六 ぜんぶ また 八 あそこ 上 カレー よく 多い
    だれ. New kanji: 六 八 上 多い. Look-alike pair now both live: まだ (d10) / また (d12).
  - All 30 attempts: 29 ✓ / 1 ✗. Median 12.1 s (fastest yet; d11 15.6). Words introduced to date: 98.

- **Day 13 — 2026-11-27** (week 2, Fri) · 1 session (12:27:10–12:35:29), after the day-13 check ·
  due 29 · fresh 1 · done 32 · missed 2 · **8:18**
  - **Writing recall, due words, first try: 27 / 29.** ✗ ちょっと (2 attempts) · あそこ (2).
    Writing/reading split, both directions: 八 よく あまり ✓ in writing, all three blank in the morning
    check; あそこ ✓ in the check, ✗ in writing.
  - **New words: 1 / 1** (高い). The pile was nearly all reviews (29 due + 1 new = 30).
  - All 32 attempts: 30 ✓ / 2 ✗. Median 11.9 s (fastest yet). Words introduced to date: 99.
  - /time: the learner entered today's check (9:37) and morning (3:26, corrected from 9:26) on the
    phone — ahead of the 11-29 start in `decisions.md` 2026-11-24.

- **2026-11-28 (Sat) · rest.** First planned rest day (`decisions.md` 2026-11-22). No check, no
  drill, no night sheet. Not a numbered drill day. Learner considered a drill-only day and chose to
  hold fixed 6 days through 12-19 (`decisions.md`, amendment 2026-11-28). Day-13 new word 高い gets
  its first check on 11-29 after a 2-day gap (n = 1 for the rest-day test this week).

## Time per day
<!-- added 2026-11-24 at the learner's request. All times m:ss (learner, 2026-11-26: no decimal minutes). Drill = ledger sessions summed.
     Check = pre-drill check. Morning = the nightly point's morning items. Split A = same-day
     arm-A check. Night = nightly sheet (A–D + any sealed check). — = not timed. -->
| Day | Date | Check | Morning | Drill | Split A | Night | **Total (measured)** |
|---|---|---|---|---|---|---|---|
| 1 | 11-15 | — | — | 9:38 | — | — | **9:38** |
| 2 | 11-16 | — | — | 18:28 | — | — | **18:28** |
| 3 | 11-17 | — | — | 15:08 | — | — | **15:08** |
| 4 | 11-18 | — | — | 14:49 | — | — | **14:49** |
| 5 | 11-19 | — | — | 17:17 | — | — | **17:17** |
| 6 | 11-20 | — | — | 16:29 | — | — | **16:29** |
| 7 | 11-21 | missed | | | | | **0:00** |
| 8 | 11-22 | 11:11 | — | 8:47 | — | — | **19:58** |
| 9 | 11-23 | 8:55 | — | 10:24 | — | — (clock ~22:15 → after ~22:50, not timed) | **19:19** |
| 10 | 11-24 | 8:00 | 5:34 | 11:05 | — | 17:06 | **41:45** |
| 11 | 11-25 | 13:13 (check + morning combined; not split) | ↑ | 12:52 | ~0:05 (learner est. 3–6 s; not in total) | 16:26 | **42:31** |
| 12 | 11-26 | 8:17 | 3:28 | 7:06 | 0:30 | 16:27 | **35:48** |
| 13 | 11-27 | 9:37 | 3:26 | 8:18 | — (split ended) | 15:00 | **36:21** |
| — | 11-28 | rest | | | | | |

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

- **2026-11-25 (day 11, before drilling) — pre-drill check, 26 words, paper (photo)**
  - **Time: check + morning items 13:13 combined.** Check alone not recorded (learner forgot);
    learner estimate ~2 min for the morning items — an estimate, not logged as a split.
  - **Part 1 — first check of day-10 new words: 9 / 10.** Kanji 3 / 4: 先生 せんせい teacher ✓ ·
    日 ひ day ✓ · 今日 きょう today ✓ · **✗ 時間 blank** (じかん, time — ✓ in the A check ~1 day before).
    Kana 6 / 6: ゼロ · ところ place · つくる to make · じぶん self · まだ not yet · こちら "come here"
    (✓ with note: list = this way (polite); direction right, "come" is not in the word).
  - **Part 2 — missed yesterday: 3 / 4.** **先 さき ahead ✓** (first ✓ after 3 misses) · もつ to hold ✓ ·
    しる to know ✓ · **✗ つかう blank** (to use — second blank).
  - **Part 3 — first ✓ yesterday, 1-day gap: 6 / 6.** 飲む 聞く 四 クラス ゆうめい だいじょうぶ.
  - **Part 4 — ✓✓, 3-day gap: 6 / 6 pending 1.** 前 まえ · みんな · パーティー · おいしい · 五 ご (dakuten ✓) ·
    話 はなし ✓ **[slip]** — written はんし; learner said "hanashi" aloud while writing, the hand
    produced ん for な. Scheduled as ✓ (learner's call: no slot tomorrow).
  - **Total 24 / 26** (1 slip).
  - **Split first-probe, day 10:** A 先生 ✓ · 時間 ✗ → 1 / 2 · B 日 ✓ · 今日 ✓ → 2 / 2.
    **Cumulative: A 6 / 10 · B 6 / 9.** 時間 is the third A word right in the same-day check and lost
    overnight (前 d4, 時間 d10; 先 was blank in its A check).
  - Next checks: 11-26 → 入れる けっこう 書く 入る つとめる 後 どこ · 時間 つかう (✗) · 先 もつ しる (first ✓
    after ✗) · 先生 日 今日 ゼロ こちら ところ つくる じぶん まだ (first ✓) · + day-11 new words.
    11-27 → 何 見る 人 一 今 食べる 新しい · おととい 買う とる あの 言う 出る. 11-28 rest → 11-29 gains
    飲む 聞く 四 クラス ゆうめい だいじょうぶ (✓✓, 3 days). 11-30 unchanged. 12-02 → 前 話 みんな パーティー
    おいしい 五 (✓✓✓, 7 days; 話 → 11-26 if ✗).

- **2026-11-26 (day 12, before drilling) — pre-drill check, 26 words, paper (photo)**
  - **Time: 8:17 for 26 words (≈ 19 s / word).** Morning items timed separately: 3:28.
  - **Part 1 — first check of day-11 new words: 3 / 5.** 中 なか inside ✓ (か written with marks
    that read as が; learner confirmed なか) · ページ page ✓ · もの thing ✓ · **✗ 出す だす ✓ reading,
    meaning blank** (to take out — answered at once in the A check ~1 day before) · **✗ あまり blank**
    (not very).
  - **Part 2 — missed yesterday: 2 / 2.** 時間 じかん time · つかう to use (first ✓ after 2 blanks).
  - **Part 3 — ✓ after a miss, 1-day gap: 3 / 3.** 先 さき ahead (✓✓ now) · もつ · しる.
  - **Part 4 — first ✓ yesterday, 1-day gap: 9 / 9.** 先生 せんせい (い leans じ, baseline ink) · 日 ひ ·
    今日 きょう · ゼロ · こちら "this way" · ところ · つくる · じぶん · まだ.
  - **Part 5 — ✓✓, 3-day gap: 7 / 7.** 入れる いれる put in · けっこう fine/(no) thanks · 書く かく ·
    入る はいる go in/enter · つとめる work for · 後 あと later · どこ. 書く and 入る had a first reading
    crossed out and rewritten (self-corrected on paper; counted ✓).
  - **Total 24 / 26.**
  - **Split first-probe, day 11:** A 出す ✗ (meaning) · B 中 ✓. **Cumulative: A 6 / 11 · B 7 / 10.**
    Third time running an A word right in the same-day check is lost by morning (時間 d10, 出す d11;
    前 d4). B now ahead; still under the ~12–14 per arm read point.
  - Next checks: 11-27 → 何 見る 人 一 今 食べる 新しい · おととい 買う とる あの 言う 出る · 出す あまり (✗) ·
    中 ページ もの (first ✓) · 時間 つかう (✓ after ✗) · + day-12 new words. 11-28 rest. 11-29 → the
    11-29 batch (21) + 飲む 聞く 四 クラス ゆうめい だいじょうぶ + 先 もつ しる + 先生 日 今日 ゼロ こちら ところ
    つくる じぶん まだ (✓✓, 3 days) = 39 + anything due 11-28 → **over the 40 cap: oldest first, rest
    slides to 11-30.** 12-02 → 前 話 みんな パーティー おいしい 五. 12-03 → 入れる けっこう 書く 入る
    つとめる 後 どこ.

- **2026-11-27 (day 13, before drilling) — pre-drill check, 30 words, paper (photo)**
  - **Time: 9:37 for 30 words (≈ 19 s / word).** Morning items timed separately: 3:26.
  - **Part 1 — first check of day-12 new words: 8 / 10.** Kanji 3 / 4: 六 ろく six ✓ · 上 うえ up ✓ ·
    多い おおい many ✓ · **✗ 八 blank** (はち, eight). Kana 5 / 6: ぜんぶ everything · また again ·
    あそこ that place over there · カレー curry · だれ who ✓ · **✗ よく blank** (often / well).
  - **Part 2 — missed yesterday: 1 / 2.** 出す だす to take out ✓ · **✗ あまり blank** (third blank).
  - **Part 3 — 1-day gap: 5 / 5.** 中 なか (か again reads as が; confirmed なか yesterday) · ページ ·
    もの · 時間 じかん · つかう.
  - **Part 4 — 3-day+ gap: 12 / 13.** 何 なに · 見る みる look · 人 ひと (と written like て — ink) ·
    一 いち · 今 いま · 食べる たべる · 新しい あたらしい · おととい · 買う かう · あの "that thing … over
    there" (✓: noun slot left as "thing"; あの used right in #31 and night 4) · 言う いう · 出る でる exit /
    go out. **✗ とる "?"** (to take — second blank, first d8).
  - **Total 26 / 30.**
  - **Split first-probe, day 12:** A 六 ✓ · 多い ✓ → 2 / 2 · B 八 ✗ · 上 ✓ → 1 / 2.
    **Final: A 8 / 13 (62%) · B 8 / 12 (67%).** Read point reached → verdict in Experiments.
  - Next checks: 11-28 rest. **11-29:** the 11-29 batch (21) + 飲む 聞く 四 クラス ゆうめい だいじょうぶ +
    先 もつ しる + 先生 日 今日 ゼロ こちら ところ つくる じぶん まだ (39) + 八 よく あまり とる (✗) + 出す
    (✓ after ✗) + 六 上 多い ぜんぶ また あそこ カレー だれ (first ✓) + 高い (day-13 new, first check) = 53 → **cap 40,
    oldest due first, the rest slide to 11-30** (which already has 16 + 中 ページ もの 時間 つかう).
    12-04 → おととい 買う あの 言う 出る. 12-11 → 何 見る 人 一 今 食べる 新しい.

- **2026-11-27 (day 13, after drilling) — set-phrase meaning baseline, 32 phrases, in chat**
  - Not a pre-drill check and not in its schedule. Phrase shown as written (kana), learner typed the
    English meaning; untimed; "?" = blank. One pass, corrected after scoring.
  - The list is **not a standard list**: 32 phrases chosen and tiered by the agent's judgment
    (workshop on extending the word queue). The app's N5 pool (718 entries) holds almost no set
    phrases; MLC counts 46 greetings but its list could not be read.
  - **Daily core: 10 / 10.** おはようございます · こんにちは · こんばんは · おやすみなさい · さようなら ·
    じゃあ また · ありがとうございます · どういたしまして · すみません · ごめんなさい.
  - **Everyday situations: 9 / 12.** ✓ はじめまして · どうぞ よろしく おねがいします · こちらこそ ·
    おねがいします · いただきます · ごちそうさまでした · ただいま · おかえりなさい · おげんきですか.
    **✗ いってきます → "let's go"** (actual: I'm off, said by the one leaving home) ·
    **いってらっしゃい "?"** (see you, said to the one leaving) · **しつれいします "?"** (excuse me,
    entering or leaving).
  - **Less common, service and occasions: 7 / 10.** ✓ いらっしゃいませ · おめでとうございます · もしもし ·
    おつかれさまでした · おひさしぶりです · けっこうです · しょうしょう おまちください.
    **✗ おだいじに "?"** (get well soon) · **ごめんください "?"** (anyone home?) ·
    **いかがですか "?"** (how about it? / would you like some?).
  - **Total 26 / 32.**
  - Measures recognition of meaning only; says nothing about producing the phrases. The coming-home
    pair (ただいま / おかえりなさい) was known, the leaving pair (いってきます / いってらっしゃい) was not.
  - No rule, no night-sheet slot and no retest date attached (learner, 2026-11-27: "matters a
    little"; reference table only).

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
    **First probe (d11):** A 先生 ✓ · 時間 ✗ (blank) · B 日 ✓ · 今日 ✓. A 1 / 2 · B 2 / 2.
  - Day 11: new kanji 中 出す (both ✓ first try), one pair. **A = 出す · B = 中.** 出す to A: verb,
    shares 出 with 出る (interference risk, d8 出る/外) — the likelier miss, so biased against A again.
    Arm A same-day check: 出す だす take out ✓. A: 1 / 1.
    **First probe (d12):** A 出す ✗ (reading ✓, meaning blank) · B 中 ✓. A 0 / 1 · B 1 / 1.
  - Day 12: pairs by type — numbers 六/八, other 上/多い (all four ✓ first try). **A = 六, 多い ·
    B = 八, 上.** A takes the two slower writes (多い 15.3 s, 六 8.6 s vs 八 8.4, 上 8.8) — biased against
    A as before. After d13's first probe: A 13 · B 12 words → read point reached.
    Arm A same-day check (0:30): 六 ろく six ✓ · 多い おおい many ✓. A: 2 / 2.
    **First probe (d13):** A 六 ✓ · 多い ✓ · B 八 ✗ · 上 ✓. A 2 / 2 · B 1 / 2.
  - **Verdict (2026-11-27, read point reached): A 8 / 13 (62%) · B 8 / 12 (67%) → A ≈ B.**
    Words by day: d3 A 2/2 B 1/2 · d4 A 1/2 B 1/2 · d5 A 1/2 B 1/2 · d9 A 1/2 B 1/1 (聞く void) ·
    d10 A 1/2 B 2/2 · d11 A 0/1 B 1/1 · d12 A 2/2 B 1/2. 買う (B, 2-day gap) excluded. With 飲む
    (flagged) voided: A 7 / 12 (58%). Either way no gain for A; A drew the harder words on 5 of 7 days,
    so a small A benefit can't be ruled out, but not a clear margin.
    Pattern inside A: 4 words right in the same-day check were lost by morning (前 d4, 入れる d5 —
    reading ✓ meaning ✗, 時間 d10, 出す d11). Same-day recall measures recency (Pyc & Rawson 2009, as
    cited in `decisions.md` 2026-11-17).
    **Per the decision's own rule ("if A ≈ B, drop the same-day check"): dropped from day 13.**
    No spec for a reading step in the drill. The next-day first check stays (it carried every number here).

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

  - **Night 2 morning items (2026-11-25, after the d11 check, cold, handwritten).**
    ✓ 27 That is not a camera → それはカメラじゃありません · ½ 28 Is that person over there famous? →
    **その人**はゆうめいですか (か question ✓; あの → その: "over there" is あの) · ✓ 29 とる → didn't take →
    とりませんでした (stem り ✓, past negative ✓).
    **Point (じゃありません / か) 2 / 2 · full sentences 1.5 / 2 · form 1 / 1.** Demonstratives are
    Minna L2 (night 4); あの/この/その is a known family mix-up (d8).

- **Night 3 — 2026-11-25, ~02:05 → 02:21 (11-26 clock) · point: Minna L1 の (N の N) · も.**
  Paper, photo, model-checked. **Time 16:26.** Learner labels sheets by night number (11-24 = night 2).
  Words checked before sending against day-11 new words (中 ページ もの 出す あまり) and arm B (中);
  聞く 出る kept out of D.
  - **B, JP → EN: 4 / 4.** クラスの時間 ("the class' time") · あの人も先生ですか · わたしのパンじゃ
    ありません · 今日はパーティーの日です.
  - **C, EN → JP: 4 / 4.** 先生のカメラ · わたしもゆうめいじゃありません · ホテルのバスですか ·
    これもわたしのパンです. の and も both placed right every time (6 / 6).
  - **D, forms: 4 / 5.** ✓ 飲みました · つかいません (photo looked like が; learner confirmed か — no slip) ·
    言いませんでした · つくりました. ✗ **いる → wasn't: いりません** (target いませんでした): two errors —
    (a) treated as a り-verb (いる is drop-る: i-sound before る), the same over-applied り as 出りません
    in the sealed baseline; (b) past dropped (wasn't → ません). ませんでした ✓ on 言う the same night.
  - Pattern after 3 nights: particle/sentence points at or near ceiling; the open gap is the drop-る
    stem (いる/出る), where the learner defaults to り.

  - **Night 3 morning items (2026-11-26, after the d12 check, cold, handwritten). Time 3:28.**
    27 That is my television → それはわたしの**テルビ**です (の ✓; テレビ written テルビ — レ/ル, known ink
    pair; **[slip]**, learner scores ½) · 28 That person over there is also famous → あの人も**ゆめい**です
    (も ✓, あの ✓; ゆうめい long vowel dropped — the exact baseline error; learner scores ½) ·
    ✓ 29 つける → didn't turn on → つけませんでした (drop-る stem ✓, past negative ✓).
    **Point (の / も) 2 / 2 · form 1 / 1 · learner's score 2 / 3** (27 ½ · 28 ½ · 29 1). Learner's
    rule here: a spelling slip inside a sentence costs half, even when known.

- **Night 4 — 2026-11-26, ~00:10 → 00:26 (11-27 clock) · point: Minna L2 これ/それ · この/その/あの
  (+ わたしの = mine).** Paper, photo, **self-graded in red: 11 / 13**, model-checked (agrees).
  **Time 16:27.** Words checked against day-12 new words (六 ぜんぶ また 八 あそこ 上 カレー よく 多い だれ)
  and arm B (八, 上); 聞く 出る kept out of D. あれ not yet in the drill → named, not used.
  - **B: 4 / 4.** それは何ですか ("What is that? (near you)") · このテレビはわたしのです · あの先生は
    ゆうめいです · そのクラスはいいですか.
  - **C: 3 / 4 (learner's grade).** ✓ これは何ですか · そのカメラはわたしのです · このパンはわたしの
    じゃありません. ✗ 10 あのホテルは新しい。 — です dropped. Correct casual Japanese; wrong for the
    sheet's polite register; learner marked ✗, kept. Demonstratives この/その/あの 4 / 4 right.
  - **D: 3 / 5.** ✓ 見ました · かえりませんでした (exception verb ✓) · 書きません.
    ✗ 13 いる → wasn't: **いません** — stem now ✓ (night 3: いりません), past dropped again.
    ✗ 15 つける → turned on: **つけりました** — り over-applied, though the morning item (~14 h earlier)
    had つけませんでした ✓.
  - Pattern: drop-る stem right 3 / 4 tonight but not stable (つける flipped ✓→✗ in a day). "wasn't" cue
    → ません on both tries (night 3, 4): the English past negative of be is read as present.

  - **Night 4 morning items (2026-11-27, after the d13 check, cold, handwritten). Time 3:26.**
    ✓ 31 That bus over there is new → あのバスは新しいです (あの ✓, です ✓ — dropped last night) ·
    ½ 32 This is not my camera → **このカメラはわたしのじゃありません** ("This camera is not mine" —
    correct Japanese, same idea; the item asked for これ standing alone: これはわたしのカメラじゃありません;
    learner may re-score) · ✓ 33 入れる → put in (past) → 入れました (drop-る past ✓; night 4 had つけりました).
    **2.5 / 3 · form 1 / 1.**

- **Night 5 — 2026-11-27, ~19:55 → 20:10 · point: Minna L3 ここ/そこ/あそこ · どこ.** Paper, photo,
  **self-graded in red: 10 / 13**, model-checked (agrees). **Time 15:00.** Last night in the fixed
  3·4·4·5 shape. Words checked against day-13 new (高い); 聞く 出る kept out of D.
  - **B: 4 / 4.** カメラはそこです · パーティーはどこですか · あそこはわたしのホテルです ("My hotel is
    over there") · ここはどこですか ("Where is this?").
  - **C: 4 / 4.** バスはどこですか · 先生はあそこです · カメラはそこですか · ここはクラスじゃありません.
    こ/そ/あ/ど place words 8 / 8 across B and C.
  - **D: 2 / 5.** ✓ いる → wasn't → **いませんでした** (third try; night 3 いりません, night 4 いません) ·
    ✓ できませんでした. ✗ つける → turned on → **つけりました** (night 4 the same; morning 11-26 ✓) ·
    ✗ 入れる → didn't put in → **入れりませんでした** (morning 11-27 入れました ✓) · ✗ もつ → hold →
    **もつます** (u-verb stem つ → ち missed).
  - **Pattern (n small):** drop-る stem right on **i + る** (いる, できる, 見る) but り added on
    **e + る** (つける, 入れる) in the night ladder — both right in morning items. Watch whether e + る
    holds in E/D from 11-29. "wasn't" → ませんでした now ✓.

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
