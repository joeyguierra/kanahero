"use client";

// S6d — the set's collection. The only screen in the app where a card is shown
// face up outside the run that minted it, and the only one whose job is to be
// looked at rather than used.
//
// One row per word, in set-file order and never the run's: the shelf stands
// still while the runs shuffle. A row is three slots — shiny, base, worn — and
// a stock you have never minted is an empty slot with the stock's name in it,
// so the row reads as a set to fill rather than a list of zeroes. A word you
// have never finished a run on shows no face at all: the word's first
// appearance is still the card you earned (SPEC-v5a §3).

import { cardsFor } from "@/lib/joker";
import { jokerLine } from "@/lib/joker-lines";
import { NO_COPIES } from "@/lib/progress";
import type { WordSet } from "@/lib/sets";
import Card from "./Card";
import Joker from "./Joker";

const STOCKS = ["shiny", "base", "worn"] as const;

export default function Collection({ set, onBack }: { set: WordSet; onBack: () => void }) {
  const cards = cardsFor(set.id);
  const empty = set.words.every((w) => !cards[w.word]);

  return (
    <main className="frame">
      <div className="screenHead screenHeadStick">
        <button type="button" className="backLink" onClick={onBack}>
          ← {set.name}
        </button>
        <span className="screenTitle">COLLECTION</span>
      </div>

      <Joker line={jokerLine(empty ? "collection.empty" : "collection")} className="jokerDeck" />

      <div className="collectionList">
        {set.words.map((word) => {
          const row = cards[word.word] ?? NO_COPIES;
          const collected = cards[word.word] !== undefined;
          const total = row.shiny + row.base + row.worn;
          return (
            <div
              key={word.word}
              className={`collectionRow${collected ? "" : " collectionRowEmpty"}`}
            >
              <div className="collectionHead">
                <span className="collectionWord">
                  {collected ? word.word : <i className="collectionMark">{set.glyph}</i>}
                </span>
                <span className="collectionMeaning">{word.meaning.toUpperCase()}</span>
                <span className="collectionTotal">{collected ? `×${total}` : "NOT YET"}</span>
              </div>

              <div className="collectionCards">
                {STOCKS.map((stock) => (
                  <div key={stock} className={`collectionSlot collectionSlot-${stock}`}>
                    {row[stock] > 0 ? (
                      // the card itself, in its own stock — the chip names it
                      <Card
                        word={word}
                        set={set}
                        size="shelf"
                        card={{ rarity: stock, tries: 0 }}
                      />
                    ) : (
                      // an empty slot, not a card: the stock is named so the
                      // row shows what is missing as plainly as what is there
                      <div className="shelfSlot">
                        <span className="shelfSlotStock">{stock.toUpperCase()}</span>
                      </div>
                    )}
                    <span
                      className={`collectionTimes${row[stock] === 0 ? " collectionTimesZero" : ""}`}
                    >
                      ×{row[stock]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="grow" />
    </main>
  );
}
