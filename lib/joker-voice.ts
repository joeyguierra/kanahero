// The Joker's voice — one oscillator burst per character, as the line types.
//
// Old-school RPG dialogue sound is NOT a streaming loop. Undertale, Zelda,
// Pokémon and Animal Crossing all fire a short one-shot each time a glyph is
// revealed; the "streaming" quality is an illusion made by repeating something
// very short, very fast. So this is a one-shot, and it is synthesized rather
// than recorded, for four reasons:
//
//   1. The originals were synthesized — NES/SNES/GBA sound chips. Recording a
//      synth to play it back is the wrong direction.
//   2. components/Joker.tsx types at TICK = 22ms. No generated sample survives
//      being trimmed to that; the useful floor on a text-to-sound model is
//      ~500ms, 20x too long.
//   3. Per-character pitch jitter is the single thing that makes a blip read as
//      a voice instead of a buzzer, and it is free here and awkward with a file.
//   4. Zero bytes, zero decode, nothing added to the precache.
//
// WHY HE IS THE ONE SYNTHETIC SOUND: everything in SPEC-v5d-sound.md is an
// OBJECT — cards, felt, wood, one struck metal. The Joker is a character
// speaking, and a voice should not be made of the same material as the
// furniture. The app already has two visual layers (the card table, and THE
// LOG's razor geometry); the sound follows the same split. Objects are foley,
// interface and character are synthesized.
//
// Nothing here runs until lib/audio.ts opens the voice channel, and the panel
// does not type at all under `prefers-reduced-motion` — so that path is silent
// for free.

import { audio } from "./audio";

/**
 * Tuned by ear in the Joker Voice Lab, against real corpus lines, on a phone
 * speaker. Replace this whole block with the lab's output — do not hand-edit
 * one number without re-listening to the longest line twice.
 */
export const VOICE = {
  /** LOCKED 2026-09-19 in the lab. Square, not triangle: square is the classic
      8-bit voice and the loudest personality, and the 2600Hz lowpass plus
      everyNth 3 is what keeps it from getting glassy at speed. */
  wave: "square" as OscillatorType,
  /** where he sits. Low reads dry and older, high reads squeaky. */
  baseHz: 430,
  /** random spread per blip, ±. The difference between a voice and a buzzer. */
  jitter: 0.07,
  /** must stay under the gap between blips or the envelopes stack into a drone */
  durMs: 38,
  /** how far the pitch falls across one blip — a little gives it a spoken shape */
  dropPct: 18,
  /** takes the glass off a square wave */
  lowpassHz: 2600,
  /** At TICK 22ms, blipping every character is a 45Hz buzz, not speech. Every
      7th gives ~150ms — sparser than the classic RPG every-third, a word-ish
      rate rather than a syllable-ish one (creator call, 2026-09-20) — and it
      keeps Web Audio well clear of the ~45 renders a second the typing costs. */
  everyNth: 6,
  /** the quietest thing in the app, under flip.worn's −18 */
  gainDb: -28,
};

/** below this a hard attack clicks; above it the blip loses its edge */
const ATTACK_MS = 2;

/**
 * A voice for one line.
 *
 * The count is per line and counts only voiced characters, so every line
 * starts on a blip and the cadence does not drift with punctuation. Call
 * `say(ch)` once per character revealed and it decides whether that one
 * sounds; whitespace never does, because a space is a pause in speech rather
 * than a syllable.
 *
 * Returns a no-op speaker when sound is off or the platform has no audio, so
 * the caller never branches.
 */
export function voice(): { say: (ch: string) => void } {
  let voiced = 0;

  return {
    say(ch: string) {
      if (!ch || ch.trim() === "") return;
      const nth = voiced++;
      if (nth % VOICE.everyNth !== 0) return;

      const a = audio("voice");
      if (!a) return;
      const { ctx, out } = a;

      const t0 = ctx.currentTime;
      const dur = VOICE.durMs / 1000;
      const attack = ATTACK_MS / 1000;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const lowpass = ctx.createBiquadFilter();

      const spread = 1 + (Math.random() * 2 - 1) * VOICE.jitter;
      const from = VOICE.baseHz * spread;
      const to = Math.max(40, from * (1 - VOICE.dropPct / 100));

      osc.type = VOICE.wave;
      osc.frequency.setValueAtTime(from, t0);
      if (VOICE.dropPct > 0) osc.frequency.exponentialRampToValueAtTime(to, t0 + dur);

      lowpass.type = "lowpass";
      lowpass.frequency.setValueAtTime(VOICE.lowpassHz, t0);

      // exponential decay, because a linear one reads as a synthetic fade
      // rather than something that was struck
      const peak = Math.pow(10, VOICE.gainDb / 20);
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.linearRampToValueAtTime(peak, t0 + attack);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

      osc.connect(lowpass).connect(gain).connect(out);
      osc.start(t0);
      // the node is single-use and disposable by design; stopping it is what
      // releases it, and a small tail past the envelope avoids a cut
      osc.stop(t0 + dur + 0.02);
    },
  };
}
