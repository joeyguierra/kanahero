"use client";

// S6d — the set's collection. The only screen in the app where a card is shown
// face up outside the run that earned it, and the only one whose job is to be
// looked at rather than used.
//
// One row per word, in set-file order and never the run's: the shelf stands
// still while the runs shuffle. A row is three slots — shiny, base, worn — and
// a stock you have never earned is an empty slot with the stock's name in it,
// so the row reads as a set to fill rather than a list of zeroes. A word you
// have never finished a run on shows no face at all: the word's first
// appearance is still the card you earned (SPEC-v5a §3).
//
// A shelf card opens the stack (SPEC-v6 §5.3): one card per copy of that
// stock, newest first, each with the date it was earned and — held — the ink
// that earned it. Copies with no receipt (every copy from before v6, and any
// whose write failed) are one legacy card at the end, counted on its chip.

import { useState, useSyncExternalStore } from "react";

import { cardsFor } from "@/lib/joker";
import { useJokerLine, type JokerScreen } from "@/lib/joker-lines";
import { NO_COPIES, type Rarity } from "@/lib/progress";
import { getReceipts, getServerReceipts, receiptCount, receiptsFor, subscribeReceipts } from "@/lib/receipts";
import type { SetWord, WordSet } from "@/lib/sets";
import Card from "./Card";
import CardView, { type ViewCard } from "./CardView";
import Joker from "./Joker";

const STOCKS = ["shiny", "base", "worn"] as const;

/** the stack a slot opens: receipts newest first, then the legacy card */
function stackFor(setId: string, word: SetWord, stock: Rarity, copies: number): ViewCard[] {
  const receipts = receiptsFor(setId, word.word, stock);
  const cards: ViewCard[] = receipts.map((r) => ({
    word,
    card: { rarity: stock, tries: r.tries },
    ink: { box: r.box, strokes: r.strokes },
    earnedAt: r.earnedAt,
  }));
  const legacy = copies - receipts.length;
  if (legacy > 0) cards.push({ word, card: { rarity: stock, tries: 0 }, legacy });
  return cards;
}

export default function Collection({ set, onBack }: { set: WordSet; onBack: () => void }) {
  const cards = cardsFor(set.id);
  const receipts = useSyncExternalStore(subscribeReceipts, getReceipts, getServerReceipts);
  /** the slot a tap opened: one word, in one stock, and how many of it */
  const [open, setOpen] = useState<{
    word: SetWord;
    stock: (typeof STOCKS)[number];
    copies: number;
  } | null>(null);
  const empty = set.words.every((w) => !cards[w.word]);
  // his line waits for the receipts to land: a shelf whose every copy
  // predates v6 gets its own pool, and he must not draw twice for one visit
  const screen: JokerScreen | null = !receipts.ready
    ? null
    : empty
      ? "collection.empty"
      : receiptCount(set.id) === 0
        ? "collection.unreceipted"
        : "collection";
  const line = useJokerLine(screen, { set });

  return (
    <main className="frame">
      <div className="screenHead screenHeadStick">
        <button type="button" className="backLink" onClick={onBack}>
          ← {set.name}
        </button>
        <span className="screenTitle">COLLECTION</span>
      </div>

      <Joker line={line.text} lineId={line.id} className="jokerDeck" />

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
                        onClick={() => setOpen({ word, stock, copies: row[stock] })}
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

      {open && (
        <CardView
          set={set}
          cards={stackFor(set.id, open.word, open.stock, open.copies)}
          onClose={() => setOpen(null)}
        />
      )}
    </main>
  );
}
