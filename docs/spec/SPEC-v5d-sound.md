# kanahero — v5d · the sound pass (ElevenLabs generation brief)

**Status: BRIEF, not built.** Drop at `docs/spec/SPEC-v5d-sound.md`.
**Base:** `e3cd9e3`. **Unfreezes:** SPEC-v5a §9.4 — *"There is no sound engine. Build none, add
no audio code or assets."* Five `// sfx:` markers are the entire existing footprint.
**Palette decision (2026-09-18): CARD TABLE.** Cardstock, felt, wood, clay, one metallic accent.

---

## 0. The four constraints that shaped every prompt below

### 0.1 Silent-first is law, not a preference
This app's real runtime is an overnight coach with everyone asleep, a quiet car, and a shop
counter. A drill app whose feedback *requires* sound is unusable in exactly the places video 02
films it being used.

- **Default OFF.** Sound is opt-in, one toggle, persisted in the same `localStorage` blob.
- **Nothing is ever sound-only.** Every one of the seven moments below already has a complete
  visual. Sound is a second channel on an existing signal, never the signal.
- The offline-first and $0-runtime laws are untouched: these are static assets in the bundle.

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

## 1. The seven files

Five markers, but `reveal.flip` takes the card's rarity, so it's three files.

| File | Marker | Site | Fires | Trim to | Peak |
| :-- | :-- | :-- | :-- | :-- | :-- |
| `hand.tick` | `hand.tick` | `Round.tsx:160` | once per `GOT IT` | ≤180 ms | −12 dBFS |
| `flip.worn` | `reveal.flip worn` | `Result.tsx:82` | ≤21× at 114–160 ms | **≤75 ms** | −18 dBFS |
| `flip.base` | `reveal.flip base` | `Result.tsx:82` | ≤21× at 114–160 ms | **≤95 ms** | −15 dBFS |
| `flip.shiny` | `reveal.flip shiny` | `Result.tsx:82` | rare, 320 ms apart | ≤280 ms | −9 dBFS |
| `reveal.shinyHold` | `reveal.shinyHold` | `Result.tsx:88` | once, before first shiny | **≤420 ms** | −15 dBFS |
| `reveal.end` | `reveal.end` | `Result.tsx:93` | once, last card lands | ≤700 ms | −12 dBFS |
| `reveal.skip` | `reveal.skip` | `Result.tsx:63` | on tap during reveal | ≤250 ms | −12 dBFS |

`shinyHold` must finish **inside** the 450 ms `SHINY_HOLD_MS` gap or it collides with the flip it
was built to set up.

---

## 2. The prompts

All seven under the 450-character cap. Settings: **`duration_seconds: 0.5`**,
**`prompt_influence: 0.6`** (literal — we want the described object, not a creative read), except
`reveal.shinyHold` and `reveal.end` as noted. Generate, keep all 4 variants, then trim per §3.

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

### reveal.shinyHold — the held breath
The one moment that earns non-realism. It resolves *into* `flip.shiny`, so it must end unresolved
and must not hit.

> A short quiet rising anticipation swell before a card reveal: soft air and a faint upward-sliding
> shimmer gathering tension, ending unresolved with no impact, no hit and no landing. Subtle and
> restrained. No drums, no braam, no music, no reverb wash. One isolated one-shot, under half a
> second.

`prompt_influence: 0.3` (let it interpret) · `duration_seconds: 0.5`

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

## 3. Post-processing (this is where the sounds actually get made)

Generation gets you raw material. The trim is the design.

```sh
# 1. head-trim to the transient, hard-cap the length, 8 ms fade-out, normalise
ffmpeg -i raw.mp3 \
  -af "silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0, \
       atrim=end=0.095,afade=t=out:st=0.087:d=0.008, \
       loudnorm=I=-23:TP=-15" \
  -ac 1 -ar 48000 flip.base.wav

# 2. ship-size pass — AAC, not Opus. See the format note below.
ffmpeg -i flip.base.wav -c:a aac -b:a 96k -movflags +faststart flip.base.m4a
```

Adjust `atrim=end` and the fade start per the §1 table. Mono, 48 kHz. Seven files at 96 kbps mono
lands around 30–50 KB total — irrelevant against the stroke SVGs already in `/public`.

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

## 6. Verification

- `npm run lint`, `npm run build` clean; asset budget re-checked.
- `e2e-offline.mjs` — the seven files serve from cache with no network.
- **The phone-speaker test, in a quiet room, eyes closed.** Run a 9-card set and a 21-card set.
  The 21-card reveal must still read as individual cards, not a rattle. If it rattles, the flips
  are too long — trim, don't re-generate.
- **The fatigue test.** Twenty consecutive `GOT IT`s. If the tick starts to grate, the round-robin
  or the pitch jitter isn't doing its job.
- **The off test.** Toggle sound off and run a full set. Nothing must be unclear.
