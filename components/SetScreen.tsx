"use client";

// S6b — the set, face-down. Unearned words are backs with the deck mark;
// earned words show their face with the rarity chip. DEAL is the only action,
// and at N/N there is nothing left to deal, so the hand stands on its own.

import { useState } from "react";
import { cardsFor, earnedCount } from "@/lib/joker";
import { setLine } from "@/lib/joker-lines";
import type { SetWord, WordSet } from "@/lib/sets";
import Card, { CardBack } from "./Card";
import Joker from "./Joker";

export default function SetScreen({
  set,
  deckName,
  onBack,
  onDeal,
}: {
  set: WordSet;
  /** the deck this set belongs to, for the back link */
  deckName: string;
  onBack: () => void;
  onDeal: () => void;
}) {
  const [open, setOpen] = useState<SetWord | null>(null);
  const cards = cardsFor(set.id);
  const done = earnedCount(set);
  const left = set.words.length - done;
  const full = left === 0;
  // earned first, in the order they were won; the rest stay face-down behind
  const earned = set.words.filter((w) => cards[w.word]);
  const unearned = set.words.filter((w) => !cards[w.word]);

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

      <Joker line={setLine(set.script, set.words.length, done)} className="jokerDeck" />

      <div className="setHead">
        <span className="setHeadTitle">THE SET</span>
        <span className="panelCount">
          {done}/{set.words.length}
        </span>
      </div>
      <span
        className="bar barBone"
        style={{ "--fill": `${(done / set.words.length) * 100}%` } as React.CSSProperties}
      >
        <i />
      </span>

      <div className="setGrid">
        {unearned.map((word) => (
          <CardBack key={word.word} set={set} />
        ))}
        {earned.map((word) => (
          <Card
            key={word.word}
            word={word}
            set={set}
            size="grid"
            card={cards[word.word]}
            onClick={() => setOpen(word)}
          />
        ))}
      </div>

      <div className="grow" />

      {full ? (
        <div className="roundLength">
          <span className="legend">ROUND LENGTH</span>
          <span className="roundLengthValue">NOTHING LEFT TO DEAL</span>
        </div>
      ) : (
        <>
          <div className="roundLength">
            <span className="legend">ROUND LENGTH</span>
            <span className="roundLengthValue">{left} LEFT · NO TIMER</span>
          </div>
          <button type="button" className="btnStrike actionBar" onClick={onDeal}>
            DEAL
          </button>
        </>
      )}

      {open && (
        <div className="cardOverlay" role="dialog" onClick={() => setOpen(null)}>
          <Card word={open} set={set} size="earn" card={cards[open.word]} />
        </div>
      )}
    </main>
  );
}
