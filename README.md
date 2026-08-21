![kanahero — write all 71 hiragana from memory](.github/media/lockup.svg)

Write all 71 hiragana from memory. A romaji prompt, a blank canvas, and the
real stroke order animating over whatever you just drew.

**Live:** https://kanahero.joeyguierra.com — no account, no install required,
nothing to configure.

It exists because reading hiragana and writing it are different skills, and
every app that claims to teach the second one quietly teaches tracing instead.

<p align="center">
  <img src=".github/media/loop.gif" width="280"
       alt="One card of the loop: the prompt ka, a blank canvas, three strokes drawn by hand, then the real stroke order animating over the attempt in pink">
</p>

---

## The loop

```
   ┌─────────────┐
   │   "so"      │   romaji prompt, one card
   └─────────────┘
          │
          ▼
   ┌─────────────┐
   │  ✎          │   you write it by hand. no hint, no outline,
   │             │   no stroke count, no way to skip
   └─────────────┘
          │  flip
          ▼
   ┌─────────────┐
   │  そ    3    │   the real stroke order draws itself over your
   │  strokes    │   attempt, in writing order, at pen speed
   └─────────────┘
          │
          ▼
    got it / missed        you grade yourself. that is the mechanism,
          │                not a shortcut around a missing feature
          ▼
   missed cards requeue 5 positions later and come back
```

A session is the shuffled set — all 71, or the base 46 — and it ends when the
queue is empty. There is no session length setting because a session is not a
length.

## The number

One count, on the home screen, and it is the whole app:

```
    38 / 71   written from memory
```

A kana joins that set when you grade yourself correct **on its first attempt in
a session**. Get it wrong, get it right on the requeue, and it does not count —
it comes back tomorrow. The set lives in `localStorage` as one versioned blob
and persists mid-session, so a closed tab loses nothing.

Not a percentage. `38 of 71` says what is left to learn; `54%` says how much you
are failing, and invites you to protect a number instead of writing a character.

## What it does not have

| | |
| :-- | :-- |
| Handwriting recognition | Judging your own stroke against the animation is what makes you look closely at it. |
| Hints | No first-stroke peek, no ghost under the canvas, no stroke count before the reveal. A hint converts recall into tracing. |
| Skip | The only way past a card is to write something and grade it. |
| Accounts, sync, backend | The number is worth more when it is yours, on one device. |
| Streaks, goals, notifications | Retention theater. |
| Nav bar, settings | Four screens, one path. The only choice is 46 vs 71, and it is on Home. |
| Katakana, yōon, kanji, vocabulary | Not this app. |

The full reasoning, screen map and user flows are in [`SPEC.md`](SPEC.md), which
was written before any code.

## Run it

```sh
npm install
npm run dev            # http://localhost:3000
npm run strokes        # re-vendor + verify the 71 stroke SVGs
npm run build          # static export -> out/
node scripts/e2e-loop.mjs   # walks the real flows against out/
```

`next.config.ts` sets `output: "export"`. There is no server, no API route and
no runtime fetch — the build is a directory of files.

`scripts/verify-strokes.mjs` is the gate on the stroke data: all 71 present,
every viewBox `0 0 1024 1024`, every file carrying both a shadows group and a
strokes group. `scripts/e2e-loop.mjs` is not a test suite — it is a verification
script that walks the seven flows that matter, including the first-attempt rule
and persistence across a reload.

## Stroke data

<img src=".github/media/stroke-so.svg" width="200" align="right"
     alt="The hiragana so drawing itself: one centerline revealed start to end over its own shadow">

The strokes animate the way a pen moves, not as an outline being traced. Each
centerline is revealed start to end, clipped to its own shadow, with a pen-lift
pause between strokes and a duration that scales with path length — a long sweep
takes longer than a tick.

That is possible because the underlying data is centerlines, not glyph outlines:

> Stroke order data: **strokesvg** by zhengkyl (MIT) —
> https://github.com/zhengkyl/strokesvg
>
> SVG paths derived from the **Klee One** font, licensed under the
> SIL Open Font License 1.1 — https://openfontlicense.org/

The upstream NOTICE ships with the app at
[`public/licenses/strokesvg-LICENSE.txt`](public/licenses/strokesvg-LICENSE.txt)
and is fetched by `scripts/fetch-strokes.mjs` alongside the SVGs, so vendoring
the data and vendoring its license are the same step.

## Design

Two passes, both made before the design commit and both kept in `design/` as
standalone HTML: `Kanahero Wireframes.dc.html`, then `Kanahero Hi-Fi.dc.html`.
The tokens they settled on are declared once at the top of `app/globals.css`.

![THE LOG doctrine — seven greys and four signals](.github/media/palette.svg)

`strike` is the only colour spent on interaction. `live` and `caution` are
reserved for Got it and Missed, which is why the two grading buttons are the
only place they appear, and `blueprint` marks the one setting in the app — the
46 / 71 segment on Home.

The mark, the stroke tile and this strip are generated by
`node scripts/make-brand.mjs`, which reads the same vendored SVGs the app
animates — the か in the header is those three centerlines, not a redraw of them.

## Not done

Stated rather than left for you to discover:

- **No service worker.** The static export makes offline possible and the PWA
  manifest is in place, but nothing registers a worker yet — so a genuinely cold
  load with no network is not guaranteed to work. "Works on a plane" is the
  design constraint, not a tested claim.
- **No `LICENSE` file at the root.** The vendored stroke data carries its own;
  the app's own terms are unstated.
- **Playwright was skipped** during the build for time. `scripts/e2e-loop.mjs`
  covers the loop instead.
- Undo, Replay and the stroke count on the reveal are all judgement calls flagged
  in `SPEC.md` as assumptions to confirm, not settled decisions.

## How it was built

Four prompts, on a train between Kyoto and Osaka, start to finish: the brief,
the scaffold and stroke data, the loop, the design pass. Two of the four went to
a design tool as well as to Claude Code, so six sends in total — published
verbatim, typos included, on the build page for this video.

The build is on video: https://youtu.be/uXEN2RL5KdI
