# Handoff — end of week 1 (2026-11-15 → 11-22) → next agent

Read with `CLAUDE.md` read order. Numbers live in `results.md`; decisions in `decisions.md`;
research in `research/02-direction-and-check-scheduling.md`. This file is only the bridge.

## Where week 1 ended
- Drill days: 7 of 8 (day 7, 11-21, missed). Words introduced: **63** (distinct `word` values in the 11-22 ledger).
- Day 8 drill: 30 / 30 first try, 8.8 min, **0 new words** (pile full — see Pace below).
- Day 8 pre-drill check: 34 / 40, **11:11** (first timed check; cap rule says decide on the median
  of the next 3).
- Grammar + listening baseline (JLPT N5 sample, jlpt.jp/e/samples/sample09.html): **not taken**.
  Bedtime routine waits on it (learner: week 2).

## Running routines (manual, in chat)
0. **Saturday is rest** (`decisions.md` 2026-11-22): no check, no drill; log as rest. Next: 11-28.
1. **Pre-drill check** (`decisions.md` 2026-11-17, amended 11-17, 11-18, 11-20). Learner sends the
   ledger export; agent returns ≤ 40 words, spelled exactly as the ledger `word` field; learner
   answers on paper (photo), timed; agent scores, corrects, logs under `results.md` → Probes.
   Schedule from **check history only**: ✗ → next day; consecutive ✓ → 1 · 3 · 7 · 14 days.
2. **Split experiment** (`results.md` → Experiments). New kanji words paired by type; A gets a
   same-day reading check after the drill, B untouched. Read after ~12–14 words per arm.
   Cumulative 1-day first-probe: **A 4 / 6 · B 3 / 6.** 買う (B, 2-day gap) excluded. No new
   words on day 8 → nothing added.
3. Log each drill day under `results.md` → Log from the ledger (session times are UTC+7).

## Check state for the next checks (computed from all checks through 11-22)
- **11-23 (29 words, no new words exist):** あの · 言う · 外 · 来る · やる · 出る · わたし · テレビ · どう ·
  くらい · この · 後 · ちがう · 多分 · ここ · カメラ · その · そこ · 電気 · できる · 入る · つとめる · 入れる ·
  けっこう · 書く · どこ · おととい · 買う · とる
- **11-25:** 前 · 話 · みんな · パーティー · おいしい · 五
- **11-27:** 何 · 見る · 人 · 一 · 今 · 食べる · 新しい
- **11-29:** する パン つける いい ある もう バス これ ゆうべ ちょっと ホテル いる のる わかる · 行く 二 それ なる ·
  ほんとう 十 三
- Plus whatever the app introduces as new from 11-23 (first check the next day; kanji → split).

## Findings that should shape doctrine (provisional, small n)
- Writing recall ≠ reading recall. Kanji prompts show the reading, so the drill never retrieves it
  (day-2 probe kanji 7/12 vs kana 15/18). Each skill fades on its own clock (言う: reading ✗ /
  writing ✓ on day 8; the reverse on day 6).
- One cold check + correction fixes most reading misses next day.
- Misses have shifted from blanks to **family mix-ups** (入る/入れる, おととい/きのう, あの/この, 出る/外).
- Leech history: 来る (3 ✗, now ✓✓), つとめる (3 ✗, now ✓), 後 (✗✓✗✓), 言う (reading ✗ on day 8).
- Recurring ink: dropped dakuten (五 → こ), め/ぬ, レ/ル, に/た. Counted ✓ when learner confirms.

## Open questions for week 2 (one at a time)
1. **Pace / target date.** `PILE_MAX = 30` (`lib/schedule.ts`) → ~5 new words/day at steady state
   (estimate). Learner asked about 40; agent said measure a week (fresh per day, total minutes)
   and ask: which JLPT N5 sitting (July / December)? Not decided.
2. Check cap 40: keep or trim (move ✓✓✓ kana to 14-day gaps) on the median of the next 3 times.
3. Grammar + listening baseline → pick the bedtime exercise (one point/night, known words only,
   recalled in the next morning's check). Never uses that day's new drill words.
4. Post-drill "one sentence" idea (option 1, 11-17) — offered, never accepted. Parked.

## Housekeeping
- Repo changes this week are **uncommitted**: `docs/results.md`, `docs/decisions.md`,
  `docs/backlog.md`, `docs/HANDOFF.md` (pointer to decisions.md), `docs/research/02-…`, this file.
- Project copy of `results.md` (claude.ai Project) is stale since day 3 — repo wins.
- Suggest adding `docs/decisions.md` to the project instructions' read order (learner edits those).
- Agent slips this week, all logged: 違う shown for ちがう (rule added), やる left off day 5.
