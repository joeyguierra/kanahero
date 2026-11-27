# decisions — what was decided, when, and on what evidence

One entry per decision: date, the decision, why (with the `results.md` / `research/` line it
rests on), and what would reverse it. Newest at the bottom. A decision here is not doctrine;
`doctrine.md` is written in a workshop. This file is so future agents do not re-litigate or drift.

## 2026-11-17 · Pre-drill receptive check, every drill day

**Decision.** Before every drill, the learner runs a cold receptive check on paper, with the
agent, and the result goes into `results.md` → `## Probes`. Manual, in chat, for now. Not built
into the app yet (see `backlog.md` → 2026-11-17 · Pre-drill review).

**Why.** The drill's prompt hands over the reading and meaning on kanji words, so the drill never
asks for them (`results.md`, probe 2026-11-16: kanji 7/12 vs kana 15/18). One cold check plus
correction lifted kanji to 11/12 the next day with no drill in between (probe 2026-11-17).
The learner found it useful. It is ~3 minutes.

**How it runs.**
1. Learner sends the latest ledger export (`kanahero-ledger-*.json`) before drilling. The agent
   needs it to know which words were introduced, missed, or are due — it cannot pick without it.
2. Agent returns the check list, **max 30 words, one pass each**:
   a. **Yesterday's new words** (first probe ever — the clean, drill-only number; report it
      separately). The only link to the drill, and it is by date, not by result.
   b. **Words due by their own check history:** ✗ last time → next day; ✓ → gap grows
      1 → 3 → 7 → 14 days. Overdue first, then oldest.
   The drill's ✓/✗ never moves a word in this queue (amended 2026-11-17, see below).
   Every word is shown **exactly as the ledger's `word` field spells it** — never a kanji the
   drill did not teach (added 2026-11-18 after 違う was shown for ちがう).
3. Learner covers everything but the word as written; says reading + meaning.
   Kanji words scored on reading **and** meaning; kana words on meaning.
4. Agent scores, then corrects. The correction comes **after** the score is recorded.
5. Agent writes the entry under `## Probes` in `results.md` and the day's drill line under `## Log`.

**Known confound, kept on purpose.** Feedback makes the check part of the teaching, not only a
measurement. So the only clean number about the drill itself is (a): a word's first-ever probe.
Do not read a rising total as "the drill works".

**Reverses if.** The learner stops finding it useful, or it exceeds ~5 minutes, or (a) scores
stay at ceiling for two weeks (the drill is already giving readings and meanings; the check is
redundant).

## 2026-11-17 · Check and drill keep separate schedules (option A)

**Decision.** The pre-drill check schedules each word from its **own** check results only.
The drill's writing result does not move a word up or down the check queue.

**Why.** `research/02-direction-and-check-scheduling.md`: learning direction decides what is
learned (Webb 2009); the kanji prompt shows the reading, so the drill never retrieves
kanji→reading; per-item spacing works from each item's own history (Lindsey et al. 2014).
Data: writing ✓ on day 1 predicted reading ✓ on day 2 for only 4 / 7 kanji words. Linking
would also make the check stop being an independent measure of the drill.

**Reverses if.** Over ~2 weeks, drill ✓ predicts check ✓ for ≥ ~90% of kanji words — then the
two skills move together and one schedule would do.

## 2026-11-17 · Split experiment: same-day reading check on half the new kanji

**Decision.** No routine post-drill check. Instead, each day's new kanji words are split: half
(A) get a cold reading + meaning check right after the drill, half (B) do not. The next
morning's pre-drill probe scores both. Logged in `results.md` → `## Experiments`.

**Why not a routine post-drill check.** Recall seconds after seeing the answer is easy and
measures recency; easier retrieval is thought to build less (Pyc & Rawson 2009, as cited in
Terai et al. 2021). And it would spend the next-day first probe of new words — the only clean
drill-only number (rule 2a above).

**Why the split.** It tests the thing the reading-on-kanji-prompts idea depends on: does
retrieving the reading on the day you learn the word help? B keeps the clean number.

**Ends / reverses.** Read after ~7 drill days (~12–14 words per arm). If A ≈ B, drop the same-day
check. If A > B by a clear margin, that is the evidence for a spec that adds a reading step to
the drill. ~1 extra minute per drill.

**Ended 2026-11-27: A ≈ B** (A 8 / 13 · B 8 / 12; `results.md` → Experiments, verdict). Same-day check
dropped; no reading-step spec. New kanji are split no more; every new word just gets its next-day
first check.

## 2026-11-20 · Pre-drill check cap raised 30 → 40; time it

**Decision.** Cap is 40 words. The learner times every check (start to last answer) and reports
minutes with the photo; minutes go in the `results.md` entry.

**Why.** ~10 new words a day plus spaced re-checks put ~45–50 words due by day 6–7; at 30 the
overflow rolls forward and settled words drift late. Learner accepts the time. The day-6 check
(30 words) was untimed, "probably more than 6 minutes."

**Reverses if.** Checks routinely run over ~10 minutes, or drill minutes start dropping on check
days (build > study's cousin: check > drill). Then: cap back down, or move settled kana words to
longer gaps.

## 2026-11-22 · 6 study days a week, 1 planned rest day

**Decision.** One fixed rest day a week: no check, no drill. Logged in `results.md` as
**rest**, not **missed** (missed = an unplanned day off). **Day: Saturday** (learner, 2026-11-22). Study week = **Sunday → Friday**; weeks start Sunday
(week 1 began Sun 11-15; Sun 11-22 = week 2, day 1). First planned rest: 2026-11-28. Day 7 (Sat 11-21)
was unplanned, so it stays logged as missed.
Checks and drill resume the next day with whatever is due; nothing is made up or doubled.

**Why.** The learner says it feels good, and staying with this for months counts for more
than one extra day a week. Spacing tolerates a one-day gap: after the missed day 7, day 8's
check scored 34/40 and the drill 30/30. The cost shows up in **new words**: the words
introduced the day before the gap scored 1/4 at a 2-day first check (vs 9/10, 7/10, 5/8 at
1 day). And the pile refills to 30 the day after, so 0 fresh that day (`PILE_MAX`, day 8).
Net pace: ~6/7 of the ~5 new words a day estimate.

**Not this.** No streak counts, no "make-up" sessions, no guilt copy (treadmill guard).

**Optional Saturday (added 2026-11-22).** Play, not study: something for fun in Japanese —
watch or listen to something easy, or spot kana and words in the wild (menus, signs, packaging).
Rules: optional, unscored, no app, no drill list, no check, no flashcards. If done, one line in
`results.md` (what, minutes). Not a skill measurement: input at N5 week 2 is mostly
incomprehensible (`research/00-survey.md` #8–9 put listening/extensive input later). Kept for
ear and motivation; never becomes a requirement.

**Reverses if.** First checks of words introduced before a rest day keep scoring well below
the 1-day ones over ~4 weeks. Then the rest day moves, or the day before it takes no new
words (would need an app change: spec first).

## 2026-11-23 · Nightly exercise — trial (grammar, one point per night)

**Decision.** A ~10-minute exercise, last thing before sleep, on paper. One grammar point per
night, aimed at the weakest measured section (Baseline 2: grammar 4/9). Night 1: **に** (where you
go / arrive / get on), contrasted with の between nouns. Shape:
A. read 3 sentences aloud with English · B. cover English, say meaning (4) · C. English only →
say and handwrite the Japanese (4) · self-grade, score on the sheet · lights out, no more review.
Sentences use only words from before that day; **that day's new drill words never appear**
(tomorrow's first check of them stays clean).
**Next morning:** 2 unseen sentences on the night's point, English → Japanese, cold, before the
drill. That is the after-sleep number.

**Why.** Mazza et al. 2016: learning, sleep, relearning cut relearning and improved long-term
retention vs the same-day schedule (verified, one study, n = 40; `research/05`). The unnamed "earlier
study, no 12 h difference" could not be found and is removed (2026-11-23). Sleep within a few hours
of study helps vocabulary (Gais 2006), but effects are smaller than once claimed: evening is enough,
not strictly last thing before sleep (`research/05`). Particles are the
confident miss on both mocks. Retrieval and production over rereading (testing effect, research 02).

**Falsified by.**
- Morning recall of the night's point under ~50% for a week → change the format.
- Sealed particle check (baseline 5/7) not up on or after 2026-12-21 → cut or redesign.
  Never study from the sealed items.

**Not this.** No streak, no make-up nights, not a requirement on rest days.

**Amended 2026-11-23 (same day), under "Personal gap, concept fix" below.** Starting with に
because the learner missed it is withdrawn: that picks content from one learner's misses. The
nightly routine stays; its content follows a standard N5 grammar sequence (source to be chosen:
Genki I proposed, not yet decided). Particles are in it because particles are core N5 grammar.
A particle the learner keeps missing comes back sooner through per-item spacing (a general
mechanism), not by being put first.

## 2026-11-23 · Personal gap, concept fix — the balance every decision strikes

**Decision.** Kana Hero is built from the creator's own roadblocks, and every fix is made at the
level of a concept, never at the level of his specific items. In full:
1. **Gaps come from real use.** A gap counts when it shows up in the creator's drilling,
   checks or mocks (`results.md`). No features for imagined users.
2. **A gap becomes a decision only once it is named as a concept** in language learning: a
   skill (reading vs writing), a learning mechanism (spacing, retrieval, interference), a
   category of the language (particles, verb forms), or learner psychology. Research backs it
   where it can (`research/`).
3. **The fix acts on the concept, never on the creator's items.** Words, particles, phrases and
   kanji are never chosen, ordered or added because he missed them. Content comes from standard
   lists and sequences. Adapting to a learner happens only through general mechanisms fed by
   that learner's own history (**general rules, personal schedule**: per-item spacing, Lindsey
   2014, `research/02`).
4. **The fix is judged on the creator's numbers, and is not watered down for others.** A finding
   that works for him is kept even if it may not suit every learner; it is not blocked or
   softened to accommodate hypothetical users, and it is not claimed to work for everyone.

**Test (one line).** Can the gap be named without naming one of his words, particles or phrases?
If not, it is not yet a decision.

**Examples.**
- ✓ Pre-drill check: reading, meaning and writing are separate skills (Webb 2009, `research/02`)
  and the drill trains only writing. Found in his day-2 probe; the fix is for the skill.
- ✓ A particle slot in a standard grammar sequence.
- ✓ The scheduler bringing back a word he missed sooner (mechanism, his data).
- ✗ Starting the nightly routine with に because he missed it (withdrawn, entry above).
- ✗ Adding つとめる or 来る to a list, or moving them earlier, because they were leeches.

**Why.** Picking content from one learner's misses on a 9-item test overfits to noise and leaves
the app tied to one person. Requiring every decision to hold for any learner would block or
dilute real findings. This keeps discovery personal and the fix general.

**Reverses if.** Never silently. Amend here, with the case that broke it.


**Amended 2026-11-23 (night 1) — form ladder added.** Learner: forms are missing and the grammar
items lean on them. Data agrees: every night-1 miss was a verb form or meaning, none a particle;
mock items 2 (て), 7 (たい), 8 (adjective past negative) are forms. Each night gains a ~3-minute
**form ladder** after the particle point (~13 min total): 5 known verbs, English cue → say and
handwrite the form from memory, self-grade. One form set per week: polite ます/ました/ません/
ませんでした + the ます stem → て-form → ない/た → い-adjective past/negative → たい.
Morning cold check becomes 3 items: 2 on the night's point, 1 form.
**Falsified by:** sealed forms check (baseline 3/8, `docs/sealed-forms-check.md`) not up on or after
2026-12-21. Transfer to unpractised verbs is not measured (held-out verbs dropped 2026-11-23,
learner: simpler; the check's items may be practised like any known verb).

**Fixed night shape (2026-11-23):** A 3 read · B 4 meaning · C 4 translate · D 5 forms = 16 items,
~13 min. The point and verbs change; the counts do not, so nights stay comparable.
**Amended 2026-11-24 (learner): never trimmed unless the learner says so.** He writes every question
and answer by hand, so the time includes transcription. Agents may flag a long night (e.g. night 2,
17:06) but do not cut items on their own.

## 2026-11-23 · Building check and sheet items — rules for every agent

**Decision.** Any item an agent gives the learner outside the app (pre-drill check, nightly sheet
A–D, morning items, sealed checks, quick quizzes in chat) is built from the **latest ledger export**
and passes these rules. Written after night 1 used two of that day's new drill words (聞く in the
sealed forms check, 飲む in the form ladder; `results.md` → Experiments, day 9).

1. **Spelling.** Every word exactly as the ledger's `word` field (rule from 2026-11-18).
2. **Today's new words appear nowhere else today.** A word first graded in today's drill is not
   used in the nightly sheet, the morning items, a sealed check or a chat quiz until after its
   first pre-drill check (tomorrow). The only exception is the split's arm-A same-day check, which
   *is* the experiment.
3. **Split arm B is untouched** by every exercise until its first pre-drill check. Arm A gets its
   one same-day check and nothing more.
4. **Sentences use known words only:** every word introduced in the drill before today
   (`research/03` finding 3, coverage).
5. **Sealed items are fixed.** Never studied, never swapped after a baseline, even if one is later
   found contaminated: log it in `results.md`, keep the item, so retests stay comparable.
6. **Check before sending.** Before giving any sheet, the agent lists its words and states in the
   reply that they were checked against (a) today's new words and (b) arm-B words awaiting a
   first check.
7. **Pool.** ~21 verbs were introduced before day 9 (する 言う 行く 来る 見る やる ある いる なる 食べる
   つける わかる のる 出る 入る 入れる 書く 買う とる つとめる できる): enough for 5 a night with
   reuse across nights. Reuse is fine; same-day new words are not.

**Reverses if.** Never silently. If the pool runs short for a form set, the ladder shrinks; the
rules do not bend.

## 2026-11-23 · Nightly grammar sequence: Minna no Nihongo Shokyu I order

**Decision.** The nightly points follow the grammar order of *Minna no Nihongo Shokyu I* (the learner
owns it). Grammar order only: sentences are written fresh from words the drill has already taught
(rules in "Building check and sheet items"), never copied from the book. A lesson whose points need
words not yet taught (e.g. L4 time expressions) waits until the known-words rule allows it.
に (night 1) came early; it returns in its Minna lesson as review, not as new.

**Plan, nights 2–6:** Tue 11-24 L1 は…です · じゃありません · か · Wed 11-25 L1 の (N の N) · も ·
Thu 11-26 L2 これ/それ · この/その/あの · Fri 11-27 L3 ここ/そこ/どこ · Sat 11-28 rest ·
Sun 11-29 L5 へ 行きます/来ます · で (vehicle).

**Why.** "Personal gap, concept fix": a standard sequence, not the learner's misses. Minna and Genki I
teach the first points in nearly the same order (both open with N1 は N2 です, then demonstratives);
Minna's smaller lessons fit one point per night, and the learner has the book to read the night's point.

**Timing (learner, 2026-11-23).** "Nightly" means evening, not strictly last thing before sleep; the
pre-drill check and drill are any time during the day. See `research/05` for what timing evidence says.

**Reverses if.** A point repeatedly can't be written with known words (skip ahead in Minna order),
or the learner switches books.

## 2026-11-24 · Time prompts at every paper exercise

**Decision.** Agents prompt for time at the three paper parts — pre-check, morning items, night
sheet — every time: `⏱ Start the stopwatch.` when giving the exercise, `⏱ Time for <part>? (m:ss)`
when it is submitted without one, and from 2026-11-29 `⏱ Enter <m:ss> for <part> in /time (<day>).`
after logging it in `results.md`. Exact wording and order: `HANDOFF-week2.md` routine 4.

**Why.** Learner, 2026-11-24: be prompted in chat whenever these happen. /time fills the drill
column from the phone's ledger by itself; the paper parts reach it only when typed on the phone.
Chat exports never flow back into the app, so an agent cannot update /time. Paper week (through
Fri 11-27) stays chat → `results.md` only (`spec/BRIEF-study-time-dashboard.md` §11, decision 5);
in-app entry starts Sun 11-29.

**Reverses if.** /time gets an import of times, or the paper parts move into the app.


## 2026-11-26 · Night sheet grows by review; morning items rebalanced — from Sun 2026-11-29

**Decision.** Replaces the fixed 3 · 4 · 4 · 5 shape from night 6 (Sun 11-29; Fri 11-27 night 5 keeps the old shape). Nothing added before
Fri 11-27 (the fully timed week stays clean).

**Night sheet**
- **A 3 · B 4 · C 4 stay**, on the night's one new Minna point, blocked.
- **E — mixed review (new).** Every earlier point (night sheets and morning items) keeps its own
  schedule from its own results only: ✗ → next night · ✓ → 3 → 7 → 14 days. Each due point gives
  **1 item, 2 if it was missed last time**; directions alternate meaning (JP → EN) / production
  (EN → JP); confusable points sit side by side (に/の/で · この/その/あの · ます/ました/ません/
  ませんでした · drop-る vs り-verbs). **No fixed size.**
- **D — forms mixed across sets.** A new form set (て-form next) is drilled with still-missed earlier
  forms mixed in (currently いる → wasn't, つける), not instead of them.
- **Size is the learner's call:** never trimmed unless he says so; the agent flags a night over
  ~25 min.

**Morning items (with every pre-drill check, unasked)** — 4 items:
1 meaning (JP → EN) + 1 production (EN → JP) on last night's point · 1 form · **1 review** (the oldest
due point from E's schedule). **Read weekly, not daily** (3–4 items a day is too few for a daily number).

**Why.** `research/08-night-sheet-growth.md`: spacing helps L2 grammar (Bird 2010); exact gap matters
little, so reuse the check's ladder (Suzuki 2017, Kasprowicz 2019); mixing grammar exercises helps
retention (Nakata & Suzuki 2019), most for similar categories (Brunmair & Richter 2019); blocked then
mixed beats either alone, and each direction trains itself (Suzuki & Sunada 2019; `research/02`);
learners left to choose block (Lu et al. 2020), so the schedule, not instinct, picks review. Morning
size: no study sets it; extra same-point items in one sitting add little (one retrieval per session,
Nakata 2016) and review belongs in E where spacing grows. Morning items were all EN → JP; the mock and
JLPT test recognition → one of each.

**Falsified by.**
- Morning review items (points last seen ≥ 3 days earlier) under ~70% across week 3.
- Sealed particle / forms checks not up on or after 2026-12-21.
- Night time rising week on week while weekly morning totals stay flat (growth = copying).
- Weekly morning totals swinging > ~25 points between weeks with nothing changed → too few items;
  add morning items (measurement fix only).

## 2026-11-27 · Known kana words come back as kanji; pile 40; young reviews outrank new words

**Decision.** Four parts, specified in `spec/SPEC-kanji-upgrade.md`, built in week 3 (from 2026-11-30).
1. **Upgrade.** A word asked in hiragana that has a kanji form returns as that kanji once it has
   been written correctly on three returns in a row (rung 4). It is a new item (study trial, own
   ladder). The kana item retires on the upgrade's first write. The two are linked in the word data
   and in every ledger row (`upgradeOf`).
2. **Prompt.** The upgraded word is prompted by meaning only, not reading.
3. **Pile.** `PILE_MAX` 30 → 40, everything counted. Up to 10 new words and, separately, up to 3
   upgrades a day.
4. **Order under a full pile.** Young reviews (returns on days 2, 5, 12, and misses) → new words →
   upgrades → late reviews (14-day and later). Late reviews that do not fit wait; after 3 days held
   they count as young.
First set: the 35 words whose kanji are in the N5–N4 range. The other 30 wait for the verdict.

**Why.** `research/09-kana-to-kanji.md`: knowing a word by sound first helps learning its written
form (Wegener 2018, 2020; Li et al. 2021); schools separate reading from writing and delay writing
(MEXT); word knowledge offsets kanji complexity in handwriting (2026 study). No study tests this in
adult learners of Japanese — grade C for the rule as a whole. The agent first proposed waiting for
N4; the learner objected that this delays kanji drilling for months, and nothing in the research
requires the wait. Prompt: probe 2026-11-16 (kanji prompts supply the reading, so it is never
retrieved). Pile: 30 words measured at 7–11 min on days 8–13, against the spec's 20-minute limit;
reviews cut new words to 4, 0, 1 on days 6, 8, 13. Order: `00-survey.md` rows 1–3 — the first three
spaced returns carry most of the gain (Rawson & Dunlosky; Kornell & Bjork .62 → .88), later ones
flatten; exact intervals matter little (Latimier 2021).

**Numbers that are arithmetic, not findings:** 40, 3 a day, 3 days held, rung 4.

**Reverses if.** Spec §5: upgrades need as many attempts as ordinary new kanji words (~15
upgrades in); a full pile passes 20 minutes; first-try ✓ on due words drops below its week-2
level; late reviews that waited miss clearly more than those on time.

## 2026-11-27 · Old-word bucket — agreed in principle, not built

**Decision.** Words that have passed the 30-day review leave the ladder for a separate bucket.
- **Outside the 40 cap** (learner's call).
- **Runs with the drill on the same one button, before it,** with its own screen and copy
  ("review these old words first"). The learner never chooses whether to open it.
- **One miss:** the word comes back in tomorrow's bucket. **Two misses in a row:** it is treated
  as young again (rung 1, tomorrow, in the main pile). A ✓ after one miss puts it back to rest.
  (Learner's rule, 2026-11-27 04:27; replaces the agent's "one miss → ladder".)
- **Daily cap: left open** (learner, 2026-11-27 04:31, after the simulation below). 5 was floated.
- Retired kana items never enter; their kanji upgrade does, in its own time.

**Why.** After the 30-day review the scheduler brings every word back monthly for ever. At ~800
words that is ~27 reviews a day; at 1,200 it is the whole pile and no new word arrives. Late
reviews add little (survey rows 1–3), and the learner's due-word accuracy is near ceiling
(day 8: 30 / 30; day 12: 29 / 30).

**Open before it is specified.**
- **The rest gap.** How long a word rests after a bucket ✓ before it may return (30, 60, 90
  days…). Without one, a small bucket recycles the same words daily. Not chosen.
- **What the cap of 5 means (simulation, 2026-11-27; real intake to day 13, then ~6 new a day,
  no misses).** Words enter the bucket at about the rate they were learned (5–10 a day), which
  is more than 5 can clear. So from the first day any old word is due (≈ 2027-02-09 with a
  30-day rest, 03-11 with 60, 04-10 with 90) there are 5 every day, with no quiet days, and the
  queue only grows. The real gap becomes bucket size ÷ 5: ~750 old words → ~150 days; 2,000 →
  ~400. Quiet days would need fewer than 5 new words a day over the long run. Whether gaps that
  long are safe is the research question below.
- **Research first:** how sparse review of a well-learned word can be before it is lost. Not yet
  looked for.
- **Design handoff** for the new screen and copy. Joker rules apply if he speaks.
- **Timing rule:** the 20-minute limit must then cover bucket + drill together.
- Whether the bucket asks for writing or for reading.

**When.** Nothing qualifies before about 2027-01-09 (day-1 words' 30-day review, if none is missed
or delayed). Specify and build before then.

**Falsifier to carry into the spec.** Bucket miss rate: above ~1 in 10 → more slots or shorter
gaps; near zero for a month → fewer.
