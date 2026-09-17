"use client";

// S8 — one card, two faces, one element (SPEC-v5a §9.3).
//
// The back and the face are both in the slot from the first frame, one of them
// turned away: the card turns on its Y axis and nothing reflows, because there
// was never a moment when the slot held something of a different size.
//
// The shiny sweep is a single pass over the face as it lands, and then the
// card rests with the normal shiny finish it would have had anyway — shiny
// stays the only glowing thing on the screen, and it does not keep glowing
// harder than it did before.

import type { EarnedCard } from "@/lib/joker";
import type { SetWord, WordSet } from "@/lib/sets";
import Card, { CardBack, type CardSize } from "./Card";

export default function RevealCard({
  word,
  set,
  card,
  size,
  /** face up yet? */
  up,
  /** the one pass of shine, as this one lands */
  sweep,
  /** only once the reveal is over does a tap mean "show me that face" */
  onClick,
  className = "",
}: {
  word: SetWord;
  set: WordSet;
  card: EarnedCard;
  size: CardSize;
  up: boolean;
  sweep?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <div
      className={`revealSlot revealSlot-${size}${up ? " revealUp" : ""} ${className}`.trim()}
      onClick={onClick}
    >
      <div className="revealFace revealFaceBack">
        <CardBack set={set} />
      </div>
      <div className={`revealFace revealFaceUp${sweep ? " revealSweep" : ""}`}>
        <Card word={word} set={set} size={size} card={card} />
      </div>
    </div>
  );
}
