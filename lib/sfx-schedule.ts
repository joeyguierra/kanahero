// Which sound plays when — pure, like lib/reveal.ts, and for the same reason:
// the screen asks it what to schedule, and the e2e can ask the same question
// without an AudioContext or a clock. No DOM, no timers, no audio in here.
//
// S8 is scheduled, not fired (SPEC-v5d §3b). Its flips are 114–160 ms apart,
// which is a rhythm, not a series of clicks, and `setTimeout` jitters under
// render load in a way that is audible there and invisible on the cards. So
// the whole reveal is laid out once against the audio clock, from the same
// `turnSchedule()` the cards themselves follow.

import type { Rarity } from "./progress";
import { FAST_FLIP_MS, FAST_STEP_MS, SPEAK_AFTER_MS, turnEnd, turnSchedule } from "./reveal";

/** the six baked files in public/sfx/ (SPEC-v5d §1) */
export type SfxName =
  | "hand.tick"
  | "flip.worn"
  | "flip.base"
  | "flip.shiny"
  | "reveal.end"
  | "reveal.skip";

/** one sound, this many ms from the moment the schedule is handed over */
export interface Cue {
  name: SfxName;
  at: number;
}

/** the flip for a card of this rarity: one family, climbing (§0.3) */
export function flipFor(rarity: Rarity): SfxName {
  return `flip.${rarity}`;
}

/**
 * The S8 reveal, from mount: one flip per card as it starts turning — in the
 * hold before a shiny there is nothing, the silence is the anticipation — and
 * the knock of the squared deck when the last card is down, which is the
 * moment he speaks.
 */
export function revealCues(order: { card: { rarity: Rarity } }[]): Cue[] {
  const flips = turnSchedule(order).map(({ at }, i) => ({
    name: flipFor(order[i].card.rarity),
    at,
  }));
  return [...flips, { name: "reveal.end", at: turnEnd(order) }];
}

/**
 * A tap through the reveal. The riffle that follows is 70 ms a card, under the
 * shortest flip's own length, so the cards riffle silently: the one thud of
 * the spread landing is the sound of it, and the knock still marks the end.
 */
export function hurryCues(order: { card: { rarity: Rarity } }[], from: number): Cue[] {
  const left = Math.max(0, order.length - from);
  return [
    { name: "reveal.skip", at: 0 },
    { name: "reveal.end", at: left * FAST_STEP_MS + FAST_FLIP_MS + SPEAK_AFTER_MS },
  ];
}
