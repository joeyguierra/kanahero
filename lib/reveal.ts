// S8's running order and its clock (SPEC-v5a §9.3).
//
// Worn first, shiny last, and within a stock the order they were graded in.
// The layout uses this order too, so the reveal sweeps left to right and top
// to bottom with the best card of the run landing at the end of it.
//
// Pure functions over the hand — no DOM, no timers — so the screen can ask
// what happens when, and the e2e can ask the same question without waiting.

import type { Rarity } from "./progress";

/** ms before the first card turns */
export const LEAD_MS = 300;
/** ms one card spends turning */
export const FLIP_MS = 240;
/** ms between two ordinary cards, before the cap below */
export const STEP_MS = 160;
/** the whole reveal, shiny holds aside, fits in this — a 21-card set must not
    drag, so the step shrinks to fit rather than the reveal growing */
export const BUDGET_MS = 2400;
/** the beat before the first shiny turns */
export const SHINY_HOLD_MS = 450;
/** shinies take their time */
export const SHINY_STEP_MS = 320;
/** one pass of shine across a shiny face as it lands */
export const SWEEP_MS = 400;
/** reduced motion: no turning, one fade, everything already true */
export const FADE_MS = 120;

const ORDER: Rarity[] = ["worn", "base", "shiny"];

/** the hand in reveal order: worn → base → shiny, grading order within each */
export function revealOrder<T extends { card: { rarity: Rarity } }>(hand: T[]): T[] {
  return ORDER.flatMap((rarity) => hand.filter((c) => c.card.rarity === rarity));
}

/** when each card in `order` starts turning, in ms from mount */
export function revealSchedule(order: { card: { rarity: Rarity } }[]): number[] {
  const step = order.length > 0 ? Math.min(STEP_MS, BUDGET_MS / order.length) : STEP_MS;
  const at: number[] = [];
  let t = LEAD_MS;
  order.forEach((card, i) => {
    const shiny = card.card.rarity === "shiny";
    const afterShiny = i > 0 && order[i - 1].card.rarity === "shiny";
    if (shiny && !afterShiny) t += SHINY_HOLD_MS;
    else if (i > 0) t += shiny ? SHINY_STEP_MS : step;
    at.push(t);
  });
  return at;
}
