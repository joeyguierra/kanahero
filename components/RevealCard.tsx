"use client";

// S8 — one card, two faces, one element (design: v5-anims/v5c "S8 earned").
//
// The slot holds both faces from the first frame, one of them turned away, and
// the inner element carries the turn: it mounts at rotateY(180deg) — his back
// to you — and comes to zero when the card is dealt over. Nothing reflows,
// because there was never a moment when the slot held something else.
//
// A row overlaps its cards, so a slot is also a stacking context: the card on
// top hides the right edge of the one beneath it. A tap does not rearrange the
// row — it opens the card's full face over the screen, where it is read.
//
// A shiny keeps a standing shine once it is face up — one diagonal swipe every
// three seconds, staggered per card so no two ever swipe together.

import type { EarnedCard } from "@/lib/joker";
import type { SetWord, WordSet } from "@/lib/sets";
import Card, { CardBack } from "./Card";

export default function RevealCard({
  word,
  set,
  card,
  /** face up yet? */
  up,
  /** the deal order inside the row — the later card covers the earlier one */
  z,
  /** this card's own turn, in ms: a shiny takes longer than the rest */
  flipMs,
  /** ms before its standing shine starts, once it has landed */
  shineDelay,
  onClick,
  ref,
}: {
  word: SetWord;
  set: WordSet;
  card: EarnedCard;
  up: boolean;
  z: number;
  flipMs: number;
  shineDelay: number;
  onClick?: () => void;
  ref?: React.Ref<HTMLDivElement>;
}) {
  const shiny = card.rarity === "shiny";
  return (
    <div
      className={`revealSlot${up ? " revealUp" : ""}`}
      style={{ zIndex: z }}
      onClick={onClick}
      ref={ref}
    >
      <div className="revealInner" style={{ transitionDuration: `${flipMs}ms` }}>
        <div className="revealFace revealFaceUp">
          <Card word={word} set={set} size="earned" card={card} />
          {shiny && (
            <span className="cardShine" style={{ animationDelay: `${shineDelay}ms` }} aria-hidden />
          )}
        </div>
        <div className="revealFace revealFaceBack">
          <CardBack set={set} />
        </div>
      </div>
    </div>
  );
}
