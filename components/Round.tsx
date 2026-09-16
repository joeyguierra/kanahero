"use client";

// S7 / S7b / S7c — the round.
//
// Prompt → write → FLIP → the model word over your ink → GOT IT / MISSED.
// A miss goes back in the deck and comes round again; a win writes the card
// and slides it to the hand. ✕ abandons and keeps everything already earned.

import { useEffect, useRef, useState } from "react";
import { attempt, attemptsSoFar, earn, earnedCount, miss } from "@/lib/joker";
import {
  jokerLine,
  markSeen,
  peekOnce,
  revealLine,
  type JokerOnce,
  type JokerScreen,
} from "@/lib/joker-lines";
import type { EarnedCard } from "@/lib/progress";
import type { SetWord, WordSet } from "@/lib/sets";
import Card from "./Card";
import Joker from "./Joker";
import WordReveal from "./WordReveal";
import WritingCanvas, { type WritingCanvasHandle } from "./WritingCanvas";

export interface RoundCard {
  word: SetWord;
  card: EarnedCard;
}

type Once = { id: JokerOnce; text: string } | null;

/** the one-off line this prompt earns, if he has not used it before */
function pickOnce(set: WordSet, word: SetWord): Once {
  const id: JokerOnce | null =
    set.script === "kanji" ? (word.word.includes("口") ? "kuchi" : null) : "wholeWord";
  if (!id) return null;
  const text = peekOnce(id);
  return text ? { id, text } : null;
}

export default function Round({
  set,
  queue: dealt,
  onAbandon,
  onFinish,
}: {
  set: WordSet;
  queue: SetWord[];
  onAbandon: (hand: RoundCard[]) => void;
  onFinish: (hand: RoundCard[]) => void;
}) {
  const [queue, setQueue] = useState<SetWord[]>(dealt);
  const [phase, setPhase] = useState<"write" | "reveal" | "earned">("write");
  const [hand, setHand] = useState<RoundCard[]>([]);
  const [hasInk, setHasInk] = useState(false);
  const [justMissed, setJustMissed] = useState(false);
  const [earned, setEarned] = useState<RoundCard | null>(null);
  const canvasRef = useRef<WritingCanvasHandle>(null);
  // the two lines he is allowed exactly once, ever (SPEC-v5 §6): picked when
  // a prompt is dealt, spent only once it has actually been on screen
  const [once, setOnce] = useState<Once>(() => pickOnce(set, dealt[0]));

  const kanji = set.script === "kanji";
  const current = queue[0];
  const chars = [...current.word];
  const tries = attemptsSoFar(set.id, current.word);

  useEffect(() => {
    if (once) markSeen(once.id);
  }, [once]);

  function nextPrompt(next: SetWord[]) {
    canvasRef.current?.clear();
    setHasInk(false);
    if (next.length === 0) {
      onFinish(hand);
      return;
    }
    setOnce(pickOnce(set, next[0]));
    setQueue(next);
    setPhase("write");
  }

  function flip() {
    attempt(set.id, current.word);
    setJustMissed(false);
    setPhase("reveal");
  }

  function gotIt() {
    const card = earn(set.id, current.word, attemptsSoFar(set.id, current.word) || 1);
    const won = { word: current, card };
    setHand((h) => [...h, won]);
    setEarned(won);
    setPhase("earned");
  }

  function missed() {
    setJustMissed(true);
    setOnce(null);
    setEarned(null);
    setPhase("write");
    canvasRef.current?.clear();
    setHasInk(false);
    setQueue((q) => miss(q));
  }

  // ---- S7c: the earn beat, in place, then the hand ----
  if (phase === "earned" && earned) {
    const rarity = earned.card.rarity;
    return (
      <main
        className="frame roundEarned"
        onClick={() => {
          const rest = queue.slice(1);
          setEarned(null);
          nextPrompt(rest);
        }}
      >
        <div className="rail" aria-hidden />
        <div className="roundHead">
          <span className="roundChip roundChipBone">
            {set.glyph} {set.name}
          </span>
          <span className="roundDeck">
            DECK {queue.length - 1} · HAND {earnedCount(set)}
          </span>
        </div>

        <div className="earnStack">
          <Joker line={jokerLine(`earned.${rarity}` as JokerScreen)} size={84} />
          <div className="earnLabel">
            {rarity === "foil" ? "EARNED ON THE FIRST TRY" : `EARNED IN ${earned.card.tries} TRIES`}
          </div>
          <Card word={earned.word} set={set} size="earn" card={earned.card} className="earnCard" />
          <div className="earnNote">
            RARITY IS WRITTEN ON THE CARD
            <br />
            AND NEVER CHANGES
          </div>
        </div>

        <div className="handStrip">
          <span className="legend">HAND · {hand.length}</span>
          <div className="handCards">
            {hand.map(({ word, card }, i) => (
              <span
                key={word.word}
                className={`handCard handCard-${card.rarity}`}
                // a fixed 54px card, less the inset where the next card covers it
                style={{ fontSize: `${Math.min(19, (i === 0 ? 42 : 30) / word.word.length)}px` }}
              >
                {word.word}
              </span>
            ))}
          </div>
        </div>
      </main>
    );
  }

  // ---- S7 / S7b: write, then grade ----
  const reveal = phase === "reveal";
  const line = reveal
    ? revealLine(set.script, chars.length)
    : justMissed
      ? jokerLine("round.missed")
      : (once?.text ?? jokerLine(kanji ? "round.kanji" : "round.kana"));

  return (
    <main className="frame round">
      <div className="rail" aria-hidden />
      <div className="roundHead">
        <span className={`roundChip${reveal ? " roundChipBone" : ""}`}>
          {set.glyph} {set.name}
        </span>
        <span className="roundDeck">
          DECK {queue.length} · HAND {earnedCount(set)}
        </span>
        {reveal ? (
          <span className="revealing">
            <span className="led" />
            REVEALING
          </span>
        ) : (
          <button type="button" className="quit" onClick={() => onAbandon(hand)}>
            ✕
          </button>
        )}
      </div>

      <div className="roundTop">
        <Joker line={line} tail="top" className="jokerRound" />
        <Card
          word={current}
          set={set}
          size="round"
          attempt={reveal ? tries : undefined}
          className="roundCard"
        />
      </div>

      <div className="canvasWrap">
        <div className="canvasBox">
          <span className="canvasTag">
            {reveal ? "MODEL OVER YOUR INK" : kanji ? "DRAW" : `DRAW · ${chars.length} KANA`}
          </span>
          <WritingCanvas ref={canvasRef} frozen={reveal} onInkChange={setHasInk} />
          {reveal && <WordReveal word={current.word} />}
          {reveal && (
            <span className="canvasFoot">
              {current.word} · {chars.length} {kanji ? "CHARS" : "KANA"}
            </span>
          )}
        </div>
      </div>

      <div className="grow" />

      {reveal ? (
        <div className="sessionActions">
          <div className="legend legendSpaced">DID YOU WRITE IT?</div>
          <div className="actionRow">
            <button type="button" className="btnGrade btnLive" onClick={gotIt}>
              GOT IT
            </button>
            <button type="button" className="btnGrade btnCaution" onClick={missed}>
              MISSED
            </button>
          </div>
        </div>
      ) : (
        <div className="sessionActions">
          <div className="actionRow">
            <button type="button" className="btnSeam" onClick={() => canvasRef.current?.clear()}>
              CLEAR
            </button>
            <button type="button" className="btnSeam" onClick={() => canvasRef.current?.undo()}>
              UNDO
            </button>
          </div>
          <button type="button" className="btnStrike actionBar" onClick={flip} disabled={!hasInk}>
            FLIP
          </button>
        </div>
      )}
    </main>
  );
}
