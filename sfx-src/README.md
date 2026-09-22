# sfx-src — raw ElevenLabs generations

Drop the downloads here, run `npm run sfx`, and `public/sfx/*.m4a` is rebuilt.
Prompts and the design table: `docs/spec/SPEC-v5d-sound.md`.

Then open `/sfx` — the sound board. Every cue in the v5d inventory on a button,
each one also fireable inside the timing of the screen it belongs to, and a
status line per file so you can see what is still missing. RESCAN picks up a
fresh bake without a reload. (`npm run sfx:lab` is the other rig: that one
decides the trim, this one decides whether the cue is right.)

## These files are SOURCE, not a build artifact — commit them

`scripts/fetch-strokes.mjs` can re-fetch its data because KanjiVG is canonical
and stable. This cannot. ElevenLabs is stochastic: the same prompt returns a
different sound every time, so a generation that is lost is lost forever and
`public/sfx/` could never be rebuilt. Keep them in git.

## Naming

    <name>.<ext>          one sound
    <name>.<n>.<ext>      round-robin variants, treated identically

`<name>` must match a key in `SOUNDS` in `scripts/build-sfx.mjs`, or the file is
skipped with a warning. The seven:

    hand.tick  ·  flip.worn  ·  flip.base  ·  flip.shiny
    reveal.shinyHold  ·  reveal.end  ·  reveal.skip

Keep 3 variants of `hand.tick`, `flip.worn` and `flip.base` — those fire up to
21 times a run and are the fatigue risk.

## If a sound's attack gets clipped

The head trim strips leading silence automatically at -50dB, which can eat the
front of a soft attack (felt and paper especially). Open it in Audacity, read
where the transient really starts, and add an explicit `head: <ms>` to that
entry in `SOUNDS`. It is then settled for good.
