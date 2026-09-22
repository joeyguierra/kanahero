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

/** the baked files in public/sfx/ — SPEC-v5d §1's six, and tier 2's deal */
export type SfxName =
  | "hand.tick"
  | "flip.worn"
  | "flip.base"
  | "flip.shiny"
  | "reveal.end"
  | "reveal.skip"
  | "deal.press"
  | "deal.land";

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
 * S6b's deal (M4): one land as each back seats. The screen owns the clock —
 * these are its own animation numbers, passed in — because the deal is a
 * picture first and a sound second, and two copies of 90 would drift.
 *
 * The land is the moment the card is DOWN, which the screen measures off its
 * own easing (SetScreen's LAND), not the moment its animation stops running.
 *
 * Scheduled, not fired, for the same reason the reveal is: nine lands 90 ms
 * apart is tighter than anything in S8, and setTimeout's jitter under the
 * mount of a nine-card grid is audible where it is invisible.
 *
 * deal.press is NOT here. It answers the tap that ends this screen, so it
 * plays on the tap (`play`), not against a clock.
 *
 * Reduced motion seats the nine behind one 120 ms fade, so it is one land as
 * that fade finishes — nine at once would be a click, not a deal (§4).
 */
export function dealCues(opts: {
  count: number;
  /** ms between two releases */
  gap: number;
  /** ms from a card's release to the card being down. NOT the length of the
      flight animation: its easing seats the card well inside its duration and
      spends the rest settling, and the sound answers the seat (SetScreen's
      LAND) — a cue on the duration is a fifth of a second late, every card. */
  land: number;
  reduced?: boolean;
  /** the reduced-motion fade, in ms */
  fade?: number;
}): Cue[] {
  if (opts.count <= 0) return [];
  if (opts.reduced) return [{ name: "deal.land", at: opts.fade ?? 0 }];
  return Array.from({ length: opts.count }, (_, i) => ({
    name: "deal.land" as const,
    at: i * opts.gap + opts.land,
  }));
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
