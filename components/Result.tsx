"use client";

// S8 — the run, earned, and the only reward beat in the app (SPEC-v5a §9.3).
// A run is the whole set, so the count is the set size every time and the only
// thing that varies is the stock it came up in: a fan up to five cards, a
// seven-column grid from six (the ceiling is 21, three full rows).
//
// The screen mounts with every card already in its slot, FACE DOWN, and with
// nothing counted: 0 EARNED, 0 · 0 · 0, and his panel at full height with no
// line in it. Then the cards turn, worn first and shiny last, and each one
// adds itself to the counts as it lands. He speaks when the last one has.
//
// None of this is load-bearing. The run was written the moment the last word
// was graded, before this screen existed (§1.1, §9.3.9) — leaving mid-reveal
// costs nothing, which is exactly why a tap may skip to the end.
//
// The tries printed on these faces come from the run that just ended, not from
// storage — nothing keeps a copy's try count past the run (SPEC-v5a §2).

import { useEffect, useMemo, useRef, useState } from "react";
import { useJokerLine } from "@/lib/joker-lines";
import type { Rarity } from "@/lib/progress";
import {
  FLIP_MS,
  SWEEP_MS,
  revealOrder,
  revealSchedule,
} from "@/lib/reveal";
import type { WordSet } from "@/lib/sets";
import type { RoundCard } from "./Round";
import Card from "./Card";
import Joker from "./Joker";
import RevealCard from "./RevealCard";

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
  const order = useMemo(() => revealOrder(hand), [hand]);
  /** how many have started turning, and how many have landed — the counts are
      the landed ones, so a number never arrives before the face it belongs to */
  const [turning, setTurning] = useState(0);
  const [landed, setLanded] = useState(0);
  const [sweeping, setSweeping] = useState(-1);
  const done = landed >= order.length;
  const timers = useRef<number[]>([]);

  const fan = hand.length <= FAN_MAX;
  const tally = (r: Rarity) => order.slice(0, landed).filter((c) => c.card.rarity === r).length;
  const shiny = tally("shiny");

  /** everything face up, counted, and no shine left to sweep */
  function skip() {
    // sfx: reveal.skip
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setTurning(order.length);
    setLanded(order.length);
    setSweeping(-1);
  }

  useEffect(() => {
    // Reduced motion is the same reveal with no time in it: every card lands
    // at once, nothing sweeps, and the screen fades in once (CSS).
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    const at = reduced ? order.map(() => 0) : revealSchedule(order);
    const flip = reduced ? 0 : FLIP_MS;
    const wait = (ms: number, run: () => void) => {
      timers.current.push(window.setTimeout(run, ms));
    };
    order.forEach((card, i) => {
      wait(at[i], () => {
        // sfx: reveal.flip <card.card.rarity>
        setTurning(i + 1);
      });
      wait(at[i] + flip, () => {
        setLanded(i + 1);
        if (!reduced && card.card.rarity === "shiny") {
          // sfx: reveal.shinyHold before the first one — the beat itself is in
          // the schedule; this is the single pass of shine as it lands
          setSweeping(i);
          wait(SWEEP_MS, () => setSweeping((n) => (n === i ? -1 : n)));
        }
        // sfx: reveal.end on the last one
      });
    });
    const kept = timers.current;
    return () => kept.forEach(clearTimeout);
  }, [order]);

  // {earned} counts the cards this run earned, never the drill's characters.
  // Null until the last card lands: he does not talk over the reveal.
  const line = useJokerLine(done ? "result" : null, {
    set,
    earned: hand.length,
    shiny: order.filter((c) => c.card.rarity === "shiny").length,
    base: order.filter((c) => c.card.rarity === "base").length,
    worn: order.filter((c) => c.card.rarity === "worn").length,
  });

  return (
    <main className="frame resultScreen" onClick={() => !done && skip()}>
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
        {landed}
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
        {order.map(({ word, card }, i) => (
          <RevealCard
            key={word.word}
            word={word}
            set={set}
            card={card}
            size={fan ? "fan" : "grid"}
            up={i < turning}
            sweep={i === sweeping}
            onClick={done ? () => setOpen({ word, card }) : undefined}
            className={fan ? `fanCard fanCard${i}` : ""}
          />
        ))}
      </div>

      {/* the instruction is only true once there is a face to tap */}
      <div className="resultNote">{done ? "TAP A CARD TO SEE ITS FACE." : "\u00a0"}</div>
      <button
        type="button"
        className="btnBone actionBar"
        onClick={(e) => {
          e.stopPropagation();
          onBackToDeck();
        }}
      >
        BACK TO DECK
      </button>

      {open && (
        <div
          className="cardOverlay"
          role="dialog"
          onClick={(e) => {
            e.stopPropagation();
            setOpen(null);
          }}
        >
          <Card word={open.word} set={set} size="earn" card={open.card} />
        </div>
      )}
    </main>
  );
}
