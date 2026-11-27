# backlog — ideas outside the current freeze

One entry per idea: date, what, why, what is already there, what it needs before it is built.
Nothing here is scheduled. Tabled v7 items with a return order stay in `docs/spec/SPEC-v7-skeleton.md` §1.

## 2026-11-14 · Run timer, shown on the done screen

**Asked for:** a timer running in the background of a run; time spent on the run shown on S5.

**Already built (v7):** `Loop.tsx` records `ms` per graded item (prompt shown → grade tap);
the ledger keeps `startTs` / `endTs` per session; S5 prints whole minutes. So the data exists.
What is missing is an honest figure and a finer display.

**Open before building:**
- *Which time.* Wall clock (`endTs − startTs`) counts a phone left on the table. Active time
  (sum of per-item `ms`, or a clock that stops when the page is hidden) is the number
  `results.md` needs. Decide one; do not show two.
- *Display.* `m:ss` on S5 only. Nothing visible during the run: a ticking clock makes a
  retrieval task a speed task, and the grade is the learner's own.
- *Per word.* Seconds per word (active time ÷ words written) is the figure the 30-word pile
  max is waiting on. Put it in the ledger export; whether S5 shows it is a design call.
- *Not this.* No best time, no comparison with yesterday, no target. A time is a measurement,
  not a score (treadmill guard).

**Falsified by:** the S5 time disagreeing with a stopwatch run by more than a few seconds on
a session with one deliberate pause.

## 2026-11-15 · Before the mobile app: audio, SFX, hi-fi pass, card animations

Four items the creator listed, in his order, plus the pitch accent line he added to the
audio item on 2026-11-16. **Each needs a workshop before any building.**
All four come before the mobile app conversion below.

### Audio — word pronunciation

**Asked for:** hear the word spoken, voiced by the Joker or by characters, tied to the
character options.

**Already there:** spec §1 logs "Audio / listening via the Joker (ElevenLabs)", blocked on the
runtime posture decision, with pre-rendered clips at build time to be tested before any live
API. The Joker himself is tabled as v7.1.

**Open before building:** who speaks (Joker, characters, or the learner's pick) and what the
character options are; where in the loop the word is heard (answer screen only, or also as a
prompt); pre-rendered clips against a live API; 210 clips in the offline precache.

### Decided 2026-11-23 — first audio: tap to play on the answer screen (week of 2026-11-30)

Research: `research/03-listening-beginners.md` (findings 2, 6, 7). Scope for the first build:
- **Voice:** the phone's own TTS engine (web speech). No server, $0. If the phone has no Japanese
  voice, the button is absent (no disabled state, no nag).
- **Where:** answer screen only, after the grade-relevant reveal. **Never on the prompt** (write
  before you hear it).
- **How:** tap to play (learner's choice over autoplay). Replays on each tap.
- **Ships with the pitch line** (below), so a wrong TTS pitch is visible against the accent data.
  The data is the reference, never the clip.
- **Ledger:** record `heard: true` on the graded item.
- **Falsifiers:** tapped on fewer than ~1 in 5 reveals over two weeks → remove · median seconds per
  word up more than ~3 s → review. Rough learning read later: morning-check reading scores, heard vs
  not-heard words (learner-chosen, not randomised).
- **`results.md`:** log the start date; first-probe numbers after it include audio exposure.
- **Before the spec:** engine-switch test on the S23, then check Chrome gets the same voice.
- Not a listening drill. The audio-only item (hear → meaning; dictation) and a sealed listening
  check come separately (`research/03`, verdict and measurement).

### Pitch accent line

**Researched 2026-11-23:** `research/04-pitch-accent.md`. Verdict: build it as a reference on the
answer screen, with the audio. Data: Kanjium `accents.txt` (CC BY-SA 4.0). Falsifier: paper pitch
recall check (10 known words, draw the line from memory) — baseline this week, retest ~4 weeks
after launch.

**Asked for (2026-11-16):** the pitch of a word drawn on its reading, as in
`visual-pitchmap.png` (repo root). Workshop it together with the audio above.

**The reference:** 休憩 with きゅうけい under it and one stepped line: under きゅ (low), a
step up, then over うけい (high) with no drop at the end. The line reads by mora, not by
character: きゅ is one unit.

**Already there:** spec §1 logs "Pitch accent line — slot reserved on S4; data + finding
needed". The blank `.v7Slot` under the word on the answer screen is that slot.
`public/words/n5.json` has no accent field.

**Open before building:**
- *Data.* One accent number per word (0 flat, 1 drop after the first mora, and so on) is
  enough to draw the line. Source and licence to be chosen and checked; 210 words is few
  enough to check by hand against a dictionary.
- *The drop at the end.* The reference shows a word with no drop. A word that drops after its
  last mora needs a mark the reference does not show (usually a down-tick at the end).
- *Where.* The answer screen only, or also wherever a kanji word's reading is shown (prompt,
  SHOW PROMPT).
- *With audio.* A clip must say the pitch the line draws. A generated voice can get pitch
  wrong, so each clip is checked against the accent data, not the other way round.
- *Graded or not.* Shown for reference only, or something the learner is asked about. The
  handwriting grade does not change either way.

### SFX

**Asked for:** sound effects.

**Already there:** `docs/spec/SPEC-v5d-sound.md` and the v6 sound code at tag `v6-final`.
Spec §1 logs sound as v7.4.

**Open before building:** which moments get a sound; mute and the phone's silent switch;
whether the v5d set carries over or is redone.

### Hi-fi pass

**Asked for:** a high-fidelity visual pass over the v7 screens.

**Already there:** v7 reuses THE LOG as-is. The HTML handoff files in `docs/design` are the
backup reference. The user's brush (`lib/ink.ts`) is logged separately in spec §1.

**Open before building:** which screens, and whether it is polish of THE LOG or a new look;
whether the brush change rides along.

### Bring back card animations

**Asked for:** the v6 card animations back.

**Already there:** the v6 components at tag `v6-final` (`git show v6-final:<path>`). Spec §1
tables cards / collection as v7.2, redesigned around *done*.

**Open before building:** which animations, named one by one; where they play now that there
are no sets (the deal, the spread, the done screen); whether they wait for v7.2 or come back
on their own.

## 2026-11-15 · Mobile app conversion

**Asked for:** KanaHero as an app-store app. After the four items above.

**Recommended route (agent's, not yet decided):** wrap the static export with Capacitor, not a
native rewrite, so the handwriting canvas and stroke animation are not rebuilt.

**Needs first:** an account backup (Supabase auth and db were named). A store app has its own
storage, so progress in the installed web app does not carry over without it. Order: backup
only (sign in, push a snapshot, restore), then the wrapper; two-way sync only if a second
device is ever used. The phone copy stays the one the app reads.

**Open before building:** sign-in method (a typed email code works inside an installed iPhone
web app; redirects do not; Google sign-in obliges Sign in with Apple); merge rule for the
schedule (latest graded day wins per word); per-user row access; Apple developer account,
$99 a year; updates go through store review.

## 2026-11-16 · Tour / guide

**Asked for:** a guide that can be turned on and off, shown by default to a first-time user.
Later, perhaps once the Joker is back (v7.1).

**Already there:** nothing. A first-time user is one with no saved state.

**Open before building:** who gives it (the Joker's seat, or plain text); what it covers
(self-grading, SHOW PROMPT, MORE and DONE on the canvas, the answer's view toggle, MORE on
Today); where the switch lives, since v7 has no settings screen.

## 2026-11-17 · Pre-drill review (receptive check in the app)

**Asked for:** the daily pre-drill check (see `decisions.md` 2026-11-17) built into the app,
instead of run by hand in chat.

**Already there:** the ledger records every graded item, per word, per day, so the app already
has what it needs to pick the list (yesterday's new words, last misses, oldest-probed). Nothing
in the UI asks for reading or meaning yet.

**Evidence so far:** `results.md` probes 2026-11-16 and 2026-11-17. Two days, one learner;
not enough to spec on.

**Open before building:**
- *Direction.* Shown the word → recall reading + meaning (receptive). Handwriting stays the
  centre; this is a separate short step before the run, not a change to the writing loop.
- *Grading.* Self-grade after reveal, same as the drill, or typed/spoken answer. Self-grade is
  the default (house rule); honesty drift is research question 6 in HANDOFF §7.
- *Related idea, keep separate.* Hiding the reading on kanji prompts in the drill itself. That
  one waits for the clean drill-only number (decision step 2a) to say it is needed.
- *Not this.* No score shown as a target, no streak for doing it (treadmill guard).

**Falsified by:** the in-app check giving a different score from the paper check on the same
words, same day, by more than one or two words.

## 2026-11-19 · Undo a grade

**Asked for (implied):** on day 5 the learner graded いい ✗ by mis-tap and stopped the session;
the ledger keeps the wrong ✗ and `results.md` carries a manual correction.

**Open before building:** an undo for the last grade only, within a few seconds, before the next
card. Not an edit of history. The ledger should record that an undo happened (truth law).

**Falsified by:** mis-tap corrections in `results.md` staying at zero for a month without it.

## 2026-11-23 · Listening in the nightly exercise — tabled to week of 2026-11-30

**Asked for:** a listening exercise at night, as an artifact or a local-only Kana Hero feature.

**Why it waits:** the nightly format changed on night 1 (particle point + form ladder); a third stream
before 7 nights of morning numbers would make any change untraceable. `research/00-survey.md` #8
(shadowing/listening, grade C) is parked behind the runtime posture decision for audio.
Baseline 2 listening is 2 / 4 — misses were where the choices are heard, not printed.

**Before building, in order:**
1. **Audio posture workshop** — on-device speech synthesis (ja-JP, $0, no server; risk: wrong pitch
   accent, see the pitch accent line above) vs pre-rendered clips vs a paid voice. Cost line written.
2. **Sealed listening check** bigger than the 4-item sample; source to find.
3. **Trial as an artifact, not an app feature:** nightly part B heard instead of read, same sentences.
   Spec only if morning numbers hold for ~2 weeks.

## 2026-11-24 · Progress by script: miss rate and kanji covered

**Asked for:** alongside study time, a breakdown of words learned by script (kanji, katakana,
hiragana). Kept out of the study-time build (`spec/BRIEF-study-time-dashboard.md` §6).

**Why not the plain count:** the app deals words in list order, so words-per-script only mirrors
the list (210 = 105 hiragana · 84 kanji · 21 katakana). It can't change a decision, and the JLPT
does not score by script.

**What could be worth building:**
- *Miss rate by script* — first-try ✗ in the drill and in the pre-drill check, by `ask`. The scripts
  already behave differently (`results.md`, 2026-11-16 probe: kanji 7 / 12, kana 15 / 18).
- *Distinct kanji covered* — characters, not words, against the unofficial ~100 for N5.

**Open before building:** what "learned" means (introduced, or two fresh-day corrects = rung ≥ 3,
SPEC-v7 D2); whether check results ever enter the app (today they live in chat and `results.md`);
where it lives (not Today, not the TIME screen). Treadmill guard: a number, no bar to fill, no
target.

**Falsified by:** miss rates by script within a few points of each other over four weeks → the cut
shows nothing; drop it.

## 2026-11-24 · Menu and internal pages before public

**What exists:** Today's footer has `menu` (learner, 2026-11-24). It opens MENU
(`components/Menu.tsx`), a list of internal pages on their own routes. Today that is one row,
TIME → `/time` (`spec/BRIEF-study-time-dashboard.md`). `/insights` and others are expected to join.

**Why it can't ship as is:** the pages are for the creator only. They read one person's ledger and
were designed for no one else; a stranger gets an empty measuring screen one tap from Today. Today
is also meant to carry one button (SPEC-v7 §7), and `menu` is a third footer link beside it.

**To decide before kanahero is public:**
- Which internal pages, if any, a public user sees, and what each shows on a device with no history.
- Where the menu lives, or whether it is hidden (a build flag, an unlinked route as `/verify` is, a
  gesture) and the internal pages stay creator-only.
- The treadmill guard for anything a public user can open: `/time` passes it only as a
  measurement instrument for one person (brief §6, §9).

**Until then:** add new internal pages as rows in `PAGES` in `components/Menu.tsx`.

## Page refresh mid-drill loses the session row and the requeue (found 2026-11-25, day 11)
**→ Spec drafted 2026-11-26: `spec/SPEC-resume-session.md` (not built).**
**What happened.** The page refreshed during the day-11 drill. The ledger kept the 22 graded items
before the refresh but wrote **no session row** for them, and the in-memory queue was lost: 先生 was
missed (16:29:46) and its requeue ("five later") never came back. After reload a new deal started
(due 5 · fresh 5), so the day's pile still reached 30, but one miss went un-retried in-session.
**Cost.** Drill minutes for the day must be rebuilt from item timestamps (done by hand in
`results.md`); a missed word skips its same-session retry. Schedule state itself held (items graded
before the refresh kept their rungs).
**Candidate fix (spec first):** persist the live queue and the open session (start time, counts) to
IndexedDB on every grade, and resume it on load; or write a session row on `pagehide`. Measure: a
forced reload mid-drill keeps the session row and the requeued miss. Cause of this refresh
(learner, 11-25): pull-to-refresh while tracing the reveal → fixed separately in
`spec/SPEC-fix-overscroll.md`. Other reloads (manual, tab discard, SW update) still lose the session.

## 2026-11-27 · Old-word bucket (review of words past the 30-day return)

**Asked for:** a separate review for old words, outside the 40-word pile, run on the same button
before the drill, with its own screen and copy. Agreed in principle: `decisions.md` 2026-11-27.

**Already there:** nothing. `lib/schedule.ts` keeps a rung-5 word on a 30-day loop.

**Before a spec:** a research pass on long-term spacing; the daily budget; a design handoff;
writing or reading. **Needed by:** about 2027-01-09, when the first words pass the 30-day review.

## 2026-11-27 · Kanji on the answer screen of a new kana word

`research/09` finding 6 (one study, by analogy): showing characters while the spoken word is still
being learned did not help and sometimes hurt. The app shows the kanji from the first write. Not
changed in `SPEC-kanji-upgrade.md`. Test if wanted: hide it until the word is at rung 4 and compare
miss rates.
