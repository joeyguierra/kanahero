# HANDOFF — Kana Hero becomes its own project (2026-10-26)

**Read this first in the new project.** It is the bridge from the YouTube writers' room
(`joeyguierra-yt/`) to a standalone app project. Everything below was verified against the
tree at `11ad5e5` plus uncommitted `docs/` on 2026-10-26, not against the README (which still
describes v3).

## 0. Why the app is moving

The channel's doctrine (`joeyguierra-yt/doctrines/`) optimizes the *click*: small promise,
friction-traced closed sets, scope frozen to a filming window, nothing that smells like a
syllabus. It produced a beautiful, honest app and it capped what the app may become. Every ban
on the app traces to a channel test, not a learning finding (see §3).

**New north star:** the creator's own daily drill. Goal: conversational Japanese, vocabulary,
JLPT N5 → N3 and beyond. The app is the instrument; the channel films it as it exists.

**Writing stays central.** The no-hint / no-trace / self-grade loop is retrieval practice and
is the strongest thing in the app. It becomes *one* channel of a multi-skill drill, not the
whole app.

**New doctrines are written here, from research and workshop.** Nothing in the channel files
is law for the app anymore. The channel's own log already pointed this way
(`channel-thesis.md`, 2026-09-16: "viewer = learners, the build is the instrument"); this is
not a relitigation of that entry, it is where it leads.

## 1. What exists today (verified)

**Timeline.** v1 2026-08-04, 53 min on a train, 4 prompt steps / 6 sends. v2 08-30 katakana +
THE LOG. v3 08-31 capture bank + offline. v4 09-16 designed only (Joker, card). v5 09-16→22
Joker, decks, sets, motion, sound (v5, v5a, v5b voice, v5c, v5d sound, v5e meaning toggle).
v6 09-25 receipts. 51 commits over 11 working days. Live: https://kanahero.joeyguierra.com.
Build video: https://youtu.be/uXEN2RL5KdI. Case study: joeyguierra.com `/case-study/kanahero`
(site repo; spec in `docs/case-study/`).

**Shipped.**
- Character drill: 71 hiragana, 71 katakana. Romaji prompt → handwrite on canvas → real stroke
  order animates over the ink → self-grade → miss requeues 5 positions later (`lib/session.ts`).
  A character joins the set only if correct on first attempt in a session.
- Card loop (`lib/joker.ts`): deal the whole set shuffled, miss goes to the tail (gap ≥2),
  rarity by tries (1 shiny / 2 base / ≥3 worn, fixed at earn), **all-or-nothing** — abandon
  the run, keep nothing.
- Sets wired (`lib/sets.ts` PLATFORM_SET_IDS): everyday-hiragana 10 · countries-katakana 18 ·
  **test-kanji 3 (a dev set, visible to users — bug)** · daily-basics-kanji 10 · station-kanji 9.
  `calendar-kanji` (21) exists in `public/sets/` and is **not wired**.
- Stroke data: 142 kana (strokesvg, MIT, derived from Klee One OFL) + kanji (KanjiVG, CC BY-SA
  3.0, normalized to 1024, weight 58) = 186 SVGs. `verify-strokes.mjs` gates coverage.
- The Joker: 98 `status:ship` lines in `joker/corpus.md`, set-scoped lines in set JSON,
  compiled and policed by `scripts/joker-audit.mjs` against `joker/facts.json` (`needs:` tags
  go silent when a fact is false). Bible: `docs/design/joker-character.md` (READ FIRST block).
  Typed at 22 ms/char, two-frame mouth flap, synthesized square-wave voice.
- Sound: 13 files in `public/sfx/`, 12 wired (`deal.press` unwired 09-25). Lab:
  `npm run sfx:lab`. Spec: `docs/spec/SPEC-v5d-sound.md`.
- Meaning toggle per set, run-level, 1 s peek on grade when off (`SPEC-v5e`).
- Receipts (v6): the ink that earned each card, as timed points in IndexedDB
  `kanahero-receipts`; hold a card to replay. `lib/ink.ts` is the single drawing routine.
- Capture bank: offline photo capture → IndexedDB `kanahero-bank`, note later, ZIP export.
  No OCR, no conversion to cards.
- Offline: `scripts/gen-sw.mjs` precaches the whole static export (~15.5 MB). $0 runtime.
  No account, no server, no Supabase (BUILD-MAP §1 proposed it; SPEC-v5 §10 won).
- Storage: `kanahero:v1` localStorage blob (version 4; characters, joker counts, meaningOff,
  audio prefs) · `kanahero-bank` · `kanahero-receipts`. Separate failure domains on purpose.
- Verification: `npm run e2e` = e2e-joker, e2e-loop, e2e-bank, e2e-offline (Playwright
  against `out/`). `npm run build` runs the joker audit first.
- Stack: Next 16.3 static export (`output: "export"`), React 19, no deps beyond that.
  `app/page.tsx` is a phase switch, no routing. `app/globals.css` ≈2,650 lines = THE LOG.
  **Read `AGENTS.md` before touching framework APIs — this Next differs from training data.**

**Architecture already prepared for depth** (`docs/spec/paid-tier-prep.md`,
`docs/spec/distribution.md`): `lib/` is DOM-free; sets carry `origin`; `lib/tier.ts` is the one
entitlement read (returns `free`); stroke data is never entitled (OFL / BY-SA); a `lib/platform.ts`
seam (share / save / camera) is recommended before any wrapper; store listing = wrapped
webview, never a native rewrite.

**Measured once (v1, n=1, hiragana only):** baseline 16/46 writable from memory → 43/46 next
day. The creator already read hiragana; this measures production, not learning from zero.

## 2. Known debts (fix or decide early)

1. `test-kanji` shipped to users; `calendar-kanji` not wired.
2. README describes v3. The first doc in the new project is a true inventory (this file is the
   seed); then rewrite the README or retire it to a pointer.
3. `BUILD-MAP-v5 §1` (Supabase) contradicts `SPEC-v5 §10` (no server). Delete one claim.
4. `docs/design/KanaHero v4 Handoff.dc.html`, `docs/case-study/`, `.claude/` are untracked.
5. Mascot is a 92 KB raster placed by hand-measured alpha bounds; spec asked for SVG ≤8 KB.
6. Case study still owes M-10 board screenshots; iPhone Safari untested on the live demos.
7. iOS handwriting: `WritingCanvas.tsx` (Canvas 2D + coalesced events + pointer capture) and
   `lib/strokeAnimator.ts` are the two most delicate files. Do not pre-abstract them.

## 3. What the old doctrine banned, and on what grounds

| Absent today | Where it was banned | Grounds | Pedagogical basis |
| :-- | :-- | :-- | :-- |
| Cross-session SRS / scheduling | SPEC-v5 §3 "no scheduling, no SRS" | train-window scope, "Duolingo clone" positioning | none — spacing is the best-evidenced technique in the field |
| Syllabus / JLPT lists / N5 vocab | backlog.md "rejected outright, do not resurrect" | Henry small promise, friction-first idea engine | none — packaging rule |
| Meanings taught | dev-kanahero-words.md "production, not vocabulary" | dodging a video branch-check | none |
| Audio prompts, listening | backlog (routed to "a later video") | can't film on a train | none |
| Grammar, sentences, speaking, reading | never in scope | "learn Japanese" fails tangibility | none |
| Streaks, goals, notifications | README "retention theater" | lifestyle-subtraction thesis | partial: nagging is bloat; *scheduled review* is not |
| Accounts / sync | README | "the number is worth more on one device" | none; a privacy/cost decision |
| Handwriting recognition | README | self-grade forces close looking; offline | partial — self-grade has real merit; test it, don't assume |
| Features not traced to a trip friction | bio.md Guard 1 | idea engine | none |

**The central rewrite:** the old doctrine conflated *gamified treadmill* (streak anxiety, XP,
push nags) with *evidence-based scheduling* (spacing, interleaving, retrieval, testing effect).
It threw both out to protect positioning. The new doctrine separates them.

Also note: `rule.allOrNothing` (abandon = keep nothing) and fixed rarity are **reward-design**
choices, not learning choices. Re-examine against research; the Joker corpus and
`joker/facts.json` will need updating if they change (the audit catches it).

## 4. Candidates to carry over — decide, don't drift

1. **Truth law.** Every number real. The app's true number is now a mock-test score and days
   actually drilled.
2. **Dogfood rule.** Features come from frictions the creator hits drilling daily — the one part
   of the old idea engine that is pedagogically right; it just points at study friction instead
   of trip friction.
3. **Offline / $0 runtime — demoted from law to default.** Listening, speaking and conversation
   practice may need TTS, audio, or a model at runtime. Decide deliberately; keep the writing
   drill offline regardless.
4. **No hints, no tracing, write before you see it.** Retrieval over recognition. Keep as law
   unless research says otherwise for a specific skill.
5. **Scope freeze per build**, with the freeze unit = a learning milestone, not a filming window.
6. **Spec before code, handoff before build, audit as a build gate.** This process produced
   every version; keep it.
7. **Joker rules** (positive only, info first, under twelve words, never streaks/XP/guilt) —
   keep the character; expand what he may talk about.
8. **THE LOG + the card table** as the visual/sound system. The "AI made THAT?" moat.

## 5. Interface back to the channel

- Video files stay in `joeyguierra-yt/vids/`. The showcase (video 02) films the app at a
  commit; "nothing built for the video" inverts to "nothing filmed that isn't shipped."
- Build logs still feed videos (timings → titles, stumbles → honesty beats). Keep the build
  log habit; fill it in the moment.
- Funnel law still binds any *video mention*: the free tier is the whole promised thing; no
  paid layer until the channel's results.md trigger fires (count 0). The app project owns its
  own tier posture, but the copy guard (no "pro", no locks, no teased features) stays until a
  decision here says otherwise.
- Store listing gate (11 videos, soft) is a channel focus guard; the app project may revisit.

## 6. Risks the new doctrine must test for

- **Scope explosion.** "N5 → N3 and conversational" is exactly the huge promise the old doctrine
  killed — correctly, as a *video* promise. As an app goal it holds only with milestones and a
  daily-use metric. Proposed test: if the creator hasn't drilled in 14 days, the backlog
  reorders before any feature ships.
- **Build > study.** Building the learning app as a way of not learning Japanese. Proposed
  test: no feature work on a day with zero drill minutes.
- **Research-washing.** Citing "the science" for a feature that was wanted anyway. Every
  learning feature names the finding it rests on and the measurement that would falsify it.

## 7. First research questions (before any feature)

1. Spacing / retrieval / interleaving / testing effect — what schedule, what intervals, what
   the evidence says about production vs recognition.
2. Does handwriting kanji improve recognition and retention (the "hand teaches the eye" bet)?
   What does the literature actually show?
3. JLPT structure N5 → N3: vocab, kanji, grammar counts; what the test rewards.
4. Conversational Japanese: comprehensible input, shadowing, output practice — what transfers
   to real conversation and what is a treadmill.
5. What Anki, WaniKani, Bunpro, Pimsleur, Renshuu, Duolingo each get right and wrong, measured
   against 1–4, not against taste.
6. Self-grading vs recognition: error rates, honesty drift, when a check is worth its cost.

## 8. Open decisions for the first workshop

- Where workshop state lives: repo `docs/` (recommended — specs, audit and corpus are here) vs
  project docs.
- Runtime posture: offline-only / offline-first with online depth / online allowed for audio.
- Whether all-or-nothing runs and fixed rarity survive contact with research.
- Baseline measurement: which N5 mock, and what "daily drill" counts as a day.

## Next physical-world action
Take one full N5 vocabulary mock (~20 min), write the raw score in this file under a new
`## Baseline` heading with the date. The first doctrine gets written against that number.
