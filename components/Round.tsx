"use client";

// S7 / S7b / S7c — the round.
//
// Prompt → write → FLIP → the model word over your ink → GOT IT / MISSED.
// A miss goes back in the deck and comes round again; a win earns a card into
// the hand — provisionally. A run is all-or-nothing (SPEC-v5a §1): the hand
// reaches storage in one write when the queue empties, and ✕ (through the
// Joker's confirm) or a reload costs the whole run.
//
// Tries are counted here, in the run's own state, and die with it.

import { useEffect, useRef, useState } from "react";
import { earnRun, miss, rarityFor, type EarnedCard } from "@/lib/joker";
import {
  jokerLine,
  markSeen,
  peekOnce,
  revealLine,
  type JokerOnce,
  type JokerScreen,
} from "@/lib/joker-lines";
import type { SetWord, WordSet } from "@/lib/sets";
import AbandonDialog from "./AbandonDialog";
import Card from "./Card";
import Joker from "./Joker";
import { MeltFilter, meltIn } from "./PromptMelt";
import WordReveal from "./WordReveal";
import WritingCanvas, { type WritingCanvasHandle } from "./WritingCanvas";

export interface RoundCard {
  word: SetWord;
  card: EarnedCard;
}

type Once = { id: JokerOnce; text: string } | null;

/** the one-off line this prompt earns, if he has not used it before.
    `kuchi` is about the station set's seven 口 words and is scoped to it: it
    used to fire on any kanji word containing 口, which spent it on TEST's lone
    口 where the line is nonsense (SPEC-v5b §1). */
function pickOnce(set: WordSet, word: SetWord): Once {
  const id: JokerOnce | null =
    set.script === "kanji"
      ? set.id === "station-kanji" && word.word.includes("口")
        ? "kuchi"
        : null
      : "wholeWord";
  if (!id) return null;
  const text = peekOnce(id, set);
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
  /** the run is discarded, not banked — nothing of it was ever written */
  onAbandon: () => void;
  onFinish: (hand: RoundCard[]) => void;
}) {
  const [queue, setQueue] = useState<SetWord[]>(dealt);
  const [phase, setPhase] = useState<"write" | "reveal" | "earned">("write");
  const [hand, setHand] = useState<RoundCard[]>([]);
  const [hasInk, setHasInk] = useState(false);
  const [justMissed, setJustMissed] = useState(false);
  const [earned, setEarned] = useState<RoundCard | null>(null);
  const [leaving, setLeaving] = useState(false);
  const canvasRef = useRef<WritingCanvasHandle>(null);
  const quitRef = useRef<HTMLButtonElement>(null);
  const promptRef = useRef<HTMLDivElement>(null);
  const jokerRef = useRef<HTMLImageElement>(null);
  // every prompt he puts up gets its own melt (S7 anim sheet) — including the
  // one a miss brings back round. The flip is not a new prompt: the card is
  // the same card, so this counts presentations rather than renders.
  const [presented, setPresented] = useState(0);
  // attempts within this run, by word — S7b prints the number, so it is state.
  // It lives and dies with the component, which is the whole of the rule: the
  // count never crosses a run (SPEC-v5a §1.3).
  const [tried, setTried] = useState<Record<string, number>>({});
  // the two lines he is allowed exactly once, ever (SPEC-v5 §6): picked when
  // a prompt is dealt, spent only once it has actually been on screen
  const [once, setOnce] = useState<Once>(() => pickOnce(set, dealt[0]));

  const kanji = set.script === "kanji";
  const current = queue[0];
  const chars = [...current.word];
  const tries = tried[current.word] ?? 0;

  useEffect(() => {
    if (once) markSeen(once.id);
  }, [once]);

  useEffect(() => {
    const card = promptRef.current;
    if (!card) return;
    return meltIn(card, jokerRef.current);
  }, [presented]);

  function nextPrompt(next: SetWord[], won: RoundCard[]) {
    canvasRef.current?.clear();
    setHasInk(false);
    if (next.length === 0) {
      // the run is over, so the run is kept: one write, every word of it
      earnRun(
        set.id,
        won.map(({ word, card }) => ({ wordId: word.word, rarity: card.rarity })),
      );
      onFinish(won);
      return;
    }
    setOnce(pickOnce(set, next[0]));
    setQueue(next);
    setPhase("write");
    setPresented((n) => n + 1);
  }

  function flip() {
    setTried((t) => ({ ...t, [current.word]: (t[current.word] ?? 0) + 1 }));
    setJustMissed(false);
    setPhase("reveal");
  }

  function gotIt() {
    const n = tried[current.word] || 1;
    const won: RoundCard = { word: current, card: { rarity: rarityFor(n), tries: n } };
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
    setPresented((n) => n + 1);
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
          nextPrompt(rest, hand);
        }}
      >
        <div className="rail" aria-hidden />
        <div className="roundHead">
          <span className="roundChip roundChipBone">
            {set.glyph} {set.name}
          </span>
          <span className="roundDeck">
            DECK {queue.length - 1} · HAND {hand.length}
          </span>
        </div>

        <div className="earnStack">
          <Joker line={jokerLine(`earned.${rarity}` as JokerScreen)} size={84} />
          <div className="earnLabel">
            {rarity.toUpperCase()} ·{" "}
            {earned.card.tries === 1 ? "FIRST TRY" : `${earned.card.tries} TRIES`}
          </div>
          <Card word={earned.word} set={set} size="earn" card={earned.card} className="earnCard" />
          <div className="earnNote">KEPT WHEN THE RUN FINISHES</div>
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
    <main className={`frame round${leaving ? " frameBehindDialog" : ""}`}>
      <div className="rail" aria-hidden />
      <div className="roundHead">
        <span className={`roundChip${reveal ? " roundChipBone" : ""}`}>
          {set.glyph} {set.name}
        </span>
        <span className="roundDeck">
          DECK {queue.length} · HAND {hand.length}
        </span>
        {reveal ? (
          <span className="revealing">
            <span className="led" />
            REVEALING
          </span>
        ) : (
          <button ref={quitRef} type="button" className="quit" onClick={() => setLeaving(true)}>
            ✕
          </button>
        )}
      </div>

      <MeltFilter />

      <div className="roundTop">
        <Joker line={line} tail="top" markRef={jokerRef} className="jokerRound" />
        <Card
          word={current}
          set={set}
          size="round"
          attempt={reveal ? tries : undefined}
          className="roundCard"
          ref={promptRef}
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

      {leaving && (
        <AbandonDialog
          onCancel={() => {
            setLeaving(false);
            quitRef.current?.focus();
          }}
          onConfirm={onAbandon}
        />
      )}
    </main>
  );
}
