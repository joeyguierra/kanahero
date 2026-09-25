"use client";

// S8 — the run, earned, and the only reward beat in the app.
// Drawn from `docs/design/v5-anims/v5c/S8 earned.dc.html`.
//
// A run is the whole set, so the count is the set size every time and the only
// thing that varies is the stock it came up in. There is no fan: the hand is
// rows of at most seven cards, each one twice the old grid card and overlapping
// the one before it, dealt left to right so the rightmost card is on top. A
// card is one solid piece — chip and romaji left, the word dead centre — and
// the next card simply covers part of it. Tapping one opens its full face over
// the screen, which is where the whole card is read: stock and tries, the set's
// mark, the word, its reading and what it means.
//
// Two beats. THE DEAL: he flicks the whole hand out of his hand face down,
// 80ms apart, and the count reads 0. THE TURN: worn first, then base, then
// shiny, each a flip in place with the count and the tally ticking up per card;
// before each shiny he holds, the card lifts and flares, and once it is face up
// a white swipe crosses it every three seconds — every shiny together, and not
// until the last card of the hand has finished turning. He speaks when the last
// card is down, and the note appears with him. A tap through any of it hurries
// the rest of the hand over rather than cutting to the end — see `fastSchedule`.
//
// None of this is load-bearing. The run was written the moment the last word
// was graded, before this screen existed (SPEC-v5a §1.1, §9.3.9) — leaving
// mid-reveal costs nothing, which is exactly why a tap may skip to the end.

import { useEffect, useMemo, useRef, useState } from "react";
import { useJokerLine } from "@/lib/joker-lines";
import { play, schedule } from "@/lib/sfx";
import { hurryCues, revealCues } from "@/lib/sfx-schedule";
import type { Rarity } from "@/lib/progress";
import {
  COLS,
  DEAL_GAP_MS,
  FAST_FLIP_MS,
  FAST_STEP_MS,
  FLICK_MS,
  FLIGHT_MS,
  FLIP_MS,
  SHINY_FLIP_MS,
  SHINY_LIFT_EXTRA_MS,
  SPEAK_AFTER_MS,
  fastSchedule,
  revealOrder,
  revealRows,
  turnEnd,
  turnSchedule,
} from "@/lib/reveal";
import type { WordSet } from "@/lib/sets";
import type { RoundCard } from "./Round";
import CardView from "./CardView";
import Joker from "./Joker";
import RevealCard from "./RevealCard";

/** his hand inside the mark's square box, measured off `assets/joker-mascot-open.png` */
const HAND = { x: 0.72, y: 0.58 };

function reduced(): boolean {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

export default function Result({
  set,
  hand,
  /** how many of the hand are a stock this shelf has never held before */
  newStock,
  onBackToDeck,
}: {
  set: WordSet;
  hand: RoundCard[];
  newStock: number;
  onBackToDeck: () => void;
}) {
  const order = useMemo(() => revealOrder(hand), [hand]);
  const rows = useMemo(() => revealRows(order), [order]);
  const turns = useMemo(() => turnSchedule(order), [order]);
  /** how many cards have started turning — the counts tick with the turn */
  const [turned, setTurned] = useState(0);
  /** he waits for the last card, then speaks; the note arrives with him */
  const [spoken, setSpoken] = useState(false);
  /** the card a tap opened, face up over the screen */
  const [open, setOpen] = useState<RoundCard | null>(null);
  /** a tap hurried the rest of the hand over */
  const [fast, setFast] = useState(false);
  /** a second tap snapped what was left of it flat */
  const [snapped, setSnapped] = useState(false);
  const done = turned >= order.length;

  const jokerRef = useRef<HTMLImageElement>(null);
  const countRef = useRef<HTMLDivElement>(null);
  const slots = useRef<(HTMLDivElement | null)[]>([]);
  const anims = useRef<Animation[]>([]);
  const timers = useRef<number[]>([]);
  /** the cues laid out against the audio clock, and how to cut them */
  const cues = useRef<() => void>(() => {});

  const tally = (r: Rarity) => order.slice(0, turned).filter((c) => c.card.rarity === r).length;
  const shiny = tally("shiny");
  // the shine waits out the last card's own turn: `done` is true the moment
  // that card STARTS turning, so the delay is what is left of it
  const last = order[order.length - 1];
  const lastFlipMs = fast
    ? FAST_FLIP_MS
    : last?.card.rarity === "shiny"
      ? SHINY_FLIP_MS
      : FLIP_MS;

  function stop() {
    anims.current.forEach((a) => a.cancel());
    anims.current = [];
    timers.current.forEach(clearTimeout);
    timers.current = [];
    cues.current();
    cues.current = () => {};
  }

  /** the hand lands at once, wherever it was: nothing in the air, nothing mid-turn */
  function land() {
    slots.current.forEach((el) => {
      if (el) el.style.opacity = "1";
    });
  }

  /**
   * A tap through the reveal. The first one riffles the rest of the hand over
   * at the hurried cadence — every card still turns and still counts itself,
   * it just stops taking its time. A second one snaps what is left flat.
   */
  function hurry() {
    stop();
    land();
    if (fast) {
      // the spread already thudded down on the first tap; the snap is silent
      setSnapped(true);
      setTurned(order.length);
      setSpoken(true);
      return;
    }
    setFast(true);
    const from = turned;
    // the spread landing at once, and the knock when the riffle is through —
    // the riffle itself is silent, its 70 ms step is under a flip's own length
    cues.current = schedule(hurryCues(order, from));
    fastSchedule(from, order.length).forEach((at, i) => {
      timers.current.push(window.setTimeout(() => setTurned(from + i + 1), at));
    });
    timers.current.push(
      window.setTimeout(
        () => setSpoken(true),
        Math.max(0, order.length - from) * FAST_STEP_MS + FAST_FLIP_MS + SPEAK_AFTER_MS,
      ),
    );
  }

  useEffect(() => {
    const joker = jokerRef.current;
    const els = slots.current.slice(0, order.length);
    const at = (ms: number, run: () => void) => {
      timers.current.push(window.setTimeout(run, ms));
    };

    // Reduced motion is the same reveal with no time in it: nothing is dealt,
    // nothing turns, the screen fades in once (CSS) already finished.
    if (reduced() || !joker || els.some((el) => !el) || typeof els[0]?.animate !== "function") {
      els.forEach((el) => {
        if (el) el.style.opacity = "1";
      });
      setTurned(order.length);
      setSpoken(true);
      // the one cue that survives reduced motion (SPEC-v5d §4): the run is
      // over. Seven flips at once would be a click, not a reveal.
      play("reveal.end");
      return;
    }

    // Every flip and the knock at the end, laid out once against the audio
    // clock rather than fired from the timers below: at 114 ms apart the flips
    // are a rhythm, and setTimeout's jitter is audible where it is not visible
    cues.current = schedule(revealCues(order));

    // ---- beat one: the deal ----
    // his hand, in page coordinates — measured off the mark's box, which is
    // the whole square PNG, transparent margins included
    const jr = joker.getBoundingClientRect();
    const hx = jr.left + jr.width * HAND.x;
    const hy = jr.top + jr.height * HAND.y;

    els.forEach((el, i) => {
      if (!el) return;
      el.style.opacity = "0";
      const cr = el.getBoundingClientRect();
      // the hand, as an offset from the slot the card is going to
      const dx = hx - (cr.left + cr.width / 2);
      const dy = hy - (cr.top + cr.height / 2);
      const delay = i * DEAL_GAP_MS;
      anims.current.push(
        el.animate(
          [
            {
              transform: `translate(${dx}px,${dy}px) rotate(-25deg) scale(.5)`,
              opacity: 0,
              offset: 0,
            },
            { opacity: 1, offset: 0.12 },
            {
              transform: `translate(${dx * 0.55}px,${dy * 0.55 - 22}px) rotate(-12deg) scale(.78)`,
              offset: 0.45,
              easing: "cubic-bezier(.3,.7,.4,1)",
            },
            { transform: "translate(0,0) rotate(0deg) scale(1)", opacity: 1, offset: 1 },
          ],
          { duration: FLIGHT_MS, delay, easing: "cubic-bezier(.2,.9,.25,1.12)", fill: "forwards" },
        ),
      );
      // one flick of his wrist per card, and back before the next one leaves
      anims.current.push(
        joker.animate(
          [
            { transform: "rotate(0deg)" },
            { transform: "rotate(-7deg) translateX(3px)", offset: 0.3 },
            { transform: "rotate(0deg)" },
          ],
          { duration: FLICK_MS, delay, easing: "ease-out" },
        ),
      );
    });

    // ---- beat two: the turn ----
    order.forEach((card, i) => {
      const { at: start, dur } = turns[i];
      at(start, () => {
        // its flip is already on the audio clock (revealCues) — and there is
        // no cue in the hold before a shiny: flip.shiny's ring IS the sweep,
        // and the silence in the gap is the anticipation (SPEC-v5d §1)
        const el = slots.current[i];
        if (el && card.card.rarity === "shiny") {
          // it lifts out of the row and flares as it comes over
          anims.current.push(
            el.animate(
              [
                { transform: "translateY(0)", filter: "drop-shadow(0 0 0 rgba(255,46,136,0))" },
                {
                  transform: "translateY(-6px)",
                  filter: "drop-shadow(0 0 18px rgba(255,46,136,.9))",
                  offset: 0.5,
                },
                { transform: "translateY(0)", filter: "drop-shadow(0 0 0 rgba(255,46,136,0))" },
              ],
              { duration: dur + SHINY_LIFT_EXTRA_MS, easing: "ease-out" },
            ),
          );
        }
        setTurned(i + 1);
        const count = countRef.current;
        if (count && typeof count.animate === "function") {
          anims.current.push(
            count.animate(
              [
                { transform: "scale(1)" },
                { transform: "scale(1.04)", offset: 0.4 },
                { transform: "scale(1)" },
              ],
              { duration: 180, easing: "ease-out" },
            ),
          );
        }
      });
    });

    // he speaks once the last card is down; the knock is on the same clock
    at(turnEnd(order), () => setSpoken(true));

    return stop;
  }, [order, turns]);

  // {earned} counts the cards this run earned, never the drill's characters.
  // Null until he is due to speak: he does not talk over the reveal.
  const line = useJokerLine(spoken ? "result" : null, {
    set,
    earned: hand.length,
    shiny: order.filter((c) => c.card.rarity === "shiny").length,
    base: order.filter((c) => c.card.rarity === "base").length,
    worn: order.filter((c) => c.card.rarity === "worn").length,
  });

  const copies = hand.length - newStock;
  const note = spoken
    ? `${newStock} NEW STOCK · ${copies} ${copies === 1 ? "COPY" : "COPIES"} TO THE COLLECTION`
    : " ";

  return (
    <main
      className={`frame resultScreen${snapped ? " resultSnapped" : ""}`}
      onClick={() => !done && hurry()}
    >
      <div className="livery" aria-hidden>
        <span className="ghost ghostResult">{set.glyph}</span>
      </div>

      <div className="screenHead">
        <span className="screenTitle">SET DEALT OUT</span>
        <span className="screenTitle">
          {set.glyph} {set.name}
        </span>
      </div>

      <div className="resultCount" ref={countRef}>
        {turned}
        <span className="resultCountWord">EARNED</span>
      </div>
      <div className="resultTally">
        <span className={`resultShiny${shiny ? "" : " resultShinyCold"}`}>{shiny} SHINY</span>
        <span className="resultRest">
          {tally("base")} BASE · {tally("worn")} WORN
        </span>
      </div>

      <Joker line={line.text} lineId={line.id} markRef={jokerRef} className="jokerDeck" />

      <div className="resultRows">
        {rows.map((row, r) => (
          <div className="resultRow" key={r}>
            {row.map(({ word, card }, j) => {
              // its place in the whole hand: the deal, the turn and the shine
              // stagger all count in reveal order, not per row
              const index = r * COLS + j;
              return (
                <RevealCard
                  key={word.word}
                  word={word}
                  set={set}
                  card={card}
                  up={index < turned}
                  z={j + 1}
                  flipMs={
                    fast ? FAST_FLIP_MS : card.rarity === "shiny" ? SHINY_FLIP_MS : FLIP_MS
                  }
                  shining={done}
                  shineDelay={lastFlipMs}
                  onClick={done ? () => setOpen(order[index]) : undefined}
                  ref={(el) => {
                    slots.current[index] = el;
                  }}
                />
              );
            })}
          </div>
        ))}
      </div>

      <div className="resultNote">{note}</div>
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

      {/* the whole card, the way it is read: stock and tries, the set's mark,
          the word, its reading, what it means — and, held, the ink that earned
          it, straight from run state (SPEC-v6 §5.5). Tap outside to put it back. */}
      {open && (
        <CardView
          set={set}
          cards={[{ word: open.word, card: open.card, ink: open.ink }]}
          onClose={() => setOpen(null)}
        />
      )}
    </main>
  );
}
