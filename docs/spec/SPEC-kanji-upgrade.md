# SPEC — a known kana word comes back as its kanji; the pile grows to 40

Status: **draft, agreed in workshop 2026-11-27 — build in week 3 (from Mon 2026-11-30).**
Rests on `docs/research/09-kana-to-kanji.md` and `docs/decisions.md` (2026-11-27 entries).
Read `AGENTS.md` before touching framework code. No doctrine exists; the three numbers in §2
(40, 10 + 3, three returns) are labelled defaults.

## 1. What the app does today (read from the code, 2026-11-27)

- `public/words/n5.json`: 210 words. 105 are asked in hiragana; 65 of those carry a `kanji`
  form that is only shown on the answer screen (`Loop.tsx`). Nothing ever asks for it.
- `lib/schedule.ts`: ladder 1 · 3 · 7 · 14 · 30 days (`LADDER_DAYS`), `NEW_CAP = 10`,
  `PILE_MAX = 30`. `deal()` takes every due word first, oldest first, then new words in the
  room left. After the 30-day review a word returns every 30 days for ever.
- Measured (`results.md`, days 8–13): a 30-word pile takes 7–11 minutes. Reviews filled the
  pile and cut new words to 4, 0 and 1 on days 6, 8 and 13.

## 2. Change

### 2.1 Which words upgrade (data)

35 words: every hiragana-asked word whose `kanji` uses only old Level 4 or Level 3 kanji
(the N5 and N4 ranges). In list order:

のる→乗る · わかる→分かる · わたし→私 · くらい→暗い · ゆうめい→有名 · つかう→使う · もつ→持つ ·
しる→知る · ところ→所 · つくる→作る · じぶん→自分 · もの→物 · かえる→帰る · すき→好き · まつ→待つ ·
はやい→早い · いろいろ→色々 · おわる→終わる · わるい→悪い · しごと→仕事 · おなじ→同じ · いみ→意味 ·
きる→切る · いえ→家 · ごはん→ご飯 · あさ→朝 · あるく→歩く · しゃしん→写真 · うる→売る · かお→顔 ·
たのしい→楽しい · あした→明日 · もんだい→問題 · おしえる→教える · つよい→強い

- Mark each in `n5.json` with `"upgrade": true`. The other 30 kana words with a `kanji` form
  (harder kanji: 難しい, 勤める, 覚える…) are not marked. They wait for the ledger's verdict (§5).
- The upgraded word is **derived, not a second list entry**: `write` = the kana word's `kanji`,
  `ask: "kanji"`, same `reading` and `meaning`, `kanji: null`, `upgradeOf` = the kana `write`.
  `Word` gains `upgrade?: true` and `upgradeOf?: string`.
- Item id stays the written word, so 乗る is a new item with its own history. No derived
  `write` collides with an existing one (checked against the list 2026-11-27).
- `scripts/verify-strokes.mjs`: the "every meaning is unique" check treats a kana word and its
  upgrade as one. `fetch-kanjivg.mjs` and `verify-strokes.mjs` must also read the kanji of
  marked words. About 38 kanji are new to the list, plus the repeat mark 々 (色々).
  `npm run strokes` then decides what is missing.

### 2.2 When a word upgrades

- **Eligible** when the kana item is at rung 4 or higher: it has been written correctly on
  three returns in a row (normally days 2, 5 and 12). A miss resets the rung, so the count
  starts again.
- **The swap happens on the upgrade's first write.** From that grade on the kana item is
  retired: `ItemState.retired = true`, never dealt again, never counted as due. Until then
  the kana item keeps its schedule.
- The upgrade is a new item in every respect: study trial first (the kanji draws itself, with
  reading and meaning, then melts), rung 1, due tomorrow, same ladder.
- No way back: if the kanji item is missed it goes to tomorrow like any word. The kana item
  stays retired.

### 2.3 What the upgraded word's prompt shows

**Meaning only**, with the script label `kanji`. Not the reading.

Why: `results.md` probe 2026-11-16 found kanji prompts hand over the reading, so it is never
retrieved. The learner already knows this word by sound; the prompt keeps asking for it. This
is what lets the kana item retire without losing practice. `promptFor()` returns no `reading`
when `upgradeOf` is set. The answer screen shows the reading as for any kanji word.

### 2.4 The pile

`PILE_MAX = 40`. Everything counts toward it: reviews, new words, upgrades.

A day's deal, in this order, each in the room the ones before leave:

1. **Young reviews**: due items at rung 1–3 (the returns on days 2, 5 and 12), and any miss.
2. **New words**: up to `NEW_CAP = 10`, list order.
3. **Upgrades**: up to `UPGRADE_CAP = 3`, in the list order of their kana words. They never
   take a new-word slot.
4. **Late reviews**: due items at rung 4–5 (the 14-day and 30-day returns, and the monthly
   ones after). Those that do not fit are held and are older tomorrow.

- **A late review held for 3 days is treated as young** on the next deal, so it cannot be
  pushed back for ever.
- Session order: young reviews, late reviews, upgrades, new words.
- MORE is unchanged: it adds new words, 10 at a time, until the pile is full. It does not add
  upgrades.
- State: `V7State` gains `upSpent?: { day, n }` beside `newSpent`. `parseState` carries
  `retired`. Version stays 2; both fields are optional.

### 2.5 Screens and copy

No new screen and no new element. Today's line counts upgrades inside `new`. The prompt's
script label already says `kanji`. Nothing tells the learner "this is an upgrade": the study
trial showing the kanji for a word he knows is the whole announcement. No Joker copy.

### 2.6 Ledger

`ItemRow` gains optional `upgradeOf?: string` on every row of an upgraded word. This is the
link the falsifiers in §5 read. Old rows are unchanged.

### 2.7 The pre-drill check (paper, manual)

An upgraded word is a new word for rule 2a of the check: first probe the day after its trial,
shown exactly as the ledger spells it (乗る). Kanji words are scored on reading and meaning.

## 3. Not in this build

- The old-word bucket (`decisions.md` 2026-11-27; nothing qualifies before about 2027-01-09).
- Hiding the kanji on the answer screen of a new kana word (`research/09` finding 6). Logged,
  not changed.
- A reading task in the app (backlog: Pre-drill review).
- The 30 harder kanji forms.

## 4. Gates

- `scripts/e2e-schedule.mjs`, new cases with fixed dates:
  1. a kana word at rung 3 is not eligible; at rung 4 its upgrade is dealt as a trial;
  2. grading the upgrade retires the kana item, which is then never due;
  3. no more than 3 upgrades in a day, and 10 new words are still dealt beside them;
  4. full pile: young reviews, then new, then upgrades, then late reviews; the late ones
     that do not fit are held;
  5. a late review held 3 days is dealt ahead of new words;
  6. a missed upgrade is due tomorrow and the kana item stays retired;
  7. pile never exceeds 40, with and without MORE.
- `scripts/e2e-loop.mjs`: an upgraded word's prompt shows the meaning and the label `kanji`
  and no reading; its trial draws the kanji; its ledger rows carry `upgradeOf`.
- `npm run strokes` (all marked kanji present), `npm run lint`, `npm run build`, `npm run e2e`.
- Phone: one real upgrade on iPhone Safari before the build is called shipped.

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

Read 1 and 2 at about 15 upgrades (two to three weeks). The verdict decides whether the
other 30 kanji forms are marked.

## 6. Build log (fill in the moment)

| Session | Start | End | Min | Prompts/sends | Stumbles | Cost |
| :-- | :-- | :-- | :-- | :-- | :-- | :-- |
| 1 | | | | | | |

## 7. Post-build audit
(fill in after the phone test)
