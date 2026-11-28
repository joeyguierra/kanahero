# SPEC — a known kana word comes back as its kanji; the pile grows to 40

Status: **BUILT 2026-11-28, not shipped: the phone gate (§4) is open and nothing is committed or
deployed.** Drafted 2026-11-27, reviewed against the code and
re-ruled in workshop 2026-11-28 (§9 lists what changed). Build in week 3 (from Mon 2026-11-30).
Rests on `docs/research/09-kana-to-kanji.md` and `docs/decisions.md` (2026-11-27 entries and the
2026-11-28 amendment). No doctrine exists; the numbers in §2 (40, 10 + 3, three returns, 3 days)
are labelled defaults, not findings.

**Builder, read first:** `AGENTS.md` (this Next.js differs from training data), then
`lib/schedule.ts`, `lib/store.ts`, `lib/words.ts`, `lib/ledger.ts`, `app/page.tsx`,
`components/Loop.tsx`, `components/Today.tsx`, `scripts/e2e-schedule.mjs`. `lib/` stays DOM-free.
Do not touch `WritingCanvas.tsx` or `lib/strokeAnimator.ts`. Function and field names below are
suggestions unless they are in a data file or the ledger; the behaviour is the spec.

## 1. What the app does today (read from the code, 2026-11-28)

- `public/words/n5.json`: 210 words. 105 are asked in hiragana; 65 of those carry a `kanji`
  form that is only shown on the answer screen (`Loop.tsx`). Nothing ever asks for it.
  `docs/research/01-n5-week1-words.json` is a byte-identical copy.
- `lib/schedule.ts`: ladder 1 · 3 · 7 · 14 · 30 days (`LADDER_DAYS`), `NEW_CAP = 10`,
  `PILE_MAX = 30`. `deal()` takes every due word first, oldest first, then new words in the
  room left. After the 30-day review a word returns every 30 days for ever.
- `lib/store.ts`: `itemsFor(state, order)` builds the scheduler's items from the list order
  only; `applyGrade` counts every first write as a new word (`newSpent`).
- `app/page.tsx`: `order = words.map(w => w.write)`; `Loop` finds a word by its written form.
- Measured (`results.md`, days 8–13): a 30-word pile takes 7–11 minutes. Reviews filled the
  pile and cut new words to 4, 0 and 1 on days 6, 8 and 13.

## 2. Change

### 2.1 The upgrade path (the rule in four steps)

1. **Kana first.** のる enters as a new word and climbs the ladder like any word.
2. **Known, and parked.** When the kana item reaches rung 4 (written correctly on three
   returns in a row, normally days 2, 5 and 12) it is *known*. If the word is marked for
   upgrade, the kana item is **parked**: it is never dealt again. There is no 14-day or 30-day
   review of a marked kana word.
3. **The kanji comes next, from the following day.** 乗る is dealt as a new item: study trial,
   rung 1, same ladder. It cannot be dealt on a day its kana item was written. Up to 3 upgrades
   a day.
4. **The kanji then lives a normal life.** A miss sends it to tomorrow like any word. The kana
   item never comes back.

So a kana word and its kanji can never be in the same drill, and after three correct returns
in a row the next time the learner meets the word it is the kanji.

Words asked in kanji from the start (電気, 後) and kana words without a mark are unchanged:
they keep the whole ladder.

### 2.2 Which words upgrade (data)

35 words: every hiragana-asked word whose `kanji` uses only old Level 4 or Level 3 kanji
(the N5 and N4 ranges). Recomputed from `n5.json` and the `kanji-data` level lists on
2026-11-28: same 35, same order. In list order:

のる→乗る · わかる→分かる · わたし→私 · くらい→暗い · ゆうめい→有名 · つかう→使う · もつ→持つ ·
しる→知る · ところ→所 · つくる→作る · じぶん→自分 · もの→物 · かえる→帰る · すき→好き · まつ→待つ ·
はやい→早い · いろいろ→色々 · おわる→終わる · わるい→悪い · しごと→仕事 · おなじ→同じ · いみ→意味 ·
きる→切る · いえ→家 · ごはん→ご飯 · あさ→朝 · あるく→歩く · しゃしん→写真 · うる→売る · かお→顔 ·
たのしい→楽しい · あした→明日 · もんだい→問題 · おしえる→教える · つよい→強い

- Add `"upgrade": true` to each of the 35 in **both** `public/words/n5.json` and
  `docs/research/01-n5-week1-words.json`. The two files stay byte-identical.
- The other 30 kana words with a `kanji` form (harder kanji: 難しい, 勤める, 覚える…) are not
  marked. They wait for the verdict (§5) and keep the whole ladder meanwhile.
- `Word` gains `upgrade?: true` and `upgradeOf?: string`.

### 2.3 The upgraded word is derived, not a list entry

- One pure function in `lib/words.ts` (e.g. `upgradesOf(words)`) returns, for each marked
  word, a derived `Word`: `write` = the kana word's `kanji`, `ask: "kanji"`, same `reading`,
  `meaning`, `romaji` and `pos`, `kanji: null`, `upgradeOf` = the kana `write`.
- The item id stays the written word, so 乗る is a new item with its own history. No derived
  `write` collides with a list `write` (checked 2026-11-28).
- **Three places must know about the derived words, and they differ:**
  - *The loop's word lookup* (`Loop` `byId`) gets list words **and** derived words, or an
    upgraded item shows as a blank word.
  - *The scheduler's items* (`itemsFor`, `nextDue`, Today's counts) include the derived ids, or
    an upgraded word is never due again after its trial.
  - *The new-word order* stays the 210 list words only. A derived word is never dealt as an
    ordinary new word.
- Where list order is used to break ties, a derived word takes its kana word's position.

### 2.4 The scheduler

`PILE_MAX = 40`. `NEW_CAP = 10`. New: `UPGRADE_CAP = 3`. Everything written counts toward the
pile: reviews, new words, upgrades.

**Definitions** (all derived at deal time from the items and the word marks; no new stored flag):

| Term | Meaning |
| :-- | :-- |
| known | a seen item at rung ≥ 4 |
| parked | a kana item that is marked `upgrade` and known. Never due: left out of every due list, the held count, `nextDue` and Today's counts, whatever its `due` says |
| eligible upgrade | a derived item that is unseen, whose kana item is parked and was **not written today** (`lastDay < today`) |
| waited upgrade | an eligible upgrade whose kana item was last written 4 or more days ago (`today ≥ lastDay + 4`): it could have been dealt on 3 earlier days and was not |
| young review | a due item at rung 1–3 (the returns on days 2, 5 and 12, and any miss) |
| late review | a due item at rung 4–5 (the 14-day and 30-day returns and the monthly ones after) |
| held late review | a late review 3 or more days past its due date (`today ≥ due + 3`). **Rest days and missed days count.** |

**A day's deal, in this order, each in the room the ones before leave:**

1. **Young reviews, with held late reviews among them.** Oldest due first, then list order.
2. **Waited upgrades**, list order.
3. **New words**, up to `NEW_CAP`, list order.
4. **Other eligible upgrades**, list order.
5. **Late reviews** not yet held, oldest due first. Those that do not fit stay due and are
   older tomorrow.

- Steps 2 and 4 together deal at most `UPGRADE_CAP` upgrades on a day. Upgrades never use up
  `NEW_CAP`; a waited upgrade only takes room a new word would have had when the pile is short.
- A waited upgrade does **not** outrank young reviews. If young reviews alone fill the pile it
  keeps waiting (learner, 2026-11-28).
- **Session order:** young reviews (held late reviews among them), late reviews, upgrades, new
  words.
- **MORE** is unchanged in kind: it adds new words, 10 at a time, until the pile is full (now
  40). It never adds upgrades.
- A deal left half-way (✕, reload) and dealt again must not hand out more than the day's caps:
  count upgrades first written today the way `newSpent` counts new words.

### 2.5 State and grading

- `V7State` gains `upSpent?: { day, n }` beside `newSpent`. Version stays 2; the field is
  optional and `parseState` carries it. No `retired` flag: parking is derived (§2.4).
- `QueueItem` needs to say an item is an upgrade (e.g. `up?: true`). On an upgrade's first
  write `applyGrade` adds to `upSpent`, **not** `newSpent`.
- `grade()` is unchanged: an upgrade's first write is a study trial (rung 1, due tomorrow)
  whether graded ✓ or ✗; a miss on any later day sends it to rung 1.
- `roomLeft` already counts every item written today, so upgrades take their place in the 40.

### 2.6 What the upgraded word's prompt shows

- **Study trial (first exposure):** unchanged from any kanji word. The kanji draws itself, with
  the reading and the meaning, then melts.
- **Every later prompt, and SHOW PROMPT on the write screen:** the meaning only, with the script
  label `kanji`. **No reading.** This includes the same-session retry after a missed trial.
- The answer screen shows the reading as for any kanji word.

Implementation note: today `Loop.tsx` takes the trial's reading from the same `promptFor()` cue
as the prompt. So the cue for a word with `upgradeOf` must still carry the reading on a trial and
drop it otherwise (e.g. `promptFor(word, trial)`), or the trial loses its reading.

Why meaning only: `results.md` probe 2026-11-16 found kanji prompts hand over the reading, so it
is never retrieved. The learner already knows this word by sound; the prompt keeps asking for it.
This is what lets the kana item stop without losing practice.

### 2.7 Screens and copy

No new screen and no new element. Nothing tells the learner "this is an upgrade": the study
trial showing the kanji for a word he knows is the whole announcement. No Joker copy.

- **Today's line:** `N due · M new`, with upgrades counted inside `new`.
- **The spread** (`Today.tsx` `Spread`): today 1–7 cards make one row, 8–20 two, 21–30 three.
  Add: **31–40 make four rows** (40 = four rows of ten). The existing breakpoints stay.
- The `next:` line's cap follows `PILE_MAX` (40).

### 2.8 Ledger

- `ItemRow` gains optional `upgradeOf?: string`, written on **every** row of an upgraded word
  (trial and all later rows). This is the link the falsifiers in §5 read.
- `SessionRow` gains optional `up?: number`: how many of the session's `fresh` were upgrades.
  `fresh` keeps counting every trial, upgrades included (they are "new" on Today).
- Old rows are unchanged. `/time` reads session times only and must behave as before.

### 2.9 Outside the app (agents, paper) — not for the builder

- **New words per day** in `results.md` = a session's `fresh` − `up`. The pace against July
  2027 counts list words only. (Learner, 2026-11-28: revisit this tagging later.)
- **Pre-drill check:** an upgraded word is a new word for rule 2a: first probe the day after its
  trial, shown exactly as the ledger spells it (乗る), scored on reading and meaning. From that
  first probe on, the kana word (のる) leaves the check queue, so the two never share a check.
- **Log the ship date** in `results.md`: from that day the pile is 40 and first-try numbers
  include upgrades.

## 3. Not in this build

- The old-word bucket (`decisions.md` 2026-11-27; nothing qualifies before about 2027-01-09).
- Extra new-word slots on days young reviews fill the pile (40 + 3) — `backlog.md` 2026-11-28.
- Hiding the kanji on the answer screen of a new kana word (`research/09` finding 6).
- A reading task in the app (backlog: Pre-drill review).
- The 30 harder kanji forms.
- Starting kanji-first words (電気, 後) in kana. Not ruled; the verdict in §5 informs it.
- Changing what the item id is. It stays the written word.

## 4. Gates

**Stroke data and word data**
- `scripts/fetch-kanjivg.mjs` also reads the `kanji` of marked words. Its `isKanji` range
  leaves out the repeat mark **々 (U+3005)**, needed for 色々; KanjiVG has it (`03005.svg`).
- `scripts/verify-strokes.mjs` also checks: every character of every derived `write` has a
  stroke file; no derived `write` equals a list `write` or another derived `write`; the two
  word files are byte-identical. The "every meaning is unique" check stays as it is (derived
  words are not in the JSON).
- 38 stroke files are missing today: 乗私暗有使持知所作自物帰好待早色々終悪仕事同意味切家飯朝歩写真売顔楽
  問題教強 (明 already has one). `npm run strokes` must end clean.

**`scripts/e2e-schedule.mjs`** — the existing cases assert a pile of 30 (the two numbers, room
30, "never past 30", "more than 30 due", `count: 30`): update them to 40. New cases, fixed dates:
1. a marked kana word at rung 3 is dealt as a young review and its upgrade is not eligible;
2. at rung 4 it is parked: not due, not held, not in `nextDue`, even past its `due` date;
3. its upgrade is not dealt on the day the kana word reached rung 4; it is dealt the next day
   as a trial;
4. an unmarked kana word at rung 4 keeps its late reviews;
5. no more than 3 upgrades in a day, across two deals on the same day too, and 10 new words
   are still dealt beside them; an upgrade's first write moves `upSpent`, not `newSpent`;
6. full pile: young reviews, then waited upgrades, then new, then other upgrades, then late
   reviews; late reviews that do not fit are held;
7. an upgrade becomes "waited" on the 4th day after its kana word's last write and is then
   dealt ahead of new words; with young reviews alone filling 40 it still waits;
8. a late review 3 days past due is dealt among the young reviews, ahead of new words; a rest
   day in between counts;
9. an upgraded word returns for review on its own ladder after the trial (it is in the
   scheduler's items), and a missed upgrade is due tomorrow while the kana item stays parked;
10. the pile never exceeds 40, with and without MORE; MORE never deals an upgrade;
11. session order is young, late, upgrades, new;
12. `promptFor`: an upgraded word's cue has the reading on a trial and none otherwise.

**`scripts/e2e-loop.mjs`** — step 7 ("the pile stops at 30") moves to 40. New: an upgraded
word's trial draws the kanji with reading and meaning; its later prompt and SHOW PROMPT show
the meaning and the label `kanji` and no reading; its ledger rows carry `upgradeOf`; the session
row carries `up`; Today shows four rows at 31–40 cards.

**Then:** `npm run strokes`, `npm run lint`, `npm run build`, `npm run e2e` (all four scripts,
`e2e-time` included).

**Phone (the real gate):** one real upgrade on the learner's phone before the build is called
shipped, and a look at Today with more than 30 cards (four rows fit above the button).

## 5. Falsified by

1. **"Knowing the word first helps."** Compare upgraded kanji with ordinary kanji-asked words
   first met in the same weeks: attempts to first ✓ on the trial day, and first-try ✓ on the
   next day's return. If upgrades are no better after about 15 of them, the premise fails for
   this learner; stop at 35 and reopen the rule.
2. **The meaning-only prompt.** First pre-drill probe (reading + meaning) of upgraded words
   against ordinary kanji words, whose prompt shows the reading. Upgrades should score at
   least as well. If they score clearly higher, that is the case for dropping the reading
   from every kanji prompt.
3. **The 40 pile.** A full-pile session passes 20 minutes, or first-try ✓ on due words falls
   below its week-2 level in `results.md`.
4. **Letting late reviews wait.** Late reviews written after being held miss clearly more
   often than late reviews written on time.
5. **Parking the kana word at rung 4.** Upgrades whose kana word waited longer between its last
   write and the kanji trial miss clearly more on the trial day than those dealt the next day.
   (The ledger gives the gap: kana item's last row → the upgrade's first row.)

Read 1 and 2 at about 15 upgrades. **That is about mid-December, not two weeks:** only 12 of the
35 words were introduced by day 13, and each needs three correct returns first. The verdict
decides whether the other 30 kanji forms are marked.

## 6. Shipping

- Deploy **before** a day's drill, not after it: a day that already has 30 written would show a
  stray MORE for the ten new places.
- On the first day, a marked kana word already at rung 4 is parked at once. If it was last
  written 4 or more days earlier its upgrade is already "waited". Expected and fine.

## 7. Build log (fill in the moment)

| Session | Start | End | Min | Prompts/sends | Stumbles | Cost |
| :-- | :-- | :-- | :-- | :-- | :-- | :-- |
| 1 (2026-11-28) | not logged | 07:18 | not logged | 1 | one new test asserted the wrong thing about the `next` line (test fixed, code unchanged) | not logged |

## 8. Post-build audit
(fill in after the phone test)

**Builder's notes, 2026-11-28 (before the phone test).** Gates run: `npm run strokes` (38 files
added, 262 / 262 OK), `npm run lint`, `npm run build`, `npm run e2e` (schedule 39 cases, time,
loop steps 1–9, offline) all pass. Where the spec left a choice, this is what was built:

- **SHOW PROMPT never shows an upgrade's reading**, on the trial's own write screen too (§2.6
  read literally). The reading is on the trial's drawing and on the answer screen only.
- **`QueueItem.upgradeOf`** (the kana word) instead of `up: true`: one field marks the upgrade
  for `applyGrade` and gives the ledger row its link. It is on review items as well as the trial.
- **`SessionRow.up` is written on every new session row**, 0 included, so a row without it is a
  row from before this build.
- **A parked kana item with no `lastDay`** (not possible from the app, possible from hand-edited
  storage) counts as written long ago: its upgrade is eligible and waited.
- **Upgrades in one deal are in list order**, waited or not; "waited" only decides whether they
  are taken before or after the new words.
- `Deal` gained `ups`; `todayView` / `buildQueue` take a deck (`deckOf(order, pairs)`) instead of
  the bare order. `/verify` still lists list words only.

## 9. What changed from the 2026-11-27 draft (workshop 2026-11-28)

- **The kana item stops at rung 4** (parked), instead of keeping its schedule until the
  upgrade's first write. Learner: after three correct returns in a row, the next is always the
  kanji; a kanji and its kana never share a drill. The `retired` flag is gone; parking is derived.
- **An upgrade is never dealt on the day its kana word was written.**
- **An upgrade that has waited 3 days moves ahead of new words** (not ahead of young reviews).
- **"Held 3 days" is defined:** 3 or more days past due; rest days count.
- **Today's spread:** four rows for 31–40 cards.
- **Both word files are marked** and must stay identical (audit of the word data: `backlog.md`,
  end of week 4).
- **Session rows carry `up`**; upgrades stay inside `new` on Today.
- Found in review, now specified: derived words must reach the scheduler's items and the loop's
  lookup (§2.3); an upgrade's first write must not spend a new-word slot (§2.5); the trial must
  keep its reading (§2.6); 々 is outside the fetch script's kanji range (§4); existing tests
  assert 30 (§4); ship before the day's drill (§6); verdict date moved to mid-December (§5).
