# kanahero — v5d · the sound pass (ElevenLabs generation brief)

**Status: BRIEF, not built.** Drop at `docs/spec/SPEC-v5d-sound.md`.
**Base:** `e3cd9e3`. **Unfreezes:** SPEC-v5a §9.4 — *"There is no sound engine. Build none, add
no audio code or assets."* Five `// sfx:` markers are the entire existing footprint.
**Palette decision (2026-09-18): CARD TABLE.** Cardstock, felt, wood, clay, one metallic accent.

---

## 0. The four constraints that shaped every prompt below

### 0.1 Silent-first — AMENDED 2026-09-20

This app's real runtime is an overnight coach with everyone asleep, a quiet car, and a shop
counter. A drill app whose feedback *requires* sound is unusable in exactly those places.

**Two channels, and one derived state** (`AudioPrefs` in `lib/progress.ts`):

| Setting | Stored | What it is |
| :-- | :-- | :-- |
| **Joker voice** | `audio.voice` | his blip as the line types (`lib/joker-voice.ts`) |
| **Sound effects** | `audio.sfx` | the card-table one-shots (`lib/sfx.ts`) |
| **Silent mode** | *not stored* | the state where both are off |

Silent mode being **derived rather than stored** is the good decision here: the dialog cannot
disagree with itself, because switching both off by hand and switching silent on are literally the
same state. One consequence, accepted: coming back out of silent turns both on, so a
voice-off/sfx-on setup is not remembered across it.

> **⚠️ AMENDMENT — both channels now default ON** (creator call, 2026-09-20). The original rule was
> *"Default OFF, sound is opt-in."* That is reversed. **Three things make it defensible:**
>
> 1. **On iOS the platform already enforces it.** `lib/audio.ts` sets
>    `audioSession.type = "transient"` and deliberately never `"playback"`, so the hardware ringer
>    switch silences Web Audio. A phone on silent in a quiet car is silent with no app-level
>    default doing anything.
> 2. **Nothing in this app is loud.** The whole ladder lives between −26 and −9 dBFS; the loudest
>    single thing is `flip.shiny`, and the bed people hear most sits at −24.
> 3. It is an app you chose to open, not a page that started playing at you.
>
> **The residual risk, named:** Android and desktop have **no ringer switch**. There, default-ON
> means the first tap makes noise with no OS-level guard. That is the real cost of this amendment,
> and the mitigation is only that the levels are low. If it ever bites, the fix is default-OFF on
> platforms without an `audioSession`, not a blanket revert.

**Unchanged, and the more important half:** **nothing is ever sound-only.** Every moment in this
document already has a complete visual. Sound is a second channel on an existing signal, never the
signal — so silent mode costs the user no information at all.

The offline-first and $0-runtime laws are untouched: these are static assets in the bundle.

**No background music.** Decided 2026-09-20, consistent with the inventory's Tier 4 (*"Music. The
pencil loop is the score."*). A generative ambient bed was considered and **banked, not rejected** —
it would be synthesized rather than a track, for the same reasons as the ink and the voice (no loop
fatigue, no licensing, no 2 MB in the precache). Revisit only after a real set has been drilled with
the ink bed and nothing under it; the bed may already be the score.

### 0.2 The flip interval can collapse to 114 ms
`revealSchedule()` computes `step = min(160, 2400 / n)`. A 21-card set gives **114 ms between
flips**. Any flip one-shot longer than ~100 ms smears into the next one and the reveal turns to
mush at exactly the moment it should feel best. This is the hardest number in the document:
**flip.worn and flip.base must be ≤ 95 ms after trimming.** Shiny is safe — `SHINY_STEP_MS` is
320 ms — and gets to be the long, bright one.

### 0.3 The rarity ladder is a material ladder
From Balatro's feedback-proportionality principle: response scales with significance. Worn → base
→ shiny is one sound family climbing, not three unrelated sounds. Across the three, **four things
move together**: material (felt → wood → metal), brightness (dull → crisp → ringing), length
(75 ms → 90 ms → 280 ms), and level (−18 → −15 → −9 dBFS peak). Shiny is the only object in the
entire app that rings, which mirrors it being the only thing that glows.

### 0.4 ElevenLabs can't hand you a 90 ms one-shot
API minimum is 0.5 s (playground goes to 0.1 s but quality collapses). The working method is:
**generate at 0.5 s, then trim.** Every prompt below therefore ends with an anechoic/no-tail
clause, because reverb you can't remove is the one defect trimming won't fix. Each generation
returns **4 variants** — keep them; §3 uses them as round-robins.

---

## 1. The six files

Five markers, but `reveal.flip` takes the card's rarity, so it's three files — and one marker was
dropped (below).

| File | Marker | Site | Fires | Trim to | Peak |
| :-- | :-- | :-- | :-- | :-- | :-- |
| `hand.tick` | `hand.tick` | `Round.tsx:160` | once per `GOT IT` | ≤180 ms | −12 dBFS |
| `flip.worn` | `reveal.flip worn` | `Result.tsx:82` | ≤21× at 114–160 ms | **≤75 ms** | −18 dBFS |
| `flip.base` | `reveal.flip base` | `Result.tsx:82` | ≤21× at 114–160 ms | **≤95 ms** | −15 dBFS |
| `flip.shiny` | `reveal.flip shiny` | `Result.tsx:82` | rare, 320 ms apart | ≤280 ms | −9 dBFS |
| `reveal.end` | `reveal.end` | `Result.tsx:93` | once, last card lands | ≤700 ms | −12 dBFS |
| `reveal.skip` | `reveal.skip` | `Result.tsx:63` | on tap during reveal | ≤250 ms | −12 dBFS |

### ~~`reveal.shinyHold`~~ — DROPPED 2026-09-19

An anticipation riser in the 450 ms `SHINY_HOLD_MS` gap before the first shiny turns. Cut, for
four reasons, and it should not come back without new ones:

1. **It has no material.** Every other cue is brush, paper, cardstock, felt/wood or metal. A
   rising swell is none of them — nothing on a card table makes one. It was the only outlier in
   the material map.
2. **The silence is already the anticipation.** 450 ms of nothing, then the only sound in the app
   that rings, at the only level above −12. A sound inside the gap competes with the thing the gap
   exists to set up. Silence is a tool.
3. **Same reasoning already applied elsewhere** — the shiny sweep is deliberately silent because
   `flip.shiny`'s own ring is the sweep. The hold is that call one beat earlier.
4. Hardest of the set to generate, for the least return.

It also took a latent bug with it: the `// sfx: reveal.shinyHold` marker sat in the *landing*
branch, which runs for **every** shiny, while §9.4 specified "before the first shiny." The cue and
its call site never agreed.

---

## 2. The prompts

All six under the 450-character cap. Settings: **`duration_seconds: 0.5`**,
**`prompt_influence: 0.6`** (literal — we want the described object, not a creative read), except
`reveal.end` as noted. Generate, keep all 4 variants, then trim per §3.

### hand.tick — the card joins the hand
> One playing card sliding into a held hand of cards. Close-mic'd dry cardstock foley: a single
> short papery snap with a soft woody click at the end. No reverb, no room tone, no music, no
> tail. One isolated one-shot, dry and tight, silence after.

`prompt_influence: 0.6` · `duration_seconds: 0.5`

### flip.worn — the dull one
> A single soft worn playing card turning face-up onto green felt. Dull muted cardstock flap, low
> and papery, no snap, no ring, no click. Close-mic'd dry foley, anechoic, no reverb, no room
> tone, no music, no tail. One isolated one-shot, extremely short, silence after.

`prompt_influence: 0.6` · `duration_seconds: 0.5`

### flip.base — the crisp one
> A single crisp playing card turning face-up onto a hard wooden table. Clean cardstock snap with
> a light woody tap, brighter and tighter than a card landing on felt. Close-mic'd dry foley,
> anechoic, no reverb, no room tone, no music, no tail. One isolated one-shot, very short, silence
> after.

`prompt_influence: 0.6` · `duration_seconds: 0.5`

### flip.shiny — the only thing in the app that rings
> A single stiff foil-backed playing card snapping face-up on wood, with a faint bright metallic
> ring in the tail like a small struck coin. Crisp attack, short glassy shimmer, no melody, no
> chord. Close-mic'd dry foley, anechoic, no room tone, no music. One isolated one-shot, silence
> after.

`prompt_influence: 0.6` · `duration_seconds: 0.5`

### reveal.end — the run is over
> A deck of playing cards being squared and tapped once against a wooden table, settling. One soft
> confident low-mid wooden knock with a short papery body, final and calm. No ring, no music, no
> reverb, no room tone. Close-mic'd dry foley. One isolated one-shot, silence after.

`prompt_influence: 0.5` · `duration_seconds: 1`

### reveal.skip — everything lands at once
> A loose spread of playing cards gathered and dropped flat onto a table all at once. One soft
> compound papery thud, many cards landing together, slightly dull and unceremonious. No snap, no
> ring, no music, no reverb, no room tone. Close-mic'd dry foley, anechoic. One isolated one-shot,
> silence after.

`prompt_influence: 0.6` · `duration_seconds: 0.5`

---

## 2b. Tier 1 — the loop

**Added 2026-09-19.** Tier 0 is the end of a run; tier 1 is what the app *sounds like* — these fire
every word, 9–21 times a run. Five generations cover seven cues.

| File | Site | Trim to | Peak | Notes |
| :-- | :-- | :-- | :-- | :-- |
| `ink.loop` | pointer held and moving on the canvas | **whole, 2 s** | −20 dBFS | a bed, not a one-shot — see below |
| `ink.down` | `pointerdown` on the canvas | ≤40 ms | −22 dBFS | RR3 |
| `ink.up` | the lift | ≤30 ms | −26 dBFS | same generation as `ink.down`, other end |
| `ink.reveal` | FLIP — his model over your ink | ≤250 ms | −16 dBFS | broad wet brush — his weight |
| `hand.miss` | `MISSED` in `Round.tsx` | ≤180 ms | −16 dBFS | the opposite gesture to `hand.tick` |
| `ink.clear` | `CLEAR` — the canvas wiped | ≤300 ms | −18 dBFS | a fresh sheet; `ink.undo` is this at rate 1.4 |

### `ink.loop` is a bed, and the bake treats it differently

Marked `loop: true` in `sfx-defaults.mjs`, which skips the head strip, the cap and — the one that
matters — **the fade**. An 8 ms fade-out on a looping file is a hole punched in it once per cycle.
Level is still matched; nothing else is touched.

**Generate it with ElevenLabs' own `loop: true`**, so the ends meet at generation time. A loop point
crossfaded in afterwards always leaves a seam you can hear under a two-second bed.

It is baked at **−20**, the *top* of its −26…−20 range, because runtime gain and `playbackRate`
ride pointer speed downward from there. It will sound too loud auditioned alone. That is correct.

⚠️ **Do not give it a second speed model.** `WritingCanvas.tsx` already computes pointer speed in
px/ms inside `segmentWidth()`, with `SPEED_FULL_THIN = 2.2` as the point where the line is thinnest.
The sound takes *that* number. Two speed curves would drift, and then the stroke you see and the
sound you hear disagree.

### The prompts

All under the 450-character cap. `prompt_influence: 0.6` unless noted.

**`ink.loop`** — the player's brush · `duration_seconds: 2` · `loop: true` · `prompt_influence: 0.5`
> Continuous close-mic'd fine brush writing on paper. A small dry brush, steady medium-speed
> strokes, soft fibrous drag with faint bristle texture, even and unchanging from start to end. No
> pauses, no lifts, no drips, no water, no hand or clothing movement, no room tone, no music.
> Anechoic, dry, seamless.

**`ink.down`** — also yields `ink.up`
> A fine brush tip touching down onto paper. One soft damp press with a faint bristle spread,
> close-mic'd foley. No sweep, no drip, no water, no ring, no click, no room tone, no music, no
> reverb, no tail. One isolated one-shot, extremely short, silence after.

**`ink.reveal`** — the Joker's brush, and it must not be mistaken for yours
> One confident stroke of a broad wet brush across paper. A full smooth sweep, wetter, lower and
> wider than a fine brush line, loaded with ink, ending in a clean lift. Close-mic'd dry foley,
> anechoic. No drips, no pouring water, no scribble, no room tone, no music, no reverb. One
> isolated one-shot, silence after.

**`hand.miss`**
> One playing card slid back underneath a deck resting on green felt. A dull muffled papery push,
> low and soft, friction of card on card. No snap, no ring, no click, no impact. Close-mic'd dry
> foley, anechoic, no room tone, no music, no reverb. One isolated one-shot, silence after.

**`ink.clear`** — a fresh sheet, not an eraser · also yields `ink.undo`
> A single sheet of paper pulled away and a fresh one settling in its place. One light dry slide of
> paper against paper, quick and clean. Close-mic'd dry foley, anechoic. No crumple, no tear, no
> fabric rustle, no room tone, no music, no reverb. One isolated one-shot, silence after.

### Two reuse rules

- **`ink.up` is `ink.down` trimmed from the other end.** Save the download twice, as
  `ink-down.mp3` and `ink-up.mp3`; the lab treats them as two sounds and the bake gives two files.
- **`ink.undo` is `ink.clear` at `playbackRate` 1.4** at runtime — one stroke lifted, tighter and
  smaller. No second file.

### Material — AMENDED 2026-09-20: both hands are brushes

**Was:** the player writes in graphite, the Joker in brush — two instruments.
**Now:** both are brushes, told apart by weight and wetness, not by instrument.

Why the change is right: the player is drawing kana with a fingertip on glass, so neither instrument
is literal — both are metaphors, and a brush is the on-thesis one for Japanese handwriting. A pencil
was the odd object in a Japanese writing app.

**How they stay distinguishable.** Three differences stack, and the third is free:

1. **Weight** — the player has a small dry brush, fine and fibrous; the Joker has a broad wet one,
   loaded, lower and smoother.
2. **Level** — the player's bed sits at −26…−20, his stroke lands at −16. He is always the louder hand.
3. **Shape, which costs nothing** — the player's sound is a *bed modulated by their own hand*, so it
   is hesitant, variable, and as long as they take. His is *one scripted sweep*. Even at identical
   timbre, a wavering texture and a single confident stroke are not the same gesture.

⚠️ **The risk this creates, and the test for it.** Two brushes blur more easily than a brush and a
pencil, and telling the two hands apart is the job this pair exists to do. So: play `ink.loop`
followed by `ink.reveal` with your eyes closed and ask *whose hand was that.* If the answer is not
instant, widen the weight gap before touching anything else — that is the lever, not the level.

**The eraser goes with the pencil.** With no graphite there is nothing to erase, so `ink.clear` is
now **a fresh sheet** — the page pulled away and replaced. Better anyway: clearing a brush drawing
has always meant new paper, and `ink.undo` at rate 1.4 reads as a half-pull rather than a full swap.

`hand.miss` is unchanged — **cardstock on felt**: old-school "damage", gentled to nothing. Never a
buzzer, never a minor interval; his line is already kind and the sound must not undercut it.

**Material map after this change:** brush (both hands, two weights) · paper (the sheet) · cardstock
(cards) · felt and wood (the table) · metal (shiny, and nothing else). Graphite is gone.

### `joker.talk` is NOT in tier 1

The v5d sound inventory files it under felt and wood as a paper click. It is not a file at all —
see §5b. That was decided and shipped; the inventory entry is superseded.

---

## 2c. Tier 2 — deals and arrivals

**Added 2026-09-20.** Once per run each, the beats between screens. **Four files** — the fifth cue
is held (below).

| File | Site | Trim to | Peak | Fires |
| :-- | :-- | :-- | :-- | :-- |
| `deal.press` | DEAL, the S6b CTA | ≤400 ms | −12 dBFS | once, opening the run |
| `prompt.melt` | M5, every presentation | ≤700 ms | −24 dBFS | **9–21× a run** |
| `deal.land` | M4, S6b mount | **≤80 ms** | −18 dBFS | ×9, **90 ms apart** |
| `reveal.arrive` | M14, S8 mount | **≤240 ms** | −14 dBFS | once |

### The bookend got better

`deal.press` and `reveal.end` are the same deck heard opening and closing a run. The first draft
made them a *cut* and a *tap* — too close together to read as two different moments. **A shuffle to
open and a square-up to close** is the pair people actually recognise: you shuffle before you deal,
you square up when you are done. Same object, clearly different gestures, and the run now has
audible bookends rather than two similar knocks.

### Two numbers that changed from the inventory

**`deal.land` is the densest cue in the app.** Nine backs seat **90 ms apart** — tighter than the
reveal's 114 ms, which §0.2 already calls the hardest constraint in this document. Same cure: ≤80 ms
after trim, three variants cycled.

**`reveal.arrive` is 240 ms, not 280.** `LEAD_MS` is 300 (`lib/reveal.ts`), so 280 left 20 ms of
margin against the first flip — and `arrive` is at −14 while `flip.worn` is at −18, so it would
still be ringing underneath it. Schedule it at t=0 in the same audio-clock pass as the flips.

### Before generating `deal.land`, try `flip.worn`

Same material, near-identical action, a file that already exists and is already tuned. If it works,
that is one fewer generation, one fewer thing in the precache, and one more way the app sounds like
one place. Only generate if it plainly does not.

### The prompts

`prompt_influence: 0.6` unless noted. All under the 450-character cap, all carrying the anechoic
clause and the no-hiss ban the ink family taught us (§2b).

**`deal.press`** — the end of a shuffle · `duration_seconds: 1` · `prompt_influence: 0.5`
*(Rewritten 2026-09-20: was "squared once and then cut". A shuffle is the better opening gesture —
see the bookend note below.)*
> The last half-second of a riffle shuffle: the cascade snapping closed and the deck settling
> square. A fast dry run of cardstock zipping together, then one soft papery knock as it lands
> flat. Close-mic'd dry foley, anechoic. No long spray, no fan, no bridge flourish, no hiss, no
> sibilance, no room tone, no music, no reverb. One isolated one-shot, silence after.

> **⚠️ The trim runs from the HEAD, and you want the tail.** If a generation gives you a whole
> shuffle rather than its last moment, do not re-roll — **use the head-trim slider in the lab** to
> jump into the cascade, then read the number off and let it into `sfx.config.json`. That knob
> exists for exactly this. Raising `prompt_influence` to 0.7 also pushes the model toward the
> fragment rather than the full action.
>
> **Level watch:** −12 is the loudest tier below shiny, and a shuffle is a busy, broadband sound.
> If it sits too far forward against `deal.land` and the melt, take it to −14 in the lab. This is a
> gesture that opens a run, not a reward.

**`prompt.melt`** — must be felt, not heard
> Fine paper settling and drifting down to stillness. A soft low hush that drains away to nothing —
> no impact at the start, no event inside it. Close-mic'd, anechoic, warm and muffled. No scratch,
> no grit, no hiss, no sibilance, nothing bright, no room tone, no music, no reverb. One isolated
> one-shot fading to silence.

**`deal.land`** — RR3
> One playing card landing flat on green felt. A single soft low muffled slap, dull and cushioned,
> gone instantly. No snap, no ring, no scrape, no slide, no hiss, nothing bright. Close-mic'd dry
> foley, anechoic, no room tone, no music, no reverb, no tail. One isolated one-shot, extremely
> short, silence after.

**`reveal.arrive`**
> A small stack of playing cards placed down softly on a table, once. One low cushioned settle with
> a faint papery body, gentle and final, no impact. No snap, no ring, no slide, no shuffle, nothing
> bright. Close-mic'd dry foley, anechoic, no room tone, no music, no reverb. One isolated one-shot,
> short, silence after.

### ⏸ `deal.throw` — written, held

Not in `sfx-defaults.mjs`, deliberately. From t=420 the throws and the lands interleave 90 ms apart,
and it is probably one sound too many. **Build the deal, hear it, and add this only if it feels
weightless without it** — then add `"deal.throw": { tier: 2, ms: 70, peak: -24, gap: 90 }`.

> One playing card flicked off the top of a deck into the air. A short dry papery flick with a faint
> whisper of air and no landing. No snap, no ring, no whoosh, nothing bright. Close-mic'd dry foley,
> anechoic, no room tone, no music, no reverb, no tail. One isolated one-shot, extremely short,
> silence after.

### The rule `prompt.melt` lives under

It is the closest thing to ambience in the app and it fires 9–21 times a run at −24, the same level
as the ink bed. **It ducks to nothing while the bed is active** — the player is writing, and two
textures at the same level is how a mix turns to mud. If it ever reads as noise, the answer is
silence, not a louder file.

---

## 3. Post-processing (this is where the sounds actually get made)

Generation gets you raw material. The trim is the design.

**Three files do this, and none of them is Audacity.**

| | |
| :-- | :-- |
| `scripts/sfx-defaults.mjs` | every cue's tier, cap, target peak, gap and loop flag — the tables in §1 and §2b, in code. One module, because the bake and the lab both read it and a second copy would drift silently. |
| `scripts/sfx-lab.mjs` + `sfx-lab.html` | `npm run sfx:lab` → a local page on 127.0.0.1. Tabs per tier. Per sound: waveform with the kept region lit, the numbers, and **PLAY RAW / PLAY TRIMMED / PLAY BAKED**. Sliders for cap, target peak and head trim. **SAVE** writes `sfx-src/sfx.config.json`; **BAKE** runs the real pass and reloads so you hear the actual `.m4a`. |
| `scripts/build-sfx.mjs` | `npm run sfx` → the bake. Defaults, overridden per sound by `sfx.config.json`, rendered by ffmpeg. |

**The browser decides, ffmpeg renders.** The page never writes audio — float samples in a tab
cannot tell you what AAC did to the peak, and that is exactly the thing that matters (below). So
the lab is where the decision is made by ear, and the script is what makes it true on disk.

**The lab lives in `scripts/`, not in the app.** `output: "export"` plus `gen-sw.mjs` means
anything under `app/` or `public/` ships *and* is precached onto a stranger's phone. A tuning rig
is not the product.

`sfx-src/sfx.config.json` is committed and holds **only the sounds actually moved** — it reads as a
list of deliberate departures from the spec, not a second copy of it. `gen-sw.mjs` walks the whole
export, so baked files are precached with no registration step.

Two things the script does that a hand-trim would get wrong, both found by measurement:

> **⚠️ `loudnorm` is the wrong tool here.** An earlier draft of this file specified
> `loudnorm=I=-23:TP=-15`. EBU R128 is a ~3-second-window measurement and is meaningless on a 90 ms
> transient. What matters for a one-shot is how hard it hits, which is **peak**. The script measures
> `volumedetect` max and applies gain to hit the §1 target.

> **⚠️ AAC moves the peak, by a lot.** A lossy codec *reconstructs* the waveform rather than
> reproducing it, so the decoded peak is not the peak that went in. Measured: a signal landing at
> exactly −18.0 dBFS pre-encode came back at **−14.8 dBFS** after AAC 96k — 3.2 dB, worst on sharp
> transients at low bitrates, i.e. precisely this material. Uncorrected, that quietly flattens the
> worn → base → shiny ladder the levels exist to create. The script therefore encodes, measures the
> *encoded* file, corrects and re-encodes, looping up to three times to converge within 0.5 dB, and
> ships at **128 kbps** mono rather than 96 — about 1 KB more per file, and roughly half the
> overshoot to correct.

Mono, 48 kHz. Six files plus variants lands around 30–50 KB total — irrelevant against the stroke
SVGs already in `/public`.

**`sfx-src/` is committed.** `fetch-strokes.mjs` can re-fetch because KanjiVG is canonical; this
cannot, because ElevenLabs is stochastic and the same prompt returns a different sound. A lost
generation is lost for good and `public/sfx/` could never be rebuilt. Source, not artifact.

> **⚠️ Format correction (2026-09-18, same day).** The first draft of this file specified Opus in
> WebM. That is wrong for this app. Safari has a documented history of breaking Web Audio's
> `decodeAudioData` for WebM Opus (WebKit [#226922](https://bugs.webkit.org/show_bug.cgi?id=226922),
> [#238546](https://bugs.webkit.org/show_bug.cgi?id=238546)), and iOS Safari is the primary target.
> Opus would save perhaps 15 KB across the whole set — nothing, against a decode that might silently
> fail on the one browser that matters most. **Use AAC in `.m4a`.** MP3 is the equally safe
> alternative. No fallback chain, no format negotiation: pick one that works everywhere and ship it.

**Round-robin, because `hand.tick` fires up to 21 times a run.** Keep 3 of the 4 variants for
`hand.tick`, `flip.worn` and `flip.base`; cycle them, and add `playbackRate` jitter of ±3 % on
every play. Repetition fatigue in a drill app is the single most likely way this ships and then
gets turned off. One file played 21 times identically is the failure mode.

---

## 3b. The engine decision — raw Web Audio, ~100 lines, no dependency

**Reviewed against the tree, 2026-09-18.** The answer is not a library.

### Why no library

`package.json` has **three runtime dependencies: `next`, `react`, `react-dom`.** Everything else is
a devDependency. That is not an accident — `lib/zip.ts` is a hand-rolled 133-line ZIP writer,
`scripts/gen-sw.mjs` is a hand-rolled service worker rather than Workbox, and `HandTick.tsx` drives
the card flight on raw WAAPI. This repo's settled posture is *write the small thing*. Howler is
~30 KB to do what the platform does in about a hundred lines, and it would be the first runtime
dependency added since the app was born.

**The three reasons anyone reaches for Howler are each already answered by this codebase:**

| Howler's value | Why it's moot here |
| :-- | :-- |
| Multi-format fallback chains | Solved by picking AAC, which works everywhere. One format, no negotiation. |
| Audio sprites, to cut HTTP requests | `gen-sw.mjs` precaches the **entire export** on install. Runtime request count is already zero. Sprites are a 2013 `<audio>`-element workaround, and MDN's sprite guidance is about that element, not Web Audio. |
| HTML5 `<audio>` fallback for old browsers | The app already hard-requires `element.animate()`, `matchMedia`, canvas and service workers. Any browser that can run Kana Hero has Web Audio. |

### The shape, following existing patterns

- **`lib/sfx.ts`** — the imperative shell, modelled on `HandTick.tsx`: exported functions, capability
  check inline, **graceful no-op** when there's no `AudioContext` or sound is off, exactly as
  `flyToHand` no-ops on `typeof card.animate !== "function"`.
- **`lib/sfx-schedule.ts`** — pure, modelled on `lib/reveal.ts`: which sound plays at which offset,
  no DOM, no timers, no audio. This is what e2e asserts against. Playback itself stays untested.
- **The toggle goes in `lib/progress.ts`** as `sound?: boolean`. Absent means `false`, which *is*
  the silent-first default — so it needs no `VERSION` bump and no migration, the same trick
  `script?: Script` already uses.
- One `AudioContext`, one master `GainNode`, `decodeAudioData` all seven at the **first gesture
  after sound is switched on** — not at boot. Boot speed is a PWA-on-a-platform concern.
- A fresh `AudioBufferSourceNode` per play. They are single-use by design; do not pool them.

### The one genuinely interesting call: schedule the reveal, don't fire it

`Result.tsx` drives the flip sequence on `window.setTimeout`. That is correct for visuals — but
`setTimeout` jitters under React render load, and at a 114 ms interval the flips are not a series of
clicks, they are a **rhythm**. Jitter is audible there in a way it is not visible.

Web Audio's `source.start(when)` schedules on the audio clock, which does not jitter. And
`revealSchedule()` **already returns the exact array of offsets** — it was written pure so the
screen and the e2e could both ask what happens when. That same array is precisely what an audio
scheduler wants as input.

So, split by nature:

- **`hand.tick`, `reveal.skip`** — direct call at the marker. They're responses to a tap; they fire
  when the tap fires.
- **The whole reveal (`flip.*`, `end`)** — on S8 mount, walk `revealSchedule(order)`
  once and schedule every sound ahead against `audioCtx.currentTime`. Keep the handles so `skip()`
  can `stop()` them all, which it must do anyway alongside its `clearTimeout` loop.

The pure scheduler they wrote for testability turns out to be the correct audio driver. That is the
whole recommendation.

### Two ways a scheduled cue lands late — both found on S6b's deal, 2026-09-21

The deal sounded a beat behind the picture: the first back was down and the first `deal.land` had
not arrived. Two causes, both of them general.

**1. An animation's duration is not when the thing it draws arrives.** A WAAPI `easing` on the
effect warps the *whole iteration*, not one keyframe segment — this is where it parts company with
CSS — and S6b's flight ease, `cubic-bezier(.2,.9,.25,1.12)`, is violently front-loaded: progress
first reaches 1 at **0.468** of the duration, and the remaining 53 % is the overshoot going past
the slot and settling. The card is down at **197 ms** of a 420 ms flight. Cueing on the duration
put every land **223 ms** late. So the screen exports the moment the card is *down* (`LAND`), not
the length of the animation, and `dealCues()` takes that. Measured on the running screen, not
inferred: the first back is within a pixel of its slot at ~192 ms, exactly on it at ~197 ms.

**2. The first cue of a session pays for the context.** Nothing decodes until something sounds, and
S6b's deal is almost always the session's first one-shot — so it was arming eight decodes inside a
200 ms window, and reading `currentTime` off a context created in the same breath, whose clock has
not started (~29 ms of wall time passes before its zero). Both are fixed by warming a screen early:
`app/page.tsx` preloads on S6 (the deck), which is a tap the player has already made. A cue that
still falls in the past is dropped, never bunched — one late thud is worse than none.

Related, and the reason `schedule()` now subtracts it: a source started at audio time *T* is heard
at *T* + the hardware's output latency — 5 ms of buffer on a laptop, a fifth of a second over
Bluetooth. The whole list shifts together, so the rhythm inside it is untouched.

---

## 4. Playback notes (for whoever builds the engine)

- **Web Audio, not `<audio>`.** Decode all seven into `AudioBuffer`s once at first user gesture;
  `<audio>` elements have latency that will visibly lag the 240 ms flip.
- **Unlock on gesture.** The `AudioContext` starts suspended until a real tap.
- **iOS hardware mute switch silences Web Audio by default.** Set
  `navigator.audioSession.type = 'transient'` — the type meant for notification-style sounds that
  sit on top of other playback. Do **not** use `'playback'`: that makes a drill app override the
  user's ringer switch, which is exactly the wrong behaviour for something used on a night bus.
  Never ship a "please unmute your phone" line.
- **`prefers-reduced-motion: reduce`** already collapses the whole reveal to `t=0`. In that path,
  play `reveal.end` only. Firing seven flips simultaneously is a click, not a reveal.
- **Frequency slotting**, so the seven stay legible against each other on a phone speaker:
  `flip.worn` sits low-mid and dull; `flip.base` carries 1–5 kHz; `flip.shiny` is the only one with
  real content above 8 kHz; `reveal.end` owns 200–500 Hz and nothing else does.

---

## 5. Flags — decide these before building

1. **This is a v5d, not a patch.** SPEC-v5a §9.4 says build no audio code and no assets. That was
   a deliberate freeze. Unfreezing it is a scope decision, and the honest framing is that the
   reward moment shipped without its second channel and this finishes it.
2. **⚠️ Licensing, before anything ships.** Confirm ElevenLabs' commercial-use terms for SFX on
   the account tier in use. These assets go into a public PWA and get given away with the code.
   Unverified licensing in a channel whose trust engine is the truth law is not a risk worth
   taking — check it, and put the answer in `public/licenses/NOTICE.txt` alongside KanjiVG and
   StrokesVG.
3. **⚠️ Truth-law note on "$0".** The runtime stays genuinely $0 — static assets, no calls. But
   generation costs credits (40/second when duration is specified). If a video says "free", that
   sentence is about runtime; don't let it drift into implying the build was free.
4. **Scope guard.** `backlog.md` banks **"Audio prompts — hear it, write it"** as its own future
   video. Sound effects are not audio prompts. If this session starts generating pronunciation or
   mora audio, it has left this spec and belongs back in the backlog.

---

## 5b. The Joker's voice — §9.4's sixth sound, and the one with no file

**Added 2026-09-19 (creator call). This is a deliberate scope expansion past v5a §9.4's "five
markers and nothing else", and it is bigger than the other five combined** — the Joker speaks on
nearly every screen, not only during the reveal. Name it as an expansion rather than letting it
arrive quietly.

Old-school RPG dialogue sound is **not** a streaming loop. Undertale, Zelda, Pokémon and Animal
Crossing all fire a short one-shot per glyph revealed; the "streaming" quality is repetition, not
sustain. So it is a one-shot — and it is **synthesized, not generated**:

- `components/Joker.tsx` types at **TICK = 22 ms** after a **120 ms** lead-in. No generated sample
  survives a trim to that; a text-to-sound model's useful floor is ~500 ms, 20× too long.
- The originals *were* synthesis — NES/SNES/GBA sound chips.
- Per-character pitch jitter is the one thing that makes a blip read as a voice rather than a
  buzzer. Free from an oscillator, awkward from a file.
- Zero bytes, zero decode, nothing added to the precache.

**Why he is the only synthetic sound.** Everything in §1 is an *object* — cards, felt, wood, one
struck metal. The Joker is a character *speaking*, and a voice should not be made of the same
material as the furniture. The app already runs two visual layers, the card table and THE LOG's
razor geometry; the sound design splits the same way. **Objects are foley; interface and character
are synthesized.** That rule scales to whatever gets a sound next.

### The numbers that constrain it

| | |
| :-- | :-- |
| Typing rate | 22 ms/char (`TICK`), 120 ms lead-in |
| Corpus lines | 96 · min 23 · **median 44** · max 64 characters |
| Per line | ~968 ms of typing at the median |
| **Per 21-word run** | **~900 blips at one-per-character**, before home/deck/set/result |

**One blip per character is wrong at this rate** — 45/sec is a buzz, not speech. Undertale and
Zelda sit at 60–100 ms. **`everyNth: 3`** gives 66 ms, classic cadence, cuts the count to ~300 per
run, and avoids firing Web Audio on all ~45 renders/sec the typing loop already costs.

### Built, unwired

- **`lib/audio.ts`** — the single `AudioContext` and the enable gate. Both this and the §1 one-shots
  go through it; two contexts would mean two unlock states and two things to mute. No context is
  constructed until sound is switched on. Sets `navigator.audioSession.type = "transient"`, and
  deliberately **not** `"playback"`: a drill app must not override the ringer switch on a night bus.
- **`lib/joker-voice.ts`** — the synth, plus the `VOICE` config tuned in the Joker Voice Lab.
  `voice()` returns a per-line speaker; `say(ch)` decides whether that character sounds. Whitespace
  never does — a space is a pause, not a syllable. The count is per line and counts only voiced
  characters, so every line starts on a blip and punctuation cannot drift the cadence.

Neither is called yet. Wiring is three lines in `Joker.tsx`: make a `voice()` per line, `say()` the
character inside the existing `setInterval`, and nothing else — `stop()` already halts on
tap-to-finish, and `prefers-reduced-motion` skips typing entirely, so that path is silent for free.

### ⚠️ Open — where he is allowed to blip

§9.3.6 already rules that the Joker's line starts typing only **after** the last card lands: he does
not talk over the reward moment. The same instinct says **he should not blip over the moment the
user is writing.** A panel chattering while someone concentrates on drawing 曜 is competition, not
charm.

Proposed: **home, deck, set and result — yes. Mid-round prompts — muted.** Not yet decided; ship it
muted in-round first and see whether it is missed.

---

## 6. Verification

- `npm run lint`, `npm run build` clean; asset budget re-checked.
- `e2e-offline.mjs` — the seven files serve from cache with no network.
- **The phone-speaker test, in a quiet room, eyes closed.** Run a 9-card set and a 21-card set.
  The 21-card reveal must still read as individual cards, not a rattle. If it rattles, the flips
  are too long — trim, don't re-generate.
- **The fatigue test.** Twenty consecutive `GOT IT`s. If the tick starts to grate, the round-robin
  or the pitch jitter isn't doing its job.
- **The off test.** Toggle sound off and run a full set. Nothing must be unclear.
