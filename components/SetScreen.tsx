"use client";

// S6b — the set, face down. Always face down: a run deals the whole set every
// time, so there is no earned half of the grid and nothing to reveal here
// (SPEC-v5a §1–3). What you own is a shelf of copies, counted under the grid
// and laid out one word per row on S6d.
//
// The MEANING switch sits between the set head and the grid (SPEC-v5e): one
// run-level choice, made here, remembered per set, locked at DEAL. ON deals
// prompt cards with their English line; OFF deals kana and romaji only. His
// line answers the choice. Nothing else on the screen moves when it flips.

import { useEffect, useRef } from "react";

import { setTotals } from "@/lib/joker";
import { useJokerLine } from "@/lib/joker-lines";
import type { WordSet } from "@/lib/sets";
import { CardBack } from "./Card";
import Joker from "./Joker";

// ---- the deal (v5a anims, S6b) ----
// The grid mounts as nine empty slots and the Joker throws the backs into
// them, one per release, in reading order — the order the run will deal them
// face up. This is the third animation on the board: the two-animation budget
// in globals.css is the v3 number, and the v5a anim sheets supersede it.

/** ms between two releases */
const DEAL_INTERVAL = 90;
/** ms a card spends in the air */
const FLIGHT = 420;
/** degrees the card leaves his hand at */
const TOSS_TILT = 28;
/** the card passes its slot by a hair and snaps back */
const FLIGHT_EASE = "cubic-bezier(.2,.9,.25,1.12)";
/** the mid-flight keyframe carries the arc: it rises off the straight line */
const ARC_LIFT = 26;
/** his wrist, per card: one flick and back before the next one leaves */
const FLICK_DEG = -7;
/** reduced motion: all nine seat at once, no flight, no float */
const FADE = 120;
/** his fist inside the mark's square box, measured off `assets/joker-mascot-open.png` —
    the element is the whole 1080² square, transparent margins included */
const HAND = { x: 0.36, y: 0.75 };

/** a seated card never sits still: its own slow tilt-and-bob, on its own
    phase, so no two of the nine ever move together */
function float(el: HTMLElement, i: number): Animation {
  const seed = (i * 0.618) % 1;
  const tx = 5 + seed * 3;
  const ty = 4 + ((i * 0.37) % 1) * 3;
  const bob = 2 + seed * 1.5;
  const dur = 3600 + ((i * 731) % 1400);
  return el.animate(
    [
      { transform: `translateY(0px) rotateX(${ty * 0.3}deg) rotateY(${-tx}deg)` },
      { transform: `translateY(${-bob}px) rotateX(${-ty}deg) rotateY(${-tx * 0.2}deg)` },
      { transform: `translateY(${bob * 0.4}px) rotateX(${ty * 0.5}deg) rotateY(${tx}deg)` },
      { transform: `translateY(${-bob * 0.6}px) rotateX(${ty}deg) rotateY(${tx * 0.3}deg)` },
      { transform: `translateY(0px) rotateX(${ty * 0.3}deg) rotateY(${-tx}deg)` },
    ],
    {
      duration: dur,
      iterations: Infinity,
      easing: "ease-in-out",
      // a negative delay starts the loop part-way in, so the nine are already
      // out of step on the first frame they are seated
      delay: -((i * 0.31) % 1) * dur,
    },
  );
}

export default function SetScreen({
  set,
  deckName,
  meaning,
  onMeaning,
  onBack,
  onDeal,
  onCollection,
}: {
  set: WordSet;
  /** the deck this set belongs to, for the back link */
  deckName: string;
  /** the MEANING switch, as remembered for this set */
  meaning: boolean;
  onMeaning: (on: boolean) => void;
  onBack: () => void;
  onDeal: () => void;
  onCollection: () => void;
}) {
  const totals = setTotals(set);
  // a flip is a new beat: his line answers the switch as it stands
  const line = useJokerLine("set", { set, ...totals, meaning }, meaning);
  const jokerRef = useRef<HTMLImageElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const joker = jokerRef.current;
    const cards = cardRefs.current.filter((el): el is HTMLDivElement => el !== null);
    if (!joker || cards.length === 0) return;

    // the slots hold the backs at opacity 0 so there is no seated frame before
    // the deal starts; anything that cannot animate them seats them instead
    if (typeof cards[0].animate !== "function") {
      cards.forEach((el) => (el.style.opacity = "1"));
      return;
    }

    const anims: Animation[] = [];
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    // his hand, in page coordinates — measured off the mark's box, which is
    // the whole 1080² square, art margins included
    const jr = joker.getBoundingClientRect();
    const hx = jr.left + jr.width * HAND.x;
    const hy = jr.top + jr.height * HAND.y;

    cards.forEach((el, i) => {
      const cr = el.getBoundingClientRect();
      // the hand, as an offset from the slot the card is going to
      const dx = hx - (cr.left + cr.width / 2);
      const dy = hy - (cr.top + cr.height / 2);
      const delay = reduced ? 0 : i * DEAL_INTERVAL;
      // a card in flight sits above every card already seated
      el.style.zIndex = String(2 + i);

      if (reduced) {
        anims.push(el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: FADE, fill: "both" }));
        el.style.zIndex = "1";
        return;
      }

      // position and attitude run as two animations on two properties, the way
      // the sheet describes them: the arc overshoots its slot by a hair and
      // snaps back, while rotation and scale settle early on a plain ease-out
      // so the card is already flat when it lands
      const flight = el.animate(
        [
          { translate: `${dx}px ${dy}px`, opacity: 0, offset: 0 },
          { opacity: 1, offset: 0.12 },
          {
            translate: `${dx * 0.55}px ${dy * 0.55 - ARC_LIFT}px`,
            offset: 0.45,
            easing: "cubic-bezier(.3,.7,.4,1)",
          },
          { translate: "0px 0px", opacity: 1, offset: 1 },
        ],
        { duration: FLIGHT, delay, easing: FLIGHT_EASE, fill: "both" },
      );
      anims.push(flight);
      anims.push(
        el.animate(
          [
            { rotate: `${-TOSS_TILT}deg`, scale: "0.45" },
            { rotate: "0deg", scale: "1" },
          ],
          { duration: FLIGHT * 0.8, delay, easing: "cubic-bezier(.2,.8,.2,1)", fill: "both" },
        ),
      );

      anims.push(
        joker.animate(
          [
            { transform: "rotate(0deg)" },
            { transform: `rotate(${FLICK_DEG}deg) translateX(3px)`, offset: 0.3 },
            { transform: "rotate(0deg)" },
          ],
          { duration: Math.min(DEAL_INTERVAL * 1.6, 180), delay, easing: "ease-out" },
        ),
      );

      // the float takes over `transform`, which composes on top of the
      // translate/rotate/scale the flight leaves behind
      flight.onfinish = () => {
        el.style.zIndex = "1";
        el.style.opacity = "1";
        anims.push(float(el, i));
      };
    });

    return () => anims.forEach((a) => a.cancel());
  }, [set]);

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

      <Joker line={line.text} lineId={line.id} markRef={jokerRef} className="jokerDeck" />

      <div className="setHead">
        <span className="setHeadTitle">THE SET</span>
        <span className="panelCount">{set.words.length} WORDS</span>
      </div>

      <div className="setMeaning">
        <div className="setMeaningLabel">
          <span className="legend setMeaningLegend">MEANING</span>
          <span className={`setMeaningHint${meaning ? "" : " setMeaningHintOff"}`}>
            {meaning ? "English on every card" : "Kana + romaji only"}
          </span>
        </div>
        <span className="toggle toggleTap" role="radiogroup" aria-label="meaning">
          <button
            type="button"
            role="radio"
            aria-checked={meaning}
            className={`toggleOpt${meaning ? " toggleOn" : ""}`}
            onClick={() => onMeaning(true)}
          >
            ON
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={!meaning}
            className={`toggleOpt toggleStrike${meaning ? "" : " toggleOn"}`}
            onClick={() => onMeaning(false)}
          >
            OFF
          </button>
        </span>
      </div>

      <div className="setGrid">
        {set.words.map((word, i) => (
          <div key={word.word} className="setSlot">
            <span className="setSlotGhost" aria-hidden />
            <CardBack
              set={set}
              className="setSlotCard"
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
            />
          </div>
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
