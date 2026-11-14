# Research 01 — the N5 word list, week one (2026-11-14)

Answers `01-handoff-n5-word-list.md`. Companion file: `01-n5-week1-words.json` (210 words in
drill order). Nothing here is doctrine. Confidence legend as in survey 00: **A** meta-analysis
or multiple replications · **B** a few controlled studies · **C** single study, review essay,
unverified citation, or my own reasoning. Sources marked *(abstract)* were not read in full.

## 0. What changed in the brief before the research ran

Agreed with the learner on 2026-11-14 and recorded in the handoff (§3 amendment):

- **One pile, floating size, 30 words max.** Reviews and misses first, then up to 10 new words
  in the room left under 30. No new words on a day reviews fill the pile. Extra work adds new
  words up to 30, never past it. Over 30 due: oldest first, the rest slide a day.
- So the list is **one priority order**. Positions 1–70 are week one if nothing is missed;
  71–210 are the following weeks, not a "maximum week".
- Added constraint: **every `meaning` and every `write` is unique** across the list, because a
  kana word is prompted by its meaning alone and the item id is the written word.
- **Amended 05:40: length and stroke count no longer affect the order.** The first draft
  sorted each frequency band cheapest-first. That delayed frequent long words (おもしろい,
  かわいい and おぼえる by 14 positions, コーヒー by 30, エレベーター by 40) on a cost argument
  with no finding behind it for kana and only grade C for kanji. The learner's ruling: the
  app's handling of long words must not outrank frequency. Order is now frequency alone.
- **Amended 06:40: rivals are no longer kept apart.** The second draft held opposites,
  look-alikes and sound-alikes at least ten positions apart, which put 八 about 37 positions
  late, 百 32, 七 30, and どこ and そこ about 16. The evidence for separation is mixed (§1.3).
  The learner's ruling: rivals fall where frequency puts them. The groups are kept in §8 and
  in the `note` fields as things to watch in the ledger, not as an ordering rule.

## 1. The three rules

### 1.1 Selection rule

1. **Pool:** a community N5 list (717 entries; J. Waller's list as packaged in
   `open-anki-jlpt-decks`). It is not official.
2. **Drop what the drill cannot ask as one word:** particles, affixes and counters (～人, ～時,
   一つ…十日), interjections and fillers (ああ, ええ, はい), multi-word phrases, する-compounds,
   units (メートル, グラム). Drop the second member of any same-kana pair (要る, 着る, 速い, 熱い)
   so that `write` stays unique.
3. **Rank what is left by frequency in everyday conversation** (NINJAL Corpus of Everyday
   Japanese Conversation, short-unit lemma table, overall rank) and take from the top, one
   script stream at a time (rule 1.3 fixes the share of each script).
4. **Measured misses go in regardless of rank:** the nine unknown words from the baseline
   mock (required by the handoff), plus the two words the baseline production check shows
   mis-written (ゆうめい, パーティー). The second clause is my addition; strike it if unwanted.

Where the rule cut this time: hiragana stream to conversation rank 387, kanji stream to rank
631, katakana stream to rank 1,506. Katakana reaches deeper because the pool has few katakana
words and every run of ten needs one.

| Finding | Source | Grade |
| :-- | :-- | :-- |
| JLPT has published no vocabulary or kanji list since 2010; it says a list "was not necessarily appropriate". A learner able to pass old Level 4 can pass N5. | JLPT FAQ (read) | A (primary source) |
| Every "N5 list" is therefore a reconstruction. Waller's is over ten years old and its packager calls it "an educated guess". Another compiler (MLC) builds 802 words from the official workbook (449), old Level 4 (307) and greetings (46). | yomitan-jlpt-vocab README (read); MLC page (snippet) | B for "lists are unofficial"; C for any one list's accuracy |
| NINJAL researchers judge the old Level 4/3 vocabulary lists out of step with present-day use and call for new elementary lists. | NINJAL repository record 2000522 *(abstract)* | C |
| High-frequency words first is the settled starting point in L2 vocabulary teaching; the same review notes little research testing corpus lists in use. | Dang, Webb & Coxhead, review section (partial read) | B |
| Frequency predicts which words learners know, but only partly (about 28–29 % of variance in one large study; age of acquisition did better). | Temple dissertation, Japanese EFL learners *(abstract)* | C |
| A beginner word list can be built by taking the top of a corpus frequency list and removing function words, formulaic items and words without a plain translation. | Welsh 300-word study (read via summary) | C (precedent, not a test) |
| All four N5 vocabulary item types turn on one content word: reading a kanji word, choosing the kanji or katakana for a kana word, a word fitted to context, a paraphrase. | JLPT "Composition of test items" N5 (read); official sample in `results.md` | A (primary source) |

**What the rule does not claim.** It does not show any single word is right. It also does not
predict the baseline nine: by conversation frequency つとめる is rank 1,998, おととい 2,422 and
ゆうべ is outside the top 4,000. They are on the list because the mock asked them, which is
teaching to an 8-item sample. Kept as instructed; flagged in §4.

**Falsified by:** on an unseen N5 文字・語彙 form, items whose key word was drilled are
answered no better than items whose key word was not.

### 1.2 Form rule

- **katakana** if the word is written in katakana.
- **kanji** if the word's normal written form uses kanji **and every kanji is on the old
  Level 4 list (103 kanji)**. Kanji plus okurigana counts as kanji (新しい, 食べる, 女の子).
- **hiragana** otherwise. The `kanji` field carries the usual kanji form when one is in common
  use, so the answer screen can show it (つとめる → 勤める). Words normally written in kana
  (する, ある, これ, きれい) carry `null`.

Two things settled by testing the handoff's starting point:

- **Which kanji list.** The two community lists disagree: the "new N5" list in circulation has
  79 kanji, the pre-2010 Level 4 list has 103. The 24 extra are 会 分 口 古 多 安 少 店 手 新 目
  社 空 立 耳 花 言 買 足 週 道 飲 駅 魚. On the 79 list 新しい would not qualify for kanji, yet
  the official sample asks its reading. The 103 list is used.
- **"Normally written in kana" is my judgment**, word by word. I could not load a dictionary's
  usually-kana flags in this session. The cases to check are in the `note` fields
  (あげる, つける, かかる, かける, おととい, ゆうべ).

| Finding | Source | Grade |
| :-- | :-- | :-- |
| Productive learning of word pairs gives larger gains in written-form knowledge, both receptive and productive, than receptive learning; receptive learning gives larger gains in recognising meaning. | Webb 2009 *(abstract)* | B |
| Beginners taught characters from the start outperformed a delayed group on reading and character writing, with no loss in speaking. A reply points out the early group also had about 10 more hours of character teaching. | Knell & West 2017 *(abstract)*; Krashen 2017 (read) | C (Chinese, secondary school, confounded) |
| Stroke count tracks difficulty in *writing* kanji more closely than in recognising them. | Hatasa 1989 *(abstract)* | C |
| In handwriting by Vietnamese learners, writing time rose with stroke count and accuracy fell on complex kanji, most for weaker learners. | Frontiers in Language Sciences 2026 *(abstract)* | C |
| Handwriting builds the form–meaning link; it does not train readings. | Survey 00, row 5 (Guan, Meng & Perfetti 2015) | B |
| The N5 section tests kanji both ways: kanji → reading and kana → kanji/katakana. | JLPT composition table (read) | A |

**Not found:** any controlled study of *when* a beginner in Japanese should start handwriting
a word's kanji instead of its kana. The rule is therefore a test-coverage rule (write the
kanji the level tests). Stroke count is a real cost in writing (grade C) but it does not gate
or delay a word. Grade for the rule as a whole: **C**.

**Falsified by:** kanji-asked words missing at more than twice the rate of hiragana-asked
words at the 7-day rung, or no gain on the orthography items of the next mock.

### 1.3 Ordering rule

1. **Fixed script pattern, period ten:** H K H K カ H K H K H (H hiragana, K kanji, カ
   katakana). Any ten consecutive words, from any starting point, hold 5 hiragana, 4 kanji and
   1 katakana.
2. **Inside each script stream, strict frequency order.** Length and stroke count play no
   part, in selection or in order.
3. **Simpler relative first.** A word waits for its simpler relative (人 before 一人 before
   二人; 入る before 入れる; 日 before 時間; 電気 before 電話 and 電車). If the simpler one is due
   later by frequency it is pulled forward.
4. **Measured misses sit in the first 70,** spread out: no run of ten holds more than three.

Rivals (opposites, look-alikes, sound-alikes) are **not** separated; see §0 and §8.

The pattern's 5 : 4 : 1 share is not a finding. It matches the official sample (of 8 items, 4
turn on a kana word, 3 on a kanji word, 1 on a katakana word) and the katakana share of the
pool (58 of 717). Grade **C**.

| Finding | Source | Grade |
| :-- | :-- | :-- |
| Studying semantically related words together: six studies found harm, one none, four a benefit. The best-controlled recent study found no difference in scores but more interference errors for related words. | Nakata & Suzuki 2019 (abstract and literature review read) | B, mixed |
| Semantic clusters (eye, nose, ear) hindered learning; thematic clusters helped. | Tinkham 1997 *(abstract)* | B |
| Semantic clustering hurt adult beginners in particular. | Papathanasiou 2009, as reported in a 2022 review (secondhand) | C |
| Mixing helps discrimination of look-alike categories; for word–translation pairs blocking wins (g = −0.39). | Survey 00, row 4 (Brunmair & Richter 2019) | A, material-specific |
| Set size (4, 10 or 20 words at once) has little effect when spacing is equal; spacing matters more. | Nakata & Webb 2016 *(abstract)* | B |
| Stroke count predicts writing difficulty (see 1.2). Not used for order: it says complex kanji are harder to write, not that meeting them later helps. | Hatasa 1989; 2026 handwriting study | C |

What still moves a word off its frequency place (measured on this list, in slots of its own
stream; one kanji slot is about 2.5 list positions):

- **Clause 3, simpler relative first,** and nothing else. It pulls 先 forward 29 kanji slots
  to sit before 先生, and 日 forward 3 to sit before 今日 and 時間. Every other kanji word is
  within 2 slots of its frequency place. Hiragana and katakana are in exact frequency order.
- Clause 3 has no finding behind it (component-first ordering is in "not found" below). It
  is kept because it costs each displaced word at most two slots. If 先 jumping the queue is
  unwanted, dropping the 先 → 先生 link restores pure frequency for it.

Where the rivals now land, for the ledger to watch: 入る 44 and 入れる 54 · ここ 43, その 46,
そこ 48 · まだ 83 and また 91 · 万 104 and 百 107 · 大きい 114 and 小さい 117 · 左 207 and
右 209.

What follows from these: separation is at best cheap insurance against interference errors
(B, mixed), topic neighbours need no separation (B), and the size or make-up of a day's ten
matters less than the spacing the ladder already gives (B). Look-alike kanji are the unclear
case: interference says apart, discrimination practice says together. With separation
dropped, the list sides with neither; it follows frequency.

**Not found:** evidence for any particular proportion of scripts in a session; evidence that
learning a kanji's components first speeds handwriting in Japanese beginners (I did not reach
the radical-awareness literature this pass).

**Falsified by:** frequency-only order is wrong about rivals if misses on the pairs listed
above are mostly the rival itself (入れる written for 入る, また for まだ, 右 for 左). That would
be the case for bringing separation back, pair by pair.

## 2. The load (handoff §4.4)

| Finding | Source | Grade |
| :-- | :-- | :-- |
| 300 Welsh words in 50 days at 10 minutes a day (about 6 new a day), self-managed paper cards: mean productive recall about 39 % at the end, 31 % about 17 days later; receptive recall higher. 23 of 40 volunteers finished. | Swansea study (read via summary) | C |
| One motivated learner took 300 Arabic words in 20 days (15 a day) and recalled 94 % of forms immediately after. | Fitzpatrick, Al-Qarni & Meara 2008, as cited there (secondhand) | C |
| 30–100 word pairs an hour can be learned receptively. | Nation 1980, as cited in Elgort 2011 (secondhand) | C |
| More retrievals in one sitting raise scores, but with time held equal one retrieval per sitting was the most efficient. | Nakata 2017 *(abstract)* | B |
| Set size does not matter once spacing is equal. | Nakata & Webb 2016 *(abstract)* | B |

- **10 new a day is defensible.** It sits inside the 6–15 a day that has been studied, though
  none of those studies used handwriting or Japanese. Grade C.
- **30 new a day was not defensible** and the amended rule removes it. Nothing I found studies
  that rate with production, and the ladder turns it into 90 reviews a day within a week.
- **A 30-word pile is arithmetic, not a finding.** Run against the ladder (one simulated run per
  row, 210 words, 10 new a day, cap 30, misses drawn at random):

| Miss rate on reviews | New words by day 7 | Word 210 introduced on | First day with no new words |
| :-- | :-- | :-- | :-- |
| 0 % | 70 | day 30 | day 12 |
| 15 % | 66 | day 37 | none in two weeks; new words drop to 2–9 on six days |
| 30 % | 65 | day 53 | day 13 |

- **One write per word per day is supported** (Nakata 2017): the loop's "session ends when the
  deal is empty, no re-deal" is the efficient choice, not a compromise.
- **Not found:** seconds per handwritten word for a beginner, in any study. Only the ledger can
  give it. The spec's own test stands: the pile is too big if it passes 20 minutes by week 3.

## 3. The list at a glance

210 words: 105 hiragana, 84 kanji, 21 katakana. 86 nouns, 48 verbs, 29 adjectives, 16
pronouns, 14 numerals, 13 adverbs, 4 determiners. Mean length 2.4 characters; longest 6
(だいじょうぶ, エレベーター). Kanji words average 7.4 strokes of kanji; the heaviest is 電話 (26).

| Order | Words |
| :-- | :-- |
| 1–10 | する 何 あの 言う パン つける 行く いい 外 それ |
| 11–20 | ある 来る もう 人 バス これ 一 ゆうべ 見る やる |
| 21–30 | なる 今 ちょっと 二 ホテル いる 食べる のる 新しい わかる |
| 31–40 | ほんとう 後 わたし 十 テレビ どう 出る くらい 三 この |
| 41–50 | ちがう 多分 ここ 入る カメラ その 前 そこ 電気 つとめる |
| 51–60 | できる 話 みんな 入れる パーティー けっこう 書く おいしい 五 おととい |
| 61–70 | どこ 買う とる 飲む クラス だいじょうぶ 聞く ゆうめい 四 つかう |
| 71–80 | もつ 先 しる 先生 ゼロ こちら 日 ところ 時間 つくる |
| 81–90 | じぶん 今日 まだ 中 ページ もの 出す あまり 六 ぜんぶ |
| 91–100 | また 八 あそこ 上 カレー よく 多い だれ 高い あれ |
| 101–110 | いつ 一人 かえる 万 コーヒー すき 百 いちばん 学校 いっしょ |
| 111–120 | まつ 下 いや 大きい トイレ おく 小さい あげる 七 おもしろい |
| 121–130 | はやい お金 たいへん 二人 バター こんな 目 いろいろ 会う どちら |
| 131–140 | おわる 安い こども 車 テスト わるい 手 しごと 読む かわいい |
| 141–150 | かかる 会社 おなじ 名前 スポーツ もっと 長い いみ 今年 きる |
| 151–160 | つぎ 本 いえ 大学 スプーン すぐ 話す おぼえる 水 かける |
| 161–170 | ほしい 九 どうぞ 半 エレベーター きのう 電話 きれい 店 ごはん |
| 171–180 | むずかしい 千 あさ 少し タクシー どれ 少ない むこう 駅 いたい |
| 181–190 | あるく 見せる しゃしん 電車 シャツ そちら 山 ともだち 半分 うる |
| 191–200 | ねる 男 あなた 休み テーブル かお 立つ たのしい 後ろ わすれる |
| 201–210 | あした 毎日 もんだい 女の子 レストラン おしえる 左 ちょうど 右 つよい |

Baseline nine, by position: つける 6 · 外 9 · ゆうべ 18 · のる 28 · 新しい 29 · くらい 38 · 電気 49 · つとめる 50 · おととい 60.
Measured mis-writes: パーティー 55 · ゆうめい 68.

For the builder:

- `kanji` is `null` for every kanji-asked and katakana-asked word, as the schema says.
- Readings chosen where a kanji has several: 何 なに · 四 よん · 七 なな · 九 きゅう · 日 ひ ·
  後 あと · 外 そと · 先 さき · 話 はなし · 中 なか · 上 うえ · 下 した. Alternatives are in `note`.
- `pos` values used: noun, verb, i-adjective, na-adjective, adverb, pronoun, determiner, numeral.
- Romaji follows the existing sets (`atarashii`, `yuube`); ー doubles the vowel (`koohii`).
- Old sets: all nine `n5-mock-words` are here. From the others only 日, 人, 水, 今日, 今年 and
  ちょっと recur. `calendar-kanji` asks 一昨日, 昨日 and 明日 in kanji; this list asks おととい,
  きのう and あした in hiragana, because 昨 and 明 are not Level 4 kanji.
- The list was assembled and checked by script: 210 entries, unique `write` and `meaning`,
  5/4/1 in every one of the 201 runs of ten, every simpler relative ahead of its compound, every written kanji
  on the Level 4 list and Jōyō, every `kanji` field Jōyō, baseline nine inside 70. All pass.

## 4. Where the evidence argues against section 3

1. **The measure cannot judge this list.** The mock has 8 items, the learner has seen the key,
   and the nine words drilled first are the ones it turned on. A re-take can reach 8/8 with
   201 words untested. JLPT publishes two full-length Official Practice Workbooks (2012 and
   2018), free on jlpt.jp, each with about as many questions as a real test. I confirmed the
   page, not the N5 file. Proposal: keep the 8-item re-take, and add one workbook's 文字・語彙
   section, unseen, as the measure the list is judged by.
2. **The test is recognition; the drill is production.** Webb 2009 says productive practice
   carries over to recognising written forms, which covers the two kanji item types. It says
   receptive practice is better for recognising *meaning*, which is what the other two item
   types ask. Survey 00 already logged the readings gap. Not an argument against the drill;
   an argument that the mock may move less than the ledger.
3. **"Nothing is assumed known" will make week one mostly easy.** Frequency-first selection
   plus a learner whose kana production is near ceiling means most of the first 70 are words
   he already writes. The cost is time, not learning, and the ladder retires them. The built
   placement path (blind first write, straight to rung 2) was the cheaper answer for such
   words. My reasoning, grade C. Worth one look after the first week's ledger: how many of the
   70 were never missed.
4. **The baseline nine are there by instruction, not by rule** (§1.1).
5. **"Mix the three scripts every day" has no evidence for or against it.** It is harmless on
   what I found (set make-up matters little once spacing is equal), and the share is arbitrary.

## 5. Looked for and not found

- An official N5 word or kanji list after 2010. None exists.
- The 2004 Test Content Specification itself. I used the Level 4 kanji list as distributed in
  the open `kanji-data` set (103 kanji, the count usually given for the specification).
- Item counts per question type for the current N5 paper. The official composition table I
  could read gives types and time (20 minutes), not counts.
- A written-Japanese frequency list (BCCWJ) in a form I could load. Ranking is by conversation
  only; a written corpus would rank kanji compounds higher.
- Dictionary flags for "usually written in kana" (§1.2).
- When beginners should start writing kanji; script proportions; component-first ordering;
  seconds per handwritten word (each noted above).
- Full texts: every source marked *(abstract)*.

## 6. Collocations met (left off the list, for a later build)

タクシーに のる · バスに のる · 電気を つける · 会社に つとめる · しゃしんを とる · 電話を かける ·
時間が かかる · お金が かかる · ごはんを 食べる · 水を 飲む · 話を 聞く · 学校に 行く · いえに かえる.

## 7. Rerunning the rule (week two, N4)

- **Week two and on:** continue each stream from its cut (hiragana from rank 388, kanji from
  632, katakana from 1,507), add any word missed on a re-measurement, keep the pattern. The kanji stream has about 50 qualifying words left in the pool, so the
  4-in-10 kanji share cannot last past roughly position 330 without changing the kanji gate.
- **N4:** swap the pool for the community N4 list and the gate for the old Level 3 kanji list.
  Everything else stands. Expect the hiragana stream to thin and the kanji stream to carry
  more of each ten.

## 8. Rival groups (not used for order; kept to read misses against)

Numbers (一…万, ゼロ) · こ/そ/あ/ど words · question words · する/やる · ある/いる · 行く/来る/かえる ·
入る/入れる/出る/出す · 見る/見せる · 言う/話/話す · 読む/書く · 食べる/飲む · 買う/うる · わかる/しる ·
おぼえる/わすれる · 上/下 · 右/左 · 前/後/後ろ · 中/外 · 大きい/小さい · 多い/少ない · 高い/安い ·
いい/わるい · すき/いや · おもしろい/たのしい · むずかしい/たいへん · ちょっと/少し · もう/まだ ·
今日/きのう/あした/おととい/ゆうべ · 今年 · わたし/あなた · 一人/二人 · 男/女の子 · 手/目/かお ·
車/電車/バス/タクシー · 学校/大学 · パン/カレー/ごはん · 水/コーヒー · 半/半分.
Look-alikes: 人/入/八 · 日/目/百 · 十/千/半 · 小/少 · 今/会 · 言/話/読 · 電気/電話/電車 ·
まだ/また · かかる/かける/かえる/かお · つける/つとめる/つくる/つかう/つぎ/つよい.

## 9. Every distinct character in the 210 words (166)

**Kanji (75):** 一七万三上下中九二五人今休会何先入八六出分前十千半右名四外多大女子学安小少山左年店後手新日時書本来校毎気水生男百目社立聞行見言話読買車金長間電食飲駅高

**Hiragana (59):** あいうえおかがきぎくぐけげこごさしじすずせぜそぞただちっつでとどなねのはばぶへべほぼまみむめもゃやゆょよらりるれろわん

**Katakana (32):** ィイエカクコシジスゼタツテトバパヒビブプベペホポメャラルレロンー

Against `public/strokes` on branch `v7` today (200 files): all hiragana and katakana are
present except **ー**. **56 kanji have no stroke file:** 七万三上下九二五休会何八六分前十千半右名四
多女子学安少山左店手時書本校毎生男百目社立聞行見言話読買車長間食飲駅高. All are Jōyō.

## Sources

- [JLPT FAQ](https://www.jlpt.jp/e/faq/)
- [JLPT N5 composition of test items](https://www.jlpt.jp/e/guideline/pdf/n5_e_revised.pdf)
- [JLPT Official Practice Workbooks](https://www.jlpt.jp/e/samples/sampleindex.html?mode=pc)
- [yomitan-jlpt-vocab (Waller's lists, limitations)](https://github.com/stephenmk/yomitan-jlpt-vocab)
- [open-anki-jlpt-decks (N5 list used)](https://github.com/jamsinclair/open-anki-jlpt-decks)
- [kanji-data (Level 4 kanji list, stroke counts)](https://github.com/davidluzgouveia/kanji-data)
- [CEJC frequency table as redistributed](https://github.com/forsakeninfinity/CEJC_yomichan_freq_dict)
- [MLC N5 vocabulary, 802 words](https://www.mlcjapanese.co.jp/n5_04_01.html)
- [NINJAL record 2000522, elementary vocabulary lists](https://repository.ninjal.ac.jp/records/2000522)
- [Dang, Webb & Coxhead, high-frequency word lists](https://eprints.whiterose.ac.uk/154599/8/1362168820911189.pdf)
- [Temple dissertation, high-frequency word knowledge](https://scholarshare.temple.edu/server/api/core/bitstreams/f5facb5b-6922-4a0b-b223-81784b755afc/content)
- [Webb 2009, receptive and productive learning of word pairs](https://synapsesocial.com/es/papers/6a1104f7eeb8b66439168593)
- [Knell & West 2017](https://zendy.io/title/10.1111/flan.12281) · [Krashen 2017 reply](https://mail.sdkrashen.com/content/articles/2017_early_vs_delayed_.pdf)
- [Hatasa 1989](https://ideals.illinois.edu/items/23205)
- [Kanji handwriting in Vietnamese learners, 2026](https://www.frontiersin.org/journals/language-sciences/articles/10.3389/flang.2026.1705688/full)
- [Nakata & Suzuki 2019](https://resolve.cambridge.org/core/journals/studies-in-second-language-acquisition/article/effects-of-massing-and-spacing-on-the-learning-of-semantically-related-and-unrelated-words/F58BA8D70385603B9C42E408BFCB8A10)
- [Tinkham 1997](https://synapsesocial.com/papers/W2038339147)
- [Semantic clustering review, Frontiers 2022](https://frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2022.997951/full)
- [Nakata & Webb 2016](https://eld.bl.uk/catalog/100035972466_0x000001)
- [Nakata 2017](https://www.cambridge.org/core/journals/studies-in-second-language-acquisition/article/does-repeated-practice-make-perfect-the-effects-of-withinsession-repeated-retrieval-on-second-language-vocabulary-learning/F14BA8A576CD2563D14CEA46E35D842E)
- [Welsh 300-word study, Swansea](https://cronfa.swansea.ac.uk/Record/cronfa70085/Download/70085__34940__f9c82663de464ac89f96c2f7296415ab.pdf)
- [Elgort 2011](https://www.lextutor.ca/freq/lists_download/elgort_2011.pdf)
