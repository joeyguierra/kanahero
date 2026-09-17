"use client";

// S6b — the set, face down. Always face down: a run deals the whole set every
// time, so there is no earned half of the grid and nothing to reveal here
// (SPEC-v5a §1–3). What you own is a shelf of copies, counted under the grid
// and laid out one word per row on S6d.

import { setTotals } from "@/lib/joker";
import { setLine } from "@/lib/joker-lines";
import type { WordSet } from "@/lib/sets";
import { CardBack } from "./Card";
import Joker from "./Joker";

export default function SetScreen({
  set,
  deckName,
  onBack,
  onDeal,
  onCollection,
}: {
  set: WordSet;
  /** the deck this set belongs to, for the back link */
  deckName: string;
  onBack: () => void;
  onDeal: () => void;
  onCollection: () => void;
}) {
  const totals = setTotals(set);

  return (
    <main className="frame">
      <div className="screenHead">
        <button type="button" className="backLink" onClick={onBack}>
          ← {deckName}
        </button>
        <span className="screenTitle">
          {set.glyph} {set.name}
        </span>
      </div>

      <Joker line={setLine(set.words.length)} className="jokerDeck" />

      <div className="setHead">
        <span className="setHeadTitle">THE SET</span>
        <span className="panelCount">{set.words.length} WORDS</span>
      </div>

      <div className="setGrid">
        {set.words.map((word) => (
          <CardBack key={word.word} set={set} />
        ))}
      </div>

      <div className="grow" />

      <div className="setTotals">
        <div className="setTotalsRow">
          {(["shiny", "base", "worn"] as const).map((rarity) => (
            <span
              key={rarity}
              className={`setTotal setTotal-${rarity}${totals[rarity] === 0 ? " setTotalZero" : ""}`}
            >
              {totals[rarity]} {rarity.toUpperCase()}
            </span>
          ))}
        </div>
        <button type="button" className="collectionLink" onClick={onCollection}>
          VIEW COLLECTION →
        </button>
      </div>
      <button type="button" className="btnStrike actionBar" onClick={onDeal}>
        DEAL
      </button>
    </main>
  );
}
