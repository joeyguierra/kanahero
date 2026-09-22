// The design defaults for every baked sound (SPEC-v5d-sound.md §1, and the
// v5d sound inventory for tier 1 upward).
//
// One module because two things read it: `build-sfx.mjs`, which bakes, and
// `sfx-lab.mjs`, which serves the tuning page. A second copy would drift, and
// the drift would be silent — the lab would show one number and the bake would
// apply another.
//
// These are DEFAULTS, not the last word. `sfx-src/sfx.config.json` — written by
// the lab — overrides them per sound, and only for the sounds it names. A cue
// nobody has tuned stays on the spec.
//
//   tier 0 the reveal and the tick (SPEC-v5d §1)
//        1 the loop — fires every word, 9-21x a run. What the app sounds like.
//        2 deals and arrivals — the beats between screens (SPEC-v5d §2c)
//        3 chrome — not yet specced here.
//   ms   hard cap on length. The reveal's flips fire as little as 114ms apart
//        at 21 cards (min(160, 2400/n) in lib/reveal.ts), so anything whose
//        tail is still loud at that point smears into the next one.
//   peak target peak in dBFS. The ladder is deliberate: worn is the quietest
//        thing in the app and shiny the loudest, because response scales with
//        significance.
//   head OPTIONAL, and normally absent — leading silence is stripped
//        automatically at -50dB. Set it when that detector is wrong, which it
//        can be on a soft attack (felt, paper): the lab's head-trim slider is
//        how you find the number, and once written it is settled for good.
//   gap  informational: how long until the NEXT instance of this cue can fire.
//        null means it never overlaps itself. The lab draws it and warns when
//        the tail is less than 20dB down by then.
//   loop OPTIONAL. A bed, not a one-shot: no head strip, no cap, no fade — the
//        file is used whole and only its level is matched. Generate these with
//        ElevenLabs' own `loop: true`, which makes the ends meet at generation
//        time; a loop point crossfaded in afterwards always has a seam you can
//        hear under a two-second bed.

export const DEFAULTS = {
  // ---- tier 0 · the reveal and the tick -----------------------------------
  "hand.tick": { tier: 0, ms: 180, peak: -12, gap: null },
  "flip.worn": { tier: 0, ms: 75, peak: -18, gap: 114 },
  "flip.base": { tier: 0, ms: 95, peak: -15, gap: 114 },
  "flip.shiny": { tier: 0, ms: 280, peak: -9, gap: 320 },
  "reveal.end": { tier: 0, ms: 700, peak: -12, gap: null },
  "reveal.skip": { tier: 0, ms: 250, peak: -12, gap: null },

  // ---- tier 1 · the loop --------------------------------------------------
  // BOTH HANDS ARE BRUSHES (amended 2026-09-20, SPEC-v5d §2b). They are told
  // apart by weight and wetness, not by instrument: the player has a small dry
  // brush, the Joker a broad wet one. Level does the rest — the player's bed
  // never comes above -20, his stroke lands at -16.
  //
  // The player's brush. The one continuous sound in the app and the one heard
  // most; runtime gain and playbackRate follow pointer speed, so it is baked at
  // the TOP of its -26..-20 range and attenuated from there. Never give it a
  // second speed model: WritingCanvas's segmentWidth() already computes pointer
  // speed in px/ms, and two curves would drift apart.
  "ink.loop": { tier: 1, ms: 2000, peak: -20, gap: null, loop: true },
  // The attack the loop has no way to make. ink.up is the same generation
  // trimmed from the other end — save the download twice under both names.
  "ink.down": { tier: 1, ms: 40, peak: -22, gap: null },
  "ink.up": { tier: 1, ms: 30, peak: -26, gap: null },
  // His answer over your ink: broad, wet, one confident sweep. If it can be
  // mistaken for the player's, widen the WEIGHT gap, not the level.
  "ink.reveal": { tier: 1, ms: 250, peak: -16, gap: null },
  // The exact opposite gesture to hand.tick. Old-school "damage", gentled to
  // nothing — never a buzzer. His line is already kind; this must not undercut it.
  "hand.miss": { tier: 1, ms: 180, peak: -16, gap: null },
  // A fresh sheet, not an eraser — the graphite went and the eraser went with
  // it. ink.undo is this file at playbackRate 1.4 at runtime: a half-pull
  // rather than a full swap. No second bake.
  "ink.clear": { tier: 1, ms: 300, peak: -18, gap: null },

  // ---- tier 2 · deals and arrivals ----------------------------------------
  // A deck squared and cut, as the run opens. The bookend to reveal.end: the
  // same deck heard opening and closing, which is why the two must be audibly
  // related and must not be the same recording.
  "deal.press": { tier: 2, ms: 400, peak: -12, gap: null },
  // M5, the card being MADE — synthetic, not foley (rewritten 2026-09-20): the
  // card is an image arriving, not an object being placed. Fires 9-21x a run,
  // so it must be FELT, not heard, and it ducks to nothing while the ink bed is
  // active. If it ever reads as noise the answer is silence, not a louder file.
  // It must never be pitched: noise is the hand, pitch is reward and character,
  // and a chime here would steal from flip.shiny and the Joker at once.
  "prompt.melt": { tier: 2, ms: 700, peak: -24, gap: null },
  // M4: nine backs seat 90ms apart — TIGHTER than the reveal's 114ms, so this
  // is the densest cue in the app. Try flip.worn before generating anything:
  // same material, near-identical action, and a file you already have.
  "deal.land": { tier: 2, ms: 80, peak: -18, gap: 90 },
  // M14, S8 mount: the earned set set down face-down. Must finish INSIDE
  // LEAD_MS (300, lib/reveal.ts) or it eats the first flip — hence 240, not the
  // inventory's 280, which left 20ms of margin. Schedule it at t=0 in the same
  // audio-clock pass as the flips.
  "reveal.arrive": { tier: 2, ms: 240, peak: -14, gap: null },
  // deal.throw is deliberately NOT here — see SPEC-v5d §2c. Held until the deal
  // has been heard without it; from t=420 throws and lands interleave 90ms
  // apart and it is probably one sound too many. Its prompt is written and
  // waiting; add the entry only if the deal feels weightless.
};

/** what an unrecognised file gets, so anything can still be auditioned */
export const GENERIC = { tier: null, ms: 300, peak: -15, gap: null };

/** tiers in display order, with what each one is for */
export const TIERS = [
  { id: 0, name: "Reveal + tick", note: "SPEC-v5d §1 — the run ends here" },
  { id: 1, name: "The loop", note: "every word, 9–21× a run — what the app sounds like" },
  { id: 2, name: "Deals + arrivals", note: "once per run — the beats between screens" },
];
