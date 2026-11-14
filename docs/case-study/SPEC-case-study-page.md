# Case study page — kanahero

**Status: BUILT (2026-10-22) — see §9 for what is still owed.** Was: READY TO BUILD (2026-10-22). A new portfolio page on joeyguierra.com that presents
kanahero as a design and build case study. It is a **separate page**. The existing
`/kanahero` page (Build 01) stays live and unchanged.

**For the implementer:** you have access to both repos. This file lives in the kanahero repo
(`docs/case-study/`). Build the page in the site repo, using that repo's framework, layout
shell, type and components. Where this spec gives copy, treat it as a draft: keep the facts
exact and adjust the wording to fit the site's voice. Where this spec and the kanahero source
disagree on a fact, the source wins. Fix the fact here and say so in your report.

---

## 0. Decisions already made

| | |
| :-- | :-- |
| Route | `/case-study/kanahero` (the request said `kanehero`; treated as a typo, confirm before deploy) |
| Audience | Portfolio readers: design leads, hiring managers, other builders. They skim first, so every section has to work as a figure plus a caption. |
| Focus | **The new visual and sensory features**: the Joker, motion, sound, the card system, the receipt. The writing loop is the setup, not the subject. |
| Reused from `/kanahero` | §02 *What it does*, **including its media file** (the 45 s demo video), §03 *Install it*, §04 *What happened when I used it* (the curve and the three test sheets). Copy the components and assets as they are, then apply the edits in §3 below. |
| Dropped | §05 *The prompts* and §06 *The code*. Do not link to the prompts. **Attribution moves to the footer (§9). It is not optional.** |
| Old page | Add one link from `/kanahero` to the case study (a line under the hero is enough). Change nothing else on it. |

---

## 1. The story the page tells

> v1 took 53 minutes on a train. It worked: 16 → 43 of 46 in a day. The next seven weeks were
> spent turning a working drill into something you want to open: a dealer with a voice, a deck
> that lands, ink that dries into print.

That is the spine. The hero carries the 53 minutes, the results section proves the core worked
before any polish, and every section after it is about the craft added on top.

**Facts to use (all checked against the repo, 2026-10-22):**
- v1: 2026-08-04, four prompt steps (six sends), 53 min. Latest: v6, 2026-09-25. 51 commits over 11 working days
  (to 2026-09-25; `11ad5e5` on 2026-10-22 is share metadata only). *(Corrected 2026-10-22: "four prompts" →
  4 steps / 6 sends, per `public/assets/kanahero/prompt.txt` in the site repo.)*
- Six versions. *(Corrected 2026-10-22:)* every version that shipped code has a spec and a handoff in the
  repo, but git only shows spec → handoff → code from v5 on; v1–v3 committed docs together with code.
  v4 is two design briefs and a handoff, no code. *(The handoff was added to `docs/design/` on 2026-10-22,
  supplied by the creator.)*
- 142 kana stroke files (71 hiragana + 71 katakana) and kanji strokes, 186 SVGs in total, all
  drawn at pen speed.
- *(Corrected 2026-10-22 against `lib/sets.ts` PLATFORM_SET_IDS and the built app:)* 5 shipped sets, 50 words:
  Everyday (hiragana, 10), Countries (katakana, 18), **Test (kanji, 3)**, Daily basics (kanji, 10), Station
  (kanji, 9). Calendar (kanji, 21) exists in `public/sets/` but is **not wired** into any deck.
- 98 shipped Joker lines in the global corpus (`status:ship`), plus lines scoped to each set. *(Corrected
  2026-10-22 from "about 100".)*
- 12 shipped sound cues, plus one synthesized voice. *(Corrected 2026-10-22: 13 files, but `deal.press` was
  unwired on 2026-09-25.)*
- Offline, $0 runtime, no account. Live at **https://kanahero.joeyguierra.com**.

---

## 2. Page outline

Number sections the way the old page does (`01`, `02` …).

| # | Section | Weight |
| :-- | :-- | :-- |
| — | Hero | full-bleed |
| 01 | What it does *(reused from old §02)* | medium |
| 02 | It worked before it was pretty *(reused from old §04)* | medium |
| 03 | The Joker | **heavy** |
| 04 | Motion | **heavy** |
| 05 | Sound | **heavy** |
| 06 | The card: earned, worn, shiny | medium |
| 07 | The receipt | medium |
| 08 | The system: THE LOG | light |
| 09 | What it refuses to do | light |
| 10 | Process: spec before code | light |
| 11 | Use it *(reused from old §03 Install)* | light, CTA |
| — | Footer: credits | required |

---

## 3. Sections

### Hero
- Eyebrow: `CASE STUDY · KANAHERO · 2026`
- Title: **Kana Hero**. Sub: *A handwriting drill for Japanese, from a 53-minute prototype to a
  card game with a dealer, a sound palette and ink you can replay.*
- Three stat chips: `53 MIN TO v1` · `6 VERSIONS` · `16 → 43 / 46 IN ONE DAY`
- Right or below: the Joker mascot (`public/assets/joker-mascot-open.png`) next to a phone frame
  showing S1 Home. The two mascot frames can swap every 110 ms on hover so he "talks" (§3.03).
- CTAs: `Use it` → app URL · `Watch the build` → https://youtu.be/uXEN2RL5KdI

### 01 · What it does (reused)
Copy old §02 and its demo video unchanged. Add **one paragraph** under it so the reader knows the
loop has grown:

> That was v1. The loop is the same today (romaji prompt, write by hand, the real stroke order
> draws over your attempt, you grade yourself), but now it is dealt from a deck. Characters,
> words and kanji come in sets, every correct word earns a card, and a dealer called the Joker
> runs the table.

Leave a placeholder slot for a v6 demo video (§8, `M-01`), so it can replace the v1 video later
without a layout change.

### 02 · It worked before it was pretty (reused old §04)
Keep the curve, the three test sheets and the caveats (n = 1, the author already reads
hiragana, the test measures production rather than learning from zero). Changes:
- **Label it as the v1 measurement**: "Measured on v1: hiragana only, no Joker, no sound, no
  decks." That is the point of the section: the mechanism worked before any of the polish below.
- **Remove the "baseline 16 vs 17 unresolved / blocked" flag.** Before shipping, ask the creator
  for the settled number. Do not publish while the flag is unresolved.
- Leave room for a second curve, a katakana run on v6, as an optional future slot. Hide it if
  there is no data.

### 03 · The Joker
**Point:** a mascot written as a character, with rules strict enough that a script enforces
them.

Copy beats:
1. **Premise.** *He has dealt this deck ten thousand times, and you are the most entertaining
   thing at his table.* He is a guide, not a hero.
2. **The rewrite.** The first draft premise was "he thinks *he* is the Kana Hero." The creator's
   cold read of draft 1: *too much about him, too vague.* **Eight of thirty lines survived.** The
   premise changed. Show this as a before and after (see the pairs below).
3. **The rules.** Show as a short list or chips: positive only · information first, joke in the
   last one to four words · under twelve words · the user is the subject (at most one line in
   three about him) · about 70% carry some Japanese, in kana, never needed to understand the
   line · never spoils the card · never streaks, XP or guilt.
4. **The police.** `scripts/joker-audit.mjs` compiles the corpus and fails the build if a line
   breaks the rules. Every claim that can go stale ("first try means a shiny card") is tagged with
   the fact it depends on (`needs:rule.rarityByTries`) and checked against `joker/facts.json`.
   *The dialogue is tested like code.*
5. **He talks.** Two frames, mouth open and closed, swapped every 110 ms while a line types at
   22 ms per character. His voice is the one synthesized sound in the app (§3.05).

**Line pairs to show.** Take the "kept" lines verbatim from `joker/corpus.md`. Take the "cut"
lines from `docs/design/joker-corpus.md` (draft 1 history), choosing ones the bible's amendment
calls status ego. Suggested kept lines:
- `I shuffled already. You are welcome.` (service ego, kept)
- `First try means a shiny card. No pressure. Some pressure.`
- `Katakana spells borrowed words. コーヒー, タクシー, probably your name.`
- `No signal needed. Underground too. Excuses? なし.`

**Interactive (recommended):** a Joker panel that types a random kept line with the mouth flap
and the blip voice, playing on click only, never on load. Port `lib/joker-voice.ts` (121 lines,
Web Audio, no files) and the flap timing from `components/Joker.tsx`. Respect
`prefers-reduced-motion` the way the app does: no typing, no sound, the full line at once.

Media: `M-02`, `M-03`.

### 04 · Motion
**Point:** every animation answers a question the user has at that moment.

**The key animations are rebuilt live on the page, not shown as video.** The reader presses a
button and the real animation runs in their browser, with the app's timings, easings and sound.
That is the main difference between this case study and a screen recording, and it gets the
most build effort on the page. §4a has the build rules for each demo.

| Demo | Beat | What the reader sees |
| :-- | :-- | :-- |
| **D1** | **The deal (S6b)** | The Joker tosses the set's face-down cards out of his hand, one per flick, in an arc that overshoots the slot by a hair and snaps back. Seated cards bob, each on its own phase. |
| **D2** | **The reward (S8)** | Two beats. First he deals the whole hand face down. Then it turns over: worn, then base, then shiny. Before each shiny there is a silent hold, then the card lifts and flares pink as it turns. Once every card is down, all the shinies swipe together every 3 s. |
| **D3** | **The round (S7): prompt melt + hand tick** | Each prompt is not faded in, it is *made*: noise displacement and blur drain to zero, so the stock hardens into a card. On GOT IT a ghost of the card back flies to `HAND n`, the count pops, and the next prompt melts in. Input is never locked. |
| **D4** | **Stroke reveal** | The real stroke order draws itself at pen speed, with each centerline clipped to its shadow and a pen-lift pause between strokes. |

**Out of scope as live demos (decided 2026-10-22): anything risky to port.** These stay as
short recorded clips: the **receipt hold** (a custom touch gesture plus an ink-replay port), and the **meaning peek**
(1 s, nothing else moves, SPEC-v5e §2). Do not attempt live versions of these, not even as a
stretch goal.

Add a closing line: **reduced motion is designed for every beat, not just switched off.**
Under reduced motion, the deal seats every card behind one 120 ms fade, the reward arrives
finished with one 160 ms fade, the melt is a 160 ms fade, and the hand tick only updates the
count. Each demo follows that same path when the reader's OS asks for it.

Put the design-tool animation boards (`docs/design/v6/S6b Deal Animation.dc.html`,
`docs/design/v5/v5c/S8 earned.dc.html`, `docs/design/v5/v5a-anims/S7 Prompt Melt-In.dc.html`)
next to their demos as screenshots, captioned "board → shipped". The board was designed before
any code was written.

Media: `M-04`, `M-06`, `M-09`, `M-10`, `M-14`.

### 4a · Building the live demos

**Port the app's code, do not re-imagine it.** Each demo copies the shipped app's constants,
keyframes and easings exactly. Where the app's code and an older spec disagree, the code wins
(for example, `lib/reveal.ts` is the truth for the reward screen, not SPEC-v5a §9.3).

**Architecture (in the site repo):**
- One folder, for example `components/case-study/kanahero/`, containing only demo code.
- **Copy these files verbatim** and keep a header comment naming the source commit
  (`b4e6ce1`): `lib/reveal.ts` (pure: timings, order, schedules) and `lib/sfx-schedule.ts`
  (pure: when each sound fires). Delete only the imports and types the demos don't use.
- **Rewrite as standalone components** with no app state, no localStorage, no Joker line engine
  and no progress: `SetScreen.tsx` (the deal effect only), `Result.tsx` + `RevealCard.tsx`
  (the deal and turn effects only), `PromptMelt.tsx`, `HandTick.tsx`, and `Card.tsx` /
  `CardBack` (faces only). Keep the original comments that explain a number. They are part of
  the craft being shown.
- **CSS:** copy only the rules the demos use from kanahero `app/globals.css` (`.revealSlot`,
  `.revealInner`, `.revealFace*`, `.cardShine` + `@keyframes cardShine`, the card face and back
  styles, `.meltFilter`, the `--cols` overlap rule), scoped under one demo class so they cannot
  leak into the site. Bring the THE LOG tokens they need (`--strike`, `--bone`, `--chassis`,
  `--plate`, `--seam`, `--rail`, the fonts) as scoped custom properties.
- **Data:** hard-code a real set, `station-kanji` (9 words, 出口 … 北口), copied from
  `public/sets/station-kanji.json`. Load stroke SVGs for D4 from copies of
  `public/strokes/<hex>.svg`.
- **Sound:** a minimal Web Audio player (one `AudioContext`, created on first click) that plays
  the copied `public/sfx/*.m4a` files at the times `sfx-schedule.ts` returns. Use the app's own
  `lib/sfx.ts` and `lib/audio.ts` as the reference for the scheduling. The setTimeout jitter
  comments there explain why cues are scheduled on the audio clock.

**Shared controls, on every demo frame:**
- A phone-shaped stage, 390 px wide, dark (`--chassis`), sized to fit the column and scaled
  down on narrow screens, never cropped.
- `▶ Play` / `↻ Replay`, and a `Sound` toggle that is **off by default** and shared across all
  demos (one setting for the page).
- The demo plays once on its own when it is half in view, **silently** (IntersectionObserver),
  and never again unless the reader presses Replay.
- A caption under the stage with the numbers (below), set in mono.
- `prefers-reduced-motion`: no autoplay, and Play runs the app's reduced path.

**D1 · The deal.** Source: `components/SetScreen.tsx` lines 24–230.
- The Joker (`joker-mascot-open.png`) sits above a row of 9 face-down backs laid out with
  `colsFor(9)` (two rows, 5 + 4). Each card flies from his fist
  (`HAND = {x: .36, y: .75}` of his box) to its slot.
- Release every `DEAL_INTERVAL = 90` ms. `FLIGHT = 420` ms, `FLIGHT_EASE =
  cubic-bezier(.2,.9,.25,1.12)`, mid-arc keyframe at 0.45 lifted `ARC_LIFT = 26` px, opacity full
  by 0.12. Rotation and scale run as a separate animation: −28° → 0°, 0.45 → 1, over
  `FLIGHT × 0.8`.
- His wrist flicks per card: −7° and 3 px, `min(90 × 1.6, 180)` ms.
- Seated cards start `float()`: a bob of 2–3.5 px, 3.6–5 s, on its own phase via a negative
  delay. Keep it, because it is what makes the table feel alive.
- Sound: one `deal.land` per card at `LAND = round(420 × 0.468) = 197` ms after its release.
  The comment explaining why it isn't 420 is worth quoting in the caption.
- Extra control: a `3 · 9 · 21 cards` toggle, to show how the rows reflow (`colsFor`) and the
  overlap stretches. For 21, repeat the set words.

**D2 · The reward.** Source: `components/Result.tsx` lines 185–270, `components/RevealCard.tsx`,
and `lib/reveal.ts`.
- Beat one (the deal): face-down cards fly from his other hand (`HAND = {x: .72, y: .58}`),
  `DEAL_GAP_MS = 80`, `FLIGHT_MS = 380`, −25° / 0.5 → 0° / 1 with the same overshoot ease, and a
  `FLICK_MS = 130` wrist.
- Beat two (the turn): `revealOrder` (worn → base → shiny), timed by `turnSchedule`. Each card
  turns with a `rotateY(180deg) → 0` transition, `FLIP_MS = 240`, ease
  `cubic-bezier(.3,.6,.3,1)`. Before every shiny, hold `SHINY_HOLD_MS = 450`. The shiny turns over
  `SHINY_FLIP_MS = 320` and lifts −6 px with a pink drop-shadow flare
  (`rgba(255,46,136,.9)`, 18 px) over `320 + 260` ms.
- The count above the row ticks with each turn (scale 1 → 1.04 → 1, 180 ms), and the tally
  `n SHINY · n BASE · n WORN` updates as each face lands.
- Once the last card is down, every shiny gets `.revealShining` on the same frame: one diagonal
  white swipe across the face every 3000 ms (`@keyframes cardShine`).
- **A tap hurries rather than skips:** the first tap riffles the rest over at `FAST_FLIP_MS = 140`
  / `FAST_STEP_MS = 70` with no shiny holds. A second tap snaps everything flat. Build this,
  because it is a design decision worth showing.
- Sound: `revealCues(order)`, one `flip.<rarity>` per turn and `reveal.end` when the last card is
  down, with silence during the shiny hold ("the silence is the anticipation"). Hurrying uses
  `hurryCues`.
- Extra control: a hand picker with three presets, each 9 cards: **Clean run** (6 shiny, 3
  base), **Mixed** (2 shiny, 4 base, 3 worn), **Rough day** (0 shiny, 2 base, 7 worn). The
  reader hears and sees rarity change the pacing.
- Leave out the Joker's line, the result note and the card overlay.

**D3 · The round (melt + hand tick).** Source: `components/PromptMelt.tsx`,
`components/HandTick.tsx`. Board: `docs/design/v5/v5a-anims/S7 Prompt Melt-In.dc.html`.
- The Joker, a `DECK 9 · HAND 0` header, and one 150 × 210 prompt card (romaji + English, from the
  station set).
- **Melt:** `feTurbulence` → `feDisplacementMap` (`STRENGTH = 70` → 0) → blur (`BLUR = 9` → 0)
  over `MELT_MS = 900`. Opacity is full by 0.4, the card settles from `DROP = 8` px and
  `START_SCALE = 0.92`, and the Joker tips `−6°` toward it and recovers. Sound: `prompt.melt`.
  Leave out the optional smoke from the board.
- **Hand tick:** a `GOT IT` button sends a ghost of the card back to `HAND`
  (`FLIGHT_MS = 260`, `cubic-bezier(.2,.8,.2,1)`, scale to about 0.2), then pops the count
  (`POP_MS = 160`, `POP_SCALE = 1.15`) and plays `hand.tick`. The next prompt melts in at the same
  moment, on its own element, so the flight and the melt never touch. The reader can tap GOT IT
  repeatedly: input is never locked, which is the point the caption makes.
- **Safari check (required):** test on a real iPhone. The app already ships this filter there,
  so it should hold up. If it stutters on the page, fall back to the `M-06` clip on that browser
  only (the hand tick stays live with a plain swap), and say so in the report.

**D4 · Stroke reveal.** Source: `lib/strokeAnimator.ts`, `components/StrokeChar.tsx`,
`components/WordReveal.tsx`.
- Two cells: `そ` (strokesvg) and `新幹線` (KanjiVG, three cells), drawn by the same animator, so
  the reader sees the two sources match. Replay redraws. Durations scale with path length.
- No writing canvas. Touch drawing inside a scrolling page is out of scope.

**Fidelity check (required before shipping):** run each demo next to the live app at 390 px and
compare by eye. A screen recording of both, side by side, belongs in the report. Any timing you
changed and why goes in the report too.

**Performance:** demos mount only when near the viewport, cancel every `Animation` and timer
on unmount or Replay (the app's cleanup paths show how), and decode audio only after the first
Sound click. Without sound, the page's JS budget for all demos should stay small. There is no
animation library; the app uses WAAPI and CSS, and so do the demos.

### 05 · Sound
**Point:** a sound palette with a rule, tuned by ear, and one deliberate exception.

Copy beats:
1. **Palette: the card table.** Brush, paper, cardstock, felt and wood, and one metal. Every cue
   is an object you would find at a card table. (Graphite was cut when both hands became
   brushes.)
2. **Objects are foley, the character is synthesized.** The Joker's voice is the one sound with
   no file: a square-wave blip with pitch jitter, in the line of old RPG dialogue (Undertale,
   Zelda, Animal Crossing). The reason: *a voice should not be made of the same material as the
   furniture.* The app has two visual layers (the card table, and THE LOG's razor geometry), and
   the sound follows the same split.
3. **Tuned by ear, not by table.** Cues were generated, then trimmed and levelled in a
   purpose-built sound lab (`npm run sfx:lab`). The lab's config overrides the design numbers.
   The voice was tuned the same way, on a phone speaker, against the longest real line.
4. **Loudness as hierarchy.** Show a small bar or ladder chart of peak levels: the Joker's voice
   is the quietest thing in the app (−28 dBFS), the worn flip sits below the base flip, and the
   shiny flip is the loudest card. Rarity can be heard.
5. **What was cut:** `deal.press` was wired, then removed (2026-09-25). One line on that is
   enough: cutting sounds is part of the design.

**Interactive (required for this section to work):** a grid of play buttons, one per cue, using
the shipped files in kanahero `public/sfx/*.m4a`. Copy them into the site repo; do not hotlink
the app. Group them by moment: *the loop* (`hand.tick`, `prompt.melt`), *the deal* (`deal.land`),
*the reveal* (`flip.worn`, `flip.base`, `flip.shiny`, `reveal.end`, `reveal.skip`), *the
interface* (`ui.nav`, `ui.primary`, `ui.toggle`, `drawer.open`). Add one "Joker voice" button
that uses the ported synth from §03. Nothing autoplays. Each button has a visible label, a
duration and a level.
Peak levels come from `sfx-src/sfx.config.json` where present, otherwise from the tables in
`docs/spec/SPEC-v5d-sound.md`.

Point back to **D2 (the reward)** with one line: *"Turn the sound on and replay the reward
above. The flips climb in pitch with rarity, and the hold before a shiny is silent."* D2 with sound
is the best single asset on the page. Do not build a second copy of it here.

### 06 · The card: earned, worn, shiny
**Point:** progress shown as a collection of cards, not a percentage.
- A word earns a card when you grade it correct. **First try → shiny, second → base, third or
  later → worn.** Rarity is fixed at the earn.
- **Nothing is kept until the run finishes.** Abandon the run and you keep nothing. The reward
  belongs at the end, so GOT IT is a 260 ms tick and the celebration happens on S8.
- Shiny is the only glowing element on any screen.
- Figures: the three rarities side by side (`M-11`; render them with the D2 card component,
  not screenshots), the S6d collection shelf (`M-12`), and the
  S6b set screen with face-down backs and the MEANING switch (`M-13`).

### 07 · The receipt (v6)
**Point:** the first data the app keeps that is not a number or a photo: your actual ink.
- Every card you earn keeps the ink you graded GOT IT on, as timed points, not a picture.
- **Hold the card** and it turns into your attempt, with the strokes replaying in the time you
  wrote them (compressed to at most 2 s) and the model word faint over them.
- Swipe through every copy of a word, newest first, each dated: `SHINY · 9-18-26`.
- *"This is the one thing points can do that a PNG cannot."*
- Figure: `M-14`, the hold-to-replay clip. This is the strongest new visual feature, so give it
  room.

### 08 · The system: THE LOG
Light section, one figure. `.github/media/palette.svg` shows seven greys and four signals. Rules
to state:
- `strike` (#ff2e88) is the only colour spent on interaction.
- `live` (#00e58a) and `caution` (#ffb300) are reserved for GOT IT and MISSED, which is why
  DELETE in the bank is caution-bordered and never strike: *deletion is permitted, not wanted.*
- Four typefaces: Klee One (the kana hand), Archivo, JetBrains Mono, Noto Sans JP.
- Tokens: kanahero `app/globals.css`, top of file.

### 09 · What it refuses to do
A compact two-column table, adapted from the README's "What it does not have": no handwriting
recognition, no hints, no skip, no streaks or notifications ("retention theater"), no account,
and no percentages (`38 of 71` says what is left; `54%` says how much you are failing). Six rows
at most.

### 10 · Process: spec before code
This replaces the dropped prompts section without showing any prompts. A horizontal strip of
thumbnails, one per version, each captioned with its date and the single thing it added:

| | | |
| :-- | :-- | :-- |
| v1 | 2026-08-04 | the loop · *Wireframes, Hi-Fi* |
| v2 | 2026-08-30 | katakana, THE LOG · *v2 Handoff* |
| v3 | 2026-08-31 | capture bank, offline · *v3 Handoff* |
| v4 | 2026-09-16 | the Joker and the card, designed, no code · *v4 briefs, v4 Handoff* |
| v5 | 2026-09-16 → 22 | the Joker, decks, sets, motion, sound · *v5 / v5a / v5c handoffs, Sound Inventory* |
| v6 | 2026-09-25 | the receipt · *v6 Receipt* |

Thumbnails are screenshots of `docs/design/**/*.dc.html` (`M-15`). One closing line:
*"Every version had a written spec and a design handoff before a line of code. When a build
contradicted a spec, the build record says so."* Link to the build video only.

### 11 · Use it (reused old §03)
Reuse the install section and its home-screen mockup. Edits:
- URL → `kanahero.joeyguierra.com`
- "0 of 71 written from memory" → show the current S1 switchboard (hiragana / katakana / kanji /
  bank), or drop the counter.
- Add one line: *works fully offline after the first load, including on a plane or underground.*

---

## 4. Footer: credits (required)
The CC BY-SA licence requires a visible credit, so include this in the footer:
- Kana stroke order: **strokesvg** by zhengkyl (MIT)
- SVG paths derived from **Klee One** (SIL OFL 1.1)
- Kanji stroke order: **KanjiVG** by Ulrich Apel and contributors, **CC BY-SA 3.0**, modified
- Fonts: Klee One, Archivo, JetBrains Mono, Noto Sans JP (SIL OFL 1.1)

Use the exact wording and links from the README's "Stroke data" section.

---

## 5. Media manifest

`EXISTS` = copy from the kanahero repo. `CAPTURE` = record from the live app on a phone, at
390 px wide, 60 fps, dark UI, no notifications. Until a `CAPTURE` item is recorded, render a
labelled placeholder with the right aspect ratio and the ID on it. **Do not ship the page with
placeholders showing.** List them in your report instead.

| ID | What | Status | Source / how |
| :-- | :-- | :-- | :-- |
| M-01 | v6 demo (future replacement for the v1 video) | CAPTURE (later) | full run: home → deal → 3 prompts → reveal |
| M-02 | Joker, both frames | EXISTS | `public/assets/joker-mascot-{open,close}.png` (1080²) |
| M-03 | Joker typing a line, with sound | CAPTURE | S1 Home, audio on |
| M-04 | Stroke reveal | EXISTS + CAPTURE | `.github/media/stroke-so.svg`, `.github/media/loop.gif`; plus a kanji word reveal (新幹線, three cells) |
| M-05 | Deal | **LIVE: D1** | no recording needed |
| M-06 | Prompt melt | **LIVE: D3** (+ CAPTURE as a Safari fallback only) | S7, two consecutive prompts, with sound |
| M-07 | Hand tick | **LIVE: D3** | no recording needed |
| M-08 | Reward reveal | **LIVE: D2** | no recording needed |
| M-09 | Meaning peek | CAPTURE | MEANING off, grade a card |
| M-10 | Animation boards | EXISTS | screenshots of `docs/design/v6/S6b Deal Animation.dc.html`, `docs/design/v5/v5c/S8 earned.dc.html` |
| M-11 | Shiny / base / worn faces | **LIVE** | the D2 card component, static |
| M-12 | Collection shelf | CAPTURE | S6d |
| M-13 | Set screen with MEANING switch | CAPTURE | S6b |
| M-14 | Receipt hold-to-replay plus swipe | CAPTURE | S6d, a word with 2+ copies |
| M-15 | Handoff thumbnails | EXISTS | screenshots of each `docs/design/**/*.dc.html` |
| M-16 | Sound files | EXISTS | `public/sfx/*.m4a` (13) |
| M-17 | Palette | EXISTS | `.github/media/palette.svg` |
| M-18 | Old §02 / §03 / §04 assets | EXISTS (site repo) | reuse as they are |

Video (only what is still a clip): muted autoplay loops, plus click-to-play with sound for
M-03. Provide poster frames. Keep each loop under 2 MB where possible.

---

## 6. Constraints
- Phone width first. Sections stack, and media fits a 390 px column with 16 px side gutters.
- The app's palette (§08) may be used **inside figures and section accents**. The page chrome
  follows the site's own system. Do not reskin the site.
- No audio plays without a click. One audio context, created on the first click.
- `prefers-reduced-motion`: posters instead of autoplay loops, and the Joker panel shows lines
  without typing.
- No prompts and no code links anywhere on the page (the repo link is dropped along with §06).
  The build video is the only process link.

## 6a. Share preview (site repo)
The case study gets its own share card, set in the site repo's metadata for this route. Do not
reuse the app's card.
- `og:title` / `twitter:title`: **Kana Hero: a case study**
- `og:description`: *From a 53-minute prototype to a handwriting drill with a dealer, a sound
  palette and ink you can replay. Design, motion and sound.*
- `twitter:card`: `summary_large_image`, `og:type`: `article`, with an absolute `og:url`.
- Image, 1200 × 630, under 1 MB: the same THE LOG treatment as the app's card
  (kanahero `scripts/gen-og.mjs`, which renders `app/opengraph-image.png`). Swap the eyebrow to
  `CASE STUDY`, keep the Joker on the right, and use the chip `16 → 43 / 46 IN ONE DAY` or
  `DESIGN · MOTION · SOUND`. Reuse that script as the template rather than designing a new card.
- Alt text set for both images. Check the result in the X card validator, the Facebook sharing
  debugger and a real WhatsApp message. WhatsApp caches previews per URL, so test with a
  `?v=` suffix.

## 7. Open questions for the creator (ask, do not guess)
1. Route spelling: `kanahero` (assumed) or `kanehero`?
2. The settled baseline: 16 or 17?
3. Should the old `/kanahero` page link here, or redirect here eventually?
4. Run a katakana test on v6 for a second curve?

## 8. Report back
Route URL (preview), sections built, which media are real and which are still placeholders, any
fact you corrected against the source, and the answers still needed from §7.

---

## 9. Build report (2026-10-22, implementer)

Built in the site repo at `/case-study/kanahero`; the full record, with every decision and stumble, is the
site's `docs/buildlog.md` (session "case study page"). Summary:
- **Route:** `/case-study/kanahero` (creator confirmed the spelling). Old `/kanahero` gains one link line.
- **Sections:** all of §2 built. D1–D4 are live ports of the app's code (§4a); reveal.ts,
  sfx-schedule.ts and strokeAnimator.ts are verbatim copies headed with the source commit.
- **Fidelity:** shipped build vs D1/D2, side by side — `fidelity-deal.mp4`, `fidelity-reveal.mp4` in
  this folder. S8 counts match frame for frame (0/1/3/4/7 EARNED at 0.5/1.5/2.6/3.6/6.0 s). No timing
  was changed. Deviations: D3 swaps the prompt plainly (no melt); stage is shorter than a phone.
- **Sound levels on the page are measured** off the shipped files, not taken from the v5d tables.
- **Answers to §7:** (1) `kanahero`. (2) 16 — already settled 2026-08-20 in the site's `lib/kanahero.ts`.
  (3) link, as built; redirect still the creator's call. (4) still open.
- **Still owed before ship:** only the M-10 boards *(M-12 and M-13 were removed from the page on the creator's call, 2026-10-22 21:12 — no empty cards)*. M-10 boards (they render as unfilled templates without
  the design tool's runtime — need screenshots from the tool). M-01 optional.
- **Amended 2026-10-22 20:56 (creator):** the "out of scope as live demos" line in §04 is overridden. The melt
  and the meaning peek are live inside D3 (the full S7 round, as Round.tsx runs it), with a frame watchdog that
  falls back to the app's 160 ms fade where a device can't draw the filter. The receipt is live as D5: the
  reader writes 出口 on the app's board and holds their own card. `fidelity-melt.mp4` and `fidelity-peek.mp4`
  in this folder. iPhone Safari is still untested.
- **New finding:** the shipped kanji deck shows the 3-word TEST set to users.
