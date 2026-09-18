// S8's running order and its clock (design: v5-anims/v5c "S8 earned").
//
// Two beats, not one. He DEALS the whole hand face down from his hand, left to
// right, and only then TURNS it: worn first, then base, then shiny, each card
// flipping in place while the count ticks up behind it.
//
// Worn first and shiny last, and within a stock the order they were graded in.
// The layout uses this order too, so the deal and the turn both sweep left to
// right and top to bottom, with the best card of the run landing at the end.
//
// Pure functions over the hand — no DOM, no timers — so the screen can ask
// what happens when, and the e2e can ask the same question without waiting.

import type { Rarity } from "./progress";

/** cards to a row; 21 words is the ceiling, so three rows is the ceiling */
export const COLS = 7;
/** One card, twice the old grid card. The box itself is `.revealSlot` — 84 by
    118, five by seven — and the row overlaps them there; this is here because
    the face sizes its word and its romaji against the card's own width. */
export const CARD_W = 84;

// ---- beat one: the deal ----
/** ms between two cards leaving his hand */
export const DEAL_GAP_MS = 80;
/** ms one card spends in the air */
export const FLIGHT_MS = 380;
/** his wrist, per card: one flick and back before the next one leaves */
export const FLICK_MS = 130;
/** the beat between the last card seating and the first one turning */
export const TURN_LEAD_MS = 260;

// ---- beat two: the turn ----
/** ms one ordinary card spends turning */
export const FLIP_MS = 240;
/** ms between two ordinary cards */
export const FLIP_GAP_MS = 160;
/** the beat before a shiny turns — every shiny, not just the first */
export const SHINY_HOLD_MS = 450;
/** shinies take their time */
export const SHINY_FLIP_MS = 320;
/** the lift-and-flare runs past the flip it belongs to */
export const SHINY_LIFT_EXTRA_MS = 260;
/** he speaks this long after the last card has started turning */
export const SPEAK_AFTER_MS = 200;

// ---- a tap through it ----
// A tap does not cut to the end: it riffles the rest of the hand over. Every
// card still turns, still counts itself and still lands in reveal order — it
// simply stops taking its time about it, and the shiny beats are dropped
// because a hold the player just asked to skip is the one thing they said no
// to. A second tap, once it is already riffling, snaps it flat.
/** ms one card spends turning once the reveal has been hurried */
export const FAST_FLIP_MS = 140;
/** ms between two cards once the reveal has been hurried */
export const FAST_STEP_MS = 70;

// ---- the shiny's standing shine ----
/** one swipe across a shiny face */
export const SHINE_SWIPE_MS = 700;
/** and again this often */
export const SHINE_PERIOD_MS = 3000;
/** card i waits this much longer, so no two shinies swipe together */
export const SHINE_STAGGER_MS = 140;

/** reduced motion: no deal, no turn — one fade over the finished screen */
export const FADE_MS = 160;

const ORDER: Rarity[] = ["worn", "base", "shiny"];

/** the hand in reveal order: worn → base → shiny, grading order within each */
export function revealOrder<T extends { card: { rarity: Rarity } }>(hand: T[]): T[] {
  return ORDER.flatMap((rarity) => hand.filter((c) => c.card.rarity === rarity));
}

/** the same order, cut into rows of at most seven */
export function revealRows<T>(order: T[]): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < order.length; i += COLS) rows.push(order.slice(i, i + COLS));
  return rows;
}

/** when each card leaves his hand, in ms from mount */
export function dealSchedule(count: number): number[] {
  return Array.from({ length: count }, (_, i) => i * DEAL_GAP_MS);
}

/** when the whole hand is seated and the turn may start */
export function turnStart(count: number): number {
  return Math.max(0, count - 1) * DEAL_GAP_MS + FLIGHT_MS + TURN_LEAD_MS;
}

/** the rest of the hand, riffled over from `from` at the hurried cadence */
export function fastSchedule(from: number, count: number): number[] {
  return Array.from({ length: Math.max(0, count - from) }, (_, i) => i * FAST_STEP_MS);
}

/** when the last card is down and he may speak — the note arrives with him */
export function turnEnd(order: { card: { rarity: Rarity } }[]): number {
  const turns = turnSchedule(order);
  const last = turns[turns.length - 1];
  return last ? last.at + last.dur + FLIP_GAP_MS + SPEAK_AFTER_MS : SPEAK_AFTER_MS;
}

/** when each card in `order` starts turning, and how long its turn takes */
export function turnSchedule(
  order: { card: { rarity: Rarity } }[],
): { at: number; dur: number }[] {
  let t = turnStart(order.length);
  return order.map((card) => {
    const shiny = card.card.rarity === "shiny";
    if (shiny) t += SHINY_HOLD_MS;
    const dur = shiny ? SHINY_FLIP_MS : FLIP_MS;
    const at = t;
    t += dur + FLIP_GAP_MS;
    return { at, dur };
  });
}
