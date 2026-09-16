"use client";

// S8 — the set dealt out. The count, the breakdown, the Joker's line, and the
// hand itself: a fan up to five cards, a seven-column grid from six (the deck
// ceiling is 21, which is three full rows). Tap a card to see its face.

import { useState } from "react";
import { earnedCount } from "@/lib/joker";
import { resultLine } from "@/lib/joker-lines";
import type { Rarity } from "@/lib/progress";
import type { WordSet } from "@/lib/sets";
import type { RoundCard } from "./Round";
import Card from "./Card";
import Joker from "./Joker";

/** past five cards the fan stops fanning */
const FAN_MAX = 5;

export default function Result({
  set,
  hand,
  onBackToDeck,
}: {
  set: WordSet;
  hand: RoundCard[];
  onBackToDeck: () => void;
}) {
  const [open, setOpen] = useState<RoundCard | null>(null);
  const tally = (r: Rarity) => hand.filter((c) => c.card.rarity === r).length;
  const foil = tally("foil");
  const left = set.words.length - earnedCount(set);
  const fan = hand.length <= FAN_MAX;

  return (
    <main className="frame">
      <div className="livery" aria-hidden>
        <span className="ghost ghostResult">{set.glyph}</span>
      </div>

      <div className="screenHead">
        <span className="screenTitle">SET DEALT OUT</span>
        <span className="screenTitle">
          {set.glyph} {set.name}
          {left === 0 ? " · FULL" : ""}
        </span>
      </div>

      <div className="resultCount">
        {hand.length}
        <span className="resultCountWord">COLLECTED</span>
      </div>
      <div className="resultTally">
        <span className="resultFoil">{foil} FOIL</span>
        <span className="resultRest">
          {tally("base")} BASE · {tally("worn")} WORN
        </span>
      </div>

      <Joker line={resultLine(set.script, hand.length, foil, left)} className="jokerDeck" />

      <div className={fan ? "resultFan" : "resultGrid"}>
        {hand.map(({ word, card }, i) => (
          <Card
            key={word.word}
            word={word}
            set={set}
            size={fan ? "fan" : "grid"}
            card={card}
            onClick={() => setOpen({ word, card })}
            className={fan ? `fanCard fanCard${i}` : ""}
          />
        ))}
      </div>

      <div className="resultNote">
        TAP A CARD TO SEE ITS FACE. TRIES ARE
        <br />
        PRINTED ON EVERY CARD, FOREVER.
      </div>
      <button type="button" className="btnBone actionBar" onClick={onBackToDeck}>
        BACK TO DECK
      </button>

      {open && (
        <div className="cardOverlay" role="dialog" onClick={() => setOpen(null)}>
          <Card word={open.word} set={set} size="earn" card={open.card} />
        </div>
      )}
    </main>
  );
}
