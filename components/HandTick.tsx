"use client";

// S7 — the acknowledgement for one correct word (SPEC-v5a §9.2).
//
// The card leaves: a ghost of the prompt card, face DOWN, flies to the HAND
// count in the header and the count ticks as it lands. Under half a second,
// and it never blocks anything — the ghost is a clone with no pointer events,
// so the real card slot is already melting in the next prompt behind it and
// the player can draw straight through the flight.
//
// No rarity is shown here. What the card turned out to be is S8's to reveal,
// and until the run finishes it is not kept at all (SPEC-v5a §1.6).

/** ms in the air — the v5 slide's duration, kept */
const FLIGHT_MS = 260;
/** what it shrinks to as it reaches the count */
const LANDED_SCALE = 0.2;
/** the count's own beat when the card lands */
const POP_MS = 160;
const POP_SCALE = 1.15;

function reduced(): boolean {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

/**
 * Flies a face-down copy of `card` to `target`, then calls `onLand`.
 *
 * Returns a cancel that lands it immediately — the flight owns nothing but
 * itself, so a cancelled one still has to hand the count over.
 */
export function flyToHand(
  card: HTMLElement,
  target: HTMLElement,
  /** the deck mark on the back, the same one S6b's grid carries */
  mark: string,
  onLand: () => void,
): () => void {
  if (reduced() || typeof card.animate !== "function") {
    onLand();
    return () => {};
  }

  const from = card.getBoundingClientRect();
  const to = target.getBoundingClientRect();

  const ghost = document.createElement("div");
  ghost.className = "card card-back handGhost";
  ghost.style.left = `${from.left}px`;
  ghost.style.top = `${from.top}px`;
  ghost.style.width = `${from.width}px`;
  ghost.style.height = `${from.height}px`;
  const glyph = document.createElement("span");
  glyph.className = "cardBackMark";
  glyph.textContent = mark;
  ghost.append(glyph);
  document.body.append(ghost);

  // centre to centre, so the shrink lands on the count rather than beside it
  const dx = to.left + to.width / 2 - (from.left + from.width / 2);
  const dy = to.top + to.height / 2 - (from.top + from.height / 2);

  let done = false;
  const land = () => {
    if (done) return;
    done = true;
    ghost.remove();
    onLand();
  };

  const flight = ghost.animate(
    [
      { transform: "translate(0,0) scale(1)", opacity: 1 },
      { transform: `translate(${dx}px,${dy}px) scale(${LANDED_SCALE})`, opacity: 0.9 },
    ],
    { duration: FLIGHT_MS, easing: "cubic-bezier(.2,.8,.2,1)", fill: "both" },
  );
  flight.onfinish = land;

  return () => {
    flight.cancel();
    land();
  };
}

/** the count's tick: one small pop, and nothing else on the screen moves */
export function popCount(el: HTMLElement | null): void {
  if (!el || reduced() || typeof el.animate !== "function") return;
  el.animate([{ scale: "1" }, { scale: String(POP_SCALE) }, { scale: "1" }], {
    duration: POP_MS,
    easing: "ease-out",
  });
}
