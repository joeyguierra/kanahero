"use client";

// S7 / S7b — the round.
//
// Prompt → write → FLIP → the model word over your ink → GOT IT / MISSED →
// the next prompt, with no tap in between. The reward for a word is one small
// acknowledgement here; the reward for the RUN is S8, where every card is
// turned over one at a time (SPEC-v5a §9).
// A miss goes back in the deck and comes round again; a win earns a card into
// the hand — provisionally. A run is all-or-nothing (SPEC-v5a §1): the hand
// reaches storage in one write when the queue empties, and ✕ (through the
// Joker's confirm) or a reload costs the whole run.
//
// Tries are counted here, in the run's own state, and die with it.

import { useEffect, useRef, useState } from "react";
import { earnRun, miss, rarityFor, type EarnedCard } from "@/lib/joker";
import type { Rarity } from "@/lib/progress";
import { useJokerLine, type JokerScreen } from "@/lib/joker-lines";
import type { SetWord, WordSet } from "@/lib/sets";
import AbandonDialog from "./AbandonDialog";
import Card from "./Card";
import Joker from "./Joker";
import { flyToHand, popCount } from "./HandTick";
import { MeltFilter, meltIn } from "./PromptMelt";
import WordReveal from "./WordReveal";
import WritingCanvas, { type WritingCanvasHandle } from "./WritingCanvas";

export interface RoundCard {
  word: SetWord;
  card: EarnedCard;
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
  const [phase, setPhase] = useState<"write" | "reveal">("write");
  const [hand, setHand] = useState<RoundCard[]>([]);
  const [hasInk, setHasInk] = useState(false);
  const [justMissed, setJustMissed] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const canvasRef = useRef<WritingCanvasHandle>(null);
  const quitRef = useRef<HTMLButtonElement>(null);
  const promptRef = useRef<HTMLDivElement>(null);
  const jokerRef = useRef<HTMLImageElement>(null);
  const handRef = useRef<HTMLSpanElement>(null);
  /** the flight in the air, if any — cancelling lands it (§9.2) */
  const flight = useRef<(() => void) | null>(null);
  // The header counts lag the run by one flight: the card is still on its way
  // to the hand, so the hand has not got it yet. Everything else — the queue,
  // the next prompt — has already moved on.
  const [shown, setShown] = useState({ deck: dealt.length, hand: 0 });
  /** the rarity of the word just graded: his line on the NEXT prompt (§9.2.4) */
  const [justEarned, setJustEarned] = useState<Rarity | null>(null);
  // every prompt he puts up gets its own melt (S7 anim sheet) — including the
  // one a miss brings back round. The flip is not a new prompt: the card is
  // the same card, so this counts presentations rather than renders.
  const [presented, setPresented] = useState(0);
  // attempts within this run, by word — S7b prints the number, so it is state.
  // It lives and dies with the component, which is the whole of the rule: the
  // count never crosses a run (SPEC-v5a §1.3).
  const [tried, setTried] = useState<Record<string, number>>({});
  const kanji = set.script === "kanji";
  /** the deck mark the card back carries, the same one S6b's grid shows */
  const mark = kanji ? (set.place ?? set.glyph) : set.glyph;
  const current = queue[0];
  const chars = [...current.word];
  const tries = tried[current.word] ?? 0;
  const reveal = phase === "reveal";

  // What he says here, in one place. The screen decides the pool; the engine
  // decides the line, and an unspent aside outranks the pool — which is the
  // whole of the S7 order: missed → once → the prompt's own pool. An aside
  // belongs to the prompt, so the reveal and a miss both wave it off.
  const screen: JokerScreen = reveal
    ? kanji
      ? "reveal.kanji"
      : "reveal.kana"
    : justMissed
      ? "round.missed"
      : justEarned
        ? (`earned.${justEarned}` as JokerScreen)
        : kanji
          ? "round.kanji"
          : "round.kana";
  const line = useJokerLine(
    screen,
    { set, word: current, chars: chars.length, triesThisWord: tries, allowOnce: !reveal && !justMissed },
    `${presented}.${phase}`,
  );

  useEffect(() => {
    const card = promptRef.current;
    if (!card) return;
    return meltIn(card, jokerRef.current);
  }, [presented]);

  useEffect(() => () => flight.current?.(), []);

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
    setQueue(next);
    setPhase("write");
    setPresented((n) => n + 1);
  }

  function flip() {
    setTried((t) => ({ ...t, [current.word]: (t[current.word] ?? 0) + 1 }));
    setJustMissed(false);
    setPhase("reveal");
  }

  // No tap, no interstitial: the card joins the hand and the next prompt is
  // already on its way. Rarity is not shown here — S8 turns it over.
  function gotIt() {
    const n = tried[current.word] || 1;
    const won: RoundCard = { word: current, card: { rarity: rarityFor(n), tries: n } };
    const held = [...hand, won];
    const rest = queue.slice(1);
    const card = promptRef.current;
    setHand(held);
    setJustEarned(won.card.rarity);

    // the card leaves for the hand while its slot is already melting in the
    // next prompt behind it — a clone, so the two never touch the same element
    flight.current?.();
    if (card && handRef.current) {
      flight.current = flyToHand(card, handRef.current, mark, () => {
        // sfx: hand.tick
        flight.current = null;
        setShown({ deck: rest.length, hand: held.length });
        popCount(handRef.current);
      });
    } else {
      setShown({ deck: rest.length, hand: held.length });
    }

    nextPrompt(rest, held);
  }

  function missed() {
    setJustMissed(true);
    setJustEarned(null);
    setPhase("write");
    canvasRef.current?.clear();
    setHasInk(false);
    setQueue((q) => miss(q));
    setPresented((n) => n + 1);
  }

  // ---- S7 / S7b: write, then grade ----
  return (
    <main className={`frame round${leaving ? " frameBehindDialog" : ""}`}>
      <div className="rail" aria-hidden />
      <div className="roundHead">
        <span className={`roundChip${reveal ? " roundChipBone" : ""}`}>
          {set.glyph} {set.name}
        </span>
        <span className="roundDeck">
          DECK {shown.deck} ·{" "}
          <span ref={handRef} className="roundHand">
            HAND {shown.hand}
          </span>
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
        <Joker line={line.text} lineId={line.id} tail="top" markRef={jokerRef} className="jokerRound" />
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
