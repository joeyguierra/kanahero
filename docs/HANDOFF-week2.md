# Handoff — end of week 1 (2026-11-15 → 11-22) → next agent

Read with `CLAUDE.md` read order. Numbers live in `results.md`; decisions in `decisions.md`;
research in `research/` (02 check scheduling · 03 listening · 04 pitch · 05 sleep and timing ·
06 daily study time). This file is only the bridge. **Last updated 2026-11-24 (day 10).**

## Where week 1 ended
- Drill days: 7 of 8 (day 7, 11-21, missed). Words introduced: **63** (distinct `word` values in the 11-22 ledger).
- Day 8 drill: 30 / 30 first try, 8.8 min, **0 new words** (pile full — see Pace below).
- Day 8 pre-drill check: 34 / 40, **11:11** (first timed check; cap rule says decide on the median
  of the next 3).
- Grammar + listening baseline: **taken 2026-11-23** (`results.md` → Baseline 2): 文法・読解 8 / 13
  (grammar 4 / 9, reading 4 / 4, 12 of 13 guessed), 聴解 2 / 4. The sample is now contaminated;
  the sealed particle check (5 / 7) and sealed forms check (3 / 8) are the retests, on or after
  2026-12-21.

## Week 2 so far (through day 10, Tue 2026-11-24)
- **Target: JLPT N5, July 2027** (learner, 2026-11-24). Date not announced; first Sunday of July
  would be 2027-07-04 → 190 study days from 11-24 at 6 a week.
- Day 9: check 29 / 29 (8:55) · drill 12 / 12 reviews, 6 / 10 new, 10.4 min. Day 10: check 12 / 16
  (8:00) · drill 7 / 10 reviews, 8 / 10 new, 11.1 min. **Words introduced: 83.**
- **Nightly trial started 11-23** (`decisions.md` 2026-11-23, three entries): evening sheet A–D,
  16 items, one grammar point in Minna no Nihongo I order + a form ladder; 3 cold items next
  morning. Night 1 logged; night 2 (11-24, L1 は…です · じゃありません · か) pending at this update.
- **Study time.** Learner wants **at least 1 hour a day** combined (check + drill + night).
  Measured days 8–10: 19–25 min with the night sheet untimed; estimate 35–40. Research:
  `research/06-daily-study-time.md` — 60 min is defensible as a budget (≈190 h by July; inside
  the ~1 h a day the practice literature calls productive), in blocks under ~30 min, never a
  quota, never at the cost of sleep. **Not yet a decision**: nothing in `decisions.md`. Agent's
  advice 11-24: add nothing before Fri 11-27, get a fully timed week first.

## Running routines (manual, in chat)
**Before building any check or sheet:** `decisions.md` 2026-11-23, "Building check and sheet
items" (no same-day new words, arm B untouched, sealed items fixed).
0. **Saturday is rest** (`decisions.md` 2026-11-22): no check, no drill; log as rest. Next: 11-28.
1. **Pre-drill check** (`decisions.md` 2026-11-17, amended 11-17, 11-18, 11-20). Learner sends the
   ledger export; agent returns ≤ 40 words, spelled exactly as the ledger `word` field; learner
   answers on paper (photo), timed; agent scores, corrects, logs under `results.md` → Probes.
   Schedule from **check history only**: ✗ → next day; consecutive ✓ → 1 · 3 · 7 · 14 days.
   **Morning items come with every pre-drill check, unasked** (learner, 2026-11-24). When the learner
   starts the day's check (sends the ledger or asks for the check), the same reply also gives the
   morning items for the previous night's sheet: **2 unseen items on the night's point + 1 form
   item** (from night 6, Sun 11-29: **1 meaning JP → EN + 1 production EN → JP on the point + 1 form +
   1 review** — `decisions.md` 2026-11-26), cold, built by the "Building check and sheet items" rules, never a
   sealed item. Kept apart from the check on the sheet and in `results.md` (scored and timed
   separately). Night sheets from 11-29 add block E (mixed review on each point's own schedule) and
   mix form sets in D — same decision. No night sheet the night before (rest day, skipped night) → say so in one line and
   give none. The learner never has to ask for them.
2. **Split experiment** (`results.md` → Experiments). New kanji words paired by type; A gets a
   same-day reading check after the drill, B untouched. Read after ~12–14 words per arm.
   Cumulative 1-day first-probe: **A 5 / 8 · B 4 / 7** (through day 9's words). 買う (B, 2-day
   gap) excluded; 聞く (B) void, 飲む (A) flagged (night-1 contamination).
3. Log each drill day under `results.md` → Log from the ledger (session times are UTC+7).
4. **Time per day** (`results.md` → Time per day, learner 2026-11-24): ask for a time on every
   part (check, morning items, split A, night sheet); drill minutes from the ledger. Update the row
   each time a part ends; separate columns + total. Never estimate an untimed part.
   **All times in m:ss, in chat and in files — never decimal minutes** (learner, 2026-11-26).
   **Time prompts — every agent, every time** (`decisions.md` 2026-11-24, "Time prompts"):
   - **When giving** the pre-check + morning items, or the night sheet: first line of the reply is
     `⏱ Start the stopwatch.`
   - **When the learner submits** any of the three (photo or answers): if no time came with it,
     ask for it before or alongside scoring: `⏱ Time for <part>? (m:ss)`. One line, every time.
   - **When logging the time:** write it to `results.md` → Time per day, then from **2026-11-29**
     add: `⏱ Enter <m:ss> for <part> in /time (<day>).` Agents cannot write to /time: it reads only
     the ledger on the phone, and chat exports never flow back.

## Check state for the next checks (computed from all checks through 11-24)
The running list is the last line of the newest probe in `results.md` ("Next checks"); recompute
from check history if in doubt.
- **11-25 (26 words):** 先 つかう もつ しる (✗ on 11-24) · 飲む 聞く 四 クラス ゆうめい だいじょうぶ ·
  前 話 みんな パーティー おいしい 五 · day-10 new words, first check: 先生 ゼロ こちら 日 ところ 時間
  つくる じぶん 今日 まだ (split: A = 先生, 時間 · B = 日, 今日).
- **11-26:** 入れる けっこう 書く 入る つとめる 後 どこ
- **11-27:** 何 見る 人 一 今 食べる 新しい · おととい 買う とる あの 言う 出る
- **11-28:** rest. Anything due slides to 11-29.
- **11-29:** する パン つける いい ある もう バス これ ゆうべ ちょっと ホテル いる のる わかる · 行く 二 それ なる ·
  ほんとう 十 三
- **11-30:** わたし テレビ どう くらい この 外 来る やる ちがう 多分 ここ カメラ その そこ 電気 できる
- Plus each day's new words (first check the next day; kanji → split).

## Findings that should shape doctrine (provisional, small n)
- Writing recall ≠ reading recall. Kanji prompts show the reading, so the drill never retrieves it
  (day-2 probe kanji 7/12 vs kana 15/18). Each skill fades on its own clock (言う: reading ✗ /
  writing ✓ on day 8; the reverse on day 6).
- One cold check + correction fixes most reading misses next day.
- Misses have shifted from blanks to **family mix-ups** (入る/入れる, おととい/きのう, あの/この, 出る/外).
- Leech history: 来る (3 ✗, now ✓✓), つとめる (3 ✗, now ✓), 後 (✗✓✗✓), 言う (reading ✗ on day 8).
- Recurring ink: dropped dakuten (五 → こ), め/ぬ, レ/ル, に/た. Counted ✓ when learner confirms.
- **Slips** (`results.md` Definitions, learner 2026-11-25): knew it, hand wrote something else
  (話 → はんし d11). ✓ on confirmation, no extra slot, tag **[slip]**. Learner reports the same with
  past-negative forms: recognised in English, then the past or the negative part dropped in writing.
  Tally slips per check; if they climb, that is a production-under-load concept, not a word list issue.

## Open questions (one at a time)
1. **Daily study time: decide after a fully timed week** (through Fri 11-27). Basis:
   `research/06`. If 60 min is adopted, write it in `decisions.md` with the four falsifiers there.
   Candidate fill, in order: the load already arriving (check and pile both grow) → hearing known
   words (`research/03`; needs the tap-to-play audio, backlog, week of 11-30, and a sealed
   listening check first) → more new words, only while next-day first checks hold.
2. **Pace vs July 2027.** 717 words to the unofficial ~800 over 190 study days = 3.8 a study day,
   4.7 if the last new word lands ~6 weeks before the test; `PILE_MAX = 30` allows ~5 (estimate,
   `results.md` day 8). Works with almost no slack. Measure fresh words per day for two weeks
   before touching `PILE_MAX`. The app's list ends at 210 words: the list past 210 needs its own
   research pass (rerun `research/01`'s rule) well before it runs out (~5 weeks at this pace).
3. Check cap 40: keep or trim on the median of timed checks (11:11 · 8:55 · 8:00 so far; the
   ~10 min line in `decisions.md` 2026-11-20).
4. Split experiment: A 5 / 8 · B 4 / 7, inconclusive. Read at ~12–14 words per arm.
5. 先: reading held, meaning blank twice after correction (n = 1). Watch; no item-level fix
   (`decisions.md` "Personal gap, concept fix").
6. Post-drill "one sentence" idea (11-17): never accepted. Parked.

## Housekeeping
- **The learner does every commit and push** (2026-11-24). Agents write files and say which;
  they never commit, push, or ask to. Do not remind him about uncommitted changes.
- Project copy of `results.md` (claude.ai Project) is stale since day 3 — repo wins.
- Suggest adding `docs/decisions.md` and this file to the project instructions' read order
  (learner edits those).
- Agent slips, all logged: 違う shown for ちがう (rule added), やる left off day 5, two same-day new
  words used on night 1 (rules added, `decisions.md` "Building check and sheet items"), "July
  needs a faster pace" said on 11-24 before the arithmetic (corrected in `research/06`).
- **App specs on hold (learner 2026-11-26: amend specs, build nothing yet):**
  `spec/SPEC-resume-session.md` (resume a drill; time only while on screen) and the scroll regression
  in `spec/SPEC-fix-overscroll.md` → Post-build audit. Until resume ships, compute a day's drill time
  from item timestamps if the ledger shows a reload (items without a session row).
- **Split experiment ended 2026-11-27: A ≈ B (8/13 vs 8/12) → same-day A check dropped** (`decisions.md`
  2026-11-17, "Ended"). No more A/B assignment; arm-B rules no longer apply to new words.
