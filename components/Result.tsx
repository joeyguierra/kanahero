"use client";

// S8 — the run, earned. A run is the whole set, so the count is the set size
// every time and the only thing that varies is the stock it came up in: a fan
// up to five cards, a seven-column grid from six (the ceiling is 21, three
// full rows). Tap a card to see its face.
//
// The tries printed on these faces come from the run that just ended, not from
// storage — nothing keeps a copy's try count past the run (SPEC-v5a §2).

import { useState } from "react";
import { useJokerLine } from "@/lib/joker-lines";
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
  const shiny = tally("shiny");
  const fan = hand.length <= FAN_MAX;
  // {earned} counts the cards this run earned, never the drill's characters
  const line = useJokerLine("result", {
    set,
    earned: hand.length,
    shiny,
    base: tally("base"),
    worn: tally("worn"),
  });

  return (
    <main className="frame">
      <div className="livery" aria-hidden>
        <span className="ghost ghostResult">{set.glyph}</span>
      </div>

      <div className="screenHead">
        <span className="screenTitle">SET DEALT OUT</span>
        <span className="screenTitle">
          {set.glyph} {set.name}
        </span>
      </div>

      <div className="resultCount">
        {hand.length}
        <span className="resultCountWord">EARNED</span>
      </div>
      <div className="resultTally">
        <span className="resultShiny">{shiny} SHINY</span>
        <span className="resultRest">
          {tally("base")} BASE · {tally("worn")} WORN
        </span>
      </div>

      <Joker line={line.text} lineId={line.id} className="jokerDeck" />

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

      <div className="resultNote">TAP A CARD TO SEE ITS FACE.</div>
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
